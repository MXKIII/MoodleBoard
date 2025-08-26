import { getDB } from "../database/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// ===================================
// CONTRÔLEUR D'AUTHENTIFICATION
// ===================================
// Ce contrôleur gère l'authentification des utilisateurs via JWT
// Il vérifie les identifiants contre la base de données Moodle

// ===================================
// FONCTION DE CONNEXION
// ===================================
// Entrée : userId, password, role (dans req.body)
// Sortie : Token JWT + informations utilisateur si succès, erreur sinon
export const login = (req, res) => {
  // Récupération de la connexion à la base de données
  const db = getDB();

  // Extraction des données de la requête POST
  const { userId, password, role } = req.body;

  // ===================================
  // VALIDATION DES PARAMÈTRES D'ENTRÉE
  // ===================================
  // Vérification que tous les champs obligatoires sont présents
  if (!userId || !password || !role) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  // ===================================
  // REQUÊTE SQL POUR RÉCUPÉRER L'UTILISATEUR ET SES RÔLES
  // ===================================
  // Cette requête joint les tables user, role_assignments et role
  // pour récupérer l'utilisateur et tous ses rôles en une seule requête
  const query = `
  SELECT
    u.username, 
    u.password, 
    u.firstname,
    u.lastname,
    GROUP_CONCAT(DISTINCT r.shortname) AS roles
     FROM mdl_user u
     JOIN mdl_role_assignments ra ON u.id = ra.userid
     JOIN mdl_role r ON ra.roleid = r.id 
     WHERE u.username = ? GROUP BY u.username, u.password, u.firstname, u.lastname`;

  db.query(query, [userId], (err, results) => {
    // Gestion des erreurs de base de données
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "internal server error" });
    }

    // Vérification que l'utilisateur existe
    if (results.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    // ===================================
    // TRAITEMENT DES DONNÉES UTILISATEUR
    // ===================================
    // Récupération du premier résultat (utilisateur unique)
    const user = results[0];

    // Conversion de la chaîne de rôles en tableau
    const userRoles = user.roles.split(",");

    // ===================================
    // VÉRIFICATION DU MOT DE PASSE
    // ===================================
    // Utilisation de bcrypt pour comparer le mot de passe fourni
    // avec le hash stocké en base de données
    const comparedPassword = bcrypt.compareSync(password, user.password);

    // Si le mot de passe est correct
    if (comparedPassword) {
      // ===================================
      // VÉRIFICATION DU RÔLE DEMANDÉ
      // ===================================
      // Vérification que l'utilisateur possède le rôle demandé
      // ou un rôle équivalent (ex: editingteacher = Teacher)
      const expectedRole =
        userRoles.includes(role.toLowerCase()) || // Rôle exact
        (role === "Teacher" &&
          (userRoles.includes("editingteacher") ||
            userRoles.includes("teacher"))) ||
        (role === "Student" && userRoles.includes("student")) || // Student = student
        (role === "Admin" && userRoles.includes("manager")); // Admin = manager

      // Si l'utilisateur a le bon rôle
      if (expectedRole) {
        // ===================================
        // GÉNÉRATION DU TOKEN JWT
        // ===================================
        // Création d'un token JWT contenant les informations utilisateur
        const token = jwt.sign(
          {
            userId: user.username, // Identifiant utilisateur
            role: role, // Rôle demandé
            firstname: user.firstname, // Prénom
            lastname: user.lastname, // Nom
          },
          process.env.JWT_SECRET, // Clé secrète pour signer le token
          { expiresIn: "24h" } // Durée de validité : 24 heures
        );

        // ===================================
        // RÉPONSE DE SUCCÈS
        // ===================================
        // Envoi des données de connexion réussie au client
        res.json({
          success: true,
          token: token, // Le token contient déjà: userId, role, firstname, lastname
        });
      } else {
        // ===================================
        // ERREUR : RÔLE NON AUTORISÉ
        // ===================================
        // L'utilisateur existe et le mot de passe est correct,
        // mais il n'a pas le rôle demandé
        res.status(403).json({ error: "Role mismatch" });
      }
    } else {
      // ===================================
      // ERREUR : MOT DE PASSE INCORRECT
      // ===================================
      // L'utilisateur existe mais le mot de passe est incorrect
      res.status(401).json({ error: "Invalid password" });
    }
  });
};

// ===================================
// FONCTION DE DÉCONNEXION
// ===================================
// Cette fonction gère la déconnexion côté serveur
// Note: Avec JWT, la vraie déconnexion se fait côté client en supprimant le token
export const logout = (req, res) => {

  // ===================================
  // RÉPONSE DE CONFIRMATION
  // ===================================
  // Envoi d'une confirmation de déconnexion au client
  // Le client se chargera de supprimer le token localement
  res.json({
    success: true,
    message: "Logged out successfully",
  });

};
