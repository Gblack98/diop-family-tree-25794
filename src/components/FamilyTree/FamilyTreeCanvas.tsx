import { useEffect, useRef } from "react";
import * as d3 from "d3";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
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

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;
  }, []);

  useEffect(() => {
    // --- GESTION DES COMMANDES (Centrer, Fit, Reset) ---

    (window as any).__treeCenterOnNode = (node: PersonNode) => {
      if (!svgRef.current || !zoomRef.current) return;
      const svg = d3.select(svgRef.current);
      
      const scale = 1.1; 
      const x = -node.x * scale + dimensions.width / 2;
      const y = -node.y * scale + dimensions.height / 2 - (dimensions.width < 640 ? 50 : 0);

      svg.transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(x, y).scale(scale)
      );
    };

    (window as any).__treeFit = () => {
      if (!svgRef.current || !gRef.current || !zoomRef.current) return;
      
      const svg = d3.select(svgRef.current);
      const g = gRef.current;
      const bounds = g.getBBox();
      
      if (bounds.width === 0 || bounds.height === 0) return;

      const midX = bounds.x + bounds.width / 2;
      const midY = bounds.y + bounds.height / 2;
      const margin = 0.9;
      const scale = margin / Math.max(bounds.width / dimensions.width, bounds.height / dimensions.height);
      const clampledScale = Math.min(Math.max(scale, 0.2), 1.5);

      const translate = [
        dimensions.width / 2 - clampledScale * midX,
        dimensions.height / 2 - clampledScale * midY + 40, 
      ];

      svg.transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(clampledScale)
      );
    };

    // NOUVEAU RESET : Position standard (Racine en haut au centre)
    (window as any).__treeReset = () => {
      if (!svgRef.current || !zoomRef.current || persons.length === 0) return;
      const svg = d3.select(svgRef.current);

      // On vise la racine (Generation 0)
      const rootNode = persons.find(p => p.level === 0) || persons[0];
      
      // Zoom initial par défaut
      const initialScale = dimensions.width < 640 ? 0.6 : 0.8;
      
      // On centre horizontalement sur la racine, et on la place un peu en haut
      const x = -rootNode.x * initialScale + dimensions.width / 2;
      const y = 80; // Marge du haut fixe

      svg.transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(x, y).scale(initialScale)
      );
    };

    // --- FONCTION D'EXPORTATION CORRIGÉE ---
    (window as any).__treeExport = async (format: 'png' | 'pdf') => {
      if (!svgRef.current || !gRef.current) return;
      
      try {
        const svg = svgRef.current;
        const g = gRef.current;
        const bounds = g.getBBox();
        
        if (bounds.width === 0 || bounds.height === 0) {
          alert('Arbre vide ou non chargé');
          return;
        }

        // 1. Préparation du conteneur temporaire
        const padding = 50;
        const exportWidth = bounds.width + padding * 2;
        const exportHeight = bounds.height + padding * 2;
        
        const exportContainer = document.createElement('div');
        exportContainer.style.position = 'absolute';
        exportContainer.style.left = '-9999px';
        exportContainer.style.top = '0';
        exportContainer.style.width = `${exportWidth}px`;
        exportContainer.style.height = `${exportHeight}px`;
        exportContainer.style.backgroundColor = '#ffffff'; // Fond blanc important pour le PNG
        document.body.appendChild(exportContainer);
        
        // 2. Clonage du SVG
        const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
        
        // 3. Ajustement du clone pour qu'il soit parfaitement cadré
        clonedSvg.setAttribute('width', String(exportWidth));
        clonedSvg.setAttribute('height', String(exportHeight));
        clonedSvg.style.width = `${exportWidth}px`;
        clonedSvg.style.height = `${exportHeight}px`;
        
        // On cherche le groupe <g> à l'intérieur du clone pour le déplacer
        const clonedG = clonedSvg.querySelector('g');
        if (clonedG) {
          // On annule le zoom actuel et on translate pour centrer dans l'export
          const translateX = -bounds.x + padding;
          const translateY = -bounds.y + padding;
          clonedG.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(1)`);
        }

        exportContainer.appendChild(clonedSvg);
        
        // 4. Capture avec html2canvas
        // Le délai permet au navigateur de rendre les polices et images dans le clone
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const canvas = await html2canvas(exportContainer, {
          backgroundColor: '#ffffff',
          scale: 2, // Haute résolution
          logging: false,
          useCORS: true,
          allowTaint: true,
        });
        
        // Nettoyage
        document.body.removeChild(exportContainer);
        
        if (format === 'png') {
          // Export PNG
          const link = document.createElement('a');
          link.download = `famille-diop-${new Date().toISOString().split('T')[0]}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        } else {
          // Export PDF
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          
          // Conversion pixels -> mm (approximation A0/A1 selon la taille)
          const mmWidth = imgWidth * 0.264583 / 2; 
          const mmHeight = imgHeight * 0.264583 / 2;
          
          const pdf = new jsPDF({
            orientation: mmWidth > mmHeight ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [mmWidth + 20, mmHeight + 20], // Marge de 10mm
          });

          pdf.addImage(imgData, 'PNG', 10, 10, mmWidth, mmHeight);
          pdf.save(`famille-diop-${new Date().toISOString().split('T')[0]}.pdf`);
        }
      } catch (error) {
        console.error('Erreur export:', error);
        alert('Une erreur est survenue lors de l\'exportation. Vérifiez la console.');
      }
    };

    return () => {
      delete (window as any).__treeReset;
      delete (window as any).__treeFit;
      delete (window as any).__treeCenterOnNode;
      delete (window as any).__treeExport;
    };
  }, [dimensions.width, dimensions.height, persons]); 

  // --- RENDU DES LIENS ET NOEUDS (Reste identique) ---
  useEffect(() => {
    if (!gRef.current) return;
    const g = d3.select(gRef.current);
    const linkSelection = g.selectAll<SVGPathElement, TreeLink>(".link").data(links, d => `${d.source.name}-${d.target.name}-${d.type}`);

    linkSelection.exit().remove();
    const linkEnter = linkSelection.enter().append("path")
      .attr("class", d => `link ${d.type}-link`)
      .attr("fill", "none")
      .attr("stroke-width", d => d.type === "spouse" ? 2.5 : 1.5)
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
      .attr("transform", d => {
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