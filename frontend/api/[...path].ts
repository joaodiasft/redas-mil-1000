import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verifica autenticação
async function getUser(req: VercelRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path } = req.query as { path: string[] };
  const route = Array.isArray(path) ? path.join('/') : (path || '');

  try {
    // ───── STATUS ─────
    if (route === 'status') {
      await prisma.$queryRaw`SELECT 1`;
      return res.json({ status: 'ok', message: 'Redação Nota Mil API', database: 'connected' });
    }

    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Não autorizado.' });

    // ───── ESSAYS ─────
    if (route === 'essays') {
      if (req.method === 'GET') {
        const essays = await prisma.essay.findMany({
          include: {
            user: { select: { name: true, email: true } },
            class: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        return res.json(essays);
      }
      if (req.method === 'POST') {
        const { classId, theme, c1, c2, c3, c4, c5, feedback } = req.body;
        const clamp = (v: number) => Math.min(Math.max(v || 0, 0), 200);
        const [s1, s2, s3, s4, s5] = [c1, c2, c3, c4, c5].map(clamp);
        const total = s1 + s2 + s3 + s4 + s5;
        const essay = await prisma.essay.create({
          data: { userId: user.id, classId, theme, c1: s1, c2: s2, c3: s3, c4: s4, c5: s5, total, feedback }
        });
        return res.status(201).json(essay);
      }
    }

    // ───── ESSAYS VALIDATE ─────
    if (route.startsWith('essays/') && route.endsWith('/validate') && req.method === 'PUT') {
      const id = route.split('/')[1];
      const essay = await prisma.essay.update({ where: { id }, data: { isValidated: true } });
      return res.json(essay);
    }

    // ───── ESSAYS BY STUDENT ─────
    if (route.startsWith('essays/student/')) {
      const studentId = route.split('/')[2];
      const essays = await prisma.essay.findMany({
        where: { userId: studentId },
        include: { class: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(essays);
    }

    // ───── STUDENTS ─────
    if (route === 'students') {
      if (req.method === 'GET') {
        const students = await prisma.user.findMany({
          where: { role: 'ALUNO' },
          include: {
            enrollments: { include: { class: true } },
            finances: { orderBy: { dueDate: 'desc' }, take: 1 }
          },
          orderBy: { name: 'asc' }
        });
        return res.json(students);
      }
    }

    // ───── ENROLLMENTS ─────
    if (route === 'enrollments' && req.method === 'POST') {
      const { userId, classId, baseValue, discountPercent } = req.body;
      const dp = Number(discountPercent) || 0;
      const finalValue = baseValue * (1 - dp / 100);
      const enrollment = await prisma.enrollment.create({
        data: { userId, classId, baseValue, discountPercent: dp, finalValue }
      });
      return res.json(enrollment);
    }

    // ───── STUDENT ENROLLMENTS ─────
    if (route.startsWith('enrollments/student/')) {
      const studentId = route.split('/')[2];
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: studentId },
        include: { class: true }
      });
      return res.json(enrollments);
    }

    // ───── FINANCE ─────
    if (route === 'finance') {
      if (req.method === 'GET') {
        const finances = await prisma.finance.findMany({
          include: { user: { select: { name: true } } },
          orderBy: { dueDate: 'asc' }
        });
        return res.json(finances);
      }
    }

    // ───── FINANCE BY STUDENT ─────
    if (route.startsWith('finance/student/')) {
      const studentId = route.split('/')[2];
      const finances = await prisma.finance.findMany({
        where: { userId: studentId },
        orderBy: { dueDate: 'desc' }
      });
      return res.json(finances);
    }

    // ───── FINANCE PAY ─────
    if (route.startsWith('finance/') && route.endsWith('/pay') && req.method === 'PUT') {
      const id = route.split('/')[1];
      const { paymentDate, paymentMethod } = req.body;
      const paid = await prisma.finance.update({
        where: { id },
        data: { status: 'PAID', paymentDate: new Date(paymentDate), paymentMethod }
      });
      // Gera fatura D+30
      const nextDue = new Date(paid.dueDate);
      nextDue.setMonth(nextDue.getMonth() + 1);
      await prisma.finance.create({
        data: { userId: paid.userId, value: paid.value, dueDate: nextDue, status: 'PENDING' }
      });
      return res.json(paid);
    }

    // ───── ATTENDANCES ─────
    if (route === 'attendances') {
      if (req.method === 'GET') {
        const { classId, date } = req.query;
        const attendances = await prisma.attendance.findMany({
          where: { enrollment: { classId: String(classId) }, date: new Date(String(date)) },
          include: { enrollment: { include: { user: { select: { id: true, name: true } } } } }
        });
        return res.json(attendances);
      }
    }

    if (route === 'attendances/batch' && req.method === 'POST') {
      const { date, records } = req.body;
      const targetDate = new Date(date);
      const results = [];
      for (const record of records) {
        const { enrollmentId, status, notes } = record;
        const att = await prisma.attendance.upsert({
          where: { enrollmentId_date: { enrollmentId, date: targetDate } },
          update: { status, notes },
          create: { enrollmentId, date: targetDate, status, notes }
        });
        results.push(att);
      }
      return res.json(results);
    }

    // ───── STUDENT ATTENDANCES ─────
    if (route.startsWith('attendances/student/')) {
      const studentId = route.split('/')[2];
      const attendances = await prisma.attendance.findMany({
        where: { enrollment: { userId: studentId } },
        include: { enrollment: { include: { class: { select: { name: true } } } } },
        orderBy: { date: 'desc' }
      });
      return res.json(attendances);
    }

    // ───── CLASSES ─────
    if (route === 'classes' && req.method === 'GET') {
      const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
      return res.json(classes);
    }

    return res.status(404).json({ error: 'Rota não encontrada: ' + route });
  } catch (error: any) {
    console.error('[API Error]', error);
    return res.status(500).json({ error: error.message });
  }
}
