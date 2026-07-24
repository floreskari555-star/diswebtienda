/* | Nombre: userController.js | Finalidad: CRUD completo de usuarios (solo administradores). */

const { supabaseAdmin } = require("../config/supabase");

// ── Listar todos los usuarios ────────────────────────
const listarUsuarios = async (req, res) => {
  console.log("📋 [USUARIOS] Listar todos los usuarios");

  try {
    const { data: usuarios, error } = await supabaseAdmin
      .from("perfiles")
      .select("*")
      .order("creado_al", { ascending: false });

    if (error) {
      console.log("❌ [USUARIOS] Error al listar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [USUARIOS] Total usuarios:", usuarios.length);

    res.json({
      total: usuarios.length,
      usuarios
    });
  } catch (err) {
    console.log("❌ [USUARIOS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al listar usuarios" });
  }
};

// ── Obtener usuario por ID ───────────────────────────
const obtenerUsuario = async (req, res) => {
  console.log("👤 [USUARIOS] Obtener usuario por ID:", req.params.id);

  const { id } = req.params;

  try {
    const { data: usuario, error } = await supabaseAdmin
      .from("perfiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !usuario) {
      console.log("❌ [USUARIOS] Usuario no encontrado");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    console.log("✅ [USUARIOS] Usuario encontrado:", usuario.email);

    res.json({ usuario });
  } catch (err) {
    console.log("❌ [USUARIOS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// ── Actualizar usuario ───────────────────────────────
const actualizarUsuario = async (req, res) => {
  console.log("✏️ [USUARIOS] Actualizar usuario:", req.params.id);

  const { id } = req.params;
  const { nombre, apellido, telefono, direccion, rol, editorial_id } = req.body;

  try {
    // Verificar que el usuario existe
    const { data: existe } = await supabaseAdmin
      .from("perfiles")
      .select("id")
      .eq("id", id)
      .single();

    if (!existe) {
      console.log("❌ [USUARIOS] Usuario no encontrado");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Actualizar usuario
    const updates = {
      nombre,
      apellido,
      telefono,
      direccion,
      rol,
      actualizado_al: new Date().toISOString()
    };

    // Asociar editorial solo para proveedores
    if (rol === "proveedor" && editorial_id) {
      updates.editorial_id = editorial_id;
    } else if (rol !== "proveedor") {
      updates.editorial_id = null;
    }

    const { data: usuario, error } = await supabaseAdmin
      .from("perfiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.log("❌ [USUARIOS] Error al actualizar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [USUARIOS] Usuario actualizado:", usuario.email);

    res.json({
      mensaje: "Usuario actualizado exitosamente",
      usuario
    });
  } catch (err) {
    console.log("❌ [USUARIOS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

// ── Proveedores sin editorial asociada ────────────────
const proveedoresSinEditorial = async (req, res) => {
  console.log("📋 [USUARIOS] Proveedores sin editorial");

  try {
    const { data: proveedores, error } = await supabaseAdmin
      .from("perfiles")
      .select("id, email, nombre, apellido, creado_al")
      .eq("rol", "proveedor")
      .is("editorial_id", null)
      .order("creado_al", { ascending: false });

    if (error) {
      console.log("❌ [USUARIOS] Error al listar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [USUARIOS] Proveedores sin editorial:", proveedores.length);

    res.json({
      total: proveedores.length,
      proveedores
    });
  } catch (err) {
    console.log("❌ [USUARIOS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al listar proveedores" });
  }
};

// ── Eliminar usuario ─────────────────────────────────
const eliminarUsuario = async (req, res) => {
  console.log("🗑️ [USUARIOS] Eliminar usuario:", req.params.id);

  const { id } = req.params;

  try {
    // Verificar que el usuario existe
    const { data: existe } = await supabaseAdmin
      .from("perfiles")
      .select("id, email, rol")
      .eq("id", id)
      .single();

    if (!existe) {
      console.log("❌ [USUARIOS] Usuario no encontrado");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // No permitir eliminar super users
    if (existe.rol === "super") {
      console.log("❌ [USUARIOS] No se puede eliminar un usuario super");
      return res.status(403).json({ error: "No se puede eliminar un usuario super" });
    }

    // Eliminar usuario de Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      console.log("❌ [USUARIOS] Error al eliminar de Auth:", authError.message);
      return res.status(400).json({ error: authError.message });
    }

    console.log("✅ [USUARIOS] Usuario eliminado:", existe.email);

    res.json({
      mensaje: "Usuario eliminado exitosamente",
      usuario: { id, email: existe.email }
    });
  } catch (err) {
    console.log("❌ [USUARIOS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  proveedoresSinEditorial
};
