import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDB } from '../config/db.js'

const router = express.Router()

// REGISTRO
router.post('/register', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Faltan datos' })
  }

  const db = getDB()

  const existingUser = await db.collection('usuarios').findOne({ username })
  if (existingUser) {
    return res.status(400).json({ message: 'Usuario ya existe' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await db.collection('usuarios').insertOne({
    username,
    password: hashedPassword,
    role: 'user',
    createdAt: new Date()
  })

  res.status(201).json({ message: 'Usuario creado correctamente' })
})

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const db = getDB()

  const user = await db.collection('usuarios').findOne({ username })
  if (!user) return res.status(400).json({ message: 'Usuario no existe' })

  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) return res.status(400).json({ message: 'Contraseña incorrecta' })

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  )

  res.json({ token })
})

export default router