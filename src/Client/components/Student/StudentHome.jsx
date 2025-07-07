import React, { useState, useEffect } from "react";
import axios from "axios";
import StudentMainStats from "./StudentMainStats";
import StudentSecondaryStats from "./StudentSecondaryStats";
import { useDataHandlers } from "./StudentDataHandler";

// Récupération des variables d'environnement pour l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PORT = import.meta.env.VITE_PORT;

// Composant principal de la page d'accueil étudiant
const StudentHome = () => {
  // States pour stocker les statistiques principales et secondaires
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
  const [error, setError] = useState(null);

  // Récupère l'identifiant utilisateur depuis le localStorage
  const userId = localStorage.getItem("userId");

  // Centralisation des handlers pour les actions sur les stats (voir StudentDataHandler.jsx)
  const handlers = useDataHandlers({
    API_BASE_URL,
    PORT,
    userId,
    setError,
  });

  // Récupère toutes les données utilisateur au chargement du composant
  useEffect(() => {
    if (!userId) return;
    const fetchAllData = async () => {
      try {
        const [smallCoursesRes, smallProgressionRes, smallEventsRes, badgeRes] =
          await Promise.all([
            axios.post(`${API_BASE_URL}:${PORT}/api/user-small-courses`, {
              userId,
            }),
            axios.post(`${API_BASE_URL}:${PORT}/api/user-small-progression`, {
              userId,
            }),
            axios.post(`${API_BASE_URL}:${PORT}/api/upcoming-events-count`, {
              userId,
            }),
            axios.post(`${API_BASE_URL}:${PORT}/api/user-badge`, { userId }),
          ]);
        setSmallCourses(smallCoursesRes.data);
        setSmallProgression(smallProgressionRes.data);
        setSmallEvents({
          upcomingEventsCount: smallEventsRes.data.upcomingEventsCount,
        });
        setBadge(badgeRes.data);
      } catch (err) {
        setError("Erreur lors de la récupération des données");
        console.error(err);
      }
    };
    fetchAllData();
  }, [userId, API_BASE_URL, PORT]);

  return (
    <main>
      {/* Titre principal du tableau de bord étudiant */}
      <h1 id="main-title">Tableau de bord étudiant</h1>
      <section className="stats" aria-labelledby="main-title">
        {/* Statistiques principales (cours et activités) */}
        <h2 id="main-stats-title" className="sr-only">
          Statistiques principales
        </h2>
        <StudentMainStats
          smallCourses={smallCourses}
          smallProgression={smallProgression}
          handlers={handlers}
        />
        {/* Statistiques secondaires (événements, badges) */}
        <h2 id="secondary-stats-title" className="sr-only">
          Autres statistiques
        </h2>
        <StudentSecondaryStats
          smallEvents={smallEvents}
          badge={badge}
          handlers={handlers}
        />
      </section>
      {/* Affichage des erreurs éventuelles */}
      {error && (
        <div role="alert" aria-live="assertive" style={{ color: "red" }}>
          {error}
        </div>
      )}
    </main>
  );
};

export default StudentHome;
