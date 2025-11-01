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
      .scaleExtent([0.1, 3])
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
      svg
        .transition()
        .duration(750)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(dimensions.width / 2, 100).scale(0.7)
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

      const scale =
        0.85 /
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

    (window as any).__treeExport = async (format: 'png' | 'pdf') => {
      if (!svgRef.current || !gRef.current) return;
      
      try {
      // @ts-ignore - html2canvas types are not available in this project, use as any
      const html2canvas = (await import('html2canvas')).default as any;
      const svg = svgRef.current;
      const g = gRef.current;
      const bounds = g.getBBox();
        
        if (bounds.width === 0 || bounds.height === 0) {
          console.error('Empty tree bounds');
          return;
        }

        // Temporairement désactiver le zoom et recentrer l'arbre
        const currentTransform = d3.select(g).attr('transform');
        
        // Calculer les dimensions pour l'export (haute résolution)
        const padding = 100;
        const exportWidth = bounds.width + padding * 2;
        const exportHeight = bounds.height + padding * 2;
        
        // Positionner l'arbre pour l'export
        d3.select(g).attr('transform', `translate(${-bounds.x + padding}, ${-bounds.y + padding})`);
        
        // Créer un conteneur temporaire pour l'export
        const exportContainer = document.createElement('div');
        exportContainer.style.position = 'absolute';
        exportContainer.style.left = '-9999px';
        exportContainer.style.top = '0';
        exportContainer.style.width = `${exportWidth}px`;
        exportContainer.style.height = `${exportHeight}px`;
        exportContainer.style.background = 'white';
        document.body.appendChild(exportContainer);
        
        // Cloner le SVG dans le conteneur
        const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
        clonedSvg.setAttribute('width', String(exportWidth));
        clonedSvg.setAttribute('height', String(exportHeight));
        exportContainer.appendChild(clonedSvg);
        
        // Attendre que le DOM soit mis à jour
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Capturer avec html2canvas à haute résolution
        const canvas = await html2canvas(exportContainer, {
          backgroundColor: '#ffffff',
          scale: 3, // Haute résolution pour impression
          logging: false,
          useCORS: true,
          allowTaint: true,
          width: exportWidth,
          height: exportHeight,
        });
        
        // Restaurer la position d'origine
        d3.select(g).attr('transform', currentTransform);
        document.body.removeChild(exportContainer);
        
        if (format === 'png') {
          // Export PNG
          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.download = `arbre-genealogique-famille-diop-${new Date().toISOString().split('T')[0]}.png`;
              link.href = URL.createObjectURL(blob);
              link.click();
              URL.revokeObjectURL(link.href);
            }
          }, 'image/png', 1.0);
        } else {
          // Export PDF
          // @ts-ignore - jsPDF types not installed in this project
          const { jsPDF } = await import('jspdf');
          
          const imgData = canvas.toDataURL('image/png', 1.0);
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          
          // Calculer les dimensions PDF en mm (format A0 ou plus grand)
          const mmWidth = Math.max(imgWidth * 0.264583 / 3, 1189); // A0 width minimum
          const mmHeight = Math.max(imgHeight * 0.264583 / 3, 841); // A0 height minimum
          
          const pdf = new jsPDF({
            orientation: mmWidth > mmHeight ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [mmWidth, mmHeight],
            compress: true,
          });

          pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight, '', 'FAST');
          pdf.save(`arbre-genealogique-famille-diop-${new Date().toISOString().split('T')[0]}.pdf`);
        }
      } catch (error) {
        console.error('Export error:', error);
        alert('Erreur lors de l\'export. Veuillez réessayer.');
      }
    };

    return () => {
      delete (window as any).__treeReset; // Cleanup
      delete (window as any).__treeFit;   // Cleanup
      delete (window as any).__treeExport; // Cleanup
    };
  }, [dimensions.width, dimensions.height]); // Dependencies are more specific

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
      .attr("stroke-width", (d) => d.type === "spouse" ? 3 : 2.5)
      .attr("opacity", (d) => d.type === "spouse" ? 0.7 : 0.5)
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

    // --- Exit ---
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

    // Position entering nodes at their parent's previous position for a smooth transition.
    nodeEnter.attr("transform", (d) => {
        const parent = persons.find(p => p.enfants.includes(d.name));
        const x = parent?.x ?? d.x;
        const y = parent?.y ?? d.y;
        return `translate(${x}, ${y})`;
    });

    // --- Enter: Add foreignObject for HTML content ---
    nodeEnter
      .append("foreignObject")
      .attr("width", dimensions.nodeWidth)
      .attr("height", dimensions.nodeHeight)
      .attr("x", -dimensions.nodeWidth / 2)
      .attr("y", -dimensions.nodeHeight / 2)
      .append("xhtml:div")
        .attr("xmlns", "http://www.w3.org/1999/xhtml")
        .html((d) => createNodeHTML(d, selectedPerson, dimensions));

    // --- Update + Enter ---
    const nodeUpdate = nodeSelection.merge(nodeEnter);

    nodeUpdate
      .transition()
      .duration(500)
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    
    // Only update the HTML content, no need to re-create the whole foreignObject
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
