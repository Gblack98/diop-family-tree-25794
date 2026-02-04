-- ============================================================================
-- MIGRATION: Mise à jour de la table archives
-- À exécuter dans Supabase SQL Editor si nécessaire
-- ============================================================================

-- Vérifier et ajouter les colonnes manquantes

-- Ajouter content si elle n'existe pas (migrer depuis description si elle existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'content') THEN
    ALTER TABLE archives ADD COLUMN content TEXT;

    -- Migrer depuis description si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'description') THEN
      UPDATE archives SET content = description WHERE content IS NULL;
      ALTER TABLE archives DROP COLUMN description;
    END IF;

    -- Mettre une valeur par défaut pour les existants
    UPDATE archives SET content = title WHERE content IS NULL OR content = '';
    ALTER TABLE archives ALTER COLUMN content SET NOT NULL;
  END IF;
END $$;

-- Ajouter full_content si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'full_content') THEN
    ALTER TABLE archives ADD COLUMN full_content TEXT;
  END IF;
END $$;

-- Ajouter date si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'date') THEN
    ALTER TABLE archives ADD COLUMN date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD');
    UPDATE archives SET date = TO_CHAR(created_at, 'YYYY-MM-DD') WHERE date IS NULL;
    ALTER TABLE archives ALTER COLUMN date SET NOT NULL;
  END IF;
END $$;

-- Ajouter images (array) si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'images') THEN
    ALTER TABLE archives ADD COLUMN images TEXT[];

    -- Migrer depuis image_url si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'image_url') THEN
      UPDATE archives SET images = ARRAY[image_url] WHERE image_url IS NOT NULL AND image_url != '';
      ALTER TABLE archives DROP COLUMN image_url;
    END IF;
  END IF;
END $$;

-- Ajouter achievements si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'achievements') THEN
    ALTER TABLE archives ADD COLUMN achievements TEXT[];
  END IF;
END $$;

-- Ajouter created_by si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'created_by') THEN
    ALTER TABLE archives ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Ajouter updated_by si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'updated_by') THEN
    ALTER TABLE archives ADD COLUMN updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Ajouter updated_at si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archives' AND column_name = 'updated_at') THEN
    ALTER TABLE archives ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
  END IF;
END $$;

-- Créer ou mettre à jour le trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_archives_updated_at ON archives;
CREATE TRIGGER update_archives_updated_at BEFORE UPDATE ON archives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration des archives terminée avec succès!';
END $$;
