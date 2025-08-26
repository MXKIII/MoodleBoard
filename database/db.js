// Importation des modules nécessaires pour la connexion à la base de données
import mysql from "mysql2";



// ===================================
// Configuration de la base de données
// ===================================
// Paramètres de connexion directe à la base MySQL locale
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "moodle",
};

let db; // Variable globale pour stocker la connexion MySQL active

// ====================================================
// Fonction pour établir la connexion à la base de données
// ====================================================
// Connexion directe à MySQL sans tunnel SSH
export function connectDB(callback) {
  db = mysql.createConnection(dbConfig);

  db.connect((err) => {
    if (err) {
      console.error('Erreur de connexion à la base de données:', err);
      throw err;
    }
    console.log("Connected to DB");
    if (callback) {
      callback();
    }
  });

  // Gestion des erreurs de connexion
  db.on('error', (err) => {
    console.error('Erreur de base de données:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Reconnexion à la base de données...');
      connectDB(callback);
    } else {
      throw err;
    }
  });
}

// =====================================================
// Fonction pour récupérer la connexion MySQL active
// =====================================================
// Permet d'accéder à la connexion MySQL depuis d'autres modules
export function getDB() {
  return db;
}

// ====================================================
// Fonction pour fermer proprement la connexion
// ====================================================
export function closeDB() {
  if (db) {
    db.end((err) => {
      if (err) {
        console.error('Erreur lors de la fermeture de la connexion:', err);
      } else {
        console.log('Connexion à la base de données fermée');
      }
    });
  }
}

// ====================================================
// Pool de connexions (optionnel, pour de meilleures performances)
// ====================================================
export function createPool() {
  const pool = mysql.createPool({
    ...dbConfig,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  return pool;
}
