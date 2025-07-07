import express from "express";
const router = express.Router();
import { getDB } from "../db.js";

// ===================================
// Statistiques de publications par département
// ===================================
router.post("/departement", (req, res) => {
  const db = getDB();
  // Requête SQL pour compter le nombre de publications pour chaque département
  const sqlQuery = `
    SELECT 
      SUM(CASE WHEN d.Liste = 'departement_maths' THEN 1 ELSE 0 END) AS maths_publications,
      SUM(CASE WHEN d.Liste = 'departement_lettres' THEN 1 ELSE 0 END) AS lettres_publications,
      SUM(CASE WHEN d.Liste = 'departement_anglais' THEN 1 ELSE 0 END) AS anglais_publications,
      SUM(CASE WHEN d.Liste = 'departement_shsphilo' THEN 1 ELSE 0 END) AS shsphilo_publications,
      SUM(CASE WHEN d.Liste = 'departement_documentation' THEN 1 ELSE 0 END) AS documentation_publications,
      SUM(CASE WHEN d.Liste = 'departement_histgeo' THEN 1 ELSE 0 END) AS histgeo_publications,
      SUM(CASE WHEN d.Liste = 'departement_eps' THEN 1 ELSE 0 END) AS eps_publications,
      SUM(CASE WHEN d.Liste = 'departement_svt' THEN 1 ELSE 0 END) AS svt_publications,
      SUM(CASE WHEN d.Liste = 'departement_espagnol' THEN 1 ELSE 0 END) AS espagnol_publications,
      SUM(CASE WHEN d.Liste = 'departement_musique' THEN 1 ELSE 0 END) AS musique_publications,
      SUM(CASE WHEN d.Liste = 'departement_allemand' THEN 1 ELSE 0 END) AS allemand_publications,
      SUM(CASE WHEN d.Liste = 'departement_artsplastiques' THEN 1 ELSE 0 END) AS artsplastiques_publications,
      SUM(CASE WHEN d.Liste = 'departement_spc' THEN 1 ELSE 0 END) AS spc_publications,
      SUM(CASE WHEN d.Liste = 'departement_techno' THEN 1 ELSE 0 END) AS techno_publications,
      SUM(CASE WHEN d.Liste = 'departement_arch' THEN 1 ELSE 0 END) AS arch_publications,
      SUM(CASE WHEN d.Liste = 'departement_ash' THEN 1 ELSE 0 END) AS ash_publications,
      SUM(CASE WHEN d.Liste = 'departement_italien' THEN 1 ELSE 0 END) AS italien_publications,
      SUM(CASE WHEN d.Liste = 'departement_ecogestion' THEN 1 ELSE 0 END) AS ecogestion_publications
    FROM 
      mdl_departement d
    JOIN mdl_user u ON u.idnumber = d.user_code
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_context ctx ON ctx.id = ra.contextid
    JOIN mdl_course c ON c.id = ctx.instanceid
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE 
      u.auth = 'cas' 
      AND u.deleted = 0
      AND u.idnumber IS NOT NULL
      AND r.shortname = 'editingteacher'
  `;
  db.query(sqlQuery, (err, results) => {
    // Gestion des erreurs : log côté serveur et réponse générique pour la sécurité
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    // Si aucun résultat, retourne des valeurs par défaut pour chaque département
    if (results.length === 0) {
      return res.json({
        mathsPublications: 0,
        lettresPublications: 0,
        anglaisPublications: 0,
        shsphiloPublications: 0,
        documentationPublications: 0,
        histgeoPublications: 0,
        epsPublications: 0,
        svtPublications: 0,
        espagnolPublications: 0,
        musiquePublications: 0,
        allemandPublications: 0,
        artsPlastiquesPublications: 0,
        spcPublications: 0,
        technoPublications: 0,
        archPublications: 0,
        ashPublications: 0,
        italienPublications: 0,
        ecogestionPublications: 0,
      });
    }
    // Extraction et structuration des données pour le front
    const {
      maths_publications,
      lettres_publications,
      anglais_publications,
      shsphilo_publications,
      documentation_publications,
      histgeo_publications,
      eps_publications,
      svt_publications,
      espagnol_publications,
      musique_publications,
      allemand_publications,
      artsplastiques_publications,
      spc_publications,
      techno_publications,
      arch_publications,
      ash_publications,
      italien_publications,
      ecogestion_publications,
    } = results[0];
    res.json({
      mathsPublications: maths_publications,
      lettresPublications: lettres_publications,
      anglaisPublications: anglais_publications,
      shsphiloPublications: shsphilo_publications,
      documentationPublications: documentation_publications,
      histgeoPublications: histgeo_publications,
      epsPublications: eps_publications,
      svtPublications: svt_publications,
      espagnolPublications: espagnol_publications,
      musiquePublications: musique_publications,
      allemandPublications: allemand_publications,
      artsPlastiquesPublications: artsplastiques_publications,
      spcPublications: spc_publications,
      technoPublications: techno_publications,
      archPublications: arch_publications,
      ashPublications: ash_publications,
      italienPublications: italien_publications,
      ecogestionPublications: ecogestion_publications,
    });
  });
});

// ===================================
// Liste des fichiers publiés pour le département Maths
// ===================================
router.post("/departement-maths", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département Maths
  const sqlQuery = `
    SELECT 
      c.shortname AS Code,
      c.fullname AS Cours,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
    FROM 
      mdl_departement d
    JOIN mdl_user u ON u.idnumber = d.user_code
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_context ctx ON ctx.id = ra.contextid
    JOIN mdl_course c ON c.id = ctx.instanceid
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE 
      u.auth = 'cas' 
      AND u.deleted = 0
      AND u.idnumber IS NOT NULL
      AND r.shortname = 'editingteacher'
      AND d.Liste = 'departement_maths'
    ORDER BY u.email DESC;
  `;
  db.query(sqlQuery, (err, results) => {
    // Gestion des erreurs : log côté serveur et réponse générique pour la sécurité
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    // Retourne la liste des fichiers publiés pour le département Maths
    res.json(results);
  });
});

// ===================================
// Liste des fichiers publiés pour le département Lettres
// ===================================
router.post("/departement-lettres", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département Lettres
  const sqlQuery = `
    SELECT 
      u.email AS Email,
      c.shortname AS Code,
      c.fullname AS Description,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
    FROM 
      mdl_departement d
    JOIN mdl_user u ON u.idnumber = d.user_code
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_context ctx ON ctx.id = ra.contextid
    JOIN mdl_course c ON c.id = ctx.instanceid
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE 
      u.auth = 'cas' 
      AND u.deleted = 0
      AND u.idnumber IS NOT NULL
      AND r.shortname = 'editingteacher'
      AND d.Liste = 'departement_lettres'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département Anglais
// ===================================
router.post("/departement-anglais", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département Anglais
  const sqlQuery = `
    SELECT 
      u.email AS Email,
      c.shortname AS Code,
      c.fullname AS Description,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
    FROM 
      mdl_departement d
    JOIN mdl_user u ON u.idnumber = d.user_code
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_context ctx ON ctx.id = ra.contextid
    JOIN mdl_course c ON c.id = ctx.instanceid
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE 
      u.auth = 'cas' 
      AND u.deleted = 0
      AND u.idnumber IS NOT NULL
      AND r.shortname = 'editingteacher'
      AND d.Liste = 'departement_anglais'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département SHSPhilo
// ===================================
router.post("/departement-shsphilo", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département SHSPhilo
  const sqlQuery = `
    SELECT 
      u.email AS Email,
      c.shortname AS Code,
      c.fullname AS Description,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
    FROM 
      mdl_departement d
    JOIN mdl_user u ON u.idnumber = d.user_code
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_context ctx ON ctx.id = ra.contextid
    JOIN mdl_course c ON c.id = ctx.instanceid
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE 
      u.auth = 'cas' 
      AND u.deleted = 0
      AND u.idnumber IS NOT NULL
      AND r.shortname = 'editingteacher'
      AND d.Liste = 'departement_shsphilo'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département Documentation
// ===================================
router.post("/departement-documentation", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département Documentation
  const sqlQuery = `
    SELECT 
      u.email AS Email,
      c.shortname AS Code,
      c.fullname AS Description,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
    FROM 
      mdl_departement d
    JOIN mdl_user u ON u.idnumber = d.user_code
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_context ctx ON ctx.id = ra.contextid
    JOIN mdl_course c ON c.id = ctx.instanceid
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE 
      u.auth = 'cas' 
      AND u.deleted = 0
      AND u.idnumber IS NOT NULL
      AND r.shortname = 'editingteacher'
      AND d.Liste = 'departement_documentation'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département HistGéo
// ===================================
router.post("/departement-histgeo", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département HistGéo
  const sqlQuery = `
    SELECT 
      u.email AS Email,
      c.shortname AS Code,
      c.fullname AS Description,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
    FROM 
      mdl_departement d
    JOIN mdl_user u ON u.idnumber = d.user_code
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_context ctx ON ctx.id = ra.contextid
    JOIN mdl_course c ON c.id = ctx.instanceid
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE 
      u.auth = 'cas' 
      AND u.deleted = 0
      AND u.idnumber IS NOT NULL
      AND r.shortname = 'editingteacher'
      AND d.Liste = 'departement_histgeo'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département EPS
// ===================================
router.post("/departement-eps", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département EPS
  const sqlQuery = `
  SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
FROM 
    mdl_departement d
JOIN 
    mdl_user u ON u.idnumber = d.user_code
JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
JOIN 
    mdl_context ctx ON ctx.id = ra.contextid
JOIN 
    mdl_course c ON c.id = ctx.instanceid
JOIN 
    mdl_role r ON r.id = ra.roleid
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_eps'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département SVT
// ===================================
router.post("/departement-svt", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département SVT
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
FROM 
    mdl_departement d
JOIN 
    mdl_user u ON u.idnumber = d.user_code
JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
JOIN 
    mdl_context ctx ON ctx.id = ra.contextid
JOIN 
    mdl_course c ON c.id = ctx.instanceid
JOIN 
    mdl_role r ON r.id = ra.roleid
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_svt'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département Espagnol
// ===================================
router.post("/departement-espagnol", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département Espagnol
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
FROM 
    mdl_departement d
JOIN 
    mdl_user u ON u.idnumber = d.user_code
JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
JOIN 
    mdl_context ctx ON ctx.id = ra.contextid
JOIN 
    mdl_course c ON c.id = ctx.instanceid
JOIN 
    mdl_role r ON r.id = ra.roleid
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_espagnol'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département Musique
// ===================================
router.post("/departement-musique", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département Musique
  const sqlQuery = `
   SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
FROM 
    mdl_departement d
JOIN 
    mdl_user u ON u.idnumber = d.user_code
JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
JOIN 
    mdl_context ctx ON ctx.id = ra.contextid
JOIN 
    mdl_course c ON c.id = ctx.instanceid
JOIN 
    mdl_role r ON r.id = ra.roleid
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_musique'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département Allemand
// ===================================
router.post("/departement-allemand", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département Allemand
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
FROM 
    mdl_departement d
JOIN 
    mdl_user u ON u.idnumber = d.user_code
JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
JOIN 
    mdl_context ctx ON ctx.id = ra.contextid
JOIN 
    mdl_course c ON c.id = ctx.instanceid
JOIN 
    mdl_role r ON r.id = ra.roleid
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_allemand'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département Arts Plastiques
// ===================================
router.post("/departement-artsplastiques", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département Arts Plastiques
  const sqlQuery = `
   SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
FROM 
    mdl_departement d
JOIN 
    mdl_user u ON u.idnumber = d.user_code
JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
JOIN 
    mdl_context ctx ON ctx.id = ra.contextid
JOIN 
    mdl_course c ON c.id = ctx.instanceid
JOIN 
    mdl_role r ON r.id = ra.roleid
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_artsplastiques'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département SPC
// ===================================
router.post("/departement-spc", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département SPC
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
FROM 
    mdl_departement d
JOIN 
    mdl_user u ON u.idnumber = d.user_code
JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
JOIN 
    mdl_context ctx ON ctx.id = ra.contextid
JOIN 
    mdl_course c ON c.id = ctx.instanceid
JOIN 
    mdl_role r ON r.id = ra.roleid
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_spc'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département Techno
// ===================================
router.post("/departement-techno", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département Techno
  const sqlQuery = `
   SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
FROM 
    mdl_departement d
JOIN 
    mdl_user u ON u.idnumber = d.user_code
JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
JOIN 
    mdl_context ctx ON ctx.id = ra.contextid
JOIN 
    mdl_course c ON c.id = ctx.instanceid
JOIN 
    mdl_role r ON r.id = ra.roleid
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_techno'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département Arch
// ===================================
router.post("/departement-arch", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département Arch
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
FROM 
    mdl_departement d
JOIN 
    mdl_user u ON u.idnumber = d.user_code
JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
JOIN 
    mdl_context ctx ON ctx.id = ra.contextid
JOIN 
    mdl_course c ON c.id = ctx.instanceid
JOIN 
    mdl_role r ON r.id = ra.roleid
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_arch'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département Ash
// ===================================
router.post("/departement-ash", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département Ash
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
FROM 
    mdl_departement d
JOIN 
    mdl_user u ON u.idnumber = d.user_code
JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
JOIN 
    mdl_context ctx ON ctx.id = ra.contextid
JOIN 
    mdl_course c ON c.id = ctx.instanceid
    JOIN 
    mdl_role r ON r.id = ra.roleid
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_ash'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département Italien
// ===================================
router.post("/departement-italien", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département Italien
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
FROM 
    mdl_departement d
JOIN 
    mdl_user u ON u.idnumber = d.user_code
JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
JOIN 
    mdl_context ctx ON ctx.id = ra.contextid
JOIN 
    mdl_course c ON c.id = ctx.instanceid
JOIN 
    mdl_role r ON r.id = ra.roleid
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_italien'
    ORDER BY u.email DESC;
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
// Liste des fichiers publiés pour le département Écogestion
// ===================================
router.post("/departement-ecogestion", (req, res) => {
  const db = getDB();
  // Requête SQL pour récupérer la liste des fichiers publiés dans le département Écogestion
  const sqlQuery = `
   SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date
FROM 
    mdl_departement d
JOIN 
    mdl_user u ON u.idnumber = d.user_code
JOIN 
    mdl_role_assignments ra ON ra.userid = u.id
JOIN 
    mdl_context ctx ON ctx.id = ra.contextid
JOIN 
    mdl_course c ON c.id = ctx.instanceid
JOIN 
    mdl_role r ON r.id = ra.roleid
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_ecogestion'
    ORDER BY u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

export default router;
