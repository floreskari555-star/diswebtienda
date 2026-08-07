/* | Nombre: ubigeoRoutes.js | Finalidad: Rutas para consultar ubigeo del Perú. */

const express = require("express");
const router = express.Router();
const {
  listarDepartamentos,
  listarProvincias,
  listarDistritos,
  validarUbigeo
} = require("../controllers/ubigeoController");

// ── Rutas públicas ───────────────────────────────────
router.get("/ubigeos/departamentos", listarDepartamentos);
router.get("/ubigeos/provincias/:codigo", listarProvincias);
router.get("/ubigeos/distritos/:codigo", listarDistritos);
router.get("/ubigeos/validate/:codigo", validarUbigeo);

module.exports = router;
