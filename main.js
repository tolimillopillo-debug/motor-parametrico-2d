document.addEventListener("DOMContentLoaded", () => {
    const estado = document.getElementById("estado");
    const panelControl = document.getElementById("panel-control");
    const areaDibujo = document.getElementById("area-dibujo");

    // Vinculación con los deslizadores de tu pantalla
    const inputBusto = document.getElementById("input-busto");
    const inputCintura = document.getElementById("input-cintura");
    const inputTalle = document.getElementById("input-talle");

    const valBusto = document.getElementById("val-busto");
    const valCintura = document.getElementById("val-cintura");
    const valTalle = document.getElementById("val-talle");

    const formulas = {
        "AnchoPecho": "busto / 4",
        "AnchoCintura": "(cintura / 4) + 2",
        "SisaAltura": "largo_talle / 2"
    };

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

    // Función del motor que se activa al mover los controles en el celular
    function actualizarPatron() {
        if (estado) {
            estado.textContent = "Dibujando...";
            estado.style.color = "orange";
        }

        const medidas = {
            busto: Number(inputBusto.value),
            cintura: Number(inputCintura.value),
            largo_talle: Number(inputTalle.value),
            ancho_espalda: 38
        };

        valBusto.textContent = medidas.busto;
        valCintura.textContent = medidas.cintura;
        valTalle.textContent = medidas.largo_talle;

        const variables = resolverFormulas(medidas, formulas);
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

        crearPuntoBase("A0", 30, 30); 
        crearPuntoAngulo("A1", "A0", 0, variables["AnchoPecho"]);
        crearPuntoAngulo("A2", "A0", 90, variables["SisaAltura"]);
        crearPuntoAngulo("A3", "A0", 90, variables["largo_talle"]);
        crearPuntoAngulo("A4", "A3", 0, variables["AnchoCintura"]);

        if (areaDibujo) {
            const escala = 4; 
            let svgHTML = `<svg width="100%" height="100%" viewBox="0 0 450 550" xmlns="http://www.w3.org/2000/svg" style="background-color: #fcfcfc;">`;

            const conexiones = [
                { de: "A0", a: "A1", color: "#1abc9c", grosor: 3 }, 
                { de: "A0", a: "A3", color: "#2c3e50", grosor: 3 }, 
                { de: "A3", a: "A4", color: "#2980b9", grosor: 3 }, 
                { de: "A1", a: "A4", color: "#7f8c8d", grosor: 1.5, estriada: true } 
            ];

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

            for (let nombre in puntos) {
                const pt = puntos[nombre];
                const cx = pt.x * escala;
                const cy = pt.y * escala;

                svgHTML += `<circle cx="${cx}" cy="${cy}" r="6" fill="#e74c3c" stroke="#fff" stroke-width="2" />`;
                svgHTML += `<text x="${cx + 10}" y="${cy - 8}" fill="#2c3e50" font-family="Arial" font-weight="bold" font-size="14">${nombre}</text>`;
            }

            svgHTML += `</svg>`;
            areaDibujo.innerHTML = svgHTML;
        }

        if (panelControl) {
            panelControl.innerHTML = "<h3>Coordenadas de Puntos (Esqueleto):</h3>";
            for (let nombrePunto in puntos) {
                const pt = puntos[nombrePunto];
                panelControl.innerHTML += `
                    <p style="color: #e67e22; font-family: monospace; margin: 5px 0; font-size: 15px;">
                        <strong>${nombrePunto}:</strong> X: ${pt.x}, Y: ${pt.y}
                    </p>
                `;
            }
        }

        if (estado) {
            estado.textContent = "¡Patrón dibujado con éxito!";
            estado.style.color = "green";
        }
    }

    // Ejecución y asignación de eventos táctiles
    actualizarPatron();
    inputBusto.addEventListener("input", actualizarPatron);
    inputCintura.addEventListener("input", actualizarPatron);
    inputTalle.addEventListener("input", actualizarPatron);
});
                    
