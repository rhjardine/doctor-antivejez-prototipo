// Este script es el último en ejecutarse. Su misión es poner todo en marcha.
document.addEventListener('DOMContentLoaded', () => {
    
    // Configurar el botón del sidebar
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    // Configurar el botón de cambio de tema
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });
    }

    // Verificar si el router existe y ponerlo en marcha
    if (window.router && typeof window.router.loadRoute === 'function') {
        // Cargar la ruta inicial
        router.loadRoute();
        // Escuchar cambios de ruta para la navegación
        window.addEventListener('hashchange', router.loadRoute);
    } else {
        // Este es el error que estabas viendo. Si aparece de nuevo, significa
        // que router.js no se cargó o falló antes de este script.
        const errorMsg = "FALLO CRÍTICO: El objeto 'router' no se encontró. Verifica que el archivo 'js/router.js' se está cargando correctamente en la pestaña 'Network' de las herramientas del desarrollador (F12) y que no tiene errores de sintaxis.";
        console.error(errorMsg);
        const appRoot = document.getElementById('app-root');
        if (appRoot) {
            appRoot.innerHTML = `<div class="card" style="padding: 40px; text-align: center; color: var(--red); background-color: rgba(229, 62, 62, 0.1);"><h2>Error de Inicialización</h2><p>${errorMsg}</p></div>`;
        }
    }
});

// La función showToast se mantiene aquí, global y disponible para todos.
function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle' };
    toast.innerHTML = `...`; // Contenido del toast
    // ... Lógica del toast ...
}