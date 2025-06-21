import express from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'

const router = express.Router()
const prisma = new PrismaClient()

// Validaciones
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
]

const registerValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('firstName').notEmpty().withMessage('El nombre es requerido'),
  body('lastName').notEmpty().withMessage('El apellido es requerido')
]

// POST /api/auth/login - Iniciar sesión
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    )

    // Crear sesión
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    })

    // Respuesta sin contraseña
    const { password: _, ...userWithoutPassword } = user

    res.json({
      user: userWithoutPassword,
      token,
      expiresAt
    })

  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, firstName, lastName, role = 'DOCTOR' } = req.body

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role
      }
    })

    // Respuesta sin contraseña
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (token) {
      // Eliminar sesión
      await prisma.session.deleteMany({
        where: { token }
      })
    }

    res.json({ message: 'Sesión cerrada exitosamente' })

  } catch (error) {
    console.error('Error en logout:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')

    // Verificar sesión
    const session = await prisma.session.findUnique({
      where: { token }
    })

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Token expirado' })
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }

    // Respuesta sin contraseña
    const { password: _, ...userWithoutPassword } = user

    res.json(userWithoutPassword)

  } catch (error) {
    console.error('Error al obtener usuario:', error)
    res.status(401).json({ error: 'Token inválido' })
  }
})

// Middleware para verificar autenticación
export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')

    // Verificar sesión
    const session = await prisma.session.findUnique({
      where: { token }
    })

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Token expirado' })
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }

    req.user = user
    next()

  } catch (error) {
    console.error('Error en autenticación:', error)
    res.status(401).json({ error: 'Token inválido' })
  }
}

export default router
