// Supabase Configuration
const SUPABASE_URL = "https://okciuqlwsbrdyshybbqb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2l1cWx3c2JyZHlzaHliYnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MDY3MzgsImV4cCI6MjA3OTA4MjczOH0.fJbVO22iixTIJWwnFVW_WKFbAreRCU6573CgM0feJG8"; // Reemplaza con tu key real

// Inicializar Supabase Client
let supabase = null;

function initSupabase() {
  if (typeof window.supabase !== "undefined") {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase initialized");
    return true;
  } else {
    console.error("❌ Supabase library not loaded");
    return false;
  }
}

// Exportar para uso global
window.initSupabase = initSupabase;
