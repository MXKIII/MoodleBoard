import React from "react";
import DatePicker from "react-datepicker";

// Composant d'affichage des statistiques principales pour l'admin
const MainStats = ({
  activity,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  handlers,
}) => (
      <section 
    className="main-item" 
    role="region"
    aria-labelledby="main-stats-title"
    aria-describedby="main-stats-description"
  >
    <header className="stats-header">
      <h2 id="main-stats-title" className="stat-value">
        Suivi Général de l'Utilisation de Moodle
      </h2>
      <p id="main-stats-description" className="sr-only">
        Tableau de bord principal présentant les statistiques d'utilisation par rôle et période
      </p>
    </header>

    {/* Sélecteurs pour filtrer les statistiques par dates */}
    <div className="date-select" role="group" aria-labelledby="date-filter-title">
      <h3 id="date-filter-title" className="sr-only">Filtrage par période</h3>
      
      <label htmlFor="date-start" className="date-label">
        Date de début
      </label>
      <DatePicker
        id="date-start"
        selected={startDate}
        onChange={setStartDate}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        dateFormat="dd/MM/yyyy"
        aria-describedby="date-start-help"
        aria-label="Sélectionner la date de début de la période d'analyse"
      />
      <div id="date-start-help" className="sr-only">
        Sélectionnez la date de début pour la période à analyser
      </div>

      <label htmlFor="date-end" className="date-label">
        Date de fin
      </label>
      <DatePicker
        id="date-end"
        selected={endDate}
        onChange={setEndDate}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        dateFormat="dd/MM/yyyy"
        aria-describedby="date-end-help"
        aria-label="Sélectionner la date de fin de la période d'analyse"
      />
      <div id="date-end-help" className="sr-only">
        Sélectionnez la date de fin pour la période à analyser
      </div>
    </div>

    {/* Navigation des statistiques principales */}
    <nav aria-labelledby="stats-nav-title">
      <h3 id="stats-nav-title" className="sr-only">Navigation des statistiques par rôle</h3>
      
      <ul className="stats-list" role="list" aria-label="Statistiques principales par type d'utilisateur">
        {/* Section utilisateurs totaux */}
        <li className="stat-list-item stat-list-item--section" role="listitem">
          <header>
            <h4 className="stat-section-title">Effectifs totaux</h4>
          </header>
        </li>

        {/* Article pour les statistiques étudiants */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="student-stats-title">
            <header>
              <h5 id="student-stats-title" className="sr-only">Statistiques étudiants</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleStudentUserClick}
              aria-describedby="student-total-desc"
            >
              <span className="stat-label" id="student-total-desc">
                Nombre total d'étudiants inscrits
              </span>
              <data className="stat-value" value={activity.studentCount}>
                {activity.studentCount}
              </data>
            </button>
          </article>
        </li>

        {/* Article pour les statistiques enseignants */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="teacher-stats-title">
            <header>
              <h5 id="teacher-stats-title" className="sr-only">Statistiques enseignants</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleTeacherUserClick}
              aria-describedby="teacher-total-desc"
            >
              <span className="stat-label" id="teacher-total-desc">
                Nombre total d'enseignants
              </span>
              <data className="stat-value" value={activity.teacherCount}>
                {activity.teacherCount}
              </data>
            </button>
          </article>
        </li>

        {/* Article pour les statistiques éditeurs */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="admin-stats-title">
            <header>
              <h5 id="admin-stats-title" className="sr-only">Statistiques éditeurs</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleAdminUserClick}
              aria-describedby="admin-total-desc"
            >
              <span className="stat-label" id="admin-total-desc">
                Nombre total d'enseignants éditeurs
              </span>
              <data className="stat-value" value={activity.adminCount}>
                {activity.adminCount}
              </data>
            </button>
          </article>
        </li>

        {/* Article pour les autres utilisateurs */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="other-stats-title">
            <header>
              <h5 id="other-stats-title" className="sr-only">Autres utilisateurs</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleOtherUserClick}
              aria-describedby="other-total-desc"
            >
              <span className="stat-label" id="other-total-desc">
                Nombre d'autres types d'utilisateurs
              </span>
              <data className="stat-value" value={activity.otherCount}>
                {activity.otherCount}
              </data>
            </button>
          </article>
        </li>

        {/* Section utilisateurs actifs */}
        <li className="stat-list-item stat-list-item--section" role="listitem">
          <header>
            <h4 className="stat-section-title">Utilisateurs actifs sur la période</h4>
          </header>
        </li>

        {/* Étudiants actifs */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="active-student-stats">
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleActiveStudentUserClick}
              aria-describedby="active-student-desc"
            >
              <span className="stat-label" id="active-student-desc">
                Étudiants actifs sur la période sélectionnée
              </span>
              <data className="stat-value" value={activity.activeStudentCount}>
                {activity.activeStudentCount}
              </data>
            </button>
          </article>
        </li>

        {/* Enseignants actifs */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="active-teacher-stats">
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleActiveTeacherUserClick}
              aria-describedby="active-teacher-desc"
            >
              <span className="stat-label" id="active-teacher-desc">
                Enseignants actifs sur la période sélectionnée
              </span>
              <data className="stat-value" value={activity.activeTeacherCount}>
                {activity.activeTeacherCount}
              </data>
            </button>
          </article>
        </li>

        {/* Éditeurs actifs */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="active-admin-stats">
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleActiveAdminUserClick}
              aria-describedby="active-admin-desc"
            >
              <span className="stat-label" id="active-admin-desc">
                Éditeurs actifs sur la période sélectionnée
              </span>
              <data className="stat-value" value={activity.activeAdminCount}>
                {activity.activeAdminCount}
              </data>
            </button>
          </article>
        </li>

        {/* Autres utilisateurs actifs */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="active-other-stats">
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleActiveOtherUserClick}
              aria-describedby="active-other-desc"
            >
              <span className="stat-label" id="active-other-desc">
                Autres utilisateurs actifs sur la période sélectionnée
              </span>
              <data className="stat-value" value={activity.activeOtherCount}>
                {activity.activeOtherCount}
              </data>
            </button>
          </article>
        </li>

        {/* Section analyses temporelles */}
        <li className="stat-list-item stat-list-item--section" role="listitem">
          <header>
            <h4 className="stat-section-title">Analyses d'activité quotidienne</h4>
          </header>
        </li>

        {/* Activité quotidienne étudiants */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="daily-student-activity">
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleStudentActiviyByDayClick}
              aria-describedby="daily-student-desc"
            >
              <span className="stat-label" id="daily-student-desc">
                Voir le graphique d'activité quotidienne des étudiants
              </span>
              <data className="stat-value" value={activity.activeStudentCount}>
                {activity.activeStudentCount} <span className="stat-unit">actifs</span>
              </data>
            </button>
          </article>
        </li>

        {/* Activité quotidienne enseignants */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="daily-teacher-activity">
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleTeacherActiviyByDayClick}
              aria-describedby="daily-teacher-desc"
            >
              <span className="stat-label" id="daily-teacher-desc">
                Voir le graphique d'activité quotidienne des enseignants
              </span>
              <data className="stat-value" value={activity.activeTeacherCount}>
                {activity.activeTeacherCount} <span className="stat-unit">actifs</span>
              </data>
            </button>
          </article>
        </li>

        {/* Activité quotidienne éditeurs */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="daily-admin-activity">
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleAdminActiviyByDayClick}
              aria-describedby="daily-admin-desc"
            >
              <span className="stat-label" id="daily-admin-desc">
                Voir le graphique d'activité quotidienne des éditeurs
              </span>
              <data className="stat-value" value={activity.activeAdminCount}>
                {activity.activeAdminCount} <span className="stat-unit">actifs</span>
              </data>
            </button>
          </article>
        </li>

        {/* Activité quotidienne autres */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="daily-other-activity">
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleOtherActiviyByDayClick}
              aria-describedby="daily-other-desc"
            >
              <span className="stat-label" id="daily-other-desc">
                Voir le graphique d'activité quotidienne des autres utilisateurs
              </span>
              <data className="stat-value" value={activity.activeOtherCount}>
                {activity.activeOtherCount} <span className="stat-unit">actifs</span>
              </data>
            </button>
          </article>
        </li>
      </ul>
    </nav>
  </section>
);

export default MainStats;
