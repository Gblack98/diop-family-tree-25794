import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FamilyTreeEngine } from "@/lib/familyTree/FamilyTreeEngine";
import { FamilyTreeCanvas } from "@/components/FamilyTree/FamilyTreeCanvas";
import { familyData } from "@/lib/familyTree/data";
import { PersonNode, TreeDimensions } from "@/lib/familyTree/types";
import { ArrowLeft, Home, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Vue Famille Isolée - Simple et lisible
 * Affiche : personne + conjoints + enfants directs
 * Navigation : clic sur enfant → voir sa famille
 */

const getFamilyDimensions = (): TreeDimensions => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  if (isMobile) {
    return {
      width,
      height,
      nodeWidth: 120,      // Plus compact pour mobile
      nodeHeight: 60,
      levelHeight: 100,
      coupleSpacing: 15,
      siblingSpacing: 20,
    };
  }

  if (isTablet) {
    return {
      width,
      height,
      nodeWidth: 150,
      nodeHeight: 75,
      levelHeight: 120,
      coupleSpacing: 25,
      siblingSpacing: 30,
    };
  }

  // Desktop - optimal pour lisibilité
  return {
    width,
    height,
    nodeWidth: 160,      // Taille réduite pour meilleure vue d'ensemble
    nodeHeight: 80,
    levelHeight: 140,
    coupleSpacing: 30,
    siblingSpacing: 35,
  };
};

export const FamilyView = () => {
  const { personName } = useParams<{ personName: string }>();
  const navigate = useNavigate();

  const [dimensions, setDimensions] = useState(getFamilyDimensions());
  const [engine] = useState(() => new FamilyTreeEngine(familyData, dimensions));
  const [visiblePersons, setVisiblePersons] = useState<PersonNode[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<PersonNode | null>(null);
  const [focusPerson, setFocusPerson] = useState<PersonNode | null>(null);

  // Trouver la personne focalisée
  useEffect(() => {
    if (!personName) return;

    const decodedName = decodeURIComponent(personName);
    const person = engine.getPerson(decodedName);

    if (person) {
      setFocusPerson(person);
      buildFamilyView(person);

      // Auto-centrer après le rendu
      setTimeout(() => {
        if ((window as any).__treeReset) {
          (window as any).__treeReset();
        }
      }, 100);
    }
  }, [personName, engine]);

  // Construire la vue famille isolée
  const buildFamilyView = (person: PersonNode) => {
    // Réinitialiser toutes les visibilités
    engine.getAllPersons().forEach(p => p.visible = false);

    // 1. La personne elle-même
    person.visible = true;
    person.expanded = true;

    // 2. Ses conjoints
    person.spouses.forEach(spouseName => {
      const spouse = engine.getPerson(spouseName);
      if (spouse) {
        spouse.visible = true;
      }
    });

    // 3. Ses enfants directs (mais PAS leurs conjoints)
    person.enfants.forEach(childName => {
      const child = engine.getPerson(childName);
      if (child) {
        child.visible = true;
      }
    });

    // Calculer les positions
    engine.calculatePositions();
    setVisiblePersons([...engine.getVisiblePersons()]);
  };

  const handleNodeClick = (person: PersonNode) => {
    // Si la personne a des enfants, naviguer vers sa vue famille
    if (person.enfants.length > 0) {
      navigate(`/family/${encodeURIComponent(person.name)}`);
    } else {
      setSelectedPerson(person);
    }
  };

  const handleReset = () => {
    if ((window as any).__treeReset) {
      (window as any).__treeReset();
    }
  };

  const handleFit = () => {
    if ((window as any).__treeFit) {
      (window as any).__treeFit();
    }
  };

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newDims = getFamilyDimensions();
        setDimensions(newDims);
        if (engine.updateDimensions) {
          engine.updateDimensions(newDims);
        }
        if (focusPerson) {
          buildFamilyView(focusPerson);
        }
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [focusPerson, engine]);

  if (!focusPerson) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Personne non trouvée</h2>
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Retour à l'arbre complet
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header - Simple et clair */}
      <header className="border-b bg-card px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link to="/">
            <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Retour</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <h1 className="text-sm sm:text-base font-semibold truncate">
              {focusPerson.name.split(' ')[0]}
              {focusPerson.spouses.length > 0 && (
                <span className="text-muted-foreground font-normal ml-1 hidden sm:inline">
                  • {focusPerson.spouses.length + focusPerson.enfants.length} membres
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex gap-1.5 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-8 w-8 sm:w-auto sm:px-3 p-0">
            <span className="text-base sm:hidden">↻</span>
            <span className="hidden sm:inline text-xs">Centrer</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleFit} className="h-8 w-8 sm:w-auto sm:px-3 p-0">
            <span className="text-base sm:hidden">⊡</span>
            <span className="hidden sm:inline text-xs">Ajuster</span>
          </Button>
        </div>
      </header>

      {/* Info Panel - Instruction simple */}
      {visiblePersons.some(p => p.enfants.length > 0 && p.name !== focusPerson.name) && (
        <div className="bg-primary/5 border-b px-3 py-2 text-xs sm:text-sm text-center">
          <span className="text-muted-foreground">
            👆 Cliquez sur un enfant pour voir sa famille
          </span>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <FamilyTreeCanvas
          persons={visiblePersons}
          links={engine.getLinks()}
          dimensions={dimensions}
          selectedPerson={selectedPerson}
          onNodeClick={handleNodeClick}
          onReset={handleReset}
          onFitToScreen={handleFit}
        />
      </div>

      {/* Legend - Compact et simple */}
      <div className="border-t bg-card px-3 py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] sm:text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Homme</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-pink-500" />
          <span>Femme</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-gray-400" />
          <span>Mariage</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-gray-600" />
          <span>Parent</span>
        </div>
      </div>
    </div>
  );
};
