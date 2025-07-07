// Importation du module mysql2 pour gérer la connexion à la base de données MySQL
import mysql from "mysql2";

// Importation du module dotenv pour charger les variables d'environnement depuis un fichier .env
import dotenv from "dotenv";
dotenv.config();

let db; // Variable globale pour stocker la connexion MySQL active

// Fonction pour établir la connexion à la base de données
// Les paramètres de connexion sont récupérés depuis les variables d'environnement
export function connectDB(callback) {
  db = mysql.createConnection({
    host: process.env.DB_HOST, // Hôte MySQL (ex: 'localhost')
    port: process.env.DB_PORT, // Port MySQL (ex: 3306)
    user: process.env.DB_USER, // Utilisateur MySQL (ex: 'root')
    password: process.env.DB_PASSWORD, // Mot de passe MySQL
    database: process.env.DB_NAME, // Nom de la base de données
  });

  db.connect((err) => {
    if (err) {
      // Affiche une erreur si la connexion échoue
      console.error('Error connecting to database:', err);
      throw err;
    }
    // Affiche un message si la connexion réussit
    console.log("Connected to DB");
    callback();
  });
}

// Fonction pour récupérer la connexion MySQL active
export function getDB() {
  return db;
}
