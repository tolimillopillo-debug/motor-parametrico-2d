document.addEventListener("DOMContentLoaded", () => {
    const estado = document.getElementById("estado");
    const panelControl = document.getElementById("panel-control");
    const areaDibujo = document.getElementById("area-dibujo");

    if (estado) {
        estado.textContent = "¡Dibujando Patrón SVG!";
        estado.style.color = "orange";
    }

    // 1. Base de datos de medidas del cuerpo
    const medidas = {
        busto: 96,
        cintura: 78,
        largo_talle: 42,
        ancho_espalda: 38
    };

    // 2. Fórmulas paramétricas base
    const formulas = {
        "AnchoPecho": "busto / 4",
        "AnchoCintura": "(cintura / 4) + 2",
        "SisaAltura": "largo_talle / 2"
    };

    // Función del motor para resolver fórmulas de texto
    function resolverFormulas(medidasBase, reglasFormulas) {
        const resultados = { ...medidasBase };
        for (let variable in reglasFormulas) {
            let formulaModificada = reglasFormulas[variable];
            for (let medida in resultados) {
                const regex = new RegExp(`\\b${medida}\\b`, 'g');
                formulaModificada = formulaModificada.replace(regex, resultados[medida]);
            }
            try {
                const calculo = new Function(`return ${formulaModificada}`)();
                resultados[variable] = Number(calculo.toFixed(2));
            } catch (error) {
                resultados[variable] = 0;
            }
        }
        return resultados;
    }

    const variables = resolverFormulas(medidas, formulas);

    // ==========================================
    // MOTOR GEOMÉTRICO 2D
    // ==========================================
    const puntos = {};

    function crearPuntoBase(nombre, x, y) {
        puntos[nombre] = { x: x, y: y };
    }

    function crearPuntoAngulo(nombre, puntoOrigen, anguloGrados, distancia) {
        if (!puntos[puntoOrigen]) return;
        const origen = puntos[puntoOrigen];
        const radianes = (anguloGrados * Math.PI) / 180;
        const nuevoX = origen.x + distancia * Math.cos(radianes);
        const nuevoY = origen.y + distancia * Math.sin(radianes);
        puntos[nombre] = { 
            x: Number(nuevoX.toFixed(2)), 
            y: Number(nuevoY.toFixed(2)) 
        };
    }

    // --- Aplicar Geometría (Ajustamos el origen para centrar el dibujo) ---
    crearPuntoBase("A0", 30, 30); 
    crearPuntoAngulo("A1", "A0", 0, variables["AnchoPecho"]);
    crearPuntoAngulo("A2", "A0", 90, variables["SisaAltura"]);
    crearPuntoAngulo("A3", "A0", 90, variables["largo_talle"]);
    crearPuntoAngulo("A4", "A3", 0, variables["AnchoCintura"]);

    // ==========================================
    // NUEVO: RENDERIZADOR SVG (EL LIENZO EN VIVO)
    // ==========================================
    if (areaDibujo) {
        // Multiplicador de escala para ajustar los centímetros a píxeles en pantalla
        const escala = 4; 

        // Creamos el contenedor SVG limpio
        let svgHTML = `<svg width="100%" height="100%" viewBox="0 0 450 550" xmlns="http://www.w3.org/2000/svg" style="background-color: #fcfcfc;">`;

        // Definimos qué puntos queremos conectar con líneas
        const conexiones = [
            { de: "A0", a: "A1", color: "#1abc9c", grosor: 3 }, // Línea de pecho (Verde esmeralda)
            { de: "A0", a: "A3", color: "#2c3e50", grosor: 3 }, // Centro espalda / delantero (Oscuro)
            { de: "A3", a: "A4", color: "#2980b9", grosor: 3 }, // Línea de cintura (Azul)
            { de: "A1", a: "A4", color: "#7f8c8d", grosor: 1.5, estriada: true } // Costado (Punteado gris)
        ];

        // 1. Pintamos las líneas de unión
        conexiones.forEach(linea => {
            const p1 = puntos[linea.de];
            const p2 = puntos[linea.a];
            if (p1 && p2) {
                const x1 = p1.x * escala;
                const y1 = p1.y * escala;
                const x2 = p2.x * escala;
                const y2 = p2.y * escala;
                const guiones = linea.estriada ? 'stroke-dasharray="5,5"' : '';

                svgHTML += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                                 stroke="${linea.color}" stroke-width="${linea.grosor}" ${guiones} />`;
            }
        });

        // 2. Pintamos los nodos (círculos rojos) y sus etiquetas
        for (let nombre in puntos) {
            const pt = puntos[nombre];
            const cx = pt.x * escala;
            const cy = pt.y * escala;

            // Círculo del punto
            svgHTML += `<circle cx="${cx}" cy="${cy}" r="6" fill="#e74c3c" stroke="#fff" stroke-width="2" />`;
            
            // Texto de la etiqueta (ej: A0) desplazado ligeramente para que se lea perfecto
            svgHTML += `<text x="${cx + 10}" y="${cy - 8}" fill="#2c3e50" font-family="Arial" font-weight="bold" font-size="14">${nombre}</text>`;
        }

        svgHTML += `</svg>`;
        
        // Inyectamos todo el gráfico interactivo directamente en nuestra caja de dibujo
        areaDibujo.innerHTML = svgHTML;
    }

    // 4. Mostrar las coordenadas en el panel de control
    if (panelControl) {
        const listaHTML = document.createElement("div");
        listaHTML.style.marginTop = "15px";
        listaHTML.innerHTML = "<h3>Coordenadas de Puntos (Esqueleto):</h3>";

        for (let nombrePunto in puntos) {
            const pt = puntos[nombrePunto];
            listaHTML.innerHTML += `
                <p style="color: #e67e22; font-family: monospace; margin: 5px 0;">
                    <strong>${nombrePunto}:</strong> X: ${pt.x}, Y: ${pt.y}
                </p>
            `;
        }
        panelControl.appendChild(listaHTML);
    }

    if (estado) {
        estado.textContent = "¡Patrón dibujado con éxito!";
        estado.style.color = "green";
    }
});
        
