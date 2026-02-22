-- ============================================================================
-- STORAGE POLICIES - bucket: family-images
-- ============================================================================
-- Applique les politiques RLS sur storage.objects pour le bucket family-images
-- Sans ces politiques, PERSONNE ne peut uploader (même les admins authentifiés)
-- ============================================================================

-- Lecture publique : tout le monde peut voir les images
DROP POLICY IF EXISTS "Public read family-images" ON storage.objects;
CREATE POLICY "Public read family-images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'family-images');

-- Upload (INSERT) : admins et modérateurs non suspendus
DROP POLICY IF EXISTS "Authenticated upload family-images" ON storage.objects;
CREATE POLICY "Authenticated upload family-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'family-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderator')
        AND NOT suspended
    )
  );

-- Mise à jour (UPDATE) : admins et modérateurs non suspendus
DROP POLICY IF EXISTS "Authenticated update family-images" ON storage.objects;
CREATE POLICY "Authenticated update family-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'family-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderator')
        AND NOT suspended
    )
  );

-- Suppression (DELETE) : admins et modérateurs non suspendus
DROP POLICY IF EXISTS "Authenticated delete family-images" ON storage.objects;
CREATE POLICY "Authenticated delete family-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'family-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderator')
        AND NOT suspended
    )
  );

DO $$
BEGIN
  RAISE NOTICE 'Storage policies pour family-images appliquées avec succès !';
END $$;
