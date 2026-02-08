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

-- Crée 5 users avec :
-- - Email: badara@diop-family.moderateur
-- - Email: demba@diop-family.moderateur
-- - Email: lamine@diop-family.moderateur
-- - Email: ibrahima@diop-family.moderateur
-- - Email: ousmane@diop-family.moderateur
-- IMPORTANT: Définir un mot de passe fort et unique pour chaque modérateur
-- Ne JAMAIS stocker les mots de passe dans le code source
-- Puis note les UUIDs générés pour l'étape 2

-- ÉTAPE 2 : Créer les profils (exécute ce SQL avec les UUIDs réels)
-- Remplace les UUIDs par ceux générés lors de la création des users

-- Profils modérateurs avec les vrais noms
-- (Note: remplace les UUID par les vrais IDs des utilisateurs créés)

INSERT INTO profiles (id, role, username, email, suspended)
VALUES
  ('2b258d8e-9e2b-47d0-ad6f-d476de2da74b'::uuid, 'moderator', 'badara_moderateur', 'badara@diop-family.moderateur', false),
  ('c0b4ce96-5faf-4893-b5fd-c2c9493a72e0'::uuid, 'moderator', 'demba_moderateur', 'demba@diop-family.moderateur', false),
  ('dd3e6c92-1d5a-4cfa-8164-e855d6b59057'::uuid, 'moderator', 'lamine_moderateur', 'lamine@diop-family.moderateur', false),
  ('4ebb239a-2744-477a-b91e-efb92cc4e27b'::uuid, 'moderator', 'ibrahima_moderateur', 'ibrahima@diop-family.moderateur', false),
  ('0b19cfc9-c5bc-445b-a323-1160ee93818e'::uuid, 'moderator', 'ousmane_moderateur', 'ousmane@diop-family.moderateur', false)
ON CONFLICT (id) DO NOTHING;

-- Afficher les profils créés
SELECT id, role, username, email FROM profiles WHERE role = 'moderator' ORDER BY created_at;

-- Message
DO $$
BEGIN
  RAISE NOTICE '5 profils modérateurs créés ! (avec UUIDs de test)';
  RAISE NOTICE 'À FAIRE: Créer les utilisateurs réels via Supabase Auth et remplacer les UUIDs';
END $$;
