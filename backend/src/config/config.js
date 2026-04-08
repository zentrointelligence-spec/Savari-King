require("dotenv").config();

const config = {
  // Configuration du serveur
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || "development",
  },

  // Configuration de la base de données
  database: {
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_DATABASE || "ebookingsam",
    password: process.env.DB_PASSWORD || "postgres",
    port: parseInt(process.env.DB_PORT) || 5432,
  },

  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-key",
    expiresIn: "24h",
  },

  // Configuration Email
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  // Configuration Stripe
  stripe: {
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
  },

  // Configuration CORS
  cors: {
    origin: [
      process.env.FRONTEND_URL ||
        (process.env.FRONTEND_HOST ? `https://${process.env.FRONTEND_HOST}` : "http://localhost:3000"),
      "http://localhost:3001", // Port alternatif pour Vite
      "http://localhost:3002", // Port alternatif pour Vite
      "http://localhost:5173", // Port par défaut de Vite
    ],
    credentials: true,
  },

  // Configuration des uploads
  uploads: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    destination: "uploads/",
  },

  // Configuration de sécurité
  security: {
    bcryptRounds: 12,
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100, // limite de 100 requêtes par fenêtre
  },
};

// Validation des variables d'environnement critiques
const requiredEnvVars = ["JWT_SECRET"].concat(
  process.env.DATABASE_URL ? [] : ["DB_DATABASE"]
);
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Variables d'environnement manquantes:", missingEnvVars);
  if (config.server.env === "production") {
    process.exit(1);
  } else {
    console.warn("⚠️  Mode développement: utilisation des valeurs par défaut");
  }
}

module.exports = config;
