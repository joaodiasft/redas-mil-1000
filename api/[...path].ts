/**
 * Entrada serverless na raiz do repo — a Vercel só descobre `/api` aqui quando o Root Directory é a raiz do Git.
 * Implementação em `frontend/api/[...path].ts` (Prisma, Supabase, etc.).
 */
export { default } from '../frontend/api/[...path].ts';
