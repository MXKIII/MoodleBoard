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
    LEFT JOIN mdl_files f ON f.contextid = ctx.id
    WHERE 
      u.auth = 'cas' 
      AND u.deleted = 0
      AND u.idnumber IS NOT NULL
      AND r.shortname = 'editingteacher'
      AND f.filename IS NOT NULL
      AND f.filename != ''
      AND f.filename != '.'
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
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
      f.filename AS nom_fichier,
      CONCAT(
        'http://10.107.3.93/pluginfile.php/',
        f.contextid, '/',
        f.component, '/',
        f.filearea, '/',
        f.itemid, '/',
        f.filename
      ) AS url_fichier
    FROM 
      mdl_departement d
    JOIN mdl_user u ON u.idnumber = d.user_code
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_context ctx ON ctx.id = ra.contextid
    JOIN mdl_course c ON c.id = ctx.instanceid
    JOIN mdl_role r ON r.id = ra.roleid
    LEFT JOIN mdl_files f ON f.contextid = ctx.id
    WHERE 
      u.auth = 'cas' 
      AND u.deleted = 0
      AND u.idnumber IS NOT NULL
      AND r.shortname = 'editingteacher'
      AND d.Liste = 'departement_maths'
      AND f.filename IS NOT NULL
      AND f.filename != ''
      AND f.filename != '.'
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
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
      f.filename AS nom_fichier,
      CONCAT(
        'http://10.107.3.93/pluginfile.php/',
        f.contextid, '/',
        f.component, '/',
        f.filearea, '/',
        f.itemid, '/',
        f.filename
      ) AS url_fichier
    FROM 
      mdl_departement d
    JOIN mdl_user u ON u.idnumber = d.user_code
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_context ctx ON ctx.id = ra.contextid
    JOIN mdl_course c ON c.id = ctx.instanceid
    JOIN mdl_role r ON r.id = ra.roleid
    LEFT JOIN mdl_files f ON f.contextid = ctx.id
    WHERE 
      u.auth = 'cas' 
      AND u.deleted = 0
      AND u.idnumber IS NOT NULL
      AND r.shortname = 'editingteacher'
      AND d.Liste = 'departement_lettres'
      AND f.filename IS NOT NULL
      AND f.filename != ''
      AND f.filename != '.'
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
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
      f.filename AS nom_fichier,
      CONCAT(
        'http://10.107.3.93/pluginfile.php/',
        f.contextid, '/',
        f.component, '/',
        f.filearea, '/',
        f.itemid, '/',
        f.filename
      ) AS url_fichier
    FROM 
      mdl_departement d
    JOIN mdl_user u ON u.idnumber = d.user_code
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_context ctx ON ctx.id = ra.contextid
    JOIN mdl_course c ON c.id = ctx.instanceid
    JOIN mdl_role r ON r.id = ra.roleid
    LEFT JOIN mdl_files f ON f.contextid = ctx.id
    WHERE 
      u.auth = 'cas' 
      AND u.deleted = 0
      AND u.idnumber IS NOT NULL
      AND r.shortname = 'editingteacher'
      AND d.Liste = 'departement_anglais'
      AND f.filename IS NOT NULL
      AND f.filename != ''
      AND f.filename != '.'
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
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
      f.filename AS nom_fichier,
      CONCAT(
        'http://10.107.3.93/pluginfile.php/',
        f.contextid, '/',
        f.component, '/',
        f.filearea, '/',
        f.itemid, '/',
        f.filename
      ) AS url_fichier
    FROM 
      mdl_departement d
    JOIN mdl_user u ON u.idnumber = d.user_code
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_context ctx ON ctx.id = ra.contextid
    JOIN mdl_course c ON c.id = ctx.instanceid
    JOIN mdl_role r ON r.id = ra.roleid
    LEFT JOIN mdl_files f ON f.contextid = ctx.id
    WHERE 
      u.auth = 'cas' 
      AND u.deleted = 0
      AND u.idnumber IS NOT NULL
      AND r.shortname = 'editingteacher'
      AND d.Liste = 'departement_shsphilo'
      AND f.filename IS NOT NULL
      AND f.filename != ''
      AND f.filename != '.'
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
// Répète ce format pour chaque département suivant :
// documentation, histgeo, eps, svt, espagnol, musique, allemand, artsplastiques, spc, techno, arch, ash, italien, ecogestion
// ===================================
// Pour chaque route, adapte le commentaire de la requête SQL et la description du résultat retourné.

router.post("/departement-documentation", (req, res) => {
  const db = getDB();
  const sqlQuery = `
   SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_documentation'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

router.post("/departement-histgeo", (req, res) => {
  const db = getDB();
  const sqlQuery = `
   SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_histgeo'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

router.post("/departement-eps", (req, res) => {
  const db = getDB();
  const sqlQuery = `
  SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_eps'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

router.post("/departement-svt", (req, res) => {
  const db = getDB();
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_svt'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

router.post("/departement-espagnol", (req, res) => {
  const db = getDB();
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_espagnol'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

router.post("/departement-musique", (req, res) => {
  const db = getDB();
  const sqlQuery = `
   SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_musique'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

router.post("/departement-allemand", (req, res) => {
  const db = getDB();
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_allemand'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

router.post("/departement-artsplastiques", (req, res) => {
  const db = getDB();
  const sqlQuery = `
   SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_artsplastiques'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

router.post("/departement-spc", (req, res) => {
  const db = getDB();
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_spc'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

router.post("/departement-techno", (req, res) => {
  const db = getDB();
  const sqlQuery = `
   SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_techno'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

router.post("/departement-arch", (req, res) => {
  const db = getDB();
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_arch'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

router.post("/departement-ash", (req, res) => {
  const db = getDB();
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_ash'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

router.post("/departement-italien", (req, res) => {
  const db = getDB();
  const sqlQuery = `
    SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_italien'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
  `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
});

router.post("/departement-ecogestion", (req, res) => {
  const db = getDB();
  const sqlQuery = `
   SELECT 
    u.email AS Email,
    c.shortname AS Code,
    c.fullname AS Description,
    DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS Date,
    f.filename AS nom_fichier,
     CONCAT(
    'http://10.107.3.93/pluginfile.php/',
    f.contextid, '/',
    f.component, '/',
    f.filearea, '/',
    f.itemid, '/',
    f.filename
) AS url_fichier
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
LEFT JOIN 
    mdl_files f ON f.contextid = ctx.id
WHERE 
    u.auth = 'cas' 
    AND u.deleted = 0
    AND u.idnumber IS NOT NULL
    AND r.shortname = 'editingteacher'
    AND d.Liste = 'departement_ecogestion'
    AND f.filename IS NOT NULL
    AND f.filename != ''
    AND f.filename != '.'ORDER BY 
    u.email DESC;
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
