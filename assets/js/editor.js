class Editor {

    compsPropios = [];
    idEdicion = null;

    constructor() {}

    init() {
        this.compsPropios = JSON.parse(localStorage.getItem('compasesPropios')) || [];

        let edicion = JSON.parse(localStorage.getItem('compasEdicion')) || null;
        if (edicion) {
            this.idEdicion = edicion.id;
            document.getElementById('txtNombre').value = edicion.nombre;
            document.getElementById('rngVelocidad').value = edicion.velocidad;
            document.getElementById('nudTiempos').value = edicion.tiempos;
            if (edicion.numArriba)
                document.getElementById('txtVertical').value = edicion.numArriba;
            this.actualizarTiempos(edicion);
        } else {
            this.actualizarTiempos();
        }
    }

    actualizarTiempos(edicion) {
        let tiempos = parseInt(document.getElementById('nudTiempos').value) || 1;
        let grid = document.getElementById('grid-palmas');
        grid.innerHTML = '';

        let acentos = edicion ? edicion.acentos.split(',') : [];
        let palmas = edicion ? edicion.palmas.split(',') : [];
        let visibles = edicion && edicion.visibles ? edicion.visibles.split(',') : [];
        let etiquetas = edicion && edicion.etiquetas ? edicion.etiquetas : [];

        for (let i = 1; i <= tiempos; i++) {
            let palma = palmas[i - 1] ? palmas[i - 1][0] == 'x' : false;
            let contra = palmas[i - 1] ? palmas[i - 1][1] == 'x' : false;
            let acento = acentos.includes(i.toString());
            let visible = visibles.length ? visibles.includes(i.toString()) : true;
            let etiqueta = etiquetas[i - 1] || '';

            let fila = `
                <div class="row align-items-center fila-tiempo mb-1" style="gap: 0;">
                    <div class="col-6 text-start d-flex align-items-center gap-2">
                        <i class="bi ${visible ? 'bi-eye' : 'bi-eye-slash'} ojo ${visible ? 'ojo-vis' : ''}" style="flex-shrink: 0;" onclick="objEditor.toggleVisible(this)"></i>
                        <button type="button" class="btn btn-light tiempo-acento ${acento ? 'acento-activo' : ''}" style="flex-shrink: 0;" onclick="objEditor.toggleAcento(this)">${i}</button>
                        <input type="text" class="form-control form-control-sm etiqueta" style="flex-grow: 1; min-width: 0; max-width: none;" value="${etiqueta}">
                    </div>
                    <div class="col-3 form-check form-switch d-flex justify-content-center mb-0"><input class="form-check-input palma" type="checkbox" ${palma ? 'checked' : ''}></div>
                    <div class="col-3 form-check form-switch d-flex justify-content-center mb-0"><input class="form-check-input contra" type="checkbox" ${contra ? 'checked' : ''}></div>
                </div>`;
            grid.innerHTML += fila;
        }
    }

    toggleVisible(icon) {
        icon.classList.toggle('bi-eye');
        icon.classList.toggle('bi-eye-slash');
        icon.classList.toggle('ojo-vis');
    }

    toggleAcento(btn) {
        btn.classList.toggle('acento-activo');
    }

    guardar() {
        let nombre = document.getElementById('txtNombre').value.trim();
        let tiempos = parseInt(document.getElementById('nudTiempos').value) || 1;
        let velocidad = parseInt(document.getElementById('rngVelocidad').value);

        if (!nombre) {
            alert('Indica un nombre para el ritmo');
            return;
        }

        let acentos = [];
        let palmas = [];
        let visibles = [];
        let etiquetas = [];
        let filas = document.querySelectorAll('#grid-palmas .fila-tiempo');
        filas.forEach((fila, idx) => {
            let num = idx + 1;
            let palma = fila.querySelector('.palma').checked ? 'x' : '-';
            let contra = fila.querySelector('.contra').checked ? 'x' : '-';
            palmas.push(palma + contra);
            if (fila.querySelector('.tiempo-acento').classList.contains('acento-activo'))
                acentos.push(num);
            if (fila.querySelector('.ojo').classList.contains('bi-eye'))
                visibles.push(num);
            let etiqueta = fila.querySelector('.etiqueta').value.trim();
            etiquetas.push(etiqueta);
        });

        let compas = {
            id: this.idEdicion || ('propio-' + Date.now()),
            nombre: nombre,
            tiempos: tiempos,
            acentos: acentos.join(','),
            velocidad: velocidad,
            palmas: palmas.join(',')
        };

        if (visibles.length)
            compas.visibles = visibles.join(',');

        if (etiquetas.some(e => e !== ''))
            compas.etiquetas = etiquetas;

        let vertical = document.getElementById('txtVertical').value.trim();
        if (vertical)
            compas.numArriba = parseInt(vertical);

        if (this.idEdicion) {
            let idx = this.compsPropios.findIndex(c => c.id == this.idEdicion);
            if (idx >= 0)
                this.compsPropios[idx] = compas;
        } else {
            this.compsPropios.push(compas);
        }

        localStorage.setItem('compasesPropios', JSON.stringify(this.compsPropios));
        localStorage.removeItem('compasEdicion');
        window.location.href = 'metro.html';
    }
}
