-- ============================================
-- SCRIPT 019: Datos de prueba
-- 2 editoriales + 3 libros cada una
-- ============================================

-- Editoriales
INSERT INTO public.editoriales (id, nombre, correo_contacto)
VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Editorial Planeta Digital', 'contacto@planetadigital.com'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Libros del Sur Ediciones', 'info@librosdelsur.com')
ON CONFLICT (id) DO NOTHING;

-- Libros de Editorial Planeta Digital
INSERT INTO public.libros (id, titulo, autor, descripcion, sinopsis, editorial_id, precio, anio, activo, portada_url, archivo_pdf_ruta)
VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001',
   'El Arte de Programar en Python',
   'Carlos Méndez',
   'Guía completa para aprender Python desde cero hasta nivel avanzado.',
   'Un recorrido práctico por Python con ejercicios reales y proyectos final.',
   'a1b2c3d4-0001-4000-8000-000000000001',
   29.99, 2024, TRUE, '', ''),

  ('b1b2c3d4-0002-4000-8000-000000000002',
   'Diseño Web Moderno con CSS',
   'Laura Fernández',
   'Técnicas avanzadas de CSS para crear sitios web profesionales.',
   'Domina Flexbox, Grid, animaciones y diseño responsive paso a paso.',
   'a1b2c3d4-0001-4000-8000-000000000001',
   24.99, 2023, TRUE, '', ''),

  ('b1b2c3d4-0003-4000-8000-000000000003',
   'Inteligencia Artificial para Todos',
   'Roberto Sánchez',
   'Introducción accesible al mundo de la IA y el machine learning.',
   'Conceptos fundamentales, algoritmos populares y aplicaciones prácticas sin fórmulas complejas.',
   'a1b2c3d4-0001-4000-8000-000000000001',
   34.99, 2025, TRUE, '', '');

-- Libros de Libros del Sur Ediciones
INSERT INTO public.libros (id, titulo, autor, descripcion, sinopsis, editorial_id, precio, anio, activo, portada_url, archivo_pdf_ruta)
VALUES
  ('b1b2c3d4-0004-4000-8000-000000000004',
   'Historia del Cono Sur',
   'María González',
   'Un viaje por la historia de Argentina, Chile, Uruguay y Paraguay.',
   'Desde las civilizaciones precolombinas hasta la actualidad, con análisis cultural y político.',
   'a1b2c3d4-0002-4000-8000-000000000002',
   19.99, 2022, TRUE, '', ''),

  ('b1b2c3d4-0005-4000-8000-000000000005',
   'Recetas de la Abuela',
   'Ana Martínez',
   'Colección de recetas tradicionales sudamericanas.',
   'Platos típicos passed down through generations with modern twists.',
   'a1b2c3d4-0002-4000-8000-000000000002',
   15.99, 2023, TRUE, '', ''),

  ('b1b2c3d4-0006-4000-8000-000000000006',
   'Poesía Contemporánea Latinoamericana',
   'Varios Autores',
   'Antología de poetas emergentes de toda Latinoamérica.',
   'Una selección de 50 poemas que reflejan la diversidad cultural del continente.',
   'a1b2c3d4-0002-4000-8000-000000000002',
   12.99, 2024, TRUE, '', '');
