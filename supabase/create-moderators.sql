-- ============================================================================
-- CRÉATION DES 5 MODÉRATEURS
-- ============================================================================
-- À exécuter dans Supabase SQL Editor après setup-moderation.sql
-- Crée 5 profils modérateurs avec identifiants temporaires
-- ============================================================================

-- Les 5 modérateurs (remplace les emails/usernames selon tes besoins)
-- Format: INSERT into auth.users via Supabase (normalement tu ferais ça via l'API ou l'interface)
-- Ici on crée juste les profils, les users doivent être créés via Supabase Auth

-- Option 1 : Si tu peux accéder à auth.users directement (admin)
-- Sinon, utilise l'interface Supabase pour créer les users d'abord

-- Pour maintenant, on crée les PROFILS avec des UUIDs de placeholder
-- (À adapter avec les vrais UUIDs des users une fois créés)

-- ÉTAPE 1 : Créer les users via Supabase Auth Web UI
-- Supabase → Authentication → Users → Add user
-- Crée 5 users avec :
-- - Email: moderator1@diop-family.local, moderator2@, ... moderator5@
-- - Password: généré (note les UUIDs qu'on affichera)

-- ÉTAPE 2 : Créer les profils (exécute ce SQL avec les UUIDs réels)
-- Remplace les UUIDs par ceux générés lors de la création des users

-- Exemple de profils modérateurs
-- (Note: remplace les UUID par les vrais IDs des utilisateurs créés)

INSERT INTO profiles (id, role, username, email, suspended)
VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'moderator', 'amadou_moderator', 'amadou@diop-family.local', false),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'moderator', 'fatou_moderator', 'fatou@diop-family.local', false),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'moderator', 'ibrahima_moderator', 'ibrahima@diop-family.local', false),
  ('00000000-0000-0000-0000-000000000004'::uuid, 'moderator', 'marie_moderator', 'marie@diop-family.local', false),
  ('00000000-0000-0000-0000-000000000005'::uuid, 'moderator', 'pierre_moderator', 'pierre@diop-family.local', false)
ON CONFLICT (id) DO NOTHING;

-- Afficher les profils créés
SELECT id, role, username, email FROM profiles WHERE role = 'moderator' ORDER BY created_at;

-- Message
DO $$
BEGIN
  RAISE NOTICE '5 profils modérateurs créés ! (avec UUIDs de test)';
  RAISE NOTICE 'À FAIRE: Créer les utilisateurs réels via Supabase Auth et remplacer les UUIDs';
END $$;
