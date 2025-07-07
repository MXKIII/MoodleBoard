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
  <section className="main-item" aria-labelledby="main-stats-title">
    {/* Titre de la section */}
    <h2 id="main-stats-title" className="stat-value">
      Suivi Général de l’Utilisation de Moodle
    </h2>
    {/* Sélecteurs pour filtrer les statistiques par dates */}
    <div className="date-select">
      <label htmlFor="date-start" className="sr-only">
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
      />
      <label htmlFor="date-end" className="sr-only">
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
      />
    </div>
    {/* Liste des statistiques principales*/}
    <ul className="stats-list" aria-label="Statistiques principales">
      {/* Nombre total d'étudiants */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleStudentUserClick}
        >
          <span className="stat-label">Étudiants</span>
          <span className="stat-value">{activity.studentCount}</span>
        </button>
      </li>
      {/* Nombre total d'enseignants */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleTeacherUserClick}
        >
          <span className="stat-label">Enseignants</span>
          <span className="stat-value">{activity.teacherCount}</span>
        </button>
      </li>
      {/* Nombre total d'enseignants éditeurs */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleAdminUserClick}
        >
          <span className="stat-label">Enseignants éditeurs</span>
          <span className="stat-value">{activity.adminCount}</span>
        </button>
      </li>
      {/* Nombre total d'autres utilisateurs */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleOtherUserClick}
        >
          <span className="stat-label">Autres</span>
          <span className="stat-value">{activity.otherCount}</span>
        </button>
      </li>
      {/* Nombre d'étudiants actifs */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleActiveStudentUserClick}
        >
          <span className="stat-label">Étudiants actifs</span>
          <span className="stat-value">{activity.activeStudentCount}</span>
        </button>
      </li>
      {/* Nombre d'enseignants actifs */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleActiveTeacherUserClick}
        >
          <span className="stat-label">Enseignants actifs</span>
          <span className="stat-value">{activity.activeTeacherCount}</span>
        </button>
      </li>
      {/* Nombre d'enseignants éditeurs actifs */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleActiveAdminUserClick}
        >
          <span className="stat-label">Enseignants éditeurs actifs</span>
          <span className="stat-value">{activity.activeAdminCount}</span>
        </button>
      </li>
      {/* Nombre d'autres utilisateurs actifs */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleActiveOtherUserClick}
        >
          <span className="stat-label">Autres actifs</span>
          <span className="stat-value">{activity.activeOtherCount}</span>
        </button>
      </li>
      {/* Activité quotidienne des étudiants */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleStudentActiviyByDayClick}
        >
          <span className="stat-label">Activité quotidienne étudiants</span>
          <span className="stat-value">{activity.activeStudentCount}</span>
        </button>
      </li>
      {/* Activité quotidienne des enseignants */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleTeacherActiviyByDayClick}
        >
          <span className="stat-label">Activité quotidienne enseignants</span>
          <span className="stat-value">{activity.activeTeacherCount}</span>
        </button>
      </li>
      {/* Activité quotidienne des éditeurs */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleAdminActiviyByDayClick}
        >
          <span className="stat-label">Activité quotidienne éditeurs</span>
          <span className="stat-value">{activity.activeAdminCount}</span>
        </button>
      </li>
      {/* Activité quotidienne des autres utilisateurs */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleOtherActiviyByDayClick}
        >
          <span className="stat-label">Activité quotidienne autres</span>
          <span className="stat-value">{activity.activeOtherCount}</span>
        </button>
      </li>
    </ul>
  </section>
);

export default MainStats;
