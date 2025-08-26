import React, { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { useUser } from "./UserContext";

const QueryResult = () => {
  const location = useLocation();
  const { results, message, description } = location.state || {
    results: [],
    message: "Résultats",
    description: ""
  };
  
  // États essentiels
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState(results);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(1);
  const { userRole } = useUser();
  const resultsPerPage = 50;

  // Refs pour accessibilité
  const searchRef = useRef(null);
  const tableRef = useRef(null);

  // Filtrage en temps réel
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredRows(results);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = results.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(lowercasedTerm)
        )
      );
      setFilteredRows(filtered);
      setCurrentPage(1); // Reset pagination
    }
  }, [searchTerm, results]);

  // Tri accessible
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredRows].sort((a, b) => {
      // Gestion des dates
      if (key.toLowerCase().includes("date") || key === "dernier_accès") {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === "ascending" ? dateA - dateB : dateB - dateA;
      }
      // Tri standard
      if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
      if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
      return 0;
    });
    
    setFilteredRows(sorted);
  };

  // Calculs pagination
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredRows.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(filteredRows.length / resultsPerPage);

  // Navigation clavier pour pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Focus sur le tableau après changement de page
    setTimeout(() => {
      if (tableRef.current) {
        tableRef.current.focus();
      }
    }, 100);
  };

  return (
    <div className="query-results">
      {/* Navigation retour */}
      <nav aria-label="Navigation">
        <Link to={`/${userRole}`} className="back-link">
          ← Retour au tableau de bord
        </Link>
      </nav>

      {/* En-tête accessible */}
      <header>
        <h1 id="results-title">{message}</h1>
        {description && (
          <p className="results-description">{description}</p>
        )}
        <p className="results-count">
          <strong>{filteredRows.length}</strong> résultat{filteredRows.length > 1 ? 's' : ''} 
          {searchTerm && ` pour "${searchTerm}"`}
        </p>
      </header>

      <main>
        {/* Recherche accessible */}
        <div className="search-section">
          <label htmlFor="search-input">
            Rechercher dans les résultats
          </label>
          <input
            ref={searchRef}
            id="search-input"
            type="search"
            placeholder="Tapez votre recherche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-describedby="search-help"
          />
          <div id="search-help" className="sr-only">
            La recherche s'effectue en temps réel dans toutes les colonnes
          </div>
        </div>

        {/* Pagination simple */}
        {totalPages > 1 && (
          <nav aria-label="Pagination" className="pagination">
            <div className="pagination-info">
              Page {currentPage} sur {totalPages}
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                Précédent
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
              >
                Suivant
              </button>
            </div>
          </nav>
        )}

        {/* Tableau accessible */}
        {currentResults.length > 0 ? (
          <div className="table-container">
            <table 
              ref={tableRef}
              tabIndex="-1"
              aria-labelledby="results-title"
              aria-describedby="table-help"
            >
              <caption id="table-help" className="sr-only">
                Tableau triable. Cliquez sur les en-têtes pour trier les colonnes.
                Utilisez la recherche pour filtrer les résultats.
              </caption>
              
              <thead>
                <tr>
                  {Object.keys(currentResults[0])
                    .filter((key) => key !== "url_fichier")
                    .map((key) => (
                      <th
                        key={key}
                        scope="col"
                        tabIndex="0"
                        onClick={() => requestSort(key)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            requestSort(key);
                          }
                        }}
                        aria-sort={
                          sortConfig.key === key
                            ? sortConfig.direction
                            : "none"
                        }
                        className="sortable-header"
                        aria-label={`Trier par ${key}`}
                      >
                        {key}
                        {sortConfig.key === key && (
                          <span aria-hidden="true">
                            {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                          </span>
                        )}
                      </th>
                    ))}
                </tr>
              </thead>
              
              <tbody>
                {currentResults.map((row, index) => (
                  <tr key={index}>
                    {Object.entries(row)
                      .filter(([key]) => key !== "url_fichier")
                      .map(([key, value], i) => (
                        <td key={i}>
                          {key === "nom_fichier" && row.url_fichier ? (
                            <a
                              href={row.url_fichier}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Télécharger ${value}`}
                            >
                              {value}
                            </a>
                          ) : (
                            String(value)
                          )}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-results" role="status">
            <p>Aucun résultat trouvé</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="clear-search"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}

        {/* Pagination bas (si nécessaire) */}
        {totalPages > 1 && (
          <nav aria-label="Pagination" className="pagination">
            <div className="pagination-controls">
              <button
                onClick={() => {
                  handlePageChange(currentPage - 1);
                  window.scrollTo(0, 0);
                }}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                Précédent
              </button>
              <span className="page-indicator">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => {
                  handlePageChange(currentPage + 1);
                  window.scrollTo(0, 0);
                }}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
              >
                Suivant
              </button>
            </div>
          </nav>
        )}
      </main>
    </div>
  );
};

export default QueryResult;

