import React from "react";

// Composant d'affichage des statistiques secondaires pour l'étudiant
const StudentSecondaryStats = ({ smallEvents, badge, handlers }) => (
  <section
    className="secondary-item"
    aria-labelledby="student-secondary-stats-title"
  >
    {/* Titre de la section */}
    <h2 id="student-secondary-stats-title" className="stat-value">
      Autres statistiques
    </h2>
    {/* Liste des statistiques secondaires avec boutons d'action */}
    <ul className="stats-list" aria-label="Statistiques secondaires">
      {/* Nombre d'événements à venir */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
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
          className="stat-item"
          onClick={handlers.handleBadgeClick}
        >
          <span className="stat-label">Badges obtenus</span>
          <span className="stat-value">{badge.length}</span>
        </button>
      </li>
    </ul>
  </section>
);

export default StudentSecondaryStats;
