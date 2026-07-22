-- =========================================
-- SCRIPT 004: REPARAR TRIGGER - Ejecutar en Supabase SQL Editor
-- Ejecutar este script completo de una vez
-- =========================================

-- PASO 1: Eliminar trigger y función existentes (si existen)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- PASO 2: Asegurar que la tabla perfiles existe
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT,
  email TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'cliente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 3: Habilitar RLS
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- PASO 4: Eliminar políticas existentes y crear nuevas
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Admin y super ven todos los perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Admin y super pueden actualizar perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Admin y super pueden eliminar perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Service role puede insertar perfiles" ON public.perfiles;

-- Política: Service role puede hacer todo (para el backend)
CREATE POLICY "Service role acceso completo"
  ON public.perfiles
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Política: Usuarios autenticados ven su propio perfil
CREATE POLICY "Usuarios ven su propio perfil"
  ON public.perfiles FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuarios autenticados actualizan su propio perfil
CREATE POLICY "Usuarios actualizan su propio perfil"
  ON public.perfiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- PASO 5: Crear la función handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, apellido, telefono, direccion, email, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefono', ''),
    COALESCE(NEW.raw_user_meta_data->>'direccion', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error en handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 6: Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PASO 7: Verificar que todo está correcto
SELECT 
  (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'perfiles')) AS tabla_ok,
  (SELECT EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created')) AS trigger_ok,
  (SELECT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user')) AS funcion_ok;
