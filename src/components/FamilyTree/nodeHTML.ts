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

  // Si < 150px, on considère que c'est un badge mobile
  const isBadge = dimensions.nodeWidth < 150;
  const isCompact = !isBadge && dimensions.nodeWidth < 200;

  // Couleurs modernes avec dégradés vibrants
  const avatarColor =
    person.genre === "Homme"
      ? "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
      : "background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);";

  const borderColor =
    person.genre === "Homme" ? "#667eea" : "#f5576c";

  const glowColor =
    person.genre === "Homme"
      ? "0 0 25px rgba(102, 126, 234, 0.4)"
      : "0 0 25px rgba(245, 87, 108, 0.4)";

  const cardBackground = isSelected
    ? "background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);"
    : "background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);";

  // --- RENDU BADGE (Mobile) ---
  if (isBadge) {
    return `
      <div style="
        width: ${dimensions.nodeWidth - 4}px;
        height: ${dimensions.nodeHeight - 4}px;
        margin: 2px;
        ${cardBackground}
        border: ${isSelected ? "2.5px" : "1.5px"} solid ${borderColor};
        border-radius: 14px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.1), ${isSelected ? glowColor : '0 0 0 transparent'};
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 4px 6px;
        gap: 8px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        position: relative;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          ${avatarColor}
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        ">${initial}</div>

        <div style="
          font-weight: 600;
          font-size: 11px;
          line-height: 1.2;
          color: #1a1a1a;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          flex: 1;
        ">${person.name}</div>

        ${hasHiddenChildren ? `
          <div style="
            position: absolute; top: -4px; right: -4px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            color: white;
            width: 18px; height: 18px; border-radius: 50%;
            font-size: 9px; display: flex; align-items: center; justify-content: center;
            font-weight: bold;
            z-index: 10;
            box-shadow: 0 3px 8px rgba(0,0,0,0.2);
            border: 2px solid white;
          ">+</div>
        ` : ''}
      </div>
    `;
  }

  // --- RENDU DESKTOP (Carte Élégante) ---
  const avatarSize = isCompact ? "36px" : "44px";
  const fontSizeName = isCompact ? "13px" : "14px";
  const padding = isCompact ? "8px" : "12px";

  return `
    <div style="
      width: ${dimensions.nodeWidth - 4}px;
      height: ${dimensions.nodeHeight - 4}px;
      margin: 2px;
      ${cardBackground}
      border: ${isSelected ? "3px" : "2px"} solid ${borderColor};
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08), ${isSelected ? glowColor : '0 0 0 transparent'};
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    ">
      <div style="
        padding: ${padding};
        border-bottom: 1px solid rgba(0,0,0,0.06);
        display: flex;
        align-items: center;
        gap: 10px;
        background: linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%);
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
          font-weight: 700;
          font-size: ${isCompact ? "16px" : "18px"};
          color: white;
          flex-shrink: 0;
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        ">${initial}</div>
        <div style="flex: 1; min-width: 0;">
          <div style="
            font-weight: 700;
            font-size: ${fontSizeName};
            margin-bottom: 3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #1a1a1a;
            letter-spacing: -0.01em;
          ">${person.name}</div>
          <div style="
            font-size: 10px;
            color: #6b7280;
            font-weight: 500;
          ">Génération ${person.level}</div>
        </div>
      </div>

      <div style="
        padding: 6px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        font-size: 11px;
        font-weight: 600;
        color: #6b7280;
        background: linear-gradient(180deg, rgba(248,249,250,0.8) 0%, rgba(243,244,246,0.8) 100%);
      ">
        <span style="display:flex; gap:3px; align-items:center;">👥 ${person.parents.length}</span>
        <span style="display:flex; gap:3px; align-items:center;">💑 ${person.spouses.length}</span>
        <span style="display:flex; gap:3px; align-items:center;">👶 ${childCount}</span>
      </div>

      ${
        hasHiddenChildren
          ? `<div style="
          position: absolute; top: 8px; right: 8px;
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
          color: white;
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: bold; font-size: 11px;
          box-shadow: 0 4px 10px rgba(238, 90, 111, 0.4);
          border: 2px solid white;
        ">+${childCount}</div>`
          : ""
      }
    </div>
  `;
}
