-- ============================================
-- SCRIPT 027: Correlativo de comprobantes (ultdoc)
-- ============================================

-- Seed: últimos números de comprobante
INSERT INTO public.tablas_maestras (tabla, clave, valor, orden) VALUES
  ('ultdoc', 'FACTURA', '0000000', 1),
  ('ultdoc', 'BOLETA', '0000000', 2)
ON CONFLICT (tabla, clave) DO NOTHING;
