import React, { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "./UserContext";
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

const QueryGraph = () => {
  const location = useLocation();
  const { userRole } = useUser();

  // Récupération des données passées
  const { results, message, userType } = location.state || {
    results: [],
    message: "Graphique d'activité",
    userType: "student",
  };

  // États essentiels
  const [chartData, setChartData] = useState(null);
  const [selectedDateData, setSelectedDateData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Refs pour accessibilité
  const chartRef = useRef(null);
  const detailsRef = useRef(null);

  // Variables API
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const PORT = import.meta.env.VITE_PORT;

  // Fonction pour obtenir la configuration avec token
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  // Génération données graphique
  useEffect(() => {
    if (results && results.length > 0) {
      const labels = results.map((item) => {
        const date = new Date(`${item.jour}T00:00:00Z`);
        return date.toLocaleDateString("fr-FR");
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
            pointRadius: 6,
            pointBackgroundColor: "rgba(75, 192, 192, 1)",
            tension: 0.4,
          },
        ],
      });
    }
  }, [results]);

  // Focus management pour détails
  useEffect(() => {
    if (selectedDate && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: "smooth" });
      detailsRef.current.focus();
    }
  }, [selectedDate]);

  // Gestion clic sur graphique
  const handlePointClick = async (event, elements) => {
    if (!elements.length) return;

    const index = elements[0].index;
    const date = chartData.labels[index];
    const rawDate = results[index].jour;

    setSelectedDate(date);
    setIsLoading(true);
    setError("");

    try {
      // Simplification : URLs API uniformisées
      const apiEndpoints = {
        student: "active-student-by-date",
        teacher: "active-teacher-by-date",
        admin: "active-admin-by-date",
        other: "active-other-by-date",
      };

      const endpoint = apiEndpoints[userType] || apiEndpoints.student;
      
      // Configuration avec token
      const config = getAuthConfig();
      
      const response = await axios.post(
        `${API_BASE_URL}/api/${endpoint}`,
        { date: rawDate },
        config // Passage de la configuration avec token
      );

      setSelectedDateData(response.data || []);
    } catch (error) {
      console.error("Erreur récupération données:", error);
      setError("Impossible de charger les détails pour cette date.");
      setSelectedDateData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrage recherche
  const filteredData = selectedDateData.filter((row) =>
    searchTerm === "" ||
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Options graphique accessibles
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: message,
      },
      tooltip: {
        callbacks: {
          title: (context) => `Date : ${context[0].label}`,
          label: (context) => `Connexions : ${context.parsed.y}`,
        },
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
    onClick: handlePointClick,
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? "pointer" : "default";
    },
  };

  return (
    <div className="query-graph">
      {/* Navigation retour */}
      <nav aria-label="Navigation">
        <Link to={`/${userRole}`} className="back-link">
          ← Retour au tableau de bord
        </Link>
      </nav>

      {/* En-tête accessible */}
      <header>
        <h1 id="graph-title">{message}</h1>
        <p>Cliquez sur un point du graphique pour voir les détails de cette date.</p>
      </header>

      <main>
        {/* Graphique accessible */}
        <section aria-labelledby="graph-title">
          {chartData ? (
            <div className="chart-container" style={{ height: "400px", marginBottom: "2rem" }}>
              <Line
                ref={chartRef}
                data={chartData}
                options={chartOptions}
                aria-label={`Graphique d'activité : ${message}. Cliquez sur les points pour voir les détails.`}
                role="img"
              />
            </div>
          ) : (
            <div className="no-data" role="status">
              <p>Aucune donnée disponible pour afficher le graphique.</p>
            </div>
          )}
        </section>

        {/* Détails de date sélectionnée */}
        {selectedDate && (
          <section
            ref={detailsRef}
            className="date-details"
            aria-labelledby="details-title"
            tabIndex="-1"
          >
            <header className="details-header">
              <h2 id="details-title">Détails pour le {selectedDate}</h2>
              <button
                className="close-details"
                onClick={() => {
                  setSelectedDate("");
                  setSearchTerm("");
                  setError("");
                }}
                aria-label="Fermer les détails"
              >
                ×
              </button>
            </header>

            {/* Recherche dans détails */}
            <div className="search-section">
              <label htmlFor="details-search">Rechercher dans les détails</label>
              <input
                id="details-search"
                type="search"
                placeholder="Tapez votre recherche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">
                Recherche en temps réel dans tous les champs
              </div>
            </div>

            {/* État de chargement */}
            {isLoading && (
              <div className="loading" role="status" aria-live="polite">
                Chargement des détails...
              </div>
            )}

            {/* Gestion d'erreur */}
            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}

            {/* Tableau accessible */}
            {!isLoading && !error && filteredData.length > 0 && (
              <div className="table-container">
                <table aria-labelledby="details-title" aria-describedby="table-desc">
                  <caption id="table-desc" className="sr-only">
                    {filteredData.length} résultat{filteredData.length > 1 ? "s" : ""} pour la date du{" "}
                    {selectedDate}
                    {searchTerm && ` correspondant à "${searchTerm}"`}
                  </caption>

                  <thead>
                    <tr>
                      {Object.keys(filteredData[0])
                        .filter((key) => key !== "url_fichier")
                        .map((key) => (
                          <th key={key} scope="col">
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.map((row, index) => (
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
            )}

            {/* Message aucun résultat */}
            {!isLoading && !error && filteredData.length === 0 && selectedDateData.length > 0 && (
              <div className="no-results" role="status">
                <p>Aucun résultat trouvé pour "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="clear-search"
                >
                  Effacer la recherche
                </button>
              </div>
            )}

            {!isLoading && !error && selectedDateData.length === 0 && (
              <div className="no-data" role="status">
                <p>Aucune donnée disponible pour cette date.</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default QueryGraph;
