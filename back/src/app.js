/* | Nombre: app.js | Finalidad: Configura la aplicación Express, middlewares globales, rutas y Swagger. */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

// Importar rutas
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const gestionRoutes = require("./routes/gestionRoutes");

const app = express();

// ── Configuración de motor de plantillas EJS ─────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ── Middlewares globales ──────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logger de cada llamada a endpoint ─────────────────
app.use((req, res, next) => {
  const inicio = Date.now();
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📥 [REQUEST] ${req.method} ${req.originalUrl}`);
  console.log("   IP:", req.ip);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("   Body:", JSON.stringify(req.body, null, 2));
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log("   Query:", JSON.stringify(req.query, null, 2));
  }
  if (req.params && Object.keys(req.params).length > 0) {
    console.log("   Params:", JSON.stringify(req.params, null, 2));
  }

  res.on("finish", () => {
    const duracion = Date.now() - inicio;
    console.log(`📤 [RESPONSE] ${req.method} ${req.originalUrl}`);
    console.log("   Status:", res.statusCode);
    console.log("   Duración:", `${duracion}ms`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  });

  next();
});

// ── Rutas ────────────────────────────────────────────
app.use(healthRoutes);       // GET /health
app.use("/api", authRoutes); // POST /api/auth/*
app.use("/api", userRoutes); // GET/PUT/DELETE /api/usuarios/*
app.use(gestionRoutes);      // GET/POST /gestion/*

// ── Swagger UI ───────────────────────────────────────
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log("📄 [SWAGGER] Documentación disponible en /docs");

module.exports = app;
