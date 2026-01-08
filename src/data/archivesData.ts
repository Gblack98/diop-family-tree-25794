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

export const archivesData: Archive[] = [
  {
    id: 1,
    person: "Ibrahima Gabar Diop (Badara)",
    category: ArchiveCategory.BIOGRAPHY,
    title: "Général de Division Ibrahima Gabar Diop",
    content: "Général de division de l'armée sénégalaise, né en 1963. Une carrière militaire exemplaire au service de la nation.",
    fullContent: `Le Général de Division Ibrahima Gabar Diop, dit "Badara", est une figure emblématique de l'armée sénégalaise. Né en 1963, il a consacré sa vie au service de la nation avec honneur et distinction.

**Carrière Militaire**

Sa carrière militaire s'étend sur plus de quatre décennies, marquée par des postes de haute responsabilité et une expertise reconnue dans la sécurité et la défense nationale.

**Postes Stratégiques**

- **Directeur Général de l'Agence Nationale de la Prévention et de la Surveillance (ANNPS)** : À ce poste crucial, il a dirigé les stratégies de prévention et de surveillance au niveau national, contribuant significativement à la sécurité du Sénégal.

- **Commandant Militaire du Président (CEMP)** : En tant que Commandant d'État-Major Particulier du Président de la République, il a assuré la sécurité rapprochée du Chef de l'État, démontrant la confiance placée en lui par les plus hautes autorités.

- **Commandant du Groupement National des Sapeurs-Pompiers (GNSP)** : À la tête du GNSP, il a modernisé et professionnalisé ce corps essentiel, améliorant considérablement la capacité de réponse aux urgences au Sénégal.

**Leadership et Vision**

Le Général Diop est reconnu pour son leadership éclairé, son intégrité et sa vision stratégique. Il a formé de nombreux officiers qui servent aujourd'hui dans les forces armées sénégalaises et a contribué au rayonnement de l'armée sénégalaise sur la scène internationale.

**Engagement Familial**

Au-delà de sa carrière militaire, le Général Ibrahima Gabar Diop reste profondément attaché aux valeurs familiales. Il perpétue l'héritage de ses ancêtres et transmet les traditions de la famille Diop aux nouvelles générations.

Son parcours exemplaire inspire respect et admiration, incarnant les valeurs de service, d'honneur et de dévouement à la patrie.`,
    date: "1963 - présent",
    images: [
      "/images/archives/ibrahima-gabar-diop.jpg",
    ],
    image: "/images/archives/ibrahima-gabar-diop.jpg",
    achievements: [
      "Général de Division de l'Armée Sénégalaise",
      "Directeur Général de l'ANNPS",
      "Commandant d'État-Major Particulier (CEMP) du Président",
      "Commandant du Groupement National des Sapeurs-Pompiers"
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
    fullContent: "Diplôme de Docteur en Médecine obtenu avec mention Très Bien. Mamadou Diop s'est spécialisé en pédiatrie et a ouvert le premier cabinet pédiatrique dans sa région natale.",
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
    content: "Ingénieur brillant, El Hadj Malick Ndiaye a contribué au développement des infrastructures modernes au Sénégal.",
    fullContent: "Diplômé de l'École Polytechnique de Dakar en 1990, El Hadj Malick Ndiaye s'est illustré dans la conception et la réalisation de nombreux projets d'infrastructure. Son expertise a été sollicitée pour des projets majeurs à travers toute l'Afrique de l'Ouest.",
    date: "1965-présent",
    achievements: ["Diplômé Polytechnique", "15+ projets d'infrastructure", "Expert consultant international"]
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
    category: ArchiveCategory.PHOTO,
    title: "Photo de Magatte Diop",
    content: "Portrait conservé précieusement.",
    date: "XXXX",
    image: "/images/archives/magatte-diop.jpg"
  },
  {
    id: 11,
    person: "Badara Gabar Diop",
    category: ArchiveCategory.PHOTO,
    title: "Galerie Photos - Badara Gabar Diop",
    content: "Collection de photos familiales de Badara Gabar Diop, fondateur de la lignée.",
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
];