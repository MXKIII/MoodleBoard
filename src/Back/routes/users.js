import express from "express";
const router = express.Router();
import { getDB } from "../db.js";
import bcrypt from "bcrypt";

// ===================================
// Authentification utilisateur (login)
// ===================================
router.post("/login", (req, res) => {
  const db = getDB();
  const { userId, password, role } = req.body;
  // On récupère le hash du mot de passe et les rôles de l'utilisateur
  const query =
    "SELECT u.username, u.password, GROUP_CONCAT(DISTINCT r.shortname) AS roles FROM mdl_user u JOIN mdl_role_assignments ra ON u.id = ra.userid JOIN mdl_role r ON ra.roleid = r.id WHERE u.username = ? GROUP BY u.username, u.password";

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }
    const user = results[0];
    const userRoles = user.roles.split(",");
    // Vérification du mot de passe avec bcrypt (sécurité)
    const expectedPassword = bcrypt.compareSync(password, user.password);

    if (expectedPassword) {
      // Vérification du rôle demandé
      if (userRoles.includes(role.toLowerCase())) {
        res.json({ success: true, userId: user.username, role: user.role });
      } else if (role === "Teacher" && userRoles.includes("editingteacher")) {
        res.json({ success: true, userId: user.username, role: "Teacher" });
      } else {
        res.status(403).json({ error: "Role mismatch" });
      }
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
});

/*
  ===============================
  EXEMPLE DE ROUTE COMMENTÉE
  ===============================
  - Chaque route suivante doit être précédée d'un commentaire expliquant :
    * Son objectif (ex : récupérer les cours d'un utilisateur)
    * Les paramètres attendus (ex : userId dans req.body)
    * Le format de la réponse
    * Les points de sécurité ou d'accessibilité importants
*/

// ===================================
// Récupérer les cours suivis par un utilisateur
// ===================================
router.post("/user-small-courses", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour compter les cours terminés, en cours, à venir, et retourner les détails pour chaque cours de l'utilisateur
  const sqlQuery = `
    SELECT 
    COUNT(*) AS total_courses,
    SUM(CASE WHEN c.enddate < UNIX_TIMESTAMP(NOW()) THEN 1 ELSE 0 END) AS completed_courses,
    SUM(CASE WHEN c.enddate >= UNIX_TIMESTAMP(NOW()) THEN 1 ELSE 0 END) AS ongoing_courses,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'Numéro', (@row_number := @row_number + 1),
            'Classe', c.fullname,
            'prénom', u.firstname,
            'nom', u.lastname,
            'email', u.email,
            'Statut_cours', CASE 
                WHEN c.startdate > UNIX_TIMESTAMP(NOW()) THEN 'À venir'
                WHEN c.enddate < UNIX_TIMESTAMP(NOW()) THEN 'Terminé'
                ELSE 'En cours'
            END
            )
        ) AS course_details
    FROM mdl_course c
    JOIN mdl_enrol e ON e.courseid = c.id
    JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
    JOIN mdl_user u ON u.id = ue.userid
    CROSS JOIN (SELECT @row_number := 0) AS init
    WHERE c.visible = 1 AND u.username = ?
    ORDER BY c.fullname, u.lastname, u.firstname;
  `;
  db.query(sqlQuery, [userId], (err, results) => {
    // Gestion des erreurs : log côté serveur et réponse générique pour la sécurité
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    // Si aucun résultat, on retourne des valeurs par défaut pour éviter les erreurs côté front
    if (results.length === 0) {
      return res.json({
        totalCourses: 0,
        completedCourses: 0,
        ongoingCourses: 0,
        smallCourses: [],
      });
    }
    // Extraction et structuration des données pour le front
    const {
      total_courses,
      completed_courses,
      ongoing_courses,
      course_details,
    } = results[0];
    res.json({
      totalCourses: total_courses,
      completedCourses: completed_courses,
      ongoingCourses: ongoing_courses,
      smallCourses: course_details,
    });
  });
});

// ===================================
// Récupérer la progression de l'utilisateur sur ses activités
// ===================================
// Entrée : userId (dans req.body)
// Sortie : total d'activités, pourcentage de complétion, nombre d'activités non complétées
router.post("/user-small-progression", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour compter le nombre total d'activités, calculer le pourcentage de complétion global,
  // et déterminer le nombre d'activités non complétées pour l'utilisateur
  const sqlQuery = `
    SELECT 
        COUNT(cm.id) AS total_activities,
        ROUND(AVG(CASE WHEN cmc.completionstate = 1 THEN 100 ELSE 0 END), 2) AS overall_completion_percentage,
        COUNT(cm.id) - SUM(CASE WHEN cmc.completionstate = 1 THEN 1 ELSE 0 END) AS uncomplete_activities
    FROM 
        mdl_course c
    JOIN 
        mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
    JOIN 
        mdl_role_assignments ra ON ra.contextid = ctx.id
    JOIN 
        mdl_user u ON u.id = ra.userid
    JOIN 
        mdl_course_modules cm ON cm.course = c.id
    LEFT JOIN 
        mdl_course_modules_completion cmc ON cmc.coursemoduleid = cm.id AND cmc.userid = u.id
    WHERE 
        c.visible = 1 
        AND u.username = ?
  `;
  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    if (results.length === 0) {
      return res.json({
        totalActivities: 0,
        overallCompletionPercentage: 0,
        uncompleteActivities: 0,
      });
    }
    const {
      total_activities,
      overall_completion_percentage,
      uncomplete_activities,
    } = results[0];
    res.json({
      totalActivities: total_activities,
      overallCompletionPercentage: overall_completion_percentage,
      uncompleteActivities: uncomplete_activities,
    });
  });
});

// ===================================
// Récupérer les cours publiés par un enseignant
// ===================================
// Entrée : userId (dans req.body)
// Sortie : liste des cours publiés avec nom, code, enseignant, date de publication
router.post("/teacher-published-courses", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer la liste des cours publiés par un enseignant avec nom, code, enseignant, date de publication
  const sqlQuery = `
    SELECT
      c.fullname AS \`nom cours\`,
      c.shortname AS \`code cours\`,
      CONCAT(u.firstname, ' ', u.lastname) AS enseignant,
      DATE_FORMAT(FROM_UNIXTIME(c.timemodified), '%d %b %Y %H:%i:%s') AS \`date de publication\`
    FROM
      mdl_course c
    JOIN mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
    JOIN mdl_role_assignments ra ON ra.contextid = ctx.id
    JOIN mdl_role r ON r.id = ra.roleid
    JOIN mdl_user u ON u.id = ra.userid
    WHERE
      r.shortname = 'editingteacher'
      AND u.username = ?
      AND c.visible = 1
    ORDER BY
      enseignant ASC, \`date de publication\` DESC;
  `;
  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Récupérer les brouillons de cours d'un enseignant
// ===================================
// Entrée : userId (dans req.body)
// Sortie : liste des brouillons de cours
router.post("/teacher-drafted-courses", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer la liste des brouillons de cours d'un enseignant
  const sqlQuery = `
    SELECT
      c.fullname AS \`nom cours\`,
      c.shortname AS \`code cours\`,
      CONCAT(u.firstname, ' ', u.lastname) AS enseignant,
      DATE_FORMAT(FROM_UNIXTIME(c.timemodified), '%d %b %Y %H:%i:%s') AS \`date de publication\`
    FROM
      mdl_course c
    JOIN mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
    JOIN mdl_role_assignments ra ON ra.contextid = ctx.id
    JOIN mdl_role r ON r.id = ra.roleid
    JOIN mdl_user u ON u.id = ra.userid
    WHERE
      r.shortname = 'editingteacher'
      AND u.username = ?
      AND c.visible = 0
    ORDER BY
      enseignant ASC, \`date de publication\` DESC;
  `;
  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Récupérer les badges obtenus par un utilisateur
// ===================================
// Entrée : userId (dans req.body)
// Sortie : liste des badges avec nom, description, date, cours associé
router.post("/user-badge", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer la liste des badges obtenus par un utilisateur avec nom, description, date, cours associé
  const sqlQuery = `
    SELECT 
    u.id AS id,
    u.firstname as prenom,
    u.lastname as nom,
    b.name AS nom_badge,
    b.description AS description_badge,
    DATE_FORMAT(FROM_UNIXTIME(bi.dateissued), '%d %b %Y %H:%i:%s') AS date_attribution,
    c.fullname AS cours
    FROM 
      mdl_badge_issued bi
    JOIN 
      mdl_badge b ON bi.badgeid = b.id
    JOIN 
      mdl_user u ON bi.userid = u.id
    LEFT JOIN 
      mdl_course c ON b.courseid = c.id
    WHERE 
      u.username = ?
      AND bi.dateissued <= UNIX_TIMESTAMP(NOW())
    ORDER BY 
      bi.dateissued DESC
  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

// ===================================
// Récupérer le nombre d'activités par cours pour un utilisateur
// ===================================
// Entrée : userId (dans req.body)
// Sortie : liste des cours avec nombre d'activités
router.post("/user-activities", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer le nombre d'activités par cours pour un utilisateur
  const sqlQuery = `
    SELECT 
      c.fullname AS cours,
      COUNT(cm.id) AS nombre_de_cours
    FROM 
      mdl_course c
    JOIN 
      mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
    JOIN 
      mdl_role_assignments ra ON ra.contextid = ctx.id
    JOIN 
      mdl_user u ON u.id = ra.userid
    JOIN 
      mdl_course_modules cm ON cm.course = c.id
    WHERE 
      c.visible = 1 
      AND u.username = ?
    GROUP BY 
      c.id, c.fullname
    ORDER BY 
      c.fullname
  `;
  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    const totalActivities = results.reduce(
      (sum, course) => sum + course.total_activities,
      0
    );
    res.json({
      total_activities: totalActivities,
      course_details: results,
    });
  });
});

// ===================================
// Récupérer la liste des cours d'un utilisateur
// ===================================
// Entrée : userId (dans req.body)
// Sortie : nombre total de cours et détails
router.post("/user-courses", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer la liste des cours d'un utilisateur avec le nombre total de cours et détails
  const sqlQuery = `
    SELECT 
      COUNT(*) AS total_courses,
      JSON_ARRAYAGG(
          JSON_OBJECT(
              'Classe', c.fullname,
              'Statut_cours', CASE 
                  WHEN c.startdate > UNIX_TIMESTAMP(NOW()) THEN 'À venir'
                  WHEN c.enddate < UNIX_TIMESTAMP(NOW()) THEN 'Terminé'
                  ELSE 'En cours'
              END
          )
      ) AS course_details
    FROM mdl_course c
    JOIN mdl_enrol e ON e.courseid = c.id
    JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
    JOIN mdl_user u ON u.id = ue.userid
    CROSS JOIN (SELECT @row_number := 0) AS init
    WHERE c.visible = 1
    AND u.username = ?
    ORDER BY c.fullname, u.lastname, u.firstname;
  `;
  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results[0]);
  });
});

// ===================================
// Récupérer la liste des étudiants (filtrage possible par date)
// ===================================
// Entrée : startDate, endDate (dans req.body)
// Sortie : liste des étudiants avec infos principales
router.post("/student-user", (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;
  // Requête SQL pour récupérer la liste des étudiants avec filtrage possible par date d'inscription
  const sqlQuery = `
    SELECT DISTINCT
      u.id, u.username as nom_utilisateur, u.firstname as prenom, u.lastname nom, u.email,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS dernier_accès
    FROM mdl_user u
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE u.deleted = 0 
      AND u.suspended = 0
      AND r.shortname = 'student'
    `;

  const params = [startDate, endDate];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Récupérer la liste des enseignants (filtrage possible par date)
// ===================================
// Entrée : startDate, endDate (dans req.body)
// Sortie : liste des enseignants avec infos principales
router.post("/teacher-user", (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;
  // Requête SQL pour récupérer la liste des enseignants avec filtrage possible par date d'inscription
  const sqlQuery = `
   SELECT DISTINCT
      u.id, u.username as nom_utilisateur, u.firstname as prenom, u.lastname nom, u.email,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS dernier_accès
    FROM mdl_user u
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE u.deleted = 0 
      AND u.suspended = 0
      AND r.shortname IN ('teacher')
  

  `;
  const params = [startDate, endDate];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Récupérer la liste des administrateurs (filtrage possible par date)
// ===================================
// Entrée : startDate, endDate (dans req.body)
// Sortie : liste des admins avec infos principales
router.post("/admin-user", (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;
  // Requête SQL pour récupérer la liste des administrateurs avec filtrage possible par date d'inscription
  const sqlQuery = `
   SELECT DISTINCT
      u.id, u.username as nom_utilisateur, u.firstname as prenom, u.lastname nom, u.email,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS dernier_accès
    FROM mdl_user u
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE u.deleted = 0 
      AND u.suspended = 0
      AND r.shortname = 'editingteacher'
    `;
  const params = [startDate, endDate];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Récupérer la liste des autres utilisateurs (ni étudiant, ni enseignant, ni admin)
// ===================================
// Entrée : startDate, endDate (dans req.body)
// Sortie : liste des autres utilisateurs
router.post("/other-user", (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;
  // Requête SQL pour récupérer la liste des autres utilisateurs avec filtrage possible par date d'inscription
  const sqlQuery = `
     SELECT DISTINCT
      u.id, u.username as nom_utilisateur, u.firstname as prenom, u.lastname nom, u.email,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS dernier_accès
    FROM mdl_user u
    LEFT JOIN mdl_role_assignments ra ON ra.userid = u.id
    LEFT JOIN mdl_role r ON r.id = ra.roleid
    WHERE u.deleted = 0 
      AND u.suspended = 0
      AND (r.shortname NOT IN ('student','teacher','editingteacher','manager') OR r.shortname IS NULL)
      

  `;

  const params = [startDate, endDate];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Récupérer la liste des étudiants actifs sur une période
// ===================================
// Entrée : startDate, endDate (dans req.body)
// Sortie : liste des étudiants actifs
router.post("/active-student", (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;
  // Requête SQL pour récupérer la liste des étudiants actifs sur une période donnée
  const sqlQuery = `
  SELECT DISTINCT
      u.id, 
      u.username as nom_utilisateur, u.firstname as prenom, u.lastname nom, u.email,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS dernier_accès
    FROM mdl_user u
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE u.deleted = 0 
      AND u.suspended = 0
      AND r.shortname = 'student'
      AND u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?)
  `;

  const params = [startDate, endDate];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Récupérer la liste des enseignants actifs sur une période
// ===================================
// Entrée : startDate, endDate (dans req.body)
// Sortie : liste des enseignants actifs
router.post("/active-teacher", (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;
  // Requête SQL pour récupérer la liste des enseignants actifs sur une période donnée
  const sqlQuery = `
  SELECT DISTINCT
    u.id, 
    u.username as nom_utilisateur, u.firstname as prenom, u.lastname nom, u.email,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS dernier_accès
  FROM 
    mdl_user u
  JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
  JOIN 
    mdl_role r ON r.id = ra.roleid
  WHERE 
    u.deleted = 0 
    AND u.suspended = 0
    AND r.shortname IN ('teacher')
    AND u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?)
  `;

  const params = [startDate, endDate];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Récupérer la liste des administrateurs actifs sur une période
// ===================================
// Entrée : startDate, endDate (dans req.body)
// Sortie : liste des admins actifs
router.post("/active-admin", (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;
  // Requête SQL pour récupérer la liste des administrateurs actifs sur une période donnée
  const sqlQuery = `
  SELECT DISTINCT
    u.id, 
    u.username as nom_utilisateur, u.firstname as prenom, u.lastname nom, u.email,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS dernier_accès
  FROM 
    mdl_user u
  JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
  JOIN 
    mdl_role r ON r.id = ra.roleid
  WHERE 
    u.deleted = 0 
    AND u.suspended = 0
    AND r.shortname = 'editingteacher'
    AND u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?)
  `;

  const params = [startDate, endDate];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Récupérer la liste des autres utilisateurs actifs sur une période
// ===================================
// Entrée : startDate, endDate (dans req.body)
// Sortie : liste des autres utilisateurs actifs
router.post("/active-other", (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;
  // Requête SQL pour récupérer la liste des autres utilisateurs actifs sur une période donnée
  const sqlQuery = `
  SELECT DISTINCT
    u.id, 
    u.username as nom_utilisateur, u.firstname as prenom, u.lastname nom, u.email, 
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS dernier_accès
  FROM 
    mdl_user u
  LEFT JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
  LEFT JOIN 
    mdl_role r ON r.id = ra.roleid
  WHERE 
    u.deleted = 0 
    AND u.suspended = 0
    AND (r.shortname NOT IN ('student', 'teacher', 'editingteacher', 'manager') OR r.shortname IS NULL)
    AND u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?)
  `;

  const params = [startDate, endDate];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Statistiques globales d'activité utilisateur (tous rôles)
// ===================================
// Entrée : startDate, endDate (dans req.body)
// Sortie : statistiques globales (nombre total, actifs, inactifs, par rôle, etc.)
router.post("/user-activity", (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;
  // Requête SQL pour récupérer des statistiques globales d'activité utilisateur sur une période donnée
  const sqlQuery = `
  SELECT DISTINCT
    u.id, 
    u.username as nom_utilisateur, u.firstname as prenom, u.lastname nom, u.email,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS dernier_accès
  FROM 
    mdl_user u
  LEFT JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
  LEFT JOIN 
    mdl_role r ON r.id = ra.roleid
  WHERE 
    u.deleted = 0 
    AND u.suspended = 0
    AND (r.shortname NOT IN ('student', 'teacher', 'editingteacher', 'manager') OR r.shortname IS NULL)
    AND u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?)
  `;

  const params = [startDate, endDate];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Statistiques d'activité quotidienne par rôle (étudiant, enseignant, admin, autre)
// ===================================
// Entrée : startDate, endDate (dans req.body)
// Sortie : nombre de connexions par jour
router.post("/student-activity-by-day", (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;

  const startTimestamp = Math.floor(
    new Date(`${startDate}T00:00:00Z`).getTime() / 1000
  );
  const endTimestamp = Math.floor(
    new Date(`${endDate}T23:59:59Z`).getTime() / 1000
  );

  // Requête SQL pour récupérer le nombre de connexions par jour pour les étudiants
  const sqlQuery = `
    SELECT 
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%Y-%m-%d') AS jour,
      COUNT(DISTINCT u.id) AS nombre_connexions
    FROM mdl_user u
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE 
      u.deleted = 0 
      AND u.suspended = 0
      AND r.shortname = 'student'
      AND u.lastaccess BETWEEN ? AND ?
    GROUP BY jour
    ORDER BY jour ASC;
  `;

  const params = [startTimestamp, endTimestamp];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});
router.post("/teacher-activity-by-day", (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;

  const startTimestamp = Math.floor(
    new Date(`${startDate}T00:00:00Z`).getTime() / 1000
  );
  const endTimestamp = Math.floor(
    new Date(`${endDate}T23:59:59Z`).getTime() / 1000
  );
  // Requête SQL pour récupérer le nombre de connexions par jour pour les enseignants
  const sqlQuery = `
     SELECT 
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%Y-%m-%d') AS jour,
      COUNT(DISTINCT u.id) AS nombre_connexions
    FROM mdl_user u
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE 
      u.deleted = 0 
      AND u.suspended = 0
      AND r.shortname = 'teacher'
      AND u.lastaccess BETWEEN ? AND ?
    GROUP BY jour
    ORDER BY jour ASC;
  `;

  const params = [startTimestamp, endTimestamp];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});
router.post("/admin-activity-by-day", (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;

  const startTimestamp = Math.floor(
    new Date(`${startDate}T00:00:00Z`).getTime() / 1000
  );
  const endTimestamp = Math.floor(
    new Date(`${endDate}T23:59:59Z`).getTime() / 1000
  );
  // Requête SQL pour récupérer le nombre de connexions par jour pour les administrateurs
  const sqlQuery = `
     SELECT 
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%Y-%m-%d') AS jour,
      COUNT(DISTINCT u.id) AS nombre_connexions
    FROM mdl_user u
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE 
      u.deleted = 0 
      AND u.suspended = 0
      AND r.shortname = 'editingteacher'
      AND u.lastaccess BETWEEN ? AND ?
    GROUP BY jour
    ORDER BY jour ASC;
  `;

  const params = [startTimestamp, endTimestamp];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});
router.post("/other-activity-by-day", (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;

  const startTimestamp = Math.floor(
    new Date(`${startDate}T00:00:00Z`).getTime() / 1000
  );
  const endTimestamp = Math.floor(
    new Date(`${endDate}T23:59:59Z`).getTime() / 1000
  );
  // Requête SQL pour récupérer le nombre de connexions par jour pour les autres utilisateurs
  const sqlQuery = `
     SELECT 
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%Y-%m-%d') AS jour,
      COUNT(DISTINCT u.id) AS nombre_connexions
    FROM mdl_user u
    LEFT JOIN mdl_role_assignments ra ON ra.userid = u.id
    LEFT JOIN mdl_role r ON r.id = ra.roleid
    WHERE 
      u.deleted = 0 
      AND u.suspended = 0
      AND (r.shortname NOT IN ('student', 'teacher', 'editingteacher', 'manager') OR r.shortname IS NULL)
      AND u.lastaccess BETWEEN ? AND ?
    GROUP BY jour
    ORDER BY jour ASC;
  `;

  const params = [startTimestamp, endTimestamp];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Statistiques d'activité par date précise (pour chaque rôle)
// ===================================
// Entrée : date (dans req.body)
// Sortie : détails des connexions ce jour-là
router.post("/active-student-by-date", (req, res) => {
  const db = getDB();
  const { date } = req.body;

  const startTimestamp = `${date} 00:00:00`;
  const endTimestamp = `${date} 23:59:59`;

  // Requête SQL pour récupérer les détails des connexions des étudiants à une date précise
  const sqlQuery = `
    SELECT 
        c.fullname AS cours,
        COUNT(DISTINCT u.id) AS connexions,
        GROUP_CONCAT(DISTINCT CONCAT(u.firstname, ' ', u.lastname) SEPARATOR ', ') AS noms
    FROM 
        mdl_user u
    JOIN 
        mdl_role_assignments ra ON ra.userid = u.id
    JOIN 
        mdl_role r ON r.id = ra.roleid
    JOIN 
        mdl_user_enrolments ue ON ue.userid = u.id
    JOIN 
        mdl_enrol e ON e.id = ue.enrolid
    JOIN 
        mdl_course c ON c.id = e.courseid
    WHERE 
        u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?)
        AND u.deleted = 0
        AND u.suspended = 0
        AND r.shortname = 'student'
    GROUP BY 
        c.fullname
    ORDER BY 
        connexions DESC, c.fullname ASC;
  `;

  db.query(sqlQuery, [startTimestamp, endTimestamp], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results || []);
  });
});
router.post("/active-teacher-by-date", (req, res) => {
  const db = getDB();
  const { date } = req.body;
  // Requête SQL pour récupérer les détails des connexions des enseignants à une date précise
  const sqlQuery = `
    SELECT DISTINCT
      u.firstname as prenom, 
      u.lastname as nom, 
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS dernier_accès
    FROM 
      mdl_user u
    JOIN 
      mdl_role_assignments ra ON ra.userid = u.id
    JOIN 
      mdl_role r ON r.id = ra.roleid
    WHERE 
      DATE(FROM_UNIXTIME(u.lastaccess)) = ?
      AND u.deleted = 0
      AND u.suspended = 0
      AND r.shortname = 'teacher'
      ORDER BY dernier_accès DESC;
  `;

  db.query(sqlQuery, [date], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results || []);
  });
});
router.post("/active-admin-by-date", (req, res) => {
  const db = getDB();
  const { date } = req.body;
  // Requête SQL pour récupérer les détails des connexions des administrateurs à une date précise
  const sqlQuery = `
    SELECT DISTINCT
      u.firstname as prenom, 
      u.lastname as nom, 
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS dernier_accès
    FROM 
      mdl_user u
    JOIN 
      mdl_role_assignments ra ON ra.userid = u.id
    JOIN 
      mdl_role r ON r.id = ra.roleid
    WHERE 
      DATE(FROM_UNIXTIME(u.lastaccess)) = ?
      AND u.deleted = 0
      AND u.suspended = 0
      AND r.shortname = 'editingteacher'
      ORDER BY dernier_accès DESC;
  `;

  db.query(sqlQuery, [date], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results || []);
  });
});
router.post("/active-other-by-date", (req, res) => {
  const db = getDB();
  const { date } = req.body;
  // Requête SQL pour récupérer les détails des connexions des autres utilisateurs à une date précise
  const sqlQuery = `
   SELECT DISTINCT
      u.firstname as prenom, 
      u.lastname as nom, 
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS dernier_accès
    FROM 
      mdl_user u
    LEFT JOIN 
      mdl_role_assignments ra ON ra.userid = u.id
    LEFT JOIN 
      mdl_role r ON r.id = ra.roleid
    WHERE 
      DATE(FROM_UNIXTIME(u.lastaccess)) = ?
      AND u.deleted = 0
      AND u.suspended = 0
      AND (r.shortname NOT IN ('student', 'teacher', 'editingteacher', 'manager') OR r.shortname IS NULL)
    ORDER BY dernier_accès DESC;
  `;
  db.query(sqlQuery, [date], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results || []);
  });
});

// ===================================
// Récupérer tous les cours (pour tous les utilisateurs)
// ===================================
router.post("/all-small-courses", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer tous les cours avec le nombre total de cours, cours terminés, cours en cours
  const sqlQuery = `
    SELECT 
    COUNT(*) AS total_courses,
    SUM(CASE WHEN c.enddate < UNIX_TIMESTAMP(NOW()) THEN 1 ELSE 0 END) AS completed_courses,
    SUM(CASE WHEN c.enddate >= UNIX_TIMESTAMP(NOW()) THEN 1 ELSE 0 END) AS ongoing_courses,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'Numéro', (@row_number := @row_number + 1),
            'Classe', c.fullname,
            'prénom', u.firstname,
            'nom', u.lastname,
            'email', u.email,
            'Statut_cours', CASE 
                WHEN c.startdate > UNIX_TIMESTAMP(NOW()) THEN 'À venir'
                WHEN c.enddate < UNIX_TIMESTAMP(NOW()) THEN 'Terminé'
                ELSE 'En cours'
            END
            )
        ) AS course_details
    FROM mdl_course c
    JOIN mdl_enrol e ON e.courseid = c.id
    JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
    JOIN mdl_user u ON u.id = ue.userid
    CROSS JOIN (SELECT @row_number := 0) AS init
    WHERE c.visible = 1
    ORDER BY c.fullname, u.lastname, u.firstname;
  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    if (results.length === 0) {
      return res.json({
        totalCourses: 0,
        completedCourses: 0,
        ongoingCourses: 0,
        smallCourses: [],
      });
    }
    const {
      total_courses,
      completed_courses,
      ongoing_courses,
      course_details,
    } = results[0];
    res.json({
      totalCourses: total_courses,
      completedCourses: completed_courses,
      ongoingCourses: ongoing_courses,
      smallCourses: course_details,
    });
  });
});

// ===================================
// Récupérer le nombre total de cours pour un utilisateur
// ===================================
router.post("/total-courses", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer le nombre total de cours pour un utilisateur
  const sqlQuery = `
    SELECT 
      COUNT(*) AS total_courses,
      JSON_ARRAYAGG(
          JSON_OBJECT(
              'Classe', c.fullname,
              'Statut_cours', CASE 
                  WHEN c.startdate > UNIX_TIMESTAMP(NOW()) THEN 'À venir'
                  WHEN c.enddate < UNIX_TIMESTAMP(NOW()) THEN 'Terminé'
                  ELSE 'En cours'
              END
          )
      ) AS course_details
    FROM mdl_course c
    JOIN mdl_enrol e ON e.courseid = c.id
    JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
    JOIN mdl_user u ON u.id = ue.userid
    CROSS JOIN (SELECT @row_number := 0) AS init
    WHERE c.visible = 1 AND u.username = ?
    ORDER BY c.fullname, u.lastname, u.firstname;
  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results[0]);
  });
});

// ===================================
// Récupérer les infos principales d'un utilisateur
// ===================================
router.post("/info-users", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer les informations principales d'un utilisateur
  const sqlQuery = `
   SELECT 
    u.id, u.username, u.firstname as first_name, u.lastname as last_name, u.email
    FROM 
        mdl_user u
    WHERE 
        u.deleted = 0 AND u.suspended = 0 and u.username = ?;
  `;
  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    if (results.length === 0) {
      return res.json({
        firstName: "",
        lastName: "",
      });
    }
    const { first_name, last_name } = results[0];
    res.json({
      firstName: first_name,
      lastName: last_name,
    });
  });
});

// ===================================
// Récupérer la progression globale sur toutes les activités
// ===================================
router.post("/all-small-progression", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer la progression globale sur toutes les activités d'un utilisateur
  const sqlQuery = `
    SELECT 
        COUNT(cm.id) AS total_activities,
        ROUND(AVG(CASE WHEN cmc.completionstate = 1 THEN 100 ELSE 0 END), 2) AS overall_completion_percentage,
        COUNT(cm.id) - SUM(CASE WHEN cmc.completionstate = 1 THEN 1 ELSE 0 END) AS uncomplete_activities
    FROM 
        mdl_course c
    JOIN 
        mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
    JOIN 
        mdl_role_assignments ra ON ra.contextid = ctx.id
    JOIN 
        mdl_user u ON u.id = ra.userid
    JOIN 
        mdl_course_modules cm ON cm.course = c.id
    LEFT JOIN 
        mdl_course_modules_completion cmc ON cmc.coursemoduleid = cm.id AND cmc.userid = u.id
    WHERE 
        c.visible = 1 
  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    if (results.length === 0) {
      return res.json({
        totalActivities: 0,
        overallCompletionPercentage: 0,
        uncompleteActivities: 0,
      });
    }
    const {
      total_activities,
      overall_completion_percentage,
      uncomplete_activities,
    } = results[0];
    res.json({
      totalActivities: total_activities,
      overallCompletionPercentage: overall_completion_percentage,
      uncompleteActivities: uncomplete_activities,
    });
  });
});

// ===================================
// Récupérer le nombre total d'activités pour un utilisateur
// ===================================
router.post("/total-activities", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer le nombre total d'activités pour un utilisateur
  const sqlQuery = `
    SELECT 
      c.fullname AS cours,
      COUNT(cm.id) AS nombre_de_cours
    FROM 
      mdl_course c
    JOIN 
      mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
    JOIN 
      mdl_role_assignments ra ON ra.contextid = ctx.id
    JOIN 
      mdl_user u ON u.id = ra.userid
    JOIN 
      mdl_course_modules cm ON cm.course = c.id
    WHERE 
      c.visible = 1 
      AND u.username = ?
    GROUP BY 
      c.id, c.fullname
    ORDER BY 
      c.fullname
  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    const totalActivities = results.reduce(
      (sum, course) => sum + course.total_activities,
      0
    );
    res.json({
      total_activities: totalActivities,
      course_details: results,
    });
  });
});

// ===================================
// Récupérer le nombre total d'activités pour tous les utilisateurs
// ===================================
router.post("/all-activities", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer le nombre total d'activités pour tous les utilisateurs
  const sqlQuery = `
    SELECT 
      c.fullname AS cours,
      COUNT(cm.id) AS nombre_de_cours
    FROM 
      mdl_course c
    JOIN 
      mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
    JOIN 
      mdl_role_assignments ra ON ra.contextid = ctx.id
    JOIN 
      mdl_user u ON u.id = ra.userid
    JOIN 
      mdl_course_modules cm ON cm.course = c.id
    WHERE 
      c.visible = 1 
    GROUP BY 
      c.id, c.fullname
    ORDER BY 
      c.fullname
  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    const totalActivities = results.reduce(
      (sum, course) => sum + course.total_activities,
      0
    );
    res.json({
      total_activities: totalActivities,
      course_details: results,
    });
  });
});

// ===================================
// Récupérer les événements à venir pour un utilisateur
// ===================================
router.post("/user-event", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer les événements à venir pour un utilisateur
  const sqlQuery = `
    SELECT 
    evt.name AS événement,
    REGEXP_REPLACE(evt.description, '<[^>]+>', '') AS description,
    DATE_FORMAT(FROM_UNIXTIME(evt.timestart), '%d %b %Y %H:%i:%s') AS \`début\`,
    CASE 
        WHEN evt.timeduration > 0 
            THEN DATE_FORMAT(FROM_UNIXTIME(evt.timestart + evt.timeduration), '%d %b %Y %H:%i:%s')
        ELSE DATE_FORMAT(FROM_UNIXTIME(evt.timestart), '%d %b %Y %H:%i:%s')
    END AS fin,
    c.fullname AS course,
    CASE 
        WHEN evt.eventtype = 'course' THEN 'Cours'
        WHEN evt.eventtype = 'user' THEN 'Utilisateur'
        WHEN evt.eventtype = 'site' THEN 'Site'
        WHEN evt.eventtype = 'group' THEN 'Groupe'
        ELSE evt.eventtype
    END AS type
FROM 
    mdl_user u
JOIN mdl_user_enrolments ue ON u.id = ue.userid
JOIN mdl_enrol e ON ue.enrolid = e.id
JOIN mdl_course c ON e.courseid = c.id
JOIN mdl_event evt ON evt.courseid = c.id
WHERE 
    evt.timestart >= UNIX_TIMESTAMP(NOW())
    AND u.username = ?
ORDER BY 
    u.lastname, u.firstname, evt.timestart;
  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

// ===================================
// Récupérer tous les événements à venir pour tous les utilisateurs
// ===================================
router.post("/all-user-event", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer tous les événements à venir pour tous les utilisateurs
  const sqlQuery = `
    SELECT 
    evt.name AS événement,
    REGEXP_REPLACE(evt.description, '<[^>]+>', '') AS description,
    DATE_FORMAT(FROM_UNIXTIME(evt.timestart), '%d %b %Y %H:%i:%s') AS \`début\`,
    CASE 
        WHEN evt.timeduration > 0 
            THEN DATE_FORMAT(FROM_UNIXTIME(evt.timestart + evt.timeduration), '%d %b %Y %H:%i:%s')
        ELSE DATE_FORMAT(FROM_UNIXTIME(evt.timestart), '%d %b %Y %H:%i:%s')
    END AS fin,
    c.fullname AS course,
    CASE 
        WHEN evt.eventtype = 'course' THEN 'Cours'
        WHEN evt.eventtype = 'user' THEN 'Utilisateur'
        WHEN evt.eventtype = 'site' THEN 'Site'
        WHEN evt.eventtype = 'group' THEN 'Groupe'
        ELSE evt.eventtype
    END AS type
FROM 
    mdl_user u
JOIN mdl_user_enrolments ue ON u.id = ue.userid
JOIN mdl_enrol e ON ue.enrolid = e.id
JOIN mdl_course c ON e.courseid = c.id
JOIN mdl_event evt ON evt.courseid = c.id
WHERE 
    evt.timestart >= UNIX_TIMESTAMP(NOW())
ORDER BY 
    u.lastname, u.firstname, evt.timestart;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

// ===================================
// Récupérer le nombre d'événements à venir pour un utilisateur
// ===================================
router.post("/upcoming-events-count", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer le nombre d'événements à venir pour un utilisateur
  const sqlQuery = `
    SELECT 
    COUNT(*) AS upcoming_events_count
    FROM 
        mdl_user u
    JOIN 
        mdl_user_enrolments ue ON u.id = ue.userid
    JOIN 
        mdl_enrol e ON ue.enrolid = e.id
    JOIN 
        mdl_course c ON e.courseid = c.id
    JOIN 
        mdl_event evt ON evt.courseid = c.id
    WHERE 
        evt.timestart >= UNIX_TIMESTAMP(NOW())
        AND u.username = ?

  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    if (results.length === 0) {
      return res.json({
        upcomingEventsCount: 0,
      });
    }
    const { upcoming_events_count } = results[0];
    res.json({
      upcomingEventsCount: upcoming_events_count,
    });
  });
});

// ===================================
// Récupérer le nombre d'événements à venir pour tous les utilisateurs
// ===================================
router.post("/all-upcoming-events-count", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer le nombre d'événements à venir pour tous les utilisateurs
  const sqlQuery = `
    SELECT 
    COUNT(*) AS upcoming_events_count
    FROM 
        mdl_user u
    JOIN 
        mdl_user_enrolments ue ON u.id = ue.userid
    JOIN 
        mdl_enrol e ON ue.enrolid = e.id
    JOIN 
        mdl_course c ON e.courseid = c.id
    JOIN 
        mdl_event evt ON evt.courseid = c.id
    WHERE 
        evt.timestart >= UNIX_TIMESTAMP(NOW())

  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    if (results.length === 0) {
      return res.json({
        upcomingEventsCount: 0,
      });
    }
    const { upcoming_events_count } = results[0];
    res.json({
      upcomingEventsCount: upcoming_events_count,
    });
  });
});

// ===================================
// Récupérer tous les badges pour tous les utilisateurs
// ===================================
router.post("/all-badge", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer tous les badges avec nom, description, date, cours associé
  const sqlQuery = `
    SELECT 
    u.id AS id,
    u.firstname as prenom,
    u.lastname as nom,
    b.name AS nom_badge,
    b.description AS description_badge,
    DATE_FORMAT(FROM_UNIXTIME(bi.dateissued), '%d %b %Y %H:%i:%s') AS date_attribution,
    c.fullname AS cours
FROM 
    mdl_badge_issued bi
JOIN 
    mdl_badge b ON bi.badgeid = b.id
JOIN 
    mdl_user u ON bi.userid = u.id
LEFT JOIN 
    mdl_course c ON b.courseid = c.id
WHERE 
    bi.dateissued <= UNIX_TIMESTAMP(NOW())
ORDER BY 
    bi.dateissued DESC
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

// ===================================
// Statistiques de publication de cours pour un enseignant
// ===================================
router.post("/publication", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer les statistiques de publication de cours pour un enseignant
  const sqlQuery = `
     SELECT 
    CONCAT(u.firstname, ' ', u.lastname) AS teacher_name,
    u.username,
    SUM(CASE WHEN c.visible = 1 THEN 1 ELSE 0 END) AS published_courses,
    SUM(CASE WHEN c.visible = 0 THEN 1 ELSE 0 END) AS draft_courses,
    DATE_FORMAT(FROM_UNIXTIME(MAX(c.timemodified)), '%d %b %Y %H:%i:%s')   AS publication_date
    FROM 
        mdl_course c
    JOIN 
        mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
    JOIN 
        mdl_role_assignments ra ON ra.contextid = ctx.id
    JOIN 
        mdl_role r ON r.id = ra.roleid
    JOIN 
        mdl_user u ON u.id = ra.userid
    WHERE 
        r.shortname = 'editingteacher'
        AND u.username = ?
    GROUP BY 
        u.id, u.firstname, u.lastname, u.username;

  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    if (results.length === 0) {
      return res.json({
        publishedCourses: 0,
        draftCourses: 0,
        publication: [],
      });
    }
    const { published_courses, draft_courses } = results[0];
    res.json({
      publishedCourses: published_courses,
      draftCourses: draft_courses,
      publication: [],
    });
  });
});

// ===================================
// Statistiques de publication de cours pour tous les enseignants
// ===================================
router.post("/all-publication", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer les statistiques de publication de cours pour tous les enseignants
  const sqlQuery = `
     SELECT 
    COUNT(CASE WHEN c.visible = 1 THEN 1 ELSE NULL END) AS published_courses,
    COUNT(CASE WHEN c.visible = 0 THEN 1 ELSE NULL END) AS draft_courses
FROM 
    mdl_course c
JOIN 
    mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
JOIN 
    mdl_role_assignments ra ON ra.contextid = ctx.id
JOIN 
    mdl_role r ON r.id = ra.roleid
JOIN 
    mdl_user u ON u.id = ra.userid
WHERE 
    r.shortname = 'editingteacher';

  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    if (results.length === 0) {
      return res.json({
        publishedCourses: 0,
        draftCourses: 0,
        publication: [],
      });
    }
    const { published_courses, draft_courses } = results[0];
    res.json({
      publishedCourses: published_courses,
      draftCourses: draft_courses,
      publication: [],
    });
  });
});

// ===================================
// Liste des cours publiés pour tous les enseignants
// ===================================
router.post("/all-published-courses", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des cours publiés pour tous les enseignants
  const sqlQuery = `
   SELECT 
    CONCAT(u.firstname, ' ', u.lastname) AS nom_utilisateur,
    COUNT(c.id) AS nombre_de_publications
FROM 
    mdl_course c
JOIN mdl_context ctx 
    ON ctx.instanceid = c.id AND ctx.contextlevel = 50
JOIN mdl_role_assignments ra 
    ON ra.contextid = ctx.id
JOIN mdl_role r 
    ON r.id = ra.roleid
JOIN mdl_user u 
    ON u.id = ra.userid
WHERE 
    r.shortname = 'editingteacher'
    AND c.visible = 1
GROUP BY 
    u.id, u.firstname, u.lastname, u.username
ORDER BY 
    nombre_de_publications DESC, u.lastname ASC, u.firstname ASC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Liste des brouillons de cours pour tous les enseignants
// ===================================
router.post("/all-drafted-courses", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer la liste des brouillons de cours pour tous les enseignants
  const sqlQuery = `
    SELECT 
    CONCAT(u.firstname, ' ', u.lastname) AS nom_utilisateur,
    COUNT(c.id) AS nombre_de_brouillons
FROM 
    mdl_course c
JOIN 
    mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
JOIN 
    mdl_role_assignments ra ON ra.contextid = ctx.id
JOIN 
    mdl_role r ON r.id = ra.roleid
JOIN 
    mdl_user u ON u.id = ra.userid
WHERE 
    r.shortname = 'editingteacher'
    AND c.visible = 0
GROUP BY 
    u.id, u.firstname, u.lastname, u.username
ORDER BY 
    nombre_de_brouillons DESC, u.lastname ASC, u.firstname ASC;

  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Liste des soumissions pour un enseignant
// ===================================
router.post("/submition", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer la liste des soumissions pour un enseignant
  const sqlQuery = `
   SELECT 
    COUNT(c.id) OVER () as row_num,
    CONCAT(u.firstname, ' ', u.lastname) AS student_name,
    u.username AS student_username,
    c.id AS course_id,
    c.fullname AS course_name,
    CONCAT(teacher.firstname, ' ', teacher.lastname) AS teacher_name,
    teacher.username AS teacher_username,
    m.name AS module_type,
    a.name AS activity,
    DATE_FORMAT(FROM_UNIXTIME(s.timemodified), '%d %b %Y %H:%i:%s')  AS sub_date
FROM 
    mdl_course_modules cm
JOIN 
    mdl_modules m ON cm.module = m.id
JOIN 
    mdl_course c ON cm.course = c.id
JOIN 
    mdl_assign a ON cm.instance = a.id AND m.name = 'assign'
LEFT JOIN 
    mdl_assign_submission s ON a.id = s.assignment
LEFT JOIN 
    mdl_user u ON s.userid = u.id
JOIN 
    mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
JOIN 
    mdl_role_assignments ra ON ra.contextid = ctx.id
JOIN 
    mdl_role r ON (r.id = ra.roleid AND (r.shortname = 'editingteacher' OR r.shortname = 'teacher'))
JOIN 
    mdl_user teacher ON ra.userid = teacher.id
WHERE
    s.status = 'submitted' AND teacher.username = ?
ORDER BY 
    teacher.lastname ASC, c.fullname ASC, s.timemodified DESC;


  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    if (results.length === 0) {
      return res.json({
        rowNum: 0,
        submition: [],
      });
    }
    const { row_num } = results[0];
    res.json({
      rowNum: row_num,
      submition: [],
    });
  });
});

// ===================================
// Liste des soumissions pour tous les enseignants
// ===================================
router.post("/all-submition", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer la liste des soumissions pour tous les enseignants
  const sqlQuery = `
   SELECT 
    COUNT(c.id) OVER () as row_num,
    CONCAT(u.firstname, ' ', u.lastname) AS student_name,
    u.username AS student_username,
    c.id AS course_id,
    c.fullname AS course_name,
    CONCAT(teacher.firstname, ' ', teacher.lastname) AS teacher_name,
    teacher.username AS teacher_username,
    m.name AS module_type,
    a.name AS activity,
    DATE_FORMAT(FROM_UNIXTIME(s.timemodified), '%d %b %Y %H:%i:%s')  AS sub_date
FROM 
    mdl_course_modules cm
JOIN 
    mdl_modules m ON cm.module = m.id
JOIN 
    mdl_course c ON cm.course = c.id
JOIN 
    mdl_assign a ON cm.instance = a.id AND m.name = 'assign'
LEFT JOIN 
    mdl_assign_submission s ON a.id = s.assignment
LEFT JOIN 
    mdl_user u ON s.userid = u.id
JOIN 
    mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
JOIN 
    mdl_role_assignments ra ON ra.contextid = ctx.id
JOIN 
    mdl_role r ON (r.id = ra.roleid AND (r.shortname = 'editingteacher' OR r.shortname = 'teacher'))
JOIN 
    mdl_user teacher ON ra.userid = teacher.id
WHERE
    s.status = 'submitted' 
ORDER BY 
    teacher.lastname ASC, c.fullname ASC, s.timemodified DESC;


  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    if (results.length === 0) {
      return res.json({
        rowNum: 0,
        submition: [],
      });
    }
    const { row_num } = results[0];
    res.json({
      rowNum: row_num,
      submition: [],
    });
  });
});

// ===================================
// Liste des soumissions d'un élève pour un enseignant
// ===================================
router.post("/student-submition", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer la liste des soumissions d'un élève pour un enseignant
  const sqlQuery = `
   SELECT 
    CONCAT(u.firstname, ' ', u.lastname) AS élève,
    c.fullname AS cours,
    a.name AS activité,
    DATE_FORMAT(FROM_UNIXTIME(s.timemodified), '%d %b %Y %H:%i:%s')   AS \`date de rendu\`
FROM 
    mdl_course_modules cm
JOIN 
    mdl_modules m ON cm.module = m.id
JOIN 
    mdl_course c ON cm.course = c.id
JOIN 
    mdl_assign a ON cm.instance = a.id AND m.name = 'assign'
LEFT JOIN 
    mdl_assign_submission s ON a.id = s.assignment
LEFT JOIN 
    mdl_user u ON s.userid = u.id
JOIN 
    mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
JOIN 
    mdl_role_assignments ra ON ra.contextid = ctx.id
JOIN 
    mdl_role r ON (r.id = ra.roleid AND (r.shortname = 'editingteacher' OR r.shortname = 'teacher'))
JOIN 
    mdl_user teacher ON ra.userid = teacher.id
WHERE
    s.status = 'submitted' AND teacher.username = ?
ORDER BY 
    teacher.lastname ASC, c.fullname ASC, s.timemodified DESC;


  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Liste des soumissions de tous les élèves pour tous les enseignants
// ===================================
router.post("/all-student-submition", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer la liste des soumissions de tous les élèves pour tous les enseignants
  const sqlQuery = `
   SELECT 
    CONCAT(u.firstname, ' ', u.lastname) AS élève,
    c.fullname AS cours,
    a.name AS activité,
    DATE_FORMAT(FROM_UNIXTIME(s.timemodified), '%d %b %Y %H:%i:%s')   AS date_rendu
FROM 
    mdl_course_modules cm
JOIN 
    mdl_modules m ON cm.module = m.id
JOIN 
    mdl_course c ON cm.course = c.id
JOIN 
    mdl_assign a ON cm.instance = a.id AND m.name = 'assign'
LEFT JOIN 
    mdl_assign_submission s ON a.id = s.assignment
LEFT JOIN 
    mdl_user u ON s.userid = u.id
JOIN 
    mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
JOIN 
    mdl_role_assignments ra ON ra.contextid = ctx.id
JOIN 
    mdl_role r ON (r.id = ra.roleid AND (r.shortname = 'editingteacher' OR r.shortname = 'teacher'))
JOIN 
    mdl_user teacher ON ra.userid = teacher.id
WHERE
    s.status = 'submitted' 
ORDER BY 
    teacher.lastname ASC, c.fullname ASC, s.timemodified DESC;


  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

// ===================================
// Récupérer les ressources d'un étudiant (fichiers, cours, département)
// ===================================
router.post("/student-ressources", (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer les ressources d'un étudiant (fichiers, cours, département)
  const sqlQuery = `
   SELECT
     d.Liste AS departement,
  c.shortname AS code_cours,
  c.fullname AS nom_cours,
  f.filename AS nom_fichier,
  CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
  ) AS url_fichier,
  DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS dernier_acces
FROM
  mdl_user u
JOIN mdl_user_enrolments ue ON ue.userid = u.id
JOIN mdl_enrol e ON e.id = ue.enrolid
JOIN mdl_course c ON c.id = e.courseid
JOIN mdl_context ctx ON ctx.instanceid = c.id AND ctx.contextlevel = 50
LEFT JOIN mdl_files f ON f.contextid = ctx.id
LEFT JOIN mdl_departement d ON d.user_code = u.idnumber AND d.Liste LIKE 'departement_%'
WHERE
  u.username = ? 
  AND u.auth = 'cas'
  AND u.deleted = 0
  AND u.idnumber IS NOT NULL
  AND f.filename IS NOT NULL
  AND f.filename != ''
  AND f.filename != '.'
ORDER BY
  departement, nom_cours, nom_fichier;
  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

export default router;
