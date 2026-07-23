/* | Nombre: editorialRoutes.js | Finalidad: Define las rutas HTTP para CRUD de editoriales. */

const express = require("express");
const router = express.Router();
const {
  listarEditoriales,
  obtenerEditorial,
  crearEditorial,
  actualizarEditorial,
  eliminarEditorial
} = require("../controllers/editorialController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// ── Rutas públicas ───────────────────────────────────
// Listar todas las editoriales
router.get("/editoriales", listarEditoriales);

// Obtener editorial por ID
router.get("/editoriales/:id", obtenerEditorial);

// ── Rutas protegidas (admin/super) ───────────────────
// Crear editorial
router.post("/editoriales", authenticate, authorize("super", "admin"), crearEditorial);

// Actualizar editorial
router.put("/editoriales/:id", authenticate, authorize("super", "admin"), actualizarEditorial);

// Eliminar editorial
router.delete("/editoriales/:id", authenticate, authorize("super", "admin"), eliminarEditorial);

module.exports = router;
