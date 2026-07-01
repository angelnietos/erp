import { expect, type Page } from '@playwright/test';

export function demoStamp(): number {
  return Date.now();
}

export async function pickSelectOption(
  page: Page,
  fieldLabel: RegExp,
  optionLabel: string,
): Promise<void> {
  await page.getByRole('button', { name: fieldLabel }).click();
  await page.getByRole('option', { name: optionLabel, exact: true }).click();
}

export async function fillClientCoreFields(
  page: Page,
  data: {
    name: string;
    email: string;
    phone: string;
    operatorName: string;
    operatorEmail: string;
    operatorPhone: string;
  },
): Promise<void> {
  const clientFields = page.locator('.josanz-client-form__stack');
  await clientFields.locator('#razonSocial').fill(data.name);
  await clientFields.locator('#email').fill(data.email);
  await clientFields.locator('#telefono').fill(data.phone);

  const operatorCard = page.locator('.josanz-client-create__operator-card').first();
  await operatorCard.locator('#nombre').fill(data.operatorName);
  await operatorCard.locator('#email').fill(data.operatorEmail);
  await operatorCard.locator('#telefono').fill(data.operatorPhone);
}

export async function fillOperatorCard(
  page: Page,
  index: number,
  data: { name: string; email: string; phone: string },
): Promise<void> {
  const operatorCard = page.locator('.josanz-client-create__operator-card').nth(index);
  await operatorCard.locator('input').first().fill(data.name);
  await operatorCard.locator('input[type="email"]').fill(data.email);
  await operatorCard.locator('input[type="tel"]').fill(data.phone);
}

export async function expectSuccessToast(page: Page, pattern: RegExp): Promise<void> {
  await expect(page.getByRole('status').filter({ hasText: pattern })).toBeVisible({
    timeout: 20_000,
  });
}

export async function openClientFromList(page: Page, clientName: string): Promise<void> {
  await page.getByPlaceholder('Buscar').fill(clientName);
  await page.getByRole('button', { name: `Abrir ${clientName}` }).click();
  await expect(page.getByRole('heading', { name: 'Editar Cliente' })).toBeVisible({
    timeout: 15_000,
  });
}

function eventListRow(page: Page, eventName: string) {
  return page
    .locator('josanz-adaptive-list-rows')
    .getByRole('button')
    .filter({ hasText: eventName });
}

export async function openEventFromList(page: Page, eventName: string): Promise<void> {
  await page.getByPlaceholder('Buscar').fill(eventName);
  await eventListRow(page, eventName).first().click();
  await expect(page.getByRole('button', { name: 'Resumen' })).toBeVisible({
    timeout: 20_000,
  });
}

export async function expectCatalogItemVisible(page: Page, title: string): Promise<void> {
  await expect(page.getByRole('button', { name: `Abrir ${title}` })).toBeVisible({
    timeout: 25_000,
  });
}

export async function expectEventVisible(page: Page, eventName: string): Promise<void> {
  await expect(eventListRow(page, eventName).first()).toBeVisible({
    timeout: 25_000,
  });
}
