// Este script define el objeto 'router' y su lógica.
// Debe cargarse ANTES que main.js.

const router = {
    routes: {
        '#dashboard': { 
            path: 'pages/dashboard.html', 
            init: () => initDashboardPage() 
        },
        '#historias': { 
            path: 'pages/historias-lista.html', 
            init: () => initHistoriasListPage() 
        },
        '#historias/nuevo': { 
            path: 'pages/historias-nuevo.html', 
            init: () => initHistoriasNuevoPage() 
        },
    },
    dynamicRoutes: [
        {
            pattern: /^#historias\/detalle\/(\d+)$/,
            path: 'pages/historias-detalle.html',
            init: (id) => initHistoriasDetallePage(parseInt(id))
        }
    ],

    loadRoute: async () => {
        const hash = window.location.hash || '#dashboard';
        const appRoot = document.getElementById('app-root');
        let route = router.routes[hash];
        let params = [];

        if (!route) {
            for (const dynamicRoute of router.dynamicRoutes) {
                const match = hash.match(dynamicRoute.pattern);
                if (match) {
                    route = dynamicRoute;
                    params = match.slice(1);
                    break;
                }
            }
        }

        document.querySelectorAll('.menu-item').forEach(item => {
            const itemHash = item.getAttribute('href');
            item.classList.toggle('active', hash.startsWith(itemHash));
        });

        if (route && appRoot) {
            try {
                appRoot.innerHTML = '<div style="text-align:center; padding:50px;">Cargando...</div>';
                const response = await fetch(route.path);
                if (!response.ok) {
                    throw new Error(`Error ${response.status} - No se pudo encontrar el archivo de la página en la ruta: "${route.path}". Verifica que la carpeta 'pages' y el archivo existen.`);
                }
                
                appRoot.innerHTML = await response.text();
                if (typeof route.init === 'function') {
                    // Esperar un instante para que el DOM se actualice antes de ejecutar el init
                    setTimeout(() => route.init(...params), 0);
                }
            } catch (error) {
                console.error("Error crítico en router.loadRoute():", error);
                appRoot.innerHTML = `<div class="card" style="padding: 40px; text-align: center; color: var(--red); background-color: rgba(229, 62, 62, 0.1);"><h2>Error al Cargar Página</h2><p>${error.message}</p></div>`;
            }
        } else {
            appRoot.innerHTML = `<div class="card" style="padding: 40px; text-align: center;"><h2>404 - Página no encontrada</h2><p>La ruta "<strong>${hash}</strong>" no está definida en el router.</p></div>`;
        }
    }
};