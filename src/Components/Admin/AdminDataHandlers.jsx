import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCallback } from "react";

// Hook personnalisé qui centralise toutes les fonctions de navigation et de récupération de données 
// pour les statistiques et les listes utilisateurs côté admin.
export function useDataHandlers({
  API_BASE_URL,
  PORT,
  userId,
  setError,
  startDate,
  endDate,
  announceLoading = () => {},
}) {
  const navigate = useNavigate();


  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }, []);

  // Fonction utilitaire pour gérer les erreurs de manière accessible
  const handleApiError = useCallback((error, defaultMessage) => {
    console.error("Erreur API:", error);
    
    let errorMessage = defaultMessage;
    
    // Messages d'erreur plus précis selon le type d'erreur
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
          break;
        case 403:
          errorMessage = "Accès non autorisé à cette ressource.";
          break;
        case 404:
          errorMessage = "Données non trouvées.";
          break;
        case 500:
          errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
          break;
        default:
          errorMessage = `${defaultMessage} (Code: ${error.response.status})`;
      }
    } else if (error.request) {
      errorMessage = "Problème de connexion. Vérifiez votre réseau.";
    }
    
    setError(errorMessage);
  }, [setError]);

  // Fonction utilitaire pour valider les paramètres requis
  const validateRequiredParams = useCallback(() => {
    if (!userId) {
      setError("Identifiant utilisateur manquant. Veuillez vous reconnecter.");
      return false;
    }
    if (!startDate || !endDate) {
      setError("Période de dates requise pour cette action.");
      return false;
    }
    return true;
  }, [userId, startDate, endDate, setError]);


  const makeApiCall = useCallback(async (endpoint, data, navigateTo, successMessage) => {
    try {
      announceLoading(`Chargement de ${successMessage}...`);
      
      const config = getAuthConfig(); 
      
      const response = await axios.post(
        `${API_BASE_URL}/api/${endpoint}`,
        data,
        config 
      );
      
      navigate(navigateTo.path, {
        state: { 
          ...navigateTo.state, 
          results: response.data,
          timestamp: new Date().toISOString(),
          source: endpoint
        },
      });
      
      announceLoading(`${successMessage} chargées avec succès`);
    } catch (error) {
      handleApiError(error, `Erreur lors de la récupération de ${successMessage}`);
    }
  }, [API_BASE_URL, PORT, navigate, handleApiError, announceLoading, getAuthConfig]);

  // ========== HANDLERS POUR LES UTILISATEURS ==========

  // Récupère la liste des étudiants
  const handleStudentUserClick = useCallback(async () => {
    await makeApiCall(
      "student-user",
      { userId },
      {
        path: "/query-result",
        state: { 
          message: "Utilisateurs étudiants",
          userType: "student",
          description: "Liste complète des utilisateurs ayant le rôle étudiant"
        }
      },
      "la liste des utilisateurs étudiants"
    );
  }, [makeApiCall, userId]);

  // Récupère la liste des enseignants
  const handleTeacherUserClick = useCallback(async () => {
    await makeApiCall(
      "teacher-user",
      { userId },
      {
        path: "/query-result",
        state: { 
          message: "Utilisateurs enseignants",
          userType: "teacher",
          description: "Liste complète des utilisateurs ayant le rôle enseignant"
        }
      },
      "la liste des utilisateurs enseignants"
    );
  }, [makeApiCall, userId]);

  // Récupère la liste des éditeurs (admin)
  const handleAdminUserClick = useCallback(async () => {
    await makeApiCall(
      "admin-user",
      { userId },
      {
        path: "/query-result",
        state: { 
          message: "Utilisateurs éditeurs",
          userType: "admin",
          description: "Liste complète des utilisateurs ayant le rôle éditeur"
        }
      },
      "la liste des utilisateurs éditeurs"
    );
  }, [makeApiCall, userId]);

  // Récupère la liste des autres utilisateurs
  const handleOtherUserClick = useCallback(async () => {
    await makeApiCall(
      "other-user",
      { userId },
      {
        path: "/query-result",
        state: { 
          message: "Autres utilisateurs",
          userType: "other",
          description: "Liste des utilisateurs avec d'autres types de rôles"
        }
      },
      "la liste des autres utilisateurs"
    );
  }, [makeApiCall, userId]);

  // ========== HANDLERS POUR LES UTILISATEURS ACTIFS ==========

  // Récupère la liste des étudiants actifs sur la période sélectionnée
  const handleActiveStudentUserClick = useCallback(async () => {
    if (!validateRequiredParams()) return;

    await makeApiCall(
      "active-student",
      {
        userId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      {
        path: "/query-result",
        state: {
          message: "Étudiants actifs",
          userType: "student",
          description: `Étudiants actifs du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
          period: { startDate, endDate }
        }
      },
      "la liste des étudiants actifs"
    );
  }, [makeApiCall, userId, startDate, endDate, validateRequiredParams]);

  // Récupère la liste des enseignants actifs sur la période sélectionnée
  const handleActiveTeacherUserClick = useCallback(async () => {
    if (!validateRequiredParams()) return;

    await makeApiCall(
      "active-teacher",
      {
        userId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      {
        path: "/query-result",
        state: {
          message: "Enseignants actifs",
          userType: "teacher",
          description: `Enseignants actifs du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
          period: { startDate, endDate }
        }
      },
      "la liste des enseignants actifs"
    );
  }, [makeApiCall, userId, startDate, endDate, validateRequiredParams]);

  // Récupère la liste des éditeurs actifs sur la période sélectionnée
  const handleActiveAdminUserClick = useCallback(async () => {
    if (!validateRequiredParams()) return;

    await makeApiCall(
      "active-admin",
      {
        userId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      {
        path: "/query-result",
        state: {
          message: "Éditeurs actifs",
          userType: "admin",
          description: `Éditeurs actifs du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
          period: { startDate, endDate }
        }
      },
      "la liste des éditeurs actifs"
    );
  }, [makeApiCall, userId, startDate, endDate, validateRequiredParams]);

  // Récupère la liste des autres utilisateurs actifs sur la période sélectionnée
  const handleActiveOtherUserClick = useCallback(async () => {
    if (!validateRequiredParams()) return;

    await makeApiCall(
      "active-other",
      {
        userId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      {
        path: "/query-result",
        state: {
          message: "Autres utilisateurs actifs",
          userType: "other",
          description: `Autres utilisateurs actifs du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
          period: { startDate, endDate }
        }
      },
      "la liste des autres utilisateurs actifs"
    );
  }, [makeApiCall, userId, startDate, endDate, validateRequiredParams]);

  // ========== HANDLERS POUR L'ACTIVITÉ QUOTIDIENNE ==========

  // Récupère l'activité quotidienne des étudiants (pour le graphique)
  const handleStudentActiviyByDayClick = useCallback(async () => {
    if (!validateRequiredParams()) return;

    await makeApiCall(
      "student-activity-by-day",
      {
        userId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      {
        path: "/Graph",
        state: {
          message: "Connexions quotidiennes des étudiants",
          userType: "student",
          description: `Graphique des connexions quotidiennes des étudiants du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
          chartType: "daily-activity",
          period: { startDate, endDate }
        }
      },
      "l'activité quotidienne des étudiants"
    );
  }, [makeApiCall, userId, startDate, endDate, validateRequiredParams]);

  // Récupère l'activité quotidienne des enseignants (pour le graphique)
  const handleTeacherActiviyByDayClick = useCallback(async () => {
    if (!validateRequiredParams()) return;

    await makeApiCall(
      "teacher-activity-by-day",
      {
        userId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      {
        path: "/Graph",
        state: {
          message: "Connexions quotidiennes des enseignants",
          userType: "teacher",
          description: `Graphique des connexions quotidiennes des enseignants du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
          chartType: "daily-activity",
          period: { startDate, endDate }
        }
      },
      "l'activité quotidienne des enseignants"
    );
  }, [makeApiCall, userId, startDate, endDate, validateRequiredParams]);

  // Récupère l'activité quotidienne des éditeurs (pour le graphique)
  const handleAdminActiviyByDayClick = useCallback(async () => {
    if (!validateRequiredParams()) return;

    await makeApiCall(
      "admin-activity-by-day",
      {
        userId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      {
        path: "/Graph",
        state: {
          message: "Connexions quotidiennes des éditeurs",
          userType: "admin",
          description: `Graphique des connexions quotidiennes des éditeurs du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
          chartType: "daily-activity",
          period: { startDate, endDate }
        }
      },
      "l'activité quotidienne des éditeurs"
    );
  }, [makeApiCall, userId, startDate, endDate, validateRequiredParams]);

  // Récupère l'activité quotidienne des autres utilisateurs (pour le graphique)
  const handleOtherActiviyByDayClick = useCallback(async () => {
    if (!validateRequiredParams()) return;

    await makeApiCall(
      "other-activity-by-day",
      {
        userId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      {
        path: "/Graph",
        state: {
          message: "Connexions quotidiennes des autres utilisateurs",
          userType: "other",
          description: `Graphique des connexions quotidiennes des autres utilisateurs du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
          chartType: "daily-activity",
          period: { startDate, endDate }
        }
      },
      "l'activité quotidienne des autres utilisateurs"
    );
  }, [makeApiCall, userId, startDate, endDate, validateRequiredParams]);

  // ========== HANDLERS POUR LES COURS ET CONTENUS ==========

  // Récupère la liste des cours publiés
  const handlePublishedCoursesClick = useCallback(async () => {
    await makeApiCall(
      "all-published-courses",
      { userId },
      {
        path: "/query-result",
        state: { 
          message: "Cours publiés",
          description: "Liste complète des cours publiés sur la plateforme",
          contentType: "published-courses"
        }
      },
      "la liste des cours publiés"
    );
  }, [makeApiCall, userId]);

  // Récupère la liste des brouillons de cours
  const handleDraftCoursesClick = useCallback(async () => {
    await makeApiCall(
      "all-drafted-courses",
      { userId },
      {
        path: "/query-result",
        state: { 
          message: "Brouillons de cours",
          description: "Liste complète des cours en brouillon",
          contentType: "draft-courses"
        }
      },
      "la liste des brouillons de cours"
    );
  }, [makeApiCall, userId]);

  // Récupère la liste des rendus des élèves
  const handleStudentSubmitionClick = useCallback(async () => {
    await makeApiCall(
      "all-student-submition",
      { userId },
      {
        path: "/query-result",
        state: { 
          message: "Rendus des étudiants",
          description: "Liste complète des travaux rendus par les étudiants",
          contentType: "student-submissions"
        }
      },
      "la liste des rendus des étudiants"
    );
  }, [makeApiCall, userId]);


  const handleTotalCoursesClick = useCallback(async () => {
    try {
      announceLoading("Chargement de la liste complète des cours...");
      
      const config = getAuthConfig(); 
      
      const response = await axios.post(
        `${API_BASE_URL}/api/all-courses`,
        { userId },
        config 
      );
      
      navigate("/query-result", {
        state: {
          results: response.data.course_details,
          totalCourses: response.data.total_courses,
          message: "Tous les cours",
          description: `Liste complète des ${response.data.total_courses} cours de la plateforme`,
          contentType: "all-courses"
        },
      });
      
      announceLoading("Liste complète des cours chargée avec succès");
    } catch (error) {
      handleApiError(error, "Erreur lors de la récupération des cours");
    }
  }, [API_BASE_URL, PORT, userId, navigate, handleApiError, announceLoading, getAuthConfig]);

  
  const handleTotalActivitiesClick = useCallback(async () => {
    try {
      announceLoading("Chargement de la liste complète des activités...");
      
      const config = getAuthConfig(); 
      
      const response = await axios.post(
        `${API_BASE_URL}/api/all-activities`,
        { userId },
        config 
      );
      
      navigate("/query-result", {
        state: {
          results: response.data.course_details,
          totalActivities: response.data.total_activities,
          message: "Toutes les activités",
          description: `Liste complète des ${response.data.total_activities} activités de la plateforme`,
          contentType: "all-activities"
        },
      });
      
      announceLoading("Liste complète des activités chargée avec succès");
    } catch (error) {
      handleApiError(error, "Erreur lors de la récupération des activités");
    }
  }, [API_BASE_URL, PORT, userId, navigate, handleApiError, announceLoading, getAuthConfig]);

  // Récupère la liste des événements utilisateur
  const handleUserEvent = useCallback(async () => {
    await makeApiCall(
      "all-user-event",
      { userId },
      {
        path: "/query-result",
        state: { 
          message: "Événements utilisateur",
          description: "Liste complète des événements de la plateforme",
          contentType: "user-events"
        }
      },
      "la liste des événements utilisateur"
    );
  }, [makeApiCall, userId]);

  // Récupère la liste des badges utilisateur
  const handleBadgeClick = useCallback(async () => {
    await makeApiCall(
      "all-badge",
      { userId },
      {
        path: "/query-result",
        state: { 
          message: "Badges utilisateur",
          description: "Liste complète des badges attribués aux utilisateurs",
          contentType: "user-badges"
        }
      },
      "la liste des badges utilisateur"
    );
  }, [makeApiCall, userId]);

  // ========== HANDLERS POUR LES DÉPARTEMENTS ==========

  // Fonction générique pour les départements
  const createDepartmentHandler = useCallback((endpoint, name) => {
    return async () => {
      await makeApiCall(
        `departement-${endpoint}`,
        { userId },
        {
          path: "/query-result",
          state: { 
            message: `Publications - ${name}`,
            description: `Liste des publications du département ${name}`,
            department: name,
            contentType: "department-publications"
          }
        },
        `les publications du département ${name}`
      );
    };
  }, [makeApiCall, userId]);

  // Création de tous les handlers de départements
  const handleMathDepartement = useCallback(createDepartmentHandler("math", "Mathématiques"), [createDepartmentHandler]);
  const handleLettresDepartement = useCallback(createDepartmentHandler("lettres", "Lettres"), [createDepartmentHandler]);
  const handleAnglaisDepartement = useCallback(createDepartmentHandler("anglais", "Anglais"), [createDepartmentHandler]);
  const handleShsphiloDepartement = useCallback(createDepartmentHandler("shsphilo", "Philosophie et SHS"), [createDepartmentHandler]);
  const handleDocumentationDepartement = useCallback(createDepartmentHandler("documentation", "Documentation"), [createDepartmentHandler]);
  const handleHistgeoDepartement = useCallback(createDepartmentHandler("histgeo", "Histoire-Géographie"), [createDepartmentHandler]);
  const handleEpsDepartement = useCallback(createDepartmentHandler("eps", "EPS"), [createDepartmentHandler]);
  const handleSvtDepartement = useCallback(createDepartmentHandler("svt", "SVT"), [createDepartmentHandler]);
  const handleEspagnolDepartement = useCallback(createDepartmentHandler("espagnol", "Espagnol"), [createDepartmentHandler]);
  const handleMusiqueDepartement = useCallback(createDepartmentHandler("musique", "Musique"), [createDepartmentHandler]);
  const handleAllemandDepartement = useCallback(createDepartmentHandler("allemand", "Allemand"), [createDepartmentHandler]);
  const handleArtsPlastiquesDepartement = useCallback(createDepartmentHandler("artsplastiques", "Arts Plastiques"), [createDepartmentHandler]);
  const handleSpcDepartement = useCallback(createDepartmentHandler("spc", "Sciences Physiques et Chimie"), [createDepartmentHandler]);
  const handleTechnoDepartement = useCallback(createDepartmentHandler("techno", "Technologie"), [createDepartmentHandler]);
  const handleArchDepartement = useCallback(createDepartmentHandler("arch", "Architecture"), [createDepartmentHandler]);
  const handleAshDepartement = useCallback(createDepartmentHandler("ash", "ASH"), [createDepartmentHandler]);
  const handleItalienDepartement = useCallback(createDepartmentHandler("italien", "Italien"), [createDepartmentHandler]);
  const handleEcogestionDepartement = useCallback(createDepartmentHandler("ecogestion", "Économie et Gestion"), [createDepartmentHandler]);

  // Retourne tous les handlers pour utilisation dans les composants de stats
  return {
    handleStudentUserClick,
    handleTeacherUserClick,
    handleAdminUserClick,
    handleOtherUserClick,
    handleActiveStudentUserClick,
    handleActiveTeacherUserClick,
    handleActiveAdminUserClick,
    handleActiveOtherUserClick,
    handleStudentActiviyByDayClick,
    handleTeacherActiviyByDayClick,
    handleAdminActiviyByDayClick,
    handleOtherActiviyByDayClick,
    handlePublishedCoursesClick,
    handleDraftCoursesClick,
    handleStudentSubmitionClick,
    handleTotalCoursesClick,
    handleTotalActivitiesClick,
    handleUserEvent,
    handleBadgeClick,
    handleMathDepartement,
    handleLettresDepartement,
    handleAnglaisDepartement,
    handleShsphiloDepartement,
    handleDocumentationDepartement,
    handleHistgeoDepartement,
    handleEpsDepartement,
    handleSvtDepartement,
    handleEspagnolDepartement,
    handleMusiqueDepartement,
    handleAllemandDepartement,
    handleArtsPlastiquesDepartement,
    handleSpcDepartement,
    handleTechnoDepartement,
    handleArchDepartement,
    handleAshDepartement,
    handleItalienDepartement,
    handleEcogestionDepartement,
  };
}
