import { PersonNode, TreeDimensions } from "@/lib/familyTree/types";

export function createNodeHTML(
  person: PersonNode, 
  selectedPerson: PersonNode | null,
  dimensions: TreeDimensions
): string {
  const initial = person.name.charAt(0).toUpperCase();
  const childCount = person.enfants.length;
  const hasHiddenChildren = childCount > 0 && !person.expanded;
  const isSelected = selectedPerson?.name === person.name;

  // Détection du mode MICRO (Mobile) : Si largeur < 120px, c'est un badge
  const isMicro = dimensions.nodeWidth < 120;
  const isCompact = !isMicro && dimensions.nodeWidth < 180;

  const avatarColor =
    person.genre === "Homme"
      ? "background: linear-gradient(135deg, hsl(var(--male)), hsl(210 100% 46%));"
      : "background: linear-gradient(135deg, hsl(var(--female)), hsl(330 76% 48%));";

  const borderColor =
    person.genre === "Homme" ? "hsl(var(--male))" : "hsl(var(--female))";

  // --- RENDU MICRO-CARTE (Smartphone) ---
  // Style "Badge" horizontal compact
  if (isMicro) {
    return `
      <div style="
        width: ${dimensions.nodeWidth - 4}px;
        height: ${dimensions.nodeHeight - 4}px;
        margin: 2px;
        background: hsl(var(--card));
        border: ${isSelected ? "2px" : "1px"} solid ${borderColor};
        border-radius: 6px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: row; /* Alignement horizontal : Photo | Nom */
        align-items: center;
        padding: 4px;
        gap: 6px;
        overflow: hidden;
        font-family: sans-serif;
        position: relative;
      ">
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          ${avatarColor}
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 11px;
          color: white;
          flex-shrink: 0;
        ">${initial}</div>
        
        <div style="
          font-weight: 600;
          font-size: 10px;
          line-height: 1.1;
          color: hsl(var(--foreground));
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        ">${person.name}</div>

        ${hasHiddenChildren ? `
          <div style="
            position: absolute; top: -2px; right: -2px;
            background: hsl(var(--primary)); color: white;
            width: 12px; height: 12px; border-radius: 50%;
            font-size: 8px; display: flex; align-items: center; justify-content: center;
            font-weight: bold;
            z-index: 10;
          ">+</div>
        ` : ''}
      </div>
    `;
  }

  // --- RENDU STANDARD (Tablette/Desktop) ---
  const avatarSize = isCompact ? "32px" : "40px";
  const fontSizeName = isCompact ? "12px" : "13px";
  const padding = isCompact ? "6px" : "10px";

  return `
    <div style="
      width: ${dimensions.nodeWidth - 4}px;
      height: ${dimensions.nodeHeight - 4}px;
      margin: 2px;
      background: hsl(var(--card));
      border: ${isSelected ? "3px" : "2px"} solid ${borderColor};
      border-radius: ${isCompact ? "8px" : "12px"};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: sans-serif;
      position: relative;
    ">
      <div style="
        padding: ${padding};
        border-bottom: 1px solid hsl(var(--border));
        display: flex;
        align-items: center;
        gap: ${isCompact ? "6px" : "8px"};
        background: hsl(var(--card));
        flex: 1;
      ">
        <div style="
          width: ${avatarSize};
          height: ${avatarSize};
          border-radius: 50%;
          ${avatarColor}
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: ${isCompact ? "14px" : "16px"};
          color: white;
          flex-shrink: 0;
        ">${initial}</div>
        <div style="flex: 1; min-width: 0;">
          <div style="
            font-weight: 600;
            font-size: ${fontSizeName};
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: hsl(var(--foreground));
            padding-right: 16px; 
          ">${person.name}</div>
          <div style="
            font-size: ${isCompact ? "10px" : "11px"};
            color: hsl(var(--muted-foreground));
          ">Génération ${person.level}</div>
        </div>
      </div>
      
      <div style="
        padding: 4px; 
        display: flex; 
        align-items: center; 
        justify-content: space-around; 
        font-size: 10px; 
        color: hsl(var(--muted-foreground));
        background: hsl(var(--muted)/0.3);
      ">
        <span style="display:flex; gap:2px">👥 ${person.parents.length}</span>
        <span style="display:flex; gap:2px">💑 ${person.spouses.length}</span>
        <span style="display:flex; gap:2px">👶 ${childCount}</span>
      </div>

      ${
        hasHiddenChildren
          ? `<div style="
          position: absolute; top: 6px; right: 6px;
          background: hsl(var(--primary)); color: white;
          width: ${isCompact ? "18px" : "22px"}; height: ${isCompact ? "18px" : "22px"}; 
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: bold; font-size: ${isCompact ? "10px" : "11px"};
          box-shadow: 0 2px 4px rgba(0,0,0,0.2); 
          z-index: 20;
        ">+${childCount}</div>`
          : ""
      }
    </div>
  `;
}