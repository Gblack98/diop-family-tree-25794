import { useState, useEffect, useCallback, useRef } from "react";
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

const getResponsiveDimensions = (): TreeDimensions => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  if (isMobile) {
    // --- MODE MICRO (Le retour) ---
    // C'est la configuration la plus optimisée pour la densité
    return {
      width,
      height,
      nodeWidth: 100,  // Largeur minime (100px)
      nodeHeight: 50,  // Hauteur minime (50px)
      levelHeight: 90, // Générations très serrées
      coupleSpacing: 10,
      siblingSpacing: 15, 
    };
  }

  if (isTablet) {
    return {
      width,
      height,
      nodeWidth: 160,
      nodeHeight: 90,
      levelHeight: 180,
      coupleSpacing: 30,
      siblingSpacing: 40,
    };
  }

  // Desktop
  return {
    width,
    height,
    nodeWidth: 240,
    nodeHeight: 120,
    levelHeight: 240,
    coupleSpacing: 60,
    siblingSpacing: 70,
  };
};

export const FamilyTreeViewer = () => {
  const [dimensions, setDimensions] = useState(getResponsiveDimensions());
  // Note: On n'utilise plus "orientation" dans le state, retour au standard
  const [engine] = useState(() => new FamilyTreeEngine(familyData, dimensions));
  
  const [currentMode, setCurrentMode] = useState<ViewMode>("tree");
  const [selectedPerson, setSelectedPerson] = useState<PersonNode | null>(null);
  const [selectedPerson2, setSelectedPerson2] = useState<PersonNode | null>(null);
  const [visiblePersons, setVisiblePersons] = useState<PersonNode[]>([]);
  const [allPersons, setAllPersons] = useState<PersonNode[]>([]);
  const [isModePanelOpen, setIsModePanelOpen] = useState(false);
  const [isPersonInfoVisible, setIsPersonInfoVisible] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const isFocusHandled = useRef(false);

  const updateTree = useCallback(() => {
    // On met à jour uniquement les dimensions standard
    if (engine.updateDimensions) {
       engine.updateDimensions(dimensions);
    }
    // Si l'ancienne méthode setOrientation existe encore, on la remet à vertical par sécurité
    if ((engine as any).setOrientation) {
        (engine as any).setOrientation("vertical");
    }

    engine.updateVisibility(currentMode, selectedPerson || undefined, selectedPerson2 || undefined);
    engine.calculatePositions();
    setVisiblePersons([...engine.getVisiblePersons()]);
  }, [engine, currentMode, selectedPerson, selectedPerson2, dimensions]);

  useEffect(() => {
    engine.initializeExpanded(3);
    setAllPersons(engine.getAllPersons());

    const handleResize = () => {
      setDimensions(getResponsiveDimensions());
    };

    window.addEventListener("resize", handleResize);
    
    // Centrage initial
    setTimeout(() => {
        handleResize();
        if ((window as any).__treeReset) (window as any).__treeReset();
    }, 200);

    return () => window.removeEventListener("resize", handleResize);
  }, [engine]);

  useEffect(() => {
    updateTree();
  }, [updateTree]);

  // Gestion Focus URL
  useEffect(() => {
    const focusName = searchParams.get("focus");
    if (focusName && allPersons.length > 0 && !isFocusHandled.current) {
      const targetPerson = allPersons.find(
        p => p.name.toLowerCase() === focusName.toLowerCase()
      );

      if (targetPerson) {
        isFocusHandled.current = true;
        setTimeout(() => {
            engine.expandToRoot(targetPerson);
            updateTree();
            setSelectedPerson(targetPerson);
            setIsPersonInfoVisible(true);
            if ((window as any).__treeCenterOnNode) {
              (window as any).__treeCenterOnNode(targetPerson);
            }
            setSearchParams({}, { replace: true });
        }, 500);
      }
    }
  }, [allPersons, searchParams, engine, updateTree, setSearchParams]);

  const handleNodeClick = (person: PersonNode) => {
    isFocusHandled.current = true;
    if (selectedPerson?.name === person.name && person.enfants.length > 0) {
      engine.toggleExpand(person);
      updateTree();
    } 
    else if (selectedPerson?.name !== person.name && person.enfants.length > 0 && !person.expanded) {
      setSelectedPerson(person);
      setIsPersonInfoVisible(true);
      engine.toggleExpand(person);
      updateTree();
    }
    else {
      setSelectedPerson(person);
      setIsPersonInfoVisible(true);
    }
    // Petit centrage doux
    setTimeout(() => {
       if ((window as any).__treeCenterOnNode) (window as any).__treeCenterOnNode(person);
    }, 300);
  };

  const handleSearchSelect = (person: PersonNode) => {
    isFocusHandled.current = true;
    engine.expandToRoot(person);
    updateTree();
    setSelectedPerson(person);
    setIsPersonInfoVisible(true);
    setTimeout(() => {
      if ((window as any).__treeCenterOnNode) (window as any).__treeCenterOnNode(person);
    }, 100);
  };

  const handleModeChange = (mode: ViewMode) => {
    setCurrentMode(mode);
    if (mode === "tree") {
      setSelectedPerson(null);
      setSelectedPerson2(null);
      setIsModePanelOpen(false);
       setTimeout(() => handleReset(), 100);
    } else {
      setIsModePanelOpen(true);
    }
  };

  const handleToggleExpand = (person: PersonNode) => {
    engine.toggleExpand(person);
    updateTree();
    setSelectedPerson(person); 
    setIsPersonInfoVisible(true); 
  };

  const handleModeApply = (person1?: PersonNode, person2?: PersonNode) => {
    if (person1) {
      setSelectedPerson(person1);
      setSelectedPerson2(person2 || null);
      setIsModePanelOpen(false);
      setTimeout(() => handleFit(), 100);
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

  const handleReset = () => { if ((window as any).__treeReset) (window as any).__treeReset(); };
  const handleFit = () => { if ((window as any).__treeFit) (window as any).__treeFit(); };
  const handleExport = (format: 'png' | 'pdf') => { if ((window as any).__treeExport) (window as any).__treeExport(format); };

  const generations = new Set(allPersons.map((p) => p.level)).size;

  return (
    <div className="h-dvh w-dvw overflow-hidden bg-background font-sans relative">
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

      <main className="w-full h-full pt-[60px] pb-0">
        <FamilyTreeCanvas
          persons={visiblePersons}
          links={engine.getLinks()}
          dimensions={dimensions}
          selectedPerson={selectedPerson}
          onNodeClick={handleNodeClick}
          onReset={handleReset}
          onFitToScreen={handleFit}
          // Plus besoin de passer "orientation" ici, ça causait l'erreur
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