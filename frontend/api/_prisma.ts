import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

/**
 * Prisma na Vercel: usa driver Neon serverless (HTTP/WebSocket) em vez de `pg`
 * em TCP puro, que costuma falhar em funções serverless (cold start / rede).
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  neonPool?: Pool;
};

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const conn = process.env.DATABASE_URL;
    if (!conn) throw new Error('DATABASE_URL não configurada.');
    const pool = globalForPrisma.neonPool ?? new Pool({ connectionString: conn });
    globalForPrisma.neonPool = pool;
    const adapter = new PrismaNeon(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}
