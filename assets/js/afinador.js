class Afinador {

    // Cuerdas de la guitarra española (afinación estándar) de la 6ª (grave) a la 1ª (aguda)
    cuerdas = [
        { numero: 6, nombre: 'E2', frecuencia: 82.41, etiqueta: '6ª' },
        { numero: 5, nombre: 'A2', frecuencia: 110.00, etiqueta: '5ª' },
        { numero: 4, nombre: 'D3', frecuencia: 146.83, etiqueta: '4ª' },
        { numero: 3, nombre: 'G3', frecuencia: 196.00, etiqueta: '3ª' },
        { numero: 2, nombre: 'B3', frecuencia: 246.94, etiqueta: '2ª' },
        { numero: 1, nombre: 'E4', frecuencia: 329.63, etiqueta: '1ª' }
    ];

    cuerdaActual = 1;

    esIniciado = false;
    audioCtx = null;
    mediaStream = null;
    analyser = null;
    intervalo = null;

    constructor() {
        this.cuerdaActual = parseInt(localStorage.getItem('cuerdaAfinacion')) || 1;
    }

    cargarDatos() {
        this.seleccionarCuerda(this.cuerdaActual);
    }

    seleccionarCuerda(numero) {
        this.cuerdaActual = numero;
        localStorage.setItem('cuerdaAfinacion', numero);

        let cuerda = this.cuerdas.find(c => c.numero == numero);

        // Marcamos visualmente la cuerda activa
        document.querySelectorAll('.btn-cuerda').forEach(btn => {
            btn.classList.remove('activo');
        });
        let btn = document.getElementById('btnCuerda' + numero);
        if (btn)
            btn.classList.add('activo');

        document.getElementById('sp-nota').innerHTML = cuerda.nombre;
        document.getElementById('sp-frecuencia-objetivo').innerHTML = cuerda.frecuencia.toFixed(2) + ' Hz';

        this.actualizarUI(null);
    }

    iniciar() {

        if (this.esIniciado) {
            this.detener();
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.esIniciado = true;
                this.mediaStream = stream;

                this.audioCtx = new AudioContext();
                this.analyser = this.audioCtx.createAnalyser();
                this.analyser.fftSize = 2048;

                let source = this.audioCtx.createMediaStreamSource(stream);
                source.connect(this.analyser);

                document.getElementById('sp-iniciar').innerHTML = 'Detener';
                document.getElementById('estado').textContent = 'Escuchando...';

                // Detección continua
                this.intervalo = setInterval(() => this.detectar(), 120);
            })
            .catch(() => {
                alert('No se pudo acceder al micrófono. Asegúrate de permitir el acceso y de usar HTTPS o localhost.');
            });
    }

    detener() {
        this.esIniciado = false;
        clearInterval(this.intervalo);
        this.intervalo = null;

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        if (this.audioCtx) {
            this.audioCtx.close();
            this.audioCtx = null;
        }
        this.analyser = null;

        document.getElementById('sp-iniciar').innerHTML = 'Iniciar';
        document.getElementById('estado').textContent = 'Micrófono detenido';
        this.actualizarUI(null);
    }

    detectar() {

        if (!this.analyser)
            return;

        let bufferLength = this.analyser.fftSize;
        let timeData = new Float32Array(bufferLength);
        this.analyser.getFloatTimeDomainData(timeData);

        let frecuencia = this.detectarFrecuenciaAutocorrelacion(timeData, this.audioCtx.sampleRate);

        if (frecuencia && frecuencia > 60 && frecuencia < 500) {
            this.actualizarUI(frecuencia);
        } else {
            document.getElementById('estado').textContent = 'Toca la cuerda ' + this.cuerdaActual + 'ª';
            this.actualizarUI(null);
        }
    }

    // Detección de tono por autocorrelación (sin librerías)
    detectarFrecuenciaAutocorrelacion(buffer, sampleRate) {

        let rms = 0;
        for (let i = 0; i < buffer.length; i++) {
            rms += buffer[i] * buffer[i];
        }
        rms = Math.sqrt(rms / buffer.length);
        if (rms < 0.01)
            return null;

        // Límites de autocorrelación para 60Hz-500Hz
        let minPeriod = Math.floor(sampleRate / 500);
        let maxPeriod = Math.floor(sampleRate / 60);

        let mejorCorrelacion = -1;
        let mejorPeriodo = maxPeriod;

        for (let period = maxPeriod; period > minPeriod; period--) {
            let correlacion = 0;
            for (let i = 0; i < buffer.length - period; i++) {
                correlacion += buffer[i] * buffer[i + period];
            }
            correlacion /= (buffer.length - period);

            if (correlacion > mejorCorrelacion) {
                mejorCorrelacion = correlacion;
                mejorPeriodo = period;
            }
        }

        // Refinamiento parabólico para mayor precisión
        let x0 = mejorPeriodo;
        let x1 = x0 + 1;
        let y0 = this.correlacionEn(buffer, x0 - 1);
        let y1 = this.correlacionEn(buffer, x0);
        let y2 = this.correlacionEn(buffer, x1);
        let p = (y2 - y0) / (2 * (2 * y1 - y0 - y2));
        if (p >= -1 && p <= 1)
            x0 = x0 + p;

        return sampleRate / x0;
    }

    correlacionEn(buffer, i) {
        let length = buffer.length - i;
        let corr = 0;
        for (let j = 0; j < length; j++) {
            corr += buffer[j] * buffer[j + i];
        }
        return corr / length;
    }

    actualizarUI(frecuencia) {

        let cuerda = this.cuerdas.find(c => c.numero == this.cuerdaActual);
        let objetivo = cuerda.frecuencia;

        let spFrecuencia = document.getElementById('sp-frecuencia');

        if (!frecuencia) {
            spFrecuencia.textContent = '-- Hz';
            document.getElementById('sp-cents').textContent = '';
            document.getElementById('flecha').textContent = '—';
            document.getElementById('flecha').className = 'flecha';
            document.getElementById('barra-llena').style.width = '50%';
            document.getElementById('zona-estado').className = '';
            return;
        }

        // Desviación en cents (1200 * log2(f / f0))
        let cents = 1200 * (Math.log(frecuencia / objetivo) / Math.LN2);
        cents = Math.round(cents);

        spFrecuencia.textContent = frecuencia.toFixed(1) + ' Hz';
        document.getElementById('sp-cents').textContent = (cents > 0 ? '+' : '') + cents + ' cents';

        // Flecha de indicación
        let flecha = document.getElementById('flecha');
        let zonaEstado = document.getElementById('zona-estado');

        if (Math.abs(cents) <= 3) {
            flecha.textContent = '✔';
            flecha.className = 'flecha afinado';
            zonaEstado.className = 'afinado';
            document.getElementById('estado').textContent = '¡Afinado!';
        } else if (cents > 0) {
            flecha.textContent = '▲';
            flecha.className = 'flecha agudo';
            zonaEstado.className = 'agudo';
            document.getElementById('estado').textContent = 'Más agudo — afloja la cuerda';
        } else {
            flecha.textContent = '▼';
            flecha.className = 'flecha grave';
            zonaEstado.className = 'grave';
            document.getElementById('estado').textContent = 'Más grave — tensa la cuerda';
        }

        // Barra: -50 a +50 cents -> 0% a 100%
        let porcentaje = Math.max(0, Math.min(100, 50 + cents));
        document.getElementById('barra-llena').style.width = porcentaje + '%';
    }

    sonarReferencia() {

        let cuerda = this.cuerdas.find(c => c.numero == this.cuerdaActual);

        let ctx = this.audioCtx || new AudioContext();
        let oscilador = ctx.createOscillator();
        let ganancia = ctx.createGain();

        oscilador.type = 'sine';
        oscilador.frequency.value = cuerda.frecuencia;
        ganancia.gain.value = 0.25;

        oscilador.connect(ganancia);
        ganancia.connect(ctx.destination);

        oscilador.start();
        ganancia.gain.setTargetAtTime(0, ctx.currentTime + 2, 0.3);
        oscilador.stop(ctx.currentTime + 3);
    }
}