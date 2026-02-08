-- ============================================================================
-- FIX: Corriger les RLS policies pour les archives
-- ============================================================================
-- À exécuter dans le SQL Editor de Supabase (admin)
-- Permet aux utilisateurs authentifiés de créer/modifer des archives
-- ============================================================================

-- Supprimer les anciennes policies restrictives
DROP POLICY IF EXISTS "Admins can create archives" ON archives;
DROP POLICY IF EXISTS "Admins can update archives" ON archives;
DROP POLICY IF EXISTS "Moderators and admins can create archives" ON archives;
DROP POLICY IF EXISTS "Moderators and admins can update archives" ON archives;
DROP POLICY IF EXISTS "Authenticated users can create archives" ON archives;
DROP POLICY IF EXISTS "Authenticated users can update archives" ON archives;

-- Nouvelle policy: tout utilisateur authenticated peut créer une archive
-- (la vérification du role admin se fait côté frontend avec ProtectedRoute)
CREATE POLICY "Authenticated users can create archives"
  ON archives FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Nouvelle policy: tout utilisateur authenticated peut mettre à jour une archive
CREATE POLICY "Authenticated users can update archives"
  ON archives FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Keep the delete policy restrictive (admin only)
CREATE POLICY "Only admins can delete archives"
  ON archives FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies pour archives corrigées';
  RAISE NOTICE 'Les utilisateurs authentifiés peuvent maintenant créer/modifier des archives';
END $$;
