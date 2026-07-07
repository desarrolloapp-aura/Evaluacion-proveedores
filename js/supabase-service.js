// Servicio para interactuar con Supabase
// Reemplaza las funciones de localStorage con llamadas a Supabase

// Esperar a que Supabase esté listo
function waitForSupabase() {
    return new Promise((resolve) => {
        if (window.supabaseClient) {
            resolve();
        } else {
            let attempts = 0;
            const maxAttempts = 50; // 5 segundos máximo
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.supabaseClient) {
                    clearInterval(checkInterval);
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.error('Timeout esperando Supabase');
                    resolve(); // Resolver de todas formas para no bloquear
                }
            }, 100);
        }
    });
}

// ========== CONFIGURACIÓN DE EVALUACIÓN ==========

async function cargarConfiguracionEvaluacion() {
    await waitForSupabase();
    try {
        const { data, error } = await window.supabaseClient
            .from('config_evaluacion')
            .select('*')
            .order('id', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error al cargar configuración:', error);
            return getConfiguracionDefault();
        }

        if (data) {
            return {
                titulo: data.titulo,
                descripcion: data.descripcion,
                objetivo: data.objetivo,
                itemsProducto: data.items_producto || [],
                itemsServicio: data.items_servicio || [],
                anioEncuesta: data.anio_encuesta || new Date().getFullYear(),
                fechaInicioEncuesta: data.fecha_inicio_encuesta || null,
                fechaFinEncuesta: data.fecha_fin_encuesta || null,
                zonaHorariaEncuesta: data.zona_horaria_encuesta || 'America/Santiago'
            };
        }

        return getConfiguracionDefault();
    } catch (e) {
        console.error('Error al cargar configuración:', e);
        return getConfiguracionDefault();
    }
}

async function guardarConfiguracionEvaluacion(config) {
    await waitForSupabase();
    try {
        const configData = {
            titulo: config.titulo,
            descripcion: config.descripcion,
            objetivo: config.objetivo,
            items_producto: config.itemsProducto,
            items_servicio: config.itemsServicio,
            anio_encuesta: config.anioEncuesta || null,
            fecha_inicio_encuesta: config.fechaInicioEncuesta || null,
            fecha_fin_encuesta: config.fechaFinEncuesta || null,
            zona_horaria_encuesta: config.zonaHorariaEncuesta || 'America/Santiago'
        };

        const passwordAdmin = sessionStorage.getItem('adminPassword') || '';

        const { data, error } = await window.supabaseClient
            .rpc('guardar_configuracion_evaluacion_seguro', { 
                password_admin: passwordAdmin,
                config_data: configData 
            });

        if (error) {
            console.error('❌ Error al guardar configuración:', error);
            throw error;
        }
        return data;
    } catch (e) {
        console.error('Error al guardar configuración:', e);
        throw e;
    }
}

function getConfiguracionDefault() {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    return {
        titulo: 'Evaluación de Proveedores',
        descripcion: 'Este sistema permite evaluar el desempeño de nuestros proveedores mediante un proceso estructurado y objetivo, considerando diferentes aspectos según el tipo de proveedor (Producto o Servicio).',
        objetivo: 'Medir y mejorar continuamente la calidad de nuestros proveedores, asegurando que cumplan con los estándares requeridos en términos de calidad de productos/servicios, cumplimiento de plazos, comunicación y respuesta, y certificaciones y cumplimiento normativo.',
        anioEncuesta: anioActual,
        fechaInicioEncuesta: null,
        fechaFinEncuesta: null,
        zonaHorariaEncuesta: 'America/Santiago',
        itemsProducto: [
            { nombre: 'Condiciones Financieras de Pago', ponderacion: 10 },
            { nombre: 'Información de certificación o implementación respecto a alguna ISO', ponderacion: 4 },
            { nombre: 'Comunicación fluida con el cliente', ponderacion: 4 },
            { nombre: 'Reacción frente a nuevos requerimientos', ponderacion: 5 },
            { nombre: 'Información técnica de los productos (Calidad, Medio Ambiente y Seguridad)', ponderacion: 2 },
            { nombre: 'Cumplimiento de plazos de entrega, horarios de bodega y documentación', ponderacion: 65 },
            { nombre: 'Certificación del producto del proveedor', ponderacion: 10 }
        ],
        itemsServicio: [
            { nombre: 'Comportamiento seguro durante la prestación del servicio', ponderacion: 10 },
            { nombre: 'Cumplimiento de la oportunidad en la realización del servicio', ponderacion: 33 },
            { nombre: 'Calidad del servicio', ponderacion: 33 },
            { nombre: 'Comunicación fluida con el prestador del servicio', ponderacion: 7 },
            { nombre: 'Reacción del prestador frente a nuevos requerimientos', ponderacion: 10 },
            { nombre: 'Publicación del estado en regla de las partes relevantes y otra información relevante para el usuario AURA', ponderacion: 7 }
        ]
    };
}

// ========== EVALUADORES ==========

async function cargarEvaluadores() {
    await waitForSupabase();
    try {
        const passwordAdmin = sessionStorage.getItem('adminPassword');
        let data, error;

        if (passwordAdmin) {
            // Cargar de forma segura para administrador
            const res = await window.supabaseClient
                .rpc('cargar_evaluadores_admin', { password_admin: passwordAdmin });
            data = res.data;
            error = res.error;
        } else {
            // Cargar de forma pública (solo nombres activos)
            const res = await window.supabaseClient
                .from('evaluadores')
                .select('id, nombre, activo')
                .eq('activo', true)
                .order('nombre');
            data = res.data;
            error = res.error;
        }

        if (error) throw error;
        return data.map(e => e.nombre);
    } catch (error) {
        console.error('Error al cargar evaluadores:', error);
        return [];
    }
}

async function crearEvaluador(nombre) {
    await waitForSupabase();
    try {
        const passwordAdmin = sessionStorage.getItem('adminPassword') || '';
        const { data, error } = await window.supabaseClient
            .rpc('crear_evaluador_seguro', { 
                password_admin: passwordAdmin,
                nombre_e: nombre 
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error al crear evaluador:', error);
        throw error;
    }
}

async function eliminarEvaluador(nombre) {
    await waitForSupabase();
    try {
        const passwordAdmin = sessionStorage.getItem('adminPassword') || '';
        const { data, error } = await window.supabaseClient
            .rpc('eliminar_evaluador_seguro', { 
                password_admin: passwordAdmin,
                nombre_e: nombre 
            });

        if (error) throw error;
        return data === true;
    } catch (error) {
        console.error('Error al eliminar evaluador:', error);
        return false;
    }
}

// ========== PROVEEDORES ==========

async function cargarProveedores() {
    await waitForSupabase();
    try {
        const passwordAdmin = sessionStorage.getItem('adminPassword');
        let data, error;

        if (passwordAdmin) {
            // Cargar de forma segura para administrador (con email)
            const res = await window.supabaseClient
                .rpc('cargar_proveedores_admin', { password_admin: passwordAdmin });
            data = res.data;
            error = res.error;
        } else {
            // Cargar de forma pública (solo nombre y tipo)
            const res = await window.supabaseClient
                .from('proveedores')
                .select('id, nombre, tipo, activo')
                .eq('activo', true)
                .order('nombre');
            data = res.data;
            error = res.error;
        }

        if (error) throw error;

        const proveedoresObj = {};
        data.forEach(p => {
            proveedoresObj[p.nombre] = {
                tipo: p.tipo,
                email: p.email || ''
            };
        });

        return proveedoresObj;
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
        return {};
    }
}

async function actualizarEmailProveedor(nombre, email) {
    await waitForSupabase();
    try {
        const passwordAdmin = sessionStorage.getItem('adminPassword') || '';
        const { data, error } = await window.supabaseClient
            .rpc('actualizar_email_proveedor_seguro', { 
                password_admin: passwordAdmin,
                nombre_p: nombre,
                email_p: email 
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error al actualizar email proveedor:', error);
        throw error;
    }
}

async function crearProveedor(nombre, tipo, email) {
    await waitForSupabase();
    try {
        const passwordAdmin = sessionStorage.getItem('adminPassword') || '';
        const { data, error } = await window.supabaseClient
            .rpc('crear_proveedor_seguro', { 
                password_admin: passwordAdmin,
                nombre_p: nombre, 
                tipo_p: tipo, 
                email_p: email 
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        throw error;
    }
}

async function eliminarProveedor(nombre) {
    await waitForSupabase();
    try {
        const passwordAdmin = sessionStorage.getItem('adminPassword') || '';
        const { data, error } = await window.supabaseClient
            .rpc('eliminar_proveedor_seguro', { 
                password_admin: passwordAdmin,
                nombre_p: nombre 
            });

        if (error) throw error;
        return data === true;
    } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        return false;
    }
}

// ========== ASIGNACIONES ==========

async function cargarAsignaciones() {
    await waitForSupabase();
    try {
        const { data: evaluadores } = await window.supabaseClient
            .from('evaluadores')
            .select('id, nombre')
            .eq('activo', true);

        if (!evaluadores) return {};

        const asignaciones = {};

        for (const evaluador of evaluadores) {
            const { data: asigns } = await window.supabaseClient
                .from('asignaciones')
                .select(`
                    tipo,
                    proveedores:proveedor_id (
                        nombre
                    )
                `)
                .eq('evaluador_id', evaluador.id);

            asignaciones[evaluador.nombre] = {
                PRODUCTO: [],
                SERVICIO: []
            };

            if (asigns) {
                asigns.forEach(a => {
                    if (a.proveedores && a.proveedores.nombre) {
                        asignaciones[evaluador.nombre][a.tipo].push(a.proveedores.nombre);
                    }
                });
            }
        }

        return asignaciones;
    } catch (error) {
        console.error('Error al cargar asignaciones:', error);
        return {};
    }
}

async function guardarAsignaciones(asignaciones) {
    await waitForSupabase();
    try {
        const asignacionesList = [];

        Object.keys(asignaciones).forEach(evaluadorNombre => {
            ['PRODUCTO', 'SERVICIO'].forEach(tipo => {
                if (asignaciones[evaluadorNombre] && Array.isArray(asignaciones[evaluadorNombre][tipo])) {
                    asignaciones[evaluadorNombre][tipo].forEach(proveedorNombre => {
                        asignacionesList.push({
                            evaluador_nombre: evaluadorNombre,
                            proveedor_nombre: proveedorNombre,
                            tipo: tipo
                        });
                    });
                }
            });
        });

        const passwordAdmin = sessionStorage.getItem('adminPassword') || '';

        const { data, error } = await window.supabaseClient
            .rpc('guardar_asignaciones_seguro', { 
                password_admin: passwordAdmin,
                asignaciones_list: asignacionesList 
            });

        if (error) throw error;
        return data === true;
    } catch (error) {
        console.error('Error al guardar asignaciones:', error);
        return false;
    }
}

// ========== EVALUACIONES ==========

async function cargarEvaluaciones() {
    await waitForSupabase();
    try {
        const passwordAdmin = sessionStorage.getItem('adminPassword');
        if (!passwordAdmin) return [];

        const { data, error } = await window.supabaseClient
            .rpc('cargar_evaluaciones_admin', { password_admin: passwordAdmin });

        if (error) throw error;

        return data.map(e => {
            // Helper to see if we have metadata in responses
            let metaEvaluador = null;
            let metaProveedor = null;
            let cleanRespuestas = e.respuestas;

            if (Array.isArray(e.respuestas)) {
                const metaItem = e.respuestas.find(r => r.item === '__META__');
                if (metaItem) {
                    metaEvaluador = metaItem.evaluadorNombre;
                    metaProveedor = metaItem.proveedorNombre;
                    // Hide metadata from normal usage
                    cleanRespuestas = e.respuestas.filter(r => r.item !== '__META__');
                }
            }

            // Helper to safely extract name from joined relation or metadata
            const getNombre = (joinedName, metaName) => {
                if (metaName) return metaName; // Prioritize saved metadata (what was on the form)
                return joinedName || 'No especificado';
            };

            const fechaEvaluacion = e.fecha_evaluacion || new Date().toISOString();
            const createdAt = e.created_at || new Date().toISOString();
            const anio = e.año || e.anio || new Date(fechaEvaluacion).getFullYear();

            return {
                id: e.id,
                evaluador: getNombre(e.evaluador_nombre, metaEvaluador),
                proveedor: getNombre(e.proveedor_nombre, metaProveedor),
                tipo: e.tipo_proveedor,
                correoProveedor: e.correo_proveedor,
                respuestas: cleanRespuestas,
                resultadoFinal: e.resultado_final,
                fechaEvaluacion: fechaEvaluacion, // Fecha del calendario (fecha_evaluacion)
                createdAt: createdAt, // Fecha de guardado (created_at)
                fecha: fechaEvaluacion, // Mantener compatibilidad con código existente
                anio: anio
            };
        });
    } catch (error) {
        console.error('Error al cargar evaluaciones:', error);
        return [];
    }
}

// Función global para guardar evaluación
async function guardarEvaluacionEnSupabase(evaluacion) {
    await waitForSupabase();
    try {
        // Obtener IDs
        const { data: evaluador } = await window.supabaseClient
            .from('evaluadores')
            .select('id')
            .eq('nombre', evaluacion.evaluador)
            .eq('activo', true)
            .single();

        const { data: proveedor } = await window.supabaseClient
            .from('proveedores')
            .select('id')
            .eq('nombre', evaluacion.proveedor)
            .eq('activo', true)
            .single();

        if (!evaluador || !proveedor) {
            throw new Error('Evaluador o proveedor no encontrado en la base de datos (IDs)');
        }

        // Convertir respuestas a formato JSONB y AÑADIR METADATA DE NOMBRES
        // Esto cumple con "tomarlo del formulario" como respaldo
        let respuestasArray = [];
        if (Array.isArray(evaluacion.respuestas)) {
            // Ya viene como array, clonarlo para no mutar original
            respuestasArray = [...evaluacion.respuestas];
        } else {
            // Convertir objeto a array
            Object.keys(evaluacion.respuestas).forEach(key => {
                respuestasArray.push({
                    item: key,
                    valor: evaluacion.respuestas[key]
                });
            });
        }

        // Inject Metadata
        respuestasArray.push({
            item: '__META__',
            valor: 0,
            evaluadorNombre: evaluacion.evaluador, // Guardar el texto literal del form
            proveedorNombre: evaluacion.proveedor
        });

        // Usar la fecha del calendario para fecha_evaluacion
        // created_at se maneja automáticamente por Supabase con default now()
        const fechaEvaluacion = evaluacion.fechaEvaluacion || evaluacion.fecha || new Date().toISOString();
        const anio = evaluacion.anio || new Date(fechaEvaluacion).getFullYear();

        console.log('💾 Guardando evaluación con metadatos:', evaluacion.evaluador, evaluacion.proveedor);

        const { data, error } = await window.supabaseClient
            .from('evaluaciones')
            .insert([{
                evaluador_id: evaluador.id,
                proveedor_id: proveedor.id,
                tipo_proveedor: evaluacion.tipo,
                correo_proveedor: evaluacion.correoProveedor || null,
                respuestas: respuestasArray,
                resultado_final: evaluacion.resultadoFinal,
                fecha_evaluacion: fechaEvaluacion, // Fecha del calendario seleccionada
                año: anio  // El campo en Supabase se llama "año" (con tilde)
            }])
            .select()
            .single();

        if (data) {
            console.log('✅ Evaluación guardada:');
            console.log('  - fecha_evaluacion:', data.fecha_evaluacion);
            console.log('  - created_at:', data.created_at);
        }

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error al guardar evaluación:', error);
        throw error;
    }
}

async function eliminarEvaluacion(id) {
    await waitForSupabase();
    try {
        const passwordAdmin = sessionStorage.getItem('adminPassword') || '';
        const { error } = await window.supabaseClient
            .rpc('eliminar_evaluacion_segura', { 
                password_admin: passwordAdmin,
                id_evaluacion: id
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error al eliminar evaluación:', error);
        return false;
    }
}

// ========== AUTENTICACIÓN DE ADMINISTRADOR ==========

// Función para hashear una contraseña usando SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Validar contraseña de administrador
async function validarPasswordAdmin(password) {
    await waitForSupabase();
    try {
        // Llamar a la función RPC segura
        const { data, error } = await window.supabaseClient
            .rpc('verificar_admin_password', { password_ingresada: password });

        if (error) {
            console.error('Error al validar contraseña por RPC:', error);
            return false;
        }

        return data === true;
    } catch (error) {
        console.error('Error al validar contraseña:', error);
        return false;
    }
}

// Actualizar contraseña de administrador
async function actualizarPasswordAdmin(nuevaPassword, passwordActual) {
    await waitForSupabase();
    try {
        // Hashear la nueva contraseña
        const passwordHash = await hashPassword(nuevaPassword);

        // Llamar a la función RPC segura para guardar el nuevo hash verificando la contraseña actual
        const { data, error } = await window.supabaseClient
            .rpc('actualizar_password_admin_segura', { 
                password_actual: passwordActual, 
                nuevo_hash: passwordHash 
            });

        if (error) throw error;
        return data === true;
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        return false;
    }
}


// ========== EVALUACIONES ADMINISTRADOR ==========

async function guardarEvaluacionAdmin(proveedor, item, valor) {
    await waitForSupabase();
    try {
        const passwordAdmin = sessionStorage.getItem('adminPassword') || '';
        const { error } = await window.supabaseClient
            .rpc('guardar_evaluacion_admin_segura', {
                password_admin: passwordAdmin,
                proveedor_p: proveedor,
                item_p: item,
                valor_p: valor
            });

        if (error) {
            console.error('Error detallado upsert:', error);
            throw error;
        }
        return true;
    } catch (error) {
        console.error('Error al guardar evaluación admin:', error);
        return false;
    }
}

async function eliminarEvaluacionAdmin(proveedor, item) {
    await waitForSupabase();
    try {
        const passwordAdmin = sessionStorage.getItem('adminPassword') || '';
        const { error } = await window.supabaseClient
            .rpc('eliminar_evaluacion_admin_segura', {
                password_admin: passwordAdmin,
                proveedor_p: proveedor,
                item_p: item
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error al eliminar evaluación admin:', error);
        return false;
    }
}

async function cargarEvaluacionesAdmin(proveedor) {
    await waitForSupabase();
    try {
        const passwordAdmin = sessionStorage.getItem('adminPassword') || '';
        const { data, error } = await window.supabaseClient
            .rpc('cargar_evaluaciones_admin_segura', {
                password_admin: passwordAdmin,
                proveedor_p: proveedor
            });

        if (error) throw error;

        // Convertir a objeto { item: valor }
        const evaluaciones = {};
        data.forEach(d => {
            evaluaciones[d.item] = d.valor;
        });
        return evaluaciones;
    } catch (error) {
        console.error('Error al cargar evaluaciones admin:', error);
        return {};
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.guardarEvaluacionAdmin = guardarEvaluacionAdmin;
    window.cargarEvaluacionesAdmin = cargarEvaluacionesAdmin;
}

