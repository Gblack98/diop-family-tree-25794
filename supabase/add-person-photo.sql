-- Migration : ajout d'un champ photo_url optionnel sur la table persons
-- À exécuter dans le Supabase SQL Editor

ALTER TABLE persons ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Commentaire explicatif
COMMENT ON COLUMN persons.photo_url IS 'URL publique de la photo de profil de la personne (optionnel). Prioritaire sur les photos issues de la table archives.';
