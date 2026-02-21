-- ============================================================================
-- PARAMÈTRES DU SITE - site_settings
-- ============================================================================
-- Permet aux admins de personnaliser le contenu du site public
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Valeurs par défaut
INSERT INTO site_settings (key, value) VALUES
  ('site_welcome_title',     'Arbre Généalogique Diop'),
  ('site_welcome_subtitle',  'Explorez 6 générations et 218 membres de la famille Diop'),
  ('site_description',       'Bienvenue dans l''arbre généalogique de la famille Diop. Découvrez l''histoire de votre famille à travers les générations.'),
  ('site_contact_email',     ''),
  ('site_facebook_url',      ''),
  ('site_instagram_url',     ''),
  ('site_footer_text',       '© Famille Diop — Tous droits réservés'),
  ('homepage_show_stats',    'true'),
  ('homepage_show_recent',   'true')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- FUNCTION: revert_history_entry
-- Annule une modification enregistrée dans change_history
-- ============================================================================
CREATE OR REPLACE FUNCTION public.revert_history_entry(
  p_entry_id UUID,
  p_revert_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry change_history%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent annuler des modifications';
  END IF;

  SELECT * INTO v_entry FROM change_history WHERE id = p_entry_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Entrée introuvable: %', p_entry_id;
  END IF;
  IF v_entry.reverted THEN
    RAISE EXCEPTION 'Cette modification a déjà été annulée';
  END IF;

  CASE v_entry.table_name
    WHEN 'persons' THEN
      IF v_entry.action = 'INSERT' THEN
        DELETE FROM persons WHERE id = v_entry.record_id;
      ELSIF v_entry.action = 'UPDATE' THEN
        UPDATE persons SET
          name = v_entry.old_data->>'name',
          genre = v_entry.old_data->>'genre',
          generation = (v_entry.old_data->>'generation')::INTEGER,
          updated_at = NOW()
        WHERE id = v_entry.record_id;
      ELSIF v_entry.action = 'DELETE' THEN
        INSERT INTO persons (id, name, genre, generation, created_at)
        VALUES (v_entry.record_id, v_entry.old_data->>'name', v_entry.old_data->>'genre', (v_entry.old_data->>'generation')::INTEGER, NOW())
        ON CONFLICT (id) DO NOTHING;
      END IF;

    WHEN 'archives' THEN
      IF v_entry.action = 'INSERT' THEN
        DELETE FROM archives WHERE id = v_entry.record_id;
      ELSIF v_entry.action = 'UPDATE' THEN
        UPDATE archives SET
          title = v_entry.old_data->>'title',
          category = v_entry.old_data->>'category',
          content = v_entry.old_data->>'content',
          full_content = v_entry.old_data->>'full_content',
          date = v_entry.old_data->>'date',
          updated_at = NOW()
        WHERE id = v_entry.record_id;
      ELSIF v_entry.action = 'DELETE' THEN
        INSERT INTO archives (id, person_id, category, title, content, date, created_at)
        VALUES (
          v_entry.record_id,
          CASE WHEN v_entry.old_data->>'person_id' IS NULL THEN NULL ELSE (v_entry.old_data->>'person_id')::UUID END,
          v_entry.old_data->>'category', v_entry.old_data->>'title',
          v_entry.old_data->>'content', v_entry.old_data->>'date', NOW()
        )
        ON CONFLICT (id) DO NOTHING;
      END IF;

    WHEN 'relationships' THEN
      IF v_entry.action = 'INSERT' THEN
        DELETE FROM relationships WHERE id = v_entry.record_id;
      ELSIF v_entry.action = 'DELETE' THEN
        INSERT INTO relationships (id, parent_id, child_id, created_at)
        VALUES (v_entry.record_id, (v_entry.old_data->>'parent_id')::UUID, (v_entry.old_data->>'child_id')::UUID, NOW())
        ON CONFLICT (id) DO NOTHING;
      END IF;
  END CASE;

  UPDATE change_history SET reverted = TRUE, revert_reason = p_revert_reason WHERE id = p_entry_id;

  RETURN jsonb_build_object('success', true, 'entry_id', p_entry_id);
END;
$$;

DO $$
BEGIN
  RAISE NOTICE 'site_settings et revert_history_entry créés avec succès !';
END $$;
