-- ============================================
-- SCRIPT: Estructura de tablas para diagrama
-- Solo CREATE TABLE + PK/FK + índices
-- Sin triggers, funciones ni RLS
-- ============================================

-- auth.users (tabla interna de Supabase Auth - solo referencial)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT NOT NULL,
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
  raw_app_meta_data JSONB DEFAULT '{}'::jsonb,
  role TEXT,
  aud TEXT,
  confirmation_token TEXT,
  recovery_token TEXT
);

-- editoriales
CREATE TABLE public.editoriales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  correo_contacto TEXT DEFAULT '',
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- perfiles
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
  actualizado_al TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- tablas_maestras
CREATE TABLE public.tablas_maestras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla TEXT NOT NULL,
  clave TEXT NOT NULL,
  valor TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tabla, clave)
);

-- libros
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

-- solicitudes_derechos
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
  actualizado_el TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- pagos_editoriales
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
  actualizado_el TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ordenes
CREATE TABLE public.ordenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  monto_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  metodo_pago TEXT DEFAULT '',
  comprobante_pago_url TEXT DEFAULT '',
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- orden_detalles
CREATE TABLE public.orden_detalles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID NOT NULL REFERENCES public.ordenes(id) ON DELETE CASCADE,
  libro_id UUID NOT NULL REFERENCES public.libros(id) ON DELETE RESTRICT,
  precio_al_comprar NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- facturas
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
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- facturas_detalles
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
