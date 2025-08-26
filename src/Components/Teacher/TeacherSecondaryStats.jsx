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
}) => {
  // Gestion des touches clavier pour les statistiques
  const handleStatKeyDown = (event, handler, statName) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler();
      
      // Annonce pour les lecteurs d'écran
      const announcement = `Consultation de vos données : ${statName}`;
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(announcement);
        utterance.volume = 0; // Silencieux pour éviter la pollution sonore
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Calcul des statistiques pour l'accessibilité
  const totalCompletedActivities = (smallProgression.totalActivities || 0) - (smallProgression.uncompleteActivities || 0);
  const activitiesCompletionRate = smallProgression.totalActivities > 0 
    ? Math.round((totalCompletedActivities / smallProgression.totalActivities) * 100) 
    : 0;
  
  const coursesCompletionRate = smallCourses.totalCourses > 0 
    ? Math.round((smallCourses.completedCourses / smallCourses.totalCourses) * 100) 
    : 0;

  return (
    <section
      className="secondary-stats-section"
      aria-labelledby="teacher-secondary-stats-title"
      role="region"
    >
      {/* En-tête de la section */}
      <header className="secondary-stats-header">
        <h2 id="teacher-secondary-stats-title" className="secondary-stats-title">
          Votre Suivi Personnel
        </h2>
        <p className="secondary-stats-description">
          Consultez vos publications, rendus à évaluer, progression des cours et événements à venir.
        </p>
      </header>

      {/* Contenu principal des statistiques */}
      <div className="secondary-stats-content">
        {/* Groupe : Publications et Contenus */}
        <div className="stats-group" aria-labelledby="publications-group-title">
          <h3 id="publications-group-title" className="stats-group-title">
            Publications et Contenus
          </h3>
          
          <ul className="stats-list" role="list" aria-labelledby="publications-group-title">
            {/* Cours publiés */}
            <li className="stat-list-item">
              <button
                type="button"
                className="stat-button stat-button--primary"
                onClick={handlers.handlePublishedCoursesClick}
                onKeyDown={(e) => handleStatKeyDown(e, handlers.handlePublishedCoursesClick, 'cours publiés')}
                aria-describedby="published-courses-desc"
              >
                <div className="stat-content">
                  <span className="stat-icon" aria-hidden="true">📚</span>
                  <div className="stat-info">
                    <span className="stat-label">Cours publiés</span>
                    <span className="stat-value">{publication.publishedCourses || 0}</span>
                  </div>
                </div>
                <div id="published-courses-desc" className="stat-description">
                  Vos cours actuellement accessibles aux étudiants
                </div>
              </button>
            </li>

            {/* Brouillons */}
            <li className="stat-list-item">
              <button
                type="button"
                className="stat-button stat-button--secondary"
                onClick={handlers.handleDraftCoursesClick}
                onKeyDown={(e) => handleStatKeyDown(e, handlers.handleDraftCoursesClick, 'brouillons de cours')}
                aria-describedby="draft-courses-desc"
              >
                <div className="stat-content">
                  <span className="stat-icon" aria-hidden="true">📝</span>
                  <div className="stat-info">
                    <span className="stat-label">Brouillons</span>
                    <span className="stat-value">{publication.draftCourses || 0}</span>
                  </div>
                </div>
                <div id="draft-courses-desc" className="stat-description">
                  Vos cours en cours de création ou modification
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* Groupe : Évaluation et Suivi */}
        <div className="stats-group" aria-labelledby="evaluation-group-title">
          <h3 id="evaluation-group-title" className="stats-group-title">
            Évaluation et Suivi
          </h3>
          
          <ul className="stats-list" role="list" aria-labelledby="evaluation-group-title">
            {/* Rendus à évaluer */}
            <li className="stat-list-item">
              <button
                type="button"
                className="stat-button stat-button--warning"
                onClick={handlers.handleStudentSubmitionClick}
                onKeyDown={(e) => handleStatKeyDown(e, handlers.handleStudentSubmitionClick, 'rendus à évaluer')}
                aria-describedby="submissions-desc"
              >
                <div className="stat-content">
                  <span className="stat-icon" aria-hidden="true">📋</span>
                  <div className="stat-info">
                    <span className="stat-label">Rendus à évaluer</span>
                    <span className="stat-value">{submition.rowNum || 0}</span>
                  </div>
                  {submition.rowNum > 0 && (
                    <span className="stat-badge stat-badge--pending" aria-label="En attente d'évaluation">
                      En attente
                    </span>
                  )}
                </div>
                <div id="submissions-desc" className="stat-description">
                  Travaux d'étudiants nécessitant votre évaluation
                </div>
              </button>
            </li>

            {/* Progression des cours */}
            <li className="stat-list-item">
              <button
                type="button"
                className="stat-button stat-button--progress"
                onClick={handlers.handleTotalCoursesClick}
                onKeyDown={(e) => handleStatKeyDown(e, handlers.handleTotalCoursesClick, 'progression des cours')}
                aria-describedby="courses-progress-desc"
              >
                <div className="stat-content">
                  <span className="stat-icon" aria-hidden="true">📈</span>
                  <div className="stat-info">
                    <span className="stat-label">Progression des cours</span>
                    <div className="stat-value-complex">
                      <span className="stat-fraction">
                        {smallCourses.completedCourses || 0}/{smallCourses.totalCourses || 0}
                      </span>
                      <span className="stat-percentage">({coursesCompletionRate}%)</span>
                    </div>
                  </div>
                  <div className="progress-bar" role="progressbar" 
                       aria-valuenow={coursesCompletionRate} 
                       aria-valuemin="0" 
                       aria-valuemax="100"
                       aria-label={`Progression des cours : ${coursesCompletionRate} pour cent`}>
                    <div className="progress-fill" style={{width: `${coursesCompletionRate}%`}}></div>
                  </div>
                </div>
                <div id="courses-progress-desc" className="stat-description">
                  Cours terminés par rapport au total de vos cours
                </div>
              </button>
            </li>

            {/* Progression des activités */}
            <li className="stat-list-item">
              <button
                type="button"
                className="stat-button stat-button--progress"
                onClick={handlers.handleTotalActivitiesClick}
                onKeyDown={(e) => handleStatKeyDown(e, handlers.handleTotalActivitiesClick, 'progression des activités')}
                aria-describedby="activities-progress-desc"
              >
                <div className="stat-content">
                  <span className="stat-icon" aria-hidden="true">⚡</span>
                  <div className="stat-info">
                    <span className="stat-label">Progression des activités</span>
                    <div className="stat-value-complex">
                      <span className="stat-fraction">
                        {totalCompletedActivities}/{smallProgression.totalActivities || 0}
                      </span>
                      <span className="stat-percentage">({activitiesCompletionRate}%)</span>
                    </div>
                  </div>
                  <div className="progress-bar" role="progressbar" 
                       aria-valuenow={activitiesCompletionRate} 
                       aria-valuemin="0" 
                       aria-valuemax="100"
                       aria-label={`Progression des activités : ${activitiesCompletionRate} pour cent`}>
                    <div className="progress-fill" style={{width: `${activitiesCompletionRate}%`}}></div>
                  </div>
                </div>
                <div id="activities-progress-desc" className="stat-description">
                  Activités terminées par rapport au total de vos activités
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* Groupe : Planning et Récompenses */}
        <div className="stats-group" aria-labelledby="planning-group-title">
          <h3 id="planning-group-title" className="stats-group-title">
            Planning et Récompenses
          </h3>
          
          <ul className="stats-list" role="list" aria-labelledby="planning-group-title">
            {/* Événements à venir */}
            <li className="stat-list-item">
              <button
                type="button"
                className="stat-button stat-button--info"
                onClick={handlers.handleUserEvent}
                onKeyDown={(e) => handleStatKeyDown(e, handlers.handleUserEvent, 'événements à venir')}
                aria-describedby="events-desc"
              >
                <div className="stat-content">
                  <span className="stat-icon" aria-hidden="true">📅</span>
                  <div className="stat-info">
                    <span className="stat-label">Événements à venir</span>
                    <span className="stat-value">{smallEvents.upcomingEventsCount || 0}</span>
                  </div>
                  {smallEvents.upcomingEventsCount > 0 && (
                    <span className="stat-badge stat-badge--upcoming" aria-label="Prochainement">
                      Prochainement
                    </span>
                  )}
                </div>
                <div id="events-desc" className="stat-description">
                  Événements et échéances programmés dans votre calendrier
                </div>
              </button>
            </li>

            {/* Badges obtenus */}
            <li className="stat-list-item">
              <button
                type="button"
                className="stat-button stat-button--success"
                onClick={handlers.handleBadgeClick}
                onKeyDown={(e) => handleStatKeyDown(e, handlers.handleBadgeClick, 'badges obtenus')}
                aria-describedby="badges-desc"
              >
                <div className="stat-content">
                  <span className="stat-icon" aria-hidden="true">🏆</span>
                  <div className="stat-info">
                    <span className="stat-label">Badges obtenus</span>
                    <span className="stat-value">{badge?.length || 0}</span>
                  </div>
                  {badge?.length > 0 && (
                    <span className="stat-badge stat-badge--achievement" aria-label="Réalisations">
                      Réussites
                    </span>
                  )}
                </div>
                <div id="badges-desc" className="stat-description">
                  Badges et récompenses que vous avez obtenus ou créés
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Résumé de progression global */}
      <footer className="secondary-stats-footer">
        <div className="global-summary" aria-labelledby="global-summary-title">
          <h3 id="global-summary-title" className="summary-title">
            Résumé Global
          </h3>
          <dl className="summary-list">
            <div className="summary-item">
              <dt>Total contenus créés :</dt>
              <dd>{(publication.publishedCourses || 0) + (publication.draftCourses || 0)}</dd>
            </div>
            <div className="summary-item">
              <dt>Travaux en attente :</dt>
              <dd>{submition.rowNum || 0}</dd>
            </div>
            <div className="summary-item">
              <dt>Progression moyenne :</dt>
              <dd>{Math.round((coursesCompletionRate + activitiesCompletionRate) / 2)}%</dd>
            </div>
          </dl>
        </div>
      </footer>
    </section>
  );
};

export default TeacherSecondaryStats;
