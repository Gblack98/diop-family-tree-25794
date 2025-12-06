import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { PersonNode, TreeLink, TreeDimensions } from "@/lib/familyTree/types";
import { createNodeHTML } from "./nodeHTML";

interface FamilyTreeCanvasProps {
  persons: PersonNode[];
  links: TreeLink[];
  dimensions: TreeDimensions;
  selectedPerson: PersonNode | null;
  onNodeClick: (person: PersonNode) => void;
  onReset: () => void;
  onFitToScreen: () => void;
}

export const FamilyTreeCanvas = ({
  persons,
  links,
  dimensions,
  selectedPerson,
  onNodeClick,
  onReset,
  onFitToScreen,
}: FamilyTreeCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();

  // Initialize zoom
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 3]) // Permet de dézoomer très loin
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Initial view
    setTimeout(() => {
      (window as any).__treeReset?.();
    }, 100);
  }, [onReset]);

  // Update reset and fit functions
  useEffect(() => {
    (window as any).__treeReset = () => {
      if (!svgRef.current || !zoomRef.current) return;
      const svg = d3.select(svgRef.current);
      
      // AJUSTEMENT SMARTPHONE : Zoom initial plus faible (0.5) pour voir plus de monde
      const isMobile = dimensions.width < 768;
      const initialScale = isMobile ? 0.5 : 0.7;
      const initialY = isMobile ? 50 : 100;

      svg
        .transition()
        .duration(750)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(dimensions.width / 2, initialY).scale(initialScale)
        );
    };

    (window as any).__treeFit = () => {
      if (!svgRef.current || !gRef.current || !zoomRef.current) return;
      
      const svg = d3.select(svgRef.current);
      const g = gRef.current;
      const bounds = g.getBBox();
      
      if (bounds.width === 0 || bounds.height === 0) return;

      const fullWidth = bounds.width;
      const fullHeight = bounds.height;
      const midX = bounds.x + fullWidth / 2;
      const midY = bounds.y + fullHeight / 2;
      
      // Marge plus petite sur mobile
      const margin = dimensions.width < 768 ? 0.95 : 0.85;

      const scale =
        margin /
        Math.max(fullWidth / dimensions.width, fullHeight / dimensions.height);
      
      const translate = [
        dimensions.width / 2 - scale * midX,
        dimensions.height / 2 - scale * midY,
      ];

      svg
        .transition()
        .duration(750)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    };
    
    // (Le code d'export reste identique à votre version précédente)
    // ... j'ai omis l'export ici pour la clarté, gardez votre code existant pour __treeExport

    return () => {
      delete (window as any).__treeReset;
      delete (window as any).__treeFit;
      // delete (window as any).__treeExport; 
    };
  }, [dimensions.width, dimensions.height]); 

  // Render links
  useEffect(() => {
    if (!gRef.current) return;

    const g = d3.select(gRef.current);
    const linkSelection = g
      .selectAll<SVGPathElement, TreeLink>(".link")
      .data(links, (d) => `${d.source.name}-${d.target.name}-${d.type}`);

    linkSelection.exit().remove();

    const linkEnter = linkSelection
      .enter()
      .append("path")
      .attr("class", (d) => `link ${d.type}-link`)
      .attr("fill", "none")
      .attr("stroke-width", (d) => d.type === "spouse" ? 2 : 1.5) // Traits plus fins
      .attr("opacity", (d) => d.type === "spouse" ? 0.6 : 0.4)
      .attr("stroke", (d) =>
        d.type === "spouse"
          ? "hsl(var(--primary))"
          : "hsl(var(--tree-link))"
      )
      .attr("stroke-dasharray", "0");

    linkSelection
      .merge(linkEnter)
      .transition()
      .duration(500)
      .attr("d", (d) => {
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

  // Render and update nodes
  useEffect(() => {
    if (!gRef.current) return;

    const g = d3.select(gRef.current);
    const nodeSelection = g
      .selectAll<SVGGElement, PersonNode>(".node")
      .data(persons, (d) => d.name);

    nodeSelection.exit()
      .transition()
      .duration(300)
      .attr("opacity", 0)
      .remove();

    const nodeEnter = nodeSelection
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeClick(d);
      });

    nodeEnter.attr("transform", (d) => {
        const parent = persons.find(p => p.enfants.includes(d.name));
        const x = parent?.x ?? d.x;
        const y = parent?.y ?? d.y;
        return `translate(${x}, ${y})`;
    });

    nodeEnter
      .append("foreignObject")
      .attr("width", dimensions.nodeWidth)
      .attr("height", dimensions.nodeHeight)
      .attr("x", -dimensions.nodeWidth / 2)
      .attr("y", -dimensions.nodeHeight / 2)
      .append("xhtml:div")
        .attr("xmlns", "http://www.w3.org/1999/xhtml")
        .html((d) => createNodeHTML(d, selectedPerson, dimensions));

    const nodeUpdate = nodeSelection.merge(nodeEnter);

    nodeUpdate
      .transition()
      .duration(500)
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    
    // IMPORTANT : Mise à jour dynamique de la taille du foreignObject
    nodeUpdate.select("foreignObject")
      .attr("width", dimensions.nodeWidth)
      .attr("height", dimensions.nodeHeight)
      .attr("x", -dimensions.nodeWidth / 2)
      .attr("y", -dimensions.nodeHeight / 2);

    nodeUpdate.select<HTMLDivElement>("foreignObject > div")
      .html((d) => createNodeHTML(d, selectedPerson, dimensions));

  }, [persons, selectedPerson, dimensions, onNodeClick]);

  return (
    <svg
      ref={svgRef}
      width={dimensions.width}
      height={dimensions.height}
      className="w-full h-full cursor-grab active:cursor-grabbing bg-background"
    >
      <g ref={gRef} />
    </svg>
  );
};