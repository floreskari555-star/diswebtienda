/**
 * config.js - Configuración global del frontend
 * DisWebTienda - Frontend
 *
 * Modifica BACKEND_URL según tu entorno:
 *   - Local:    http://localhost:3000
 *   - Render:   https://tu-backend.onrender.com
 */

const CONFIG = {
  BACKEND_URL: "https://diswebtienda.onrender.com",

  // Supabase (opcional, para uso directo del cliente Supabase en CDN)
  SUPABASE_URL: "https://vnijbntopryzqocipywp.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", // Reemplazar con tu anon key real

  // Bucket de imágenes (constante en toda la app)
  BUCKET_NAME: "libros"
};
