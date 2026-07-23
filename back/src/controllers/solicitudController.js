/* | Nombre: solicitudController.js | Finalidad: CRUD de solicitudes de derechos de publicación. */

const { supabaseAdmin } = require("../config/supabase");

// ── Listar solicitudes (admin ve todas, proveedor las suyas) ─────
const listarSolicitudes = async (req, res) => {
  console.log("📋 [SOLICITUDES] Listar solicitudes");

  try {
    const { estado, editorial_id } = req.query;
    const rol = req.perfil.rol;
    const usuarioId = req.perfil.id;

    let query = supabaseAdmin
      .from("solicitudes_derechos")
      .select("*, editoriales(id, nombre), perfiles(id, nombre, apellido, correo)")
      .order("creado_el", { ascending: false });

    // Solo admin/super ven todas
    if (rol === "proveedor") {
      query = query.eq("usuario_id", usuarioId);
    }

    // Filtros
    if (estado) {
      query = query.eq("estado", estado);
    }
    if (editorial_id) {
      query = query.eq("editorial_id", editorial_id);
    }

    const { data: solicitudes, error } = await query;

    if (error) {
      console.log("❌ [SOLICITUDES] Error al listar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [SOLICITUDES] Total:", solicitudes.length);

    res.json({
      total: solicitudes.length,
      solicitudes
    });
  } catch (err) {
    console.log("❌ [SOLICITUDES] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al listar solicitudes" });
  }
};

// ── Obtener solicitud por ID ─────────────────────────
const obtenerSolicitud = async (req, res) => {
  console.log("📖 [SOLICITUDES] Obtener solicitud:", req.params.id);

  const { id } = req.params;

  try {
    const { data: solicitud, error } = await supabaseAdmin
      .from("solicitudes_derechos")
      .select("*, editoriales(id, nombre), perfiles(id, nombre, apellido, correo)")
      .eq("id", id)
      .single();

    if (error || !solicitud) {
      console.log("❌ [SOLICITUDES] No encontrada");
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    // Verificar permisos
    if (req.perfil.rol === "proveedor" && solicitud.usuario_id !== req.perfil.id) {
      return res.status(403).json({ error: "No tienes acceso a esta solicitud" });
    }

    console.log("✅ [SOLICITUDES] Encontrada:", solicitud.titulo);

    res.json({ solicitud });
  } catch (err) {
    console.log("❌ [SOLICITUDES] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al obtener solicitud" });
  }
};

// ── Crear solicitud (proveedor o admin) ──────────────
const crearSolicitud = async (req, res) => {
  console.log("➕ [SOLICITUDES] Crear nueva solicitud");

  const { editorial_id, titulo, autor, descripcion, sinopsis, anio, precio, monto_derechos, observaciones } = req.body;
  const usuario_id = req.perfil.id;

  // Validaciones
  if (!editorial_id || !titulo || !autor) {
    return res.status(400).json({ error: "Editorial, título y autor son obligatorios" });
  }

  if (!precio || precio <= 0) {
    return res.status(400).json({ error: "El precio debe ser mayor a 0" });
  }

  if (!monto_derechos || monto_derechos <= 0) {
    return res.status(400).json({ error: "El monto de derechos debe ser mayor a 0" });
  }

  try {
    const { data: solicitud, error } = await supabaseAdmin
      .from("solicitudes_derechos")
      .insert({
        usuario_id,
        editorial_id,
        titulo,
        autor,
        descripcion: descripcion || "",
        sinopsis: sinopsis || "",
        anio: anio || null,
        precio,
        monto_derechos,
        observaciones: observaciones || "",
        estado: "pendiente"
      })
      .select("*, editoriales(id, nombre)")
      .single();

    if (error) {
      console.log("❌ [SOLICITUDES] Error al crear:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [SOLICITUDES] Creada:", solicitud.titulo);

    res.status(201).json({
      mensaje: "Solicitud creada exitosamente",
      solicitud
    });
  } catch (err) {
    console.log("❌ [SOLICITUDES] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al crear solicitud" });
  }
};

// ── Actualizar solicitud ─────────────────────────────
const actualizarSolicitud = async (req, res) => {
  console.log("✏️ [SOLICITUDES] Actualizar solicitud:", req.params.id);

  const { id } = req.params;
  const { editorial_id, titulo, autor, descripcion, sinopsis, anio, precio, monto_derechos, observaciones } = req.body;

  try {
    // Verificar que existe
    const { data: existe } = await supabaseAdmin
      .from("solicitudes_derechos")
      .select("id, usuario_id, estado")
      .eq("id", id)
      .single();

    if (!existe) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    // Solo se puede editar si está pendiente o en revisión
    if (!["pendiente", "en_revision"].includes(existe.estado)) {
      return res.status(400).json({ error: "No se puede editar una solicitud con estado: " + existe.estado });
    }

    // Proveedor solo puede editar sus propias solicitudes
    if (req.perfil.rol === "proveedor" && existe.usuario_id !== req.perfil.id) {
      return res.status(403).json({ error: "No tienes permiso para editar esta solicitud" });
    }

    const updates = {};
    if (editorial_id !== undefined) updates.editorial_id = editorial_id;
    if (titulo !== undefined) updates.titulo = titulo;
    if (autor !== undefined) updates.autor = autor;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (sinopsis !== undefined) updates.sinopsis = sinopsis;
    if (anio !== undefined) updates.anio = anio;
    if (precio !== undefined) updates.precio = precio;
    if (monto_derechos !== undefined) updates.monto_derechos = monto_derechos;
    if (observaciones !== undefined) updates.observaciones = observaciones;

    const { data: solicitud, error } = await supabaseAdmin
      .from("solicitudes_derechos")
      .update(updates)
      .eq("id", id)
      .select("*, editoriales(id, nombre)")
      .single();

    if (error) {
      console.log("❌ [SOLICITUDES] Error al actualizar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [SOLICITUDES] Actualizada:", solicitud.titulo);

    res.json({
      mensaje: "Solicitud actualizada exitosamente",
      solicitud
    });
  } catch (err) {
    console.log("❌ [SOLICITUDES] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al actualizar solicitud" });
  }
};

// ── Cambiar estado de solicitud (solo admin) ─────────
const cambiarEstadoSolicitud = async (req, res) => {
  console.log("🔄 [SOLICITUDES] Cambiar estado:", req.params.id);

  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ["pendiente", "en_revision", "aprobada", "rechazada", "archivada"];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  try {
    const { data: solicitud, error } = await supabaseAdmin
      .from("solicitudes_derechos")
      .update({ estado })
      .eq("id", id)
      .select("*, editoriales(id, nombre)")
      .single();

    if (error) {
      console.log("❌ [SOLICITUDES] Error al cambiar estado:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [SOLICITUDES] Estado cambiado a:", estado);

    res.json({
      mensaje: "Estado actualizado exitosamente",
      solicitud
    });
  } catch (err) {
    console.log("❌ [SOLICITUDES] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al cambiar estado" });
  }
};

// ── Eliminar solicitud ───────────────────────────────
const eliminarSolicitud = async (req, res) => {
  console.log("🗑️ [SOLICITUDES] Eliminar solicitud:", req.params.id);

  const { id } = req.params;

  try {
    const { data: existe } = await supabaseAdmin
      .from("solicitudes_derechos")
      .select("id, titulo, usuario_id")
      .eq("id", id)
      .single();

    if (!existe) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    // Proveedor solo puede eliminar sus propias solicitudes pendientes
    if (req.perfil.rol === "proveedor") {
      if (existe.usuario_id !== req.perfil.id) {
        return res.status(403).json({ error: "No tienes permiso" });
      }
    }

    const { error } = await supabaseAdmin
      .from("solicitudes_derechos")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("❌ [SOLICITUDES] Error al eliminar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [SOLICITUDES] Eliminada:", existe.titulo);

    res.json({
      mensaje: "Solicitud eliminada exitosamente",
      solicitud: { id, titulo: existe.titulo }
    });
  } catch (err) {
    console.log("❌ [SOLICITUDES] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al eliminar solicitud" });
  }
};

module.exports = {
  listarSolicitudes,
  obtenerSolicitud,
  crearSolicitud,
  actualizarSolicitud,
  cambiarEstadoSolicitud,
  eliminarSolicitud
};
