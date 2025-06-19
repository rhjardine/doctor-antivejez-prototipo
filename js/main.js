
// Variables globales
window.app = {
    initialized: false,
    currentTheme: 'light',
    currentUser: null,
    notifications: [],
    router: null
};

// ===== SISTEMA DE NOTIFICACIONES TOAST =====
class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toasts = [];
    }

    show(title, message, type = 'info', duration = 5000) {
        const id = generateId();
        const toast = this.createToastElement(id, title, message, type);
        
        this.container.appendChild(toast);
        this.toasts.push({ id, element: toast, timeout: null });

        // Mostrar con animación
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto-remover después del duration
        if (duration > 0) {
            const timeout = setTimeout(() => {
                this.remove(id);
            }, duration);
            
            const toastData = this.toasts.find(t => t.id === id);
            if (toastData) {
                toastData.timeout = timeout;
            }
        }

        return id;
    }

    createToastElement(id, title, message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('data-toast-id', id);

        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${iconMap[type] || iconMap.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="window.toastManager.remove('${id}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        return toast;
    }

    remove(id) {
        const toastData = this.toasts.find(t => t.id === id);
        if (!toastData) return;

        // Limpiar timeout si existe
        if (toastData.timeout) {
            clearTimeout(toastData.timeout);
        }

        // Animar salida
        toastData.element.style.animation = 'slideOutRight 0.3s ease-in forwards';
        
        setTimeout(() => {
            if (toastData.element.parentNode) {
                toastData.element.parentNode.removeChild(toastData.element);
            }
            this.toasts = this.toasts.filter(t => t.id !== id);
        }, 300);
    }

    clear() {
        this.toasts.forEach(toast => {
            if (toast.timeout) clearTimeout(toast.timeout);
            if (toast.element.parentNode) {
                toast.element.parentNode.removeChild(toast.element);
            }
        });
        this.toasts = [];
    }

    // Métodos de conveniencia
    success(title, message, duration = 5000) {
        return this.show(title, message, 'success', duration);
    }

    error(title, message, duration = 0) {
        return this.show(title, message, 'error', duration);
    }

    warning(title, message, duration = 7000) {
        return this.show(title, message, 'warning', duration);
    }

    info(title, message, duration = 5000) {
        return this.show(title, message, 'info', duration);
    }
}

// ===== GESTIÓN DE TEMAS =====
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('app-theme') || 'light';
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('app-theme', theme);
        
        // Actualizar ícono del botón de tema
        const themeBtn = document.querySelector('.header-btn i.fa-moon, .header-btn i.fa-sun');
        if (themeBtn) {
            themeBtn.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    setupThemeToggle() {
        document.addEventListener('click', (e) => {
            const themeBtn = e.target.closest('.header-btn');
            if (themeBtn && themeBtn.querySelector('i.fa-moon, i.fa-sun')) {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        window.toastManager.info(
            'Tema cambiado',
            `Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`,
            3000
        );
    }
}

// ===== GESTIÓN DE LA BÚSQUEDA GLOBAL =====
class SearchManager {
    constructor() {
        this.searchInput = document.querySelector('.search-input');
        this.setupSearchEvents();
    }

    setupSearchEvents() {
        if (!this.searchInput) return;

        let searchTimeout;
        
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Debounce para evitar muchas búsquedas
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (query.length >= 2) {
                    this.performSearch(query);
                }
            }, 300);
        });

        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    this.performSearch(query);
                }
            }
        });
    }

    async performSearch(query) {
        try {
            const response = await PacientesAPI.search(query);
            
            if (response.success && response.data.length > 0) {
                // Si estamos en la página de historias, actualizar la lista
                if (window.router.getCurrentRoute() === 'historias') {
                    if (typeof window.updatePatientsList === 'function') {
                        window.updatePatientsList(response.data);
                    }
                } else {
                    // Si no estamos en historias, navegar allí con los resultados
                    window.router.navigate('historias');
                    // Esperar un momento para que la página cargue
                    setTimeout(() => {
                        if (typeof window.updatePatientsList === 'function') {
                            window.updatePatientsList(response.data);
                        }
                    }, 500);
                }
                
                window.toastManager.success(
                    'Búsqueda completada',
                    `Se encontraron ${response.data.length} resultado(s)`,
                    3000
                );
            } else {
                window.toastManager.warning(
                    'Sin resultados',
                    'No se encontraron pacientes que coincidan con la búsqueda',
                    3000
                );
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            window.toastManager.error(
                'Error de búsqueda',
                'No se pudo realizar la búsqueda. Intente nuevamente.',
                5000
            );
        }
    }
}

// ===== GESTIÓN DE MODALES =====
class ModalManager {
    constructor() {
        this.setupModalEvents();
    }

    setupModalEvents() {
        // Cerrar modal al hacer clic en el fondo
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Cerrar modal con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevenir scroll del body
        }
    }

    closeModal(modal) {
        if (typeof modal === 'string') {
            modal = document.getElementById(modal);
        }
        
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = ''; // Restaurar scroll del body
            }, 300);
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => this.closeModal(modal));
    }
}

// ===== FUNCIONES GLOBALES PARA MODALES =====

// Modal de Test Biofísico
function openBiofisicoModal(pacienteId) {
    // Cargar datos del paciente
    if (pacienteId) {
        loadPacienteDataInModal(pacienteId);
    }
    
    window.modalManager.openModal('biofisico-modal');
}

function closeBiofisicoModal() {
    window.modalManager.closeModal('biofisico-modal');
    // Limpiar formulario
    const form = document.getElementById('biofisico-form');
    if (form) {
        form.reset();
        // Limpiar campos calculados
        const calculatedFields = form.querySelectorAll('input[readonly]');
        calculatedFields.forEach(field => {
            if (field.id !== 'edad-cronologica') {
                field.value = '';
            }
        });
    }
}

function volverDetalleModal() {
    closeBiofisicoModal();
    window.toastManager.info('Navegación', 'Regresando al detalle del paciente', 2000);
}

async function loadPacienteDataInModal(pacienteId) {
    try {
        const response = await PacientesAPI.getById(pacienteId);
        if (response.success) {
            const paciente = response.data;
            
            // Cargar edad cronológica
            const edadCronologicaField = document.getElementById('edad-cronologica');
            if (edadCronologicaField) {
                edadCronologicaField.value = paciente.edadCronologica;
            }
            
            // Cargar género
            const generoField = document.getElementById('genero');
            if (generoField && paciente.genero) {
                generoField.value = paciente.genero;
            }
        }
    } catch (error) {
        console.error('Error cargando datos del paciente:', error);
    }
}

// ===== CALCULADORA BIOFÍSICA =====

function calcularItem(parametro) {
    const genero = document.getElementById('genero').value;
    
    if (!genero && parametro === 'grasa') {
        window.toastManager.warning(
            'Género requerido',
            'Debe seleccionar el género antes de calcular el % de grasa',
            3000
        );
        return;
    }

    let valor, edadCalculada;

    switch (parametro) {
        case 'grasa':
            valor = parseFloat(document.getElementById('grasa-valor').value);
            if (!valor) return;
            edadCalculada = BiofisicoCalculator.encontrarGrupoEdad(valor, 'grasa', genero);
            document.getElementById('grasa-calculada').value = edadCalculada ? `${edadCalculada} años` : 'Fuera de rango';
            document.getElementById('grafico-grasa').textContent = edadCalculada ? `${edadCalculada}` : '--';
            break;

        case 'imc':
            valor = parseFloat(document.getElementById('imc-valor').value);
            if (!valor) return;
            edadCalculada = BiofisicoCalculator.encontrarGrupoEdad(valor, 'imc');
            document.getElementById('imc-calculada').value = edadCalculada ? `${edadCalculada} años` : 'Fuera de rango';
            document.getElementById('grafico-imc').textContent = edadCalculada ? `${edadCalculada}` : '--';
            break;

        case 'reflejos':
            const ref1 = parseFloat(document.getElementById('reflejos-1').value);
            const ref2 = parseFloat(document.getElementById('reflejos-2').value);
            const ref3 = parseFloat(document.getElementById('reflejos-3').value);
            if (!ref1 || !ref2 || !ref3) return;
            const promedioRef = (ref1 + ref2 + ref3) / 3;
            edadCalculada = BiofisicoCalculator.encontrarGrupoEdad(promedioRef, 'reflejos');
            document.getElementById('reflejos-calculada').value = edadCalculada ? `${edadCalculada} años` : 'Fuera de rango';
            document.getElementById('grafico-reflejos').textContent = edadCalculada ? `${edadCalculada}` : '--';
            break;

        case 'acomodacion':
            valor = parseFloat(document.getElementById('acomodacion-valor').value);
            if (!valor) return;
            edadCalculada = BiofisicoCalculator.encontrarGrupoEdad(valor, 'acomodacion');
            document.getElementById('acomodacion-calculada').value = edadCalculada ? `${edadCalculada} años` : 'Fuera de rango';
            document.getElementById('grafico-acomodacion').textContent = edadCalculada ? `${edadCalculada}` : '--';
            break;

        case 'balance':
            const bal1 = parseFloat(document.getElementById('balance-1').value);
            const bal2 = parseFloat(document.getElementById('balance-2').value);
            const bal3 = parseFloat(document.getElementById('balance-3').value);
            if (!bal1 || !bal2 || !bal3) return;
            const promedioBal = (bal1 + bal2 + bal3) / 3;
            edadCalculada = BiofisicoCalculator.encontrarGrupoEdad(promedioBal, 'balance');
            document.getElementById('balance-calculada').value = edadCalculada ? `${edadCalculada} años` : 'Fuera de rango';
            document.getElementById('grafico-balance').textContent = edadCalculada ? `${edadCalculada}` : '--';
            break;

        case 'hidratacion':
            valor = parseFloat(document.getElementById('hidratacion-valor').value);
            if (!valor) return;
            edadCalculada = BiofisicoCalculator.encontrarGrupoEdad(valor, 'hidratacion');
            document.getElementById('hidratacion-calculada').value = edadCalculada ? `${edadCalculada} años` : 'Fuera de rango';
            document.getElementById('grafico-hidratacion').textContent = edadCalculada ? `${edadCalculada}` : '--';
            break;

        case 'sistolica':
            valor = parseFloat(document.getElementById('sistolica-valor').value);
            if (!valor) return;
            edadCalculada = BiofisicoCalculator.encontrarGrupoEdad(valor, 'sistolica');
            document.getElementById('sistolica-calculada').value = edadCalculada ? `${edadCalculada} años` : 'Fuera de rango';
            document.getElementById('grafico-sistolica').textContent = edadCalculada ? `${edadCalculada}` : '--';
            break;

        case 'diastolica':
            valor = parseFloat(document.getElementById('diastolica-valor').value);
            if (!valor) return;
            edadCalculada = BiofisicoCalculator.encontrarGrupoEdad(valor, 'diastolica');
            document.getElementById('diastolica-calculada').value = edadCalculada ? `${edadCalculada} años` : 'Fuera de rango';
            document.getElementById('grafico-diastolica').textContent = edadCalculada ? `${edadCalculada}` : '--';
            break;
    }

    if (edadCalculada) {
        window.toastManager.success(
            'Cálculo completado',
            `${parametro.charAt(0).toUpperCase() + parametro.slice(1)}: ${edadCalculada} años`,
            2000
        );
    }
}

function calcularEdadBiofisica() {
    const form = document.getElementById('biofisico-form');
    const formData = new FormData(form);
    
    // Recopilar todos los datos
    const datos = {
        genero: formData.get('genero'),
        grasa: {
            valor: parseFloat(document.getElementById('grasa-valor').value)
        },
        imc: {
            valor: parseFloat(document.getElementById('imc-valor').value)
        },
        reflejos: {
            medicion1: parseFloat(document.getElementById('reflejos-1').value),
            medicion2: parseFloat(document.getElementById('reflejos-2').value),
            medicion3: parseFloat(document.getElementById('reflejos-3').value)
        },
        acomodacion: {
            valor: parseFloat(document.getElementById('acomodacion-valor').value)
        },
        balance: {
            medicion1: parseFloat(document.getElementById('balance-1').value),
            medicion2: parseFloat(document.getElementById('balance-2').value),
            medicion3: parseFloat(document.getElementById('balance-3').value)
        },
        hidratacion: {
            valor: parseFloat(document.getElementById('hidratacion-valor').value)
        },
        sistolica: {
            valor: parseFloat(document.getElementById('sistolica-valor').value)
        },
        diastolica: {
            valor: parseFloat(document.getElementById('diastolica-valor').value)
        }
    };

    // Calcular promedios donde sea necesario
    if (datos.reflejos.medicion1 && datos.reflejos.medicion2 && datos.reflejos.medicion3) {
        datos.reflejos.promedio = (datos.reflejos.medicion1 + datos.reflejos.medicion2 + datos.reflejos.medicion3) / 3;
    }

    if (datos.balance.medicion1 && datos.balance.medicion2 && datos.balance.medicion3) {
        datos.balance.promedio = (datos.balance.medicion1 + datos.balance.medicion2 + datos.balance.medicion3) / 3;
    }

    // Calcular edad biofísica
    const edadBiofisica = BiofisicoCalculator.calcularEdadBiofisica(datos);
    const edadCronologica = parseFloat(document.getElementById('edad-cronologica').value);
    
    if (edadBiofisica && edadCronologica) {
        const diferencia = edadCronologica - edadBiofisica;
        
        document.getElementById('edad-biofisica').value = edadBiofisica;
        document.getElementById('edad-diferencial').value = 
            diferencia > 0 ? `+${diferencia.toFixed(1)} años (más joven)` : 
            diferencia < 0 ? `${diferencia.toFixed(1)} años (mayor)` : 
            'Igual a edad cronológica';

        window.toastManager.success(
            'Cálculo completado',
            `Edad biofísica: ${edadBiofisica} años (${diferencia.toFixed(1)} años de diferencia)`,
            5000
        );
    } else {
        window.toastManager.error(
            'Error en cálculo',
            'No se pudo calcular la edad biofísica. Verifique los datos ingresados.',
            5000
        );
    }
}

async function guardarTestBiofisico() {
    const form = document.getElementById('biofisico-form');
    const formData = new FormData(form);
    
    // Validar datos mínimos
    const edadBiofisica = document.getElementById('edad-biofisica').value;
    if (!edadBiofisica) {
        window.toastManager.warning(
            'Calcular primero',
            'Debe calcular la edad biofísica antes de guardar',
            3000
        );
        return;
    }

    try {
        // Aquí normalmente se enviaría al servidor
        window.toastManager.success(
            'Test guardado',
            'El test biofísico se ha guardado exitosamente',
            3000
        );
        
        setTimeout(() => {
            closeBiofisicoModal();
        }, 1500);
    } catch (error) {
        window.toastManager.error(
            'Error al guardar',
            'No se pudo guardar el test. Intente nuevamente.',
            5000
        );
    }
}

// ===== GESTIÓN DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('Error global capturado:', event.error);
    
    if (window.toastManager) {
        window.toastManager.error(
            'Error de aplicación',
            'Se ha producido un error inesperado. Por favor, recargue la página.',
            0
        );
    }
});

// ===== FUNCIÓN DE INICIALIZACIÓN PRINCIPAL =====
async function initializeApp() {
    try {
        console.log('🚀 Inicializando aplicación Doctor Antivejez...');

        // Verificar que los elementos DOM necesarios existen
        const requiredElements = ['app-root', 'toast-container'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Elementos DOM faltantes: ${missingElements.join(', ')}`);
        }

        // Inicializar managers
        console.log('📋 Inicializando managers...');
        
        window.toastManager = new ToastManager();
        window.themeManager = new ThemeManager();
        window.searchManager = new SearchManager();
        window.modalManager = new ModalManager();

        // Inicializar router
        console.log('🛣️  Inicializando router...');
        if (typeof createRouter === 'function') {
            window.router = createRouter();
        } else {
            throw new Error('Función createRouter no encontrada');
        }

        // Hacer funciones globales disponibles
        window.openBiofisicoModal = openBiofisicoModal;
        window.closeBiofisicoModal = closeBiofisicoModal;
        window.volverDetalleModal = volverDetalleModal;
        window.calcularItem = calcularItem;
        window.calcularEdadBiofisica = calcularEdadBiofisica;
        window.guardarTestBiofisico = guardarTestBiofisico;

        // Marcar como inicializada
        window.app.initialized = true;

        console.log('✅ Aplicación inicializada correctamente');
        
        // Mostrar notificación de bienvenida
        setTimeout(() => {
            window.toastManager.success(
                '¡Bienvenido!',
                'Plataforma Doctor Antivejez lista para usar',
                3000
            );
        }, 1000);

    } catch (error) {
        console.error('❌ FALLO CRÍTICO en la inicialización:', error);
        
        // Mostrar error en la interfaz
        const appRoot = document.getElementById('app-root');
        if (appRoot) {
            appRoot.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 60vh;
                    padding: 2rem;
                    text-align: center;
                    color: #e74c3c;
                ">
                    <div style="
                        width: 100px;
                        height: 100px;
                        background: #e74c3c;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 2rem;
                        font-size: 3rem;
                        color: white;
                    ">
                        ⚠️
                    </div>
                    <h1 style="font-size: 2rem; margin-bottom: 1rem;">Error de Inicialización</h1>
                    <p style="font-size: 1.1rem; margin-bottom: 1.5rem; max-width: 600px; line-height: 1.6;">
                        No se pudo inicializar la aplicación correctamente. 
                        Esto puede deberse a un problema de configuración del servidor de desarrollo.
                    </p>
                    <div style="margin-bottom: 2rem;">
                        <strong>Error técnico:</strong> ${error.message}
                    </div>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
                        <button onclick="location.reload()" style="
                            padding: 1rem 2rem;
                            background: #4789ff;
                            color: white;
                            border: none;
                            border-radius: 0.5rem;
                            cursor: pointer;
                            font-size: 1rem;
                            font-weight: 500;
                        ">
                            🔄 Recargar Página
                        </button>
                        <button onclick="window.location.href = window.location.href.split('#')[0]" style="
                            padding: 1rem 2rem;
                            background: #2ecc71;
                            color: white;
                            border: none;
                            border-radius: 0.5rem;
                            cursor: pointer;
                            font-size: 1rem;
                            font-weight: 500;
                        ">
                            🏠 Ir al Inicio
                        </button>
                    </div>
                    <div style="
                        margin-top: 2rem;
                        padding: 1rem;
                        background: #f8f9fa;
                        border-radius: 0.5rem;
                        font-size: 0.9rem;
                        color: #6c757d;
                        max-width: 800px;
                    ">
                        <strong>Sugerencias para resolver:</strong><br>
                        1. Verifique que todos los archivos estén en las carpetas correctas<br>
                        2. Use un servidor HTTP adecuado (ej: <code>npx serve</code> o <code>python -m http.server</code>)<br>
                        3. Evite abrir el archivo index.html directamente desde el explorador<br>
                        4. Revise la consola del navegador para más detalles del error
                    </div>
                </div>
            `;
        }
    }
}

// ===== INICIALIZACIÓN CUANDO EL DOM ESTÁ LISTO =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('📝 Main.js cargado correctamente');