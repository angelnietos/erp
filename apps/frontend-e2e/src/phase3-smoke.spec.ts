import { test, expect } from '@playwright/test';

test.describe('Fase 3 — humo UI', () => {
  test('dashboard muestra el panel principal', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(
      page.getByRole('heading', { name: /dashboard/i }),
    ).toBeVisible();
  });

  test('reportes muestra el generador', async ({ page }) => {
    await page.goto('/reports');
    await expect(
      page.getByRole('heading', { name: /sistema de reportes/i }),
    ).toBeVisible();
  });

  test('la raíz redirige al dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
