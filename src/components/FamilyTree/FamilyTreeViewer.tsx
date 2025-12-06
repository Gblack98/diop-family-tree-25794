import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "./Header";
import { PersonInfoPanel } from "./PersonInfoPanel";
import { Legend } from "./Legend";
import { ModePanel } from "./ModePanel";
import { FamilyTreeCanvas } from "./FamilyTreeCanvas";
import { Dedication } from "./Dedication";
import { FamilyTreeEngine } from "@/lib/familyTree/FamilyTreeEngine";
import { familyData } from "@/lib/familyTree/data";
import { ViewMode, PersonNode, TreeDimensions } from "@/lib/familyTree/types";

// NOUVELLE LOGIQUE RESPONSIVE (beaucoup plus compacte sur mobile)
const getResponsiveDimensions = (): TreeDimensions => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const isMobile = width < 768; // Tablette et moins
  const isSmallMobile = width < 480; // Smartphones

  if (isSmallMobile) {
    return {
      width,
      height,
      nodeWidth: 150, // Très compact
      nodeHeight: 90,
      levelHeight: 160,
      coupleSpacing: 20,
      siblingSpacing: 30,
    };
  }

  if (isMobile) {
    return {
      width,
      height,
      nodeWidth: 180,
      nodeHeight: 110,
      levelHeight: 200,
      coupleSpacing: 30,
      siblingSpacing: 50,
    };
  }

  // Desktop standard
  return {
    width,
    height,
    nodeWidth: 240,
    nodeHeight: 140,
    levelHeight: 260,
    coupleSpacing: 60,
    siblingSpacing: 80,
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

  const [searchParams] = useSearchParams();

  const updateTree = useCallback(() => {
    // IMPORTANT : On s'assure que l'engine a les bonnes dimensions avant de calculer
    engine.updateDimensions(dimensions);
    engine.updateVisibility(currentMode, selectedPerson || undefined, selectedPerson2 || undefined);
    engine.calculatePositions();
    setVisiblePersons([...engine.getVisiblePersons()]);
  }, [engine, currentMode, selectedPerson, selectedPerson2, dimensions]);

  // Initial setup and resize handler
  useEffect(() => {
    engine.initializeExpanded(3);
    setAllPersons(engine.getAllPersons());

    const handleResize = () => {
      const newDims = getResponsiveDimensions();
      setDimensions(newDims);
      // L'effet updateTree se déclenchera automatiquement car 'dimensions' change
    };

    window.addEventListener("resize", handleResize);
    
    // Appel initial pour caler le layout
    setTimeout(() => handleResize(), 100);

    return () => window.removeEventListener("resize", handleResize);
  }, [engine]);

  useEffect(() => {
    updateTree();
  }, [updateTree]);

  // Gestion du paramètre ?focus=Nom
  useEffect(() => {
    const focusName = searchParams.get("focus");
    if (focusName && allPersons.length > 0) {
      const targetPerson = allPersons.find(
        p => p.name.toLowerCase() === focusName.toLowerCase()
      );

      if (targetPerson) {
        setTimeout(() => {
            engine.expandToRoot(targetPerson);
            updateTree();
            setSelectedPerson(targetPerson);
            setIsPersonInfoVisible(true);
            
            if ((window as any).__treeCenterOnNode) {
              (window as any).__treeCenterOnNode(targetPerson);
            }
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }, 500);
      }
    }
  }, [allPersons, searchParams, engine, updateTree]);


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
    if (selectedPerson?.name === person.name && person.enfants.length > 0) {
      engine.toggleExpand(person);
      updateTree();
      setTimeout(() => handleFit(), 550);
    } 
    else if (selectedPerson?.name !== person.name && person.enfants.length > 0 && !person.expanded) {
      setSelectedPerson(person);
      setIsPersonInfoVisible(true);
      engine.toggleExpand(person);
      updateTree();
      setTimeout(() => handleFit(), 550);
    }
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
    
    setTimeout(() => {
      if ((window as any).__treeCenterOnNode) {
        (window as any).__treeCenterOnNode(person);
      }
    }, 100);
  };

  const handleToggleExpand = (person: PersonNode) => {
    engine.toggleExpand(person);
    updateTree();
    setSelectedPerson(person); 
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