-- ============================================================================
-- CORRECTION DE LA VISIBILITÉ DES ARCHIVES
-- La policy SELECT était manquante dans fix-rls-v3.sql
-- À exécuter dans Supabase SQL Editor
-- ============================================================================

-- Vérifier que RLS est bien activé sur archives
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;

-- Créer la policy SELECT manquante (que fix-rls-v3 a supprimée)
-- Permet à tous (authenticated + anon) de lire les archives
CREATE POLICY IF NOT EXISTS "Authenticated and anon can read archives"
  ON archives FOR SELECT
  TO authenticated, anon
  USING (true);

-- Alternative plus restrictive (si tu veux que seuls les authenticated lisent):
-- CREATE POLICY "Authenticated users can read archives"
--   ON archives FOR SELECT
--   TO authenticated
--   USING (true);

-- Vérifier les policies actuelles sur archives
SELECT policname, polcmd, polroles
FROM pg_policy
WHERE polrelid = 'archives'::regclass
ORDER BY policname;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Policy SELECT sur archives restaurée !';
  RAISE NOTICE 'Les archives sont maintenant visibles dans l''admin.';
END $$;
