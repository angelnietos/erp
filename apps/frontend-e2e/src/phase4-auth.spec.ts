import { test, expect } from '@playwright/test';

const apiOrigin = process.env['API_ORIGIN'] || 'http://127.0.0.1:3000';

test.describe('Fase 4 — login, tenant y API', () => {
  test('login seed y recibos visibles', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/e-mail/i).fill('admin@josanz.com');
    await page.getByLabel(/contraseña/i).fill('Admin123!');
    await page.getByRole('button', { name: /acceder/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 45_000 });

    await page.goto('/receipts');
    await expect(
      page.getByRole('heading', { name: /recibos y pagos/i }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('POST dominio event + auditoría (cabecera tenant)', async ({
    page,
  }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/e-mail/i).fill('admin@josanz.com');
    await page.getByLabel(/contraseña/i).fill('Admin123!');
    await page.getByRole('button', { name: /acceder/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 45_000 });

    const tenantId = await page.evaluate(() =>
      localStorage.getItem('tenant_id'),
    );
    expect(tenantId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    const token = await page.evaluate(() =>
      localStorage.getItem('auth_token'),
    );
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId as string,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await page.request.post(`${apiOrigin}/api/domain-events`, {
      data: {
        eventType: 'E2E.Phase4Smoke',
        aggregateType: 'E2E',
        aggregateId: `e2e-${Date.now()}`,
        payload: { source: 'playwright' },
      },
      headers,
    });
    expect(res.ok(), await res.text()).toBeTruthy();

    await page.goto('/audit');
    await expect(
      page.getByRole('heading', { name: /sistema de auditoría/i }),
    ).toBeVisible({ timeout: 15_000 });

    const row = page.locator('.log-item').filter({ hasText: /E2E ·/i }).first();
    await expect(row).toBeVisible({ timeout: 20_000 });
    await row.locator('.log-summary').click();
    await expect(row.getByText('E2E.Phase4Smoke')).toBeVisible({
      timeout: 10_000,
    });
  });
});
