import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import StudentMainStats from "./StudentMainStats";
import StudentSecondaryStats from "./StudentSecondaryStats";
import { useDataHandlers } from "./StudentDataHandler";

// Récupération des variables d'environnement pour l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PORT = import.meta.env.VITE_PORT;

// Composant principal de la page d'accueil étudiant
const StudentHome = () => {
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
    console.error("Erreur StudentHome:", errorDetails);

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

        const [smallCoursesRes, smallProgressionRes, smallEventsRes, badgeRes] =
          await Promise.all([
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

        announceLoading("Vos données personnelles ont été chargées avec succès");
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

  // Calcul de la progression globale pour l'affichage
  const globalProgress =
    smallCourses.totalCourses > 0
      ? Math.round(
          (smallCourses.completedCourses / smallCourses.totalCourses) * 100
        )
      : 0;

  // Affichage de chargement initial
  if (isLoading && smallCourses.totalCourses === 0) {
    return (
      <div className="student-dashboard">
        <header className="dashboard-header">
          <h1 id="main-title" tabIndex="-1">
            Tableau de Bord Étudiant
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
    <div className="student-dashboard">
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
          Tableau de Bord Étudiant
        </h1>

        <div className="dashboard-subtitle">
          <p>
            Votre progression et vos activités sur la plateforme d'apprentissage
            Moodle
          </p>
          <div className="user-context" aria-label="Informations utilisateur">
            <span>
              Connecté en tant que :{" "}
              <strong>{userRole || "Étudiant"}</strong>
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
        {/* Vue d'ensemble rapide */}
        <section
          className="overview-section"
          aria-labelledby="overview-title"
          role="region"
        >
          <h2 id="overview-title" className="overview-title">
            Vue d'ensemble de votre progression
          </h2>

          <div className="overview-cards" aria-describedby="overview-description">
            <p id="overview-description" className="sr-only">
              Résumé rapide de votre progression dans les cours et activités.
            </p>

            {/* Carte de progression globale */}
            <div
              className="overview-card overview-card--progress"
              aria-labelledby="global-progress-title"
            >
              <h3 id="global-progress-title" className="card-title">
                <span className="card-icon" aria-hidden="true">
                  📊
                </span>
                Progression Globale
              </h3>
              <div className="progress-summary">
                <div
                  className="progress-circle"
                  role="img"
                  aria-label={`Progression : ${globalProgress} pour cent`}
                >
                  <span className="progress-percentage">{globalProgress}%</span>
                </div>
                <dl className="progress-details">
                  <div className="progress-detail">
                    <dt>Cours terminés :</dt>
                    <dd>
                      {smallCourses.completedCourses}/{smallCourses.totalCourses}
                    </dd>
                  </div>
                  <div className="progress-detail">
                    <dt>Activités :</dt>
                    <dd>
                      {smallProgression.overallCompletionPercentage || 0}%
                      terminées
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Carte d'activité récente */}
            <div
              className="overview-card overview-card--activity"
              aria-labelledby="recent-activity-title"
            >
              <h3 id="recent-activity-title" className="card-title">
                <span className="card-icon" aria-hidden="true">
                  ⚡
                </span>
                Activité Récente
              </h3>
              <dl className="activity-summary">
                <div className="activity-stat">
                  <dt>Cours en cours :</dt>
                  <dd className="stat-value stat-value--ongoing">
                    {smallCourses.ongoingCourses}
                  </dd>
                </div>
                <div className="activity-stat">
                  <dt>Événements à venir :</dt>
                  <dd className="stat-value stat-value--upcoming">
                    {smallEvents.upcomingEventsCount}
                  </dd>
                </div>
                <div className="activity-stat">
                  <dt>Badges obtenus :</dt>
                  <dd className="stat-value stat-value--badges">
                    {badge?.length || 0}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Section des statistiques détaillées */}
        <section
          className="detailed-stats-section"
          aria-labelledby="detailed-stats-title"
          role="region"
        >
          <h2 id="detailed-stats-title" className="stats-section-title">
            Vos Statistiques Détaillées
          </h2>

          <div aria-describedby="detailed-stats-description" className="stats-container">
            <p id="detailed-stats-description" className="sr-only">
              Informations détaillées sur votre progression dans les cours,
              vos activités, événements et récompenses obtenus.
            </p>

            {/* Statistiques principales (cours et activités) */}
            <div className="main-stats-container">
              <h3 id="main-stats-subtitle" className="sr-only">
                Vos cours et progression
              </h3>
              <StudentMainStats
                smallCourses={smallCourses}
                smallProgression={smallProgression}
                handlers={handlers}
              />
            </div>

            {/* Statistiques secondaires (événements, badges) */}
            <div className="secondary-stats-container">
              <h3 id="secondary-stats-subtitle" className="sr-only">
                Vos événements et récompenses
              </h3>
              <StudentSecondaryStats
                smallEvents={smallEvents}
                badge={badge}
                handlers={handlers}
              />
            </div>
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
          <div className="footer-stats">
            <p>
              <strong>Votre progression :</strong> {globalProgress}% de vos cours
              terminés
            </p>
            <p>
              <strong>Dernière activité :</strong>
              <time dateTime={new Date().toISOString()}>
                {new Date().toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </p>
          </div>

          {/* Encouragement personnalisé */}
          <div className="motivation-message" aria-live="polite">
            {globalProgress >= 80 && (
              <p className="motivation motivation--excellent">
                🎉 Excellent travail ! Vous êtes sur la bonne voie pour terminer
                tous vos cours.
              </p>
            )}
            {globalProgress >= 50 && globalProgress < 80 && (
              <p className="motivation motivation--good">
                👍 Bon rythme ! Continuez ainsi pour atteindre vos objectifs.
              </p>
            )}
            {globalProgress < 50 && smallCourses.totalCourses > 0 && (
              <p className="motivation motivation--encourage">
                💪 Vous avez commencé votre parcours, continuez à votre rythme !
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentHome;
