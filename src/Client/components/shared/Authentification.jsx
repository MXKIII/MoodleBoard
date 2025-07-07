import React, { createContext, useState, useContext, useEffect } from "react";

// Création du contexte d'authentification
const AuthContext = createContext(null);

// Provider qui encapsule l'application et fournit l'état d'authentification et les fonctions associées
export const AuthProvider = ({ children }) => {
  // isAuthenticated : indique si l'utilisateur est connecté (initialisé depuis le localStorage)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  // Synchronise l'état d'authentification avec le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  // Fonction pour connecter l'utilisateur
  const login = () => setIsAuthenticated(true);
  // Fonction pour déconnecter l'utilisateur
  const logout = () => setIsAuthenticated(false);

  return (
    // Fournit le contexte d'authentification à tous les composants enfants
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour accéder facilement au contexte d'authentification
export const useAuth = () => useContext(AuthContext);
