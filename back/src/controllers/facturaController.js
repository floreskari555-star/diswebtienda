/* | Nombre: facturaController.js | Finalidad: Consulta de facturas emitidas a clientes. */

const { supabaseAdmin } = require("../config/supabase");

// ── Historial de facturas del cliente autenticado ──────
const historialCliente = async (req, res) => {
  console.log("🧾 [FACTURAS] Historial del cliente:", req.user.id);

  try {
    const { data: facturas, error } = await supabaseAdmin
      .from("facturas")
      .select("*, facturas_detalles(*)")
      .eq("cliente_id", req.user.id)
      .order("creado_el", { ascending: false });

    if (error) {
      console.log("❌ [FACTURAS] Error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [FACTURAS] Total facturas del cliente:", facturas.length);

    res.json({
      total: facturas.length,
      facturas
    });
  } catch (err) {
    console.log("❌ [FACTURAS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al obtener historial de facturas" });
  }
};

// ── Listar todas las facturas (admin) ──────────────────
const listarFacturas = async (req, res) => {
  console.log("🧾 [FACTURAS] Listar todas (admin)");

  try {
    let query = supabaseAdmin
      .from("facturas")
      .select("*, facturas_detalles(*)")
      .order("creado_el", { ascending: false });

    const { data: facturas, error } = await query;

    if (error) {
      console.log("❌ [FACTURAS] Error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [FACTURAS] Total facturas:", facturas.length);

    res.json({
      total: facturas.length,
      facturas
    });
  } catch (err) {
    console.log("❌ [FACTURAS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al listar facturas" });
  }
};

// ── Obtener factura por ID ────────────────────────────
const obtenerFactura = async (req, res) => {
  console.log("🧾 [FACTURAS] Obtener por ID:", req.params.id);

  try {
    const { data: factura, error } = await supabaseAdmin
      .from("facturas")
      .select("*, facturas_detalles(*)")
      .eq("id", req.params.id)
      .single();

    if (error || !factura) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }

    res.json({ factura });
  } catch (err) {
    console.log("❌ [FACTURAS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al obtener factura" });
  }
};

// ── Crear factura con detalles ────────────────────────
const crearFactura = async (req, res) => {
  console.log("🧾 [FACTURAS] Crear nueva factura");

  const {
    tipo_comprobante, numero_documento,
    cliente_id, cliente_nombre, cliente_apellido_paterno, cliente_apellido_materno,
    cliente_numero_doc, cliente_direccion,
    subtotal, igv, total,
    estado, dia, mes, anio,
    detalles
  } = req.body;

  if (!tipo_comprobante || !numero_documento) {
    return res.status(400).json({ error: "tipo_comprobante y numero_documento son requeridos" });
  }

  try {
    const { data: factura, error: facturaError } = await supabaseAdmin
      .from("facturas")
      .insert({
        tipo_comprobante,
        numero_documento,
        cliente_id: cliente_id || null,
        cliente_nombre: cliente_nombre || "",
        cliente_apellido_paterno: cliente_apellido_paterno || "",
        cliente_apellido_materno: cliente_apellido_materno || "",
        cliente_numero_doc: cliente_numero_doc || "",
        cliente_direccion: cliente_direccion || "",
        subtotal: subtotal || 0,
        igv: igv || 0,
        total: total || 0,
        estado: estado || "Valido",
        dia: dia || null,
        mes: mes || null,
        anio: anio || null
      })
      .select()
      .single();

    if (facturaError) {
      console.log("❌ [FACTURAS] Error al crear factura:", facturaError.message);
      return res.status(400).json({ error: facturaError.message });
    }

    console.log("✅ [FACTURAS] Factura creada:", factura.numero_documento);

    // Insertar detalles
    if (detalles && detalles.length > 0) {
      const detallesInsert = detalles.map(d => ({
        factura_id: factura.id,
        numero_item: d.numero_item || 1,
        codigo: d.codigo || "",
        descripcion: d.descripcion || "",
        precio_unitario: d.precio_unitario || 0,
        cantidad: d.cantidad || 1,
        total_item: d.total_item || 0
      }));

      const { error: detallesError } = await supabaseAdmin
        .from("facturas_detalles")
        .insert(detallesInsert);

      if (detallesError) {
        console.log("❌ [FACTURAS] Error al crear detalles:", detallesError.message);
      }
    }

    res.status(201).json({
      mensaje: "Factura creada exitosamente",
      factura
    });
  } catch (err) {
    console.log("❌ [FACTURAS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al crear factura" });
  }
};

module.exports = {
  crearFactura,
  historialCliente,
  listarFacturas,
  obtenerFactura
};
