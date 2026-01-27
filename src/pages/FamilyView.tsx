import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as d3 from "d3";
import { ArrowLeft, Users, Info, ZoomIn, ZoomOut, Move, Sparkles } from "lucide-react";
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

  // Moteur de rendu D3
  useEffect(() => {
    if (!svgRef.current || !dimensions.width || !dimensions.height || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Nettoyage

    const { width, height } = dimensions;
    const g = svg.append("g");

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Centrage initial
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8));

    // Simulation de force
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id((d) => d.id).distance((d) => d.type === "marriage" ? 200 : 100))
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("collide", d3.forceCollide().radius(60))
      .force("center", d3.forceCenter(0, 0)); // Centre relatif au groupe g (0,0) car on translate le zoom

    // Dessin des liens
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d) => d.type === "marriage" ? "hsl(var(--primary))" : "#94a3b8")
      .attr("stroke-width", (d) => d.type === "marriage" ? 2 : 1.5)
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

    // Cercles des nœuds
    node.append("circle")
      .attr("r", (d) => d.type === "central" ? 50 : d.type === "spouse" ? 40 : 30)
      .attr("fill", (d) => {
        if (d.type === "central") return "hsl(var(--background))";
        return d.data.genre === "Homme" ? "hsl(200, 80%, 95%)" : "hsl(340, 70%, 95%)";
      })
      .attr("stroke", (d) => d.data.genre === "Homme" ? "hsl(200, 80%, 45%)" : "hsl(340, 70%, 65%)")
      .attr("stroke-width", (d) => d.type === "central" ? 4 : 2)
      .style("filter", "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))");

    // Icônes ou Initiales
    node.append("text")
      .text((d) => {
        const parts = d.data.name.split(" ");
        return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
      })
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => d.type === "central" ? 24 : 18)
      .attr("font-weight", "bold")
      .attr("fill", (d) => d.data.genre === "Homme" ? "hsl(200, 80%, 45%)" : "hsl(340, 70%, 65%)")
      .style("pointer-events", "none");

    // Labels (Noms)
    node.append("text")
      .text((d) => d.data.name.split("(")[0]) // Enlever le surnom pour l'affichage court
      .attr("dy", (d) => d.type === "central" ? 70 : d.type === "spouse" ? 60 : 50)
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => d.type === "central" ? 16 : 12)
      .attr("font-weight", (d) => d.type === "central" ? "bold" : "normal")
      .attr("fill", "currentColor")
      .style("text-shadow", "0 1px 4px rgba(255,255,255,0.8)");

    // Badges pour enfants (si le nœud a des enfants)
    node.each(function(d) {
      if (d.data.enfants && d.data.enfants.length > 0 && d.type !== "central") {
        const badgeGroup = d3.select(this).append("g")
          .attr("transform", `translate(${d.type === "spouse" ? 25 : 20}, -${d.type === "spouse" ? 25 : 20})`);

        badgeGroup.append("circle")
          .attr("r", 10)
          .attr("fill", "hsl(var(--primary))");

        badgeGroup.append("text")
          .text(d.data.enfants.length)
          .attr("dy", 4)
          .attr("text-anchor", "middle")
          .attr("font-size", 10)
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
    };
  }, [nodes, links, dimensions, navigate]);

  if (!centralPerson) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-muted-foreground">Personne introuvable</h2>
        <Link to="/">
          <Button>Retour à l'arbre</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden relative flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <Link to="/">
            <Button variant="outline" className="gap-2 bg-background/80 backdrop-blur">
              <ArrowLeft className="w-4 h-4" />
              Arbre Global
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-1 bg-background/80 backdrop-blur p-3 rounded-xl border shadow-sm pointer-events-auto">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {centralPerson.name}
          </h1>
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {centralPerson.spouses?.length || 0} Conjoint(s)
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              {centralPerson.enfants.length} Enfants
            </span>
          </div>
        </div>

        <div className="pointer-events-auto">
          <Button variant="ghost" size="icon" className="rounded-full bg-background/80 backdrop-blur">
            <Info className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 w-full h-full cursor-move">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 pointer-events-auto">
        <Button variant="secondary" size="icon" className="rounded-full shadow-lg" onClick={() => { /* Reset Zoom logic */ }}>
          <Move className="w-4 h-4" />
        </Button>
        <Button variant="secondary" size="icon" className="rounded-full shadow-lg">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="secondary" size="icon" className="rounded-full shadow-lg">
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur p-3 rounded-lg border shadow-sm text-xs space-y-2 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-background border-2 border-[hsl(200,80%,45%)]" />
          <span>Homme</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-background border-2 border-[hsl(340,70%,65%)]" />
          <span>Femme</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-primary border-dashed border-t" />
          <span>Mariage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-slate-400" />
          <span>Filiation</span>
        </div>
      </div>
    </div>
  );
};

export default FamilyView;
