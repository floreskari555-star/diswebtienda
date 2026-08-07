-- ============================================
-- SCRIPT 029: Tablas separadas por libro
-- Libro 1: b1b2c3d4-0005-4000-8000-000000000005
-- Libro 2: b1b2c3d4-0003-4000-8000-000000000003
-- ============================================

-- ══════════════════════════════════════════
-- LIBRO 1: b1b2c3d4-0005-4000-8000-000000000005
-- ══════════════════════════════════════════

-- 1. TABLA: libros
SELECT
  id,
  editorial_id,
  titulo,
  autor,
  descripcion,
  precio,
  portada_url,
  archivo_pdf_ruta,
  sinopsis,
  anio,
  activo,
  TO_CHAR(creado_el, 'DD/MM/YYYY HH24:MI:SS') AS creado_el,
  TO_CHAR(actualizado_el, 'DD/MM/YYYY HH24:MI:SS') AS actualizado_el
FROM public.libros
WHERE id = 'b1b2c3d4-0005-4000-8000-000000000005';

-- 2. TABLA: editoriales (del libro)
SELECT
  e.id,
  e.nombre,
  e.correo_contacto,
  TO_CHAR(e.creado_el, 'DD/MM/YYYY HH24:MI:SS') AS creado_el
FROM public.editoriales e
WHERE e.id = (
  SELECT editorial_id FROM public.libros
  WHERE id = 'b1b2c3d4-0005-4000-8000-000000000005'
);

-- 3. TABLA: facturas_detalles (dónde aparece este libro)
SELECT
  fd.id,
  fd.factura_id,
  fd.numero_item,
  fd.codigo,
  fd.descripcion,
  fd.precio_unitario,
  fd.cantidad,
  fd.total_item,
  TO_CHAR(fd.creado_el, 'DD/MM/YYYY HH24:MI:SS') AS creado_el
FROM public.facturas_detalles fd
WHERE fd.codigo = 'b1b2c3d4-0005-4000-8000-000000000005';

-- 4. TABLA: facturas (comprobantes que incluyen este libro)
SELECT
  f.id,
  f.tipo_comprobante,
  f.numero_documento,
  f.cliente_nombre || ' ' || COALESCE(f.cliente_apellido_paterno, '') AS cliente,
  f.cliente_numero_doc,
  f.subtotal,
  f.igv,
  f.total,
  f.estado,
  LPAD(f.dia::TEXT, 2, '0') || '/' || LPAD(f.mes::TEXT, 2, '0') || '/' || f.anio AS fecha,
  TO_CHAR(f.creado_el, 'DD/MM/YYYY HH24:MI:SS') AS creado_el
FROM public.facturas f
WHERE f.id IN (
  SELECT fd.factura_id FROM public.facturas_detalles fd
  WHERE fd.codigo = 'b1b2c3d4-0005-4000-8000-000000000005'
);

-- ══════════════════════════════════════════
-- LIBRO 2: b1b2c3d4-0003-4000-8000-000000000003
-- ══════════════════════════════════════════

-- 5. TABLA: libros
SELECT
  id,
  editorial_id,
  titulo,
  autor,
  descripcion,
  precio,
  portada_url,
  archivo_pdf_ruta,
  sinopsis,
  anio,
  activo,
  TO_CHAR(creado_el, 'DD/MM/YYYY HH24:MI:SS') AS creado_el,
  TO_CHAR(actualizado_el, 'DD/MM/YYYY HH24:MI:SS') AS actualizado_el
FROM public.libros
WHERE id = 'b1b2c3d4-0003-4000-8000-000000000003';

-- 6. TABLA: editoriales (del libro)
SELECT
  e.id,
  e.nombre,
  e.correo_contacto,
  TO_CHAR(e.creado_el, 'DD/MM/YYYY HH24:MI:SS') AS creado_el
FROM public.editoriales e
WHERE e.id = (
  SELECT editorial_id FROM public.libros
  WHERE id = 'b1b2c3d4-0003-4000-8000-000000000003'
);

-- 7. TABLA: facturas_detalles (dónde aparece este libro)
SELECT
  fd.id,
  fd.factura_id,
  fd.numero_item,
  fd.codigo,
  fd.descripcion,
  fd.precio_unitario,
  fd.cantidad,
  fd.total_item,
  TO_CHAR(fd.creado_el, 'DD/MM/YYYY HH24:MI:SS') AS creado_el
FROM public.facturas_detalles fd
WHERE fd.codigo = 'b1b2c3d4-0003-4000-8000-000000000003';

-- 8. TABLA: facturas (comprobantes que incluyen este libro)
SELECT
  f.id,
  f.tipo_comprobante,
  f.numero_documento,
  f.cliente_nombre || ' ' || COALESCE(f.cliente_apellido_paterno, '') AS cliente,
  f.cliente_numero_doc,
  f.subtotal,
  f.igv,
  f.total,
  f.estado,
  LPAD(f.dia::TEXT, 2, '0') || '/' || LPAD(f.mes::TEXT, 2, '0') || '/' || f.anio AS fecha,
  TO_CHAR(f.creado_el, 'DD/MM/YYYY HH24:MI:SS') AS creado_el
FROM public.facturas f
WHERE f.id IN (
  SELECT fd.factura_id FROM public.facturas_detalles fd
  WHERE fd.codigo = 'b1b2c3d4-0003-4000-8000-000000000003'
);
