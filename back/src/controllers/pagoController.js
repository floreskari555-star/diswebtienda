/* | Nombre: pagoController.js | Finalidad: CRUD de pagos a editoriales por derechos. */

const { supabaseAdmin, BUCKET_NAME } = require("../config/supabase");

// ── Listar pagos (admin ve todos, proveedor los suyos) ─────
const listarPagos = async (req, res) => {
  console.log("💰 [PAGOS] Listar pagos a editoriales");

  try {
    const { estado, solicitud_id } = req.query;
    const rol = req.perfil.rol;
    const usuarioId = req.perfil.id;

    let query = supabaseAdmin
      .from("pagos_editoriales")
      .select("*, solicitudes_derechos(id, titulo, autor), editoriales(id, nombre), perfiles(id, nombre, apellido)")
      .order("creado_el", { ascending: false });

    // Proveedor solo ve sus pagos
    if (rol === "proveedor") {
      query = query.eq("usuario_id", usuarioId);
    }

    // Filtros
    if (estado) {
      query = query.eq("estado", estado);
    }
    if (solicitud_id) {
      query = query.eq("solicitud_id", solicitud_id);
    }

    const { data: pagos, error } = await query;

    if (error) {
      console.log("❌ [PAGOS] Error al listar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [PAGOS] Total:", pagos.length);

    res.json({
      total: pagos.length,
      pagos
    });
  } catch (err) {
    console.log("❌ [PAGOS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al listar pagos" });
  }
};

// ── Obtener pago por ID ──────────────────────────────
const obtenerPago = async (req, res) => {
  console.log("📖 [PAGOS] Obtener pago:", req.params.id);

  const { id } = req.params;

  try {
    const { data: pago, error } = await supabaseAdmin
      .from("pagos_editoriales")
      .select("*, solicitudes_derechos(id, titulo, autor, editorial_id), editoriales(id, nombre), perfiles(id, nombre, apellido)")
      .eq("id", id)
      .single();

    if (error || !pago) {
      console.log("❌ [PAGOS] No encontrado");
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    console.log("✅ [PAGOS] Encontrado");

    res.json({ pago });
  } catch (err) {
    console.log("❌ [PAGOS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al obtener pago" });
  }
};

// ── Crear pago (proveedor o admin) ───────────────────
const crearPago = async (req, res) => {
  console.log("➕ [PAGOS] Crear nuevo pago");

  const { solicitud_id, editorial_id, monto, numero_operacion, fecha_pago, observaciones } = req.body;
  const usuario_id = req.perfil.id;

  // Validaciones
  if (!solicitud_id || !editorial_id) {
    return res.status(400).json({ error: "Solicitud y editorial son obligatorios" });
  }

  if (!monto || monto <= 0) {
    return res.status(400).json({ error: "El monto debe ser mayor a 0" });
  }

  try {
    // Verificar que la solicitud existe y está en estado válido
    const { data: solicitud } = await supabaseAdmin
      .from("solicitudes_derechos")
      .select("id, estado")
      .eq("id", solicitud_id)
      .single();

    if (!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    if (!["pendiente", "en_revision"].includes(solicitud.estado)) {
      return res.status(400).json({ error: "La solicitud no acepta pagos en su estado actual" });
    }

    // Subir comprobante si se proporciona
    let comprobante_url = "";
    if (req.files && req.files.comprobante) {
      const archivo = req.files.comprobante;
      const nombreArchivo = `comprobante${Date.now()}.png`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(nombreArchivo, archivo.data, {
          contentType: archivo.mimetype
        });

      if (uploadError) {
        console.log("❌ [PAGOS] Error al subir comprobante:", uploadError.message);
        return res.status(400).json({ error: "Error al subir el comprobante" });
      }

      const { data: urlData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(nombreArchivo);

      comprobante_url = urlData.publicUrl;
    }

    const { data: pago, error } = await supabaseAdmin
      .from("pagos_editoriales")
      .insert({
        solicitud_id,
        usuario_id,
        editorial_id,
        monto,
        comprobante_url,
        numero_operacion: numero_operacion || "",
        fecha_pago: fecha_pago || null,
        observaciones: observaciones || "",
        estado: "pendiente"
      })
      .select("*, editoriales(id, nombre)")
      .single();

    if (error) {
      console.log("❌ [PAGOS] Error al crear:", error.message);
      return res.status(400).json({ error: error.message });
    }

    // Actualizar estado de la solicitud
    await supabaseAdmin
      .from("solicitudes_derechos")
      .update({ estado: "en_revision" })
      .eq("id", solicitud_id);

    console.log("✅ [PAGOS] Creado");

    res.status(201).json({
      mensaje: "Pago registrado exitosamente",
      pago
    });
  } catch (err) {
    console.log("❌ [PAGOS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al crear pago" });
  }
};

// ── Aprobar pago (solo admin) ────────────────────────
const aprobarPago = async (req, res) => {
  console.log("✅ [PAGOS] Aprobar pago:", req.params.id);

  const { id } = req.params;

  try {
    const { data: existe } = await supabaseAdmin
      .from("pagos_editoriales")
      .select("id, solicitud_id, estado")
      .eq("id", id)
      .single();

    if (!existe) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    if (existe.estado !== "pendiente") {
      return res.status(400).json({ error: "Solo se pueden aprobar pagos pendientes" });
    }

    const { data: pago, error } = await supabaseAdmin
      .from("pagos_editoriales")
      .update({
        estado: "aprobado",
        admin_revision_id: req.perfil.id,
        fecha_revision: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.log("❌ [PAGOS] Error al aprobar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    // Aprobar también la solicitud
    await supabaseAdmin
      .from("solicitudes_derechos")
      .update({ estado: "aprobada" })
      .eq("id", existe.solicitud_id);

    console.log("✅ [PAGOS] Aprobado y solicitud aprobada");

    res.json({
      mensaje: "Pago aprobado exitosamente. Solicitud habilitada para carga de archivos.",
      pago
    });
  } catch (err) {
    console.log("❌ [PAGOS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al aprobar pago" });
  }
};

// ── Rechazar pago (solo admin) ───────────────────────
const rechazarPago = async (req, res) => {
  console.log("❌ [PAGOS] Rechazar pago:", req.params.id);

  const { id } = req.params;
  const { motivo_rechazo } = req.body;

  if (!motivo_rechazo) {
    return res.status(400).json({ error: "El motivo de rechazo es obligatorio" });
  }

  try {
    const { data: existe } = await supabaseAdmin
      .from("pagos_editoriales")
      .select("id, solicitud_id, estado, comprobante_url")
      .eq("id", id)
      .single();

    if (!existe) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    if (existe.estado !== "pendiente") {
      return res.status(400).json({ error: "Solo se pueden rechazar pagos pendientes" });
    }

    // Eliminar comprobante del storage si existe
    if (existe.comprobante_url) {
      const nombreArchivo = existe.comprobante_url.split("/").pop();
      await supabaseAdmin.storage.from(BUCKET_NAME).remove([nombreArchivo]);
    }

    const { data: pago, error } = await supabaseAdmin
      .from("pagos_editoriales")
      .update({
        estado: "rechazado",
        admin_revision_id: req.perfil.id,
        fecha_revision: new Date().toISOString(),
        motivo_rechazo,
        comprobante_url: ""
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.log("❌ [PAGOS] Error al rechazar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    // Rechazar también la solicitud
    await supabaseAdmin
      .from("solicitudes_derechos")
      .update({ estado: "rechazada" })
      .eq("id", existe.solicitud_id);

    console.log("✅ [PAGOS] Rechazado");

    res.json({
      mensaje: "Pago rechazado",
      pago
    });
  } catch (err) {
    console.log("❌ [PAGOS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al rechazar pago" });
  }
};

// ── Eliminar pago ────────────────────────────────────
const eliminarPago = async (req, res) => {
  console.log("🗑️ [PAGOS] Eliminar pago:", req.params.id);

  const { id } = req.params;

  try {
    const { data: existe } = await supabaseAdmin
      .from("pagos_editoriales")
      .select("id, comprobante_url")
      .eq("id", id)
      .single();

    if (!existe) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    // Eliminar comprobante del storage
    if (existe.comprobante_url) {
      const nombreArchivo = existe.comprobante_url.split("/").pop();
      await supabaseAdmin.storage.from(BUCKET_NAME).remove([nombreArchivo]);
    }

    const { error } = await supabaseAdmin
      .from("pagos_editoriales")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("❌ [PAGOS] Error al eliminar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [PAGOS] Eliminado");

    res.json({
      mensaje: "Pago eliminado exitosamente"
    });
  } catch (err) {
    console.log("❌ [PAGOS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al eliminar pago" });
  }
};

module.exports = {
  listarPagos,
  obtenerPago,
  crearPago,
  aprobarPago,
  rechazarPago,
  eliminarPago
};
