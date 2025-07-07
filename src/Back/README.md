# MoodleBoard - Back

## Description

Ce projet correspond à la partie **back-end** de l’application MoodleBoard, réalisée en Node.js et Express.  
Il expose une API REST permettant de gérer les utilisateurs, les départements, les actualités et de fournir les statistiques à l’application front-end.

## Prérequis

- Node.js (version recommandée : >= 18)
- npm
- MySQL 
## Installation

```bash
cd src/Back
npm install
```

## Configuration

Renseigner les variables de connexion à la base de données dans un fichier `.env` ou directement dans `db.js` :

- `host`
- `port`
- `user`
- `password`
- `database`

## Lancement en développement

```bash
node Server.js
```

Le serveur écoute par défaut sur le port 5000 (modifiable dans le code).

## Structure du projet

- `Server.js` : point d’entrée du serveur Express
- `db.js` : gestion de la connexion MySQL (local ou SSH/production)
- `routes/` : routes API (users, departements, news)

## Déploiement

Pour déployer le serveur Node.js en production (exemple Railway, VPS, ou autre) :

1. **Installer les dépendances** sur le serveur :
   ```bash
   npm install
   ```
2. **Configurer les variables d'environnement** dans un fichier `.env` (voir section Configuration).
3. **Lancer le serveur** :
   ```bash
   node Server.js
   ```

4. **Ouvrir le port 5000** (ou celui configuré) sur le firewall du serveur.


Le serveur sera alors accessible à distance via l'adresse IP ou le nom de domaine du serveur.


