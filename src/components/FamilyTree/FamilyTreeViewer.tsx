import { useState, useEffect, useCallback } from "react";
import { Header } from "./Header";
import { PersonInfoPanel } from "./PersonInfoPanel";
import { Legend } from "./Legend";
import { ModePanel } from "./ModePanel";
import { FamilyTreeCanvas } from "./FamilyTreeCanvas";
import { Dedication } from "./Dedication";
import { FamilyTreeEngine } from "@/lib/familyTree/FamilyTreeEngine";
import { familyData } from "@/lib/familyTree/data";
import { ViewMode, PersonNode, TreeDimensions } from "@/lib/familyTree/types";

// Enhanced responsive dimensions logic
const getResponsiveDimensions = (): TreeDimensions => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Progressively scale down sizes for smaller screens
  const scaleFactor = Math.min(1, width / 1280);

  const nodeWidth = Math.max(180, 240 * scaleFactor);
  const nodeHeight = Math.max(120, 150 * scaleFactor);
  const levelHeight = Math.max(220, 280 * scaleFactor);
  const coupleSpacing = Math.max(20, 50 * scaleFactor);
  const siblingSpacing = Math.max(40, 140 * scaleFactor);

  return {
    width: width,
    height: height, // Use full height for the canvas container
    nodeWidth,
    nodeHeight,
    levelHeight,
    coupleSpacing,
    siblingSpacing,
  };
};

export const FamilyTreeViewer = () => {
  const [dimensions, setDimensions] = useState(getResponsiveDimensions());
  const [engine] = useState(() => new FamilyTreeEngine(familyData, dimensions));
  
  const [currentMode, setCurrentMode] = useState<ViewMode>("tree");
  const [selectedPerson, setSelectedPerson] = useState<PersonNode | null>(null);
  const [selectedPerson2, setSelectedPerson2] = useState<PersonNode | null>(null);
  const [visiblePersons, setVisiblePersons] = useState<PersonNode[]>([]);
  const [allPersons, setAllPersons] = useState<PersonNode[]>([]);
  const [isModePanelOpen, setIsModePanelOpen] = useState(false);
  const [isPersonInfoVisible, setIsPersonInfoVisible] = useState(true);

  const updateTree = useCallback(() => {
    engine.updateVisibility(currentMode, selectedPerson || undefined, selectedPerson2 || undefined);
    engine.calculatePositions();
    setVisiblePersons([...engine.getVisiblePersons()]);
  }, [engine, currentMode, selectedPerson, selectedPerson2]);

  // Initial setup and resize handler
  useEffect(() => {
    engine.initializeExpanded(3);
    setAllPersons(engine.getAllPersons());

    const handleResize = () => {
      const newDims = getResponsiveDimensions();
      setDimensions(newDims);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener("resize", handleResize);
  }, [engine]);

  // Update tree whenever dependencies change
  useEffect(() => {
    updateTree();
  }, [updateTree]);


  const handleModeChange = (mode: ViewMode) => {
    setCurrentMode(mode);
    if (mode === "tree") {
      setSelectedPerson(null);
      setSelectedPerson2(null);
      setIsModePanelOpen(false);
       setTimeout(() => handleFit(), 100);
    } else {
      setIsModePanelOpen(true);
    }
  };

  const handleNodeClick = (person: PersonNode) => {
    // If clicking on the same person and they have children, toggle expansion
    if (selectedPerson?.name === person.name && person.enfants.length > 0) {
      engine.toggleExpand(person);
      updateTree();
      setTimeout(() => handleFit(), 550);
    } 
    // If clicking on a different person with hidden children, auto-expand
    else if (selectedPerson?.name !== person.name && person.enfants.length > 0 && !person.expanded) {
      setSelectedPerson(person);
      setIsPersonInfoVisible(true);
      engine.toggleExpand(person);
      updateTree();
      setTimeout(() => handleFit(), 550);
    }
    // Otherwise just select the person
    else {
      setSelectedPerson(person);
      setIsPersonInfoVisible(true);
    }
  };

  const handleSearchSelect = (person: PersonNode) => {
    engine.expandToRoot(person);
    updateTree();
    setSelectedPerson(person);
    setIsPersonInfoVisible(true);
    
    // Center view on the selected person
    setTimeout(() => {
      if ((window as any).__treeCenterOnNode) {
        (window as any).__treeCenterOnNode(person);
      }
    }, 100);
  };

  const handleToggleExpand = (person: PersonNode) => {
    engine.toggleExpand(person);
    updateTree();
    setSelectedPerson(person); // Keep the panel open on the same person
    setIsPersonInfoVisible(true);
     setTimeout(() => handleFit(), 550);
  };

  const handleModeApply = (person1?: PersonNode, person2?: PersonNode) => {
    if (person1) {
      setSelectedPerson(person1);
      setSelectedPerson2(person2 || null);
      setIsModePanelOpen(false);
      
      setTimeout(() => {
        handleFit();
      }, 100);
    }
  };

  const handleModeCancel = () => {
    setCurrentMode("tree");
    setSelectedPerson(null);
    setSelectedPerson2(null);
    setIsModePanelOpen(false);
  };

  const handleModePanelClose = () => {
    setIsModePanelOpen(false);
    if (currentMode !== "tree" && !selectedPerson) {
      setCurrentMode("tree");
    }
  };

  const handleReset = () => {
    if ((window as any).__treeReset) (window as any).__treeReset();
  };

  const handleFit = () => {
    if ((window as any).__treeFit) (window as any).__treeFit();
  };

  const handleExport = (format: 'png' | 'pdf') => {
    if ((window as any).__treeExport) (window as any).__treeExport(format);
  };

  const generations = new Set(allPersons.map((p) => p.level)).size;

  return (
    <div className="h-dvh w-dvw overflow-hidden bg-background font-sans">
      <Header
        totalMembers={allPersons.length}
        totalGenerations={generations}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onReset={handleReset}
        onFit={handleFit}
        onExport={handleExport}
        persons={allPersons}
        onSelectPerson={handleSearchSelect}
      />  

      <Dedication />

      <main className="w-full h-full">
        <FamilyTreeCanvas
          persons={visiblePersons}
          links={engine.getLinks()}
          dimensions={dimensions}
          selectedPerson={selectedPerson}
          onNodeClick={handleNodeClick}
          onReset={handleReset}
          onFitToScreen={handleFit}
        />
      </main>

      <PersonInfoPanel
        person={isPersonInfoVisible ? selectedPerson : null}
        onClose={() => setIsPersonInfoVisible(false)}
        onToggleExpand={handleToggleExpand}
      />

      <ModePanel
        mode={currentMode}
        isOpen={isModePanelOpen}
        persons={allPersons}
        onApply={handleModeApply}
        onCancel={handleModeCancel}
        onClose={handleModePanelClose}
      />

      <Legend />
    </div>
  );
};