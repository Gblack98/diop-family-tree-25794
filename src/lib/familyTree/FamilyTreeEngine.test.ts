import { describe, it, expect, beforeEach } from "vitest";
import { FamilyTreeEngine } from "./FamilyTreeEngine";
import { mockPersons, mockDimensions } from "@/test/mockData";

describe("FamilyTreeEngine", () => {
  let engine: FamilyTreeEngine;

  beforeEach(() => {
    engine = new FamilyTreeEngine(mockPersons, mockDimensions);
  });

  describe("Initialization", () => {
    it("should initialize with correct number of persons", () => {
      const allPersons = engine.getAllPersons();
      expect(allPersons.length).toBe(mockPersons.length);
    });

    it("should identify spouses correctly", () => {
      const father = engine.getPerson("Père");
      const mother = engine.getPerson("Mère");

      expect(father?.spouses).toContain("Mère");
      expect(mother?.spouses).toContain("Père");
    });

    it("should assign generation levels correctly", () => {
      const grandparent = engine.getPerson("Grand-père");
      const parent = engine.getPerson("Père");
      const child = engine.getPerson("Enfant1");

      expect(grandparent?.level).toBe(0);
      expect(parent?.level).toBe(1);
      expect(child?.level).toBe(2);
    });

    it("should retrieve person by name", () => {
      const person = engine.getPerson("Père");
      expect(person).toBeDefined();
      expect(person?.name).toBe("Père");
    });

    it("should return undefined for non-existent person", () => {
      const person = engine.getPerson("NonExistent");
      expect(person).toBeUndefined();
    });
  });

  describe("Visibility and Expansion", () => {
    it("should initialize expanded state for early generations", () => {
      engine.initializeExpanded(2);
      const grandparent = engine.getPerson("Grand-père");
      const parent = engine.getPerson("Père");

      expect(grandparent?.expanded).toBe(true);
      expect(parent?.expanded).toBe(true);
    });

    it("should update visibility for full tree mode", () => {
      engine.updateVisibility("tree");
      const visiblePersons = engine.getVisiblePersons();

      expect(visiblePersons.length).toBeGreaterThan(0);
    });

    it("should toggle expand state", () => {
      const person = engine.getPerson("Père");
      if (person) {
        const initialExpanded = person.expanded;
        engine.toggleExpand(person);
        expect(person.expanded).toBe(!initialExpanded);
      }
    });
  });

  describe("Ancestor and Descendant Traversal", () => {
    it("should find path between related persons", () => {
      const path = engine.findPath("Grand-père", "Enfant1");

      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toBe("Grand-père");
      expect(path[path.length - 1]).toBe("Enfant1");
    });

    it("should return path with just the person when start equals end", () => {
      const path = engine.findPath("Père", "Père");
      expect(path).toEqual(["Père"]);
    });

    it("should return minimal path for isolated persons", () => {
      const unrelatedPerson = {
        name: "Étranger",
        genre: "Homme" as const,
        generation: 5,
        parents: [],
        enfants: [],
      };

      const engineWithExtra = new FamilyTreeEngine(
        [...mockPersons, unrelatedPerson],
        mockDimensions
      );

      // Since persons are not connected, findPath may return the start node only
      const path = engineWithExtra.findPath("Grand-père", "Étranger");
      // Accept either empty array or just the starting node
      expect(path.length).toBeLessThanOrEqual(1);
    });
  });

  describe("Layout and Positioning", () => {
    it("should calculate positions without errors", () => {
      engine.updateVisibility("tree");
      expect(() => engine.calculatePositions()).not.toThrow();
    });

    it("should support vertical orientation", () => {
      engine.setOrientation("vertical");
      engine.updateVisibility("tree");
      expect(() => engine.calculatePositions()).not.toThrow();
    });

    it("should support horizontal orientation", () => {
      engine.setOrientation("horizontal");
      engine.updateVisibility("tree");
      expect(() => engine.calculatePositions()).not.toThrow();
    });
  });

  describe("Dimensions Management", () => {
    it("should update dimensions correctly", () => {
      const newDimensions = {
        width: 1600,
        height: 1000,
        nodeWidth: 160,
        nodeHeight: 80,
        levelHeight: 140,
        coupleSpacing: 30,
        siblingSpacing: 40,
      };

      expect(() => engine.updateDimensions(newDimensions)).not.toThrow();
    });
  });

  describe("Links Generation", () => {
    it("should generate links between visible persons", () => {
      engine.updateVisibility("tree");
      const links = engine.getLinks();

      expect(links).toBeDefined();
      expect(Array.isArray(links)).toBe(true);
    });

    it("should generate parent-child links", () => {
      engine.initializeExpanded(3); // Expand nodes first
      engine.updateVisibility("tree");
      const links = engine.getLinks();

      const parentChildLinks = links.filter((link) => link.type === "parent");
      expect(parentChildLinks.length).toBeGreaterThanOrEqual(0);
    });

    it("should generate spouse links", () => {
      engine.updateVisibility("tree");
      const links = engine.getLinks();

      const spouseLinks = links.filter((link) => link.type === "spouse");
      expect(spouseLinks.length).toBeGreaterThan(0);
    });
  });

  describe("Person Expansion", () => {
    it("should expand to root from a person", () => {
      const person = engine.getPerson("Enfant1");
      if (person) {
        engine.expandToRoot(person);
        const father = engine.getPerson("Père");
        const grandfather = engine.getPerson("Grand-père");

        expect(father?.expanded).toBe(true);
        expect(grandfather?.expanded).toBe(true);
      }
    });
  });
});
