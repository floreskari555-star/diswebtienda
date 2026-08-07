/* | Nombre: tablaMaestraRoutes.js | Finalidad: Rutas para tablas maestras (listas de valores). */

const express = require("express");
const router = express.Router();
const {
  obtenerPorTabla,
  listarTodas,
  crear,
  actualizar,
  eliminar
} = require("../controllers/tablaMaestraController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// ── Ruta pública: obtener valores por tabla ──────────
router.get("/tablas-maestras/:tabla", obtenerPorTabla);

// ── Rutas protegidas (admin/super) ──────────────────
router.get("/tablas-maestras", authenticate, authorize("super", "admin"), listarTodas);
router.post("/tablas-maestras", authenticate, authorize("super", "admin"), crear);
router.put("/tablas-maestras/:id", authenticate, authorize("super", "admin"), actualizar);
router.delete("/tablas-maestras/:id", authenticate, authorize("super", "admin"), eliminar);

module.exports = router;
