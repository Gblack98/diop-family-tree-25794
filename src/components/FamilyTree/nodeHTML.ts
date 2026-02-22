import { PersonNode, TreeDimensions } from "@/lib/familyTree/types";

export function createNodeHTML(
  person: PersonNode,
  selectedPerson: PersonNode | null,
  dimensions: TreeDimensions,
  photoUrl?: string
): string {
  const initial = person.name.charAt(0).toUpperCase();
  const childCount = person.enfants.length;
  const hasHiddenChildren = childCount > 0 && !person.expanded;
  const isSelected = selectedPerson?.name === person.name;

  // Si < 150px, on considère que c'est un badge mobile
  const isBadge = dimensions.nodeWidth < 150;
  const isCompact = !isBadge && dimensions.nodeWidth < 200;

  // Couleurs différentes pour les conjoints externes (sans ascendants)
  const isExternal = person.isExternalSpouse;

  // Highlighting pour les vues spéciales
  const isInDirectLine = person.isInDirectLine || false;
  const hasHighlight = person.highlightLevel !== undefined;

  // Calculer la couleur de surbrillance pour la vue Path (gradient du bleu au violet)
  let highlightColor = "";
  let highlightBadge = "";
  if (hasHighlight && person.highlightLevel !== undefined) {
    const hue = 200 + (person.highlightLevel * 15);
    highlightColor = `hsl(${hue}, 70%, 50%)`;
    highlightBadge = `
      <div style="
        position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
        background: ${highlightColor}; color: white;
        width: 20px; height: 20px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-weight: bold; font-size: 10px;
        box-shadow: 0 2px 8px ${highlightColor}80;
        z-index: 10;
      ">${person.highlightLevel + 1}</div>
    `;
  }

  const avatarColor = isExternal
    ? (person.genre === "Homme"
        ? "background: linear-gradient(135deg, hsl(var(--external-male)), hsl(270 65% 48%));"
        : "background: linear-gradient(135deg, hsl(var(--external-female)), hsl(25 90% 55%));")
    : (person.genre === "Homme"
        ? "background: linear-gradient(135deg, hsl(var(--male)), hsl(210 100% 46%));"
        : "background: linear-gradient(135deg, hsl(var(--female)), hsl(330 76% 48%));");

  // Border color – ordre de priorité : selected > highlight > directLine > genre
  let borderColor = isExternal
    ? (person.genre === "Homme" ? "hsl(var(--external-male))" : "hsl(var(--external-female))")
    : (person.genre === "Homme" ? "hsl(var(--male))" : "hsl(var(--female))");

  if (isInDirectLine && !hasHighlight && !isSelected) {
    borderColor = "hsl(45, 100%, 50%)";
  }
  if (hasHighlight) {
    borderColor = highlightColor;
  }
  if (isSelected) {
    borderColor = "hsl(var(--primary))";
  }

  // Box shadow – le nœud sélectionné a un halo primaire visible
  const boxShadow = isSelected
    ? `0 0 0 4px hsl(var(--primary) / 0.25), 0 6px 24px rgba(0,0,0,0.25)`
    : hasHighlight
    ? `0 4px 20px ${highlightColor}50, 0 0 20px ${highlightColor}30`
    : isInDirectLine
    ? `0 4px 20px rgba(255, 193, 7, 0.4), 0 0 20px rgba(255, 193, 7, 0.2)`
    : "0 4px 12px rgba(0,0,0,0.15)";

  // Indicateur "sélectionné" — petit point primaire en haut
  const selectedBadge = isSelected ? `
    <div style="
      position: absolute; top: -5px; left: 50%; transform: translateX(-50%);
      background: hsl(var(--primary)); color: white;
      width: 10px; height: 10px; border-radius: 50%;
      box-shadow: 0 0 6px hsl(var(--primary) / 0.6);
      z-index: 10;
    "></div>
  ` : '';

  // Rendu de l'avatar (photo ou initiale)
  const renderBadgeAvatar = photoUrl
    ? `<img src="${photoUrl}" style="
        width: 30px; height: 30px; border-radius: 50%;
        object-fit: cover; flex-shrink: 0;
        border: 1.5px solid rgba(255,255,255,0.4);
      " />`
    : `<div style="
        width: 30px; height: 30px; border-radius: 50%;
        ${avatarColor}
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 12px; color: white; flex-shrink: 0;
      ">${initial}</div>`;

  // --- RENDU BADGE (Mobile compact) ---
  if (isBadge) {
    return `
      <div style="
        width: ${dimensions.nodeWidth - 4}px;
        height: ${dimensions.nodeHeight - 4}px;
        margin: 2px;
        background: ${isSelected ? "hsl(var(--primary) / 0.06)" : "hsl(var(--card))"};
        border: ${isSelected ? "2px" : isInDirectLine || hasHighlight ? "2px" : "1px"} solid ${borderColor};
        border-radius: 8px;
        box-shadow: ${boxShadow};
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 3px 4px;
        gap: 6px;
        overflow: hidden;
        font-family: sans-serif;
        position: relative;
      ">
        ${renderBadgeAvatar}

        <div style="
          font-weight: 600;
          font-size: 10px;
          line-height: 1.1;
          color: hsl(var(--foreground));
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          flex: 1;
        ">${person.name}</div>

        ${isSelected ? selectedBadge : hasHighlight ? highlightBadge : hasHiddenChildren ? `
          <div style="
            position: absolute; top: -2px; right: -2px;
            background: hsl(var(--primary)); color: white;
            width: 14px; height: 14px; border-radius: 50%;
            font-size: 8px; display: flex; align-items: center; justify-content: center;
            font-weight: bold;
            z-index: 10;
          ">+</div>
        ` : ''}
      </div>
    `;
  }

  // --- RENDU DESKTOP (Carte Classique) ---
  const avatarSize = isCompact ? "32px" : "40px";
  const fontSizeName = isCompact ? "12px" : "13px";
  const padding = isCompact ? "6px" : "10px";

  // Badge pour la ligne directe (Vue Ancestors)
  const directLineBadge = isInDirectLine && !hasHighlight && !isSelected ? `
    <div style="
      position: absolute; top: 6px; left: 6px;
      background: linear-gradient(135deg, hsl(45, 100%, 50%), hsl(35, 100%, 45%));
      color: white;
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 9px;
      font-weight: bold;
      box-shadow: 0 2px 6px rgba(255, 193, 7, 0.4);
      z-index: 10;
    ">★</div>
  ` : '';

  // Rendu de l'avatar desktop (photo ou initiale)
  const renderDesktopAvatar = photoUrl
    ? `<div style="
        width: ${avatarSize}; height: ${avatarSize};
        border-radius: 50%; overflow: hidden; flex-shrink: 0;
        border: 2px solid rgba(255,255,255,0.5);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      ">
        <img src="${photoUrl}" style="
          width: 100%; height: 100%; object-fit: cover; display: block;
        " />
      </div>`
    : `<div style="
        width: ${avatarSize}; height: ${avatarSize};
        border-radius: 50%;
        ${avatarColor}
        display: flex; align-items: center; justify-content: center;
        font-weight: 600; font-size: ${isCompact ? "14px" : "16px"};
        color: white; flex-shrink: 0;
      ">${initial}</div>`;

  return `
    <div style="
      width: ${dimensions.nodeWidth - 4}px;
      height: ${dimensions.nodeHeight - 4}px;
      margin: 2px;
      background: ${isSelected ? "hsl(var(--primary) / 0.06)" : "hsl(var(--card))"};
      border: ${isSelected ? "3px" : isInDirectLine || hasHighlight ? "3px" : "2px"} solid ${borderColor};
      border-radius: 12px;
      box-shadow: ${boxShadow};
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
        gap: 8px;
        background: transparent;
        flex: 1;
      ">
        ${renderDesktopAvatar}
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
            font-size: 10px;
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

      ${selectedBadge}
      ${directLineBadge}
      ${!isSelected && hasHighlight ? highlightBadge : !isSelected && !hasHighlight && hasHiddenChildren ? `
        <div style="
          position: absolute; top: 6px; right: 6px;
          background: hsl(var(--primary)); color: white;
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: bold; font-size: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">+${childCount}</div>
      ` : ''}
    </div>
  `;
}
