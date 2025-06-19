// Base de datos en memoria
let pacientesDB = [
    {
        id: '1',
        foto: null,
        nacionalidad: 'venezolano',
        identificacion: 'V-12431453',
        fechaHistoria: '2025-06-12',
        apellidos: 'Jardine Romero',
        nombres: 'Richard Hans',
        fechaNacimiento: '1975-03-15',
        edadCronologica: 50,
        genero: 'masculino',
        lugarNacimiento: 'Caracas, Venezuela',
        telefono: '+58-414-2809270',
        estadoCivil: 'casado',
        profesion: 'Ingeniero de Software',
        paisResidencia: 'Venezuela',
        estadoResidencia: 'Miranda',
        ciudad: 'Caracas',
        direccion: 'Av. Principal, Edificio X, Piso Y, Apto Z, Ciudad, Estado',
        observaciones: 'Paciente con antecedentes de hipertensión controlada.',
        fechaCreacion: '2025-06-12',
        email: 'rhjardine@gmail.com'
    },
    {
        id: '2',
        foto: null,
        nacionalidad: 'venezolano',
        identificacion: 'V-10811971',
        fechaHistoria: '2025-06-12',
        apellidos: 'Freites Flores',
        nombres: 'Anibal Gerardo',
        fechaNacimiento: '1973-08-22',
        edadCronologica: 52,
        genero: 'masculino',
        lugarNacimiento: 'Valencia, Venezuela',
        telefono: '+58-414-1234567',
        estadoCivil: 'soltero',
        profesion: 'Médico Especialista',
        paisResidencia: 'Venezuela',
        estadoResidencia: 'Carabobo',
        ciudad: 'Valencia',
        direccion: 'Calle Principal, Urbanización Los Médicos',
        observaciones: 'Paciente activo, practica deportes regularmente.',
        fechaCreacion: '2025-06-12',
        email: 'afestetica@gmail.com'
    }
];

// Base de datos de tests biofísicos
let testsBiofisicosDB = [
    {
        id: '1',
        pacienteId: '1',
        fecha: '2025-06-12',
        genero: 'masculino',
        grasa: { valor: 15.5, edadCalculada: 35 },
        imc: { valor: 24.2, edadCalculada: 32 },
        reflejos: { 
            medicion1: 25, 
            medicion2: 23, 
            medicion3: 27, 
            promedio: 25, 
            edadCalculada: 38 
        },
        acomodacion: { valor: 15, edadCalculada: 40 },
        balance: { 
            medicion1: 45, 
            medicion2: 48, 
            medicion3: 42, 
            promedio: 45, 
            edadCalculada: 35 
        },
        hidratacion: { valor: 2.5, edadCalculada: 33 },
        sistolica: { valor: 125, edadCalculada: 36 },
        diastolica: { valor: 80, edadCalculada: 34 },
        edadCronologica: 50,
        edadBiofisica: 35.4,
        edadDiferencial: -14.6,
        evaluacion: 'Excelente estado físico, edad biológica significativamente menor'
    },
    {
        id: '2',
        pacienteId: '2',
        fecha: '2025-06-12',
        genero: 'masculino',
        grasa: { valor: 12.8, edadCalculada: 30 },
        imc: { valor: 23.1, edadCalculada: 28 },
        reflejos: { 
            medicion1: 20, 
            medicion2: 22, 
            medicion3: 18, 
            promedio: 20, 
            edadCalculada: 32 
        },
        acomodacion: { valor: 12, edadCalculada: 35 },
        balance: { 
            medicion1: 50, 
            medicion2: 52, 
            medicion3: 48, 
            promedio: 50, 
            edadCalculada: 30 
        },
        hidratacion: { valor: 2.0, edadCalculada: 28 },
        sistolica: { valor: 120, edadCalculada: 32 },
        diastolica: { valor: 75, edadCalculada: 30 },
        edadCronologica: 52,
        edadBiofisica: 30.6,
        edadDiferencial: -21.4,
        evaluacion: 'Estado físico excepcional, mantiene condición de atleta'
    }
];

// Contadores para IDs únicos
let nextPacienteId = 3;
let nextTestId = 3;

// ===== FUNCIONES DE UTILIDAD =====

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    
    return edad;
}

function formatearFecha(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
}

function formatearFechaISO(fecha) {
    if (!fecha) return '';
    const [dia, mes, año] = fecha.split('/');
    return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

// ===== SIMULACIÓN DE DELAY DE RED =====
function simulateNetworkDelay(min = 200, max = 800) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

// ===== API DE PACIENTES =====

const PacientesAPI = {
    // Obtener todos los pacientes
    async getAll() {
        await simulateNetworkDelay();
        
        return {
            success: true,
            data: pacientesDB.map(paciente => ({
                ...paciente,
                fechaHistoriaFormateada: formatearFecha(paciente.fechaHistoria),
                fechaNacimientoFormateada: formatearFecha(paciente.fechaNacimiento),
                fechaCreacionFormateada: formatearFecha(paciente.fechaCreacion)
            })),
            total: pacientesDB.length
        };
    },

    // Obtener paciente por ID
    async getById(id) {
        await simulateNetworkDelay();
        
        const paciente = pacientesDB.find(p => p.id === id);
        
        if (!paciente) {
            return {
                success: false,
                error: 'Paciente no encontrado',
                data: null
            };
        }

        return {
            success: true,
            data: {
                ...paciente,
                fechaHistoriaFormateada: formatearFecha(paciente.fechaHistoria),
                fechaNacimientoFormateada: formatearFecha(paciente.fechaNacimiento),
                fechaCreacionFormateada: formatearFecha(paciente.fechaCreacion)
            }
        };
    },

    // Crear nuevo paciente
    async create(datos) {
        await simulateNetworkDelay();

        try {
            // Validar datos requeridos
            const camposRequeridos = ['apellidos', 'nombres', 'fechaNacimiento', 'genero', 'identificacion'];
            const camposFaltantes = camposRequeridos.filter(campo => !datos[campo]);
            
            if (camposFaltantes.length > 0) {
                return {
                    success: false,
                    error: `Campos requeridos faltantes: ${camposFaltantes.join(', ')}`,
                    data: null
                };
            }

            // Verificar identificación única
            const identificacionExiste = pacientesDB.some(p => p.identificacion === datos.identificacion);
            if (identificacionExiste) {
                return {
                    success: false,
                    error: 'Ya existe un paciente con esta identificación',
                    data: null
                };
            }

            // Calcular edad cronológica
            const edadCronologica = calcularEdad(datos.fechaNacimiento);

            // Crear nuevo paciente
            const nuevoPaciente = {
                id: generateId(),
                ...datos,
                edadCronologica,
                fechaCreacion: new Date().toISOString().split('T')[0],
                fechaHistoria: datos.fechaHistoria || new Date().toISOString().split('T')[0]
            };

            // Agregar a la base de datos
            pacientesDB.push(nuevoPaciente);

            return {
                success: true,
                data: nuevoPaciente,
                message: 'Paciente creado exitosamente'
            };

        } catch (error) {
            return {
                success: false,
                error: 'Error interno al crear paciente',
                data: null
            };
        }
    },

    // Actualizar paciente
    async update(id, datos) {
        await simulateNetworkDelay();

        try {
            const index = pacientesDB.findIndex(p => p.id === id);
            
            if (index === -1) {
                return {
                    success: false,
                    error: 'Paciente no encontrado',
                    data: null
                };
            }

            // Recalcular edad si se cambió la fecha de nacimiento
            if (datos.fechaNacimiento) {
                datos.edadCronologica = calcularEdad(datos.fechaNacimiento);
            }

            // Actualizar paciente
            pacientesDB[index] = { ...pacientesDB[index], ...datos };

            return {
                success: true,
                data: pacientesDB[index],
                message: 'Paciente actualizado exitosamente'
            };

        } catch (error) {
            return {
                success: false,
                error: 'Error interno al actualizar paciente',
                data: null
            };
        }
    },

    // Eliminar paciente
    async delete(id) {
        await simulateNetworkDelay();

        try {
            const index = pacientesDB.findIndex(p => p.id === id);
            
            if (index === -1) {
                return {
                    success: false,
                    error: 'Paciente no encontrado',
                    data: null
                };
            }

            // Eliminar también sus tests biofísicos
            testsBiofisicosDB = testsBiofisicosDB.filter(t => t.pacienteId !== id);

            // Eliminar paciente
            const pacienteEliminado = pacientesDB.splice(index, 1)[0];

            return {
                success: true,
                data: pacienteEliminado,
                message: 'Paciente eliminado exitosamente'
            };

        } catch (error) {
            return {
                success: false,
                error: 'Error interno al eliminar paciente',
                data: null
            };
        }
    },

    // Buscar pacientes
    async search(termino) {
        await simulateNetworkDelay();

        const terminoLower = termino.toLowerCase();
        const resultados = pacientesDB.filter(paciente => 
            paciente.nombres.toLowerCase().includes(terminoLower) ||
            paciente.apellidos.toLowerCase().includes(terminoLower) ||
            paciente.identificacion.toLowerCase().includes(terminoLower) ||
            paciente.email?.toLowerCase().includes(terminoLower)
        );

        return {
            success: true,
            data: resultados,
            total: resultados.length
        };
    }
};

// ===== API DE TESTS BIOFÍSICOS =====

const TestsBiofisicosAPI = {
    // Obtener tests por paciente
    async getByPacienteId(pacienteId) {
        await simulateNetworkDelay();
        
        const tests = testsBiofisicosDB.filter(test => test.pacienteId === pacienteId);
        
        return {
            success: true,
            data: tests.map(test => ({
                ...test,
                fechaFormateada: formatearFecha(test.fecha)
            }))
        };
    },

    // Obtener test por ID
    async getById(id) {
        await simulateNetworkDelay();
        
        const test = testsBiofisicosDB.find(t => t.id === id);
        
        if (!test) {
            return {
                success: false,
                error: 'Test no encontrado',
                data: null
            };
        }

        return {
            success: true,
            data: test
        };
    },

    // Crear nuevo test biofísico
    async create(datos) {
        await simulateNetworkDelay();

        try {
            const nuevoTest = {
                id: generateId(),
                ...datos,
                fecha: datos.fecha || new Date().toISOString().split('T')[0]
            };

            testsBiofisicosDB.push(nuevoTest);

            return {
                success: true,
                data: nuevoTest,
                message: 'Test biofísico guardado exitosamente'
            };

        } catch (error) {
            return {
                success: false,
                error: 'Error interno al guardar test',
                data: null
            };
        }
    },

    // Actualizar test biofísico
    async update(id, datos) {
        await simulateNetworkDelay();

        try {
            const index = testsBiofisicosDB.findIndex(t => t.id === id);
            
            if (index === -1) {
                return {
                    success: false,
                    error: 'Test no encontrado',
                    data: null
                };
            }

            testsBiofisicosDB[index] = { ...testsBiofisicosDB[index], ...datos };

            return {
                success: true,
                data: testsBiofisicosDB[index],
                message: 'Test actualizado exitosamente'
            };

        } catch (error) {
            return {
                success: false,
                error: 'Error interno al actualizar test',
                data: null
            };
        }
    },

    // Eliminar test biofísico
    async delete(id) {
        await simulateNetworkDelay();

        try {
            const index = testsBiofisicosDB.findIndex(t => t.id === id);
            
            if (index === -1) {
                return {
                    success: false,
                    error: 'Test no encontrado',
                    data: null
                };
            }

            const testEliminado = testsBiofisicosDB.splice(index, 1)[0];

            return {
                success: true,
                data: testEliminado,
                message: 'Test eliminado exitosamente'
            };

        } catch (error) {
            return {
                success: false,
                error: 'Error interno al eliminar test',
                data: null
            };
        }
    }
};

// ===== API DE ESTADÍSTICAS =====

const EstadisticasAPI = {
    async getDashboardStats() {
        await simulateNetworkDelay();

        const totalPacientes = pacientesDB.length;
        const totalTests = testsBiofisicosDB.length;
        
        // Calcular edad biológica promedio
        const testsConEdad = testsBiofisicosDB.filter(t => t.edadBiofisica);
        const edadBiologicaPromedio = testsConEdad.length > 0 
            ? testsConEdad.reduce((sum, t) => sum + t.edadBiofisica, 0) / testsConEdad.length 
            : 0;

        // Pacientes registrados este mes
        const fechaActual = new Date();
        const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
        const pacientesEsteMes = pacientesDB.filter(p => 
            new Date(p.fechaCreacion) >= inicioMes
        ).length;

        return {
            success: true,
            data: {
                totalPacientes,
                pacientesNuevos: pacientesEsteMes,
                edadBiologicaPromedio: Math.round(edadBiologicaPromedio * 10) / 10,
                totalTests
            }
        };
    },

    async getChartData() {
        await simulateNetworkDelay();

        // Datos simulados para gráficos
        return {
            success: true,
            data: {
                pacientesActivos: [
                    { periodo: 'Q1 23', activos: 70, oncoardio: 50 },
                    { periodo: 'Q2 23', activos: 85, oncoardio: 60 },
                    { periodo: 'Q3 23', activos: 95, oncoardio: 70 },
                    { periodo: 'Q4 23', activos: 110, oncoardio: 85 },
                    { periodo: 'Q1 24', activos: 125, oncoardio: 95 }
                ],
                edadBiologica: {
                    cronologica: [40, 45, 50, 55, 60, 65, 70, 75],
                    biologica: [35, 42, 48, 52, 55, 58, 62, 68]
                },
                distribucionPorGrupos: [
                    { grupo: '20-30', pacientes: 15 },
                    { grupo: '30-40', pacientes: 25 },
                    { grupo: '40-50', pacientes: 30 },
                    { grupo: '50-60', pacientes: 20 },
                    { grupo: '60+', pacientes: 10 }
                ]
            }
        };
    }
};

// ===== TABLAS DE RANGOS BIOFÍSICOS =====

const RANGOS_BIOFISICOS = {
    // Rangos de edad por grupos
    gruposEdad: [
        { min: 21, max: 28, grupo: 0 },
        { min: 28, max: 35, grupo: 1 },
        { min: 35, max: 42, grupo: 2 },
        { min: 42, max: 49, grupo: 3 },
        { min: 49, max: 56, grupo: 4 },
        { min: 56, max: 63, grupo: 5 },
        { min: 63, max: 70, grupo: 6 },
        { min: 70, max: 77, grupo: 7 },
        { min: 77, max: 84, grupo: 8 },
        { min: 84, max: 91, grupo: 9 },
        { min: 91, max: 98, grupo: 10 },
        { min: 98, max: 105, grupo: 11 },
        { min: 105, max: 112, grupo: 12 },
        { min: 112, max: 120, grupo: 13 }
    ],

    // Rangos para % de grasa masculino
    grasaMasculino: [
        [10, 14], [14, 18], [18, 21], [21, 24], [24, 27], [27, 30], [30, 33],
        [33, 36], [36, 39], [39, 42], [42, 45], [45, 48], [48, 51], [51, 54]
    ],

    // Rangos para % de grasa masculino deportivo
    grasaMasculinoDeportivo: [
        [1, 7], [7, 14], [14, 17], [17, 21], [21, 25], [25, 28], [28, 31],
        [31, 34], [34, 37], [37, 40], [40, 43], [43, 46], [46, 49], [49, 52]
    ],

    // Rangos para % de grasa femenino
    grasaFemenino: [
        [18, 22], [22, 26], [26, 29], [29, 32], [32, 35], [35, 38], [38, 41],
        [41, 44], [44, 47], [47, 50], [50, 53], [53, 56], [56, 59], [59, 62]
    ],

    // Rangos para % de grasa femenino deportivo
    grasaFemeninoDeportivo: [
        [1, 9], [9, 18], [18, 22], [22, 25], [25, 27], [27, 30], [30, 33],
        [33, 36], [36, 39], [39, 42], [42, 45], [45, 48], [48, 51], [51, 54]
    ],

    // Rangos para IMC
    imc: [
        [18, 22], [22, 25], [25, 27], [27, 30], [30, 33], [33, 36], [36, 39],
        [39, 42], [42, 45], [45, 48], [48, 51], [51, 54], [54, 57], [57, 60]
    ],

    // Rangos para reflejos digitales (cm)
    reflejosDigitales: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 6], [6, 8], [8, 10], [10, 15],
        [15, 20], [20, 25], [25, 30], [30, 35], [35, 45], [45, 50]
    ],

    // Rangos para acomodación visual (cm)
    acomodacionVisual: [
        [0, 10], [10, 15], [15, 18], [18, 21], [21, 24], [24, 27], [27, 30],
        [30, 33], [33, 37], [37, 40], [40, 43], [43, 47], [47, 50], [50, 53]
    ],

    // Rangos para balance estático (seg)
    balanceEstatico: [
        [120, 999], [30, 120], [25, 30], [20, 25], [15, 20], [12, 15], [9, 12],
        [7, 9], [6, 7], [5, 6], [4, 5], [3, 4], [2, 3], [1, 2]
    ],

    // Rangos para hidratación cutánea (seg)
    hidratacionCutanea: [
        [0, 1], [1, 2], [2, 4], [4, 8], [8, 16], [16, 32], [32, 64],
        [64, 74], [74, 84], [84, 94], [94, 104], [104, 108], [108, 112], [112, 120]
    ],

    // Rangos para tensión arterial sistólica (mmHg)
    sistolica: [
        [100, 110], [110, 120], [120, 130], [130, 140], [140, 150], [150, 160],
        [160, 170], [170, 180], [180, 190], [190, 200], [200, 210], [210, 220],
        [220, 230], [230, 240]
    ],

    // Rangos para tensión arterial diastólica (mmHg)
    diastolica: [
        [60, 65], [65, 70], [70, 75], [75, 80], [80, 85], [85, 90], [90, 95],
        [95, 100], [100, 110], [110, 120], [120, 130], [130, 140], [140, 150], [150, 160]
    ]
};

// ===== CALCULADORA DE EDAD BIOFÍSICA =====

const BiofisicoCalculator = {
    // Encontrar grupo de edad para un valor
    encontrarGrupoEdad(valor, parametro, genero = null) {
        let rangos;
        
        switch (parametro) {
            case 'grasa':
                if (genero === 'masculino') {
                    rangos = RANGOS_BIOFISICOS.grasaMasculino;
                } else if (genero === 'masculino-deportivo') {
                    rangos = RANGOS_BIOFISICOS.grasaMasculinoDeportivo;
                } else if (genero === 'femenino') {
                    rangos = RANGOS_BIOFISICOS.grasaFemenino;
                } else if (genero === 'femenino-deportivo') {
                    rangos = RANGOS_BIOFISICOS.grasaFemeninoDeportivo;
                } else {
                    return null;
                }
                break;
            case 'imc':
                rangos = RANGOS_BIOFISICOS.imc;
                break;
            case 'reflejos':
                rangos = RANGOS_BIOFISICOS.reflejosDigitales;
                break;
            case 'acomodacion':
                rangos = RANGOS_BIOFISICOS.acomodacionVisual;
                break;
            case 'balance':
                rangos = RANGOS_BIOFISICOS.balanceEstatico;
                break;
            case 'hidratacion':
                rangos = RANGOS_BIOFISICOS.hidratacionCutanea;
                break;
            case 'sistolica':
                rangos = RANGOS_BIOFISICOS.sistolica;
                break;
            case 'diastolica':
                rangos = RANGOS_BIOFISICOS.diastolica;
                break;
            default:
                return null;
        }

        // Buscar en qué rango cae el valor
        for (let i = 0; i < rangos.length; i++) {
            const [min, max] = rangos[i];
            if (valor >= min && valor <= max) {
                // Devolver la edad correspondiente al grupo
                const grupoEdad = RANGOS_BIOFISICOS.gruposEdad[i];
                return grupoEdad ? (grupoEdad.min + grupoEdad.max) / 2 : null;
            }
        }

        return null; // Valor fuera de rangos
    },

    // Calcular edad biofísica completa
    calcularEdadBiofisica(datos) {
        const edades = [];
        
        // Calcular edad para cada parámetro
        if (datos.grasa?.valor && datos.genero) {
            const edad = this.encontrarGrupoEdad(datos.grasa.valor, 'grasa', datos.genero);
            if (edad) edades.push(edad);
        }

        if (datos.imc?.valor) {
            const edad = this.encontrarGrupoEdad(datos.imc.valor, 'imc');
            if (edad) edades.push(edad);
        }

        if (datos.reflejos?.promedio) {
            const edad = this.encontrarGrupoEdad(datos.reflejos.promedio, 'reflejos');
            if (edad) edades.push(edad);
        }

        if (datos.acomodacion?.valor) {
            const edad = this.encontrarGrupoEdad(datos.acomodacion.valor, 'acomodacion');
            if (edad) edades.push(edad);
        }

        if (datos.balance?.promedio) {
            const edad = this.encontrarGrupoEdad(datos.balance.promedio, 'balance');
            if (edad) edades.push(edad);
        }

        if (datos.hidratacion?.valor) {
            const edad = this.encontrarGrupoEdad(datos.hidratacion.valor, 'hidratacion');
            if (edad) edades.push(edad);
        }

        if (datos.sistolica?.valor) {
            const edad = this.encontrarGrupoEdad(datos.sistolica.valor, 'sistolica');
            if (edad) edades.push(edad);
        }

        if (datos.diastolica?.valor) {
            const edad = this.encontrarGrupoEdad(datos.diastolica.valor, 'diastolica');
            if (edad) edades.push(edad);
        }

        // Calcular promedio de edades
        if (edades.length === 0) {
            return null;
        }

        const edadBiofisica = edades.reduce((sum, edad) => sum + edad, 0) / edades.length;
        return Math.round(edadBiofisica * 10) / 10; // Redondear a 1 decimal
    }
};

// ===== EXPORTACIÓN DE LA API =====

// Hacer disponibles las funciones globalmente
window.PacientesAPI = PacientesAPI;
window.TestsBiofisicosAPI = TestsBiofisicosAPI;
window.EstadisticasAPI = EstadisticasAPI;
window.BiofisicoCalculator = BiofisicoCalculator;

// Utilidades globales
window.calcularEdad = calcularEdad;
window.formatearFecha = formatearFecha;
window.formatearFechaISO = formatearFechaISO;
window.generateId = generateId;

console.log('📊 API.js cargado correctamente');
console.log(`📋 Pacientes en BD: ${pacientesDB.length}`);
console.log(`🧪 Tests biofísicos en BD: ${testsBiofisicosDB.length}`);