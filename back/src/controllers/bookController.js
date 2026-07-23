/* | Nombre: bookController.js | Finalidad: CRUD completo de libros (catálogo). */

const { supabaseAdmin } = require("../config/supabase");

// ── Listar todos los libros (público) ─────────────────
const listarLibros = async (req, res) => {
  console.log("📚 [LIBROS] Listar libros");

  try {
    const { editorial, search, activo } = req.query;

    let query = supabaseAdmin
      .from("libros")
      .select("*")
      .order("creado_al", { ascending: false });

    // Filtro por editorial
    if (editorial) {
      query = query.eq("editorial", editorial);
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
      .select("*")
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

  const { titulo, autor, sinopsis, anio, editorial, precio, portada, archivo_pdf, activo } = req.body;

  // Validaciones básicas
  if (!titulo || !autor) {
    return res.status(400).json({ error: "Título y autor son obligatorios" });
  }

  if (precio === undefined || precio < 0) {
    return res.status(400).json({ error: "El precio es obligatorio y debe ser mayor o igual a 0" });
  }

  try {
    const { data: libro, error } = await supabaseAdmin
      .from("libros")
      .insert({
        titulo,
        autor,
        sinopsis: sinopsis || "",
        anio: anio || null,
        editorial: editorial || "",
        precio,
        portada: portada || "",
        archivo_pdf: archivo_pdf || "",
        activo: activo !== undefined ? activo : true
      })
      .select()
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
  const { titulo, autor, sinopsis, anio, editorial, precio, portada, archivo_pdf, activo } = req.body;

  try {
    // Verificar que el libro existe
    const { data: existe } = await supabaseAdmin
      .from("libros")
      .select("id")
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
    if (sinopsis !== undefined) updates.sinopsis = sinopsis;
    if (anio !== undefined) updates.anio = anio;
    if (editorial !== undefined) updates.editorial = editorial;
    if (precio !== undefined) updates.precio = precio;
    if (portada !== undefined) updates.portada = portada;
    if (archivo_pdf !== undefined) updates.archivo_pdf = archivo_pdf;
    if (activo !== undefined) updates.activo = activo;

    const { data: libro, error } = await supabaseAdmin
      .from("libros")
      .update(updates)
      .eq("id", id)
      .select()
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
      .select("id, titulo")
      .eq("id", id)
      .single();

    if (!existe) {
      console.log("❌ [LIBROS] Libro no encontrado");
      return res.status(404).json({ error: "Libro no encontrado" });
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
      .from("libros")
      .select("editorial")
      .not("editorial", "eq", "")
      .order("editorial");

    if (error) {
      console.log("❌ [LIBROS] Error al listar editoriales:", error.message);
      return res.status(400).json({ error: error.message });
    }

    // Obtener valores únicos
    const editoriales = [...new Set(data.map(l => l.editorial))];

    console.log("✅ [LIBROS] Editoriales encontradas:", editoriales.length);

    res.json({ editoriales });
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
