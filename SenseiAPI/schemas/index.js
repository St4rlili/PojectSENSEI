import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string().min(3, 'El usuario debe tener mínimo 3 caracteres'),
  password: z.string().min(3, 'La contraseña debe tener mínimo 3 caracteres')
})

export const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria')
})

export const claseSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional().default(''),
  date: z.string().refine(d => !isNaN(new Date(d).getTime()), 'Fecha inválida'),
  capacity: z.number().int().min(1, 'La capacidad debe ser mínimo 1')
})

export const claseEditSchema = claseSchema.partial()