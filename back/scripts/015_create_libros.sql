-- ============================================
-- SCRIPT 015: Tabla libros
-- ============================================

CREATE TABLE IF NOT EXISTS public.libros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  sinopsis TEXT DEFAULT '',
  anio INTEGER,
  editorial TEXT DEFAULT '',
  precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  portada TEXT DEFAULT '',
  archivo_pdf TEXT DEFAULT '',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_al TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_al TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentarios de columnas
COMMENT ON TABLE public.libros IS 'Catálogo de libros electrónicos (eBooks)';
COMMENT ON COLUMN public.libros.id IS 'Identificador único del libro';
COMMENT ON COLUMN public.libros.titulo IS 'Título del libro';
COMMENT ON COLUMN public.libros.autor IS 'Autor del libro';
COMMENT ON COLUMN public.libros.sinopsis IS 'Descripción breve del libro';
COMMENT ON COLUMN public.libros.anio IS 'Año de publicación';
COMMENT ON COLUMN public.libros.editorial IS 'Nombre de la editorial';
COMMENT ON COLUMN public.libros.precio IS 'Precio en soles (S/)';
COMMENT ON COLUMN public.libros.portada IS 'URL de la imagen de portada';
COMMENT ON COLUMN public.libros.archivo_pdf IS 'URL del archivo PDF en Supabase Storage';
COMMENT ON COLUMN public.libros.activo IS 'Si está visible en el catálogo';

-- RLS
ALTER TABLE public.libros ENABLE ROW LEVEL SECURITY;

-- Política pública: cualquiera puede leer libros activos
CREATE POLICY "Libros visibles para todos"
  ON public.libros
  FOR SELECT
  USING (activo = TRUE);

-- Política admin/super: acceso completo
CREATE POLICY "Admin y super gestionan libros"
  ON public.libros
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid()
      AND rol IN ('super', 'admin')
    )
  );

-- Índices
CREATE INDEX idx_libros_editorial ON public.libros(editorial);
CREATE INDEX idx_libros_activo ON public.libros(activo);

-- Trigger para actualizar actualizado_al
CREATE OR REPLACE FUNCTION update_libros_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_al = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_libros_updated
  BEFORE UPDATE ON public.libros
  FOR EACH ROW
  EXECUTE FUNCTION update_libros_timestamp();
