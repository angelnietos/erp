import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const appPort = process.env['E2E_APP_PORT'] ?? '4300';
const baseURL = process.env['BASE_URL'] ?? `http://localhost:${appPort}`;
const apiHealthUrl =
  process.env['API_HEALTH_URL'] ?? 'http://127.0.0.1:3000/api/health';

/**
 * E2E demo Figma (josanz-web-app).
 * Requiere Postgres con seed (`pnpm run db:setup`) y Redis para sesión BFF.
 *
 * Arranque manual:
 *   pnpm run services:up && pnpm run db:setup && pnpm run keycloak:sync
 *   pnpm run dev:backend
 *   pnpm exec nx run josanz-web-app:serve
 *
 * Ejecutar:
 *   pnpm exec nx e2e josanz-web-app-e2e
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  timeout: 120_000,
  expect: { timeout: 20_000 },
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'pnpm exec nx run backend:serve',
      url: apiHealthUrl,
      reuseExistingServer: true,
      cwd: workspaceRoot,
      timeout: 180_000,
    },
    {
      command: 'pnpm exec nx run josanz-web-app:serve',
      url: baseURL,
      reuseExistingServer: true,
      cwd: workspaceRoot,
      timeout: 180_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
