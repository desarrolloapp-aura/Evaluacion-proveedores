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

// Sistema de navegación por pasos
let pasoActual = 0;
const totalPasos = 5;

function mostrarPaso(paso) {
    // Ocultar todos los pasos
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });

    // Mostrar el paso actual
    const stepElement = document.getElementById(`step${paso}`);
    if (stepElement) {
        stepElement.classList.add('active');
    }

    // Si estamos en el paso 4, asegurar que solo se muestre el resultado
    if (paso === 4) {
        // Calcular resultado si aún no se ha calculado
        calcularResultado();
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            resultSection.style.display = 'block';
        }
        // Ocultar items y correo (Validation fix: Do NOT hide itemsSection here, as it breaks the 'Back' button functionality)
        // itemsSection is naturally hidden because its parent #step3 is hidden.
        // const itemsSection = document.getElementById('itemsSection');
        // if (itemsSection) itemsSection.style.display = 'none';
    }

    // Actualizar indicador de progreso
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index < paso) {
            step.classList.add('completed');
        } else if (index === paso) {
            step.classList.add('active');
        }
    });

    // Mostrar/ocultar indicador de progreso
    const progressIndicator = document.getElementById('progressIndicator');
    if (progressIndicator) {
        if (paso === 0) {
            progressIndicator.style.display = 'none';
        } else {
            progressIndicator.style.display = 'flex';
        }
    }

    pasoActual = paso;
}

function siguientePaso() {
    // Verificar si la encuesta está disponible (solo en paso 0)
    if (pasoActual === 0) {
        const ahora = new Date();

        // Parsear fechas manualmente para evitar problemas de zona horaria
        let fechaInicio = null;
        let fechaFin = null;

        if (configEvaluacion?.fechaInicioEncuesta) {
            const fechaHoraStr = configEvaluacion.fechaInicioEncuesta;
            const [fechaParte, horaParte] = fechaHoraStr.split('T');
            if (fechaParte && horaParte) {
                const [anio, mes, dia] = fechaParte.split('-').map(Number);
                const [horas, minutos] = horaParte.split(':').map(Number);
                fechaInicio = new Date(anio, mes - 1, dia, horas, minutos || 0, 0, 0);
            }
        }

        if (configEvaluacion?.fechaFinEncuesta) {
            const fechaHoraStr = configEvaluacion.fechaFinEncuesta;
            const [fechaParte, horaParte] = fechaHoraStr.split('T');
            if (fechaParte && horaParte) {
                const [anio, mes, dia] = fechaParte.split('-').map(Number);
                const [horas, minutos] = horaParte.split(':').map(Number);
                fechaFin = new Date(anio, mes - 1, dia, horas, minutos || 0, 0, 0);
            }
        }

        let fueraDeRango = false;
        let mensaje = '';

        const formatearFecha = (fecha) => {
            return fecha.toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        if (fechaInicio && fechaFin) {
            if (ahora < fechaInicio) {
                fueraDeRango = true;
                mensaje = `La encuesta estará disponible a partir del ${formatearFecha(fechaInicio)}.`;
            } else if (ahora > fechaFin) {
                fueraDeRango = true;
                mensaje = `La encuesta ya no está disponible. El período de evaluación finalizó el ${formatearFecha(fechaFin)}.`;
            }
        } else if (fechaInicio) {
            if (ahora < fechaInicio) {
                fueraDeRango = true;
                mensaje = `La encuesta estará disponible a partir del ${formatearFecha(fechaInicio)}.`;
            }
        } else if (fechaFin) {
            if (ahora > fechaFin) {
                fueraDeRango = true;
                mensaje = `La encuesta ya no está disponible. El período de evaluación finalizó el ${formatearFecha(fechaFin)}.`;
            }
        }

        if (fueraDeRango) {
            alert(`⚠️ ${mensaje}`);
            return;
        }
    }

    // Validar paso actual antes de avanzar
    if (!validarPasoActual()) {
        return;
    }

    if (pasoActual < totalPasos - 1) {
        const siguiente = pasoActual + 1;

        // Si estamos avanzando al paso 2, actualizar proveedores
        if (pasoActual === 1) {
            actualizarProveedores().then(() => {
                mostrarPaso(siguiente);
            });
            return;
        }

        // Si estamos avanzando al paso 3, mostrar items y correo
        if (pasoActual === 2) {
            mostrarItemsEvaluacion();
        }

        // Si estamos avanzando al paso 4, calcular resultado y mostrar
        if (pasoActual === 3) {
            calcularResultado();
            // Asegurar que el resultado se muestre
            const resultSection = document.getElementById('resultSection');
            if (resultSection) {
                resultSection.style.display = 'block';
            }
        }

        mostrarPaso(siguiente);
    }
}

function anteriorPaso() {
    if (pasoActual > 0) {
        mostrarPaso(pasoActual - 1);
    }
}

// Hacer funciones globales inmediatamente (antes de DOMContentLoaded)
window.siguientePaso = siguientePaso;
window.anteriorPaso = anteriorPaso;

function validarPasoActual() {
    // Paso 0 no requiere validación
    if (pasoActual === 0) {
        return true;
    }

    switch (pasoActual) {
        case 1:
            const evaluador = document.getElementById('evaluador').value;
            const tipoProveedor = document.querySelector('input[name="tipoProveedor"]:checked');

            if (!evaluador) {
                alert('Por favor seleccione un evaluador.');
                return false;
            }
            if (!tipoProveedor) {
                alert('Por favor seleccione un tipo de proveedor.');
                return false;
            }
            return true;

        case 2:
            const proveedor = document.getElementById('proveedor').value;

            if (!proveedor) {
                alert('Por favor seleccione un proveedor.');
                return false;
            }
            return true;

        case 3:
            const tipoProveedorCheck = document.querySelector('input[name="tipoProveedor"]:checked');
            if (!tipoProveedorCheck) return true;

            const items = tipoProveedorCheck.value === 'PRODUCTO' ? itemsProducto : itemsServicio;
            let todosCompletos = true;

            items.forEach((item, index) => {
                const respuesta = document.querySelector(`input[name="item_${index}"]:checked`);
                if (!respuesta) {
                    todosCompletos = false;
                }
            });

            if (!todosCompletos) {
                alert('Por favor responda todas las preguntas antes de continuar.');
                return false;
            }
            return true;

        default:
            return true;
    }
}

// Inicializar año actual por defecto
document.addEventListener('DOMContentLoaded', async function () {
    // Inicializar con valores por defecto primero (para mostrar la página inmediatamente)
    if (!configEvaluacion) {
        configEvaluacion = getConfiguracionDefault();
        itemsProducto = configEvaluacion.itemsProducto || [];
        itemsServicio = configEvaluacion.itemsServicio || [];
    }

    // Mostrar la página con valores por defecto
    actualizarInformacionDesdeConfig();
    inicializarEvaluadores();
    inicializarEventos();
    mostrarPaso(0);

    // Cargar datos desde Supabase (solo para verificar si hay cambios)
    try {
        console.log('Verificando datos desde Supabase...');

        // Cargar configuración
        const configDesdeBD = await cargarConfiguracionEvaluacionLocal();

        // Actualizar configEvaluacion con los datos de la BD (siempre, para asegurar que las fechas se carguen)
        if (configDesdeBD) {
            configEvaluacion = { ...configEvaluacion, ...configDesdeBD };
            itemsProducto = configEvaluacion.itemsProducto || [];
            itemsServicio = configEvaluacion.itemsServicio || [];

            // Actualizar la información solo si hubo cambios
            if (JSON.stringify(configDesdeBD) !== JSON.stringify(configEvaluacion) || !configEvaluacion.titulo) {
                actualizarInformacionDesdeConfig();
            }
        }

        // Verificar rango de fechas después de cargar la configuración
        // Esperar un poco más para asegurar que configEvaluacion esté actualizado
        setTimeout(() => {
            console.log('📅 Verificando rango de fechas...', {
                fechaInicio: configEvaluacion?.fechaInicioEncuesta,
                fechaFin: configEvaluacion?.fechaFinEncuesta,
                configEvaluacion: configEvaluacion
            });
            verificarRangoFechas();
        }, 300);

        // Cargar asignaciones y evaluadores
        asignacionProveedores = await cargarAsignacionProveedores();
        const evaluadoresDesdeBD = await cargarEvaluadores();

        // Actualizar evaluadores solo si hay cambios
        if (evaluadoresDesdeBD.length > 0) {
            evaluadores = evaluadoresDesdeBD;
            inicializarEvaluadores();
        } else if (Object.keys(asignacionProveedores).length > 0) {
            evaluadores = Object.keys(asignacionProveedores);
            inicializarEvaluadores();
        }

        // Cargar evaluaciones para obtener años disponibles
        const evaluaciones = await cargarEvaluaciones();

        // Inicializar selector de años
        await inicializarSelectorAnios(evaluaciones);

        console.log('✅ Datos verificados desde Supabase');
    } catch (error) {
        console.error('Error al verificar datos desde Supabase, usando valores por defecto:', error);
        // Si hay error, mantener los valores por defecto que ya están cargados
    }
});

// Inicializar fecha de evaluación (mostrar fecha actual)
async function inicializarSelectorAnios(evaluaciones) {
    const anioInput = document.getElementById('anioEvaluacion');
    const fechaTexto = document.getElementById('fechaTexto');

    if (!anioInput) return;

    // Establecer fecha actual
    const hoy = new Date();
    const fechaFormato = hoy.toISOString().split('T')[0]; // YYYY-MM-DD
    anioInput.value = fechaFormato;
    anioInput.dataset.anio = hoy.getFullYear();

    // Mostrar fecha formateada en español
    if (fechaTexto) {
        const dia = hoy.getDate();
        const mes = hoy.toLocaleString('es-ES', { month: 'long' });
        const anio = hoy.getFullYear();
        fechaTexto.textContent = `${dia} de ${mes} de ${anio}`;
    }
}

function actualizarInformacionDesdeConfig() {
    // Verificar que configEvaluacion existe
    if (!configEvaluacion) {
        console.warn('configEvaluacion no está disponible aún');
        return;
    }

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

// Función para verificar si la fecha actual está dentro del rango configurado
function verificarRangoFechas() {
    const mensajeDiv = document.getElementById('mensajeRangoFechas');
    const mensajeTexto = document.getElementById('mensajeRangoTexto');
    const form = document.getElementById('evaluationForm');
    const comenzarBtn = document.getElementById('comenzarBtn');

    if (!mensajeDiv || !configEvaluacion) return;

    const ahora = new Date();

    // Parsear fechas manualmente para evitar problemas de zona horaria
    // Las fechas vienen en formato YYYY-MM-DDTHH:MM:SS (sin zona horaria)
    let fechaInicio = null;
    let fechaFin = null;

    if (configEvaluacion.fechaInicioEncuesta) {
        const fechaHoraStr = configEvaluacion.fechaInicioEncuesta;
        // Extraer fecha y hora directamente sin conversión de zona horaria
        const [fechaParte, horaParte] = fechaHoraStr.split('T');
        if (fechaParte && horaParte) {
            const [anio, mes, dia] = fechaParte.split('-').map(Number);
            const [horas, minutos] = horaParte.split(':').map(Number);
            // Crear fecha en hora local (no UTC)
            fechaInicio = new Date(anio, mes - 1, dia, horas, minutos || 0, 0, 0);
        }
    }

    if (configEvaluacion.fechaFinEncuesta) {
        const fechaHoraStr = configEvaluacion.fechaFinEncuesta;
        // Extraer fecha y hora directamente sin conversión de zona horaria
        const [fechaParte, horaParte] = fechaHoraStr.split('T');
        if (fechaParte && horaParte) {
            const [anio, mes, dia] = fechaParte.split('-').map(Number);
            const [horas, minutos] = horaParte.split(':').map(Number);
            // Crear fecha en hora local (no UTC)
            fechaFin = new Date(anio, mes - 1, dia, horas, minutos || 0, 0, 0);
        }
    }

    if (!fechaInicio && !fechaFin) {
        mensajeDiv.style.display = 'none';
        if (form) {
            form.style.pointerEvents = 'auto';
            form.style.opacity = '1';
        }
        if (comenzarBtn) {
            comenzarBtn.disabled = false;
            comenzarBtn.title = '';
        }
        return;
    }

    let fueraDeRango = false;
    let mensaje = '';
    let tipoMensaje = 'info';

    const formatearFecha = (fecha) => {
        return fecha.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (fechaInicio && fechaFin) {
        if (ahora < fechaInicio) {
            fueraDeRango = true;
            tipoMensaje = 'warning';
            mensaje = `La encuesta estará disponible desde el ${formatearFecha(fechaInicio)} hasta el ${formatearFecha(fechaFin)}.`;
        } else if (ahora > fechaFin) {
            fueraDeRango = true;
            tipoMensaje = 'error';
            mensaje = `La encuesta ya no está disponible. El período de evaluación finalizó el ${formatearFecha(fechaFin)}.`;
        } else {
            tipoMensaje = 'info';
            mensaje = `La encuesta está disponible desde el ${formatearFecha(fechaInicio)} hasta el ${formatearFecha(fechaFin)}.`;
        }
    } else if (fechaInicio) {
        if (ahora < fechaInicio) {
            fueraDeRango = true;
            tipoMensaje = 'warning';
            mensaje = `La encuesta estará disponible a partir del ${formatearFecha(fechaInicio)}.`;
        } else {
            tipoMensaje = 'info';
            mensaje = `La encuesta está disponible desde el ${formatearFecha(fechaInicio)}.`;
        }
    } else if (fechaFin) {
        if (ahora > fechaFin) {
            fueraDeRango = true;
            tipoMensaje = 'error';
            mensaje = `La encuesta ya no está disponible. El período de evaluación finalizó el ${formatearFecha(fechaFin)}.`;
        } else {
            tipoMensaje = 'info';
            mensaje = `La encuesta estará disponible hasta el ${formatearFecha(fechaFin)}.`;
        }
    }

    mensajeDiv.style.display = 'block';
    if (mensajeTexto) mensajeTexto.innerHTML = mensaje;

    const tituloMensaje = document.getElementById('mensajeRangoTitulo');
    if (tituloMensaje) {
        if (tipoMensaje === 'error') {
            tituloMensaje.textContent = 'La encuesta no está disponible';
        } else if (tipoMensaje === 'warning') {
            tituloMensaje.textContent = 'La encuesta aún no está disponible';
        } else {
            tituloMensaje.textContent = 'Período de evaluación';
        }
    }

    const icono = mensajeDiv.querySelector('.mensaje-icono');
    if (tipoMensaje === 'error') {
        mensajeDiv.style.background = 'linear-gradient(135deg, #fee 0%, #fcc 100%)';
        mensajeDiv.style.borderColor = '#f33';
        if (icono) icono.textContent = '❌';
        if (tituloMensaje) tituloMensaje.style.color = '#c33';
        if (mensajeTexto) mensajeTexto.style.color = '#c33';
    } else if (tipoMensaje === 'warning') {
        mensajeDiv.style.background = 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)';
        mensajeDiv.style.borderColor = '#ffc107';
        if (icono) icono.textContent = '⚠️';
        if (tituloMensaje) tituloMensaje.style.color = '#856404';
        if (mensajeTexto) mensajeTexto.style.color = '#856404';
    } else {
        mensajeDiv.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
        mensajeDiv.style.borderColor = '#10b981';
        if (icono) icono.textContent = 'ℹ️';
        if (tituloMensaje) tituloMensaje.style.color = '#065f46';
        if (mensajeTexto) mensajeTexto.style.color = '#065f46';
    }

    if (fueraDeRango) {
        if (form) {
            form.style.pointerEvents = 'none';
            form.style.opacity = '0.6';
        }
        if (comenzarBtn) {
            comenzarBtn.disabled = true;
            comenzarBtn.style.opacity = '0.5';
            comenzarBtn.style.cursor = 'not-allowed';
            comenzarBtn.title = mensaje;
        }
    } else {
        if (form) {
            form.style.pointerEvents = 'auto';
            form.style.opacity = '1';
        }
        if (comenzarBtn) {
            comenzarBtn.disabled = false;
            comenzarBtn.style.opacity = '1';
            comenzarBtn.style.cursor = 'pointer';
            comenzarBtn.title = '';
        }
    }
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
    document.getElementById('evaluador').addEventListener('change', async function () {
        await actualizarProveedores();
    });

    // La fecha se establece automáticamente al cargar, no necesita evento de cambio

    // Cambio de tipo de proveedor
    document.querySelectorAll('input[name="tipoProveedor"]').forEach(radio => {
        radio.addEventListener('change', async function () {
            await actualizarProveedores();
        });
    });

    // Cambio de proveedor
    document.getElementById('proveedor').addEventListener('change', function () {
        mostrarItemsEvaluacion();
    });

    // Cambio en respuestas
    document.addEventListener('change', function (e) {
        if (e.target.name && e.target.name.startsWith('item_')) {
            calcularResultado();
            // Actualizar estado visual de los labels
            actualizarEstadoRadioButtons(e.target);
        }
    });

    // Actualizar estado visual cuando se carga la página
    document.addEventListener('click', function (e) {
        if (e.target.type === 'radio' && e.target.name.startsWith('item_')) {
            actualizarEstadoRadioButtons(e.target);
            // También calcular resultado al hacer click
            calcularResultado();
        }
    });

    // Envío del formulario
    document.getElementById('evaluationForm').addEventListener('submit', function (e) {
        e.preventDefault();
        guardarEvaluacion();
    });

    // Limpiar formulario (Button removed, logic kept for internal use)
    // document.getElementById('limpiarBtn').addEventListener('click', ... );

}

async function actualizarProveedores() {
    const evaluador = document.getElementById('evaluador').value;
    const tipoProveedor = document.querySelector('input[name="tipoProveedor"]:checked');
    // Usar siempre la fecha actual
    const hoy = new Date();
    const anioEvaluacion = hoy.getFullYear();
    const selectProveedor = document.getElementById('proveedor');

    // Limpiar opciones
    selectProveedor.innerHTML = '<option value="">-- Seleccione un proveedor --</option>';

    if (!evaluador) {
        selectProveedor.innerHTML = '<option value="">-- Primero seleccione un evaluador --</option>';
        // Ocultar items y correo
        // Ocultar items y correo
        const itemsSection = document.getElementById('itemsSection');
        if (itemsSection) itemsSection.style.display = 'none';

        const resultSection = document.getElementById('resultSection');
        if (resultSection) resultSection.style.display = 'none';

        // Removed dead code for correoSection and correoProveedor
        return;
    }

    if (tipoProveedor) {
        // Obtener evaluaciones guardadas
        const evaluaciones = await cargarEvaluaciones();

        // Obtener proveedores ya evaluados por este evaluador, tipo y año
        const proveedoresEvaluados = new Set();
        evaluaciones.forEach(e => {
            const anioEval = new Date(e.fecha).getFullYear();
            if (e.evaluador === evaluador &&
                e.tipo === tipoProveedor.value &&
                anioEval === parseInt(anioEvaluacion)) {
                proveedoresEvaluados.add(e.proveedor);
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
    const itemsSection = document.getElementById('itemsSection');
    if (itemsSection) itemsSection.style.display = 'none';

    const resultSection = document.getElementById('resultSection');
    if (resultSection) resultSection.style.display = 'none';

    // Removed dead code for correoSection and correoProveedor
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
    // Deprecated
}

async function mostrarItemsEvaluacion() {
    const tipoProveedor = document.querySelector('input[name="tipoProveedor"]:checked');
    const proveedor = document.getElementById('proveedor').value;

    if (!tipoProveedor || !proveedor) {
        return;
    }

    const items = tipoProveedor.value === 'PRODUCTO' ? itemsProducto : itemsServicio;
    const container = document.getElementById('itemsContainer');
    const title = document.getElementById('itemsTitle');

    title.textContent = tipoProveedor.value === 'PRODUCTO' ? '4. Ítems de Evaluación - PRODUCTO' : '4. Ítems de Evaluación - SERVICIO';

    container.innerHTML = '<p>Cargando información del proveedor...</p>';

    // Cargar evaluaciones administrativas si existen
    let adminEvaluations = {};
    if (typeof cargarEvaluacionesAdmin === 'function') {
        adminEvaluations = await cargarEvaluacionesAdmin(proveedor);
    }

    container.innerHTML = '';

    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-evaluacion';

        let labelContent = `${item.nombre} <span class="ponderacion">(${item.ponderacion}%)</span>`;
        // Removed explicit "Evaluación Administrativa" badge locally as requested

        const label = document.createElement('label');
        label.innerHTML = labelContent;

        const radioGroup = document.createElement('div');
        radioGroup.className = 'radio-options';

        if (item.adminEvaluated && adminEvaluations[item.nombre] !== undefined) {
            // ... kept same logic for ALREADY EVALUATED items ...
            const adminScore = adminEvaluations[item.nombre];
            // ... (rest of the block for showing fixed score) ...
            const resultDiv = document.createElement('div');
            resultDiv.style.padding = '10px';
            resultDiv.style.backgroundColor = '#fff3cd';
            resultDiv.style.borderRadius = '5px';
            resultDiv.style.border = '1px solid #ffeeba';
            resultDiv.style.color = '#856404';
            resultDiv.style.fontWeight = 'bold';
            resultDiv.innerHTML = `✅ Este ítem ha sido evaluado de forma automatica por el sistema: <span style="font-size: 1.2em;">${adminScore}%</span>`;

            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'radio';
            hiddenInput.name = `item_${index}`;
            hiddenInput.value = adminScore;
            hiddenInput.checked = true;
            hiddenInput.style.display = 'none';
            radioGroup.appendChild(hiddenInput);

            radioGroup.appendChild(resultDiv);
        } else {
            // ... Normal implementation without extra text ...
            // Removed the block that added "Este ítem será revisado..."
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
        }

        itemDiv.appendChild(label);
        itemDiv.appendChild(radioGroup);
        container.appendChild(itemDiv);
    });

    document.getElementById('itemsSection').style.display = 'block';

    // Recalculate result immediately to account for pre-filled admin items
    setTimeout(calcularResultado, 100);
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

        const porcentaje = parseFloat(respuesta.value);
        resultadoPonderado += (porcentaje * item.ponderacion) / 100;
    });

    if (todosCompletos) {
        document.getElementById('resultadoFinal').textContent = resultadoPonderado.toFixed(2) + '%';
        // Solo mostrar el resultado si estamos en el paso 4
        if (pasoActual === 4) {
            const resultSection = document.getElementById('resultSection');
            if (resultSection) {
                resultSection.style.display = 'block';
            }
        }
    } else {
        // Si no están todos completos y estamos en paso 4, ocultar
        if (pasoActual === 4) {
            const resultSection = document.getElementById('resultSection');
            if (resultSection) {
                resultSection.style.display = 'none';
            }
        }
    }
}

async function guardarEvaluacion() {
    // Verificar rango de fechas antes de guardar (considerando hora)
    const ahora = new Date(); // Usar fecha y hora actuales

    const fechaInicio = configEvaluacion?.fechaInicioEncuesta ? new Date(configEvaluacion.fechaInicioEncuesta) : null;
    const fechaFin = configEvaluacion?.fechaFinEncuesta ? new Date(configEvaluacion.fechaFinEncuesta) : null;

    if (fechaInicio) {
        if (ahora < fechaInicio) {
            const fechaInicioFormateada = fechaInicio.toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            alert(`⚠️ La encuesta aún no está disponible. Por favor, espere hasta el ${fechaInicioFormateada}.`);
            return;
        }
    }

    if (fechaFin) {
        if (ahora > fechaFin) {
            const fechaFinFormateada = fechaFin.toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            alert(`⚠️ La encuesta ya no está disponible. El período de evaluación finalizó el ${fechaFinFormateada}.`);
            return;
        }
    }

    const evaluador = document.getElementById('evaluador').value;
    const tipoProveedor = document.querySelector('input[name="tipoProveedor"]:checked');
    const proveedor = document.getElementById('proveedor').value;

    // Usar siempre la fecha actual del día
    const hoy = new Date();
    const fechaSeleccionada = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const anioEvaluacion = hoy.getFullYear();
    const resultadoFinal = document.getElementById('resultadoFinal').textContent;

    if (!evaluador || !tipoProveedor || !proveedor || resultadoFinal === '0%') {
        alert('Por favor complete todos los campos y responda todas las preguntas.');
        return;
    }

    // Guardar en Supabase (usando la función de supabase-service.js)
    // Convertir respuestas a formato array INTELIGENTE: incluyen ponderacion
    const items = tipoProveedor.value === 'PRODUCTO' ? itemsProducto : itemsServicio;
    const respuestasArray = [];

    items.forEach((item, index) => {
        const respuesta = document.querySelector(`input[name="item_${index}"]:checked`);
        if (respuesta) {
            respuestasArray.push({
                item: item.nombre,
                valor: parseFloat(respuesta.value),
                ponderacion: item.ponderacion // Guardamos la ponderacion HISTÓRICA
            });
        }
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
        // Obtener correo del proveedor desde la configuración si existe
        let correoProveedor = '';
        if (configEvaluacion && configEvaluacion.proveedores && configEvaluacion.proveedores[proveedor]) {
            const provData = configEvaluacion.proveedores[proveedor];
            if (typeof provData === 'object' && provData.email) {
                correoProveedor = provData.email;
            }
        }

        // Llamar a la función de supabase-service.js
        const evaluadorVal = document.getElementById('evaluador').value;
        const proveedorVal = document.getElementById('proveedor').value;
        const tipoProveedorVal = document.querySelector('input[name="tipoProveedor"]:checked')?.value || '';

        const evaluacionData = {
            evaluador: evaluadorVal,
            proveedor: proveedorVal,
            tipo: tipoProveedorVal,
            correoProveedor: correoProveedor,
            respuestas: respuestasArray,
            resultadoFinal: parseFloat(document.getElementById('resultadoFinal').textContent.replace('%', '')),
            fechaEvaluacion: fechaEvaluacion, // Fecha del calendario para fecha_evaluacion
            anio: anioEvaluacion // Año extraído de la fecha del calendario
        };

        // Usar window para asegurar que llamamos a la función global de supabase-service.js
        console.log('💾 Intentando guardar evaluación:', evaluacionData);

        if (typeof guardarEvaluacionEnSupabase === 'function') {
            console.log('✅ Usando guardarEvaluacionEnSupabase');
            await guardarEvaluacionEnSupabase(evaluacionData);
        } else if (typeof window.guardarEvaluacionEnSupabase === 'function') {
            console.log('✅ Usando window.guardarEvaluacionEnSupabase');
            await window.guardarEvaluacionEnSupabase(evaluacionData);
        } else {
            console.error('❌ guardarEvaluacionEnSupabase no está disponible');
            throw new Error('La función guardarEvaluacionEnSupabase no está disponible. Por favor, recargue la página.');
        }

        console.log('✅ Evaluación guardada exitosamente');

        // Mostrar modal de éxito
        mostrarModalExito();
        limpiarFormulario();
        await actualizarProveedores();
        // Volver al inicio (paso 0) después de cerrar el modal
        setTimeout(() => {
            mostrarPaso(0);
        }, 500);
    } catch (error) {
        console.error('Error al guardar evaluación:', error);
        alert('❌ Error al guardar la evaluación. Por favor, intente nuevamente.');
    }
}

// Función para mostrar el modal de éxito
function mostrarModalExito() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Función para cerrar el modal de éxito
function cerrarModalExito() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Hacer funciones globales
window.mostrarModalExito = mostrarModalExito;
window.cerrarModalExito = cerrarModalExito;

// Cerrar modal al hacer clic fuera de él
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                cerrarModalExito();
            }
        });
    }
});

function limpiarFormulario() {
    document.getElementById('evaluationForm').reset();
    document.getElementById('proveedor').innerHTML = '<option value="">-- Primero seleccione el tipo de proveedor --</option>';
    document.getElementById('itemsContainer').innerHTML = '';
    document.getElementById('itemsSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';

    // Restablecer fecha actual (actualizar el display)
    const fechaTexto = document.getElementById('fechaTexto');
    const anioInput = document.getElementById('anioEvaluacion');
    if (anioInput && fechaTexto) {
        const hoy = new Date();
        anioInput.value = hoy.toISOString().split('T')[0];
        const dia = hoy.getDate();
        const mes = hoy.toLocaleString('es-ES', { month: 'long' });
        const anio = hoy.getFullYear();
        fechaTexto.textContent = `${dia} de ${mes} de ${anio}`;
    }

    // Volver al paso inicial
    mostrarPaso(0);
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

        evaluaciones.forEach(e => {
            const div = document.createElement('div');
            div.className = 'evaluacion-item';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.padding = '15px';

            const infoDiv = document.createElement('div');
            infoDiv.style.flex = '1';
            const fechaFormateada = new Date(e.fecha).toLocaleString('es-ES');
            infoDiv.innerHTML = `
                <strong>${e.proveedor}</strong> - ${e.tipo} | ${fechaFormateada} | Resultado: ${e.resultadoFinal.toFixed(2)}%
            `;

            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn-eliminar';
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.onclick = () => eliminarEvaluacionPorId(e.id);

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

    evaluaciones.forEach(e => {
        const items = e.tipo === 'PRODUCTO' ? itemsProducto : itemsServicio;
        const fila = {
            'Fecha': e.fecha,
            'Evaluador': e.evaluador,
            'Proveedor': e.proveedor,
            'Correo Proveedor': e.correoProveedor || 'No especificado',
            'Tipo': e.tipo,
            'Resultado Final (%)': e.resultadoFinal.toFixed(2)
        };

        // Agregar respuestas por ítem en orden
        items.forEach(item => {
            const respuesta = e.respuestas[item.nombre] || 0;
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
    evaluacionesConCorreo.forEach(e => {
        if (!proveedoresUnicos[e.proveedor] || new Date(e.fecha) > new Date(proveedoresUnicos[e.proveedor].fecha)) {
            proveedoresUnicos[e.proveedor] = e;
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
            evaluacionesProveedor.forEach(e => {
                const items = e.tipo === 'PRODUCTO' ? itemsProducto : itemsServicio;

                // Intentar obtener email de la evaluación o de la configuración
                let emailProv = e.correoProveedor;
                if (!emailProv && configuracion && configuracion.proveedores && configuracion.proveedores[e.proveedor]) {
                    const provData = configuracion.proveedores[e.proveedor];
                    if (typeof provData === 'object' && provData.email) {
                        emailProv = provData.email;
                    }
                }

                const fila = {
                    'Fecha': e.fecha,
                    'Evaluador': e.evaluador,
                    'Proveedor': e.proveedor,
                    'Correo Proveedor': emailProv || 'No especificado',
                    'Tipo': e.tipo,
                    'Resultado Final (%)': e.resultadoFinal.toFixed(2)
                };

                items.forEach(item => {
                    const respuesta = e.respuestas[item.nombre] || 0;
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

            // Obtener email para el mailto
            let emailDestino = evaluacion.correoProveedor;
            if (!emailDestino && configuracion && configuracion.proveedores && configuracion.proveedores[evaluacion.proveedor]) {
                const provData = configuracion.proveedores[evaluacion.proveedor];
                if (typeof provData === 'object' && provData.email) {
                    emailDestino = provData.email;
                }
            }

            const mailtoLink = `mailto:${emailDestino || ''}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;

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

