class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    init() {
        window.addEventListener('load', () => this.handleRoute());
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('popstate', () => this.handleRoute());
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    navigate(path) {
        window.location.hash = path;
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        console.log('Navegando a:', hash);
        
        // Manejar rutas dinámicas para pacientes
        if (hash.startsWith('historias/')) {
            const segments = hash.split('/');
            if (segments.length === 2) {
                // Ruta: historias/[id] - Vista de detalle del paciente
                const patientId = segments[1];
                this.loadPatientDetail(patientId);
                return;
            }
        }
        
        // Rutas estáticas
        if (this.routes[hash]) {
            this.currentRoute = hash;
            this.routes[hash]();
        } else {
            console.warn(`Ruta no encontrada: ${hash}`);
            this.navigate('dashboard');
        }
    }

    async loadPatientDetail(patientId) {
        try {
            console.log('Cargando detalle del paciente:', patientId);
            
            // Cargar la plantilla del detalle del paciente
            const response = await fetch('pages/paciente-detalle.html');
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            document.getElementById('main-content').innerHTML = html;
            
            // Cargar los datos del paciente
            await this.loadPatientData(patientId);
            
            // Inicializar la funcionalidad del detalle del paciente
            this.initPatientDetail(patientId);
            
        } catch (error) {
            console.error('Error al cargar detalle del paciente:', error);
            this.showError('Error al cargar los datos del paciente');
        }
    }

    async loadPatientData(patientId) {
        try {
            // Simular carga de datos del paciente desde la API
            const patient = await this.getPatientById(patientId);
            
            if (!patient) {
                throw new Error('Paciente no encontrado');
            }
            
            // Actualizar la interfaz con los datos del paciente
            this.updatePatientInterface(patient);
            
        } catch (error) {
            console.error('Error al cargar datos del paciente:', error);
            throw error;
        }
    }

    async getPatientById(id) {
        // Simular base de datos de pacientes
        const patients = [
            {
                id: 1,
                name: "Richard Hans Jardine Romero",
                identification: "V-12431453",
                age: 50,
                gender: "Masculino",
                phone: "+584142809270",
                email: "rhjardine@gmail.com",
                registrationDate: "12/6/2025",
                avatar: "RJ",
                chronologicalAge: 50,
                biologicalAge: null,
                differentialAge: null
            },
            {
                id: 2,
                name: "Aníbal Gerardo Freites Flores",
                identification: "V-10811971",
                age: 52,
                gender: "Masculino",
                phone: "+584141234567",
                email: "afestetica@gmail.com",
                registrationDate: "12/6/2025",
                avatar: "AF",
                chronologicalAge: 52,
                biologicalAge: null,
                differentialAge: null
            }
        ];
        
        return patients.find(p => p.id === parseInt(id));
    }

    updatePatientInterface(patient) {
        // Actualizar el header del paciente
        const patientHeader = document.querySelector('.patient-header');
        if (patientHeader) {
            patientHeader.innerHTML = `
                <div class="patient-info-card">
                    <div class="patient-avatar">
                        <span class="avatar-initials">${patient.avatar}</span>
                    </div>
                    <div class="patient-details">
                        <h2 class="patient-name">${patient.name}</h2>
                        <div class="patient-meta">
                            <span class="age">Edad: ${patient.age} años</span>
                            <span class="gender">Género: ${patient.gender}</span>
                        </div>
                    </div>
                    <div class="biological-age-display">
                        <div class="bio-age-value">${patient.biologicalAge || '--'}</div>
                        <div class="bio-age-label">Edad Biológica</div>
                        <div class="age-tendency">${patient.differentialAge ? (patient.differentialAge > 0 ? 'Tendencia' : 'Tendencia') : '--'}</div>
                    </div>
                </div>
            `;
        }
    }

    initPatientDetail(patientId) {
        // Inicializar las pestañas de navegación
        this.initTabs();
        
        // Inicializar los botones de las tarjetas de tests
        this.initTestCards(patientId);
        
        // Manejar el botón de volver
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.navigate('historias');
            });
        }
    }

    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remover clase activa de todas las pestañas
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Activar la pestaña seleccionada
                button.classList.add('active');
                const targetContent = document.querySelector(`[data-tab-content="${targetTab}"]`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    initTestCards(patientId) {
        // Inicializar las tarjetas de tests
        const testCards = document.querySelectorAll('.test-card');
        
        testCards.forEach(card => {
            const testType = card.getAttribute('data-test-type');
            card.addEventListener('click', () => {
                this.openTestModal(testType, patientId);
            });
        });
    }

    openTestModal(testType, patientId) {
        switch(testType) {
            case 'biofisica':
                this.openBiophysicsTest(patientId);
                break;
            case 'bioquimica':
                this.openBiochemistryTest(patientId);
                break;
            case 'ortomolecular':
                this.openOrtomolecularTest(patientId);
                break;
            case 'genetico':
                this.openGeneticTest(patientId);
                break;
        }
    }

    openBiophysicsTest(patientId) {
        // Abrir el modal del test biofísico
        const modal = document.getElementById('biophysics-modal');
        if (modal) {
            modal.style.display = 'block';
            
            // Inicializar el formulario del test biofísico
            if (window.BiophysicsTest) {
                window.BiophysicsTest.init(patientId);
            }
        }
    }

    openBiochemistryTest(patientId) {
        console.log('Abriendo test bioquímico para paciente:', patientId);
        // Implementar en futuras versiones
    }

    openOrtomolecularTest(patientId) {
        console.log('Abriendo test ortomolecular para paciente:', patientId);
        // Implementar en futuras versiones
    }

    openGeneticTest(patientId) {
        console.log('Abriendo test genético para paciente:', patientId);
        // Implementar en futuras versiones
    }

    showError(message) {
        const errorHtml = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h2>Error de Carga</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()" class="btn btn-primary">
                    🔄 Recargar Página
                </button>
            </div>
        `;
        document.getElementById('main-content').innerHTML = errorHtml;
    }
}

// Instancia global del router
window.router = new Router();