import express from "express";
import { login, logout } from "../controller/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes publiques (pas de middleware)
router.post("/login", login);
router.post("/logout", authenticateToken, logout);

export default router;
