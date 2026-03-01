-- Migration : table de jonction archive_persons (plusieurs personnes par archive)
-- À exécuter dans le Supabase SQL Editor

-- 1. Créer la table de jonction
CREATE TABLE IF NOT EXISTS archive_persons (
  archive_id UUID NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
  person_id  UUID NOT NULL REFERENCES persons(id)  ON DELETE CASCADE,
  PRIMARY KEY (archive_id, person_id)
);

-- 2. Migrer les données existantes (person_id sur archives → archive_persons)
INSERT INTO archive_persons (archive_id, person_id)
SELECT id, person_id
FROM archives
WHERE person_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Index pour les lookups inverses (trouver toutes les archives d'une personne)
CREATE INDEX IF NOT EXISTS idx_archive_persons_person_id ON archive_persons(person_id);

-- 4. Activer RLS
ALTER TABLE archive_persons ENABLE ROW LEVEL SECURITY;

-- 5. Policies RLS
-- Lecture publique (même logique que les autres tables)
DROP POLICY IF EXISTS "Lecture publique archive_persons" ON archive_persons;
CREATE POLICY "Lecture publique archive_persons"
  ON archive_persons FOR SELECT
  USING (true);

-- Écriture pour les utilisateurs authentifiés
DROP POLICY IF EXISTS "Écriture authentifiée archive_persons" ON archive_persons;
CREATE POLICY "Écriture authentifiée archive_persons"
  ON archive_persons FOR ALL
  USING (auth.role() = 'authenticated');
