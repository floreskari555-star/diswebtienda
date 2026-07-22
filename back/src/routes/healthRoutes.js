/* | Nombre: healthRoutes.js | Finalidad: Define la ruta de verificación de salud del servidor. */

const express = require("express");
const router = express.Router();
const { health } = require("../controllers/healthController");

router.get("/health", health);

module.exports = router;
