import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { PersonNode, TreeLink, TreeDimensions } from "@/lib/familyTree/types";

interface FamilyTreeCanvasProps {
  persons: PersonNode[];
  links: TreeLink[];
  dimensions: TreeDimensions;
  selectedPerson: PersonNode | null;
  onNodeClick: (person: PersonNode) => void;
  onReset: () => void;
  onFitToScreen: () => void;
  onExportRequest?: (format: 'png' | 'pdf') => void;
}

export const FamilyTreeCanvas = ({
  persons,
  links,
  dimensions,
  selectedPerson,
  onNodeClick,
  onReset,
  onFitToScreen,
  onExportRequest,
}: FamilyTreeCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();

  // Initialize zoom
  useEffect(() => {
    if (!svgRef.current) return;

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
      onReset();
    }, 100);
  }, []);

  // Update reset and fit functions
  useEffect(() => {
    const resetView = () => {
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

    const fitToScreen = () => {
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

    const exportTree = async (format: 'png' | 'pdf') => {
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

    // Store methods globally for header buttons
    (window as any).__treeReset = resetView;
    (window as any).__treeFit = fitToScreen;
    (window as any).__treeExport = exportTree;

    return () => {
      delete (window as any).__treeReset;
      delete (window as any).__treeFit;
      delete (window as any).__treeExport;
    };
  }, [dimensions]);

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

  // Render nodes
  useEffect(() => {
    if (!gRef.current) return;

    const g = d3.select(gRef.current);
    const nodeSelection = g
      .selectAll<SVGGElement, PersonNode>(".node")
      .data(persons, (d) => d.name);

    nodeSelection.exit().remove();

    const nodeEnter = nodeSelection
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeClick(d);
      });

    // Add foreignObject for HTML content
    const fo = nodeEnter
      .append("foreignObject")
      .attr("width", dimensions.nodeWidth)
      .attr("height", dimensions.nodeHeight)
      .attr("x", -dimensions.nodeWidth / 2)
      .attr("y", -dimensions.nodeHeight / 2);

    fo.append("xhtml:div")
      .attr("xmlns", "http://www.w3.org/1999/xhtml")
      .html((d) => createNodeHTML(d, selectedPerson));

    // Update existing nodes
    const nodeUpdate = nodeSelection.merge(nodeEnter);

    nodeUpdate
      .transition()
      .duration(500)
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    nodeUpdate
      .select("foreignObject > div")
      .html((d) => createNodeHTML(d, selectedPerson));
  }, [persons, selectedPerson, dimensions, onNodeClick]);

  return (
    <svg
      ref={svgRef}
      width={dimensions.width}
      height={dimensions.height}
      className="w-full h-full cursor-grab active:cursor-grabbing"
    >
      <g ref={gRef} />
    </svg>
  );
};

function createNodeHTML(person: PersonNode, selectedPerson: PersonNode | null): string {
  const initial = person.name.charAt(0).toUpperCase();
  const childCount = person.enfants.length;
  const hasHiddenChildren = childCount > 0 && !person.expanded;
  const isSelected = selectedPerson?.name === person.name;

  const avatarColor =
    person.genre === "Homme"
      ? "background: linear-gradient(135deg, hsl(var(--male)), hsl(210 100% 46%));"
      : "background: linear-gradient(135deg, hsl(var(--female)), hsl(330 76% 48%));";

  const borderColor =
    person.genre === "Homme" ? "hsl(var(--male))" : "hsl(var(--female))";

  return `
    <div style="
      width: calc(100% - 4px);
      height: calc(100% - 4px);
      margin: 2px;
      background: hsl(var(--card));
      border: ${isSelected ? "3px" : "2px"} solid ${borderColor};
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    ">
      <div style="
        padding: 10px;
        border-bottom: 1px solid hsl(var(--border));
        display: flex;
        align-items: center;
        gap: 8px;
        background: hsl(var(--card));
      ">
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          ${avatarColor}
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          color: white;
          flex-shrink: 0;
        ">${initial}</div>
        <div style="flex: 1; min-width: 0;">
          <div style="
            font-weight: 600;
            font-size: 13px;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: hsl(var(--foreground));
          ">${person.name}</div>
          <div style="
            font-size: 11px;
            color: hsl(var(--muted-foreground));
          ">Génération ${person.level}</div>
        </div>
      </div>
      <div style="padding: 10px; flex: 1; display: flex; align-items: center;">
        <div style="
          display: flex;
          gap: 12px;
          font-size: 12px;
          width: 100%;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            color: hsl(var(--muted-foreground));
          ">👥 ${person.parents.length}</div>
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            color: hsl(var(--muted-foreground));
          ">💑 ${person.spouses.length}</div>
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            color: hsl(var(--muted-foreground));
          ">👶 ${childCount}</div>
        </div>
      </div>
      ${
        hasHiddenChildren
          ? `<div style="
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          background: hsl(var(--primary));
          color: white;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 13px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          border: 2px solid hsl(var(--background));
        ">+${childCount}</div>`
          : ""
      }
    </div>
  `;
}
