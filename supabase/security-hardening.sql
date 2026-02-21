-- ============================================================================
-- SÉCURITÉ - NETTOYAGE COMPLET ET RENFORCEMENT RLS v4
-- ============================================================================
-- À exécuter UNE SEULE FOIS dans Supabase SQL Editor
-- Ce script remet à plat TOUTES les policies et les recrée proprement.
-- Résout : "impossible de charger l'historique" + conflits de policies
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : FONCTIONS HELPER (SECURITY DEFINER, évitent la récursion)
-- ============================================================================

-- Vérifie si l'utilisateur courant est admin (sans récursion RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin' AND suspended = FALSE
  )
$$;

-- Vérifie si l'utilisateur courant est modérateur (sans récursion RLS)
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'moderator' AND suspended = FALSE
  )
$$;

-- Vérifie si l'utilisateur courant est authentifié et non suspendu
CREATE OR REPLACE FUNCTION public.is_not_suspended()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND suspended = FALSE
  )
$$;

-- ============================================================================
-- ÉTAPE 2 : NETTOYAGE COMPLET DE TOUTES LES POLICIES
-- ============================================================================

-- profiles
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can create profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;

-- persons
DROP POLICY IF EXISTS "Anyone can read persons" ON persons;
DROP POLICY IF EXISTS "Moderators and admins can create persons" ON persons;
DROP POLICY IF EXISTS "Moderators and admins can update persons" ON persons;
DROP POLICY IF EXISTS "Only admins can delete persons" ON persons;
DROP POLICY IF EXISTS "Authenticated users can create persons" ON persons;
DROP POLICY IF EXISTS "Authenticated users can update persons" ON persons;
DROP POLICY IF EXISTS "Admins can create persons" ON persons;
DROP POLICY IF EXISTS "Admins can update persons" ON persons;

-- relationships
DROP POLICY IF EXISTS "Anyone can read relationships" ON relationships;
DROP POLICY IF EXISTS "Moderators and admins can create relationships" ON relationships;
DROP POLICY IF EXISTS "Moderators and admins can delete relationships" ON relationships;
DROP POLICY IF EXISTS "Authenticated users can create relationships" ON relationships;
DROP POLICY IF EXISTS "Authenticated users can delete relationships" ON relationships;
DROP POLICY IF EXISTS "Admins can create relationships" ON relationships;
DROP POLICY IF EXISTS "Admins can delete relationships" ON relationships;

-- archives
DROP POLICY IF EXISTS "Anyone can read archives" ON archives;
DROP POLICY IF EXISTS "Moderators and admins can create archives" ON archives;
DROP POLICY IF EXISTS "Moderators and admins can update archives" ON archives;
DROP POLICY IF EXISTS "Only admins can delete archives" ON archives;
DROP POLICY IF EXISTS "Authenticated users can create archives" ON archives;
DROP POLICY IF EXISTS "Authenticated users can update archives" ON archives;
DROP POLICY IF EXISTS "Admins can create archives" ON archives;
DROP POLICY IF EXISTS "Admins can update archives" ON archives;

-- change_history
DROP POLICY IF EXISTS "Only admins can read change history" ON change_history;
DROP POLICY IF EXISTS "Only admins can update change history" ON change_history;
DROP POLICY IF EXISTS "Admins can read change history" ON change_history;
DROP POLICY IF EXISTS "Admins can update change history" ON change_history;
DROP POLICY IF EXISTS "System can insert change history" ON change_history;
DROP POLICY IF EXISTS "Trigger can insert change history" ON change_history;

-- pending_changes
DROP POLICY IF EXISTS "Admins can read all pending changes" ON pending_changes;
DROP POLICY IF EXISTS "Moderators can read pending changes" ON pending_changes;
DROP POLICY IF EXISTS "Authenticated users can create pending changes" ON pending_changes;
DROP POLICY IF EXISTS "Admins can review pending changes" ON pending_changes;

-- admin_notifications
DROP POLICY IF EXISTS "Admins can read own notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Admins can update own notifications" ON admin_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Admins can delete own notifications" ON admin_notifications;

-- ============================================================================
-- ÉTAPE 3 : POLICIES RENFORCÉES
-- ============================================================================

-- -----------------------------------------------------------------------
-- TABLE: profiles
-- -----------------------------------------------------------------------

-- SELECT : chaque user voit son profil; les admins voient tout
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR public.is_admin()
  );

-- INSERT : les admins créent des profils (modérateurs)
--           Le trigger Supabase Auth crée le profil via SECURITY DEFINER
CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- UPDATE : seulement les admins modifient les profils des autres
CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR id = auth.uid())
  WITH CHECK (public.is_admin() OR id = auth.uid());

-- DELETE : seulement les admins
CREATE POLICY "profiles_delete"
  ON profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------
-- TABLE: persons
-- Lecture publique, écriture via pending_changes pour modérateurs
-- Les admins écrivent directement
-- -----------------------------------------------------------------------

CREATE POLICY "persons_select"
  ON persons FOR SELECT
  TO authenticated, anon
  USING (true);

-- Seulement les admins écrivent directement (les modérateurs passent par pending_changes)
CREATE POLICY "persons_insert"
  ON persons FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "persons_update"
  ON persons FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "persons_delete"
  ON persons FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------
-- TABLE: relationships
-- -----------------------------------------------------------------------

CREATE POLICY "relationships_select"
  ON relationships FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "relationships_insert"
  ON relationships FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "relationships_delete"
  ON relationships FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------
-- TABLE: archives
-- -----------------------------------------------------------------------

CREATE POLICY "archives_select"
  ON archives FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "archives_insert"
  ON archives FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "archives_update"
  ON archives FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "archives_delete"
  ON archives FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------
-- TABLE: change_history
-- Le trigger log_change() est SECURITY DEFINER → bypasse le RLS pour INSERT
-- Les admins lisent et peuvent mettre à jour (revert)
-- -----------------------------------------------------------------------

CREATE POLICY "change_history_select"
  ON change_history FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "change_history_update"
  ON change_history FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Policy INSERT pour autoriser les triggers (même si SECURITY DEFINER bypasse RLS,
-- certains setups Supabase nécessitent quand même une policy)
CREATE POLICY "change_history_insert"
  ON change_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- -----------------------------------------------------------------------
-- TABLE: pending_changes
-- Modérateurs soumettent, admins approuvent/rejettent
-- -----------------------------------------------------------------------

-- Admins voient tout
CREATE POLICY "pending_changes_admin_select"
  ON pending_changes FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Modérateurs voient leurs propres changements
CREATE POLICY "pending_changes_moderator_select"
  ON pending_changes FOR SELECT
  TO authenticated
  USING (
    NOT public.is_admin() AND public.is_not_suspended() AND requested_by = auth.uid()
  );

-- Tout utilisateur authentifié non suspendu peut soumettre un changement
CREATE POLICY "pending_changes_insert"
  ON pending_changes FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_not_suspended() AND requested_by = auth.uid()
  );

-- Seulement les admins approuvent/rejettent
CREATE POLICY "pending_changes_update"
  ON pending_changes FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------
-- TABLE: admin_notifications
-- Chaque admin voit et gère ses propres notifications
-- -----------------------------------------------------------------------

CREATE POLICY "notifications_select"
  ON admin_notifications FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid() AND public.is_admin());

CREATE POLICY "notifications_update"
  ON admin_notifications FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid() AND public.is_admin());

CREATE POLICY "notifications_insert"
  ON admin_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "notifications_delete"
  ON admin_notifications FOR DELETE
  TO authenticated
  USING (admin_id = auth.uid() AND public.is_admin());

-- ============================================================================
-- ÉTAPE 4 : VÉRIFICATION DES TRIGGERS D'AUDIT
-- Le trigger log_change() doit être SECURITY DEFINER pour bypasser RLS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO change_history (table_name, record_id, action, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO change_history (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO change_history (table_name, record_id, action, old_data, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- S'assurer que les triggers existent (recréation idempotente)
DROP TRIGGER IF EXISTS audit_persons ON persons;
CREATE TRIGGER audit_persons
  AFTER INSERT OR UPDATE OR DELETE ON persons
  FOR EACH ROW EXECUTE FUNCTION public.log_change();

DROP TRIGGER IF EXISTS audit_archives ON archives;
CREATE TRIGGER audit_archives
  AFTER INSERT OR UPDATE OR DELETE ON archives
  FOR EACH ROW EXECUTE FUNCTION public.log_change();

DROP TRIGGER IF EXISTS audit_relationships ON relationships;
CREATE TRIGGER audit_relationships
  AFTER INSERT OR UPDATE OR DELETE ON relationships
  FOR EACH ROW EXECUTE FUNCTION public.log_change();

-- ============================================================================
-- ÉTAPE 5 : VÉRIFICATION RAPIDE
-- ============================================================================
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'persons', 'relationships', 'archives',
                      'change_history', 'pending_changes', 'admin_notifications');

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SÉCURITÉ RENFORCÉE AVEC SUCCÈS';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '% policies actives au total', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE 'RÉSUMÉ DES RÈGLES :';
  RAISE NOTICE '  - Personnes/Archives/Relations : lecture publique, écriture admins seulement';
  RAISE NOTICE '  - Modérateurs : soumettent via pending_changes uniquement';
  RAISE NOTICE '  - Historique : lecture admins seulement';
  RAISE NOTICE '  - Notifications : lecture par l''admin concerné seulement';
  RAISE NOTICE '==============================================';
END $$;
