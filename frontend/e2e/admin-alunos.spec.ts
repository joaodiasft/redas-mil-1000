import { test, expect } from '@playwright/test';

// Helper to mock Supabase Auth session so we bypass PrivateRoute
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const fakeSession = {
      provider_token: null,
      access_token: 'fake-jwt-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'fake-refresh-token',
      token_type: 'bearer',
      user: {
        id: 'fake-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'admin@redas14.com',
        app_metadata: { provider: 'email' },
        user_metadata: {}
      }
    };
    
    // Inject fake session into localStorage for any Supabase key
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function(key: string) {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        return JSON.stringify(fakeSession);
      }
      return originalGetItem.call(this, key);
    };
  });
});

test.describe('Admin Flow - Alunos', () => {
  test('deve renderizar a tabela de alunos e abrir o modal de matrícula', async ({ page }) => {
    // Acessa a rota (o mock de auth garantirá a entrada)
    await page.goto('/admin/alunos');

    // Verifica se o título carregou
    await expect(page.locator('h2')).toContainText('Gestão de Alunos');

    // Verifica se a tabela mockada renderizou (Ana Paula Souza)
    await expect(page.locator('text=Ana Paula Souza')).toBeVisible();

    // Clica em "Nova Matrícula"
    await page.click('button:has-text("Nova Matrícula")');

    // Verifica se o modal abriu
    await expect(page.locator('h3:has-text("Nova Matrícula")')).toBeVisible();

    // Preenche o formulário usando label acessível
    await page.getByLabel('Nome Completo').fill('Aluno Playwright');
    await page.getByLabel('E-mail').fill('teste@playwright.dev');
    
    // Seleciona a turma
    await page.selectOption('select', 'ex1');

    // Preenche o valor base
    await page.getByLabel('Valor Base (R$)').fill('500');

    // Seleciona Bolsa 100%
    await page.click('text=100%');

    // Verifica se o alerta amarelo de bolsa integral apareceu
    await expect(page.locator('text=Aviso: O aluno possui bolsa integral de 100%')).toBeVisible();

    // Em vez de clicar em confirmar e dar alert (que trava o teste se não houver handle), fechamos o modal
    await page.click('button:has-text("Cancelar")');

    // Verifica se fechou
    await expect(page.locator('h3:has-text("Nova Matrícula")')).toBeHidden();
  });
});
