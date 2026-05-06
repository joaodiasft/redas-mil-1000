import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: pg.Pool;
};

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const conn = process.env.DATABASE_URL;
    if (!conn) throw new Error('DATABASE_URL não configurada.');
    const pool = globalForPrisma.pgPool ?? new pg.Pool({ connectionString: conn });
    globalForPrisma.pgPool = pool;
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}
