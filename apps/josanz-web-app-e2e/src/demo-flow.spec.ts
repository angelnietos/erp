import { test, expect } from '@playwright/test';
import { loginAsAlexisDemo } from './support/auth';
import {
  demoStamp,
  expectSuccessToast,
  expectCatalogItemVisible,
  fillClientCoreFields,
  fillOperatorCard,
  openClientFromList,
  openEventFromList,
  pickSelectOption,
} from './support/demo-ui';

const apiHealthUrl =
  process.env['API_HEALTH_URL'] ?? 'http://127.0.0.1:3000/api/health';

test.describe('Demo Alexis — flujo E2E', () => {
  test.beforeEach(async ({ request }, testInfo) => {
    const health = await request.get(apiHealthUrl).catch(() => null);
    test.skip(!health?.ok(), 'Backend no disponible (services:up + db:setup + dev:backend)');
  });

  test('login → cliente (crear/editar) → evento (crear/filtrar) → detalle', async ({
    page,
  }) => {
    const stamp = demoStamp();
    const clientName = `Demo E2E Cliente ${stamp}`;
    const operatorOne = `Operador Uno ${stamp}`;
    const operatorTwo = `Operador Dos ${stamp}`;
    const eventName = `Evento Demo E2E ${stamp}`;
    const clientEmail = `demo.cliente.${stamp}@e2e.local`;
    const clientPhone = '600111222';
    const op1Email = `op1.${stamp}@e2e.local`;
    const op2Email = `op2.${stamp}@e2e.local`;

    await test.step('Login y aterrizaje en eventos', async () => {
      await loginAsAlexisDemo(page);
    });

    await test.step('Crear cliente con un operador', async () => {
      await page.getByRole('link', { name: 'Clientes' }).click();
      await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();

      await page.getByRole('button', { name: 'Añadir Cliente' }).click();
      await expect(page.getByRole('heading', { name: 'Nuevo Cliente' })).toBeVisible();

      await fillClientCoreFields(page, {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        operatorName: operatorOne,
        operatorEmail: op1Email,
        operatorPhone: '600333444',
      });

      await page.getByRole('button', { name: 'Añadir Cliente' }).click();
      await expectSuccessToast(page, /creado/i);
      await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();
    });

    await test.step('Editar cliente y añadir segundo operador', async () => {
      await openClientFromList(page, clientName);
      await expect(page.locator('.josanz-client-edit-skeleton')).toHaveCount(0, {
        timeout: 15_000,
      });

      await page.locator('.josanz-client-form__stack #telefono').fill('600999888');
      await page.getByRole('button', { name: 'Añadir +' }).click();
      await fillOperatorCard(page, 1, {
        name: operatorTwo,
        email: op2Email,
        phone: '600555666',
      });

      const saveBtn = page.locator('.josanz-client-form__footer-actions button');
      await expect(saveBtn).toBeEnabled({ timeout: 15_000 });
      await saveBtn.click();
      await expectSuccessToast(page, /actualizado/i);
    });

    await test.step('Filtros de clientes (búsqueda)', async () => {
      await page.getByRole('link', { name: 'Clientes' }).click();
      await page.getByPlaceholder('Buscar').fill(clientName);
      await expectCatalogItemVisible(page, clientName);
      await page.getByPlaceholder('Buscar').fill('');
    });

    await test.step('Crear evento con el cliente demo', async () => {
      await page.getByRole('link', { name: 'Eventos' }).click();
      await page.getByRole('button', { name: 'Añadir Evento' }).click();
      await expect(page.getByRole('heading', { name: 'Nuevo evento' })).toBeVisible();

      await pickSelectOption(
        page,
        /Nombre y Apellidos.*Razón social/i,
        clientName,
      );
      await pickSelectOption(page, /^Operador$/i, operatorOne);

      await page.locator('#nombre').fill(eventName);
      await page.locator('#localizacion').fill('IFEMA Madrid');

      await page.getByRole('button', { name: 'Crear evento' }).click();
      await expectSuccessToast(page, /creado/i);
      await expect(page.getByRole('heading', { name: 'Eventos' })).toBeVisible();
    });

    await test.step('Filtros de eventos (búsqueda y tipología)', async () => {
      await page.getByPlaceholder('Buscar').fill(eventName);
      await expectCatalogItemVisible(page, eventName);

      await page.getByRole('button', { name: 'Externos' }).click();
      await page.getByPlaceholder('Buscar').fill(eventName);
      await expectCatalogItemVisible(page, eventName);
    });

    await test.step('Detalle del evento: resumen, nota y guardar', async () => {
      await openEventFromList(page, eventName);

      const addInfo = page.getByRole('button', { name: 'Añadir información +' });
      if (await addInfo.isVisible().catch(() => false)) {
        await addInfo.click();
      }

      await page.getByPlaceholder('Descripción del evento…').fill(
        'Descripción añadida en demo E2E',
      );

      await page.getByRole('button', { name: 'Añadir +' }).first().click();
      await page.getByPlaceholder('Escribe una nota…').fill('Nota de producción E2E');
      await page.getByRole('button', { name: 'Añadir +', exact: true }).click();

      await page.getByRole('button', { name: 'Cliente' }).click();
      await expect(page.getByRole('button', { name: /^Operador$/i })).toBeVisible();

      await page.locator('.josanz-event-detail-body').getByRole('button', { name: 'Guardar cambios' }).click();
      await expect(
        page.getByRole('status').filter({ hasText: /guardados correctamente/i }),
      ).toBeVisible({ timeout: 20_000 });
    });
  });
});
