// Panel de Administración - Sistema de Evaluación de Proveedores

// Valores por defecto (debe estar antes de cargarConfiguracion)
const configuracionDefault = {
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
    ],
    // Asignación de proveedores por evaluador
    asignacionProveedores: {
        'Exequiel Ledezma': { PRODUCTO: ['PRODALAM', 'APRO', 'SERVICIOS 23', 'RECOMIN', 'PROSEV', 'TUBIX', 'LET RIVEROS', 'DYFAR'], SERVICIO: [] },
        'Pablo León': { PRODUCTO: ['SKAVA', 'MANANTIAL', 'PRISA', 'LUKSIC', 'NORMET', 'OFIGRAPH', 'MARSELLA', 'OVIEDO', 'SEGURYCEL'], SERVICIO: [] },
        'Julio Quintero': { PRODUCTO: ['ADASME', 'BCM SERVICIOS', 'MAQUIMAL', 'ROBOCON'], SERVICIO: [] },
        'Herve Guerrero': { PRODUCTO: ['APEX', 'DERCOMAQ', 'PERFOMEX', 'SALFA', 'FILTER'], SERVICIO: [] },
        'Felipe Velazquez': { PRODUCTO: ['ARTEMETALICA', 'EQ. MINEROS', 'RCR', 'TOTAL CHILE'], SERVICIO: [] },
        'Freddy Marquez': { PRODUCTO: ['AS COMPUTACION', 'IT CONS'], SERVICIO: [] },
        'Faviola Parraguez': { PRODUCTO: [], SERVICIO: ['SEBASTIAN CARTAGENA'] },
        'Hernán Opazo': { PRODUCTO: [], SERVICIO: ['RENTOKIL', 'CLIMA IDEAL', 'SEGURIDAD MMC'] },
        'Ramón Cabrera': { PRODUCTO: [], SERVICIO: ['AMYSA'] },
        'Manuel Bustamante': { PRODUCTO: [], SERVICIO: ['TRANSBUS', 'ESTAFETA'] },
        'Magdalena Avendaño': { PRODUCTO: [], SERVICIO: ['ALTO IMPACTO'] },
        'Patricia Torres': { PRODUCTO: [], SERVICIO: ['TRANSPORTE ARANGUIZ'] },
        'Leandro Sánchez': { PRODUCTO: [], SERVICIO: ['SISA'] },
        'Danitza Meneses': { PRODUCTO: [], SERVICIO: ['XTREME'] },
        'Cintia Salas': { PRODUCTO: [], SERVICIO: ['SERVISAN'] },
        'Sebastián Rodríguez': { PRODUCTO: [], SERVICIO: ['GLOBAL PARTNERS'] },
        'Dorca Núñez': { PRODUCTO: [], SERVICIO: ['RECICLAJE ECOTRANS', 'RECYCLING'] },
        'José Cárdenas': { PRODUCTO: [], SERVICIO: ['BUREAU VERITAS'] },
        'Matías Espinoza': { PRODUCTO: ['TUBIX', 'OFIGRAPH', 'MANANTIAL', 'DYFAR', 'RECOMIN', 'PROSEV', 'LET RIVEROS'], SERVICIO: [] },
        'Daniel Tamayo': { PRODUCTO: ['TOTAL CHILE', 'FILTER', 'ARTEMETALICA', 'RCR', 'SALFA'], SERVICIO: [] },
        'Adrián Paredes': { PRODUCTO: ['APRO', 'PRISA', 'SEGURYCEL', 'SKAVA', 'LUKSIC', 'APEX', 'MAESTRANZA SAN MIGUEL'], SERVICIO: [] },
        'Víctor González': { PRODUCTO: ['NORMET', 'ADASME', 'BCM SERVICIOS', 'ROBOCON'], SERVICIO: [] }
    },
    // Lista de todos los proveedores con su tipo
    proveedores: {}
};

// Cargar configuración guardada o usar valores por defecto
let configuracion = cargarConfiguracion();

async function cargarConfiguracion() {
    try {
        const config = await cargarConfiguracionEvaluacion();
        if (config) {
            return {
                ...configuracionDefault,
                ...config,
                asignacionProveedores: await cargarAsignaciones(),
                proveedores: await cargarProveedores()
            };
        }
    } catch (e) {
        console.error('Error al cargar configuración desde Supabase:', e);
    }
    return configuracionDefault;
}

async function guardarConfiguracion() {
    try {
        // Guardar configuración de evaluación
        await guardarConfiguracionEvaluacion({
            titulo: configuracion.titulo,
            descripcion: configuracion.descripcion,
            objetivo: configuracion.objetivo,
            itemsProducto: configuracion.itemsProducto,
            itemsServicio: configuracion.itemsServicio
        });
        
        // Guardar asignaciones
        if (configuracion.asignacionProveedores) {
            await guardarAsignaciones(configuracion.asignacionProveedores);
        }
        
        mostrarMensaje('✅ Configuración guardada exitosamente en la base de datos. Redirigiendo al formulario...');
        
        // Redirigir al formulario después de 1 segundo
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        mostrarMensaje('❌ Error al guardar la configuración. Por favor, intente nuevamente.');
    }
}

function mostrarMensaje(mensaje) {
    const div = document.getElementById('mensajeGuardado');
    div.textContent = mensaje;
    div.style.display = 'block';
    setTimeout(() => {
        div.style.display = 'none';
    }, 3000);
}

// Inicializar cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

// Función para restaurar todos los datos por defecto (fuerza la restauración completa)
async function restaurarDatosPorDefecto() {
    if (!confirm('⚠️ ¿Está seguro de restaurar todos los datos por defecto?\n\nEsto eliminará todos los evaluadores, proveedores y asignaciones actuales y los reemplazará con los valores por defecto.\n\nEsta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        console.log('Restaurando datos por defecto en Supabase...');
        
        // 1. Marcar todos los evaluadores existentes como inactivos
        const evaluadoresExistentes = await cargarEvaluadores();
        for (const evaluador of evaluadoresExistentes) {
            try {
                await eliminarEvaluador(evaluador);
            } catch (error) {
                console.error(`Error al eliminar evaluador ${evaluador}:`, error);
            }
        }
        
        // 2. Marcar todos los proveedores existentes como inactivos
        const proveedoresExistentes = await cargarProveedores();
        for (const nombreProveedor of Object.keys(proveedoresExistentes)) {
            try {
                await eliminarProveedor(nombreProveedor);
            } catch (error) {
                console.error(`Error al eliminar proveedor ${nombreProveedor}:`, error);
            }
        }
        
        // 3. Crear todos los evaluadores por defecto
        const evaluadores = Object.keys(configuracionDefault.asignacionProveedores);
        console.log(`📝 Total de evaluadores a crear: ${evaluadores.length}`);
        
        let evaluadoresCreados = 0;
        for (const evaluador of evaluadores) {
            try {
                await crearEvaluador(evaluador);
                evaluadoresCreados++;
                console.log(`✅ Evaluador ${evaluadoresCreados}/${evaluadores.length}: ${evaluador}`);
                // Pequeña pausa para evitar problemas de concurrencia
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
                console.error(`❌ Error al crear evaluador ${evaluador}:`, error);
                // Continuar con el siguiente aunque falle uno
            }
        }
        console.log(`✅ Total evaluadores procesados: ${evaluadoresCreados}/${evaluadores.length}`);
        
        // 4. Crear todos los proveedores por defecto (extraer de las asignaciones)
        const proveedoresMap = new Map(); // Usar Map para evitar duplicados
        Object.values(configuracionDefault.asignacionProveedores).forEach(asignacion => {
            asignacion.PRODUCTO.forEach(p => {
                if (!proveedoresMap.has(p)) {
                    proveedoresMap.set(p, 'PRODUCTO');
                }
            });
            asignacion.SERVICIO.forEach(p => {
                if (!proveedoresMap.has(p)) {
                    proveedoresMap.set(p, 'SERVICIO');
                }
            });
        });
        
        console.log(`📝 Total de proveedores a crear: ${proveedoresMap.size}`);
        
        let proveedoresCreados = 0;
        for (const [nombre, tipo] of proveedoresMap) {
            try {
                await crearProveedor(nombre, tipo);
                proveedoresCreados++;
                console.log(`✅ Proveedor ${proveedoresCreados}/${proveedoresMap.size}: ${nombre} (${tipo})`);
                // Pequeña pausa para evitar problemas de concurrencia
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
                console.error(`❌ Error al crear proveedor ${nombre}:`, error);
                // Continuar con el siguiente aunque falle uno
            }
        }
        console.log(`✅ Total proveedores procesados: ${proveedoresCreados}/${proveedoresMap.size}`);
        
        // 5. Crear todas las asignaciones por defecto
        await guardarAsignaciones(configuracionDefault.asignacionProveedores);
        console.log('✅ Asignaciones creadas');
        
        // 6. Guardar la configuración por defecto
        await guardarConfiguracionEvaluacion({
            titulo: configuracionDefault.titulo,
            descripcion: configuracionDefault.descripcion,
            objetivo: configuracionDefault.objetivo,
            itemsProducto: configuracionDefault.itemsProducto,
            itemsServicio: configuracionDefault.itemsServicio
        });
        console.log('✅ Configuración guardada');
        
        console.log('✅ Datos por defecto restaurados correctamente');
        
        // Esperar un momento para que Supabase procese todos los cambios
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar que los datos se guardaron correctamente
        const evaluadoresVerificados = await cargarEvaluadores();
        const proveedoresVerificados = await cargarProveedores();
        const asignacionesVerificadas = await cargarAsignaciones();
        
        console.log('Verificación después de restaurar:');
        console.log('- Evaluadores:', evaluadoresVerificados.length);
        console.log('- Proveedores:', Object.keys(proveedoresVerificados).length);
        console.log('- Asignaciones:', Object.keys(asignacionesVerificadas).length);
        
        alert(`✅ Todos los datos han sido restaurados:\n- ${evaluadoresVerificados.length} evaluadores\n- ${Object.keys(proveedoresVerificados).length} proveedores\n- ${Object.keys(asignacionesVerificadas).length} evaluadores con asignaciones\n\nRecargando página...`);
        window.location.reload();
    } catch (error) {
        console.error('Error al restaurar datos por defecto:', error);
        alert('⚠️ Error al restaurar datos por defecto: ' + error.message);
    }
}

// Función para inicializar datos por defecto en Supabase (solo si está vacía)
async function inicializarDatosPorDefecto() {
    try {
        console.log('Verificando si necesitamos inicializar datos por defecto...');
        
        // Verificar si hay evaluadores en la base de datos
        const evaluadoresExistentes = await cargarEvaluadores();
        if (evaluadoresExistentes.length > 0) {
            console.log('Ya hay datos en la base de datos, no se inicializan datos por defecto.');
            return;
        }
        
        console.log('Inicializando datos por defecto en Supabase...');
        
        // 1. Crear todos los evaluadores
        const evaluadores = Object.keys(configuracionDefault.asignacionProveedores);
        for (const evaluador of evaluadores) {
            try {
                await crearEvaluador(evaluador);
                console.log(`✅ Evaluador creado: ${evaluador}`);
            } catch (error) {
                console.error(`Error al crear evaluador ${evaluador}:`, error);
            }
        }
        
        // 2. Crear todos los proveedores (extraer de las asignaciones)
        const proveedoresMap = new Map(); // Usar Map para evitar duplicados
        Object.values(configuracionDefault.asignacionProveedores).forEach(asignacion => {
            asignacion.PRODUCTO.forEach(p => {
                if (!proveedoresMap.has(p)) {
                    proveedoresMap.set(p, 'PRODUCTO');
                }
            });
            asignacion.SERVICIO.forEach(p => {
                if (!proveedoresMap.has(p)) {
                    proveedoresMap.set(p, 'SERVICIO');
                }
            });
        });
        
        for (const [nombre, tipo] of proveedoresMap) {
            try {
                await crearProveedor(nombre, tipo);
                console.log(`✅ Proveedor creado: ${nombre} (${tipo})`);
            } catch (error) {
                console.error(`Error al crear proveedor ${nombre}:`, error);
            }
        }
        
        // 3. Crear todas las asignaciones
        await guardarAsignaciones(configuracionDefault.asignacionProveedores);
        console.log('✅ Asignaciones creadas');
        
        // 4. Guardar la configuración
        await guardarConfiguracionEvaluacion({
            titulo: configuracionDefault.titulo,
            descripcion: configuracionDefault.descripcion,
            objetivo: configuracionDefault.objetivo,
            itemsProducto: configuracionDefault.itemsProducto,
            itemsServicio: configuracionDefault.itemsServicio
        });
        console.log('✅ Configuración guardada');
        
        console.log('✅ Datos por defecto inicializados correctamente');
        alert('✅ Datos iniciales cargados en la base de datos. Recargando página...');
        window.location.reload();
    } catch (error) {
        console.error('Error al inicializar datos por defecto:', error);
        alert('⚠️ Error al inicializar datos por defecto: ' + error.message);
    }
}

async function inicializar() {
    try {
        console.log('Iniciando panel de administración...');
        
        // Inicializar datos por defecto si es necesario
        await inicializarDatosPorDefecto();
        
        await inicializarFormulario();
        inicializarEventos();
        console.log('Panel de administración inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar panel de administración:', error);
        alert('Error al cargar el panel de administración: ' + error.message);
    }
}

async function inicializarFormulario() {
    // Cargar configuración desde Supabase
    try {
        configuracion = await cargarConfiguracion();
        console.log('Configuración cargada:', configuracion);
        console.log('Evaluadores en configuración:', Object.keys(configuracion.asignacionProveedores || {}).length);
        console.log('Proveedores en configuración:', Object.keys(configuracion.proveedores || {}).length);
    } catch (error) {
        console.error('Error al cargar configuración:', error);
        configuracion = { ...configuracionDefault };
    }
    
    // Cargar información general
    const tituloInput = document.getElementById('tituloPrincipal');
    const descripcionInput = document.getElementById('descripcionEvaluacion');
    const objetivoInput = document.getElementById('objetivoEvaluacion');
    
    if (tituloInput) tituloInput.value = configuracion.titulo || configuracionDefault.titulo;
    if (descripcionInput) descripcionInput.value = configuracion.descripcion || configuracionDefault.descripcion;
    if (objetivoInput) objetivoInput.value = configuracion.objetivo || configuracionDefault.objetivo;
    
    // Cargar ítems de PRODUCTO
    const itemsProducto = configuracion.itemsProducto || configuracionDefault.itemsProducto;
    const containerProducto = document.getElementById('itemsProductoContainer');
    if (containerProducto) {
        containerProducto.innerHTML = '';
        itemsProducto.forEach((item, index) => {
            containerProducto.appendChild(crearEditorItem(item, index, 'producto'));
        });
    }
    
    // Cargar ítems de SERVICIO
    const itemsServicio = configuracion.itemsServicio || configuracionDefault.itemsServicio;
    const containerServicio = document.getElementById('itemsServicioContainer');
    if (containerServicio) {
        containerServicio.innerHTML = '';
        itemsServicio.forEach((item, index) => {
            containerServicio.appendChild(crearEditorItem(item, index, 'servicio'));
        });
    }
    
    // Inicializar evaluadores, proveedores y asignaciones (async)
    await inicializarEvaluadores();
    await inicializarProveedores();
    await inicializarAsignaciones();
}

function crearEditorItem(item, index, tipo) {
    const div = document.createElement('div');
    div.className = 'item-editor';
    div.dataset.index = index;
    div.dataset.tipo = tipo;
    
    // Crear elementos usando createElement para evitar problemas de escape
    const contentDiv = document.createElement('div');
    contentDiv.className = 'item-editor-content';
    
    const nombreInput = document.createElement('input');
    nombreInput.type = 'text';
    nombreInput.className = 'item-nombre';
    nombreInput.value = item.nombre || '';
    nombreInput.placeholder = 'Nombre del ítem';
    
    const ponderacionDiv = document.createElement('div');
    ponderacionDiv.style.cssText = 'display: flex; gap: 10px; align-items: center; margin-top: 10px;';
    
    const label = document.createElement('label');
    label.textContent = 'Ponderación:';
    label.style.cssText = 'margin: 0; font-weight: 600;';
    
    const ponderacionInput = document.createElement('input');
    ponderacionInput.type = 'number';
    ponderacionInput.className = 'ponderacion-input';
    ponderacionInput.value = item.ponderacion || 0;
    ponderacionInput.min = 0;
    ponderacionInput.max = 100;
    ponderacionInput.placeholder = '%';
    
    const span = document.createElement('span');
    span.textContent = '%';
    span.style.fontWeight = '600';
    
    ponderacionDiv.appendChild(label);
    ponderacionDiv.appendChild(ponderacionInput);
    ponderacionDiv.appendChild(span);
    
    contentDiv.appendChild(nombreInput);
    contentDiv.appendChild(ponderacionDiv);
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'item-editor-actions';
    
    const btnEliminar = document.createElement('button');
    btnEliminar.type = 'button';
    btnEliminar.className = 'btn-remove';
    btnEliminar.textContent = '🗑️ Eliminar';
    btnEliminar.onclick = function() {
        eliminarItem(this);
    };
    
    actionsDiv.appendChild(btnEliminar);
    
    div.appendChild(contentDiv);
    div.appendChild(actionsDiv);
    
    return div;
}

// Función global para eliminar ítems
window.eliminarItem = function(btn) {
    if (confirm('¿Está seguro de eliminar este ítem?')) {
        const editor = btn.closest('.item-editor');
        const tipo = editor.dataset.tipo;
        const index = parseInt(editor.dataset.index);
        
        if (tipo === 'producto') {
            if (!configuracion.itemsProducto) configuracion.itemsProducto = [];
            configuracion.itemsProducto.splice(index, 1);
        } else {
            if (!configuracion.itemsServicio) configuracion.itemsServicio = [];
            configuracion.itemsServicio.splice(index, 1);
        }
        
        inicializarFormulario().catch(err => console.error('Error al inicializar formulario:', err));
    }
};

// Inicializar lista de evaluadores
async function inicializarEvaluadores() {
    const container = document.getElementById('evaluadoresList');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Cargar evaluadores desde Supabase
    let evaluadoresList = [];
    try {
        evaluadoresList = await cargarEvaluadores();
        console.log('✅ Evaluadores cargados desde Supabase (activos):', evaluadoresList.length, evaluadoresList);
        
        // Verificar directamente en Supabase todos los evaluadores (activos e inactivos)
        try {
            await waitForSupabase();
            const { data: todosEvaluadores, error } = await window.supabaseClient
                .from('evaluadores')
                .select('id, nombre, activo')
                .order('nombre');
            
            if (!error && todosEvaluadores) {
                console.log('📊 Todos los evaluadores en la base de datos:', todosEvaluadores.length);
                const activos = todosEvaluadores.filter(e => e.activo);
                const inactivos = todosEvaluadores.filter(e => !e.activo);
                console.log('📊 Evaluadores activos:', activos.length, activos.map(e => e.nombre));
                console.log('📊 Evaluadores inactivos:', inactivos.length, inactivos.map(e => e.nombre));
                
                // Si hay evaluadores inactivos, reactivarlos todos
                if (inactivos.length > 0) {
                    console.log('⚠️ Hay evaluadores inactivos, reactivándolos...');
                    let reactivados = 0;
                    for (const evaluador of inactivos) {
                        try {
                            const { error: updateError } = await window.supabaseClient
                                .from('evaluadores')
                                .update({ activo: true })
                                .eq('id', evaluador.id);
                            
                            if (!updateError) {
                                reactivados++;
                                console.log(`✅ Evaluador reactivado ${reactivados}/${inactivos.length}: ${evaluador.nombre}`);
                            } else {
                                console.error(`❌ Error al reactivar ${evaluador.nombre}:`, updateError);
                            }
                            // Pequeña pausa entre actualizaciones
                            await new Promise(resolve => setTimeout(resolve, 50));
                        } catch (err) {
                            console.error(`❌ Error al reactivar ${evaluador.nombre}:`, err);
                        }
                    }
                    console.log(`✅ Total reactivados: ${reactivados}/${inactivos.length}`);
                    
                    // Esperar un momento y recargar después de reactivar
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    evaluadoresList = await cargarEvaluadores();
                    console.log('✅ Evaluadores después de reactivar:', evaluadoresList.length, evaluadoresList);
                }
            }
        } catch (error) {
            console.error('Error al verificar evaluadores directamente:', error);
        }
        
        // Si hay menos evaluadores de los esperados, usar los valores por defecto
        if (evaluadoresList.length < Object.keys(configuracionDefault.asignacionProveedores).length) {
            console.log(`⚠️ Solo hay ${evaluadoresList.length} evaluadores activos, pero deberían ser ${Object.keys(configuracionDefault.asignacionProveedores).length}`);
            console.log('📋 Usando evaluadores de valores por defecto');
            evaluadoresList = Object.keys(configuracionDefault.asignacionProveedores).sort();
            // Asegurar que las asignaciones usen los valores por defecto
            configuracion.asignacionProveedores = { ...configuracionDefault.asignacionProveedores };
        } else {
            // Actualizar configuracion con los evaluadores de Supabase
            if (!configuracion.asignacionProveedores) {
                configuracion.asignacionProveedores = { ...configuracionDefault.asignacionProveedores };
            }
            evaluadoresList.forEach(evaluador => {
                if (!configuracion.asignacionProveedores[evaluador]) {
                    // Si existe en los valores por defecto, usarlo
                    if (configuracionDefault.asignacionProveedores[evaluador]) {
                        configuracion.asignacionProveedores[evaluador] = { ...configuracionDefault.asignacionProveedores[evaluador] };
                    } else {
                        configuracion.asignacionProveedores[evaluador] = { PRODUCTO: [], SERVICIO: [] };
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error al cargar evaluadores:', error);
        // Si falla, usar los de las asignaciones por defecto
        evaluadoresList = Object.keys(configuracionDefault.asignacionProveedores).sort();
        configuracion.asignacionProveedores = { ...configuracionDefault.asignacionProveedores };
    }
    
    // Si no hay evaluadores en Supabase, usar los de las asignaciones por defecto
    if (evaluadoresList.length === 0) {
        evaluadoresList = Object.keys(configuracionDefault.asignacionProveedores).sort();
        configuracion.asignacionProveedores = { ...configuracionDefault.asignacionProveedores };
        console.log('⚠️ No hay evaluadores en Supabase, usando valores por defecto:', evaluadoresList.length);
    }
    
    const evaluadores = evaluadoresList;
    
    console.log('📋 Evaluadores finales a mostrar:', evaluadores.length);
    
    if (evaluadores.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay evaluadores registrados. Agrega uno para comenzar.</p>';
        return;
    }
    
    console.log('🎨 Renderizando evaluadores en la interfaz...');
    evaluadores.forEach(evaluador => {
        const card = document.createElement('div');
        card.className = 'evaluador-card';
        
        const nombre = document.createElement('div');
        nombre.className = 'evaluador-nombre';
        nombre.textContent = evaluador;
        
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.className = 'btn-remove-small';
        btnEliminar.textContent = '🗑️';
        btnEliminar.title = 'Eliminar evaluador';
        btnEliminar.onclick = function() {
            eliminarEvaluadorLocal(evaluador);
        };
        
        card.appendChild(nombre);
        card.appendChild(btnEliminar);
        container.appendChild(card);
    });
}

// Eliminar evaluador
async function eliminarEvaluadorLocal(nombre) {
    if (confirm(`¿Está seguro de eliminar el evaluador "${nombre}"? Esto también eliminará todas sus asignaciones.`)) {
        try {
            await eliminarEvaluador(nombre);
            const asignacion = configuracion.asignacionProveedores || {};
            delete asignacion[nombre];
            configuracion.asignacionProveedores = asignacion;
            inicializarEvaluadores();
            await inicializarAsignaciones();
        } catch (error) {
            console.error('Error al eliminar evaluador:', error);
            alert('❌ Error al eliminar el evaluador.');
        }
    }
}

// Inicializar lista de proveedores
async function inicializarProveedores() {
    // Cargar proveedores desde Supabase
    try {
        let proveedores = await cargarProveedores();
        console.log('✅ Proveedores cargados desde Supabase:', Object.keys(proveedores).length, Object.keys(proveedores));
        
        // Si no hay proveedores en Supabase, crearlos desde las asignaciones por defecto
        if (Object.keys(proveedores).length === 0) {
            console.log('⚠️ No hay proveedores en Supabase, creándolos desde asignaciones por defecto...');
            
            // Usar siempre los valores por defecto para extraer los proveedores
            const asignacion = configuracionDefault.asignacionProveedores;
            
            console.log('📋 Asignaciones por defecto:', Object.keys(asignacion).length, 'evaluadores');
            
            // Recopilar todos los proveedores únicos de las asignaciones por defecto
            const proveedoresMap = new Map();
            Object.keys(asignacion).forEach(evaluador => {
                ['PRODUCTO', 'SERVICIO'].forEach(tipo => {
                    if (asignacion[evaluador] && asignacion[evaluador][tipo] && Array.isArray(asignacion[evaluador][tipo])) {
                        asignacion[evaluador][tipo].forEach(proveedor => {
                            if (proveedor && !proveedoresMap.has(proveedor)) {
                                proveedoresMap.set(proveedor, tipo);
                            }
                        });
                    }
                });
            });
            
            console.log(`📝 Total de proveedores únicos encontrados: ${proveedoresMap.size}`);
            console.log('📋 Lista de proveedores:', Array.from(proveedoresMap.entries()));
            
            if (proveedoresMap.size === 0) {
                console.error('❌ No se encontraron proveedores en las asignaciones por defecto');
            } else {
                // Crear cada proveedor en Supabase
                let proveedoresCreados = 0;
                for (const [nombre, tipo] of proveedoresMap) {
                    try {
                        await crearProveedor(nombre, tipo);
                        proveedores[nombre] = tipo;
                        proveedoresCreados++;
                        console.log(`✅ Proveedor ${proveedoresCreados}/${proveedoresMap.size} creado: ${nombre} (${tipo})`);
                        // Pequeña pausa para evitar problemas de concurrencia
                        await new Promise(resolve => setTimeout(resolve, 50));
                    } catch (error) {
                        console.error(`❌ Error al crear proveedor ${nombre}:`, error);
                        // Continuar con el siguiente aunque falle uno
                    }
                }
                console.log(`✅ Total proveedores creados: ${proveedoresCreados}/${proveedoresMap.size}`);
                
                // Después de crear los proveedores, guardar las asignaciones por defecto
                console.log('💾 Guardando asignaciones por defecto en Supabase...');
                try {
                    await guardarAsignaciones(configuracionDefault.asignacionProveedores);
                    console.log('✅ Asignaciones guardadas correctamente');
                    // Actualizar la configuración con las asignaciones por defecto
                    configuracion.asignacionProveedores = { ...configuracionDefault.asignacionProveedores };
                } catch (error) {
                    console.error('❌ Error al guardar asignaciones:', error);
                }
            }
        }
        
        configuracion.proveedores = proveedores;
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
        // Construir lista de proveedores desde asignaciones si no existe
        if (!configuracion.proveedores) {
            configuracion.proveedores = {};
        }
        
        const asignacion = configuracion.asignacionProveedores || configuracionDefault.asignacionProveedores;
        
        // Recopilar todos los proveedores de las asignaciones (solo si no están ya en la lista)
        Object.keys(asignacion).forEach(evaluador => {
            ['PRODUCTO', 'SERVICIO'].forEach(tipo => {
                if (asignacion[evaluador] && asignacion[evaluador][tipo]) {
                    asignacion[evaluador][tipo].forEach(proveedor => {
                        if (!configuracion.proveedores[proveedor]) {
                            configuracion.proveedores[proveedor] = tipo;
                        }
                    });
                }
            });
        });
        console.log('⚠️ Proveedores construidos desde asignaciones (fallback):', Object.keys(configuracion.proveedores).length);
    }
    
    // Mostrar lista de proveedores
    const container = document.getElementById('proveedoresList');
    if (container) {
        container.innerHTML = '';
        const proveedores = Object.keys(configuracion.proveedores).sort();
        
        if (proveedores.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay proveedores registrados. Agrega uno para comenzar.</p>';
            return;
        }
        
        proveedores.forEach(proveedor => {
            const card = document.createElement('div');
            card.className = 'proveedor-card';
            card.style.borderLeftColor = configuracion.proveedores[proveedor] === 'PRODUCTO' ? '#4A90E2' : '#50C878';
            
            const info = document.createElement('div');
            info.className = 'proveedor-info';
            
            const nombre = document.createElement('div');
            nombre.className = 'proveedor-nombre';
            nombre.textContent = proveedor;
            
            const tipo = document.createElement('div');
            tipo.className = 'proveedor-tipo';
            tipo.textContent = configuracion.proveedores[proveedor];
            tipo.style.color = configuracion.proveedores[proveedor] === 'PRODUCTO' ? '#4A90E2' : '#50C878';
            
            info.appendChild(nombre);
            info.appendChild(tipo);
            
            const btnEliminar = document.createElement('button');
            btnEliminar.type = 'button';
            btnEliminar.className = 'btn-remove-small';
            btnEliminar.textContent = '🗑️';
            btnEliminar.title = 'Eliminar proveedor';
            btnEliminar.onclick = async function() {
                await eliminarProveedorLocal(proveedor);
            };
            
            card.appendChild(info);
            card.appendChild(btnEliminar);
            container.appendChild(card);
        });
    }
}

// Eliminar proveedor
async function eliminarProveedorLocal(nombre) {
    if (confirm(`¿Está seguro de eliminar el proveedor "${nombre}"? Esto también lo eliminará de todas las asignaciones.`)) {
        try {
            await eliminarProveedor(nombre);
            delete configuracion.proveedores[nombre];
            
            // Eliminar de todas las asignaciones
            const asignacion = configuracion.asignacionProveedores || {};
            Object.keys(asignacion).forEach(evaluador => {
                ['PRODUCTO', 'SERVICIO'].forEach(tipo => {
                    if (asignacion[evaluador][tipo]) {
                        const index = asignacion[evaluador][tipo].indexOf(nombre);
                        if (index > -1) {
                            asignacion[evaluador][tipo].splice(index, 1);
                        }
                    }
                });
            });
            
            await inicializarProveedores();
            await inicializarAsignaciones();
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
            alert('❌ Error al eliminar el proveedor.');
        }
    }
}

// Inicializar asignaciones
async function inicializarAsignaciones() {
    const container = document.getElementById('asignacionesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Cargar asignaciones desde Supabase
    let asignacion = {};
    try {
        asignacion = await cargarAsignaciones();
        console.log('✅ Asignaciones cargadas desde Supabase:', Object.keys(asignacion).length, 'evaluadores');
        console.log('📋 Detalle de asignaciones:', asignacion);
        
        // Verificar si las asignaciones están vacías (sin proveedores asignados)
        let asignacionesVacias = true;
        if (Object.keys(asignacion).length > 0) {
            // Verificar si al menos un evaluador tiene proveedores asignados
            for (const evaluador of Object.keys(asignacion)) {
                const productos = asignacion[evaluador]?.PRODUCTO || [];
                const servicios = asignacion[evaluador]?.SERVICIO || [];
                if (productos.length > 0 || servicios.length > 0) {
                    asignacionesVacias = false;
                    break;
                }
            }
        }
        
        // Si las asignaciones están vacías o no existen, usar y guardar las por defecto
        if (Object.keys(asignacion).length === 0 || asignacionesVacias) {
            console.log('⚠️ Asignaciones vacías o no existen, guardando asignaciones por defecto...');
            asignacion = configuracionDefault.asignacionProveedores;
            
            // Guardar las asignaciones por defecto en Supabase
            try {
                await guardarAsignaciones(asignacion);
                console.log('✅ Asignaciones por defecto guardadas en Supabase');
            } catch (error) {
                console.error('❌ Error al guardar asignaciones por defecto:', error);
            }
            
            configuracion.asignacionProveedores = asignacion;
        } else {
            // Actualizar configuracion con las asignaciones de Supabase
            configuracion.asignacionProveedores = asignacion;
        }
    } catch (error) {
        console.error('Error al cargar asignaciones:', error);
        // Si falla, usar y guardar las de la configuración por defecto
        asignacion = configuracionDefault.asignacionProveedores;
        configuracion.asignacionProveedores = asignacion;
        
        // Intentar guardar las asignaciones por defecto
        try {
            await guardarAsignaciones(asignacion);
            console.log('✅ Asignaciones por defecto guardadas en Supabase (fallback)');
        } catch (error) {
            console.error('❌ Error al guardar asignaciones por defecto (fallback):', error);
        }
    }
    
    // Si no hay asignaciones, usar las por defecto
    if (Object.keys(asignacion).length === 0) {
        asignacion = configuracionDefault.asignacionProveedores;
        configuracion.asignacionProveedores = asignacion;
        console.log('⚠️ No hay asignaciones, usando configuración por defecto:', Object.keys(asignacion).length);
    }
    
    console.log('📋 Asignaciones finales a mostrar:', Object.keys(asignacion).length, 'evaluadores');
    
    const evaluadores = Object.keys(asignacion).sort();
    const proveedores = configuracion.proveedores || {};
    
    if (evaluadores.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay evaluadores. Agrega evaluadores primero.</p>';
        return;
    }
    
    evaluadores.forEach(evaluador => {
        const card = document.createElement('div');
        card.className = 'asignacion-card';
        
        const header = document.createElement('div');
        header.className = 'asignacion-header';
        
        const titulo = document.createElement('h3');
        titulo.textContent = evaluador;
        titulo.className = 'asignacion-titulo';
        
        header.appendChild(titulo);
        
        const content = document.createElement('div');
        content.className = 'asignacion-content';
        
        ['PRODUCTO', 'SERVICIO'].forEach(tipo => {
            const tipoSection = document.createElement('div');
            tipoSection.className = 'tipo-section';
            tipoSection.style.borderLeftColor = tipo === 'PRODUCTO' ? '#4A90E2' : '#50C878';
            
            const tipoHeader = document.createElement('div');
            tipoHeader.className = 'tipo-header';
            
            const tipoLabel = document.createElement('label');
            tipoLabel.textContent = tipo === 'PRODUCTO' ? '🟦 PRODUCTO' : '🟩 SERVICIO';
            tipoLabel.className = 'tipo-label';
            tipoLabel.style.color = tipo === 'PRODUCTO' ? '#4A90E2' : '#50C878';
            
            tipoHeader.appendChild(tipoLabel);
            
            const select = document.createElement('select');
            select.multiple = true;
            select.className = 'asignacion-select';
            select.id = `asignacion_${evaluador}_${tipo}`;
            select.dataset.evaluador = evaluador;
            select.dataset.tipo = tipo;
            select.title = 'Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples proveedores';
            
            // Agregar proveedores del tipo correspondiente
            const proveedoresTipo = Object.keys(proveedores).filter(p => proveedores[p] === tipo).sort();
            
            if (proveedoresTipo.length === 0) {
                const option = document.createElement('option');
                option.disabled = true;
                option.textContent = `No hay proveedores de tipo ${tipo}`;
                select.appendChild(option);
            } else {
                proveedoresTipo.forEach(proveedor => {
                    const option = document.createElement('option');
                    option.value = proveedor;
                    option.textContent = proveedor;
                    if (asignacion[evaluador] && asignacion[evaluador][tipo] && asignacion[evaluador][tipo].includes(proveedor)) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            }
            
            tipoSection.appendChild(tipoHeader);
            tipoSection.appendChild(select);
            content.appendChild(tipoSection);
        });
        
        card.appendChild(header);
        card.appendChild(content);
        container.appendChild(card);
    });
}

function inicializarEventos() {
    console.log('Inicializando eventos...');
    
    // Guardar configuración
    const btnGuardar = document.getElementById('guardarConfigBtn');
    if (btnGuardar) {
        console.log('Botón guardar encontrado');
        btnGuardar.onclick = async function() {
            console.log('Guardando configuración...');
            await guardarConfiguracionCompleta();
        };
    } else {
        console.error('Botón guardar NO encontrado');
    }
    
    // Agregar ítem PRODUCTO
    const btnAgregarProducto = document.getElementById('agregarItemProducto');
    if (btnAgregarProducto) {
        console.log('Botón agregar producto encontrado');
        btnAgregarProducto.onclick = function() {
            console.log('Agregando ítem de producto...');
            if (!configuracion.itemsProducto) configuracion.itemsProducto = [];
            configuracion.itemsProducto.push({ nombre: '', ponderacion: 0 });
            inicializarFormulario().catch(err => console.error('Error:', err));
        };
    } else {
        console.error('Botón agregar producto NO encontrado');
    }
    
    // Agregar ítem SERVICIO
    const btnAgregarServicio = document.getElementById('agregarItemServicio');
    if (btnAgregarServicio) {
        console.log('Botón agregar servicio encontrado');
        btnAgregarServicio.onclick = function() {
            console.log('Agregando ítem de servicio...');
            if (!configuracion.itemsServicio) configuracion.itemsServicio = [];
            configuracion.itemsServicio.push({ nombre: '', ponderacion: 0 });
            inicializarFormulario().catch(err => console.error('Error:', err));
        };
    } else {
        console.error('Botón agregar servicio NO encontrado');
    }
    
    // Agregar evaluador
    const btnAgregarEvaluador = document.getElementById('agregarEvaluadorBtn');
    if (btnAgregarEvaluador) {
        btnAgregarEvaluador.onclick = async function() {
            const nombre = document.getElementById('nuevoEvaluador').value.trim();
            
            if (!nombre) {
                alert('Por favor, ingrese un nombre para el evaluador.');
                return;
            }
            
            if (!configuracion.asignacionProveedores) {
                configuracion.asignacionProveedores = {};
            }
            
            if (configuracion.asignacionProveedores[nombre]) {
                alert('Este evaluador ya existe.');
                return;
            }
            
            // Crear evaluador en Supabase
            try {
                await crearEvaluador(nombre);
                configuracion.asignacionProveedores[nombre] = { PRODUCTO: [], SERVICIO: [] };
                document.getElementById('nuevoEvaluador').value = '';
                await inicializarEvaluadores();
                await inicializarAsignaciones();
            } catch (error) {
                console.error('Error al crear evaluador:', error);
                alert('❌ Error al crear el evaluador. Por favor, intente nuevamente.');
            }
        };
    }
    
    // Agregar proveedor
    const btnAgregarProveedor = document.getElementById('agregarProveedorBtn');
    if (btnAgregarProveedor) {
        btnAgregarProveedor.onclick = async function() {
            const nombre = document.getElementById('nuevoProveedor').value.trim();
            const tipo = document.getElementById('tipoNuevoProveedor').value;
            
            if (!nombre) {
                alert('Por favor, ingrese un nombre para el proveedor.');
                return;
            }
            
            if (!configuracion.proveedores) {
                configuracion.proveedores = {};
            }
            
            if (configuracion.proveedores[nombre]) {
                alert('Este proveedor ya existe.');
                return;
            }
            
            // Crear proveedor en Supabase
            try {
                await crearProveedor(nombre, tipo);
                configuracion.proveedores[nombre] = tipo;
                document.getElementById('nuevoProveedor').value = '';
                await inicializarProveedores();
                await inicializarAsignaciones();
            } catch (error) {
                console.error('Error al crear proveedor:', error);
                alert('❌ Error al crear el proveedor. Por favor, intente nuevamente.');
            }
        };
    }
    
    // Restaurar datos por defecto
    const btnRestaurarDatos = document.getElementById('restaurarDatosBtn');
    if (btnRestaurarDatos) {
        btnRestaurarDatos.onclick = async function() {
            await restaurarDatosPorDefecto();
        };
    } else {
        console.error('Botón restaurar datos NO encontrado');
    }
    
    // Cerrar sesión
    const btnCerrarSesion = document.getElementById('cerrarSesionBtn');
    if (btnCerrarSesion) {
        btnCerrarSesion.onclick = function() {
            if (confirm('¿Está seguro de cerrar sesión?')) {
                localStorage.removeItem('adminAuthenticated');
                localStorage.removeItem('adminAuthTime');
                window.location.href = 'login-admin.html';
            }
        };
    }
    
    // Volver al formulario
    const btnVolver = document.getElementById('volverBtn');
    if (btnVolver) {
        console.log('Botón volver encontrado');
        btnVolver.onclick = function() {
            console.log('Volviendo al formulario...');
            window.location.href = 'index.html';
        };
    } else {
        console.error('Botón volver NO encontrado');
    }
    
    console.log('Eventos inicializados');
}

async function guardarConfiguracionCompleta() {
    // Guardar información general
    configuracion.titulo = document.getElementById('tituloPrincipal').value.trim() || configuracionDefault.titulo;
    configuracion.descripcion = document.getElementById('descripcionEvaluacion').value.trim() || configuracionDefault.descripcion;
    configuracion.objetivo = document.getElementById('objetivoEvaluacion').value.trim() || configuracionDefault.objetivo;
    
    // Guardar ítems de PRODUCTO
    configuracion.itemsProducto = [];
    document.querySelectorAll('#itemsProductoContainer .item-editor').forEach(editor => {
        const nombre = editor.querySelector('.item-nombre').value.trim();
        const ponderacion = parseInt(editor.querySelector('.ponderacion-input').value) || 0;
        if (nombre) {
            configuracion.itemsProducto.push({ nombre, ponderacion });
        }
    });
    
    // Guardar ítems de SERVICIO
    configuracion.itemsServicio = [];
    document.querySelectorAll('#itemsServicioContainer .item-editor').forEach(editor => {
        const nombre = editor.querySelector('.item-nombre').value.trim();
        const ponderacion = parseInt(editor.querySelector('.ponderacion-input').value) || 0;
        if (nombre) {
            configuracion.itemsServicio.push({ nombre, ponderacion });
        }
    });
    
    // Guardar asignaciones de proveedores
    if (!configuracion.asignacionProveedores) {
        configuracion.asignacionProveedores = {};
    }
    
    // Recopilar todas las asignaciones desde los selects
    document.querySelectorAll('select[id^="asignacion_"]').forEach(select => {
        const evaluador = select.dataset.evaluador;
        const tipo = select.dataset.tipo;
        
        if (!configuracion.asignacionProveedores[evaluador]) {
            configuracion.asignacionProveedores[evaluador] = { PRODUCTO: [], SERVICIO: [] };
        }
        
        // Obtener proveedores seleccionados
        const seleccionados = Array.from(select.selectedOptions).map(opt => opt.value);
        configuracion.asignacionProveedores[evaluador][tipo] = seleccionados;
    });
    
    // Validar que las ponderaciones sumen 100%
    const sumaProducto = configuracion.itemsProducto.reduce((sum, item) => sum + item.ponderacion, 0);
    const sumaServicio = configuracion.itemsServicio.reduce((sum, item) => sum + item.ponderacion, 0);
    
    if (sumaProducto !== 100 && configuracion.itemsProducto.length > 0) {
        alert(`⚠️ Advertencia: Las ponderaciones de PRODUCTO suman ${sumaProducto}% (deberían sumar 100%)`);
    }
    
    if (sumaServicio !== 100 && configuracion.itemsServicio.length > 0) {
        alert(`⚠️ Advertencia: Las ponderaciones de SERVICIO suman ${sumaServicio}% (deberían sumar 100%)`);
    }
    
    await guardarConfiguracion();
}


