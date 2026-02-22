import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "./Header";
import { PersonInfoPanel } from "./PersonInfoPanel";
import { Legend } from "./Legend";
import { ModePanel } from "./ModePanel";
import { FamilyTreeCanvas } from "./FamilyTreeCanvas";
import { Dedication } from "./Dedication";
import { Minimap } from "./Minimap";
import { FamilyTreeEngine } from "@/lib/familyTree/FamilyTreeEngine";
import { useFamilyData } from "@/hooks/useFamilyData";
import { usePersonPhotos } from "@/hooks/usePersonPhotos";
import { ViewMode, PersonNode, TreeDimensions } from "@/lib/familyTree/types";

const getResponsiveDimensions = (): TreeDimensions => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  if (isMobile) {
    return {
      width,
      height,
      nodeWidth: 105,
      nodeHeight: 48,
      levelHeight: 90,
      coupleSpacing: 12,
      siblingSpacing: 18,
    };
  }

  if (isTablet) {
    return {
      width,
      height,
      nodeWidth: 150,
      nodeHeight: 75,
      levelHeight: 160,
      coupleSpacing: 25,
      siblingSpacing: 35,
    };
  }

  return {
    width,
    height,
    nodeWidth: 175,
    nodeHeight: 88,
    levelHeight: 150,
    coupleSpacing: 32,
    siblingSpacing: 42,
  };
};

export const FamilyTreeViewer = () => {
  const [dimensions, setDimensions] = useState(getResponsiveDimensions());
  const { familyData } = useFamilyData();
  const photoMap = usePersonPhotos();

  const dataToUse = familyData;
  const [engine] = useState(() => new FamilyTreeEngine(dataToUse, getResponsiveDimensions()));

  useEffect(() => {
    if (engine?.updateDimensions) {
      engine.updateDimensions(dimensions);
    }
  }, [engine, dimensions]);

  const [currentMode, setCurrentMode] = useState<ViewMode>("tree");
  const [selectedPerson, setSelectedPerson] = useState<PersonNode | null>(null);
  const [selectedPerson2, setSelectedPerson2] = useState<PersonNode | null>(null);
  const [visiblePersons, setVisiblePersons] = useState<PersonNode[]>([]);
  const [allPersons, setAllPersons] = useState<PersonNode[]>([]);
  const [isModePanelOpen, setIsModePanelOpen] = useState(false);
  const [isPersonInfoVisible, setIsPersonInfoVisible] = useState(false);

  // Filtre par génération : null = tout afficher
  const [highlightedGenerations, setHighlightedGenerations] = useState<Set<number> | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const isFocusHandled = useRef(false);

  const updateTree = useCallback(() => {
    if (engine.updateDimensions) {
      engine.updateDimensions(dimensions);
    }
    engine.setOrientation("vertical");
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
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    setTimeout(() => {
      setDimensions(getResponsiveDimensions());
      if (window.__treeReset) window.__treeReset();
    }, 300);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [engine]);

  useEffect(() => {
    updateTree();
  }, [updateTree]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si le focus est dans un champ de saisie
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) return;

      switch (e.key) {
        case 'Escape':
          setIsPersonInfoVisible(false);
          break;
        case '+':
        case '=':
          e.preventDefault();
          window.__treeZoomBy?.(1.25);
          break;
        case '-':
          e.preventDefault();
          window.__treeZoomBy?.(0.8);
          break;
        case 'f':
        case 'F':
          window.__treeFit?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          if (window.__treeCenterOnNode) {
            window.__treeCenterOnNode(targetPerson);
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
    } else if (selectedPerson?.name !== person.name && person.enfants.length > 0 && !person.expanded) {
      setSelectedPerson(person);
      setIsPersonInfoVisible(true);
      engine.toggleExpand(person);
      updateTree();
    } else {
      setSelectedPerson(person);
      setIsPersonInfoVisible(true);
    }

    setTimeout(() => {
      if (window.__treeCenterOnNode) window.__treeCenterOnNode(person);
    }, 300);
  }, [selectedPerson, engine, updateTree]);

  const handleSearchSelect = useCallback((person: PersonNode) => {
    isFocusHandled.current = true;
    engine.expandToRoot(person);
    updateTree();
    setSelectedPerson(person);
    setIsPersonInfoVisible(true);
    setTimeout(() => {
      if (window.__treeCenterOnNode) window.__treeCenterOnNode(person);
    }, 100);
  }, [engine, updateTree]);

  const handleModeChange = useCallback((mode: ViewMode) => {
    setCurrentMode(mode);
    if (mode === "tree") {
      setSelectedPerson(null);
      setSelectedPerson2(null);
      setIsModePanelOpen(false);
      setTimeout(() => {
        if (window.__treeReset) window.__treeReset();
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
        if (window.__treeFit) window.__treeFit();
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
    if (window.__treeReset) window.__treeReset();
  }, []);

  const handleFit = useCallback(() => {
    if (window.__treeFit) window.__treeFit();
  }, []);

  const handleExport = useCallback((format: 'png' | 'pdf') => {
    if (window.__treeExport) window.__treeExport(format);
  }, []);

  // Générations disponibles (triées)
  const allGenerations = useMemo(
    () => [...new Set(allPersons.map(p => p.level))].sort((a, b) => a - b),
    [allPersons]
  );

  const toggleGeneration = useCallback((gen: number) => {
    setHighlightedGenerations(prev => {
      if (prev === null) {
        // Passer en mode filtre avec seulement cette génération
        return new Set([gen]);
      }
      const next = new Set(prev);
      if (next.has(gen)) {
        next.delete(gen);
        // Si on retire tous les filtres, revenir au mode "tout afficher"
        if (next.size === 0) return null;
      } else {
        next.add(gen);
      }
      return next;
    });
  }, []);

  const clearGenFilter = useCallback(() => {
    setHighlightedGenerations(null);
  }, []);

  const generations = useMemo(
    () => new Set(allPersons.map((p) => p.level)).size,
    [allPersons]
  );

  const links = useMemo(
    () => engine.getLinks(),
    [engine, visiblePersons] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const isMobile = dimensions.width < 640;

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
        visibleCount={visiblePersons.length}
        selectedPerson={selectedPerson}
        selectedPerson2={selectedPerson2}
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
          photoMap={photoMap}
          highlightedGenerations={highlightedGenerations}
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

      {/* Panneau flottant bas-gauche : filtre générations + minimap */}
      <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-2 items-start pointer-events-none">

        {/* Filtre par génération (desktop uniquement) */}
        {!isMobile && allGenerations.length > 0 && (
          <div className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-lg shadow-lg p-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">
                Générations
              </span>
              {highlightedGenerations && (
                <button
                  onClick={clearGenFilter}
                  className="text-[9px] text-primary hover:underline ml-auto"
                >
                  Tout
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 max-w-[160px]">
              {allGenerations.map(gen => {
                const isActive = !highlightedGenerations || highlightedGenerations.has(gen);
                return (
                  <button
                    key={gen}
                    onClick={() => toggleGeneration(gen)}
                    className={`
                      w-7 h-7 rounded-md text-[10px] font-bold transition-all
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'}
                    `}
                    title={`Génération ${gen}`}
                  >
                    G{gen}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Minimap (desktop uniquement) */}
        {!isMobile && (
          <div className="pointer-events-none">
            <Minimap
              persons={visiblePersons}
              nodeWidth={dimensions.nodeWidth}
              nodeHeight={dimensions.nodeHeight}
              viewWidth={dimensions.width}
              viewHeight={dimensions.height}
            />
          </div>
        )}
      </div>

      {/* Indication raccourcis clavier (desktop, petite pastille) */}
      {!isMobile && (
        <div className="fixed bottom-4 right-4 mr-[calc(theme(spacing.4))] sm:right-[calc(theme(spacing.4)+theme(spacing.20))] hidden xl:flex items-center gap-3 bg-card/70 backdrop-blur-sm border border-border/40 rounded-full px-3 py-1 z-30 pointer-events-none">
          <span className="text-[9px] text-muted-foreground">
            <kbd className="font-mono bg-muted px-1 rounded text-[8px]">+/-</kbd> zoom ·{' '}
            <kbd className="font-mono bg-muted px-1 rounded text-[8px]">F</kbd> centrer ·{' '}
            <kbd className="font-mono bg-muted px-1 rounded text-[8px]">Échap</kbd> fermer
          </span>
        </div>
      )}
    </div>
  );
};
