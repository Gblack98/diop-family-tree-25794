-- ============================================================================
-- Mise à jour des politiques RLS pour page_visits
-- Permet aux modérateurs de lire les statistiques de visite
-- ============================================================================

-- Remplacer la politique admin-only par une politique admin+modérateur
DROP POLICY IF EXISTS "Admins can read page visits" ON page_visits;
DROP POLICY IF EXISTS "Admins and moderators can read page visits" ON page_visits;

CREATE POLICY "Admins and moderators can read page visits"
  ON page_visits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderator')
        AND NOT COALESCE(suspended, false)
    )
  );

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'RLS page_visits mise à jour !';
  RAISE NOTICE '  - Lecture autorisée : admins + modérateurs';
  RAISE NOTICE '============================================';
END $$;
