import bcrypt from 'bcryptjs'
import { getDB } from '../config/db.js'

export const createAdminIfNotExists = async () => {
  const db = getDB()

  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  const existingAdmin = await db.collection('usuarios').findOne({ username })
  if (existingAdmin) {
    console.log('Admin ya existe')
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await db.collection('usuarios').insertOne({
    username,
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date()
  })

  console.log(`Admin creado: usuario = ${username}`)
}