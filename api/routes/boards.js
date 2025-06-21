import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/boards - Obtener todas las tablas de valores biofísicos
router.get('/', async (req, res) => {
  try {
    const { type, name } = req.query
    
    const where = {}
    if (type) where.type = type
    if (name) where.name = name
    
    const boards = await prisma.board.findMany({
      where,
      include: {
        range: true
      },
      orderBy: [
        { name: 'asc' },
        { rangeId: 'asc' }
      ]
    })
    
    res.json(boards)
  } catch (error) {
    console.error('Error al obtener boards:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /api/boards/ranges - Obtener todos los rangos de edad
router.get('/ranges', async (req, res) => {
  try {
    const ranges = await prisma.range.findMany({
      where: { active: true },
      orderBy: { minAge: 'asc' },
      include: {
        boards: true
      }
    })
    
    res.json(ranges)
  } catch (error) {
    console.error('Error al obtener rangos:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /api/boards/by-metric/:metricName - Obtener boards por nombre de métrica
router.get('/by-metric/:metricName', async (req, res) => {
  try {
    const { metricName } = req.params
    
    const boards = await prisma.board.findMany({
      where: { 
        name: metricName,
        type: 'FORM_BIOPHYSICS'
      },
      include: {
        range: true
      },
      orderBy: { rangeId: 'asc' }
    })
    
    if (boards.length === 0) {
      return res.status(404).json({ error: 'Métrica no encontrada' })
    }
    
    res.json(boards)
  } catch (error) {
    console.error('Error al obtener boards por métrica:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
