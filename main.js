document.addEventListener("DOMContentLoaded", () => {
    const estado = document.getElementById("estado");
    if (estado) {
        estado.textContent = "¡Cerebro listo para recibir fórmulas!";
        estado.style.color = "green";
    }
    console.log("Motor Paramétrico inicializado correctamente.");
});
