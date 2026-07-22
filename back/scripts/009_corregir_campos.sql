-- =========================================
-- SCRIPT 009: CORREGIR NOMBRE DE CAMPOS EN ESPAÑOL
-- =========================================

-- 1. Eliminar trigger y función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Verificar estructura actual
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'perfiles' ORDER BY ordinal_position;

-- 3. Si la tabla tiene "creado_al" en lugar de "created_at", la recreamos:
DROP TABLE IF EXISTS public.perfiles;

CREATE TABLE public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  apellido TEXT NOT NULL DEFAULT '',
  telefono TEXT DEFAULT '',
  direccion TEXT DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  rol TEXT NOT NULL DEFAULT 'cliente',
  creado_al TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_al TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Habilitar RLS
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 5. Política service_role
CREATE POLICY "service_role_all" ON public.perfiles
  FOR ALL USING (auth.role() = 'service_role');

-- 6. Política usuarios autenticados
CREATE POLICY "users_select_own" ON public.perfiles
  FOR SELECT USING (auth.uid() = id);

-- 7. Crear función del trigger
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

-- 8. Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Verificar
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'perfiles' ORDER BY ordinal_position;
