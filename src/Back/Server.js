// ===============================
// IMPORTS ET INITIALISATION
// ===============================

// Import des modules nécessaires pour le serveur web, la gestion réseau et la base de données
import express from "express"; // Framework web pour créer l'API REST
import os from "os"; // Module pour obtenir des informations sur le système (IP locale)
import { connectDB, getDB } from "./db.js"; // Fonctions pour gérer la connexion à la base de données
import usersRouter from "./routes/users.js"; // Routes liées aux utilisateurs
import departementsRouter from "./routes/departements.js"; // Routes liées aux départements
import newsRouter from "./routes/news.js"; // Routes liées aux actualités

// Initialisation de l'application Express
const app = express();
app.use(express.json()); // Permet de traiter les requêtes JSON

// ===============================
// MIDDLEWARE DE SÉCURITÉ (CORS)
// ===============================
// Ce middleware permet d'autoriser les requêtes provenant d'autres domaines (Cross-Origin Resource Sharing)
// Indispensable pour que le front-end puisse communiquer avec l'API sans erreur de sécurité navigateur
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Autorise toutes les origines (à restreindre en production)
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ===============================
// ROUTAGE PRINCIPAL DE L'API
// ===============================
// On regroupe les routes par thématique pour une meilleure organisation et maintenabilité
app.use("/api", usersRouter); // Routes pour la gestion des utilisateurs
app.use("/api", departementsRouter); // Routes pour la gestion des départements
app.use("/api", newsRouter); // Routes pour la gestion des actualités

let db; // Variable globale pour stocker la connexion à la base de données

// ===============================
// FONCTION UTILITAIRE : IP LOCALE
// ===============================
// Permet d'afficher l'adresse IP locale du serveur lors du lancement (utile pour les tests en réseau local)
function getLocalIP() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i.family === "IPv4" && !i.internal)
    .pop().address;
}

// ===============================
// LANCEMENT DU SERVEUR
// ===============================
// On attend que la connexion à la base de données soit établie avant de démarrer le serveur Express.
// Cela garantit que l'API ne démarre que si la base est accessible (bonne pratique de robustesse).
connectDB(() => {
  db = getDB();
  const PORT = process.env.PORT || 5000; // Utilise le port défini en variable d'environnement ou 5000 par défaut
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`Serveur en écoute sur le port ${getLocalIP()}:${PORT}`)
  );
});
