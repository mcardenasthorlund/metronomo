/* <app-pie></app-pie> */

// Definir la clase
export class AppPie extends HTMLElement {

    // TEMPLATE
    template = `
    <div style='display: block; text-align: center; margin-bottom: 30px;margin-top: 30px;'>
        <a href='https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fmetroapp.ideasypruebas2.es' class='btn-social btn-facebook' target='_blank'><i class='fa-brands fa-facebook'></i></a>
        <a href='https://twitter.com/intent/tweet?url=https%3A%2F%2Fmetroapp.ideasypruebas2.es' class='btn-social btn-twitter' target='_blank'><i class='fa-brands fa-x-twitter'></i></a>
        <a href='https://www.linkedin.com/shareArticle?mini=true&url=https%3A%2F%2Fmetroapp.ideasypruebas2.es' class='btn-social btn-linkedin' target='_blank'><i class='fa-brands fa-linkedin'></i></a>
        <a href='https://api.whatsapp.com/send?text=https%3A%2F%2Fmetroapp.ideasypruebas2.es' class='btn-social btn-whatsapp' target='_blank'><i class='fa-brands fa-whatsapp'></i></a>
    </div>
        <small class='pt-3'>Distribuido bajo la <a href='https://opensource.org/licenses/MIT' target='_blank'>licencia MIT</a> <br>
        <a href='https://www.linkedin.com/in/manuelcardenasthorlund/' target='_blank'>Manuel Cárdenas Thorlund</a>
        <br><span style='font-size: 0.7em;'>Metrónomo Flamenco. v1.5</span></small>
    `;


    constructor() {
        super();

        // Renderizamos el HTML
        this.innerHTML = this.template;
    }

    //Este evento se lanza cuando el elemento se va a mostrar en pantalla
    connectedCallback() {

    }
}