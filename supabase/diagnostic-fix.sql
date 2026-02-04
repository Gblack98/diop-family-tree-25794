-- ============================================================================
-- DIAGNOSTIC ET CORRECTION COMPLÈTE
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================================================

-- 1. DIAGNOSTIC: Voir la structure actuelle de la table archives
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'archives'
ORDER BY ordinal_position;

-- 2. DIAGNOSTIC: Compter les archives
SELECT COUNT(*) as total_archives FROM archives;

-- 3. DIAGNOSTIC: Voir les politiques actuelles sur archives
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'archives';

-- 4. DIAGNOSTIC: Voir les politiques sur profiles (source du problème de récursion)
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- ============================================================================
-- CORRECTION DES POLITIQUES RLS
-- ============================================================================

-- 5. Créer les fonctions helper SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM profiles WHERE id = auth.uid()),
    FALSE
  )
$$;

CREATE OR REPLACE FUNCTION public.is_not_suspended()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT suspended = FALSE FROM profiles WHERE id = auth.uid()),
    FALSE
  )
$$;

-- 6. Supprimer TOUTES les politiques sur profiles pour éviter la récursion
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can update profiles" ON profiles;

-- 7. Recréer les politiques sur profiles (SIMPLES, sans récursion)
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- 8. Supprimer TOUTES les politiques sur archives
DROP POLICY IF EXISTS "Anyone can read archives" ON archives;
DROP POLICY IF EXISTS "Moderators and admins can create archives" ON archives;
DROP POLICY IF EXISTS "Moderators and admins can update archives" ON archives;
DROP POLICY IF EXISTS "Only admins can delete archives" ON archives;
DROP POLICY IF EXISTS "Authenticated users can create archives" ON archives;
DROP POLICY IF EXISTS "Authenticated users can update archives" ON archives;

-- 9. Recréer les politiques sur archives (SIMPLES)
-- Lecture: tout le monde (même non connecté)
CREATE POLICY "archives_select_all"
  ON archives FOR SELECT
  TO authenticated, anon
  USING (true);

-- Création: utilisateurs authentifiés non suspendus
CREATE POLICY "archives_insert_auth"
  ON archives FOR INSERT
  TO authenticated
  WITH CHECK (public.is_not_suspended());

-- Mise à jour: utilisateurs authentifiés non suspendus
CREATE POLICY "archives_update_auth"
  ON archives FOR UPDATE
  TO authenticated
  USING (public.is_not_suspended());

-- Suppression: admins seulement
CREATE POLICY "archives_delete_admin"
  ON archives FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- CORRECTION DE LA STRUCTURE DE LA TABLE ARCHIVES (si nécessaire)
-- ============================================================================

-- 10. Ajouter les colonnes manquantes si elles n'existent pas
DO $$
BEGIN
  -- Ajouter content si manquante
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'content') THEN
    ALTER TABLE archives ADD COLUMN content TEXT;
    -- Migrer depuis description si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'description') THEN
      UPDATE archives SET content = description;
    END IF;
    UPDATE archives SET content = COALESCE(content, title);
    ALTER TABLE archives ALTER COLUMN content SET NOT NULL;
    RAISE NOTICE 'Colonne content ajoutée';
  END IF;

  -- Ajouter date si manquante
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'date') THEN
    ALTER TABLE archives ADD COLUMN date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD');
    UPDATE archives SET date = TO_CHAR(created_at, 'YYYY-MM-DD');
    ALTER TABLE archives ALTER COLUMN date SET NOT NULL;
    RAISE NOTICE 'Colonne date ajoutée';
  END IF;

  -- Ajouter images[] si manquante
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'images') THEN
    ALTER TABLE archives ADD COLUMN images TEXT[];
    -- Migrer depuis image_url si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'image_url') THEN
      UPDATE archives SET images = ARRAY[image_url] WHERE image_url IS NOT NULL AND image_url != '';
    END IF;
    RAISE NOTICE 'Colonne images ajoutée';
  END IF;

  -- Ajouter full_content si manquante
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'full_content') THEN
    ALTER TABLE archives ADD COLUMN full_content TEXT;
    RAISE NOTICE 'Colonne full_content ajoutée';
  END IF;

  -- Ajouter achievements si manquante
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'achievements') THEN
    ALTER TABLE archives ADD COLUMN achievements TEXT[];
    RAISE NOTICE 'Colonne achievements ajoutée';
  END IF;
END $$;

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

-- 11. Vérifier que les fonctions existent
SELECT 'Fonctions créées:' as info;
SELECT proname FROM pg_proc WHERE proname IN ('is_admin', 'is_not_suspended') AND pronamespace = 'public'::regnamespace;

-- 12. Vérifier les nouvelles politiques
SELECT 'Politiques archives:' as info;
SELECT policyname FROM pg_policies WHERE tablename = 'archives';

SELECT 'Politiques profiles:' as info;
SELECT policyname FROM pg_policies WHERE tablename = 'profiles';

-- 13. Tester la lecture des archives
SELECT 'Test lecture archives:' as info;
SELECT id, title, category FROM archives LIMIT 5;

-- Message de fin
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SCRIPT TERMINÉ - Vérifiez les résultats ci-dessus';
  RAISE NOTICE '========================================';
END $$;
