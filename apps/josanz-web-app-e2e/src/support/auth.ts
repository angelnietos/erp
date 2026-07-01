import { expect, type Page } from '@playwright/test';

export const E2E_ALEXIS_EMAIL =
  process.env['E2E_LOGIN_EMAIL'] ?? 'admin@alexis.local';
export const E2E_ALEXIS_PASSWORD =
  process.env['E2E_LOGIN_PASSWORD'] ?? 'Admin123!';

/** Login local BFF (sin redirección a Keycloak). */
export async function loginAsAlexisDemo(page: Page): Promise<void> {
  await page.goto('/auth/login?local=1');
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible({
    timeout: 20_000,
  });

  await page.locator('#email').fill(E2E_ALEXIS_EMAIL);
  await page.locator('#password').fill(E2E_ALEXIS_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await expect(page).toHaveURL(/\/events/, { timeout: 45_000 });
  await expect(page.getByRole('heading', { name: 'Eventos' })).toBeVisible({
    timeout: 20_000,
  });
}
