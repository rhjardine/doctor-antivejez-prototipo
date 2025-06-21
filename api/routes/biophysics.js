import express from 'express'
import { PrismaClient } from '@prisma/client'
import { body, validationResult } from 'express-validator'

const router = express.Router()
const prisma = new PrismaClient()

// Validaciones para tests biofísicos
const biophysicsValidation = [
  body('pacienteId').notEmpty().withMessage('El ID del paciente es requerido'),
  body('genero').isIn(['masculino', 'femenino', 'masculino-deportivo', 'femenino-deportivo']).withMessage('Género inválido'),
  body('edadCronologica').isNumeric().withMessage('La edad cronológica debe ser un número')
]

// Rangos biofísicos para cálculos
const RANGOS_BIOFISICOS = {
  gruposEdad: [
    { min: 20, max: 24 },
    { min: 25, max: 29 },
    { min: 30, max: 34 },
    { min: 35, max: 39 },
    { min: 40, max: 44 },
    { min: 45, max: 49 },
    { min: 50, max: 54 },
    { min: 55, max: 59 },
    { min: 60, max: 64 },
    { min: 65, max: 69 },
    { min: 70, max: 74 },
    { min: 75, max: 79 },
    { min: 80, max: 84 },
    { min: 85, max: 89 }
  ],
  
  // Grasa masculina
  grasaMasculino: [
    [10, 14], [14, 18], [18, 22], [22, 26], [26, 30], [30, 34], [34, 38],
    [38, 42], [42, 46], [46, 50], [50, 54], [54, 58], [58, 62], [62, 66]
  ],
  
  // Grasa masculina deportiva
  grasaMasculinoDeportivo: [
    [5, 8], [8, 11], [11, 14], [14, 17], [17, 20], [20, 23], [23, 26],
    [26, 29], [29, 32], [32, 35], [35, 38], [38, 41], [41, 44], [44, 47]
  ],
  
  // Grasa femenina
  grasaFemenino: [
    [16, 20], [20, 24], [24, 28], [28, 32], [32, 36], [36, 40], [40, 44],
    [44, 48], [48, 52], [52, 56], [56, 60], [60, 64], [64, 68], [68, 72]
  ],
  
  // Grasa femenina deportiva
  grasaFemeninoDeportivo: [
    [12, 15], [15, 18], [18, 21], [21, 24], [24, 27], [27, 30], [30, 33],
    [33, 36], [36, 39], [39, 42], [42, 45], [45, 48], [48, 51], [51, 54]
  ],
  
  // IMC
  imc: [
    [18.5, 21], [21, 23], [23, 25], [25, 27], [27, 29], [29, 31], [31, 33],
    [33, 35], [35, 37], [37, 39], [39, 41], [41, 43], [43, 45], [45, 47]
  ],
  
  // Reflejos digitales (ms)
  reflejosDigitales: [
    [150, 170], [170, 190], [190, 210], [210, 230], [230, 250], [250, 270], [270, 290],
    [290, 310], [310, 330], [330, 350], [350, 370], [370, 390], [390, 410], [410, 430]
  ],
  
  // Acomodación visual (dioptrías)
  acomodacionVisual: [
    [12, 14], [10, 12], [8, 10], [6, 8], [4, 6], [3, 4], [2, 3],
    [1.5, 2], [1, 1.5], [0.8, 1], [0.6, 0.8], [0.4, 0.6], [0.2, 0.4], [0.1, 0.2]
  ],
  
  // Balance estático (segundos)
  balanceEstatico: [
    [60, 55], [55, 50], [50, 45], [45, 40], [40, 35], [35, 30], [30, 25],
    [25, 20], [20, 15], [15, 12], [12, 10], [10, 8], [8, 6], [6, 4]
  ],
  
  // Hidratación cutánea (%)
  hidratacionCutanea: [
    [4.5, 4], [4, 3.5], [3.5, 3], [3, 2.5], [2.5, 2], [2, 1.8], [1.8, 1.6],
    [1.6, 1.4], [1.4, 1.2], [1.2, 1], [1, 0.8], [0.8, 0.6], [0.6, 0.4], [0.4, 0.2]
  ],
  
  // Presión sistólica (mmHg)
  sistolica: [
    [110, 120], [120, 130], [130, 140], [140, 150], [150, 160], [160, 170], [170, 180],
    [180, 190], [190, 200], [200, 210], [210, 220], [220, 230], [230, 240], [240, 250]
  ],
  
  // Presión diastólica (mmHg)
  diastolica: [
    [60, 70], [70, 80], [80, 90], [90, 100], [100, 110], [110, 120], [120, 130],
    [130, 140], [140, 150], [150, 160], [160, 170], [170, 180], [180, 190], [190, 200]
  ]
}

// Función para encontrar el grupo de edad basado en el valor y parámetro
function encontrarGrupoEdad(valor, parametro, genero = null) {
  let rangos = []
  
  switch (parametro) {
    case 'grasa':
      if (genero === 'masculino') {
        rangos = RANGOS_BIOFISICOS.grasaMasculino
      } else if (genero === 'masculino-deportivo') {
        rangos = RANGOS_BIOFISICOS.grasaMasculinoDeportivo
      } else if (genero === 'femenino') {
        rangos = RANGOS_BIOFISICOS.grasaFemenino
      } else if (genero === 'femenino-deportivo') {
        rangos = RANGOS_BIOFISICOS.grasaFemeninoDeportivo
      } else {
        return null
      }
      break
    case 'imc':
      rangos = RANGOS_BIOFISICOS.imc
      break
    case 'reflejos':
      rangos = RANGOS_BIOFISICOS.reflejosDigitales
      break
    case 'acomodacion':
      rangos = RANGOS_BIOFISICOS.acomodacionVisual
      break
    case 'balance':
      rangos = RANGOS_BIOFISICOS.balanceEstatico
      break
    case 'hidratacion':
      rangos = RANGOS_BIOFISICOS.hidratacionCutanea
      break
    case 'sistolica':
      rangos = RANGOS_BIOFISICOS.sistolica
      break
    case 'diastolica':
      rangos = RANGOS_BIOFISICOS.diastolica
      break
    default:
      return null
  }
  
  // Buscar en qué rango cae el valor
  for (let i = 0; i < rangos.length; i++) {
    const [min, max] = rangos[i]
    if (valor >= min && valor <= max) {
      // Devolver la edad correspondiente al grupo
      const grupoEdad = RANGOS_BIOFISICOS.gruposEdad[i]
      return grupoEdad ? (grupoEdad.min + grupoEdad.max) / 2 : null
    }
  }
  
  return null // Valor fuera de rangos
}

// Función para calcular edad biofísica completa
function calcularEdadBiofisica(datos) {
  const edades = []
  
  // Calcular edad para cada parámetro
  if (datos.grasa && datos.genero) {
    const edad = encontrarGrupoEdad(datos.grasa, 'grasa', datos.genero)
    if (edad) edades.push(edad)
  }
  
  if (datos.imc) {
    const edad = encontrarGrupoEdad(datos.imc, 'imc')
    if (edad) edades.push(edad)
  }
  
  if (datos.reflejosPromedio) {
    const edad = encontrarGrupoEdad(datos.reflejosPromedio, 'reflejos')
    if (edad) edades.push(edad)
  }
  
  if (datos.acomodacion) {
    const edad = encontrarGrupoEdad(datos.acomodacion, 'acomodacion')
    if (edad) edades.push(edad)
  }
  
  if (datos.balancePromedio) {
    const edad = encontrarGrupoEdad(datos.balancePromedio, 'balance')
    if (edad) edades.push(edad)
  }
  
  if (datos.hidratacion) {
    const edad = encontrarGrupoEdad(datos.hidratacion, 'hidratacion')
    if (edad) edades.push(edad)
  }
  
  if (datos.sistolica) {
    const edad = encontrarGrupoEdad(datos.sistolica, 'sistolica')
    if (edad) edades.push(edad)
  }
  
  if (datos.diastolica) {
    const edad = encontrarGrupoEdad(datos.diastolica, 'diastolica')
    if (edad) edades.push(edad)
  }
  
  // Calcular promedio de edades
  if (edades.length === 0) {
    return null
  }
  
  const edadBiofisica = edades.reduce((sum, edad) => sum + edad, 0) / edades.length
  return Math.round(edadBiofisica * 10) / 10 // Redondear a 1 decimal
}

// GET /api/biophysics/patient/:patientId - Obtener tests biofísicos de un paciente
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params
    
    const tests = await prisma.biophysicsTest.findMany({
      where: { pacienteId: patientId },
      orderBy: { fecha: 'desc' },
      include: {
        paciente: {
          select: {
            nombres: true,
            apellidos: true,
            identificacion: true
          }
        }
      }
    })
    
    res.json(tests)
  } catch (error) {
    console.error('Error al obtener tests biofísicos:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /api/biophysics/:id - Obtener un test biofísico específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const test = await prisma.biophysicsTest.findUnique({
      where: { id },
      include: {
        paciente: {
          select: {
            nombres: true,
            apellidos: true,
            identificacion: true,
            genero: true,
            edadCronologica: true
          }
        }
      }
    })
    
    if (!test) {
      return res.status(404).json({ error: 'Test biofísico no encontrado' })
    }
    
    res.json(test)
  } catch (error) {
    console.error('Error al obtener test biofísico:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// POST /api/biophysics - Crear nuevo test biofísico
router.post('/', biophysicsValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    
    const {
      pacienteId,
      genero,
      grasa,
      imc,
      reflejosMed1,
      reflejosMed2,
      reflejosMed3,
      acomodacion,
      balanceMed1,
      balanceMed2,
      balanceMed3,
      hidratacion,
      sistolica,
      diastolica,
      pulsoReposo,
      edadCronologica
    } = req.body
    
    // Verificar que el paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id: pacienteId }
    })
    
    if (!patient) {
      return res.status(404).json({ error: 'Paciente no encontrado' })
    }
    
    // Calcular promedios
    const reflejosPromedio = (reflejosMed1 && reflejosMed2 && reflejosMed3) 
      ? (reflejosMed1 + reflejosMed2 + reflejosMed3) / 3 
      : null
      
    const balancePromedio = (balanceMed1 && balanceMed2 && balanceMed3)
      ? (balanceMed1 + balanceMed2 + balanceMed3) / 3
      : null
    
    // Calcular edades individuales
    const grasaEdadCalculada = grasa ? encontrarGrupoEdad(grasa, 'grasa', genero) : null
    const imcEdadCalculada = imc ? encontrarGrupoEdad(imc, 'imc') : null
    const reflejosEdadCalculada = reflejosPromedio ? encontrarGrupoEdad(reflejosPromedio, 'reflejos') : null
    const acomodacionEdadCalculada = acomodacion ? encontrarGrupoEdad(acomodacion, 'acomodacion') : null
    const balanceEdadCalculada = balancePromedio ? encontrarGrupoEdad(balancePromedio, 'balance') : null
    const hidratacionEdadCalculada = hidratacion ? encontrarGrupoEdad(hidratacion, 'hidratacion') : null
    const sistolicaEdadCalculada = sistolica ? encontrarGrupoEdad(sistolica, 'sistolica') : null
    const diastolicaEdadCalculada = diastolica ? encontrarGrupoEdad(diastolica, 'diastolica') : null
    
    // Calcular edad biofísica total
    const edadBiofisica = calcularEdadBiofisica({
      grasa,
      genero,
      imc,
      reflejosPromedio,
      acomodacion,
      balancePromedio,
      hidratacion,
      sistolica,
      diastolica
    })
    
    const edadDiferencial = edadBiofisica ? edadBiofisica - edadCronologica : null
    
    // Generar evaluación
    let evaluacion = 'Sin datos suficientes para evaluación'
    if (edadDiferencial !== null) {
      if (edadDiferencial <= -10) {
        evaluacion = 'Excelente estado físico, edad biológica significativamente menor'
      } else if (edadDiferencial <= -5) {
        evaluacion = 'Muy buen estado físico, edad biológica menor'
      } else if (edadDiferencial <= 0) {
        evaluacion = 'Buen estado físico, edad biológica acorde'
      } else if (edadDiferencial <= 5) {
        evaluacion = 'Estado físico regular, edad biológica ligeramente mayor'
      } else {
        evaluacion = 'Estado físico deficiente, edad biológica significativamente mayor'
      }
    }
    
    const test = await prisma.biophysicsTest.create({
      data: {
        pacienteId,
        genero,
        grasa,
        grasaEdadCalculada,
        imc,
        imcEdadCalculada,
        reflejosMed1,
        reflejosMed2,
        reflejosMed3,
        reflejosPromedio,
        reflejosEdadCalculada,
        acomodacion,
        acomodacionEdadCalculada,
        balanceMed1,
        balanceMed2,
        balanceMed3,
        balancePromedio,
        balanceEdadCalculada,
        hidratacion,
        hidratacionEdadCalculada,
        sistolica,
        sistolicaEdadCalculada,
        diastolica,
        diastolicaEdadCalculada,
        pulsoReposo,
        edadCronologica,
        edadBiofisica,
        edadDiferencial,
        evaluacion
      },
      include: {
        paciente: {
          select: {
            nombres: true,
            apellidos: true,
            identificacion: true
          }
        }
      }
    })
    
    res.status(201).json(test)
  } catch (error) {
    console.error('Error al crear test biofísico:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// PUT /api/biophysics/:id - Actualizar test biofísico
router.put('/:id', biophysicsValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    
    const { id } = req.params
    const {
      genero,
      grasa,
      imc,
      reflejosMed1,
      reflejosMed2,
      reflejosMed3,
      acomodacion,
      balanceMed1,
      balanceMed2,
      balanceMed3,
      hidratacion,
      sistolica,
      diastolica,
      pulsoReposo,
      edadCronologica
    } = req.body
    
    // Verificar que el test existe
    const existingTest = await prisma.biophysicsTest.findUnique({
      where: { id }
    })
    
    if (!existingTest) {
      return res.status(404).json({ error: 'Test biofísico no encontrado' })
    }
    
    // Calcular promedios
    const reflejosPromedio = (reflejosMed1 && reflejosMed2 && reflejosMed3) 
      ? (reflejosMed1 + reflejosMed2 + reflejosMed3) / 3 
      : null
      
    const balancePromedio = (balanceMed1 && balanceMed2 && balanceMed3)
      ? (balanceMed1 + balanceMed2 + balanceMed3) / 3
      : null
    
    // Calcular edades individuales
    const grasaEdadCalculada = grasa ? encontrarGrupoEdad(grasa, 'grasa', genero) : null
    const imcEdadCalculada = imc ? encontrarGrupoEdad(imc, 'imc') : null
    const reflejosEdadCalculada = reflejosPromedio ? encontrarGrupoEdad(reflejosPromedio, 'reflejos') : null
    const acomodacionEdadCalculada = acomodacion ? encontrarGrupoEdad(acomodacion, 'acomodacion') : null
    const balanceEdadCalculada = balancePromedio ? encontrarGrupoEdad(balancePromedio, 'balance') : null
    const hidratacionEdadCalculada = hidratacion ? encontrarGrupoEdad(hidratacion, 'hidratacion') : null
    const sistolicaEdadCalculada = sistolica ? encontrarGrupoEdad(sistolica, 'sistolica') : null
    const diastolicaEdadCalculada = diastolica ? encontrarGrupoEdad(diastolica, 'diastolica') : null
    
    // Calcular edad biofísica total
    const edadBiofisica = calcularEdadBiofisica({
      grasa,
      genero,
      imc,
      reflejosPromedio,
      acomodacion,
      balancePromedio,
      hidratacion,
      sistolica,
      diastolica
    })
    
    const edadDiferencial = edadBiofisica ? edadBiofisica - edadCronologica : null
    
    // Generar evaluación
    let evaluacion = 'Sin datos suficientes para evaluación'
    if (edadDiferencial !== null) {
      if (edadDiferencial <= -10) {
        evaluacion = 'Excelente estado físico, edad biológica significativamente menor'
      } else if (edadDiferencial <= -5) {
        evaluacion = 'Muy buen estado físico, edad biológica menor'
      } else if (edadDiferencial <= 0) {
        evaluacion = 'Buen estado físico, edad biológica acorde'
      } else if (edadDiferencial <= 5) {
        evaluacion = 'Estado físico regular, edad biológica ligeramente mayor'
      } else {
        evaluacion = 'Estado físico deficiente, edad biológica significativamente mayor'
      }
    }
    
    const test = await prisma.biophysicsTest.update({
      where: { id },
      data: {
        genero,
        grasa,
        grasaEdadCalculada,
        imc,
        imcEdadCalculada,
        reflejosMed1,
        reflejosMed2,
        reflejosMed3,
        reflejosPromedio,
        reflejosEdadCalculada,
        acomodacion,
        acomodacionEdadCalculada,
        balanceMed1,
        balanceMed2,
        balanceMed3,
        balancePromedio,
        balanceEdadCalculada,
        hidratacion,
        hidratacionEdadCalculada,
        sistolica,
        sistolicaEdadCalculada,
        diastolica,
        diastolicaEdadCalculada,
        pulsoReposo,
        edadCronologica,
        edadBiofisica,
        edadDiferencial,
        evaluacion
      },
      include: {
        paciente: {
          select: {
            nombres: true,
            apellidos: true,
            identificacion: true
          }
        }
      }
    })
    
    res.json(test)
  } catch (error) {
    console.error('Error al actualizar test biofísico:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// DELETE /api/biophysics/:id - Eliminar test biofísico
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const test = await prisma.biophysicsTest.findUnique({
      where: { id }
    })
    
    if (!test) {
      return res.status(404).json({ error: 'Test biofísico no encontrado' })
    }
    
    await prisma.biophysicsTest.delete({
      where: { id }
    })
    
    res.json({ message: 'Test biofísico eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar test biofísico:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
