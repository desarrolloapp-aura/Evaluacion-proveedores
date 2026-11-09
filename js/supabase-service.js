// La página habla con la API de veles (/api), conectada a la base proveedores.

async function api(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const password = sessionStorage.getItem('adminPassword');
    if (password) headers['X-Admin-Password'] = password;
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(path, {
        method: options.method || 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
        const error = new Error((data && data.error) || 'Error de servidor');
        error.status = response.status;
        throw error;
    }
    return data;
}

function getConfiguracionDefault() {
    const anioActual = new Date().getFullYear();
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

async function cargarConfiguracionEvaluacion() {
    try {
        const data = await api('/api/config');
        if (!data) return getConfiguracionDefault();
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
    } catch (error) {
        console.error('Error al cargar configuración:', error);
        return getConfiguracionDefault();
    }
}

async function guardarConfiguracionEvaluacion(config) {
    await api('/api/config', {
        method: 'PUT',
        body: {
            titulo: config.titulo,
            descripcion: config.descripcion,
            objetivo: config.objetivo,
            items_producto: config.itemsProducto,
            items_servicio: config.itemsServicio,
            anio_encuesta: config.anioEncuesta || null,
            fecha_inicio_encuesta: config.fechaInicioEncuesta || null,
            fecha_fin_encuesta: config.fechaFinEncuesta || null,
            zona_horaria_encuesta: config.zonaHorariaEncuesta || 'America/Santiago'
        }
    });
    return true;
}

async function cargarEvaluadores() {
    try {
        const admin = sessionStorage.getItem('adminPassword') ? '?admin=1' : '';
        const data = await api('/api/evaluadores' + admin);
        return (data || []).map(e => e.nombre);
    } catch (error) {
        console.error('Error al cargar evaluadores:', error);
        return [];
    }
}

async function crearEvaluador(nombre) {
    return api('/api/evaluadores', { method: 'POST', body: { nombre } });
}

async function eliminarEvaluador(nombre) {
    try {
        await api('/api/evaluadores', { method: 'DELETE', body: { nombre } });
        return true;
    } catch (error) {
        console.error('Error al eliminar evaluador:', error);
        return false;
    }
}

async function cargarProveedores() {
    try {
        const admin = sessionStorage.getItem('adminPassword') ? '?admin=1' : '';
        const data = await api('/api/proveedores' + admin);
        const proveedoresObj = {};
        (data || []).forEach(p => {
            proveedoresObj[p.nombre] = { tipo: p.tipo, email: p.email || '' };
        });
        return proveedoresObj;
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
        return {};
    }
}

async function actualizarEmailProveedor(nombre, email) {
    await api('/api/proveedores/email', { method: 'PATCH', body: { nombre, email } });
    return true;
}

async function crearProveedor(nombre, tipo, email) {
    return api('/api/proveedores', { method: 'POST', body: { nombre, tipo, email } });
}

async function eliminarProveedor(nombre) {
    try {
        await api('/api/proveedores', { method: 'DELETE', body: { nombre } });
        return true;
    } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        return false;
    }
}

async function cargarAsignaciones() {
    try {
        if (!sessionStorage.getItem('adminPassword')) return {};
        const data = await api('/api/asignaciones');
        const asignaciones = {};
        (data || []).forEach(row => {
            if (!asignaciones[row.evaluador_nombre]) {
                asignaciones[row.evaluador_nombre] = { PRODUCTO: [], SERVICIO: [] };
            }
            asignaciones[row.evaluador_nombre][row.tipo].push(row.proveedor_nombre);
        });
        return asignaciones;
    } catch (error) {
        console.error('Error al cargar asignaciones:', error);
        return {};
    }
}

async function guardarAsignaciones(asignaciones) {
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
        await api('/api/asignaciones', { method: 'PUT', body: { asignaciones: asignacionesList } });
        return true;
    } catch (error) {
        console.error('Error al guardar asignaciones:', error);
        return false;
    }
}

async function cargarEvaluaciones() {
    try {
        if (!sessionStorage.getItem('adminPassword')) return [];
        const data = await api('/api/evaluaciones');
        return (data || []).map(e => {
            let metaEvaluador = null;
            let metaProveedor = null;
            let cleanRespuestas = e.respuestas;
            if (Array.isArray(e.respuestas)) {
                const metaItem = e.respuestas.find(r => r.item === '__META__');
                if (metaItem) {
                    metaEvaluador = metaItem.evaluadorNombre;
                    metaProveedor = metaItem.proveedorNombre;
                    cleanRespuestas = e.respuestas.filter(r => r.item !== '__META__');
                }
            }
            const getNombre = (joinedName, metaName) => metaName || joinedName || 'No especificado';
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
                fechaEvaluacion: fechaEvaluacion,
                createdAt: createdAt,
                fecha: fechaEvaluacion,
                anio: anio
            };
        });
    } catch (error) {
        console.error('Error al cargar evaluaciones:', error);
        return [];
    }
}

async function guardarEvaluacionEnSupabase(evaluacion) {
    let respuestasArray = [];
    if (Array.isArray(evaluacion.respuestas)) {
        respuestasArray = [...evaluacion.respuestas];
    } else {
        Object.keys(evaluacion.respuestas || {}).forEach(key => {
            respuestasArray.push({ item: key, valor: evaluacion.respuestas[key] });
        });
    }
    respuestasArray.push({
        item: '__META__',
        valor: 0,
        evaluadorNombre: evaluacion.evaluador,
        proveedorNombre: evaluacion.proveedor
    });
    const fechaEvaluacion = evaluacion.fechaEvaluacion || evaluacion.fecha || new Date().toISOString();
    await api('/api/evaluaciones', {
        method: 'POST',
        body: {
            evaluador: evaluacion.evaluador,
            proveedor: evaluacion.proveedor,
            tipo: evaluacion.tipo,
            correoProveedor: evaluacion.correoProveedor || '',
            respuestas: respuestasArray,
            resultadoFinal: evaluacion.resultadoFinal,
            fechaEvaluacion: fechaEvaluacion,
            anio: evaluacion.anio || new Date(fechaEvaluacion).getFullYear()
        }
    });
    return true;
}

async function obtenerAsignacionesPublico(evaluadorNombre) {
    try {
        const data = await api('/api/asignaciones/publico?evaluador=' + encodeURIComponent(evaluadorNombre));
        const asignaciones = { PRODUCTO: [], SERVICIO: [] };
        (data || []).forEach(item => {
            if (item.tipo === 'PRODUCTO' || item.tipo === 'SERVICIO') {
                asignaciones[item.tipo].push(item.proveedor_nombre);
            }
        });
        return asignaciones;
    } catch (error) {
        console.error('Error al obtener asignaciones de evaluador:', error);
        return { PRODUCTO: [], SERVICIO: [] };
    }
}

async function eliminarEvaluacion(id) {
    try {
        await api('/api/evaluaciones/' + encodeURIComponent(id), { method: 'DELETE' });
        return true;
    } catch (error) {
        console.error('Error al eliminar evaluación:', error);
        return false;
    }
}

async function validarPasswordAdmin(password) {
    try {
        const data = await api('/api/admin/verificar', { method: 'POST', body: { password } });
        return data.ok === true;
    } catch (error) {
        console.error('Error al validar contraseña:', error);
        return false;
    }
}

async function actualizarPasswordAdmin(nuevaPassword, passwordActual) {
    try {
        const data = await api('/api/admin/password', {
            method: 'POST',
            body: { passwordActual, nuevaPassword }
        });
        return data.ok === true;
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        return false;
    }
}

async function guardarEvaluacionAdmin(proveedor, item, valor) {
    try {
        await api('/api/evaluaciones-admin', {
            method: 'PUT',
            body: { proveedor, item, valor }
        });
        return true;
    } catch (error) {
        console.error('Error al guardar evaluación admin:', error);
        return false;
    }
}

async function eliminarEvaluacionAdmin(proveedor, item) {
    try {
        await api('/api/evaluaciones-admin', {
            method: 'DELETE',
            body: { proveedor, item }
        });
        return true;
    } catch (error) {
        console.error('Error al eliminar evaluación admin:', error);
        return false;
    }
}

async function cargarEvaluacionesAdmin(proveedor) {
    try {
        const data = await api('/api/evaluaciones-admin?proveedor=' + encodeURIComponent(proveedor));
        const evaluaciones = {};
        (data || []).forEach(d => { evaluaciones[d.item] = d.valor; });
        return evaluaciones;
    } catch (error) {
        console.error('Error al cargar evaluaciones admin:', error);
        return {};
    }
}

if (typeof window !== 'undefined') {
    window.guardarEvaluacionAdmin = guardarEvaluacionAdmin;
    window.cargarEvaluacionesAdmin = cargarEvaluacionesAdmin;
    window.eliminarProveedor = eliminarProveedor;
    window.eliminarEvaluador = eliminarEvaluador;
    window.validarPasswordAdmin = validarPasswordAdmin;
    window.guardarEvaluacionEnSupabase = guardarEvaluacionEnSupabase;
}
