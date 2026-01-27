export interface Person {
  name: string;
  genre: "Homme" | "Femme";
  generation: number;
  parents: string[];
  enfants: string[];
}

export interface PersonNode extends Person {
  level: number;
  x: number;
  y: number;
  spouses: string[];
  expanded: boolean;
  visible: boolean;
  isExternalSpouse?: boolean; // Conjoint sans ascendants dans l'arbre (sauf génération 0)
  isInDirectLine?: boolean; // Marqueur pour les ancêtres directs dans la vue Ancestors
  highlightLevel?: number; // Niveau de surbrillance dans la vue Path (0 = début, max = fin)
}

export interface TreeLink {
  source: PersonNode;
  target: PersonNode;
  type: "parent" | "spouse";
}

export type ViewMode = "tree" | "ancestors" | "descendants" | "path";

export interface TreeDimensions {
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
  levelHeight: number;
  coupleSpacing: number;
  siblingSpacing: number;
}
