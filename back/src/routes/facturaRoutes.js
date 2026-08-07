/* | Nombre: facturaRoutes.js | Finalidad: Define rutas para comprobantes. */

const express = require("express");
const router = express.Router();
const { crearFactura, anularFactura, historialCliente, listarFacturas, obtenerFactura, reenviarCorreo } = require("../controllers/facturaController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// ── Crear factura (cliente autenticado) ───────────────
router.post("/facturas", authenticate, crearFactura);

// ── Anular factura (admin/super) ─────────────────────
router.patch("/facturas/:id/anular", authenticate, authorize("admin", "super"), anularFactura);

// ── Historial del cliente autenticado ─────────────────
router.get("/facturas/mi-historial", authenticate, authorize("cliente", "super", "admin"), historialCliente);

// ── Todas las facturas (admin/super) ──────────────────
router.get("/facturas", authenticate, authorize("admin", "super"), listarFacturas);

// ── Factura por ID ────────────────────────────────────
router.get("/facturas/:id", authenticate, obtenerFactura);

// ── Reenviar comprobante por correo ───────────────────
router.post("/facturas/:id/reenviar-correo", authenticate, reenviarCorreo);

module.exports = router;
