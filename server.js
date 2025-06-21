import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Configuración de ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cargar variables de entorno
dotenv.config()

// Inicializar Prisma
const prisma = new PrismaClient()

// Crear aplicación Express
const app = express()
const PORT = process.env.PORT || 3001

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"]
    }
  }
}))

// Middleware CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))

// Middleware de compresión
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Demasiadas solicitudes desde esta IP'
})
app.use('/api/', limiter)

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)))
app.use('/css', express.static(path.join(__dirname, 'css')))
app.use('/js', express.static(path.join(__dirname, 'js')))
app.use('/assets', express.static(path.join(__dirname, 'assets')))

// Importar rutas
import patientsRouter from './api/routes/patients.js'
import biophysicsRouter from './api/routes/biophysics.js'
import boardsRouter from './api/routes/boards.js'
import authRouter from './api/routes/auth.js'

// Rutas API
app.use('/api/patients', patientsRouter)
app.use('/api/biophysics', biophysicsRouter)
app.use('/api/boards', boardsRouter)
app.use('/api/auth', authRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Ruta para servir la aplicación
app.get('*', (req, res) => {
  // Si es una ruta API que no existe, devolver 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint no encontrado' })
  }
  
  // Servir index.html para rutas SPA
  res.sendFile(path.join(__dirname, 'index.html'))
})

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Algo salió mal!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`📊 Prisma Studio: npx prisma studio`)
})

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('📝 Cerrando servidor...')
  await prisma.$disconnect()
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('📝 Cerrando servidor...')
  await prisma.$disconnect()
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente')
    process.exit(0)
  })
})

export default app
