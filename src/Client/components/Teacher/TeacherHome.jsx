import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import TeacherMainStats from "./TeacherMainStats";
import TeacherSecondaryStats from "./TeacherSecondaryStats";
import { useDataHandlers } from "./TeacherDataHandler";

// Récupération des variables d'environnement
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PORT = import.meta.env.VITE_PORT;

// Composant principal de la page d'accueil enseignant
const TeacherHome = () => {
  // States pour stocker les différentes statistiques et données utilisateur
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
  const [error, setError] = useState(null);

  // Récupère l'identifiant utilisateur depuis le localStorage
  const userId = localStorage.getItem("userId");

  // States pour la gestion des dates de filtre
  const [startDate, setStartDate] = useState(new Date("2025-01-01"));
  const [endDate, setEndDate] = useState(new Date("2025-03-31"));

  // Centralisation des handlers pour les actions sur les stats (voir TeacherDataHandler.jsx)
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
    if (!userId) return;
    const fetchAllData = async () => {
      try {
        const [
          activityRes,
          publicationRes,
          submitionRes,
          smallCoursesRes,
          smallProgressionRes,
          smallEventsRes,
          badgeRes,
        ] = await Promise.all([
          axios.post(`${API_BASE_URL}:${PORT}/api/user-activity`, { userId }),
          axios.post(`${API_BASE_URL}:${PORT}/api/publication`, { userId }),
          axios.post(`${API_BASE_URL}:${PORT}/api/submition`, { userId }),
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
        setActivity(activityRes.data);
        setPublication(publicationRes.data);
        setSubmition(submitionRes.data);
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

  // Récupère les statistiques principales selon la période sélectionnée
  const fetchActivityData = async () => {
    if (!userId || !startDate || !endDate) return;
    try {
      const response = await axios.post(
        `${API_BASE_URL}:${PORT}/api/user-activity`,
        {
          userId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }
      );
      setActivity(response.data);
    } catch (err) {
      setError("Erreur lors de la récupération des données");
      console.error(err);
    }
  };

  // Gère le changement de date et met à jour les données filtrées
  const handleDateChange = useCallback(() => {
    if (startDate && endDate) {
      fetchActivityData();
      localStorage.removeItem("startDate");
      localStorage.removeItem("endDate");
      localStorage.setItem("startDate", startDate.toISOString().split("T")[0]);
      localStorage.setItem("endDate", endDate.toISOString().split("T")[0]);
    }
  }, [startDate, endDate]);

  // Met à jour les données à chaque changement de date
  useEffect(() => {
    handleDateChange();
  }, [handleDateChange]);

  return (
    <main>
      <section className="stats" aria-labelledby="main-title">
        {/* Statistiques principales (effectifs, activité, etc.) */}
        <TeacherMainStats
          activity={activity}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          handlers={handlers}
        />
        {/* Statistiques secondaires (publications, rendus, progression, etc.) */}
        <TeacherSecondaryStats
          publication={publication}
          submition={submition}
          smallCourses={smallCourses}
          smallProgression={smallProgression}
          smallEvents={smallEvents}
          badge={badge}
          handlers={handlers}
        />
      </section>
    </main>
  );
};

export default TeacherHome;
