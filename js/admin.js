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
        // Cargar todo en paralelo para mayor velocidad
        const [config, asignaciones, proveedores] = await Promise.all([
            cargarConfiguracionEvaluacion(),
            cargarAsignaciones(),
            cargarProveedores()
        ]);
        
        if (config) {
            return {
                ...configuracionDefault,
                ...config,
                asignacionProveedores: asignaciones || configuracionDefault.asignacionProveedores,
                proveedores: proveedores || {}
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
        setTimeout(function () {
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

// Función para inicializar datos por defecto en Supabase (solo si está vacía)
async function inicializarDatosPorDefecto() {
    try {
        // Verificar rápidamente si hay evaluadores
        const evaluadoresExistentes = await cargarEvaluadores();
        if (evaluadoresExistentes.length > 0) {
            return; // Ya hay datos, no hacer nada
        }

        console.log('Inicializando datos por defecto...');

        // 1. Crear todos los evaluadores en paralelo (más rápido)
        const evaluadores = Object.keys(configuracionDefault.asignacionProveedores);
        await Promise.all(
            evaluadores.map(evaluador => 
                crearEvaluador(evaluador).catch(err => 
                    console.error(`Error al crear evaluador ${evaluador}:`, err)
                )
            )
        );

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

        // 2. Crear todos los proveedores en paralelo (más rápido)
        await Promise.all(
            Array.from(proveedoresMap.entries()).map(([nombre, tipo]) =>
                crearProveedor(nombre, tipo).catch(err =>
                    console.error(`Error al crear proveedor ${nombre}:`, err)
                )
            )
        );

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

        // Inicializar eventos primero (no bloquea)
        inicializarEventos();
        
        // Cargar formulario inmediatamente (sin esperar datos por defecto)
        await inicializarFormulario();
        
        // Verificar datos por defecto en segundo plano (no bloquea la UI)
        inicializarDatosPorDefecto().catch(err => {
            console.error('Error al inicializar datos por defecto:', err);
        });
        
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

    // Inicializar evaluadores, proveedores y asignaciones en paralelo para mayor velocidad
    await Promise.all([
        inicializarEvaluadores(),
        inicializarProveedores(),
        inicializarAsignaciones()
    ]);
}

function crearEditorItem(item, index, tipo) {
    const div = document.createElement('div');
    div.className = 'item-editor';
    div.dataset.index = index;
    div.dataset.tipo = tipo;

    // Contenido principal (Input de nombre)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'item-editor-content';

    const nombreInput = document.createElement('input');
    nombreInput.type = 'text';
    nombreInput.className = 'item-nombre';
    nombreInput.value = item.nombre || '';
    nombreInput.placeholder = 'Describe el ítem de evaluación...';

    // Auto-save nombre
    nombreInput.onchange = async function () {
        item.nombre = this.value;
        console.log(`📝 Guardando cambio en ítem ${tipo}...`);
        try {
            await guardarConfiguracionEvaluacion(configuracion);
        } catch (e) {
            console.error('Error al guardar item:', e);
        }
    };

    contentDiv.appendChild(nombreInput);

    // Acciones (Ponderación + Eliminar)
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'item-editor-actions';
    actionsDiv.style.display = 'flex';
    actionsDiv.style.alignItems = 'center';
    actionsDiv.style.gap = '15px';

    // Contenedor Ponderación
    const ponderacionContainer = document.createElement('div');
    ponderacionContainer.className = 'ponderacion-container';

    const labelPond = document.createElement('span');
    labelPond.className = 'ponderacion-label';
    labelPond.textContent = 'Ponderación:';

    const ponderacionInput = document.createElement('input');
    ponderacionInput.type = 'number';
    ponderacionInput.className = 'ponderacion-input';
    ponderacionInput.value = item.ponderacion || 0;
    ponderacionInput.min = 0;
    ponderacionInput.max = 100;

    // Auto-save ponderación
    ponderacionInput.onchange = async function () {
        item.ponderacion = parseInt(this.value) || 0;
        console.log(`⚖️ Guardando ponderación en ítem ${tipo}...`);
        try {
            await guardarConfiguracionEvaluacion(configuracion);
        } catch (e) {
            console.error('Error al guardar ponderación:', e);
        }
    };

    const spanPorcentaje = document.createElement('span');
    spanPorcentaje.textContent = '%';
    spanPorcentaje.style.color = '#666';
    spanPorcentaje.style.fontWeight = 'bold';

    ponderacionContainer.appendChild(labelPond);
    ponderacionContainer.appendChild(ponderacionInput);
    ponderacionContainer.appendChild(spanPorcentaje);

    // Botón Eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.type = 'button';
    btnEliminar.className = 'btn-remove';
    btnEliminar.innerHTML = '🗑️ Eliminar';
    btnEliminar.onclick = async function () {
        if (confirm('¿Eliminar este ítem? Se guardará automáticamente.')) {
            // Agregar clase de animación de salida
            div.classList.add('removing');
            
            // Esperar a que termine la animación antes de eliminar
            setTimeout(async () => {
                // Eliminar del array correspondiente
                if (tipo === 'producto') {
                    configuracion.itemsProducto.splice(index, 1);
                } else if (tipo === 'servicio') {
                    configuracion.itemsServicio.splice(index, 1);
                }

                // Recargar solo los items de este tipo (más rápido que recargar todo)
                const container = tipo === 'producto' 
                    ? document.getElementById('itemsProductoContainer')
                    : document.getElementById('itemsServicioContainer');
                
                if (container) {
                    container.innerHTML = '';
                    const items = tipo === 'producto' 
                        ? configuracion.itemsProducto 
                        : configuracion.itemsServicio;
                    
                    items.forEach((item, idx) => {
                        container.appendChild(crearEditorItem(item, idx, tipo));
                    });
                }

                // Auto-guardar
                try {
                    console.log(`🗑️ Eliminando ítem ${tipo}...`);
                    await guardarConfiguracionEvaluacion(configuracion);
                } catch (e) {
                    console.error('Error al eliminar/guardar item:', e);
                }
            }, 150); // Duración de la animación
        }
    };

    actionsDiv.appendChild(ponderacionContainer);
    actionsDiv.appendChild(btnEliminar);

    div.appendChild(contentDiv);
    div.appendChild(actionsDiv);

    return div;
}


// Función global para eliminar ítems
window.eliminarItem = function (btn) {
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

    // Cargar evaluadores desde Supabase (sin verificaciones innecesarias)
    let evaluadoresList = [];
    try {
        evaluadoresList = await cargarEvaluadores();
        console.log('✅ Evaluadores cargados:', evaluadoresList.length);
        
        // Si no hay evaluadores, usar los de las asignaciones
        if (evaluadoresList.length === 0 && configuracion.asignacionProveedores) {
            evaluadoresList = Object.keys(configuracion.asignacionProveedores).sort();
        }
    } catch (error) {
        console.error('Error al cargar evaluadores:', error);
        // Si falla, usar los de las asignaciones
        if (configuracion.asignacionProveedores) {
            evaluadoresList = Object.keys(configuracion.asignacionProveedores).sort();
        } else {
            evaluadoresList = Object.keys(configuracionDefault.asignacionProveedores).sort();
        }
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
        btnEliminar.onclick = function () {
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
            btnEliminar.onclick = async function () {
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
        btnGuardar.onclick = async function () {
            console.log('Guardando configuración...');
            await guardarConfiguracionCompleta();
        };
    } else {
        console.log('Nota: Botón guardarConfigBtn no encontrado (posiblemente usando guardarConfigBtnSidebar)');
    }

    // Agregar ítem PRODUCTO
    const btnAgregarProducto = document.getElementById('agregarItemProducto');
    if (btnAgregarProducto) {
        console.log('Botón agregar producto encontrado');
        btnAgregarProducto.onclick = async function () {
            console.log('Agregando ítem de producto...');
            if (!configuracion.itemsProducto) configuracion.itemsProducto = [];
            const nuevoItem = { nombre: '', ponderacion: 0 };
            configuracion.itemsProducto.push(nuevoItem);

            // Agregar inmediatamente al DOM sin recargar todo
            const container = document.getElementById('itemsProductoContainer');
            if (container) {
                const nuevoIndex = configuracion.itemsProducto.length - 1;
                const nuevoElemento = crearEditorItem(nuevoItem, nuevoIndex, 'producto');
                container.appendChild(nuevoElemento);
                
                // Hacer scroll al nuevo elemento
                nuevoElemento.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
                // Enfocar el input del nombre
                setTimeout(() => {
                    const inputNombre = nuevoElemento.querySelector('.item-nombre');
                    if (inputNombre) inputNombre.focus();
                }, 50);
            }

            // Auto-guardar en segundo plano
            try {
                await guardarConfiguracionEvaluacion(configuracion);
            } catch (e) {
                console.error('Error al guardar ítem producto:', e);
            }
        };
    } else {
        console.error('Botón agregar producto NO encontrado');
    }

    // Agregar ítem SERVICIO
    const btnAgregarServicio = document.getElementById('agregarItemServicio');
    if (btnAgregarServicio) {
        console.log('Botón agregar servicio encontrado');
        btnAgregarServicio.onclick = async function () {
            console.log('Agregando ítem de servicio...');
            if (!configuracion.itemsServicio) configuracion.itemsServicio = [];
            const nuevoItem = { nombre: '', ponderacion: 0 };
            configuracion.itemsServicio.push(nuevoItem);

            // Agregar inmediatamente al DOM sin recargar todo
            const container = document.getElementById('itemsServicioContainer');
            if (container) {
                const nuevoIndex = configuracion.itemsServicio.length - 1;
                const nuevoElemento = crearEditorItem(nuevoItem, nuevoIndex, 'servicio');
                container.appendChild(nuevoElemento);
                
                // Hacer scroll al nuevo elemento
                nuevoElemento.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
                // Enfocar el input del nombre
                setTimeout(() => {
                    const inputNombre = nuevoElemento.querySelector('.item-nombre');
                    if (inputNombre) inputNombre.focus();
                }, 50);
            }

            // Auto-guardar en segundo plano
            try {
                await guardarConfiguracionEvaluacion(configuracion);
            } catch (e) {
                console.error('Error al guardar ítem servicio:', e);
            }
        };
    } else {
        console.error('Botón agregar servicio NO encontrado');
    }

    // Agregar evaluador
    const btnAgregarEvaluador = document.getElementById('agregarEvaluadorBtn');
    if (btnAgregarEvaluador) {
        btnAgregarEvaluador.onclick = async function () {
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
        btnAgregarProveedor.onclick = async function () {
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

    // Cerrar sesión
    const btnCerrarSesion = document.getElementById('cerrarSesionBtn');
    if (btnCerrarSesion) {
        btnCerrarSesion.onclick = function () {
            if (confirm('¿Está seguro de cerrar sesión?')) {
                sessionStorage.removeItem('adminAuthenticated');
                sessionStorage.removeItem('adminAuthTime');
                window.location.href = 'login-admin.html';
            }
        };
    }

    // Volver al formulario (limpiar sesión al salir)
    const btnVolver = document.getElementById('volverBtn');
    if (btnVolver) {
        console.log('Botón volver encontrado');
        btnVolver.onclick = function () {
            console.log('Volviendo al formulario...');
            // Limpiar sesión al salir del panel de administración
            sessionStorage.removeItem('adminAuthenticated');
            sessionStorage.removeItem('adminAuthTime');
            window.location.href = 'index.html';
        };
    }

    // Botón para cambiar contraseña
    const btnCambiarPassword = document.getElementById('cambiarPasswordBtn');
    if (btnCambiarPassword) {
        btnCambiarPassword.onclick = async function () {
            const passwordActual = document.getElementById('passwordActual').value;
            const nuevaPassword = document.getElementById('nuevaPassword').value;
            const confirmarPassword = document.getElementById('confirmarPassword').value;
            const mensajePassword = document.getElementById('mensajePassword');

            // Validaciones
            if (!passwordActual || !nuevaPassword || !confirmarPassword) {
                mensajePassword.textContent = '❌ Por favor complete todos los campos';
                mensajePassword.style.display = 'block';
                mensajePassword.style.background = 'rgba(220, 53, 69, 0.1)';
                mensajePassword.style.color = '#dc3545';
                mensajePassword.style.borderColor = '#dc3545';
                return;
            }

            if (nuevaPassword !== confirmarPassword) {
                mensajePassword.textContent = '❌ Las contraseñas nuevas no coinciden';
                mensajePassword.style.display = 'block';
                mensajePassword.style.background = 'rgba(220, 53, 69, 0.1)';
                mensajePassword.style.color = '#dc3545';
                mensajePassword.style.borderColor = '#dc3545';
                return;
            }

            if (nuevaPassword.length < 6) {
                mensajePassword.textContent = '❌ La nueva contraseña debe tener al menos 6 caracteres';
                mensajePassword.style.display = 'block';
                mensajePassword.style.background = 'rgba(220, 53, 69, 0.1)';
                mensajePassword.style.color = '#dc3545';
                mensajePassword.style.borderColor = '#dc3545';
                return;
            }

            // Deshabilitar botón mientras se procesa
            btnCambiarPassword.disabled = true;
            btnCambiarPassword.textContent = '⏳ Cambiando...';

            try {
                // Validar contraseña actual
                const esValida = await validarPasswordAdmin(passwordActual);

                if (!esValida) {
                    mensajePassword.textContent = '❌ La contraseña actual es incorrecta';
                    mensajePassword.style.display = 'block';
                    mensajePassword.style.background = 'rgba(220, 53, 69, 0.1)';
                    mensajePassword.style.color = '#dc3545';
                    mensajePassword.style.borderColor = '#dc3545';
                    document.getElementById('passwordActual').value = '';
                    document.getElementById('passwordActual').focus();
                    return;
                }

                // Actualizar contraseña
                const resultado = await actualizarPasswordAdmin(nuevaPassword);

                if (resultado) {
                    mensajePassword.textContent = '✅ Contraseña actualizada correctamente. Deberá usar la nueva contraseña en el próximo inicio de sesión.';
                    mensajePassword.style.display = 'block';
                    mensajePassword.style.background = 'rgba(40, 167, 69, 0.1)';
                    mensajePassword.style.color = '#28a745';
                    mensajePassword.style.borderColor = '#28a745';

                    // Limpiar campos
                    document.getElementById('passwordActual').value = '';
                    document.getElementById('nuevaPassword').value = '';
                    document.getElementById('confirmarPassword').value = '';
                } else {
                    mensajePassword.textContent = '❌ Error al actualizar la contraseña. Intente nuevamente.';
                    mensajePassword.style.display = 'block';
                    mensajePassword.style.background = 'rgba(220, 53, 69, 0.1)';
                    mensajePassword.style.color = '#dc3545';
                    mensajePassword.style.borderColor = '#dc3545';
                }
            } catch (error) {
                console.error('Error al cambiar contraseña:', error);
                mensajePassword.textContent = '❌ Error al cambiar la contraseña. Intente nuevamente.';
                mensajePassword.style.display = 'block';
                mensajePassword.style.background = 'rgba(220, 53, 69, 0.1)';
                mensajePassword.style.color = '#dc3545';
                mensajePassword.style.borderColor = '#dc3545';
            } finally {
                // Rehabilitar botón
                btnCambiarPassword.disabled = false;
                btnCambiarPassword.textContent = '🔑 Cambiar Contraseña';
            }
        };
    } else {
        console.error('Botón volver NO encontrado');
    }

    // Botón descargar Excel total
    const btnDescargarExcel = document.getElementById('descargarExcelModalBtn');
    if (btnDescargarExcel) {
        btnDescargarExcel.onclick = async function() {
            await descargarExcelAdmin();
        };
    }

    // Inicializar evaluaciones cuando se carga la sección
    const sectionEvaluaciones = document.getElementById('section-evaluaciones');
    if (sectionEvaluaciones) {
        // Usar MutationObserver para detectar cuando se muestra la sección
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const isVisible = sectionEvaluaciones.style.display !== 'none';
                    if (isVisible) {
                        inicializarEvaluaciones();
                    }
                }
            });
        });
        observer.observe(sectionEvaluaciones, { attributes: true });
    }

    // Inicializar sección de PDFs
    const sectionPDFs = document.getElementById('section-pdfs');
    if (sectionPDFs) {
        const observerPDFs = new MutationObserver(async (mutations) => {
            if (sectionPDFs.style.display !== 'none' && sectionPDFs.classList.contains('active-section')) {
                await inicializarPDFs();
            }
        });
        observerPDFs.observe(sectionPDFs, { attributes: true });
    }

    console.log('Eventos inicializados');
}

// Variables globales para items (necesarias para Excel)
let itemsProductoAdmin = [];
let itemsServicioAdmin = [];
let todasEvaluacionesAdmin = [];

// Inicializar evaluaciones
async function inicializarEvaluaciones() {
    try {
        // Cargar items desde la configuración
        const config = await cargarConfiguracionEvaluacion();
        if (config) {
            itemsProductoAdmin = config.itemsProducto || [];
            itemsServicioAdmin = config.itemsServicio || [];
        }
        
        // Cargar todas las evaluaciones
        todasEvaluacionesAdmin = await cargarEvaluaciones();
        
        await mostrarEvaluacionesAdmin();
    } catch (error) {
        console.error('Error al inicializar evaluaciones:', error);
    }
}

// Mostrar evaluaciones en el admin
async function mostrarEvaluacionesAdmin() {
    const filtroAnio = document.getElementById('filtroAnio');
    const contenidoAnio = document.getElementById('contenidoAnio');
    const container = document.getElementById('evaluacionesList');
    
    if (!filtroAnio || !contenidoAnio || !container) return;
    
    // Recargar evaluaciones si es necesario
    if (todasEvaluacionesAdmin.length === 0) {
        todasEvaluacionesAdmin = await cargarEvaluaciones();
    }
    
    if (todasEvaluacionesAdmin.length === 0) {
        filtroAnio.innerHTML = '<option value="">-- No hay evaluaciones guardadas --</option>';
        contenidoAnio.style.display = 'none';
        return;
    }
    
    // Obtener años únicos y llenar el selector
    const aniosUnicos = [...new Set(todasEvaluacionesAdmin.map(e => e.anio || new Date(e.fecha || Date.now()).getFullYear()))].sort((a, b) => b - a);
    
    filtroAnio.innerHTML = '<option value="">-- Seleccione un año --</option>';
    aniosUnicos.forEach(anio => {
        const option = document.createElement('option');
        option.value = anio;
        option.textContent = anio;
        filtroAnio.appendChild(option);
    });
    
    // Event listener para cuando cambie el año
    filtroAnio.onchange = function() {
        const anioSeleccionado = this.value;
        if (anioSeleccionado) {
            mostrarEvaluacionesPorAnio(parseInt(anioSeleccionado), todasEvaluacionesAdmin);
        } else {
            contenidoAnio.style.display = 'none';
        }
    };
}

// Mostrar evaluaciones filtradas por año
function mostrarEvaluacionesPorAnio(anio, todasEvaluaciones) {
    const contenidoAnio = document.getElementById('contenidoAnio');
    const container = document.getElementById('evaluacionesList');
    const descargarAnioBtn = document.getElementById('descargarAnioCompletoBtn');
    
    if (!contenidoAnio || !container) return;
    
    // Filtrar evaluaciones por año
    const evaluacionesAnio = todasEvaluaciones.filter(e => {
        const anioEval = e.anio || new Date(e.fecha || Date.now()).getFullYear();
        return anioEval === anio;
    });
    
    if (evaluacionesAnio.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No hay evaluaciones para el año seleccionado.</p>';
        contenidoAnio.style.display = 'block';
        if (descargarAnioBtn) descargarAnioBtn.style.display = 'none';
        return;
    }
    
    // Mostrar contenido
    contenidoAnio.style.display = 'block';
    if (descargarAnioBtn) {
        descargarAnioBtn.style.display = 'block';
        descargarAnioBtn.onclick = () => descargarExcelPorAnioAdmin(anio);
    }
    
    // Mostrar evaluaciones
    container.innerHTML = '';
    evaluacionesAnio.sort((a, b) => {
        // Ordenar por evaluador, luego por proveedor, luego por fecha de guardado
        if (a.evaluador !== b.evaluador) {
            return a.evaluador.localeCompare(b.evaluador);
        }
        if (a.proveedor !== b.proveedor) {
            return a.proveedor.localeCompare(b.proveedor);
        }
        // Ordenar por created_at (fecha de guardado) - más reciente primero
        const fechaA = new Date(a.createdAt || a.created_at || a.fecha || 0);
        const fechaB = new Date(b.createdAt || b.created_at || b.fecha || 0);
        return fechaB - fechaA;
    });
    
    evaluacionesAnio.forEach(eval => {
            const div = document.createElement('div');
            div.className = 'evaluacion-item';
            div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 20px; margin-bottom: 15px; background: white; border: 2px solid #e0e0e0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);';
            
            const infoDiv = document.createElement('div');
            infoDiv.style.flex = '1';
            
            // Formatear fechas: fecha_evaluacion (del calendario) y created_at (fecha de guardado)
            let fechaEvaluacionFormateada = '';
            let fechaGuardadoFormateada = '';
            
            try {
                // fecha_evaluacion es la fecha seleccionada en el calendario
                const fechaEvaluacion = eval.fechaEvaluacion || eval.fecha;
                if (fechaEvaluacion) {
                    // Crear fecha sin problemas de zona horaria
                    let fechaObj;
                    if (typeof fechaEvaluacion === 'string' && fechaEvaluacion.includes('T')) {
                        // Si viene como ISO string, parsear correctamente
                        const [datePart] = fechaEvaluacion.split('T');
                        const [year, month, day] = datePart.split('-').map(Number);
                        fechaObj = new Date(year, month - 1, day);
                    } else {
                        fechaObj = new Date(fechaEvaluacion);
                    }
                    if (!isNaN(fechaObj.getTime())) {
                        // Solo mostrar fecha sin hora
                        fechaEvaluacionFormateada = fechaObj.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                    }
                }
                
                // created_at es la fecha y hora cuando se guardó en la BD
                const fechaGuardado = eval.createdAt || eval.created_at;
                if (fechaGuardado) {
                    const fechaObj = new Date(fechaGuardado);
                    if (!isNaN(fechaObj.getTime())) {
                        fechaGuardadoFormateada = fechaObj.toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        });
                    }
                }
            } catch (e) {
                console.error('Error al formatear fechas:', e, eval);
                fechaEvaluacionFormateada = eval.fechaEvaluacion || eval.fecha || 'Fecha no disponible';
                fechaGuardadoFormateada = eval.createdAt || eval.created_at || 'Fecha no disponible';
            }
            
            // Obtener valores de forma segura
            const evaluador = eval.evaluador || 'No especificado';
            const proveedor = eval.proveedor || 'No especificado';
            const tipo = eval.tipo_proveedor || eval.tipo || 'No especificado';
            const resultado = eval.resultado_final || eval.resultadoFinal || 0;
            const anio = eval.anio || new Date(eval.fecha || Date.now()).getFullYear();
            
            // Crear estructura más clara
            infoDiv.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                        <div style="font-size: 1.1rem; font-weight: 700; color: #2c3e50;">
                            👤 <strong>Evaluador:</strong> ${evaluador}
                        </div>
                        <div style="font-size: 1.1rem; font-weight: 700; color: #667eea;">
                            🏢 <strong>Proveedor:</strong> ${proveedor}
                        </div>
                        <div style="font-size: 1.1rem; font-weight: 700; color: ${tipo === 'PRODUCTO' ? '#4A90E2' : '#50C878'};">
                            ${tipo === 'PRODUCTO' ? '🟦' : '🟩'} <strong>Tipo:</strong> ${tipo}
                        </div>
                        <div style="font-size: 1.1rem; font-weight: 700; color: #ff6b35; background: rgba(255, 107, 53, 0.1); padding: 5px 12px; border-radius: 6px;">
                            📅 <strong>Año:</strong> ${anio}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                        <div style="font-size: 1.4rem; font-weight: 800; color: #28a745; background: rgba(40, 167, 69, 0.15); padding: 10px 20px; border-radius: 10px; border: 2px solid #28a745;">
                            📊 <strong>Resultado Final:</strong> ${parseFloat(resultado).toFixed(2)}%
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-top: 10px;">
                        <div style="color: #667eea; font-size: 1rem; font-weight: 600; background: rgba(102, 126, 234, 0.1); padding: 8px 15px; border-radius: 6px;">
                            📅 <strong>Fecha Evaluación:</strong> ${fechaEvaluacionFormateada || 'No disponible'}
                        </div>
                        <div style="color: #666; font-size: 1rem; font-weight: 500; background: rgba(0, 0, 0, 0.05); padding: 8px 15px; border-radius: 6px;">
                            💾 <strong>Guardado:</strong> ${fechaGuardadoFormateada || 'No disponible'}
                        </div>
                    </div>
                </div>
            `;
            
            // Contenedor de botones
            const botonesDiv = document.createElement('div');
            botonesDiv.style.cssText = 'display: flex; gap: 10px; align-items: center; flex-shrink: 0;';
            
            // Botón descargar individual
            const btnDescargar = document.createElement('button');
            btnDescargar.className = 'btn-add';
            btnDescargar.style.cssText = 'background: #667eea; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem; white-space: nowrap; min-width: fit-content;';
            btnDescargar.innerHTML = '📥 Descargar Excel';
            btnDescargar.onclick = function() {
                descargarEvaluacionIndividualAdmin(eval);
            };
            
            // Botón eliminar
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn-remove';
            btnEliminar.style.cssText = 'white-space: nowrap;';
            btnEliminar.textContent = '🗑️ Eliminar';
            btnEliminar.onclick = function() {
                eliminarEvaluacionPorIdAdmin(eval.id);
            };
            
            botonesDiv.appendChild(btnDescargar);
            botonesDiv.appendChild(btnEliminar);
            
            div.appendChild(infoDiv);
            div.appendChild(botonesDiv);
            container.appendChild(div);
        });
}

// Eliminar evaluación
async function eliminarEvaluacionPorIdAdmin(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta evaluación?')) {
        return;
    }
    
    try {
        const success = await eliminarEvaluacion(id);
        if (success) {
            // Recargar evaluaciones primero
            todasEvaluacionesAdmin = await cargarEvaluaciones();
            
            // Recargar la vista de evaluaciones guardadas
            const filtroAnio = document.getElementById('filtroAnio');
            if (filtroAnio) {
                if (filtroAnio.value) {
                    mostrarEvaluacionesPorAnio(parseInt(filtroAnio.value), todasEvaluacionesAdmin);
                } else {
                    await mostrarEvaluacionesAdmin();
                }
            }
            
            // También actualizar la sección de PDFs
            const filtroAnioPDF = document.getElementById('filtroAnioPDF');
            if (filtroAnioPDF && typeof mostrarPDFsAdmin === 'function') {
                if (filtroAnioPDF.value) {
                    if (typeof mostrarPDFsPorAnio === 'function') {
                        mostrarPDFsPorAnio(parseInt(filtroAnioPDF.value), todasEvaluacionesAdmin);
                    }
                } else {
                    await mostrarPDFsAdmin();
                }
            }
            
            alert('✅ Evaluación eliminada exitosamente.');
        } else {
            alert('❌ Error al eliminar la evaluación.');
        }
    } catch (error) {
        console.error('Error al eliminar evaluación:', error);
        alert('❌ Error al eliminar la evaluación.');
    }
}

// Descargar Excel total
async function descargarExcelAdmin() {
    const evaluaciones = await cargarEvaluaciones();
    
    if (evaluaciones.length === 0) {
        alert('No hay evaluaciones guardadas para descargar.');
        return;
    }
    
    // Ordenar: primero por proveedor, luego por fecha (más reciente primero)
    evaluaciones.sort((a, b) => {
        if (a.proveedor !== b.proveedor) {
            return a.proveedor.localeCompare(b.proveedor);
        }
        // Ordenar por created_at (fecha de guardado) - más reciente primero
        const fechaA = new Date(a.createdAt || a.created_at || a.fecha || 0);
        const fechaB = new Date(b.createdAt || b.created_at || b.fecha || 0);
        return fechaB - fechaA;
    });
    
    crearYDescargarExcelAdmin(evaluaciones, 'Todas las Evaluaciones');
}

// Descargar Excel por año
async function descargarExcelPorAnioAdmin(anio) {
    const evaluaciones = await cargarEvaluaciones();
    const evaluacionesAnio = evaluaciones.filter(e => {
        const anioEval = e.anio || new Date(e.fecha || Date.now()).getFullYear();
        return anioEval === anio;
    });
    
    if (evaluacionesAnio.length === 0) {
        alert(`No hay evaluaciones para el año ${anio}.`);
        return;
    }
    
    // Ordenar por evaluador, luego por proveedor
    evaluacionesAnio.sort((a, b) => {
        if (a.evaluador !== b.evaluador) {
            return a.evaluador.localeCompare(b.evaluador);
        }
        return a.proveedor.localeCompare(b.proveedor);
    });
    
    crearYDescargarExcelAdmin(evaluacionesAnio, `Evaluaciones_${anio}`);
}

// Descargar Excel por proveedor
async function descargarExcelPorProveedorAdmin(nombreProveedor) {
    const evaluaciones = await cargarEvaluaciones();
    const evaluacionesProveedor = evaluaciones.filter(e => e.proveedor === nombreProveedor);
    
    if (evaluacionesProveedor.length === 0) {
        alert(`No hay evaluaciones para el proveedor ${nombreProveedor}.`);
        return;
    }
    
    // Ordenar por año (más reciente primero), luego por fecha
    evaluacionesProveedor.sort((a, b) => {
        const anioA = a.anio || new Date(a.fecha || Date.now()).getFullYear();
        const anioB = b.anio || new Date(b.fecha || Date.now()).getFullYear();
        if (anioA !== anioB) {
            return anioB - anioA;
        }
        // Ordenar por created_at (fecha de guardado) - más reciente primero
        const fechaA = new Date(a.createdAt || a.created_at || a.fecha || 0);
        const fechaB = new Date(b.createdAt || b.created_at || b.fecha || 0);
        return fechaB - fechaA;
    });
    
    crearYDescargarExcelAdmin(evaluacionesProveedor, nombreProveedor);
}

// Descargar evaluación individual
async function descargarEvaluacionIndividualAdmin(evaluacion) {
    const evaluador = evaluacion.evaluador || 'SinEvaluador';
    const proveedor = evaluacion.proveedor || 'SinProveedor';
    const anio = evaluacion.anio || new Date(evaluacion.fecha || Date.now()).getFullYear();
    const nombreArchivo = `Evaluacion_${evaluador.replace(/\s+/g, '_')}_${proveedor.replace(/\s+/g, '_')}_${anio}.xlsx`;
    
    crearYDescargarExcelAdmin([evaluacion], nombreArchivo.replace('.xlsx', ''));
}

// Crear y descargar Excel
function crearYDescargarExcelAdmin(evaluaciones, titulo) {
    // Preparar datos para Excel
    const datosExcel = [];
    
    evaluaciones.forEach(eval => {
        const tipo = eval.tipo_proveedor || eval.tipo || 'No especificado';
        const items = tipo === 'PRODUCTO' ? itemsProductoAdmin : itemsServicioAdmin;
        const fecha = eval.fecha_evaluacion || eval.fecha || '';
        const evaluador = eval.evaluador || 'No especificado';
        const proveedor = eval.proveedor || 'No especificado';
        const resultado = eval.resultado_final || eval.resultadoFinal || 0;
        const anio = eval.anio || new Date(eval.fecha || Date.now()).getFullYear();
        
        const fila = {
            'Año': anio,
            'Fecha': fecha,
            'Evaluador': evaluador,
            'Proveedor': proveedor,
            'Correo Proveedor': eval.correo_proveedor || eval.correoProveedor || 'No especificado',
            'Tipo': tipo,
            'Resultado Final (%)': parseFloat(resultado).toFixed(2)
        };
        
        // Agregar respuestas por ítem en orden
        const respuestas = eval.respuestas || {};
        if (Array.isArray(respuestas)) {
            // Formato nuevo (array)
            respuestas.forEach(resp => {
                const item = items.find(i => i.nombre === resp.item);
                if (item) {
                    fila[`${item.nombre} (${item.ponderacion}%)`] = resp.valor + '%';
                }
            });
        } else if (typeof respuestas === 'object' && respuestas !== null) {
            // Formato antiguo (objeto)
            items.forEach(item => {
                const respuesta = respuestas[item.nombre] || 0;
                fila[`${item.nombre} (${item.ponderacion}%)`] = respuesta + '%';
            });
        }
        
        datosExcel.push(fila);
    });
    
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    
    // Ajustar ancho de columnas
    const colWidths = [];
    const headers = Object.keys(datosExcel[0]);
    headers.forEach(header => {
        colWidths.push({ wch: Math.max(header.length, 20) });
    });
    ws['!cols'] = colWidths;
    
    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Evaluaciones');
    
    // Generar nombre de archivo
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = titulo === 'Todas las Evaluaciones' 
        ? `Evaluaciones_TOTAL_${fecha}.xlsx`
        : `Evaluacion_${titulo.replace(/\s+/g, '_')}_${fecha}.xlsx`;
    
    // Descargar archivo
    XLSX.writeFile(wb, nombreArchivo);
    
    alert(`Se descargaron ${evaluaciones.length} evaluación(es) en Excel.`);
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


