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

      // Ne pas auto-expand les familles nombreuses (8+ enfants)
      // Elles s'ouvriront dans un modal séparé
      const isLargeFamily = person.enfants.length >= 8;
      if (!isLargeFamily) {
        person.expanded = true;
      }

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
    // Make all parents visible first (single pass)
    person.parents.forEach((parentName) => {
      const parent = this.personMap.get(parentName);
      if (parent) {
        parent.visible = true;
      }
    });
    // Then recurse on each parent
    person.parents.forEach((parentName) => {
      const parent = this.personMap.get(parentName);
      if (parent) {
        this.showAncestors(parent);
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
      const neighbors = [...person.parents, ...person.enfants, ...person.spouses];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parentMap.set(neighbor, current);
          queue.push(neighbor);
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
        // Stack all spouses vertically to save horizontal space
        const stackHeight = this.dimensions.nodeHeight + 5; // ULTRA compact vertical spacing

        if (this.orientation === "vertical") {
          // VERTICAL MODE: Stack spouses vertically
          const centerY = level * this.dimensions.levelHeight;
          const totalHeight = group.people.length * stackHeight;
          const startY = centerY - (totalHeight / 2) + (stackHeight / 2);

          group.people.forEach((person, index) => {
            person.x = currentSpread;
            person.y = startY + (index * stackHeight);
          });

          currentSpread += this.dimensions.nodeWidth + dynamicSiblingSpacing;
        } else {
          // HORIZONTAL MODE: Keep vertical stacking
          const levelX = level * this.dimensions.levelHeight;

          group.people.forEach((person, index) => {
            person.x = levelX;
            person.y = currentSpread + (index * stackHeight);
          });

          currentSpread += (group.people.length * stackHeight) + dynamicCoupleSpacing;
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
    const visiblePersons = this.getVisiblePersons();

    visiblePersons.forEach((person) => {
      // Parent -> Enfant UNIQUEMENT
      // On ne dessine PAS les liens entre conjoints pour éviter l'encombrement
      // L'empilement vertical montre déjà les relations conjugales
      person.enfants.forEach((childName) => {
        const child = this.personMap.get(childName);
        if (child && child.visible) {
          links.push({ source: person, target: child, type: "parent" });
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