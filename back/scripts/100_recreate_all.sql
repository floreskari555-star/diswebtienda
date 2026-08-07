-- ============================================
-- SCRIPT COMPLETO: RECREAR TODAS LAS TABLAS
-- Ejecutar UNA SOLA VEZ en Supabase SQL Editor
-- Limpia todo y recrea desde cero
-- ============================================

-- Limpiar en orden inverso de dependencias
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS update_libros_timestamp();
DROP FUNCTION IF EXISTS update_solicitudes_timestamp();
DROP FUNCTION IF EXISTS update_pagos_timestamp();

DROP TABLE IF EXISTS public.orden_detalles CASCADE;
DROP TABLE IF EXISTS public.ordenes CASCADE;
DROP TABLE IF EXISTS public.facturas_detalles CASCADE;
DROP TABLE IF EXISTS public.facturas CASCADE;
DROP TABLE IF EXISTS public.pagos_editoriales CASCADE;
DROP TABLE IF EXISTS public.solicitudes_derechos CASCADE;
DROP TABLE IF EXISTS public.libros CASCADE;
DROP TABLE IF EXISTS public.tablas_maestras CASCADE;
DROP TABLE IF EXISTS public.perfiles CASCADE;
DROP TABLE IF EXISTS public.editoriales CASCADE;

-- ============================================
-- 1. EDITORIALES
-- ============================================
CREATE TABLE public.editoriales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  correo_contacto TEXT DEFAULT '',
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.editoriales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_editoriales"
  ON public.editoriales FOR SELECT USING (true);

CREATE POLICY "admin_manage_editoriales"
  ON public.editoriales FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin')
    )
  );

CREATE INDEX idx_editoriales_nombre ON public.editoriales(nombre);

-- ============================================
-- 2. PERFILES
-- ============================================
CREATE TABLE public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  apellido_paterno TEXT NOT NULL DEFAULT '',
  apellido_materno TEXT NOT NULL DEFAULT '',
  tipo_documento TEXT DEFAULT '',
  numero_documento TEXT DEFAULT '',
  departamento TEXT DEFAULT '',
  provincia TEXT DEFAULT '',
  distrito TEXT DEFAULT '',
  ubigeo TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  direccion TEXT DEFAULT '',
  correo TEXT NOT NULL DEFAULT '',
  rol TEXT NOT NULL DEFAULT 'cliente',
  editorial_id UUID REFERENCES public.editoriales(id) ON DELETE SET NULL,
  creado_al TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_al TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT perfiles_rol_check
    CHECK (rol IN ('super', 'admin', 'cliente', 'proveedor', 'reporte'))
);

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all"
  ON public.perfiles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "users_select_own"
  ON public.perfiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.perfiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_select_all_perfiles"
  ON public.perfiles FOR SELECT
  USING (public.get_user_role() IN ('super', 'admin'));

CREATE POLICY "admin_update_all_perfiles"
  ON public.perfiles FOR UPDATE
  USING (public.get_user_role() IN ('super', 'admin'));

CREATE INDEX idx_perfiles_editorial ON public.perfiles(editorial_id);
CREATE INDEX idx_perfiles_documento ON public.perfiles(numero_documento);
CREATE INDEX idx_perfiles_ubigeo ON public.perfiles(ubigeo);

-- Función: verificar rol sin recursión RLS
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT rol FROM public.perfiles WHERE id = auth.uid();
$$;

-- Función: crear perfil al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.perfiles (
    id, nombre, apellido_paterno, apellido_materno,
    tipo_documento, numero_documento,
    departamento, provincia, distrito, ubigeo,
    telefono, direccion, correo, rol
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido_paterno', NEW.raw_user_meta_data->>'apellido', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido_materno', ''),
    COALESCE(NEW.raw_user_meta_data->>'tipo_documento', ''),
    COALESCE(NEW.raw_user_meta_data->>'numero_documento', ''),
    COALESCE(NEW.raw_user_meta_data->>'departamento', ''),
    COALESCE(NEW.raw_user_meta_data->>'provincia', ''),
    COALESCE(NEW.raw_user_meta_data->>'distrito', ''),
    COALESCE(NEW.raw_user_meta_data->>'ubigeo', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefono', ''),
    COALESCE(NEW.raw_user_meta_data->>'direccion', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill: usuarios existentes sin perfil
INSERT INTO public.perfiles (id, nombre, apellido_paterno, apellido_materno, correo, rol)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'nombre', ''),
  COALESCE(au.raw_user_meta_data->>'apellido_paterno', au.raw_user_meta_data->>'apellido', ''),
  COALESCE(au.raw_user_meta_data->>'apellido_materno', ''),
  COALESCE(au.email, ''),
  COALESCE(au.raw_user_meta_data->>'rol', 'cliente')
FROM auth.users au
LEFT JOIN public.perfiles p ON p.id = au.id
WHERE p.id IS NULL;

-- ============================================
-- 3. TABLAS MAESTRAS
-- ============================================
CREATE TABLE public.tablas_maestras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla TEXT NOT NULL,
  clave TEXT NOT NULL,
  valor TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tablas_maestras_tabla_clave_unique UNIQUE (tabla, clave)
);

ALTER TABLE public.tablas_maestras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_tablas_maestras"
  ON public.tablas_maestras FOR SELECT USING (true);

CREATE POLICY "admin_manage_tablas_maestras"
  ON public.tablas_maestras FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin')
    )
  );

CREATE INDEX idx_tablas_maestras_tabla ON public.tablas_maestras(tabla);

-- Seeds: Tipos de documento
INSERT INTO public.tablas_maestras (tabla, clave, valor, orden) VALUES
  ('TipoDocumento', 'DNI', 'DNI - Documento Nacional de Identidad', 1),
  ('TipoDocumento', 'RUC', 'RUC - Registro Único de Contribuyente', 2),
  ('TipoDocumento', 'CE', 'CE - Carné de Extranjería', 3),
  ('TipoDocumento', 'PASSPORT', 'Pasaporte', 4),
  ('TipoDocumento', 'PTP', 'PTP - Permiso Temporal de Permanencia', 5),
  ('TipoDocumento', 'CarnetRefug', 'Carné de Refugiado', 6)
ON CONFLICT (tabla, clave) DO UPDATE SET valor = EXCLUDED.valor, orden = EXCLUDED.orden;

-- Seeds: Formas de pago
INSERT INTO public.tablas_maestras (tabla, clave, valor, orden) VALUES
  ('forpago', 'YAPE', 'Yape', 1),
  ('forpago', 'PLIN', 'Plin', 2),
  ('forpago', 'VISA', 'Visa', 3),
  ('forpago', 'MASTERCARD', 'Mastercard', 4),
  ('forpago', 'AMEX', 'American Express', 5),
  ('forpago', 'PAYPAL', 'PayPal', 6),
  ('forpago', 'BCP', 'Transferencia BCP', 7),
  ('forpago', 'INTERBANK', 'Transferencia Interbank', 8),
  ('forpago', 'EFECTIVO', 'Efectivo en tienda', 9)
ON CONFLICT (tabla, clave) DO UPDATE SET valor = EXCLUDED.valor, orden = EXCLUDED.orden;

-- Seeds: Tipo de comprobante
INSERT INTO public.tablas_maestras (tabla, clave, valor, orden) VALUES
  ('tipoComprobante', 'BOLETA', 'Boleta de Venta', 1),
  ('tipoComprobante', 'FACTURA', 'Factura', 2)
ON CONFLICT (tabla, clave) DO UPDATE SET valor = EXCLUDED.valor, orden = EXCLUDED.orden;

-- Seeds: Correlativo (ultdoc)
INSERT INTO public.tablas_maestras (tabla, clave, valor, orden) VALUES
  ('ultdoc', 'FACTURA', '0000000', 1),
  ('ultdoc', 'BOLETA', '0000000', 2)
ON CONFLICT (tabla, clave) DO NOTHING;

-- ============================================
-- 4. LIBROS
-- ============================================
CREATE TABLE public.libros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  editorial_id UUID REFERENCES public.editoriales(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  portada_url TEXT DEFAULT '',
  archivo_pdf_ruta TEXT DEFAULT '',
  sinopsis TEXT DEFAULT '',
  anio INTEGER,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_el TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.libros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_libros"
  ON public.libros FOR SELECT USING (true);

CREATE POLICY "admin_manage_libros"
  ON public.libros FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin')
    )
  );

CREATE INDEX idx_libros_editorial ON public.libros(editorial_id);
CREATE INDEX idx_libros_activo ON public.libros(activo);
CREATE INDEX idx_libros_titulo ON public.libros(titulo);

CREATE OR REPLACE FUNCTION update_libros_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_el = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_libros_updated
  BEFORE UPDATE ON public.libros
  FOR EACH ROW
  EXECUTE FUNCTION update_libros_timestamp();

-- ============================================
-- 5. SOLICITUDES DERECHOS
-- ============================================
CREATE TABLE public.solicitudes_derechos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  editorial_id UUID NOT NULL REFERENCES public.editoriales(id) ON DELETE RESTRICT,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  sinopsis TEXT DEFAULT '',
  anio INTEGER,
  precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  monto_derechos NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  observaciones TEXT DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente',
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT solicitudes_derechos_estado_check
    CHECK (estado IN ('pendiente', 'en_revision', 'aprobada', 'rechazada', 'archivada'))
);

ALTER TABLE public.solicitudes_derechos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_solicitudes"
  ON public.solicitudes_derechos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid()
      AND (rol = 'super' OR rol = 'admin' OR id = usuario_id)
    )
  );

CREATE POLICY "insert_solicitudes"
  ON public.solicitudes_derechos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin', 'proveedor')
    )
  );

CREATE POLICY "update_solicitudes"
  ON public.solicitudes_derechos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin')
    )
  );

CREATE INDEX idx_solicitudes_usuario ON public.solicitudes_derechos(usuario_id);
CREATE INDEX idx_solicitudes_editorial ON public.solicitudes_derechos(editorial_id);
CREATE INDEX idx_solicitudes_estado ON public.solicitudes_derechos(estado);

CREATE OR REPLACE FUNCTION update_solicitudes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_el = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_solicitudes_updated
  BEFORE UPDATE ON public.solicitudes_derechos
  FOR EACH ROW
  EXECUTE FUNCTION update_solicitudes_timestamp();

-- ============================================
-- 6. PAGOS EDITORIALES
-- ============================================
CREATE TABLE public.pagos_editoriales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id UUID NOT NULL REFERENCES public.solicitudes_derechos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  editorial_id UUID NOT NULL REFERENCES public.editoriales(id) ON DELETE RESTRICT,
  monto NUMERIC(10, 2) NOT NULL,
  comprobante_url TEXT DEFAULT '',
  numero_operacion TEXT DEFAULT '',
  fecha_pago DATE,
  observaciones TEXT DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente',
  admin_revision_id UUID REFERENCES public.perfiles(id),
  fecha_revision TIMESTAMPTZ,
  motivo_rechazo TEXT DEFAULT '',
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pagos_editoriales_estado_check
    CHECK (estado IN ('pendiente', 'aprobado', 'rechazado'))
);

ALTER TABLE public.pagos_editoriales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_pagos"
  ON public.pagos_editoriales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid()
      AND (rol = 'super' OR rol = 'admin' OR id = usuario_id)
    )
  );

CREATE POLICY "insert_pagos"
  ON public.pagos_editoriales FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin', 'proveedor')
    )
  );

CREATE POLICY "update_pagos"
  ON public.pagos_editoriales FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin')
    )
  );

CREATE INDEX idx_pagos_solicitud ON public.pagos_editoriales(solicitud_id);
CREATE INDEX idx_pagos_usuario ON public.pagos_editoriales(usuario_id);
CREATE INDEX idx_pagos_editorial ON public.pagos_editoriales(editorial_id);
CREATE INDEX idx_pagos_estado ON public.pagos_editoriales(estado);

CREATE OR REPLACE FUNCTION update_pagos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_el = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pagos_updated
  BEFORE UPDATE ON public.pagos_editoriales
  FOR EACH ROW
  EXECUTE FUNCTION update_pagos_timestamp();

-- ============================================
-- 7. ORDENES
-- ============================================
CREATE TABLE public.ordenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  monto_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  metodo_pago TEXT DEFAULT '',
  comprobante_pago_url TEXT DEFAULT '',
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ordenes_estado_check
    CHECK (estado IN ('pendiente', 'pagada', 'completada', 'cancelada'))
);

ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_ordenes"
  ON public.ordenes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid()
      AND (rol = 'super' OR rol = 'admin' OR id = cliente_id)
    )
  );

CREATE POLICY "insert_ordenes"
  ON public.ordenes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin', 'cliente')
    )
  );

CREATE POLICY "update_ordenes"
  ON public.ordenes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin')
    )
  );

CREATE INDEX idx_ordenes_cliente ON public.ordenes(cliente_id);
CREATE INDEX idx_ordenes_estado ON public.ordenes(estado);

-- ============================================
-- 8. ORDEN DETALLES
-- ============================================
CREATE TABLE public.orden_detalles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID NOT NULL REFERENCES public.ordenes(id) ON DELETE CASCADE,
  libro_id UUID NOT NULL REFERENCES public.libros(id) ON DELETE RESTRICT,
  precio_al_comprar NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

ALTER TABLE public.orden_detalles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_detalles"
  ON public.orden_detalles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ordenes o
      JOIN public.perfiles p ON p.id = auth.uid()
      WHERE o.id = orden_id
      AND (p.rol = 'super' OR p.rol = 'admin' OR o.cliente_id = auth.uid())
    )
  );

CREATE POLICY "insert_detalles"
  ON public.orden_detalles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin', 'cliente')
    )
  );

CREATE INDEX idx_detalles_orden ON public.orden_detalles(orden_id);
CREATE INDEX idx_detalles_libro ON public.orden_detalles(libro_id);

-- ============================================
-- 9. FACTURAS (comprobantes de venta)
-- ============================================
CREATE TABLE public.facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_comprobante TEXT NOT NULL DEFAULT 'BOLETA',
  numero_documento TEXT NOT NULL DEFAULT '',
  cliente_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cliente_nombre TEXT NOT NULL DEFAULT '',
  cliente_apellido_paterno TEXT NOT NULL DEFAULT '',
  cliente_apellido_materno TEXT DEFAULT '',
  cliente_numero_doc TEXT DEFAULT '',
  cliente_direccion TEXT DEFAULT '',
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  igv NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  estado TEXT NOT NULL DEFAULT 'Valido',
  dia INTEGER,
  mes INTEGER,
  anio INTEGER,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT facturas_estado_check CHECK (estado IN ('Valido', 'Anulado'))
);

ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_facturas_admin"
  ON public.facturas FOR SELECT
  USING (
    auth.uid() = cliente_id
    OR EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol IN ('admin', 'super'))
  );

CREATE POLICY "insert_facturas"
  ON public.facturas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "update_facturas"
  ON public.facturas FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol IN ('admin', 'super'))
  );

CREATE INDEX idx_facturas_tipo ON public.facturas(tipo_comprobante);
CREATE INDEX idx_facturas_numero ON public.facturas(numero_documento);
CREATE INDEX idx_facturas_cliente ON public.facturas(cliente_id);

-- ============================================
-- 10. FACTURAS DETALLES
-- ============================================
CREATE TABLE public.facturas_detalles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id UUID NOT NULL REFERENCES public.facturas(id) ON DELETE CASCADE,
  numero_item INTEGER NOT NULL DEFAULT 1,
  codigo TEXT DEFAULT '',
  descripcion TEXT DEFAULT '',
  precio_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  cantidad INTEGER NOT NULL DEFAULT 1,
  total_item NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.facturas_detalles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_detalles_factura"
  ON public.facturas_detalles FOR SELECT
  USING (true);

CREATE POLICY "insert_detalles_factura"
  ON public.facturas_detalles FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_fdetalles_factura ON public.facturas_detalles(factura_id);

-- ============================================
-- FIN - Todas las tablas creadas
-- ============================================
