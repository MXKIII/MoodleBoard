import React from "react";

// Composant d'affichage des statistiques secondaires pour l'admin
const SecondaryStats = ({
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
    role="region"
    aria-labelledby="secondary-stats-title"
    aria-describedby="secondary-stats-description"
  >
    <header className="stats-header">
      <h2 id="secondary-stats-title" className="stat-value">
        Suivi général des contenus et activités
      </h2>
      <p id="secondary-stats-description" className="sr-only">
        Statistiques détaillées sur les publications, rendus, cours et événements de la plateforme
      </p>
    </header>

    {/* Liste des statistiques secondaires */}
    <nav aria-labelledby="secondary-nav-title">
      <h3 id="secondary-nav-title" className="sr-only">Navigation des statistiques de contenu</h3>
      
      <ul className="stats-list" role="list" aria-label="Statistiques secondaires de contenu et activité">
        {/* Section Publications */}
        <li className="stat-list-item stat-list-item--section" role="listitem">
          <header>
            <h4 className="stat-section-title">Publications et contenus</h4>
          </header>
        </li>

        {/* Nombre de cours publiés */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="published-courses-title">
            <header>
              <h5 id="published-courses-title" className="sr-only">Cours publiés</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handlePublishedCoursesClick}
              aria-describedby="published-courses-desc"
            >
              <span className="stat-label" id="published-courses-desc">
                Nombre de cours publiés et accessibles aux utilisateurs
              </span>
              <data className="stat-value" value={publication.publishedCourses}>
                {publication.publishedCourses}
              </data>
            </button>
          </article>
        </li>

        {/* Nombre de brouillons de cours */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="draft-courses-title">
            <header>
              <h5 id="draft-courses-title" className="sr-only">Brouillons de cours</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleDraftCoursesClick}
              aria-describedby="draft-courses-desc"
            >
              <span className="stat-label" id="draft-courses-desc">
                Nombre de cours en cours de rédaction (brouillons)
              </span>
              <data className="stat-value" value={publication.draftCourses}>
                {publication.draftCourses}
              </data>
            </button>
          </article>
        </li>

        {/* Section Activité des étudiants */}
        <li className="stat-list-item stat-list-item--section" role="listitem">
          <header>
            <h4 className="stat-section-title">Activité des étudiants</h4>
          </header>
        </li>

        {/* Nombre de rendus d'élèves */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="student-submissions-title">
            <header>
              <h5 id="student-submissions-title" className="sr-only">Rendus des étudiants</h5>
            </header>
            
            <button
              type="button"
              className="stat-large-item"
              onClick={handlers.handleStudentSubmitionClick}
              aria-describedby="student-submissions-desc"
            >
              <span className="stat-label" id="student-submissions-desc">
                Nombre total de travaux rendus par les étudiants
              </span>
              <data className="stat-value" value={submition.rowNum}>
                {submition.rowNum}
              </data>
            </button>
          </article>
        </li>

        {/* Section Progression pédagogique */}
        <li className="stat-list-item stat-list-item--section" role="listitem">
          <header>
            <h4 className="stat-section-title">Progression pédagogique</h4>
          </header>
        </li>

        {/* Complétion des cours (terminés/total) */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="course-completion-title">
            <header>
              <h5 id="course-completion-title" className="sr-only">Complétion des cours</h5>
            </header>
            
            <button
              type="button"
              className="stat-large-item"
              onClick={handlers.handleTotalCoursesClick}
              aria-describedby="course-completion-desc"
            >
              <span className="stat-label" id="course-completion-desc">
                Progression des cours : cours terminés sur total des cours
              </span>
              <div className="stat-value" role="img" aria-label={`${smallCourses.completedCourses} cours terminés sur ${smallCourses.totalCourses} cours au total`}>
                <data value={smallCourses.completedCourses}>{smallCourses.completedCourses}</data>
                <span aria-hidden="true">/</span>
                <data value={smallCourses.totalCourses}>{smallCourses.totalCourses}</data>
              </div>
            </button>
          </article>
        </li>

        {/* Complétion des activités (terminées/total) */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="activity-completion-title">
            <header>
              <h5 id="activity-completion-title" className="sr-only">Complétion des activités</h5>
            </header>
            
            <button
              type="button"
              className="stat-large-item"
              onClick={handlers.handleTotalActivitiesClick}
              aria-describedby="activity-completion-desc"
            >
              <span className="stat-label" id="activity-completion-desc">
                Progression des activités : activités terminées sur total des activités
              </span>
              <div className="stat-value" role="img" aria-label={`${smallProgression.totalActivities - smallProgression.uncompleteActivities} activités terminées sur ${smallProgression.totalActivities} activités au total`}>
                <data value={smallProgression.totalActivities - smallProgression.uncompleteActivities}>
                  {smallProgression.totalActivities - smallProgression.uncompleteActivities}
                </data>
                <span aria-hidden="true">/</span>
                <data value={smallProgression.totalActivities}>{smallProgression.totalActivities}</data>
              </div>
            </button>
          </article>
        </li>

        {/* Section Événements et récompenses */}
        <li className="stat-list-item stat-list-item--section" role="listitem">
          <header>
            <h4 className="stat-section-title">Événements et récompenses</h4>
          </header>
        </li>

        {/* Nombre d'événements à venir */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="upcoming-events-title">
            <header>
              <h5 id="upcoming-events-title" className="sr-only">Événements à venir</h5>
            </header>
            
            <button
              type="button"
              className="stat-large-item"
              onClick={handlers.handleUserEvent}
              aria-describedby="upcoming-events-desc"
            >
              <span className="stat-label" id="upcoming-events-desc">
                Nombre d'événements programmés à venir sur la plateforme
              </span>
              <data className="stat-value" value={smallEvents.upcomingEventsCount}>
                {smallEvents.upcomingEventsCount}
              </data>
            </button>
          </article>
        </li>

        {/* Nombre de badges obtenus */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="badges-title">
            <header>
              <h5 id="badges-title" className="sr-only">Badges obtenus</h5>
            </header>
            
            <button
              type="button"
              className="stat-large-item"
              onClick={handlers.handleBadgeClick}
              aria-describedby="badges-desc"
            >
              <span className="stat-label" id="badges-desc">
                Nombre total de badges attribués aux utilisateurs
              </span>
              <data className="stat-value" value={badge.length}>
                {badge.length}
              </data>
            </button>
          </article>
        </li>
      </ul>
    </nav>
  </section>
);

export default SecondaryStats;
