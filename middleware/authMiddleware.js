import jwt from "jsonwebtoken";

// ===================================
// Middleware pour vérifier l'authentification
// ===================================
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: "Token d'accès requis",
      message: "Veuillez vous connecter pour accéder à cette ressource" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attacher les infos utilisateur à la requête
    next(); // Continuer vers le contrôleur
  } catch (error) {
    console.error("Token verification error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: "Token expiré",
        message: "Votre session a expiré, veuillez vous reconnecter" 
      });
    }
    
    return res.status(403).json({ 
      error: "Token invalide",
      message: "Token d'authentification invalide" 
    });
  }
};

// ===================================
// Middleware pour vérifier les rôles
// ===================================
export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Utilisateur non authentifié" 
      });
    }

    // allowedRoles peut être une string ou un array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: "Accès interdit",
        message: `Cette action nécessite le rôle: ${roles.join(' ou ')}` 
      });
    }

    next();
  };
};

// ===================================
// Middleware optionnel (utilisateur peut être non connecté)
// ===================================
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null; // Pas d'utilisateur connecté
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    req.user = null; // Token invalide, mais on continue
  }
  
  next();
};