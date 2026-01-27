import { Person, PersonNode, TreeLink, ViewMode, TreeDimensions } from "./types";

export type TreeOrientation = "vertical" | "horizontal";

/**
 * FamilyTreeEngine - Core business logic engine for family tree operations
 *
 * This class manages all family tree data and provides methods for:
 * - Tree traversal (ancestors, descendants, pathfinding)
 * - Layout calculation (positioning nodes in 2D space)
 * - Visibility management (filtering nodes based on view modes)
 * - Relationship identification (spouses, children, parents)
 *
 * Performance optimizations:
 * - Uses Map data structures for O(1) lookups instead of O(n) array searches
 * - Pre-calculates spouse relationships during initialization
 * - Implements efficient BFS algorithm for pathfinding
 */
export class FamilyTreeEngine {
  /** Map of person names to PersonNode objects for O(1) access */
  private personMap: Map<string, PersonNode>;
  /** Original array of persons from data source */
  private allPersons: Person[];
  /** Current tree dimensions for layout calculations */
  private dimensions: TreeDimensions;
  /** Current orientation of the tree (vertical or horizontal) */
  private orientation: TreeOrientation = "vertical";

  /**
   * Initialize the family tree engine
   * @param persons - Array of all family members
   * @param dimensions - Tree layout dimensions
   */
  constructor(persons: Person[], dimensions: TreeDimensions) {
    this.allPersons = persons;
    this.dimensions = dimensions;
    this.personMap = new Map();
    this.buildPersonMap();
    this.identifySpouses();
  }

  public updateDimensions(dimensions: TreeDimensions) {
    this.dimensions = dimensions;
  }

  public setOrientation(orientation: TreeOrientation) {
    this.orientation = orientation;
  }

  private buildPersonMap() {
    this.allPersons.forEach((p) => {
      // Identifier si c'est un conjoint externe (sans ascendants, sauf génération 0)
      const hasAncestors = p.parents && p.parents.length > 0;
      const isRootGeneration = p.generation === 0;
      const isExternalSpouse = !hasAncestors && !isRootGeneration;

      this.personMap.set(p.name, {
        ...p,
        level: p.generation,
        x: 0,
        y: 0,
        spouses: [],
        expanded: false,
        visible: false,
        isExternalSpouse,
      });
    });
  }

  /**
   * Identify spouse relationships by analyzing children with multiple parents
   *
   * Algorithm:
   * 1. For each child with multiple parents, those parents are spouses
   * 2. Build a map of person -> set of spouses
   * 3. Apply the spouse relationships to all person nodes
   *
   * Time Complexity: O(n*p) where n=persons, p=max parents per person (typically 2)
   * Space Complexity: O(n)
   *
   * Example:
   *   If "Enfant" has parents ["Père", "Mère"]
   *   Then Père.spouses = ["Mère"] and Mère.spouses = ["Père"]
   */
  private identifySpouses() {
    // Optimized O(n) implementation - identify spouses by children with multiple parents
    const spouseMap = new Map<string, Set<string>>();

    // Single pass: find all children with multiple parents
    this.allPersons.forEach((person) => {
      if (person.parents && person.parents.length > 1) {
        // This person has multiple parents - they are spouses
        for (let i = 0; i < person.parents.length; i++) {
          const parent1 = person.parents[i];
          if (!spouseMap.has(parent1)) {
            spouseMap.set(parent1, new Set());
          }
          // Add all other parents as spouses
          for (let j = 0; j < person.parents.length; j++) {
            if (i !== j) {
              spouseMap.get(parent1)!.add(person.parents[j]);
            }
          }
        }
      }
    });

    // Apply spouse relationships to person nodes
    spouseMap.forEach((spouses, personName) => {
      const personNode = this.personMap.get(personName);
      if (personNode) {
        personNode.spouses = Array.from(spouses);
      }
    });
  }

  public initializeExpanded(maxGeneration: number = 3) {
    const roots = Array.from(this.personMap.values()).filter((p) => p.level === 0);
    const expandTo = (person: PersonNode, maxGen: number) => {
      if (person.level >= maxGen) return;
      person.expanded = true;
      person.enfants.forEach((childName) => {
        const child = this.personMap.get(childName);
        if (child) expandTo(child, maxGen);
      });
    };
    roots.forEach((root) => expandTo(root, maxGeneration));
  }

  public updateVisibility(
    mode: ViewMode,
    selectedPerson?: PersonNode,
    selectedPerson2?: PersonNode
  ) {
    // Réinitialiser toutes les propriétés de visibilité et de surbrillance
    this.personMap.forEach((p) => {
      p.visible = false;
      p.isInDirectLine = false;
      p.highlightLevel = undefined;
    });

    switch (mode) {
      case "ancestors":
        if (selectedPerson) this.showAncestors(selectedPerson);
        break;
      case "descendants":
        if (selectedPerson) this.showDescendants(selectedPerson);
        break;
      case "path":
        if (selectedPerson && selectedPerson2) {
          this.showPath(selectedPerson, selectedPerson2);
        }
        break;
      default:
        this.showTree();
    }
  }

  private showTree() {
    const roots = Array.from(this.personMap.values()).filter((p) => p.level === 0);
    const queue = [...roots];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const person = queue.shift()!;
      if (visited.has(person.name)) continue;
      visited.add(person.name);
      person.visible = true;

      // NOUVEAU: Exclure les conjoints sans ascendants de l'arbre principal
      // Ils seront affichés uniquement dans les pages dédiées
      person.spouses.forEach((spouseName) => {
        const spouse = this.personMap.get(spouseName);
        if (spouse && !visited.has(spouseName)) {
          // Afficher le conjoint UNIQUEMENT s'il a des parents dans l'arbre
          // OU s'il est de génération 0 (racines de l'arbre)
          const hasAncestors = spouse.parents && spouse.parents.length > 0;
          const isRootGeneration = spouse.level === 0;

          if (hasAncestors || isRootGeneration) {
            spouse.visible = true;
            visited.add(spouseName);
          }
        }
      });

      if (person.expanded || person.enfants.length === 0) {
        person.enfants.forEach((childName) => {
          const child = this.personMap.get(childName);
          if (child && !visited.has(childName)) {
            queue.push(child);
          }
        });
      }
    }
  }

  private showAncestors(person: PersonNode) {
    person.visible = true;
    person.isInDirectLine = true;

    // Remonter vers tous les parents (père et mère)
    // et continuer récursivement
    person.parents.forEach((parentName) => {
      const parent = this.personMap.get(parentName);
      if (parent) {
        this.showAncestors(parent);
      }
    });
  }

  private showDescendants(person: PersonNode) {
    person.visible = true;

    // Afficher tous les enfants et descendre récursivement
    person.enfants.forEach((childName) => {
      const child = this.personMap.get(childName);
      if (child) {
        // Afficher tous les parents de l'enfant (pour montrer le couple parental)
        // Cela garantit que les deux parents sont visibles si l'enfant est affiché
        child.parents.forEach((parentName) => {
          const parent = this.personMap.get(parentName);
          if (parent) {
            parent.visible = true;
          }
        });

        // Continuer la descente récursive
        this.showDescendants(child);
      }
    });
  }

  private showPath(person1: PersonNode, person2: PersonNode) {
    const path = this.findPath(person1.name, person2.name);

    if (path.length === 0 || (path.length === 1 && path[0] === person1.name)) {
      // Aucun chemin trouvé ou chemin vide
      // Afficher au moins les deux personnes
      person1.visible = true;
      person2.visible = true;
      return;
    }

    // Afficher chaque personne du chemin avec surbrillance progressive
    path.forEach((name, index) => {
      const person = this.personMap.get(name);
      if (person) {
        person.visible = true;
        person.highlightLevel = index; // Gradient 0, 1, 2, 3...
        person.isInDirectLine = true;

        // Afficher les conjoints UNIQUEMENT s'ils sont aussi dans le chemin
        // (pour les cas où le chemin passe par un mariage)
        const pathSet = new Set(path);
        person.spouses.forEach((spouseName) => {
          if (pathSet.has(spouseName)) {
            const spouse = this.personMap.get(spouseName);
            if (spouse) {
              spouse.visible = true;
              spouse.highlightLevel = path.indexOf(spouseName);
              spouse.isInDirectLine = true;
            }
          }
        });
      }
    });
  }

  /**
   * Find the shortest path between two persons using Breadth-First Search (BFS)
   *
   * Algorithm:
   * 1. Use BFS to explore all family relationships (parents, children, spouses)
   * 2. Track parent pointers to reconstruct the path
   * 3. Return the shortest path when destination is found
   *
   * Time Complexity: O(V + E) where V=vertices (persons), E=edges (relationships)
   * Space Complexity: O(V) for visited set and parent map
   *
   * Example:
   *   findPath("Grand-père", "Enfant") might return:
   *   ["Grand-père", "Père", "Enfant"]
   *
   * @param start - Name of the starting person
   * @param end - Name of the destination person
   * @returns Array of person names representing the path, or [start] if no path exists
   */
  private findPath(start: string, end: string): string[] {
    // Optimized BFS using parent pointers instead of array spreading
    const queue: string[] = [start];
    const visited = new Set([start]);
    const parentMap = new Map<string, string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === end) {
        // Reconstruct path from parent pointers
        const path: string[] = [];
        let node: string | undefined = end;
        while (node !== undefined) {
          path.unshift(node);
          node = parentMap.get(node);
        }
        return path;
      }

      const person = this.personMap.get(current)!;
      // Explore all relationships: parents, children, and spouses
      const neighbors = [...person.parents, ...person.enfants, ...person.spouses];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parentMap.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }
    // No path found - return just the start node
    return [start];
  }

  public calculatePositions() {
    const visiblePersons = Array.from(this.personMap.values()).filter((p) => p.visible);
    const levels: { [key: number]: PersonNode[] } = {};

    visiblePersons.forEach((p) => {
      if (!levels[p.level]) levels[p.level] = [];
      levels[p.level].push(p);
    });

    Object.keys(levels)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((levelKey) => {
        const levelPeople = levels[parseInt(levelKey)];
        this.arrangeLevelPeople(levelPeople, parseInt(levelKey));
      });
  }

  private arrangeLevelPeople(levelPeople: PersonNode[], level: number) {
    const arranged: { type: "single" | "couple"; people: PersonNode[] }[] = [];
    const used = new Set<string>();

    // Grouper les couples
    levelPeople.forEach((person) => {
      if (used.has(person.name)) return;

      let spouse: PersonNode | null = null;
      for (const spouseName of person.spouses) {
        const potentialSpouse = this.personMap.get(spouseName);
        if (potentialSpouse && levelPeople.find((p) => p.name === spouseName) && !used.has(spouseName)) {
           // On considère couple s'ils ont des enfants visibles ou juste mariés
           spouse = potentialSpouse;
           break;
        }
      }

      if (spouse) {
        // En mode horizontal, on met l'homme au-dessus (ou premier trouvé)
        arranged.push({ type: "couple", people: [person, spouse] });
        used.add(person.name);
        used.add(spouse.name);
      } else {
        arranged.push({ type: "single", people: [person] });
        used.add(person.name);
      }
    });

    let currentSpread = 0;

    arranged.forEach((group) => {
      if (group.type === "couple") {
        const [p1, p2] = group.people;
        
        if (this.orientation === "vertical") {
            // --- VERTICAL (Standard Desktop) ---
            p1.x = currentSpread;
            p2.x = currentSpread + this.dimensions.nodeWidth + this.dimensions.coupleSpacing;
            p1.y = level * this.dimensions.levelHeight;
            p2.y = level * this.dimensions.levelHeight;
            currentSpread += (this.dimensions.nodeWidth * 2) + this.dimensions.coupleSpacing + this.dimensions.siblingSpacing;
        } else {
            // --- HORIZONTAL (Mobile Optimisé) ---
            // On empile les époux verticalement pour gagner de la place en hauteur (Spread)
            // X devient le niveau (Profondeur)
            const levelX = level * this.dimensions.levelHeight; // Ecartement horizontal des générations

            p1.x = levelX;
            p1.y = currentSpread;
            
            // Le conjoint est juste en dessous, collé
            p2.x = levelX; 
            p2.y = currentSpread + this.dimensions.nodeHeight + 5; // +5px mini marge

            // On avance le curseur vertical (hauteur de 2 personnes + marge couple)
            currentSpread += (this.dimensions.nodeHeight * 2) + 5 + this.dimensions.coupleSpacing;
        }

      } else {
        const person = group.people[0];
        
        if (this.orientation === "vertical") {
            person.x = currentSpread;
            person.y = level * this.dimensions.levelHeight;
            currentSpread += this.dimensions.nodeWidth + this.dimensions.siblingSpacing;
        } else {
            // Horizontal Single
            person.x = level * this.dimensions.levelHeight;
            person.y = currentSpread;
            currentSpread += this.dimensions.nodeHeight + this.dimensions.siblingSpacing;
        }
      }
    });

    // Centrage du groupe pour qu'il soit joli
    const allPeople = arranged.flatMap((g) => g.people);
    if (allPeople.length > 0) {
      if (this.orientation === "vertical") {
          // Single pass to find both min and max
          let minX = allPeople[0].x;
          let maxX = allPeople[0].x;
          for (let i = 1; i < allPeople.length; i++) {
            if (allPeople[i].x < minX) minX = allPeople[i].x;
            if (allPeople[i].x > maxX) maxX = allPeople[i].x;
          }
          const offset = -(minX + maxX) / 2;
          allPeople.forEach((p) => (p.x += offset));
      } else {
          // Single pass to find both min and max
          let minY = allPeople[0].y;
          let maxY = allPeople[0].y;
          for (let i = 1; i < allPeople.length; i++) {
            if (allPeople[i].y < minY) minY = allPeople[i].y;
            if (allPeople[i].y > maxY) maxY = allPeople[i].y;
          }
          const offset = -(minY + maxY) / 2;
          allPeople.forEach((p) => (p.y += offset));
      }
    }
  }

  public getVisiblePersons(): PersonNode[] { return Array.from(this.personMap.values()).filter((p) => p.visible); }
  public getAllPersons(): PersonNode[] { return Array.from(this.personMap.values()); }

  public getLinks(): TreeLink[] {
    const links: TreeLink[] = [];
    const processedPairs = new Set<string>();
    const visiblePersons = this.getVisiblePersons();

    visiblePersons.forEach((person) => {
      // Parent -> Enfant
      person.enfants.forEach((childName) => {
        const child = this.personMap.get(childName);
        if (child && child.visible) {
          links.push({ source: person, target: child, type: "parent" });
        }
      });

      // Conjoint <-> Conjoint
      person.spouses.forEach((spouseName) => {
        const spouse = this.personMap.get(spouseName);
        if (spouse && spouse.visible) {
            const pair = [person.name, spouseName].sort().join("|");
            if (!processedPairs.has(pair)) {
              processedPairs.add(pair);
              links.push({ source: person, target: spouse, type: "spouse" });
            }
        }
      });
    });
    return links;
  }

  public getPerson(name: string): PersonNode | undefined { return this.personMap.get(name); }
  public toggleExpand(person: PersonNode) { person.expanded = !person.expanded; }
  
  public expandToRoot(person: PersonNode) {
    let current = person;
    while (current.parents.length > 0) {
      const parent = this.personMap.get(current.parents[0]);
      if (parent) { parent.expanded = true; current = parent; } else break;
    }
  }
}