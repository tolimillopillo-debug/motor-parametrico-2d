document.addEventListener("DOMContentLoaded", () => {
    const estado = document.getElementById("estado");
    const panelControl = document.getElementById("panel-control");

    if (estado) {
        estado.textContent = "¡Calculando Geometría 2D!";
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
    // NUEVO: MOTOR GEOMÉTRICO 2D
    // ==========================================
    
    // Almacén para guardar las coordenadas reales (X, Y) de cada punto
    const puntos = {};

    // Función 1: Crear punto inicial de referencia
    function crearPuntoBase(nombre, x, y) {
        puntos[nombre] = { x: x, y: y };
    }

    // Función 2: Crear punto a partir de un ángulo (grados) y una distancia
    function crearPuntoAngulo(nombre, puntoOrigen, anguloGrados, distancia) {
        if (!puntos[puntoOrigen]) return;

        const origen = puntos[puntoOrigen];
        // Convertimos grados a radianes para que JavaScript lo entienda
        const radianes = (anguloGrados * Math.PI) / 180;

        // Calculamos las nuevas coordenadas cartesianas
        const nuevoX = origen.x + distancia * Math.cos(radianes);
        const nuevoY = origen.y + distancia * Math.sin(radianes);

        puntos[nombre] = { 
            x: Number(nuevoX.toFixed(2)), 
            y: Number(nuevoY.toFixed(2)) 
        };
    }

    // --- APLICAR GEOMETRÍA AL PATRÓN ---
    // Colocamos el Punto A0 en la esquina superior izquierda (X: 50, Y: 50)
    crearPuntoBase("A0", 50, 50);

    // Creamos A1 (Ancho de Pecho) hacia la derecha (0 grados)
    crearPuntoAngulo("A1", "A0", 0, variables["AnchoPecho"]);

    // Creamos A2 (Altura de Sisa) hacia abajo (90 grados)
    crearPuntoAngulo("A2", "A0", 90, variables["SisaAltura"]);

    // Creamos A3 (Largo Total) hacia abajo (90 grados) desde A0
    crearPuntoAngulo("A3", "A0", 90, variables["largo_talle"]);

    // Creamos A4 (Ancho de Cintura) hacia la derecha (0 grados) desde A3
    crearPuntoAngulo("A4", "A3", 0, variables["AnchoCintura"]);


    // 4. Mostrar los resultados de las coordenadas en la pantalla
    if (panelControl) {
        const listaHTML = document.createElement("div");
        listaHTML.style.marginTop = "15px";
        listaHTML.innerHTML = "<h3>Coordenadas de Puntos (Esqueleto):</h3>";

        for (let nombrePunto in puntos) {
            const pt = puntos[nombrePunto];
            listaHTML.innerHTML += `
                <p style="color: #e67e22; font-family: monospace;">
                    <strong>${nombrePunto}:</strong> X: ${pt.x}, Y: ${pt.y}
                </p>
            `;
        }
        panelControl.appendChild(listaHTML);
    }

    if (estado) {
        estado.textContent = "¡Motor geométrico activo!";
        estado.style.color = "green";
    }
});
                          
