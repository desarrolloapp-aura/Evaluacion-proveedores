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

async function inicializar() {
    try {
        console.log('Iniciando panel de administración...');
        await inicializarFormulario();
        inicializarEventos();
        console.log('Panel de administración inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar panel de administración:', error);
        alert('Error al cargar el panel de administración: ' + error.message);
    }
}

function inicializarFormulario() {
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
    
    // Inicializar evaluadores, proveedores y asignaciones
    inicializarEvaluadores();
    inicializarProveedores();
    inicializarAsignaciones();
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
        
        inicializarFormulario();
    }
};

// Inicializar lista de evaluadores
function inicializarEvaluadores() {
    const container = document.getElementById('evaluadoresList');
    if (!container) return;
    
    container.innerHTML = '';
    
    const asignacion = configuracion.asignacionProveedores || configuracionDefault.asignacionProveedores;
    const evaluadores = Object.keys(asignacion).sort();
    
    if (evaluadores.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay evaluadores registrados. Agrega uno para comenzar.</p>';
        return;
    }
    
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
            inicializarAsignaciones();
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
        const proveedores = await cargarProveedores();
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
            btnEliminar.onclick = function() {
                eliminarProveedorLocal(proveedor);
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
            
            inicializarProveedores();
            inicializarAsignaciones();
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
            alert('❌ Error al eliminar el proveedor.');
        }
    }
}

// Inicializar asignaciones
function inicializarAsignaciones() {
    const container = document.getElementById('asignacionesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const asignacion = configuracion.asignacionProveedores || configuracionDefault.asignacionProveedores;
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
        btnGuardar.onclick = function() {
            console.log('Guardando configuración...');
            guardarConfiguracionCompleta();
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
            inicializarFormulario();
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
            inicializarFormulario();
        };
    } else {
        console.error('Botón agregar servicio NO encontrado');
    }
    
    // Agregar evaluador
    const btnAgregarEvaluador = document.getElementById('agregarEvaluadorBtn');
    if (btnAgregarEvaluador) {
        btnAgregarEvaluador.onclick = function() {
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
            
            configuracion.asignacionProveedores[nombre] = { PRODUCTO: [], SERVICIO: [] };
            document.getElementById('nuevoEvaluador').value = '';
            inicializarEvaluadores();
            inicializarAsignaciones();
        };
    }
    
    // Agregar proveedor
    const btnAgregarProveedor = document.getElementById('agregarProveedorBtn');
    if (btnAgregarProveedor) {
        btnAgregarProveedor.onclick = function() {
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
            await crearProveedor(nombre, tipo);
            configuracion.proveedores[nombre] = tipo;
            document.getElementById('nuevoProveedor').value = '';
            inicializarProveedores();
            inicializarAsignaciones();
        };
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

function guardarConfiguracionCompleta() {
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
    
    guardarConfiguracion();
}


