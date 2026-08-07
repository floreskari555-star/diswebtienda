-- ============================================
-- SCRIPT 028: Datos completos de pablo marmol
-- Todas las tablas de su comprobante más reciente
-- ============================================

-- ============================================
-- 1. TODAS LAS TABLAS EN UNA SOLA CONSULTA
-- ============================================
-- Tomar el ID de la factura más reciente de pmarmol
-- y mostrar todo concatenado

WITH cliente_info AS (
  SELECT id, nombre, apellido_paterno, apellido_materno,
         correo, tipo_documento, numero_documento,
         departamento, provincia, distrito, telefono, direccion
  FROM public.perfiles
  WHERE correo = 'pmarmol@correo.com'
),
ultima_factura AS (
  SELECT f.*
  FROM public.facturas f
  JOIN cliente_info c ON c.id = f.cliente_id
  WHERE f.tipo_comprobante = 'BOLETA'
  ORDER BY f.creado_el DESC
  LIMIT 1
)
SELECT
  -- ═══ TABLA: perfiles ═══
  '═══ TABLA: perfiles ═══' AS "── perfiles ──",
  c.nombre AS "nombre",
  c.apellido_paterno AS "apellido_paterno",
  c.apellido_materno AS "apellido_materno",
  c.correo AS "correo",
  c.tipo_documento AS "tipo_documento",
  c.numero_documento AS "numero_documento",
  c.departamento AS "departamento",
  c.provincia AS "provincia",
  c.distrito AS "distrito",
  c.telefono AS "telefono",
  c.direccion AS "direccion",

  -- ═══ TABLA: facturas ═══
  '═══ TABLA: facturas ═══' AS "── facturas ──",
  f.tipo_comprobante AS "tipo_comprobante",
  f.numero_documento AS "numero_documento_comprobante",
  LPAD(f.dia::TEXT, 2, '0') || '/' || LPAD(f.mes::TEXT, 2, '0') || '/' || f.anio AS "fecha_emision",
  f.cliente_nombre || ' ' || COALESCE(f.cliente_apellido_paterno, '') || ' ' || COALESCE(f.cliente_apellido_materno, '') AS "cliente_concat",
  f.cliente_numero_doc AS "cliente_doc",
  f.cliente_direccion AS "cliente_direccion",
  'S/ ' || ROUND(f.subtotal, 2)::TEXT AS "subtotal",
  'S/ ' || ROUND(f.igv, 2)::TEXT AS "igv",
  'S/ ' || ROUND(f.total, 2)::TEXT AS "total",
  f.estado AS "estado",
  TO_CHAR(f.creado_el, 'DD/MM/YYYY HH24:MI:SS') AS "creado_el"

FROM cliente_info c
CROSS JOIN ultima_factura f;

-- ============================================
-- 2. DETALLE DE ITEMS (facturas_detalles)
-- ============================================
WITH cliente_info AS (
  SELECT id FROM public.perfiles WHERE correo = 'pmarmol@correo.com'
),
ultima_factura AS (
  SELECT f.id
  FROM public.facturas f
  JOIN cliente_info c ON c.id = f.cliente_id
  WHERE f.tipo_comprobante = 'BOLETA'
  ORDER BY f.creado_el DESC
  LIMIT 1
)
SELECT
  fd.numero_item AS "item",
  fd.codigo AS "codigo_libro",
  fd.descripcion AS "descripcion",
  fd.cantidad AS "cantidad",
  'S/ ' || ROUND(fd.precio_unitario, 2)::TEXT AS "precio_unitario",
  'S/ ' || ROUND(fd.total_item, 2)::TEXT AS "total_item"
FROM public.facturas_detalles fd
JOIN ultima_factura uf ON uf.id = fd.factura_id
ORDER BY fd.numero_item;

-- ============================================
-- 3. TODO CONCATENADO EN UNA SOLA FILA
-- ============================================
WITH cliente_info AS (
  SELECT * FROM public.perfiles WHERE correo = 'pmarmol@correo.com'
),
ultima_factura AS (
  SELECT f.*
  FROM public.facturas f
  JOIN cliente_info c ON c.id = f.cliente_id
  WHERE f.tipo_comprobante = 'BOLETA'
  ORDER BY f.creado_el DESC
  LIMIT 1
)
SELECT
  -- Perfil
  'PERFIL: ' || c.nombre || ' ' || c.apellido_paterno || ' ' || COALESCE(c.apellido_materno, '') ||
  ' | Email: ' || c.correo ||
  ' | ' || c.tipo_documento || ': ' || c.numero_documento ||
  ' | Tel: ' || COALESCE(c.telefono, '-') ||
  ' | Dir: ' || COALESCE(c.direccion, '-') ||
  ' | ' || COALESCE(c.departamento, '') || ' / ' || COALESCE(c.provincia, '') || ' / ' || COALESCE(c.distrito, '')
  AS "DATOS CLIENTE",

  -- Comprobante
  'COMPROBANTE: ' || f.tipo_comprobante || ' N° ' || f.numero_documento ||
  ' | Fecha: ' || LPAD(f.dia::TEXT, 2, '0') || '/' || LPAD(f.mes::TEXT, 2, '0') || '/' || f.anio ||
  ' | Subtotal: S/ ' || ROUND(f.subtotal, 2)::TEXT ||
  ' | IGV: S/ ' || ROUND(f.igv, 2)::TEXT ||
  ' | TOTAL: S/ ' || ROUND(f.total, 2)::TEXT ||
  ' | Estado: ' || f.estado
  AS "DATOS FACTURA",

  -- Items
  (SELECT STRING_AGG(
    fd.numero_item || '. ' || fd.descripcion || ' x' || fd.cantidad || ' = S/ ' || ROUND(fd.total_item, 2)::TEXT,
    ' | ' ORDER BY fd.numero_item
  )
  FROM public.facturas_detalles fd
  WHERE fd.factura_id = f.id
  ) AS "ITEMS"

FROM cliente_info c
CROSS JOIN ultima_factura f;

-- ============================================
-- 4. BOLETA FORMATEADA (vista tipo ticket)
-- ============================================
WITH cliente_info AS (
  SELECT * FROM public.perfiles WHERE correo = 'pmarmol@correo.com'
),
ultima_factura AS (
  SELECT f.*
  FROM public.facturas f
  JOIN cliente_info c ON c.id = f.cliente_id
  WHERE f.tipo_comprobante = 'BOLETA'
  ORDER BY f.creado_el DESC
  LIMIT 1
)
SELECT
  '═══════════════════════════════════' AS "",
  '     LIBROSLIBRES LIBRERIA' AS "",
  '     RUC: 20512345678' AS "",
  '     Av. Principal 123, Lima' AS "",
  '───────────────────────────────────' AS "",
  'BOLETA N° ' || f.numero_documento AS "",
  'Fecha: ' || LPAD(f.dia::TEXT, 2, '0') || '/' || LPAD(f.mes::TEXT, 2, '0') || '/' || f.anio AS "",
  '───────────────────────────────────' AS "",
  'Cliente: ' || f.cliente_nombre || ' ' || COALESCE(f.cliente_apellido_paterno, '') || ' ' || COALESCE(f.cliente_apellido_materno, '') AS "",
  'DNI: ' || COALESCE(f.cliente_numero_doc, '---') AS "",
  'Dirección: ' || COALESCE(f.cliente_direccion, '---') AS "",
  '───────────────────────────────────' AS "",
  'DETALLE:' AS "",

  (SELECT STRING_AGG(
    fd.numero_item || '. ' || fd.descripcion || '  S/ ' || ROUND(fd.total_item, 2)::TEXT,
    E'\n' ORDER BY fd.numero_item
  )
  FROM public.facturas_detalles fd
  WHERE fd.factura_id = f.id
  ) AS "",

  '───────────────────────────────────' AS "",
  'Subtotal:  S/ ' || ROUND(f.subtotal, 2)::TEXT AS "",
  'IGV (18%): S/ ' || ROUND(f.igv, 2)::TEXT AS "",
  'TOTAL:     S/ ' || ROUND(f.total, 2)::TEXT AS "",
  '═══════════════════════════════════' AS ""

FROM cliente_info c
CROSS JOIN ultima_factura f;
