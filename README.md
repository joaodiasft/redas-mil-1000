# redas-mil-1000

## Deploy na Vercel

Variáveis de ambiente no projeto: `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` (ou `VITE_SUPABASE_URL`), `VITE_SUPABASE_ANON_KEY`; opcionais: `ADMIN_EMAILS`, `PROFESSOR_EMAILS`.

### Configuração esperada (este repo)

1. Em **Settings → General → Root Directory**, deixe **vazio** (raiz do Git — não use `frontend` aqui).
2. **`package.json` na raiz** com `workspaces` instala dependências do app e **`npm run build`** corre o build do Vite em `frontend/`.
3. **`vercel.json` na raiz** usa preset **Vite**, `outputDirectory`: **`frontend/dist`**, rewrite SPA que **não cobre** `/api/*`.
4. **`api/[...path].ts` na raiz** delega para `frontend/api/[...path].ts` (onde está Prisma + Supabase).

Se o Root Directory estiver definido como **`frontend`**, o `api/` da raiz **não** é incluído — use um projeto Vercel ligado à raiz do repositório ou adapte o projeto para só `frontend/` (handler direto em `frontend/api/` sem este proxy).
