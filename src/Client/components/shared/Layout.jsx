import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./Authentification";
import { useUser } from "../../UserContext";
import axios from "axios";

// Composant principal de layout qui gère la structure globale de l'application
const Layout = () => {
  // userMenu : état d'ouverture du menu utilisateur
  const [userMenu, setUserMenu] = useState(false);
  const navigate = useNavigate();
  // error : message d'erreur éventuel lors de la récupération des infos utilisateur
  const [error, setError] = useState();
  // Authentification et gestion du rôle utilisateur à l'aide du composant useAuth
  const { isAuthenticated, logout, login } = useAuth();
  const location = useLocation();
  const { userRole, setUserRole } = useUser();
  // userId : identifiant utilisateur stocké en localStorage
  const userId = localStorage.getItem("userId");
  // user : informations de l'utilisateur connecté (prénom, nom)
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
  });
  // Variables d'environnement pour l'API
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const PORT = import.meta.env.VITE_PORT;
  // Référence pour gérer le clic en dehors du menu utilisateur
  const userMenuRef = useRef(null);

  // Récupère les informations utilisateur à l'ouverture ou lors d'un changement d'userId
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        const response = await axios.post(
          `${API_BASE_URL}:${PORT}/api/info-users`,
          { userId }
        );
        setUser(response.data);
      } catch (err) {
        setError("Erreur lors de la récupération des données");
        console.error(err);
      }
    };

    fetchUser();
  }, [userId]);

  // Vérifie le statut de connexion et le rôle utilisateur au chargement
  useEffect(() => {
    const checkLoginStatus = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const storedUserRole = localStorage.getItem("userRole");
      if (isLoggedIn === "true" && storedUserRole) {
        login();
        setUserRole(storedUserRole);
      } else if (!isAuthenticated) {
        navigate("/");
      }
    };

    checkLoginStatus();
  }, [isAuthenticated, navigate, login, setUserRole]);

  // Gestion du clic en dehors du menu utilisateur pour le fermer automatiquement
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenu(false);
      }
    };
    if (userMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenu]);

  // Accessibilité clavier pour le menu utilisateur (fermeture avec Escape ou Tab)
  const handleUserMenuKeyDown = (e) => {
    if (e.key === "Escape") {
      setUserMenu(false);
    }
    if (e.key === "Tab" && userMenu) {
      // Ferme le menu si on sort du menu avec Tab
      setUserMenu(false);
    }
  };

  // Déconnexion de l'utilisateur : suppression des infos locales et redirection
  const handleLogout = () => {
    logout();
    localStorage.removeItem("USERNAME");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  // Détermine si la page courante est la page de connexion
  const isLoginPage = location.pathname === "/";

  return (
    <div className="main-layout">
      {/* Affiche la barre de navigation principale sauf sur la page de connexion */}
      {!isLoginPage && (
        <nav aria-label="Menu principal">
          <ul className="main-menu">
            {/* Lien vers l'accueil selon le rôle utilisateur */}
            {userRole && (
              <li>
                <Link to={`/${userRole}`}>Accueil</Link>
              </li>
            )}
            {/* Lien vers la page des actualités */}
            <li>
              <Link to="/news">Actualités</Link>
            </li>
            {/* Menu utilisateur avec accès au logout */}
            <li className="userMenu" ref={userMenuRef}>
              <button
                aria-haspopup="true"
                aria-expanded={userMenu}
                aria-controls="user-menu-dropdown"
                onClick={() => setUserMenu((open) => !open)}
                onKeyDown={handleUserMenuKeyDown}
                aria-label={`Menu utilisateur de ${user.firstName} ${user.lastName}`}
              >
                <FontAwesomeIcon icon={faUser} />{" "}
                {`${user.firstName}  ${user.lastName}` || "User"}
              </button>
              {/* Dropdown du menu utilisateur */}
              {userMenu && (
                <ul
                  id="user-menu-dropdown"
                  className="user-dropdown"
                  role="menu"
                  aria-label="Menu utilisateur"
                >
                  <li className="user-disconnect" role="none">
                    <button
                      role="menuitem"
                      tabIndex={0}
                      onClick={handleLogout}
                      aria-label="Se déconnecter"
                    >
                      Se déconnecter
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      )}
      <hr />
      {/* Affiche le contenu de la route courante */}
      <Outlet />
    </div>
  );
};

export default Layout;
