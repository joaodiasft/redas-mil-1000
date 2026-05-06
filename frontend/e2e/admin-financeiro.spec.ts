import { test, expect } from '@playwright/test';

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
        email: 'admin@redas14.com'
      }
    };
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function(key: string) {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        return JSON.stringify(fakeSession);
      }
      return originalGetItem.call(this, key);
    };
  });
});

test.describe('Admin Flow - Financeiro', () => {
  test('deve abrir modal de dar baixa e validar geração de próxima fatura', async ({ page }) => {
    // Lida com o alerta do navegador que a UI emite ao salvar
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Baixa confirmada');
      await dialog.accept();
    });

    await page.goto('/admin/financeiro');

    await expect(page.locator('h2')).toContainText('Gestão Financeira');

    // Pega o primeiro botão "Dar Baixa"
    const baixaButton = page.locator('button:has-text("Dar Baixa")').first();
    await expect(baixaButton).toBeVisible();
    
    await baixaButton.click();

    // Verifica se o modal abriu
    await expect(page.locator('h3:has-text("Confirmar Pagamento")')).toBeVisible();

    // O checkbox de "Gerar próxima fatura" deve estar checado por padrão
    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();

    // Clica em confirmar baixa
    await page.click('button:has-text("Confirmar Baixa")');

    // Modal deve sumir após o alert ser aceito
    await expect(page.locator('h3:has-text("Confirmar Pagamento")')).toBeHidden();
  });
});
