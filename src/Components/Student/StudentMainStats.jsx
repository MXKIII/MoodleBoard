import React from "react";

// Composant d'affichage des statistiques principales pour l'étudiant
const StudentMainStats = ({ smallCourses, smallProgression, handlers }) => {
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

  // Calculs pour l'accessibilité
  const completedActivities = (smallProgression.totalActivities || 0) - (smallProgression.uncompleteActivities || 0);
  const coursesCompletionRate = smallCourses.totalCourses > 0 
    ? Math.round((smallCourses.completedCourses / smallCourses.totalCourses) * 100) 
    : 0;
  const activitiesCompletionRate = smallProgression.totalActivities > 0 
    ? Math.round((completedActivities / smallProgression.totalActivities) * 100) 
    : 0;

  return (
    <section 
      className="student-main-stats" 
      aria-labelledby="student-main-stats-title"
      role="region"
    >
      {/* En-tête de la section */}
      <header className="stats-header">
        <h2 id="student-main-stats-title" className="stats-title">
          Votre Progression d'Apprentissage
        </h2>
        <p className="stats-description">
          Suivez votre avancement dans les cours et activités. Cliquez sur chaque élément pour voir le détail.
        </p>
      </header>

      {/* Liste des statistiques principales avec boutons d'action */}
      <ul 
        className="stats-list" 
        role="list"
        aria-labelledby="student-main-stats-title"
        aria-describedby="stats-instructions"
      >
        <div id="stats-instructions" className="sr-only">
          Liste de vos statistiques de progression. Appuyez sur Entrée ou Espace pour consulter les détails de chaque élément.
        </div>

        {/* Statistique sur les cours suivis */}
        <li className="stat-list-item">
          <button
            type="button"
            className="stat-button stat-button--courses"
            onClick={handlers.handleTotalCoursesClick}
            onKeyDown={(e) => handleStatKeyDown(e, handlers.handleTotalCoursesClick, 'tous vos cours')}
            aria-describedby="courses-description"
          >
            <div className="stat-content">
              <span className="stat-icon" aria-hidden="true">📚</span>
              <div className="stat-info">
                <span className="stat-label">Cours suivis</span>
                <span className="stat-value">
                  {smallCourses.completedCourses || 0}/{smallCourses.totalCourses || 0}
                </span>
                <span className="stat-percentage">({coursesCompletionRate}%)</span>
              </div>
              <div className="progress-bar" role="progressbar" 
                   aria-valuenow={coursesCompletionRate} 
                   aria-valuemin="0" 
                   aria-valuemax="100"
                   aria-label={`Progression des cours : ${coursesCompletionRate} pour cent`}>
                <div className="progress-fill" style={{width: `${coursesCompletionRate}%`}}></div>
              </div>
            </div>
            <div id="courses-description" className="stat-description">
              Nombre de cours terminés par rapport au total de vos inscriptions
            </div>
          </button>
        </li>

        {/* Statistique détaillée des cours */}
        <li className="stat-list-item stat-list-item--detailed">
          <div className="stat-details" aria-labelledby="courses-breakdown-title">
            <h3 id="courses-breakdown-title" className="stat-details-title">
              Détail de vos cours
            </h3>
            <dl className="stat-breakdown">
              <div className="breakdown-item">
                <dt>Cours terminés :</dt>
                <dd>
                  <button
                    type="button"
                    className="breakdown-button breakdown-button--completed"
                    onClick={handlers.handleCompletedCoursesClick}
                    onKeyDown={(e) => handleStatKeyDown(e, handlers.handleCompletedCoursesClick, 'cours terminés')}
                    aria-label={`${smallCourses.completedCourses || 0} cours terminés - Voir la liste`}
                  >
                    {smallCourses.completedCourses || 0}
                  </button>
                </dd>
              </div>
              <div className="breakdown-item">
                <dt>Cours en cours :</dt>
                <dd>
                  <button
                    type="button"
                    className="breakdown-button breakdown-button--ongoing"
                    onClick={handlers.handleOngoingCoursesClick}
                    onKeyDown={(e) => handleStatKeyDown(e, handlers.handleOngoingCoursesClick, 'cours en cours')}
                    aria-label={`${smallCourses.ongoingCourses || 0} cours en cours - Voir la liste`}
                  >
                    {smallCourses.ongoingCourses || 0}
                  </button>
                </dd>
              </div>
              <div className="breakdown-item">
                <dt>Total inscrit :</dt>
                <dd className="breakdown-total">{smallCourses.totalCourses || 0}</dd>
              </div>
            </dl>
          </div>
        </li>

        {/* Statistique sur les activités complétées */}
        <li className="stat-list-item">
          <button
            type="button"
            className="stat-button stat-button--activities"
            onClick={handlers.handleTotalActivitiesClick}
            onKeyDown={(e) => handleStatKeyDown(e, handlers.handleTotalActivitiesClick, 'toutes vos activités')}
            aria-describedby="activities-description"
          >
            <div className="stat-content">
              <span className="stat-icon" aria-hidden="true">⚡</span>
              <div className="stat-info">
                <span className="stat-label">Activités réalisées</span>
                <span className="stat-value">
                  {completedActivities}/{smallProgression.totalActivities || 0}
                </span>
                <span className="stat-percentage">({activitiesCompletionRate}%)</span>
              </div>
              <div className="progress-bar" role="progressbar" 
                   aria-valuenow={activitiesCompletionRate} 
                   aria-valuemin="0" 
                   aria-valuemax="100"
                   aria-label={`Progression des activités : ${activitiesCompletionRate} pour cent`}>
                <div className="progress-fill" style={{width: `${activitiesCompletionRate}%`}}></div>
              </div>
            </div>
            <div id="activities-description" className="stat-description">
              Nombre d'activités terminées (devoirs, quiz, exercices) par rapport au total
            </div>
          </button>
        </li>

        {/* Progression globale */}
        <li className="stat-list-item stat-list-item--summary">
          <div className="global-progress" aria-labelledby="global-progress-title">
            <h3 id="global-progress-title" className="progress-title">
              Progression Globale
            </h3>
            <div className="progress-summary">
              <div className="progress-circle" role="img" 
                   aria-label={`Progression globale : ${smallProgression.overallCompletionPercentage || 0} pour cent`}>
                <span className="progress-value">{smallProgression.overallCompletionPercentage || 0}%</span>
              </div>
              <div className="progress-details">
                <p className="progress-text">
                  Votre progression moyenne dans tous vos cours et activités
                </p>
                {smallProgression.overallCompletionPercentage >= 75 && (
                  <p className="progress-encouragement progress-encouragement--excellent" aria-live="polite">
                    🎉 Excellent ! Vous êtes proche de la fin de votre parcours.
                  </p>
                )}
                {smallProgression.overallCompletionPercentage >= 50 && smallProgression.overallCompletionPercentage < 75 && (
                  <p className="progress-encouragement progress-encouragement--good" aria-live="polite">
                    👍 Très bon rythme ! Continuez ainsi.
                  </p>
                )}
                {smallProgression.overallCompletionPercentage < 50 && smallProgression.totalActivities > 0 && (
                  <p className="progress-encouragement progress-encouragement--encourage" aria-live="polite">
                    💪 Bon début ! Chaque activité vous rapproche de vos objectifs.
                  </p>
                )}
              </div>
            </div>
          </div>
        </li>
      </ul>

      {/* Résumé des activités restantes */}
      {smallProgression.uncompleteActivities > 0 && (
        <div className="remaining-activities" aria-labelledby="remaining-title">
          <h3 id="remaining-title" className="remaining-title">
            Activités à terminer
          </h3>
          <p className="remaining-count">
            Il vous reste <strong>{smallProgression.uncompleteActivities}</strong> activité{smallProgression.uncompleteActivities > 1 ? 's' : ''} à compléter.
          </p>
          <button
            type="button"
            className="remaining-button"
            onClick={handlers.handleTotalActivitiesClick}
            onKeyDown={(e) => handleStatKeyDown(e, handlers.handleTotalActivitiesClick, 'activités restantes')}
          >
            Voir le détail des activités
          </button>
        </div>
      )}
    </section>
  );
};

export default StudentMainStats;
