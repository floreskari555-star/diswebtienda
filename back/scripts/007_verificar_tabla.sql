-- =========================================
-- SCRIPT 007: VERIFICAR Y CORREGIR TABLA PERFILES
-- =========================================

-- 1. Ver estructura actual de la tabla perfiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'perfiles'
ORDER BY ordinal_position;

-- 2. Ver si hay datos en la tabla
SELECT COUNT(*) AS total_usuarios FROM public.perfiles;

-- 3. Ver usuarios en auth.users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;
