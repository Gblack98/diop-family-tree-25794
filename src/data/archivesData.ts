import { FileText, Image as ImageIcon, BookOpen, Quote, Home, LucideIcon } from "lucide-react";

export enum ArchiveCategory {
  BIOGRAPHY = "biography",
  PHOTO = "photo",
  DOCUMENT = "document",
  QUOTE = "quote",
  ARTICLE = "article",
}

export interface Archive {
  id: number;
  person: string;
  category: ArchiveCategory;
  title: string;
  content: string;
  fullContent?: string;
  date: string;
  image?: string;       // Gardé pour compatibilité
  images?: string[];    // NOUVEAU : Pour le carrousel (ex: ["/img1.jpg", "/img2.jpg"])
  achievements?: string[];
}

export interface CategoryConfig {
  value: ArchiveCategory | "all";
  label: string;
  icon: LucideIcon;
}

export const archiveCategories: CategoryConfig[] = [
  { value: "all", label: "Tout", icon: Home },
  { value: ArchiveCategory.PHOTO, label: "Photos", icon: ImageIcon },
  { value: ArchiveCategory.BIOGRAPHY, label: "Biographies", icon: BookOpen },
  { value: ArchiveCategory.DOCUMENT, label: "Documents", icon: FileText },
  { value: ArchiveCategory.QUOTE, label: "Citations", icon: Quote },
  { value: ArchiveCategory.ARTICLE, label: "Articles", icon: FileText },
];

// Récupération automatique des images du dossier "regroupement famille"
const regroupementFamilleImages = Object.keys(
  import.meta.glob("/public/images/famille/regroupement famille/*.{jpg,jpeg,png,webp}")
).map((path) => path.replace("/public", ""));

export const archivesData: Archive[] = [
  {
    id: 1,
    person: "Ibrahima Gabar Diop (Badara)",
    category: ArchiveCategory.BIOGRAPHY,
    title: "Général de Division Ibrahima Gabar Diop",
    content: "Officier général sénégalais né le 25 janvier 1947 à Dakar. Saint-Cyrien de la promotion Général Gilles, Général de division depuis 2003.",
    fullContent: `Ibrahima Gabar Diop est né le 25 janvier 1947 à Dakar. Il passe son enfance dans la capitale sénégalaise où il fréquente l'École du Champ de Courses, puis le Collège d'Orientation et le Lycée Blaise Diagne. C'est au Lycée Van Vollenhoven qu'il obtient son baccalauréat en 1966.

Après le bac, il traverse l'Atlantique pour préparer le concours de Saint-Cyr. Il rejoint d'abord la corniche Bournazel au Lycée Dumont d'Urville de Toulon, puis le Lycée Militaire d'Aix-en-Provence. En 1969, il intègre l'École Spéciale Militaire de Saint-Cyr.

Il appartient à la 156e promotion, celle du Général Gilles. Parmi ses camarades de promotion, on compte Birago Diouf, Makha Keita, Joseph Gomis, Papa Khalilou Fall — qui deviendra plus tard Chef d'État-Major Général des Armées —, Chérif Ba, et Pathé Seck, futur ambassadeur au Portugal. Des amitiés qui dureront toute une vie.

Sorti de Saint-Cyr en 1971, il part à Saumur pour l'École d'Application de l'Arme Blindée Cavalerie. Il y reviendra en 1978 pour le cours de perfectionnement des officiers. Cette même année, il passe par l'École d'État-Major de Compiègne. Plus tard, entre 1992 et 1993, il traverse à nouveau l'Atlantique pour suivre les cours du US Army War College à Carlisle, en Pennsylvanie.

Sa carrière le mène d'abord à Paris, où il sert comme attaché militaire adjoint de 1982 à 1986. De retour au pays, il commande le Bataillon des Blindés pendant deux ans. Les années suivantes le voient occuper différents postes à l'État-Major Général des Armées : chef de division, adjoint aux opérations en zone Centre puis en zone Sud, et chef de la division Renseignements.

De 1993 à 1996, il devient chef de cabinet du Chef d'État-Major Général des Armées, le Général Mohamadou Keita. Puis il repart à l'étranger, cette fois comme attaché militaire à Riyad, en Arabie Saoudite, où il reste cinq ans.

À son retour en 2001, il prend le commandement du Groupement National des Sapeurs-Pompiers. Le 22 septembre 2003, il est promu Général de division. En 2006, le président Abdoulaye Wade le nomme chef d'état-major particulier du président de la République. Il dirige également le Centre d'Orientation Stratégique, chargé de coordonner les services de renseignements du pays.

En 2011, il prend la tête de l'Agence Nationale des Nouveaux Ports du Sénégal.

Il reste proche de ses anciens camarades. En décembre 2017, il préside à Dakar la célébration du "2S 212" de la Saint-Cyrienne Sénégal, qui réunit plus d'une centaine d'anciens venus du Sénégal, de France et du Burkina Faso.`,
    date: "Né le 25 janvier 1947",
    images: [
      "/images/archives/ibrahima-gabar-diop.jpg",
    ],
    image: "/images/archives/ibrahima-gabar-diop.jpg",
    achievements: [
      "Général de Division (2003)",
      "Saint-Cyrien — Promotion Général Gilles (1969-1971)",
      "Chef d'État-Major Particulier du Président",
      "Commandant du Groupement National des Sapeurs-Pompiers",
      "Directeur Général de l'ANNPS",
      "Diplômé du US Army War College"
    ]
  },
  {
    id: 2,
    person: "Daro Wade",
    category: ArchiveCategory.PHOTO,
    title: "Portrait de famille - 1965",
    content: "Rassemblement familial à Saint-Louis lors de la Tabaski. Une journée mémorable réunissant trois générations.",
    date: "1965",
    image: "/images/archives/famille-1965.jpg"
  },
  {
    id: 3,
    person: "Gabar Biram Médor Diop",
    category: ArchiveCategory.DOCUMENT,
    title: "Diplôme de Médecine",
    content: "Université de Dakar - Faculté de Médecine. Premier médecin de la famille Diop.",
    fullContent: "Diplôme de Docteur en Médecine obtenu avec mention Très Bien. Gabar Biram Médor Diop s'est spécialisé en pédiatrie et a ouvert le premier cabinet pédiatrique dans sa région natale.",
    date: "1972",
    image: "/images/archives/diplome-medecine.jpg"
  },
  {
    id: 4,
    person: "Alioune Badara Gabar Diop",
    category: ArchiveCategory.QUOTE,
    title: "Sur l'héritage familial",
    content: "L'éducation est l'arme la plus puissante que vous puissiez utiliser pour changer le monde. C'est ce que mon père m'a appris, et c'est ce que j'ai transmis à mes enfants.",
    date: "1998",
  },
  {
    id: 5,
    person: "Ibrahima Gabar Diop",
    category: ArchiveCategory.ARTICLE,
    title: "Article de presse - Le Soleil",
    content: "Reconnaissance nationale pour son œuvre philanthropique. Ibrahima Gabar Diop a fondé trois écoles dans les zones rurales du Sénégal.",
    fullContent: "Le philanthrope Ibrahima Gabar Diop a reçu hier la médaille d'honneur de la République pour son action exceptionnelle dans le domaine de l'éducation. En 20 ans, il a fondé trois écoles permettant à des centaines d'enfants d'accéder à l'éducation dans des zones reculées.",
    date: "2005",
    image: "/images/archives/article-presse.jpg"
  },
  {
    id: 6,
    person: "Amadou Bamba Diop",
    category: ArchiveCategory.PHOTO,
    title: "Photo de Amadou Bamba Diop",
    content: "Portrait officiel conservé dans les archives familiales.",
    date: "XXXX",
    image: "/images/archives/amadou-bamba-diop.jpg"
  },
  {
    id: 7,
    person: "El Hadj Malick Ndiaye",
    category: ArchiveCategory.BIOGRAPHY,
    title: "Parcours d'El Hadj Malick Ndiaye",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    fullContent: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    date: "XXXX",
    achievements: ["Lorem ipsum", "Dolor sit amet", "Consectetur adipiscing"]
  },
  {
    id: 8,
    person: "Marième Diop",
    category: ArchiveCategory.QUOTE,
    title: "Sur la solidarité familiale",
    content: "Dans notre famille, nous avons toujours su que notre force réside dans notre unité. Chaque succès individuel est une victoire collective.",
    date: "2010",
  },
  {
    id: 9,
    person: "Amadou Diop",
    category: ArchiveCategory.DOCUMENT,
    title: "Acte de naissance - 1895",
    content: "Document historique attestant de la naissance d'Amadou Diop, l'un des plus anciens membres documentés de notre lignée.",
    date: "1895",
    image: "/images/archives/acte-naissance-1895.jpg"
  },
  {
    id: 10,
    person: "Magatte Diop",
    category: ArchiveCategory.BIOGRAPHY,
    title: "Magatte Diop, polytechnicien et enseignant",
    content: "Ingénieur diplômé de l'École Polytechnique (X 78) et de l'École Nationale des Ponts et Chaussées. Enseignant à l'École Polytechnique de Thiès pendant plus de trois décennies.",
    fullContent: `Magatte Diop obtient son baccalauréat en 1976 au Lycée Van Vollenhoven à Dakar. Il part ensuite en France pour les classes préparatoires — math sup, math spé — avant d'intégrer l'École Polytechnique, promotion 1978.

Après l'X, il poursuit à l'École Nationale des Ponts et Chaussées, où il se spécialise dans les sciences de l'ingénieur (Ouvrage d'art).

De retour au Sénégal, il rejoint l'École Polytechnique de Thiès comme enseignant. Il y passera l'essentiel de sa carrière. Ses cours couvrent la résistance des matériaux, l'analyse numérique, la recherche opérationnelle et la mécanique des solides.

Au fil des années, il forme plus de 34 promotions d'ingénieurs. Des générations d'étudiants passent par ses amphithéâtres et ses travaux dirigés. Beaucoup d'entre eux occupent aujourd'hui des postes importants dans l'administration, les entreprises et les bureaux d'études du Sénégal et d'ailleurs.`,
    date: "X 78",
    image: "/images/archives/magatte-diop.jpg",
    achievements: [
      "Polytechnicien (X 78)",
      "Diplômé de l'École Nationale des Ponts et Chaussées",
      "Enseignant à l'École Polytechnique de Thiès",
      "34+ promotions d'ingénieurs formées"
    ]
  },
  {
    id: 11,
    person: "Badara Gabar Diop",
    category: ArchiveCategory.PHOTO,
    title: "Galerie Photos - Badara Gabar Diop",
    content: "Collection de photos familiales de Badara Gabar Diop",
    date: "Archives familiales",
    images: [
      "/images/archive-whatsapp/badara-gabar-diop/WhatsApp Image 2025-10-19 at 09.05.36 (1).jpeg",
      "/images/archive-whatsapp/badara-gabar-diop/WhatsApp Image 2025-10-19 at 09.08.32 (2).jpeg",
      "/images/archive-whatsapp/badara-gabar-diop/WhatsApp Image 2025-10-19 at 09.08.32 (4).jpeg",
      "/images/archive-whatsapp/badara-gabar-diop/WhatsApp Image 2025-10-19 at 09.08.32 (11).jpeg",
    ],
    image: "/images/archive-whatsapp/badara-gabar-diop/WhatsApp Image 2025-10-19 at 09.05.36 (1).jpeg"
  },
  {
    id: 12,
    person: "Amadou Bamba Diop (Badara)",
    category: ArchiveCategory.PHOTO,
    title: "Galerie Photos - Amadou Bamba Diop",
    content: "Collection de photos d'Amadou Bamba Diop, fils de Badara Gabar.",
    date: "Archives familiales",
    images: [
      "/images/archive-whatsapp/amadou-bamba-diop-badara/WhatsApp Image 2025-10-19 at 09.08.31 (1).jpeg",
      "/images/archive-whatsapp/amadou-bamba-diop-badara/WhatsApp Image 2025-10-19 at 09.08.32 (8).jpeg",
      "/images/archive-whatsapp/amadou-bamba-diop-badara/WhatsApp Image 2025-10-19 at 09.08.32 (9).jpeg",
      "/images/archive-whatsapp/amadou-bamba-diop-badara/WhatsApp Image 2025-10-19 at 09.08.32 (10).jpeg",
      "/images/archive-whatsapp/amadou-bamba-diop-badara/WhatsApp Image 2025-10-19 at 09.08.32 (14).jpeg",
    ],
    image: "/images/archive-whatsapp/amadou-bamba-diop-badara/WhatsApp Image 2025-10-19 at 09.08.31 (1).jpeg"
  },
  {
    id: 13,
    person: "Amadou Diop (Badara)",
    category: ArchiveCategory.PHOTO,
    title: "Galerie Photos - Amadou Diop",
    content: "Photos d'Amadou Diop de la lignée Badara.",
    date: "Archives familiales",
    images: [
      "/images/archive-whatsapp/amadou-diop-badara/WhatsApp Image 2025-10-19 at 09.05.36 (3).jpeg",
      "/images/archive-whatsapp/amadou-diop-badara/WhatsApp Image 2025-10-19 at 09.05.36 (5).jpeg",
      "/images/archive-whatsapp/amadou-diop-badara/WhatsApp Image 2025-10-19 at 09.08.32.jpeg",
    ],
    image: "/images/archive-whatsapp/amadou-diop-badara/WhatsApp Image 2025-10-19 at 09.05.36 (3).jpeg"
  },
  {
    id: 14,
    person: "Gabar Biram Médor Diop (Badara)",
    category: ArchiveCategory.PHOTO,
    title: "Portrait de Gabar Biram Médor Diop",
    content: "Photo de Gabar Biram Médor Diop, membre de la famille Diop.",
    date: "Archives familiales",
    image: "/images/archive-whatsapp/gabar-birame-medor-diop-badara/WhatsApp Image 2025-10-19 at 09.08.31 (2).jpeg"
  },
  {
    id: 15,
    person: "Famille Diop",
    category: ArchiveCategory.PHOTO,
    title: "Photos de Groupe - Rassemblements Familiaux",
    content: "Collection de photos de groupe capturant les moments précieux des rassemblements familiaux.",
    date: "Archives familiales",
    images: [
      "/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.05.36 (7).jpeg",
      "/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.05.36 (8).jpeg",
      "/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.08.31.jpeg",
      "/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.08.32 (1).jpeg",
      "/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.08.32 (5).jpeg",
      "/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.08.32 (7).jpeg",
      "/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.08.32 (12).jpeg",
    ],
    image: "/images/archive-whatsapp/photo-de-groupe/WhatsApp Image 2025-10-19 at 09.05.36 (7).jpeg"
  },
  {
    id: 16,
    person: "Ibrahima Gabar Diop",
    category: ArchiveCategory.PHOTO,
    title: "Photo de Ibrahima Gabar Diop",
    content: "Ibrahima Gabar Diop était un conseiller colonial élu du Sénégal dans les années 30. Il était membre de commissions administratives clés (agriculture, éducation, finances) et un défenseur actif des droits sociaux et professionnels des populations indigènes face à l'administration coloniale.",
    date: "XXXX",
    image: "/images/archive-whatsapp/ibrahima-gabar-diop-gabar/IMG-20211129-IbrahimaGabarDiop-Biram.jpg"
  },
  {
    id: 17,
    person: "Gabar Biram Médor Diop",
    category: ArchiveCategory.PHOTO,
    title: "Portrait de Gabar Biram Médor Diop",
    content: "Portrait de Gabar Biram Médor Diop conservé dans les archives familiales.",
    date: "Archives familiales",
    images: [
      "/images/famille/Gabar-biram-medor-diop/IMG_20260111_GabarBiramMedorDiop.jpg",
    ],
    image: "/images/famille/Gabar-biram-medor-diop/IMG_20260111_GabarBiramMedorDiop.jpg"
  },
  {
    id: 18,
    person: "Famille Diop",
    category: ArchiveCategory.PHOTO,
    title: "Regroupement de la famille Diop",
    content: "Rassemblement lors du mariage de Mame Njoboss, fille de Saliou Diop et petite fille de Badara Gabar Diop.",
    date: "07/01/2023",
    images: regroupementFamilleImages,
    image: regroupementFamilleImages[0] || "" // Image de couverture (la première trouvée)
  },
];