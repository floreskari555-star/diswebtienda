/* | Nombre: solicitudRoutes.js | Finalidad: Rutas para CRUD de solicitudes de derechos. */

const express = require("express");
const router = express.Router();
const {
  listarSolicitudes,
  obtenerSolicitud,
  crearSolicitud,
  actualizarSolicitud,
  cambiarEstadoSolicitud,
  eliminarSolicitud
} = require("../controllers/solicitudController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// Listar solicitudes (admin ve todas, proveedor las suyas)
router.get("/solicitudes", authenticate, authorize("super", "admin", "proveedor"), listarSolicitudes);

// Obtener solicitud por ID
router.get("/solicitudes/:id", authenticate, authorize("super", "admin", "proveedor"), obtenerSolicitud);

// Crear solicitud (proveedor o admin)
router.post("/solicitudes", authenticate, authorize("super", "admin", "proveedor"), crearSolicitud);

// Actualizar solicitud (proveedor o admin, solo si está pendiente/en_revision)
router.put("/solicitudes/:id", authenticate, authorize("super", "admin", "proveedor"), actualizarSolicitud);

// Cambiar estado (solo admin)
router.patch("/solicitudes/:id/estado", authenticate, authorize("super", "admin"), cambiarEstadoSolicitud);

// Eliminar solicitud
router.delete("/solicitudes/:id", authenticate, authorize("super", "admin", "proveedor"), eliminarSolicitud);

module.exports = router;
