-- ============================================================================
-- NOTIFICATIONS POUR LES DEMANDES D'APPROBATION (pending_changes)
-- ============================================================================
-- À exécuter dans Supabase SQL Editor
-- Complète le système de notifications pour le workflow de modération :
-- quand un modérateur soumet une demande, l'admin est notifié en temps réel
-- avec un lien direct vers la demande à approuver/rejeter.
-- ============================================================================

-- 1. Ajouter la colonne pending_change_id à admin_notifications
ALTER TABLE admin_notifications
  ADD COLUMN IF NOT EXISTS pending_change_id UUID REFERENCES pending_changes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_pending
  ON admin_notifications(pending_change_id);

-- 2. Fonction trigger : notifie les admins quand un modérateur soumet une demande
CREATE OR REPLACE FUNCTION notify_admins_on_pending_change()
RETURNS TRIGGER AS $$
DECLARE
  actor_profile  RECORD;
  admin_record   RECORD;
  v_action_label TEXT;
  v_table_label  TEXT;
  v_target_label TEXT;
  v_message      TEXT;
BEGIN
  -- Récupérer le profil du modérateur
  SELECT username, email, role INTO actor_profile
  FROM profiles
  WHERE id = NEW.requested_by;

  -- Construire les labels
  v_action_label := CASE NEW.action
    WHEN 'INSERT' THEN 'créer'
    WHEN 'UPDATE' THEN 'modifier'
    ELSE NEW.action
  END;

  v_table_label := CASE NEW.table_name
    WHEN 'persons'       THEN 'une personne'
    WHEN 'archives'      THEN 'une archive'
    WHEN 'relationships' THEN 'une relation'
    ELSE NEW.table_name
  END;

  -- Extraire le nom/titre depuis new_data
  v_target_label := COALESCE(
    NEW.new_data->>'name',
    NEW.new_data->>'title',
    ''
  );

  -- Message clair : action nécessaire
  v_message := COALESCE(actor_profile.username, actor_profile.email, 'Un modérateur')
    || ' souhaite ' || v_action_label || ' ' || v_table_label;
  IF v_target_label != '' THEN
    v_message := v_message || ' : "' || v_target_label || '"';
  END IF;
  v_message := v_message || ' — approbation requise';

  -- Notifier tous les admins actifs
  FOR admin_record IN
    SELECT id FROM profiles WHERE role = 'admin' AND suspended = FALSE
  LOOP
    INSERT INTO admin_notifications (
      admin_id,
      pending_change_id,
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Attacher le trigger sur pending_changes (INSERT uniquement)
DROP TRIGGER IF EXISTS notify_admins_on_pending_change_trigger ON pending_changes;
CREATE TRIGGER notify_admins_on_pending_change_trigger
  AFTER INSERT ON pending_changes
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_on_pending_change();

-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Trigger pending_changes → notifications créé avec succès !';
  RAISE NOTICE 'Les admins recevront désormais une notification en temps réel';
  RAISE NOTICE 'pour chaque demande de modération soumise par un modérateur.';
END $$;
