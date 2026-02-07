-- ============================================================================
-- SYSTÈME DE NOTIFICATIONS ADMIN
-- ============================================================================
-- Notifie les administrateurs des actions des modérateurs
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================================================

-- Table des notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  change_history_id UUID REFERENCES change_history(id) ON DELETE CASCADE,
  actor_name TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
  target_table TEXT NOT NULL,
  target_label TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_notifications_admin ON admin_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON admin_notifications(admin_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON admin_notifications(created_at DESC);

COMMENT ON TABLE admin_notifications IS 'Notifications pour les admins quand les modérateurs effectuent des actions';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Chaque admin ne voit que ses propres notifications
CREATE POLICY "Admins can read own notifications"
  ON admin_notifications FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid());

-- Chaque admin peut marquer ses notifications comme lues
CREATE POLICY "Admins can update own notifications"
  ON admin_notifications FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid());

-- Le système peut insérer des notifications (via trigger SECURITY DEFINER)
CREATE POLICY "System can insert notifications"
  ON admin_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Les admins peuvent supprimer leurs propres notifications
CREATE POLICY "Admins can delete own notifications"
  ON admin_notifications FOR DELETE
  TO authenticated
  USING (admin_id = auth.uid());

-- ============================================================================
-- TRIGGER: Créer des notifications automatiquement
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_admins_on_change()
RETURNS TRIGGER AS $$
DECLARE
  actor_profile RECORD;
  admin_record RECORD;
  v_action_label TEXT;
  v_table_label TEXT;
  v_target_label TEXT;
  v_message TEXT;
BEGIN
  -- Récupérer le profil de l'acteur
  SELECT username, email, role INTO actor_profile
  FROM profiles
  WHERE id = NEW.changed_by;

  -- Ne notifier que si l'acteur est un modérateur (pas besoin de notifier pour les actions admin)
  IF actor_profile.role IS NULL OR actor_profile.role = 'admin' THEN
    RETURN NEW;
  END IF;

  -- Construire les labels
  v_action_label := CASE NEW.action
    WHEN 'INSERT' THEN 'ajouté'
    WHEN 'UPDATE' THEN 'modifié'
    WHEN 'DELETE' THEN 'supprimé'
    ELSE NEW.action
  END;

  v_table_label := CASE NEW.table_name
    WHEN 'persons' THEN 'une personne'
    WHEN 'archives' THEN 'une archive'
    WHEN 'relationships' THEN 'une relation'
    ELSE NEW.table_name
  END;

  -- Extraire le label de l'élément ciblé
  v_target_label := '';
  IF NEW.new_data IS NOT NULL THEN
    v_target_label := COALESCE(
      NEW.new_data->>'name',
      NEW.new_data->>'title',
      ''
    );
  ELSIF NEW.old_data IS NOT NULL THEN
    v_target_label := COALESCE(
      NEW.old_data->>'name',
      NEW.old_data->>'title',
      ''
    );
  END IF;

  -- Construire le message
  v_message := COALESCE(actor_profile.username, actor_profile.email, 'Un modérateur')
    || ' a ' || v_action_label || ' ' || v_table_label;
  IF v_target_label != '' THEN
    v_message := v_message || ' : "' || v_target_label || '"';
  END IF;

  -- Notifier tous les admins
  FOR admin_record IN
    SELECT id FROM profiles WHERE role = 'admin' AND suspended = FALSE
  LOOP
    INSERT INTO admin_notifications (
      admin_id,
      change_history_id,
      actor_name,
      action_type,
      target_table,
      target_label,
      message
    ) VALUES (
      admin_record.id,
      NEW.id,
      COALESCE(actor_profile.username, actor_profile.email, 'Modérateur'),
      NEW.action,
      NEW.table_name,
      v_target_label,
      v_message
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activer le trigger sur change_history
DROP TRIGGER IF EXISTS notify_admins_trigger ON change_history;
CREATE TRIGGER notify_admins_trigger
  AFTER INSERT ON change_history
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_on_change();

-- ============================================================================
-- ACTIVER REALTIME
-- ============================================================================
-- À faire manuellement dans le dashboard Supabase :
-- Database > Replication > Activer admin_notifications

-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Système de notifications créé avec succès !';
  RAISE NOTICE 'N''oubliez pas d''activer Realtime pour la table admin_notifications';
END $$;
