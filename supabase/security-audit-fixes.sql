-- ============================================================================
-- CORRECTIFS DE SÉCURITÉ — Audit 2026-03-01
-- ============================================================================
-- Exécuter CE fichier si vous recréez la base depuis zéro.
-- Ces policies ont déjà été appliquées en production via l'API Management.
-- ============================================================================

-- ── 1. Fonctions helper SECURITY DEFINER ─────────────────────────────────
-- Permettent d'éviter les récursions dans les policies RLS

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_suspended()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(suspended, false) FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ── 2. Fix CRITIQUE : escalade de privilèges via profiles UPDATE ──────────
-- AVANT  : WITH CHECK (is_admin() OR (id = auth.uid()))
--          → un modérateur pouvait se passer en admin en modifiant son propre profil
-- APRÈS  : les non-admins ne peuvent pas changer leur role ni leur statut suspended

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING  (is_admin() OR (id = auth.uid()))
  WITH CHECK (
    is_admin()
    OR (
      -- L'utilisateur peut modifier ses propres infos (display_name, username, etc.)
      -- MAIS ne peut pas changer son rôle ni son statut suspended
      id = auth.uid()
      AND role::text       = public.get_my_role()
      AND suspended        = public.get_my_suspended()
    )
  );

-- ── 3. Fix FONCTIONNEL : change_history lisible par les modérateurs ────────
-- AVANT  : USING (is_admin())
--          → le dashboard "Mes contributions" des modérateurs retournait vide
-- APRÈS  : les modérateurs voient leurs propres entrées (changed_by = auth.uid())

DROP POLICY IF EXISTS "change_history_select" ON change_history;
CREATE POLICY "change_history_select"
  ON change_history FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR (
      changed_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'moderator'
          AND NOT COALESCE(suspended, false)
      )
    )
  );

-- ── 4. page_visits SELECT — admins et modérateurs ─────────────────────────
-- (déjà appliqué dans moderator-visits-rls.sql)

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
  RAISE NOTICE 'Correctifs sécurité appliqués :';
  RAISE NOTICE '  ✓ get_my_role() / get_my_suspended()';
  RAISE NOTICE '  ✓ profiles_update : anti-escalade de privilèges';
  RAISE NOTICE '  ✓ change_history_select : modérateurs voient leurs contributions';
  RAISE NOTICE '  ✓ page_visits : admins + modérateurs';
  RAISE NOTICE '============================================';
END $$;
