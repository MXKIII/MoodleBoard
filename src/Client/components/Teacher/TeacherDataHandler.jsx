import { useNavigate } from "react-router-dom";
import axios from "axios";

// Hook personnalisé qui centralise toutes les fonctions de navigation et de récupération de données pour les statistiques et les listes utilisateurs côté enseignant.
export function useDataHandlers({
  API_BASE_URL,
  PORT,
  userId,
  setError,
  startDate,
  endDate,
}) {
  const navigate = useNavigate();

  return {
    // Récupère la liste des étudiants
    handleStudentUserClick: async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/student-user`,
          { userId }
        );
        navigate("/query-result", {
          state: { results: response.data, message: "Étudiants" },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des étudiants");
      }
    },

    // Récupère la liste des enseignants
    handleTeacherUserClick: async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/teacher-user`,
          { userId }
        );
        navigate("/query-result", {
          state: { results: response.data, message: "Enseignants" },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des enseignants");
      }
    },

    // Récupère la liste des administrateurs
    handleAdminUserClick: async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/admin-user`,
          { userId }
        );
        navigate("/query-result", {
          state: { results: response.data, message: "Administrateurs" },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des administrateurs");
      }
    },

    // Récupère la liste des autres utilisateurs
    handleOtherUserClick: async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/other-user`,
          { userId }
        );
        navigate("/query-result", {
          state: { results: response.data, message: "Autres utilisateurs" },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des autres utilisateurs");
      }
    },

    // Récupère la liste des étudiants actifs sur la période sélectionnée
    handleActiveStudentUserClick: async () => {
      if (!userId || !startDate || !endDate) return;
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/active-student`,
          {
            userId,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          }
        );
        navigate("/query-result", {
          state: {
            results: response.data,
            message: "Étudiants actifs",
            userType: "student",
          },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des étudiants actifs");
      }
    },

    // Récupère la liste des enseignants actifs sur la période sélectionnée
    handleActiveTeacherUserClick: async () => {
      if (!userId || !startDate || !endDate) return;
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/active-teacher`,
          {
            userId,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          }
        );
        navigate("/query-result", {
          state: {
            results: response.data,
            message: "Enseignants actifs",
            userType: "teacher",
          },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des enseignants actifs");
      }
    },

    // Récupère la liste des administrateurs actifs sur la période sélectionnée
    handleActiveAdminUserClick: async () => {
      if (!userId || !startDate || !endDate) return;
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/active-admin`,
          {
            userId,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          }
        );
        navigate("/query-result", {
          state: {
            results: response.data,
            message: "Administrateurs actifs",
            userType: "admin",
          },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des administrateurs actifs");
      }
    },

    // Récupère la liste des autres utilisateurs actifs sur la période sélectionnée
    handleActiveOtherUserClick: async () => {
      if (!userId || !startDate || !endDate) return;
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/active-other`,
          {
            userId,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          }
        );
        navigate("/query-result", {
          state: {
            results: response.data,
            message: "Autres utilisateurs actifs",
            userType: "other",
          },
        });
      } catch (error) {
        setError(
          "Erreur lors de la récupération des autres utilisateurs actifs"
        );
      }
    },

    // Récupère la liste des cours publiés par l'enseignant
    handlePublishedCoursesClick: async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/teacher-published-courses`,
          { userId }
        );
        navigate("/query-result", {
          state: { results: response.data, message: "Cours publiés" },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des cours publiés");
      }
    },

    // Récupère la liste des brouillons de cours de l'enseignant
    handleDraftCoursesClick: async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/teacher-drafted-courses`,
          { userId }
        );
        navigate("/query-result", {
          state: { results: response.data, message: "Brouillons de cours" },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des brouillons de cours");
      }
    },

    // Récupère la liste des rendus des étudiants
    handleStudentSubmitionClick: async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/student-submition`,
          { userId }
        );
        navigate("/query-result", {
          state: { results: response.data, message: "Rendus des étudiants" },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des rendus des étudiants");
      }
    },

    // Récupère la liste de tous les cours de l'enseignant
    handleTotalCoursesClick: async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/user-courses`,
          {
            userId,
          }
        );
        navigate("/query-result", {
          state: {
            results: response.data.course_details,
            totalCourses: response.data.total_courses,
            message: "Cours totaux",
          },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des cours totaux");
      }
    },

    // Récupère la liste de toutes les activités de l'enseignant
    handleTotalActivitiesClick: async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/user-activities`,
          { userId }
        );
        navigate("/query-result", {
          state: {
            results: response.data.course_details,
            totalActivities: response.data.total_activities,
            message: `Activités totales : ${response.data.total_activities}`,
          },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des activités totales");
      }
    },

    // Récupère la liste des événements utilisateur
    handleUserEvent: async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/user-event`,
          { userId }
        );
        navigate("/query-result", {
          state: { results: response.data, message: "Événements utilisateur" },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des événements utilisateur");
      }
    },

    // Récupère la liste des badges utilisateur
    handleBadgeClick: async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/user-badge`,
          { userId }
        );
        navigate("/query-result", {
          state: { results: response.data, message: "Badges utilisateur" },
        });
      } catch (error) {
        setError("Erreur lors de la récupération des badges");
      }
    },
  };
}
