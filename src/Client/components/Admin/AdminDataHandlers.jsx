import { useNavigate } from "react-router-dom";
import axios from "axios";

// Hook personnalisé qui centralise toutes les fonctions de navigation et de récupération de données pour les statistiques et les listes utilisateurs côté admin.
export function useDataHandlers({
  API_BASE_URL,
  PORT,
  userId,
  setError,
  startDate,
  endDate,
}) {
  const navigate = useNavigate();

  // Récupère la liste des étudiants
  const handleStudentUserClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/student-user`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Student users" },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des utilisateurs étudiants");
    }
  };

  // Récupère la liste des enseignants
  const handleTeacherUserClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/teacher-user`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Teacher users" },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des utilisateurs enseignants");
    }
  };

  // Récupère la liste des éditeurs (admin)
  const handleAdminUserClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/admin-user`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Admin users" },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des utilisateurs éditeurs");
    }
  };

  // Récupère la liste des autres utilisateurs
  const handleOtherUserClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/other-user`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Other users" },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des autres utilisateurs");
    }
  };

  // Récupère la liste des étudiants actifs sur la période sélectionnée
  const handleActiveStudentUserClick = async () => {
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
          message: "active student users",
          userType: "student",
        },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des étudiants actifs");
    }
  };

  // Récupère la liste des enseignants actifs sur la période sélectionnée
  const handleActiveTeacherUserClick = async () => {
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
          message: "active teacher users",
          userType: "teacher",
        },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des enseignants actifs");
    }
  };

  // Récupère la liste des éditeurs actifs sur la période sélectionnée
  const handleActiveAdminUserClick = async () => {
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
          message: "active admin users",
          userType: "admin",
        },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des éditeurs actifs");
    }
  };

  // Récupère la liste des autres utilisateurs actifs sur la période sélectionnée
  const handleActiveOtherUserClick = async () => {
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
          message: "active other users",
          userType: "other",
        },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des autres utilisateurs actifs");
    }
  };

  // Récupère l'activité quotidienne des étudiants (pour le graphique)
  const handleStudentActiviyByDayClick = async () => {
    if (!userId || !startDate || !endDate) return;
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/student-activity-by-day`,
        {
          userId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }
      );
      navigate("/Graph", {
        state: {
          results: response.data,
          message: "Connexions des étudiants",
          userType: "student",
        },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération de l'activité quotidienne des étudiants"
      );
    }
  };

  // Récupère l'activité quotidienne des enseignants (pour le graphique)
  const handleTeacherActiviyByDayClick = async () => {
    if (!userId || !startDate || !endDate) return;
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/teacher-activity-by-day`,
        {
          userId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }
      );
      navigate("/Graph", {
        state: {
          results: response.data,
          message: "Connexions des enseignants",
          userType: "teacher",
        },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération de l'activité quotidienne des enseignants"
      );
    }
  };

  // Récupère l'activité quotidienne des éditeurs (pour le graphique)
  const handleAdminActiviyByDayClick = async () => {
    if (!userId || !startDate || !endDate) return;
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/admin-activity-by-day`,
        {
          userId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }
      );
      navigate("/Graph", {
        state: {
          results: response.data,
          message: "Connexions des éditeurs",
          userType: "admin",
        },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération de l'activité quotidienne des éditeurs"
      );
    }
  };

  // Récupère l'activité quotidienne des autres utilisateurs (pour le graphique)
  const handleOtherActiviyByDayClick = async () => {
    if (!userId || !startDate || !endDate) return;
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/other-activity-by-day`,
        {
          userId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }
      );
      navigate("/Graph", {
        state: {
          results: response.data,
          message: "Connexions des autres",
          userType: "other",
        },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération de l'activité quotidienne des autres"
      );
    }
  };

  // Récupère la liste des cours publiés
  const handlePublishedCoursesClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/all-published-courses`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Publications" },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des publications");
    }
  };

  // Récupère la liste des brouillons de cours
  const handleDraftCoursesClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/all-drafted-courses`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Brouillons" },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des brouillons");
    }
  };

  // Récupère la liste des rendus des élèves
  const handleStudentSubmitionClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/all-student-submition`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Students submitions" },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des rendus des élèves");
    }
  };

  // Récupère la liste de tous les cours
  const handleTotalCoursesClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/all-courses`,
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

  // Récupère la liste de toutes les activités
  const handleTotalActivitiesClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/all-activities`,
        { userId }
      );
      navigate("/query-result", {
        state: {
          results: response.data.course_details,
          totalActivities: response.data.total_activities,
          message: `Total number of activities: ${response.data.total_activities}`,
        },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des activités totales");
    }
  };

  // Récupère la liste des événements utilisateur
  const handleUserEvent = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/all-user-event`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "User Events" },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des événements utilisateur");
    }
  };

  // Récupère la liste des badges utilisateur
  const handleBadgeClick = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/all-badge`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Badges de l'utilisateur" },
      });
    } catch (error) {
      setError("Erreur lors de la récupération des badges");
    }
  };

  // =========================
  // Départements (un handler par département)
  // =========================

  // Pour chaque département, la fonction récupère les publications associées
  const handleMathDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-maths`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Mathématiques" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département maths"
      );
    }
  };

  const handleLettresDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-lettres`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Lettres" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département lettres"
      );
    }
  };

  const handleAnglaisDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-anglais`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Anglais" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département anglais"
      );
    }
  };

  const handleShsphiloDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-shsphilo`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Philosophie et SHS" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département philosophie et SHS"
      );
    }
  };

  const handleDocumentationDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-documentation`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Documentation" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département documentation"
      );
    }
  };

  const handleHistgeoDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-histgeo`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Histoire-Géographie" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département histoire-géographie"
      );
    }
  };

  const handleEpsDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-eps`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "EPS" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département EPS"
      );
    }
  };

  const handleSvtDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-svt`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "SVT" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département SVT"
      );
    }
  };

  const handleEspagnolDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-espagnol`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Espagnol" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département espagnol"
      );
    }
  };

  const handleMusiqueDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-musique`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Musique" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département musique"
      );
    }
  };

  const handleAllemandDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-allemand`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Allemand" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département allemand"
      );
    }
  };

  const handleArtsPlastiquesDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-artsplastiques`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Arts Plastiques" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département arts plastiques"
      );
    }
  };

  const handleSpcDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-spc`,
        { userId }
      );
      navigate("/query-result", {
        state: {
          results: response.data,
          message: "Sciences Physiques et Chimie",
        },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département SPC"
      );
    }
  };

  const handleTechnoDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-techno`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Technologie" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département technologie"
      );
    }
  };

  const handleArchDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-arch`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Architecture" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département architecture"
      );
    }
  };

  const handleAshDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-ash`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "ASH" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département ASH"
      );
    }
  };

  const handleItalienDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-italien`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Italien" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département italien"
      );
    }
  };

  const handleEcogestionDepartement = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/departement-ecogestion`,
        { userId }
      );
      navigate("/query-result", {
        state: { results: response.data, message: "Économie et Gestion" },
      });
    } catch (error) {
      setError(
        "Erreur lors de la récupération des publications du département économie et gestion"
      );
    }
  };

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
