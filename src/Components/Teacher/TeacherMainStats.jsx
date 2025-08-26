import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";

// Composant d'affichage des statistiques principales pour l'enseignant
const TeacherMainStats = ({
  activity,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  handlers,
}) => {
  const [dateErrors, setDateErrors] = useState({});
  const dateStartRef = useRef(null);
  const dateEndRef = useRef(null);
  const sectionRef = useRef(null);

  // Validation des dates
  const validateDate = (date, type) => {
    const errors = { ...dateErrors };

    if (!date) {
      errors[type] = `La ${
        type === "start" ? "date de début" : "date de fin"
      } est obligatoire`;
    } else if (type === "start" && endDate && date > endDate) {
      errors[type] = "La date de début ne peut pas être postérieure à la date de fin";
    } else if (type === "end" && startDate && date < startDate) {
      errors[type] = "La date de fin ne peut pas être antérieure à la date de début";
    } else {
      delete errors[type];
    }

    setDateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion du changement de date de début
  const handleStartDateChange = (date) => {
    setStartDate(date);
    validateDate(date, "start");
  };

  // Gestion du changement de date de fin
  const handleEndDateChange = (date) => {
    setEndDate(date);
    validateDate(date, "end");
  };

  // Gestion des touches clavier pour les statistiques
  const handleStatKeyDown = (event, handler, statName) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();

      // Annonce pour les lecteurs d'écran
      const announcement = `Consultation des données : ${statName}`;
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(announcement);
        utterance.volume = 0; // Silencieux pour éviter la pollution sonore
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Validation initiale des dates
  useEffect(() => {
    validateDate(startDate, "start");
    validateDate(endDate, "end");
  }, [startDate, endDate]);

  return (
    <section
      ref={sectionRef}
      className="main-stats-section"
      aria-labelledby="teacher-main-stats-title"
      role="region"
    >
      {/* En-tête de la section avec description */}
      <header className="stats-header">
        <h2 id="teacher-main-stats-title" className="stats-title">
          Statistiques Générales de la Plateforme
        </h2>
        <p className="stats-description">
          Consultez les effectifs et l'activité globale des utilisateurs de Moodle.
          Utilisez les filtres de dates pour analyser une période spécifique.
        </p>
      </header>

      {/* Filtres de dates accessibles */}
      <fieldset className="date-filters" aria-describedby="date-filters-description">
        <legend className="date-filters-legend">Filtrage par période</legend>

        <p id="date-filters-description" className="date-filters-help">
          Sélectionnez une période pour filtrer les statistiques d'activité.
          La date de début ne peut pas être postérieure à la date de fin.
        </p>

        <div className="date-inputs-container">
          {/* Date de début */}
          <div className="date-input-group">
            <label htmlFor="teacher-date-start" className="date-label">
              Date de début
              <span className="required-indicator" aria-label="obligatoire">
                *
              </span>
            </label>
            <DatePicker
              ref={dateStartRef}
              id="teacher-date-start"
              selected={startDate}
              onChange={handleStartDateChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="Sélectionner la date de début"
              className={`date-picker ${
                dateErrors.start ? "date-picker--error" : ""
              }`}
              aria-invalid={dateErrors.start ? "true" : "false"}
              aria-describedby={
                dateErrors.start ? "start-date-error" : "start-date-help"
              }
              autoComplete="off"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              maxDate={new Date()}
            />
            <div id="start-date-help" className="date-help">
              Format : JJ/MM/AAAA
            </div>
            {dateErrors.start && (
              <div
                id="start-date-error"
                className="error-text"
                role="alert"
                aria-live="polite"
              >
                {dateErrors.start}
              </div>
            )}
          </div>

          {/* Date de fin */}
          <div className="date-input-group">
            <label htmlFor="teacher-date-end" className="date-label">
              Date de fin
              <span className="required-indicator" aria-label="obligatoire">
                *
              </span>
            </label>
            <DatePicker
              ref={dateEndRef}
              id="teacher-date-end"
              selected={endDate}
              onChange={handleEndDateChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="Sélectionner la date de fin"
              className={`date-picker ${
                dateErrors.end ? "date-picker--error" : ""
              }`}
              aria-invalid={dateErrors.end ? "true" : "false"}
              aria-describedby={dateErrors.end ? "end-date-error" : "end-date-help"}
              autoComplete="off"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              maxDate={new Date()}
            />
            <div id="end-date-help" className="date-help">
              Format : JJ/MM/AAAA - Ne peut pas être antérieure à la date de début
            </div>
            {dateErrors.end && (
              <div
                id="end-date-error"
                className="error-text"
                role="alert"
                aria-live="polite"
              >
                {dateErrors.end}
              </div>
            )}
          </div>
        </div>

        {/* Période sélectionnée (résumé) */}
        {startDate && endDate && Object.keys(dateErrors).length === 0 && (
          <div className="selected-period" aria-live="polite">
            <strong>Période analysée :</strong> du{" "}
            {startDate.toLocaleDateString("fr-FR")} au{" "}
            {endDate.toLocaleDateString("fr-FR")}
          </div>
        )}
      </fieldset>

      {/* Statistiques principales */}
      <div className="stats-content">
        <h3 id="stats-list-title" className="stats-section-title">
          Effectifs et Activité
        </h3>

        <ul
          className="stats-grid"
          role="list"
          aria-labelledby="stats-list-title"
          aria-describedby="stats-instructions"
        >
          <div id="stats-instructions" className="sr-only">
            Liste des statistiques d'utilisation. Appuyez sur Entrée ou Espace sur chaque élément pour consulter les détails.
          </div>

          {/* Statistiques générales */}
          <li className="stat-card stat-card--total">
            <button
              type="button"
              className="stat-button"
              onClick={handlers.handleStudentUserClick}
              onKeyDown={(e) =>
                handleStatKeyDown(e, handlers.handleStudentUserClick, "Étudiants")
              }
              aria-describedby="students-description"
            >
              <div className="stat-content">
                <span className="stat-icon" aria-hidden="true">
                  👥
                </span>
                <div className="stat-info">
                  <span className="stat-label">Étudiants</span>
                  <span className="stat-value">{activity.studentCount || 0}</span>
                </div>
              </div>
              <div id="students-description" className="stat-description">
                Nombre total d'étudiants inscrits
              </div>
            </button>
          </li>

          <li className="stat-card stat-card--total">
            <button
              type="button"
              className="stat-button"
              onClick={handlers.handleTeacherUserClick}
              onKeyDown={(e) =>
                handleStatKeyDown(e, handlers.handleTeacherUserClick, "Enseignants")
              }
              aria-describedby="teachers-description"
            >
              <div className="stat-content">
                <span className="stat-icon" aria-hidden="true">
                  🎓
                </span>
                <div className="stat-info">
                  <span className="stat-label">Enseignants</span>
                  <span className="stat-value">{activity.teacherCount || 0}</span>
                </div>
              </div>
              <div id="teachers-description" className="stat-description">
                Nombre total d'enseignants
              </div>
            </button>
          </li>

          <li className="stat-card stat-card--total">
            <button
              type="button"
              className="stat-button"
              onClick={handlers.handleAdminUserClick}
              onKeyDown={(e) =>
                handleStatKeyDown(e, handlers.handleAdminUserClick, "Enseignants éditeurs")
              }
              aria-describedby="admins-description"
            >
              <div className="stat-content">
                <span className="stat-icon" aria-hidden="true">
                  ✏️
                </span>
                <div className="stat-info">
                  <span className="stat-label">Enseignants éditeurs</span>
                  <span className="stat-value">{activity.adminCount || 0}</span>
                </div>
              </div>
              <div id="admins-description" className="stat-description">
                Enseignants avec droits d'édition
              </div>
            </button>
          </li>

          <li className="stat-card stat-card--total">
            <button
              type="button"
              className="stat-button"
              onClick={handlers.handleOtherUserClick}
              onKeyDown={(e) =>
                handleStatKeyDown(e, handlers.handleOtherUserClick, "Autres utilisateurs")
              }
              aria-describedby="others-description"
            >
              <div className="stat-content">
                <span className="stat-icon" aria-hidden="true">
                  👤
                </span>
                <div className="stat-info">
                  <span className="stat-label">Autres</span>
                  <span className="stat-value">{activity.otherCount || 0}</span>
                </div>
              </div>
              <div id="others-description" className="stat-description">
                Autres types d'utilisateurs
              </div>
            </button>
          </li>

          {/* Séparateur visuel */}
          <li className="stat-separator" aria-hidden="true">
            <h4 className="separator-title">Activité sur la période</h4>
          </li>

          {/* Statistiques d'activité */}
          <li className="stat-card stat-card--active">
            <button
              type="button"
              className="stat-button"
              onClick={handlers.handleActiveStudentUserClick}
              onKeyDown={(e) =>
                handleStatKeyDown(e, handlers.handleActiveStudentUserClick, "Étudiants actifs")
              }
              aria-describedby="active-students-description"
            >
              <div className="stat-content">
                <span className="stat-icon" aria-hidden="true">
                  👥✨
                </span>
                <div className="stat-info">
                  <span className="stat-label">Étudiants actifs</span>
                  <span className="stat-value">{activity.activeStudentCount || 0}</span>
                  <span className="stat-percentage">
                    ({activity.studentPercentage || 0}%)
                  </span>
                </div>
              </div>
              <div id="active-students-description" className="stat-description">
                Étudiants ayant eu une activité sur la période sélectionnée
              </div>
            </button>
          </li>

          <li className="stat-card stat-card--active">
            <button
              type="button"
              className="stat-button"
              onClick={handlers.handleActiveTeacherUserClick}
              onKeyDown={(e) =>
                handleStatKeyDown(e, handlers.handleActiveTeacherUserClick, "Enseignants actifs")
              }
              aria-describedby="active-teachers-description"
            >
              <div className="stat-content">
                <span className="stat-icon" aria-hidden="true">
                  🎓✨
                </span>
                <div className="stat-info">
                  <span className="stat-label">Enseignants actifs</span>
                  <span className="stat-value">{activity.activeTeacherCount || 0}</span>
                  <span className="stat-percentage">
                    ({activity.teacherPercentage || 0}%)
                  </span>
                </div>
              </div>
              <div id="active-teachers-description" className="stat-description">
                Enseignants ayant eu une activité sur la période sélectionnée
              </div>
            </button>
          </li>

          <li className="stat-card stat-card--active">
            <button
              type="button"
              className="stat-button"
              onClick={handlers.handleActiveAdminUserClick}
              onKeyDown={(e) =>
                handleStatKeyDown(e, handlers.handleActiveAdminUserClick, "Enseignants éditeurs actifs")
              }
              aria-describedby="active-admins-description"
            >
              <div className="stat-content">
                <span className="stat-icon" aria-hidden="true">
                  ✏️✨
                </span>
                <div className="stat-info">
                  <span className="stat-label">Enseignants éditeurs actifs</span>
                  <span className="stat-value">{activity.activeAdminCount || 0}</span>
                  <span className="stat-percentage">
                    ({activity.adminPercentage || 0}%)
                  </span>
                </div>
              </div>
              <div id="active-admins-description" className="stat-description">
                Enseignants éditeurs ayant eu une activité sur la période sélectionnée
              </div>
            </button>
          </li>

          <li className="stat-card stat-card--active">
            <button
              type="button"
              className="stat-button"
              onClick={handlers.handleActiveOtherUserClick}
              onKeyDown={(e) =>
                handleStatKeyDown(e, handlers.handleActiveOtherUserClick, "Autres utilisateurs actifs")
              }
              aria-describedby="active-others-description"
            >
              <div className="stat-content">
                <span className="stat-icon" aria-hidden="true">
                  👤✨
                </span>
                <div className="stat-info">
                  <span className="stat-label">Autres actifs</span>
                  <span className="stat-value">{activity.activeOtherCount || 0}</span>
                  <span className="stat-percentage">
                    ({activity.otherPercentage || 0}%)
                  </span>
                </div>
              </div>
              <div id="active-others-description" className="stat-description">
                Autres utilisateurs ayant eu une activité sur la période sélectionnée
              </div>
            </button>
          </li>
        </ul>

        {/* Résumé d'activité */}
        <div className="activity-summary" aria-labelledby="activity-summary-title">
          <h4 id="activity-summary-title" className="summary-title">
            Résumé d'activité
          </h4>
          <dl className="summary-stats">
            <div className="summary-item">
              <dt>Total utilisateurs :</dt>
              <dd>{activity.totalUsers || 0}</dd>
            </div>
            <div className="summary-item">
              <dt>Utilisateurs actifs :</dt>
              <dd>{activity.activeUsers || 0}</dd>
            </div>
            <div className="summary-item">
              <dt>Taux d'activité global :</dt>
              <dd>
                {activity.totalUsers > 0
                  ? Math.round((activity.activeUsers / activity.totalUsers) * 100)
                  : 0}%
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};

export default TeacherMainStats;
