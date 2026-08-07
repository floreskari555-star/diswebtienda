-- ============================================
-- SCRIPT 025: Agregar cliente_id a facturas
-- ============================================

-- Agregar columna cliente_id para vincular facturas a usuarios
ALTER TABLE public.facturas ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Crear índice para búsquedas por cliente
CREATE INDEX IF NOT EXISTS idx_facturas_cliente ON public.facturas(cliente_id);

-- Actualizar política RLS para que solo el admin pueda ver todas las facturas
DROP POLICY IF EXISTS "select_facturas" ON public.facturas;
CREATE POLICY "select_facturas_admin"
  ON public.facturas FOR SELECT
  USING (
    auth.uid() = cliente_id
    OR EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol IN ('admin', 'super'))
  );
