/* | Nombre: facturaController.js | Finalidad: Consulta, creación y anulación de comprobantes. */

const { supabaseAdmin } = require("../config/supabase");

// ── Obtener siguiente correlativo de tablas_maestras ──
async function siguienteCorrelativo(tipo) {
  const clave = tipo === "FACTURA" ? "FACTURA" : "BOLETA";
  const prefijo = tipo === "FACTURA" ? "F001-" : "B001-";

  const { data: registro, error: readError } = await supabaseAdmin
    .from("tablas_maestras")
    .select("id, valor")
    .eq("tabla", "ultdoc")
    .eq("clave", clave)
    .single();

  if (readError || !registro) {
    throw new Error("No se encontró correlativo para " + clave);
  }

  const actual = parseInt(registro.valor, 10) || 0;
  const siguiente = actual + 1;
  const numeroFormateado = String(siguiente).padStart(7, "0");

  const { error: updateError } = await supabaseAdmin
    .from("tablas_maestras")
    .update({ valor: numeroFormateado })
    .eq("id", registro.id);

  if (updateError) {
    throw new Error("Error al actualizar correlativo: " + updateError.message);
  }

  return prefijo + numeroFormateado;
}

// ── Crear factura con detalles ────────────────────────
const crearFactura = async (req, res) => {
  console.log("🧾 [FACTURAS] Crear nueva factura");

  const {
    tipo_comprobante,
    cliente_id, cliente_nombre, cliente_apellido_paterno, cliente_apellido_materno,
    cliente_numero_doc, cliente_direccion,
    subtotal, igv, total,
    dia, mes, anio,
    detalles
  } = req.body;

  if (!tipo_comprobante) {
    return res.status(400).json({ error: "tipo_comprobante es requerido" });
  }

  try {
    const numero_documento = await siguienteCorrelativo(tipo_comprobante);

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
        estado: "Valido",
        dia: dia || null,
        mes: mes || null,
        anio: anio || null
      })
      .select()
      .single();

    if (facturaError) {
      console.log("❌ [FACTURAS] Error al crear:", facturaError.message);
      return res.status(400).json({ error: facturaError.message });
    }

    console.log("✅ [FACTURAS] Creada:", numero_documento);

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
        console.log("❌ [FACTURAS] Error detalles:", detallesError.message);
      }
    }

    res.status(201).json({ mensaje: "Factura creada", factura });
  } catch (err) {
    console.log("❌ [FACTURAS] Error inesperado:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ── Anular factura ────────────────────────────────────
const anularFactura = async (req, res) => {
  console.log("🧾 [FACTURAS] Anular:", req.params.id);

  try {
    const { data: factura, error: findError } = await supabaseAdmin
      .from("facturas")
      .select("id, estado, numero_documento")
      .eq("id", req.params.id)
      .single();

    if (findError || !factura) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }

    if (factura.estado === "Anulado") {
      return res.status(400).json({ error: "La factura ya está anulada" });
    }

    const { error } = await supabaseAdmin
      .from("facturas")
      .update({ estado: "Anulado" })
      .eq("id", req.params.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [FACTURAS] Anulada:", factura.numero_documento);
    res.json({ mensaje: "Comprobante anulado exitosamente" });
  } catch (err) {
    console.log("❌ [FACTURAS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al anular factura" });
  }
};

// ── Historial del cliente ─────────────────────────────
const historialCliente = async (req, res) => {
  console.log("🧾 [FACTURAS] Historial del cliente:", req.user.id);

  try {
    const { data: facturas, error } = await supabaseAdmin
      .from("facturas")
      .select("*, facturas_detalles(*)")
      .eq("cliente_id", req.user.id)
      .order("creado_el", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ total: facturas.length, facturas });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener historial" });
  }
};

// ── Listar todas las facturas (admin) ─────────────────
const listarFacturas = async (req, res) => {
  console.log("🧾 [FACTURAS] Listar todas (admin)");

  try {
    const { data: facturas, error } = await supabaseAdmin
      .from("facturas")
      .select("*, facturas_detalles(*)")
      .order("creado_el", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ total: facturas.length, facturas });
  } catch (err) {
    return res.status(500).json({ error: "Error al listar facturas" });
  }
};

// ── Obtener factura por ID ───────────────────────────
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
    return res.status(500).json({ error: "Error al obtener factura" });
  }
};

module.exports = {
  crearFactura,
  anularFactura,
  historialCliente,
  listarFacturas,
  obtenerFactura
};
