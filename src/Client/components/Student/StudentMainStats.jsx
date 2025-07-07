import React from "react";

// Composant d'affichage des statistiques principales pour l'étudiant
const StudentMainStats = ({ smallCourses, smallProgression, handlers }) => (
  <section className="main-item" aria-labelledby="student-main-stats-title">
    {/* Titre de la section */}
    <h2 id="student-main-stats-title" className="stat-value">
      Mes Statistiques
    </h2>
    {/* Liste des statistiques principales avec boutons d'action */}
    <ul className="stats-list" aria-label="Statistiques principales">
      {/* Statistique sur les cours suivis (complétés/total) */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleTotalCoursesClick}
        >
          <span className="stat-label">Cours suivis</span>
          <span className="stat-value">
            {smallCourses.completedCourses}/{smallCourses.totalCourses}
          </span>
        </button>
      </li>
      {/* Statistique sur les activités complétées (complétées/total) */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleTotalActivitiesClick}
        >
          <span className="stat-label">Activités complétées</span>
          <span className="stat-value">
            {smallProgression.totalActivities -
              smallProgression.uncompleteActivities}
            /{smallProgression.totalActivities}
          </span>
        </button>
      </li>
    </ul>
  </section>
);

export default StudentMainStats;
