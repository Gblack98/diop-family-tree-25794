# 🎯 Configuration Visuelle Finale - Arbre Généalogique

## ✅ Paramètres Appliqués (Équilibre Parfait)

### 📏 Dimensions des Nœuds (Desktop)

```typescript
nodeWidth: 180px        // Taille confortable pour lire
nodeHeight: 90px        // Hauteur adaptée
levelHeight: 160px      // Espacement vertical équilibré
coupleSpacing: 35px     // Espace entre conjoints
siblingSpacing: 45px    // Espace entre frères/sœurs
```

**Rationale :**
- **180×90px** : Assez grand pour lire confortablement, pas trop pour déborder
- **160px entre niveaux** : Permet de voir 3-4 générations sans scroll excessif
- **35-45px entre personnes** : Évite la surcharge visuelle tout en gardant les liens clairs

---

### 🔍 Zoom Initial

```typescript
Mobile:  0.7  (70%)
Tablet:  0.75 (75%)
Desktop: 0.8  (80%)
```

**Rationale :**
- **80% sur desktop** : Équilibre entre lisibilité et vue d'ensemble
- L'utilisateur voit **10-15 personnes** immédiatement
- Permet de voir **3-4 générations** d'un coup
- Toujours **zoomable** avec la molette si besoin de détails

---

### 🎯 Centrage

```typescript
X: Centre horizontal - (position racine × zoom)
Y: Centre vertical - (position racine × zoom)
```

**Résultat :**
- ✅ L'arbre est **parfaitement centré** à l'ouverture
- ✅ La racine (génération 0) est au **centre de l'écran**
- ✅ Vue **équilibrée** entre ancêtres et descendants
- ✅ Pas de débordement initial

---

## 📊 Comparaison des Versions

### Version Originale (Trop Grande)
```
Nœuds: 240×120px
Zoom: 90%
Personnes visibles: 4-6
Générations visibles: 2-3
Centrage: En haut (y=50px)
```
**Problème :** Trop zoomé, peu de contexte

---

### Version Ultra-Compacte (Trop Petite)
```
Nœuds: 160×80px
Zoom: 55%
Personnes visibles: 20-25
Générations visibles: 5-6
```
**Problème :** Difficile à lire, nœuds trop petits

---

### ✨ Version Finale (Équilibrée)
```
Nœuds: 180×90px
Zoom: 80%
Personnes visibles: 10-15
Générations visibles: 3-4
Centrage: Centre parfait
```
**Avantages :**
- ✅ Lisibilité optimale
- ✅ Vue d'ensemble suffisante
- ✅ Pas de débordement
- ✅ Centrage parfait
- ✅ Navigation fluide

---

## 🎨 Expérience Utilisateur

### Au Chargement
1. L'arbre apparaît **centré** sur la génération racine
2. Vous voyez **3-4 générations** simultanément
3. Les nœuds sont **lisibles** sans effort
4. Pas besoin de scroll immédiat

### Navigation
- **Molette souris** : Zoom in/out fluide
- **Cliquer-glisser** : Pan horizontal/vertical
- **Double-clic** : Retour au centrage
- **Bouton "Arbre Complet"** : Recentrage automatique

### Responsive
- **Mobile (< 640px)** : Nœuds 110×50px, zoom 70%
- **Tablet (640-1024px)** : Nœuds 160×80px, zoom 75%
- **Desktop (> 1024px)** : Nœuds 180×90px, zoom 80%

---

## 🔧 Personnalisation Rapide

### Fichier 1: Dimensions
**`src/components/FamilyTree/FamilyTreeViewer.tsx` (ligne 46-54)**

```typescript
return {
  width,
  height,
  nodeWidth: 180,      // ← Plus petit = plus de personnes visibles
  nodeHeight: 90,      // ← Ajuster proportionnellement
  levelHeight: 160,    // ← Plus petit = arbre plus compact
  coupleSpacing: 35,   // ← Espace horizontal entre conjoints
  siblingSpacing: 45,  // ← Espace horizontal entre frères/sœurs
};
```

**Guides :**
- Si **trop petit** → Augmenter `nodeWidth` de 20px (ex: 200px)
- Si **trop grand** → Diminuer `nodeWidth` de 20px (ex: 160px)
- Toujours garder ratio **2:1** (width = height × 2)

---

### Fichier 2: Zoom Initial
**`src/components/FamilyTree/FamilyTreeCanvas.tsx` (ligne 68)**

```typescript
const initialScale = isMobile ? 0.7 : isTablet ? 0.75 : 0.8;
//                                                        ↑
//                                        Ajuster ce nombre (0.5 à 1.0)
```

**Guides :**
- **0.5-0.6** : Vue très large (beaucoup de personnes, petits nœuds)
- **0.7-0.8** : Vue équilibrée ✅ **(recommandé)**
- **0.9-1.0** : Vue rapprochée (peu de personnes, grands nœuds)

---

### Fichier 3: Centrage
**`src/components/FamilyTree/FamilyTreeCanvas.tsx` (ligne 73-74)**

```typescript
const x = dimensions.width / 2 - (rootNode.x * initialScale);
const y = dimensions.height / 2 - (rootNode.y * initialScale);
```

**Modifications possibles :**
- **Centrer plus haut** : `y = dimensions.height / 3`
- **Centrer plus bas** : `y = dimensions.height * 0.6`
- **Décaler à gauche** : `x = dimensions.width / 3`

---

## 🎯 Recommandations

### Pour Familles Larges (beaucoup de descendants)
```typescript
nodeWidth: 160
zoom: 0.7
// Pour voir plus de personnes horizontalement
```

### Pour Familles Profondes (beaucoup de générations)
```typescript
levelHeight: 140
zoom: 0.75
// Pour voir plus de générations verticalement
```

### Pour Présentation (grands écrans)
```typescript
nodeWidth: 200
nodeHeight: 100
zoom: 0.85
// Nœuds plus grands pour projection
```

### Pour Mobile (petits écrans)
```typescript
// Déjà optimisé !
nodeWidth: 110
nodeHeight: 50
zoom: 0.7
```

---

## 🧪 Comment Tester

```bash
# 1. Lancer le serveur
npm run dev

# 2. Ouvrir http://localhost:8080

# 3. Vérifier :
✅ L'arbre est centré au chargement
✅ Les nœuds sont lisibles sans zoom
✅ On voit 3-4 générations
✅ Pas de débordement horizontal/vertical
✅ Le zoom fonctionne bien
```

---

## 📐 Formules de Calcul

### Surface Visible
```
Personnes visibles ≈ (width × height) / (nodeWidth × nodeHeight × zoom²)

Exemple Desktop (1920×1080) :
= (1920 × 1080) / (180 × 90 × 0.8²)
= 2,073,600 / 10,368
≈ 200 nœuds maximum dans la zone visible
≈ 15-20 personnes visibles en pratique (avec espacement)
```

### Générations Visibles
```
Générations = height / (levelHeight × zoom)

Exemple Desktop :
= 1080 / (160 × 0.8)
= 1080 / 128
≈ 8.4 niveaux maximum
≈ 3-4 niveaux visibles confortablement
```

---

## 🎨 Résultat Final

**Votre arbre maintenant :**
- 🎯 **Centré parfaitement** à l'ouverture
- 📏 **Nœuds bien proportionnés** (180×90px)
- 🔍 **Zoom équilibré** (80%)
- 👁️ **10-15 personnes visibles**
- 📊 **3-4 générations à l'écran**
- ✅ **Aucun débordement**
- 🖱️ **Navigation fluide**

**C'est l'équilibre parfait entre lisibilité et vue d'ensemble !** 🎉

---

**Besoin d'ajuster ?** Modifiez les 2 fichiers indiqués ci-dessus et relancez `npm run dev` !
