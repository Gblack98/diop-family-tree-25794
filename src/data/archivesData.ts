export interface Archive {
  id: number;
  person: string;
  category: "biography" | "photo" | "document" | "quote" | "article";
  title: string;
  content: string;
  fullContent?: string;
  date: string;
  image?: string;
  achievements?: string[];
}

export const archivesData: Archive[] = [
  {
    id: 1,
    person: "Charles Médor Diop",
    category: "biography",
    title: "Biographie de Charles Médor Diop",
    content: "Né en 1920 à Dakar, Charles Médor Diop fut un pionnier de l'éducation au Sénégal. Diplômé de l'École Normale Supérieure, il a consacré sa vie à former des générations d'enseignants. Son engagement pour l'accès universel à l'éducation a marqué l'histoire de notre famille.",
    fullContent: "Né en 1920 à Dakar dans une famille modeste, Charles Médor Diop a très tôt montré un talent exceptionnel pour les études. Grâce à une bourse, il intègre l'École Normale Supérieure où il excelle dans toutes les disciplines. Après son diplôme en 1945, il refuse plusieurs offres prestigieuses pour retourner au Sénégal et se consacrer à l'éducation des jeunes. Il fonde plusieurs écoles dans les zones rurales et forme des centaines d'enseignants. Son héritage perdure aujourd'hui à travers les nombreuses institutions qu'il a créées.",
    date: "1920-1985",
    image: "/images/archives/charles-medor-diop.jpg",
    achievements: ["Fondateur de 5 écoles", "Formateur de 500+ enseignants", "Décoré de l'Ordre National du Mérite"]
  },
  {
    id: 2,
    person: "Daro Wade",
    category: "photo",
    title: "Portrait de famille - 1965",
    content: "Rassemblement familial à Saint-Louis lors de la Tabaski. Une journée mémorable réunissant trois générations.",
    date: "1965",
    image: "/images/archives/famille-1965.jpg"
  },
  {
    id: 3,
    person: "Gabar Biram Médor Diop",
    category: "document",
    title: "Diplôme de Médecine",
    content: "Université de Dakar - Faculté de Médecine. Premier médecin de la famille Diop.",
    fullContent: "Diplôme de Docteur en Médecine obtenu avec mention Très Bien. Mamadou Diop s'est spécialisé en pédiatrie et a ouvert le premier cabinet pédiatrique dans sa région natale.",
    date: "1972",
    image: "/images/archives/diplome-medecine.jpg"
  },
  {
    id: 4,
    person: "Alioune Badara Gabar Diop",
    category: "quote",
    title: "Sur l'héritage familial",
    content: "L'éducation est l'arme la plus puissante que vous puissiez utiliser pour changer le monde. C'est ce que mon père m'a appris, et c'est ce que j'ai transmis à mes enfants.",
    date: "1998",
  },
  {
    id: 5,
    person: "Ibrahima Gabar Diop",
    category: "article",
    title: "Article de presse - Le Soleil",
    content: "Reconnaissance nationale pour son œuvre philanthropique. Ibrahima Gabar Diop a fondé trois écoles dans les zones rurales du Sénégal.",
    fullContent: "Le philanthrope Ibrahima Gabar Diop a reçu hier la médaille d'honneur de la République pour son action exceptionnelle dans le domaine de l'éducation. En 20 ans, il a fondé trois écoles permettant à des centaines d'enfants d'accéder à l'éducation dans des zones reculées.",
    date: "2005",
    image: "/images/archives/article-presse.jpg"
  },
  {
    id: 6,
    person: "Amadou Bamba Diop",
    category: "photo",
    title: "Photo de Amadou Bamba Diop - XXXX",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    date: "XXXX",
    image: "/images/archives/amadou-bamba-diop.jpg"
  },
  {
    id: 7,
    person: "El Hadj Malick Ndiaye",
    category: "biography",
    title: "Parcours d'El Hadj Malick Ndiaye",
    content: "Ingénieur brillant, El Hadj Malick Ndiaye a contribué au développement des infrastructures modernes au Sénégal.",
    fullContent: "Diplômé de l'École Polytechnique de Dakar en 1990, El Hadj Malick Ndiaye s'est illustré dans la conception et la réalisation de nombreux projets d'infrastructure. Son expertise a été sollicitée pour des projets majeurs à travers toute l'Afrique de l'Ouest.",
    date: "1965-présent",
    achievements: ["Diplômé Polytechnique", "15+ projets d'infrastructure", "Expert consultant international"]
  },
  {
    id: 8,
    person: "Marième Diop",
    category: "quote",
    title: "Sur la solidarité familiale",
    content: "Dans notre famille, nous avons toujours su que notre force réside dans notre unité. Chaque succès individuel est une victoire collective.",
    date: "2010",
  },
  {
    id: 9,
    person: "Amadou Diop",
    category: "document",
    title: "Acte de naissance - 1895",
    content: "Document historique attestant de la naissance d'Amadou Diop, l'un des plus anciens membres documentés de notre lignée.",
    date: "1895",
    image: "/images/archives/acte-naissance-1895.jpg"
  },
    {
    id: 10,
    person: "Magatte Diop",
    category: "photo",
    title: "Photo de Magatte Diop - XXXX",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    date: "XXXX",
    image: "/images/archives/magatte-diop.jpg"
  },
];
