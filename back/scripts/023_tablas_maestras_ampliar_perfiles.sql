-- ============================================
-- SCRIPT 023: Tablas maestras + ampliar perfiles
-- ============================================

-- ============================================
-- 1. TABLAS MAESTRAS (listas de valores)
-- ============================================
CREATE TABLE IF NOT EXISTS public.tablas_maestras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla TEXT NOT NULL,
  clave TEXT NOT NULL,
  valor TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tablas_maestras_tabla_clave_unique UNIQUE (tabla, clave)
);

ALTER TABLE public.tablas_maestras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_tablas_maestras"
  ON public.tablas_maestras FOR SELECT USING (true);

CREATE POLICY "admin_manage_tablas_maestras"
  ON public.tablas_maestras FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_tablas_maestras_tabla ON public.tablas_maestras(tabla);

-- Seed: Tipos de documento
INSERT INTO public.tablas_maestras (tabla, clave, valor, orden) VALUES
  ('TipoDocumento', 'DNI', 'DNI - Documento Nacional de Identidad', 1),
  ('TipoDocumento', 'RUC', 'RUC - Registro Único de Contribuyente', 2),
  ('TipoDocumento', 'CE', 'CE - Carné de Extranjería', 3),
  ('TipoDocumento', 'PASSPORT', 'Pasaporte', 4),
  ('TipoDocumento', 'PTP', 'PTP - Permiso Temporal de Permanencia', 5),
  ('TipoDocumento', 'CarnetRefug', 'Carné de Refugiado', 6)
ON CONFLICT (tabla, clave) DO UPDATE SET valor = EXCLUDED.valor, orden = EXCLUDED.orden;

-- ============================================
-- 2. AMPLIAR TABLA PERFILES
-- ============================================

-- Renombrar apellido → apellido_paterno
ALTER TABLE public.perfiles RENAME COLUMN apellido TO apellido_paterno;

-- Nuevos campos
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS apellido_materno TEXT NOT NULL DEFAULT '';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS tipo_documento TEXT DEFAULT '';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS numero_documento TEXT DEFAULT '';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS departamento TEXT DEFAULT '';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS provincia TEXT DEFAULT '';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS distrito TEXT DEFAULT '';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS ubigeo TEXT DEFAULT '';

-- Comentarios
COMMENT ON COLUMN public.perfiles.apellido_paterno IS 'Apellido paterno del usuario';
COMMENT ON COLUMN public.perfiles.apellido_materno IS 'Apellido materno del usuario';
COMMENT ON COLUMN public.perfiles.tipo_documento IS 'Tipo de documento: DNI, RUC, CE, etc.';
COMMENT ON COLUMN public.perfiles.numero_documento IS 'Número de documento de identidad';
COMMENT ON COLUMN public.perfiles.departamento IS 'Departamento (INEI)';
COMMENT ON COLUMN public.perfiles.provincia IS 'Provincia (INEI)';
COMMENT ON COLUMN public.perfiles.distrito IS 'Distrito (INEI)';
COMMENT ON COLUMN public.perfiles.ubigeo IS 'Código ubigeo de 6 dígitos (INEI)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_perfiles_documento ON public.perfiles(numero_documento);
CREATE INDEX IF NOT EXISTS idx_perfiles_ubigeo ON public.perfiles(ubigeo);

-- ============================================
-- 3. ACTUALIZAR TRIGGER PARA NUEVOS CAMPOS
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.perfiles (
    id, nombre, apellido_paterno, apellido_materno,
    tipo_documento, numero_documento,
    departamento, provincia, distrito, ubigeo,
    telefono, direccion, correo, rol
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido_paterno', NEW.raw_user_meta_data->>'apellido', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido_materno', ''),
    COALESCE(NEW.raw_user_meta_data->>'tipo_documento', ''),
    COALESCE(NEW.raw_user_meta_data->>'numero_documento', ''),
    COALESCE(NEW.raw_user_meta_data->>'departamento', ''),
    COALESCE(NEW.raw_user_meta_data->>'provincia', ''),
    COALESCE(NEW.raw_user_meta_data->>'distrito', ''),
    COALESCE(NEW.raw_user_meta_data->>'ubigeo', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefono', ''),
    COALESCE(NEW.raw_user_meta_data->>'direccion', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
