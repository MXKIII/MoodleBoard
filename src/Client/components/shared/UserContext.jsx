import React, { createContext, useState, useContext } from "react";

// Création d'un contexte utilisateur pour partager le rôle de l'utilisateur dans toute l'application
const UserContext = createContext();

// Provider qui encapsule l'application et fournit le rôle utilisateur et la fonction de modification
export const UserProvider = ({ children }) => {
  // userRole : rôle actuel de l'utilisateur (ex : "admin", "enseignant", "élève", etc.)
  // setUserRole : fonction pour mettre à jour le rôle utilisateur
  const [userRole, setUserRole] = useState(null);

  return (
    // Fournit le contexte à tous les composants enfants
    <UserContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personnalisé pour accéder facilement au contexte utilisateur dans les composants
export const useUser = () => useContext(UserContext);
