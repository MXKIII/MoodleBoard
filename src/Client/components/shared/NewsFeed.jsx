import React, { useEffect, useState } from "react";
import axios from "axios";

// Récupération des variables d'environnement
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PORT = import.meta.env.VITE_PORT;

export default function NewsFeed() {
  // news : liste des actualités à afficher
  // form : état du formulaire pour ajouter/éditer une actu
  // editingId : identifiant de l'actu en cours d'édition (null si ajout)
  // showModal : contrôle l'affichage de la fenêtre modale
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", target: "all" });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // Récupère le rôle utilisateur depuis le localStorage
  const userRole = localStorage.getItem("userRole");

  // Fonction pour récupérer les actualités depuis l'API selon le rôle
  const fetchNews = async () => {
    let target;
    if (userRole && typeof userRole === "string") {
      target = userRole.toLowerCase();
    }
    const response = await axios.get(`${API_BASE_URL}:${PORT}/api/news`, {
      params: { target },
    });
    setNews(response.data);
  };

  // Récupère les actualités à chaque changement de rôle utilisateur
  useEffect(() => {
    fetchNews();
  }, [userRole]);

  // Met à jour le formulaire lors de la saisie
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Soumission du formulaire (ajout ou modification d'une actu)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`${API_BASE_URL}:${PORT}/api/news/${editingId}`, form);
    } else {
      await axios.post(`${API_BASE_URL}:${PORT}/api/news`, form);
    }
    setForm({ title: "", content: "", target: "all" });
    setEditingId(null);
    setShowModal(false);
    fetchNews();
  };

  // Prépare l'édition d'une actu (remplit le formulaire et ouvre la modale)
  const handleEdit = (actu) => {
    setForm(actu);
    setEditingId(actu.id);
    setShowModal(true);
  };

  // Supprime une actu
  const handleDelete = async (id) => {
    await axios.delete(`${API_BASE_URL}:${PORT}/api/news/${id}`);
    fetchNews();
  };

  // Ouvre la fenêtre modale pour ajouter une actu
  const handleOpenModal = () => {
    setForm({ title: "", content: "", target: "all" });
    setEditingId(null);
    setShowModal(true);
  };

  // Ferme la fenêtre modale et réinitialise le formulaire
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ title: "", content: "", target: "all" });
  };

  return (
    <div>
      <h2>Fil d'actualités</h2>
      {/* Bouton pour ouvrir la modale d'ajout visible uniquement pour Manager */}
      {userRole === "Manager" && !showModal && (
        <button className="open-modal-button" onClick={handleOpenModal}>
          Ajouter une actu
        </button>
      )}
      {/* Fenêtre modale pour ajouter ou éditer une actu */}
      {showModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex="-1"
          onKeyDown={(e) => {
            if (e.key === "Escape") handleCloseModal();
          }}
        >
          <div className="modal-content">
            <h2 id="modal-title">
              {editingId
                ? "Mise à jour de la publication"
                : "Nouvelle publication"}
            </h2>
            <form onSubmit={handleSubmit} className="news-form">
              <div className="custom-field">
                <label htmlFor="news-title">Titre</label>
                <input
                  id="news-title"
                  className="news-title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  autoFocus
                />
              </div>
              <div className="custom-field">
                <label htmlFor="news-content">Contenu</label>
                <textarea
                  id="news-content"
                  className="news-content"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
              </div>
              <div className="custom-field">
                <label htmlFor="news-image-url">
                  URL de l'image (optionnel)
                </label>
                <input
                  id="news-image-url"
                  className="news-image-url"
                  name="image_url"
                  value={form.image_url || ""}
                  onChange={handleChange}
                  type="url"
                  inputMode="url"
                  aria-describedby="img-url-desc"
                />
                <span id="img-url-desc" className="sr-only">
                  Laisser vide si pas d'image
                </span>
              </div>
              <div className="custom-field">
                <label htmlFor="news-target">Cible</label>
                <select
                  id="news-target"
                  name="target"
                  value={form.target}
                  onChange={handleChange}
                >
                  <option value="all">Tous</option>
                  <option value="student">Étudiants</option>
                  <option value="teacher">Enseignants</option>
                </select>
              </div>
              <div
                className="news-options"
                role="group"
                aria-label="Actions du formulaire"
              >
                <button type="submit" className="news-options-button">
                  {editingId ? "Modifier" : "Publier"}
                </button>
                <button
                  type="button"
                  className="news-options-button"
                  onClick={handleCloseModal}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Liste des actualités */}
      <ul className="news-list">
        {news.map((actu) => (
          <li key={actu.id}>
            <div className="news-content">
              <strong>{actu.title}</strong>
              {/* Affiche la cible pour le manager */}
              {userRole === "Manager" && <em>({actu.target})</em>}
              {/* Affiche l'image si présente */}
              {actu.image_url && (
                <img
                  src={actu.image_url}
                  alt={actu.title}
                  style={{
                    maxWidth: "80%",
                    margin: "10px 0",
                    borderRadius: "8px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                />
              )}
              <p>{actu.content}</p>
              <div className="news-options">
                {/* Boutons d'édition et suppression visibles uniquement pour le manager */}
                {userRole === "Manager" && (
                  <>
                    <button
                      onClick={() => handleEdit(actu)}
                      className="news-options-button"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => handleDelete(actu.id)}
                      className="news-options-button"
                    >
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
