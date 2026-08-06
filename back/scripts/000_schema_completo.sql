-- ============================================
-- SCRIPT 000: SCHEMA COMPLETO - Todas las tablas
-- Ejecutar UNA SOLA VEZ en Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. EDITORIALES (sin dependencias)
-- ============================================
CREATE TABLE IF NOT EXISTS public.editoriales (
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

CREATE INDEX IF NOT EXISTS idx_editoriales_nombre ON public.editoriales(nombre);

-- ============================================
-- 2. PERFILES (depende de auth.users y editoriales)
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  apellido TEXT NOT NULL DEFAULT '',
  telefono TEXT DEFAULT '',
  direccion TEXT DEFAULT '',
  correo TEXT NOT NULL DEFAULT '',
  rol TEXT NOT NULL DEFAULT 'cliente',
  editorial_id UUID REFERENCES public.editoriales(id) ON DELETE SET NULL,
  creado_al TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_al TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all"
  ON public.perfiles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "users_select_own"
  ON public.perfiles FOR SELECT
  USING (auth.uid() = id);

ALTER TABLE public.perfiles
  DROP CONSTRAINT IF EXISTS perfiles_rol_check;
ALTER TABLE public.perfiles
  ADD CONSTRAINT perfiles_rol_check
  CHECK (rol IN ('super', 'admin', 'cliente', 'proveedor', 'reporte'));

CREATE INDEX IF NOT EXISTS idx_perfiles_editorial ON public.perfiles(editorial_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, apellido, telefono, direccion, correo, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
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
INSERT INTO public.perfiles (id, nombre, apellido, telefono, direccion, correo, rol)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'nombre', ''),
  COALESCE(au.raw_user_meta_data->>'apellido', ''),
  COALESCE(au.raw_user_meta_data->>'telefono', ''),
  COALESCE(au.raw_user_meta_data->>'direccion', ''),
  COALESCE(au.email, ''),
  COALESCE(au.raw_user_meta_data->>'rol', 'cliente')
FROM auth.users au
LEFT JOIN public.perfiles p ON p.id = au.id
WHERE p.id IS NULL;

-- ============================================
-- 3. LIBROS (depende de editoriales)
-- ============================================
CREATE TABLE IF NOT EXISTS public.libros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  editorial_id UUID REFERENCES public.editoriales(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  portada_url TEXT DEFAULT '',
  archivo_pdf_ruta TEXT DEFAULT '',
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sinopsis TEXT DEFAULT '',
  anio INTEGER,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
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

CREATE INDEX IF NOT EXISTS idx_libros_editorial ON public.libros(editorial_id);
CREATE INDEX IF NOT EXISTS idx_libros_activo ON public.libros(activo);
CREATE INDEX IF NOT EXISTS idx_libros_titulo ON public.libros(titulo);

CREATE OR REPLACE FUNCTION update_libros_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_el = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_libros_updated ON public.libros;
CREATE TRIGGER trigger_libros_updated
  BEFORE UPDATE ON public.libros
  FOR EACH ROW
  EXECUTE FUNCTION update_libros_timestamp();

-- ============================================
-- 4. SOLICITUDES DERECHOS (depende de perfiles y editoriales)
-- ============================================
CREATE TABLE IF NOT EXISTS public.solicitudes_derechos (
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

CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario ON public.solicitudes_derechos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_editorial ON public.solicitudes_derechos(editorial_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.solicitudes_derechos(estado);

CREATE OR REPLACE FUNCTION update_solicitudes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_el = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_solicitudes_updated ON public.solicitudes_derechos;
CREATE TRIGGER trigger_solicitudes_updated
  BEFORE UPDATE ON public.solicitudes_derechos
  FOR EACH ROW
  EXECUTE FUNCTION update_solicitudes_timestamp();

-- ============================================
-- 5. PAGOS EDITORIALES (depende de solicitudes, perfiles y editoriales)
-- ============================================
CREATE TABLE IF NOT EXISTS public.pagos_editoriales (
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

CREATE INDEX IF NOT EXISTS idx_pagos_solicitud ON public.pagos_editoriales(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_pagos_usuario ON public.pagos_editoriales(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_editorial ON public.pagos_editoriales(editorial_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON public.pagos_editoriales(estado);

CREATE OR REPLACE FUNCTION update_pagos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_el = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pagos_updated ON public.pagos_editoriales;
CREATE TRIGGER trigger_pagos_updated
  BEFORE UPDATE ON public.pagos_editoriales
  FOR EACH ROW
  EXECUTE FUNCTION update_pagos_timestamp();

-- ============================================
-- 6. ORDENES (depende de perfiles)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ordenes (
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

CREATE INDEX IF NOT EXISTS idx_ordenes_cliente ON public.ordenes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON public.ordenes(estado);

-- ============================================
-- 7. ORDEN_DETALLES (depende de ordenes y libros)
-- ============================================
CREATE TABLE IF NOT EXISTS public.orden_detalles (
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

CREATE INDEX IF NOT EXISTS idx_detalles_orden ON public.orden_detalles(orden_id);
CREATE INDEX IF NOT EXISTS idx_detalles_libro ON public.orden_detalles(libro_id);

-- ============================================
-- 8. FACTURAS (depende de ordenes y perfiles)
-- ============================================
CREATE TABLE IF NOT EXISTS public.facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID NOT NULL REFERENCES public.ordenes(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  numero_factura TEXT NOT NULL DEFAULT '',
  limite_descargas INTEGER NOT NULL DEFAULT 3,
  contador_descargas INTEGER NOT NULL DEFAULT 0,
  token_descarga TEXT DEFAULT '',
  expira_el TIMESTAMPTZ,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_facturas"
  ON public.facturas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid()
      AND (rol = 'super' OR rol = 'admin' OR id = cliente_id)
    )
  );

CREATE POLICY "insert_facturas"
  ON public.facturas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_facturas_orden ON public.facturas(orden_id);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente ON public.facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_facturas_token ON public.facturas(token_descarga);
