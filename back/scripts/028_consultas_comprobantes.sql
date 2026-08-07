-- ============================================
-- SCRIPT 028: Consultas concatenadas de comprobantes
-- Ver datos de la PRIMERA boleta/factura registrada
-- ============================================

-- ============================================
-- 1. VISTA GENERAL DEL COMPROBANTE
-- ============================================
-- Muestra: tipo, número, fecha, datos del cliente, totales y estado
SELECT
  f.tipo_comprobante || ' N° ' || f.numero_documento AS "Comprobante",
  CASE
    WHEN f.tipo_comprobante = 'BOLETA' THEN 'Boleta de Venta'
    WHEN f.tipo_comprobante = 'FACTURA' THEN 'Factura Electrónica'
    ELSE f.tipo_comprobante
  END AS "Tipo Documento",
  LPAD(f.dia::TEXT, 2, '0') || '/' || LPAD(f.mes::TEXT, 2, '0') || '/' || f.anio AS "Fecha Emisión",
  f.cliente_nombre || ' ' || COALESCE(f.cliente_apellido_paterno, '') || ' ' || COALESCE(f.cliente_apellido_materno, '') AS "Cliente",
  f.cliente_numero_doc AS "N° Documento",
  f.cliente_direccion AS "Dirección",
  'S/ ' || ROUND(f.subtotal, 2)::TEXT AS "Subtotal",
  'S/ ' || ROUND(f.igv, 2)::TEXT AS "IGV (18%)",
  'S/ ' || ROUND(f.total, 2)::TEXT AS "TOTAL",
  f.estado AS "Estado",
  TO_CHAR(f.creado_el, 'DD/MM/YYYY HH24:MI:SS') AS "Registrado el"
FROM public.facturas f
ORDER BY f.creado_el ASC
LIMIT 1;

-- ============================================
-- 2. DETALLE DE ITEMS DE LA PRIMERA FACTURA
-- ============================================
-- Muestra: número de ítem, descripción, cantidad, precio unitario y total
SELECT
  fd.numero_item AS "Item",
  fd.descripcion AS "Descripción del Libro",
  fd.codigo AS "Cód. Libro",
  fd.cantidad AS "Cant.",
  'S/ ' || ROUND(fd.precio_unitario, 2)::TEXT AS "P. Unitario",
  'S/ ' || ROUND(fd.total_item, 2)::TEXT AS "Total Item"
FROM public.facturas_detalles fd
JOIN public.facturas f ON f.id = fd.factura_id
ORDER BY f.creado_el ASC, fd.numero_item ASC
LIMIT 10;

-- ============================================
-- 3. COMPROBANTE COMPLETO CONCATENADO (una sola fila)
-- ============================================
-- Todo en una sola fila legible
SELECT
  '═══════════════════════════════════════' AS "━━ CABECERA ━━",
  f.tipo_comprobante || ' N° ' || f.numero_documento AS "Comprobante",
  LPAD(f.dia::TEXT, 2, '0') || '/' || LPAD(f.mes::TEXT, 2, '0') || '/' || f.anio AS "Fecha",
  f.cliente_nombre || ' ' || COALESCE(f.cliente_apellido_paterno, '') || ' ' || COALESCE(f.cliente_apellido_materno, '') AS "Cliente",
  f.cliente_numero_doc AS "Doc",
  f.cliente_direccion AS "Dirección",
  'S/ ' || ROUND(f.subtotal, 2)::TEXT AS "Subtotal",
  'S/ ' || ROUND(f.igv, 2)::TEXT AS "IGV",
  'S/ ' || ROUND(f.total, 2)::TEXT AS "TOTAL",
  f.estado AS "Estado",
  '───────────────────────────────────────' AS "━━ DETALLE ━━",
  STRING_AGG(
    fd.numero_item || '. ' || fd.descripcion || ' x' || fd.cantidad || ' = S/ ' || ROUND(fd.total_item, 2)::TEXT,
    ' | '
    ORDER BY fd.numero_item
  ) AS "Items"
FROM public.facturas f
JOIN public.facturas_detalles fd ON fd.factura_id = f.id
GROUP BY f.id, f.tipo_comprobante, f.numero_documento,
         f.dia, f.mes, f.anio,
         f.cliente_nombre, f.cliente_apellido_paterno, f.cliente_apellido_materno,
         f.cliente_numero_doc, f.cliente_direccion,
         f.subtotal, f.igv, f.total, f.estado, f.creado_el
ORDER BY f.creado_el ASC
LIMIT 1;

-- ============================================
-- 4. PRIMERA BOLETA (solo boletas)
-- ============================================
SELECT
  f.numero_documento AS "Boleta N°",
  LPAD(f.dia::TEXT, 2, '0') || '/' || LPAD(f.mes::TEXT, 2, '0') || '/' || f.anio AS "Fecha",
  f.cliente_nombre || ' ' || COALESCE(f.cliente_apellido_paterno, '') || ' ' || COALESCE(f.cliente_apellido_materno, '') AS "Cliente",
  f.cliente_numero_doc AS "DNI",
  'S/ ' || ROUND(f.total, 2)::TEXT AS "Total",
  f.estado AS "Estado",
  STRING_AGG(
    fd.descripcion || ' (x' || fd.cantidad || ')',
    ', ' ORDER BY fd.numero_item
  ) AS "Libros Comprados"
FROM public.facturas f
JOIN public.facturas_detalles fd ON fd.factura_id = f.id
WHERE f.tipo_comprobante = 'BOLETA'
GROUP BY f.id
ORDER BY f.creado_el ASC
LIMIT 1;

-- ============================================
-- 5. PRIMERA FACTURA (solo facturas)
-- ============================================
SELECT
  f.numero_documento AS "Factura N°",
  LPAD(f.dia::TEXT, 2, '0') || '/' || LPAD(f.mes::TEXT, 2, '0') || '/' || f.anio AS "Fecha",
  f.cliente_nombre || ' ' || COALESCE(f.cliente_apellido_paterno, '') || ' ' || COALESCE(f.cliente_apellido_materno, '') AS "Razón Social",
  f.cliente_numero_doc AS "RUC",
  f.cliente_direccion AS "Dirección",
  'S/ ' || ROUND(f.subtotal, 2)::TEXT AS "Subtotal",
  'S/ ' || ROUND(f.igv, 2)::TEXT AS "IGV",
  'S/ ' || ROUND(f.total, 2)::TEXT AS "Total",
  f.estado AS "Estado",
  STRING_AGG(
    fd.descripcion || ' | S/ ' || ROUND(fd.total_item, 2)::TEXT,
    ' → ' ORDER BY fd.numero_item
  ) AS "Detalle"
FROM public.facturas f
JOIN public.facturas_detalles fd ON fd.factura_id = f.id
WHERE f.tipo_comprobante = 'FACTURA'
GROUP BY f.id
ORDER BY f.creado_el ASC
LIMIT 1;

-- ============================================
-- 6. HISTORIAL COMPLETO DE UN CLIENTE POR EMAIL
-- ============================================
-- Cambiar 'correo@ejemplo.com' por el email real
SELECT
  f.tipo_comprobante || ' N° ' || f.numero_documento AS "Comprobante",
  LPAD(f.dia::TEXT, 2, '0') || '/' || LPAD(f.mes::TEXT, 2, '0') || '/' || f.anio AS "Fecha",
  f.cliente_nombre || ' ' || COALESCE(f.cliente_apellido_paterno, '') AS "Cliente",
  'S/ ' || ROUND(f.total, 2)::TEXT AS "Total",
  f.estado AS "Estado",
  (SELECT COUNT(*) FROM public.facturas_detalles WHERE factura_id = f.id)::TEXT || ' ítems' AS "Items"
FROM public.facturas f
WHERE f.cliente_nombre ILIKE '%' || (SELECT nombre FROM public.perfiles WHERE correo = 'correo@ejemplo.com' LIMIT 1) || '%'
ORDER BY f.creado_el DESC;

-- ============================================
-- 7. RESUMEN: TOTAL BOLETAS Y FACTURAS
-- ============================================
SELECT
  tipo_comprobante AS "Tipo",
  COUNT(*)::TEXT AS "Cantidad",
  'S/ ' || ROUND(COALESCE(SUM(total), 0), 2)::TEXT AS "Monto Total",
  COUNT(CASE WHEN estado = 'Valido' THEN 1 END)::TEXT AS "Válidas",
  COUNT(CASE WHEN estado = 'Anulado' THEN 1 END)::TEXT AS "Anuladas"
FROM public.facturas
GROUP BY tipo_comprobante
ORDER BY tipo_comprobante;
