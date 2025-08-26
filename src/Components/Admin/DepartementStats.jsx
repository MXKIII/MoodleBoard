import React from "react";

// Composant d'affichage des statistiques de publications par département
const DepartmentStats = ({ departement, handlers }) => (
  <section 
    className="tertiary-item" 
    role="region"
    aria-labelledby="departement-stats-title"
    aria-describedby="departement-stats-description"
  >
    <header className="stats-header">
      <h2 id="departement-stats-title" className="stat-value">
        Publications par département académique
      </h2>
      <p id="departement-stats-description" className="sr-only">
        Répartition des publications de cours par département académique, avec accès aux détails de chaque département
      </p>
    </header>

    {/* Navigation des départements */}
    <nav aria-labelledby="dept-nav-title">
      <h3 id="dept-nav-title" className="sr-only">Navigation des statistiques par département</h3>
      
      {/* Liste des départements avec le nombre de publications*/}
      <ul className="stats-list" role="list" aria-label="Statistiques de publications par département académique">
        
        {/* Section Sciences et Mathématiques */}
        <li className="stat-list-item stat-list-item--section" role="listitem">
          <header>
            <h4 className="stat-section-title">Sciences et Mathématiques</h4>
          </header>
        </li>

        {/* Mathématiques */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="math-dept-title">
            <header>
              <h5 id="math-dept-title" className="sr-only">Département Mathématiques</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleMathDepartement}
              aria-describedby="math-dept-desc"
            >
              <span className="stat-label" id="math-dept-desc">
                Publications du département Mathématiques
              </span>
              <data className="stat-value" value={departement.mathsPublications}>
                {departement.mathsPublications}
              </data>
            </button>
          </article>
        </li>

        {/* SVT */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="svt-dept-title">
            <header>
              <h5 id="svt-dept-title" className="sr-only">Département SVT</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleSvtDepartement}
              aria-describedby="svt-dept-desc"
            >
              <span className="stat-label" id="svt-dept-desc">
                Publications du département Sciences de la Vie et de la Terre
              </span>
              <data className="stat-value" value={departement.svtPublications}>
                {departement.svtPublications}
              </data>
            </button>
          </article>
        </li>

        {/* SPC */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="spc-dept-title">
            <header>
              <h5 id="spc-dept-title" className="sr-only">Département SPC</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleSpcDepartement}
              aria-describedby="spc-dept-desc"
            >
              <span className="stat-label" id="spc-dept-desc">
                Publications du département Sciences Physiques et Chimie
              </span>
              <data className="stat-value" value={departement.spcPublications}>
                {departement.spcPublications}
              </data>
            </button>
          </article>
        </li>

        {/* Technologie */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="techno-dept-title">
            <header>
              <h5 id="techno-dept-title" className="sr-only">Département Technologie</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleTechnoDepartement}
              aria-describedby="techno-dept-desc"
            >
              <span className="stat-label" id="techno-dept-desc">
                Publications du département Technologie
              </span>
              <data className="stat-value" value={departement.technoPublications}>
                {departement.technoPublications}
              </data>
            </button>
          </article>
        </li>

        {/* Section Langues */}
        <li className="stat-list-item stat-list-item--section" role="listitem">
          <header>
            <h4 className="stat-section-title">Langues</h4>
          </header>
        </li>

        {/* Anglais */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="anglais-dept-title">
            <header>
              <h5 id="anglais-dept-title" className="sr-only">Département Anglais</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleAnglaisDepartement}
              aria-describedby="anglais-dept-desc"
            >
              <span className="stat-label" id="anglais-dept-desc">
                Publications du département Anglais
              </span>
              <data className="stat-value" value={departement.anglaisPublications}>
                {departement.anglaisPublications}
              </data>
            </button>
          </article>
        </li>

        {/* Espagnol */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="espagnol-dept-title">
            <header>
              <h5 id="espagnol-dept-title" className="sr-only">Département Espagnol</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleEspagnolDepartement}
              aria-describedby="espagnol-dept-desc"
            >
              <span className="stat-label" id="espagnol-dept-desc">
                Publications du département Espagnol
              </span>
              <data className="stat-value" value={departement.espagnolPublications}>
                {departement.espagnolPublications}
              </data>
            </button>
          </article>
        </li>

        {/* Allemand */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="allemand-dept-title">
            <header>
              <h5 id="allemand-dept-title" className="sr-only">Département Allemand</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleAllemandDepartement}
              aria-describedby="allemand-dept-desc"
            >
              <span className="stat-label" id="allemand-dept-desc">
                Publications du département Allemand
              </span>
              <data className="stat-value" value={departement.allemandPublications}>
                {departement.allemandPublications}
              </data>
            </button>
          </article>
        </li>

        {/* Italien */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="italien-dept-title">
            <header>
              <h5 id="italien-dept-title" className="sr-only">Département Italien</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleItalienDepartement}
              aria-describedby="italien-dept-desc"
            >
              <span className="stat-label" id="italien-dept-desc">
                Publications du département Italien
              </span>
              <data className="stat-value" value={departement.italienPublications}>
                {departement.italienPublications}
              </data>
            </button>
          </article>
        </li>

        {/* Section Lettres et Sciences Humaines */}
        <li className="stat-list-item stat-list-item--section" role="listitem">
          <header>
            <h4 className="stat-section-title">Lettres et Sciences Humaines</h4>
          </header>
        </li>

        {/* Lettres */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="lettres-dept-title">
            <header>
              <h5 id="lettres-dept-title" className="sr-only">Département Lettres</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleLettresDepartement}
              aria-describedby="lettres-dept-desc"
            >
              <span className="stat-label" id="lettres-dept-desc">
                Publications du département Lettres
              </span>
              <data className="stat-value" value={departement.lettresPublications}>
                {departement.lettresPublications}
              </data>
            </button>
          </article>
        </li>

        {/* Histoire-Géographie */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="histgeo-dept-title">
            <header>
              <h5 id="histgeo-dept-title" className="sr-only">Département Histoire-Géographie</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleHistgeoDepartement}
              aria-describedby="histgeo-dept-desc"
            >
              <span className="stat-label" id="histgeo-dept-desc">
                Publications du département Histoire-Géographie
              </span>
              <data className="stat-value" value={departement.histgeoPublications}>
                {departement.histgeoPublications}
              </data>
            </button>
          </article>
        </li>

        {/* SHS/Philosophie */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="shsphilo-dept-title">
            <header>
              <h5 id="shsphilo-dept-title" className="sr-only">Département SHS/Philosophie</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleShsphiloDepartement}
              aria-describedby="shsphilo-dept-desc"
            >
              <span className="stat-label" id="shsphilo-dept-desc">
                Publications du département Sciences Humaines et Sociales / Philosophie
              </span>
              <data className="stat-value" value={departement.shsphiloPublications}>
                {departement.shsphiloPublications}
              </data>
            </button>
          </article>
        </li>

        {/* Section Arts et Activités */}
        <li className="stat-list-item stat-list-item--section" role="listitem">
          <header>
            <h4 className="stat-section-title">Arts et Activités</h4>
          </header>
        </li>

        {/* Arts plastiques */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="arts-dept-title">
            <header>
              <h5 id="arts-dept-title" className="sr-only">Département Arts plastiques</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleArtsPlastiquesDepartement}
              aria-describedby="arts-dept-desc"
            >
              <span className="stat-label" id="arts-dept-desc">
                Publications du département Arts plastiques
              </span>
              <data className="stat-value" value={departement.artsPlastiquesPublications}>
                {departement.artsPlastiquesPublications}
              </data>
            </button>
          </article>
        </li>

        {/* Musique */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="musique-dept-title">
            <header>
              <h5 id="musique-dept-title" className="sr-only">Département Musique</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleMusiqueDepartement}
              aria-describedby="musique-dept-desc"
            >
              <span className="stat-label" id="musique-dept-desc">
                Publications du département Musique
              </span>
              <data className="stat-value" value={departement.musiquePublications}>
                {departement.musiquePublications}
              </data>
            </button>
          </article>
        </li>

        {/* EPS */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="eps-dept-title">
            <header>
              <h5 id="eps-dept-title" className="sr-only">Département EPS</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleEpsDepartement}
              aria-describedby="eps-dept-desc"
            >
              <span className="stat-label" id="eps-dept-desc">
                Publications du département Éducation Physique et Sportive
              </span>
              <data className="stat-value" value={departement.epsPublications}>
                {departement.epsPublications}
              </data>
            </button>
          </article>
        </li>

        {/* Section Services et spécialités */}
        <li className="stat-list-item stat-list-item--section" role="listitem">
          <header>
            <h4 className="stat-section-title">Services et spécialités</h4>
          </header>
        </li>

        {/* Documentation */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="documentation-dept-title">
            <header>
              <h5 id="documentation-dept-title" className="sr-only">Département Documentation</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleDocumentationDepartement}
              aria-describedby="documentation-dept-desc"
            >
              <span className="stat-label" id="documentation-dept-desc">
                Publications du département Documentation
              </span>
              <data className="stat-value" value={departement.documentationPublications}>
                {departement.documentationPublications}
              </data>
            </button>
          </article>
        </li>

        {/* ASH */}
        <li className="stat-list-item" role="listitem">
          <article className="stat-card" aria-labelledby="ash-dept-title">
            <header>
              <h5 id="ash-dept-title" className="sr-only">Département ASH</h5>
            </header>
            
            <button
              type="button"
              className="stat-item"
              onClick={handlers.handleAshDepartement}
              aria-describedby="ash-dept-desc"
            >
              <span className="stat-label" id="ash-dept-desc">
                Publications du département ASH
              </span>
              <data className="stat-value" value={departement.ashPublications}>
                {departement.ashPublications}
              </data>
            </button>
          </article>
        </li>
      </ul>
    </nav>
  </section>
);

export default DepartmentStats;
