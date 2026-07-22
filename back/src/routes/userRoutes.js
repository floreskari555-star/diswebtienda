/* | Nombre: userRoutes.js | Finalidad: Define las rutas HTTP protegidas para CRUD de usuarios (solo admin). */

const express = require("express");
const router = express.Router();
const { 
  listarUsuarios, 
  obtenerUsuario, 
  actualizarUsuario, 
  eliminarUsuario 
} = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// Todas las rutas requieren autenticación y rol de admin o super
router.use(authenticate);
router.use(authorize("super", "admin"));

// Listar todos los usuarios
router.get("/usuarios", listarUsuarios);

// Obtener usuario por ID
router.get("/usuarios/:id", obtenerUsuario);

// Actualizar usuario
router.put("/usuarios/:id", actualizarUsuario);

// Eliminar usuario
router.delete("/usuarios/:id", eliminarUsuario);

module.exports = router;
