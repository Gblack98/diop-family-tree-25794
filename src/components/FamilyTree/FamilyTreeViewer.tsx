import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
    // --- MODE MOBILE (Format Badge) ---
    return {
      width,
      height,
      nodeWidth: 110,  // Assez large pour le nom, assez petit pour l'écran
      nodeHeight: 50,  // Hauteur minimale
      levelHeight: 100, // Distance entre générations
      coupleSpacing: 15,
      siblingSpacing: 20, 
    };
  }

  if (isTablet) {
    return {
      width,
      height,
      nodeWidth: 160,
      nodeHeight: 80,
      levelHeight: 180,
      coupleSpacing: 30,
      siblingSpacing: 40,
    };
  }

  // Desktop - Équilibre parfait : lisible mais sans débordement
  return {
    width,
    height,
    nodeWidth: 180,      // Taille confortable pour lire
    nodeHeight: 90,      // Hauteur adaptée
    levelHeight: 160,    // Espacement vertical équilibré
    coupleSpacing: 35,   // Espace entre conjoints
    siblingSpacing: 45,  // Espace entre frères/sœurs
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
  const [isPersonInfoVisible, setIsPersonInfoVisible] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const isFocusHandled = useRef(false);

  const updateTree = useCallback(() => {
    if (engine.updateDimensions) {
       engine.updateDimensions(dimensions);
    }
    // Sécurité : On s'assure que le moteur est en mode vertical
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

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setDimensions(getResponsiveDimensions());
      }, 200); // Debounce resize events by 200ms
    };

    window.addEventListener("resize", handleResize);

    // Centrage initial au chargement
    setTimeout(() => {
        setDimensions(getResponsiveDimensions());
        if ((window as any).__treeReset) (window as any).__treeReset();
    }, 300);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
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

  const handleNodeClick = useCallback((person: PersonNode) => {
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

    // Petit recentrage doux
    setTimeout(() => {
       if ((window as any).__treeCenterOnNode) (window as any).__treeCenterOnNode(person);
    }, 300);
  }, [selectedPerson, engine, updateTree]);

  const handleSearchSelect = useCallback((person: PersonNode) => {
    isFocusHandled.current = true;
    engine.expandToRoot(person);
    updateTree();
    setSelectedPerson(person);
    setIsPersonInfoVisible(true);
    setTimeout(() => {
      if ((window as any).__treeCenterOnNode) (window as any).__treeCenterOnNode(person);
    }, 100);
  }, [engine, updateTree]);

  const handleModeChange = useCallback((mode: ViewMode) => {
    setCurrentMode(mode);
    if (mode === "tree") {
      setSelectedPerson(null);
      setSelectedPerson2(null);
      setIsModePanelOpen(false);
       setTimeout(() => {
         if ((window as any).__treeReset) (window as any).__treeReset();
       }, 100);
    } else {
      setIsModePanelOpen(true);
    }
  }, []);

  const handleToggleExpand = useCallback((person: PersonNode) => {
    engine.toggleExpand(person);
    updateTree();
    setSelectedPerson(person);
    setIsPersonInfoVisible(true);
  }, [engine, updateTree]);

  const handleModeApply = useCallback((person1?: PersonNode, person2?: PersonNode) => {
    if (person1) {
      setSelectedPerson(person1);
      setSelectedPerson2(person2 || null);
      setIsModePanelOpen(false);
      setTimeout(() => {
        if ((window as any).__treeFit) (window as any).__treeFit();
      }, 100);
    }
  }, []);

  const handleModeCancel = useCallback(() => {
    setCurrentMode("tree");
    setSelectedPerson(null);
    setSelectedPerson2(null);
    setIsModePanelOpen(false);
  }, []);

  const handleModePanelClose = useCallback(() => {
    setIsModePanelOpen(false);
    if (currentMode !== "tree" && !selectedPerson) {
      setCurrentMode("tree");
    }
  }, [currentMode, selectedPerson]);

  const handleReset = useCallback(() => {
    if ((window as any).__treeReset) (window as any).__treeReset();
  }, []);

  const handleFit = useCallback(() => {
    if ((window as any).__treeFit) (window as any).__treeFit();
  }, []);

  const handleExport = useCallback((format: 'png' | 'pdf') => {
    if ((window as any).__treeExport) (window as any).__treeExport(format);
  }, []);

  const generations = useMemo(
    () => new Set(allPersons.map((p) => p.level)).size,
    [allPersons]
  );

  const links = useMemo(
    () => engine.getLinks(),
    [visiblePersons] // eslint-disable-line react-hooks/exhaustive-deps
  );

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
          links={links}
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