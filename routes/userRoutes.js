import express from "express";
import {
  // Fonctions étudiants
  student_courses,
  student_progression,
  student_badges,
  student_activities,
  student_event,
  
  // Fonctions enseignants
  teacher_published_courses,
  teacher_drafted_courses,
  teacher_publications,
  student_submitions,
  teacher_activities,
  
  // Fonctions admin
  user_activity,
  all_publications,
  all_published_courses,
  all_drafted_courses,
  all_small_courses,
  all_small_progression,
  all_activities,
  
  // Fonctions communes
  info_users,
  all_badge,
  all_student_submition,
  all_courses,
  all_upcoming_events_count,
  all_user_event, 
  
  // Listes d'utilisateurs
  student_user,
  teacher_user,
  admin_user,
  other_user,
  active_student,
  active_teacher,
  active_admin,
  active_other,
  
  // Activité par jour (graphiques)
  student_activity_by_day,
  teacher_activity_by_day,
  admin_activity_by_day,
  other_activity_by_day,
  
  // Activité par date précise
  active_student_by_date,
  active_teacher_by_date,
  active_admin_by_date,
  active_other_by_date,
  all_submition,
  
} from "../controller/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===================================
// ROUTES ÉTUDIANTS
// ===================================
router.post("/student-courses", authenticateToken, student_courses);
router.post("/student-progression", authenticateToken, student_progression);
router.post("/student-badges", authenticateToken, student_badges);
router.post("/student-activities", authenticateToken, student_activities);
router.post("/student-event", authenticateToken, student_event);

// ===================================
// ROUTES ENSEIGNANTS
// ===================================
router.post("/teacher-published-courses", authenticateToken, teacher_published_courses);
router.post("/teacher-drafted-courses", authenticateToken, teacher_drafted_courses);
router.post("/teacher-publications", authenticateToken, teacher_publications);
router.post("/student-submitions", authenticateToken, student_submitions);
router.post("/teacher-activities", authenticateToken, teacher_activities);

// ===================================
// ROUTES ADMIN
// ===================================
router.post("/user-activity", authenticateToken, user_activity);
router.post("/all-publications", authenticateToken, all_publications);
router.post("/all-published-courses", authenticateToken, all_published_courses);
router.post("/all-drafted-courses", authenticateToken, all_drafted_courses);
router.post("/all-small-courses", authenticateToken, all_small_courses);
router.post("/all-small-progression", authenticateToken, all_small_progression);
router.post("/all-activities", authenticateToken, all_activities);

// ===================================
// ROUTES COMMUNES (utilisées par tous les rôles)
// ===================================
router.post("/info-users", authenticateToken, info_users);
router.post("/all-badge", authenticateToken, all_badge);
router.post("/all-submition", authenticateToken, all_submition);
router.post("/all-upcoming-events-count", authenticateToken, all_upcoming_events_count);

// Route pour tous les événements
router.post("/all-user-event", authenticateToken, all_user_event);

// ===================================
// ROUTES LISTES D'UTILISATEURS
// ===================================
router.post("/student-user", authenticateToken, student_user);
router.post("/teacher-user", authenticateToken, teacher_user);
router.post("/admin-user", authenticateToken, admin_user);
router.post("/other-user", authenticateToken, other_user);

// Utilisateurs actifs sur période
router.post("/active-student", authenticateToken, active_student);
router.post("/active-teacher", authenticateToken, active_teacher);
router.post("/active-admin", authenticateToken, active_admin);
router.post("/active-other", authenticateToken, active_other);

// ===================================
// ROUTES POUR GRAPHIQUES (activité quotidienne)
// ===================================
router.post("/student-activity-by-day", authenticateToken, student_activity_by_day);
router.post("/teacher-activity-by-day", authenticateToken, teacher_activity_by_day);
router.post("/admin-activity-by-day", authenticateToken, admin_activity_by_day);
router.post("/other-activity-by-day", authenticateToken, other_activity_by_day);

// ===================================
//  ROUTES POUR DÉTAILS PAR DATE PRÉCISE
// ===================================
router.post("/active-student-by-date", authenticateToken, active_student_by_date);
router.post("/active-teacher-by-date", authenticateToken, active_teacher_by_date);
router.post("/active-admin-by-date", authenticateToken, active_admin_by_date);
router.post("/active-other-by-date", authenticateToken, active_other_by_date);

// ===================================
// ROUTES D'ALIAS POUR COMPATIBILITÉ
// ===================================
// Routes alternatives pour la compatibilité avec le frontend existant
router.post("/user-courses", authenticateToken, student_courses);
router.post("/user-small-courses", authenticateToken, student_courses);
router.post("/user-small-progression", authenticateToken, student_progression);
router.post("/upcoming-events-count", authenticateToken, student_event);
router.post("/user-badge", authenticateToken, student_badges);
router.post("/user-activities", authenticateToken, student_activities);
router.post("/user-event", authenticateToken, student_event);
router.post("/publication", authenticateToken, teacher_publications);
router.post("/submition", authenticateToken, student_submitions);
router.post("/total-courses", authenticateToken, all_small_courses);
router.post("/total-activities", authenticateToken, all_activities);
router.post("/completed-courses", authenticateToken, student_courses);
router.post("/ongoing-courses", authenticateToken, student_courses);
router.post("/all-courses", authenticateToken, all_courses);
router.post("/student-submition", authenticateToken, student_submitions);
router.post("/all-student-submition", authenticateToken, all_student_submition);



export default router;
