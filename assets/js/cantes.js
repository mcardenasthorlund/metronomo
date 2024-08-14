class Cantes {

    #urlCantes = '/assets/data/cantes.json';
    cantes = [];

    canteActual = {};

    constructor() {}

    async refrescarCantes() {

        console.log('Cargando cantes...');

        let objetoPeticion = {
            method: 'GET'
        };
        let respuesta = await fetch(this.#urlCantes, objetoPeticion);
        this.cantes = await respuesta.json();

        localStorage.setItem('cantes', JSON.stringify(this.cantes));

        this.cargarCantes();
    }

    cargarCantes() {
        if (this.cantes == [])
            this.cantes = JSON.parse(localStorage.getItem('cantes')) || [];

        console.log('Cantes cargados:', this.cantes);

        let lista = document.getElementById('lista-cantes');
        lista.innerHTML = '';
        this.cantes.cantes.forEach(cante => {
            let liCompas = `<li class="list-group-item lista" onclick="objCantes.cargarCante('${cante.id}')">${cante.nombre} <small>${cante.detalle}</small><i class="bi bi-chevron-double-right"></i></li>`;
            lista.innerHTML += liCompas;
        });
    }

    cargarCante(id) {
        let base = this.cantes.cantes.find(cante => cante.id == id);

        console.log(base);
        localStorage.setItem('cante', JSON.stringify(base));
        window.location.href = 'cante.html';
    }

    cargarDatosCante() {
        this.canteActual = JSON.parse(localStorage.getItem('cante'));

        document.getElementById('cabecera').cambiarInfo(this.canteActual.nombre, this.canteActual.detalle);

        // Cargamos el cante
        let letraCompleta = this.canteActual.letra.split('|');
        let acordesCompleto = this.canteActual.acordes.split('|');

        let letraMezclada = '';
        for (let i = 0; i < letraCompleta.length; i++) {
            letraMezclada += '<span class="acordes">' + acordesCompleto[i] + '</span><br/>' + letraCompleta[i] + '<br/><br/>';
        }
        document.getElementById('letra').innerHTML = letraMezclada;

        let recursos = document.getElementById('lista-recursos');
        recursos.innerHTML = '';
        this.canteActual.videos.forEach(recurso => {
            let liRecurso = `<li class="list-group-item lista" onclick="objCante.cargarVideo('${recurso.url}')">${recurso.nombre} <i class="bi bi-chevron-double-right"></i></li>`;
            recursos.innerHTML += liRecurso;
        });
    }

    cargarVideo(url){
        window.open(url, '_blank');
    }

    

}