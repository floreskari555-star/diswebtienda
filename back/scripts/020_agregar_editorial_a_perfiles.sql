-- ============================================
-- SCRIPT 020: Vincular proveedor con editorial
-- Agrega editorial_id a perfiles para el flujo de proveedores
-- ============================================

-- Agregar columna editorial_id a perfiles
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS editorial_id UUID REFERENCES public.editoriales(id) ON DELETE SET NULL;

-- Comentario
COMMENT ON COLUMN public.perfiles.editorial_id IS 'Editorial asociada al proveedor (solo aplica para rol proveedor)';

-- Índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_perfiles_editorial ON public.perfiles(editorial_id);

-- Política RLS: proveedores ven su propio perfil con editorial
DROP POLICY IF EXISTS "Proveedores ven su perfil" ON public.perfiles;
CREATE POLICY "Proveedores ven su perfil"
  ON public.perfiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid()
      AND rol IN ('super', 'admin')
    )
  );
