/* | Nombre: gestionRoutes.js | Finalidad: Rutas para formulario web de gestión de usuarios y libros (solo desarrollo). */

const express = require("express");
const router = express.Router();
const { supabaseAdmin, BUCKET_NAME } = require("../config/supabase");

// ── Página principal de gestión (Usuarios) ───────────
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

// ── Actualizar usuario desde el formulario ───────────
router.post("/gestion/actualizar/:id", async (req, res) => {
  console.log("✏️ [GESTION] Actualizar usuario:", req.params.id);

  const { id } = req.params;
  const { nombre, apellido, telefono, direccion, rol } = req.body;

  try {
    // Verificar que el usuario existe
    const { data: existe } = await supabaseAdmin
      .from("perfiles")
      .select("id")
      .eq("id", id)
      .single();

    if (!existe) {
      return res.redirect("/gestion?error=" + encodeURIComponent("Usuario no encontrado"));
    }

    // Actualizar perfil en la tabla perfiles
    const { error: updateError } = await supabaseAdmin
      .from("perfiles")
      .update({
        nombre,
        apellido,
        telefono: telefono || "",
        direccion: direccion || "",
        rol,
        actualizado_al: new Date().toISOString()
      })
      .eq("id", id);

    if (updateError) {
      console.log("❌ [GESTION] Error al actualizar:", updateError.message);
      return res.redirect("/gestion?error=" + encodeURIComponent(updateError.message));
    }

    console.log("✅ [GESTION] Usuario actualizado:", id);

    res.redirect("/gestion?mensaje=" + encodeURIComponent("Usuario actualizado exitosamente"));
  } catch (err) {
    console.log("❌ [GESTION] Error inesperado:", err.message);
    res.redirect("/gestion?error=" + encodeURIComponent("Error al actualizar usuario"));
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

// ═════════════════════════════════════════════════════
// ── GESTIÓN DE LIBROS ───────────────────────────────
// ═════════════════════════════════════════════════════

// ── Página de gestión de libros ──────────────────────
router.get("/gestion/libros", async (req, res) => {
  console.log("🌐 [GESTION] Cargando gestión de libros");

  try {
    // Obtener todos los libros con editorial
    const { data: libros, error: librosError } = await supabaseAdmin
      .from("libros")
      .select("*, editoriales(id, nombre)")
      .order("creado_el", { ascending: false });

    if (librosError) {
      console.log("❌ [GESTION] Error al obtener libros:", librosError.message);
    }

    // Obtener editoriales para el select
    const { data: editoriales, error: editorialesError } = await supabaseAdmin
      .from("editoriales")
      .select("*")
      .order("nombre");

    if (editorialesError) {
      console.log("❌ [GESTION] Error al obtener editoriales:", editorialesError.message);
    }

    res.render("gestion-libros", { 
      libros: libros || [],
      editoriales: editoriales || [],
      mensaje: req.query.mensaje || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.log("❌ [GESTION] Error inesperado:", err.message);
    res.render("gestion-libros", { 
      libros: [], 
      editoriales: [],
      mensaje: null, 
      error: "Error al cargar libros" 
    });
  }
});

// ── Registrar libro desde el formulario ──────────────
router.post("/gestion/libros/registro", async (req, res) => {
  console.log("📝 [GESTION] Registro de libro desde formulario");

  const { titulo, autor, descripcion, sinopsis, anio, editorial_id, precio, activo } = req.body;

  try {
    let portada_url = "";
    let archivo_pdf_ruta = "";

    // Subir portada si se proporciona
    if (req.files && req.files.portada) {
      const archivo = req.files.portada;
      const nombreArchivo = `libro${Date.now()}.png`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(nombreArchivo, archivo.data, {
          contentType: archivo.mimetype
        });

      if (uploadError) {
        console.log("❌ [GESTION] Error al subir portada:", uploadError.message);
        return res.redirect("/gestion/libros?error=" + encodeURIComponent("Error al subir la portada"));
      }

      const { data: urlData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(nombreArchivo);

      portada_url = urlData.publicUrl;
    }

    // Subir PDF si se proporciona
    if (req.files && req.files.archivo_pdf) {
      const archivo = req.files.archivo_pdf;
      const nombreArchivo = `libro${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(nombreArchivo, archivo.data, {
          contentType: archivo.mimetype
        });

      if (uploadError) {
        console.log("❌ [GESTION] Error al subir PDF:", uploadError.message);
        return res.redirect("/gestion/libros?error=" + encodeURIComponent("Error al subir el archivo PDF"));
      }

      archivo_pdf_ruta = nombreArchivo;
    }

    // Crear libro en la base de datos
    const { error } = await supabaseAdmin
      .from("libros")
      .insert({
        titulo,
        autor,
        descripcion: descripcion || "",
        sinopsis: sinopsis || "",
        anio: anio ? parseInt(anio) : null,
        editorial_id,
        precio: parseFloat(precio),
        portada_url,
        archivo_pdf_ruta,
        activo: activo === "on"
      });

    if (error) {
      console.log("❌ [GESTION] Error al crear libro:", error.message);
      return res.redirect("/gestion/libros?error=" + encodeURIComponent(error.message));
    }

    console.log("✅ [GESTION] Libro creado:", titulo);

    res.redirect("/gestion/libros?mensaje=" + encodeURIComponent("Libro creado exitosamente"));
  } catch (err) {
    console.log("❌ [GESTION] Error inesperado:", err.message);
    res.redirect("/gestion/libros?error=" + encodeURIComponent("Error al crear libro"));
  }
});

// ── Actualizar libro desde el formulario ─────────────
router.post("/gestion/libros/actualizar/:id", async (req, res) => {
  console.log("✏️ [GESTION] Actualizar libro:", req.params.id);

  const { id } = req.params;
  const { titulo, autor, descripcion, sinopsis, anio, editorial_id, precio, activo } = req.body;

  try {
    // Verificar que el libro existe
    const { data: existe } = await supabaseAdmin
      .from("libros")
      .select("id, portada_url, archivo_pdf_ruta")
      .eq("id", id)
      .single();

    if (!existe) {
      return res.redirect("/gestion/libros?error=" + encodeURIComponent("Libro no encontrado"));
    }

    const updates = {
      titulo,
      autor,
      descripcion: descripcion || "",
      sinopsis: sinopsis || "",
      anio: anio ? parseInt(anio) : null,
      editorial_id,
      precio: parseFloat(precio),
      activo: activo === "on"
    };

    // Actualizar portada si se proporciona
    if (req.files && req.files.portada) {
      const archivo = req.files.portada;
      const nombreArchivo = `libro${Date.now()}.png`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(nombreArchivo, archivo.data, {
          contentType: archivo.mimetype
        });

      if (uploadError) {
        console.log("❌ [GESTION] Error al subir portada:", uploadError.message);
        return res.redirect("/gestion/libros?error=" + encodeURIComponent("Error al subir la portada"));
      }

      // Eliminar portada anterior
      if (existe.portada_url) {
        const nombreAnterior = existe.portada_url.split("/").pop();
        await supabaseAdmin.storage.from(BUCKET_NAME).remove([nombreAnterior]);
      }

      const { data: urlData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(nombreArchivo);

      updates.portada_url = urlData.publicUrl;
    }

    // Actualizar PDF si se proporciona
    if (req.files && req.files.archivo_pdf) {
      const archivo = req.files.archivo_pdf;
      const nombreArchivo = `libro${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(nombreArchivo, archivo.data, {
          contentType: archivo.mimetype
        });

      if (uploadError) {
        console.log("❌ [GESTION] Error al subir PDF:", uploadError.message);
        return res.redirect("/gestion/libros?error=" + encodeURIComponent("Error al subir el archivo PDF"));
      }

      // Eliminar PDF anterior
      if (existe.archivo_pdf_ruta) {
        await supabaseAdmin.storage.from(BUCKET_NAME).remove([existe.archivo_pdf_ruta]);
      }

      updates.archivo_pdf_ruta = nombreArchivo;
    }

    // Actualizar libro
    const { error } = await supabaseAdmin
      .from("libros")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.log("❌ [GESTION] Error al actualizar:", error.message);
      return res.redirect("/gestion/libros?error=" + encodeURIComponent(error.message));
    }

    console.log("✅ [GESTION] Libro actualizado:", id);

    res.redirect("/gestion/libros?mensaje=" + encodeURIComponent("Libro actualizado exitosamente"));
  } catch (err) {
    console.log("❌ [GESTION] Error inesperado:", err.message);
    res.redirect("/gestion/libros?error=" + encodeURIComponent("Error al actualizar libro"));
  }
});

// ── Eliminar libro desde el formulario ───────────────
router.post("/gestion/libros/eliminar/:id", async (req, res) => {
  console.log("🗑️ [GESTION] Eliminar libro:", req.params.id);

  const { id } = req.params;

  try {
    // Verificar que el libro existe
    const { data: existe } = await supabaseAdmin
      .from("libros")
      .select("id, titulo, portada_url, archivo_pdf_ruta")
      .eq("id", id)
      .single();

    if (!existe) {
      return res.redirect("/gestion/libros?error=" + encodeURIComponent("Libro no encontrado"));
    }

    // Eliminar archivos del storage
    const archivosAEliminar = [];
    if (existe.portada_url) {
      archivosAEliminar.push(existe.portada_url.split("/").pop());
    }
    if (existe.archivo_pdf_ruta) {
      archivosAEliminar.push(existe.archivo_pdf_ruta);
    }

    if (archivosAEliminar.length > 0) {
      await supabaseAdmin.storage.from(BUCKET_NAME).remove(archivosAEliminar);
    }

    // Eliminar libro
    const { error } = await supabaseAdmin
      .from("libros")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("❌ [GESTION] Error al eliminar:", error.message);
      return res.redirect("/gestion/libros?error=" + encodeURIComponent(error.message));
    }

    console.log("✅ [GESTION] Libro eliminado:", existe.titulo);

    res.redirect("/gestion/libros?mensaje=" + encodeURIComponent("Libro eliminado exitosamente"));
  } catch (err) {
    console.log("❌ [GESTION] Error inesperado:", err.message);
    res.redirect("/gestion/libros?error=" + encodeURIComponent("Error al eliminar libro"));
  }
});

// ═════════════════════════════════════════════════════
// ── GESTIÓN DE EDITORIALES ──────────────────────────
// ═════════════════════════════════════════════════════

// ── Página de gestión de editoriales ─────────────────
router.get("/gestion/editoriales", async (req, res) => {
  console.log("🌐 [GESTION] Cargando gestión de editoriales");

  try {
    const { data: editoriales, error } = await supabaseAdmin
      .from("editoriales")
      .select("*")
      .order("nombre");

    if (error) {
      console.log("❌ [GESTION] Error al obtener editoriales:", error.message);
    }

    res.render("gestion-editoriales", { 
      editoriales: editoriales || [],
      mensaje: req.query.mensaje || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.log("❌ [GESTION] Error inesperado:", err.message);
    res.render("gestion-editoriales", { 
      editoriales: [], 
      mensaje: null, 
      error: "Error al cargar editoriales" 
    });
  }
});

// ── Registrar editorial desde el formulario ──────────
router.post("/gestion/editoriales/registro", async (req, res) => {
  console.log("📝 [GESTION] Registro de editorial desde formulario");

  const { nombre, correo_contacto } = req.body;

  try {
    if (!nombre) {
      return res.redirect("/gestion/editoriales?error=" + encodeURIComponent("El nombre es obligatorio"));
    }

    // Verificar que no exista
    const { data: existe } = await supabaseAdmin
      .from("editoriales")
      .select("id")
      .ilike("nombre", nombre)
      .single();

    if (existe) {
      return res.redirect("/gestion/editoriales?error=" + encodeURIComponent("Ya existe una editorial con ese nombre"));
    }

    const { error } = await supabaseAdmin
      .from("editoriales")
      .insert({
        nombre,
        correo_contacto: correo_contacto || ""
      });

    if (error) {
      console.log("❌ [GESTION] Error al crear editorial:", error.message);
      return res.redirect("/gestion/editoriales?error=" + encodeURIComponent(error.message));
    }

    console.log("✅ [GESTION] Editorial creada:", nombre);

    res.redirect("/gestion/editoriales?mensaje=" + encodeURIComponent("Editorial creada exitosamente"));
  } catch (err) {
    console.log("❌ [GESTION] Error inesperado:", err.message);
    res.redirect("/gestion/editoriales?error=" + encodeURIComponent("Error al crear editorial"));
  }
});

// ── Actualizar editorial desde el formulario ─────────
router.post("/gestion/editoriales/actualizar/:id", async (req, res) => {
  console.log("✏️ [GESTION] Actualizar editorial:", req.params.id);

  const { id } = req.params;
  const { nombre, correo_contacto } = req.body;

  try {
    // Verificar que existe
    const { data: existe } = await supabaseAdmin
      .from("editoriales")
      .select("id")
      .eq("id", id)
      .single();

    if (!existe) {
      return res.redirect("/gestion/editoriales?error=" + encodeURIComponent("Editorial no encontrada"));
    }

    // Verificar nombre duplicado
    if (nombre) {
      const { data: nombreExiste } = await supabaseAdmin
        .from("editoriales")
        .select("id")
        .ilike("nombre", nombre)
        .neq("id", id)
        .single();

      if (nombreExiste) {
        return res.redirect("/gestion/editoriales?error=" + encodeURIComponent("Ya existe otra editorial con ese nombre"));
      }
    }

    const { error } = await supabaseAdmin
      .from("editoriales")
      .update({
        nombre,
        correo_contacto: correo_contacto || ""
      })
      .eq("id", id);

    if (error) {
      console.log("❌ [GESTION] Error al actualizar:", error.message);
      return res.redirect("/gestion/editoriales?error=" + encodeURIComponent(error.message));
    }

    console.log("✅ [GESTION] Editorial actualizada:", id);

    res.redirect("/gestion/editoriales?mensaje=" + encodeURIComponent("Editorial actualizada exitosamente"));
  } catch (err) {
    console.log("❌ [GESTION] Error inesperado:", err.message);
    res.redirect("/gestion/editoriales?error=" + encodeURIComponent("Error al actualizar editorial"));
  }
});

// ── Eliminar editorial desde el formulario ───────────
router.post("/gestion/editoriales/eliminar/:id", async (req, res) => {
  console.log("🗑️ [GESTION] Eliminar editorial:", req.params.id);

  const { id } = req.params;

  try {
    // Verificar que existe
    const { data: existe } = await supabaseAdmin
      .from("editoriales")
      .select("id, nombre")
      .eq("id", id)
      .single();

    if (!existe) {
      return res.redirect("/gestion/editoriales?error=" + encodeURIComponent("Editorial no encontrada"));
    }

    // Verificar que no haya libros asociados
    const { data: librosAsociados } = await supabaseAdmin
      .from("libros")
      .select("id")
      .eq("editorial_id", id)
      .limit(1);

    if (librosAsociados && librosAsociados.length > 0) {
      return res.redirect("/gestion/editoriales?error=" + encodeURIComponent("No se puede eliminar: tiene libros asociados"));
    }

    // Eliminar editorial
    const { error } = await supabaseAdmin
      .from("editoriales")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("❌ [GESTION] Error al eliminar:", error.message);
      return res.redirect("/gestion/editoriales?error=" + encodeURIComponent(error.message));
    }

    console.log("✅ [GESTION] Editorial eliminada:", existe.nombre);

    res.redirect("/gestion/editoriales?mensaje=" + encodeURIComponent("Editorial eliminada exitosamente"));
  } catch (err) {
    console.log("❌ [GESTION] Error inesperado:", err.message);
    res.redirect("/gestion/editoriales?error=" + encodeURIComponent("Error al eliminar editorial"));
  }
});

module.exports = router;
