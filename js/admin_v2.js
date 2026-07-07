// Panel de Administración - Sistema de Evaluación de Proveedores

// Función helper para detectar si es móvil
function esMovil() {
    return window.innerWidth <= 900;
}

// Valores por defecto (debe estar antes de cargarConfiguracion)
const configuracionDefault = {
    titulo: 'Evaluación de Proveedores ',
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
    console.log('💾 Ejecutando guardarConfiguracion()...');

    try {
        // Guardar configuración de evaluación (incluyendo todos los campos)
        console.log('💾 Guardando configuración de evaluación en Supabase...');
        const resultado = await guardarConfiguracionEvaluacion({
            titulo: configuracion.titulo,
            descripcion: configuracion.descripcion,
            objetivo: configuracion.objetivo,
            itemsProducto: configuracion.itemsProducto,
            itemsServicio: configuracion.itemsServicio,
            anioEncuesta: configuracion.anioEncuesta,
            fechaInicioEncuesta: configuracion.fechaInicioEncuesta,
            fechaFinEncuesta: configuracion.fechaFinEncuesta,
            zonaHorariaEncuesta: configuracion.zonaHorariaEncuesta
        });

        if (!resultado) {
            throw new Error('No se pudo guardar la configuración de evaluación');
        }

        console.log('✅ Configuración de evaluación guardada');

        // Guardar asignaciones
        if (configuracion.asignacionProveedores) {
            console.log('💾 Guardando asignaciones...');
            await guardarAsignaciones(configuracion.asignacionProveedores);
            console.log('✅ Asignaciones guardadas');
        }

        mostrarMensaje('✅ Configuración guardada exitosamente en la base de datos.');
        console.log('✅ Guardado completo exitoso');
    } catch (error) {
        console.error('❌ Error al guardar configuración:', error);
        mostrarMensaje('❌ Error al guardar la configuración. Por favor, intente nuevamente.');
        throw error; // Re-lanzar para que se maneje en guardarConfiguracionCompleta
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
        alert('✅ Datos iniciales cargados en la base de datos.');
        // Recargar solo la configuración sin recargar toda la página
        configuracion = await cargarConfiguracion();
        await inicializarFormulario();
        // Recargar solo la configuración sin recargar toda la página
        configuracion = await cargarConfiguracion();
        await inicializarFormulario();
    } catch (error) {
        console.error('Error al inicializar datos por defecto:', error);
        alert('⚠️ Error al inicializar datos por defecto: ' + error.message);
    }
}

async function inicializar() {
    // Validar de forma estricta que la contraseña de administrador esté presente y sea válida
    const passwordAdmin = sessionStorage.getItem('adminPassword');
    const esValida = await validarPasswordAdmin(passwordAdmin);
    if (!esValida) {
        console.error('❌ Acceso no autorizado detectado. Redirigiendo...');
        sessionStorage.clear();
        window.location.href = 'login-admin.html';
        return;
    }

    try {
        console.log('Iniciando panel de administración...');

        // Inicializar eventos primero (no bloquea)
        inicializarEventos();

        // Cargar formulario inmediatamente con datos disponibles
        await inicializarFormulario();

        // Verificar datos por defecto en segundo plano (no bloquea la UI)
        // Solo se ejecuta si no hay datos, y no recarga la página
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
    const anioInput = document.getElementById('anioEncuesta');
    const fechaInicioInput = document.getElementById('fechaInicioEncuesta');
    const fechaFinInput = document.getElementById('fechaFinEncuesta');

    if (tituloInput) tituloInput.value = configuracion.titulo || configuracionDefault.titulo;
    if (descripcionInput) descripcionInput.value = configuracion.descripcion || configuracionDefault.descripcion;
    if (objetivoInput) objetivoInput.value = configuracion.objetivo || configuracionDefault.objetivo;

    // Cargar configuración de fechas
    const hoy = new Date();
    const anioActual = hoy.getFullYear();

    // Definir variables de hora y zona horaria
    const horaInicioInput = document.getElementById('horaInicioEncuesta');
    const horaFinInput = document.getElementById('horaFinEncuesta');
    const zonaHorariaInput = document.getElementById('zonaHorariaEncuesta');

    if (anioInput) {
        // Establecer año mínimo como el año actual (no permitir años anteriores)
        anioInput.min = anioActual;
        anioInput.value = configuracion.anioEncuesta || anioActual;

        // Si el año guardado es anterior al actual, usar el año actual
        const anioGuardado = parseInt(configuracion.anioEncuesta) || anioActual;
        if (anioGuardado < anioActual) {
            anioInput.value = anioActual;
        }

        // Establecer restricciones de fechas según el año
        const anio = parseInt(anioInput.value) || anioActual;
        const fechaMinima = hoy.toISOString().split('T')[0];
        const fechaMinAnio = `${anio}-01-01`;
        const fechaMaxAnio = `${anio}-12-31`;
        // La fecha mínima es el mayor entre hoy y el inicio del año
        const fechaMin = fechaMinAnio > fechaMinima ? fechaMinAnio : fechaMinima;

        if (fechaInicioInput) {
            fechaInicioInput.min = fechaMin;
            fechaInicioInput.max = fechaMaxAnio;
            // Separar fecha y hora si vienen juntas
            if (configuracion.fechaInicioEncuesta) {
                // Extraer fecha directamente de la cadena para evitar problemas de zona horaria
                const fechaHoraStr = configuracion.fechaInicioEncuesta;
                // Formato esperado: YYYY-MM-DDTHH:MM:SS o YYYY-MM-DDTHH:MM:SS.000Z
                const fechaParte = fechaHoraStr.split('T')[0]; // Extrae YYYY-MM-DD
                fechaInicioInput.value = fechaParte;
                if (horaInicioInput) {
                    // Extraer hora de la parte después de 'T'
                    const horaParte = fechaHoraStr.split('T')[1];
                    if (horaParte) {
                        // Formato: HH:MM:SS o HH:MM:SS.000Z
                        const hora = horaParte.split(':').slice(0, 2).join(':'); // Toma solo HH:MM
                        horaInicioInput.value = hora;
                    }
                }
            }
        }
        if (fechaFinInput) {
            fechaFinInput.min = fechaMin;
            fechaFinInput.max = fechaMaxAnio;
            // Separar fecha y hora si vienen juntas
            if (configuracion.fechaFinEncuesta) {
                // Extraer fecha directamente de la cadena para evitar problemas de zona horaria
                const fechaHoraStr = configuracion.fechaFinEncuesta;
                // Formato esperado: YYYY-MM-DDTHH:MM:SS o YYYY-MM-DDTHH:MM:SS.000Z
                const fechaParte = fechaHoraStr.split('T')[0]; // Extrae YYYY-MM-DD
                fechaFinInput.value = fechaParte;
                if (horaFinInput) {
                    // Extraer hora de la parte después de 'T'
                    const horaParte = fechaHoraStr.split('T')[1];
                    if (horaParte) {
                        // Formato: HH:MM:SS o HH:MM:SS.000Z
                        const hora = horaParte.split(':').slice(0, 2).join(':'); // Toma solo HH:MM
                        horaFinInput.value = hora;
                    }
                }
            }
            // Establecer fecha mínima basada en fecha de inicio si existe
            if (fechaInicioInput && fechaInicioInput.value) {
                // Usar la mayor entre fechaMin y fecha de inicio
                if (fechaInicioInput.value > fechaMin) {
                    fechaFinInput.min = fechaInicioInput.value;
                }
                // Si es el mismo día, establecer hora mínima
                if (fechaFinInput.value === fechaInicioInput.value &&
                    horaInicioInput && horaInicioInput.value && horaFinInput) {
                    horaFinInput.min = horaInicioInput.value;
                    // Si la hora de fin es anterior a la de inicio, ajustarla
                    if (horaFinInput.value && horaFinInput.value < horaInicioInput.value) {
                        horaFinInput.value = horaInicioInput.value;
                    }
                } else if (horaFinInput) {
                    // Si son fechas diferentes, quitar restricción de hora
                    horaFinInput.min = '';
                }
            }
        }
        if (zonaHorariaInput) {
            zonaHorariaInput.value = configuracion.zonaHorariaEncuesta || 'America/Santiago';
        }
    }

    // Agregar validaciones en tiempo real
    if (anioInput) {
        anioInput.addEventListener('change', function () {
            const anio = parseInt(this.value);
            const anioActual = new Date().getFullYear();

            // Validar que no sea un año anterior al actual
            if (anio && anio < anioActual) {
                alert(`⚠️ No se puede seleccionar un año anterior a ${anioActual}. Se ajustó al año actual.`);
                this.value = anioActual;
                return;
            }

            if (anio) {
                // Actualizar restricciones de fechas según el año
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const fechaMinima = hoy.toISOString().split('T')[0];

                // Establecer fecha mínima y máxima según el año
                const fechaMinAnio = `${anio}-01-01`;
                const fechaMaxAnio = `${anio}-12-31`;

                if (fechaInicioInput) {
                    // La fecha mínima es el mayor entre hoy y el inicio del año
                    const fechaMin = fechaMinAnio > fechaMinima ? fechaMinAnio : fechaMinima;
                    fechaInicioInput.min = fechaMin;
                    fechaInicioInput.max = fechaMaxAnio;
                }
                if (fechaFinInput) {
                    // La fecha mínima es el mayor entre hoy, el inicio del año, y la fecha de inicio (si existe)
                    let fechaMin = fechaMinAnio > fechaMinima ? fechaMinAnio : fechaMinima;
                    if (fechaInicioInput && fechaInicioInput.value && fechaInicioInput.value > fechaMin) {
                        fechaMin = fechaInicioInput.value;
                    }
                    fechaFinInput.min = fechaMin;
                    fechaFinInput.max = fechaMaxAnio;
                }
            }
            validarFechasEncuesta();
        });

        // Validar también al escribir
        anioInput.addEventListener('input', function () {
            const anio = parseInt(this.value);
            const anioActual = new Date().getFullYear();
            if (anio && anio < anioActual) {
                this.value = anioActual;
            }
        });
    }
    if (fechaInicioInput) {
        fechaInicioInput.addEventListener('change', function () {
            // Actualizar fecha mínima de fecha fin cuando cambia fecha inicio
            if (this.value && fechaFinInput) {
                fechaFinInput.min = this.value;
                // Si la fecha de fin es anterior a la de inicio, limpiarla
                if (fechaFinInput.value && fechaFinInput.value < this.value) {
                    fechaFinInput.value = '';
                    if (horaFinInput) horaFinInput.value = '';
                }
                // Si la fecha de fin es la misma que la de inicio, actualizar hora mínima
                if (fechaFinInput.value === this.value && horaInicioInput && horaFinInput) {
                    if (horaInicioInput.value) {
                        horaFinInput.min = horaInicioInput.value;
                        // Si la hora de fin es anterior a la de inicio, ajustarla
                        if (horaFinInput.value && horaFinInput.value < horaInicioInput.value) {
                            horaFinInput.value = horaInicioInput.value;
                        }
                    }
                } else if (horaFinInput) {
                    // Si son fechas diferentes, quitar restricción de hora
                    horaFinInput.min = '';
                }
            }
            validarFechasEncuesta();
        });
    }

    if (horaInicioInput) {
        horaInicioInput.addEventListener('change', function () {
            // Si la fecha de fin es la misma que la de inicio, actualizar hora mínima de fin
            if (fechaInicioInput && fechaInicioInput.value &&
                fechaFinInput && fechaFinInput.value === fechaInicioInput.value &&
                horaFinInput) {
                if (this.value) {
                    // Establecer hora mínima para bloquear horas anteriores visualmente
                    horaFinInput.min = this.value;
                    // Si la hora de fin es anterior a la de inicio, ajustarla
                    if (horaFinInput.value && horaFinInput.value < this.value) {
                        horaFinInput.value = this.value;
                    }
                } else {
                    // Si no hay hora de inicio, quitar restricción
                    horaFinInput.min = '';
                }
            } else if (horaFinInput) {
                // Si son fechas diferentes, quitar restricción de hora
                horaFinInput.min = '';
            }
            validarFechasEncuesta();
        });

        // También validar cuando se carga la página si ya hay valores
        horaInicioInput.addEventListener('input', function () {
            // Actualizar en tiempo real mientras se escribe
            if (fechaInicioInput && fechaInicioInput.value &&
                fechaFinInput && fechaFinInput.value === fechaInicioInput.value &&
                horaFinInput && this.value) {
                horaFinInput.min = this.value;
            }
        });
    }

    if (fechaFinInput) {
        fechaFinInput.addEventListener('change', function () {
            // Si la fecha de fin es la misma que la de inicio, actualizar hora mínima
            if (fechaInicioInput && fechaInicioInput.value === this.value &&
                horaInicioInput && horaInicioInput.value && horaFinInput) {
                horaFinInput.min = horaInicioInput.value;
                // Si la hora de fin es anterior a la de inicio, ajustarla
                if (horaFinInput.value && horaFinInput.value < horaInicioInput.value) {
                    horaFinInput.value = horaInicioInput.value;
                }
            } else if (horaFinInput) {
                // Si son fechas diferentes, quitar restricción de hora
                horaFinInput.min = '';
            }
            validarFechasEncuesta();
        });
    }

    if (horaFinInput) {
        // Función para validar y ajustar la hora de fin
        const validarHoraFin = function () {
            if (fechaInicioInput && fechaInicioInput.value &&
                fechaFinInput && fechaFinInput.value === fechaInicioInput.value &&
                horaInicioInput && horaInicioInput.value && horaFinInput.value) {
                if (horaFinInput.value < horaInicioInput.value) {
                    // Si la hora es menor, ajustarla automáticamente
                    horaFinInput.value = horaInicioInput.value;
                }
            }
        };

        // Validar en tiempo real mientras se escribe o navega con teclas
        horaFinInput.addEventListener('input', validarHoraFin);

        // Validar también cuando se pierde el foco
        horaFinInput.addEventListener('change', function () {
            validarHoraFin();
            validarFechasEncuesta();
        });

        // Interceptar teclas para prevenir valores menores (especialmente ArrowUp/ArrowDown)
        horaFinInput.addEventListener('keydown', function (e) {
            // Si es el mismo día y hay hora de inicio, validar
            if (fechaInicioInput && fechaInicioInput.value &&
                fechaFinInput && fechaFinInput.value === fechaInicioInput.value &&
                horaInicioInput && horaInicioInput.value) {
                // Para ArrowUp y ArrowDown, validar después de que se procese
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    setTimeout(validarHoraFin, 10);
                }
            }
        });

        // Validar también cuando se hace clic en el campo (por si se usa el selector visual)
        horaFinInput.addEventListener('click', function () {
            setTimeout(validarHoraFin, 100);
        });

        // Validar cuando se hace scroll en el campo (algunos navegadores permiten esto)
        horaFinInput.addEventListener('wheel', function (e) {
            e.preventDefault();
            setTimeout(validarHoraFin, 10);
        });
    }

    // Validar al cargar y establecer restricciones iniciales
    setTimeout(() => {
        // Establecer restricciones iniciales si ya hay valores
        if (fechaInicioInput && fechaInicioInput.value &&
            fechaFinInput && fechaFinInput.value === fechaInicioInput.value &&
            horaInicioInput && horaInicioInput.value && horaFinInput) {
            horaFinInput.min = horaInicioInput.value;
            // Si la hora de fin es anterior, ajustarla
            if (horaFinInput.value && horaFinInput.value < horaInicioInput.value) {
                horaFinInput.value = horaInicioInput.value;
            }
        }
        validarFechasEncuesta();
    }, 100);

    // Cargar ítems de PRODUCTO
    const itemsProducto = configuracion.itemsProducto || configuracionDefault.itemsProducto;
    const containerProducto = document.getElementById('itemsProductoContainer');
    if (containerProducto) {
        containerProducto.innerHTML = '';
        itemsProducto.forEach((item, index) => {
            containerProducto.appendChild(crearEditorItem(item, index, 'producto'));
        });
        // Inicializar estado de inputs después de cargar
        setTimeout(() => {
            const suma = itemsProducto.reduce((sum, item) => sum + (item.ponderacion || 0), 0);
            const indicador = containerProducto.querySelector('.suma-ponderaciones');
            if (!indicador) {
                const nuevoIndicador = document.createElement('div');
                nuevoIndicador.className = 'suma-ponderaciones';
                nuevoIndicador.textContent = `Suma total: ${suma}%`;
                if (suma >= 100) {
                    nuevoIndicador.classList.add('suma-completa');
                }
                containerProducto.insertBefore(nuevoIndicador, containerProducto.firstChild);
            }
            // Inicializar estado de inputs: si suma es 100%, habilitar solo el primero
            if (suma >= 100) {
                const inputs = containerProducto.querySelectorAll('.ponderacion-input');
                inputs.forEach((input, index) => {
                    if (index === 0) {
                        // Habilitar el primer input
                        input.disabled = false;
                        input.title = 'Edita este valor. Si lo reduces, se habilitarán los demás.';
                    } else {
                        // Deshabilitar los demás
                        input.disabled = true;
                        input.title = 'La suma es 100%. Haz clic en otro input para editarlo.';
                    }
                });
            }
        }, 200);
    }

    // Cargar ítems de SERVICIO
    const itemsServicio = configuracion.itemsServicio || configuracionDefault.itemsServicio;
    const containerServicio = document.getElementById('itemsServicioContainer');
    if (containerServicio) {
        containerServicio.innerHTML = '';
        itemsServicio.forEach((item, index) => {
            containerServicio.appendChild(crearEditorItem(item, index, 'servicio'));
        });
        // Inicializar estado de inputs después de cargar
        setTimeout(() => {
            const suma = itemsServicio.reduce((sum, item) => sum + (item.ponderacion || 0), 0);
            const indicador = containerServicio.querySelector('.suma-ponderaciones');
            if (!indicador) {
                const nuevoIndicador = document.createElement('div');
                nuevoIndicador.className = 'suma-ponderaciones';
                nuevoIndicador.textContent = `Suma total: ${suma}%`;
                if (suma >= 100) {
                    nuevoIndicador.classList.add('suma-completa');
                }
                containerServicio.insertBefore(nuevoIndicador, containerServicio.firstChild);
            }
            // Inicializar estado de inputs: si suma es 100%, habilitar solo el primero
            if (suma >= 100) {
                const inputs = containerServicio.querySelectorAll('.ponderacion-input');
                inputs.forEach((input, index) => {
                    if (index === 0) {
                        // Habilitar el primer input
                        input.disabled = false;
                        input.title = 'Edita este valor. Si lo reduces, se habilitarán los demás.';
                    } else {
                        // Deshabilitar los demás
                        input.disabled = true;
                        input.title = 'La suma es 100%. Haz clic en otro input para editarlo.';
                    }
                });
            }
        }, 200);
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

    // Checkbox "Evaluado por Admin"
    const adminCheckContainer = document.createElement('div');
    adminCheckContainer.className = 'admin-check-container';
    adminCheckContainer.style.display = 'flex';
    adminCheckContainer.style.alignItems = 'center';
    adminCheckContainer.style.gap = '5px';
    adminCheckContainer.title = 'Marcar si este ítem debe ser evaluado por el administrador, no por el usuario.';

    const adminCheck = document.createElement('input');
    adminCheck.type = 'checkbox';
    adminCheck.checked = item.adminEvaluated || false;
    adminCheck.id = `adminCheck_${tipo}_${index}`;

    const adminCheckLabel = document.createElement('label');
    adminCheckLabel.textContent = 'Admin';
    adminCheckLabel.htmlFor = `adminCheck_${tipo}_${index}`;
    adminCheckLabel.style.fontSize = '0.8rem';
    adminCheckLabel.style.cursor = 'pointer';

    adminCheck.onchange = async function () {
        item.adminEvaluated = this.checked;
        console.log(`🔒 Estado Admin cambiado en ítem ${tipo}: ${this.checked}`);
        try {
            await guardarConfiguracionEvaluacion(configuracion);
        } catch (e) {
            console.error('Error al guardar item:', e);
        }
    };

    adminCheckContainer.appendChild(adminCheck);
    adminCheckContainer.appendChild(adminCheckLabel);

    // Función para calcular la suma actual de ponderaciones
    function calcularSumaPonderaciones(tipo) {
        const items = tipo === 'producto' ? configuracion.itemsProducto : configuracion.itemsServicio;
        return items.reduce((sum, item) => sum + (item.ponderacion || 0), 0);
    }

    // Función para actualizar el estado de los inputs según la suma
    function actualizarEstadoInputs(tipo, inputActivo = null) {
        const suma = calcularSumaPonderaciones(tipo);
        const container = tipo === 'producto'
            ? document.getElementById('itemsProductoContainer')
            : document.getElementById('itemsServicioContainer');

        if (!container) return;

        const inputs = container.querySelectorAll('.ponderacion-input');
        const sumaIndicador = container.querySelector('.suma-ponderaciones');

        // Actualizar o crear indicador de suma
        let indicador = sumaIndicador;
        if (!indicador) {
            indicador = document.createElement('div');
            indicador.className = 'suma-ponderaciones';
            container.insertBefore(indicador, container.firstChild);
        }

        indicador.textContent = `Suma total: ${suma}%`;
        indicador.className = 'suma-ponderaciones';

        if (suma >= 100) {
            indicador.classList.add('suma-completa');
            indicador.classList.remove('suma-excedida');
            // Si la suma es 100%, deshabilitar todos excepto el input activo
            inputs.forEach(input => {
                if (input === inputActivo) {
                    input.disabled = false;
                    input.title = 'Edita este valor. Si lo reduces, se habilitarán los demás.';
                } else {
                    input.disabled = true;
                    input.title = 'La suma es 100%. Haz clic en otro input para editarlo.';
                }
            });
        } else {
            indicador.classList.remove('suma-completa', 'suma-excedida');
            // Si la suma es menor a 100%, habilitar todos los inputs
            inputs.forEach(input => {
                input.disabled = false;
                input.title = '';
            });
        }
    }

    // Evento onfocus: habilitar este input y deshabilitar los demás si suma es 100%
    ponderacionInput.onfocus = function () {
        actualizarEstadoInputs(tipo, this);
    };

    // Validación en tiempo real
    ponderacionInput.oninput = function () {
        const nuevoValor = parseInt(this.value) || 0;
        const valorAnterior = item.ponderacion || 0;
        const sumaActual = calcularSumaPonderaciones(tipo);
        const sumaSinEste = sumaActual - valorAnterior;
        const nuevaSuma = sumaSinEste + nuevoValor;

        // Si la nueva suma excede 100%, ajustar el valor
        if (nuevaSuma > 100) {
            const valorMaximo = 100 - sumaSinEste;
            if (valorMaximo < 0) {
                this.value = 0;
                item.ponderacion = 0;
                alert('⚠️ La suma de ponderaciones no puede exceder el 100%. Reduce otros porcentajes primero.');
            } else {
                this.value = valorMaximo;
                item.ponderacion = valorMaximo;
                alert(`⚠️ La suma no puede exceder 100%. Se ajustó a ${valorMaximo}%`);
            }
        } else {
            item.ponderacion = nuevoValor;
        }

        // Actualizar el estado de los inputs (este input sigue activo)
        actualizarEstadoInputs(tipo, this);
    };

    // Auto-save ponderación
    ponderacionInput.onchange = async function () {
        const nuevoValor = parseInt(this.value) || 0;
        const valorAnterior = item.ponderacion || 0;
        const sumaActual = calcularSumaPonderaciones(tipo);
        const sumaSinEste = sumaActual - valorAnterior;
        const nuevaSuma = sumaSinEste + nuevoValor;

        // Validación final
        if (nuevaSuma > 100) {
            const valorMaximo = 100 - sumaSinEste;
            if (valorMaximo < 0) {
                this.value = 0;
                item.ponderacion = 0;
            } else {
                this.value = valorMaximo;
                item.ponderacion = valorMaximo;
            }
            alert('⚠️ La suma de ponderaciones no puede exceder el 100%.');
        } else {
            item.ponderacion = nuevoValor;
        }

        // Actualizar estado (mantener este input activo si la suma sigue siendo 100%)
        actualizarEstadoInputs(tipo, this);

        console.log(`⚖️ Guardando ponderación en ítem ${tipo}...`);
        try {
            await guardarConfiguracionEvaluacion(configuracion);
        } catch (e) {
            console.error('Error al guardar ponderación:', e);
        }
    };

    // Inicializar estado al crear el input
    setTimeout(() => {
        const suma = calcularSumaPonderaciones(tipo);
        // Si la suma es 100%, no habilitar ningún input por defecto (el usuario debe hacer clic)
        if (suma >= 100) {
            actualizarEstadoInputs(tipo, null);
        } else {
            actualizarEstadoInputs(tipo, null);
        }
    }, 100);

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
    actionsDiv.appendChild(adminCheckContainer);
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

        if (Object.keys(configuracion.proveedores).length > 0) {
            console.log('DEBUG: v15 LOADED - ALERTING USER');
            // alert('VERSION 15 CARGADA - SI VES ESTO, EL CODIGO NUEVO ESTA CORRIENDO'); 
            // Commented out alert to be less annoying, but logging is key. 
            // Actually, user is desperate. Let's use console and the visual change (Pink card).
        }

        proveedores.forEach(proveedor => {
            const data = configuracion.proveedores[proveedor];
            const tipo = typeof data === 'object' ? data.tipo : data;
            const email = typeof data === 'object' ? (data.email || 'Sin correo') : 'Sin correo';

            const card = document.createElement('div');
            card.className = 'proveedor-card';
            card.style.borderLeft = tipo === 'PRODUCTO' ? '4px solid #4A90E2' : '4px solid #50C878';
            card.style.display = 'flex';
            card.style.flexDirection = 'row';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'flex-start';
            card.style.padding = '12px 16px';
            card.style.minHeight = 'auto';
            card.style.position = 'relative';

            const info = document.createElement('div');
            info.style.flex = '1'; // Ensure info takes available widths
            info.style.minWidth = '0';
            info.style.marginRight = '10px';
            info.style.display = 'flex';
            info.style.flexDirection = 'column';
            info.style.justifyContent = 'center';
            info.style.textAlign = 'left'; // Force left align for all children

            // --- HEADER ROW: Icon + Name ---
            // CAVEMAN LAYOUT: Block + Float (Indestructible)
            const headerRow = document.createElement('div');
            headerRow.style.display = 'block';
            headerRow.style.width = '100%';
            headerRow.style.marginBottom = '5px';
            headerRow.style.overflow = 'hidden'; // Clear floats
            headerRow.style.border = 'none'; // Clean debug

            // 1. Notebook Action (Left - Floated)
            const notebookBtn = document.createElement('button');
            notebookBtn.innerHTML = '📋';
            notebookBtn.title = 'Asignar evaluadores';
            notebookBtn.style.cssText = `
                float: left;
                background: transparent !important;
                border: none !important;
                cursor: pointer;
                font-size: 1.2rem;
                padding: 0;
                margin-right: 8px;
                line-height: 1.2;
            `;
            notebookBtn.onclick = () => abrirEvaluacionAdmin(proveedor, tipo);

            // 2. Name Element (Block context next to float)
            const nombreEl = document.createElement('div');
            nombreEl.className = 'proveedor-nombre-final';

            // Final Safety Check
            let finalName = proveedor;
            if (!finalName || typeof finalName !== 'string' || finalName.trim() === '') {
                finalName = '(Sin Nombre)';
            }
            nombreEl.textContent = finalName;

            nombreEl.style.cssText = `
                display: block;
                overflow: hidden; /* Triggers BFC to sit next to float */
                color: #333 !important; 
                font-weight: bold;
                font-size: 1.1rem !important;
                line-height: 1.3;
                white-space: nowrap;
                text-overflow: ellipsis;
                text-align: left;
            `;
            nombreEl.title = finalName;

            // Assemble Header
            headerRow.appendChild(notebookBtn);
            headerRow.appendChild(nombreEl);

            // --- TIPO ---
            const tipoEl = document.createElement('div');
            tipoEl.className = 'proveedor-tipo';
            tipoEl.textContent = tipo;
            tipoEl.style.color = tipo === 'PRODUCTO' ? '#4A90E2' : '#50C878';
            tipoEl.style.fontSize = '0.9rem';
            tipoEl.style.fontWeight = '600';
            tipoEl.style.marginTop = '2px';
            tipoEl.style.textAlign = 'left';

            // --- EMAIL ROW ---
            const emailContainer = document.createElement('div');
            emailContainer.style.display = 'flex';
            emailContainer.style.alignItems = 'center';
            emailContainer.style.justifyContent = 'flex-start';
            emailContainer.style.marginTop = '4px';
            emailContainer.style.gap = '5px'; // Tight gap

            const emailText = document.createElement('span');
            emailText.textContent = email;
            emailText.style.fontSize = '0.85rem';
            emailText.style.color = '#666';
            emailText.style.whiteSpace = 'nowrap';
            emailText.style.width = 'auto'; // Prevent unwanted expansion

            const editEmailBtn = document.createElement('button');
            editEmailBtn.innerHTML = '✏️';
            editEmailBtn.title = 'Editar correo';
            editEmailBtn.style.background = 'none';
            editEmailBtn.style.border = 'none';
            editEmailBtn.style.cursor = 'pointer';
            editEmailBtn.style.fontSize = '0.9rem';
            editEmailBtn.style.padding = '0';
            editEmailBtn.style.opacity = '0.6';
            editEmailBtn.style.flexShrink = '0'; // Keep icon size
            editEmailBtn.onmouseover = () => editEmailBtn.style.opacity = '1';
            editEmailBtn.onmouseout = () => editEmailBtn.style.opacity = '0.6';

            editEmailBtn.onclick = async () => {
                const nuevoEmail = prompt('Ingrese el nuevo correo para este proveedor:', email === 'Sin correo' ? '' : email);
                if (nuevoEmail !== null) {
                    await editarEmailProveedor(proveedor, nuevoEmail);
                }
            };

            emailContainer.appendChild(emailText);
            emailContainer.appendChild(editEmailBtn);

            info.appendChild(headerRow);
            info.appendChild(tipoEl);
            info.appendChild(emailContainer);

            // --- RIGHT ACTIONS: Only Trash ---
            const actionsDiv = document.createElement('div');
            actionsDiv.style.flexShrink = '0';
            actionsDiv.style.marginLeft = 'auto';

            // We need createActionButton helper or just create button manually
            // Since createActionButton is not defined in this scope (it was inside the block I deleted), 
            // I will create the trash button manually to be safe and simple.

            const trashBtn = document.createElement('button');
            trashBtn.innerHTML = '🗑️';
            trashBtn.title = 'Eliminar proveedor';
            trashBtn.style.background = 'transparent';
            trashBtn.style.border = 'none';
            trashBtn.style.cursor = 'pointer';
            trashBtn.style.fontSize = '1.3rem';
            trashBtn.style.padding = '5px';
            trashBtn.style.color = '#dc3545';
            trashBtn.onclick = () => eliminarProveedorLocal(proveedor);

            actionsDiv.appendChild(trashBtn);

            card.appendChild(info);
            card.appendChild(actionsDiv);
            container.appendChild(card);
        });
    }
}

// Eliminar proveedor
// Eliminar proveedor
async function eliminarProveedorLocal(nombre) {
    if (confirm(`¿Está seguro de eliminar el proveedor "${nombre}"? Esto también lo eliminará de todas las asignaciones.`)) {
        try {
            // Calling service function
            if (window.eliminarProveedor) {
                await window.eliminarProveedor(nombre);
            } else {
                // Fallback if not globally available yet, though it should be
                console.warn('eliminarProveedor no encontrado, procediendo con eliminación local');
            }

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

            await guardarConfiguracion(); // Save changes to config (assignments)
            await inicializarProveedores();
            await inicializarAsignaciones();
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
            alert('❌ Error al eliminar el proveedor.');
        }
    }
}

async function editarEmailProveedor(proveedor, nuevoEmail) {
    if (!nuevoEmail || nuevoEmail.trim() === '') return;

    const emailLimpio = nuevoEmail.trim();

    try {
        // Persist to Database via Supabase Service
        await actualizarEmailProveedor(proveedor, emailLimpio);

        // Update local state for instant feedback
        const data = configuracion.proveedores[proveedor];
        if (typeof data === 'string') {
            configuracion.proveedores[proveedor] = { tipo: data, email: emailLimpio };
        } else {
            configuracion.proveedores[proveedor].email = emailLimpio;
        }

        inicializarProveedores();
    } catch (e) {
        console.error('❌ Error en editarEmailProveedor:', e);
        alert('Error al guardar el correo. Por favor verifique su conexión.');
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
            const proveedoresTipo = Object.keys(proveedores).filter(p => {
                const data = proveedores[p];
                const pTipo = typeof data === 'object' ? data.tipo : data;
                return pTipo === tipo;
            }).sort();

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
            const nombreInput = document.getElementById('nuevoProveedor');
            const emailInput = document.getElementById('emailNuevoProveedor'); // New input
            const tipoInput = document.getElementById('tipoNuevoProveedor');

            const nombre = nombreInput.value.trim().toUpperCase();
            const email = emailInput ? emailInput.value.trim() : ''; // Get email
            const tipo = tipoInput.value;

            if (!nombre) {
                alert('Por favor ingrese un nombre para el proveedor');
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
                await crearProveedor(nombre, tipo, email); // Pass email
                configuracion.proveedores[nombre] = { tipo, email }; // Store as object
                document.getElementById('nuevoProveedor').value = '';
                if (emailInput) emailInput.value = '';
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
                sessionStorage.removeItem('adminPassword');
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
            sessionStorage.removeItem('adminPassword');
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
                const resultado = await actualizarPasswordAdmin(nuevaPassword, passwordActual);

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
        btnDescargarExcel.onclick = async function () {
            await descargarExcelAdmin();
        };
    }

    // Inicializar evaluaciones cuando se carga la sección
    const sectionEvaluaciones = document.getElementById('section-evaluaciones');
    if (sectionEvaluaciones) {
        // Usar MutationObserver para detectar cuando se muestra la sección
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
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
    filtroAnio.onchange = function () {
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

    evaluacionesAnio.forEach(e => {
        const div = document.createElement('div');
        div.className = 'evaluacion-item';
        // Ajustar estilos según si es móvil
        if (esMovil()) {
            div.style.cssText = 'display: flex; flex-direction: column; align-items: stretch; padding: 12px; margin-bottom: 15px; background: white; border: 2px solid #e0e0e0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);';
        } else {
            div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 20px; margin-bottom: 15px; background: white; border: 2px solid #e0e0e0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);';
        }

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

        // Crear estructura más clara - ajustar estilos según si es móvil
        const esMobile = esMovil();
        const fontSizePrincipal = esMobile ? '0.85rem' : '1.1rem';
        const fontSizeResultado = esMobile ? '1rem' : '1.4rem';
        const fontSizeFechas = esMobile ? '0.8rem' : '1rem';
        const gapPrincipal = esMobile ? '8px' : '20px';
        const gapSecundario = esMobile ? '6px' : '10px';
        const paddingPrincipal = esMobile ? '4px 8px' : '5px 12px';
        const paddingResultado = esMobile ? '6px 10px' : '10px 20px';
        const paddingFechas = esMobile ? '5px 8px' : '8px 15px';
        const flexDirection = esMobile ? 'column' : 'row';
        const alignItems = esMobile ? 'stretch' : 'center';

        infoDiv.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: ${gapSecundario};">
                    <div style="display: flex; flex-direction: ${flexDirection}; align-items: ${alignItems}; gap: ${gapPrincipal}; flex-wrap: wrap;">
                        <div style="font-size: ${fontSizePrincipal}; font-weight: 700; color: #2c3e50;">
                            👤 <strong>Evaluador:</strong> ${evaluador}
                        </div>
                        <div style="font-size: ${fontSizePrincipal}; font-weight: 700; color: #667eea;">
                            🏢 <strong>Proveedor:</strong> ${proveedor}
                        </div>
                        <div style="font-size: ${fontSizePrincipal}; font-weight: 700; color: ${tipo === 'PRODUCTO' ? '#4A90E2' : '#50C878'};">
                            ${tipo === 'PRODUCTO' ? '🟦' : '🟩'} <strong>Tipo:</strong> ${tipo}
                        </div>
                        <div style="font-size: ${fontSizePrincipal}; font-weight: 700; color: #ff6b35; background: rgba(255, 107, 53, 0.1); padding: ${paddingPrincipal}; border-radius: 6px;">
                            📅 <strong>Año:</strong> ${anio}
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: ${flexDirection}; align-items: ${alignItems}; gap: ${gapPrincipal}; flex-wrap: wrap;">
                        <div style="font-size: ${fontSizeResultado}; font-weight: 800; color: #28a745; background: rgba(40, 167, 69, 0.15); padding: ${paddingResultado}; border-radius: 10px; border: 2px solid #28a745;">
                            📊 <strong>Resultado Final:</strong> ${parseFloat(resultado).toFixed(2)}%
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: ${flexDirection}; align-items: ${alignItems}; gap: ${gapPrincipal}; flex-wrap: wrap; margin-top: ${esMobile ? '6px' : '10px'};">
                        <div style="color: #667eea; font-size: ${fontSizeFechas}; font-weight: 600; background: rgba(102, 126, 234, 0.1); padding: ${paddingFechas}; border-radius: 6px;">
                            📅 <strong>Fecha Evaluación:</strong> ${fechaEvaluacionFormateada || 'No disponible'}
                        </div>
                        <div style="color: #666; font-size: ${fontSizeFechas}; font-weight: 500; background: rgba(0, 0, 0, 0.05); padding: ${paddingFechas}; border-radius: 6px;">
                            💾 <strong>Guardado:</strong> ${fechaGuardadoFormateada || 'No disponible'}
                        </div>
                    </div>
                </div>
            `;

        // Contenedor de botones
        const botonesDiv = document.createElement('div');
        if (esMobile) {
            botonesDiv.style.cssText = 'display: flex; flex-direction: column; gap: 8px; width: 100%;';
        } else {
            botonesDiv.style.cssText = 'display: flex; gap: 10px; align-items: center; flex-shrink: 0;';
        }

        // Botón descargar individual
        const btnDescargar = document.createElement('button');
        btnDescargar.className = 'btn-add';
        if (esMobile) {
            btnDescargar.style.cssText = 'background: #667eea; color: white; border: none; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; width: 100%; white-space: normal;';
        } else {
            btnDescargar.style.cssText = 'background: #667eea; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem; white-space: nowrap; min-width: fit-content;';
        }
        btnDescargar.innerHTML = '📥 Descargar Excel';
        btnDescargar.onclick = function () {
            descargarEvaluacionIndividualAdmin(eval);
        };

        // Botón eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn-remove';
        if (esMobile) {
            btnEliminar.style.cssText = 'white-space: normal; width: 100%; padding: 10px 12px; font-size: 0.85rem;';
        } else {
            btnEliminar.style.cssText = 'white-space: nowrap;';
        }
        btnEliminar.textContent = '🗑️ Eliminar';
        btnEliminar.onclick = function () {
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
async function eliminarProveedorLocal(proveedor) {
    if (!confirm(`¿Estás seguro de que deseas eliminar al proveedor "${proveedor}"?`)) {
        return;
    }

    delete configuracion.proveedores[proveedor];
    await guardarConfiguracion();
    inicializarProveedores();
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

    evaluaciones.forEach(e => {
        const tipo = e.tipo_proveedor || e.tipo || 'No especificado';
        const items = tipo === 'PRODUCTO' ? itemsProductoAdmin : itemsServicioAdmin;
        const fecha = e.fecha_evaluacion || e.fecha || '';
        const evaluador = e.evaluador || 'No especificado';
        const proveedor = e.proveedor || 'No especificado';
        const resultado = e.resultado_final || e.resultadoFinal || 0;
        const anio = e.anio || new Date(e.fecha || Date.now()).getFullYear();

        const fila = {
            'Año': anio,
            'Fecha': fecha,
            'Evaluador': evaluador,
            'Proveedor': proveedor,
            'Correo Proveedor': e.correo_proveedor || e.correoProveedor || 'No especificado',
            'Tipo': tipo,
            'Resultado Final (%)': parseFloat(resultado).toFixed(2)
        };

        // Agregar respuestas por ítem en orden
        const respuestas = e.respuestas || {};
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

// Función para validar fechas de la encuesta
function validarFechasEncuesta() {
    const mensajeDiv = document.getElementById('mensajeFechas');
    const anioInput = document.getElementById('anioEncuesta');
    const fechaInicioInput = document.getElementById('fechaInicioEncuesta');
    const horaInicioInput = document.getElementById('horaInicioEncuesta');
    const fechaFinInput = document.getElementById('fechaFinEncuesta');
    const horaFinInput = document.getElementById('horaFinEncuesta');

    if (!mensajeDiv || !anioInput) return;

    let errores = [];
    let advertencias = [];

    const anio = parseInt(anioInput.value);
    const ahora = new Date(); // Usar fecha y hora actuales
    const anioActual = ahora.getFullYear();

    // Validar año
    if (!anio || anio < 2020 || anio > 2100) {
        errores.push('El año debe estar entre 2020 y 2100');
    }

    // Validar que el año no sea anterior al actual
    if (anio && anio < anioActual) {
        errores.push(`El año no puede ser anterior a ${anioActual}`);
    }

    // Validar fecha de inicio
    if (fechaInicioInput && fechaInicioInput.value) {
        // Crear fecha desde el string de fecha (YYYY-MM-DD)
        const fechaStr = fechaInicioInput.value;
        const [anioFecha, mesFecha, diaFecha] = fechaStr.split('-').map(Number);
        let fechaInicio = new Date(anioFecha, mesFecha - 1, diaFecha);
        const anioInicio = fechaInicio.getFullYear();

        // Agregar hora si está especificada
        if (horaInicioInput && horaInicioInput.value) {
            const [horas, minutos] = horaInicioInput.value.split(':').map(Number);
            fechaInicio.setHours(horas, minutos, 0, 0);
        } else {
            fechaInicio.setHours(0, 0, 0, 0);
        }

        // No permitir fechas/horas hacia atrás (debe ser ahora o futura)
        // Comparar solo si la fecha es del año actual o anterior
        const anioActual = ahora.getFullYear();
        if (anioInicio === anioActual) {
            // Solo validar si es del mismo año
            if (fechaInicio < ahora) {
                errores.push('La fecha y hora de inicio no pueden ser anteriores a ahora');
            }
        }

        // Validar que corresponda al año de la encuesta
        if (anio && anioInicio !== anio) {
            errores.push(`La fecha de inicio debe corresponder al año ${anio}`);
        }
    }

    // Validar fecha de fin
    if (fechaFinInput && fechaFinInput.value) {
        // Crear fecha desde el string de fecha (YYYY-MM-DD)
        const fechaStr = fechaFinInput.value;
        const [anioFecha, mesFecha, diaFecha] = fechaStr.split('-').map(Number);
        let fechaFin = new Date(anioFecha, mesFecha - 1, diaFecha);
        const anioFin = fechaFin.getFullYear();

        // Agregar hora si está especificada
        if (horaFinInput && horaFinInput.value) {
            const [horas, minutos] = horaFinInput.value.split(':').map(Number);
            fechaFin.setHours(horas, minutos, 0, 0);
        } else {
            // Si no hay hora, usar fin del día (23:59:59)
            fechaFin.setHours(23, 59, 59, 999);
        }

        // No permitir fechas/horas hacia atrás (debe ser ahora o futura)
        // Comparar solo si la fecha es del año actual o anterior
        const anioActual = ahora.getFullYear();
        if (anioFin === anioActual) {
            // Solo validar si es del mismo año
            if (fechaFin < ahora) {
                errores.push('La fecha y hora de fin no pueden ser anteriores a ahora');
            }
        }

        // Validar que corresponda al año de la encuesta
        if (anio && anioFin !== anio) {
            errores.push(`La fecha de fin debe corresponder al año ${anio}`);
        }

        // Validar que fecha fin >= fecha inicio (incluyendo hora)
        if (fechaInicioInput && fechaInicioInput.value) {
            // Crear fecha de inicio con hora (usando la misma lógica que arriba)
            const fechaInicioStr = fechaInicioInput.value;
            const [anioInicio, mesInicio, diaInicio] = fechaInicioStr.split('-').map(Number);
            let fechaInicioCompleta = new Date(anioInicio, mesInicio - 1, diaInicio);

            // Agregar hora de inicio si está especificada
            if (horaInicioInput && horaInicioInput.value) {
                const [horasInicio, minutosInicio] = horaInicioInput.value.split(':').map(Number);
                fechaInicioCompleta.setHours(horasInicio, minutosInicio, 0, 0);
            } else {
                fechaInicioCompleta.setHours(0, 0, 0, 0);
            }

            // Comparar fecha+hora completa
            if (fechaFin < fechaInicioCompleta) {
                errores.push('La fecha y hora de fin deben ser posteriores o iguales a la fecha y hora de inicio');
            } else if (fechaFin.getTime() === fechaInicioCompleta.getTime()) {
                // Permitir que sean iguales (mismo día y hora)
                // No es un error, pero podría ser una advertencia si se desea
            }
        }
    }

    // Mostrar mensajes
    if (errores.length > 0) {
        mensajeDiv.style.display = 'block';
        mensajeDiv.style.backgroundColor = '#fee';
        mensajeDiv.style.color = '#c33';
        mensajeDiv.style.border = '1px solid #fcc';
        mensajeDiv.innerHTML = '<strong>⚠️ Errores:</strong><ul style="margin: 5px 0; padding-left: 20px;">' +
            errores.map(e => `<li>${e}</li>`).join('') + '</ul>';
    } else if (advertencias.length > 0) {
        mensajeDiv.style.display = 'block';
        mensajeDiv.style.backgroundColor = '#fff3cd';
        mensajeDiv.style.color = '#856404';
        mensajeDiv.style.border = '1px solid #ffc107';
        mensajeDiv.innerHTML = '<strong>ℹ️ Advertencias:</strong><ul style="margin: 5px 0; padding-left: 20px;">' +
            advertencias.map(a => `<li>${a}</li>`).join('') + '</ul>';
    } else {
        mensajeDiv.style.display = 'none';
    }
}

async function guardarConfiguracionCompleta() {
    console.log('💾 Iniciando guardado de configuración completa...');

    // Mostrar indicador de carga
    const btnGuardar = document.getElementById('guardarConfigBtn') ||
        document.getElementById('guardarConfigBtnSidebar') ||
        document.getElementById('guardarTodoMobile');
    const textoOriginal = btnGuardar?.textContent || 'Guardar Todo';
    if (btnGuardar) {
        btnGuardar.disabled = true;
        btnGuardar.textContent = '⏳ Guardando...';
        btnGuardar.style.opacity = '0.7';
    }

    try {
        // Validar fechas antes de guardar
        validarFechasEncuesta();
        const mensajeDiv = document.getElementById('mensajeFechas');
        if (mensajeDiv && mensajeDiv.style.display === 'block' && mensajeDiv.style.backgroundColor === '#fee') {
            if (!confirm('⚠️ Hay errores en la configuración de fechas. ¿Desea guardar de todas formas?')) {
                if (btnGuardar) {
                    btnGuardar.disabled = false;
                    btnGuardar.textContent = textoOriginal;
                    btnGuardar.style.opacity = '1';
                }
                return;
            }
        }

        // Guardar información general
        configuracion.titulo = document.getElementById('tituloPrincipal').value.trim() || configuracionDefault.titulo;
        configuracion.descripcion = document.getElementById('descripcionEvaluacion').value.trim() || configuracionDefault.descripcion;
        configuracion.objetivo = document.getElementById('objetivoEvaluacion').value.trim() || configuracionDefault.objetivo;

        // Guardar configuración de fechas
        const anioInput = document.getElementById('anioEncuesta');
        const fechaInicioInput = document.getElementById('fechaInicioEncuesta');
        const horaInicioInput = document.getElementById('horaInicioEncuesta');
        const fechaFinInput = document.getElementById('fechaFinEncuesta');
        const horaFinInput = document.getElementById('horaFinEncuesta');
        const zonaHorariaInput = document.getElementById('zonaHorariaEncuesta');

        console.log('🔍 Verificando inputs de fecha:', {
            anioInput: !!anioInput,
            fechaInicioInput: !!fechaInicioInput,
            fechaInicioValue: fechaInicioInput?.value,
            horaInicioInput: !!horaInicioInput,
            horaInicioValue: horaInicioInput?.value,
            fechaFinInput: !!fechaFinInput,
            fechaFinValue: fechaFinInput?.value,
            horaFinInput: !!horaFinInput,
            horaFinValue: horaFinInput?.value,
            zonaHorariaInput: !!zonaHorariaInput
        });

        if (anioInput) {
            configuracion.anioEncuesta = parseInt(anioInput.value) || new Date().getFullYear();
        }

        // Combinar fecha y hora de inicio
        if (fechaInicioInput && fechaInicioInput.value) {
            // Parsear la fecha manualmente para evitar problemas de zona horaria
            const fechaStr = fechaInicioInput.value; // Formato: YYYY-MM-DD
            const [anio, mes, dia] = fechaStr.split('-').map(Number);

            console.log('📅 Procesando fecha inicio:', { fechaStr, anio, mes, dia });

            // Obtener horas y minutos
            let horas = 0;
            let minutos = 0;
            if (horaInicioInput && horaInicioInput.value) {
                [horas, minutos] = horaInicioInput.value.split(':').map(Number);
                console.log('📅 Hora inicio agregada:', { horas, minutos });
            }

            // Crear fecha directamente en UTC para evitar problemas de zona horaria
            // Formato: YYYY-MM-DDTHH:MM:SS (sin Z, para que Supabase lo interprete como local)
            const fechaInicioISO = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}T${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;
            configuracion.fechaInicioEncuesta = fechaInicioISO;
            console.log('📅 Fecha inicio formateada para BD:', configuracion.fechaInicioEncuesta);
        } else {
            configuracion.fechaInicioEncuesta = null;
            console.log('⚠️ No hay fecha de inicio configurada');
        }

        // Combinar fecha y hora de fin
        if (fechaFinInput && fechaFinInput.value) {
            // Parsear la fecha manualmente para evitar problemas de zona horaria
            const fechaStr = fechaFinInput.value; // Formato: YYYY-MM-DD
            const [anio, mes, dia] = fechaStr.split('-').map(Number);

            console.log('📅 Procesando fecha fin:', { fechaStr, anio, mes, dia });

            // Obtener horas y minutos
            let horas = 23;
            let minutos = 59;
            if (horaFinInput && horaFinInput.value) {
                [horas, minutos] = horaFinInput.value.split(':').map(Number);
                console.log('📅 Hora fin agregada:', { horas, minutos });
            }

            // Crear fecha directamente en formato ISO sin zona horaria
            // Formato: YYYY-MM-DDTHH:MM:SS (sin Z, para que Supabase lo interprete como local)
            const fechaFinISO = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}T${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;
            configuracion.fechaFinEncuesta = fechaFinISO;
            console.log('📅 Fecha fin formateada para BD:', configuracion.fechaFinEncuesta);
        } else {
            configuracion.fechaFinEncuesta = null;
            console.log('⚠️ No hay fecha de fin configurada');
        }

        // Guardar zona horaria
        if (zonaHorariaInput) {
            configuracion.zonaHorariaEncuesta = zonaHorariaInput.value || 'America/Santiago';
        }

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

        // Log antes de guardar para verificar que las fechas estén en configuracion
        console.log('💾 Configuración completa antes de guardar:', {
            anioEncuesta: configuracion.anioEncuesta,
            fechaInicioEncuesta: configuracion.fechaInicioEncuesta,
            fechaFinEncuesta: configuracion.fechaFinEncuesta,
            zonaHorariaEncuesta: configuracion.zonaHorariaEncuesta
        });

        await guardarConfiguracion();
        console.log('✅ Guardado completado exitosamente');

        // Restaurar botón
        if (btnGuardar) {
            btnGuardar.disabled = false;
            btnGuardar.textContent = textoOriginal;
            btnGuardar.style.opacity = '1';
            // Mostrar feedback visual de éxito
            const textoOriginalTemp = btnGuardar.textContent;
            btnGuardar.textContent = '✅ Guardado';
            btnGuardar.style.backgroundColor = '#10b981';
            setTimeout(() => {
                btnGuardar.textContent = textoOriginal;
                btnGuardar.style.backgroundColor = '';
            }, 2000);
        }
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        if (btnGuardar) {
            btnGuardar.disabled = false;
            btnGuardar.textContent = textoOriginal;
            btnGuardar.style.opacity = '1';
            btnGuardar.style.backgroundColor = '#ef4444';
            btnGuardar.textContent = '❌ Error al guardar';
            setTimeout(() => {
                btnGuardar.textContent = textoOriginal;
                btnGuardar.style.backgroundColor = '';
            }, 3000);
        }
        throw error; // Re-lanzar el error para que se muestre el mensaje
    }
}

// Función para abrir el modal de evaluación administrativa
async function abrirEvaluacionAdmin(proveedor, tipo) {
    const modalId = 'modalEvaluacionAdmin';
    let modal = document.getElementById(modalId);

    // Crear modal si no existe
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.zIndex = '1000';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.overflow = 'auto';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.backgroundColor = '#fefefe';
        modalContent.style.margin = '10% auto';
        modalContent.style.padding = '20px';
        modalContent.style.border = '1px solid #888';
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '600px';
        modalContent.style.borderRadius = '8px';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.color = '#aaa';
        closeBtn.style.float = 'right';
        closeBtn.style.fontSize = '28px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = function () {
            modal.style.display = 'none';
        };

        const header = document.createElement('h2');
        header.id = 'evalAdminTitulo';
        header.style.marginTop = '0';

        const body = document.createElement('div');
        body.id = 'evalAdminBody';
        body.style.marginTop = '20px';

        const footer = document.createElement('div');
        footer.id = 'evalAdminFooter';
        footer.style.marginTop = '20px';
        footer.style.textAlign = 'right';
        footer.style.borderTop = '1px solid #eee';
        footer.style.paddingTop = '15px';

        const saveBtn = document.createElement('button');
        saveBtn.id = 'evalAdminSaveBtn';
        saveBtn.textContent = 'Guardar Evaluaciones';
        saveBtn.className = 'btn-save';
        saveBtn.style.padding = '10px 20px';
        saveBtn.style.backgroundColor = '#4CAF50';
        saveBtn.style.color = 'white';
        saveBtn.style.border = 'none';
        saveBtn.style.borderRadius = '4px';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.fontSize = '16px';

        footer.appendChild(saveBtn);
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modalContent.appendChild(footer); // Mover botón al footer
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Cerrar al hacer clic fuera
        window.addEventListener('click', function (event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Configurar modal
    const titulo = document.getElementById('evalAdminTitulo');
    const body = document.getElementById('evalAdminBody');
    const saveBtn = document.getElementById('evalAdminSaveBtn');

    titulo.textContent = `Evaluación Admin: ${proveedor}`;
    body.innerHTML = '<p>Cargando ítems...</p>';
    saveBtn.disabled = true;
    saveBtn.style.opacity = '0.7';

    // Mostrar modal
    modal.style.display = 'block';

    // Cargar datos
    try {
        const items = tipo === 'PRODUCTO' ? configuracion.itemsProducto : configuracion.itemsServicio;
        // Filtrar ítems que TIENEN la marca de adminEvaluated
        const itemsAdmin = items.filter(i => i.adminEvaluated);

        // Cargar evaluaciones previas
        const evaluacionesPrevias = await cargarEvaluacionesAdmin(proveedor);

        if (itemsAdmin.length === 0) {
            body.innerHTML = '<p style="color: #666; font-style: italic;">No hay ítems configurados para evaluación administrativa en la categoría ' + tipo + '.</p>';
            return;
        }

        body.innerHTML = '';
        const form = document.createElement('div');

        itemsAdmin.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'admin-item-row';
            itemDiv.style.marginBottom = '20px';
            itemDiv.style.padding = '15px';
            itemDiv.style.backgroundColor = '#f9f9f9';
            itemDiv.style.borderRadius = '6px';

            const label = document.createElement('label');
            label.textContent = item.nombre;
            label.style.display = 'block';
            label.style.fontWeight = 'bold';
            label.style.marginBottom = '8px';
            label.style.color = '#333';

            const select = document.createElement('select');
            select.className = 'admin-eval-select';
            select.dataset.item = item.nombre;
            select.style.width = '100%';
            select.style.padding = '10px';
            select.style.border = '1px solid #ddd';
            select.style.borderRadius = '4px';
            select.style.fontSize = '14px';

            const options = [
                { val: '', text: '-- Seleccione calificación --' },
                { val: '100', text: '100% - Cumple Totalmente' },
                { val: '75', text: '75% - Cumple Parcialmente' },
                { val: '50', text: '50% - Cumple Mínimamente' },
                { val: '25', text: '25% - No Cumple' },
                { val: '0', text: '0% - Nulo' }
            ];

            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.val;
                option.textContent = opt.text;
                select.appendChild(option);
            });

            // Set previous value if exists
            if (evaluacionesPrevias[item.nombre] !== undefined) {
                select.value = evaluacionesPrevias[item.nombre];
            }

            itemDiv.appendChild(label);
            itemDiv.appendChild(select);
            form.appendChild(itemDiv);
        });

        body.appendChild(form);
        saveBtn.disabled = false;
        saveBtn.style.opacity = '1';

        saveBtn.onclick = async function () {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Guardando...';

            const selects = body.querySelectorAll('.admin-eval-select');
            let successCount = 0;
            let errorCount = 0;

            for (const select of selects) {
                const itemNombre = select.dataset.item;
                const valor = select.value;

                if (valor !== '') {
                    const ok = await guardarEvaluacionAdmin(proveedor, itemNombre, parseInt(valor));
                    if (ok) successCount++; else errorCount++;
                }
            }

            if (errorCount > 0) {
                alert(`⚠️ Se guardaron ${successCount} ítems, pero hubo error en ${errorCount}. (Posible falta de tabla 'evaluaciones_admin')`);
            } else {
                alert('✅ Evaluaciones guardadas correctamente');
                modal.style.display = 'none';
            }
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar Evaluaciones';
        };

    } catch (error) {
        console.error('Error cargando evaluación admin:', error);
        body.innerHTML = '<p class="error" style="color:red">Error al cargar datos. ' + error.message + '</p>';
    }
}


