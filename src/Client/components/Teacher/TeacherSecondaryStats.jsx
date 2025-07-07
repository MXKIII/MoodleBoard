import React from "react";

// Composant d'affichage des statistiques secondaires pour l'enseignant
const TeacherSecondaryStats = ({
  publication,
  submition,
  smallCourses,
  smallProgression,
  smallEvents,
  badge,
  handlers,
}) => (
  <section
    className="secondary-item"
    aria-labelledby="teacher-secondary-stats-title"
  >
    {/* Titre de la section */}
    <h2 id="teacher-secondary-stats-title" className="stat-value">
      Suivi personnel
    </h2>
    {/* Liste des statistiques secondaires avec boutons d'action */}
    <ul className="stats-list" aria-label="Statistiques secondaires">
      {/* Nombre de cours publiés */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handlePublishedCoursesClick}
        >
          <span className="stat-label">Publications</span>
          <span className="stat-value">{publication.publishedCourses}</span>
        </button>
      </li>
      {/* Nombre de brouillons de cours */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleDraftCoursesClick}
        >
          <span className="stat-label">Brouillons</span>
          <span className="stat-value">{publication.draftCourses}</span>
        </button>
      </li>
      {/* Nombre de rendus d'élèves */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-large-item"
          onClick={handlers.handleStudentSubmitionClick}
        >
          <span className="stat-label">Nombre de rendu</span>
          <span className="stat-value">{submition.rowNum}</span>
        </button>
      </li>
      {/* Complétion des cours (terminés/total) */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-large-item"
          onClick={handlers.handleTotalCoursesClick}
        >
          <span className="stat-label">Complétion des cours</span>
          <span className="stat-value">
            {smallCourses.completedCourses}/{smallCourses.totalCourses}
          </span>
        </button>
      </li>
      {/* Complétion des activités (terminées/total) */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-large-item"
          onClick={handlers.handleTotalActivitiesClick}
        >
          <span className="stat-label">Complétion des activités</span>
          <span className="stat-value">
            {smallProgression.totalActivities -
              smallProgression.uncompleteActivities}
            /{smallProgression.totalActivities}
          </span>
        </button>
      </li>
      {/* Nombre d'événements à venir */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-large-item"
          onClick={handlers.handleUserEvent}
        >
          <span className="stat-label">Événements à venir</span>
          <span className="stat-value">{smallEvents.upcomingEventsCount}</span>
        </button>
      </li>
      {/* Nombre de badges obtenus */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-large-item"
          onClick={handlers.handleBadgeClick}
        >
          <span className="stat-label">Badges obtenus</span>
          <span className="stat-value">{badge.length}</span>
        </button>
      </li>
    </ul>
  </section>
);

export default TeacherSecondaryStats;
