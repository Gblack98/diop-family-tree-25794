# 👨‍👩‍👧‍👦 Guide Vue Famille Isolée

## 🎯 Concept

Le système hybride permet deux modes de visualisation :

### 1. **Arbre Global** (Page d'accueil `/`)
- Vue d'ensemble de toute la famille
- Navigation traditionnelle avec zoom/pan
- Idéal pour comprendre la structure globale

### 2. **Vue Famille Isolée** (Nouvelle fonctionnalité)
- Focus sur UNE personne à la fois
- Affiche : La personne + ses conjoints + ses enfants directs
- **Pas de cascade** : Les conjoints des enfants ne sont pas affichés
- Navigation par clic pour explorer en profondeur

---

## 🚀 Comment Utiliser

### Depuis l'Arbre Global

1. **Cliquer sur une personne** dans l'arbre
2. Le panneau d'information s'ouvre à droite
3. **Cliquer sur "Voir la famille de [Nom]"**
4. → Vous êtes redirigé vers la vue famille isolée

### Navigation dans la Vue Famille

```
Vue de Badara Gabar
├─ Badara Gabar Diop (racine)
├─ Épouse 1
├─ Épouse 2
├─ Enfant A [👆 cliquable]
├─ Enfant B [👆 cliquable]
└─ Enfant C [👆 cliquable]

Clic sur "Enfant A" →

Vue de Enfant A
├─ Enfant A (nouvelle racine)
├─ Conjoint de A
├─ Enfant A1 [👆 cliquable]
└─ Enfant A2 [👆 cliquable]
```

### Retour à l'Arbre Global

- Bouton **"← Arbre complet"** en haut à gauche
- Navigation breadcrumb (fil d'Ariane) *à venir*

---

## 📐 Structure Technique

### Route
```
/family/:personName
```

**Exemple :**
- `/family/Badara%20Gabar%20Diop`
- `/family/Amadou%20Bamba%20Diop%20(Badara)`

### Composants

**`FamilyView.tsx`** (Nouvelle page)
- Gère l'affichage isolé d'une famille
- Paramètre URL : `personName`
- Logique de filtrage : Affiche seulement la personne focalisée, ses conjoints, et ses enfants

**`PersonInfoPanel.tsx`** (Modifié)
- Ajout du bouton "Voir la famille de [Nom]"
- Navigation vers `/family/:personName`

**`App.tsx`** (Modifié)
- Nouvelle route ajoutée

---

## 🎨 Règles d'Affichage

### Vue Famille Isolée affiche :

✅ **La personne focalisée**
✅ **Tous ses conjoints** (plusieurs épouses/maris possibles)
✅ **Tous ses enfants directs**
❌ **PAS les conjoints des enfants** (sauf si on clique sur cet enfant)
❌ **PAS les petits-enfants** (sauf navigation)

### Exemple Concret : Amadou Bamba Diop (Badara)

**Données réelles :**
- **3 épouses** : Nafissatou Seck, Khady Ba, Mame Ngoné Dieng, Ndeye Ndiaye
- **21 enfants** de différentes épouses

**Affichage dans la Vue Famille :**
```
Amadou Bamba Diop (Badara)
│
├─ Épouses (4)
│  ├─ Nafissatou Seck
│  ├─ Khady Ba
│  ├─ Mame Ngoné Dieng
│  └─ Ndeye Ndiaye
│
└─ Enfants (21) [tous cliquables]
   ├─ Magatte Diop
   ├─ Betty Bamba Diop
   ├─ Bassirou Bamba Diop
   ├─ ... (18 autres)
   └─ Abdou Salam Diop (Bamba)
```

**Si on clique sur "Magatte Diop" :**
```
Magatte Diop
│
├─ Conjoint(s) de Magatte [si existant]
│
└─ Enfants de Magatte [si existant]
```

---

## 🔧 Prochaines Améliorations

### Phase 1 : ✅ Terminé
- [x] Créer la page Vue Famille Isolée
- [x] Ajouter la route dynamique
- [x] Bouton de navigation depuis le panneau d'info
- [x] Logique de filtrage des personnes

### Phase 2 : À Implémenter
- [ ] **Filtrer l'arbre global** à partir de Badara Gabar
  - Ne montrer que la lignée directe
  - Cacher les branches secondaires par défaut
- [ ] **Breadcrumb/Fil d'Ariane**
  - `Arbre Complet > Badara Gabar > Amadou Bamba > Magatte`
  - Navigation rapide dans l'historique
- [ ] **Boutons de navigation** dans la vue famille
  - "Voir le parent" (remonter d'un niveau)
  - "Retour" (historique de navigation)
- [ ] **Indicateur visuel** sur les nœuds cliquables
  - Badge "📁 Famille" sur les personnes avec enfants

### Phase 3 : Avancé
- [ ] **Mode "Arbre Compact"** sur l'arbre global
  - Collapse automatique des branches non-principales
  - Toggle expand/collapse par génération
- [ ] **Vue "Lignée Principale"**
  - Tracer la lignée directe de Badara Gabar à aujourd'hui
  - Highlight du chemin principal
- [ ] **Statistiques familiales**
  - Nombre de descendants directs
  - Nombre de générations
  - Arbre de distribution (graphique)

---

## 📊 Exemple d'Utilisation

### Cas d'usage : Explorer la descendance de Badara Gabar

**Étape 1 : Arbre Global**
```
1. Ouvrir http://localhost:8080
2. Chercher "Badara Gabar" dans la barre de recherche
3. Cliquer sur sa carte
4. Panneau s'ouvre à droite
5. Cliquer sur "Voir la famille de Badara"
```

**Étape 2 : Vue Famille de Badara**
```
1. Voir Badara + ses conjoints + ses enfants
2. Exemple : Alioune Badara Gabar Diop visible
3. Cliquer sur "Alioune Badara Gabar Diop"
```

**Étape 3 : Vue Famille d'Alioune Badara**
```
1. Voir Alioune Badara + ses conjoints + ses 13 enfants
2. Exemple : Amadou Bamba Diop (Badara) visible
3. Cliquer sur "Amadou Bamba Diop (Badara)"
```

**Étape 4 : Vue Famille d'Amadou Bamba**
```
1. Voir Amadou Bamba + ses 4 épouses + ses 21 enfants
2. Navigation possible vers chacun des 21 enfants
3. Exploration en profondeur sans surcharge visuelle
```

---

## 🎨 Design

### Layout Vue Famille

```
┌─────────────────────────────────────────────────┐
│ ← Arbre Complet    Famille de [Nom]            │ Header
├─────────────────────────────────────────────────┤
│ Vue : [Nom], ses conjoints et enfants directs  │ Info
├─────────────────────────────────────────────────┤
│                                                 │
│           ┌──────────┐                          │
│           │  Racine  │                          │
│           └─────┬────┘                          │
│      ┌──────────┼──────────┐                    │
│      │          │          │                    │
│  ┌───▼───┐  ┌──▼───┐  ┌──▼───┐                 │ Canvas
│  │Épouse1│  │Épouse2│  │Épouse3│                │
│  └───────┘  └──────┘  └──────┘                 │
│                                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐              │
│  │Enfant 1│ │Enfant 2│ │Enfant 3│              │
│  │   👆   │ │   👆   │ │   👆   │              │
│  └────────┘ └────────┘ └────────┘              │
├─────────────────────────────────────────────────┤
│ 🔵 Homme  🔴 Femme  — Mariage  ─ Parent-Enfant │ Legend
└─────────────────────────────────────────────────┘
```

### Nœuds Cliquables

- **Avec enfants** : Curseur pointer + effet hover
- **Sans enfants** : Pas d'interaction spéciale
- **Highlight** : Bordure verte sur hover

---

## 🛠️ Code

### Ouvrir la Vue Famille depuis JavaScript

```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Navigation vers la vue famille
navigate(`/family/${encodeURIComponent(person.name)}`);
```

### URL Exemples

```
/family/Badara%20Gabar%20Diop
/family/Amadou%20Bamba%20Diop%20(Badara)
/family/Alioune%20Badara%20Gabar%20Diop
```

### Récupérer le nom depuis l'URL

```typescript
import { useParams } from "react-router-dom";

const { personName } = useParams<{ personName: string }>();
const decodedName = decodeURIComponent(personName!);
```

---

## 📝 Notes Techniques

### Gestion des Noms avec Parenthèses

Les noms comme `"Amadou Bamba Diop (Badara)"` sont encodés :
- URL : `/family/Amadou%20Bamba%20Diop%20(Badara)`
- Décodage : `decodeURIComponent()`

### Performance

- **Pas de recalcul global** : Seule la famille ciblée est recalculée
- **Positions optimisées** : Layout adapté à la taille de la famille
- **Navigation rapide** : Pas de latence, chargement instantané

### Compatibilité

- ✅ Desktop : Layout spacieux
- ✅ Mobile : Layout adapté, boutons tactiles
- ✅ Tablet : Layout intermédiaire

---

## 🎉 Résultat

Avec ce système, vous pouvez :

1. **Voir l'arbre global** pour la vue d'ensemble
2. **Explorer en profondeur** famille par famille
3. **Éviter la surcharge** visuelle (pas de cascade infinie)
4. **Naviguer intuitivement** en cliquant sur les personnes
5. **Gérer les familles complexes** (plusieurs épouses, nombreux enfants)

**C'est exactement ce que vous vouliez : un système comme draw.io avec navigation par étapes ! 🎯**
