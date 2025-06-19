// Variables globales para historias
let pacientesList = [];
let filteredPatients = [];
let currentPatient = null;
let currentEditingPatient = null;

// ===== INICIALIZACIÓN DE LISTA DE HISTORIAS =====
async function initHistoriasList() {
    console.log('📋 Inicializando lista de historias...');
    
    try {
        await loadPatientsList();
        setupHistoriasEvents();
        setupSearchFunctionality();
        
        console.log('✅ Lista de historias inicializada');
        
    } catch (error) {
        console.error('❌ Error inicializando lista de historias:', error);
        showHistoriasError(error.message);
    }
}

// ===== CARGA DE LISTA DE PACIENTES =====
async function loadPatientsList() {
    try {
        const response = await PacientesAPI.getAll();
        
        if (response.success) {
            pacientesList = response.data;
            filteredPatients = [...pacientesList];
            renderPatientsList(filteredPatients);
            updatePatientsCount(response.total);
        } else {
            throw new Error('No se pudieron cargar los pacientes');
        }
    } catch (error) {
        console.error('Error cargando pacientes:', error);
        showPatientsLoadError();
    }
}

// ===== RENDERIZADO DE LISTA DE PACIENTES =====
function renderPatientsList(patients) {
    const tableBody = document.querySelector('.patients-table tbody');
    if (!tableBody) return;

    if (patients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: #6b7280;">
                    <div>
                        <i class="fas fa-user-plus" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <h3>No hay pacientes registrados</h3>
                        <p>Comience agregando un nuevo paciente</p>
                        <button onclick="goToNuevoHistoria()" class="btn btn-primary" style="margin-top: 1rem;">
                            <i class="fas fa-plus"></i> Nuevo Paciente
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const rows = patients.map(patient => `
        <tr data-patient-id="${patient.id}">
            <td>
                <div class="patient-info">
                    <div class="patient-avatar">
                        ${patient.foto ? 
                            `<img src="${patient.foto}" alt="${patient.nombres}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : 
                            getInitials(patient.nombres, patient.apellidos)
                        }
                    </div>
                    <div class="patient-details">
                        <h4>${patient.apellidos}, ${patient.nombres}</h4>
                        <p>${patient.genero === 'masculino' ? 'Masculino' : 
                             patient.genero === 'femenino' ? 'Femenino' : 
                             patient.genero === 'masculino-deportivo' ? 'Masculino Deportivo' : 
                             patient.genero === 'femenino-deportivo' ? 'Femenino Deportivo' : 
                             patient.genero}</p>
                    </div>
                </div>
            </td>
            <td>
                <span style="font-family: monospace; font-weight: 500;">${patient.identificacion}</span>
            </td>
            <td>
                <span style="font-weight: 500;">${patient.edadCronologica} años</span>
            </td>
            <td>
                <div class="contact-info">
                    <span>${patient.telefono}</span>
                    <span>${patient.email || 'Sin email'}</span>
                </div>
            </td>
            <td>
                <span style="font-size: 0.875rem; color: #6b7280;">${formatearFecha(patient.fechaCreacion)}</span>
            </td>
            <td>
                <div class="actions-btns">
                    <button class="action-btn view" onclick="viewPatientDetail('${patient.id}')" title="Ver detalle">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editPatient('${patient.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="confirmDeletePatient('${patient.id}', '${patient.nombres} ${patient.apellidos}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    tableBody.innerHTML = rows;
}

// ===== UTILIDADES =====
function getInitials(nombres, apellidos) {
    const firstInitial = nombres ? nombres.charAt(0).toUpperCase() : '';
    const lastInitial = apellidos ? apellidos.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
}

function updatePatientsCount(count) {
    const countElement = document.querySelector('.page-subtitle');
    if (countElement) {
        countElement.textContent = `${count} pacientes registrados`;
    }
}

// ===== CONFIGURACIÓN DE EVENTOS =====
function setupHistoriasEvents() {
    // Botón de nuevo paciente
    const newPatientBtn = document.querySelector('[onclick="goToNuevoHistoria()"], .btn-primary');
    if (newPatientBtn) {
        newPatientBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToNuevoHistoria();
        });
    }

    // Doble click en filas para ver detalle
    document.addEventListener('click', (e) => {
        const row = e.target.closest('tr[data-patient-id]');
        if (row && !e.target.closest('.actions-btns')) {
            const patientId = row.getAttribute('data-patient-id');
            viewPatientDetail(patientId);
        }
    });
}

// ===== FUNCIONALIDAD DE BÚSQUEDA =====
function setupSearchFunctionality() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;

    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (query.length === 0) {
                filteredPatients = [...pacientesList];
            } else {
                filteredPatients = pacientesList.filter(patient => 
                    patient.nombres.toLowerCase().includes(query) ||
                    patient.apellidos.toLowerCase().includes(query) ||
                    patient.identificacion.toLowerCase().includes(query) ||
                    patient.email?.toLowerCase().includes(query) ||
                    patient.telefono.includes(query)
                );
            }
            
            renderPatientsList(filteredPatients);
            updatePatientsCount(filteredPatients.length);
            
            if (query.length > 0) {
                window.toastManager.info(
                    'Búsqueda',
                    `${filteredPatients.length} resultado(s) encontrado(s)`,
                    2000
                );
            }
        }, 300);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });
}

// ===== ACCIONES DE PACIENTES =====

// Ver detalle del paciente
function viewPatientDetail(patientId) {
    console.log('👁️ Viendo detalle del paciente:', patientId);
    goToPacienteDetalle(patientId);
}

// Editar paciente
function editPatient(patientId) {
    console.log('✏️ Editando paciente:', patientId);
    // Por ahora redirigir al formulario de nuevo paciente
    // En una implementación completa, se cargarían los datos del paciente
    window.toastManager.info(
        'Función en desarrollo',
        'La edición de pacientes estará disponible próximamente',
        3000
    );
}

// Confirmar eliminación de paciente
function confirmDeletePatient(patientId, patientName) {
    if (confirm(`¿Está seguro de que desea eliminar al paciente ${patientName}?\\n\\nEsta acción no se puede deshacer.`)) {
        deletePatient(patientId);
    }
}

// Eliminar paciente
async function deletePatient(patientId) {
    try {
        const response = await PacientesAPI.delete(patientId);
        
        if (response.success) {
            window.toastManager.success(
                'Paciente eliminado',
                'El paciente ha sido eliminado exitosamente',
                3000
            );
            
            // Recargar la lista
            await loadPatientsList();
        } else {
            throw new Error(response.error || 'No se pudo eliminar el paciente');
        }
    } catch (error) {
        console.error('Error eliminando paciente:', error);
        window.toastManager.error(
            'Error al eliminar',
            error.message,
            5000
        );
    }
}

// ===== INICIALIZACIÓN DE NUEVO PACIENTE =====
async function initNuevoHistoria() {
    console.log('📝 Inicializando formulario de nuevo paciente...');
    
    try {
        setupPatientFormEvents();
        setupPhotoUpload();
        initializeDatePickers();
        setupFormValidation();
        
        console.log('✅ Formulario de nuevo paciente inicializado');
        
    } catch (error) {
        console.error('❌ Error inicializando formulario:', error);
        showFormError(error.message);
    }
}

// ===== CONFIGURACIÓN DEL FORMULARIO =====
function setupPatientFormEvents() {
    const form = document.getElementById('patient-form');
    if (!form) return;

    // Botón de guardar
    const saveBtn = document.querySelector('.btn-primary');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            savePatient();
        });
    }

    // Botón de cancelar
    const cancelBtn = document.querySelector('.btn-secondary');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Está seguro de que desea cancelar? Se perderán los datos no guardados.')) {
                goToHistorias();
            }
        });
    }

    // Cálculo automático de edad
    const fechaNacimientoInput = document.getElementById('fecha-nacimiento');
    if (fechaNacimientoInput) {
        fechaNacimientoInput.addEventListener('change', calculateAge);
    }

    // Formateo automático de identificación
    const identificacionInput = document.getElementById('identificacion');
    if (identificacionInput) {
        identificacionInput.addEventListener('input', formatIdentification);
    }

    // Formateo de teléfono
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', formatPhone);
    }
}

// ===== CÁLCULO AUTOMÁTICO DE EDAD =====
function calculateAge() {
    const fechaNacimientoInput = document.getElementById('fecha-nacimiento');
    const edadCronologicaInput = document.getElementById('edad-cronologica');
    
    if (!fechaNacimientoInput || !edadCronologicaInput) return;
    
    const fechaNacimiento = fechaNacimientoInput.value;
    if (fechaNacimiento) {
        const edad = calcularEdad(fechaNacimiento);
        edadCronologicaInput.value = edad;
        
        window.toastManager.info(
            'Edad calculada',
            `Edad cronológica: ${edad} años`,
            2000
        );
    }
}

// ===== FORMATEO DE CAMPOS =====
function formatIdentification(e) {
    let value = e.target.value.toUpperCase();
    
    // Remover caracteres no válidos
    value = value.replace(/[^VEJPG0-9-]/g, '');
    
    // Formatear según el patrón venezolano
    if (value.length > 0 && !value.match(/^[VEJPG]/)) {
        value = 'V-' + value;
    }
    
    e.target.value = value;
}

function formatPhone(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    // Formato: +58-414-1234567
    if (value.length > 0) {
        if (value.startsWith('58')) {
            value = '+' + value;
        } else if (value.startsWith('0')) {
            value = '+58-' + value.substring(1);
        } else {
            value = '+58-' + value;
        }
    }
    
    e.target.value = value;
}

// ===== SUBIDA DE FOTO =====
function setupPhotoUpload() {
    const photoUpload = document.querySelector('.photo-upload');
    const photoInput = document.getElementById('foto-input');
    
    if (!photoUpload || !photoInput) return;
    
    // Click en el área de subida
    photoUpload.addEventListener('click', () => {
        photoInput.click();
    });
    
    // Drag and drop
    photoUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        photoUpload.style.borderColor = '#4789ff';
        photoUpload.style.backgroundColor = 'rgba(71, 137, 255, 0.1)';
    });
    
    photoUpload.addEventListener('dragleave', (e) => {
        e.preventDefault();
        photoUpload.style.borderColor = '';
        photoUpload.style.backgroundColor = '';
    });
    
    photoUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        photoUpload.style.borderColor = '';
        photoUpload.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handlePhotoFile(files[0]);
        }
    });
    
    // Selección de archivo
    photoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handlePhotoFile(e.target.files[0]);
        }
    });
}

function handlePhotoFile(file) {
    if (!file.type.startsWith('image/')) {
        window.toastManager.error(
            'Archivo inválido',
            'Por favor seleccione una imagen válida',
            3000
        );
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
        window.toastManager.error(
            'Archivo muy grande',
            'La imagen debe ser menor a 5MB',
            3000
        );
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const photoPreview = document.querySelector('.photo-preview img');
        if (photoPreview) {
            photoPreview.src = e.target.result;
            photoPreview.style.display = 'block';
        } else {
            // Crear imagen si no existe
            const preview = document.querySelector('.photo-preview');
            if (preview) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Foto del paciente" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            }
        }
        
        window.toastManager.success(
            'Foto cargada',
            'La foto del paciente se ha cargado correctamente',
            2000
        );
    };
    
    reader.readAsDataURL(file);
}

// ===== INICIALIZACIÓN DE DATE PICKERS =====
function initializeDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        // Establecer fecha máxima como hoy
        const today = new Date().toISOString().split('T')[0];
        if (input.id === 'fecha-nacimiento') {
            input.max = today;
        } else if (input.id === 'fecha-historia') {
            input.value = today; // Fecha de historia por defecto hoy
        }
    });
}

// ===== VALIDACIÓN DEL FORMULARIO =====
function setupFormValidation() {
    const form = document.getElementById('patient-form');
    if (!form) return;
    
    // Validación en tiempo real
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Este campo es requerido');
        return false;
    }
    
    // Validaciones específicas
    switch (field.type) {
        case 'email':
            if (value && !isValidEmail(value)) {
                showFieldError(field, 'Ingrese un email válido');
                return false;
            }
            break;
        case 'date':
            if (value && field.id === 'fecha-nacimiento') {
                const age = calcularEdad(value);
                if (age < 0 || age > 120) {
                    showFieldError(field, 'Fecha de nacimiento inválida');
                    return false;
                }
            }
            break;
    }
    
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#e74c3c';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.cssText = 'color: #e74c3c; font-size: 0.875rem; margin-top: 0.25rem;';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    if (typeof field === 'object' && field.target) {
        field = field.target;
    }
    
    field.style.borderColor = '';
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== GUARDAR PACIENTE =====
async function savePatient() {
    const form = document.getElementById('patient-form');
    if (!form) return;
    
    // Validar formulario
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        window.toastManager.error(
            'Formulario incompleto',
            'Por favor complete todos los campos requeridos',
            3000
        );
        return;
    }
    
    try {
        // Mostrar indicador de carga
        const saveBtn = document.querySelector('.btn-primary');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        saveBtn.disabled = true;
        
        // Recopilar datos del formulario
        const formData = new FormData(form);
        const patientData = {};
        
        for (let [key, value] of formData.entries()) {
            patientData[key] = value;
        }
        
        // Agregar foto si existe
        const photoImg = document.querySelector('.photo-preview img');
        if (photoImg && photoImg.src.startsWith('data:')) {
            patientData.foto = photoImg.src;
        }
        
        // Agregar campos calculados
        patientData.edadCronologica = parseInt(document.getElementById('edad-cronologica').value) || 0;
        
        // Guardar paciente
        const response = await PacientesAPI.create(patientData);
        
        if (response.success) {
            window.toastManager.success(
                'Paciente guardado',
                'El nuevo paciente ha sido registrado exitosamente',
                3000
            );
            
            // Redirigir a la lista después de un breve delay
            setTimeout(() => {
                goToHistorias();
            }, 1500);
        } else {
            throw new Error(response.error || 'No se pudo guardar el paciente');
        }
        
    } catch (error) {
        console.error('Error guardando paciente:', error);
        window.toastManager.error(
            'Error al guardar',
            error.message,
            5000
        );
        
        // Restaurar botón
        const saveBtn = document.querySelector('.btn-primary');
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// ===== INICIALIZACIÓN DEL DETALLE DEL PACIENTE =====
async function initPacienteDetalle(pacienteId) {
    console.log('👤 Inicializando detalle del paciente:', pacienteId);
    
    if (!pacienteId) {
        console.error('❌ ID de paciente no proporcionado');
        goToHistorias();
        return;
    }
    
    try {
        await loadPatientDetail(pacienteId);
        setupPatientDetailEvents();
        initializeTabs();
        loadBiofisicoTests(pacienteId);
        
        console.log('✅ Detalle del paciente inicializado');
        
    } catch (error) {
        console.error('❌ Error inicializando detalle del paciente:', error);
        showPatientDetailError(error.message);
    }
}

// ===== CARGAR DETALLE DEL PACIENTE =====
async function loadPatientDetail(pacienteId) {
    try {
        const response = await PacientesAPI.getById(pacienteId);
        
        if (response.success) {
            currentPatient = response.data;
            renderPatientHeader(currentPatient);
        } else {
            throw new Error('Paciente no encontrado');
        }
    } catch (error) {
        console.error('Error cargando detalle del paciente:', error);
        throw error;
    }
}

// ===== RENDERIZAR HEADER DEL PACIENTE =====
function renderPatientHeader(patient) {
    const headerContent = document.querySelector('.patient-header-content');
    if (!headerContent) return;
    
    const initials = getInitials(patient.nombres, patient.apellidos);
    
    headerContent.innerHTML = `
        <div class="patient-header-avatar">
            ${patient.foto ? 
                `<img src="${patient.foto}" alt="${patient.nombres}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : 
                initials
            }
        </div>
        <div class="patient-header-info">
            <h1>${patient.apellidos}, ${patient.nombres}</h1>
            <div class="patient-header-meta">
                <span>Edad: ${patient.edadCronologica} años</span>
                <span>Género: ${patient.genero === 'masculino' ? 'Masculino' : 
                                patient.genero === 'femenino' ? 'Femenino' : 
                                patient.genero}</span>
                <span>ID: ${patient.identificacion}</span>
            </div>
        </div>
        <div class="patient-header-stats">
            <div class="stat-item">
                <h3 id="edad-biologica-stat">52.3</h3>
                <p>Edad Biológica</p>
            </div>
            <div class="stat-item">
                <h3 id="tendencia-stat" style="color: #2ecc71;">-5.7</h3>
                <p>Tendencia</p>
            </div>
        </div>
    `;
}

// ===== CONFIGURACIÓN DE EVENTOS DEL DETALLE =====
function setupPatientDetailEvents() {
    // Botón de volver
    const backBtn = document.querySelector('.btn-back, [onclick="goToHistorias()"]');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToHistorias();
        });
    }
}

// ===== INICIALIZACIÓN DE PESTAÑAS =====
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            // Remover clase active de todos los botones y contenidos
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');
            
            // Activar el botón y contenido seleccionado
            btn.classList.add('active');
            if (tabContents[index]) {
                tabContents[index].style.display = 'block';
            }
            
            // Cargar contenido específico de la pestaña
            const tabName = btn.textContent.trim();
            loadTabContent(tabName, index);
        });
    });
    
    // Activar primera pestaña por defecto
    if (tabBtns.length > 0) {
        tabBtns[0].click();
    }
}

// ===== CARGAR CONTENIDO DE PESTAÑAS =====
function loadTabContent(tabName, index) {
    console.log('📂 Cargando contenido de pestaña:', tabName);
    
    switch (index) {
        case 0: // Historia Médica
            loadHistoriaMedica();
            break;
        case 1: // Edad Biológica
            loadEdadBiologica();
            break;
        case 2: // Guía del Paciente
            loadGuiaPaciente();
            break;
        case 3: // Alimentación Nutrigenómica
            loadAlimentacionNutri();
            break;
    }
}

function loadHistoriaMedica() {
    // Implementación de historia médica
    window.toastManager.info(
        'Historia Médica',
        'Sección en desarrollo',
        2000
    );
}

function loadEdadBiologica() {
    // Esta es la pestaña principal con las cards de tests
    if (currentPatient) {
        renderEdadBiologicaCards();
    }
}

function loadGuiaPaciente() {
    window.toastManager.info(
        'Guía del Paciente',
        'Sección en desarrollo',
        2000
    );
}

function loadAlimentacionNutri() {
    window.toastManager.info(
        'Alimentación Nutrigenómica',
        'Sección en desarrollo',
        2000
    );
}

// ===== RENDERIZAR CARDS DE EDAD BIOLÓGICA =====
function renderEdadBiologicaCards() {
    const container = document.querySelector('.edad-biologica-grid');
    if (!container) return;
    
    container.innerHTML = `
        <div class="edad-card" onclick="openBiofisicoModal('${currentPatient.id}')">
            <div class="edad-card-icon">
                <i class="fas fa-flask"></i>
            </div>
            <h3 class="edad-card-title">EDAD BIOFÍSICA</h3>
            <div class="edad-card-value">55</div>
            <div class="edad-card-unit">años</div>
        </div>
        
        <div class="edad-card" onclick="openTestModal('bioquimico')">
            <div class="edad-card-icon">
                <i class="fas fa-chart-line"></i>
            </div>
            <h3 class="edad-card-title">EDAD BIOQUÍMICA</h3>
            <div class="edad-card-value">53</div>
            <div class="edad-card-unit">años</div>
        </div>
        
        <div class="edad-card" onclick="openTestModal('ortomolecular')">
            <div class="edad-card-icon">
                <i class="fas fa-dna"></i>
            </div>
            <h3 class="edad-card-title">EDAD ORTOMOLECULAR</h3>
            <div class="edad-card-value">50</div>
            <div class="edad-card-unit">años</div>
        </div>
        
        <div class="edad-card" onclick="openTestModal('genomica')">
            <div class="edad-card-icon">
                <i class="fas fa-flask"></i>
            </div>
            <h3 class="edad-card-title">EDAD GENÓMICA</h3>
            <div class="edad-card-value">58</div>
            <div class="edad-card-unit">años</div>
        </div>
    `;
}

// ===== CARGAR TESTS BIOFÍSICOS =====
async function loadBiofisicoTests(pacienteId) {
    try {
        const response = await TestsBiofisicosAPI.getByPacienteId(pacienteId);
        
        if (response.success && response.data.length > 0) {
            // Actualizar stats en el header con datos reales
            const latestTest = response.data[response.data.length - 1];
            
            const edadBiologicaStat = document.getElementById('edad-biologica-stat');
            const tendenciaStat = document.getElementById('tendencia-stat');
            
            if (edadBiologicaStat) {
                edadBiologicaStat.textContent = latestTest.edadBiofisica;
            }
            
            if (tendenciaStat) {
                const diferencia = latestTest.edadDiferencial;
                tendenciaStat.textContent = diferencia > 0 ? `+${diferencia}` : diferencia;
                tendenciaStat.style.color = diferencia < 0 ? '#2ecc71' : '#e74c3c';
            }
        }
    } catch (error) {
        console.error('Error cargando tests biofísicos:', error);
    }
}

// ===== FUNCIONES PARA OTROS TESTS =====
function openTestModal(testType) {
    window.toastManager.info(
        'Test en desarrollo',
        `El test ${testType} estará disponible próximamente`,
        3000
    );
}

// ===== MANEJO DE ERRORES =====
function showHistoriasError(message) {
    const appRoot = document.getElementById('app-root');
    if (!appRoot) return;
    
    appRoot.innerHTML = `
        <div class="error-container" style="text-align: center; padding: 3rem;">
            <h2 style="color: #e74c3c;">Error en Historias</h2>
            <p>${message}</p>
            <button onclick="initHistoriasList()" class="btn btn-primary">Reintentar</button>
        </div>
    `;
}

function showPatientsLoadError() {
    const tableBody = document.querySelector('.patients-table tbody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Error cargando pacientes</h3>
                    <p>No se pudieron cargar los datos</p>
                    <button onclick="loadPatientsList()" class="btn btn-primary">Reintentar</button>
                </td>
            </tr>
        `;
    }
}

function showFormError(message) {
    window.toastManager.error(
        'Error en formulario',
        message,
        5000
    );
}

function showPatientDetailError(message) {
    const appRoot = document.getElementById('app-root');
    if (!appRoot) return;
    
    appRoot.innerHTML = `
        <div class="error-container" style="text-align: center; padding: 3rem;">
            <h2 style="color: #e74c3c;">Error cargando paciente</h2>
            <p>${message}</p>
            <button onclick="goToHistorias()" class="btn btn-primary">Volver a la lista</button>
        </div>
    `;
}

// ===== FUNCIONES PÚBLICAS PARA ACTUALIZACIÓN =====
function updatePatientsList(patients) {
    if (Array.isArray(patients)) {
        filteredPatients = patients;
        renderPatientsList(patients);
        updatePatientsCount(patients.length);
    }
}

// ===== EXPORTACIÓN DE FUNCIONES =====
window.initHistoriasList = initHistoriasList;
window.initNuevoHistoria = initNuevoHistoria;
window.initPacienteDetalle = initPacienteDetalle;
window.updatePatientsList = updatePatientsList;
window.viewPatientDetail = viewPatientDetail;
window.editPatient = editPatient;
window.confirmDeletePatient = confirmDeletePatient;
window.deletePatient = deletePatient;
window.savePatient = savePatient;
window.openTestModal = openTestModal;

console.log('📋 Historias.js cargado correctamente');