import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import "dotenv/config";

// Inicializando Prisma com accelerateUrl conforme Prisma 7 e Data Proxy
const prisma = new PrismaClient({
  // Prisma 7+ require you pass accelerateUrl here if you use Data Proxy
  accelerateUrl: process.env.DATABASE_URL as string,
});

import enrollmentRoutes from './routes/enrollment.routes';
import essayRoutes from './routes/essay.routes';
import financeRoutes from './routes/finance.routes';
import studentRoutes from './routes/student.routes';
import attendanceRoutes from './routes/attendance.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Roteamento
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/essays', essayRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendances', attendanceRoutes);

// Rota de Healthcheck / Status
app.get('/api/status', async (req: Request, res: Response) => {
  try {
    // Testa a conexão básica no banco Neon
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'ok', 
      message: 'Redação Nota Mil API is running', 
      database: 'connected' 
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Apenas executa `app.listen` caso não estejamos num ambiente Vercel (onde VERCEL é setado)
// O Vercel usa o arquivo exportado para rodar a Serverless Function
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Exportando para serverless (Vercel)
export default app;
