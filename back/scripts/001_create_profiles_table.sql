-- =========================================
-- SCRIPT 001: Tabla perfiles
-- Ejecutar en la consola SQL de Supabase
-- =========================================

CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT,
  email TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'cliente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios ven su propio perfil
CREATE POLICY "Usuarios ven su propio perfil"
  ON public.perfiles FOR SELECT
  USING (auth.uid() = id);

-- Política: Admin y super ven todos los perfiles
CREATE POLICY "Admin y super ven todos los perfiles"
  ON public.perfiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin')
    )
  );

-- Política: Admin y super pueden actualizar perfiles
CREATE POLICY "Admin y super pueden actualizar perfiles"
  ON public.perfiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin')
    )
  );

-- Política: Admin y super pueden eliminar perfiles
CREATE POLICY "Admin y super pueden eliminar perfiles"
  ON public.perfiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('super', 'admin')
    )
  );

-- Política: Permitir inserción desde el servicio ( SECURITY DEFINER)
CREATE POLICY "Service role puede insertar perfiles"
  ON public.perfiles FOR INSERT
  WITH CHECK (true);
