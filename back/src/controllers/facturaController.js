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

module.exports = {
  historialCliente,
  listarFacturas,
  obtenerFactura
};
