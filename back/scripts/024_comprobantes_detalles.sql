-- ============================================
-- SCRIPT 024: Comprobantes y detalles
-- ============================================

-- ============================================
-- 1. SEED: Tipo de comprobante
-- ============================================
INSERT INTO public.tablas_maestras (tabla, clave, valor, orden) VALUES
  ('tipoComprobante', 'BOLETA', 'Boleta de Venta', 1),
  ('tipoComprobante', 'FACTURA', 'Factura', 2)
ON CONFLICT (tabla, clave) DO UPDATE SET valor = EXCLUDED.valor, orden = EXCLUDED.orden;

-- ============================================
-- 2. REDEFINIR TABLA FACTURAS
-- ============================================
DROP TABLE IF EXISTS public.facturas CASCADE;

CREATE TABLE public.facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_comprobante TEXT NOT NULL DEFAULT 'BOLETA',
  numero_documento TEXT NOT NULL DEFAULT '',
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

CREATE POLICY "select_facturas"
  ON public.facturas FOR SELECT
  USING (true);

CREATE POLICY "insert_facturas"
  ON public.facturas FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_facturas_tipo ON public.facturas(tipo_comprobante);
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON public.facturas(numero_documento);

-- ============================================
-- 3. TABLA FACTURAS_DETALLES
-- ============================================
CREATE TABLE IF NOT EXISTS public.facturas_detalles (
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

CREATE INDEX IF NOT EXISTS idx_fdetalles_factura ON public.facturas_detalles(factura_id);
