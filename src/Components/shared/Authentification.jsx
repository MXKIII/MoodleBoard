import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";

// Création du contexte d'authentification
const AuthContext = createContext(null);

// Provider qui encapsule l'application et fournit l'état d'authentification et les fonctions associées
export const AuthProvider = ({ children }) => {
  const authAnnouncerRef = useRef(null);
  // isAuthenticated : indique si l'utilisateur est connecté (initialisé depuis le localStorage)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [authMessage, setAuthMessage] = useState("");

  // Annonces pour lecteurs d'écran
  const announceAuthChange = useCallback((message) => {
    setAuthMessage(message);
    if (authAnnouncerRef.current) {
      authAnnouncerRef.current.textContent = message;
    }
    // Efface après 3s
    setTimeout(() => setAuthMessage(""), 3000);
  }, []);

  // Synchronise l'état d'authentification avec le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  //  Gestion du focus
  const login = useCallback((userInfo = {}) => {
    setIsAuthenticated(true);

    if (userInfo.userId) localStorage.setItem("userId", userInfo.userId);
    if (userInfo.userRole) localStorage.setItem("userRole", userInfo.userRole);

    announceAuthChange(`Connexion réussie. Bienvenue ${userInfo.userName || 'Utilisateur'}.`);

    // Focus sur contenu principal
    setTimeout(() => {
      const mainContent = document.getElementById('main-content') || document.querySelector('main');
      if (mainContent) mainContent.focus();
    }, 100);
  }, [announceAuthChange]);

  // Fonction pour déconnecter l'utilisateur
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");

    announceAuthChange("Déconnexion réussie.");

    // Focus sur formulaire de connexion
    setTimeout(() => {
      const loginForm = document.querySelector('input[type="email"], input[type="text"]');
      if (loginForm) loginForm.focus();
    }, 100);
  }, [announceAuthChange]);

  return (
    // Fournit le contexte d'authentification à tous les composants enfants
    <AuthContext.Provider value={{ isAuthenticated, login, logout, announceAuthChange }}>
      {/* Annonceur accessible */}
      <div
        ref={authAnnouncerRef}
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
        role="status"
      >
        {authMessage}
      </div>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour accéder facilement au contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return context;
};
