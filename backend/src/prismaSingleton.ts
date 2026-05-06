import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const conn = process.env.DATABASE_URL || '';
const pool = new pg.Pool({ connectionString: conn });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
