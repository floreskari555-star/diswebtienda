-- =========================================
-- SCRIPT 006: DIAGNÓSTICO TRIGGER - Ejecutar en Supabase SQL Editor
-- =========================================

-- 1. Verificar si hay usuarios en auth.users
SELECT id, email, raw_user_meta_data, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Verificar si hay perfiles
SELECT * FROM public.perfiles ORDER BY created_at DESC LIMIT 5;

-- 3. Verificar la función (mostrar el código)
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- 4. Verificar el trigger
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. Probar insertar directamente en perfiles (si hay usuarios en auth.users)
-- Descomentar y cambiar el UUID por uno real de auth.users:
-- INSERT INTO public.perfiles (id, nombre, apellido, email,rol)
-- SELECT id, 'Test', 'User', email, 'cliente'
-- FROM auth.users 
-- WHERE email = 'karina@editorial.com'
-- AND NOT EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.users.id);

-- 6. Verificar si la inserción funciona
-- SELECT * FROM public.perfiles WHERE email = 'karina@editorial.com';
