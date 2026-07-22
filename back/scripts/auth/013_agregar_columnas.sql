-- =========================================
-- SCRIPT 013: AGREGAR COLUMNAS FALTANTES
-- Ejecutar en Supabase SQL Editor
-- =========================================

-- Agregar columnas faltantes (sin borrar la tabla)
ALTER TABLE public.perfiles 
  ADD COLUMN IF NOT EXISTS nombre TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS apellido TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS telefono TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS direccion TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS actualizado_al TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Eliminar trigger y función viejos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crear función del trigger actualizada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, apellido, correo, telefono, direccion, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'telefono', ''),
    COALESCE(NEW.raw_user_meta_data->>'direccion', ''),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verificar estructura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'perfiles'
ORDER BY ordinal_position;
