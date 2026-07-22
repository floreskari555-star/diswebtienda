-- =========================================
-- SCRIPT 014: ACTUALIZAR CHECK CONSTRAINT DE ROL
-- Ejecutar en Supabase SQL Editor
-- =========================================

-- Ver el constraint actual
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'perfiles'::regclass AND contype = 'c';

-- Eliminar constraint viejo
ALTER TABLE public.perfiles 
  DROP CONSTRAINT IF EXISTS perfiles_rol_check;

-- Crear constraint nuevo con todos los roles permitidos
ALTER TABLE public.perfiles 
  ADD CONSTRAINT perfiles_rol_check 
  CHECK (rol IN ('super', 'admin', 'cliente', 'proveedor', 'reporte'));

-- Verificar
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'perfiles'::regclass AND contype = 'c';
