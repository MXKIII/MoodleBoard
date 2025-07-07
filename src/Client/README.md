# MoodleBoard - Client

## Description

Ce projet correspond à la partie **front-end** de l’application MoodleBoard, réalisée en React.js.  
Il permet aux utilisateurs (étudiants, enseignants, managers) d’accéder à un tableau de bord interactif, de consulter des statistiques, des actualités et d’effectuer des requêtes personnalisées.

## Prérequis

- Node.js (version recommandée : >= 18)
- npm (ou yarn)
- Un navigateur moderne

## Installation

```bash
cd src/Client
npm install
```

## Lancement en développement

```bash
npm run dev
```

L’application sera accessible sur [http://localhost:5173](http://localhost:5173) (ou le port affiché).

## Structure du projet

- `App.jsx` : composant principal de l’application
- `main.jsx` : point d’entrée React
- `components/` : composants réutilisables (Admin, Student, Teacher, shared)
- `Style/` : fichiers SCSS pour le style

## Variables d’environnement

Créer un fichier `.env` à la racine du dossier `Client` avec les variables suivantes (adapter selon votre configuration) :

```
exemple:
VITE_API_BASE_URL=http://localhost
VITE_PORT=5000
```

Ces variables permettent de configurer l’URL de l’API backend et le port utilisé.


