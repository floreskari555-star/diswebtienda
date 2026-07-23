-- ============================================
-- SCRIPT 015: Modificar tabla libros existente
-- Agrega columnas faltantes para el CRUD completo
-- ============================================

-- Agregar columna de sinopsis/descripción adicional (si no existe)
-- La tabla ya tiene 'descripcion', esta columna es para sinopsis corta
ALTER TABLE public.libros ADD COLUMN IF NOT EXISTS sinopsis TEXT DEFAULT '';

-- Agregar columna de año de publicación
ALTER TABLE public.libros ADD COLUMN IF NOT EXISTS anio INTEGER;

-- Agregar columna de estado activo/inactivo
ALTER TABLE public.libros ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

-- Agregar columna de fecha de actualización
ALTER TABLE public.libros ADD COLUMN IF NOT EXISTS actualizado_el TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Comentarios de las nuevas columnas
COMMENT ON COLUMN public.libros.sinopsis IS 'Sinopsis breve del libro';
COMMENT ON COLUMN public.libros.anio IS 'Año de publicación';
COMMENT ON COLUMN public.libros.activo IS 'Si está visible en el catálogo';
COMMENT ON COLUMN public.libros.actualizado_el IS 'Fecha de última actualización';

-- Trigger para actualizar actualizado_el automáticamente
CREATE OR REPLACE FUNCTION update_libros_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_el = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger existente si lo hay y recrearlo
DROP TRIGGER IF EXISTS trigger_libros_updated ON public.libros;
CREATE TRIGGER trigger_libros_updated
  BEFORE UPDATE ON public.libros
  FOR EACH ROW
  EXECUTE FUNCTION update_libros_timestamp();

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_libros_editorial_id ON public.libros(editorial_id);
CREATE INDEX IF NOT EXISTS idx_libros_activo ON public.libros(activo);
CREATE INDEX IF NOT EXISTS idx_libros_titulo ON public.libros(titulo);
