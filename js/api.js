// Este archivo simula las llamadas a una API.
// Más adelante, podemos reemplazar esto con llamadas `fetch` reales
// a nuestro backend Node.js/Prisma sin cambiar el resto del código.

const api = {
    // Simula una base de datos en la memoria local
    _pacientes: [
        { id: 1, nombres: 'Richard Hans', apellidos: 'Jardine Romero', identificacion: 'V-12431453', fechaNacimiento: '1973-05-15', genero: 'Masculino', telefono: '+58414142809270', email: 'rjardine@gmail.com', fechaRegistro: '2025-06-12' },
        { id: 2, nombres: 'Anibal Gerardo', apellidos: 'Freites Flores', identificacion: 'V-10811971', fechaNacimiento: '1971-11-08', genero: 'Masculino', telefono: '+584141234567', email: 'afreites@email.com', fechaRegistro: '2025-06-12' },
    ],
    _nextId: 3,

    getPatients: async () => {
        console.log("API: Obteniendo lista de pacientes...");
        // Simular un pequeño retraso de red
        await new Promise(res => setTimeout(res, 500));
        
        // Descomenta la siguiente línea para simular un error
        return { success: false, error: "Internal Server Error" };
        
        return { success: true, data: api._pacientes };
    },

    getPatientById: async (id) => {
        console.log(`API: Buscando paciente con ID: ${id}`);
        await new Promise(res => setTimeout(res, 300));
        
        const patient = api._pacientes.find(p => p.id === id);
        
        if (patient) {
            // Simular datos adicionales para la vista de detalle
            const fullPatientData = {
                ...patient,
                edadBiologica: patient.edadBiologica || (calculateAge(patient.fechaNacimiento) - 5.7), // Simular una mejora
                tendencia: -5.7,
                tests: {
                    biofisica: 55,
                    bioquimica: 53,
                    ortomolecular: 50,
                    genomica: 58
                }
            };
            return { success: true, data: fullPatientData };
        } else {
            return { success: false, error: 'Paciente no encontrado' };
        }
    },
    
    savePatient: async (patientData) => {
        console.log("API: Guardando nuevo paciente...", patientData);
        await new Promise(res => setTimeout(res, 500));

        const newPatient = {
            id: api._nextId++,
            ...patientData,
            fechaRegistro: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
        };
        api._pacientes.push(newPatient);
        
        return { success: true, data: newPatient };
    },
    
    deletePatient: async (patientId) => {
        console.log(`API: Eliminando paciente con ID: ${patientId}`);
        await new Promise(res => setTimeout(res, 500));
        
        const initialLength = api._pacientes.length;
        api._pacientes = api._pacientes.filter(p => p.id !== patientId);
        
        if (api._pacientes.length < initialLength) {
            return { success: true };
        } else {
            return { success: false, error: "Paciente no encontrado" };
        }
    }
};