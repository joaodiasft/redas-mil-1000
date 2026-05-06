import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../authMiddleware';

const router = Router();
const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });

/**
 * Endpoint de Consulta Financeira do Aluno
 * Demonstração de Zero Trust: Proteção IDOR.
 * O endpoint busca exclusivamente as faturas conectadas ao token Supabase do requerente.
 */
router.get('/my-invoices', requireAuth, async (req, res) => {
  try {
    // Regra Zero Trust: Pegamos o ID diretamente do Token.
    // O aluno não pode enviar `?userId=123` e ver faturas de outro.
    const authenticatedUserId = req.user.id;

    const invoices = await prisma.finance.findMany({
      where: {
        userId: authenticatedUserId
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    return res.status(200).json(invoices);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint de Consulta Financeira (Admin)
 * Traz todas as faturas do sistema
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const invoices = await prisma.finance.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { dueDate: 'asc' }
    });
    return res.status(200).json(invoices);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint para Dar Baixa (Admin)
 * Atualiza status para PAID e opcionalmente gera o próximo mês.
 */
router.put('/:id/pay', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentDate, paymentMethod, generateNext } = req.body;

    const invoice = await prisma.finance.update({
      where: { id },
      data: {
        status: 'PAID',
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMethod
      }
    });

    if (generateNext) {
      // Regra: Gera o próximo boleto para +30 dias mantendo o valor
      const nextDate = new Date(invoice.dueDate);
      nextDate.setMonth(nextDate.getMonth() + 1);

      await prisma.finance.create({
        data: {
          userId: invoice.userId,
          value: invoice.value,
          dueDate: nextDate,
          status: 'PENDING'
        }
      });
    }

    return res.status(200).json(invoice);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
