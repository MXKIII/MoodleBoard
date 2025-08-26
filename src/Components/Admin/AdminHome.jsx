import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import MainStats from "./AdminMainStats";
import SecondaryStats from "./AdminSecondaryStats";
import DepartmentStats from "./DepartementStats";
import { useDataHandlers } from "./AdminDataHandlers";


// Page d'accueil administrateur : affiche les statistiques principales, secondaires et par département
const AdminHome = () => {
  // States pour la gestion des erreurs et des données utilisateur
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const PORT = import.meta.env.VITE_PORT;

  // States pour la gestion des dates de filtre
  const [startDate, setStartDate] = useState(new Date("2025-01-01"));
  const [endDate, setEndDate] = useState(new Date("2025-05-31"));

  // States pour les différentes statistiques et données affichées
  const [activity, setActivity] = useState({
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

  const [publication, setPublication] = useState({
    publishedCourses: 0,
    draftCourses: 0,
    publication: [],
  });

  const [submition, setSubmition] = useState({
    rowNum: 0,
    submition: [],
  });

  const [smallCourses, setSmallCourses] = useState({
    totalCourses: 0,
    completedCourses: 0,
    ongoingCourses: 0,
    smallCourses: [],
  });

  const [smallProgression, setSmallProgression] = useState({
    totalActivities: 0,
    overallCompletionPercentage: 0,
    uncompleteActivities: 0,
  });

  const [smallEvents, setSmallEvents] = useState({
    upcomingEventsCount: 0,
  });

  const [badge, setBadge] = useState([]);

  const [departement, setDepartment] = useState({
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

  // Centralisation des handlers pour les actions sur les stats (voir AdminDataHandlers.jsx)
  const handlers = useDataHandlers({
    API_BASE_URL,
    PORT,
    userId,
    setError,
    startDate,
    endDate,
  });

  // Récupère toutes les données utilisateur au chargement du composant
  useEffect(() => {
    if (!userId) {
      setError("Utilisateur non identifié");
      setLoading(false);
      return;
    }

    const fetchAllUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // AJOUTEZ cette configuration avec le token
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

        const [
          activityRes,
          publicationRes,
          submitionRes,
          smallCoursesRes,
          smallProgressionRes,
          smallEventsRes,
          badgeRes,
        ] = await Promise.all([
          axios.post(`${API_BASE_URL}/api/user-activity`, { userId }, config),
          axios.post(`${API_BASE_URL}/api/all-publications`, { userId }, config),
          axios.post(`${API_BASE_URL}/api/all-submition`, { userId }, config),
          axios.post(`${API_BASE_URL}/api/all-small-courses`, { userId }, config),
          axios.post(`${API_BASE_URL}/api/all-small-progression`, { userId }, config),
          axios.post(`${API_BASE_URL}/api/all-upcoming-events-count`, { userId }, config),
          axios.post(`${API_BASE_URL}/api/all-badge`, { userId }, config),
        ]);

        setActivity(activityRes.data);
        setPublication(publicationRes.data);
        setSubmition(submitionRes.data);
        setSmallCourses(smallCoursesRes.data);
        setSmallProgression(smallProgressionRes.data);
        setSmallEvents({ upcomingEventsCount: smallEventsRes.data.upcomingEventsCount });
        setBadge(badgeRes.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 
                           "Erreur lors de la récupération des données utilisateur";
        setError(errorMessage);
        console.error("Erreur de récupération des données:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUserData();
  }, [userId, API_BASE_URL, PORT]);

  // Récupère les statistiques de publications par département
  useEffect(() => {
    const fetchDepartement = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };
        
        const response = await axios.post(`${API_BASE_URL}/api/departement`, {}, config);
        setDepartment(response.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 
                           "Erreur lors de la récupération des données des départements";
        setError(errorMessage);
        console.error("Erreur départements:", err);
      }
    };

    fetchDepartement();
  }, [API_BASE_URL, PORT]);

  // Récupère les statistiques principales selon la période sélectionnée
  const fetchActivityData = async () => {
    if (!userId || !startDate || !endDate) return;

    try {
      // AJOUTEZ le token ici aussi !
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/user-activity`, {
        userId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      }, config);
      setActivity(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         "Erreur lors de la récupération des données d'activité";
      setError(errorMessage);
      console.error("Erreur activité:", err);
    }
  };

  // Gère le changement de date et met à jour les données filtrées
  const handleDateChange = useCallback(() => {
    if (startDate && endDate) {
      fetchActivityData();
      localStorage.setItem("startDate", startDate.toISOString().split("T")[0]);
      localStorage.setItem("endDate", endDate.toISOString().split("T")[0]);
    }
  }, [startDate, endDate, userId, API_BASE_URL, PORT]);

  // Met à jour les données à chaque changement de date
  useEffect(() => {
    handleDateChange();
  }, [handleDateChange]);

  // Gestion du focus au chargement pour l'accessibilité
  useEffect(() => {
    const mainTitle = document.getElementById("admin-main-title");
    if (mainTitle) {
      mainTitle.focus();
    }
  }, []);

  // Affichage de l'état de chargement
  if (loading) {
    return (
      <main className="admin-home" role="main">
        <div 
          className="loading-container" 
          role="status" 
          aria-live="polite"
          aria-label="Chargement des données en cours"
        >
          <div className="loading-spinner" aria-hidden="true"></div>
          <p className="loading-text">Chargement des statistiques...</p>
          <span className="sr-only">Veuillez patienter pendant le chargement des données.</span>
        </div>
      </main>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <main className="admin-home" role="main">
        <div 
          className="error-container" 
          role="alert" 
          aria-live="assertive"
          tabIndex="0"
        >
          <h1 className="error-title">Erreur de chargement</h1>
          <p className="error-message">{error}</p>
          <button 
            className="error-retry"
            onClick={() => window.location.reload()}
            aria-label="Recharger la page pour réessayer"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-home" role="main">
      {/* En-tête de la page avec titre principal */}
      <header className="admin-header">
        <h1 
          id="admin-main-title" 
          className="admin-title"
          tabIndex="-1"
        >
          Tableau de bord administrateur
        </h1>
        <p className="admin-description">
          Vue d'ensemble des statistiques et activités de la plateforme éducative.
          Période sélectionnée : du {startDate.toLocaleDateString('fr-FR')} au {endDate.toLocaleDateString('fr-FR')}.
        </p>
      </header>

      {/* Navigation interne pour l'accessibilité */}
      <nav className="page-navigation" aria-label="Navigation dans la page">
        <h2 className="sr-only">Aller directement à :</h2>
        <ul className="nav-links">
          <li>
            <a href="#main-stats" className="nav-link">
              Statistiques principales
            </a>
          </li>
          <li>
            <a href="#secondary-stats" className="nav-link">
              Statistiques détaillées
            </a>
          </li>
          <li>
            <a href="#department-stats" className="nav-link">
              Statistiques par département
            </a>
          </li>
        </ul>
      </nav>

      {/* Section des statistiques principales */}
      <section 
        id="main-stats"
        className="main-stats-section" 
        aria-labelledby="main-stats-title"
        role="region"
      >
        <h2 id="main-stats-title" className="section-title">
          Statistiques principales
        </h2>
        <p className="section-description">
          Effectifs, activité des utilisateurs et répartition par profil.
        </p>
        
        <MainStats
          activity={activity}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          handlers={handlers}
        />
      </section>

      {/* Section des statistiques secondaires */}
      <section 
        id="secondary-stats"
        className="secondary-stats-section" 
        aria-labelledby="secondary-stats-title"
        role="region"
      >
        <h2 id="secondary-stats-title" className="section-title">
          Statistiques détaillées
        </h2>
        <p className="section-description">
          Publications, rendus, progression des cours et événements à venir.
        </p>
        
        <SecondaryStats
          publication={publication}
          submition={submition}
          smallCourses={smallCourses}
          smallProgression={smallProgression}
          smallEvents={smallEvents}
          badge={badge}
          handlers={handlers}
        />
      </section>

      {/* Section des statistiques par département */}
      <section 
        id="department-stats"
        className="department-stats-section" 
        aria-labelledby="department-stats-title"
        role="region"
      >
        <h2 id="department-stats-title" className="section-title">
          Statistiques par département
        </h2>
        <p className="section-description">
          Répartition des publications par discipline et département académique.
        </p>
        
        <DepartmentStats 
          departement={departement} 
          handlers={handlers} 
        />
      </section>

      {/* Zone de statut en direct pour les mises à jour */}
      <div 
        id="live-region" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {/* Les mises à jour dynamiques seront annoncées ici */}
      </div>
    </main>
  );
};

export default AdminHome;
