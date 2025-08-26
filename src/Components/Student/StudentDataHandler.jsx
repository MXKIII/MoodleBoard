import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import axios from "axios";

// Hook personnalisé qui centralise toutes les fonctions de navigation et de récupération de données 
// pour les statistiques côté étudiant.
export function useDataHandlers({ 
  API_BASE_URL, 
  PORT, 
  userId, 
  setError, 
  announceLoading = () => {} 
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

  // Fonction générique pour effectuer les appels API avec gestion d'erreurs
  const makeApiCall = useCallback(async (endpoint, requestData, navigationState, loadingMessage) => {
    if (!validateRequiredParams()) return;

    try {
      announceLoading(loadingMessage || `Récupération de vos données en cours...`);

      const response = await axios.post(
        `${API_BASE_URL}/api/${endpoint}`,
        requestData,
        {
          timeout: 10000, // Timeout de 10 secondes
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Validation de la réponse
      if (!response.data) {
        throw new Error("Aucune donnée reçue du serveur");
      }

      announceLoading(`${loadingMessage || 'Vos données'} récupérées avec succès`);

      // Navigation avec état accessible
      navigate(navigationState.path, {
        state: {
          ...navigationState.state,
          results: response.data,
          timestamp: new Date().toISOString(),
          userContext: {
            userId,
            userRole: 'student',
            actionType: navigationState.actionType
          }
        }
      });

    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          `Erreur lors de la récupération de vos données pour ${endpoint}`;
      
      console.error(`Erreur API ${endpoint}:`, error);
      setError(errorMessage);
      
      announceLoading(`Erreur: ${errorMessage}`);
    }
  }, [validateRequiredParams, API_BASE_URL, PORT, navigate, userId, setError, announceLoading]);

  return {
    // Récupère la liste de tous les cours de l'étudiant
    handleTotalCoursesClick: useCallback(async () => {
      await makeApiCall(
        "total-courses",
        { userId },
        {
          path: "/query-result",
          state: {
            message: "Tous vos cours",
            contentType: "courses",
            description: "Liste complète de tous les cours auxquels vous êtes inscrit",
            actionContext: "vue_ensemble"
          },
          actionType: "view_all_courses"
        },
        "Récupération de tous vos cours"
      );
    }, [makeApiCall, userId]),

    // Récupère la liste des cours complétés par l'étudiant
    handleCompletedCoursesClick: useCallback(async () => {
      await makeApiCall(
        "completed-courses",
        { userId },
        {
          path: "/query-result",
          state: {
            message: "Vos cours terminés",
            contentType: "courses",
            description: "Cours que vous avez terminés avec succès",
            actionContext: "progression",
            completionStatus: "completed"
          },
          actionType: "view_completed_courses"
        },
        "Récupération de vos cours terminés"
      );
    }, [makeApiCall, userId]),

    // Récupère la liste des cours en cours de l'étudiant
    handleOngoingCoursesClick: useCallback(async () => {
      await makeApiCall(
        "ongoing-courses",
        { userId },
        {
          path: "/query-result",
          state: {
            message: "Vos cours en cours",
            contentType: "courses",
            description: "Cours que vous suivez actuellement et n'avez pas encore terminés",
            actionContext: "activité_courante",
            completionStatus: "ongoing"
          },
          actionType: "view_ongoing_courses"
        },
        "Récupération de vos cours en cours"
      );
    }, [makeApiCall, userId]),

    // Récupère la liste de toutes les activités de l'étudiant
    handleTotalActivitiesClick: useCallback(async () => {
      await makeApiCall(
        "total-activities",
        { userId },
        {
          path: "/query-result",
          state: {
            message: "Toutes vos activités",
            contentType: "activities",
            description: "Liste complète de vos activités pédagogiques (devoirs, quiz, exercices, etc.)",
            actionContext: "vue_ensemble"
          },
          actionType: "view_all_activities"
        },
        "Récupération de toutes vos activités"
      );
    }, [makeApiCall, userId]),

    // Récupère la liste des événements de l'étudiant
    handleUserEvent: useCallback(async () => {
      await makeApiCall(
        "user-event",
        { userId },
        {
          path: "/query-result",
          state: {
            message: "Vos événements",
            contentType: "events",
            description: "Événements et échéances programmés dans votre calendrier d'apprentissage",
            actionContext: "planning"
          },
          actionType: "view_events"
        },
        "Récupération de vos événements"
      );
    }, [makeApiCall, userId]),

    // Récupère la liste des badges de l'étudiant
    handleBadgeClick: useCallback(async () => {
      await makeApiCall(
        "user-badge",
        { userId },
        {
          path: "/query-result",
          state: {
            message: "Vos badges",
            contentType: "badges",
            description: "Badges et récompenses que vous avez obtenus au cours de votre apprentissage",
            actionContext: "réalisations"
          },
          actionType: "view_badges"
        },
        "Récupération de vos badges"
      );
    }, [makeApiCall, userId]),

    // Analyse de la progression détaillée (optionnel pour étudiant)
    handleProgressAnalysis: useCallback(async () => {
      await makeApiCall(
        "student-progress-analysis",
        { userId },
        {
          path: "/chart-result",
          state: {
            message: "Analyse de votre progression",
            chartType: "progress_analysis",
            description: "Analyse détaillée de votre progression dans les différents cours et activités",
            actionContext: "analyse_progression"
          },
          actionType: "analyze_progress"
        },
        "Génération de l'analyse de progression"
      );
    }, [makeApiCall, userId]),

    // Récupère les recommandations personnalisées (optionnel)
    handleRecommendations: useCallback(async () => {
      await makeApiCall(
        "student-recommendations",
        { userId },
        {
          path: "/query-result",
          state: {
            message: "Vos recommandations",
            contentType: "recommendations",
            description: "Suggestions de cours et activités adaptées à votre profil d'apprentissage",
            actionContext: "personnalisation"
          },
          actionType: "view_recommendations"
        },
        "Récupération de vos recommandations"
      );
    }, [makeApiCall, userId]),

    // Validation des paramètres (exposée pour les composants)
    validateRequiredParams,
  };
}
