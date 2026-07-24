/* | Nombre: authController.js | Finalidad: Gestiona la lógica de registro, inicio de sesión y perfiles de usuario. */

const { supabase, supabaseAdmin } = require("../config/supabase");

// ── Registro de cliente ──────────────────────────────
const registro = async (req, res) => {
  console.log("📝 [AUTH] Registro de cliente");

  const { nombre, apellido, telefono, direccion, email, password } = req.body;

  // Validaciones
  if (!nombre || !apellido || !email || !password) {
    console.log("❌ [AUTH] Faltan campos obligatorios");
    return res.status(400).json({ 
      error: "Faltan campos obligatorios",
      requeridos: ["nombre", "apellido", "email", "password"]
    });
  }

  try {
    // Crear usuario en Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre,
        apellido,
        telefono: telefono || "",
        direccion: direccion || "",
        correo: email,
        rol: "cliente"
      }
    });

    if (error) {
      console.log("❌ [AUTH] Error al crear usuario:");
      console.log("   String(error):", String(error));
      console.log("   name:", error?.name);
      console.log("   status:", error?.status);
      console.log("   statusCode:", error?.statusCode);
      console.log("   message:", error?.message);
      console.log("   error:", error?.error);
      console.log("   error_description:", error?.error_description);
      console.log("   Keys:", Object.keys(error || {}));
      const errorMsg = error?.message || error?.error || String(error) || "Error al crear usuario";
      return res.status(400).json({ error: errorMsg });
    }

    console.log("✅ [AUTH] Cliente registrado:", email, "| ID:", data.user.id);

    res.status(201).json({
      mensaje: "Cliente registrado exitosamente",
      usuario: {
        id: data.user.id,
        email: data.user.email,
        nombre,
        apellido,
        rol: "cliente"
      }
    });
  } catch (err) {
    console.log("❌ [AUTH] Error inesperado:");
    console.log("   name:", err.name);
    console.log("   message:", err.message);
    console.log("   stack:", err.stack);
    return res.status(500).json({ error: err.message || "Error al registrar usuario" });
  }
};

// ── Registro de proveedor ────────────────────────────
const registroProveedor = async (req, res) => {
  console.log("📝 [AUTH] Registro de proveedor");

  const { nombre, apellido, telefono, direccion, email, password } = req.body;

  if (!nombre || !apellido || !email || !password) {
    console.log("❌ [AUTH] Faltan campos obligatorios");
    return res.status(400).json({ 
      error: "Faltan campos obligatorios",
      requeridos: ["nombre", "apellido", "email", "password"]
    });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre,
        apellido,
        telefono: telefono || "",
        direccion: direccion || "",
        correo: email,
        rol: "proveedor"
      }
    });

    if (error) {
      console.log("❌ [AUTH] Error al crear proveedor:");
      console.log("   String(error):", String(error));
      console.log("   name:", error?.name);
      console.log("   status:", error?.status);
      console.log("   statusCode:", error?.statusCode);
      console.log("   message:", error?.message);
      console.log("   error:", error?.error);
      console.log("   Keys:", Object.keys(error || {}));
      const errorMsg = error?.message || error?.error || String(error) || "Error al crear proveedor";
      return res.status(400).json({ error: errorMsg });
    }

    console.log("✅ [AUTH] Proveedor registrado:", email, "| ID:", data.user.id);

    res.status(201).json({
      mensaje: "Proveedor registrado exitosamente",
      usuario: {
        id: data.user.id,
        email: data.user.email,
        nombre,
        apellido,
        rol: "proveedor"
      }
    });
  } catch (err) {
    console.log("❌ [AUTH] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al registrar proveedor" });
  }
};

// ── Login ────────────────────────────────────────────
const login = async (req, res) => {
  console.log("🔑 [AUTH] Login");

  // Aceptar tanto "email" como "correo"
  const email = req.body.email || req.body.correo;
  const { password } = req.body;

  if (!email || !password) {
    console.log("❌ [AUTH] Faltan credenciales");
    return res.status(400).json({ error: "Email/correo y password son requeridos" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log("❌ [AUTH] Error en login:", error.message);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Obtener perfil del usuario
    const { data: perfil, error: perfilError } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (perfilError || !perfil) {
      console.log("❌ [AUTH] Perfil no encontrado para:", email);
      return res.status(404).json({ error: "Perfil de usuario no encontrado" });
    }

    console.log("✅ [AUTH] Login exitoso:", email, "| Rol:", perfil.rol);

    res.json({
      mensaje: "Inicio de sesión exitoso",
      usuario: {
        id: data.user.id,
        email: data.user.email,
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        rol: perfil.rol,
        editorial_id: perfil.editorial_id || null
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at
      }
    });
  } catch (err) {
    console.log("❌ [AUTH] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// ── Solicitud de reset password ──────────────────────
const solicitarResetPassword = async (req, res) => {
  console.log("🔑 [AUTH] Solicitud de reset password");

  const { email } = req.body;

  if (!email) {
    console.log("❌ [AUTH] Email no proporcionado");
    return res.status(400).json({ error: "Email es requerido" });
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CORS_ORIGIN || "http://localhost:5173"}/reset-password`
    });

    if (error) {
      console.log("❌ [AUTH] Error al enviar email de reset:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [AUTH] Email de reset enviado a:", email);

    res.json({
      mensaje: "Si el email existe, se ha enviado un enlace de restablecimiento"
    });
  } catch (err) {
    console.log("❌ [AUTH] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al procesar solicitud" });
  }
};

// ── Establecer nueva contraseña ──────────────────────
const establecerNuevaPassword = async (req, res) => {
  console.log("🔑 [AUTH] Establecer nueva contraseña");

  const { access_token, refresh_token, new_password } = req.body;

  if (!access_token || !refresh_token || !new_password) {
    console.log("❌ [AUTH] Faltan datos");
    return res.status(400).json({ 
      error: "Faltan campos requeridos",
      requeridos: ["access_token", "refresh_token", "new_password"]
    });
  }

  try {
    // Primero establecer la sesión con los tokens
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });

    if (sessionError) {
      console.log("❌ [AUTH] Error al establecer sesión:", sessionError.message);
      return res.status(400).json({ error: "Tokens inválidos o expirados" });
    }

    // Actualizar la contraseña
    const { error } = await supabase.auth.updateUser({
      password: new_password
    });

    if (error) {
      console.log("❌ [AUTH] Error al actualizar contraseña:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [AUTH] Contraseña actualizada exitosamente");

    res.json({
      mensaje: "Contraseña actualizada exitosamente"
    });
  } catch (err) {
    console.log("❌ [AUTH] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al actualizar contraseña" });
  }
};

// ── Obtener perfil del usuario autenticado ───────────
const obtenerPerfil = async (req, res) => {
  console.log("👤 [AUTH] Obtener perfil");

  try {
    const { data: perfil, error } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error || !perfil) {
      console.log("❌ [AUTH] Perfil no encontrado");
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    console.log("✅ [AUTH] Perfil obtenido:", perfil.email);

    res.json({ perfil });
  } catch (err) {
    console.log("❌ [AUTH] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al obtener perfil" });
  }
};

// ── Actualizar perfil ────────────────────────────────
const actualizarPerfil = async (req, res) => {
  console.log("✏️ [AUTH] Actualizar perfil");

  const { nombre, apellido, telefono, direccion } = req.body;

  try {
    const { data, error } = await supabase
      .from("perfiles")
      .update({
        nombre,
        apellido,
        telefono,
        direccion,
        actualizado_al: new Date().toISOString()
      })
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) {
      console.log("❌ [AUTH] Error al actualizar perfil:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [AUTH] Perfil actualizado:", data.email);

    res.json({
      mensaje: "Perfil actualizado exitosamente",
      perfil: data
    });
  } catch (err) {
    console.log("❌ [AUTH] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al actualizar perfil" });
  }
};

module.exports = {
  registro,
  registroProveedor,
  login,
  solicitarResetPassword,
  establecerNuevaPassword,
  obtenerPerfil,
  actualizarPerfil
};
