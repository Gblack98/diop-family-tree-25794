import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { PersonNode, TreeLink, TreeDimensions } from "@/lib/familyTree/types";
import { createNodeHTML } from "./nodeHTML";
import { exportFamilyTree } from "@/lib/familyTree/exportCanvas";

// Extension de Window pour les fonctions globales de l'arbre
declare global {
  interface Window {
    __treeCenterOnNode?: (node: PersonNode) => void;
    __treeReset?: () => void;
    __treeFit?: () => void;
    __treeExport?: (format: 'png' | 'pdf') => Promise<void>;
    __treeZoomBy?: (factor: number) => void;
    __treeCurrentTransform?: { x: number; y: number; k: number };
  }
}

interface FamilyTreeCanvasProps {
  persons: PersonNode[];
  links: TreeLink[];
  dimensions: TreeDimensions;
  selectedPerson: PersonNode | null;
  onNodeClick: (person: PersonNode) => void;
  onReset: () => void;
  onFitToScreen: () => void;
  photoMap?: Map<string, string>;
  highlightedGenerations?: Set<number> | null;
}

export const FamilyTreeCanvas = ({
  persons,
  links,
  dimensions,
  selectedPerson,
  onNodeClick,
  onReset,
  onFitToScreen,
  photoMap,
  highlightedGenerations,
}: FamilyTreeCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();

  // Refs pour l'export (évite les stale closures dans les useEffects sans deps)
  const personsRef    = useRef(persons);
  const linksRef      = useRef(links);
  const dimensionsRef = useRef(dimensions);
  const photoMapRef   = useRef(photoMap);
  personsRef.current    = persons;
  linksRef.current      = links;
  dimensionsRef.current = dimensions;
  photoMapRef.current   = photoMap;

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    let lastTransformUpdate = 0;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        // Exposer le transform courant (throttlé ~30fps) pour le minimap
        const now = Date.now();
        if (now - lastTransformUpdate > 33) {
          lastTransformUpdate = now;
          const t = event.transform;
          window.__treeCurrentTransform = { x: t.x, y: t.y, k: t.k };
        }
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Zoom par facteur — pour raccourcis clavier
    window.__treeZoomBy = (factor: number) => {
      if (!svgRef.current || !zoomRef.current) return;
      d3.select(svgRef.current)
        .transition().duration(200)
        .call(zoomRef.current.scaleBy, factor);
    };

    return () => {
      delete window.__treeZoomBy;
      delete window.__treeCurrentTransform;
    };
  }, []);

  useEffect(() => {
    window.__treeCenterOnNode = (node: PersonNode) => {
      if (!svgRef.current || !zoomRef.current) return;
      const svg = d3.select(svgRef.current);
      const scale = 1.1;
      const x = -node.x * scale + dimensions.width / 2;
      const y = -node.y * scale + dimensions.height / 2;
      svg.transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(x, y).scale(scale)
      );
    };

    // RESET (centrage parfait basé sur le centre de tous les nœuds visibles)
    window.__treeReset = () => {
      if (!svgRef.current || !zoomRef.current || persons.length === 0) return;
      const svg = d3.select(svgRef.current);

      const xs = persons.map(p => p.x);
      const ys = persons.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const treeCenterX = (minX + maxX) / 2;
      const treeCenterY = (minY + maxY) / 2;

      // Bounding box réelle = bords des nœuds (centre ± demi-largeur/hauteur)
      const treeWidth  = (maxX - minX) + dimensions.nodeWidth;
      const treeHeight = (maxY - minY) + dimensions.nodeHeight;

      const isMobile = dimensions.width < 640;
      const isTablet = dimensions.width >= 640 && dimensions.width < 1024;

      const headerOffset = isMobile ? 80 : isTablet ? 70 : 60;
      // Sur desktop : on réserve ~200px à gauche (minimap + filtre gen)
      const leftPanelOffset = isMobile ? 0 : isTablet ? 0 : 200;
      const availableWidth  = (dimensions.width  - leftPanelOffset) * 0.92;
      const availableHeight = (dimensions.height - headerOffset) * 0.88;

      const scaleX = availableWidth  / treeWidth;
      const scaleY = availableHeight / treeHeight;

      // Pas de minimum artificiel — le fit-to-screen détermine l'échelle
      // On cap juste le maximum pour ne pas zoomer trop près
      const maxInitialScale = isMobile ? 0.55 : isTablet ? 0.70 : 0.80;
      const initialScale = Math.min(maxInitialScale, Math.min(scaleX, scaleY));

      // Décaler légèrement vers la droite sur desktop pour laisser la place au panneau gauche
      const centerXOffset = isMobile ? 0 : isTablet ? 0 : leftPanelOffset / 2;
      const x = (dimensions.width / 2 + centerXOffset) - (treeCenterX * initialScale);
      const y = (dimensions.height / 2) - (treeCenterY * initialScale) + (headerOffset / 4);

      svg.transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(x, y).scale(initialScale)
      );
    };

    window.__treeFit = () => {
      if (window.__treeReset) window.__treeReset();
    };

    // Export Canvas2D propre (remplace html2canvas)
    window.__treeExport = async (format: 'png' | 'pdf') => {
      try {
        await exportFamilyTree(
          personsRef.current,
          linksRef.current,
          dimensionsRef.current,
          photoMapRef.current,
          format
        );
      } catch (err) { console.error('Export error:', err); }
    };

    return () => {
      delete window.__treeReset;
      delete window.__treeFit;
      delete window.__treeCenterOnNode;
      delete window.__treeExport;
    };
  }, [dimensions.width, dimensions.height, persons]);

  // Liens
  useEffect(() => {
    if (!gRef.current) return;
    const g = d3.select(gRef.current);
    const linkSelection = g.selectAll<SVGPathElement, TreeLink>(".link")
      .data(links, d => `${d.source.name}-${d.target.name}-${d.type}`);
    linkSelection.exit().remove();
    const linkEnter = linkSelection.enter().append("path")
      .attr("class", d => `link ${d.type}-link`)
      .attr("fill", "none")
      .attr("stroke-width", d => d.type === "spouse" ? 2 : 1.5)
      .attr("stroke", d => d.type === "spouse" ? "hsl(var(--spouse-link))" : "hsl(var(--tree-link))")
      .attr("opacity", 0.6);

    linkSelection.merge(linkEnter).transition().duration(500).attr("d", d => {
      if (d.type === "spouse") {
        return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
      } else {
        const sourceY = d.source.y + dimensions.nodeHeight / 2;
        const targetY = d.target.y - dimensions.nodeHeight / 2;
        const midY = (sourceY + targetY) / 2;
        return `M ${d.source.x} ${sourceY} C ${d.source.x} ${midY}, ${d.target.x} ${midY}, ${d.target.x} ${targetY}`;
      }
    });
  }, [links, dimensions]);

  // Noeuds
  useEffect(() => {
    if (!gRef.current) return;
    const g = d3.select(gRef.current);

    const parentMap = new Map<string, PersonNode>();
    persons.forEach(p => {
      p.enfants.forEach(childName => {
        if (!parentMap.has(childName)) parentMap.set(childName, p);
      });
    });

    const nodeSelection = g.selectAll<SVGGElement, PersonNode>(".node")
      .data(persons, d => d.name);
    nodeSelection.exit().transition().duration(300).attr("opacity", 0).remove();

    const nodeEnter = nodeSelection.enter().append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", (event, d) => { event.stopPropagation(); onNodeClick(d); })
      .attr("transform", d => {
        const parent = parentMap.get(d.name);
        return `translate(${parent?.x ?? d.x}, ${parent?.y ?? d.y})`;
      });

    nodeEnter.append("foreignObject")
      .attr("width", dimensions.nodeWidth)
      .attr("height", dimensions.nodeHeight)
      .attr("x", -dimensions.nodeWidth / 2)
      .attr("y", -dimensions.nodeHeight / 2)
      .append("xhtml:div")
      .attr("xmlns", "http://www.w3.org/1999/xhtml")
      .html(d => createNodeHTML(d, selectedPerson, dimensions, photoMap?.get(d.name)));

    const nodeUpdate = nodeSelection.merge(nodeEnter);

    nodeUpdate.transition().duration(500)
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("opacity", d =>
        highlightedGenerations && !highlightedGenerations.has(d.level) ? 0.1 : 1
      );

    nodeUpdate.select("foreignObject")
      .attr("width", dimensions.nodeWidth)
      .attr("height", dimensions.nodeHeight)
      .attr("x", -dimensions.nodeWidth / 2)
      .attr("y", -dimensions.nodeHeight / 2)
      .select("div")
      .html(d => createNodeHTML(d, selectedPerson, dimensions, photoMap?.get(d.name)));

  }, [persons, selectedPerson, dimensions, onNodeClick, photoMap, highlightedGenerations]);

  return (
    <svg
      ref={svgRef}
      width={dimensions.width}
      height={dimensions.height}
      className="w-full h-full cursor-grab active:cursor-grabbing bg-background"
      onDoubleClick={onFitToScreen}
    >
      <g ref={gRef} />
    </svg>
  );
};
