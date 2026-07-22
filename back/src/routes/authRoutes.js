/* | Nombre: authRoutes.js | Finalidad: Define las rutas HTTP para autenticación y gestión de cuentas. */

const express = require("express");
const router = express.Router();
const { 
  registro, 
  registroProveedor, 
  login, 
  solicitarResetPassword, 
  establecerNuevaPassword,
  obtenerPerfil,
  actualizarPerfil
} = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");

// ── Rutas públicas ───────────────────────────────────

// Registro de cliente
router.post("/auth/registro", registro);

// Registro de proveedor
router.post("/auth/registro-proveedor", registroProveedor);

// Login
router.post("/auth/login", login);

// Solicitud de reset password
router.post("/auth/reset-password", solicitarResetPassword);

// Establecer nueva contraseña
router.put("/auth/reset-password", establecerNuevaPassword);

// ── Rutas protegidas ─────────────────────────────────

// Obtener perfil del usuario autenticado
router.get("/auth/perfil", authenticate, obtenerPerfil);

// Actualizar perfil del usuario autenticado
router.put("/auth/perfil", authenticate, actualizarPerfil);

module.exports = router;
