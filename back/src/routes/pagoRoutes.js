/* | Nombre: pagoRoutes.js | Finalidad: Rutas para CRUD de pagos a editoriales. */

const express = require("express");
const router = express.Router();
const {
  listarPagos,
  obtenerPago,
  crearPago,
  aprobarPago,
  rechazarPago,
  eliminarPago
} = require("../controllers/pagoController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// Listar pagos
router.get("/pagos", authenticate, authorize("super", "admin", "proveedor"), listarPagos);

// Obtener pago por ID
router.get("/pagos/:id", authenticate, authorize("super", "admin", "proveedor"), obtenerPago);

// Crear pago (con comprobante upload)
router.post("/pagos", authenticate, authorize("super", "admin", "proveedor"), crearPago);

// Aprobar pago (solo admin)
router.patch("/pagos/:id/aprobar", authenticate, authorize("super", "admin"), aprobarPago);

// Rechazar pago (solo admin)
router.patch("/pagos/:id/rechazar", authenticate, authorize("super", "admin"), rechazarPago);

// Eliminar pago
router.delete("/pagos/:id", authenticate, authorize("super", "admin", "proveedor"), eliminarPago);

module.exports = router;
