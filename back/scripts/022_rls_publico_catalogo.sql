-- ============================================
-- SCRIPT 022: RLS público para catálogo
-- Permite lectura anónima de editoriales y libros
-- ============================================

-- Habilitar RLS en editoriales (si no está)
ALTER TABLE public.editoriales ENABLE ROW LEVEL SECURITY;

-- Política pública: cualquiera puede leer editoriales
DROP POLICY IF EXISTS "public_select_editoriales" ON public.editoriales;
CREATE POLICY "public_select_editoriales"
  ON public.editoriales FOR SELECT
  USING (true);

-- Habilitar RLS en libros (si no está)
ALTER TABLE public.libros ENABLE ROW LEVEL SECURITY;

-- Política pública: cualquiera puede leer libros activos
DROP POLICY IF EXISTS "public_select_libros" ON public.libros;
CREATE POLICY "public_select_libros"
  ON public.libros FOR SELECT
  USING (true);
