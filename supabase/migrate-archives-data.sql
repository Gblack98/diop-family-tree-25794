-- ============================================================================
-- MIGRATION DES ARCHIVES STATIQUES VERS SUPABASE
-- À exécuter dans le SQL Editor de Supabase
-- Importe les 18 archives depuis les données statiques de l'application
-- ============================================================================

DO $migrate$
DECLARE
  v_pid UUID;
  v_count INT;
BEGIN
  -- Vérifier si des archives existent déjà
  SELECT COUNT(*) INTO v_count FROM archives;
  IF v_count > 0 THEN
    RAISE NOTICE 'La table archives contient déjà % enregistrements. Migration annulée.', v_count;
    RETURN;
  END IF;

  -- ========================================
  -- Archive 1: Biographie Général Ibrahima Gabar Diop (Badara)
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%Ibrahima Gabar Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, full_content, date, images, achievements)
  VALUES (
    v_pid,
    'biography',
    'Général de Division Ibrahima Gabar Diop',
    'Officier général sénégalais né le 25 janvier 1947 à Dakar. Saint-Cyrien de la promotion Général Gilles, Général de division depuis 2003.',
    $t$Ibrahima Gabar Diop est né le 25 janvier 1947 à Dakar. Il passe son enfance dans la capitale sénégalaise où il fréquente l'École du Champ de Courses, puis le Collège d'Orientation et le Lycée Blaise Diagne. C'est au Lycée Van Vollenhoven qu'il obtient son baccalauréat en 1966.

Après le bac, il traverse l'Atlantique pour préparer le concours de Saint-Cyr. Il rejoint d'abord la corniche Bournazel au Lycée Dumont d'Urville de Toulon, puis le Lycée Militaire d'Aix-en-Provence. En 1969, il intègre l'École Spéciale Militaire de Saint-Cyr.

Il appartient à la 156e promotion, celle du Général Gilles. Parmi ses camarades de promotion, on compte Birago Diouf, Makha Keita, Joseph Gomis, Papa Khalilou Fall — qui deviendra plus tard Chef d'État-Major Général des Armées —, Chérif Ba, et Pathé Seck, futur Haut Commandant de la Gendarmerie Nationale, Ministre de l'Intérieur et ambassadeur au Portugal. Des amitiés qui dureront toute une vie.

Sorti de Saint-Cyr en 1971, il part à Saumur pour l'École d'Application de l'Arme Blindée Cavalerie. Il y reviendra en 1978 pour le cours de perfectionnement des officiers. Cette même année, il passe par l'École d'État-Major de Compiègne. Plus tard, entre 1992 et 1993, il traverse à nouveau l'Atlantique pour suivre les cours du US Army War College à Carlisle, en Pennsylvanie.

Sa carrière le mène d'abord à Paris, où il sert comme attaché militaire adjoint de 1982 à 1986. De retour au pays, il commande le Bataillon des Blindés pendant deux ans. Les années suivantes le voient occuper différents postes à l'État-Major Général des Armées : chef de division, adjoint aux opérations en zone Centre puis en zone Sud, et chef de la division Renseignements.

De 1993 à 1996, il devient chef de cabinet du Chef d'État-Major Général des Armées, le Général Mohamadou Keita. Puis il repart à l'étranger, cette fois comme attaché militaire à Riyad, en Arabie Saoudite, où il reste cinq ans.

À son retour en 2001, il prend le commandement du Groupement National des Sapeurs-Pompiers. Le 22 septembre 2003, il est promu Général de division. En 2006, le président Abdoulaye Wade le nomme chef d'état-major particulier du président de la République. Il dirige également le Centre d'Orientation Stratégique, chargé de coordonner les services de renseignements du pays.

En 2011, il prend la tête de l'Agence Nationale des Nouveaux Ports du Sénégal.

Il reste proche de ses anciens camarades. En décembre 2017, il préside à Dakar la célébration du "2S 212" de la Saint-Cyrienne Sénégal, qui réunit plus d'une centaine d'anciens venus du Sénégal, de France et du Burkina Faso.$t$,
    'Né le 25 janvier 1947',
    ARRAY['/images/archives/ibrahima-gabar-diop.jpg']::TEXT[],
    ARRAY[
      'Général de Division (2003)',
      'Saint-Cyrien — Promotion Général Gilles (1969-1971)',
      $t$Chef d'État-Major Particulier du Président$t$,
      'Commandant du Groupement National des Sapeurs-Pompiers',
      $t$Directeur Général de l'ANNPS$t$,
      'Diplômé du US Army War College'
    ]::TEXT[]
  );

  -- ========================================
  -- Archive 2: Photo Daro Wade
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%Daro Wade%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, date, images)
  VALUES (
    v_pid,
    'photo',
    'Portrait de famille - 1965',
    'Rassemblement familial à Saint-Louis lors de la Tabaski. Une journée mémorable réunissant trois générations.',
    '1965',
    ARRAY['/images/archives/famille-1965.jpg']::TEXT[]
  );

  -- ========================================
  -- Archive 3: Document Gabar Biram Médor Diop
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%Gabar Biram%Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, full_content, date, images)
  VALUES (
    v_pid,
    'document',
    'Diplôme de Médecine',
    'Université de Dakar - Faculté de Médecine. Premier médecin de la famille Diop.',
    $t$Diplôme de Docteur en Médecine obtenu avec mention Très Bien. Gabar Biram Médor Diop s'est spécialisé en pédiatrie et a ouvert le premier cabinet pédiatrique dans sa région natale.$t$,
    '1972',
    ARRAY['/images/archives/diplome-medecine.jpg']::TEXT[]
  );

  -- ========================================
  -- Archive 4: Citation Alioune Badara Gabar Diop
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%Alioune Badara%Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, date)
  VALUES (
    v_pid,
    'quote',
    $t$Sur l'héritage familial$t$,
    $t$L'éducation est l'arme la plus puissante que vous puissiez utiliser pour changer le monde. C'est ce que mon père m'a appris, et c'est ce que j'ai transmis à mes enfants.$t$,
    '1998'
  );

  -- ========================================
  -- Archive 5: Article Ibrahima Gabar Diop
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%Ibrahima Gabar Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, full_content, date, images)
  VALUES (
    v_pid,
    'article',
    'Article de presse - Le Soleil',
    $t$Reconnaissance nationale pour son œuvre philanthropique. Ibrahima Gabar Diop a fondé trois écoles dans les zones rurales du Sénégal.$t$,
    $t$Le philanthrope Ibrahima Gabar Diop a reçu hier la médaille d'honneur de la République pour son action exceptionnelle dans le domaine de l'éducation. En 20 ans, il a fondé trois écoles permettant à des centaines d'enfants d'accéder à l'éducation dans des zones reculées.$t$,
    '2005',
    ARRAY['/images/archives/article-presse.jpg']::TEXT[]
  );

  -- ========================================
  -- Archive 6: Photo Amadou Bamba Diop
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%Amadou Bamba Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, date, images)
  VALUES (
    v_pid,
    'photo',
    'Photo de Amadou Bamba Diop',
    'Portrait officiel conservé dans les archives familiales.',
    'XXXX',
    ARRAY['/images/archives/amadou-bamba-diop.jpg']::TEXT[]
  );

  -- ========================================
  -- Archive 7: Biographie El Hadj Malick Ndiaye
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%El Hadj Malick Ndiaye%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, full_content, date, achievements)
  VALUES (
    v_pid,
    'biography',
    $t$Parcours d'El Hadj Malick Ndiaye$t$,
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'XXXX',
    ARRAY['Lorem ipsum', 'Dolor sit amet', 'Consectetur adipiscing']::TEXT[]
  );

  -- ========================================
  -- Archive 8: Citation Marième Diop
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%Marième Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, date)
  VALUES (
    v_pid,
    'quote',
    'Sur la solidarité familiale',
    'Dans notre famille, nous avons toujours su que notre force réside dans notre unité. Chaque succès individuel est une victoire collective.',
    '2010'
  );

  -- ========================================
  -- Archive 9: Document Amadou Diop
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name = 'Amadou Diop' OR name ILIKE 'Amadou Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, date, images)
  VALUES (
    v_pid,
    'document',
    'Acte de naissance - 1895',
    $t$Document historique attestant de la naissance d'Amadou Diop, l'un des plus anciens membres documentés de notre lignée.$t$,
    '1895',
    ARRAY['/images/archives/acte-naissance-1895.jpg']::TEXT[]
  );

  -- ========================================
  -- Archive 10: Biographie Magatte Diop
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%Magatte Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, full_content, date, images, achievements)
  VALUES (
    v_pid,
    'biography',
    'Magatte Diop, polytechnicien et enseignant',
    $t$Ingénieur diplômé de l'École Polytechnique (X 78) et de l'École Nationale des Ponts et Chaussées. Enseignant à l'École Polytechnique de Thiès pendant plus de trois décennies.$t$,
    $t$Magatte Diop obtient son baccalauréat en 1976 au Lycée Van Vollenhoven à Dakar. Il part ensuite en France pour les classes préparatoires — math sup, math spé — avant d'intégrer l'École Polytechnique, promotion 1978.

Après l'X, il poursuit à l'École Nationale des Ponts et Chaussées, où il se spécialise dans les sciences de l'ingénieur (Ouvrage d'art).

De retour au Sénégal, il rejoint l'École Polytechnique de Thiès comme enseignant. Il y passera l'essentiel de sa carrière. Ses cours couvrent la résistance des matériaux, l'analyse numérique, la recherche opérationnelle et la mécanique des solides.

Au fil des années, il forme plus de 34 promotions d'ingénieurs. Des générations d'étudiants passent par ses amphithéâtres et ses travaux dirigés. Beaucoup d'entre eux occupent aujourd'hui des postes importants dans l'administration, les entreprises et les bureaux d'études du Sénégal et d'ailleurs.$t$,
    'X 78',
    ARRAY['/images/archives/magatte-diop.jpg']::TEXT[],
    ARRAY[
      'Polytechnicien (X 78)',
      $t$Diplômé de l'École Nationale des Ponts et Chaussées$t$,
      $t$Enseignant à l'École Polytechnique de Thiès$t$,
      $t$34+ promotions d'ingénieurs formées$t$
    ]::TEXT[]
  );

  -- ========================================
  -- Archive 11: Photos Badara Gabar Diop
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%Badara Gabar Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, date, images)
  VALUES (
    v_pid,
    'photo',
    'Galerie Photos - Badara Gabar Diop',
    'Collection de photos familiales de Badara Gabar Diop',
    'Archives familiales',
    ARRAY[
      '/images/archive-whatsapp/badara-gabar-diop/WhatsApp Image 2025-10-19 at 09.05.36 (1).jpeg',
      '/images/archive-whatsapp/badara-gabar-diop/WhatsApp Image 2025-10-19 at 09.08.32 (2).jpeg',
      '/images/archive-whatsapp/badara-gabar-diop/WhatsApp Image 2025-10-19 at 09.08.32 (4).jpeg',
      '/images/archive-whatsapp/badara-gabar-diop/WhatsApp Image 2025-10-19 at 09.08.32 (11).jpeg'
    ]::TEXT[]
  );

  -- ========================================
  -- Archive 12: Photos Amadou Bamba Diop (Badara)
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%Amadou Bamba Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, date, images)
  VALUES (
    v_pid,
    'photo',
    'Galerie Photos - Amadou Bamba Diop',
    'Collection de photos d''Amadou Bamba Diop, fils de Badara Gabar.',
    'Archives familiales',
    ARRAY[
      '/images/archive-whatsapp/amadou-bamba-diop-badara/WhatsApp Image 2025-10-19 at 09.08.31 (1).jpeg',
      '/images/archive-whatsapp/amadou-bamba-diop-badara/WhatsApp Image 2025-10-19 at 09.08.32 (8).jpeg',
      '/images/archive-whatsapp/amadou-bamba-diop-badara/WhatsApp Image 2025-10-19 at 09.08.32 (9).jpeg',
      '/images/archive-whatsapp/amadou-bamba-diop-badara/WhatsApp Image 2025-10-19 at 09.08.32 (10).jpeg',
      '/images/archive-whatsapp/amadou-bamba-diop-badara/WhatsApp Image 2025-10-19 at 09.08.32 (14).jpeg'
    ]::TEXT[]
  );

  -- ========================================
  -- Archive 13: Photos Amadou Diop (Badara)
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name = 'Amadou Diop' OR name ILIKE 'Amadou Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, date, images)
  VALUES (
    v_pid,
    'photo',
    'Galerie Photos - Amadou Diop',
    'Photos d''Amadou Diop de la lignée Badara.',
    'Archives familiales',
    ARRAY[
      '/images/archive-whatsapp/amadou-diop-badara/WhatsApp Image 2025-10-19 at 09.05.36 (3).jpeg',
      '/images/archive-whatsapp/amadou-diop-badara/WhatsApp Image 2025-10-19 at 09.05.36 (5).jpeg',
      '/images/archive-whatsapp/amadou-diop-badara/WhatsApp Image 2025-10-19 at 09.08.32.jpeg'
    ]::TEXT[]
  );

  -- ========================================
  -- Archive 14: Photo Gabar Biram Médor Diop (Badara)
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%Gabar Biram%Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, date, images)
  VALUES (
    v_pid,
    'photo',
    'Portrait de Gabar Biram Médor Diop',
    'Photo de Gabar Biram Médor Diop, membre de la famille Diop.',
    'Archives familiales',
    ARRAY['/images/archive-whatsapp/gabar-birame-medor-diop-badara/WhatsApp Image 2025-10-19 at 09.08.31 (2).jpeg']::TEXT[]
  );

  -- ========================================
  -- Archive 15: Photos de groupe
  -- ========================================
  INSERT INTO archives (person_id, category, title, content, date, images)
  VALUES (
    NULL,
    'photo',
    'Photos de Groupe - Rassemblements Familiaux',
    'Collection de photos de groupe capturant les moments précieux des rassemblements familiaux.',
    'Archives familiales',
    ARRAY[
      '/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.05.36 (7).jpeg',
      '/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.05.36 (8).jpeg',
      '/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.08.31.jpeg',
      '/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.08.32 (1).jpeg',
      '/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.08.32 (5).jpeg',
      '/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.08.32 (7).jpeg',
      '/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.08.32 (12).jpeg'
    ]::TEXT[]
  );

  -- ========================================
  -- Archive 16: Photo Ibrahima Gabar Diop (Gabar) - le conseiller colonial
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%Ibrahima Gabar Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, date, images)
  VALUES (
    v_pid,
    'photo',
    'Photo de Ibrahima Gabar Diop',
    $t$Ibrahima Gabar Diop était un conseiller colonial élu du Sénégal dans les années 30. Il était membre de commissions administratives clés (agriculture, éducation, finances) et un défenseur actif des droits sociaux et professionnels des populations indigènes face à l'administration coloniale.$t$,
    'XXXX',
    ARRAY['/images/archive-whatsapp/ibrahima-gabar-diop-gabar/IMG-20211129-IbrahimaGabarDiop-Biram.jpg']::TEXT[]
  );

  -- ========================================
  -- Archive 17: Photo Gabar Biram Médor Diop (portrait)
  -- ========================================
  SELECT id INTO v_pid FROM persons
    WHERE name ILIKE '%Gabar Biram%Diop%' LIMIT 1;

  INSERT INTO archives (person_id, category, title, content, date, images)
  VALUES (
    v_pid,
    'photo',
    'Portrait de Gabar Biram Médor Diop',
    'Portrait de Gabar Biram Médor Diop conservé dans les archives familiales.',
    'Archives familiales',
    ARRAY['/images/famille/Gabar-biram-medor-diop/IMG_20260111_GabarBiramMedorDiop.jpg']::TEXT[]
  );

  -- ========================================
  -- Archive 18: Regroupement famille Diop
  -- NOTE: Les images de cette archive sont chargées dynamiquement
  -- depuis /public/images/famille/regroupement famille/
  -- Ajoutez-les manuellement via l'interface admin après la migration
  -- ========================================
  INSERT INTO archives (person_id, category, title, content, date)
  VALUES (
    NULL,
    'photo',
    'Regroupement de la famille Diop',
    'Rassemblement lors du mariage de Mame Njoboss, fille de Saliou Diop et petite fille de Badara Gabar Diop.',
    '07/01/2023'
  );

  -- Résultat
  SELECT COUNT(*) INTO v_count FROM archives;
  RAISE NOTICE '✅ Migration terminée : % archives importées avec succès !', v_count;
  RAISE NOTICE 'Note : L''archive 18 (Regroupement famille) nécessite l''ajout manuel des images via l''interface admin.';

END $migrate$;
