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
    person: "Ibrahima Gabar Diop",
    category: ArchiveCategory.BIOGRAPHY,
    title: "Biographie d'Ibrahima Gabar Diop",
    content: "Né le 25 janvier 1947 à Dakar. Une vie dédiée au service public et à la famille.",
    fullContent: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    date: "1947-présent",
    // EXEMPLE MULTI-IMAGES (Carrousel)
    images: [
      "/images/archives/ibrahima-gabar-diop.jpg",
      // Ajoutez d'autres chemins d'images ici si vous en avez, ex: "/images/archives/ibrahima-jeune.jpg"
    ],
    image: "/images/archives/ibrahima-gabar-diop.jpg",
    achievements: ["Directeur Général de l’ANNPS", "CEMP du président de la République du Sénégal", "Commandant du GNSP"]
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
];