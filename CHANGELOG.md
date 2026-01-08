# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Added

- ✅ Configuration complète de Vitest et Testing Library
- ✅ Suite de tests pour FamilyTreeEngine (19 tests, 100% passants)
- ✅ Suite de tests pour les utilitaires (6 tests, 100% passants)
- ✅ Documentation README complète et détaillée
- ✅ Commentaires JSDoc pour les fonctions complexes
- ✅ Mode strict TypeScript activé
- ✅ Pipeline CI/CD GitHub Actions
  - Workflow CI/CD principal (lint, test, build, deploy)
  - Workflow de vérification des Pull Requests
  - Workflow de release automatique
- ✅ Templates GitHub (PR, Bug Report, Feature Request)
- ✅ Guide de contribution (CONTRIBUTING.md)
- ✅ Couverture de tests avec Codecov

### Changed

- 🔧 TypeScript strict mode activé dans tsconfig.json
- 🔧 Configuration Vitest avec support jsdom
- 📝 README amélioré avec badges, documentation complète
- 📝 Commentaires détaillés dans FamilyTreeEngine

### Improved

- ⚡ Documentation des algorithmes (BFS, identification des conjoints)
- ⚡ Clarification de la complexité temporelle et spatiale
- 📊 Couverture de tests actuelle : 25 tests passants

## [1.0.0] - 2024-XX-XX

### Added

- 🌳 Arbre généalogique interactif avec D3.js
- 🔍 4 modes de visualisation (Arbre, Ancêtres, Descendants, Relation)
- 🎨 Design responsive (mobile, tablet, desktop)
- 📤 Export PNG et PDF haute résolution
- 🔎 Recherche de personnes avec filtrage
- 📚 Section archives avec 5 catégories
- 🎯 Deep linking avec paramètre URL `?focus=`
- ⚡ Optimisations de performance (Maps, BFS, debouncing)

### Technical Stack

- React 18.3.1 + TypeScript 5.8.3
- Vite 7.1.9 avec SWC
- Tailwind CSS 3.4.17
- shadcn/ui (49 composants)
- D3.js 7.8.5
- TanStack React Query 5.83.0

---

## Types de Changements

- `Added` - Nouvelles fonctionnalités
- `Changed` - Changements dans les fonctionnalités existantes
- `Deprecated` - Fonctionnalités bientôt supprimées
- `Removed` - Fonctionnalités supprimées
- `Fixed` - Corrections de bugs
- `Security` - Corrections de sécurité
- `Improved` - Améliorations de performance ou qualité
