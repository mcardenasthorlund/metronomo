/* <app-cabecera titulo="Nombre" descripcion="Descripción"></app-cabecera> */

// Definir la clase
export class AppCabecera extends HTMLElement {

    // TEMPLATE
    template = `
    <!--<img id="logo-interior" src="/assets/img/logo.png" alt="logo">-->
      <a class="enlace" href="#" onclick="history.back()"><i class="bi bi-chevron-left"></i> Volver</a>
        <h1 class="display-6">[TITULO]</h1>
        <p class="lead">
            [DESCRIPCION]
          </p>
    `;


    constructor() {
        super();

        // Leer los valores y propiedades 
        let titulo = this.getAttribute('titulo') || '';
        let descripcion = this.getAttribute('descripcion') || '';

        // Renderizamos el HTML
        this.innerHTML = this.template
            .replace("[TITULO]", titulo)
            .replace("[DESCRIPCION]", descripcion);
    }

    //Este evento se lanza cuando el elemento se va a mostrar en pantalla
    connectedCallback() {

    }

    cambiarInfo(titulo, descripcion){

        this.innerHTML = this.template
            .replace("[TITULO]", titulo)
            .replace("[DESCRIPCION]", descripcion);
    }
}