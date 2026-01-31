import { useEffect, useRef } from "react";
import * as d3 from "d3";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { PersonNode, TreeLink, TreeDimensions } from "@/lib/familyTree/types";
import { createNodeHTML } from "./nodeHTML";

// Extension de Window pour les fonctions globales de l'arbre
declare global {
  interface Window {
    __treeCenterOnNode?: (node: PersonNode) => void;
    __treeReset?: () => void;
    __treeFit?: () => void;
    __treeExport?: (format: 'png' | 'pdf') => Promise<void>;
  }
}

// Interface standard
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

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 4]).on("zoom", (event) => {
        g.attr("transform", event.transform);
    });
    svg.call(zoom);
    zoomRef.current = zoom;
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

    // RESET (CENTRAGE PARFAIT - basé sur le centre de tous les nœuds visibles)
    window.__treeReset = () => {
      if (!svgRef.current || !zoomRef.current || persons.length === 0) return;
      const svg = d3.select(svgRef.current);

      // Calculer la bounding box de tous les nœuds visibles
      const xs = persons.map(p => p.x);
      const ys = persons.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      // Centre réel de l'arbre
      const treeCenterX = (minX + maxX) / 2;
      const treeCenterY = (minY + maxY) / 2;

      // Dimensions de l'arbre
      const treeWidth = maxX - minX + dimensions.nodeWidth * 2;
      const treeHeight = maxY - minY + dimensions.nodeHeight * 2;

      const isMobile = dimensions.width < 640;
      const isTablet = dimensions.width >= 640 && dimensions.width < 1024;

      // Calculer le zoom optimal pour que l'arbre rentre dans l'écran
      const headerOffset = isMobile ? 80 : isTablet ? 70 : 60;
      const availableWidth = dimensions.width * 0.9;
      const availableHeight = (dimensions.height - headerOffset) * 0.85;

      const scaleX = availableWidth / treeWidth;
      const scaleY = availableHeight / treeHeight;

      // Prendre le zoom minimum entre X et Y, avec des limites raisonnables
      const maxInitialScale = isMobile ? 0.6 : isTablet ? 0.75 : 0.85;
      const minInitialScale = isMobile ? 0.25 : isTablet ? 0.35 : 0.4;
      const initialScale = Math.max(minInitialScale, Math.min(maxInitialScale, Math.min(scaleX, scaleY)));

      // Centrer sur le centre réel de l'arbre
      const x = dimensions.width / 2 - (treeCenterX * initialScale);
      const y = (dimensions.height / 2) - (treeCenterY * initialScale) + (headerOffset / 4);

      svg.transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(x, y).scale(initialScale)
      );
    };

    window.__treeFit = () => {
       if(window.__treeReset) window.__treeReset();
    };

    window.__treeExport = async (format: 'png' | 'pdf') => {
       if (!svgRef.current || !gRef.current) return;
      try {
        const svg = svgRef.current;
        const g = gRef.current;
        const bounds = g.getBBox();
        if (bounds.width === 0) return;

        const padding = 50;
        const exportWidth = bounds.width + padding * 2;
        const exportHeight = bounds.height + padding * 2;
        
        const exportContainer = document.createElement('div');
        exportContainer.style.position = 'absolute';
        exportContainer.style.left = '-9999px';
        exportContainer.style.width = `${exportWidth}px`;
        exportContainer.style.height = `${exportHeight}px`;
        exportContainer.style.backgroundColor = '#ffffff'; 
        document.body.appendChild(exportContainer);
        
        const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
        clonedSvg.setAttribute('width', String(exportWidth));
        clonedSvg.setAttribute('height', String(exportHeight));
        clonedSvg.style.width = `${exportWidth}px`;
        clonedSvg.style.height = `${exportHeight}px`;
        
        const clonedG = clonedSvg.querySelector('g');
        if (clonedG) {
          const translateX = -bounds.x + padding;
          const translateY = -bounds.y + padding;
          clonedG.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(1)`);
        }
        exportContainer.appendChild(clonedSvg);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const canvas = await html2canvas(exportContainer, { backgroundColor: '#ffffff', scale: 2 });
        document.body.removeChild(exportContainer);
        
        if (format === 'png') {
          const link = document.createElement('a');
          link.download = `famille-diop-${new Date().toISOString().split('T')[0]}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        } else {
          const imgData = canvas.toDataURL('image/png');
          const mmWidth = canvas.width * 0.264583 / 2; 
          const mmHeight = canvas.height * 0.264583 / 2;
          const pdf = new jsPDF({
            orientation: mmWidth > mmHeight ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [mmWidth + 20, mmHeight + 20],
          });
          pdf.addImage(imgData, 'PNG', 10, 10, mmWidth, mmHeight);
          pdf.save(`famille-diop-${new Date().toISOString().split('T')[0]}.pdf`);
        }
      } catch (error) { console.error(error); }
    };

    return () => {
      delete window.__treeReset; delete window.__treeFit; delete window.__treeCenterOnNode; delete window.__treeExport;
    };
  }, [dimensions.width, dimensions.height, persons]); 

  // Liens (Vertical Classique)
  useEffect(() => {
    if (!gRef.current) return;
    const g = d3.select(gRef.current);
    const linkSelection = g.selectAll<SVGPathElement, TreeLink>(".link").data(links, d => `${d.source.name}-${d.target.name}-${d.type}`);
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

    // Pre-compute parent map for O(1) lookups instead of O(n)
    const parentMap = new Map<string, PersonNode>();
    persons.forEach(p => {
      p.enfants.forEach(childName => {
        if (!parentMap.has(childName)) {
          parentMap.set(childName, p);
        }
      });
    });

    const nodeSelection = g.selectAll<SVGGElement, PersonNode>(".node").data(persons, d => d.name);
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
      .attr("width", dimensions.nodeWidth).attr("height", dimensions.nodeHeight)
      .attr("x", -dimensions.nodeWidth / 2).attr("y", -dimensions.nodeHeight / 2)
      .append("xhtml:div").attr("xmlns", "http://www.w3.org/1999/xhtml")
      .html(d => createNodeHTML(d, selectedPerson, dimensions));

    const nodeUpdate = nodeSelection.merge(nodeEnter);
    nodeUpdate.transition().duration(500).attr("transform", d => `translate(${d.x}, ${d.y})`);
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