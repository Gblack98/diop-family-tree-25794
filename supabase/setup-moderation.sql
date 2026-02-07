-- ============================================================================
-- SYSTÈME DE MODÉRATION AVEC APPROBATION
-- ============================================================================
-- À exécuter dans Supabase SQL Editor (admin)
-- Crée les modérateurs et le système d'approbation des changements
-- ============================================================================

-- 1. TABLE: pending_changes
-- Stocke tous les changements en attente d'approbation (INSERT, UPDATE)
CREATE TABLE IF NOT EXISTS pending_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL CHECK (table_name IN ('persons', 'archives', 'relationships')),
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE')),
  record_id UUID,  -- ID du record affecté (NULL pour INSERT puisque l'ID n'existe pas encore)
  old_data JSONB,  -- Données avant pour UPDATE, NULL pour INSERT
  new_data JSONB NOT NULL,  -- Données à créer/modifier
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  review_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT check_action_record_id CHECK (
    (action = 'INSERT' AND record_id IS NULL) OR
    (action = 'UPDATE' AND record_id IS NOT NULL)
  )
);

-- Indexes pour performance
-- Ensure indexes are idempotent when re-running the script
DROP INDEX IF EXISTS idx_pending_changes_status;
CREATE INDEX idx_pending_changes_status ON pending_changes(status);
DROP INDEX IF EXISTS idx_pending_changes_table_name;
CREATE INDEX idx_pending_changes_table_name ON pending_changes(table_name);
DROP INDEX IF EXISTS idx_pending_changes_requested_by;
CREATE INDEX idx_pending_changes_requested_by ON pending_changes(requested_by);
DROP INDEX IF EXISTS idx_pending_changes_created_at;
CREATE INDEX idx_pending_changes_created_at ON pending_changes(created_at DESC);

COMMENT ON TABLE pending_changes IS 'Changements en attente d''approbation par les administrateurs (modérateurs)';

-- ============================================================================
-- 2. FUNCTION: approve_change
-- Approuve un changement et l'applique à la vraie table
-- À utiliser par les admins uniquement
-- ============================================================================
CREATE OR REPLACE FUNCTION public.approve_change(
  p_change_id UUID,
  p_reviewer_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_change pending_changes%ROWTYPE;
  v_result JSONB;
  v_new_id UUID;
  v_parent_id UUID;
  v_child_id UUID;
BEGIN
  -- Vérifier que l'approuveur est admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_reviewer_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent approuver les changements';
  END IF;

  -- Récupérer le changement
  SELECT * INTO v_change FROM pending_changes WHERE id = p_change_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Changement introuvable: %', p_change_id;
  END IF;

  -- Vérifier que le changement est en attente
  IF v_change.status != 'pending' THEN
    RAISE EXCEPTION 'Le changement n''est pas en attente: %', v_change.status;
  END IF;

  -- Appliquer le changement selon son type
  CASE v_change.table_name
    WHEN 'persons' THEN
      IF v_change.action = 'INSERT' THEN
        INSERT INTO persons (name, genre, generation, created_by, created_at)
        VALUES (
          v_change.new_data->>'name',
          v_change.new_data->>'genre',
          (v_change.new_data->>'generation')::INTEGER,
          v_change.requested_by,
          NOW()
        )
        RETURNING id INTO v_new_id;
        v_result := json_build_object('new_id', v_new_id);
      ELSIF v_change.action = 'UPDATE' THEN
        UPDATE persons SET
          name = COALESCE(v_change.new_data->>'name', name),
          genre = COALESCE(v_change.new_data->>'genre', genre),
          generation = COALESCE((v_change.new_data->>'generation')::INTEGER, generation),
          updated_by = v_change.requested_by,
          updated_at = NOW()
        WHERE id = v_change.record_id;
        v_result := json_build_object('updated', true);
      END IF;

    WHEN 'archives' THEN
      IF v_change.action = 'INSERT' THEN
        INSERT INTO archives (
          person_id, category, title, content, full_content, date, images, achievements, created_by, created_at
        )
        VALUES (
          CASE WHEN v_change.new_data->>'person_id' = 'null' OR v_change.new_data->>'person_id' IS NULL THEN NULL ELSE (v_change.new_data->>'person_id')::UUID END,
          v_change.new_data->>'category',
          v_change.new_data->>'title',
          v_change.new_data->>'content',
          v_change.new_data->>'full_content',
          v_change.new_data->>'date',
          (v_change.new_data->'images')::TEXT[],
          (v_change.new_data->'achievements')::TEXT[],
          v_change.requested_by,
          NOW()
        )
        RETURNING id INTO v_new_id;
        v_result := json_build_object('new_id', v_new_id);
      ELSIF v_change.action = 'UPDATE' THEN
        UPDATE archives SET
          person_id = CASE WHEN v_change.new_data->>'person_id' IS NULL THEN NULL ELSE (v_change.new_data->>'person_id')::UUID END,
          category = COALESCE(v_change.new_data->>'category', category),
          title = COALESCE(v_change.new_data->>'title', title),
          content = COALESCE(v_change.new_data->>'content', content),
          full_content = COALESCE(v_change.new_data->>'full_content', full_content),
          date = COALESCE(v_change.new_data->>'date', date),
          images = COALESCE((v_change.new_data->'images')::TEXT[], images),
          achievements = COALESCE((v_change.new_data->'achievements')::TEXT[], achievements),
          updated_by = v_change.requested_by,
          updated_at = NOW()
        WHERE id = v_change.record_id;
        v_result := json_build_object('updated', true);
      END IF;

    WHEN 'relationships' THEN
      IF v_change.action = 'INSERT' THEN
        v_parent_id := (v_change.new_data->>'parent_id')::UUID;
        v_child_id := (v_change.new_data->>'child_id')::UUID;

        -- Si la relation existe déjà, ne pas tenter de ré-insérer (évite violation contrainte unique)
        SELECT id INTO v_new_id FROM relationships
        WHERE parent_id = v_parent_id AND child_id = v_child_id;

        IF v_new_id IS NULL THEN
          INSERT INTO relationships (parent_id, child_id, created_by, created_at)
          VALUES (
            v_parent_id,
            v_child_id,
            v_change.requested_by,
            NOW()
          )
          RETURNING id INTO v_new_id;
          v_result := json_build_object('new_id', v_new_id, 'inserted', true);
        ELSE
          -- Relationship already exists: mark as approved without duplicate insert
          v_result := json_build_object('new_id', v_new_id, 'inserted', false, 'note', 'relationship already exists');
        END IF;
      END IF;
  END CASE;

  -- Marquer le changement comme approuvé
  UPDATE pending_changes SET
    status = 'approved',
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW()
  WHERE id = p_change_id;

  RETURN json_build_object(
    'success', true,
    'change_id', p_change_id,
    'result', v_result
  );
END;
$$;

-- ============================================================================
-- 3. FUNCTION: reject_change
-- Rejette un changement en attente
-- ============================================================================
CREATE OR REPLACE FUNCTION public.reject_change(
  p_change_id UUID,
  p_reviewer_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'approuveur est admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_reviewer_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent rejeter les changements';
  END IF;

  -- Vérifier que le changement existe et est en attente
  IF NOT EXISTS (
    SELECT 1 FROM pending_changes
    WHERE id = p_change_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Changement introuvable ou non en attente: %', p_change_id;
  END IF;

  -- Marquer comme rejeté
  UPDATE pending_changes SET
    status = 'rejected',
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW(),
    review_reason = p_reason
  WHERE id = p_change_id;

  RETURN json_build_object(
    'success', true,
    'change_id', p_change_id,
    'status', 'rejected'
  );
END;
$$;

-- ============================================================================
-- 4. RLS POLICIES: pending_changes
-- Les modérateurs peuvent créer des changements
-- Les admins voient tous les changements
-- ============================================================================
ALTER TABLE pending_changes ENABLE ROW LEVEL SECURITY;

-- Lecture : admins voient tout, modérateurs voient leurs propres changements + tous les en attente
DROP POLICY IF EXISTS "Admins can read all pending changes" ON pending_changes;
CREATE POLICY "Admins can read all pending changes"
  ON pending_changes FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Moderators can read pending changes" ON pending_changes;
CREATE POLICY "Moderators can read pending changes"
  ON pending_changes FOR SELECT
  TO authenticated
  USING (
    NOT public.is_admin() AND (
      requested_by = auth.uid() OR
      status = 'pending'
    )
  );

-- Insertion : modérateurs et admins créent des changements
DROP POLICY IF EXISTS "Authenticated users can create pending changes" ON pending_changes;
CREATE POLICY "Authenticated users can create pending changes"
  ON pending_changes FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_not_suspended() AND
    requested_by = auth.uid()
  );

-- Les admins ne modifient que les champs review
DROP POLICY IF EXISTS "Admins can review pending changes" ON pending_changes;
CREATE POLICY "Admins can review pending changes"
  ON pending_changes FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 5. MISE À JOUR DES RLS POLICIES EXISTANTES
-- Les modérateurs créent désormais des pending_changes, pas directement les tables
-- ============================================================================

-- Pour les persons : les modérateurs ne peuvent plus créer directement
DROP POLICY IF EXISTS "Authenticated users can create persons" ON persons;

-- Ensure policy creation is idempotent
DROP POLICY IF EXISTS "Admins can create persons" ON persons;
CREATE POLICY "Admins can create persons"
  ON persons FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() AND public.is_not_suspended()
  );

-- Update : idem (sauf admins qui peuvent faire directement)
DROP POLICY IF EXISTS "Authenticated users can update persons" ON persons;

-- Ensure policy creation is idempotent
DROP POLICY IF EXISTS "Admins can update persons" ON persons;
CREATE POLICY "Admins can update persons"
  ON persons FOR UPDATE
  TO authenticated
  USING (public.is_admin() AND public.is_not_suspended());

-- Similar pour archives et relationships...
DROP POLICY IF EXISTS "Authenticated users can create archives" ON archives;

-- Ensure policy creation is idempotent for archives
DROP POLICY IF EXISTS "Admins can create archives" ON archives;
CREATE POLICY "Admins can create archives"
  ON archives FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() AND public.is_not_suspended()
  );

DROP POLICY IF EXISTS "Authenticated users can update archives" ON archives;

-- Ensure policy creation is idempotent for archives update
DROP POLICY IF EXISTS "Admins can update archives" ON archives;
CREATE POLICY "Admins can update archives"
  ON archives FOR UPDATE
  TO authenticated
  USING (public.is_admin() AND public.is_not_suspended());

-- ============================================================================
-- 6. MESSAGE DE CONFIRMATION
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Système de modération créé avec succès !';
  RAISE NOTICE '- Table pending_changes créée';
  RAISE NOTICE '- Fonctions approve_change et reject_change créées';
  RAISE NOTICE '- RLS policies mises à jour pour le flux de modération';
  RAISE NOTICE 'Prochaine étape: créer les 5 profils modérateurs';
END $$;
