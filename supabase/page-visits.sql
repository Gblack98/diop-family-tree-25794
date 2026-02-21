-- ============================================================================
-- SUIVI DES VISITEURS - page_visits
-- ============================================================================
-- Enregistre chaque visite de page publique
-- Permet de compter les visiteurs par jour, semaine, mois
-- ============================================================================

-- Table principale
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,       -- identifiant de session (sessionStorage)
  page_path TEXT NOT NULL,        -- chemin visité (ex: '/', '/archives', '/arbre')
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour les requêtes de stats
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_session ON page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_path ON page_visits(page_path);

COMMENT ON TABLE page_visits IS 'Historique des visites de pages publiques pour statistiques';

-- ============================================================================
-- RLS : La table est accessible en écriture par tous (anonymes + authentifiés)
-- Lecture réservée aux admins
-- ============================================================================
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut insérer une visite (anonymes inclus)
DROP POLICY IF EXISTS "Anyone can insert page visits" ON page_visits;
CREATE POLICY "Anyone can insert page visits"
  ON page_visits FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Seuls les admins peuvent lire les stats
DROP POLICY IF EXISTS "Admins can read page visits" ON page_visits;
CREATE POLICY "Admins can read page visits"
  ON page_visits FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- FUNCTION: get_visit_stats()
-- Retourne les statistiques de visite agrégées
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_visit_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today_visits      INTEGER;
  v_today_unique      INTEGER;
  v_week_visits       INTEGER;
  v_week_unique       INTEGER;
  v_month_visits      INTEGER;
  v_month_unique      INTEGER;
  v_total_visits      INTEGER;
  v_total_unique      INTEGER;
  v_daily_series      JSONB;
BEGIN
  -- Aujourd'hui
  SELECT COUNT(*), COUNT(DISTINCT session_id)
  INTO v_today_visits, v_today_unique
  FROM page_visits
  WHERE visited_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC');

  -- Cette semaine (lundi à aujourd'hui)
  SELECT COUNT(*), COUNT(DISTINCT session_id)
  INTO v_week_visits, v_week_unique
  FROM page_visits
  WHERE visited_at >= DATE_TRUNC('week', NOW() AT TIME ZONE 'UTC');

  -- Ce mois
  SELECT COUNT(*), COUNT(DISTINCT session_id)
  INTO v_month_visits, v_month_unique
  FROM page_visits
  WHERE visited_at >= DATE_TRUNC('month', NOW() AT TIME ZONE 'UTC');

  -- Total
  SELECT COUNT(*), COUNT(DISTINCT session_id)
  INTO v_total_visits, v_total_unique
  FROM page_visits;

  -- Série des 30 derniers jours (visites par jour)
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'date', TO_CHAR(day_date, 'YYYY-MM-DD'),
        'visits', COALESCE(daily_count, 0),
        'unique_sessions', COALESCE(unique_count, 0)
      )
      ORDER BY day_date
    ),
    '[]'::JSONB
  )
  INTO v_daily_series
  FROM (
    SELECT
      gs.day_date,
      COUNT(pv.id) AS daily_count,
      COUNT(DISTINCT pv.session_id) AS unique_count
    FROM (
      SELECT generate_series(
        DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') - INTERVAL '29 days',
        DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC'),
        '1 day'::INTERVAL
      )::DATE AS day_date
    ) gs
    LEFT JOIN page_visits pv
      ON DATE_TRUNC('day', pv.visited_at AT TIME ZONE 'UTC')::DATE = gs.day_date
    GROUP BY gs.day_date
  ) daily;

  RETURN jsonb_build_object(
    'today',       jsonb_build_object('visits', v_today_visits,  'unique_sessions', v_today_unique),
    'this_week',   jsonb_build_object('visits', v_week_visits,   'unique_sessions', v_week_unique),
    'this_month',  jsonb_build_object('visits', v_month_visits,  'unique_sessions', v_month_unique),
    'total',       jsonb_build_object('visits', v_total_visits,  'unique_sessions', v_total_unique),
    'daily_series', v_daily_series
  );
END;
$$;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Suivi des visiteurs créé avec succès !';
  RAISE NOTICE '  - Table page_visits créée';
  RAISE NOTICE '  - RLS : insert public, select admin';
  RAISE NOTICE '  - Fonction get_visit_stats() créée';
  RAISE NOTICE '============================================';
END $$;
