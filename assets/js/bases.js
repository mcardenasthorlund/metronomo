class Bases {

    #urlBases = '/assets/data/bases.json';
    bases = [];

    baseActual = {};
    duracionActual = '';

    esIniciado = false;
    intervalo = null;
    sound = null;

    constructor() {}

    async refrescarBases() {

        console.log('Cargando bases...');

        let objetoPeticion = {
            method: 'GET'
        };
        let respuesta = await fetch(this.#urlBases, objetoPeticion);
        this.bases = await respuesta.json();

        localStorage.setItem('bases', JSON.stringify(this.bases));

        this.cargarBases();
    }

    cargarBases() {
        if (this.bases == [])
            this.bases = JSON.parse(localStorage.getItem('bases')) || [];

        console.log('Bases cargadas:', this.bases);

        let lista = document.getElementById('lista-bases');
        lista.innerHTML = '';
        this.bases.audios.forEach(base => {
            let liCompas = `<li class="list-group-item lista" onclick="objBase.cargarBase('${base.id}')">${base.nombre} <small>${base.detalle}</small> <i class="bi bi-chevron-double-right"></i></li>`;
            lista.innerHTML += liCompas;
        });
    }

    cargarBase(id) {
        let base = this.bases.audios.find(base => base.id == id);
        localStorage.setItem('base', JSON.stringify(base));
        window.location.href = 'reproductor.html';
    }

    cargarDatosBase() {
        this.baseActual = JSON.parse(localStorage.getItem('base'));

        document.getElementById('cabecera').cambiarInfo(this.baseActual.nombre, this.baseActual.detalle);

        // Cargamos el audio
        document.getElementById('rngVelocidad').value = 1;
        document.getElementById('sp-velocidad').innerHTML = '1 x';
    }

    iniciarBase(){

        if (this.esIniciado) {
            this.sound.stop();
            return;
        }

        this.esIniciado = true;
        document.getElementById('sp-iniciar-base').innerHTML = 'Detener';
        let velocidad = parseFloat(document.getElementById('rngVelocidad').value);

        document.getElementById('img-cargando').style.display = 'inline-block';

        this.sound = new Howl({
            src: [this.baseActual.url],
            html5: true,
            rate: velocidad,
            onload: () => {
                this.sound.play();
            },
            onplay: () => {
                this.esIniciado = true;

                // Iniciamos el timer
                this.intervalo = setInterval(() => this.actualizarDuracion(), 200);

                // Calculamos la duracion
                let segundos = parseInt(this.sound.duration());
                let minutos = parseInt(segundos / 60);
                segundos = segundos - (minutos * 60);

                if (segundos < 10)
                    segundos = '0' + segundos;
                document.getElementById('sp-duracion').innerHTML = `${minutos}:${segundos}`;

                document.getElementById('img-audio').style.display = 'block';
                document.getElementById('img-cargando').style.display = 'none';
            },
            onend: () => {
                this.sound.stop();
                this.esIniciado = false;
                document.getElementById('sp-iniciar-base').innerHTML = 'Iniciar';
                clearInterval(this.intervalo);
            },
            onstop: () => {
                this.sound.stop();
                this.esIniciado = false;
                document.getElementById('sp-iniciar-base').innerHTML = 'Iniciar';
                clearInterval(this.intervalo);
                document.getElementById('img-audio').style.display = 'none';
                document.getElementById('img-cargando').style.display = 'none';
            }
          });
    }
    
    cambiarVelocidadBase(){

        let velocidad = parseFloat(document.getElementById('rngVelocidad').value);
        document.getElementById('sp-velocidad').innerHTML = velocidad + ' x';

        if (this.esIniciado) {
            // Paramos el intervalo
            this.sound.rate(velocidad);
            return
        }
    }

    actualizarDuracion(){
        if (this.esIniciado) {
            let segundos = parseInt(this.sound.seek());
            let minutos = parseInt(segundos / 60);
            segundos = segundos - (minutos * 60);

            if (segundos < 10)
                segundos = '0' + segundos;
            document.getElementById('sp-duracion-actual').innerHTML = `${minutos}:${segundos}`;
        }
    }


}