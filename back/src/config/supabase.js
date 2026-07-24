/* | Nombre: supabase.js | Finalidad: Inicializa y exporta el cliente de Supabase para la conexión a la BD y Auth. */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ [SUPABASE] Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY");
  process.exit(1);
}

// Cliente para operaciones públicas (respeta RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente con service role (bypasea RLS) — solo para operaciones del backend
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Nombre del bucket para imágenes (constante de toda la app)
const BUCKET_NAME = "libros";

console.log("✅ [SUPABASE] Clientes inicializados correctamente");

module.exports = { supabase, supabaseAdmin, BUCKET_NAME };
