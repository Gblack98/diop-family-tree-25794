# Guide de Contribution

Merci de votre intérêt pour contribuer au projet Diop Family Tree ! 🎉

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Configuration de l'Environnement](#configuration-de-lenvironnement)
- [Processus de Développement](#processus-de-développement)
- [Guidelines de Code](#guidelines-de-code)
- [Commits et Messages](#commits-et-messages)
- [Pull Requests](#pull-requests)
- [Tests](#tests)

## 🤝 Code de Conduite

Ce projet adhère à un code de conduite. En participant, vous vous engagez à respecter ce code.

- Soyez respectueux et inclusif
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est meilleur pour la communauté
- Faites preuve d'empathie envers les autres membres

## 🚀 Comment Contribuer

### Signaler des Bugs

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/Gblack98/diop-family-tree-25794/issues)
2. Créez une nouvelle issue en utilisant le template "Bug Report"
3. Décrivez le bug de manière claire et détaillée
4. Incluez les étapes pour reproduire le problème
5. Ajoutez des captures d'écran si pertinent

### Proposer des Fonctionnalités

1. Vérifiez si la fonctionnalité n'a pas déjà été proposée
2. Créez une nouvelle issue en utilisant le template "Feature Request"
3. Expliquez clairement le problème que cette fonctionnalité résout
4. Décrivez votre solution proposée
5. Discutez avec les mainteneurs avant de commencer le développement

### Soumettre des Changements

1. Fork le repository
2. Créez une branche depuis `main`
3. Faites vos changements
4. Écrivez ou mettez à jour les tests
5. Assurez-vous que tous les tests passent
6. Soumettez une Pull Request

## ⚙️ Configuration de l'Environnement

### Prérequis

- Node.js 18+ ou Bun
- npm ou yarn
- Git

### Installation

```bash
# 1. Forker et cloner le repository
git clone https://github.com/VOTRE-USERNAME/diop-family-tree-25794.git
cd diop-family-tree-25794

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev

# 4. Lancer les tests
npm test
```

## 🔄 Processus de Développement

### 1. Créer une Branche

```bash
# Pour une fonctionnalité
git checkout -b feature/nom-fonctionnalite

# Pour un bug fix
git checkout -b fix/nom-bug

# Pour de la documentation
git checkout -b docs/description
```

### 2. Développer

- Écrivez du code propre et lisible
- Suivez les conventions du projet
- Ajoutez des commentaires pour la logique complexe
- Testez vos changements localement

### 3. Tester

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Lint
npm run lint

# Build de production
npm run build
```

### 4. Commiter

```bash
git add .
git commit -m "type: description courte"
```

### 5. Push et PR

```bash
git push origin votre-branche
# Puis créez une Pull Request sur GitHub
```

## 📝 Guidelines de Code

### Style de Code

- **TypeScript**: Utilisez TypeScript avec le mode strict
- **Indentation**: 2 espaces
- **Quotes**: Guillemets doubles pour les strings
- **Semicolons**: Oui
- **Trailing commas**: Oui pour les objets/arrays multi-lignes

### Conventions de Nommage

```typescript
// Composants React - PascalCase
const FamilyTreeViewer: React.FC = () => { ... }

// Fonctions - camelCase
function calculatePositions() { ... }

// Constants - UPPER_SNAKE_CASE
const MAX_GENERATIONS = 10;

// Types/Interfaces - PascalCase
interface PersonNode { ... }
type TreeOrientation = "vertical" | "horizontal";
```

### Structure des Fichiers

```
src/
├── components/         # Composants React
│   ├── ui/            # Composants UI réutilisables
│   └── FamilyTree/    # Composants spécifiques
├── lib/               # Logique métier
├── hooks/             # Custom React hooks
├── pages/             # Pages de l'application
├── data/              # Données statiques
└── test/              # Utilitaires de test
```

## 💬 Commits et Messages

Nous suivons la convention [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
type(scope): description courte

[Corps optionnel]

[Footer optionnel]
```

### Types

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation uniquement
- `style`: Formatage, points-virgules manquants, etc.
- `refactor`: Refactoring sans changement de fonctionnalité
- `perf`: Amélioration des performances
- `test`: Ajout ou correction de tests
- `build`: Changements du système de build
- `ci`: Changements de CI/CD
- `chore`: Tâches diverses

### Exemples

```bash
feat(tree): add horizontal orientation support
fix(search): resolve filtering issue with accents
docs(readme): update installation instructions
test(engine): add tests for pathfinding algorithm
refactor(canvas): simplify positioning logic
```

## 🔍 Pull Requests

### Checklist

Avant de soumettre une PR, assurez-vous que :

- [ ] Le code compile sans erreurs
- [ ] Tous les tests passent (`npm test`)
- [ ] Le linting passe (`npm run lint`)
- [ ] Le build de production fonctionne (`npm run build`)
- [ ] Les nouveaux fichiers ont des tests
- [ ] La documentation est à jour
- [ ] Les changements sont décrits dans la PR
- [ ] Les commits suivent la convention

### Template de PR

Utilisez le template fourni qui inclut :

- Description des changements
- Type de changement
- Tests effectués
- Screenshots si applicable
- Issues liées

### Processus de Review

1. **Soumission**: Créez la PR avec une description claire
2. **CI/CD**: Attendez que les checks passent
3. **Review**: Un mainteneur reviewera le code
4. **Feedback**: Adressez les commentaires
5. **Merge**: Une fois approuvée, la PR sera mergée

## 🧪 Tests

### Écrire des Tests

```typescript
import { describe, it, expect } from "vitest";
import { FamilyTreeEngine } from "./FamilyTreeEngine";

describe("FamilyTreeEngine", () => {
  it("should initialize correctly", () => {
    const engine = new FamilyTreeEngine(persons, dimensions);
    expect(engine.getAllPersons().length).toBe(persons.length);
  });
});
```

### Couverture de Tests

- Visez une couverture de 80%+ pour le nouveau code
- Testez les cas limites
- Testez les chemins d'erreur
- Testez les cas normaux et exceptionnels

### Types de Tests

1. **Tests Unitaires**: Fonctions individuelles
2. **Tests d'Intégration**: Interactions entre composants
3. **Tests de Composants**: Composants React

## 📚 Ressources

- [Documentation React](https://react.dev/)
- [Documentation TypeScript](https://www.typescriptlang.org/docs/)
- [Documentation Vitest](https://vitest.dev/)
- [Documentation D3.js](https://d3js.org/)
- [shadcn/ui](https://ui.shadcn.com/)

## ❓ Questions

Si vous avez des questions :

1. Consultez la [documentation](./README.md)
2. Cherchez dans les [issues existantes](https://github.com/Gblack98/diop-family-tree-25794/issues)
3. Créez une nouvelle issue avec le label "question"
4. Rejoignez les [Discussions GitHub](https://github.com/Gblack98/diop-family-tree-25794/discussions)

## 🎉 Remerciements

Merci d'avoir pris le temps de contribuer ! Chaque contribution, petite ou grande, est appréciée. 🙏

---

**Happy Coding! 💻**
