import { getDB } from "../database/db.js";

//Requête étudiant

// ===================================
// Récupérer les cours suivis par un étudiant
// ===================================
export const student_courses = (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour compter les cours terminés, en cours, à venir, et retourner les détails pour chaque cours de l'étudiant
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
};

// ===================================
// Récupérer la progression de l'étudiant sur ses activités
// ===================================
// Entrée : userId (dans req.body)
// Sortie : total d'activités, pourcentage de complétion, nombre d'activités non complétées
export const student_progression = (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour compter le nombre total d'activités, calculer le pourcentage de complétion global,
  // et déterminer le nombre d'activités non complétées pour l'étudiant
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
};

// ===================================
// Récupérer les badges obtenus par un étudiant
// ===================================
// Entrée : userId (dans req.body)
// Sortie : liste des badges avec nom, description, date, cours associé

export const student_badges = (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer la liste des badges obtenus par un étudiant avec nom, description, date, cours associé
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
};

// ===================================
// Récupérer le nombre d'activités par cours pour un étudiant
// ===================================
// Entrée : userId (dans req.body)
// Sortie : liste des cours avec nombre d'activités
export const student_activities = (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  // Requête SQL pour récupérer le nombre d'activités par cours pour un étudiant
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
    res.json({
      course_list: results,
    });
  });
};

// ===================================
// RÉCUPÉRER LES ÉVÉNEMENTS À VENIR POUR UN UTILISATEUR (DÉTAILS + COMPTEUR)
// ===================================
// Entrée : userId (dans req.body)
// Sortie : Liste des événements + nombre total d'événements
export const student_event = (req, res) => {
  const db = getDB();
  const { userId } = req.body;

  // Requête SQL pour récupérer les événements à venir ET le nombre total
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
      END AS type,
      (
        SELECT COUNT(*) 
        FROM mdl_user u2
        JOIN mdl_user_enrolments ue2 ON u2.id = ue2.userid
        JOIN mdl_enrol e2 ON ue2.enrolid = e2.id
        JOIN mdl_course c2 ON e2.courseid = c2.id
        JOIN mdl_event evt2 ON evt2.courseid = c2.id
        WHERE evt2.timestart >= UNIX_TIMESTAMP(NOW())
        AND u2.username = ?
      ) AS total_upcoming_events
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
      u.lastname, u.firstname, evt.timestart`;

  db.query(sqlQuery, [userId, userId], (err, results) => {
    // Gestion des erreurs : log côté serveur et réponse générique pour la sécurité
    if (err) {
      console.error("Erreur lors de la récupération des événements:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }

    // Si aucun événement trouvé, retourner des valeurs par défaut
    if (results.length === 0) {
      return res.json({
        upcomingEventsCount: 0,
        events: [],
        message: "Aucun événement à venir trouvé",
      });
    }

    // Extraction du nombre total (identique pour tous les résultats)
    const upcomingEventsCount = results[0].total_upcoming_events;

    // Nettoyage des données d'événements (suppression du champ compteur)
    const events = results.map((event) => ({
      événement: event.événement,
      description: event.description,
      début: event.début,
      fin: event.fin,
      course: event.course,
      type: event.type,
    }));

    res.json({
      upcomingEventsCount: upcomingEventsCount,
      events: events,
    });
  });
};

//enseignants

// ===================================
// Récupérer les cours publiés par un enseignant
// ===================================
// Entrée : userId (dans req.body)
// Sortie : liste des cours publiés avec nom, code, enseignant, date de publication
export const teacher_published_courses = (req, res) => {
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
};

// ===================================
// Récupérer les brouillons de cours d'un enseignant
// ===================================
// Entrée : userId (dans req.body)
// Sortie : liste des brouillons de cours
export const teacher_drafted_courses = (req, res) => {
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
};

// ===================================
// Statistiques de publication de cours pour un enseignant
// ===================================
export const teacher_publications = (req, res) => {
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
};

// ===================================
// Liste des soumissions pour un enseignant
// ===================================
export const student_submitions = (req, res) => {
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
      submition: results,
    });
  });
};

// ===================================
// Récupérer le nombre d'activités par cours pour un utilisateur
// ===================================
// Entrée : userId (dans req.body)
// Sortie : liste des cours avec nombre d'activités
export const teacher_activities = (req, res) => {
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
    res.json({
      course_details: results,
    });
  });
};

//admin

// ===================================
// Statistiques globales d'activité utilisateur (tous rôles)
// ===================================
// Entrée : startDate, endDate (dans req.body)
// Sortie : statistiques globales (nombre total, actifs, inactifs, par rôle, etc.)
export const user_activity = (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;

  const sqlQuery = `
    SELECT 
      COUNT(DISTINCT u.id) AS total_users,
      COUNT(DISTINCT CASE WHEN u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?) THEN u.id END) AS active_users,
      COUNT(DISTINCT CASE WHEN u.lastaccess < UNIX_TIMESTAMP(?) OR u.lastaccess IS NULL THEN u.id END) AS inactive_users,
      COUNT(DISTINCT CASE WHEN r.shortname = 'student' THEN u.id END) AS student_count,
      COUNT(DISTINCT CASE WHEN r.shortname = 'student' AND u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?) THEN u.id END) AS active_student_count,
      ROUND(100.0 * COUNT(DISTINCT CASE WHEN r.shortname = 'student' THEN u.id END) / NULLIF(COUNT(DISTINCT u.id), 0), 2) AS student_percentage,
      COUNT(DISTINCT CASE WHEN r.shortname IN ('teacher', 'editingteacher') THEN u.id END) AS teacher_count,
COUNT(DISTINCT CASE WHEN r.shortname IN ('teacher', 'editingteacher') AND u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?) THEN u.id END) AS active_teacher_count,
ROUND(100.0 * COUNT(DISTINCT CASE WHEN r.shortname IN ('teacher', 'editingteacher') THEN u.id END) / NULLIF(COUNT(DISTINCT u.id), 0), 2) AS teacher_percentage,
      COUNT(DISTINCT CASE WHEN r.shortname = 'manager' THEN u.id END) AS admin_count,
      COUNT(DISTINCT CASE WHEN r.shortname = 'manager' AND u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?) THEN u.id END) AS active_admin_count,
      ROUND(100.0 * COUNT(DISTINCT CASE WHEN r.shortname = 'manager' THEN u.id END) / NULLIF(COUNT(DISTINCT u.id), 0), 2) AS admin_percentage,
      COUNT(DISTINCT CASE WHEN r.shortname NOT IN ('student', 'teacher', 'editingteacher', 'manager') OR r.shortname IS NULL THEN u.id END) AS other_count,
      COUNT(DISTINCT CASE WHEN (r.shortname NOT IN ('student', 'teacher', 'editingteacher', 'manager') OR r.shortname IS NULL) AND u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?) THEN u.id END) AS active_other_count,
      ROUND(100.0 * COUNT(DISTINCT CASE WHEN r.shortname NOT IN ('student', 'teacher', 'editingteacher', 'manager') OR r.shortname IS NULL THEN u.id END) / NULLIF(COUNT(DISTINCT u.id), 0), 2) AS other_percentage
    FROM mdl_user u
    LEFT JOIN mdl_role_assignments ra ON ra.userid = u.id
    LEFT JOIN mdl_role r ON r.id = ra.roleid
    WHERE u.deleted = 0 AND u.suspended = 0
  `;

  const params = [
    startDate,
    endDate, // active_users
    startDate, // inactive_users
    startDate,
    endDate, // active_student_count
    startDate,
    endDate, // active_teacher_count
    startDate,
    endDate, // active_admin_count
    startDate,
    endDate, // active_other_count
  ];

  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    if (!results || results.length === 0) {
      // Valeurs par défaut si aucun résultat
      return res.json({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        studentCount: 0,
        activeStudentCount: 0,
        studentPercentage: 0,
        teacherCount: 0,
        activeTeacherCount: 0,
        teacherPercentage: 0,
        adminCount: 0,
        activeAdminCount: 0,
        adminPercentage: 0,
        otherCount: 0,
        activeOtherCount: 0,
        otherPercentage: 0,
      });
    }
    const row = results[0];
    res.json({
      totalUsers: row.total_users,
      activeUsers: row.active_users,
      inactiveUsers: row.inactive_users,
      studentCount: row.student_count,
      activeStudentCount: row.active_student_count,
      studentPercentage: row.student_percentage,
      teacherCount: row.teacher_count,
      activeTeacherCount: row.active_teacher_count,
      teacherPercentage: row.teacher_percentage,
      adminCount: row.admin_count,
      activeAdminCount: row.active_admin_count,
      adminPercentage: row.admin_percentage,
      otherCount: row.other_count,
      activeOtherCount: row.active_other_count,
      otherPercentage: row.other_percentage,
    });
  });
};

// ===================================
// Statistiques de publication de cours pour tous les enseignants
// ===================================
export const all_publications = (req, res) => {
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
      });
    }
    const { published_courses, draft_courses } = results[0];
    res.json({
      publishedCourses: published_courses,
      draftCourses: draft_courses,
    });
  });
};

// ===================================
// Liste des cours publiés pour tous les enseignants
// ===================================
export const all_published_courses = (req, res) => {
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
};

// ===================================
// Liste des brouillons de cours pour tous les enseignants
// ===================================
export const all_drafted_courses = (req, res) => {
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
};

export const all_small_courses = (req, res) => {
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
};


// ===================================
// Récupérer la progression globale sur toutes les activités
// ===================================
export const all_small_progression = (req, res) => {
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
};

// ===================================
// Récupérer le nombre total d'activités pour tous les utilisateurs
// ===================================
export const all_activities = (req, res) => {
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
};



// ===================================
// RÉCUPÉRER TOUS LES COURS 
// ===================================
export const all_courses = (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  
  // Requête SQL pour récupérer tous les cours avec le nombre total de cours
  const sqlQuery = `
    SELECT 
      c.fullname AS cours,
      COUNT(DISTINCT ue.userid) AS nombre_d_etudiants,
      DATE_FORMAT(FROM_UNIXTIME(c.timecreated), '%d %b %Y') AS date_creation,
      CASE 
        WHEN c.visible = 1 THEN 'Visible'
        ELSE 'Caché'
      END AS statut,
      CASE 
        WHEN c.startdate > UNIX_TIMESTAMP(NOW()) THEN 'À venir'
        WHEN c.enddate < UNIX_TIMESTAMP(NOW()) THEN 'Terminé'
        ELSE 'En cours'
      END AS etat_cours
    FROM 
      mdl_course c
    LEFT JOIN 
      mdl_enrol e ON e.courseid = c.id
    LEFT JOIN 
      mdl_user_enrolments ue ON ue.enrolid = e.id
    WHERE 
      c.id != 1
    GROUP BY 
      c.id, c.fullname, c.timecreated, c.visible, c.startdate, c.enddate
    ORDER BY 
      c.fullname
  `;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    
    // Calcul du nombre total de cours (même logique que all_activities)
    const totalCourses = results.length;
    
    res.json({
      total_courses: totalCourses,
      course_details: results,
    });
  });
};




export const info_users = (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  
  const sqlQuery = `
    SELECT 
      u.id,
      u.username,
      u.firstname,
      u.lastname,
      u.email,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i:%s') AS lastaccess,
      r.shortname as role
    FROM mdl_user u
    LEFT JOIN mdl_role_assignments ra ON ra.userid = u.id
    LEFT JOIN mdl_role r ON r.id = ra.roleid
    WHERE u.username = ? AND u.deleted = 0
    LIMIT 1
  `;
  
  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results[0] || {});
  });
};

// ===================================
// RÉCUPÉRER TOUS LES BADGES
// ===================================
export const all_badge = (req, res) => {
  const db = getDB();
  
  const sqlQuery = `
    SELECT 
      b.name AS nom_badge,
      b.description AS description_badge,
      COUNT(bi.id) AS nombre_attribue,
      DATE_FORMAT(FROM_UNIXTIME(b.timecreated), '%d %b %Y') AS date_creation
    FROM mdl_badge b
    LEFT JOIN mdl_badge_issued bi ON bi.badgeid = b.id
    GROUP BY b.id, b.name, b.description, b.timecreated
    ORDER BY nombre_attribue DESC
  `;
  
  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
};

// ===================================
// TOUTES LES SOUMISSIONS
// ===================================
export const all_student_submition = (req, res) => {
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
};

// ===================================
// NOMBRE D'ÉVÉNEMENTS À VENIR
// ===================================
export const all_upcoming_events_count = (req, res) => {
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
};

// ===================================
// LISTE DES ÉTUDIANTS
// ===================================
export const student_user = (req, res) => {
  const db = getDB();
  
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
  
  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
};

// ===================================
// LISTE DES ENSEIGNANTS
// ===================================
export const teacher_user = (req, res) => {
  const db = getDB();
  
  const sqlQuery = `
    SELECT DISTINCT
      u.id,
      u.username,
      CONCAT(u.firstname, ' ', u.lastname) AS full_name,
      u.email,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i') AS last_access
    FROM mdl_user u
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE r.shortname IN ('teacher', 'editingteacher') AND u.deleted = 0 
  `;
  
  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
};

// ===================================
// LISTE DES ADMINISTRATEURS
// ===================================
export const admin_user = (req, res) => {
  const db = getDB();
  
  const sqlQuery = `
    SELECT DISTINCT
      u.id,
      u.username,
      CONCAT(u.firstname, ' ', u.lastname) AS full_name,
      u.email,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i') AS last_access
    FROM mdl_user u
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE r.shortname = 'manager' AND u.deleted = 0
  `;
  
  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
};

// ===================================
// LISTE DES AUTRES UTILISATEURS
// ===================================
export const other_user = (req, res) => {
  const db = getDB();
  
  const sqlQuery = `
    SELECT DISTINCT
      u.id,
      u.username,
      CONCAT(u.firstname, ' ', u.lastname) AS full_name,
      u.email,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i') AS last_access
    FROM mdl_user u
    LEFT JOIN mdl_role_assignments ra ON ra.userid = u.id
    LEFT JOIN mdl_role r ON r.id = ra.roleid
    WHERE (r.shortname NOT IN ('student', 'teacher', 'editingteacher', 'manager') OR r.shortname IS NULL) 
      AND u.deleted = 0
  `;
  
  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
};

// ===================================
// ÉTUDIANTS ACTIFS SUR PÉRIODE
// ===================================
export const active_student = (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;
  
  const sqlQuery = `
    SELECT DISTINCT
      u.id,
      u.username,
      CONCAT(u.firstname, ' ', u.lastname) AS full_name,
      u.email,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i') AS last_access
    FROM mdl_user u
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE r.shortname = 'student' 
      AND u.deleted = 0
      AND u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?)
  `;
  
  db.query(sqlQuery, [startDate, endDate], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
};

// ===================================
// ENSEIGNANTS ACTIFS SUR PÉRIODE
// ===================================
export const active_teacher = (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;
  
  const sqlQuery = `
    SELECT DISTINCT
      u.id,
      u.username,
      CONCAT(u.firstname, ' ', u.lastname) AS full_name,
      u.email,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i') AS last_access
    FROM mdl_user u
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE r.shortname IN ('teacher', 'editingteacher') 
      AND u.deleted = 0
      AND u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?)
  `;
  
  db.query(sqlQuery, [startDate, endDate], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
};

// ===================================
// ADMINISTRATEURS ACTIFS SUR PÉRIODE
// ===================================
export const active_admin = (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;
  
  const sqlQuery = `
    SELECT DISTINCT
      u.id,
      u.username,
      CONCAT(u.firstname, ' ', u.lastname) AS full_name,
      u.email,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i') AS last_access
    FROM mdl_user u
    JOIN mdl_role_assignments ra ON ra.userid = u.id
    JOIN mdl_role r ON r.id = ra.roleid
    WHERE r.shortname = 'manager' 
      AND u.deleted = 0
      AND u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?)
  `;
  
  db.query(sqlQuery, [startDate, endDate], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
};

// ===================================
// AUTRES UTILISATEURS ACTIFS SUR PÉRIODE
// ===================================
export const active_other = (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.body;
  
  const sqlQuery = `
    SELECT DISTINCT
      u.id,
      u.username,
      CONCAT(u.firstname, ' ', u.lastname) AS full_name,
      u.email,
      DATE_FORMAT(FROM_UNIXTIME(u.lastaccess), '%d %b %Y %H:%i') AS last_access
    FROM mdl_user u
    LEFT JOIN mdl_role_assignments ra ON ra.userid = u.id
    LEFT JOIN mdl_role r ON r.id = ra.roleid
    WHERE (r.shortname NOT IN ('student', 'teacher', 'editingteacher', 'manager') OR r.shortname IS NULL)
      AND u.deleted = 0
      AND u.lastaccess BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?)
  `;
  
  db.query(sqlQuery, [startDate, endDate], (err, results) => {
    if (err) {
      console.error("Erreur lors de la requête à la base de données:", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    res.json(results);
  });
};

// ===================================
// TOUS LES ÉVÉNEMENTS UTILISATEUR
// ===================================
export const all_user_event = (req, res) => {
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
};

// ===================================
// ACTIVITÉ QUOTIDIENNE DES ÉTUDIANTS (pour graphiques)
// ===================================
export const student_activity_by_day = (req, res) => {
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
};

// ===================================
// ACTIVITÉ QUOTIDIENNE DES ENSEIGNANTS (pour graphiques)
// ===================================
export const teacher_activity_by_day = (req, res) => {
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
};

// ===================================
// ACTIVITÉ QUOTIDIENNE DES ADMINISTRATEURS (pour graphiques)
// ===================================
export const admin_activity_by_day = (req, res) => {
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
      AND r.shortname = 'manager'
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
};

// ===================================
// ACTIVITÉ QUOTIDIENNE DES AUTRES UTILISATEURS (pour graphiques)
// ===================================
export const other_activity_by_day = (req, res) => {
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
};

// ===================================
// DÉTAILS CONNEXIONS ÉTUDIANTS POUR UNE DATE PRÉCISE
// ===================================
export const active_student_by_date = (req, res) => {
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
};

// ===================================
// DÉTAILS CONNEXIONS ENSEIGNANTS POUR UNE DATE PRÉCISE
// ===================================
export const active_teacher_by_date = (req, res) => {
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
};

// ===================================
// DÉTAILS CONNEXIONS ADMINISTRATEURS POUR UNE DATE PRÉCISE
// ===================================
export const active_admin_by_date = (req, res) => {
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
};

// ===================================
// DÉTAILS CONNEXIONS AUTRES UTILISATEURS POUR UNE DATE PRÉCISE
// ===================================
export const active_other_by_date = (req, res) => {
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
};


export const all_submition = (req, res) => {
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
};