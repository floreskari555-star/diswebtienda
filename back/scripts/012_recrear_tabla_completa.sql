-- =========================================
-- SCRIPT 012: RECREAR TABLA PERFILES COMPLETA
-- ⚠️ ESTE SCRIPT BORRA LA TABLA ACTUAL
-- Ejecutar en Supabase SQL Editor
-- =========================================

-- PASO 1: Eliminar trigger y función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- PASO 2: Eliminar tabla actual
DROP TABLE IF EXISTS public.perfiles;

-- PASO 3: Crear tabla completa con todas las columnas
CREATE TABLE public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  apellido TEXT NOT NULL DEFAULT '',
  correo TEXT NOT NULL DEFAULT '',
  telefono TEXT DEFAULT '',
  direccion TEXT DEFAULT '',
  rol TEXT NOT NULL DEFAULT 'cliente',
  creado_al TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_al TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PASO 4: Habilitar RLS
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- PASO 5: Política service_role (acceso completo)
CREATE POLICY "service_role_acceso_completo" ON public.perfiles
  FOR ALL USING (auth.role() = 'service_role');

-- PASO 6: Política usuarios autenticados (ven su propio perfil)
CREATE POLICY "usuarios_ven_su_perfil" ON public.perfiles
  FOR SELECT USING (auth.uid() = id);

-- PASO 7: Crear función del trigger
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

-- PASO 8: Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PASO 9: Verificar estructura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'perfiles'
ORDER BY ordinal_position;
