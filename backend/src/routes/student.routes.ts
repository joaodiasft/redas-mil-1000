import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../authMiddleware';

const router = Router();
const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });

/**
 * Endpoint para Listar Alunos (Acesso Admin)
 * Traz os alunos e suas matrículas ativas.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'ALUNO' },
      include: {
        enrollments: {
          include: { class: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.status(200).json(students);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
