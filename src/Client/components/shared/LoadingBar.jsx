import React from "react";
import { useLoading } from "./LoadingContext";

// Composant d'affichage de la barre de chargement globale (LoadingContext.jsx )
const LoadingBar = () => {
  // Récupère l'état de chargement depuis le contexte
  const { isLoading } = useLoading();
  // Affiche la barre de chargement si isLoading est true, sinon rien
  return isLoading ? <div className="loading-bar"></div> : null;
};

export default LoadingBar;
