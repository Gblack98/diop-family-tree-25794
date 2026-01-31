# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Added

- ✨ **Import massif de 43 nouveaux membres** (de 175 à 218 personnes)
  - Lignée complète de Binta Yama Seck (11 enfants, 19 petits-enfants)
  - Ancêtres de la famille Seck (Yatma Seck, Oulimata Diouf, Ndiogou Seck, etc.)
  - Connexions entre les familles Diop, Seck et Diagne
  - Documentation des mariages entre cousins (Magatte Diop × Diarra Diagne)
- ✨ Vue constellation (FamilyView) pour explorer les familles individuelles
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
- 📝 README amélioré avec badges, documentation complète (218 membres)
- 📝 Commentaires détaillés dans FamilyTreeEngine

### Fixed

- 🐛 **Correction du genre de Magatte Diop** (Femme → Homme)
- 🐛 **Correction des incohérences de données**
  - Rama → "Ndeye Fatou Diop (Doudou)" au lieu de "Ndeye Fatou Diop"
  - Binta Sarr ajoutée comme parent de Moustapha Diallo et Souleymane Diallo
  - Pathe Seck ajouté comme parent de Penda Seck
  - Nettoyage des enfants non existants de Yatma Seck
- 🐛 **Amélioration du centrage de l'arbre complet**
  - Calcul du centre géométrique basé sur tous les nœuds visibles
  - Zoom adaptatif automatique pour afficher l'arbre entier
  - L'arbre apparaît parfaitement centré au chargement

### Improved

- ⚡ **Optimisation de la vue constellation pour 218 personnes**
  - Distance entre nœuds augmentée de 55% (160-280px)
  - Force de répulsion augmentée de 75% (-1400 à -2400)
  - Rayon de collision augmenté de 50% (60-100px)
  - Échelle initiale réduite pour vue d'ensemble (0.45-0.65)
  - Paramètres de simulation D3 optimisés (velocityDecay, distanceMin/Max)
- ⚡ **Réorganisation du texte de dédicace** pour Binta Yama Seck (meilleur flow)
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
