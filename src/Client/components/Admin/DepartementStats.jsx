import React from "react";

// Composant d'affichage des statistiques de publications par département
const DepartmentStats = ({ departement, handlers }) => (
  <section className="tertiary-item" aria-labelledby="departement-stats-title">
    {/* Titre de la section */}
    <h2 id="departement-stats-title" className="stat-value">
      Publications par département
    </h2>
    {/* Liste des départements avec le nombre de publications*/}
    <ul className="stats-list" aria-label="Statistiques par département">
      {/* Mathématiques */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleMathDepartement}
        >
          <span className="stat-label">Mathématiques</span>
          <span className="stat-value">{departement.mathsPublications}</span>
        </button>
      </li>
      {/* Anglais */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleAnglaisDepartement}
        >
          <span className="stat-label">Anglais</span>
          <span className="stat-value">{departement.anglaisPublications}</span>
        </button>
      </li>
      {/* Histoire-Géographie */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleHistgeoDepartement}
        >
          <span className="stat-label">Histoire-Géographie</span>
          <span className="stat-value">{departement.histgeoPublications}</span>
        </button>
      </li>
      {/* Lettres */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleLettresDepartement}
        >
          <span className="stat-label">Lettres</span>
          <span className="stat-value">{departement.lettresPublications}</span>
        </button>
      </li>
      {/* SHS/Philosophie */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleShsphiloDepartement}
        >
          <span className="stat-label">SHS/Philosophie</span>
          <span className="stat-value">{departement.shsphiloPublications}</span>
        </button>
      </li>
      {/* Allemand */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleAllemandDepartement}
        >
          <span className="stat-label">Allemand</span>
          <span className="stat-value">{departement.allemandPublications}</span>
        </button>
      </li>
      {/* SVT */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleSvtDepartement}
        >
          <span className="stat-label">SVT</span>
          <span className="stat-value">{departement.svtPublications}</span>
        </button>
      </li>
      {/* Documentation */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleDocumentationDepartement}
        >
          <span className="stat-label">Documentation</span>
          <span className="stat-value">
            {departement.documentationPublications}
          </span>
        </button>
      </li>
      {/* ASH */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleAshDepartement}
        >
          <span className="stat-label">ASH</span>
          <span className="stat-value">{departement.ashPublications}</span>
        </button>
      </li>
      {/* SPC */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleSpcDepartement}
        >
          <span className="stat-label">SPC</span>
          <span className="stat-value">{departement.spcPublications}</span>
        </button>
      </li>
      {/* Musique */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleMusiqueDepartement}
        >
          <span className="stat-label">Musique</span>
          <span className="stat-value">{departement.musiquePublications}</span>
        </button>
      </li>
      {/* Technologie */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleTechnoDepartement}
        >
          <span className="stat-label">Technologie</span>
          <span className="stat-value">{departement.technoPublications}</span>
        </button>
      </li>
      {/* Espagnol */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleEspagnolDepartement}
        >
          <span className="stat-label">Espagnol</span>
          <span className="stat-value">{departement.espagnolPublications}</span>
        </button>
      </li>
      {/* Arts plastiques */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleArtsPlastiquesDepartement}
        >
          <span className="stat-label">Arts plastiques</span>
          <span className="stat-value">
            {departement.artsPlastiquesPublications}
          </span>
        </button>
      </li>
      {/* ARCH */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleArchDepartement}
        >
          <span className="stat-label">ARCH</span>
          <span className="stat-value">{departement.archPublications}</span>
        </button>
      </li>
      {/* EPS */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleEpsDepartement}
        >
          <span className="stat-label">EPS</span>
          <span className="stat-value">{departement.epsPublications}</span>
        </button>
      </li>
      {/* Italien */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleItalienDepartement}
        >
          <span className="stat-label">Italien</span>
          <span className="stat-value">{departement.italienPublications}</span>
        </button>
      </li>
      {/* Économie et Gestion */}
      <li className="stat-list-item">
        <button
          type="button"
          className="stat-item"
          onClick={handlers.handleEcogestionDepartement}
        >
          <span className="stat-label">Économie et Gestion</span>
          <span className="stat-value">
            {departement.ecogestionPublications}
          </span>
        </button>
      </li>
    </ul>
  </section>
);

export default DepartmentStats;
