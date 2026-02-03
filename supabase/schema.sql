-- ============================================================================
-- SCHÉMA SUPABASE POUR L'ARBRE GÉNÉALOGIQUE DIOP
-- ============================================================================
-- À exécuter dans l'éditeur SQL de Supabase après la création du projet
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable pg_trgm for fuzzy search on names
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- TABLE: profiles
-- Profils utilisateurs (admin et modérateurs)
-- Étend auth.users de Supabase
-- ============================================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('admin', 'moderator')) NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour recherches rapides
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_suspended ON profiles(suspended);

COMMENT ON TABLE profiles IS 'Profils des utilisateurs administrateurs et modérateurs';

-- ============================================================================
-- TABLE: persons
-- Personnes de l'arbre généalogique
-- ============================================================================
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  genre TEXT CHECK (genre IN ('Homme', 'Femme')) NOT NULL,
  generation INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Index pour recherches et tri
-- Utilisation de GIN index pour la recherche rapide de texte (ex: "Diop" trouve "Ibrahima Diop")
CREATE INDEX idx_persons_name_trgm ON persons USING GIN (name gin_trgm_ops);
CREATE INDEX idx_persons_generation ON persons(generation);
CREATE INDEX idx_persons_created_at ON persons(created_at DESC);

COMMENT ON TABLE persons IS 'Membres de la famille Diop (218 personnes)';

-- ============================================================================
-- TABLE: relationships
-- Relations parent-enfant
-- ============================================================================
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES persons(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES persons(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(parent_id, child_id),
  CHECK (parent_id != child_id)
);

-- Index pour requêtes rapides
CREATE INDEX idx_relationships_parent ON relationships(parent_id);
CREATE INDEX idx_relationships_child ON relationships(child_id);

COMMENT ON TABLE relationships IS 'Relations parentales entre les membres de la famille';

-- ============================================================================
-- TABLE: archives
-- Archives familiales (biographies, photos, documents, etc.)
-- ============================================================================
CREATE TABLE archives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES persons(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  full_content TEXT,
  date TEXT NOT NULL,
  images TEXT[], -- Array d'URLs vers Supabase Storage
  achievements TEXT[], -- Array de réalisations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Index pour recherches
CREATE INDEX idx_archives_person ON archives(person_id);
CREATE INDEX idx_archives_category ON archives(category);
CREATE INDEX idx_archives_created_at ON archives(created_at DESC);

COMMENT ON TABLE archives IS 'Archives familiales (biographies, photos, documents, citations, articles)';

-- ============================================================================
-- TABLE: change_history
-- Historique de toutes les modifications (audit log)
-- ============================================================================
CREATE TABLE change_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  reverted BOOLEAN DEFAULT FALSE,
  revert_reason TEXT
);

-- Index pour recherches dans l'historique
CREATE INDEX idx_change_history_table ON change_history(table_name);
CREATE INDEX idx_change_history_record ON change_history(record_id);
CREATE INDEX idx_change_history_changed_at ON change_history(changed_at DESC);
CREATE INDEX idx_change_history_changed_by ON change_history(changed_by);

COMMENT ON TABLE change_history IS 'Historique complet des modifications pour audit et revert';

-- ============================================================================
-- TRIGGERS: Mise à jour automatique de updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_archives_updated_at BEFORE UPDATE ON archives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGERS: Audit automatique (change_history)
-- ============================================================================
CREATE OR REPLACE FUNCTION log_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO change_history (table_name, record_id, action, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO change_history (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO change_history (table_name, record_id, action, old_data, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activer l'audit sur persons et archives
CREATE TRIGGER audit_persons AFTER INSERT OR UPDATE OR DELETE ON persons
  FOR EACH ROW EXECUTE FUNCTION log_change();

CREATE TRIGGER audit_archives AFTER INSERT OR UPDATE OR DELETE ON archives
  FOR EACH ROW EXECUTE FUNCTION log_change();

CREATE TRIGGER audit_relationships AFTER INSERT OR UPDATE OR DELETE ON relationships
  FOR EACH ROW EXECUTE FUNCTION log_change();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: profiles
-- ============================================================================

-- Lecture : seulement pour les utilisateurs authentifiés
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Mise à jour : seulement les admins
CREATE POLICY "Only admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insertion : seulement les admins
CREATE POLICY "Only admins can create profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- POLICIES: persons
-- ============================================================================

-- Lecture : tout le monde (y compris anonymes)
CREATE POLICY "Anyone can read persons"
  ON persons FOR SELECT
  TO authenticated, anon
  USING (true);

-- Création : modérateurs et admins non suspendus
CREATE POLICY "Moderators and admins can create persons"
  ON persons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND suspended = FALSE
    )
  );

-- Mise à jour : modérateurs et admins non suspendus
CREATE POLICY "Moderators and admins can update persons"
  ON persons FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND suspended = FALSE
    )
  );

-- Suppression : seulement admins
CREATE POLICY "Only admins can delete persons"
  ON persons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- POLICIES: relationships
-- ============================================================================

-- Lecture : tout le monde
CREATE POLICY "Anyone can read relationships"
  ON relationships FOR SELECT
  TO authenticated, anon
  USING (true);

-- Création : modérateurs et admins non suspendus
CREATE POLICY "Moderators and admins can create relationships"
  ON relationships FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND suspended = FALSE
    )
  );

-- Suppression : modérateurs et admins non suspendus
CREATE POLICY "Moderators and admins can delete relationships"
  ON relationships FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND suspended = FALSE
    )
  );

-- ============================================================================
-- POLICIES: archives
-- ============================================================================

-- Lecture : tout le monde
CREATE POLICY "Anyone can read archives"
  ON archives FOR SELECT
  TO authenticated, anon
  USING (true);

-- Création : modérateurs et admins non suspendus
CREATE POLICY "Moderators and admins can create archives"
  ON archives FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND suspended = FALSE
    )
  );

-- Mise à jour : modérateurs et admins non suspendus
CREATE POLICY "Moderators and admins can update archives"
  ON archives FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND suspended = FALSE
    )
  );

-- Suppression : seulement admins
CREATE POLICY "Only admins can delete archives"
  ON archives FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- POLICIES: change_history
-- ============================================================================

-- Lecture : seulement admins
CREATE POLICY "Only admins can read change history"
  ON change_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Mise à jour : seulement admins (pour revert)
CREATE POLICY "Only admins can update change history"
  ON change_history FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- STORAGE BUCKET pour les images
-- ============================================================================

-- À créer manuellement dans l'interface Supabase Storage:
-- Nom du bucket: "family-images"
-- Public: true
-- Allowed MIME types: image/*

-- Policy pour upload (modérateurs et admins)
-- CREATE POLICY "Moderators can upload images"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (
--     bucket_id = 'family-images' AND
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE id = auth.uid() AND suspended = FALSE
--     )
--   );

-- ============================================================================
-- FIN DU SCHÉMA
-- ============================================================================

-- Afficher un message de succès
DO $$
BEGIN
  RAISE NOTICE 'Schéma créé avec succès ! Prochaines étapes:';
  RAISE NOTICE '1. Créer le bucket Storage "family-images"';
  RAISE NOTICE '2. Exécuter le script de migration des données';
  RAISE NOTICE '3. Créer le premier compte admin';
END $$;
