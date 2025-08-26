import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Authentification";
import { useUser } from "./UserContext";

// Composant de page de connexion utilisateur
const LoginPage = ({ onLoginSuccess }) => {
  // States pour l'identifiant, le mot de passe, le rôle, et la gestion des erreurs
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState("Student");
  const { setUserRole } = useUser();
  
  //  Refs pour gestion du focus
  const errorRef = useRef(null);
  const formRef = useRef(null);

  // Variables d'environnement pour l'API
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const PORT = import.meta.env.VITE_PORT;

  //  Focus sur erreur quand elle apparaît
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  // Gestion de la soumission du formulaire de connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Reset erreur précédente
    
    try {
      // Appel API pour vérifier les identifiants et le rôle
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        userId,
        password,
        role,
      });
      
      if (response.data.success) {
        // Si connexion réussie, stocke le token et met à jour le contexte et redirige
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.userId);
        localStorage.setItem("userRole", role);
        localStorage.setItem("isLoggedIn", "true");
        login({
          userId: response.data.userId,
          userRole: role,
          userName: userId
        });
        setUserRole(role);
        
        onLoginSuccess(role);
        navigate(`/${role}`);
      } else {
        setError("Identifiants invalides");
      }
    } catch (error) {
      // Gestion des erreurs de connexion ou de rôle
      if (error.response) {
        if (error.response.status === 403) {
          setError("Rôle incorrect pour cet utilisateur");
        } else {
          setError("Identifiants invalides");
        }
      } else {
        setError("Erreur de connexion au serveur");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/*  En-tête accessible */}
      <header>
        <h1 id="login-title">Connexion à la plateforme</h1>
        <p>Veuillez saisir vos identifiants pour accéder à votre espace personnel.</p>
      </header>

      {/*  Formulaire accessible */}
      <main>
        <form 
          ref={formRef}
          className="login-form" 
          onSubmit={handleLogin}
          aria-labelledby="login-title"
          noValidate
        >
          {/*  Sélection du rôle */}
          <div className="form-group">
            <label htmlFor="role-select" className="form-label">
              Rôle <span aria-label="obligatoire">*</span>
            </label>
            <select
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
              required
              aria-describedby="role-help"
            >
              <option value="Student">Élève</option>
              <option value="Teacher">Professeur</option>
              <option value="Manager">Administrateur</option>
            </select>
            <div id="role-help" className="form-help">
              Sélectionnez votre rôle dans l'établissement
            </div>
          </div>

          {/*  Champ identifiant */}
          <div className="form-group">
            <label htmlFor="user-id" className="form-label">
              Identifiant utilisateur <span aria-label="obligatoire">*</span>
            </label>
            <input
              id="user-id"
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="form-input"
              aria-describedby="userid-help"
              autoComplete="username"
            />
            <div id="userid-help" className="form-help">
              Votre identifiant fourni par l'établissement
            </div>
          </div>

          {/*  Champ mot de passe */}
          <div className="form-group">
            <label htmlFor="user-password" className="form-label">
              Mot de passe <span aria-label="obligatoire">*</span>
            </label>
            <input
              id="user-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              aria-describedby="password-help"
              autoComplete="current-password"
            />
            <div id="password-help" className="form-help">
              Votre mot de passe personnel
            </div>
          </div>

          {/*  Bouton de soumission */}
          <div className="form-group">
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
              aria-describedby={error ? "login-error" : undefined}
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </div>
        </form>

        {/*  Message d'erreur accessible */}
        {error && (
          <div 
            ref={errorRef}
            id="login-error"
            className="error-message" 
            role="alert"
            aria-live="assertive"
            tabIndex="-1"
          >
            <span className="error-icon" aria-hidden="true">⚠️</span>
            {error}
          </div>
        )}

        {/*  Indicateur de chargement */}
        {isLoading && (
          <div 
            className="loading-indicator" 
            role="status" 
            aria-live="polite"
          >
            <span className="sr-only">Connexion en cours, veuillez patienter...</span>
            <div className="loading-spinner" aria-hidden="true"></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LoginPage;
