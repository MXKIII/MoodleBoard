import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  departement,
  departement_allemand,
  departement_anglais,
  departement_arch,
  departement_artsplastiques,
  departement_ash,
  departement_ecogestion,
  departement_eps,
  departement_espagnol,
  departement_histgeo,
  departement_italien,
  departement_lettres,
  departement_math,
  departement_musique,
  departement_shsphilo,
  departement_spc,
  departement_svt,
  departement_techno,
  departement_documentation,
} from "../controller/departementController.js";

const router = express.Router();

// Routes pour les départements
router.post("/departement", authenticateToken, departement);
router.post("/departement-allemand", authenticateToken, departement_allemand);
router.post("/departement-anglais", authenticateToken, departement_anglais);
router.post("/departement-arch", authenticateToken, departement_arch);
router.post(
  "/departement-artsplastiques",
  authenticateToken,
  departement_artsplastiques
);
router.post("/departement-ash", authenticateToken, departement_ash);
router.post(
  "/departement-ecogestion",
  authenticateToken,
  departement_ecogestion
);
router.post("/departement-eps", authenticateToken, departement_eps);
router.post("/departement-espagnol", authenticateToken, departement_espagnol);
router.post("/departement-histgeo", authenticateToken, departement_histgeo);
router.post("/departement-italien", authenticateToken, departement_italien);
router.post("/departement-lettres", authenticateToken, departement_lettres);
router.post("/departement-math", authenticateToken, departement_math);
router.post("/departement-musique", authenticateToken, departement_musique);
router.post("/departement-shsphilo", authenticateToken, departement_shsphilo);
router.post("/departement-spc", authenticateToken, departement_spc);
router.post("/departement-svt", authenticateToken, departement_svt);
router.post("/departement-techno", authenticateToken, departement_techno);
router.post(
  "/departement-documentation",
  authenticateToken,
  departement_documentation
);

export default router;
