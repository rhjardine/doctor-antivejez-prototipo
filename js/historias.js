// --- Lógica para la página de LISTA DE HISTORIAS ---
async function initHistoriasListPage() {
    console.log("Inicializando página: Lista de Historias");
    const tableBody = document.getElementById('patients-table-body');
    const subtitle = document.getElementById('patient-count-subtitle');

    subtitle.textContent = 'Cargando...';
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 40px;">Cargando pacientes...</td></tr>';

    const response = await api.getPatients();

    if (response.success) {
        const patients = response.data;
        subtitle.textContent = `${patients.length} paciente${patients.length !== 1 ? 's' : ''} registrados`;
        tableBody.innerHTML = '';
        
        if (patients.length > 0) {
            patients.forEach(patient => {
                const row = document.createElement('tr');
                const initials = (patient.nombres.charAt(0) + patient.apellidos.charAt(0)).toUpperCase();
                row.innerHTML = `
                    <td>
                        <div class="patient-cell">
                            <div class="patient-avatar">${initials}</div>
                            <div class="patient-info">
                                <div class="patient-name">${patient.nombres} ${patient.apellidos}</div>
                                <div class="patient-email">${patient.email || 'Sin email'}</div>
                            </div>
                        </div>
                    </td>
                    <td>${patient.identificacion}</td>
                    <td>${calculateAge(patient.fechaNacimiento)} años</td>
                    <td>${patient.telefono || 'N/A'}</td>
                    <td>${formatDate(patient.fechaRegistro)}</td>
                    <td class="action-buttons">
                        <a href="#historias/detalle/${patient.id}" class="btn-view" title="Ver Perfil"><i class="fas fa-eye"></i></a>
                        <a href="#historias/detalle/${patient.id}" class="btn-edit" title="Realizar Test"><i class="fas fa-vial"></i></a>
                        <button class="btn-delete" data-id="${patient.id}" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    }
    
    tableBody.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', async (e) => {
            const patientId = parseInt(e.currentTarget.dataset.id);
            if (confirm('¿Está seguro de eliminar el registro de este paciente?')) {
                const result = await api.deletePatient(patientId);
                if (result.success) {
                    showToast('success', 'Eliminado', 'El registro del paciente ha sido eliminado.');
                    router.loadRoute();
                } else {
                    showToast('error', 'Error', 'No se pudo eliminar el paciente.');
                }
            }
        });
    });
}

// --- Lógica para la página de NUEVO PACIENTE ---
function initHistoriasNuevoPage() {
    console.log("Inicializando página: Nuevo Paciente");
    const form = document.getElementById('new-patient-form');
    if (!form) return;

    const fechaNacimientoInput = document.getElementById('fecha-nacimiento');
    const edadCronologicaInput = document.getElementById('edad-cronologica');
    
    fechaNacimientoInput.addEventListener('input', () => {
        if (fechaNacimientoInput.value) {
            const age = calculateAge(fechaNacimientoInput.value);
            edadCronologicaInput.value = age !== 'N/A' ? `${age} años` : '';
        } else {
            edadCronologicaInput.value = 'Se calcula automáticamente';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        const patientData = {
            nombres: document.getElementById('nombres').value,
            apellidos: document.getElementById('apellidos').value,
            identificacion: `${document.getElementById('nacionalidad').value}${document.getElementById('identificacion').value}`,
            fechaNacimiento: fechaNacimientoInput.value,
            genero: document.getElementById('genero').value,
            telefono: document.getElementById('telefono').value,
            email: "ejemplo@correo.com",
            lugarNacimiento: document.getElementById('lugar-nacimiento').value,
            estadoCivil: document.getElementById('estado-civil').value,
            profesion: document.getElementById('profesion').value,
            paisResidencia: document.getElementById('pais-residencia').value,
            estadoProvincia: document.getElementById('estado-provincia').value,
            ciudad: document.getElementById('ciudad').value,
            direccion: document.getElementById('direccion').value,
            observaciones: document.getElementById('observaciones').value,
        };
        
        const response = await api.savePatient(patientData);

        if (response.success) {
            showToast('success', 'Paciente Guardado', 'La nueva historia clínica ha sido creada con éxito.');
            window.location.hash = '#historias';
        } else {
            showToast('error', 'Error al Guardar', 'Ocurrió un problema al intentar guardar al paciente.');
            submitButton.disabled = false;
            submitButton.textContent = 'Guardar Historia';
        }
    });

    document.getElementById('fecha-historia').valueAsDate = new Date();
    const photoUpload = document.getElementById('photo-upload');
    const photoPreview = document.getElementById('photo-preview');
    photoPreview.addEventListener('click', () => photoUpload.click());
    photoUpload.addEventListener('change', () => {
        const file = photoUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// --- Lógica para la página de DETALLE DE PACIENTE ---
async function initHistoriasDetallePage(patientId) {
    console.log(`Inicializando página: Detalle del Paciente ID: ${patientId}`);
    const response = await api.getPatientById(patientId);
    if (!response.success) {
        document.getElementById('app-root').innerHTML = `<h2>Error: ${response.error}</h2>`;
        return;
    }

    const patient = response.data;
    const banner = document.getElementById('patient-banner');
    const initials = (patient.nombres.charAt(0) + patient.apellidos.charAt(0)).toUpperCase();
    banner.innerHTML = `...`; // El HTML del banner
    
    // El resto de la lógica de esta función
}

// --- Funciones de utilidad ---
function calculateAge(birthDateString) {
    if (!birthDateString) return 'N/A';
    const birthDate = new Date(birthDateString);
    const today = new Date();
    if (isNaN(birthDate.getTime())) return 'N/A';
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + userTimezoneOffset);
    return localDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}