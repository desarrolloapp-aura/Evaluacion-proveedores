// Asignación de proveedores por evaluador (valores por defecto)
const asignacionProveedoresDefault = {
    'Exequiel Ledezma': {
        PRODUCTO: ['PRODALAM', 'APRO', 'SERVICIOS 23', 'RECOMIN', 'PROSEV', 'TUBIX', 'LET RIVEROS', 'DYFAR'],
        SERVICIO: []
    },
    'Pablo León': {
        PRODUCTO: ['SKAVA', 'MANANTIAL', 'PRISA', 'LUKSIC', 'NORMET', 'OFIGRAPH', 'MARSELLA', 'OVIEDO', 'SEGURYCEL'],
        SERVICIO: []
    },
    'Julio Quintero': {
        PRODUCTO: ['ADASME', 'BCM SERVICIOS', 'MAQUIMAL', 'ROBOCON'],
        SERVICIO: []
    },
    'Herve Guerrero': {
        PRODUCTO: ['APEX', 'DERCOMAQ', 'PERFOMEX', 'SALFA', 'FILTER'],
        SERVICIO: []
    },
    'Felipe Velazquez': {
        PRODUCTO: ['ARTEMETALICA', 'EQ. MINEROS', 'RCR', 'TOTAL CHILE'],
        SERVICIO: []
    },
    'Freddy Marquez': {
        PRODUCTO: ['AS COMPUTACION', 'IT CONS'],
        SERVICIO: []
    },
    'Faviola Parraguez': {
        PRODUCTO: [],
        SERVICIO: ['SEBASTIAN CARTAGENA']
    },
    'Hernán Opazo': {
        PRODUCTO: [],
        SERVICIO: ['RENTOKIL', 'CLIMA IDEAL', 'SEGURIDAD MMC']
    },
    'Ramón Cabrera': {
        PRODUCTO: [],
        SERVICIO: ['AMYSA']
    },
    'Manuel Bustamante': {
        PRODUCTO: [],
        SERVICIO: ['TRANSBUS', 'ESTAFETA']
    },
    'Magdalena Avendaño': {
        PRODUCTO: [],
        SERVICIO: ['ALTO IMPACTO']
    },
    'Patricia Torres': {
        PRODUCTO: [],
        SERVICIO: ['TRANSPORTE ARANGUIZ']
    },
    'Leandro Sánchez': {
        PRODUCTO: [],
        SERVICIO: ['SISA']
    },
    'Danitza Meneses': {
        PRODUCTO: [],
        SERVICIO: ['XTREME']
    },
    'Cintia Salas': {
        PRODUCTO: [],
        SERVICIO: ['SERVISAN']
    },
    'Sebastián Rodríguez': {
        PRODUCTO: [],
        SERVICIO: ['GLOBAL PARTNERS']
    },
    'Dorca Núñez': {
        PRODUCTO: [],
        SERVICIO: ['RECICLAJE ECOTRANS', 'RECYCLING']
    },
    'José Cárdenas': {
        PRODUCTO: [],
        SERVICIO: ['BUREAU VERITAS']
    },
    'Matías Espinoza': {
        PRODUCTO: ['TUBIX', 'OFIGRAPH', 'MANANTIAL', 'DYFAR', 'RECOMIN', 'PROSEV', 'LET RIVEROS'],
        SERVICIO: []
    },
    'Daniel Tamayo': {
        PRODUCTO: ['TOTAL CHILE', 'FILTER', 'ARTEMETALICA', 'RCR', 'SALFA'],
        SERVICIO: []
    },
    'Adrián Paredes': {
        PRODUCTO: ['APRO', 'PRISA', 'SEGURYCEL', 'SKAVA', 'LUKSIC', 'APEX', 'MAESTRANZA SAN MIGUEL'],
        SERVICIO: []
    },
    'Víctor González': {
        PRODUCTO: ['NORMET', 'ADASME', 'BCM SERVICIOS', 'ROBOCON'],
        SERVICIO: []
    }
};

// Variables globales que se cargarán desde Supabase
let asignacionProveedores = asignacionProveedoresDefault;
let evaluadores = [];

// Cargar asignación de proveedores desde Supabase
async function cargarAsignacionProveedores() {
    try {
        const asignaciones = await cargarAsignaciones();
        if (asignaciones && Object.keys(asignaciones).length > 0) {
            return asignaciones;
        }
    } catch (e) {
        console.error('Error al cargar asignación de proveedores desde Supabase:', e);
    }
    return asignacionProveedoresDefault;
}

// Función auxiliar para obtener proveedores de un evaluador por tipo
function obtenerProveedoresPorEvaluador(evaluador, tipo) {
    if (!asignacionProveedores[evaluador]) {
        return [];
    }
    return asignacionProveedores[evaluador][tipo] || [];
}

// Variables globales
let configEvaluacion = null;
let itemsProducto = [];
let itemsServicio = [];

// Cargar configuración desde Supabase
async function cargarConfiguracionEvaluacionLocal() {
    try {
        const config = await cargarConfiguracionEvaluacion();
        if (config) {
            return config;
        }
    } catch (e) {
        console.error('Error al cargar configuración desde Supabase:', e);
    }
    // Valores por defecto
    return getConfiguracionDefault();
}

// Escala de respuesta
const escalaRespuesta = [25, 50, 75, 100];

// Inicializar año actual por defecto
document.addEventListener('DOMContentLoaded', async function() {
    // Cargar datos desde Supabase
    try {
        console.log('Cargando datos desde Supabase...');
        
        // Cargar configuración
        configEvaluacion = await cargarConfiguracionEvaluacionLocal();
        itemsProducto = configEvaluacion.itemsProducto || [];
        itemsServicio = configEvaluacion.itemsServicio || [];
        
        // Cargar asignaciones y evaluadores
        asignacionProveedores = await cargarAsignacionProveedores();
        evaluadores = await cargarEvaluadores();
        
        // Si no hay evaluadores en Supabase, usar los de las asignaciones
        if (evaluadores.length === 0) {
            evaluadores = Object.keys(asignacionProveedores);
        }
        
        // Cargar evaluaciones para obtener años disponibles
        const evaluaciones = await cargarEvaluaciones();
        
        // Inicializar selector de años
        await inicializarSelectorAnios(evaluaciones);
        
        console.log('✅ Datos cargados desde Supabase');
    } catch (error) {
        console.error('Error al cargar datos desde Supabase, usando valores por defecto:', error);
        // Usar valores por defecto
        configEvaluacion = getConfiguracionDefault();
        itemsProducto = configEvaluacion.itemsProducto || [];
        itemsServicio = configEvaluacion.itemsServicio || [];
        evaluadores = Object.keys(asignacionProveedores);
        
        // Inicializar selector de años sin evaluaciones
        await inicializarSelectorAnios([]);
    }
    
    // Continuar con la inicialización normal
    actualizarInformacionDesdeConfig();
    inicializarEvaluadores();
    inicializarEventos();
});

// Inicializar calendario (input type="date" nativo)
async function inicializarSelectorAnios(evaluaciones) {
    const anioInput = document.getElementById('anioEvaluacion');
    if (!anioInput) return;
    
    // Establecer fecha actual por defecto
    const hoy = new Date();
    const fechaFormato = hoy.toISOString().split('T')[0]; // YYYY-MM-DD
    anioInput.value = fechaFormato;
    anioInput.dataset.anio = hoy.getFullYear();
}

function actualizarInformacionDesdeConfig() {
    // Actualizar título
    const titulo = document.getElementById('tituloPrincipal');
    if (titulo) {
        titulo.textContent = configEvaluacion.titulo || 'Evaluación de Proveedores';
    }
    
    // Actualizar descripción
    const descripcion = document.getElementById('descripcionEvaluacion');
    if (descripcion) {
        descripcion.textContent = configEvaluacion.descripcion || '';
    }
    
    // Actualizar objetivo
    const objetivo = document.getElementById('objetivoEvaluacion');
    if (objetivo) {
        objetivo.textContent = configEvaluacion.objetivo || '';
    }
    
    // Actualizar lista de criterios dinámicamente
    actualizarCriteriosEnHTML();
}

function actualizarCriteriosEnHTML() {
    // Actualizar criterios de PRODUCTO
    const ulProducto = document.getElementById('listaProducto');
    const cantidadProducto = document.getElementById('cantidadProducto');
    if (ulProducto) {
        ulProducto.innerHTML = '';
        itemsProducto.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.nombre}</strong> (${item.ponderacion}%)`;
            ulProducto.appendChild(li);
        });
        if (cantidadProducto) {
            cantidadProducto.textContent = itemsProducto.length;
        }
    }
    
    // Actualizar criterios de SERVICIO
    const ulServicio = document.getElementById('listaServicio');
    const cantidadServicio = document.getElementById('cantidadServicio');
    if (ulServicio) {
        ulServicio.innerHTML = '';
        itemsServicio.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.nombre}</strong> (${item.ponderacion}%)`;
            ulServicio.appendChild(li);
        });
        if (cantidadServicio) {
            cantidadServicio.textContent = itemsServicio.length;
        }
    }
}

function inicializarEvaluadores() {
    const selectEvaluador = document.getElementById('evaluador');
    evaluadores.forEach(evaluador => {
        const option = document.createElement('option');
        option.value = evaluador;
        option.textContent = evaluador;
        selectEvaluador.appendChild(option);
    });
}

function inicializarEventos() {
    // Cambio de evaluador
    document.getElementById('evaluador').addEventListener('change', async function() {
        await actualizarProveedores();
    });

    // Cambio de fecha (año extraído de la fecha)
    document.getElementById('anioEvaluacion').addEventListener('change', async function() {
        await actualizarProveedores();
    });

    // Cambio de tipo de proveedor
    document.querySelectorAll('input[name="tipoProveedor"]').forEach(radio => {
        radio.addEventListener('change', async function() {
            await actualizarProveedores();
        });
    });

    // Cambio de proveedor
    document.getElementById('proveedor').addEventListener('change', function() {
        mostrarItemsEvaluacion();
        mostrarCampoCorreo();
    });

    // Cambio en respuestas
    document.addEventListener('change', function(e) {
        if (e.target.name && e.target.name.startsWith('item_')) {
            calcularResultado();
            // Actualizar estado visual de los labels
            actualizarEstadoRadioButtons(e.target);
        }
    });
    
    // Actualizar estado visual cuando se carga la página
    document.addEventListener('click', function(e) {
        if (e.target.type === 'radio' && e.target.name.startsWith('item_')) {
            actualizarEstadoRadioButtons(e.target);
            // También calcular resultado al hacer click
            calcularResultado();
        }
    });

    // Envío del formulario
    document.getElementById('evaluationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        guardarEvaluacion();
    });

    // Limpiar formulario
    document.getElementById('limpiarBtn').addEventListener('click', function() {
        limpiarFormulario();
    });

}

async function actualizarProveedores() {
    const evaluador = document.getElementById('evaluador').value;
    const tipoProveedor = document.querySelector('input[name="tipoProveedor"]:checked');
    const anioInput = document.getElementById('anioEvaluacion');
    const fechaSeleccionada = anioInput && anioInput.value ? new Date(anioInput.value) : null;
    const anioEvaluacion = fechaSeleccionada ? fechaSeleccionada.getFullYear() : null;
    const selectProveedor = document.getElementById('proveedor');
    
    // Limpiar opciones
    selectProveedor.innerHTML = '<option value="">-- Seleccione un proveedor --</option>';
    
    if (!evaluador) {
        selectProveedor.innerHTML = '<option value="">-- Primero seleccione un evaluador --</option>';
        // Ocultar items y correo
        document.getElementById('itemsSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('correoSection').style.display = 'none';
        document.getElementById('correoProveedor').value = '';
        return;
    }
    
    if (!anioEvaluacion || !anioInput.value) {
        selectProveedor.innerHTML = '<option value="">-- Primero seleccione la fecha de evaluación --</option>';
        document.getElementById('itemsSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('correoSection').style.display = 'none';
        document.getElementById('correoProveedor').value = '';
        return;
    }
    
    if (tipoProveedor) {
        // Obtener evaluaciones guardadas
        const evaluaciones = await cargarEvaluaciones();
        
        // Obtener proveedores ya evaluados por este evaluador, tipo y año
        const proveedoresEvaluados = new Set();
        evaluaciones.forEach(eval => {
            const anioEval = new Date(eval.fecha).getFullYear();
            if (eval.evaluador === evaluador && 
                eval.tipo === tipoProveedor.value && 
                anioEval === parseInt(anioEvaluacion)) {
                proveedoresEvaluados.add(eval.proveedor);
            }
        });
        
        // Obtener lista de proveedores asignados a este evaluador según el tipo
        const proveedoresAsignados = obtenerProveedoresPorEvaluador(evaluador, tipoProveedor.value);
        
        if (proveedoresAsignados.length === 0) {
            selectProveedor.innerHTML = `<option value="">-- Este evaluador no tiene proveedores asignados de tipo ${tipoProveedor.value} --</option>`;
        } else {
            // Filtrar proveedores que aún no han sido evaluados en este año
            const proveedoresDisponibles = proveedoresAsignados.filter(proveedor => !proveedoresEvaluados.has(proveedor));
            
            if (proveedoresDisponibles.length === 0) {
                selectProveedor.innerHTML = `<option value="">-- Ya ha evaluado todos los proveedores asignados de este tipo para el año ${anioEvaluacion} --</option>`;
            } else {
                proveedoresDisponibles.forEach(proveedor => {
                    const option = document.createElement('option');
                    option.value = proveedor;
                    option.textContent = proveedor;
                    selectProveedor.appendChild(option);
                });
            }
        }
    }
    
    // Ocultar items y correo
    document.getElementById('itemsSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('correoSection').style.display = 'none';
    document.getElementById('correoProveedor').value = '';
}

function actualizarEstadoRadioButtons(radioSeleccionado) {
    // Remover clase selected de todos los labels del mismo grupo
    const nombreGrupo = radioSeleccionado.name;
    document.querySelectorAll(`input[name="${nombreGrupo}"]`).forEach(radio => {
        radio.closest('label').classList.remove('selected');
    });
    
    // Agregar clase selected al label del radio seleccionado
    if (radioSeleccionado.checked) {
        radioSeleccionado.closest('label').classList.add('selected');
    }
}

function mostrarCampoCorreo() {
    const proveedor = document.getElementById('proveedor').value;
    if (proveedor) {
        document.getElementById('correoSection').style.display = 'block';
    } else {
        document.getElementById('correoSection').style.display = 'none';
        document.getElementById('correoProveedor').value = '';
    }
}

function mostrarItemsEvaluacion() {
    const tipoProveedor = document.querySelector('input[name="tipoProveedor"]:checked');
    const proveedor = document.getElementById('proveedor').value;
    
    if (!tipoProveedor || !proveedor) {
        return;
    }
    
    const items = tipoProveedor.value === 'PRODUCTO' ? itemsProducto : itemsServicio;
    const container = document.getElementById('itemsContainer');
    const title = document.getElementById('itemsTitle');
    
    title.textContent = tipoProveedor.value === 'PRODUCTO' ? '4. Ítems de Evaluación - PRODUCTO' : '4. Ítems de Evaluación - SERVICIO';
    
    container.innerHTML = '';
    
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-evaluacion';
        
        const label = document.createElement('label');
        label.innerHTML = `${item.nombre} <span class="ponderacion">(${item.ponderacion}%)</span>`;
        
        const radioGroup = document.createElement('div');
        radioGroup.className = 'radio-options';
        
        escalaRespuesta.forEach(porcentaje => {
            const labelRadio = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `item_${index}`;
            input.value = porcentaje;
            input.required = true;
            
            const span = document.createElement('span');
            span.textContent = `${porcentaje}%`;
            
            labelRadio.appendChild(input);
            labelRadio.appendChild(span);
            radioGroup.appendChild(labelRadio);
        });
        
        itemDiv.appendChild(label);
        itemDiv.appendChild(radioGroup);
        container.appendChild(itemDiv);
    });
    
    document.getElementById('itemsSection').style.display = 'block';
}

function calcularResultado() {
    const tipoProveedor = document.querySelector('input[name="tipoProveedor"]:checked');
    if (!tipoProveedor) return;
    
    const items = tipoProveedor.value === 'PRODUCTO' ? itemsProducto : itemsServicio;
    let resultadoPonderado = 0;
    let todosCompletos = true;
    
    items.forEach((item, index) => {
        const respuesta = document.querySelector(`input[name="item_${index}"]:checked`);
        if (!respuesta) {
            todosCompletos = false;
            return;
        }
        
        const porcentaje = parseInt(respuesta.value);
        resultadoPonderado += (porcentaje * item.ponderacion) / 100;
    });
    
    if (todosCompletos) {
        document.getElementById('resultadoFinal').textContent = resultadoPonderado.toFixed(2) + '%';
        document.getElementById('resultSection').style.display = 'block';
    } else {
        document.getElementById('resultSection').style.display = 'none';
    }
}

async function guardarEvaluacion() {
    const evaluador = document.getElementById('evaluador').value;
    const tipoProveedor = document.querySelector('input[name="tipoProveedor"]:checked');
    const proveedor = document.getElementById('proveedor').value;
    const correoProveedor = document.getElementById('correoProveedor').value;
    const anioInput = document.getElementById('anioEvaluacion');
    // Crear fecha sin problemas de zona horaria: usar la fecha seleccionada directamente
    let fechaSeleccionada = null;
    let anioEvaluacion = new Date().getFullYear();
    if (anioInput && anioInput.value) {
        // Parsear la fecha del input (formato YYYY-MM-DD) sin problemas de zona horaria
        const [year, month, day] = anioInput.value.split('-').map(Number);
        fechaSeleccionada = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11
        anioEvaluacion = year;
    }
    const resultadoFinal = document.getElementById('resultadoFinal').textContent;
    
    if (!evaluador || !tipoProveedor || !proveedor || !correoProveedor || !anioInput.value || resultadoFinal === '0%') {
        alert('Por favor complete todos los campos y responda todas las preguntas.');
        return;
    }
    
    const items = tipoProveedor.value === 'PRODUCTO' ? itemsProducto : itemsServicio;
    const respuestas = {};
    
    items.forEach((item, index) => {
        const respuesta = document.querySelector(`input[name="item_${index}"]:checked`);
        if (respuesta) {
            respuestas[item.nombre] = parseInt(respuesta.value);
        }
    });
    
    // Guardar en Supabase (usando la función de supabase-service.js)
    // Convertir respuestas a formato array para Supabase
    const respuestasArray = [];
    Object.keys(respuestas).forEach(itemNombre => {
        respuestasArray.push({
            item: itemNombre,
            valor: respuestas[itemNombre]
        });
    });
    
    // Usar la fecha seleccionada en el calendario para fecha_evaluacion
    // La fecha debe ser la fecha completa del calendario, no solo el año
    let fechaEvaluacion;
    if (fechaSeleccionada) {
        // Crear fecha ISO en formato YYYY-MM-DD sin hora para evitar problemas de zona horaria
        const year = fechaSeleccionada.getFullYear();
        const month = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
        const day = String(fechaSeleccionada.getDate()).padStart(2, '0');
        fechaEvaluacion = `${year}-${month}-${day}T00:00:00.000Z`; // Medianoche UTC para preservar el día
    } else {
        // Si no hay fecha seleccionada, usar la fecha actual
        fechaEvaluacion = new Date().toISOString();
    }
    
    console.log('📅 Fecha de evaluación (del calendario):', fechaEvaluacion);
    console.log('📅 Año extraído:', anioEvaluacion);
    
    try {
        // Llamar a la función de supabase-service.js
        const evaluacionData = {
            evaluador: evaluador,
            proveedor: proveedor,
            tipo: tipoProveedor.value,
            correoProveedor: correoProveedor,
            respuestas: respuestasArray,
            resultadoFinal: parseFloat(resultadoFinal.replace('%', '')),
            fechaEvaluacion: fechaEvaluacion, // Fecha del calendario para fecha_evaluacion
            anio: anioEvaluacion // Año extraído de la fecha del calendario
        };
        
        // Usar window para asegurar que llamamos a la función global de supabase-service.js
        if (typeof window.guardarEvaluacionEnSupabase === 'function') {
            await window.guardarEvaluacionEnSupabase(evaluacionData);
        } else {
            // Fallback: llamar directamente (debería estar en scope global)
            await guardarEvaluacion(evaluacionData);
        }
        
        alert('✅ Evaluación guardada exitosamente en la base de datos. Ahora está disponible desde cualquier lugar.');
        limpiarFormulario();
        await actualizarProveedores();
    } catch (error) {
        console.error('Error al guardar evaluación:', error);
        alert('❌ Error al guardar la evaluación. Por favor, intente nuevamente.');
    }
}

function limpiarFormulario() {
    document.getElementById('evaluationForm').reset();
    document.getElementById('proveedor').innerHTML = '<option value="">-- Primero seleccione el tipo de proveedor --</option>';
    document.getElementById('itemsContainer').innerHTML = '';
    document.getElementById('itemsSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('correoSection').style.display = 'none';
    document.getElementById('correoProveedor').value = '';
    
    // Restablecer fecha actual
    const anioInput = document.getElementById('anioEvaluacion');
    if (anioInput) {
        const hoy = new Date();
        anioInput.value = hoy.toISOString().split('T')[0];
    }
}

async function eliminarEvaluacionPorId(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta evaluación?')) {
        return;
    }
    
    try {
        const success = await eliminarEvaluacion(id);
        if (success) {
            alert('✅ Evaluación eliminada exitosamente.');
            mostrarEvaluaciones();
        } else {
            alert('❌ Error al eliminar la evaluación.');
        }
    } catch (error) {
        console.error('Error al eliminar evaluación:', error);
        alert('❌ Error al eliminar la evaluación.');
    }
}

async function mostrarEvaluaciones() {
    const evaluaciones = await cargarEvaluaciones();
    const container = document.getElementById('evaluacionesList');
    const botonesContainer = document.getElementById('botonesProveedores');
    
    if (evaluaciones.length === 0) {
        container.innerHTML = '<p>No hay evaluaciones guardadas.</p>';
        botonesContainer.innerHTML = '';
    } else {
        // Obtener proveedores únicos
        const proveedoresUnicos = [...new Set(evaluaciones.map(e => e.proveedor))].sort();
        
        // Crear botones para cada proveedor
        botonesContainer.innerHTML = '';
        proveedoresUnicos.forEach(proveedor => {
            const btn = document.createElement('button');
            btn.className = 'btn-excel-individual';
            btn.textContent = `📄 ${proveedor}`;
            btn.onclick = () => descargarExcelPorProveedor(proveedor);
            botonesContainer.appendChild(btn);
        });
        
        // Mostrar evaluaciones
        container.innerHTML = '';
        evaluaciones.sort((a, b) => {
            // Ordenar por proveedor, luego por fecha (más reciente primero)
            if (a.proveedor !== b.proveedor) {
                return a.proveedor.localeCompare(b.proveedor);
            }
            return new Date(b.fecha) - new Date(a.fecha);
        });
        
        evaluaciones.forEach(eval => {
            const div = document.createElement('div');
            div.className = 'evaluacion-item';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.padding = '15px';
            
            const infoDiv = document.createElement('div');
            infoDiv.style.flex = '1';
            const fechaFormateada = new Date(eval.fecha).toLocaleString('es-ES');
            infoDiv.innerHTML = `
                <strong>${eval.proveedor}</strong> - ${eval.tipo} | ${fechaFormateada} | Resultado: ${eval.resultadoFinal.toFixed(2)}%
            `;
            
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn-eliminar';
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.onclick = () => eliminarEvaluacionPorId(eval.id);
            
            div.appendChild(infoDiv);
            div.appendChild(btnEliminar);
            container.appendChild(div);
        });
    }
    
    document.getElementById('modalEvaluaciones').style.display = 'block';
}

async function descargarExcel() {
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
        return new Date(b.fecha) - new Date(a.fecha);
    });
    
    crearYDescargarExcel(evaluaciones, 'Todas las Evaluaciones');
}

async function descargarExcelPorProveedor(nombreProveedor) {
    const evaluaciones = await cargarEvaluaciones();
    const evaluacionesProveedor = evaluaciones.filter(e => e.proveedor === nombreProveedor);
    
    if (evaluacionesProveedor.length === 0) {
        alert(`No hay evaluaciones para el proveedor ${nombreProveedor}.`);
        return;
    }
    
    // Ordenar por fecha (más reciente primero)
    evaluacionesProveedor.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    crearYDescargarExcel(evaluacionesProveedor, nombreProveedor);
}

function crearYDescargarExcel(evaluaciones, titulo) {
    // Preparar datos para Excel
    const datosExcel = [];
    
    evaluaciones.forEach(eval => {
        const items = eval.tipo === 'PRODUCTO' ? itemsProducto : itemsServicio;
        const fila = {
            'Fecha': eval.fecha,
            'Evaluador': eval.evaluador,
            'Proveedor': eval.proveedor,
            'Correo Proveedor': eval.correoProveedor || 'No especificado',
            'Tipo': eval.tipo,
            'Resultado Final (%)': eval.resultadoFinal.toFixed(2)
        };
        
        // Agregar respuestas por ítem en orden
        items.forEach(item => {
            const respuesta = eval.respuestas[item.nombre] || 0;
            fila[`${item.nombre} (${item.ponderacion}%)`] = respuesta + '%';
        });
        
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

function generarContenidoCorreo(evaluacion) {
    const items = evaluacion.tipo === 'PRODUCTO' ? itemsProducto : itemsServicio;
    
    let contenido = `Estimado/a Proveedor ${evaluacion.proveedor},\n\n`;
    contenido += `Le informamos los resultados de su evaluación realizada el ${evaluacion.fecha}.\n\n`;
    contenido += `INFORMACIÓN GENERAL:\n`;
    contenido += `${'='.repeat(60)}\n`;
    contenido += `Evaluador: ${evaluacion.evaluador}\n`;
    contenido += `Tipo de Proveedor: ${evaluacion.tipo}\n`;
    contenido += `Fecha de Evaluación: ${evaluacion.fecha}\n`;
    contenido += `${'='.repeat(60)}\n\n`;
    
    contenido += `DETALLE DE LA EVALUACIÓN POR ÍTEMS:\n`;
    contenido += `${'='.repeat(60)}\n\n`;
    
    // Crear tabla ordenada
    items.forEach((item, index) => {
        const respuesta = evaluacion.respuestas[item.nombre] || 0;
        contenido += `${index + 1}. ${item.nombre}\n`;
        contenido += `   Ponderación: ${item.ponderacion}%\n`;
        contenido += `   Calificación: ${respuesta}%\n`;
        contenido += `   Puntuación Ponderada: ${((respuesta * item.ponderacion) / 100).toFixed(2)}%\n\n`;
    });
    
    contenido += `${'='.repeat(60)}\n`;
    contenido += `RESULTADO FINAL PONDERADO: ${evaluacion.resultadoFinal.toFixed(2)}%\n`;
    contenido += `${'='.repeat(60)}\n\n`;
    
    contenido += `NOTA: Este resultado se calcula ponderando cada ítem según su importancia.\n\n`;
    contenido += `Agradecemos su atención y quedamos a disposición para cualquier consulta.\n\n`;
    contenido += `Saludos cordiales,\n`;
    contenido += `Equipo de Evaluación de Proveedores`;
    
    return contenido;
}

async function enviarCorreoIndividual(idEvaluacion) {
    const evaluaciones = await cargarEvaluaciones();
    const evaluacion = evaluaciones.find(e => e.id === idEvaluacion);
    
    if (!evaluacion) {
        alert('Evaluación no encontrada.');
        return;
    }
    
    if (!evaluacion.correoProveedor) {
        alert('No se ha especificado correo electrónico para este proveedor.');
        return;
    }
    
    // Primero generar y descargar el Excel para este proveedor
    const evaluacionesProveedor = [evaluacion];
    evaluacionesProveedor.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Crear Excel temporalmente
    const datosExcel = [];
    const items = evaluacion.tipo === 'PRODUCTO' ? itemsProducto : itemsServicio;
    const fechaFormateada = new Date(evaluacion.fecha).toLocaleString('es-ES');
    const fila = {
        'Fecha': fechaFormateada,
        'Evaluador': evaluacion.evaluador,
        'Proveedor': evaluacion.proveedor,
        'Correo Proveedor': evaluacion.correoProveedor || 'No especificado',
        'Tipo': evaluacion.tipo,
        'Resultado Final (%)': evaluacion.resultadoFinal.toFixed(2)
    };
    
    // Las respuestas vienen como array desde Supabase
    if (Array.isArray(evaluacion.respuestas)) {
        evaluacion.respuestas.forEach(resp => {
            const item = items.find(i => i.nombre === resp.item);
            if (item) {
                fila[`${item.nombre} (${item.ponderacion}%)`] = resp.valor + '%';
            }
        });
    } else {
        // Formato antiguo (objeto)
        items.forEach(item => {
            const respuesta = evaluacion.respuestas[item.nombre] || 0;
            fila[`${item.nombre} (${item.ponderacion}%)`] = respuesta + '%';
        });
    }
    datosExcel.push(fila);
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const colWidths = [];
    const headers = Object.keys(datosExcel[0]);
    headers.forEach(header => {
        colWidths.push({ wch: Math.max(header.length, 20) });
    });
    ws['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, 'Evaluación');
    
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Evaluacion_${evaluacion.proveedor.replace(/\s+/g, '_')}_${fecha}.xlsx`;
    
    // Descargar Excel
    XLSX.writeFile(wb, nombreArchivo);
    
    // Preparar correo
    const asunto = `Evaluación de Proveedor - ${evaluacion.proveedor} - ${evaluacion.fecha}`;
    let cuerpo = generarContenidoCorreo(evaluacion);
    cuerpo += `\n\nNOTA: Se ha generado un archivo Excel con el detalle completo de su evaluación.`;
    cuerpo += `\nEl archivo "${nombreArchivo}" se ha descargado automáticamente y puede adjuntarlo a este correo.`;
    
    const mailtoLink = `mailto:${evaluacion.correoProveedor}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    
    setTimeout(() => {
        window.location.href = mailtoLink;
    }, 500);
}

async function enviarCorreosProveedores() {
    const evaluaciones = await cargarEvaluaciones();
    
    if (evaluaciones.length === 0) {
        alert('No hay evaluaciones guardadas.');
        return;
    }
    
    // Filtrar evaluaciones con correo
    const evaluacionesConCorreo = evaluaciones.filter(e => e.correoProveedor);
    
    if (evaluacionesConCorreo.length === 0) {
        alert('No hay evaluaciones con correo electrónico especificado.');
        return;
    }
    
    // Ordenar por fecha (más reciente primero)
    evaluacionesConCorreo.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Agrupar por proveedor (última evaluación de cada proveedor)
    const proveedoresUnicos = {};
    evaluacionesConCorreo.forEach(eval => {
        if (!proveedoresUnicos[eval.proveedor] || new Date(eval.fecha) > new Date(proveedoresUnicos[eval.proveedor].fecha)) {
            proveedoresUnicos[eval.proveedor] = eval;
        }
    });
    
    const evaluacionesUnicas = Object.values(proveedoresUnicos);
    
    if (evaluacionesUnicas.length === 0) {
        alert('No hay evaluaciones para enviar.');
        return;
    }
    
    // Confirmar envío
    const confirmar = confirm(`Se enviarán correos a ${evaluacionesUnicas.length} proveedor(es).\n\nSe abrirá su cliente de correo para cada proveedor. ¿Desea continuar?`);
    
    if (!confirmar) {
        return;
    }
    
    // Enviar correos uno por uno con delay
    let indice = 0;
    function enviarSiguiente() {
        if (indice < evaluacionesUnicas.length) {
            const evaluacion = evaluacionesUnicas[indice];
            
            // Generar Excel para este proveedor
            const evaluacionesProveedor = evaluaciones.filter(e => e.proveedor === evaluacion.proveedor);
            evaluacionesProveedor.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            
            const datosExcel = [];
            evaluacionesProveedor.forEach(eval => {
                const items = eval.tipo === 'PRODUCTO' ? itemsProducto : itemsServicio;
                const fila = {
                    'Fecha': eval.fecha,
                    'Evaluador': eval.evaluador,
                    'Proveedor': eval.proveedor,
                    'Correo Proveedor': eval.correoProveedor || 'No especificado',
                    'Tipo': eval.tipo,
                    'Resultado Final (%)': eval.resultadoFinal.toFixed(2)
                };
                
                items.forEach(item => {
                    const respuesta = eval.respuestas[item.nombre] || 0;
                    fila[`${item.nombre} (${item.ponderacion}%)`] = respuesta + '%';
                });
                datosExcel.push(fila);
            });
            
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(datosExcel);
            const colWidths = [];
            const headers = Object.keys(datosExcel[0]);
            headers.forEach(header => {
                colWidths.push({ wch: Math.max(header.length, 20) });
            });
            ws['!cols'] = colWidths;
            XLSX.utils.book_append_sheet(wb, ws, 'Evaluaciones');
            
            const fecha = new Date().toISOString().split('T')[0];
            const nombreArchivo = `Evaluacion_${evaluacion.proveedor.replace(/\s+/g, '_')}_${fecha}.xlsx`;
            
            // Descargar Excel
            XLSX.writeFile(wb, nombreArchivo);
            
            // Preparar correo
            const asunto = `Evaluación de Proveedor - ${evaluacion.proveedor} - ${evaluacion.fecha}`;
            let cuerpo = generarContenidoCorreo(evaluacion);
            cuerpo += `\n\nNOTA: Se ha generado un archivo Excel con el detalle completo de su(s) evaluación(es).`;
            cuerpo += `\nEl archivo "${nombreArchivo}" se ha descargado automáticamente y puede adjuntarlo a este correo.`;
            
            const mailtoLink = `mailto:${evaluacion.correoProveedor}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
            
            // Abrir correo después de un pequeño delay para que se descargue el Excel
            setTimeout(() => {
                window.open(mailtoLink, '_blank');
            }, 500);
            
            indice++;
            
            // Esperar 3 segundos antes de enviar el siguiente (más tiempo para descargar Excel)
            if (indice < evaluacionesUnicas.length) {
                setTimeout(enviarSiguiente, 3000);
            } else {
                setTimeout(() => {
                    alert(`Se han generado ${evaluacionesUnicas.length} archivos Excel y abierto los correos correspondientes.`);
                }, 1000);
            }
        }
    }
    
    enviarSiguiente();
}

