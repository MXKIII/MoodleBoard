import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./Authentification";
import { useUser } from "./UserContext";
import MobileMenu from "./MobileMenu";
import { jwtDecode } from 'jwt-decode';

// Composant principal de layout qui gère la structure globale de l'application
const Layout = () => {
  // États essentiels
  const [userMenu, setUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 
  const [user, setUser] = useState({ firstName: "", lastName: "" });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, login } = useAuth();
  const { userRole, setUserRole } = useUser();
  const userId = localStorage.getItem("userId");

  // Refs pour accessibilité
  const userMenuRef = useRef(null);
  const userMenuButtonRef = useRef(null);

  useEffect(() => {
    const loadUserFromToken = () => {
      if (!userId) return;

      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.warn('Aucun token trouvé');
          setError("Session expirée");
          return;
        }

        // Décoder le token JWT côté client
        const decoded = jwtDecode(token);
        
        // Vérifier que le token n'est pas expiré
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          console.warn('Token expiré');
          setError("Session expirée");
          logout();
          navigate("/");
          return;
        }

        setUser({
          firstName: decoded.firstname || '',
          lastName: decoded.lastname || ''
        });
        setError(""); 
        
        
        
      } catch (err) {
        console.error("Erreur lors du décodage du token:", err);
        setError("Session invalide");
        logout();
        navigate("/");
      }
    };

    // Charger les données si authentifié
    if (isAuthenticated && userId) {
      loadUserFromToken();
    }
  }, [isAuthenticated, userId, logout, navigate]);

  // Vérification statut connexion
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

  // Gestion clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenu(false);
      }
    };

    if (userMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenu]);

  // Navigation clavier menu
  const handleUserMenuKeyDown = (e) => {
    if (e.key === "Escape") {
      setUserMenu(false);
      // Retour focus sur bouton
      if (userMenuButtonRef.current) {
        userMenuButtonRef.current.focus();
      }
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setUserMenu(!userMenu);
    }
    if (e.key === "ArrowDown" && userMenu) {
      e.preventDefault();
      // Focus sur premier élément du menu
      const firstMenuItem = userMenuRef.current?.querySelector('[role="menuitem"]');
      if (firstMenuItem) firstMenuItem.focus();
    }
  };

  // Navigation clavier dans dropdown
  const handleMenuItemKeyDown = (e) => {
    if (e.key === "Escape") {
      setUserMenu(false);
      if (userMenuButtonRef.current) {
        userMenuButtonRef.current.focus();
      }
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleLogout();
    }
  };

  // Déconnexion accessible
  const handleLogout = () => {
    logout();
    
    // Nettoyage localStorage
    ["USERNAME", "userId", "userRole", "isLoggedIn"].forEach(key => {
      localStorage.removeItem(key);
    });
    
    setUserMenu(false);
    navigate("/");
  };

  // Fermeture menu mobile au changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Fermeture au redimensionnement
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLoginPage = location.pathname === "/";
  const userName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : "Utilisateur";

  return (
    <div className="main-layout">
      {/* Navigation d'évitement */}
      {!isLoginPage && (
        <a href="#main-content" className="skip-to-content">
          Aller au contenu principal
        </a>
      )}

      {/* Message d'erreur accessible */}
      {error && (
        <div 
          className="error-banner sr-only" 
          role="alert" 
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      {/* Navigation desktop + bouton mobile */}
      {!isLoginPage && (
        <nav aria-label="Menu principal" role="navigation" className="main-navigation">
          {/* Bouton hamburger mobile */}
          <button
            type="button"
            className={`hamburger-button ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="sr-only">
              {mobileMenuOpen ? "Fermer" : "Ouvrir"} le menu de navigation
            </span>
          </button>

          {/* Menu desktop (masqué sur mobile) */}
          <ul className="main-menu" role="menubar">
            {/* Lien accueil selon rôle */}
            {userRole && (
              <li role="none">
                <Link 
                  to={`/${userRole}`} 
                  role="menuitem"
                  aria-label={`Accueil ${userRole}`}
                >
                  Accueil
                </Link>
              </li>
            )}
            
            {/* Lien actualités */}
            <li role="none">
              <Link 
                to="/news" 
                role="menuitem"
                aria-label="Consulter les actualités"
              >
                Actualités
              </Link>
            </li>
            
            {/* Menu utilisateur desktop (masqué sur mobile) */}
            <li className="userMenu" ref={userMenuRef} role="none">
              <button
                ref={userMenuButtonRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={userMenu}
                aria-controls="user-menu-dropdown"
                onClick={() => setUserMenu(!userMenu)}
                onKeyDown={handleUserMenuKeyDown}
                aria-label={`Menu utilisateur de ${userName}`}
                className="user-menu-button"
              >
                <FontAwesomeIcon icon={faUser} aria-hidden="true" />
                <span className="user-name">{userName}</span>
                <span className="menu-arrow" aria-hidden="true">
                  {userMenu ? "▲" : "▼"}
                </span>
              </button>
              
              {/* Dropdown desktop */}
              {userMenu && (
                <ul
                  id="user-menu-dropdown"
                  className="user-dropdown"
                  role="menu"
                  aria-label="Actions utilisateur"
                  aria-labelledby="user-menu-button"
                >
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      tabIndex="0"
                      onClick={handleLogout}
                      onKeyDown={handleMenuItemKeyDown}
                      aria-label="Se déconnecter de votre session"
                      className="logout-button"
                    >
                      <span aria-hidden="true">🚪</span>
                      Se déconnecter
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      )}

      {/* Menu mobile */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        userRole={userRole}
        userName={userName}
        onLogout={handleLogout}
      />

      {/* Séparateur sémantique */}
      <hr aria-hidden="true" />

      {/* Contenu principal accessible */}
      <main id="main-content" role="main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
