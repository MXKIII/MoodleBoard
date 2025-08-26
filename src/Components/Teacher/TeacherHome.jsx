import React, { useState, useEffect, useCallback, useRef } from "react";
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
  // Refs pour la gestion du focus et de l'accessibilité
  const mainTitleRef = useRef(null);
  const errorRef = useRef(null);
  const loadingAnnouncerRef = useRef(null);

  // States pour la gestion des erreurs et des états de chargement
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Récupère l'identifiant et le rôle utilisateur depuis le localStorage
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  // States pour la gestion des dates de filtre
  const [startDate, setStartDate] = useState(new Date("2025-01-01"));
  const [endDate, setEndDate] = useState(new Date("2025-03-31"));

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

  // Fonction pour annoncer les changements de chargement
  const announceLoading = useCallback((message) => {
    setLoadingMessage(message);
    // Force la lecture par les lecteurs d'écran
    if (loadingAnnouncerRef.current) {
      loadingAnnouncerRef.current.textContent = message;
    }
  }, []);

  // Fonction pour gérer les erreurs de manière accessible
  const handleError = useCallback((errorMessage, errorDetails = null) => {
    setError(errorMessage);
    console.error("Erreur TeacherHome:", errorDetails);

    // Focus sur le message d'erreur pour l'accessibilité
    setTimeout(() => {
      if (errorRef.current) {
        errorRef.current.focus();
      }
    }, 100);
  }, []);

  // Centralisation des handlers pour les actions sur les stats
  const handlers = useDataHandlers({
    API_BASE_URL,
    PORT,
    userId,
    setError: handleError,
    startDate,
    endDate,
    announceLoading,
  });

  // Récupère toutes les données utilisateur au chargement du composant
  useEffect(() => {
    if (!userId) {
      handleError("Utilisateur non identifié. Veuillez vous reconnecter.");
      setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        announceLoading("Chargement de vos données personnelles...");


        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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
 
          axios.post(
            `${API_BASE_URL}/api/user-activity`,
            { userId },
            config
          ),
          axios.post(
            `${API_BASE_URL}/api/publication`,
            { userId },
            config
          ),
          axios.post(
            `${API_BASE_URL}/api/submition`,
            { userId },
            config
          ),
          axios.post(
            `${API_BASE_URL}/api/user-small-courses`,
            {
              userId,
            },
            config
          ),
          axios.post(
            `${API_BASE_URL}/api/user-small-progression`,
            {
              userId,
            },
            config
          ),
          axios.post(
            `${API_BASE_URL}/api/upcoming-events-count`,
            {
              userId,
            },
            config
          ),
          axios.post(
            `${API_BASE_URL}/api/user-badge`,
            { userId },
            config
          ),
        ]);

        // Mise à jour des états avec validation des données
        setActivity(activityRes.data || {});
        setPublication(
          publicationRes.data || {
            publishedCourses: 0,
            draftCourses: 0,
            publication: [],
          }
        );
        setSubmition(submitionRes.data || { rowNum: 0, submition: [] });
        setSmallCourses(
          smallCoursesRes.data || {
            totalCourses: 0,
            completedCourses: 0,
            ongoingCourses: 0,
            smallCourses: [],
          }
        );
        setSmallProgression(
          smallProgressionRes.data || {
            totalActivities: 0,
            overallCompletionPercentage: 0,
            uncompleteActivities: 0,
          }
        );
        setSmallEvents({
          upcomingEventsCount: smallEventsRes.data?.upcomingEventsCount || 0,
        });
        setBadge(badgeRes.data || []);

        announceLoading("Données personnelles chargées avec succès");
        setError(null);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          "Erreur lors de la récupération de vos données";
        handleError(errorMessage, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [userId, API_BASE_URL, PORT, announceLoading, handleError]);


  const fetchActivityData = useCallback(async () => {
    if (!userId || !startDate || !endDate) return;

    try {
      announceLoading("Mise à jour des statistiques pour la période sélectionnée...");


      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/user-activity`,
        {
          userId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
        config
      );

      setActivity(response.data || {});
      announceLoading("Statistiques mises à jour avec succès");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Erreur lors de la récupération des données pour la période sélectionnée";
      handleError(errorMessage, err);
    }
  }, [userId, startDate, endDate, API_BASE_URL, PORT, announceLoading, handleError]);

  // Gère le changement de date et met à jour les données filtrées
  const handleDateChange = useCallback(() => {
    if (startDate && endDate) {
      // Validation des dates
      if (startDate > endDate) {
        handleError("La date de début ne peut pas être supérieure à la date de fin");
        return;
      }

      fetchActivityData();

      // Sauvegarde des dates sélectionnées
      try {
        localStorage.removeItem("startDate");
        localStorage.removeItem("endDate");
        localStorage.setItem("startDate", startDate.toISOString().split("T")[0]);
        localStorage.setItem("endDate", endDate.toISOString().split("T")[0]);
      } catch (storageError) {
        console.warn("Impossible de sauvegarder les dates:", storageError);
      }
    }
  }, [startDate, endDate, fetchActivityData, handleError]);

  // Met à jour les données à chaque changement de date (avec debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleDateChange();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [handleDateChange]);

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Alt + R : Rafraîchir les données
      if (event.altKey && event.key === "r") {
        event.preventDefault();
        announceLoading("Actualisation de vos données...");
        window.location.reload();
      }

      // Alt + H : Retour au titre principal
      if (event.altKey && event.key === "h") {
        event.preventDefault();
        if (mainTitleRef.current) {
          mainTitleRef.current.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [announceLoading]);

  // Affichage de chargement initial
  if (isLoading && Object.keys(activity).every((key) => activity[key] === 0)) {
    return (
      <div className="teacher-dashboard">
        <header className="dashboard-header">
          <h1 id="main-title" tabIndex="-1">
            Tableau de Bord Enseignant
          </h1>
          <p className="dashboard-subtitle">Chargement en cours...</p>
        </header>

        <main role="main">
          <div
            className="loading-state"
            role="status"
            aria-live="polite"
            aria-label="Chargement de vos données en cours"
          >
            <div className="loading-spinner" aria-hidden="true"></div>
            <span>Chargement de vos statistiques personnelles...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      {/* Annonceur pour les lecteurs d'écran */}
      <div
        ref={loadingAnnouncerRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {loadingMessage}
      </div>

      {/* Navigation d'évitement */}
      <a
        href="#main-content"
        className="skip-to-content"
        onFocus={(e) => e.target.classList.add("focused")}
        onBlur={(e) => e.target.classList.remove("focused")}
      >
        Aller au contenu principal
      </a>

      {/* En-tête principal avec informations contextuelles */}
      <header className="dashboard-header" role="banner">
        <h1
          id="main-title"
          ref={mainTitleRef}
          tabIndex="-1"
          className="dashboard-title"
        >
          Tableau de Bord Enseignant
        </h1>

        <div className="dashboard-subtitle">
          <p>
            Vos statistiques d'activité et de publication sur la plateforme Moodle
          </p>
          <div className="user-context" aria-label="Informations utilisateur">
            <span>
              Connecté en tant que :{" "}
              <strong>{userRole || "Enseignant"}</strong>
            </span>
            <span aria-hidden="true"> • </span>
            <span>
              Utilisateur : <strong>{userId}</strong>
            </span>
          </div>
        </div>

        {/* Raccourcis clavier */}
        <details className="keyboard-shortcuts">
          <summary>Raccourcis clavier disponibles</summary>
          <dl>
            <dt>
              <kbd>Alt</kbd> + <kbd>R</kbd>
            </dt>
            <dd>Actualiser vos données</dd>
            <dt>
              <kbd>Alt</kbd> + <kbd>H</kbd>
            </dt>
            <dd>Retourner au titre principal</dd>
          </dl>
        </details>

        {/* Gestion des erreurs accessible */}
        {error && (
          <div
            ref={errorRef}
            className="error-banner"
            role="alert"
            aria-live="assertive"
            tabIndex="-1"
          >
            <div className="error-content">
              <span className="error-icon" aria-hidden="true">
                ⚠️
              </span>
              <span className="error-message">{error}</span>
              <button
                type="button"
                className="error-dismiss"
                onClick={() => setError(null)}
                aria-label="Fermer le message d'erreur"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Contenu principal */}
      <main id="main-content" role="main" aria-labelledby="main-title">
        {/* Section des statistiques */}
        <section
          className="stats"
          aria-labelledby="stats-section-title"
          role="region"
        >
          <h2 id="stats-section-title" className="sr-only">
            Vos statistiques d'activité sur la plateforme
          </h2>

          <div aria-describedby="stats-description" className="stats-container">
            <p id="stats-description" className="sr-only">
              Cette section présente vos statistiques personnelles d'utilisation,
              vos publications, rendus et progression, avec possibilité de filtrage
              par période.
            </p>

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
          </div>
        </section>
      </main>

      {/* Indicateur de chargement global */}
      {isLoading && (
        <div
          className="global-loading-overlay"
          role="status"
          aria-live="polite"
          aria-label="Mise à jour de vos données en cours"
        >
          <div className="loading-content">
            <div className="loading-spinner" aria-hidden="true"></div>
            <span>{loadingMessage || "Chargement..."}</span>
          </div>
        </div>
      )}

      {/* Pied de page avec informations contextuelles */}
      <footer className="dashboard-footer" role="contentinfo">
        <div className="footer-content">
          <p>
            Dernière mise à jour :
            <time dateTime={new Date().toISOString()}>
              {new Date().toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </p>
          <p className="data-period">
            Période analysée : du{" "}
            <time dateTime={startDate?.toISOString()}>
              {startDate?.toLocaleDateString("fr-FR")}
            </time>
            {" "}au{" "}
            <time dateTime={endDate?.toISOString()}>
              {endDate?.toLocaleDateString("fr-FR")}
            </time>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TeacherHome;
