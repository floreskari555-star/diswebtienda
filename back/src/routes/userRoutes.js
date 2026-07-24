/* | Nombre: userRoutes.js | Finalidad: Define las rutas HTTP protegidas para CRUD de usuarios (solo admin). */

const express = require("express");
const router = express.Router();
const { 
  listarUsuarios, 
  obtenerUsuario, 
  actualizarUsuario, 
  eliminarUsuario,
  proveedoresSinEditorial
} = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// Listar todos los usuarios (admin/super)
router.get("/usuarios", authenticate, authorize("super", "admin"), listarUsuarios);

// Proveedores sin editorial (para notificaciones)
router.get("/usuarios/proveedores-sin-editorial", authenticate, authorize("super", "admin"), proveedoresSinEditorial);

// Obtener usuario por ID
router.get("/usuarios/:id", authenticate, authorize("super", "admin"), obtenerUsuario);

// Actualizar usuario
router.put("/usuarios/:id", authenticate, authorize("super", "admin"), actualizarUsuario);

// Eliminar usuario
router.delete("/usuarios/:id", authenticate, authorize("super", "admin"), eliminarUsuario);

module.exports = router;
