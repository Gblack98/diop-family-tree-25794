import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as d3 from "d3";
import { ArrowLeft, Users, Sparkles, Move, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { familyData } from "@/lib/familyTree/data";

// Types basés sur la structure de données du projet
interface PersonData {
  name: string;
  genre: "Homme" | "Femme";
  generation: number;
  parents: string[];
  enfants: string[];
  spouses?: string[]; // Calculé dynamiquement si absent
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  type: "central" | "spouse" | "child";
  data: PersonData;
  x?: number;
  y?: number;
  parent?: string; // Pour les enfants, lien vers le conjoint (mère/père)
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  type: "marriage" | "parent-child";
}

// Types pour D3 après simulation (source/target deviennent des objets)
type SimulatedNode = Node & Required<Pick<d3.SimulationNodeDatum, 'x' | 'y'>>;

export const FamilyView = () => {
  const { personName } = useParams<{ personName: string }>();
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);

  // Récupération de la personne centrale
  const centralPerson = useMemo(() => {
    const decodedName = decodeURIComponent(personName || "");
    return familyData.find((p) => p.name === decodedName) as PersonData | undefined;
  }, [personName]);

  // Calcul des données de la constellation
  const { nodes, links } = useMemo(() => {
    if (!centralPerson) return { nodes: [], links: [] };

    const nodeList: Node[] = [];
    const linkList: Link[] = [];

    // 1. Nœud Central
    nodeList.push({
      id: centralPerson.name,
      type: "central",
      data: centralPerson,
      fx: 0, // Fixé au centre initialement
      fy: 0,
    });

    // Identification des conjoints (basé sur les parents des enfants)
    const spousesSet = new Set<string>();
    const childrenBySpouse = new Map<string, string[]>();

    // Récupérer les enfants objets
    const childrenObjs = centralPerson.enfants
      .map((name) => familyData.find((p) => p.name === name))
      .filter((p): p is PersonData => !!p);

    childrenObjs.forEach((child) => {
      // Trouver l'autre parent
      const otherParentName = child.parents.find((p) => p !== centralPerson.name);
      if (otherParentName) {
        spousesSet.add(otherParentName);
        if (!childrenBySpouse.has(otherParentName)) {
          childrenBySpouse.set(otherParentName, []);
        }
        childrenBySpouse.get(otherParentName)?.push(child.name);
      } else {
        // Enfant sans autre parent connu (ou parent unique)
        const unknownKey = "Inconnu";
        if (!childrenBySpouse.has(unknownKey)) {
          childrenBySpouse.set(unknownKey, []);
        }
        childrenBySpouse.get(unknownKey)?.push(child.name);
      }
    });

    // 2. Nœuds Conjoints
    const spouses = Array.from(spousesSet);
    spouses.forEach((spouseName) => {
      const spouseData = familyData.find((p) => p.name === spouseName) || {
        name: spouseName,
        genre: centralPerson.genre === "Homme" ? "Femme" : "Homme",
        generation: centralPerson.generation,
        parents: [],
        enfants: [],
      };

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

      // 3. Nœuds Enfants (liés à leur parent conjoint)
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
          linkList.push({
            source: spouseName,
            target: kidName,
            type: "parent-child",
          });
        }
      });
    });

    // Enfants sans conjoint identifié (liés directement au central)
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
  }, [centralPerson]);

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

  // Fonction pour recentrer la vue
  const resetView = () => {
    if (!svgRef.current || !dimensions.width || !dimensions.height) return;
    const svg = d3.select(svgRef.current);
    const isMobile = dimensions.width < 640;
    const scale = isMobile ? 0.6 : 0.8;
    svg.transition().duration(750).call(
      d3.zoom<SVGSVGElement, unknown>().transform,
      d3.zoomIdentity.translate(dimensions.width / 2, dimensions.height / 2).scale(scale)
    );
  };

  // Moteur de rendu D3
  useEffect(() => {
    if (!svgRef.current || !dimensions.width || !dimensions.height || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Nettoyage

    const { width, height } = dimensions;
    const g = svg.append("g");

    // Détection mobile/tablette
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;

    // Zoom avec limites adaptées
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Centrage initial optimisé pour chaque device
    const initialScale = isMobile ? 0.6 : isTablet ? 0.7 : 0.8;
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale));

    // Simulation de force avec paramètres adaptatifs
    const linkDistance = isMobile ? 120 : isTablet ? 150 : 200;
    const chargeStrength = isMobile ? -600 : isTablet ? -800 : -1000;

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id((d) => d.id).distance((d) => d.type === "marriage" ? linkDistance : linkDistance / 2))
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("collide", d3.forceCollide().radius(isMobile ? 40 : isTablet ? 50 : 60))
      .force("center", d3.forceCenter(0, 0));

    simulationRef.current = simulation;

    // Dessin des liens
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d) => d.type === "marriage" ? "hsl(var(--primary))" : "#94a3b8")
      .attr("stroke-width", (d) => d.type === "marriage" ? (isMobile ? 1.5 : 2) : (isMobile ? 1 : 1.5))
      .attr("stroke-dasharray", (d) => d.type === "marriage" ? "5,5" : "none")
      .attr("opacity", 0.6);

    // Dessin des nœuds (Groupes)
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        if (d.type === "child" || d.type === "spouse") {
          // Navigation vers la personne cliquée
          navigate(`/family/${encodeURIComponent(d.id)}`);
        }
      });

    // Cercles des nœuds avec tailles adaptatives
    const centralRadius = isMobile ? 35 : isTablet ? 45 : 50;
    const spouseRadius = isMobile ? 28 : isTablet ? 35 : 40;
    const childRadius = isMobile ? 22 : isTablet ? 26 : 30;

    node.append("circle")
      .attr("r", (d) => d.type === "central" ? centralRadius : d.type === "spouse" ? spouseRadius : childRadius)
      .attr("fill", (d) => {
        if (d.type === "central") return "hsl(var(--background))";
        return d.data.genre === "Homme" ? "hsl(200, 80%, 95%)" : "hsl(340, 70%, 95%)";
      })
      .attr("stroke", (d) => d.data.genre === "Homme" ? "hsl(200, 80%, 45%)" : "hsl(340, 70%, 65%)")
      .attr("stroke-width", (d) => d.type === "central" ? (isMobile ? 3 : 4) : (isMobile ? 1.5 : 2))
      .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))");

    // Icônes ou Initiales
    const centralFontSize = isMobile ? 16 : isTablet ? 20 : 24;
    const fontSize = isMobile ? 14 : 18;

    node.append("text")
      .text((d) => {
        const parts = d.data.name.split(" ");
        return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
      })
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => d.type === "central" ? centralFontSize : fontSize)
      .attr("font-weight", "bold")
      .attr("fill", (d) => d.data.genre === "Homme" ? "hsl(200, 80%, 45%)" : "hsl(340, 70%, 65%)")
      .style("pointer-events", "none");

    // Labels (Noms) - Plus courts sur mobile
    node.append("text")
      .text((d) => {
        const name = d.data.name.split("(")[0].trim();
        // Sur mobile, tronquer les noms longs
        if (isMobile && name.length > 15) {
          return name.substring(0, 12) + "...";
        }
        return name;
      })
      .attr("dy", (d) => {
        const offset = d.type === "central" ? centralRadius : d.type === "spouse" ? spouseRadius : childRadius;
        return offset + (isMobile ? 16 : 20);
      })
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => d.type === "central" ? (isMobile ? 11 : 16) : (isMobile ? 9 : 12))
      .attr("font-weight", (d) => d.type === "central" ? "bold" : "normal")
      .attr("fill", "currentColor")
      .style("text-shadow", "0 1px 4px rgba(255,255,255,0.8)");

    // Badges pour enfants (si le nœud a des enfants) - Plus petits sur mobile
    node.each(function(d) {
      if (d.data.enfants && d.data.enfants.length > 0 && d.type !== "central") {
        const radius = d.type === "spouse" ? spouseRadius : childRadius;
        const badgeOffset = isMobile ? radius - 5 : radius - 3;
        const badgeGroup = d3.select(this).append("g")
          .attr("transform", `translate(${badgeOffset}, -${badgeOffset})`);

        badgeGroup.append("circle")
          .attr("r", isMobile ? 8 : 10)
          .attr("fill", "hsl(var(--primary))");

        badgeGroup.append("text")
          .text(d.data.enfants.length)
          .attr("dy", 3.5)
          .attr("text-anchor", "middle")
          .attr("font-size", isMobile ? 8 : 10)
          .attr("fill", "white")
          .attr("font-weight", "bold");
      }
    });

    // Animation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimulatedNode).x)
        .attr("y1", (d) => (d.source as SimulatedNode).y)
        .attr("x2", (d) => (d.target as SimulatedNode).x)
        .attr("y2", (d) => (d.target as SimulatedNode).y);

      node.attr("transform", (d) => `translate(${(d as SimulatedNode).x},${(d as SimulatedNode).y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
      simulationRef.current = null;
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

  return (
    <div className="h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden relative flex flex-col">
      {/* Header Mobile-Optimized */}
      <header className="absolute top-0 left-0 right-0 z-10 p-2 sm:p-4 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 bg-background/90 backdrop-blur h-8 sm:h-10 px-2 sm:px-4">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline text-xs sm:text-sm">Retour</span>
            </Button>
          </Link>
        </div>

        <div className="text-center max-w-[60%] sm:max-w-none bg-background/90 backdrop-blur p-2 sm:p-3 rounded-lg sm:rounded-xl border shadow-sm pointer-events-auto">
          <h1 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent truncate">
            {centralPerson.name.split("(")[0].trim()}
          </h1>
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-0.5 sm:gap-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{centralPerson.spouses?.length || 0}</span>
            </span>
            <span className="flex items-center gap-0.5 sm:gap-1">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{centralPerson.enfants.length}</span>
            </span>
          </div>
        </div>

        <div className="pointer-events-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetView}
            className="rounded-full bg-background/90 backdrop-blur h-8 w-8 sm:h-10 sm:w-10 p-0"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </header>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 w-full h-full">
        <svg ref={svgRef} className="w-full h-full touch-none" />
      </div>

      {/* Floating Controls - Mobile Optimized */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 pointer-events-auto">
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full shadow-lg h-10 w-10 sm:h-12 sm:w-12 p-0"
          onClick={resetView}
        >
          <Move className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      {/* Legend - Mobile Optimized */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-background/95 backdrop-blur p-2 sm:p-3 rounded-lg border shadow-sm text-[10px] sm:text-xs space-y-1.5 sm:space-y-2 pointer-events-none">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-background border-2 border-[hsl(200,80%,45%)]" />
          <span className="hidden xs:inline">Homme</span>
          <span className="xs:hidden">H</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-background border-2 border-[hsl(340,70%,65%)]" />
          <span className="hidden xs:inline">Femme</span>
          <span className="xs:hidden">F</span>
        </div>
      </div>

      {/* Touch hint for mobile */}
      {dimensions.width < 640 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-primary/10 backdrop-blur px-3 py-1.5 rounded-full text-xs text-primary pointer-events-none animate-pulse">
          Pincez pour zoomer
        </div>
      )}
    </div>
  );
};

export default FamilyView;
