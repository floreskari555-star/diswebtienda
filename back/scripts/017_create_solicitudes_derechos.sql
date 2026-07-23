-- ============================================
-- SCRIPT 017: Tabla solicitudes_derechos
-- Registra propuestas de títulos y acuerdos económicos
-- ============================================

CREATE TABLE IF NOT EXISTS public.solicitudes_derechos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  editorial_id UUID NOT NULL REFERENCES public.editoriales(id) ON DELETE RESTRICT,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  sinopsis TEXT DEFAULT '',
  anio INTEGER,
  precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  monto_derechos NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  observaciones TEXT DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente',
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT solicitudes_derechos_estado_check 
    CHECK (estado IN ('pendiente', 'en_revision', 'aprobada', 'rechazada', 'archivada'))
);

-- Comentarios
COMMENT ON TABLE public.solicitudes_derechos IS 'Solicitudes de publicación de libros y acuerdos de derechos';
COMMENT ON COLUMN public.solicitudes_derechos.usuario_id IS 'Proveedor o admin que crea la solicitud';
COMMENT ON COLUMN public.solicitudes_derechos.editorial_id IS 'Editorial propietaria de los derechos';
COMMENT ON COLUMN public.solicitudes_derechos.monto_derechos IS 'Monto acordado por derechos de publicación';
COMMENT ON COLUMN public.solicitudes_derechos.estado IS 'Estado de la solicitud: pendiente/en_revision/aprobada/rechazada/archivada';

-- RLS
ALTER TABLE public.solicitudes_derechos ENABLE ROW LEVEL SECURITY;

-- Proveedores ven sus propias solicitudes
CREATE POLICY "Proveedores ven sus solicitudes"
  ON public.solicitudes_derechos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid()
      AND (rol = 'super' OR rol = 'admin' OR id = usuario_id)
    )
  );

-- Proveedores y admins pueden crear solicitudes
CREATE POLICY "Proveedores y admins crean solicitudes"
  ON public.solicitudes_derechos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid()
      AND rol IN ('super', 'admin', 'proveedor')
    )
  );

-- Solo admin/super pueden actualizar
CREATE POLICY "Admins actualizan solicitudes"
  ON public.solicitudes_derechos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid()
      AND rol IN ('super', 'admin')
    )
  );

-- Índices
CREATE INDEX idx_solicitudes_usuario ON public.solicitudes_derechos(usuario_id);
CREATE INDEX idx_solicitudes_editorial ON public.solicitudes_derechos(editorial_id);
CREATE INDEX idx_solicitudes_estado ON public.solicitudes_derechos(estado);

-- Trigger para actualizar actualizado_el
CREATE OR REPLACE FUNCTION update_solicitudes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_el = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_solicitudes_updated
  BEFORE UPDATE ON public.solicitudes_derechos
  FOR EACH ROW
  EXECUTE FUNCTION update_solicitudes_timestamp();
