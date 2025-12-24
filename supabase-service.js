// Servicio para interactuar con Supabase
// Reemplaza las funciones de localStorage con llamadas a Supabase

// Esperar a que Supabase esté listo
function waitForSupabase() {
    return new Promise((resolve) => {
        if (window.supabase && supabase) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.supabase && supabase) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}

// ========== CONFIGURACIÓN DE EVALUACIÓN ==========

async function cargarConfiguracionEvaluacion() {
    await waitForSupabase();
    try {
        const { data, error } = await supabase
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
        const { data: existing } = await supabase
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
            const { error } = await supabase
                .from('config_evaluacion')
                .update(configData)
                .eq('id', existing.id);
            
            if (error) throw error;
        } else {
            // Insertar
            const { error } = await supabase
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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
        const { error } = await supabase
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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
        const { error } = await supabase
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
        const { data: evaluadores } = await supabase
            .from('evaluadores')
            .select('id, nombre')
            .eq('activo', true);
        
        if (!evaluadores) return {};
        
        const asignaciones = {};
        
        for (const evaluador of evaluadores) {
            const { data: asigns } = await supabase
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
        const { data: evaluadores } = await supabase
            .from('evaluadores')
            .select('id, nombre')
            .eq('activo', true);
        
        const { data: proveedores } = await supabase
            .from('proveedores')
            .select('id, nombre')
            .eq('activo', true);
        
        const evaluadoresMap = {};
        evaluadores.forEach(e => evaluadoresMap[e.nombre] = e.id);
        
        const proveedoresMap = {};
        proveedores.forEach(p => proveedoresMap[p.nombre] = p.id);
        
        // Eliminar todas las asignaciones existentes
        const { error: deleteError } = await supabase
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
            const { error: insertError } = await supabase
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
        const { data, error } = await supabase
            .from('evaluaciones')
            .select(`
                *,
                evaluadores:evaluador_id (nombre),
                proveedores:proveedor_id (nombre)
            `)
            .order('fecha_evaluacion', { ascending: false });
        
        if (error) throw error;
        
        return data.map(e => ({
            id: e.id,
            evaluador: e.evaluadores.nombre,
            proveedor: e.proveedores.nombre,
            tipo: e.tipo_proveedor,
            correoProveedor: e.correo_proveedor,
            respuestas: e.respuestas,
            resultadoFinal: e.resultado_final,
            fecha: e.fecha_evaluacion
        }));
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
        const { data: evaluador } = await supabase
            .from('evaluadores')
            .select('id')
            .eq('nombre', evaluacion.evaluador)
            .eq('activo', true)
            .single();
        
        const { data: proveedor } = await supabase
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
        
        const { data, error } = await supabase
            .from('evaluaciones')
            .insert([{
                evaluador_id: evaluador.id,
                proveedor_id: proveedor.id,
                tipo_proveedor: evaluacion.tipo,
                correo_proveedor: evaluacion.correoProveedor || null,
                respuestas: respuestasArray,
                resultado_final: evaluacion.resultadoFinal,
                fecha_evaluacion: evaluacion.fecha || new Date().toISOString()
            }])
            .select()
            .single();
        
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
        const { error } = await supabase
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

