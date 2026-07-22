-- =========================================
-- SCRIPT 011: CORREGIR FUNCIÓN CON ESQUEMA COMPLETO
-- =========================================

-- 1. Eliminar trigger y función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Crear función con esquema completo
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
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear trigger con esquema completo de la función
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verificar que la función existe
SELECT routine_name, routine_schema, data_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 5. Verificar el trigger
SELECT trigger_name, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
