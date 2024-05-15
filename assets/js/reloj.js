
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

function dibujarNumeros(ctx, radius, compases, acentos) {
    
    let sAcentos = acentos.split(',');
    var ang;
    var num;
    ctx.font = radius * 0.15 + "px arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    var ang2 = compases / 2;
    for (num = 1; num < compases + 1; num++) {
        ang = num * (Math.PI / ang2);
        ctx.rotate(ang);
        ctx.translate(0, -radius * 0.85);
        ctx.rotate(-ang);
        if (sAcentos.includes(num.toString())) 
            ctx.fillStyle = "#e6bb2f";
        else
            ctx.fillStyle = "black";
        ctx.fillText(num.toString(), 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, radius * 0.85);
        ctx.rotate(-ang);
    }
}

function dibujarAguja(ctx, radius, tiempo, tiempos) {

    posicion = tiempo % tiempos;
    var ang2 = tiempos / 2;
    var posicion = (posicion * Math.PI / ang2);

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
