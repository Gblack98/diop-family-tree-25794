-- ============================================================================
-- CORRECTION DES POLITIQUES RLS
-- À exécuter dans Supabase SQL Editor
-- ============================================================================

-- Supprimer les anciennes politiques problématiques sur profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- NOUVELLE POLITIQUE: Chaque utilisateur peut lire son propre profil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- NOUVELLE POLITIQUE: Les admins peuvent lire TOUS les profils
-- (utilise une sous-requête avec security_definer pour éviter la circularité)
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- NOUVELLE POLITIQUE: Les admins peuvent modifier les profils (sauf le leur pour le rôle)
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Supprimer et recréer les politiques sur change_history
DROP POLICY IF EXISTS "Only admins can read change history" ON change_history;
DROP POLICY IF EXISTS "Only admins can update change history" ON change_history;

CREATE POLICY "Admins can read change history"
  ON change_history FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update change history"
  ON change_history FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Vérifier que les politiques sur archives sont correctes
DROP POLICY IF EXISTS "Anyone can read archives" ON archives;
DROP POLICY IF EXISTS "Moderators and admins can create archives" ON archives;
DROP POLICY IF EXISTS "Moderators and admins can update archives" ON archives;
DROP POLICY IF EXISTS "Only admins can delete archives" ON archives;

CREATE POLICY "Anyone can read archives"
  ON archives FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Moderators and admins can create archives"
  ON archives FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT suspended FROM profiles WHERE id = auth.uid()) = FALSE
  );

CREATE POLICY "Moderators and admins can update archives"
  ON archives FOR UPDATE
  TO authenticated
  USING (
    (SELECT suspended FROM profiles WHERE id = auth.uid()) = FALSE
  );

CREATE POLICY "Only admins can delete archives"
  ON archives FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Corriger aussi les politiques sur persons et relationships
DROP POLICY IF EXISTS "Moderators and admins can create persons" ON persons;
DROP POLICY IF EXISTS "Moderators and admins can update persons" ON persons;
DROP POLICY IF EXISTS "Only admins can delete persons" ON persons;

CREATE POLICY "Moderators and admins can create persons"
  ON persons FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT suspended FROM profiles WHERE id = auth.uid()) = FALSE
  );

CREATE POLICY "Moderators and admins can update persons"
  ON persons FOR UPDATE
  TO authenticated
  USING (
    (SELECT suspended FROM profiles WHERE id = auth.uid()) = FALSE
  );

CREATE POLICY "Only admins can delete persons"
  ON persons FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Corriger relationships
DROP POLICY IF EXISTS "Moderators and admins can create relationships" ON relationships;
DROP POLICY IF EXISTS "Moderators and admins can delete relationships" ON relationships;

CREATE POLICY "Moderators and admins can create relationships"
  ON relationships FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT suspended FROM profiles WHERE id = auth.uid()) = FALSE
  );

CREATE POLICY "Moderators and admins can delete relationships"
  ON relationships FOR DELETE
  TO authenticated
  USING (
    (SELECT suspended FROM profiles WHERE id = auth.uid()) = FALSE
  );

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Politiques RLS corrigées avec succès!';
END $$;
