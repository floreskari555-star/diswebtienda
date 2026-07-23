-- ============================================
-- SCRIPT 018: Tabla pagos_editoriales
-- Registra comprobantes de pago a editoriales
-- ============================================

CREATE TABLE IF NOT EXISTS public.pagos_editoriales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id UUID NOT NULL REFERENCES public.solicitudes_derechos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  editorial_id UUID NOT NULL REFERENCES public.editoriales(id) ON DELETE RESTRICT,
  monto NUMERIC(10, 2) NOT NULL,
  comprobante_url TEXT DEFAULT '',
  numero_operacion TEXT DEFAULT '',
  fecha_pago DATE,
  observaciones TEXT DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente',
  admin_revision_id UUID REFERENCES public.perfiles(id),
  fecha_revision TIMESTAMPTZ,
  motivo_rechazo TEXT DEFAULT '',
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pagos_editoriales_estado_check 
    CHECK (estado IN ('pendiente', 'aprobado', 'rechazado'))
);

-- Comentarios
COMMENT ON TABLE public.pagos_editoriales IS 'Comprobantes de pago a editoriales por derechos de publicación';
COMMENT ON COLUMN public.pagos_editoriales.solicitud_id IS 'Solicitud de derechos asociada';
COMMENT ON COLUMN public.pagos_editoriales.comprobante_url IS 'URL del comprobante de pago en Supabase Storage';
COMMENT ON COLUMN public.pagos_editoriales.estado IS 'Estado: pendiente/aprobado/rechazado';

-- RLS
ALTER TABLE public.pagos_editoriales ENABLE ROW LEVEL SECURITY;

-- Proveedores ven sus pagos, admin ve todos
CREATE POLICY "Acceso a pagos"
  ON public.pagos_editoriales
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid()
      AND (rol = 'super' OR rol = 'admin' OR id = usuario_id)
    )
  );

-- Proveedores y admins pueden crear pagos
CREATE POLICY "Crear pagos"
  ON public.pagos_editoriales
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid()
      AND rol IN ('super', 'admin', 'proveedor')
    )
  );

-- Solo admin/super pueden actualizar (aprobar/rechazar)
CREATE POLICY "Admins actualizan pagos"
  ON public.pagos_editoriales
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid()
      AND rol IN ('super', 'admin')
    )
  );

-- Índices
CREATE INDEX idx_pagos_solicitud ON public.pagos_editoriales(solicitud_id);
CREATE INDEX idx_pagos_usuario ON public.pagos_editoriales(usuario_id);
CREATE INDEX idx_pagos_editorial ON public.pagos_editoriales(editorial_id);
CREATE INDEX idx_pagos_estado ON public.pagos_editoriales(estado);

-- Trigger para actualizar actualizado_el
CREATE OR REPLACE FUNCTION update_pagos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_el = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pagos_updated
  BEFORE UPDATE ON public.pagos_editoriales
  FOR EACH ROW
  EXECUTE FUNCTION update_pagos_timestamp();
