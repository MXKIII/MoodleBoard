import { Navigate } from "react-router-dom";

//Protection de route : n'affiche les enfants que si le rôle utilisateur est autorisé
const ProtectedRoute = ({ acceptedRoles, children }) => {
  // Récupère le rôle de l'utilisateur depuis le localStorage
  const role = localStorage.getItem("userRole");

  // Si le rôle n'est pas accepté, redirige vers la page correspondant à son rôle
  if (!acceptedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />;
  }
  // Sinon, affiche les composants enfants
  return children;
};

export default ProtectedRoute;
