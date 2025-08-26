import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTimes } from '@fortawesome/free-solid-svg-icons';

const MobileMenu = ({ 
  isOpen, 
  onClose, 
  userRole, 
  userName, 
  onLogout 
}) => {
  // Refs pour accessibilité
  const menuRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Sauvegarde du focus actuel
      previousFocusRef.current = document.activeElement;
      
      // Focus sur le bouton fermer après ouverture
      setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        }
      }, 100);

      // Blocage du scroll du body
      document.body.style.overflow = 'hidden';
    } else {
      // Restauration du focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      
      // Restauration du scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Navigation clavier
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }

    // Piège du focus dans le menu
    if (e.key === 'Tab') {
      const focusableElements = menuRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  // Fermeture au clic overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Gestion déconnexion mobile
  const handleMobileLogout = () => {
    onLogout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="mobile-menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <nav 
        ref={menuRef}
        className="mobile-menu"
        role="navigation"
        aria-labelledby="mobile-menu-title"
      >
        {/* En-tête avec bouton fermer */}
        <header className="mobile-menu-header">
          <h2 id="mobile-menu-title" className="mobile-menu-title">
            Menu Navigation
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="mobile-menu-close"
            onClick={onClose}
            aria-label="Fermer le menu de navigation"
          >
            <FontAwesomeIcon icon={faTimes} aria-hidden="true" />
            <span className="close-text">Fermer</span>
          </button>
        </header>

        {/* Navigation principale */}
        <div className="mobile-menu-content">
          <ul className="mobile-menu-list" role="list">
            {/* Lien accueil selon rôle */}
            {userRole && (
              <li className="mobile-menu-item" role="listitem">
                <Link 
                  to={`/${userRole}`}
                  className="mobile-menu-link"
                  onClick={onClose}
                  aria-label={`Accueil ${userRole}`}
                >
                  <span className="menu-icon" aria-hidden="true">🏠</span>
                  <span className="menu-text">Accueil</span>
                </Link>
              </li>
            )}
            
            {/* Lien actualités */}
            <li className="mobile-menu-item" role="listitem">
              <Link 
                to="/news"
                className="mobile-menu-link"
                onClick={onClose}
                aria-label="Consulter les actualités"
              >
                <span className="menu-icon" aria-hidden="true">📰</span>
                <span className="menu-text">Actualités</span>
              </Link>
            </li>
          </ul>

          {/* Section utilisateur */}
          <div className="mobile-user-section">
            <div className="mobile-user-info">
              <FontAwesomeIcon icon={faUser} className="user-avatar" aria-hidden="true" />
              <div className="user-details">
                <span className="user-name">{userName}</span>
                <span className="user-role">{userRole || 'Utilisateur'}</span>
              </div>
            </div>
            
            <button
              type="button"
              className="mobile-logout-button"
              onClick={handleMobileLogout}
              aria-label="Se déconnecter de votre session"
            >
              <span className="logout-icon" aria-hidden="true">🚪</span>
              <span className="logout-text">Se déconnecter</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MobileMenu;