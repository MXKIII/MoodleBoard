import { useNavigate } from "react-router-dom";
import axios from "axios";

// Hook personnalisé qui centralise toutes les fonctions de navigation et de récupération de données pour les statistiques côté étudiant.
export function useDataHandlers({ API_BASE_URL, PORT, userId, setError }) {
  const navigate = useNavigate();

  // Récupère la liste de tous les cours de l'étudiant
  const handleTotalCoursesClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/total-courses`,
        { userId }
      );
      navigate("/query-result", {
        state: {
          results: response.data.course_details,
          totalCourses: response.data.total_courses,
        },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des cours totaux");
    }
  };

  // Récupère la liste des cours complétés par l'étudiant
  const handleCompletedCoursesClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/completed-courses`,
        { userId }
      );
      navigate("/query-result", {
        state: {
          results: response.data.course_details,
          completedCourses: response.data.completed_courses,
        },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des cours complétés");
    }
  };

  // Récupère la liste des cours en cours de l'étudiant
  const handleOngoingCoursesClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/ongoing-courses`,
        { userId }
      );
      navigate("/query-result", {
        state: {
          results: response.data.course_details,
          ongoingCourses: response.data.ongoing_courses,
        },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des cours en cours");
    }
  };

  // Récupère la liste de toutes les activités de l'étudiant
  const handleTotalActivitiesClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/total-activities`,
        { userId }
      );
      navigate("/query-result", {
        state: {
          results: response.data.course_details,
          totalActivities: response.data.total_activities,
        },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des activités");
    }
  };

  // Récupère la liste des événements utilisateur
  const handleUserEvent = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/user-event`,
        { userId }
      );
      navigate("/query-result", {
        state: {
          results: response.data,
          message: "User Events",
        },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des événements utilisateur");
    }
  };

  // Récupère la liste des badges utilisateur
  const handleBadgeClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/user-badge`,
        { userId }
      );
      navigate("/query-result", {
        state: {
          results: response.data,
          message: "Badges de l'utilisateur",
        },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des badges");
    }
  };

  // Retourne tous les handlers pour utilisation dans les composants de stats étudiant
  return {
    handleTotalCoursesClick,
    handleCompletedCoursesClick,
    handleOngoingCoursesClick,
    handleTotalActivitiesClick,
    handleUserEvent,
    handleBadgeClick,
  };
}
