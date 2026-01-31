# 🌳 Diop Family Tree

Une application web interactive et moderne pour explorer l'arbre généalogique de la famille Diop. Construite avec React, TypeScript, D3.js et Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-18.3-blue)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)

## ✨ Fonctionnalités

### 🎯 Visualisation Interactive
- **Arbre Complet** - Vue d'ensemble de toute la famille
- **Vue Ancêtres** - Remontez la lignée d'une personne
- **Vue Descendants** - Explorez les descendants d'une personne
- **Recherche de Relation** - Trouvez le lien entre deux personnes

### 🖱️ Navigation Intuitive
- **Zoom & Pan** - Navigation fluide avec la souris/trackpad
- **Recherche** - Trouvez rapidement n'importe quel membre
- **Deep Linking** - Partagez un lien direct vers une personne (`?focus=NomPersonne`)
- **Double-clic** - Ajustement automatique à l'écran

### 📤 Export de Qualité
- **Export PNG** - Images haute résolution (2x scale)
- **Export PDF** - Documents prêts à imprimer
- **Qualité Professionnelle** - Parfait pour les archives familiales

### 📱 Design Responsive
- **Mobile** - Layout compact optimisé (110×50px)
- **Tablet** - Layout moyen (160×80px)
- **Desktop** - Layout complet (240×120px)
- **Adaptive UI** - Interface qui s'adapte à votre écran

### 📚 Archives Familiales
- **5 Catégories** - Biographies, Photos, Documents, Citations, Articles
- **Recherche Avancée** - Filtrage par mot-clé et catégorie
- **Galerie Interactive** - Parcourez l'histoire de la famille
- **Modals Détaillés** - Vue complète de chaque archive

## 🚀 Installation & Démarrage Rapide

### Prérequis
- Node.js 18+ ou Bun
- npm ou yarn

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/Gblack98/diop-family-tree-25794.git

# 2. Naviguer dans le dossier
cd diop-family-tree-25794

# 3. Installer les dépendances
npm install
# ou avec Bun
bun install

# 4. Lancer le serveur de développement
npm run dev
# L'application sera disponible sur http://localhost:8080
```

## 📦 Scripts Disponibles

```bash
# Développement
npm run dev          # Démarre le serveur de développement (port 8080)

# Build
npm run build        # Build de production
npm run build:dev    # Build en mode développement
npm run preview      # Preview du build de production

# Tests
npm test             # Lance les tests en mode watch
npm run test:ui      # Interface UI pour les tests (Vitest UI)
npm run test:coverage # Génère le rapport de couverture

# Qualité du code
npm run lint         # Vérifie le code avec ESLint
```

## 🏗️ Architecture du Projet

```
diop-family-tree-25794/
├── src/
│   ├── components/
│   │   ├── ui/                      # 49 composants shadcn/ui
│   │   ├── FamilyTree/              # Composants arbre généalogique
│   │   │   ├── FamilyTreeViewer.tsx    # Orchestrateur principal
│   │   │   ├── FamilyTreeCanvas.tsx    # Moteur de rendu D3
│   │   │   ├── Header.tsx              # Navigation & contrôles
│   │   │   ├── PersonInfoPanel.tsx     # Panneau d'informations
│   │   │   ├── SearchBar.tsx           # Barre de recherche
│   │   │   ├── ModePanel.tsx           # Sélecteur de mode
│   │   │   ├── Legend.tsx              # Légende visuelle
│   │   │   ├── Dedication.tsx          # Bannière de dédicace
│   │   │   └── nodeHTML.ts             # Générateur HTML des nœuds
│   │   └── Archives/                # Composants archives
│   │       ├── ArchiveCard.tsx
│   │       ├── ArchiveDialog.tsx
│   │       ├── ArchiveFilters.tsx
│   │       ├── ArchiveHeader.tsx
│   │       └── EmptyState.tsx
│   ├── lib/
│   │   ├── familyTree/
│   │   │   ├── FamilyTreeEngine.ts  # Logique métier (383 lignes)
│   │   │   ├── data.ts              # Données famille (302 lignes)
│   │   │   └── types.ts             # Interfaces TypeScript
│   │   └── utils.ts                 # Fonctions utilitaires
│   ├── hooks/
│   │   ├── use-mobile.tsx           # Hook détection mobile
│   │   └── use-toast.ts             # Hook notifications toast
│   ├── data/
│   │   └── archivesData.ts          # Données archives
│   ├── pages/
│   │   ├── Index.tsx                # Page arbre généalogique
│   │   ├── Archives.tsx             # Page archives
│   │   └── NotFound.tsx             # Page 404
│   ├── test/
│   │   ├── setup.ts                 # Configuration des tests
│   │   └── mockData.ts              # Données de test
│   ├── App.tsx                      # Composant principal
│   ├── main.tsx                     # Point d'entrée
│   └── index.css                    # Styles globaux
├── public/
│   └── images/archives/             # Images famille
├── vite.config.ts                   # Configuration Vite
├── tailwind.config.ts               # Configuration Tailwind
├── tsconfig.json                    # Configuration TypeScript
└── package.json
```

## 🛠️ Stack Technologique

### Frontend Core
- **React 18.3.1** - Bibliothèque UI
- **TypeScript 5.8.3** - Typage statique
- **Vite 7.1.9** - Build tool ultra-rapide
- **React Router DOM 6.30.1** - Routing

### UI & Styling
- **Tailwind CSS 3.4.17** - Framework CSS utility-first
- **shadcn/ui** - Composants UI (49 composants)
- **Radix UI** - Primitives accessibles (29 packages)
- **Lucide React** - Bibliothèque d'icônes

### Data Visualization
- **D3.js 7.8.5** - Visualisation de données
- **Recharts 2.15.4** - Graphiques et charts

### State & Forms
- **TanStack React Query 5.83.0** - Gestion d'état serveur
- **React Hook Form 7.61.1** - Gestion de formulaires
- **Zod 3.25.76** - Validation de schémas

### Utilities
- **date-fns 3.6.0** - Manipulation de dates
- **html2canvas 1.4.1** - Capture d'écran canvas
- **jsPDF 3.0.3** - Génération de PDF
- **next-themes 0.3.0** - Gestion des thèmes

### Development & Testing
- **Vitest 4.0.16** - Framework de tests
- **Testing Library** - Tests de composants React
- **ESLint 9.32.0** - Linter JavaScript/TypeScript

## 🧪 Tests

Le projet utilise Vitest et Testing Library pour les tests unitaires et d'intégration.

### Lancer les Tests

```bash
# Mode watch (recommandé en développement)
npm test

# Une seule fois
npm test -- --run

# Avec interface UI
npm run test:ui

# Avec couverture de code
npm run test:coverage
```

### Couverture de Tests

Les tests couvrent :
- ✅ **FamilyTreeEngine** - Logique métier de l'arbre (19 tests)
- ✅ **Utils** - Fonctions utilitaires (6 tests)
- 📝 **Components** - Tests des composants React (à venir)

**Total actuel : 25 tests passants**

### Écrire des Tests

Exemple de test :

```typescript
import { describe, it, expect } from "vitest";
import { FamilyTreeEngine } from "./FamilyTreeEngine";

describe("FamilyTreeEngine", () => {
  it("should initialize with correct persons", () => {
    const engine = new FamilyTreeEngine(persons, dimensions);
    const allPersons = engine.getAllPersons();
    expect(allPersons.length).toBe(persons.length);
  });
});
```

## 🎨 Personnalisation

### Thème & Couleurs

Le système de design utilise des variables CSS qui peuvent être personnalisées dans [index.css](src/index.css):

```css
:root {
  --primary: 156 70% 30%;      /* Vert heritage */
  --background: 30 15% 96%;    /* Fond crème chaleureux */
  --male-node: 200 80% 45%;    /* Bleu pour hommes */
  --female-node: 340 70% 65%;  /* Rose pour femmes */
}
```

### Dimensions de l'Arbre

Les dimensions sont configurables dans [FamilyTreeViewer.tsx](src/components/FamilyTree/FamilyTreeViewer.tsx):

```typescript
const dimensions = {
  nodeWidth: 240,
  nodeHeight: 120,
  levelHeight: 220,
  coupleSpacing: 40,
  siblingSpacing: 50,
};
```

### Données Généalogiques

Les données de la famille se trouvent dans [src/lib/familyTree/data.ts](src/lib/familyTree/data.ts):

```typescript
export const persons: Person[] = [
  {
    name: "Nom Prénom",
    genre: "Homme" | "Femme",
    generation: 0,
    parents: ["Parent1", "Parent2"],
    enfants: ["Enfant1", "Enfant2"],
  },
  // ...
];
```

## 🔧 Configuration

### Variables d'Environnement

Le projet peut être configuré via des variables d'environnement (créez un fichier `.env.local`):

```env
VITE_APP_TITLE=Diop Family Tree
VITE_API_URL=http://localhost:3000
```

### TypeScript

La configuration TypeScript se trouve dans [tsconfig.json](tsconfig.json). Le projet utilise des path aliases :

```typescript
import { Component } from "@/components/Component";
// au lieu de
import { Component } from "../../components/Component";
```

## 🚢 Déploiement

### Build de Production

```bash
npm run build
```

Le build sera généré dans le dossier `dist/`.

### Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Déploiement sur Netlify

```bash
# Installer Netlify CLI
npm i -g netlify-cli

# Déployer
netlify deploy --prod
```

### Déploiement sur GitHub Pages

```bash
# Ajouter dans package.json
"homepage": "https://username.github.io/diop-family-tree-25794"

# Build et déploiement
npm run build
npx gh-pages -d dist
```

## ⚡ Optimisations de Performance

Le projet inclut plusieurs optimisations :

1. **Structures de Données** - Maps pour lookups O(1)
2. **Debouncing** - Recherche (300ms), resize (200ms)
3. **Memoization** - useMemo pour calculs coûteux
4. **Données Pré-normalisées** - Archives normalisées au chargement
5. **Algorithmes Efficaces** - BFS pour pathfinding
6. **Code Splitting** - Chargement optimisé des routes
7. **Vite SWC** - Compilation ultra-rapide

## 📊 Données Généalogiques

### Structure de la Famille Diop

- **6+ Générations** trackées
- **218 Membres** de famille
- **Ancêtres Racines** : Daro Wade, Waly Bandia Gueye, Charles Medor Diop, Bercy Ndack Ndir, Ndiogou Seck, William Diouf
- **Lignées Principales** : Diop, Seck, Diagne, Ba, Diallo

### Algorithmes Généalogiques

Le moteur utilise des algorithmes avancés :

- **BFS (Breadth-First Search)** - Recherche de chemin entre personnes
- **Traversée Récursive** - Calcul des ancêtres/descendants
- **Groupement de Couples** - Positionnement optimisé des conjoints
- **Layout Adaptatif** - Calcul vertical/horizontal

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créez** une branche (`git checkout -b feature/AmazingFeature`)
3. **Commitez** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Pushez** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

### Guidelines

- Écrivez des tests pour les nouvelles fonctionnalités
- Suivez le style de code existant (ESLint)
- Documentez les fonctions complexes
- Mettez à jour le README si nécessaire

## 📝 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- **Ibrahima Gabar Diop** - Créateur et mainteneur

## 🙏 Remerciements

- Famille Diop pour l'histoire et les archives
- Communauté open-source pour les bibliothèques utilisées
- shadcn pour le magnifique système de composants

## 📞 Contact & Support

- **Issues** : [GitHub Issues](https://github.com/Gblack98/diop-family-tree-25794/issues)
- **Discussions** : [GitHub Discussions](https://github.com/Gblack98/diop-family-tree-25794/discussions)

---

**Made with ❤️ for the Diop Family**
