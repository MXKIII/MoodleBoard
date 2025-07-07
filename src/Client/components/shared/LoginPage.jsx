import React, { useState } from "react";
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
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState("Student");
  const { setUserRole } = useUser();
  // Variables d'environnement pour l'API
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const PORT = import.meta.env.VITE_PORT;

  // Gestion de la soumission du formulaire de connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Logging in with:", { userId, password });
    try {
      // Appel API pour vérifier les identifiants et le rôle
      const response = await axios.post(`${API_BASE_URL}:${PORT}/api/login`, {
        userId,
        password,
        role,
      });
      if (response.data.success) {
        // Si connexion réussie, met à jour le contexte, le localStorage et redirige
        console.log("Connexion réussie");
        login();
        setUserRole(role);
        localStorage.setItem("userId", response.data.userId);
        localStorage.setItem("userRole", role);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("USERNAME", userId);
        localStorage.setItem("PASSWORD", password);
        onLoginSuccess(role);
        window.location.href = `/${role}`;
      } else {
        setError("Identifiants invalides");
      }
    } catch (error) {
      // Gestion des erreurs de connexion ou de rôle
      if (error.response) {
        if (error.response.status === 403) {
          setError("Rôle incorrect");
        } else {
          setError("Identifiants invalides");
        }
      } else {
        setError("Erreur de connexion");
      }
    }
  };

  return (
    <div>
      <h2>Connexion</h2>
      {/* Formulaire de connexion */}
      <form className="login-form" onSubmit={handleLogin}>
        <label htmlFor="role-select">Rôle</label>
        <select
          id="role-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Student">Élève</option>
          <option value="Teacher">Professeur</option>
          <option value="Manager">Administrateur</option>
        </select>
        <label htmlFor="user-id" className="custom-field">
          <input
            id="user-id"
            type="text"
            required
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="login-input"
            aria-label="Id utilisateur"
          />
          <span className="placeholder">Id utilisateur</span>
        </label>
        <label htmlFor="user-password" className="custom-field">
          <input
            id="user-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            aria-label="Mot de passe"
          />
          <span className="placeholder">Mot de passe</span>
        </label>
        <button type="submit" className="connection-button">
          Se connecter
        </button>
      </form>
      {/* Affichage d'un message d'erreur si besoin */}
      {error && <p role="alert">{error}</p>}
    </div>
  );
};

export default LoginPage;
