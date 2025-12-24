// Configuración de Supabase
const SUPABASE_URL = 'https://tctkigbphuacgejtfftj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Lnw55VM-35nPE_hZ1DcxmQ_EKI2Suwz';

// Variable global para Supabase (usando window para evitar conflictos)
window.supabaseClient = null;

// Función para inicializar Supabase
function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase inicializado correctamente');
    } else {
        console.error('❌ Supabase JS no está cargado. Asegúrate de incluir el script antes de este archivo.');
    }
}

// Inicializar cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Esperar un momento para que Supabase se cargue
        setTimeout(initSupabase, 100);
    });
} else {
    setTimeout(initSupabase, 100);
}

