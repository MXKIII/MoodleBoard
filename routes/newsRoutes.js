import express from "express";
import {
  getNews,
  addNews,
  deleteNews,
  updateNews,
} from "../controller/newsController.js";

const router = express.Router();

// Routes pour les actualités
router.get("/news", getNews);
router.post("/news", addNews);
router.put("/news/:id", updateNews);
router.delete("/news/:id", deleteNews);

export default router;
