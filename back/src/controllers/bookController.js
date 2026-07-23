/* | Nombre: bookController.js | Finalidad: CRUD completo de libros (catálogo). */

const { supabaseAdmin, BUCKET_NAME } = require("../config/supabase");

// ── Listar todos los libros (público) ─────────────────
const listarLibros = async (req, res) => {
  console.log("📚 [LIBROS] Listar libros");

  try {
    const { editorial_id, search, activo } = req.query;

    let query = supabaseAdmin
      .from("libros")
      .select("*, editoriales(id, nombre)")
      .order("creado_el", { ascending: false });

    // Filtro por editorial
    if (editorial_id) {
      query = query.eq("editorial_id", editorial_id);
    }

    // Filtro por búsqueda (título o autor)
    if (search) {
      const termino = `%${search}%`;
      query = query.or(`titulo.ilike.${termino},autor.ilike.${termino}`);
    }

    // Filtro por estado (solo admin puede ver inactivos)
    if (activo !== undefined) {
      query = query.eq("activo", activo === "true");
    }

    const { data: libros, error } = await query;

    if (error) {
      console.log("❌ [LIBROS] Error al listar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [LIBROS] Total libros:", libros.length);

    res.json({
      total: libros.length,
      libros
    });
  } catch (err) {
    console.log("❌ [LIBROS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al listar libros" });
  }
};

// ── Obtener libro por ID (público) ───────────────────
const obtenerLibro = async (req, res) => {
  console.log("📖 [LIBROS] Obtener libro por ID:", req.params.id);

  const { id } = req.params;

  try {
    const { data: libro, error } = await supabaseAdmin
      .from("libros")
      .select("*, editoriales(id, nombre)")
      .eq("id", id)
      .single();

    if (error || !libro) {
      console.log("❌ [LIBROS] Libro no encontrado");
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    console.log("✅ [LIBROS] Libro encontrado:", libro.titulo);

    res.json({ libro });
  } catch (err) {
    console.log("❌ [LIBROS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al obtener libro" });
  }
};

// ── Crear libro (admin/super) ────────────────────────
const crearLibro = async (req, res) => {
  console.log("➕ [LIBROS] Crear nuevo libro");

  const { titulo, autor, descripcion, sinopsis, anio, editorial_id, precio, activo } = req.body;

  // Validaciones básicas
  if (!titulo || !autor || !editorial_id) {
    return res.status(400).json({ error: "Título, autor y editorial son obligatorios" });
  }

  if (precio === undefined || precio < 0) {
    return res.status(400).json({ error: "El precio es obligatorio y debe ser mayor o igual a 0" });
  }

  try {
    // Subir portada si se proporciona
    let portada_url = "";
    if (req.files && req.files.portada) {
      const archivo = req.files.portada;
      const nombreArchivo = `libro${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(nombreArchivo, archivo.data, {
          contentType: archivo.mimetype
        });

      if (uploadError) {
        console.log("❌ [LIBROS] Error al subir portada:", uploadError.message);
        return res.status(400).json({ error: "Error al subir la portada" });
      }

      // Obtener URL pública
      const { data: urlData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(nombreArchivo);

      portada_url = urlData.publicUrl;
    }

    // Subir PDF si se proporciona
    let archivo_pdf_ruta = "";
    if (req.files && req.files.archivo_pdf) {
      const archivo = req.files.archivo_pdf;
      const nombreArchivo = `libro${Date.now()}.pdf`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(nombreArchivo, archivo.data, {
          contentType: archivo.mimetype
        });

      if (uploadError) {
        console.log("❌ [LIBROS] Error al subir PDF:", uploadError.message);
        return res.status(400).json({ error: "Error al subir el archivo PDF" });
      }

      archivo_pdf_ruta = nombreArchivo;
    }

    const { data: libro, error } = await supabaseAdmin
      .from("libros")
      .insert({
        titulo,
        autor,
        descripcion: descripcion || "",
        sinopsis: sinopsis || "",
        anio: anio || null,
        editorial_id,
        precio,
        portada_url,
        archivo_pdf_ruta,
        activo: activo !== undefined ? activo : true
      })
      .select("*, editoriales(id, nombre)")
      .single();

    if (error) {
      console.log("❌ [LIBROS] Error al crear:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [LIBROS] Libro creado:", libro.titulo);

    res.status(201).json({
      mensaje: "Libro creado exitosamente",
      libro
    });
  } catch (err) {
    console.log("❌ [LIBROS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al crear libro" });
  }
};

// ── Actualizar libro (admin/super) ───────────────────
const actualizarLibro = async (req, res) => {
  console.log("✏️ [LIBROS] Actualizar libro:", req.params.id);

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
      console.log("❌ [LIBROS] Libro no encontrado");
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    // Construir objeto de actualización (solo campos enviados)
    const updates = {};
    if (titulo !== undefined) updates.titulo = titulo;
    if (autor !== undefined) updates.autor = autor;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (sinopsis !== undefined) updates.sinopsis = sinopsis;
    if (anio !== undefined) updates.anio = anio;
    if (editorial_id !== undefined) updates.editorial_id = editorial_id;
    if (precio !== undefined) updates.precio = precio;
    if (activo !== undefined) updates.activo = activo;

    // Actualizar portada si se proporciona
    if (req.files && req.files.portada) {
      const archivo = req.files.portada;
      const nombreArchivo = `libro${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(nombreArchivo, archivo.data, {
          contentType: archivo.mimetype
        });

      if (uploadError) {
        console.log("❌ [LIBROS] Error al subir portada:", uploadError.message);
        return res.status(400).json({ error: "Error al subir la portada" });
      }

      // Eliminar portada anterior si existe
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
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(nombreArchivo, archivo.data, {
          contentType: archivo.mimetype
        });

      if (uploadError) {
        console.log("❌ [LIBROS] Error al subir PDF:", uploadError.message);
        return res.status(400).json({ error: "Error al subir el archivo PDF" });
      }

      // Eliminar PDF anterior si existe
      if (existe.archivo_pdf_ruta) {
        await supabaseAdmin.storage.from(BUCKET_NAME).remove([existe.archivo_pdf_ruta]);
      }

      updates.archivo_pdf_ruta = nombreArchivo;
    }

    const { data: libro, error } = await supabaseAdmin
      .from("libros")
      .update(updates)
      .eq("id", id)
      .select("*, editoriales(id, nombre)")
      .single();

    if (error) {
      console.log("❌ [LIBROS] Error al actualizar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [LIBROS] Libro actualizado:", libro.titulo);

    res.json({
      mensaje: "Libro actualizado exitosamente",
      libro
    });
  } catch (err) {
    console.log("❌ [LIBROS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al actualizar libro" });
  }
};

// ── Eliminar libro (admin/super) ─────────────────────
const eliminarLibro = async (req, res) => {
  console.log("🗑️ [LIBROS] Eliminar libro:", req.params.id);

  const { id } = req.params;

  try {
    // Verificar que el libro existe
    const { data: existe } = await supabaseAdmin
      .from("libros")
      .select("id, titulo, portada_url, archivo_pdf_ruta")
      .eq("id", id)
      .single();

    if (!existe) {
      console.log("❌ [LIBROS] Libro no encontrado");
      return res.status(404).json({ error: "Libro no encontrado" });
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
      console.log("❌ [LIBROS] Error al eliminar:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [LIBROS] Libro eliminado:", existe.titulo);

    res.json({
      mensaje: "Libro eliminado exitosamente",
      libro: { id, titulo: existe.titulo }
    });
  } catch (err) {
    console.log("❌ [LIBROS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al eliminar libro" });
  }
};

// ── Obtener editoriales únicas ───────────────────────
const listarEditoriales = async (req, res) => {
  console.log("📚 [LIBROS] Listar editoriales");

  try {
    const { data, error } = await supabaseAdmin
      .from("editoriales")
      .select("*")
      .order("nombre");

    if (error) {
      console.log("❌ [LIBROS] Error al listar editoriales:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ [LIBROS] Editoriales encontradas:", data.length);

    res.json({ editoriales: data });
  } catch (err) {
    console.log("❌ [LIBROS] Error inesperado:", err.message);
    return res.status(500).json({ error: "Error al listar editoriales" });
  }
};

module.exports = {
  listarLibros,
  obtenerLibro,
  crearLibro,
  actualizarLibro,
  eliminarLibro,
  listarEditoriales
};
