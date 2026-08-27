const PCC_LAYOUT = {
    getContext() {
        const path = window.location.pathname.replace(/\\/g, '/');
        const inPages = path.includes('/pages/');
        return {
            inPages,
            home: inPages ? '../index.html' : 'index.html',
            prefix: inPages ? '' : 'pages/'
        };
    },

    currentPage() {
        const path = window.location.pathname.replace(/\\/g, '/');
        if (path.endsWith('/') || path.endsWith('index.html')) return 'inicio';
        if (path.includes('buscarCuidadores') || path.includes('perfilCuidador')) return 'buscar';
        if (path.includes('servicios')) return 'servicios';
        if (path.includes('misReservas') || path.includes('reservaConfirmada') || path.includes('nuevaReserva')) return 'reservas';
        if (path.includes('miCuenta')) return 'cuenta';
        return '';
    },

    isLoggedIn() {
        if (window.PCC_AUTH && typeof PCC_AUTH.isLoggedIn === 'function') {
            return PCC_AUTH.isLoggedIn();
        }
        return localStorage.getItem('pcc_logged_in') === 'true';
    },

    headerHTML() {
        const { home, prefix } = this.getContext();
        const page = this.currentPage();
        const loggedIn = this.isLoggedIn();
        const accountHref = prefix + (loggedIn ? 'miCuenta.html' : 'login.html');
        const accountLabel = loggedIn ? 'Mi Cuenta' : 'Iniciar sesión';
        const accountActive = page === 'cuenta' ? ' active' : '';

        return `
    <header class="navbar">
        <div class="container navbar-container">
            <span class="brand-logo"><a href="${home}" class="brand-name">Pet CareConnect</a></span>

            <form role="search" action="${prefix}buscarCuidadores.html" method="GET" class="search-form">
                <div class="form-group search-group">
                    <span class="material-symbols-outlined search-icon">search</span>
                    <label for="search-sitters" class="sr-only">Buscar cuidadores</label>
                    <input type="search" id="search-sitters" class="search-input" name="q" placeholder="Buscar cuidadores...">
                    <button type="submit" class="button button-primary sr-only">Buscar</button>
                </div>
            </form>

            <nav aria-label="Navegación principal" class="main-nav">
                <ul>
                    <li><a href="${home}" class="nav-link${page === 'inicio' ? ' active' : ''}"${page === 'inicio' ? ' aria-current="page"' : ''}>Inicio</a></li>
                    <li><a href="${prefix}buscarCuidadores.html" class="nav-link${page === 'buscar' ? ' active' : ''}"${page === 'buscar' ? ' aria-current="page"' : ''}>Buscar</a></li>
                    <li><a href="${prefix}servicios.html" class="nav-link${page === 'servicios' ? ' active' : ''}"${page === 'servicios' ? ' aria-current="page"' : ''}>Servicios</a></li>
                    <li><a href="${prefix}misReservas.html" class="nav-link${page === 'reservas' ? ' active' : ''}"${page === 'reservas' ? ' aria-current="page"' : ''}>Mis reservas</a></li>
                    <li><a href="${accountHref}" class="nav-link${accountActive}"${page === 'cuenta' ? ' aria-current="page"' : ''}>${accountLabel}</a></li>
                </ul>
            </nav>

            <a href="${prefix}nuevaReserva.html" class="button button-accent">Reservar ahora</a>
        </div>
    </header>`;
    },

    footerHTML() {
        return `
    <footer class="footer">
        <div class="container footer-container">
            <div class="footer-brand">
                <h2>Pet CareConnect</h2>
                <p>Cuidando a los que más quieres.</p>
            </div>

            <nav aria-label="Enlaces legales y de ayuda" class="footer-nav">
                <ul>
                    <li><a href="#footer-contact" data-footer-modal="contact">Contáctanos</a></li>
                    <li><a href="#footer-privacy" data-footer-modal="privacy">Política de Privacidad</a></li>
                    <li><a href="#footer-terms" data-footer-modal="terms">Términos de Servicio</a></li>
                    <li><a href="#footer-faq" data-footer-modal="faq">Preguntas Frecuentes</a></li>
                </ul>
            </nav>

            <p class="footer-copyright">2026 Pet CareConnect Inc. Todos los derechos reservados.</p>
        </div>
    </footer>`;
    },

    footerModalsHTML() {
        return `
    <div id="footerContactModal" class="modal-overlay footer-info-modal" role="dialog" aria-modal="true" aria-labelledby="footerContactTitle" aria-hidden="true">
        <div class="modal-card modal-card-lg">
            <div class="modal-header">
                <h3 id="footerContactTitle">Contáctanos</h3>
                <button type="button" class="modal-close-btn" data-close-footer-modal aria-label="Cerrar">&times;</button>
            </div>
            <div class="modal-body footer-modal-body">
                <p class="footer-modal-lead">Estamos en Ecuador para ayudarte con reservas, cuidadores y soporte de tu cuenta.</p>
                <ul class="footer-contact-list">
                    <li>
                        <span class="material-symbols-outlined" aria-hidden="true">mail</span>
                        <div>
                            <strong>Correo</strong>
                            <a href="mailto:soporte@petcareconnect.ec">soporte@petcareconnect.ec</a>
                        </div>
                    </li>
                    <li>
                        <span class="material-symbols-outlined" aria-hidden="true">call</span>
                        <div>
                            <strong>Teléfono / WhatsApp</strong>
                            <a href="tel:+59322940000">+593 2 294 0000</a>
                        </div>
                    </li>
                    <li>
                        <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
                        <div>
                            <strong>Oficina</strong>
                            <span>Av. República del Salvador y Naciones Unidas, Quito, Ecuador</span>
                        </div>
                    </li>
                    <li>
                        <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
                        <div>
                            <strong>Horario de atención</strong>
                            <span>Lunes a viernes, 09:00 – 18:00 (hora de Ecuador)</span>
                        </div>
                    </li>
                </ul>
                <form id="footerContactForm" class="footer-contact-form" novalidate>
                    <div class="login-form-item">
                        <label for="footerContactName">Tu nombre <span class="required-mark" aria-hidden="true">*</span></label>
                        <input type="text" id="footerContactName" class="input" required aria-required="true" placeholder="Ej. María Pérez" data-error-required="Por favor indica tu nombre.">
                        <div id="footerContactName-error" class="field-error" role="alert"></div>
                    </div>
                    <div class="login-form-item">
                        <label for="footerContactEmail">Correo electrónico <span class="required-mark" aria-hidden="true">*</span></label>
                        <input type="email" id="footerContactEmail" class="input" required aria-required="true" placeholder="tu@correo.com" data-error-required="Por favor indica tu correo.">
                        <div id="footerContactEmail-error" class="field-error" role="alert"></div>
                    </div>
                    <div class="login-form-item">
                        <label for="footerContactMsg">Mensaje <span class="required-mark" aria-hidden="true">*</span></label>
                        <textarea id="footerContactMsg" class="input" rows="4" required aria-required="true" minlength="10" data-min-chars="10" data-error-required="Cuéntanos en qué podemos ayudarte." placeholder="Describe tu consulta..."></textarea>
                        <div id="footerContactMsg-error" class="field-error" role="alert"></div>
                    </div>
                    <button type="submit" class="button button-primary">Enviar mensaje</button>
                </form>
            </div>
        </div>
    </div>

    <div id="footerPrivacyModal" class="modal-overlay footer-info-modal" role="dialog" aria-modal="true" aria-labelledby="footerPrivacyTitle" aria-hidden="true">
        <div class="modal-card modal-card-lg">
            <div class="modal-header">
                <h3 id="footerPrivacyTitle">Política de Privacidad</h3>
                <button type="button" class="modal-close-btn" data-close-footer-modal aria-label="Cerrar">&times;</button>
            </div>
            <div class="modal-body footer-modal-body footer-modal-prose">
                <p class="footer-modal-meta">Última actualización: agosto 2026 · Aplicable en Ecuador</p>
                <h4>1. Quiénes somos</h4>
                <p>Pet CareConnect es una plataforma digital que conecta a dueños de mascotas con cuidadores verificados en Quito, Guayaquil, Cuenca y otras ciudades del Ecuador.</p>
                <h4>2. Datos que recopilamos</h4>
                <p>Recopilamos datos de cuenta (nombre, correo, teléfono), información de mascotas, historial de reservas y, cuando corresponde, datos parciales de pago necesarios para procesar transacciones.</p>
                <h4>3. Para qué los usamos</h4>
                <ul>
                    <li>Gestionar tu cuenta y reservas.</li>
                    <li>Comunicarte con cuidadores y soporte.</li>
                    <li>Mejorar la seguridad y prevenir fraude.</li>
                    <li>Cumplir obligaciones legales aplicables en Ecuador.</li>
                </ul>
                <h4>4. Compartición de información</h4>
                <p>Compartimos solo la información necesaria con el cuidador seleccionado para ejecutar el servicio. No vendemos tus datos personales a terceros.</p>
                <h4>5. Conservación y seguridad</h4>
                <p>Aplicamos medidas técnicas y organizativas razonables para proteger tu información. Conservamos los datos mientras mantengas una cuenta activa o según lo exija la normativa vigente.</p>
                <h4>6. Tus derechos</h4>
                <p>Puedes solicitar acceso, corrección o eliminación de tus datos escribiendo a <a href="mailto:privacidad@petcareconnect.ec">privacidad@petcareconnect.ec</a>.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="button button-primary" data-close-footer-modal>Entendido</button>
            </div>
        </div>
    </div>

    <div id="footerTermsModal" class="modal-overlay footer-info-modal" role="dialog" aria-modal="true" aria-labelledby="footerTermsTitle" aria-hidden="true">
        <div class="modal-card modal-card-lg">
            <div class="modal-header">
                <h3 id="footerTermsTitle">Términos de Servicio</h3>
                <button type="button" class="modal-close-btn" data-close-footer-modal aria-label="Cerrar">&times;</button>
            </div>
            <div class="modal-body footer-modal-body footer-modal-prose">
                <p class="footer-modal-meta">Última actualización: agosto 2026 · Ecuador</p>
                <h4>1. Aceptación</h4>
                <p>Al usar Pet CareConnect aceptas estos términos. Si no estás de acuerdo, no utilices la plataforma.</p>
                <h4>2. Descripción del servicio</h4>
                <p>Facilitamos la reserva de servicios de cuidado de mascotas (alojamiento, guardería, paseos y afines) entre usuarios y cuidadores independientes verificados.</p>
                <h4>3. Cuentas y responsabilidad</h4>
                <p>Eres responsable de la veracidad de la información de tu perfil y de tus mascotas. Debes mantener la confidencialidad de tu acceso.</p>
                <h4>4. Reservas y pagos</h4>
                <p>Las tarifas se muestran antes de confirmar. El cobro se procesa según el método de pago registrado. Cancelaciones y reembolsos se rigen por la política visible en cada reserva.</p>
                <h4>5. Cuidadores</h4>
                <p>Los cuidadores son prestadores independientes. Pet CareConnect verifica perfiles, pero el servicio concreto lo presta cada cuidador bajo su propia responsabilidad profesional.</p>
                <h4>6. Uso aceptable</h4>
                <p>Está prohibido el uso fraudulento, el acoso o cualquier actividad ilegal. Podemos suspender cuentas que incumplan estas reglas.</p>
                <h4>7. Contacto legal</h4>
                <p>Para consultas sobre estos términos: <a href="mailto:legal@petcareconnect.ec">legal@petcareconnect.ec</a>.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="button button-primary" data-close-footer-modal>Aceptar</button>
            </div>
        </div>
    </div>

    <div id="footerFaqModal" class="modal-overlay footer-info-modal" role="dialog" aria-modal="true" aria-labelledby="footerFaqTitle" aria-hidden="true">
        <div class="modal-card modal-card-lg">
            <div class="modal-header">
                <h3 id="footerFaqTitle">Preguntas Frecuentes</h3>
                <button type="button" class="modal-close-btn" data-close-footer-modal aria-label="Cerrar">&times;</button>
            </div>
            <div class="modal-body footer-modal-body">
                <div class="footer-faq-list">
                    <details class="footer-faq-item" open>
                        <summary>¿Cómo reservo un cuidador?</summary>
                        <p>Busca un cuidador en Quito, Guayaquil o Cuenca, revisa su perfil y pulsa «Reservar». Completa servicio, fechas y datos de tu mascota para confirmar.</p>
                    </details>
                    <details class="footer-faq-item">
                        <summary>¿Los cuidadores están verificados?</summary>
                        <p>Sí. Los perfiles marcados como verificados pasan controles de identidad y revisión de experiencia antes de aparecer en la plataforma.</p>
                    </details>
                    <details class="footer-faq-item">
                        <summary>¿Puedo cancelar o modificar una reserva?</summary>
                        <p>Puedes gestionar tus reservas desde «Mis reservas». Las condiciones de cancelación dependen del servicio y del tiempo restante hasta la fecha de inicio.</p>
                    </details>
                    <details class="footer-faq-item">
                        <summary>¿Qué métodos de pago aceptan?</summary>
                        <p>Puedes guardar tarjetas de crédito o débito en «Mi cuenta». Solo almacenamos de forma segura los datos necesarios para el cobro (por ejemplo, los últimos dígitos).</p>
                    </details>
                    <details class="footer-faq-item">
                        <summary>¿Cubren ciudades fuera de Quito?</summary>
                        <p>Sí. Contamos con cuidadores en Quito, Guayaquil y Cuenca, y seguimos ampliando la cobertura en el Ecuador.</p>
                    </details>
                    <details class="footer-faq-item">
                        <summary>¿Cómo contacto soporte?</summary>
                        <p>Usa el enlace «Contáctanos» del pie de página o escribe a soporte@petcareconnect.ec. Atendemos de lunes a viernes en horario laboral.</p>
                    </details>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="button button-outline" data-footer-modal="contact" data-close-footer-modal>Ir a Contáctanos</button>
                <button type="button" class="button button-primary" data-close-footer-modal>Cerrar</button>
            </div>
        </div>
    </div>`;
    },

    mobileNavHTML() {
        const { home, prefix } = this.getContext();
        const page = this.currentPage();
        const loggedIn = this.isLoggedIn();
        const accountHref = prefix + (loggedIn ? 'miCuenta.html' : 'login.html');
        const accountLabel = loggedIn ? 'Cuenta' : 'Entrar';
        const accountAria = loggedIn ? 'Mi Cuenta' : 'Iniciar sesión';
        const fillClass = page === 'cuenta' ? ' icon-filled' : '';

        return `
    <nav aria-label="Navegación móvil" class="mobile-nav">
        <a href="${home}" class="mobile-nav-item${page === 'inicio' ? ' active' : ''}"${page === 'inicio' ? ' aria-current="page"' : ''}>
            <span class="material-symbols-outlined">explore</span>
            <span>Inicio</span>
        </a>
        <a href="${prefix}buscarCuidadores.html" class="mobile-nav-item${page === 'buscar' ? ' active' : ''}"${page === 'buscar' ? ' aria-current="page"' : ''}>
            <span class="material-symbols-outlined">search</span>
            <span>Buscar</span>
        </a>
        <a href="${prefix}servicios.html" class="mobile-nav-item${page === 'servicios' ? ' active' : ''}"${page === 'servicios' ? ' aria-current="page"' : ''}>
            <span class="material-symbols-outlined">pets</span>
            <span>Servicios</span>
        </a>
        <a href="${prefix}misReservas.html" class="mobile-nav-item${page === 'reservas' ? ' active' : ''}"${page === 'reservas' ? ' aria-current="page"' : ''}>
            <span class="material-symbols-outlined">calendar_month</span>
            <span>Mis reservas</span>
        </a>
        <a href="${accountHref}" class="mobile-nav-item${page === 'cuenta' ? ' active' : ''}" aria-label="${accountAria}"${page === 'cuenta' ? ' aria-current="page"' : ''}>
            <span class="material-symbols-outlined${fillClass}">person</span>
            <span>${accountLabel}</span>
        </a>
    </nav>`;
    },

    modalMap: {
        contact: 'footerContactModal',
        privacy: 'footerPrivacyModal',
        terms: 'footerTermsModal',
        faq: 'footerFaqModal'
    },

    openFooterModal(key, trigger = null) {
        const id = this.modalMap[key];
        const modal = id ? document.getElementById(id) : null;
        if (!modal) return;

        if (window.PCC_UI && typeof PCC_UI.openModal === 'function') {
            PCC_UI.openModal(modal, trigger);
        } else {
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    },

    closeFooterModal(modal) {
        if (!modal) return;
        if (window.PCC_UI && typeof PCC_UI.closeModal === 'function') {
            PCC_UI.closeModal(modal);
        } else {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    },

    injectFooterModals() {
        if (document.getElementById('footerContactModal')) return;
        const wrap = document.createElement('div');
        wrap.id = 'footer-modals-root';
        wrap.innerHTML = this.footerModalsHTML().trim();
        document.body.appendChild(wrap);
    },

    bindFooterModals() {
        if (this._footerModalsBound) return;
        this._footerModalsBound = true;

        document.addEventListener('click', (e) => {
            const openTrigger = e.target.closest('[data-footer-modal]');
            if (openTrigger) {
                const key = openTrigger.getAttribute('data-footer-modal');
                if (this.modalMap[key]) {
                    e.preventDefault();
                    const closeCurrent = openTrigger.hasAttribute('data-close-footer-modal');
                    if (closeCurrent) {
                        const current = openTrigger.closest('.modal-overlay');
                        if (current) this.closeFooterModal(current);
                        setTimeout(() => this.openFooterModal(key, openTrigger), 120);
                    } else {
                        this.openFooterModal(key, openTrigger);
                    }
                    return;
                }
            }

            const closeBtn = e.target.closest('[data-close-footer-modal]');
            if (closeBtn && !closeBtn.hasAttribute('data-footer-modal')) {
                e.preventDefault();
                const modal = closeBtn.closest('.modal-overlay');
                this.closeFooterModal(modal);
                return;
            }

            const overlay = e.target.classList && e.target.classList.contains('footer-info-modal')
                ? e.target
                : null;
            if (overlay) {
                this.closeFooterModal(overlay);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape' && e.key !== 'Esc') return;
            if (window.PCC_UI && PCC_UI.activeModals && PCC_UI.activeModals.length) return;
            const openModal = document.querySelector('.footer-info-modal.is-open');
            if (openModal) this.closeFooterModal(openModal);
        });

        const form = document.getElementById('footerContactForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (window.PCC_FORMS && typeof PCC_FORMS.validateForm === 'function') {
                    if (!PCC_FORMS.validateForm(form)) return;
                } else {
                    const name = document.getElementById('footerContactName');
                    const email = document.getElementById('footerContactEmail');
                    const msg = document.getElementById('footerContactMsg');
                    if (!name?.value.trim() || !email?.value.trim() || !msg?.value.trim()) {
                        if (window.showToast) {
                            window.showToast('Completa todos los campos del formulario de contacto.', 'error');
                        }
                        return;
                    }
                }

                form.reset();
                if (window.PCC_FORMS) PCC_FORMS.clearFormErrors(form);
                this.closeFooterModal(document.getElementById('footerContactModal'));
                if (window.showToast) {
                    window.showToast('Mensaje enviado. Te responderemos pronto a tu correo.', 'success');
                }
            });
        }
    },

    render() {
        const header = document.getElementById('site-header');
        const footer = document.getElementById('site-footer');
        const mobile = document.getElementById('site-mobile-nav');

        if (header) header.outerHTML = this.headerHTML().trim();
        if (footer) footer.outerHTML = this.footerHTML().trim();
        if (mobile) mobile.outerHTML = this.mobileNavHTML().trim();

        this.injectFooterModals();
        this.bindFooterModals();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PCC_LAYOUT.render());
} else {
    PCC_LAYOUT.render();
}

window.PCC_LAYOUT = PCC_LAYOUT;
