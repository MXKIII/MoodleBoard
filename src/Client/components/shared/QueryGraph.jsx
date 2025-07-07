import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "../../UserContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Enregistrement des composants de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Composant principal pour afficher le graphique et les résultats détaillés
const QueryGraph = () => {
  const location = useLocation();

  // Récupération des données passées via la navigation (state)
  const { results, message, userType } = location.state || {
    results: [],
    message: "",
    userType: "student",
  };

  // States pour la gestion du graphique, des résultats, de la sélection, etc.
  const [chartData, setChartData] = useState(null);
  const [selectedDateData, setSelectedDateData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState(results);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "ascending",
  });
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const PORT = import.meta.env.VITE_PORT;
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 25;
  const { userRole } = useUser();

  // Génère les données du graphique à partir des résultats reçus
  useEffect(() => {
    if (results && results.length > 0) {
      const labels = results.map((item) => {
        const date = new Date(`${item.jour}T00:00:00Z`);
        return date.toISOString().split("T")[0];
      });
      const data = results.map((item) => item.nombre_connexions);

      setChartData({
        labels,
        datasets: [
          {
            label: "Nombre de connexions",
            data,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: "rgba(75, 192, 192, 1)",
            tension: 0.4,
          },
        ],
      });
    }
  }, [results]);

  // Met à jour les résultats filtrés selon la recherche ou la date sélectionnée
  useEffect(() => {
    if (searchTerm === "") {
      if (selectedDate && selectedDateData.length > 0) {
        setFilteredRows(selectedDateData);
      } else {
        setFilteredRows(results);
      }
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const sourceData =
        selectedDate && selectedDateData.length > 0
          ? selectedDateData
          : results;
      const newFilteredRows = sourceData.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(lowercasedTerm)
        )
      );
      setFilteredRows(newFilteredRows);
    }
  }, [searchTerm, selectedDate, selectedDateData, results]);

  // Gestion du clic sur un point du graphique pour afficher les détails de la date sélectionnée
  const handlePointClick = async (event, elements) => {
    if (!elements.length) return;

    const index = elements[0].index;
    const date = chartData.labels[index];
    setSelectedDate(date);
    try {
      let apiUrl = "";
      // Sélectionne l'API à appeler selon le type d'utilisateur
      switch (userType) {
        case "student":
          apiUrl = `${API_BASE_URL}:${PORT}/api/active-student-by-date`;
          break;
        case "teacher":
          apiUrl = `${API_BASE_URL}:${PORT}/api/active-teacher-by-date`;
          break;
        case "admin":
          apiUrl = `${API_BASE_URL}:${PORT}/api/active-admin-by-date`;
          break;
        case "other":
          apiUrl = `${API_BASE_URL}:${PORT}/api/active-other-by-date`;
          break;
        default:
          console.error("Type d'utilisateur inconnu:", userType);
          return;
      }
      // Appel API pour récupérer les données détaillées de la date sélectionnée
      const response = await axios.post(apiUrl, { date });
      setSelectedDateData(response.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setSelectedDateData([]);
    }
  };

  // Fonction pour demander un tri sur une colonne
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
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    setFilteredRows(sortedData);
  };

  return (
    <main>
      <div className="query-graph">
        {/* Fil d'Ariane pour revenir à l'accueil selon le rôle */}
        <nav className="return" aria-label="Fil d'Ariane">
          <Link to={`/${userRole}`}>Retour à l'accueil</Link>
        </nav>
        {/* Titre du graphique */}
        <h1 id="graph-title">{message}</h1>
        {/* Affichage du graphique si les données sont présentes */}
        {chartData ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Activité des utilisateurs par jour",
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Date",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "Nombre de connexions",
                  },
                  beginAtZero: true,
                },
              },
              onClick: handlePointClick, // Gère le clic sur un point du graphique
            }}
            aria-label="Graphique du nombre de connexions par jour"
            role="img"
          />
        ) : (
          <p>Aucune donnée disponible pour afficher le graphique.</p>
        )}
      </div>
      {/* Affichage du tableau détaillé si une date est sélectionnée */}
      {selectedDate && (
        <section className="tableau2" aria-labelledby="details-title">
          <button
            className="table-close"
            onClick={() => setSelectedDate("")}
            aria-label="Fermer les détails de la date sélectionnée"
          >
            X
          </button>
          <h2 id="details-title">
            Détails pour la date sélectionnée : {selectedDate}
          </h2>
          {/* Barre de recherche pour filtrer les résultats */}
          <form
            role="search"
            aria-label="Recherche dans les résultats"
            style={{ marginBottom: "20px" }}
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
              style={{
                marginBottom: "20px",
                padding: "10px",
                width: "100%",
                border: "solid 2px #4a90e2",
                borderRadius: "5px",
              }}
            />
          </form>
          {/* Affichage du tableau paginé et triable */}
          {currentResults.length > 0 ? (
            <>
              <div style={{ overflowX: "auto" }}>
                <table aria-describedby="table-desc">
                  <caption id="table-desc" className="sr-only">
                    Résultats paginés et triables pour la date {selectedDate}
                  </caption>
                  <thead>
                    <tr>
                      {/* Génère dynamiquement les colonnes du tableau */}
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
                    {/* Affiche chaque ligne du tableau, avec lien de téléchargement si disponible */}
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
            </>
          ) : (
            <p>Aucun résultat à afficher</p>
          )}

          {/* Pagination des résultats */}
          <nav
            className="pagination"
            aria-label="Pagination des résultats"
            role="navigation"
          >
            <ul className="pagination-list" aria-label="Liste des pages">
              {/* Génère dynamiquement les boutons de pagination */}
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
        </section>
      )}
    </main>
  );
};

export default QueryGraph;
