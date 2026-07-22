-- =========================================
-- SCRIPT 003: Diagnóstico - Ejecutar en Supabase SQL Editor
-- =========================================

-- 1. Verificar si la tabla perfiles existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'perfiles'
) AS tabla_existe;

-- 2. Verificar estructura de la tabla perfiles (si existe)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'perfiles'
ORDER BY ordinal_position;

-- 3. Verificar si el trigger existe
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 4. Verificar si la función existe
SELECT routine_name, routine_type, data_type
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- 5. Verificar si hay errores en los logs recientes de PostgreSQL
-- (Esto se ve en Dashboard > Logs > Postgres)

-- 6. DESHABILITAR el trigger temporalmente para permitir crear usuarios
-- ⚠️ Solo para diagnóstico - ejecutar si los pasos anteriores están OK
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 7. Verificar permisos de la tabla
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' AND table_name = 'perfiles';
