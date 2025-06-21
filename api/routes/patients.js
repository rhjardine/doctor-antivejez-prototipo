import express from 'express'
import { PrismaClient } from '@prisma/client'
import { body, validationResult } from 'express-validator'

const router = express.Router()
const prisma = new PrismaClient()

// Validaciones para pacientes
const patientValidation = [
  body('nombres').notEmpty().withMessage('El nombre es requerido'),
  body('apellidos').notEmpty().withMessage('Los apellidos son requeridos'),
  body('identificacion').notEmpty().withMessage('La identificación es requerida'),
  body('fechaNacimiento').isISO8601().withMessage('Fecha de nacimiento inválida'),
  body('genero').isIn(['masculino', 'femenino']).withMessage('Género inválido'),
  body('nacionalidad').notEmpty().withMessage('La nacionalidad es requerida'),
  body('paisResidencia').notEmpty().withMessage('El país de residencia es requerido'),
  body('estadoResidencia').notEmpty().withMessage('El estado de residencia es requerido'),
  body('ciudad').notEmpty().withMessage('La ciudad es requerida')
]

// Función para calcular edad
function calcularEdad(fechaNacimiento) {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mesActual = hoy.getMonth()
  const mesNacimiento = nacimiento.getMonth()
  
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  
  return edad
}

// GET /api/patients - Obtener todos los pacientes
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const where = search ? {
      OR: [
        { nombres: { contains: search, mode: 'insensitive' } },
        { apellidos: { contains: search, mode: 'insensitive' } },
        { identificacion: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {}
    
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { fechaCreacion: 'desc' },
        include: {
          testsBiofisicos: {
            orderBy: { fecha: 'desc' },
            take: 1
          }
        }
      }),
      prisma.patient.count({ where })
    ])
    
    res.json({
      patients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error al obtener pacientes:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /api/patients/:id - Obtener un paciente específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        testsBiofisicos: {
          orderBy: { fecha: 'desc' }
        }
      }
    })
    
    if (!patient) {
      return res.status(404).json({ error: 'Paciente no encontrado' })
    }
    
    res.json(patient)
  } catch (error) {
    console.error('Error al obtener paciente:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// POST /api/patients - Crear nuevo paciente
router.post('/', patientValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    
    const {
      foto,
      nacionalidad,
      identificacion,
      apellidos,
      nombres,
      fechaNacimiento,
      genero,
      lugarNacimiento,
      telefono,
      estadoCivil,
      profesion,
      paisResidencia,
      estadoResidencia,
      ciudad,
      direccion,
      observaciones,
      email
    } = req.body
    
    // Verificar si ya existe un paciente con esa identificación
    const existingPatient = await prisma.patient.findUnique({
      where: { identificacion }
    })
    
    if (existingPatient) {
      return res.status(400).json({ error: 'Ya existe un paciente con esa identificación' })
    }
    
    // Calcular edad cronológica
    const edadCronologica = calcularEdad(fechaNacimiento)
    
    const patient = await prisma.patient.create({
      data: {
        foto,
        nacionalidad,
        identificacion,
        apellidos,
        nombres,
        fechaNacimiento: new Date(fechaNacimiento),
        edadCronologica,
        genero,
        lugarNacimiento,
        telefono,
        estadoCivil,
        profesion,
        paisResidencia,
        estadoResidencia,
        ciudad,
        direccion,
        observaciones,
        email
      }
    })
    
    res.status(201).json(patient)
  } catch (error) {
    console.error('Error al crear paciente:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// PUT /api/patients/:id - Actualizar paciente
router.put('/:id', patientValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    
    const { id } = req.params
    const {
      foto,
      nacionalidad,
      identificacion,
      apellidos,
      nombres,
      fechaNacimiento,
      genero,
      lugarNacimiento,
      telefono,
      estadoCivil,
      profesion,
      paisResidencia,
      estadoResidencia,
      ciudad,
      direccion,
      observaciones,
      email
    } = req.body
    
    // Verificar si el paciente existe
    const existingPatient = await prisma.patient.findUnique({
      where: { id }
    })
    
    if (!existingPatient) {
      return res.status(404).json({ error: 'Paciente no encontrado' })
    }
    
    // Verificar si la identificación ya existe en otro paciente
    if (identificacion !== existingPatient.identificacion) {
      const duplicatePatient = await prisma.patient.findUnique({
        where: { identificacion }
      })
      
      if (duplicatePatient) {
        return res.status(400).json({ error: 'Ya existe un paciente con esa identificación' })
      }
    }
    
    // Calcular edad cronológica
    const edadCronologica = calcularEdad(fechaNacimiento)
    
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        foto,
        nacionalidad,
        identificacion,
        apellidos,
        nombres,
        fechaNacimiento: new Date(fechaNacimiento),
        edadCronologica,
        genero,
        lugarNacimiento,
        telefono,
        estadoCivil,
        profesion,
        paisResidencia,
        estadoResidencia,
        ciudad,
        direccion,
        observaciones,
        email
      }
    })
    
    res.json(patient)
  } catch (error) {
    console.error('Error al actualizar paciente:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// DELETE /api/patients/:id - Eliminar paciente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const patient = await prisma.patient.findUnique({
      where: { id }
    })
    
    if (!patient) {
      return res.status(404).json({ error: 'Paciente no encontrado' })
    }
    
    await prisma.patient.delete({
      where: { id }
    })
    
    res.json({ message: 'Paciente eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar paciente:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
