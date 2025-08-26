import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

// Récupération des variables d'environnement
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PORT = import.meta.env.VITE_PORT;

export default function NewsFeed() {
  // États du composant
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", target: "all" });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Refs pour la gestion du focus
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  
  // Récupère le rôle utilisateur depuis le localStorage
  const userRole = localStorage.getItem("userRole");
  const isManager = userRole === "Manager";

  // Piéger le focus dans la modale
  const trapFocus = useCallback((e) => {
    if (!modalRef.current) return;
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  }, []);

  // Validation des champs
  const validateField = useCallback((name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'Le titre est obligatoire';
        } else if (value.length > 100) {
          newErrors.title = 'Le titre ne peut pas dépasser 100 caractères';
        } else {
          delete newErrors.title;
        }
        break;
      case 'content':
        if (!value.trim()) {
          newErrors.content = 'Le contenu est obligatoire';
        } else if (value.length > 1000) {
          newErrors.content = 'Le contenu ne peut pas dépasser 1000 caractères';
        } else {
          delete newErrors.content;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  }, [errors]);

  // Fonction pour récupérer les actualités depuis l'API selon le rôle
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let target;
      if (userRole && typeof userRole === "string") {
        target = userRole.toLowerCase();
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/news`, {
        params: { target },
      });
      setNews(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des actualités");
      console.error("Erreur fetchNews:", err);
    } finally {
      setLoading(false);
    }
  };

  // Récupère les actualités à chaque changement de rôle utilisateur
  useEffect(() => {
    fetchNews();
  }, [userRole]);

  // Gestion du focus pour l'accessibilité de la modale
  useEffect(() => {
    if (showModal) {
      previousFocusRef.current = document.activeElement;
      modalRef.current?.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [showModal]);

  // Met à jour le formulaire lors de la saisie
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validateField(name, value);
  };

  // Soumission du formulaire (ajout ou modification d'une actu)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/news/${editingId}`, form);
      } else {
        await axios.post(`${API_BASE_URL}/api/news`, form);
      }
      
      setForm({ title: "", content: "", target: "all" });
      setEditingId(null);
      setShowModal(false);
      await fetchNews();
    } catch (err) {
      setError("Erreur lors de la sauvegarde");
      console.error("Erreur handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };

  // Prépare l'édition d'une actu (remplit le formulaire et ouvre la modale)
  const handleEdit = (actu) => {
    setForm(actu);
    setEditingId(actu.id);
    setShowModal(true);
  };

  // Confirmation de suppression accessible
  const handleDeleteConfirm = (id, title) => {
    setShowDeleteConfirm({ id, title });
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/news/${showDeleteConfirm.id}`);
      await fetchNews();
    } catch (err) {
      setError("Erreur lors de la suppression");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  // Gestion des événements clavier pour les modales
  const handleModalKeyDown = (e) => {
    if (e.key === "Escape") {
      if (showDeleteConfirm) {
        setShowDeleteConfirm(null);
      } else {
        handleCloseModal();
      }
    }
    trapFocus(e);
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

  if (loading && news.length === 0) {
    return (
      <section aria-labelledby="news-title" className="news-feed">
        <header>
          <h2 id="news-title">Fil d'actualités</h2>
        </header>
        <div className="loading-state" aria-live="polite">
          Chargement des actualités...
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="news-title" className="news-feed">
      <header className="news-feed__header">
        <h2 id="news-title">Fil d'actualités</h2>
        
        {/* Message d'erreur */}
        {error && (
          <div className="error-message" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        
        {/* Bouton pour ouvrir la modale d'ajout visible uniquement pour Manager */}
        {isManager && !showModal && (
          <button 
            className="news-feed__add-button"
            onClick={handleOpenModal}
            type="button"
            aria-describedby="add-news-desc"
          >
            <span aria-hidden="true">+</span>
            Ajouter une actualité
          </button>
        )}
        <div id="add-news-desc" className="sr-only">
          Ouvre une fenêtre pour créer une nouvelle actualité
        </div>
      </header>

      {/* Fenêtre modale pour ajouter ou éditer une actu */}
      {showModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          onKeyDown={handleModalKeyDown}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div 
            className="modal-content"
            ref={modalRef}
            tabIndex="-1"
          >
            <header className="modal-header">
              <h3 id="modal-title">
                {editingId ? "Modifier l'actualité" : "Nouvelle actualité"}
              </h3>
              <p id="modal-description" className="sr-only">
                {editingId 
                  ? "Formulaire de modification d'une actualité existante"
                  : "Formulaire de création d'une nouvelle actualité"
                }
              </p>
              <button
                type="button"
                className="modal-close"
                onClick={handleCloseModal}
                aria-label="Fermer la fenêtre"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </header>

            <form onSubmit={handleSubmit} className="news-form" noValidate>
              <fieldset>
                <legend className="sr-only">
                  Informations de l'actualité
                </legend>

                <div className="form-field">
                  <label htmlFor="news-title" className="form-label">
                    Titre <span aria-label="obligatoire">*</span>
                  </label>
                  <input
                    id="news-title"
                    className="form-input"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-describedby="title-error"
                    autoFocus
                    maxLength="100"
                  />
                  <div id="title-error" className="error-text" aria-live="polite">
                    {errors.title}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="news-content" className="form-label">
                    Contenu <span aria-label="obligatoire">*</span>
                  </label>
                  <textarea
                    id="news-content"
                    className="form-textarea"
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-describedby="content-help content-error"
                    rows="5"
                    maxLength="1000"
                  />
                  <div id="content-help" className="form-help">
                    Décrivez votre actualité (maximum 1000 caractères)
                  </div>
                  <div id="content-error" className="error-text" aria-live="polite">
                    {errors.content}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="news-image-url" className="form-label">
                    URL de l'image (optionnel)
                  </label>
                  <input
                    id="news-image-url"
                    className="form-input"
                    name="image_url"
                    type="url"
                    value={form.image_url || ""}
                    onChange={handleChange}
                    inputMode="url"
                    aria-describedby="img-url-help"
                    placeholder="https://exemple.com/image.jpg"
                  />
                  <div id="img-url-help" className="form-help">
                    Ajoutez l'URL d'une image pour illustrer votre actualité
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="news-target" className="form-label">
                    Public cible
                  </label>
                  <select
                    id="news-target"
                    className="form-select"
                    name="target"
                    value={form.target}
                    onChange={handleChange}
                    aria-describedby="target-help"
                  >
                    <option value="all">Tous les utilisateurs</option>
                    <option value="student">Étudiants uniquement</option>
                    <option value="teacher">Enseignants uniquement</option>
                  </select>
                  <div id="target-help" className="form-help">
                    Choisissez qui peut voir cette actualité
                  </div>
                </div>
              </fieldset>

              <footer className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn--primary"
                  disabled={loading || !form.title.trim() || !form.content.trim()}
                >
                  {loading ? "Enregistrement..." : (editingId ? "Modifier" : "Publier")}
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Annuler
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          aria-describedby="delete-description"
          onKeyDown={handleModalKeyDown}
        >
          <div className="modal-content" ref={modalRef} tabIndex="-1">
            <header className="modal-header">
              <h3 id="delete-title">Confirmer la suppression</h3>
            </header>
            <div className="modal-body">
              <p id="delete-description">
                Êtes-vous sûr de vouloir supprimer définitivement l'actualité 
                <strong> "{showDeleteConfirm.title}"</strong> ?
              </p>
              <p>Cette action est irréversible.</p>
            </div>
            <footer className="modal-actions">
              <button 
                onClick={confirmDelete} 
                className="btn btn--danger"
                disabled={loading}
                autoFocus
              >
                {loading ? "Suppression..." : "Supprimer définitivement"}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(null)} 
                className="btn btn--secondary"
                disabled={loading}
              >
                Annuler
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Liste des actualités */}
      <main className="news-content">
        {news.length === 0 ? (
          <div className="empty-state">
            <p>Aucune actualité disponible pour le moment.</p>
          </div>
        ) : (
          <ul className="news-list" role="list">
            {news.map((actu) => (
              <li key={actu.id} className="news-item">
                <article 
                  className="news-card"
                  aria-labelledby={`news-title-${actu.id}`}
                >
                  <header className="news-card__header">
                    <h3 id={`news-title-${actu.id}`} className="news-card__title">
                      {actu.title}
                    </h3>
                    
                    {/* Affiche la cible pour le manager */}
                    {isManager && (
                      <span className="news-card__target" aria-label={`Public cible: ${actu.target}`}>
                        ({actu.target === 'all' ? 'Tous' : 
                          actu.target === 'student' ? 'Étudiants' : 'Enseignants'})
                      </span>
                    )}
                  </header>

                  <div className="news-card__content">
                    {/* Affiche l'image si présente */}
                    {actu.image_url && (
                      <figure className="news-card__figure">
                        <img
                          src={actu.image_url}
                          alt={`Illustration pour: ${actu.title}`}
                          className="news-card__image"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </figure>
                    )}
                    
                    <div className="news-card__text">
                      <p>{actu.content}</p>
                    </div>
                  </div>

                  {/* Actions pour le manager */}
                  {isManager && (
                    <footer className="news-card__actions">
                      <div role="group" aria-label={`Actions pour ${actu.title}`}>
                        <button
                          onClick={() => handleEdit(actu)}
                          className="btn btn--small btn--outline"
                          type="button"
                          aria-label={`Modifier ${actu.title}`}
                        >
                          <span aria-hidden="true">✏️</span>
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(actu.id, actu.title)}
                          className="btn btn--small btn--danger"
                          type="button"
                          aria-label={`Supprimer ${actu.title}`}
                        >
                          <span aria-hidden="true">🗑️</span>
                          Supprimer
                        </button>
                      </div>
                    </footer>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Améliorer l'indicateur de chargement */}
      {loading && (
        <div 
          className="loading-overlay" 
          role="status"
          aria-live="polite"
          aria-label="Opération en cours"
        >
          <div className="loading-spinner" aria-hidden="true"></div>
          <span>Chargement en cours...</span>
        </div>
      )}
    </section>
  );
}
