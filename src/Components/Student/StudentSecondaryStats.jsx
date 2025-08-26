import React from "react";

// Composant d'affichage des statistiques secondaires pour l'étudiant
const StudentSecondaryStats = ({ smallEvents, badge, handlers }) => {
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

  return (
    <section
      className="student-secondary-stats"
      aria-labelledby="student-secondary-stats-title"
      role="region"
    >
      {/* En-tête de la section */}
      <header className="secondary-stats-header">
        <h2 id="student-secondary-stats-title" className="secondary-stats-title">
          Votre Planning et Réalisations
        </h2>
        <p className="secondary-stats-description">
          Consultez vos événements à venir et les badges que vous avez obtenus au cours de votre apprentissage.
        </p>
      </header>

      {/* Contenu des statistiques secondaires */}
      <div className="secondary-stats-content">
        {/* Liste des statistiques secondaires avec boutons d'action */}
        <ul 
          className="stats-list" 
          role="list"
          aria-labelledby="student-secondary-stats-title"
          aria-describedby="secondary-stats-instructions"
        >
          <div id="secondary-stats-instructions" className="sr-only">
            Liste de vos statistiques secondaires. Appuyez sur Entrée ou Espace pour consulter les détails de chaque élément.
          </div>

          {/* Événements à venir */}
          <li className="stat-list-item">
            <button
              type="button"
              className="stat-button stat-button--events"
              onClick={handlers.handleUserEvent}
              onKeyDown={(e) => handleStatKeyDown(e, handlers.handleUserEvent, 'événements à venir')}
              aria-describedby="events-description"
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
              <div id="events-description" className="stat-description">
                Événements et échéances programmés dans votre calendrier d'apprentissage
              </div>
            </button>
          </li>

          {/* Badges obtenus */}
          <li className="stat-list-item">
            <button
              type="button"
              className="stat-button stat-button--badges"
              onClick={handlers.handleBadgeClick}
              onKeyDown={(e) => handleStatKeyDown(e, handlers.handleBadgeClick, 'badges obtenus')}
              aria-describedby="badges-description"
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
              <div id="badges-description" className="stat-description">
                Badges et récompenses que vous avez obtenus au cours de votre apprentissage
              </div>
            </button>
          </li>
        </ul>

        {/* Section récapitulatif pour l'engagement */}
        <div className="engagement-summary" aria-labelledby="engagement-title">
          <h3 id="engagement-title" className="engagement-title">
            Votre Engagement
          </h3>
          
          <dl className="engagement-stats">
            <div className="engagement-item">
              <dt>Événements planifiés :</dt>
              <dd className="engagement-value">
                {smallEvents.upcomingEventsCount || 0}
                {smallEvents.upcomingEventsCount > 0 && (
                  <span className="engagement-note"> - Restez organisé !</span>
                )}
              </dd>
            </div>
            
            <div className="engagement-item">
              <dt>Récompenses gagnées :</dt>
              <dd className="engagement-value">
                {badge?.length || 0}
                {badge?.length > 0 && (
                  <span className="engagement-note"> - Félicitations !</span>
                )}
              </dd>
            </div>
            
            <div className="engagement-item">
              <dt>Niveau d'engagement :</dt>
              <dd className="engagement-value">
                {(() => {
                  const totalEngagement = (smallEvents.upcomingEventsCount || 0) + (badge?.length || 0);
                  if (totalEngagement >= 10) return "Très actif 🌟";
                  if (totalEngagement >= 5) return "Actif 👍";
                  if (totalEngagement >= 1) return "En cours 📈";
                  return "Débutant 🌱";
                })()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Messages d'encouragement selon l'activité */}
        <div className="motivation-section" aria-live="polite">
          {badge?.length > 0 && (
            <div className="motivation-message motivation-message--badges">
              <p>
                🎉 <strong>Bravo !</strong> Vous avez obtenu {badge.length} badge{badge.length > 1 ? 's' : ''}. 
                Continuez à relever les défis pour en gagner davantage !
              </p>
            </div>
          )}
          
          {smallEvents.upcomingEventsCount > 0 && (
            <div className="motivation-message motivation-message--events">
              <p>
                📌 <strong>À ne pas oublier !</strong> Vous avez {smallEvents.upcomingEventsCount} événement{smallEvents.upcomingEventsCount > 1 ? 's' : ''} planifié{smallEvents.upcomingEventsCount > 1 ? 's' : ''}. 
                Consultez votre planning pour rester organisé.
              </p>
            </div>
          )}
          
          {!badge?.length && !smallEvents.upcomingEventsCount && (
            <div className="motivation-message motivation-message--start">
              <p>
                🚀 <strong>Commencez votre aventure !</strong> Participez aux activités pour gagner vos premiers badges 
                et planifiez vos événements pour rester organisé dans votre apprentissage.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <footer className="secondary-stats-footer">
        <div className="quick-actions" aria-labelledby="quick-actions-title">
          <h3 id="quick-actions-title" className="sr-only">
            Actions rapides
          </h3>
          
          <div className="action-buttons">
            {smallEvents.upcomingEventsCount > 0 && (
              <button
                type="button"
                className="quick-action-button quick-action-button--events"
                onClick={handlers.handleUserEvent}
                onKeyDown={(e) => handleStatKeyDown(e, handlers.handleUserEvent, 'détail des événements')}
                aria-label={`Consulter vos ${smallEvents.upcomingEventsCount} événements à venir`}
              >
                <span className="action-icon" aria-hidden="true">📅</span>
                Voir mes événements
              </button>
            )}
            
            {badge?.length > 0 && (
              <button
                type="button"
                className="quick-action-button quick-action-button--badges"
                onClick={handlers.handleBadgeClick}
                onKeyDown={(e) => handleStatKeyDown(e, handlers.handleBadgeClick, 'collection de badges')}
                aria-label={`Consulter vos ${badge.length} badges obtenus`}
              >
                <span className="action-icon" aria-hidden="true">🏆</span>
                Voir mes badges
              </button>
            )}
          </div>
        </div>
      </footer>
    </section>
  );
};

export default StudentSecondaryStats;
