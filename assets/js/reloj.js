
function dibujarCirculoReloj(ctx, radius) {
    var grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
    grad.addColorStop(0, '#333');
    grad.addColorStop(0.5, 'white');
    grad.addColorStop(1, '#333');
    ctx.strokeStyle = "#e6bb2f";
    ctx.lineWidth = radius * 0.08;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
}

function anguloTiempo(num, tiempos, numArriba) {
    // Sin numArriba: se mantiene el comportamiento original
    if (numArriba === undefined || numArriba === null || numArriba === '') {
        return num * (2 * Math.PI / tiempos);
    }
    // numArriba va en la vertical (12 en un reloj), el resto se reparte desde ahí.
    // En este dibujo la vertical (arriba) corresponde al ángulo 0.
    return (num - numArriba) * (2 * Math.PI / tiempos);
}

function dibujarNumeros(ctx, radius, compases, acentos, numArriba, visibles, etiquetas) {
    
    let sAcentos = acentos.split(',');
    let sVisibles = visibles ? visibles.split(',') : [];
    var ang;
    var num;
    ctx.font = radius * 0.15 + "px arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    var ang2 = compases / 2;
    for (num = 1; num < compases + 1; num++) {
        // Si se define visibles, solo se pinta el número de los tiempos marcados
        if (sVisibles.length && !sVisibles.includes(num.toString()))
            continue;
        ang = anguloTiempo(num, compases, numArriba);
        // Etiqueta personalizada si está definida; si no, el número del tiempo
        let texto = (etiquetas && etiquetas[num - 1]) ? etiquetas[num - 1] : num.toString();
        ctx.rotate(ang);
        ctx.translate(0, -radius * 0.85);
        ctx.rotate(-ang);
        if (sAcentos.includes(num.toString())) 
            ctx.fillStyle = "#e6bb2f";
        else
            ctx.fillStyle = "black";
        ctx.fillText(texto, 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, radius * 0.85);
        ctx.rotate(-ang);
    }
}

function dibujarAguja(ctx, radius, tiempo, tiempos, numArriba) {

    posicion = anguloTiempo(tiempo, tiempos, numArriba);

    dibujarAgujaTiempo(ctx, posicion, radius * 0.75, radius * 0.02);
}

function dibujarAgujaTiempo(ctx, pos, length, width) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
}
