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

  // Détection du mode compact (Mobile)
  const isCompact = dimensions.nodeWidth < 180;

  const avatarColor =
    person.genre === "Homme"
      ? "background: linear-gradient(135deg, hsl(var(--male)), hsl(210 100% 46%));"
      : "background: linear-gradient(135deg, hsl(var(--female)), hsl(330 76% 48%));";

  const borderColor =
    person.genre === "Homme" ? "hsl(var(--male))" : "hsl(var(--female))";

  // Tailles dynamiques
  const avatarSize = isCompact ? "32px" : "40px";
  const fontSizeName = isCompact ? "12px" : "13px";
  const fontSizeGen = isCompact ? "10px" : "11px";
  const padding = isCompact ? "6px" : "10px";
  const iconSize = isCompact ? "10px" : "12px";

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
    ">
      <div style="
        padding: ${padding};
        border-bottom: 1px solid hsl(var(--border));
        display: flex;
        align-items: center;
        gap: ${isCompact ? "6px" : "8px"};
        background: hsl(var(--card));
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
          ">${person.name}</div>
          <div style="
            font-size: ${fontSizeGen};
            color: hsl(var(--muted-foreground));
          ">Génération ${person.level}</div>
        </div>
      </div>
      <div style="padding: ${padding}; flex: 1; display: flex; align-items: center; justify-content: space-around; font-size: ${iconSize}; color: hsl(var(--muted-foreground));">
        <div style="display: flex; align-items: center; gap: 4px;">👥 ${person.parents.length}</div>
        <div style="display: flex; align-items: center; gap: 4px;">💑 ${person.spouses.length}</div>
        <div style="display: flex; align-items: center; gap: 4px;">👶 ${childCount}</div>
      </div>
      ${
        hasHiddenChildren
          ? `<div style="
          position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);
          background: hsl(var(--primary)); color: white;
          width: ${isCompact ? "24px" : "28px"}; height: ${isCompact ? "24px" : "28px"}; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: bold; font-size: ${isCompact ? "11px" : "12px"};
          box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid hsl(var(--card));
        ">+${childCount}</div>`
          : ""
      }
    </div>
  `;
}