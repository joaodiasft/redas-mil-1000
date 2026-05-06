import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const conn = process.env.DATABASE_URL;
if (!conn) throw new Error('DATABASE_URL obrigatória para seed.');
const pool = new pg.Pool({ connectionString: conn });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function ensureClass(name: string, schedule: string, description: string) {
  const existing = await prisma.class.findFirst({ where: { name } });
  if (existing) {
    return prisma.class.update({
      where: { id: existing.id },
      data: { schedule, description, maxStudents: 30 },
    });
  }
  return prisma.class.create({
    data: { name, schedule, description, maxStudents: 30 },
  });
}

async function main() {
  await ensureClass('R1', 'Terça-feira | 18:00 às 19:30', 'Curso de Redação — Martinha');
  await ensureClass('R2', 'Terça-feira | 19:30 às 21:00', 'Curso de Redação — Martinha');
  await ensureClass('R3', 'Sábado | 07:30 às 09:00', 'Curso de Redação — Martinha');
  await ensureClass('R4', 'Sábado | 09:00 às 10:30', 'Curso de Redação — Martinha');
  await ensureClass('R5', 'Sábado | 10:30 às 12:00', 'Curso de Redação — Martinha');
  await ensureClass('R6', 'Sábado | 15:00 às 16:30', 'Curso de Redação — Martinha');
  await ensureClass('EX1', 'Segunda-feira | 19:00 às 22:00', 'Curso de Exatas — Bruno / Adriano / Marcus');

  console.log('Seed de turmas concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
