import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../authMiddleware';

const router = Router();
const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });

/**
 * Endpoint de Lançamento de Notas de Redação
 * Demonstração de Zero Trust: Soma das Notas no Servidor
 * O Front envia c1 a c5, ignoramos o Total e calculamos no back.
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { classId, theme, c1, c2, c3, c4, c5 } = req.body;
    
    // Proteção IDOR e Segurança: Só pode lançar nota para si mesmo (se for aluno) ou admin/prof
    // Para simplificar a POC, pegaremos o userId do próprio token
    const userId = req.user.id;

    // Regra Zero Trust: Soma é feita no backend. Limite max é 1000.
    const safeC1 = Math.min(Math.max(c1 || 0, 0), 200);
    const safeC2 = Math.min(Math.max(c2 || 0, 0), 200);
    const safeC3 = Math.min(Math.max(c3 || 0, 0), 200);
    const safeC4 = Math.min(Math.max(c4 || 0, 0), 200);
    const safeC5 = Math.min(Math.max(c5 || 0, 0), 200);

    const backendTotal = safeC1 + safeC2 + safeC3 + safeC4 + safeC5;

    const essay = await prisma.essay.create({
      data: {
        userId,
        classId,
        theme,
        c1: safeC1,
        c2: safeC2,
        c3: safeC3,
        c4: safeC4,
        c5: safeC5,
        total: backendTotal,
        feedback,
        isValidated: false
      }
    });

    return res.status(201).json(essay);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

/**
 * Endpoint para listar redações (Admin)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const essays = await prisma.essay.findMany({
      include: {
        user: { select: { name: true, email: true } },
        class: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(essays);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint para Validar e Bloquear Redação (Admin)
 */
router.put('/:id/validate', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Regra Zero Trust: Trancar a redação para impedir futuras edições.
    const essay = await prisma.essay.update({
      where: { id },
      data: { isValidated: true }
    });

    return res.status(200).json(essay);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
