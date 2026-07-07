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
    document.addEventListener('DOMContentLoaded', function () {
        // Esperar un momento para que Supabase se cargue
        setTimeout(initSupabase, 100);
    });
} else {
    setTimeout(initSupabase, 100);
}

// ==========================================
// PARCHE DE SEGURIDAD PARA EL LOGIN DEL ADMIN
// ==========================================
window.validarPasswordAdmin = async function(password) {
    if (!window.supabaseClient) {
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    try {
        const { data, error } = await window.supabaseClient
            .rpc('verificar_admin_password', { password_ingresada: password });
        if (error) {
            console.error('Error en validación por RPC:', error);
            return false;
        }
        return data === true;
    } catch (error) {
        console.error('Error de autenticación:', error);
        return false;
    }
};

// ==========================================
// PARCHE DE ACCIONES EXCLUSIVAS DEL ADMIN
// ==========================================

// Sobreescribir la función de eliminar proveedor de forma segura
window.eliminarProveedor = async function(nombreProveedor) {
    if (!window.supabaseClient) await new Promise(resolve => setTimeout(resolve, 300));
    try {
        const { data, error } = await window.supabaseClient
            .rpc('eliminar_proveedor_seguro', { nombre_p: nombreProveedor });

        if (error) throw error;
        return data === true;
    } catch (error) {
        console.error('Error al eliminar proveedor por RPC:', error);
        return false;
    }
};

// Sobreescribir la función de eliminar evaluador de forma segura
window.eliminarEvaluador = async function(nombreEvaluador) {
    if (!window.supabaseClient) await new Promise(resolve => setTimeout(resolve, 300));
    try {
        const { data, error } = await window.supabaseClient
            .rpc('eliminar_evaluador_seguro', { nombre_e: nombreEvaluador });

        if (error) throw error;
        return data === true;
    } catch (error) {
        console.error('Error al eliminar evaluador por RPC:', error);
        return false;
    }
};