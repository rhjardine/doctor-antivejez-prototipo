class Router {
    constructor() {
        this.routes = {
            'dashboard': 'pages/dashboard.html',
            'historias': 'pages/historias-lista.html',
            'historias-nuevo': 'pages/historias-nuevo.html',
            'historias-detalle': 'pages/paciente-detalle.html',
            'profesionales': 'pages/profesionales.html',
            'agente-ia': 'pages/agente-ia.html',
            'reportes': 'pages/reportes.html',
            'ajustes': 'pages/ajustes.html'
        };
        
        this.currentRoute = null;
        this.currentPatientId = null;
        this.init();
    }

    init() {
        // Escuchar cambios en el hash
        window.addEventListener('hashchange', () => this.handleHashChange());
        
        // Manejar carga inicial
        this.handleHashChange();
        
        // Escuchar clics en los enlaces de navegación
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                this.navigate(route);
            }
        });

        console.log('🚀 Router inicializado correctamente');
    }

    handleHashChange() {
        const hash = window.location.hash.slice(1); // Remover el #
        
        if (!hash) {
            this.navigate('dashboard');
            return;
        }

        // Parsear la ruta para extraer parámetros
        const [route, ...params] = hash.split('/');
        
        if (route === 'historias' && params[0]) {
            // Ruta del tipo #historias/123
            this.currentPatientId = params[0];
            this.loadRoute('historias-detalle');
        } else {
            this.loadRoute(route);
        }
    }

    navigate(route, params = null) {
        if (params) {
            window.location.hash = `${route}/${params}`;
        } else {
            window.location.hash = route;
        }
        
        this.updateActiveNavLink(route);
    }

    async loadRoute(route) {
        try {
            const appRoot = document.getElementById('app-root');
            
            if (!appRoot) {
                console.error('❌ No se encontró el elemento #app-root');
                return;
            }

            // Mostrar loading
            this.showLoading();

            // Verificar si la ruta existe
            if (!this.routes[route]) {
                console.warn(`⚠️ Ruta no encontrada: ${route}, cargando dashboard`);
                route = 'dashboard';
            }

            const filePath = this.routes[route];
            
            // Hacer fetch del contenido HTML
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            
            // Inyectar el contenido
            appRoot.innerHTML = html;
            
            // Actualizar la ruta actual
            this.currentRoute = route;
            
            // Ejecutar scripts específicos de la página
            this.executePageScripts(route);
            
            // Actualizar navegación activa
            this.updateActiveNavLink(route);

            console.log(`✅ Ruta cargada exitosamente: ${route}`);

        } catch (error) {
            console.error('❌ Error al cargar la ruta:', error);
            this.showError(`Error al cargar la página: ${error.message}`);
        }
    }

    showLoading() {
        const appRoot = document.getElementById('app-root');
        appRoot.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando...</p>
            </div>
        `;
    }

    showError(message) {
        const appRoot = document.getElementById('app-root');
        appRoot.innerHTML = `
            <div class="error-container" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 400px;
                padding: 2rem;
                text-align: center;
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: #e74c3c;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                ">
                    <i class="fas fa-exclamation-triangle" style="color: white; font-size: 2rem;"></i>
                </div>
                <h2 style="color: #e74c3c; margin-bottom: 1rem;">Error de Carga</h2>
                <p style="color: #6b7280; margin-bottom: 1.5rem;">${message}</p>
                <button onclick="location.reload()" style="
                    padding: 0.75rem 1.5rem;
                    background: #4789ff;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 1rem;
                ">
                    <i class="fas fa-redo"></i> Recargar Página
                </button>
            </div>
        `;
    }

    executePageScripts(route) {
        try {
            switch (route) {
                case 'dashboard':
                    if (typeof initDashboard === 'function') {
                        initDashboard();
                    }
                    break;
                case 'historias':
                    if (typeof initHistoriasList === 'function') {
                        initHistoriasList();
                    }
                    break;
                case 'historias-nuevo':
                    if (typeof initNuevoHistoria === 'function') {
                        initNuevoHistoria();
                    }
                    break;
                case 'historias-detalle':
                    if (typeof initPacienteDetalle === 'function') {
                        initPacienteDetalle(this.currentPatientId);
                    }
                    break;
                default:
                    console.log(`ℹ️ No hay scripts específicos para la ruta: ${route}`);
            }
        } catch (error) {
            console.error('❌ Error al ejecutar scripts de página:', error);
        }
    }

    updateActiveNavLink(route) {
        try {
            // Remover clase active de todos los enlaces
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => link.classList.remove('active'));

            // Agregar clase active al enlace correspondiente
            const activeLink = document.querySelector(`[data-route="${route}"]`) || 
                               document.querySelector(`[data-route="historias"]`);
            
            if (activeLink) {
                activeLink.classList.add('active');
            }
        } catch (error) {
            console.error('❌ Error al actualizar navegación activa:', error);
        }
    }

    // Métodos públicos para navegación programática
    goToDashboard() {
        this.navigate('dashboard');
    }

    goToHistorias() {
        this.navigate('historias');
    }

    goToNuevoHistoria() {
        this.navigate('historias-nuevo');
    }

    goToPacienteDetalle(pacienteId) {
        this.navigate('historias', pacienteId);
    }

    goBack() {
        window.history.back();
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    getCurrentPatientId() {
        return this.currentPatientId;
    }
}

// Función para crear y exportar la instancia del router
function createRouter() {
    if (typeof window !== 'undefined') {
        return new Router();
    }
    return null;
}

// Funciones de utilidad para la navegación
function navigateTo(route, params = null) {
    if (window.router) {
        window.router.navigate(route, params);
    } else {
        console.error('❌ Router no está inicializado');
    }
}

function goToDashboard() {
    navigateTo('dashboard');
}

function goToHistorias() {
    navigateTo('historias');
}

function goToNuevoHistoria() {
    navigateTo('historias-nuevo');
}

function goToPacienteDetalle(pacienteId) {
    navigateTo('historias', pacienteId);
}

function goBack() {
    if (window.router) {
        window.router.goBack();
    } else {
        window.history.back();
    }
}

// Función para recargar la página actual
function reloadCurrentPage() {
    if (window.router && window.router.currentRoute) {
        window.router.loadRoute(window.router.currentRoute);
    }
}

// Función para obtener parámetros de la URL
function getRouteParams() {
    const hash = window.location.hash.slice(1);
    const [route, ...params] = hash.split('/');
    return { route, params };
}

// Función para verificar si estamos en una ruta específica
function isCurrentRoute(route) {
    return window.router && window.router.getCurrentRoute() === route;
}

console.log('📝 Router.js cargado correctamente');