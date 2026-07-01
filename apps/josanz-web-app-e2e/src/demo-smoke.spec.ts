import { test } from '@playwright/test';
import { loginAsAlexisDemo } from './support/auth';

const apiHealthUrl =
  process.env['API_HEALTH_URL'] ?? 'http://127.0.0.1:3000/api/health';

test.describe('Demo Alexis — smoke', () => {
  test.beforeEach(async ({ request }, testInfo) => {
    const health = await request.get(apiHealthUrl).catch(() => null);
    test.skip(!health?.ok(), 'Backend no disponible (services:up + db:setup + dev:backend)');
  });

  test('login local y listado de eventos', async ({ page }) => {
    await loginAsAlexisDemo(page);
  });
});
