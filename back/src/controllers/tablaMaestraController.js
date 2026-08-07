/* | Nombre: tablaMaestraController.js | Finalidad: CRUD de tablas maestras (listas de valores). */

const { supabaseAdmin } = require("../config/supabase");

// ── Obtener valores por tabla ─────────────────────────
const obtenerPorTabla = async (req, res) => {
  const { tabla } = req.params;

  if (!tabla) {
    return res.status(400).json({ error: "Nombre de tabla requerido" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("tablas_maestras")
      .select("clave, valor, orden")
      .eq("tabla", tabla)
      .eq("activo", true)
      .order("orden");

    if (error) {
      console.log("❌ [TABLAS_MAESTRAS] Error al consultar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    res.json({ tabla, items: data });
  } catch (err) {
    console.log("❌ [TABLAS_MAESTRAS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al obtener datos" });
  }
};

// ── CRUD (admin) ──────────────────────────────────────
const listarTodas = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("tablas_maestras")
      .select("*")
      .order("tabla")
      .order("orden");

    if (error) return res.status(400).json({ error: error.message });
    res.json({ items: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const crear = async (req, res) => {
  const { tabla, clave, valor, orden } = req.body;

  if (!tabla || !clave || !valor) {
    return res.status(400).json({ error: "tabla, clave y valor son requeridos" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("tablas_maestras")
      .insert({ tabla, clave, valor, orden: orden || 0 })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ mensaje: "Registro creado", item: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const actualizar = async (req, res) => {
  const { id } = req.params;
  const { valor, orden, activo } = req.body;

  try {
    const updates = {};
    if (valor !== undefined) updates.valor = valor;
    if (orden !== undefined) updates.orden = orden;
    if (activo !== undefined) updates.activo = activo;

    const { data, error } = await supabaseAdmin
      .from("tablas_maestras")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ mensaje: "Registro actualizado", item: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from("tablas_maestras")
      .delete()
      .eq("id", id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ mensaje: "Registro eliminado" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  obtenerPorTabla,
  listarTodas,
  crear,
  actualizar,
  eliminar
};
