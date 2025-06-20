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
app.use(express.static(path.join(__dirname, 'dist')))

// Rutas API
app.use('/api/patients', (await import('./api/routes/patients.js')).default)
app.use('/api/biophysics', (await import('./api/routes/biophysics.js')).default)
app.use('/api/boards', (await import('./api/routes/boards.js')).default)
app.use('/api/auth', (await import('./api/routes/auth.js')).default)

// Ruta para servir la aplicación
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
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
