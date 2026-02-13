import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { createAdminIfNotExists } from './utils/createAdmin.js'

import authRoutes from './routes/auth.js';
import classRoutes from './routes/clases.js';
import reservasRoutes from './routes/reservas.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const startServer = async () => {
  try {
    await connectDB();
    await createAdminIfNotExists()

    app.use('/api/auth', authRoutes);
    app.use('/api/clases', classRoutes);
    app.use('/api/reservas', reservasRoutes);

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Funcionando en puerto ${PORT}`);
    });

  } catch (error) {
    console.error("Error al iniciar servidor:", error);
    process.exit(1);
  }
};

startServer();