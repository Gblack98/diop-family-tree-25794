import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FamilyTreeEngine } from "@/lib/familyTree/FamilyTreeEngine";
import { familyData } from "@/lib/familyTree/data";
import { PersonNode } from "@/lib/familyTree/types";
import { ArrowLeft, Home, Users, Heart, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as d3 from "d3";

/**
 * Vue Constellation - Affichage dynamique et libre
 * Pour les personnes avec 5+ enfants et/ou mariages multiples
 * Canvas SVG avec zoom/pan + liaisons tracées
 */

interface NodePosition {
  person: PersonNode;
  x: number;
  y: number;
  type: "central" | "spouse" | "child";
}

export const ConstellationFamilyView = () => {
  const { personName } = useParams<{ personName: string }>();
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  const [engine] = useState(() => new FamilyTreeEngine(familyData, {
    width: window.innerWidth,
    height: window.innerHeight,
    nodeWidth: 160,
    nodeHeight: 80,
    levelHeight: 140,
    coupleSpacing: 30,
    siblingSpacing: 35
  }));

  const [focusPerson, setFocusPerson] = useState<PersonNode | null>(null);
  const [positions, setPositions] = useState<NodePosition[]>([]);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight - 120 : 800
  });
  const [hoveredPerson, setHoveredPerson] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  // Calculer les positions en constellation
  const calculatePositions = (person: PersonNode): NodePosition[] => {
    const newPositions: NodePosition[] = [];
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    // Responsive radii - AUGMENTÉS pour meilleur espacement
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;
    const spouseRadius = isMobile ? 220 : isTablet ? 300 : 380;
    const childRadius = isMobile ? 150 : isTablet ? 200 : 260;

    // 1. Position centrale
    newPositions.push({
      person,
      x: centerX,
      y: centerY,
      type: "central"
    });

    // 2. Grouper enfants par mère
    const spousesWithChildren = new Map<string, string[]>();
    person.spouses.forEach(spouseName => {
      const spouse = engine.getPerson(spouseName);
      if (spouse) {
        const commonChildren = person.enfants.filter(childName => {
          const child = engine.getPerson(childName);
          return child && child.parents.includes(spouseName);
        });
        spousesWithChildren.set(spouseName, commonChildren);
      }
    });

    // 3. Positionner les conjoints en cercle
    const spouseCount = spousesWithChildren.size;
    spousesWithChildren.forEach((children, spouseName, index) => {
      const i = Array.from(spousesWithChildren.keys()).indexOf(spouseName);
      const angle = (i / spouseCount) * 2 * Math.PI - Math.PI / 2;
      const spouse = engine.getPerson(spouseName);

      if (spouse) {
        const spouseX = centerX + Math.cos(angle) * spouseRadius;
        const spouseY = centerY + Math.sin(angle) * spouseRadius;

        newPositions.push({
          person: spouse,
          x: spouseX,
          y: spouseY,
          type: "spouse"
        });

        // 4. Positionner enfants autour de leur mère (disposition optimisée)
        children.forEach((childName, childIndex) => {
          const child = engine.getPerson(childName);
          if (child) {
            const childCount = children.length;

            // Disposition intelligente selon le nombre d'enfants
            let childAngle: number;
            let effectiveRadius: number;

            if (childCount === 1) {
              // Un seul enfant: directement sous la mère
              childAngle = angle + Math.PI / 2;
              effectiveRadius = childRadius;
            } else if (childCount <= 3) {
              // 2-3 enfants: arc de 90°
              const angleSpread = Math.PI / 2;
              const startAngle = angle - angleSpread / 2 + Math.PI / 4;
              childAngle = startAngle + (childIndex / (childCount - 1)) * angleSpread;
              effectiveRadius = childRadius;
            } else if (childCount <= 6) {
              // 4-6 enfants: arc de 120° avec rayon légèrement augmenté
              const angleSpread = (2 * Math.PI) / 3;
              const startAngle = angle - angleSpread / 2 + Math.PI / 3;
              childAngle = startAngle + (childIndex / (childCount - 1)) * angleSpread;
              effectiveRadius = childRadius * 1.1;
            } else {
              // 7+ enfants: cercle complet autour de la mère
              childAngle = (childIndex / childCount) * 2 * Math.PI;
              effectiveRadius = childRadius * 1.2;
            }

            const childX = spouseX + Math.cos(childAngle) * effectiveRadius;
            const childY = spouseY + Math.sin(childAngle) * effectiveRadius;

            newPositions.push({
              person: child,
              x: childX,
              y: childY,
              type: "child"
            });
          }
        });
      }
    });

    return newPositions;
  };

  useEffect(() => {
    if (!personName) return;

    const decodedName = decodeURIComponent(personName);
    const person = engine.getPerson(decodedName);

    if (person) {
      setFocusPerson(person);
      setPositions(calculatePositions(person));
    }
  }, [personName, engine, dimensions]);

  // Setup zoom/pan
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    // Reset zoom to fit - 1.0 pour taille normale
    const initialTransform = d3.zoomIdentity.translate(0, 0).scale(1.0);
    svg.call(zoom.transform, initialTransform);

  }, []);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 120
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChildClick = (childName: string) => {
    const child = engine.getPerson(childName);
    if (child && child.enfants.length > 0) {
      if (child.spouses.length > 2 || child.enfants.length > 5) {
        navigate(`/constellation/${encodeURIComponent(childName)}`);
      } else {
        navigate(`/family/${encodeURIComponent(childName)}`);
      }
    }
  };

  if (!focusPerson) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Personne non trouvée</h2>
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Retour à l'arbre complet
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Tailles responsive des cartes - AUGMENTÉES pour lisibilité
  const isMobile = dimensions.width < 640;
  const isTablet = dimensions.width >= 640 && dimensions.width < 1024;

  const cardSizes = {
    central: isMobile ? 140 : isTablet ? 180 : 200,
    spouse: isMobile ? 120 : isTablet ? 150 : 170,
    child: isMobile ? 100 : isTablet ? 120 : 140
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 z-50">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link to="/">
            <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Retour</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <h1 className="text-sm sm:text-base font-semibold truncate">
              {focusPerson.name.split(' ')[0]}
              <span className="text-muted-foreground font-normal ml-1 hidden sm:inline">
                • {focusPerson.spouses.length} conjoints • {focusPerson.enfants.length} enfants
              </span>
            </h1>
          </div>
        </div>
      </header>

      {/* Info Panel */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b px-3 py-2 text-xs sm:text-sm text-center">
        <span className="text-muted-foreground">
          <Heart className="w-3 h-3 inline mr-1" />
          Vue constellation dynamique • Zoom avec molette • Glisser pour déplacer
        </span>
      </div>

      {/* Canvas SVG */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-background via-muted/5 to-background">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <defs>
            {/* Gradients pour personnes de l'arbre */}
            <linearGradient id="maleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(200, 80%, 45%)" />
              <stop offset="100%" stopColor="hsl(210, 100%, 46%)" />
            </linearGradient>
            <linearGradient id="femaleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(340, 70%, 65%)" />
              <stop offset="100%" stopColor="hsl(330, 76%, 48%)" />
            </linearGradient>

            {/* Gradients pour conjoints externes (sans ascendants) */}
            <linearGradient id="externalMaleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(280, 60%, 55%)" />
              <stop offset="100%" stopColor="hsl(270, 65%, 48%)" />
            </linearGradient>
            <linearGradient id="externalFemaleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(35, 85%, 60%)" />
              <stop offset="100%" stopColor="hsl(25, 90%, 55%)" />
            </linearGradient>
          </defs>

          <g ref={gRef}>
            {/* Lignes de liaison */}
            {positions.map((pos, index) => {
              if (pos.type === "central") return null;

              const central = positions.find(p => p.type === "central");
              if (!central) return null;

              // Ligne vers le conjoint
              if (pos.type === "spouse") {
                return (
                  <line
                    key={`link-spouse-${index}`}
                    x1={central.x}
                    y1={central.y}
                    x2={pos.x}
                    y2={pos.y}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    opacity="0.4"
                  />
                );
              }

              // Ligne enfant → mère
              if (pos.type === "child") {
                const mothers = positions.filter(p => p.type === "spouse");
                let closestMother = mothers[0];
                let minDist = Infinity;

                mothers.forEach(mother => {
                  const dist = Math.hypot(mother.x - pos.x, mother.y - pos.y);
                  if (dist < minDist) {
                    minDist = dist;
                    closestMother = mother;
                  }
                });

                if (closestMother) {
                  return (
                    <line
                      key={`link-child-${index}`}
                      x1={closestMother.x}
                      y1={closestMother.y}
                      x2={pos.x}
                      y2={pos.y}
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="1.5"
                      opacity="0.3"
                    />
                  );
                }
              }

              return null;
            })}

            {/* Cartes des personnes */}
            {positions.map((pos, index) => {
              const size = cardSizes[pos.type];
              const halfSize = size / 2;
              const isHoverable = pos.type === "child" && pos.person.enfants.length > 0;

              // Déterminer le gradient à utiliser (externe ou normal)
              const getGradientId = () => {
                if (pos.person.isExternalSpouse) {
                  return pos.person.genre === "Homme" ? "url(#externalMaleGradient)" : "url(#externalFemaleGradient)";
                }
                return pos.person.genre === "Homme" ? "url(#maleGradient)" : "url(#femaleGradient)";
              };

              const gradientId = getGradientId();

              const isHovered = hoveredPerson === pos.person.name;
              const isSelected = selectedChild === pos.person.name;

              return (
                <g
                  key={`node-${index}`}
                  transform={`translate(${pos.x - halfSize}, ${pos.y - halfSize})`}
                  className={isHoverable ? "cursor-pointer" : ""}
                  onClick={() => {
                    if (isHoverable) {
                      setSelectedChild(pos.person.name);
                      handleChildClick(pos.person.name);
                    }
                  }}
                  onMouseEnter={() => setHoveredPerson(pos.person.name)}
                  onMouseLeave={() => setHoveredPerson(null)}
                >
                  {/* Halo de hover */}
                  {isHovered && (
                    <circle
                      cx={halfSize}
                      cy={halfSize * 0.6}
                      r={size * 0.5}
                      fill="none"
                      stroke={gradientId}
                      strokeWidth="2"
                      opacity="0.3"
                      className="animate-pulse"
                    />
                  )}

                  {/* Carte rectangulaire avec coins arrondis */}
                  <rect
                    width={size}
                    height={size * 0.6}
                    rx="8"
                    fill="hsl(var(--card))"
                    stroke={gradientId}
                    strokeWidth={pos.type === "central" ? "3" : isHovered || isSelected ? "3" : "2"}
                    filter={isHovered ? "drop-shadow(0 6px 12px rgba(0,0,0,0.25))" : "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"}
                    style={{ transition: "all 0.2s ease" }}
                  />

                  {/* Avatar circulaire */}
                  <circle
                    cx={size * 0.25}
                    cy={size * 0.3}
                    r={size * 0.15}
                    fill={gradientId}
                  />

                  {/* Initiale */}
                  <text
                    x={size * 0.25}
                    y={size * 0.3}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={size * 0.12}
                    fontWeight="bold"
                  >
                    {pos.person.name.charAt(0).toUpperCase()}
                  </text>

                  {/* Nom */}
                  <text
                    x={size * 0.5}
                    y={size * 0.25}
                    textAnchor="middle"
                    fill="hsl(var(--foreground))"
                    fontSize={size * 0.09}
                    fontWeight="600"
                  >
                    {pos.person.name.split(' ')[0]}
                  </text>

                  {/* Stats si central ou spouse */}
                  {(pos.type === "central" || pos.type === "spouse") && (
                    <text
                      x={size * 0.5}
                      y={size * 0.45}
                      textAnchor="middle"
                      fill="hsl(var(--muted-foreground))"
                      fontSize={size * 0.07}
                    >
                      {pos.person.enfants.length} enfants
                    </text>
                  )}

                  {/* Badge cliquable */}
                  {isHoverable && (
                    <>
                      <circle
                        cx={size - 12}
                        cy={12}
                        r="10"
                        fill="hsl(var(--primary))"
                        className={isHovered ? "animate-pulse" : ""}
                      />
                      <text
                        x={size - 12}
                        y={12}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        →
                      </text>
                    </>
                  )}

                  {/* Tooltip au hover - Responsive */}
                  {isHovered && (
                    <g>
                      {/* Fond du tooltip */}
                      <rect
                        x={size / 2 - 60}
                        y={-35}
                        width="120"
                        height={pos.person.isExternalSpouse ? "60" : "50"}
                        rx="6"
                        fill="hsl(var(--popover))"
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                        filter="drop-shadow(0 2px 8px rgba(0,0,0,0.15))"
                      />
                      {/* Nom complet */}
                      <text
                        x={size / 2}
                        y={-22}
                        textAnchor="middle"
                        fill="hsl(var(--foreground))"
                        fontSize="9"
                        fontWeight="700"
                      >
                        {pos.person.name.length > 20 ? pos.person.name.substring(0, 18) + '...' : pos.person.name}
                      </text>
                      {/* Stats */}
                      <text
                        x={size / 2}
                        y={-10}
                        textAnchor="middle"
                        fill="hsl(var(--muted-foreground))"
                        fontSize="7"
                      >
                        {pos.person.spouses.length > 0 && `${pos.person.spouses.length} conjoint(s)`}
                        {pos.person.spouses.length > 0 && pos.person.enfants.length > 0 && ' • '}
                        {pos.person.enfants.length > 0 && `${pos.person.enfants.length} enfant(s)`}
                      </text>
                      {/* Indicateur conjoint externe */}
                      {pos.person.isExternalSpouse && (
                        <text
                          x={size / 2}
                          y={2}
                          textAnchor="middle"
                          fill={pos.person.genre === "Homme" ? "hsl(var(--external-male))" : "hsl(var(--external-female))"}
                          fontSize="7"
                          fontWeight="600"
                        >
                          🔗 Conjoint externe
                        </text>
                      )}
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Legend - Avec couleurs pour conjoints externes */}
      <div className="border-t bg-card/80 backdrop-blur-sm px-3 py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] sm:text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-[hsl(200,80%,45%)] to-[hsl(210,100%,46%)]" />
          <span>Homme</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-[hsl(340,70%,65%)] to-[hsl(330,76%,48%)]" />
          <span>Femme</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-[hsl(280,60%,55%)] to-[hsl(270,65%,48%)]" />
          <span className="hidden sm:inline">Conjoint externe</span>
          <span className="sm:hidden">H. ext.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-[hsl(35,85%,60%)] to-[hsl(25,90%,55%)]" />
          <span className="hidden sm:inline">Conjointe externe</span>
          <span className="sm:hidden">F. ext.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Baby className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
          <span>Enfants (→ cliquable)</span>
        </div>
      </div>
    </div>
  );
};
