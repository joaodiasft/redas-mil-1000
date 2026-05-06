import { Router } from 'express';
import { requireAuth } from '../authMiddleware';
import { prisma } from '../prismaSingleton';

const router = Router();

/**
 * Endpoint para buscar frequência por turma e data (Professor/Admin)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { classId, date } = req.query;
    if (!classId || !date) {
      return res.status(400).json({ error: 'classId e date são obrigatórios.' });
    }

    const targetDate = new Date(date as string);

    const attendances = await prisma.attendance.findMany({
      where: {
        enrollment: { classId: String(classId) },
        date: targetDate
      },
      include: {
        enrollment: {
          include: { user: { select: { id: true, name: true } } }
        }
      }
    });

    return res.status(200).json(attendances);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint para salvar/atualizar o Diário de Classe em Lote (Batch)
 * Espera um array: [{ enrollmentId, status, notes }]
 */
router.post('/batch', requireAuth, async (req, res) => {
  try {
    const { date, records } = req.body;
    if (!date || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Data e Array de registros são obrigatórios.' });
    }

    const targetDate = new Date(date);
    const results = [];

    // O Prisma não tem um "upsertMany", então faremos em iteração (transação ou sequencial).
    // Para simplificar e garantir a inserção no Neon Pooler:
    for (const record of records) {
      const { enrollmentId, status, replacementDate } = record;

      const attendance = await prisma.attendance.upsert({
        where: {
          enrollmentId_date: {
            enrollmentId,
            date: targetDate
          }
        },
        update: {
          status,
          replacementDate: replacementDate ? new Date(replacementDate) : null
        },
        create: {
          enrollmentId,
          date: targetDate,
          status,
          replacementDate: replacementDate ? new Date(replacementDate) : null
        }
      });
      results.push(attendance);
    }

    return res.status(200).json(results);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
