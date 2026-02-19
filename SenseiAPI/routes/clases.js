import express from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import { adminMiddleware } from '../middlewares/admin.js'
import { getDB } from '../config/db.js'
import { ObjectId } from 'mongodb'

const router = express.Router()

// GET de todas las clases (solo usuarios)
router.get('/', authMiddleware, async (req, res) => {
  const db = getDB()
  const userId = new ObjectId(req.user.id)

  const clases = await db.collection('clases').find().toArray()

  const reservas = await db.collection('reservas')
    .find({ userId })
    .toArray()

  const reservasMap = new Map()
  reservas.forEach(r => {
    reservasMap.set(r.classId.toString(), r)
  })

  const clasesConInfo = await Promise.all(
    clases.map(async (c) => {

      const totalReservas = await db.collection('reservas')
        .countDocuments({ classId: c._id.toString() })

      const reservaUsuario = reservasMap.get(c._id.toString())

      return {
        ...c,
        reserved: totalReservas,
        available: c.capacity - totalReservas,
        alreadyReserved: !!reservaUsuario,
        reservationId: reservaUsuario?._id.toString() || null,
        isFinished: new Date(c.date) < new Date()
      }
    })
  )

  res.json(clasesConInfo)
})

// POST crear una nueva clase (solo admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, date, capacity } = req.body
    const db = getDB()

    const newClass = {
      title,
      description: description || '',
      date: new Date(date),
      capacity,
      createdBy: req.user.username,
      createdAt: new Date()
    }

    const result = await db.collection('clases').insertOne(newClass)

    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PUT modificar una clase (solo admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params
  const { title, description, date, capacity } = req.body

  const db = getDB()
  const update = {}
  if (title) update.title = title
  if (description) update.description = description
  if (date) update.date = new Date(date)
  if (capacity) update.capacity = capacity

  const result = await db.collection('clases').updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  )

  if (result.matchedCount === 0) return res.status(404).json({ message: 'Clase no encontrada' })
  res.json({ message: 'Clase actualizada' })
})

// DELETE eliminar una clase (solo admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params
  const db = getDB()

  const result = await db.collection('clases').deleteOne({ _id: new ObjectId(id) })
  if (result.deletedCount === 0) return res.status(404).json({ message: 'Clase no encontrada' })

  res.json({ message: 'Clase eliminada' })
})

export default router
