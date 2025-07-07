import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useUser } from "./UserContext";

const QueryResult = () => {
  const location = useLocation();
  const { results, tableName } = location.state || {
    results: [],
    tableName: "",
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState(results);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { userRole } = useUser();
  const resultsPerPage = 100;

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredRows(results);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const newFilteredRows = results.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(lowercasedTerm)
        )
      );
      setFilteredRows(newFilteredRows);
    }
  }, [searchTerm, results]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    sortRows(key, direction);
  };

  // Calcul des indices pour la pagination
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  // Découpe les résultats filtrés pour n'afficher que ceux de la page courante
  const currentResults = filteredRows.slice(
    indexOfFirstResult,
    indexOfLastResult
  );
  // Calcule le nombre total de pages pour la pagination
  const totalPages = Math.ceil(filteredRows.length / resultsPerPage);

  // Fonction de tri des lignes selon la colonne et le sens choisi
  const sortRows = (key, direction) => {
    const sortedData = [...filteredRows].sort((a, b) => {
      // Si la colonne est une date, on convertit pour pourvoir trier correctement
      if (
        key.toLowerCase().includes("date") ||
        key === "dernier_accès" ||
        key === "début" ||
        key === "fin"
      ) {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        if (dateA < dateB) return direction === "ascending" ? -1 : 1;
        if (dateA > dateB) return direction === "ascending" ? 1 : -1;
        return 0;
      } else {
        // Sinon, tri classique (texte ou nombre)
        if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
        if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
        return 0;
      }
    });
    setFilteredRows(sortedData);
  };

  return (
    <main>
      <nav className="return" aria-label="Fil d'Ariane">
        <Link to={`/${userRole}`}>Retour à l'accueil</Link>
      </nav>
      <h1 id="table-title">Résultats de la table : {tableName}</h1>

      <form
        role="search"
        className="search-form"
        aria-label="Recherche dans les résultats"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="search-input" className="sr-only">
          Rechercher dans les résultats
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "10px", width: "100%" }}
        />
      </form>

      {/* Pagination haut */}
      <nav
        className="pagination"
        aria-label="Pagination des résultats"
        role="navigation"
      >
        <ul className="pagination-list" aria-label="Liste des pages">
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i}>
              <button
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? "active" : ""}
                aria-current={currentPage === i + 1 ? "page" : undefined}
                aria-label={`Page ${i + 1}`}
                type="button"
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section className="tableau2" aria-labelledby="table-title">
        {currentResults.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table aria-describedby="table-desc">
              <caption id="table-desc" className="sr-only">
                Résultats paginés et triables de la table {tableName}
              </caption>
              <thead>
                <tr>
                  {Object.keys(currentResults[0])
                    .filter((key) => key !== "url_fichier")
                    .map((key) => (
                      <th
                        key={key}
                        scope="col"
                        tabIndex={0}
                        onClick={() => requestSort(key)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            requestSort(key);
                        }}
                        aria-sort={
                          sortConfig.key === key
                            ? sortConfig.direction === "ascending"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                        style={{ cursor: "pointer" }}
                      >
                        {key}{" "}
                        {sortConfig.key === key
                          ? sortConfig.direction === "ascending"
                            ? "↑"
                            : "↓"
                          : ""}
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
                              aria-label={`Télécharger le fichier ${value}`}
                            >
                              {value}
                            </a>
                          ) : (
                            value
                          )}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Aucun résultat à afficher</p>
        )}
      </section>

      {/* Pagination bas */}
      <nav
        className="pagination"
        aria-label="Pagination des résultats"
        role="navigation"
      >
        <ul className="pagination-list" aria-label="Liste des pages">
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i}>
              <button
                onClick={() => {
                  setCurrentPage(i + 1);
                  window.scrollTo(0, 0);
                }}
                className={currentPage === i + 1 ? "active" : ""}
                aria-current={currentPage === i + 1 ? "page" : undefined}
                aria-label={`Page ${i + 1}`}
                type="button"
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
};

export default QueryResult;
