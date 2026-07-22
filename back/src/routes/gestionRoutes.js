/* | Nombre: gestionRoutes.js | Finalidad: Rutas para formulario web de gestión de usuarios (solo desarrollo). */

const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabase");

// ── Página principal de gestión ──────────────────────
router.get("/gestion", async (req, res) => {
  console.log("🌐 [GESTION] Cargando página de gestión");

  try {
    // Obtener todos los usuarios
    const { data: usuarios, error } = await supabaseAdmin
      .from("perfiles")
      .select("*")
      .order("creado_al", { ascending: false });

    if (error) {
      console.log("❌ [GESTION] Error al obtener usuarios:", error.message);
    }

    res.render("gestion", { 
      usuarios: usuarios || [],
      mensaje: req.query.mensaje || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.log("❌ [GESTION] Error inesperado:", err.message);
    res.render("gestion", { 
      usuarios: [], 
      mensaje: null, 
      error: "Error al cargar usuarios" 
    });
  }
});

// ── Registrar usuario desde el formulario ────────────
router.post("/gestion/registro", async (req, res) => {
  console.log("📝 [GESTION] Registro de usuario desde formulario");

  const { nombre, apellido, telefono, direccion, email, password, rol } = req.body;

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
        rol: rol || "cliente"
      }
    });

    if (error) {
      console.log("❌ [GESTION] Error al crear usuario:");
      console.log("   String(error):", String(error));
      console.log("   name:", error?.name);
      console.log("   status:", error?.status);
      console.log("   statusCode:", error?.statusCode);
      console.log("   message:", error?.message);
      console.log("   error:", error?.error);
      console.log("   error_description:", error?.error_description);
      console.log("   Keys:", Object.keys(error || {}));
      const errorMsg = error?.message || error?.error || String(error) || "Error al crear usuario";
      return res.redirect("/gestion?error=" + encodeURIComponent(errorMsg));
    }

    console.log("✅ [GESTION] Usuario creado:", email, "| Rol:", rol);

    res.redirect("/gestion?mensaje=" + encodeURIComponent("Usuario creado exitosamente"));
  } catch (err) {
    console.log("❌ [GESTION] Error inesperado:", err.message);
    res.redirect("/gestion?error=" + encodeURIComponent("Error al crear usuario"));
  }
});

// ── Eliminar usuario desde el formulario ─────────────
router.post("/gestion/eliminar/:id", async (req, res) => {
  console.log("🗑️ [GESTION] Eliminar usuario:", req.params.id);

  const { id } = req.params;

  try {
    // Verificar que no sea super
    const { data: usuario } = await supabaseAdmin
      .from("perfiles")
      .select("rol")
      .eq("id", id)
      .single();

    if (usuario && usuario.rol === "super") {
      return res.redirect("/gestion?error=" + encodeURIComponent("No se puede eliminar un usuario super"));
    }

    // Eliminar usuario
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      console.log("❌ [GESTION] Error al eliminar:", error.message);
      return res.redirect("/gestion?error=" + encodeURIComponent(error.message));
    }

    console.log("✅ [GESTION] Usuario eliminado:", id);

    res.redirect("/gestion?mensaje=" + encodeURIComponent("Usuario eliminado exitosamente"));
  } catch (err) {
    console.log("❌ [GESTION] Error inesperado:", err.message);
    res.redirect("/gestion?error=" + encodeURIComponent("Error al eliminar usuario"));
  }
});

module.exports = router;
