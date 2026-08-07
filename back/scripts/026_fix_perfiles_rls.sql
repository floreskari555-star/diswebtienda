-- ============================================
-- SCRIPT 026: Fix perfiles RLS infinite recursion
-- ============================================

-- Función security definer para evitar recursión infinita
-- Permite verificar el rol SIN disparar las políticas RLS de perfiles
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT rol FROM public.perfiles WHERE id = auth.uid();
$$;

-- Eliminar todas las políticas existentes en perfiles para recrearlas limpiamente
DROP POLICY IF EXISTS "service_role_all" ON public.perfiles;
DROP POLICY IF EXISTS "users_select_own" ON public.perfiles;
DROP POLICY IF EXISTS "users_update_own" ON public.perfiles;
DROP POLICY IF EXISTS "admin_select_all_perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "admin_update_all_perfiles" ON public.perfiles;

-- 1. service_role tiene acceso total
CREATE POLICY "service_role_all"
  ON public.perfiles FOR ALL
  USING (auth.role() = 'service_role');

-- 2. Los usuarios pueden leer SU PROPIO perfil
CREATE POLICY "users_select_own"
  ON public.perfiles FOR SELECT
  USING (auth.uid() = id);

-- 3. Los usuarios pueden actualizar SU PROPIO perfil
CREATE POLICY "users_update_own"
  ON public.perfiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Admin/super pueden leer todos los perfiles (sin recursión gracias a security definer)
CREATE POLICY "admin_select_all_perfiles"
  ON public.perfiles FOR SELECT
  USING (public.get_user_role() IN ('super', 'admin'));

-- 5. Admin/super pueden actualizar todos los perfiles
CREATE POLICY "admin_update_all_perfiles"
  ON public.perfiles FOR UPDATE
  USING (public.get_user_role() IN ('super', 'admin'));
