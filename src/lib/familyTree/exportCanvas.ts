/**
 * Export Canvas2D de l'arbre généalogique
 * Rendu propre sans html2canvas, sans artefacts CSS variable
 */
import { PersonNode, TreeLink, TreeDimensions } from './types';
import { jsPDF } from 'jspdf';

// ── Couleurs fixes (pas de CSS variables) ──────────────────────────────────
const COLORS = {
  bg:          '#ffffff',
  cardBg:      '#ffffff',
  footerBg:    '#f8fafc',
  border:      '#e2e8f0',
  text:        '#0f172a',
  textSub:     '#334155',
  textMuted:   '#64748b',
  male:        '#3b82f6',
  maleDark:    '#2563eb',
  female:      '#ec4899',
  femaleDark:  '#db2777',
  extMale:     '#7c3aed',
  extMaleDark: '#6d28d9',
  extFemale:   '#ea580c',
  extFemDark:  '#c2410c',
  linkParent:  '#94a3b8',
  linkSpouse:  '#e879a3',
  shadow:      'rgba(0,0,0,0.08)',
};

function getPersonColors(person: PersonNode) {
  if (person.isExternalSpouse) {
    return person.genre === 'Homme'
      ? [COLORS.extMale, COLORS.extMaleDark]
      : [COLORS.extFemale, COLORS.extFemDark];
  }
  return person.genre === 'Homme'
    ? [COLORS.male, COLORS.maleDark]
    : [COLORS.female, COLORS.femaleDark];
}

/** Chemin d'un rectangle arrondi */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y,     x + w, y + rr,     rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - rr, rr);
  ctx.lineTo(x,     y + rr);
  ctx.arcTo(x,     y,     x + rr, y,         rr);
  ctx.closePath();
}

/**
 * Tronque du texte avec ellipsis — recherche binaire O(log n)
 * au lieu du slicing caractère par caractère O(n²).
 */
function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (!text || maxWidth <= 0) return '';
  if (ctx.measureText(text).width <= maxWidth) return text;
  let lo = 0, hi = text.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (ctx.measureText(text.slice(0, mid) + '…').width <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return lo > 0 ? text.slice(0, lo) + '…' : '…';
}

/**
 * Découpe un nom en 2 lignes tenant dans maxWidth.
 * Ligne 1 : mot par mot avec bigFont.
 * Ligne 2 : mots restants, tronqués avec smallFont.
 */
function splitIntoLines(
  ctx: CanvasRenderingContext2D,
  name: string,
  maxWidth: number,
  bigFont: string,
  smallFont: string
): [string, string] {
  ctx.font = bigFont;
  const words = name.split(' ');
  let line1 = '';
  const overflow: string[] = [];

  for (const word of words) {
    const candidate = line1 ? `${line1} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line1 = candidate;
    } else {
      overflow.push(word);
    }
  }

  if (overflow.length === 0) return [line1, ''];

  ctx.font = smallFont;
  return [line1, truncateText(ctx, overflow.join(' '), maxWidth)];
}

/** Charge toutes les photos en parallèle, erreurs silencieuses */
async function loadImages(
  photoMap: Map<string, string> | undefined
): Promise<Map<string, HTMLImageElement>> {
  const cache = new Map<string, HTMLImageElement>();
  if (!photoMap || photoMap.size === 0) return cache;

  await Promise.all(
    Array.from(photoMap.entries()).map(([name, url]) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload  = () => { cache.set(name, img); resolve(); };
        img.onerror = () => resolve();
        img.src = url;
      })
    )
  );
  return cache;
}

/** Dessine un nœud (badge compact ou carte desktop) */
function drawNode(
  ctx: CanvasRenderingContext2D,
  person: PersonNode,
  ox: number, oy: number,
  nw: number, nh: number,
  imageCache: Map<string, HTMLImageElement>
) {
  const cx = person.x + ox;
  const cy = person.y + oy;
  const x  = cx - nw / 2 + 2;
  const y  = cy - nh / 2 + 2;
  const w  = nw - 4;
  const h  = nh - 4;
  const r  = nw < 150 ? 8 : 12;

  const [c1, c2] = getPersonColors(person);
  const img = imageCache.get(person.name);

  // ── 1. Ombre portée — avant le clip pour qu'elle s'étende hors du rect ───
  ctx.save();
  ctx.shadowColor   = COLORS.shadow;
  ctx.shadowBlur    = 4;          // réduit vs 8 → moins de bleed entre nœuds
  ctx.shadowOffsetY = 2;
  roundedRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = COLORS.cardBg;
  ctx.fill();
  ctx.restore();

  // ── 2. Bordure — avant le clip ────────────────────────────────────────────
  roundedRectPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = c1;
  ctx.lineWidth   = nw < 150 ? 1.5 : 2;
  ctx.stroke();

  // ── 3. Clip : tout le contenu reste à l'intérieur du nœud ─────────────────
  ctx.save();
  roundedRectPath(ctx, x, y, w, h, r);
  ctx.clip();

  // ── BADGE (mobile compact, nw < 150) ─────────────────────────────────────
  if (nw < 150) {
    const aR  = Math.max(8, Math.min(13, h / 2 - 3));
    const aCx = x + 7 + aR;
    const aCy = cy;

    ctx.save();
    ctx.beginPath();
    ctx.arc(aCx, aCy, aR, 0, Math.PI * 2);
    if (img) {
      ctx.clip();
      ctx.drawImage(img, aCx - aR, aCy - aR, aR * 2, aR * 2);
    } else {
      const grad = ctx.createLinearGradient(aCx - aR, aCy - aR, aCx + aR, aCy + aR);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.fillStyle    = '#ffffff';
      ctx.font         = `bold ${Math.max(9, aR - 2)}px system-ui,sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(person.name.charAt(0).toUpperCase(), aCx, aCy);
    }
    ctx.restore();

    const tx   = aCx + aR + 5;
    const maxW = (x + w) - tx - 4;
    ctx.font         = 'bold 10px system-ui,sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = COLORS.text;
    ctx.fillText(truncateText(ctx, person.name, maxW), tx, cy);

    ctx.restore(); // fin clip badge
    return;
  }

  // ── CARTE DESKTOP ─────────────────────────────────────────────────────────
  const headerH = Math.round(h * 0.65);
  const footerH = h - headerH;
  const aR      = nw < 200 ? 15 : 18;
  const aCx     = x + 10 + aR;
  const aCy     = y + headerH / 2;

  // Fond footer
  ctx.fillStyle = COLORS.footerBg;
  ctx.fillRect(x, y + headerH, w, footerH);

  // Séparateur header/footer
  ctx.beginPath();
  ctx.moveTo(x + 6, y + headerH);
  ctx.lineTo(x + w - 6, y + headerH);
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth   = 1;
  ctx.stroke();

  // Avatar (photo ou initiale)
  ctx.save();
  ctx.beginPath();
  ctx.arc(aCx, aCy, aR, 0, Math.PI * 2);
  if (img) {
    ctx.clip();
    ctx.drawImage(img, aCx - aR, aCy - aR, aR * 2, aR * 2);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(aCx, aCy, aR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth   = 2;
    ctx.stroke();
  } else {
    const grad = ctx.createLinearGradient(aCx - aR, aCy - aR, aCx + aR, aCy + aR);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
    ctx.fillStyle    = '#ffffff';
    ctx.font         = `bold ${aR}px system-ui,sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(person.name.charAt(0).toUpperCase(), aCx, aCy);
  }

  // Nom en 1 ou 2 lignes
  const tx       = aCx + aR + 7;
  const maxW     = (x + w) - tx - 6;
  const fontSize = nw < 200 ? 11 : 12;
  const bigFont  = `bold ${fontSize}px system-ui,sans-serif`;
  const smFont   = `${fontSize - 1}px system-ui,sans-serif`;

  const [line1, line2] = splitIntoLines(ctx, person.name, maxW, bigFont, smFont);

  const nameY = line2 ? aCy - 8 : aCy - 4;
  ctx.font         = bigFont;
  ctx.fillStyle    = COLORS.text;
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(line1, tx, nameY);

  if (line2) {
    ctx.font      = smFont;
    ctx.fillStyle = COLORS.textSub;
    ctx.fillText(line2, tx, nameY + fontSize + 2);
  }

  // Génération
  ctx.font      = '9px system-ui,sans-serif';
  ctx.fillStyle = COLORS.textMuted;
  ctx.fillText(`Gén. ${person.level}`, tx, nameY + (line2 ? fontSize * 2 + 6 : fontSize + 6));

  // Pied de page : 3 colonnes avec texte tronqué si nécessaire
  const footStats = [
    `${person.parents.length} parent${person.parents.length !== 1 ? 's' : ''}`,
    `${person.spouses.length} conj.`,
    `${person.enfants.length} enfant${person.enfants.length !== 1 ? 's' : ''}`,
  ];
  const colW = w / 3;
  ctx.font         = '8.5px system-ui,sans-serif';
  ctx.fillStyle    = COLORS.textMuted;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  footStats.forEach((s, i) => {
    ctx.fillText(truncateText(ctx, s, colW - 6), x + colW * i + colW / 2, y + headerH + footerH / 2);
  });

  ctx.restore(); // fin clip desktop
}

// ── Fonction principale d'export ──────────────────────────────────────────
export async function exportFamilyTree(
  persons: PersonNode[],
  links: TreeLink[],
  dimensions: TreeDimensions,
  photoMap: Map<string, string> | undefined,
  format: 'png' | 'pdf'
): Promise<void> {
  if (persons.length === 0) return;

  const nw = dimensions.nodeWidth;
  const nh = dimensions.nodeHeight;

  // Bounding box — reduce() safe pour tous les tableaux (pas de limite stack)
  const minX = persons.reduce((m, p) => Math.min(m, p.x), Infinity)  - nw;
  const maxX = persons.reduce((m, p) => Math.max(m, p.x), -Infinity) + nw;
  const minY = persons.reduce((m, p) => Math.min(m, p.y), Infinity)  - nh;
  const maxY = persons.reduce((m, p) => Math.max(m, p.y), -Infinity) + nh;

  const pad    = 60;
  const titleH = 52;
  const canvasW = maxX - minX + pad * 2;
  const canvasH = maxY - minY + pad * 2 + titleH;

  // DPR dynamique : on ne dépasse jamais 8192px par axe
  // (au-delà, certains browsers silencieusement vident le canvas)
  const MAX_DIM = 8192;
  const DPR = Math.min(2, MAX_DIM / Math.max(canvasW, canvasH, 1));

  const canvas  = document.createElement('canvas');
  canvas.width  = Math.round(canvasW * DPR);
  canvas.height = Math.round(canvasH * DPR);
  const ctx     = canvas.getContext('2d')!;
  ctx.scale(DPR, DPR);

  const ox = -minX + pad;
  const oy = -minY + pad + titleH;

  // Fond blanc
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // En-tête
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle    = COLORS.text;
  ctx.font         = 'bold 18px system-ui,sans-serif';
  ctx.fillText('Arbre Généalogique — Famille Diop', canvasW / 2, 26);
  ctx.font      = '11px system-ui,sans-serif';
  ctx.fillStyle = COLORS.textMuted;
  ctx.fillText(
    `${persons.length} membres visibles · ${new Date().toLocaleDateString('fr-FR')}`,
    canvasW / 2, 44
  );

  // Charger les photos en parallèle
  const imageCache = await loadImages(photoMap);

  // ── Liens (AVANT les nœuds pour qu'ils passent dessous) ──────────────────
  ctx.lineCap = 'round';
  for (const link of links) {
    const sx = link.source.x + ox;
    const sy = link.source.y + oy;
    const tx = link.target.x + ox;
    const ty = link.target.y + oy;

    ctx.beginPath();
    ctx.setLineDash([]);

    if (link.type === 'spouse') {
      ctx.setLineDash([5, 3]);
      ctx.strokeStyle = COLORS.linkSpouse;
      ctx.lineWidth   = 1.5;
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
    } else {
      ctx.strokeStyle = COLORS.linkParent;
      ctx.lineWidth   = 1.5;
      const srcY = sy + nh / 2;
      const tgtY = ty - nh / 2;
      if (tgtY > srcY) {
        // Lien parent → enfant normal (bezier)
        const midY = (srcY + tgtY) / 2;
        ctx.moveTo(sx, srcY);
        ctx.bezierCurveTo(sx, midY, tx, midY, tx, tgtY);
      } else {
        // Même niveau ou inversé → ligne droite
        ctx.moveTo(sx, srcY);
        ctx.lineTo(tx, tgtY);
      }
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // ── Nœuds ─────────────────────────────────────────────────────────────────
  for (const person of persons) {
    drawNode(ctx, person, ox, oy, nw, nh, imageCache);
  }

  // ── Téléchargement ────────────────────────────────────────────────────────
  const dateStr = new Date().toISOString().split('T')[0];

  if (format === 'png') {
    const a    = document.createElement('a');
    a.download = `famille-diop-${dateStr}.png`;
    a.href     = canvas.toDataURL('image/png');
    a.click();
  } else {
    // Conversion pixels logiques → mm pour jsPDF
    const mmW = canvasW * 0.264583;
    const mmH = canvasH * 0.264583;
    const pdf = new jsPDF({
      orientation: mmW > mmH ? 'landscape' : 'portrait',
      unit:         'mm',
      format:       [mmW + 10, mmH + 10],
    });
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 5, 5, mmW, mmH);
    pdf.save(`famille-diop-${dateStr}.pdf`);
  }
}
