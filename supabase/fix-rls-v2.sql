-- ============================================================================
-- CORRECTION DES POLITIQUES RLS v2 - Évite la récursion infinie
-- À exécuter dans Supabase SQL Editor
-- ============================================================================

-- 1. Créer une fonction helper avec SECURITY DEFINER (évite la récursion)
CREATE OR REPLACE FUNCTION auth.get_my_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION auth.is_not_suspended()
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

-- 2. Supprimer TOUTES les anciennes politiques sur profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can create profiles" ON profiles;

-- 3. Nouvelles politiques sur profiles (simples, sans récursion)
-- Chaque utilisateur peut lire son propre profil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Les admins peuvent lire tous les profils (utilise la fonction helper)
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.is_admin() OR id = auth.uid());

-- Les admins peuvent modifier les profils
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.is_admin());

-- 4. Supprimer et recréer les politiques sur change_history
DROP POLICY IF EXISTS "Only admins can read change history" ON change_history;
DROP POLICY IF EXISTS "Only admins can update change history" ON change_history;
DROP POLICY IF EXISTS "Admins can read change history" ON change_history;
DROP POLICY IF EXISTS "Admins can update change history" ON change_history;

CREATE POLICY "Admins can read change history"
  ON change_history FOR SELECT
  TO authenticated
  USING (auth.is_admin());

CREATE POLICY "Admins can update change history"
  ON change_history FOR UPDATE
  TO authenticated
  USING (auth.is_admin());

-- 5. Corriger les politiques sur persons
DROP POLICY IF EXISTS "Moderators and admins can create persons" ON persons;
DROP POLICY IF EXISTS "Moderators and admins can update persons" ON persons;
DROP POLICY IF EXISTS "Only admins can delete persons" ON persons;

CREATE POLICY "Authenticated users can create persons"
  ON persons FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_not_suspended());

CREATE POLICY "Authenticated users can update persons"
  ON persons FOR UPDATE
  TO authenticated
  USING (auth.is_not_suspended());

CREATE POLICY "Only admins can delete persons"
  ON persons FOR DELETE
  TO authenticated
  USING (auth.is_admin());

-- 6. Corriger les politiques sur relationships
DROP POLICY IF EXISTS "Moderators and admins can create relationships" ON relationships;
DROP POLICY IF EXISTS "Moderators and admins can delete relationships" ON relationships;

CREATE POLICY "Authenticated users can create relationships"
  ON relationships FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_not_suspended());

CREATE POLICY "Authenticated users can delete relationships"
  ON relationships FOR DELETE
  TO authenticated
  USING (auth.is_not_suspended());

-- 7. Corriger les politiques sur archives
DROP POLICY IF EXISTS "Moderators and admins can create archives" ON archives;
DROP POLICY IF EXISTS "Moderators and admins can update archives" ON archives;
DROP POLICY IF EXISTS "Only admins can delete archives" ON archives;

CREATE POLICY "Authenticated users can create archives"
  ON archives FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_not_suspended());

CREATE POLICY "Authenticated users can update archives"
  ON archives FOR UPDATE
  TO authenticated
  USING (auth.is_not_suspended());

CREATE POLICY "Only admins can delete archives"
  ON archives FOR DELETE
  TO authenticated
  USING (auth.is_admin());

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Politiques RLS corrigées avec succès (v2)!';
  RAISE NOTICE 'Les fonctions auth.is_admin() et auth.is_not_suspended() ont été créées.';
END $$;
