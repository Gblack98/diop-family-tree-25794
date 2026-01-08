import { Person, TreeDimensions } from "@/lib/familyTree/types";

/**
 * Mock family data for testing purposes
 * Simple family structure: Grandparents -> Parents -> Children
 */
export const mockPersons: Person[] = [
  {
    name: "Grand-père",
    genre: "Homme",
    generation: 0,
    parents: [],
    enfants: ["Père"],
  },
  {
    name: "Grand-mère",
    genre: "Femme",
    generation: 0,
    parents: [],
    enfants: ["Père"],
  },
  {
    name: "Père",
    genre: "Homme",
    generation: 1,
    parents: ["Grand-père", "Grand-mère"],
    enfants: ["Enfant1", "Enfant2"],
  },
  {
    name: "Mère",
    genre: "Femme",
    generation: 1,
    parents: [],
    enfants: ["Enfant1", "Enfant2"],
  },
  {
    name: "Enfant1",
    genre: "Homme",
    generation: 2,
    parents: ["Père", "Mère"],
    enfants: [],
  },
  {
    name: "Enfant2",
    genre: "Femme",
    generation: 2,
    parents: ["Père", "Mère"],
    enfants: [],
  },
];

/**
 * Mock tree dimensions for testing
 */
export const mockDimensions: TreeDimensions = {
  width: 1200,
  height: 800,
  nodeWidth: 240,
  nodeHeight: 120,
  levelHeight: 220,
  coupleSpacing: 40,
  siblingSpacing: 50,
};
