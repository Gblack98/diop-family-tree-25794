import { useEffect, useState, useMemo } from "react";
import { PersonNode } from "@/lib/familyTree/types";

interface MinimapProps {
  persons: PersonNode[];
  nodeWidth: number;
  nodeHeight: number;
  viewWidth: number;
  viewHeight: number;
}

const MINI_W = 150;
const MINI_H = 100;

export const Minimap = ({ persons, nodeWidth, nodeHeight, viewWidth, viewHeight }: MinimapProps) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });

  // Polling du transform courant (via global exposé par FamilyTreeCanvas)
  useEffect(() => {
    const interval = setInterval(() => {
      const t = window.__treeCurrentTransform;
      if (t) {
        setTransform(prev => {
          if (
            Math.abs(t.x - prev.x) < 0.5 &&
            Math.abs(t.y - prev.y) < 0.5 &&
            Math.abs(t.k - prev.k) < 0.001
          ) return prev;
          return { x: t.x, y: t.y, k: t.k };
        });
      }
    }, 120); // ~8fps — suffisant pour un minimap
    return () => clearInterval(interval);
  }, []);

  // Calcul de la bounding box de tous les nœuds
  const bounds = useMemo(() => {
    if (persons.length === 0) return null;
    const xs = persons.map(p => p.x);
    const ys = persons.map(p => p.y);
    return {
      minX: Math.min(...xs) - nodeWidth / 2,
      maxX: Math.max(...xs) + nodeWidth / 2,
      minY: Math.min(...ys) - nodeHeight / 2,
      maxY: Math.max(...ys) + nodeHeight / 2,
    };
  }, [persons, nodeWidth, nodeHeight]);

  if (!bounds || persons.length === 0) return null;

  const treeW = bounds.maxX - bounds.minX || 1;
  const treeH = bounds.maxY - bounds.minY || 1;

  // Échelle pour faire entrer l'arbre dans le minimap
  const scale = Math.min((MINI_W - 8) / treeW, (MINI_H - 8) / treeH);
  const offsetX = (MINI_W - treeW * scale) / 2;
  const offsetY = (MINI_H - treeH * scale) / 2;

  // Conversion coordonnées arbre → minimap
  const toMini = (x: number, y: number) => ({
    mx: (x - bounds.minX) * scale + offsetX,
    my: (y - bounds.minY) * scale + offsetY,
  });

  // Rectangle du viewport en coordonnées arbre
  // Le transform D3 : screenX = treeX * k + tx  =>  treeX = (screenX - tx) / k
  const vpTreeLeft = -transform.x / transform.k;
  const vpTreeTop = -transform.y / transform.k;
  const vpTreeW = viewWidth / transform.k;
  const vpTreeH = viewHeight / transform.k;

  // Rectangle du viewport en coordonnées minimap
  const vp = {
    x: (vpTreeLeft - bounds.minX) * scale + offsetX,
    y: (vpTreeTop - bounds.minY) * scale + offsetY,
    w: vpTreeW * scale,
    h: vpTreeH * scale,
  };

  // Taille des nœuds dans le minimap
  const dotW = Math.max(2, nodeWidth * scale);
  const dotH = Math.max(1.5, nodeHeight * scale);

  return (
    <div
      className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-lg shadow-lg overflow-hidden"
      style={{ width: MINI_W, height: MINI_H }}
      title="Minimap — aperçu de l'arbre"
    >
      <svg width={MINI_W} height={MINI_H}>
        {/* Fond */}
        <rect width={MINI_W} height={MINI_H} fill="transparent" />

        {/* Nœuds comme rectangles colorés */}
        {persons.map(p => {
          const { mx, my } = toMini(p.x, p.y);
          return (
            <rect
              key={p.name}
              x={mx - dotW / 2}
              y={my - dotH / 2}
              width={dotW}
              height={dotH}
              rx={1}
              fill={p.genre === 'Homme' ? 'hsl(200, 80%, 55%)' : 'hsl(340, 70%, 60%)'}
              opacity={0.75}
            />
          );
        })}

        {/* Rectangle viewport */}
        <rect
          x={vp.x}
          y={vp.y}
          width={Math.max(0, vp.w)}
          height={Math.max(0, vp.h)}
          fill="hsl(var(--primary) / 0.08)"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          strokeDasharray="3,2"
          rx={2}
        />
      </svg>
    </div>
  );
};
