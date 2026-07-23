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

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar pagos
router.get("/pagos", authorize("super", "admin", "proveedor"), listarPagos);

// Obtener pago por ID
router.get("/pagos/:id", authorize("super", "admin", "proveedor"), obtenerPago);

// Crear pago (con comprobante upload)
router.post("/pagos", authorize("super", "admin", "proveedor"), crearPago);

// Aprobar pago (solo admin)
router.patch("/pagos/:id/aprobar", authorize("super", "admin"), aprobarPago);

// Rechazar pago (solo admin)
router.patch("/pagos/:id/rechazar", authorize("super", "admin"), rechazarPago);

// Eliminar pago
router.delete("/pagos/:id", authorize("super", "admin"), eliminarPago);

module.exports = router;
