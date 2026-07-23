-- ============================================
-- SCRIPT 016: Políticas RLS e índices para editoriales
-- La tabla ya existe, solo agregamos seguridad y performance
-- ============================================

-- RLS (si no está habilitado)
ALTER TABLE public.editoriales ENABLE ROW LEVEL SECURITY;

-- Política pública: cualquiera puede leer editoriales
CREATE POLICY "Editoriales visibles para todos"
  ON public.editoriales
  FOR SELECT
  USING (TRUE);

-- Política admin/super: acceso completo
CREATE POLICY "Admin y super gestionan editoriales"
  ON public.editoriales
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid()
      AND rol IN ('super', 'admin')
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_editoriales_nombre ON public.editoriales(nombre);
