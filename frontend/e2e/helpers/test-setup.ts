import type { Page } from '@playwright/test';

/** Simula sessão Supabase no localStorage para o PrivateRoute liberar rotas. */
export async function mockSupabaseAuth(page: Page, email = 'admin@test.com', userId = 'e2e-user-id') {
  await page.addInitScript(
    ({ email: em, userId: uid }) => {
      const fakeSession = {
        provider_token: null,
        access_token: 'e2e-fake-jwt',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'e2e-refresh',
        token_type: 'bearer',
        user: {
          id: uid,
          aud: 'authenticated',
          role: 'authenticated',
          email: em,
          app_metadata: { provider: 'email' },
          user_metadata: {},
        },
      };
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function (key: string) {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          return JSON.stringify(fakeSession);
        }
        return originalGetItem.call(this, key);
      };
    },
    { email, userId },
  );
}

export async function mockAdminApis(page: Page) {
  const me = {
    id: 'e2e-user-id',
    email: 'admin@test.com',
    name: 'Admin E2E',
    role: 'ADMIN',
  };
  const classes = [
    { id: 'class-r1', name: 'R1', schedule: 'Terça | 18h', description: 'Redação', maxStudents: 30 },
    { id: 'class-ex1', name: 'EX1', schedule: 'Seg | 19h', description: 'Exatas', maxStudents: 30 },
  ];
  const students = [
    {
      id: 'stu-1',
      name: 'Aluno E2E',
      email: 'aluno@e2e.dev',
      enrollments: [{ class: { name: 'R1' }, discountPercent: 0 }],
      finances: [],
    },
  ];
  const essayState = {
    id: 'essay-1',
    theme: 'Tema Playwright',
    total: 920,
    isValidated: false,
    createdAt: new Date().toISOString(),
    user: { name: 'Aluno E2E', email: 'aluno@e2e.dev' },
    class: { name: 'R1' },
  };
  const finances = [
    {
      id: 'fin-1',
      userId: 'stu-1',
      value: 400,
      dueDate: new Date().toISOString(),
      status: 'PENDING',
      user: { name: 'Aluno E2E' },
    },
  ];

  const json = (body: unknown, status = 200) => ({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

  await page.route('**/api/me', (route) => route.fulfill(json(me)));
  await page.route('**/api/classes', (route) => route.fulfill(json(classes)));
  await page.route('**/api/students', (route) => route.fulfill(json(students)));
  await page.route('**/api/essays', (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    return route.fulfill(json([essayState]));
  });
  await page.route('**/api/finance', (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    return route.fulfill(json(finances));
  });
  await page.route('**/api/essays/*/validate', (route) => {
    if (route.request().method() === 'PUT') {
      essayState.isValidated = true;
      return route.fulfill(json({ ...essayState }));
    }
    return route.fallback();
  });
  await page.route('**/api/finance/*/pay', (route) => {
    if (route.request().method() === 'PUT') {
      return route.fulfill(json({ ...finances[0], status: 'PAID' }));
    }
    return route.fallback();
  });
  await page.route('**/api/admin/students', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill(json({ id: 'new-stu', email: 'novo@e2e.dev' }, 201));
    }
    return route.fallback();
  });
  await page.route('**/api/enrollments', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill(json({ id: 'enr-1' }, 201));
    }
    return route.fallback();
  });
}

export async function mockProfessorApis(page: Page) {
  const me = {
    id: 'prof-id',
    email: 'prof@test.com',
    name: 'Prof E2E',
    role: 'PROFESSOR',
  };
  const classes = [{ id: 'c1', name: 'R1', schedule: 'Terça', description: null, maxStudents: 30 }];
  const enrollments = [
    { id: 'enr-1', user: { id: 'u1', name: 'Aluno Um', email: 'a@e2e.dev' } },
  ];
  const attendances: unknown[] = [];

  const json = (body: unknown, status = 200) => ({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

  await page.route('**/api/me', (route) => route.fulfill(json(me)));
  await page.route('**/api/classes', (route) => route.fulfill(json(classes)));
  await page.route('**/api/enrollments/class/**', (route) => route.fulfill(json(enrollments)));
  await page.route(/.*\/api\/attendances(\?.*)?$/, (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    return route.fulfill(json(attendances));
  });
  await page.route('**/api/attendances/batch', (route) => {
    if (route.request().method() === 'POST') return route.fulfill(json([{ ok: true }]));
    return route.fallback();
  });
  await page.route('**/api/essays', (route) => {
    if (route.request().method() === 'POST') return route.fulfill(json({ id: 'new-essay', total: 800 }, 201));
    return route.fallback();
  });
}

export async function mockStudentApis(page: Page) {
  const me = {
    id: 'stu-self',
    email: 'aluno@test.com',
    name: 'Aluno Painel',
    role: 'ALUNO',
  };
  const enrollments = [
    {
      id: 'enr-self',
      classId: 'c1',
      class: { name: 'R2', schedule: 'Terça | 19h30' },
    },
  ];
  const essays = [
    {
      id: 'e1',
      theme: 'Meio ambiente',
      total: 880,
      feedback: 'Ótimo!',
      isValidated: true,
      createdAt: new Date().toISOString(),
      class: { name: 'R2' },
    },
  ];
  const finances = [
    { id: 'f1', value: 350, dueDate: new Date().toISOString(), status: 'PAID' },
  ];
  const attendances = [
    {
      id: 'a1',
      date: new Date().toISOString(),
      status: 'PRESENTE',
      replacementDate: null,
      enrollment: { class: { name: 'R2' } },
    },
  ];

  const json = (body: unknown, status = 200) => ({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

  await page.route('**/api/me', (route) => route.fulfill(json(me)));
  await page.route('**/api/enrollments/me', (route) => route.fulfill(json(enrollments)));
  await page.route('**/api/essays/me', (route) => route.fulfill(json(essays)));
  await page.route('**/api/finance/me', (route) => route.fulfill(json(finances)));
  await page.route('**/api/attendances/me', (route) => route.fulfill(json(attendances)));
  await page.route('**/api/essays', (route) => {
    if (route.request().method() === 'POST') return route.fulfill(json({ id: 'new', total: 600 }, 201));
    return route.fallback();
  });
}
