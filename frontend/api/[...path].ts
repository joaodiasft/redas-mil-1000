import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type User as SupabaseAuthUser } from '@supabase/supabase-js';
import type { AttendanceStatus, Role } from '@prisma/client';
import { getPrisma } from './_prisma.js';

const ATT_LABEL_TO_ENUM: Record<string, AttendanceStatus> = {
  Presente: 'PRESENTE',
  Falta: 'FALTA',
  Justificou: 'JUSTIFICOU',
  'Reposição Agendada': 'REPOSICAO_AGENDADA',
  'Reposição Feita Nesta Aula': 'REPOSICAO_NESTA_AULA',
  'Reposição Feita': 'REPOSICAO_FEITA',
  'Reposição Feita (Outro dia)': 'REPOSICAO_FEITA',
};

function supabaseServer() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL (ou VITE_SUPABASE_URL) e SUPABASE_SERVICE_ROLE_KEY são obrigatórios na API.');
  return createClient(url, key);
}

async function getAuthUser(req: VercelRequest): Promise<SupabaseAuthUser | null> {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const supabase = supabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

async function ensurePrismaUser(authUser: SupabaseAuthUser) {
  const prisma = getPrisma();
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const profEmails = (process.env.PROFESSOR_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  let defaultRole: Role = 'ALUNO';
  const em = authUser.email?.toLowerCase();
  if (em && adminEmails.includes(em)) defaultRole = 'ADMIN';
  else if (em && profEmails.includes(em)) defaultRole = 'PROFESSOR';

  const meta = authUser.user_metadata as Record<string, unknown> | undefined;
  const nameFromMeta =
    (typeof meta?.full_name === 'string' && meta.full_name) ||
    (typeof meta?.name === 'string' && meta.name) ||
    null;

  const existing = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (existing) {
    if (
      existing.email !== authUser.email ||
      (nameFromMeta && existing.name !== nameFromMeta)
    ) {
      return prisma.user.update({
        where: { id: authUser.id },
        data: {
          email: authUser.email!,
          ...(nameFromMeta ? { name: nameFromMeta } : {}),
        },
      });
    }
    return existing;
  }

  return prisma.user.create({
    data: {
      id: authUser.id,
      email: authUser.email!,
      name: nameFromMeta,
      role: defaultRole,
    },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const raw = req.query.path;
  const pathParts = Array.isArray(raw) ? raw : raw ? [raw] : [];

  try {
    const prisma = getPrisma();

    /* ─── Health ─── */
    if (pathParts[0] === 'status') {
      await prisma.$queryRaw`SELECT 1`;
      return res.status(200).json({
        status: 'ok',
        message: 'Redação Nota Mil API',
        database: 'connected',
      });
    }

    /* ─── Público: apenas rotas acima ─── */
    const routeKey = pathParts.join('/');

    if (routeKey === 'me' && req.method === 'GET') {
      const authUser = await getAuthUser(req);
      if (!authUser) return res.status(401).json({ error: 'Não autorizado.' });
      const profile = await ensurePrismaUser(authUser);
      return res.json(profile);
    }

    const authUser = await getAuthUser(req);
    if (!authUser) return res.status(401).json({ error: 'Não autorizado.' });
    const profile = await ensurePrismaUser(authUser);

    /* ─── Essências ─── */
    if (routeKey === 'classes' && req.method === 'GET') {
      const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
      return res.json(classes);
    }

    /* ─── Matrículas por turma (prof/admin) ─── */
    if (pathParts[0] === 'enrollments' && pathParts[1] === 'class' && pathParts[2] && req.method === 'GET') {
      if (profile.role !== 'ADMIN' && profile.role !== 'PROFESSOR') {
        return res.status(403).json({ error: 'Sem permissão.' });
      }
      const classId = pathParts[2];
      const rows = await prisma.enrollment.findMany({
        where: { classId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { user: { name: 'asc' } },
      });
      return res.json(rows);
    }

    if (routeKey === 'enrollments/me' && req.method === 'GET') {
      const rows = await prisma.enrollment.findMany({
        where: { userId: authUser.id },
        include: { class: true },
      });
      return res.json(rows);
    }

    if (
      pathParts[0] === 'enrollments' &&
      pathParts[1] === 'student' &&
      pathParts[2] &&
      req.method === 'GET'
    ) {
      const studentId = pathParts[2];
      if (studentId !== authUser.id && profile.role === 'ALUNO') {
        return res.status(403).json({ error: 'Sem permissão.' });
      }
      const rows = await prisma.enrollment.findMany({
        where: { userId: studentId },
        include: { class: true },
      });
      return res.json(rows);
    }

    if (routeKey === 'enrollments' && req.method === 'POST') {
      if (profile.role !== 'ADMIN') return res.status(403).json({ error: 'Apenas secretaria.' });
      const { userId, classId, baseValue, discountPercent } = req.body || {};
      let dp = Number(discountPercent) || 0;
      if (![0, 50, 100].includes(dp)) dp = 0;
      const bv = Number(baseValue);
      const finalValue = bv - bv * (dp / 100);
      const enrollment = await prisma.enrollment.create({
        data: {
          userId,
          classId,
          baseValue: bv,
          discountPercent: dp,
          finalValue,
        },
      });
      return res.status(201).json(enrollment);
    }

    /* ─── Admin: criar aluno (Supabase + Prisma) ─── */
    if (routeKey === 'admin/students' && req.method === 'POST') {
      if (profile.role !== 'ADMIN') return res.status(403).json({ error: 'Apenas secretaria.' });
      const { email, password, name } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'email e password obrigatórios.' });

      const supabase = supabaseServer();
      const { data: created, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });
      if (error || !created.user) {
        return res.status(400).json({ error: error?.message || 'Falha ao criar usuário.' });
      }

      await prisma.user.upsert({
        where: { id: created.user.id },
        update: { email, name: name || null, role: 'ALUNO' },
        create: {
          id: created.user.id,
          email,
          name: name || null,
          role: 'ALUNO',
        },
      });

      return res.status(201).json({
        id: created.user.id,
        email,
        name,
      });
    }

    /* ─── Redações ─── */
    if (routeKey === 'essays/me' && req.method === 'GET') {
      const essays = await prisma.essay.findMany({
        where: { userId: authUser.id },
        include: { class: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(essays);
    }

    if (routeKey === 'essays' && req.method === 'GET') {
      if (profile.role !== 'ADMIN' && profile.role !== 'PROFESSOR') {
        return res.status(403).json({ error: 'Sem permissão.' });
      }
      const essays = await prisma.essay.findMany({
        include: {
          user: { select: { name: true, email: true } },
          class: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(essays);
    }

    if (routeKey === 'essays' && req.method === 'POST') {
      const { classId, theme, c1, c2, c3, c4, c5, feedback, userId: bodyUserId } = req.body || {};
      let targetUserId = bodyUserId || authUser.id;

      if (targetUserId !== authUser.id) {
        if (profile.role !== 'ADMIN' && profile.role !== 'PROFESSOR') {
          return res.status(403).json({ error: 'Sem permissão para lançar para outro aluno.' });
        }
      }

      const clamp = (v: number) => Math.min(Math.max(Math.round(Number(v)) || 0, 0), 200);
      const [s1, s2, s3, s4, s5] = [c1, c2, c3, c4, c5].map(clamp);
      const total = Math.min(s1 + s2 + s3 + s4 + s5, 1000);

      const essay = await prisma.essay.create({
        data: {
          userId: targetUserId,
          classId,
          theme: theme || 'Sem tema',
          c1: s1,
          c2: s2,
          c3: s3,
          c4: s4,
          c5: s5,
          total,
          feedback: typeof feedback === 'string' ? feedback : null,
        },
      });
      return res.status(201).json(essay);
    }

    if (
      pathParts[0] === 'essays' &&
      pathParts.length === 3 &&
      pathParts[2] === 'validate' &&
      req.method === 'PUT'
    ) {
      if (profile.role !== 'ADMIN') return res.status(403).json({ error: 'Apenas secretaria.' });
      const id = pathParts[1];
      const essay = await prisma.essay.update({
        where: { id },
        data: { isValidated: true },
      });
      return res.json(essay);
    }

    /* ─── Financeiro ─── */
    if (routeKey === 'finance/me' && req.method === 'GET') {
      const finances = await prisma.finance.findMany({
        where: { userId: authUser.id },
        orderBy: { dueDate: 'desc' },
      });
      return res.json(finances);
    }

    if (routeKey === 'finance' && req.method === 'GET') {
      if (profile.role !== 'ADMIN') return res.status(403).json({ error: 'Sem permissão.' });
      const finances = await prisma.finance.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { dueDate: 'asc' },
      });
      return res.json(finances);
    }

    if (
      pathParts[0] === 'finance' &&
      pathParts.length === 3 &&
      pathParts[2] === 'pay' &&
      req.method === 'PUT'
    ) {
      if (profile.role !== 'ADMIN') return res.status(403).json({ error: 'Apenas secretaria.' });
      const id = pathParts[1];
      const { paymentDate, paymentMethod, generateNext } = req.body || {};
      const paid = await prisma.finance.update({
        where: { id },
        data: {
          status: 'PAID',
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          paymentMethod: paymentMethod || 'PIX',
        },
      });
      if (generateNext !== false) {
        const nextDue = new Date(paid.dueDate);
        nextDue.setMonth(nextDue.getMonth() + 1);
        await prisma.finance.create({
          data: {
            userId: paid.userId,
            value: paid.value,
            dueDate: nextDue,
            status: 'PENDING',
          },
        });
      }
      return res.json(paid);
    }

    /* ─── Frequência ─── */
    if (routeKey === 'attendances/me' && req.method === 'GET') {
      const rows = await prisma.attendance.findMany({
        where: { enrollment: { userId: authUser.id } },
        include: { enrollment: { include: { class: { select: { name: true } } } } },
        orderBy: { date: 'desc' },
      });
      return res.json(rows);
    }

    if (routeKey === 'attendances' && req.method === 'GET') {
      if (profile.role !== 'ADMIN' && profile.role !== 'PROFESSOR') {
        return res.status(403).json({ error: 'Sem permissão.' });
      }
      const { classId, date } = req.query;
      if (!classId || !date) return res.status(400).json({ error: 'classId e date obrigatórios.' });
      const attendances = await prisma.attendance.findMany({
        where: {
          enrollment: { classId: String(classId) },
          date: new Date(String(date)),
        },
        include: {
          enrollment: { include: { user: { select: { id: true, name: true } } } },
        },
      });
      return res.json(attendances);
    }

    if (routeKey === 'attendances/batch' && req.method === 'POST') {
      if (profile.role !== 'ADMIN' && profile.role !== 'PROFESSOR') {
        return res.status(403).json({ error: 'Sem permissão.' });
      }
      const { date, records } = req.body || {};
      if (!date || !Array.isArray(records)) {
        return res.status(400).json({ error: 'date e records obrigatórios.' });
      }
      const targetDate = new Date(date);
      const results = [];

      for (const record of records) {
        const { enrollmentId, status: label, notes } = record;
        const statusEnum = ATT_LABEL_TO_ENUM[String(label)] || 'PRESENTE';
        let replacementDate: Date | null = null;
        if (statusEnum === 'REPOSICAO_AGENDADA' && notes && String(notes).trim()) {
          const d = new Date(String(notes));
          if (!Number.isNaN(d.getTime())) replacementDate = d;
        }

        const att = await prisma.attendance.upsert({
          where: {
            enrollmentId_date: { enrollmentId, date: targetDate },
          },
          update: { status: statusEnum, replacementDate },
          create: {
            enrollmentId,
            date: targetDate,
            status: statusEnum,
            replacementDate,
          },
        });
        results.push(att);
      }
      return res.json(results);
    }

    /* ─── Listagem de alunos (admin) ─── */
    if (routeKey === 'students' && req.method === 'GET') {
      if (profile.role !== 'ADMIN') return res.status(403).json({ error: 'Sem permissão.' });
      const students = await prisma.user.findMany({
        where: { role: 'ALUNO' },
        include: {
          enrollments: { include: { class: true } },
          finances: { orderBy: { dueDate: 'desc' }, take: 1 },
        },
        orderBy: { name: 'asc' },
      });
      return res.json(students);
    }

    return res.status(404).json({ error: 'Rota não encontrada: ' + routeKey });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro interno';
    console.error('[API]', error);
    return res.status(500).json({ error: msg });
  }
}
