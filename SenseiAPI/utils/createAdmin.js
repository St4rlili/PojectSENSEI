import bcrypt from 'bcryptjs'
import { getDB } from '../config/db.js'

export const createAdminIfNotExists = async () => {
  const db = getDB()

  const existingAdmin = await db.collection('usuarios').findOne({ username: 'miku' })
  if (existingAdmin) {
    console.log('Admin ya existe')
    return
  }

  const hashedPassword = await bcrypt.hash('123', 10)

  await db.collection('usuarios').insertOne({
    username: 'miku',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date()
  })

  console.log('Admin creado: usuario = miku, contraseña = 123')
}
