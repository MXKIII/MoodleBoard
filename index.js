import express from "express";
import "dotenv/config";
import { connectDB, getDB } from "./database/db.js";
import cors from "cors";

const app = express();
app.use(express.json());

// Import des routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import departementRoutes from "./routes/departementRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";

// ===============================
// MIDDLEWARE DE SÉCURITÉ (CORS) - VERSION SIMPLIFIÉE
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://moodleboard-155snd6t7-maximes-projects-f71b8200.vercel.app/",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);

// API routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MoodleBoard Backend'
  });
});

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", departementRoutes);
app.use("/api", newsRoutes);

let db;

// ===============================
// LANCEMENT DU SERVEUR
// ===============================
connectDB(() => {
  db = getDB();
  const PORT = process.env.PORT || 5000;
  const IP_ADDRESS = process.env.IP_ADDRESS || "127.0.0.1";

  app.listen(PORT, IP_ADDRESS, () => {
    console.log(`🚀 Serveur en écoute sur http://${IP_ADDRESS}:${PORT}`);
    console.log(`📊 Base de données connectée via SSH`);
  });
});
