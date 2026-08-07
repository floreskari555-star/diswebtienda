-- ============================================
-- SCRIPT 028: Tablas separadas - pablo marmol
-- pmarmol@correo.com - Última boleta
-- ============================================

-- ============================================
-- 1. TABLA: perfiles
-- ============================================
SELECT
  id,
  nombre,
  apellido_paterno,
  apellido_materno,
  correo,
  tipo_documento,
  numero_documento,
  departamento,
  provincia,
  distrito,
  telefono,
  direccion,
  rol,
  editorial_id,
  TO_CHAR(creado_al, 'DD/MM/YYYY HH24:MI:SS') AS creado_al,
  TO_CHAR(actualizado_al, 'DD/MM/YYYY HH24:MI:SS') AS actualizado_al
FROM public.perfiles
WHERE correo = 'pmarmol@correo.com';

-- ============================================
-- 2. TABLA: facturas
-- ============================================
SELECT
  id,
  tipo_comprobante,
  numero_documento,
  cliente_id,
  cliente_nombre,
  cliente_apellido_paterno,
  cliente_apellido_materno,
  cliente_numero_doc,
  cliente_direccion,
  subtotal,
  igv,
  total,
  estado,
  dia,
  mes,
  anio,
  TO_CHAR(creado_el, 'DD/MM/YYYY HH24:MI:SS') AS creado_el
FROM public.facturas
WHERE cliente_id = (SELECT id FROM public.perfiles WHERE correo = 'pmarmol@correo.com')
  AND tipo_comprobante = 'BOLETA'
ORDER BY creado_el DESC
LIMIT 1;

-- ============================================
-- 3. TABLA: facturas_detalles
-- ============================================
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
WHERE fd.factura_id = (
  SELECT id FROM public.facturas
  WHERE cliente_id = (SELECT id FROM public.perfiles WHERE correo = 'pmarmol@correo.com')
    AND tipo_comprobante = 'BOLETA'
  ORDER BY creado_el DESC
  LIMIT 1
)
ORDER BY fd.numero_item;

-- ============================================
-- 4. TABLA: tablas_maestras (ultdoc BOLETA)
-- ============================================
SELECT
  id,
  tabla,
  clave,
  valor,
  orden,
  activo,
  TO_CHAR(creado_el, 'DD/MM/YYYY HH24:MI:SS') AS creado_el
FROM public.tablas_maestras
WHERE tabla = 'ultdoc' AND clave = 'BOLETA';

-- ============================================
-- 5. TABLA: tablas_maestras (TipoDocumento del usuario)
-- ============================================
SELECT
  tm.id,
  tm.tabla,
  tm.clave,
  tm.valor,
  tm.orden
FROM public.tablas_maestras tm
WHERE tm.tabla = 'TipoDocumento'
  AND tm.clave = (
    SELECT tipo_documento FROM public.perfiles
    WHERE correo = 'pmarmol@correo.com'
  );

-- ============================================
-- 6. TABLA: tablas_maestras (forpago - formas de pago)
-- ============================================
SELECT
  id,
  tabla,
  clave,
  valor,
  orden
FROM public.tablas_maestras
WHERE tabla = 'forpago'
ORDER BY orden;
