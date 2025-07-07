import React, { createContext, useState, useContext } from "react";

// Création d'un contexte pour gérer l'état de chargement global de l'application
const LoadingContext = createContext();

// Provider qui encapsule l'application et fournit l'état de chargement et sa fonction de modification
export const LoadingProvider = ({ children }) => {
  // isLoading : indique si une opération asynchrone est en cours
  // setIsLoading : fonction pour modifier l'état de chargement
  const [isLoading, setIsLoading] = useState(false);
  return (
    // Fournit le contexte à tous les composants enfants
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Hook personnalisé pour accéder facilement au contexte de chargement dans les composants
export const useLoading = () => useContext(LoadingContext);
