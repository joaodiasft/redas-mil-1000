import { Router } from 'express';
import { requireAuth } from '../authMiddleware';
import { prisma } from '../prismaSingleton';

const router = Router();

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
