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
                    <li><a href="#">Contáctanos</a></li>
                    <li><a href="#">Política de Privacidad</a></li>
                    <li><a href="#">Términos de Servicio</a></li>
                    <li><a href="#">Preguntas Frecuentes</a></li>
                </ul>
            </nav>

            <p class="footer-copyright">2026 Pet CareConnect Inc. Todos los derechos reservados.</p>
        </div>
    </footer>`;
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

    render() {
        const header = document.getElementById('site-header');
        const footer = document.getElementById('site-footer');
        const mobile = document.getElementById('site-mobile-nav');

        if (header) header.outerHTML = this.headerHTML().trim();
        if (footer) footer.outerHTML = this.footerHTML().trim();
        if (mobile) mobile.outerHTML = this.mobileNavHTML().trim();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PCC_LAYOUT.render());
} else {
    PCC_LAYOUT.render();
}
