// Importation des modules nécessaires pour la connexion à la base de données via SSH
import mysql from "mysql2"; // Permet d'utiliser les fonctionnalités MySQL en Node.js
import { Client as SSHClient } from "ssh2"; // Permet d'établir un tunnel SSH

// ===================================
// Configuration de la base de données
// ===================================
// Paramètres de connexion à la base MySQL distante via tunnel SSH.
const sshConfig = {
  host: "10.107.3.93", // Hôte SSH (serveur distant)
  port: 22, // Port SSH
  username: "admin", // Utilisateur SSH
  password: "iWsXsHBcf*22", // Mot de passe SSH (à sécuriser)
};

const dbConfig = {
  host: "127.0.0.1", // Hôte MySQL (local car tunnelé)
  port: 3307, // Port local du tunnel SSH (doit être libre sur la machine locale)
  user: "admin", // Utilisateur MySQL sur le serveur distant
  password: "iWsXsHBcf*22", // Mot de passe MySQL (à sécuriser)
  database: "moodle", // Nom de la base de données
};

let db; // Variable globale pour stocker la connexion MySQL active
let sshTunnel; // Pour garder la référence au tunnel SSH

// ========================================================================
// Fonction pour établir la connexion à la base de données via SSH tunnel
// ========================================================================
// Cette fonction crée un tunnel SSH puis une connexion MySQL à travers ce tunnel.
// Elle prend en paramètre un callback à exécuter une fois la connexion établie.
export function connectDB(callback) {
  sshTunnel = new SSHClient();
  sshTunnel.on("ready", () => {
    // Création du tunnel local -> distant
    sshTunnel.forwardOut(
      "127.0.0.1",
      3307,
      "127.0.0.1",
      3306,
      (err, stream) => {
        if (err) {
          console.error("Error setting up SSH tunnel:", err);
          throw err;
        }
        // Connexion MySQL via le tunnel SSH
        db = mysql.createConnection({
          ...dbConfig,
          stream,
        });
        db.connect((err) => {
          if (err) {
            console.error("Error connecting to database via SSH tunnel:", err);
            throw err;
          }
          console.log("Connected to DB via SSH tunnel");
          callback();
        });
      }
    );
  });
  sshTunnel.on("error", (err) => {
    console.error("SSH tunnel error:", err);
    throw err;
  });
  sshTunnel.connect(sshConfig);
}

// =====================================================
// Fonction pour récupérer la connexion MySQL active (db)
// =====================================================
// Permet d'accéder à la connexion MySQL depuis d'autres modules du projet.
export function getDB() {
  return db;
}
