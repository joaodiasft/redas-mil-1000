import { Router } from 'express';
import { requireAuth } from '../authMiddleware';
import { prisma } from '../prismaSingleton';

const router = Router();

/**
 * Endpoint de Criação de Matrícula (Admin apenas idealmente)
 * Demonstração de Zero Trust: Matemática no Servidor.
 * O Front envia baseValue e discountPercent, ignoramos qualquer finalValue enviado.
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { userId, classId, baseValue, discountPercent } = req.body;

    // Regra Zero Trust: Backend decide o valor final, ignorando a intenção do cliente
    let safeDiscount = 0.0;
    if ([0, 50, 100].includes(discountPercent)) {
      safeDiscount = discountPercent;
    }

    const finalValue = baseValue - (baseValue * (safeDiscount / 100));

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        classId,
        baseValue,
        discountPercent: safeDiscount,
        finalValue
      }
    });

    return res.status(201).json(enrollment);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
