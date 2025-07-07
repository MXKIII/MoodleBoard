import express from "express";
const router = express.Router();
import { getDB } from "../db.js";

// ===================================
// Ajouter une actualité
// ===================================
router.post("/news", (req, res) => {
  const db = getDB();
  const { title, content, target, image_url } = req.body;
  // Requête SQL pour insérer une nouvelle actualité dans la table mdl_news
  db.query(
    "INSERT INTO mdl_news (title, content, target, image_url, created_at) VALUES (?, ?, ?, ?, NOW())",
    [title, content, target, image_url],
    (err, result) => {
      // Gestion des erreurs : log côté serveur et réponse générique pour la sécurité
      if (err) {
        console.error("Erreur SQL :", err);
        return res.status(500).json({ error: "DB error" });
      }
      // Retourne un succès si l'insertion a fonctionné
      res.json({ success: true });
    }
  );
});

// ===================================
// Récupérer les actualités
// ===================================
router.get("/news", (req, res) => {
  const db = getDB();
  const { target } = req.query;
  // Requête SQL pour récupérer toutes les actualités si le target est "manager"
  if (target === "manager") {
    db.query(
      "SELECT * FROM mdl_news ORDER BY created_at DESC",
      [],
      (err, results) => {
        // Gestion des erreurs : log côté serveur et réponse générique pour la sécurité
        if (err) {
          console.error("Erreur SQL :", err);
          return res.status(500).json({ error: "DB error" });
        }
        // Retourne la liste des actualités
        res.json(results);
      }
    );
  } else {
    // Requête SQL pour récupérer les actualités ciblées ou générales
    db.query(
      "SELECT * FROM mdl_news WHERE target = ? OR target = 'all' ORDER BY created_at DESC",
      [target],
      (err, results) => {
        // Gestion des erreurs : log côté serveur et réponse générique pour la sécurité
        if (err) {
          console.error("Erreur SQL :", err);
          return res.status(500).json({ error: "DB error" });
        }
        // Retourne la liste des actualités filtrées
        res.json(results);
      }
    );
  }
});

// ===================================
// Modifier une actualité
// ===================================
router.put("/news/:id", (req, res) => {
  const db = getDB();
  const { title, content, target, image_url } = req.body;
  // Requête SQL pour mettre à jour une actualité existante dans la table mdl_news
  db.query(
    "UPDATE mdl_news SET title=?, content=?, target=?, image_url=? WHERE id=?",
    [title, content, target, image_url, req.params.id],
    (err) => {
      // Gestion des erreurs : log côté serveur et réponse générique pour la sécurité
      if (err) return res.status(500).json({ error: "DB error" });
      // Retourne un succès si la mise à jour a fonctionné
      res.json({ success: true });
    }
  );
});

// ===================================
// Supprimer une actualité
// ===================================
router.delete("/news/:id", (req, res) => {
  const db = getDB();
  // Requête SQL pour supprimer une actualité de la table mdl_news
  db.query("DELETE FROM mdl_news WHERE id=?", [req.params.id], (err) => {
    // Gestion des erreurs : log côté serveur et réponse générique pour la sécurité
    if (err) return res.status(500).json({ error: "DB error" });
    // Retourne un succès si la suppression a fonctionné
    res.json({ success: true });
  });
});

export default router;
