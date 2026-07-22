-- =========================================
-- SCRIPT 005: CORREGIR TRIGGER - Ejecutar en Supabase SQL Editor
-- =========================================

-- PASO 1: Eliminar trigger y función existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- PASO 2: Eliminar todas las políticas RLS existentes
DROP POLICY IF EXISTS "Service role acceso completo" ON public.perfiles;
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Usuarios actualizan su propio perfil" ON public.perfiles;

-- PASO 3: Crear función SIMPLE sin políticas RLS conflictivas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, apellido, telefono, direccion, email, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Sin nombre'),
    COALESCE(NEW.raw_user_meta_data->>'apellido', 'Sin apellido'),
    COALESCE(NEW.raw_user_meta_data->>'telefono', ''),
    COALESCE(NEW.raw_user_meta_data->>'direccion', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 4: Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PASO 5: Deshabilitar RLS temporalmente para testing
ALTER TABLE public.perfiles DISABLE ROW LEVEL SECURITY;

-- PASO 6: Verificar
SELECT 
  (SELECT EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created')) AS trigger_ok,
  (SELECT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user')) AS funcion_ok;

-- PASO 7: Probar insertando directamente (opcional - para debugging)
-- INSERT INTO public.perfiles (id, nombre, apellido, email, rol) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test', 'User', 'test@test.com', 'cliente');
