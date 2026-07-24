/* | Nombre: authMiddleware.js | Finalidad: Valida tokens JWT y restringe accesos según el rol (cliente/admin). */

const { supabaseAdmin } = require("../config/supabase");

// Middleware: verificar que el usuario está autenticado
const authenticate = async (req, res, next) => {
  console.log("🔐 [AUTH] Verificando autenticación...");

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ [AUTH] Token no proporcionado");
    return res.status(401).json({ error: "Token de autenticación no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.log("❌ [AUTH] Token inválido:", error?.message);
      return res.status(401).json({ error: "Token inválido o expirado" });
    }

    // Obtener perfil del usuario para saber el rol
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from("perfiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (perfilError || !perfil) {
      console.log("❌ [AUTH] Perfil no encontrado para usuario:", user.id);
      return res.status(401).json({ error: "Perfil de usuario no encontrado" });
    }

    req.user = user;
    req.perfil = perfil;
    req.token = token;

    console.log("✅ [AUTH] Usuario autenticado:", perfil.email, "| Rol:", perfil.rol);
    next();
  } catch (err) {
    console.log("❌ [AUTH] Error en autenticación:", err.message);
    return res.status(500).json({ error: "Error al verificar autenticación" });
  }
};

// Middleware: verificar que el usuario tiene uno de los roles permitidos
const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    console.log("🔐 [AUTH] Verificando autorización para roles:", rolesPermitidos);

    if (!req.perfil) {
      console.log("❌ [AUTH] No hay perfil de usuario en la petición");
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const rolUsuario = req.perfil.rol;

    if (!rolesPermitidos.includes(rolUsuario)) {
      console.log("❌ [AUTH] Rol no autorizado:", rolUsuario, "| Requerido:", rolesPermitidos);
      return res.status(403).json({ 
        error: "No tienes permisos para realizar esta acción",
        rolRequerido: rolesPermitidos,
        rolActual: rolUsuario
      });
    }

    console.log("✅ [AUTH] Autorizado | Rol:", rolUsuario);
    next();
  };
};

module.exports = { authenticate, authorize };
