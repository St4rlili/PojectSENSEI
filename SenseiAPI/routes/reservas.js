import express from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import { adminMiddleware } from '../middlewares/admin.js'
import { getDB } from '../config/db.js'
import { ObjectId } from 'mongodb'

const router = express.Router()

// Crear reserva
router.post('/', authMiddleware, async (req, res) => {
  const { classId } = req.body
  const db = getDB()

  const classData = await db.collection('clases').findOne({ _id: new ObjectId(classId) })
  if (!classData) {
    return res.status(404).json({ message: 'Clase no encontrada' })
  }

  const count = await db.collection('reservas')
    .countDocuments({ classId: new ObjectId(classId) })

  if (count >= classData.capacity) {
    return res.status(400).json({ message: 'Clase llena' })
  }

  await db.collection('reservas').insertOne({
    classId: new ObjectId(classId),
    username: req.user.username,
    attended: false,
    createdAt: new Date()
  })

  res.status(201).json({ message: 'Reserva creada' })
})

// Ver mis reservas
router.get('/my', authMiddleware, async (req, res) => {
  const db = getDB()

  const reservas = await db.collection('reservas')
    .find({ username: req.user.username })
    .toArray()

  res.json(reservas)
})

// Cancelar reserva
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  const db = getDB()

  await db.collection('reservas').deleteOne({ _id: new ObjectId(id) })

  res.json({ message: 'Reserva cancelada' })
})

// Ver reservas por clase (solo admin)
router.get('/class/:classId', authMiddleware, adminMiddleware, async (req, res) => {
  const { classId } = req.params
  const db = getDB()

  const reservas = await db.collection('reservas')
    .find({ classId: new ObjectId(classId) })
    .toArray()

  res.json(reservas)
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
