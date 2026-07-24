-- ============================================
-- SCRIPT 021: FIX COMPLETO - Tabla perfiles + trigger + backfill
-- Ejecutar UNA SOLA VEZ en Supabase SQL Editor
-- ============================================

-- 1. Eliminar trigger y función existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Recrear tabla perfiles con el esquema correcto
DROP TABLE IF EXISTS public.perfiles;

CREATE TABLE public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  apellido TEXT NOT NULL DEFAULT '',
  telefono TEXT DEFAULT '',
  direccion TEXT DEFAULT '',
  correo TEXT NOT NULL DEFAULT '',
  rol TEXT NOT NULL DEFAULT 'cliente',
  editorial_id UUID REFERENCES public.editoriales(id) ON DELETE SET NULL,
  creado_al TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_al TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.perfiles IS 'Perfiles de usuario延伸 from auth.users';
COMMENT ON COLUMN public.perfiles.rol IS 'Roles: super, admin, cliente, proveedor, reporte';
COMMENT ON COLUMN public.perfiles.editorial_id IS 'Editorial asociada al proveedor';

-- 3. Habilitar RLS
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS (simples y funcionales)
-- Service role tiene acceso completo
CREATE POLICY "service_role_all"
  ON public.perfiles FOR ALL
  USING (auth.role() = 'service_role');

-- Usuarios ven su propio perfil
CREATE POLICY "users_select_own"
  ON public.perfiles FOR SELECT
  USING (auth.uid() = id);

-- 5. Crear función del trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, apellido, telefono, direccion, correo, rol)
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
$$;

-- 6. Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Backfill: insertar usuarios existentes de auth.users que no tengan perfil
INSERT INTO public.perfiles (id, nombre, apellido, telefono, direccion, correo, rol)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'nombre', ''),
  COALESCE(au.raw_user_meta_data->>'apellido', ''),
  COALESCE(au.raw_user_meta_data->>'telefono', ''),
  COALESCE(au.raw_user_meta_data->>'direccion', ''),
  COALESCE(au.email, ''),
  COALESCE(au.raw_user_meta_data->>'rol', 'cliente')
FROM auth.users au
LEFT JOIN public.perfiles p ON p.id = au.id
WHERE p.id IS NULL;

-- 8. Verificar resultado
SELECT 'Perfiles creados:' as info, COUNT(*) as total FROM public.perfiles;
SELECT p.id, p.correo, p.rol, p.nombre, p.apellido FROM public.perfiles p;
