/* | Nombre: bookRoutes.js | Finalidad: Define las rutas HTTP para CRUD de libros. */

const express = require("express");
const router = express.Router();
const {
  listarLibros,
  obtenerLibro,
  crearLibro,
  actualizarLibro,
  eliminarLibro,
  listarEditoriales
} = require("../controllers/bookController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// ── Rutas públicas ───────────────────────────────────
// Listar todos los libros (con filtros opcionales)
router.get("/libros", listarLibros);

// Obtener editoriales
router.get("/libros/editoriales", listarEditoriales);

// Obtener libro por ID
router.get("/libros/:id", obtenerLibro);

// ── Rutas protegidas (admin/super) ───────────────────
// Crear libro (con archivos)
router.post("/libros", authenticate, authorize("super", "admin"), crearLibro);

// Actualizar libro (con archivos opcionales)
router.put("/libros/:id", authenticate, authorize("super", "admin"), actualizarLibro);

// Eliminar libro
router.delete("/libros/:id", authenticate, authorize("super", "admin"), eliminarLibro);

module.exports = router;
