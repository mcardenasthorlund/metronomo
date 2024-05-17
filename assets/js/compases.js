class Compases {

    #urlCompases = '/assets/data/compases.json';
    compases = [];

    compasActual = {};

    esIniciado = false;
    esContra = false;
    modoActual = 1;
    
    canvas = null;
    ctx = null;
    radius = null;

    intervalo = null;
    audioCtxPalma = new AudioContext();

    audioPalma = null;
    audioAcento = null;
    audioContra = null;

    palma = null;
    palmaAcento = null;
    palmaContra = null;


    constructor() {
        // Cargamos los audios
        this.palma = new Audio("/assets/audios/palma.mp3");
        this.palmaAcento = new Audio("/assets/audios/palma-acento.mp3");
        this.palmaContra = new Audio("/assets/audios/contra.mp3");

        this.audioPalma = this.audioCtxPalma.createMediaElementSource(this.palma);
        this.audioAcento = this.audioCtxPalma.createMediaElementSource(this.palmaAcento);
        this.audioContra = this.audioCtxPalma.createMediaElementSource(this.palmaContra);
        
        this.audioPalma.connect(this.audioCtxPalma.destination);
        this.audioAcento.connect(this.audioCtxPalma.destination);
        this.audioContra.connect(this.audioCtxPalma.destination);
    }

    /**
     * Obtener los compases de internet
     */
    async refrescarCompases() {

        console.log('Cargando compases...');

        let objetoPeticion = {
            method: 'GET'
        };
        let respuesta = await fetch(this.#urlCompases, objetoPeticion);
        this.compases = await respuesta.json();

        localStorage.setItem('compases', JSON.stringify(this.compases));

        this.cargarCompases();
    }

    /**
     * Cargar la lista de compases
     */
    cargarCompases() {
        if (this.compases == [])
            this.compases = JSON.parse(localStorage.getItem('compases')) || [];

        console.log('Compases cargados:', this.compases);

        let lista = document.getElementById('lista-compases');
        lista.innerHTML = '';
        this.compases.compases.forEach(compas => {
            let liCompas = `<li class="list-group-item lista" onclick="objCompas.cargarCompas('${compas.id}')">${compas.nombre} <i class="bi bi-chevron-double-right"></i></li>`;
            lista.innerHTML += liCompas;
        });
    }

    /**
     * Cargar los datos del compas en el storage e ir al detalle
     * @param {number} id 
     */
    cargarCompas(id) {
        let compas = this.compases.compases.find(compas => compas.id == id);
        localStorage.setItem('compas', JSON.stringify(compas));
        window.location.href = 'compas.html';
    }

    /**
     * Cargar los datos del compas en pantalla
     */
    cargarDatosCompas() {
        this.compasActual = JSON.parse(localStorage.getItem('compas'));
        document.getElementById('nombre-palo').innerHTML = this.compasActual.nombre;
        document.getElementById('tiempos-palo').innerHTML = this.compasActual.tiempos + ' tiempos';
        document.getElementById('sp-velocidad').innerHTML = this.compasActual.velocidad + ' BPM';
        document.getElementById('rngVelocidad').value = this.compasActual.velocidad;

        // Iniciamos el reloj
        this.canvas = document.getElementById('cnvReloj');
        this.ctx = this.canvas.getContext("2d");
        this.radius = this.canvas.height / 2;
        
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.translate(this.radius, this.radius);
        this.radius = this.radius * 0.90;
    
        dibujarCirculoReloj(this.ctx, this.radius);
        dibujarNumeros(this.ctx, this.radius, this.compasActual.tiempos, this.compasActual.acentos);
        
    }

    /**
     * Iniciar el compas
     * @returns 
     */
    iniciarCompas() {

        if (this.esIniciado) {
            // Paramos el intervalo
            this.esIniciado = false;
            clearInterval(this.intervalo)
            document.getElementById('sp-iniciar').innerHTML = 'Iniciar';
            return
        }

        this.esIniciado = true;
        this.esContra = false;
        document.getElementById('sp-iniciar').innerHTML = 'Detener';

        // Calculamos el numero de bpm
        let bpm = 60000 / parseFloat(this.compasActual.velocidad);
        

        // Iniciamos el timer
        this.intervalo = setInterval(() => this.cambiarNumero(), bpm / 2); // Lo dividimos entre para los contratiempos
    }

    /**
     * Cambiar el numero del compas
     */
    cambiarNumero() {

        let palmas = this.compasActual.palmas.split(',');

        let numeroActual = parseInt(document.getElementById('numeros').innerHTML);

        if (this.esContra) {

            // No cambiamos el numero
            this.esContra = false;

            // Vemos si hay palma
            let palma = palmas[numeroActual - 1][1];
            if (palma == 'x') {
                this.palmaContra.play();
            }
            return;
        }

        this.esContra = true;
        numeroActual = numeroActual + 1;
        if (numeroActual > this.compasActual.tiempos) {
            numeroActual = 1;
        }

        // Cambiamos el numero
        dibujarCirculoReloj(this.ctx, this.radius);
        dibujarNumeros(this.ctx, this.radius, this.compasActual.tiempos, this.compasActual.acentos);
        dibujarAguja(this.ctx, this.radius, numeroActual, this.compasActual.tiempos);

        document.getElementById('numeros').innerHTML = numeroActual;
        let palma = palmas[numeroActual - 1][0];
        if (palma == 'x') {
            // Comprobamos si es un acento
            let acentos = this.compasActual.acentos.split(',');
            if (acentos.includes(numeroActual.toString())) {
                this.palmaAcento.play();
            } else {
                this.palma.play();
            }
        }

        // Comprobamos si es un acento
        let acentos = this.compasActual.acentos.split(',');
        if (acentos.includes(numeroActual.toString())) {
            document.getElementById('numeros').classList.add('numero-acento');
        } else {
            document.getElementById('numeros').classList.remove('numero-acento');
        }
    }
    cambiarVelocidad(){
        this.compasActual.velocidad = document.getElementById('rngVelocidad').value;
        document.getElementById('sp-velocidad').innerHTML = this.compasActual.velocidad + ' BPM';

        if (this.esIniciado) {
            // Paramos el intervalo
            this.esIniciado = false;
            clearInterval(this.intervalo)
            
            this.iniciarCompas();
            return
        }
    }

    /**
     * Cambiar el modo a numeros, reloj o solo audio
     * @param {Number} modo 
     */
    cambiarModo(modo){
        this.modoActual = modo;
        if (this.modoActual == 0){
            document.getElementById('numeros').style.display = 'none';
            document.getElementById('reloj').style.display = 'none';
        } else if(this.modoActual == 1){
            document.getElementById('numeros').style.display = 'block';
            document.getElementById('reloj').style.display = 'none';    
        } else if(this.modoActual == 2){
            document.getElementById('numeros').style.display = 'none';
            document.getElementById('reloj').style.display = 'block';    
        }
    }
}