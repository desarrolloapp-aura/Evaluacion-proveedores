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
                itemsServicio: data.items_servicio || []
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
        // Verificar si ya existe una configuración
        const { data: existing } = await window.supabaseClient
            .from('config_evaluacion')
            .select('id')
            .limit(1)
            .single();
        
        const configData = {
            titulo: config.titulo,
            descripcion: config.descripcion,
            objetivo: config.objetivo,
            items_producto: config.itemsProducto,
            items_servicio: config.itemsServicio
        };
        
        if (existing) {
            // Actualizar
            const { error } = await window.supabaseClient
                .from('config_evaluacion')
                .update(configData)
                .eq('id', existing.id);
            
            if (error) throw error;
        } else {
            // Insertar
            const { error } = await window.supabaseClient
                .from('config_evaluacion')
                .insert([configData]);
            
            if (error) throw error;
        }
        
        return true;
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        return false;
    }
}

function getConfiguracionDefault() {
    return {
        titulo: 'Evaluación de Proveedores',
        descripcion: 'Este sistema permite evaluar el desempeño de nuestros proveedores mediante un proceso estructurado y objetivo, considerando diferentes aspectos según el tipo de proveedor (Producto o Servicio).',
        objetivo: 'Medir y mejorar continuamente la calidad de nuestros proveedores, asegurando que cumplan con los estándares requeridos en términos de calidad de productos/servicios, cumplimiento de plazos, comunicación y respuesta, y certificaciones y cumplimiento normativo.',
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
        const { data, error } = await window.supabaseClient
            .from('evaluadores')
            .select('*')
            .eq('activo', true)
            .order('nombre');
        
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
        // Verificar si ya existe (activo o inactivo)
        const { data: existente } = await window.supabaseClient
            .from('evaluadores')
            .select('id, activo')
            .eq('nombre', nombre)
            .maybeSingle();
        
        if (existente) {
            // Si existe pero está inactivo, reactivarlo
            if (!existente.activo) {
                const { data, error } = await window.supabaseClient
                    .from('evaluadores')
                    .update({ activo: true })
                    .eq('id', existente.id)
                    .select()
                    .single();
                
                if (error) throw error;
                return data;
            }
            // Si ya existe y está activo, retornar el existente
            return existente;
        }
        
        // Si no existe, crearlo
        const { data, error } = await window.supabaseClient
            .from('evaluadores')
            .insert([{ nombre: nombre }])
            .select()
            .single();
        
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
        const { error } = await window.supabaseClient
            .from('evaluadores')
            .update({ activo: false })
            .eq('nombre', nombre);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error al eliminar evaluador:', error);
        return false;
    }
}

// ========== PROVEEDORES ==========

async function cargarProveedores() {
    await waitForSupabase();
    try {
        const { data, error } = await window.supabaseClient
            .from('proveedores')
            .select('*')
            .eq('activo', true)
            .order('nombre');
        
        if (error) throw error;
        
        const proveedoresObj = {};
        data.forEach(p => {
            proveedoresObj[p.nombre] = p.tipo;
        });
        
        return proveedoresObj;
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
        return {};
    }
}

async function crearProveedor(nombre, tipo) {
    await waitForSupabase();
    try {
        // Verificar si ya existe (activo o inactivo)
        const { data: existente } = await window.supabaseClient
            .from('proveedores')
            .select('id, activo, tipo')
            .eq('nombre', nombre)
            .maybeSingle();
        
        if (existente) {
            // Si existe pero está inactivo, reactivarlo y actualizar tipo si es necesario
            if (!existente.activo || existente.tipo !== tipo) {
                const { data, error } = await window.supabaseClient
                    .from('proveedores')
                    .update({ activo: true, tipo: tipo })
                    .eq('id', existente.id)
                    .select()
                    .single();
                
                if (error) throw error;
                return data;
            }
            // Si ya existe y está activo, retornar el existente
            return existente;
        }
        
        // Si no existe, crearlo
        const { data, error } = await window.supabaseClient
            .from('proveedores')
            .insert([{ nombre: nombre, tipo: tipo }])
            .select()
            .single();
        
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
        const { error } = await window.supabaseClient
            .from('proveedores')
            .update({ activo: false })
            .eq('nombre', nombre);
        
        if (error) throw error;
        return true;
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
        // Obtener IDs de evaluadores y proveedores
        const { data: evaluadores } = await window.supabaseClient
            .from('evaluadores')
            .select('id, nombre')
            .eq('activo', true);
        
        const { data: proveedores } = await window.supabaseClient
            .from('proveedores')
            .select('id, nombre')
            .eq('activo', true);
        
        const evaluadoresMap = {};
        evaluadores.forEach(e => evaluadoresMap[e.nombre] = e.id);
        
        const proveedoresMap = {};
        proveedores.forEach(p => proveedoresMap[p.nombre] = p.id);
        
        // Eliminar todas las asignaciones existentes
        const { error: deleteError } = await window.supabaseClient
            .from('asignaciones')
            .delete()
            .neq('id', 0); // Eliminar todas
        
        if (deleteError) throw deleteError;
        
        // Insertar nuevas asignaciones
        const asignacionesToInsert = [];
        
        Object.keys(asignaciones).forEach(evaluadorNombre => {
            const evaluadorId = evaluadoresMap[evaluadorNombre];
            if (!evaluadorId) return;
            
            ['PRODUCTO', 'SERVICIO'].forEach(tipo => {
                asignaciones[evaluadorNombre][tipo].forEach(proveedorNombre => {
                    const proveedorId = proveedoresMap[proveedorNombre];
                    if (proveedorId) {
                        asignacionesToInsert.push({
                            evaluador_id: evaluadorId,
                            proveedor_id: proveedorId,
                            tipo: tipo
                        });
                    }
                });
            });
        });
        
        if (asignacionesToInsert.length > 0) {
            const { error: insertError } = await window.supabaseClient
                .from('asignaciones')
                .insert(asignacionesToInsert);
            
            if (insertError) throw insertError;
        }
        
        return true;
    } catch (error) {
        console.error('Error al guardar asignaciones:', error);
        return false;
    }
}

// ========== EVALUACIONES ==========

async function cargarEvaluaciones() {
    await waitForSupabase();
    try {
        const { data, error } = await window.supabaseClient
            .from('evaluaciones')
            .select(`
                *,
                evaluadores:evaluador_id (nombre),
                proveedores:proveedor_id (nombre)
            `)
            .order('created_at', { ascending: false }); // Ordenar por fecha de guardado
        
        if (error) throw error;
        
        return data.map(e => {
            // fecha_evaluacion es la fecha del calendario seleccionada
            const fechaEvaluacion = e.fecha_evaluacion || new Date().toISOString();
            // created_at es la fecha y hora cuando se guardó en la BD
            const createdAt = e.created_at || new Date().toISOString();
            // El campo en Supabase se llama "año" (con tilde)
            const anio = e.año || e.anio || new Date(fechaEvaluacion).getFullYear();
            
            return {
                id: e.id,
                evaluador: e.evaluadores.nombre,
                proveedor: e.proveedores.nombre,
                tipo: e.tipo_proveedor,
                correoProveedor: e.correo_proveedor,
                respuestas: e.respuestas,
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
            throw new Error('Evaluador o proveedor no encontrado');
        }
        
        // Convertir respuestas a formato JSONB
        let respuestasArray = [];
        if (Array.isArray(evaluacion.respuestas)) {
            // Ya viene como array
            respuestasArray = evaluacion.respuestas;
        } else {
            // Convertir objeto a array
            Object.keys(evaluacion.respuestas).forEach(key => {
                respuestasArray.push({
                    item: key,
                    valor: evaluacion.respuestas[key]
                });
            });
        }
        
        // Usar la fecha del calendario para fecha_evaluacion
        // created_at se maneja automáticamente por Supabase con default now()
        const fechaEvaluacion = evaluacion.fechaEvaluacion || evaluacion.fecha || new Date().toISOString();
        const anio = evaluacion.anio || new Date(fechaEvaluacion).getFullYear();
        
        console.log('💾 Guardando evaluación:');
        console.log('  - fecha_evaluacion (del calendario):', fechaEvaluacion);
        console.log('  - año:', anio);
        console.log('  - created_at se asignará automáticamente por Supabase');
        
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
                // created_at se asigna automáticamente por Supabase con default now()
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
        const { error } = await window.supabaseClient
            .from('evaluaciones')
            .delete()
            .eq('id', id);
        
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
        // Hashear la contraseña ingresada
        const passwordHash = await hashPassword(password);
        
        // Obtener el hash almacenado en Supabase
        const { data, error } = await window.supabaseClient
            .from('admin_password')
            .select('password_hash')
            .order('id', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        if (error) {
            console.error('Error al validar contraseña:', error);
            return false;
        }
        
        if (!data || !data.password_hash) {
            console.error('No se encontró hash de contraseña en la base de datos. Por favor, ejecuta el SQL de configuración.');
            return false;
        }
        
        // Comparar hashes
        return passwordHash === data.password_hash;
    } catch (error) {
        console.error('Error al validar contraseña:', error);
        return false;
    }
}

// Actualizar contraseña de administrador
async function actualizarPasswordAdmin(nuevaPassword) {
    await waitForSupabase();
    try {
        // Hashear la nueva contraseña
        const passwordHash = await hashPassword(nuevaPassword);
        
        // Verificar si ya existe un registro
        const { data: existing, error: checkError } = await window.supabaseClient
            .from('admin_password')
            .select('id')
            .order('id', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        // Si hay error y no es "no rows", lanzar error
        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }
        
        if (existing) {
            // Actualizar
            const { error } = await window.supabaseClient
                .from('admin_password')
                .update({ 
                    password_hash: passwordHash,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id);
            
            if (error) throw error;
        } else {
            // Insertar
            const { error } = await window.supabaseClient
                .from('admin_password')
                .insert([{ password_hash: passwordHash }]);
            
            if (error) throw error;
        }
        
        return true;
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        return false;
    }
}

