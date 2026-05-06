import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

/**
 * Na Vercel: `@prisma/adapter-neon` espera `PoolConfig` (ex.: `{ connectionString }`),
 * não uma instância de `Pool` — caso contrário a função quebra em runtime / tipo TS inválido.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const conn = process.env.DATABASE_URL;
    if (!conn) throw new Error('DATABASE_URL não configurada.');
    const adapter = new PrismaNeon({ connectionString: conn });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}
