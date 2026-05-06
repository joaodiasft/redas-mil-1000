# redas-mil-1000

## Deploy na Vercel

1. Conecte este repositório ao projeto Vercel.
2. Em **Settings → General → Root Directory**, defina **`frontend`** (pasta onde está o Vite, `api/` e `package.json` do app).
3. Framework **Vite**, comando de build **`npm run build`**, diretório de saída **`dist`** (detectados automaticamente ao usar a pasta `frontend`).
4. Variáveis de ambiente necessárias no projeto: `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` (ou `VITE_SUPABASE_URL`), `VITE_SUPABASE_ANON_KEY`; opcionais: `ADMIN_EMAILS`, `PROFESSOR_EMAILS`.

Se o Root Directory não for `frontend`, o deploy pode responder **404** na página inicial ou falhar nas rotas `/api/*`.