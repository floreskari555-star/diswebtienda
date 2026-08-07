/* | Nombre: facturaRoutes.js | Finalidad: Define rutas para consulta de facturas. */

const express = require("express");
const router = express.Router();
const { historialCliente, listarFacturas, obtenerFactura } = require("../controllers/facturaController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// ── Historial del cliente autenticado ─────────────────
router.get("/facturas/mi-historial", authenticate, authorize("cliente", "super", "admin"), historialCliente);

// ── Todas las facturas (admin/super) ──────────────────
router.get("/facturas", authenticate, authorize("admin", "super"), listarFacturas);

// ── Factura por ID ────────────────────────────────────
router.get("/facturas/:id", authenticate, obtenerFactura);

module.exports = router;
