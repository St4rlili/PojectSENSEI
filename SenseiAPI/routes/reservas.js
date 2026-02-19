import express from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import { adminMiddleware } from '../middlewares/admin.js'
import { getDB } from '../config/db.js'
import { ObjectId } from 'mongodb'

const router = express.Router()

router.post('/', authMiddleware, async (req, res) => {
  const db = getDB()
  const { classId } = req.body
  const userId = new ObjectId(req.user.id)

  if (!classId) return res.status(400).json({ message: 'Clase inválida' })

  const clase = await db.collection('clases').findOne({ _id: new ObjectId(classId) })
  if (!clase) return res.status(404).json({ message: 'Clase no encontrada' })

  // Verificar capacidad y si ya reservó
  const existingReservation = await db.collection('reservas').findOne({ classId, userId })
  if (existingReservation) return res.status(400).json({ message: 'Ya tienes una reserva' })

  const totalReservations = await db.collection('reservas').countDocuments({ classId })
  if (totalReservations >= clase.capacity) return res.status(400).json({ message: 'Clase completa' })

  const result = await db.collection('reservas').insertOne({
    classId,
    userId,
    attended: false,
    createdAt: new Date()
  })

  res.status(201).json({ 
    message: 'Reserva creada', 
    reservationId: result.insertedId.toString()
  })
})


// Obtener mis reservas
router.get('/my', authMiddleware, async (req, res) => {
  const db = getDB()
  const userId = new ObjectId(req.user.id)

  const reservas = await db.collection('reservas')
    .find({ userId })
    .toArray()

  const clasesIds = reservas.map(r => new ObjectId(r.classId))
  const clases = await db.collection('clases')
    .find({ _id: { $in: clasesIds } })
    .toArray()

  const clasesConReserva = clases.map(c => {
    const reserva = reservas.find(r => r.classId.toString() === c._id.toString())
    return {
      ...c,
      reservationId: reserva._id.toString()
    }
  })

  res.json(clasesConReserva)
})


// Cancelar reserva
router.delete('/:reservationId', authMiddleware, async (req, res) => {
  try {
    const db = getDB()
    const { reservationId } = req.params
    const userId = req.user.id

    const result = await db.collection('reservas').deleteOne({
      _id: new ObjectId(reservationId),
      userId: new ObjectId(userId)
    })

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' })
    }

    res.json({ message: 'Reserva cancelada' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


// Ver reservas por clase (solo admin)
router.get('/class/:classId', authMiddleware, adminMiddleware, async (req, res) => {
  const { classId } = req.params
  const db = getDB()

  // Todas las reservas de esa clase
  const reservas = await db.collection('reservas')
    .find({ classId })
    .toArray()

  if (reservas.length === 0) return res.json([])

  // Traemos usuarios
  const userIds = reservas.map(r => r.userId)
  const users = await db.collection('usuarios')
    .find({ _id: { $in: userIds } })
    .toArray()

  // Asociamos username
  const reservasConUsuario = reservas.map(r => {
    const u = users.find(u => u._id.toString() === r.userId.toString())
    return {
      ...r,
      username: u?.username || 'Desconocido'
    }
  })

  res.json(reservasConUsuario)
})



router.put('/:reservationId/attendance', authMiddleware, adminMiddleware, async (req, res) => {
  const db = getDB()
  const { reservationId } = req.params
  const { attended } = req.body

  const result = await db.collection('reservas').updateOne(
    { _id: new ObjectId(reservationId) },
    { $set: { attended } }
  )

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Reserva no encontrada' })
  }

  res.json({ message: 'Asistencia actualizada' })
})


// Marcar asistencia (solo admin)
router.patch('/:id/attendance', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params
  const { attended } = req.body
  const db = getDB()

  await db.collection('reservas').updateOne(
    { _id: new ObjectId(id) },
    { $set: { attended } }
  )

  res.json({ message: 'Asistencia actualizada' })
})

export default router
