import { Person, PersonNode, TreeLink, ViewMode, TreeDimensions } from "./types";

export type TreeOrientation = "vertical" | "horizontal";

export class FamilyTreeEngine {
  private personMap: Map<string, PersonNode>;
  private allPersons: Person[];
  private dimensions: TreeDimensions;
  private orientation: TreeOrientation = "vertical";

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
      const isLargeFamily = p.enfants.length >= 8;
      this.personMap.set(p.name, {
        ...p,
        level: p.generation,
        x: 0,
        y: 0,
        spouses: [],
        expanded: false,
        visible: false,
        isLargeFamily,
      });
    });
  }

  private identifySpouses() {
    this.allPersons.forEach((person) => {
      if (person.enfants && person.enfants.length > 0) {
        person.enfants.forEach((childName) => {
          const child = this.personMap.get(childName);
          if (child && child.parents && child.parents.length > 1) {
            child.parents.forEach((parentName) => {
              if (parentName !== person.name && this.personMap.has(parentName)) {
                const personNode = this.personMap.get(person.name)!;
                const parentNode = this.personMap.get(parentName)!;
                
                if (!personNode.spouses.includes(parentName)) {
                  personNode.spouses.push(parentName);
                }
                if (!parentNode.spouses.includes(person.name)) {
                  parentNode.spouses.push(person.name);
                }
              }
            });
          }
        });
      }
    });
  }

  public initializeExpanded(maxGeneration: number = 3) {
    const roots = Array.from(this.personMap.values()).filter((p) => p.level === 0);
    const expandTo = (person: PersonNode, maxGen: number) => {
      if (person.level >= maxGen) return;

      // Collapse intelligent : familles 15+ enfants restent collapsed
      // pour maintenir la lisibilité de l'arbre
      const isVeryLargeFamily = person.enfants.length >= 15;
      person.expanded = !isVeryLargeFamily;

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
    this.personMap.forEach((p) => (p.visible = false));

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

      person.spouses.forEach((spouseName) => {
        const spouse = this.personMap.get(spouseName);
        if (spouse && !visited.has(spouseName)) {
          spouse.visible = true;
          visited.add(spouseName);
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
    person.parents.forEach((parentName) => {
      const parent = this.personMap.get(parentName);
      if (parent) {
        parent.visible = true;
        this.showAncestors(parent);
        person.parents.forEach((otherParentName) => {
          if (otherParentName !== parentName) {
            const otherParent = this.personMap.get(otherParentName);
            if (otherParent) otherParent.visible = true;
          }
        });
      }
    });
  }

  private showDescendants(person: PersonNode) {
    person.visible = true;
    person.enfants.forEach((childName) => {
      const child = this.personMap.get(childName);
      if (child) {
        child.visible = true;
        child.parents.forEach((parentName) => {
          const parent = this.personMap.get(parentName);
          if (parent) parent.visible = true;
        });
        this.showDescendants(child);
      }
    });
  }

  private showPath(person1: PersonNode, person2: PersonNode) {
    const path = this.findPath(person1.name, person2.name);
    const pathSet = new Set(path);
    path.forEach((name) => {
      const person = this.personMap.get(name);
      if (person) {
        person.visible = true;
        person.spouses.forEach((spouseName) => {
          if (pathSet.has(spouseName)) {
            const spouse = this.personMap.get(spouseName);
            if (spouse) spouse.visible = true;
          }
        });
      }
    });
  }

  private findPath(start: string, end: string): string[] {
    const queue: string[][] = [[start]];
    const visited = new Set([start]);
    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];
      if (current === end) return path;
      const person = this.personMap.get(current)!;
      const neighbors = [...person.parents, ...person.enfants, ...person.spouses];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
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
    // Calculate dynamic spacing based on family size - MORE AGGRESSIVE
    const totalPeople = levelPeople.length;
    const densityFactor = Math.max(0.3, 1 - (totalPeople * 0.02)); // More aggressive reduction

    const dynamicSiblingSpacing = Math.max(10, this.dimensions.siblingSpacing * densityFactor);
    const dynamicCoupleSpacing = Math.max(5, this.dimensions.coupleSpacing * densityFactor);

    // Group people into family units (person + all their spouses as a vertical stack)
    const arranged: { type: "single" | "polygamous"; people: PersonNode[] }[] = [];
    const used = new Set<string>();

    levelPeople.forEach((person) => {
      if (used.has(person.name)) return;

      // Find ALL spouses at this level (for polygamous families)
      const spousesAtLevel: PersonNode[] = [];
      for (const spouseName of person.spouses) {
        const potentialSpouse = this.personMap.get(spouseName);
        if (potentialSpouse && levelPeople.find((p) => p.name === spouseName) && !used.has(spouseName)) {
          spousesAtLevel.push(potentialSpouse);
        }
      }

      if (spousesAtLevel.length > 0) {
        // Polygamous or monogamous - stack vertically
        arranged.push({ type: "polygamous", people: [person, ...spousesAtLevel] });
        used.add(person.name);
        spousesAtLevel.forEach(s => used.add(s.name));
      } else {
        arranged.push({ type: "single", people: [person] });
        used.add(person.name);
      }
    });

    let currentSpread = 0;

    arranged.forEach((group) => {
      if (group.type === "polygamous") {
        // Place couples HORIZONTALEMENT (côte à côte) comme demandé
        const [mainPerson, ...spouses] = group.people;

        if (this.orientation === "vertical") {
          // Premier conjoint (personne principale)
          mainPerson.x = currentSpread;
          mainPerson.y = level * this.dimensions.levelHeight;
          currentSpread += this.dimensions.nodeWidth + dynamicCoupleSpacing;

          // Autres conjoints côte à côte
          spouses.forEach((spouse) => {
            spouse.x = currentSpread;
            spouse.y = level * this.dimensions.levelHeight;
            currentSpread += this.dimensions.nodeWidth + dynamicCoupleSpacing;
          });

          // Ajouter l'espacement entre familles
          currentSpread += dynamicSiblingSpacing;
        } else {
          // Mode horizontal (pour mobile)
          const levelX = level * this.dimensions.levelHeight;
          mainPerson.x = levelX;
          mainPerson.y = currentSpread;
          currentSpread += this.dimensions.nodeHeight + dynamicCoupleSpacing;

          spouses.forEach((spouse) => {
            spouse.x = levelX;
            spouse.y = currentSpread;
            currentSpread += this.dimensions.nodeHeight + dynamicCoupleSpacing;
          });

          currentSpread += dynamicSiblingSpacing;
        }

      } else {
        // Single person
        const person = group.people[0];

        if (this.orientation === "vertical") {
          person.x = currentSpread;
          person.y = level * this.dimensions.levelHeight;
          currentSpread += this.dimensions.nodeWidth + dynamicSiblingSpacing;
        } else {
          person.x = level * this.dimensions.levelHeight;
          person.y = currentSpread;
          currentSpread += this.dimensions.nodeHeight + dynamicSiblingSpacing;
        }
      }
    });

    // Centrage du groupe pour qu'il soit joli
    const allPeople = arranged.flatMap((g) => g.people);
    if (allPeople.length > 0) {
      if (this.orientation === "vertical") {
          const minX = Math.min(...allPeople.map((p) => p.x));
          const maxX = Math.max(...allPeople.map((p) => p.x));
          const offset = -(minX + maxX) / 2;
          allPeople.forEach((p) => (p.x += offset));
      } else {
          const minY = Math.min(...allPeople.map((p) => p.y));
          const maxY = Math.max(...allPeople.map((p) => p.y));
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
      // Parent -> Enfant - TOUJOURS afficher ces liens
      person.enfants.forEach((childName) => {
        const child = this.personMap.get(childName);
        if (child && child.visible) {
          links.push({ source: person, target: child, type: "parent" });
        }
      });

      // Conjoint <-> Conjoint - Maintenant qu'ils sont côte à côte
      person.spouses.forEach((spouseName) => {
        const spouse = this.personMap.get(spouseName);
        if (spouse && spouse.visible) {
          const pair = person.name < spouseName ? `${person.name}|${spouseName}` : `${spouseName}|${person.name}`;
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