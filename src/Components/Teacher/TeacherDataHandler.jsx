import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import axios from "axios";

// Hook personnalisé qui centralise toutes les fonctions de navigation et de récupération de données
// pour les statistiques et les listes utilisateurs côté enseignant.
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

  // Fonction utilitaire pour valider les paramètres requis
  const validateRequiredParams = useCallback(() => {
    if (!userId) {
      setError("Identifiant utilisateur manquant. Veuillez vous reconnecter.");
      return false;
    }
    if (!API_BASE_URL || !PORT) {
      setError("Configuration du serveur manquante. Contactez l'administrateur.");
      return false;
    }
    return true;
  }, [userId, API_BASE_URL, PORT, setError]);

  // Fonction utilitaire pour valider les dates (pour les requêtes avec période)
  const validateDates = useCallback(() => {
    if (!startDate || !endDate) {
      setError("Dates de début et de fin requises pour cette action.");
      return false;
    }
    if (startDate > endDate) {
      setError("La date de début ne peut pas être supérieure à la date de fin.");
      return false;
    }
    return true;
  }, [startDate, endDate, setError]);

  // Fonction générique pour effectuer les appels API avec gestion d'erreurs
  const makeApiCall = useCallback(
    async (endpoint, requestData, navigationState, loadingMessage) => {
      if (!validateRequiredParams()) return;

      try {
        announceLoading(loadingMessage || `Récupération des données en cours...`);

        const response = await axios.post(
          `${API_BASE_URL}/api/${endpoint}`,
          requestData,
          {
            timeout: 10000, // Timeout de 10 secondes
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Validation de la réponse
        if (!response.data) {
          throw new Error("Aucune donnée reçue du serveur");
        }

        announceLoading(`${loadingMessage || "Données"} récupérées avec succès`);

        // Navigation avec état accessible
        navigate(navigationState.path, {
          state: {
            ...navigationState.state,
            results: response.data,
            timestamp: new Date().toISOString(),
            userContext: {
              userId,
              userRole: "teacher",
              period: navigationState.state.period || null,
            },
          },
        });
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          `Erreur lors de la récupération des données pour ${endpoint}`;

        console.error(`Erreur API ${endpoint}:`, error);
        setError(errorMessage);

        announceLoading(`Erreur: ${errorMessage}`);
      }
    },
    [validateRequiredParams, API_BASE_URL, PORT, navigate, userId, setError, announceLoading]
  );

  return {
    // Récupère la liste de tous les étudiants
    handleStudentUserClick: useCallback(
      async () => {
        await makeApiCall(
          "student-user",
          { userId },
          {
            path: "/query-result",
            state: {
              message: "Liste des étudiants",
              userType: "student",
              description: "Liste complète des étudiants inscrits sur la plateforme",
              actionContext: "consultation",
            },
          },
          "Récupération de la liste des étudiants"
        );
      },
      [makeApiCall, userId]
    ),

    // Récupère la liste de tous les enseignants
    handleTeacherUserClick: useCallback(
      async () => {
        await makeApiCall(
          "teacher-user",
          { userId },
          {
            path: "/query-result",
            state: {
              message: "Liste des enseignants",
              userType: "teacher",
              description: "Liste complète des enseignants de la plateforme",
              actionContext: "consultation",
            },
          },
          "Récupération de la liste des enseignants"
        );
      },
      [makeApiCall, userId]
    ),

    // Récupère la liste de tous les administrateurs
    handleAdminUserClick: useCallback(
      async () => {
        await makeApiCall(
          "admin-user",
          { userId },
          {
            path: "/query-result",
            state: {
              message: "Liste des administrateurs",
              userType: "admin",
              description: "Liste complète des administrateurs de la plateforme",
              actionContext: "consultation",
            },
          },
          "Récupération de la liste des administrateurs"
        );
      },
      [makeApiCall, userId]
    ),

    // Récupère la liste des autres types d'utilisateurs
    handleOtherUserClick: useCallback(
      async () => {
        await makeApiCall(
          "other-user",
          { userId },
          {
            path: "/query-result",
            state: {
              message: "Autres utilisateurs",
              userType: "other",
              description: "Liste des utilisateurs avec des rôles spécifiques ou invités",
              actionContext: "consultation",
            },
          },
          "Récupération de la liste des autres utilisateurs"
        );
      },
      [makeApiCall, userId]
    ),

    // Récupère la liste des étudiants actifs sur la période sélectionnée
    handleActiveStudentUserClick: useCallback(
      async () => {
        if (!validateDates()) return;

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
              description: `Étudiants ayant eu une activité du ${startDate.toLocaleDateString(
                "fr-FR"
              )} au ${endDate.toLocaleDateString("fr-FR")}`,
              period: { startDate, endDate },
              actionContext: "analyse_periode",
            },
          },
          "Récupération des étudiants actifs"
        );
      },
      [makeApiCall, userId, startDate, endDate, validateDates]
    ),

    // Récupère la liste des enseignants actifs sur la période sélectionnée
    handleActiveTeacherUserClick: useCallback(
      async () => {
        if (!validateDates()) return;

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
              description: `Enseignants ayant eu une activité du ${startDate.toLocaleDateString(
                "fr-FR"
              )} au ${endDate.toLocaleDateString("fr-FR")}`,
              period: { startDate, endDate },
              actionContext: "analyse_periode",
            },
          },
          "Récupération des enseignants actifs"
        );
      },
      [makeApiCall, userId, startDate, endDate, validateDates]
    ),

    // Récupère la liste des administrateurs actifs sur la période sélectionnée
    handleActiveAdminUserClick: useCallback(
      async () => {
        if (!validateDates()) return;

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
              message: "Administrateurs actifs",
              userType: "admin",
              description: `Administrateurs ayant eu une activité du ${startDate.toLocaleDateString(
                "fr-FR"
              )} au ${endDate.toLocaleDateString("fr-FR")}`,
              period: { startDate, endDate },
              actionContext: "analyse_periode",
            },
          },
          "Récupération des administrateurs actifs"
        );
      },
      [makeApiCall, userId, startDate, endDate, validateDates]
    ),

    // Récupère la liste des autres utilisateurs actifs sur la période sélectionnée
    handleActiveOtherUserClick: useCallback(
      async () => {
        if (!validateDates()) return;

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
              description: `Autres utilisateurs ayant eu une activité du ${startDate.toLocaleDateString(
                "fr-FR"
              )} au ${endDate.toLocaleDateString("fr-FR")}`,
              period: { startDate, endDate },
              actionContext: "analyse_periode",
            },
          },
          "Récupération des autres utilisateurs actifs"
        );
      },
      [makeApiCall, userId, startDate, endDate, validateDates]
    ),

    // Récupère la liste des cours publiés par l'enseignant
    handlePublishedCoursesClick: useCallback(
      async () => {
        await makeApiCall(
          "teacher-published-courses",
          { userId },
          {
            path: "/query-result",
            state: {
              message: "Vos cours publiés",
              contentType: "courses",
              description: "Liste de vos cours actuellement publiés et accessibles aux étudiants",
              actionContext: "gestion_cours",
            },
          },
          "Récupération de vos cours publiés"
        );
      },
      [makeApiCall, userId]
    ),

    // Récupère la liste des brouillons de cours de l'enseignant
    handleDraftCoursesClick: useCallback(
      async () => {
        await makeApiCall(
          "teacher-drafted-courses",
          { userId },
          {
            path: "/query-result",
            state: {
              message: "Vos brouillons de cours",
              contentType: "courses",
              description: "Liste de vos cours en cours de création ou de modification",
              actionContext: "gestion_cours",
            },
          },
          "Récupération de vos brouillons de cours"
        );
      },
      [makeApiCall, userId]
    ),

    // Récupère la liste des rendus des étudiants
    handleStudentSubmitionClick: useCallback(
      async () => {
        await makeApiCall(
          "student-submition",
          { userId },
          {
            path: "/query-result",
            state: {
              message: "Rendus des étudiants",
              contentType: "submissions",
              description: "Liste des travaux rendus par vos étudiants nécessitant évaluation",
              actionContext: "evaluation",
            },
          },
          "Récupération des rendus des étudiants"
        );
      },
      [makeApiCall, userId]
    ),

    // Récupère la liste de tous les cours de l'enseignant
    handleTotalCoursesClick: useCallback(
      async () => {
        await makeApiCall(
          "user-courses",
          { userId },
          {
            path: "/query-result",
            state: {
              message: "Tous vos cours",
              contentType: "courses",
              description: "Liste complète de tous vos cours (publiés, brouillons, archivés)",
              actionContext: "vue_ensemble",
            },
          },
          "Récupération de tous vos cours"
        );
      },
      [makeApiCall, userId]
    ),

    // Récupère la liste de toutes les activités de l'enseignant
    handleTotalActivitiesClick: useCallback(
      async () => {
        await makeApiCall(
          "user-activities",
          { userId },
          {
            path: "/query-result",
            state: {
              message: "Toutes vos activités",
              contentType: "activities",
              description: "Liste complète de vos activités pédagogiques (devoirs, quiz, forums, etc.)",
              actionContext: "vue_ensemble",
            },
          },
          "Récupération de toutes vos activités"
        );
      },
      [makeApiCall, userId]
    ),

    // Récupère la liste des événements de l'enseignant
    handleUserEvent: useCallback(
      async () => {
        await makeApiCall(
          "user-event",
          { userId },
          {
            path: "/query-result",
            state: {
              message: "Vos événements",
              contentType: "events",
              description: "Liste de vos événements et échéances programmés dans le calendrier",
              actionContext: "planning",
            },
          },
          "Récupération de vos événements"
        );
      },
      [makeApiCall, userId]
    ),

    // Récupère la liste des badges de l'enseignant
    handleBadgeClick: useCallback(
      async () => {
        await makeApiCall(
          "user-badge",
          { userId },
          {
            path: "/query-result",
            state: {
              message: "Vos badges",
              contentType: "badges",
              description: "Liste des badges et récompenses que vous avez créés ou obtenus",
              actionContext: "gamification",
            },
          },
          "Récupération de vos badges"
        );
      },
      [makeApiCall, userId]
    ),

    // Analyse de l'activité des étudiants par jour (graphique)
    handleStudentActivityByDayClick: useCallback(
      async () => {
        if (!validateDates()) return;

        await makeApiCall(
          "student-activity-by-day",
          {
            userId,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          },
          {
            path: "/chart-result",
            state: {
              message: "Activité quotidienne des étudiants",
              chartType: "daily_activity",
              description: `Évolution de l'activité de vos étudiants du ${startDate.toLocaleDateString(
                "fr-FR"
              )} au ${endDate.toLocaleDateString("fr-FR")}`,
              period: { startDate, endDate },
              actionContext: "analyse_graphique",
            },
          },
          "Génération du graphique d'activité quotidienne"
        );
      },
      [makeApiCall, userId, startDate, endDate, validateDates]
    ),

    // Validation des paramètres (exposée pour les composants)
    validateRequiredParams,
    validateDates,
  };
}
