-- =========================================
-- SCRIPT 010: DIAGNÓSTICO COMPLETO
-- =========================================

-- 1. Verificar usuarios en auth.users
SELECT id, email, raw_user_meta_data FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Verificar perfiles
SELECT * FROM public.perfiles;

-- 3. Verificar función (código completo)
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- 4. Verificar trigger
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';

-- 5. PROBAR INSERTAR MANUALMENTE (cambiar el UUID por uno real de auth.users)
-- Primero copia un UUID de la consulta 1, luego descomenta y ejecuta:
/*
INSERT INTO public.perfiles (id, nombre, apellido, email, rol)
VALUES (
  'PEGA_AQUI_EL_UUID',
  'Test',
  'Manual',
  'test@test.com',
  'cliente'
);
*/

-- 6. Verificar si se insertó
-- SELECT * FROM public.perfiles;
