/* | Nombre: editorialController.js | Finalidad: CRUD completo de editoriales. */

const { supabaseAdmin } = require("../config/supabase");

// ── Listar todas las editoriales (público) ───────────
const listarEditoriales = async (req, res) => {
  console.log("📚 [EDITORIALES] Listar editoriales");

  try {
    const { data: editoriales, error } = await supabaseAdmin
      .from("editoriales")
      .select("*")
      .order("nombre");

    if (error) {
      console.log("❌ [EDITORIALES] Error al listar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [EDITORIALES] Total editoriales:", editoriales.length);

    res.json({
      total: editoriales.length,
      editoriales
    });
  } catch (err) {
    console.log("❌ [EDITORIALES] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al listar editoriales" });
  }
};

// ── Obtener editorial por ID (público) ───────────────
const obtenerEditorial = async (req, res) => {
  console.log("📖 [EDITORIALES] Obtener editorial por ID:", req.params.id);

  const { id } = req.params;

  try {
    const { data: editorial, error } = await supabaseAdmin
      .from("editoriales")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !editorial) {
      console.log("❌ [EDITORIALES] Editorial no encontrada");
      return res.status(404).json({ error: "Editorial no encontrada" });
    }

    console.log("✅ [EDITORIALES] Editorial encontrada:", editorial.nombre);

    res.json({ editorial });
  } catch (err) {
    console.log("❌ [EDITORIALES] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al obtener editorial" });
  }
};

// ── Crear editorial (admin/super) ────────────────────
const crearEditorial = async (req, res) => {
  console.log("➕ [EDITORIALES] Crear nueva editorial");

  const { nombre, correo_contacto } = req.body;

  // Validaciones básicas
  if (!nombre) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  try {
    // Verificar que no exista una editorial con el mismo nombre
    const { data: existe } = await supabaseAdmin
      .from("editoriales")
      .select("id")
      .ilike("nombre", nombre)
      .single();

    if (existe) {
      return res.status(400).json({ error: "Ya existe una editorial con ese nombre" });
    }

    const { data: editorial, error } = await supabaseAdmin
      .from("editoriales")
      .insert({
        nombre,
        correo_contacto: correo_contacto || ""
      })
      .select()
      .single();

    if (error) {
      console.log("❌ [EDITORIALES] Error al crear:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [EDITORIALES] Editorial creada:", editorial.nombre);

    res.status(201).json({
      mensaje: "Editorial creada exitosamente",
      editorial
    });
  } catch (err) {
    console.log("❌ [EDITORIALES] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al crear editorial" });
  }
};

// ── Actualizar editorial (admin/super) ───────────────
const actualizarEditorial = async (req, res) => {
  console.log("✏️ [EDITORIALES] Actualizar editorial:", req.params.id);

  const { id } = req.params;
  const { nombre, correo_contacto } = req.body;

  try {
    // Verificar que la editorial existe
    const { data: existe } = await supabaseAdmin
      .from("editoriales")
      .select("id")
      .eq("id", id)
      .single();

    if (!existe) {
      console.log("❌ [EDITORIALES] Editorial no encontrada");
      return res.status(404).json({ error: "Editorial no encontrada" });
    }

    // Verificar que no haya otra editorial con el mismo nombre
    if (nombre) {
      const { data: nombreExiste } = await supabaseAdmin
        .from("editoriales")
        .select("id")
        .ilike("nombre", nombre)
        .neq("id", id)
        .single();

      if (nombreExiste) {
        return res.status(400).json({ error: "Ya existe otra editorial con ese nombre" });
      }
    }

    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (correo_contacto !== undefined) updates.correo_contacto = correo_contacto;

    const { data: editorial, error } = await supabaseAdmin
      .from("editoriales")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.log("❌ [EDITORIALES] Error al actualizar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [EDITORIALES] Editorial actualizada:", editorial.nombre);

    res.json({
      mensaje: "Editorial actualizada exitosamente",
      editorial
    });
  } catch (err) {
    console.log("❌ [EDITORIALES] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al actualizar editorial" });
  }
};

// ── Eliminar editorial (admin/super) ─────────────────
const eliminarEditorial = async (req, res) => {
  console.log("🗑️ [EDITORIALES] Eliminar editorial:", req.params.id);

  const { id } = req.params;

  try {
    // Verificar que la editorial existe
    const { data: existe } = await supabaseAdmin
      .from("editoriales")
      .select("id, nombre")
      .eq("id", id)
      .single();

    if (!existe) {
      console.log("❌ [EDITORIALES] Editorial no encontrada");
      return res.status(404).json({ error: "Editorial no encontrada" });
    }

    // Verificar que no haya libros asociados
    const { data: librosAsociados } = await supabaseAdmin
      .from("libros")
      .select("id")
      .eq("editorial_id", id)
      .limit(1);

    if (librosAsociados && librosAsociados.length > 0) {
      return res.status(400).json({ 
        error: "No se puede eliminar la editorial porque tiene libros asociados" 
      });
    }

    // Eliminar editorial
    const { error } = await supabaseAdmin
      .from("editoriales")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("❌ [EDITORIALES] Error al eliminar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [EDITORIALES] Editorial eliminada:", existe.nombre);

    res.json({
      mensaje: "Editorial eliminada exitosamente",
      editorial: { id, nombre: existe.nombre }
    });
  } catch (err) {
    console.log("❌ [EDITORIALES] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al eliminar editorial" });
  }
};

module.exports = {
  listarEditoriales,
  obtenerEditorial,
  crearEditorial,
  actualizarEditorial,
  eliminarEditorial
};
