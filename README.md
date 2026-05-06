# redas-mil-1000

## Deploy na Vercel

Variáveis de ambiente no projeto: `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` (ou `VITE_SUPABASE_URL`), `VITE_SUPABASE_ANON_KEY`; opcionais: `ADMIN_EMAILS`, `PROFESSOR_EMAILS`.

### Opção A — Raiz do repositório (recomendado para este repo)

1. Em **Settings → General → Root Directory**, deixe **vazio** (raiz do Git).
2. O ficheiro **`vercel.json`** na raiz define o build estático do Vite em `frontend/` e a função Node em `frontend/api/[...path].ts`, com rotas para `/api/*`, ficheiros estáticos e fallback SPA para `index.html`.

### Opção B — Só a pasta `frontend`

1. Root Directory: **`frontend`**.
2. O Vercel deteta **Vite**; existe **`frontend/vercel.json`** com rewrites para SPA (deep links).
3. **Importante:** com Root Directory `frontend`, o ficheiro **`vercel.json` na raiz do repo** referencia caminhos `frontend/...` e pode quebrar o build. Remova ou renomeie esse ficheiro **neste clone/branch** se for usar só a Opção B, ou crie um projeto Vercel separado só com a pasta `frontend`.

Use **uma** configuração consistente por projeto Vercel (Opção A ou B).