/* | Nombre: ubigeoController.js | Finalidad: Sirve datos de ubigeo del Perú usando ubigeo-fns. */

const {
  getDepartments,
  getProvinces,
  getDistricts,
  getUbigeoData,
  validateUbigeo,
  formatUbigeo
} = require("ubigeo-fns");

// ── Listar departamentos ──────────────────────────────
const listarDepartamentos = (req, res) => {
  try {
    const departamentos = getDepartments();
    res.json({ departamentos });
  } catch (err) {
    console.log("❌ [UBIGEO] Error al listar departamentos:", err.message);
    return res.status(500).json({ error: "Error al obtener departamentos" });
  }
};

// ── Listar provincias por departamento ────────────────
const listarProvincias = (req, res) => {
  const { codigo } = req.params;

  if (!codigo) {
    return res.status(400).json({ error: "Código de departamento requerido" });
  }

  try {
    const provincias = getProvinces(codigo);
    if (!provincias || provincias.length === 0) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }
    res.json({ provincias });
  } catch (err) {
    console.log("❌ [UBIGEO] Error al listar provincias:", err.message);
    return res.status(500).json({ error: "Error al obtener provincias" });
  }
};

// ── Listar distritos por provincia ────────────────────
const listarDistritos = (req, res) => {
  const { codigo } = req.params;

  if (!codigo) {
    return res.status(400).json({ error: "Código de provincia requerido" });
  }

  try {
    const distritos = getDistricts(codigo);
    if (!distritos || distritos.length === 0) {
      return res.status(404).json({ error: "Provincia no encontrada" });
    }
    res.json({ distritos });
  } catch (err) {
    console.log("❌ [UBIGEO] Error al listar distritos:", err.message);
    return res.status(500).json({ error: "Error al obtener distritos" });
  }
};

// ── Validar y obtener datos de un ubigeo ──────────────
const validarUbigeo = (req, res) => {
  const { codigo } = req.params;

  if (!codigo) {
    return res.status(400).json({ error: "Código ubigeo requerido" });
  }

  try {
    const esValido = validateUbigeo(codigo);
    if (!esValido) {
      return res.status(404).json({ error: "Código ubigeo no válido", valido: false });
    }

    const data = getUbigeoData(codigo);
    const formato = formatUbigeo(codigo);

    res.json({
      valido: true,
      ubigeo: data.ubigeo,
      departamento: data.department,
      provincia: data.province,
      distrito: data.district,
      formato
    });
  } catch (err) {
    console.log("❌ [UBIGEO] Error al validar ubigeo:", err.message);
    return res.status(500).json({ error: "Error al validar ubigeo" });
  }
};

module.exports = {
  listarDepartamentos,
  listarProvincias,
  listarDistritos,
  validarUbigeo
};
