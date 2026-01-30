import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as d3 from "d3";
import { ArrowLeft, Home, Users, Sparkles, ZoomIn, ZoomOut, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { familyData } from "@/lib/familyTree/data";

// Types basés sur la structure de données du projet
interface PersonData {
  name: string;
  genre: "Homme" | "Femme";
  generation: number;
  parents: string[];
  enfants: string[];
  spouses?: string[];
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  type: "central" | "spouse" | "child";
  data: PersonData;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  parent?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  type: "marriage" | "parent-child";
}

type SimulatedNode = Node & Required<Pick<d3.SimulationNodeDatum, 'x' | 'y'>>;

// Stocker l'historique de navigation dans sessionStorage
const HISTORY_KEY = 'familyview_history';

const getNavigationHistory = (): string[] => {
  try {
    const stored = sessionStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addToHistory = (personName: string) => {
  const history = getNavigationHistory();
  // Éviter les doublons consécutifs
  if (history[history.length - 1] !== personName) {
    history.push(personName);
    // Limiter à 10 dernières personnes
    if (history.length > 10) history.shift();
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
};

const goBackInHistory = (): string | null => {
  const history = getNavigationHistory();
  if (history.length > 1) {
    history.pop(); // Retirer la personne actuelle
    const previous = history[history.length - 1];
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return previous;
  }
  return null;
};

// Composant Instructions qui disparaît après 5 secondes
const Instructions = ({ isMobile }: { isMobile: boolean }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return isMobile ? (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-primary/90 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white pointer-events-none animate-in fade-in duration-500">
      Glissez pour déplacer • Pincez pour zoomer
    </div>
  ) : (
    <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-primary/90 backdrop-blur px-4 py-2 rounded-full text-sm text-white pointer-events-none animate-in fade-in duration-500">
      Glissez les nœuds pour réorganiser • Cliquez pour naviguer
    </div>
  );
};

export const FamilyView = () => {
  const { personName } = useParams<{ personName: string }>();
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();

  // Récupération de la personne centrale
  const centralPerson = useMemo(() => {
    const decodedName = decodeURIComponent(personName || "");
    return familyData.find((p) => p.name === decodedName) as PersonData | undefined;
  }, [personName]);

  // Ajouter à l'historique quand on arrive sur une personne
  useEffect(() => {
    if (centralPerson) {
      addToHistory(centralPerson.name);
    }
  }, [centralPerson]);

  // Calcul des conjoints réels
  const spousesOfCentral = useMemo(() => {
    if (!centralPerson) return [];

    const spousesSet = new Set<string>();

    // Trouver les conjoints via les enfants
    centralPerson.enfants.forEach(childName => {
      const child = familyData.find(p => p.name === childName);
      if (child) {
        const otherParent = child.parents.find(p => p !== centralPerson.name);
        if (otherParent) {
          spousesSet.add(otherParent);
        }
      }
    });

    return Array.from(spousesSet);
  }, [centralPerson]);

  // Calcul des données de la constellation
  const { nodes, links } = useMemo(() => {
    if (!centralPerson) return { nodes: [], links: [] };

    const nodeList: Node[] = [];
    const linkList: Link[] = [];

    // 1. Nœud Central (fixé au centre)
    nodeList.push({
      id: centralPerson.name,
      type: "central",
      data: { ...centralPerson, spouses: spousesOfCentral },
      fx: 0,
      fy: 0,
    });

    // Identification des conjoints et leurs enfants
    const childrenBySpouse = new Map<string, string[]>();

    centralPerson.enfants.forEach(childName => {
      const child = familyData.find(p => p.name === childName);
      if (child) {
        const otherParentName = child.parents.find(p => p !== centralPerson.name);
        const spouseKey = otherParentName || "Inconnu";

        if (!childrenBySpouse.has(spouseKey)) {
          childrenBySpouse.set(spouseKey, []);
        }
        childrenBySpouse.get(spouseKey)?.push(childName);
      }
    });

    // 2. Nœuds Conjoints
    spousesOfCentral.forEach((spouseName) => {
      const spouseData = familyData.find((p) => p.name === spouseName);

      if (spouseData) {
        nodeList.push({
          id: spouseName,
          type: "spouse",
          data: spouseData,
        });

        linkList.push({
          source: centralPerson.name,
          target: spouseName,
          type: "marriage",
        });

        // 3. Enfants de ce conjoint
        const kids = childrenBySpouse.get(spouseName) || [];
        kids.forEach((kidName) => {
          const kidData = familyData.find((p) => p.name === kidName);
          if (kidData) {
            nodeList.push({
              id: kidName,
              type: "child",
              data: kidData,
              parent: spouseName,
            });

            // Lien du conjoint vers l'enfant
            linkList.push({
              source: spouseName,
              target: kidName,
              type: "parent-child",
            });
          }
        });
      }
    });

    // Enfants sans conjoint identifié
    const orphans = childrenBySpouse.get("Inconnu") || [];
    orphans.forEach((kidName) => {
      const kidData = familyData.find((p) => p.name === kidName);
      if (kidData) {
        nodeList.push({
          id: kidName,
          type: "child",
          data: kidData,
          parent: centralPerson.name,
        });
        linkList.push({
          source: centralPerson.name,
          target: kidName,
          type: "parent-child",
        });
      }
    });

    return { nodes: nodeList, links: linkList };
  }, [centralPerson, spousesOfCentral]);

  // Gestion du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fonctions de contrôle du zoom
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
  };

  const handleReset = () => {
    if (!svgRef.current || !zoomRef.current || !dimensions.width || !dimensions.height) return;
    const svg = d3.select(svgRef.current);
    const isMobile = dimensions.width < 640;
    const isTablet = dimensions.width >= 640 && dimensions.width < 1024;
    const scale = isMobile ? 0.45 : isTablet ? 0.55 : 0.65;

    svg.transition().duration(750).call(
      zoomRef.current.transform,
      d3.zoomIdentity.translate(dimensions.width / 2, dimensions.height / 2).scale(scale)
    );
  };

  const handleBack = () => {
    const previous = goBackInHistory();
    if (previous) {
      navigate(`/family/${encodeURIComponent(previous)}`);
    } else {
      navigate('/');
    }
  };

  // Moteur de rendu D3 avec simulation DYNAMIQUE
  useEffect(() => {
    if (!svgRef.current || !gRef.current || !dimensions.width || !dimensions.height || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    // Nettoyage
    g.selectAll("*").remove();

    const { width, height } = dimensions;
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;

    // Configuration du zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Centrage initial (échelle réduite pour voir plus de la constellation)
    const initialScale = isMobile ? 0.45 : isTablet ? 0.55 : 0.65;
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale));

    // Paramètres adaptatifs pour la simulation (optimisés pour 200+ personnes)
    const linkDistance = isMobile ? 160 : isTablet ? 220 : 280;
    const chargeStrength = isMobile ? -1400 : isTablet ? -1800 : -2400;
    const collisionRadius = isMobile ? 60 : isTablet ? 80 : 100;

    // Simulation de force DYNAMIQUE (optimisée pour grands arbres)
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink<Node, Link>(links)
        .id((d) => d.id)
        .distance((d) => d.type === "marriage" ? linkDistance : linkDistance * 0.7)
        .strength(0.8))
      .force("charge", d3.forceManyBody()
        .strength(chargeStrength)
        .distanceMin(50)
        .distanceMax(800))
      .force("collide", d3.forceCollide()
        .radius(collisionRadius)
        .strength(0.9)
        .iterations(2))
      .force("center", d3.forceCenter(0, 0).strength(0.05))
      .alphaDecay(0.03)
      .velocityDecay(0.4); // Mouvement plus fluide et stable

    simulationRef.current = simulation;

    // Dessin des liens avec labels
    const linkGroup = g.append("g").attr("class", "links");

    const link = linkGroup.selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d) => d.type === "marriage" ? "hsl(340, 70%, 55%)" : "#94a3b8")
      .attr("stroke-width", (d) => d.type === "marriage" ? (isMobile ? 2.5 : 3) : (isMobile ? 1.5 : 2))
      .attr("stroke-dasharray", (d) => d.type === "marriage" ? "8,4" : "none")
      .attr("opacity", 0.7);

    // Labels sur les liens de mariage
    const linkLabels = linkGroup.selectAll("text")
      .data(links.filter(d => d.type === "marriage"))
      .join("text")
      .attr("font-size", isMobile ? 9 : 11)
      .attr("fill", "hsl(340, 70%, 45%)")
      .attr("font-weight", "600")
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .text("💑 Mariage")
      .style("pointer-events", "none")
      .style("text-shadow", "0 0 3px white, 0 0 3px white");

    // Dessin des nœuds
    const nodeGroup = g.append("g").attr("class", "nodes");

    // Comportement de drag
    const dragBehavior = d3.drag<SVGGElement, Node>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        if (d.type !== "central") {
          d.fx = null;
          d.fy = null;
        }
      });

    const node = nodeGroup.selectAll<SVGGElement, Node>("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        if (d.type === "child" || d.type === "spouse") {
          navigate(`/family/${encodeURIComponent(d.id)}`);
        }
      })
      .call(dragBehavior);

    // Tailles adaptatives
    const centralRadius = isMobile ? 40 : isTablet ? 50 : 55;
    const spouseRadius = isMobile ? 32 : isTablet ? 40 : 45;
    const childRadius = isMobile ? 25 : isTablet ? 30 : 35;

    // Cercles
    node.append("circle")
      .attr("r", (d) => d.type === "central" ? centralRadius : d.type === "spouse" ? spouseRadius : childRadius)
      .attr("fill", (d) => {
        if (d.type === "central") return "hsl(var(--background))";
        if (d.type === "spouse") {
          // Épouses en rose/violet distinct
          return d.data.genre === "Homme" ? "hsl(260, 60%, 92%)" : "hsl(320, 75%, 92%)";
        }
        return d.data.genre === "Homme" ? "hsl(200, 80%, 92%)" : "hsl(340, 70%, 92%)";
      })
      .attr("stroke", (d) => {
        if (d.type === "spouse") {
          return d.data.genre === "Homme" ? "hsl(260, 60%, 50%)" : "hsl(320, 75%, 50%)";
        }
        return d.data.genre === "Homme" ? "hsl(200, 80%, 45%)" : "hsl(340, 70%, 55%)";
      })
      .attr("stroke-width", (d) => d.type === "central" ? (isMobile ? 4 : 5) : (isMobile ? 2.5 : 3))
      .style("filter", "drop-shadow(0px 3px 6px rgba(0,0,0,0.2))");

    // Badge "Épouse" / "Époux" pour les conjoints
    node.filter(d => d.type === "spouse")
      .append("text")
      .attr("dy", (d) => -(d.type === "spouse" ? spouseRadius : childRadius) - 8)
      .attr("text-anchor", "middle")
      .attr("font-size", isMobile ? 9 : 11)
      .attr("font-weight", "bold")
      .attr("fill", (d) => d.data.genre === "Homme" ? "hsl(260, 60%, 40%)" : "hsl(320, 75%, 40%)")
      .text((d) => d.data.genre === "Homme" ? "👔 Époux" : "👰 Épouse")
      .style("text-shadow", "0 0 3px white, 0 0 3px white");

    // Initiales
    const centralFontSize = isMobile ? 18 : isTablet ? 22 : 26;
    const fontSize = isMobile ? 14 : isTablet ? 16 : 18;

    node.append("text")
      .text((d) => {
        const parts = d.data.name.split(" ");
        return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
      })
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => d.type === "central" ? centralFontSize : fontSize)
      .attr("font-weight", "bold")
      .attr("fill", (d) => {
        if (d.type === "spouse") {
          return d.data.genre === "Homme" ? "hsl(260, 60%, 40%)" : "hsl(320, 75%, 40%)";
        }
        return d.data.genre === "Homme" ? "hsl(200, 80%, 35%)" : "hsl(340, 70%, 45%)";
      })
      .style("pointer-events", "none");

    // Noms
    node.append("text")
      .text((d) => {
        const name = d.data.name.split("(")[0].trim();
        if (isMobile && name.length > 15) {
          return name.substring(0, 12) + "...";
        }
        return name;
      })
      .attr("dy", (d) => {
        const radius = d.type === "central" ? centralRadius : d.type === "spouse" ? spouseRadius : childRadius;
        return radius + (isMobile ? 16 : 20);
      })
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => d.type === "central" ? (isMobile ? 12 : 16) : (isMobile ? 10 : 12))
      .attr("font-weight", (d) => d.type === "central" ? "bold" : "600")
      .attr("fill", "currentColor")
      .style("text-shadow", "0 1px 4px rgba(255,255,255,0.9)")
      .style("pointer-events", "none");

    // Badge enfants
    node.each(function(d) {
      if (d.data.enfants && d.data.enfants.length > 0 && d.type !== "central") {
        const radius = d.type === "spouse" ? spouseRadius : childRadius;
        const badgeGroup = d3.select(this).append("g")
          .attr("transform", `translate(${radius - 8}, -${radius - 8})`);

        badgeGroup.append("circle")
          .attr("r", isMobile ? 10 : 12)
          .attr("fill", "hsl(var(--primary))");

        badgeGroup.append("text")
          .text(d.data.enfants.length)
          .attr("dy", 4)
          .attr("text-anchor", "middle")
          .attr("font-size", isMobile ? 9 : 11)
          .attr("fill", "white")
          .attr("font-weight", "bold");
      }
    });

    // Animation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimulatedNode).x)
        .attr("y1", (d) => (d.source as SimulatedNode).y)
        .attr("x2", (d) => (d.target as SimulatedNode).x)
        .attr("y2", (d) => (d.target as SimulatedNode).y);

      linkLabels
        .attr("x", (d) => ((d.source as SimulatedNode).x + (d.target as SimulatedNode).x) / 2)
        .attr("y", (d) => ((d.source as SimulatedNode).y + (d.target as SimulatedNode).y) / 2);

      node.attr("transform", (d) => `translate(${(d as SimulatedNode).x},${(d as SimulatedNode).y})`);
    });

    // NE PAS ARRÊTER la simulation pour garder l'aspect dynamique
    return () => {
      // Ralentir mais ne pas arrêter complètement
      if (simulationRef.current) {
        simulationRef.current.alphaTarget(0.01);
      }
    };
  }, [nodes, links, dimensions, navigate]);

  if (!centralPerson) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 p-4">
        <h2 className="text-xl sm:text-2xl font-bold text-muted-foreground text-center">Personne introuvable</h2>
        <Link to="/">
          <Button>Retour à l'arbre</Button>
        </Link>
      </div>
    );
  }

  const history = getNavigationHistory();

  return (
    <div className="h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden relative flex flex-col">
      {/* Header avec Breadcrumb */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur border-b pointer-events-none">
        <div className="p-2 sm:p-4 pointer-events-auto">
          {/* Navigation Breadcrumb */}
          <div className="flex items-center gap-2 mb-2 overflow-x-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-1 h-7 px-2 flex-shrink-0"
            >
              <Home className="w-3 h-3" />
              <span className="hidden xs:inline text-xs">Accueil</span>
            </Button>

            {history.length > 1 && (
              <>
                <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="gap-1 h-7 px-2 flex-shrink-0"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span className="text-xs truncate max-w-[100px]">
                    {history[history.length - 2]?.split(' ')[0]}
                  </span>
                </Button>
              </>
            )}

            <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs font-semibold text-primary truncate">
              {centralPerson.name.split(' ')[0]}
            </span>
          </div>

          {/* Info centrale */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg font-bold truncate">
                {centralPerson.name}
              </h1>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  {spousesOfCentral.length} {spousesOfCentral.length > 1 ? 'Conjoints' : 'Conjoint'}
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  {centralPerson.enfants.length} {centralPerson.enfants.length > 1 ? 'Enfants' : 'Enfant'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 w-full h-full pt-20 sm:pt-24">
        <svg ref={svgRef} className="w-full h-full">
          <g ref={gRef} />
        </svg>
      </div>

      {/* Contrôles Zoom - Fonctionnels */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 pointer-events-auto">
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full shadow-lg h-10 w-10 sm:h-12 sm:w-12 p-0"
          onClick={handleZoomIn}
          title="Zoom avant"
        >
          <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full shadow-lg h-10 w-10 sm:h-12 sm:w-12 p-0"
          onClick={handleZoomOut}
          title="Zoom arrière"
        >
          <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full shadow-lg h-10 w-10 sm:h-12 sm:w-12 p-0"
          onClick={handleReset}
          title="Recentrer"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      {/* Légende améliorée */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-background/95 backdrop-blur p-2 sm:p-3 rounded-lg border shadow-sm text-[10px] sm:text-xs space-y-1.5 sm:space-y-2 pointer-events-none max-w-[200px]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 rounded-full bg-background border-2 border-[hsl(200,80%,45%)]" />
          <span>Homme</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 rounded-full bg-background border-2 border-[hsl(340,70%,55%)]" />
          <span>Femme</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(320,75%,92%)] border-2 border-[hsl(320,75%,50%)]" />
          <span>Épouse</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-6 h-0.5 bg-[hsl(340,70%,55%)]" style={{borderTop: "2px dashed"}} />
          <span>Mariage</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-6 h-0.5 bg-slate-400" />
          <span>Filiation</span>
        </div>
      </div>

      {/* Instructions dynamiques - disparaissent après 5s */}
      <Instructions isMobile={dimensions.width < 640} />
    </div>
  );
};

export default FamilyView;
