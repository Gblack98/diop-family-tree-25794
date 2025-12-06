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

  // Initialisation du zoom
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4]) // Zoom max un peu plus grand
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;
  }, []);

  // Définition des fonctions globales (Fit, Reset, CenterOnNode)
  useEffect(() => {
    // CENTRER SUR UN NOEUD SPÉCIFIQUE
    (window as any).__treeCenterOnNode = (node: PersonNode) => {
      if (!svgRef.current || !zoomRef.current) return;
      const svg = d3.select(svgRef.current);
      
      const scale = 1.1; // Zoom agréable pour voir la personne
      // On centre le noeud au milieu de l'écran (avec un offset pour le panel du bas sur mobile)
      const x = -node.x * scale + dimensions.width / 2;
      const y = -node.y * scale + dimensions.height / 2 - (dimensions.width < 640 ? 50 : 0);

      svg.transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(x, y).scale(scale)
      );
    };

    // AJUSTER TOUT L'ARBRE (FIT)
    (window as any).__treeFit = () => {
      if (!svgRef.current || !gRef.current || !zoomRef.current) return;
      
      const svg = d3.select(svgRef.current);
      const g = gRef.current;
      const bounds = g.getBBox();
      
      if (bounds.width === 0 || bounds.height === 0) return;

      // Calcul du centre géométrique de l'arbre
      const midX = bounds.x + bounds.width / 2;
      const midY = bounds.y + bounds.height / 2;

      // Marge de sécurité (0.9 = 90% de l'écran utilisé)
      const margin = 0.9;
      const scale = margin / Math.max(bounds.width / dimensions.width, bounds.height / dimensions.height);
      
      // Limiter le zoom min/max pour ne pas avoir un arbre minuscule ou énorme
      const clampledScale = Math.min(Math.max(scale, 0.2), 1.5);

      const translate = [
        dimensions.width / 2 - clampledScale * midX,
        dimensions.height / 2 - clampledScale * midY + 40, // +40 pour descendre un peu sous le header
      ];

      svg
        .transition()
        .duration(750)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(clampledScale)
        );
    };

    // RESET (Retour en haut de l'arbre)
    (window as any).__treeReset = () => {
       (window as any).__treeFit(); // Par défaut, on "Fit" tout l'écran maintenant, c'est mieux
    };

    // Export (gardé tel quel mais je le remets pour être complet)
     (window as any).__treeExport = async (format: 'png' | 'pdf') => {
        // ... (votre code d'export existant est très bien, gardez-le)
    };

    return () => {
      delete (window as any).__treeReset;
      delete (window as any).__treeFit;
      delete (window as any).__treeCenterOnNode;
      // delete (window as any).__treeExport;
    };
  }, [dimensions.width, dimensions.height]); 

  // --- Rendu des Liens (Même logique, ajustement des épaisseurs pour le style) ---
  useEffect(() => {
    if (!gRef.current) return;
    const g = d3.select(gRef.current);
    const linkSelection = g.selectAll<SVGPathElement, TreeLink>(".link").data(links, d => `${d.source.name}-${d.target.name}-${d.type}`);

    linkSelection.exit().remove();
    const linkEnter = linkSelection.enter().append("path")
      .attr("class", d => `link ${d.type}-link`)
      .attr("fill", "none")
      .attr("stroke-width", d => d.type === "spouse" ? 2.5 : 1.5) // Spouse plus visible
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

  // --- Rendu des Noeuds ---
  useEffect(() => {
    if (!gRef.current) return;
    const g = d3.select(gRef.current);
    const nodeSelection = g.selectAll<SVGGElement, PersonNode>(".node").data(persons, d => d.name);

    nodeSelection.exit().transition().duration(300).attr("opacity", 0).remove();

    const nodeEnter = nodeSelection.enter().append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeClick(d);
      })
      .attr("transform", d => { // Apparition depuis le parent
          const parent = persons.find(p => p.enfants.includes(d.name));
          return `translate(${parent?.x ?? d.x}, ${parent?.y ?? d.y})`;
      });

    nodeEnter.append("foreignObject")
      .attr("width", dimensions.nodeWidth).attr("height", dimensions.nodeHeight)
      .attr("x", -dimensions.nodeWidth / 2).attr("y", -dimensions.nodeHeight / 2)
      .append("xhtml:div").attr("xmlns", "http://www.w3.org/1999/xhtml")
      .html(d => createNodeHTML(d, selectedPerson, dimensions));

    const nodeUpdate = nodeSelection.merge(nodeEnter);
    nodeUpdate.transition().duration(500).attr("transform", d => `translate(${d.x}, ${d.y})`);
    
    // Mise à jour taille et contenu
    nodeUpdate.select("foreignObject")
      .attr("width", dimensions.nodeWidth).attr("height", dimensions.nodeHeight)
      .attr("x", -dimensions.nodeWidth / 2).attr("y", -dimensions.nodeHeight / 2)
      .select("div").html(d => createNodeHTML(d, selectedPerson, dimensions));

  }, [persons, selectedPerson, dimensions, onNodeClick]);

  return (
    <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full cursor-grab active:cursor-grabbing bg-background" onDoubleClick={onFitToScreen}>
      <g ref={gRef} />
    </svg>
  );
};