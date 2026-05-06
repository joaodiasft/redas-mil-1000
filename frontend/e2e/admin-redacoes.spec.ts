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

test.describe('Admin Flow - Redações', () => {
  test('deve renderizar a tabela de redações e validar uma redação pendente', async ({ page }) => {
    // Intercepta a chamada do window.alert para o teste não travar e valida sua mensagem
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Redação validada e bloqueada no backend!');
      await dialog.accept();
    });

    await page.goto('/admin/redacoes');

    // Verifica se o título carregou
    await expect(page.locator('h2')).toContainText('Validação de Redações');

    // Pega a primeira linha da tabela que tenha o botão "Validar" e clica nela
    const validateButton = page.locator('button:has-text("Validar")').first();
    await expect(validateButton).toBeVisible();
    
    // Clica no botão Validar
    await validateButton.click();

    // Como o estado local (mock) da tela atualiza, o botão Validar deve desaparecer e virar "Bloqueado"
    // Pega a primeira linha e verifica se agora tem o texto "Bloqueado"
    await expect(page.locator('text=Bloqueado').first()).toBeVisible();
  });
});
