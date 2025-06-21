import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...')

  // Crear rangos de edad
  console.log('📊 Creando rangos de edad...')
  const ranges = await Promise.all([
    prisma.range.create({ data: { name: 'Rango 1', minAge: 20, maxAge: 24, description: '20-24 años' } }),
    prisma.range.create({ data: { name: 'Rango 2', minAge: 25, maxAge: 29, description: '25-29 años' } }),
    prisma.range.create({ data: { name: 'Rango 3', minAge: 30, maxAge: 34, description: '30-34 años' } }),
    prisma.range.create({ data: { name: 'Rango 4', minAge: 35, maxAge: 39, description: '35-39 años' } }),
    prisma.range.create({ data: { name: 'Rango 5', minAge: 40, maxAge: 44, description: '40-44 años' } }),
    prisma.range.create({ data: { name: 'Rango 6', minAge: 45, maxAge: 49, description: '45-49 años' } }),
    prisma.range.create({ data: { name: 'Rango 7', minAge: 50, maxAge: 54, description: '50-54 años' } }),
    prisma.range.create({ data: { name: 'Rango 8', minAge: 55, maxAge: 59, description: '55-59 años' } }),
    prisma.range.create({ data: { name: 'Rango 9', minAge: 60, maxAge: 64, description: '60-64 años' } }),
    prisma.range.create({ data: { name: 'Rango 10', minAge: 65, maxAge: 69, description: '65-69 años' } }),
    prisma.range.create({ data: { name: 'Rango 11', minAge: 70, maxAge: 74, description: '70-74 años' } }),
    prisma.range.create({ data: { name: 'Rango 12', minAge: 75, maxAge: 79, description: '75-79 años' } }),
    prisma.range.create({ data: { name: 'Rango 13', minAge: 80, maxAge: 84, description: '80-84 años' } }),
    prisma.range.create({ data: { name: 'Rango 14', minAge: 85, maxAge: 89, description: '85-89 años' } })
  ])

  console.log(`✅ Creados ${ranges.length} rangos de edad`)

  // Crear boards para grasa masculina
  console.log('💪 Creando boards para grasa masculina...')
  const grasaMasculinaData = [
    [10, 14], [14, 18], [18, 22], [22, 26], [26, 30], [30, 34], [34, 38],
    [38, 42], [42, 46], [46, 50], [50, 54], [54, 58], [58, 62], [62, 66]
  ]

  for (let i = 0; i < grasaMasculinaData.length; i++) {
    await prisma.board.create({
      data: {
        rangeId: ranges[i].id,
        type: 'FORM_BIOPHYSICS',
        name: 'male_fat',
        min: grasaMasculinaData[i][0],
        max: grasaMasculinaData[i][1],
        inverse: true
      }
    })
  }

  // Crear boards para grasa masculina deportiva
  console.log('🏃‍♂️ Creando boards para grasa masculina deportiva...')
  const grasaMasculinaDeportivaData = [
    [5, 8], [8, 11], [11, 14], [14, 17], [17, 20], [20, 23], [23, 26],
    [26, 29], [29, 32], [32, 35], [35, 38], [38, 41], [41, 44], [44, 47]
  ]

  for (let i = 0; i < grasaMasculinaDeportivaData.length; i++) {
    await prisma.board.create({
      data: {
        rangeId: ranges[i].id,
        type: 'FORM_BIOPHYSICS',
        name: 'sporty_male_fat',
        min: grasaMasculinaDeportivaData[i][0],
        max: grasaMasculinaDeportivaData[i][1],
        inverse: true
      }
    })
  }

  // Crear boards para grasa femenina
  console.log('👩 Creando boards para grasa femenina...')
  const grasaFemeninaData = [
    [16, 20], [20, 24], [24, 28], [28, 32], [32, 36], [36, 40], [40, 44],
    [44, 48], [48, 52], [52, 56], [56, 60], [60, 64], [64, 68], [68, 72]
  ]

  for (let i = 0; i < grasaFemeninaData.length; i++) {
    await prisma.board.create({
      data: {
        rangeId: ranges[i].id,
        type: 'FORM_BIOPHYSICS',
        name: 'female_fat',
        min: grasaFemeninaData[i][0],
        max: grasaFemeninaData[i][1],
        inverse: true
      }
    })
  }

  // Crear boards para grasa femenina deportiva
  console.log('🏃‍♀️ Creando boards para grasa femenina deportiva...')
  const grasaFemeninaDeportivaData = [
    [12, 15], [15, 18], [18, 21], [21, 24], [24, 27], [27, 30], [30, 33],
    [33, 36], [36, 39], [39, 42], [42, 45], [45, 48], [48, 51], [51, 54]
  ]

  for (let i = 0; i < grasaFemeninaDeportivaData.length; i++) {
    await prisma.board.create({
      data: {
        rangeId: ranges[i].id,
        type: 'FORM_BIOPHYSICS',
        name: 'sporty_female_fat',
        min: grasaFemeninaDeportivaData[i][0],
        max: grasaFemeninaDeportivaData[i][1],
        inverse: true
      }
    })
  }

  // Crear boards para IMC
  console.log('📏 Creando boards para IMC...')
  const imcData = [
    [18.5, 21], [21, 23], [23, 25], [25, 27], [27, 29], [29, 31], [31, 33],
    [33, 35], [35, 37], [37, 39], [39, 41], [41, 43], [43, 45], [45, 47]
  ]

  for (let i = 0; i < imcData.length; i++) {
    await prisma.board.create({
      data: {
        rangeId: ranges[i].id,
        type: 'FORM_BIOPHYSICS',
        name: 'body_mass_index',
        min: imcData[i][0],
        max: imcData[i][1],
        inverse: true
      }
    })
  }

  // Crear usuario administrador por defecto
  console.log('👤 Creando usuario administrador...')
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  try {
    await prisma.user.create({
      data: {
        email: 'admin@doctorantivejez.com',
        password: hashedPassword,
        firstName: 'Doctor',
        lastName: 'Antivejez',
        role: 'ADMIN'
      }
    })
    console.log('✅ Usuario administrador creado')
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Usuario administrador ya existe')
    } else {
      throw error
    }
  }

  console.log('✅ Seeding completado exitosamente!')
  console.log('📧 Usuario admin creado: admin@doctorantivejez.com / admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
