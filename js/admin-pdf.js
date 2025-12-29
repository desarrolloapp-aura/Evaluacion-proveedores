// Funciones para generar PDFs de evaluaciones

// Inicializar sección de PDFs
async function inicializarPDFs() {
    try {
        // Cargar items desde la configuración si no están cargados
        if (!itemsProductoAdmin || itemsProductoAdmin.length === 0 || !itemsServicioAdmin || itemsServicioAdmin.length === 0) {
            const config = await cargarConfiguracionEvaluacion();
            if (config) {
                itemsProductoAdmin = config.itemsProducto || [];
                itemsServicioAdmin = config.itemsServicio || [];
            }
        }
        
        // Cargar todas las evaluaciones si no están cargadas
        if (!todasEvaluacionesAdmin || todasEvaluacionesAdmin.length === 0) {
            todasEvaluacionesAdmin = await cargarEvaluaciones();
        }
        
        await mostrarPDFsAdmin();
    } catch (error) {
        console.error('Error al inicializar PDFs:', error);
    }
}

// Mostrar evaluaciones para PDFs
async function mostrarPDFsAdmin() {
    const filtroAnioPDF = document.getElementById('filtroAnioPDF');
    const contenidoAnioPDF = document.getElementById('contenidoAnioPDF');
    const container = document.getElementById('pdfsList');
    
    if (!filtroAnioPDF || !contenidoAnioPDF || !container) return;
    
    // Recargar evaluaciones si es necesario
    if (todasEvaluacionesAdmin.length === 0) {
        todasEvaluacionesAdmin = await cargarEvaluaciones();
    }
    
    if (todasEvaluacionesAdmin.length === 0) {
        filtroAnioPDF.innerHTML = '<option value="">-- No hay evaluaciones guardadas --</option>';
        contenidoAnioPDF.style.display = 'none';
        return;
    }
    
    // Obtener años únicos y llenar el selector
    const aniosUnicos = [...new Set(todasEvaluacionesAdmin.map(e => e.anio || new Date(e.fechaEvaluacion || e.fecha || Date.now()).getFullYear()))].sort((a, b) => b - a);
    
    filtroAnioPDF.innerHTML = '<option value="">-- Seleccione un año --</option>';
    aniosUnicos.forEach(anio => {
        const option = document.createElement('option');
        option.value = anio;
        option.textContent = anio;
        filtroAnioPDF.appendChild(option);
    });
    
    // Event listener para cuando cambie el año
    filtroAnioPDF.onchange = function() {
        const anioSeleccionado = this.value;
        if (anioSeleccionado) {
            mostrarPDFsPorAnio(parseInt(anioSeleccionado), todasEvaluacionesAdmin);
        } else {
            contenidoAnioPDF.style.display = 'none';
        }
    };
}

// Mostrar PDFs filtrados por año
function mostrarPDFsPorAnio(anio, todasEvaluaciones) {
    const contenidoAnioPDF = document.getElementById('contenidoAnioPDF');
    const container = document.getElementById('pdfsList');
    const descargarPDFAnioBtn = document.getElementById('descargarPDFAnioCompletoBtn');
    
    if (!contenidoAnioPDF || !container) return;
    
    // Filtrar evaluaciones por año
    const evaluacionesAnio = todasEvaluaciones.filter(e => {
        const anioEval = e.anio || new Date(e.fechaEvaluacion || e.fecha || Date.now()).getFullYear();
        return anioEval === anio;
    });
    
    if (evaluacionesAnio.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No hay evaluaciones para el año seleccionado.</p>';
        contenidoAnioPDF.style.display = 'block';
        if (descargarPDFAnioBtn) descargarPDFAnioBtn.style.display = 'none';
        return;
    }
    
    // Mostrar contenido
    contenidoAnioPDF.style.display = 'block';
    if (descargarPDFAnioBtn) {
        descargarPDFAnioBtn.style.display = 'block';
        descargarPDFAnioBtn.onclick = () => descargarPDFsPorAnio(anio);
    }
    
    // Mostrar evaluaciones
    container.innerHTML = '';
    evaluacionesAnio.sort((a, b) => {
        if (a.evaluador !== b.evaluador) {
            return a.evaluador.localeCompare(b.evaluador);
        }
        if (a.proveedor !== b.proveedor) {
            return a.proveedor.localeCompare(b.proveedor);
        }
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
        
        const evaluador = eval.evaluador || 'No especificado';
        const proveedor = eval.proveedor || 'No especificado';
        const tipo = eval.tipo_proveedor || eval.tipo || 'No especificado';
        const resultado = eval.resultado_final || eval.resultadoFinal || 0;
        const anio = eval.anio || new Date(eval.fechaEvaluacion || eval.fecha || Date.now()).getFullYear();
        
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
            </div>
        `;
        
        const botonesDiv = document.createElement('div');
        botonesDiv.style.cssText = 'display: flex; gap: 10px; align-items: center; flex-shrink: 0;';
        
        const btnDescargarPDF = document.createElement('button');
        btnDescargarPDF.className = 'btn-add';
        btnDescargarPDF.style.cssText = 'background: #dc3545; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem; white-space: nowrap; min-width: fit-content;';
        btnDescargarPDF.innerHTML = '📄 Generar PDF';
        btnDescargarPDF.onclick = () => generarPDFIndividual(eval);
        
        botonesDiv.appendChild(btnDescargarPDF);
        
        div.appendChild(infoDiv);
        div.appendChild(botonesDiv);
        container.appendChild(div);
    });
}

// Generar PDF individual
async function generarPDFIndividual(evaluacion) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Cargar items según el tipo
        const tipo = evaluacion.tipo_proveedor || evaluacion.tipo || 'PRODUCTO';
        const items = tipo === 'PRODUCTO' ? itemsProductoAdmin : itemsServicioAdmin;
        
        // Obtener datos de la evaluación
        const proveedor = evaluacion.proveedor || 'No especificado';
        const anio = evaluacion.anio || new Date(evaluacion.fechaEvaluacion || evaluacion.fecha || Date.now()).getFullYear();
        const resultadoFinal = parseFloat(evaluacion.resultado_final || evaluacion.resultadoFinal || 0).toFixed(2);
        const fechaEvaluacion = evaluacion.fechaEvaluacion || evaluacion.fecha || new Date().toISOString();
        // Crear fecha de evaluación sin problemas de zona horaria
        let fechaEvaluacionObj;
        if (typeof fechaEvaluacion === 'string' && fechaEvaluacion.includes('T')) {
            // Si viene como ISO string, parsear correctamente
            const [datePart] = fechaEvaluacion.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            fechaEvaluacionObj = new Date(year, month - 1, day);
        } else {
            fechaEvaluacionObj = new Date(fechaEvaluacion);
        }
        
        // Usar la fecha de evaluación (del calendario) para el encabezado del PDF
        // Formato: Rancagua, DD de MMMM de YYYY
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const fechaFormateada = `Rancagua, ${fechaEvaluacionObj.getDate()} de ${meses[fechaEvaluacionObj.getMonth()]} de ${fechaEvaluacionObj.getFullYear()}`;
        
        // Cargar logo
        const logoImg = await cargarImagen('./public/logo.jpg');
        
        // Encabezado con logo y fecha
        if (logoImg) {
            doc.addImage(logoImg, 'JPEG', 20, 8, 40, 15); // Logo más arriba
        }
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(fechaFormateada, 170, 18, { align: 'right' }); // Fecha más arriba
        
        // Salto de línea
        let yPos = 40; // Reducido para subir todo el contenido
        
        // Destinatario
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text('Señores', 20, yPos);
        yPos += 6; // Reducido de 7 a 6
        doc.setFont('helvetica', 'bold');
        doc.text(proveedor.toUpperCase(), 20, yPos);
        yPos += 6; // Reducido de 7 a 6
        doc.setFont('helvetica', 'normal');
        doc.text('Presente', 20, yPos);
        yPos += 8; // Reducido de 10 a 8
        
        // Cuerpo del texto
        doc.setFontSize(11);
        doc.text('De nuestra consideración:', 20, yPos);
        yPos += 6; // Reducido de 8 a 6
        
        const texto1 = 'Aura Ingeniería S.A. es una empresa certificada en Normas ISO 9001, ISO 14001 e ISO 45001. Dentro de lo cual cada año nuestros Proveedores tanto de productos, así como de Servicios deben ser sometidos por nuestras áreas a evaluación en aspectos determinantes para realizar un óptimo servicio a nuestros clientes.';
        const texto2Parte1 = 'Para interpretar los resultados obtenidos se ha adjuntado el archivo';
        const comillaApertura = ' "';
        const texto2Parte2 = 'Cuadro de evaluación de';
        const texto2Parte3 = ' proveedores';
        const comillaCierre = '"';
        const puntoFinal = '.';
        const texto3 = `Su calificación obtenida para el año ${anio} es la siguiente:`;
        
        const lineas1 = doc.splitTextToSize(texto1, 170);
        doc.text(lineas1, 20, yPos);
        yPos += lineas1.length * 5 + 3; // Reducido de 5 a 3
        
        // Escribir texto2 con todo "Cuadro de evaluación de proveedores" en negrita
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(texto2Parte1, 20, yPos);
        const anchoTexto2Parte1 = doc.getTextWidth(texto2Parte1);
        
        // Comilla de apertura con espacio antes (incluido en comillaApertura)
        doc.setFont('helvetica', 'normal');
        doc.text(comillaApertura, 20 + anchoTexto2Parte1, yPos);
        const anchoComilla = doc.getTextWidth(comillaApertura);
        
        // "Cuadro de evaluación de" en negrita, con espacio normal después de la comilla
        doc.setFont('helvetica', 'bold');
        doc.text(texto2Parte2, 20 + anchoTexto2Parte1 + anchoComilla, yPos);
        const anchoTexto2Parte2 = doc.getTextWidth(texto2Parte2);
        
        // Salto de línea y escribir "proveedores" en negrita
        yPos += 4; // Reducido de 5 a 4
        doc.setFont('helvetica', 'bold');
        doc.text(texto2Parte3.trim(), 20, yPos); // "proveedores" en negrita, alineado a la izquierda
        
        // Escribir comilla de cierre y punto
        const anchoProveedores = doc.getTextWidth(texto2Parte3.trim());
        doc.setFont('helvetica', 'normal');
        doc.text(comillaCierre + puntoFinal, 20 + anchoProveedores, yPos);
        yPos += 6; // Reducido de 8 a 6
        
        doc.text(texto3, 20, yPos);
        yPos += 10; // Reducido de 12 a 10
        
        // Tabla de evaluación
        const respuestas = evaluacion.respuestas || [];
        const respuestasMap = {};
        if (Array.isArray(respuestas)) {
            respuestas.forEach(r => {
                respuestasMap[r.item] = r.valor;
            });
        } else {
            Object.keys(respuestas).forEach(key => {
                respuestasMap[key] = respuestas[key];
            });
        }
        
        // Colores
        const colorFondoNaranja = [255, 218, 185]; // Naranja/durazno para encabezados y texto "Calificación Final"
        const colorFondoAzulGris = [230, 240, 250]; // Azul gris para filas de datos y porcentaje final
        
        // Posición inicial de la tabla
        const tablaX = 20;
        const tablaY = yPos;
        const anchoCol1 = 90; // Elemento (más ancho para las preguntas)
        const anchoCol2 = 30; // Ponderación
        const anchoCol3 = 25; // Nota
        const anchoCol4 = 25; // Puntaje
        const anchoTotal = anchoCol1 + anchoCol2 + anchoCol3 + anchoCol4;
        const alturaFila = 8;
        
        // Calcular posiciones X de cada columna para centrado
        const xCol1 = tablaX + 2; // Elemento (izquierda)
        const xCol2 = tablaX + anchoCol1 + anchoCol2 / 2; // Ponderación (centro)
        const xCol3 = tablaX + anchoCol1 + anchoCol2 + anchoCol3 / 2; // Nota (centro)
        const xCol4 = tablaX + anchoCol1 + anchoCol2 + anchoCol3 + anchoCol4 / 2; // Puntaje (centro)
        
        // Encabezados de tabla con fondo naranja
        doc.setFillColor(...colorFondoNaranja);
        doc.rect(tablaX, tablaY - 5, anchoTotal, alturaFila, 'F');
        doc.setDrawColor(0, 0, 0);
        doc.rect(tablaX, tablaY - 5, anchoTotal, alturaFila, 'S');
        
        // Líneas verticales de la tabla
        doc.line(tablaX + anchoCol1, tablaY - 5, tablaX + anchoCol1, tablaY - 5 + alturaFila);
        doc.line(tablaX + anchoCol1 + anchoCol2, tablaY - 5, tablaX + anchoCol1 + anchoCol2, tablaY - 5 + alturaFila);
        doc.line(tablaX + anchoCol1 + anchoCol2 + anchoCol3, tablaY - 5, tablaX + anchoCol1 + anchoCol2 + anchoCol3, tablaY - 5 + alturaFila);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('Elemento', xCol1, tablaY);
        doc.text('Ponderación', xCol2, tablaY, { align: 'center' });
        doc.text('Nota', xCol3, tablaY, { align: 'center' });
        doc.text('Puntaje', xCol4, tablaY, { align: 'center' });
        
        yPos = tablaY + alturaFila;
        
        // Filas de la tabla con fondo azul gris
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        let totalPuntaje = 0;
        
        items.forEach((item, index) => {
            const nota = respuestasMap[item.nombre] || 0;
            const puntaje = (nota * item.ponderacion) / 100;
            totalPuntaje += puntaje;
            
            // Fondo azul gris solo para la columna "Elemento"
            doc.setFillColor(...colorFondoAzulGris);
            doc.rect(tablaX, yPos - 5, anchoCol1, alturaFila, 'F');
            
            // Las demás columnas tienen fondo blanco (no se dibuja nada, queda blanco por defecto)
            
            // Dibujar bordes de la fila
            doc.setDrawColor(0, 0, 0);
            doc.rect(tablaX, yPos - 5, anchoTotal, alturaFila, 'S');
            doc.line(tablaX + anchoCol1, yPos - 5, tablaX + anchoCol1, yPos - 5 + alturaFila);
            doc.line(tablaX + anchoCol1 + anchoCol2, yPos - 5, tablaX + anchoCol1 + anchoCol2, yPos - 5 + alturaFila);
            doc.line(tablaX + anchoCol1 + anchoCol2 + anchoCol3, yPos - 5, tablaX + anchoCol1 + anchoCol2 + anchoCol3, yPos - 5 + alturaFila);
            
            // Extraer concepto general del nombre de manera inteligente
            let conceptoGeneral = item.nombre;
            
            // Si tiene paréntesis, tomar solo lo que está antes
            if (conceptoGeneral.includes('(')) {
                conceptoGeneral = conceptoGeneral.split('(')[0].trim();
            }
            
            // Si tiene comas, tomar solo la primera parte (generalmente el concepto principal)
            if (conceptoGeneral.includes(',')) {
                conceptoGeneral = conceptoGeneral.split(',')[0].trim();
            }
            
            // Detectar palabras clave comunes que indican el concepto
            const palabrasClave = [
                'Comportamiento', 'Cumplimiento', 'Calidad', 'Comunicación', 'Reacción', 'Reaccion',
                'Publicación', 'Publicacion', 'Certificación', 'Certificacion', 'Información', 'Informacion',
                'Condiciones', 'Pago', 'Plazos', 'Entrega', 'Documentación', 'Documentacion',
                'Técnica', 'Tecnica', 'Seguridad', 'Oportunidad', 'Servicio', 'Producto'
            ];
            
            // Buscar si el nombre contiene alguna palabra clave
            let conceptoEncontrado = null;
            for (const palabra of palabrasClave) {
                if (conceptoGeneral.toLowerCase().includes(palabra.toLowerCase())) {
                    conceptoEncontrado = palabra;
                    break;
                }
            }
            
            if (conceptoEncontrado) {
                conceptoGeneral = conceptoEncontrado;
            } else {
                // Si no encuentra palabra clave, extraer el sustantivo principal
                // Generalmente es la primera o segunda palabra importante
                const palabras = conceptoGeneral.split(' ');
                
                // Filtrar palabras comunes que no son el concepto (artículos, preposiciones)
                const palabrasExcluidas = ['de', 'del', 'la', 'el', 'los', 'las', 'en', 'con', 'para', 'por', 'a', 'al'];
                const palabrasImportantes = palabras.filter(p => 
                    p.length > 3 && !palabrasExcluidas.includes(p.toLowerCase())
                );
                
                if (palabrasImportantes.length > 0) {
                    // Tomar la primera palabra importante (generalmente el concepto)
                    conceptoGeneral = palabrasImportantes[0];
                } else if (palabras.length > 0) {
                    // Si no hay palabras importantes, tomar la primera palabra
                    conceptoGeneral = palabras[0];
                }
            }
            
            // Capitalizar primera letra
            conceptoGeneral = conceptoGeneral.charAt(0).toUpperCase() + conceptoGeneral.slice(1).toLowerCase();
            
            const nombreItem = `${index + 1}-${conceptoGeneral}`;
            const lineasNombre = doc.splitTextToSize(nombreItem, anchoCol1 - 4);
            
            // Si el nombre es muy largo, ajustar altura
            const alturaTexto = Math.max(alturaFila - 2, lineasNombre.length * 4);
            
            // Asegurar que el texto no se salga de la página
            if (yPos + alturaTexto > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.text(lineasNombre, xCol1, yPos);
            doc.text(`${item.ponderacion}%`, xCol2, yPos, { align: 'center' });
            doc.text(nota > 0 ? `${nota}%` : '', xCol3, yPos, { align: 'center' });
            doc.text(`${puntaje.toFixed(2)}%`, xCol4, yPos, { align: 'center' });
            
            yPos += alturaFila;
        });
        
        // Fila final: "Calificación Final" con fondo naranja, porcentaje con fondo azul gris
        // Fondo naranja para las primeras 3 columnas combinadas
        doc.setFillColor(...colorFondoNaranja);
        doc.rect(tablaX, yPos - 5, anchoCol1 + anchoCol2 + anchoCol3, alturaFila, 'F');
        // Fondo azul gris solo para la última columna (porcentaje)
        doc.setFillColor(...colorFondoAzulGris);
        doc.rect(tablaX + anchoCol1 + anchoCol2 + anchoCol3, yPos - 5, anchoCol4, alturaFila, 'F');
        
        // Dibujar solo el borde exterior y la línea separadora antes del porcentaje
        doc.setDrawColor(0, 0, 0);
        doc.rect(tablaX, yPos - 5, anchoTotal, alturaFila, 'S');
        // Solo la línea vertical antes de la última columna (porcentaje)
        doc.line(tablaX + anchoCol1 + anchoCol2 + anchoCol3, yPos - 5, tablaX + anchoCol1 + anchoCol2 + anchoCol3, yPos - 5 + alturaFila);
        
        // Centrar "Calificación Final" en las primeras 3 columnas combinadas
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        const anchoCombinado = anchoCol1 + anchoCol2 + anchoCol3;
        const xCentroCalificacion = tablaX + anchoCombinado / 2;
        doc.text('Calificación Final', xCentroCalificacion, yPos, { align: 'center' });
        doc.text(`${totalPuntaje.toFixed(2)}%`, xCol4, yPos, { align: 'center' });
        yPos += alturaFila + 10;
        
        // Texto de cierre - verificar si la calificación es menor al 75%
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0); // Negro por defecto
        
        if (totalPuntaje < 75) {
            // Mensaje para proveedores condicionales (menos del 75%)
            const textoCondicional1 = 'De acuerdo a la puntuación obtenida, informamos a ustedes que Aura lo ha calificado como proveedor condicional, dado que su calificación final no ha superado el 75% ponderado mínimo exigido a sus proveedores.';
            const textoCondicional2 = 'No obstante, el proveedor podrá solicitar una reevaluación anticipada para salir de su condicionalidad.';
            const textoCondicional3 = 'Agradecemos de antemano su interés y destacamos el gran aporte que significa para nuestra empresa su colaboración, y como esta nos aporta para seguir brindando a nuestros clientes un servicio de calidad.';
            
            // Primeros dos párrafos en negrita
            doc.setFont('helvetica', 'bold');
            const lineasCond1 = doc.splitTextToSize(textoCondicional1, 170);
            doc.text(lineasCond1, 20, yPos);
            yPos += lineasCond1.length * 5 + 1; // Menos espacio entre párrafos
            
            const lineasCond2 = doc.splitTextToSize(textoCondicional2, 170);
            doc.text(lineasCond2, 20, yPos);
            yPos += lineasCond2.length * 5 + 1; // Menos espacio entre párrafos
            
            // Tercer párrafo en normal
            doc.setFont('helvetica', 'normal');
            const lineasCond3 = doc.splitTextToSize(textoCondicional3, 170);
            doc.text(lineasCond3, 20, yPos);
            yPos += lineasCond3.length * 5 - 10; // Reducir mucho más espacio para subir los párrafos
        } else {
            // Mensaje normal para proveedores con 75% o más
            const textoCierre1Parte1 = 'Por la puntuación obtenida AURA ';
            const textoCierre1Parte2 = 'continuara trabajando';
            const textoCierre1Parte3 = ' con la empresa evaluada e invitamos a seguir mejorando en los aspectos calificados bajo el 100%.';
            const textoCierre2 = 'Agradecemos de antemano su interés y destacamos el gran aporte que significa para nuestra empresa su colaboración, y como esta nos aporta para seguir brindando a nuestros clientes un servicio de calidad.';
            
            // Calcular ancho de cada parte
            doc.setFont('helvetica', 'normal');
            const anchoCierreParte1 = doc.getTextWidth(textoCierre1Parte1);
            doc.setFont('helvetica', 'bold');
            const anchoCierreParte2 = doc.getTextWidth(textoCierre1Parte2);
            
            // Escribir primera parte del texto (normal, negro)
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(textoCierre1Parte1, 20, yPos);
            
            // Escribir "continuara trabajando" en negrita y rojo
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 0, 0); // Rojo
            doc.text(textoCierre1Parte2, 20 + anchoCierreParte1, yPos);
            
            // Escribir resto del texto en normal y negro
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0); // Negro
            const xInicioResto = 20 + anchoCierreParte1 + anchoCierreParte2;
            const anchoDisponible = 190 - xInicioResto;
            const textoResto = doc.splitTextToSize(textoCierre1Parte3, anchoDisponible);
            if (textoResto.length > 0) {
                doc.text(textoResto[0], xInicioResto, yPos);
                if (textoResto.length > 1) {
                    // Si hay más líneas, continuar en la siguiente
                    yPos += 5;
                    doc.text(textoResto.slice(1), 20, yPos);
                    yPos += (textoResto.length - 1) * 5;
                } else {
                    yPos += 5;
                }
            } else {
                yPos += 5;
            }
            
            const lineasCierre2 = doc.splitTextToSize(textoCierre2, 170);
            doc.text(lineasCierre2, 20, yPos);
            yPos += lineasCierre2.length * 5 - 10; // Reducir mucho más espacio para subir los párrafos
        }
        
        // Sección de firma a la derecha
        // Calcular posición para alinear a la derecha
        const anchoTextoFirma = 60;
        const xFirma = 190 - anchoTextoFirma; // Alineado a la derecha
        
        // "Saluda cordialmente" - mover más abajo, con más espacio después de los párrafos
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const ySaluda = yPos + 15; // Aumentar espacio para mover toda la firma más abajo
        doc.text('Saluda cordialmente.', xFirma + anchoTextoFirma / 2, ySaluda, { align: 'center' });
        
        // Primera línea: ABASTECIMIENTO Y LOGÍSTICA - debajo de "Saluda cordialmente" con más espacio
        yPos = ySaluda + 6; // Más espacio para separar los textos
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('ABASTECIMIENTO Y LOGÍSTICA', xFirma + anchoTextoFirma / 2, yPos, { align: 'center' });
        
        // Segunda línea: AURA INGENIERÍA S.A. con más espacio
        yPos += 5; // Más espacio para separar los textos
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('AURA INGENIERÍA S.A.', xFirma + anchoTextoFirma / 2, yPos, { align: 'center' });
        
        // Cargar y agregar firma (imagen) más pequeña debajo de "AURA INGENIERÍA S.A."
        const firmaImg = await cargarImagen('./public/firma.png');
        if (firmaImg) {
            // Centrar la imagen más pequeña con espacio debajo del texto
            const anchoFirma = 30; // Reducido de 40 a 30
            const altoFirma = 30; // Reducido de 40 a 30
            const xFirmaImg = xFirma + (anchoTextoFirma - anchoFirma) / 2;
            doc.addImage(firmaImg, 'PNG', xFirmaImg, yPos + 2, anchoFirma, altoFirma); // Espacio normal
        }
        
        // Nombre del archivo
        const nombreArchivo = `Evaluacion_${proveedor.replace(/\s+/g, '_')}_${anio}.pdf`;
        
        // Descargar PDF
        doc.save(nombreArchivo);
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        alert('❌ Error al generar el PDF. Por favor, intente nuevamente.');
    }
}

// Descargar todos los PDFs de un año
async function descargarPDFsPorAnio(anio) {
    const evaluaciones = await cargarEvaluaciones();
    const evaluacionesAnio = evaluaciones.filter(e => {
        const anioEval = e.anio || new Date(e.fechaEvaluacion || e.fecha || Date.now()).getFullYear();
        return anioEval === anio;
    });
    
    if (evaluacionesAnio.length === 0) {
        alert(`No hay evaluaciones para el año ${anio}.`);
        return;
    }
    
    if (!confirm(`¿Desea generar ${evaluacionesAnio.length} PDF(s) para el año ${anio}? Esto puede tomar unos momentos.`)) {
        return;
    }
    
    // Generar PDFs uno por uno con un pequeño delay para evitar problemas
    for (let i = 0; i < evaluacionesAnio.length; i++) {
        await generarPDFIndividual(evaluacionesAnio[i]);
        // Pequeño delay entre descargas
        if (i < evaluacionesAnio.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    alert(`✅ Se han generado ${evaluacionesAnio.length} PDF(s) para el año ${anio}.`);
}

// Función auxiliar para cargar imágenes
function cargarImagen(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Determinar el tipo de imagen por la extensión
                let dataURL;
                if (src.toLowerCase().endsWith('.png')) {
                    dataURL = canvas.toDataURL('image/png');
                } else {
                    dataURL = canvas.toDataURL('image/jpeg', 0.95);
                }
                resolve(dataURL);
            } catch (e) {
                console.warn('Error al procesar imagen:', e);
                resolve(null);
            }
        };
        img.onerror = () => {
            console.warn('Error al cargar imagen:', src);
            resolve(null);
        };
        img.src = src;
    });
}

