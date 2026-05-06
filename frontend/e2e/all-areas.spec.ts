import { test, expect } from '@playwright/test';
import { mockAdminApis, mockProfessorApis, mockStudentApis, mockSupabaseAuth } from './helpers/test-setup';

test.describe('Área pública', () => {
  test('login renderiza formulário', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Bem-vindo de volta/i })).toBeVisible();
    await expect(page.getByLabel(/E-mail/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Entrar na Plataforma/i })).toBeVisible();
  });

  test('rota raiz redireciona para área do aluno ou login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login|\/meu-espaco/);
  });
});

test.describe('Secretaria (Admin) — APIs mockadas', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseAuth(page, 'admin@test.com', 'e2e-user-id');
    await mockAdminApis(page);
  });

  test('Dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.getByText('Alunos Ativos')).toBeVisible();
  });

  test('Alunos + modal Nova Matrícula', async ({ page }) => {
    await page.goto('/admin/alunos');
    await expect(page.getByRole('heading', { name: 'Gestão de Alunos' })).toBeVisible();
    await expect(page.getByText('Aluno E2E')).toBeVisible();
    await page.getByRole('button', { name: /Nova Matrícula/i }).click();
    await expect(page.getByRole('heading', { name: 'Nova Matrícula' })).toBeVisible();
    await page.getByLabel('Nome Completo').fill('Novo Playwright');
    await page.getByLabel(/E-mail/i).fill('novo@playwright.dev');
    await page.getByLabel(/Senha inicial do Portal/i).fill('senha123');
    await page.getByLabel(/Valor Base/i).fill('450');
    await page.getByRole('button', { name: 'Confirmar Matrícula' }).click();
    await expect(page.getByRole('heading', { name: 'Nova Matrícula' })).toBeHidden();
  });

  test('Turmas', async ({ page }) => {
    await page.goto('/admin/turmas');
    await expect(page.getByRole('heading', { name: 'Turmas cadastradas' })).toBeVisible();
    await expect(page.getByText('R1')).toBeVisible();
    await expect(page.getByText('EX1')).toBeVisible();
  });

  test('Redações — validar', async ({ page }) => {
    await page.goto('/admin/redacoes');
    await expect(page.getByRole('heading', { name: 'Validação de Redações' })).toBeVisible();
    await expect(page.getByText('Tema Playwright')).toBeVisible();
    await page.getByRole('button', { name: /Validar e Bloquear/i }).first().click();
    await expect(page.getByText('Validada').first()).toBeVisible();
  });

  test('Financeiro — dar baixa', async ({ page }) => {
    await page.goto('/admin/financeiro');
    await expect(page.getByRole('heading', { name: 'Gestão Financeira' })).toBeVisible();
    await page.getByRole('button', { name: 'Dar Baixa' }).first().click();
    await expect(page.getByRole('heading', { name: 'Confirmar Pagamento' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar Baixa' }).click();
    await expect(page.getByRole('heading', { name: 'Confirmar Pagamento' })).toBeHidden();
  });
});

test.describe('Professor — APIs mockadas', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseAuth(page, 'prof@test.com', 'prof-id');
    await mockProfessorApis(page);
  });

  test('Diário de Frequência', async ({ page }) => {
    await page.goto('/prof/frequencia');
    await expect(page.getByRole('heading', { name: 'Diário de Frequência' }).nth(1)).toBeVisible();
    await expect(page.getByText('Aluno Um')).toBeVisible();
    await page.getByRole('button', { name: 'Salvar Diário' }).click();
  });

  test('Lançar Notas', async ({ page }) => {
    await page.goto('/prof/notas');
    await expect(page.getByRole('heading', { name: 'Lançamento de Redações' })).toBeVisible();
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Salvar nota' }).click();
  });
});

test.describe('Aluno — APIs mockadas', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseAuth(page, 'aluno@test.com', 'stu-self');
    await mockStudentApis(page);
  });

  test('Meu espaço — abas', async ({ page }) => {
    await page.goto('/meu-espaco');
    await expect(page.getByRole('heading', { name: /Olá/i })).toBeVisible();
    await expect(page.getByText('Meio ambiente')).toBeVisible();
    await page.getByRole('button', { name: 'Financeiro' }).click();
    await expect(page.getByRole('heading', { name: 'Minhas Mensalidades' })).toBeVisible();
  });
});
