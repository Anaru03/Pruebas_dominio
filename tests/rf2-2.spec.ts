import { test, expect } from '@playwright/test';

//TC-13 - Consultar WHOIS de dominio registrado
test('TC-13 - Consultar WHOIS de dominio registrado', async ({ page }) => {
  await page.goto('https://gt.nic.gt/');
  await page.getByRole('textbox', {name: /escribe un nombre de dominio/i}).fill('usac.gt');
  await page.getByRole('button', {name: 'Buscar'}).click();
  await expect(page.getByRole('heading', { name: 'usac.gt' })).toBeVisible();
});

//TC-14 - Validar que WHOIS corresponde al dominio consultado
test('TC-14 - Validar que WHOIS corresponde al dominio consultado', async ({ page }) => {
  await page.goto('https://gt.nic.gt/');
  await page.getByRole('textbox', {name: /escribe un nombre de dominio/i}).fill('usac.gt');
  await page.getByRole('button', {name: 'Buscar'}).click();
  await expect(page.getByRole('heading', { name: 'usac.gt' })).toBeVisible();
  await expect(page.locator('body')).toContainText('usac.gt');
});

//TC-15 - Consultar varios dominios registrados
test('TC-15 - Consultar varios dominios registrados', async ({ page }) => {
  await page.goto('https://gt.nic.gt/');
  await page.getByRole('textbox', {name: /escribe un nombre de dominio/i}).fill('usac.gt');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('heading', { name: 'usac.gt' })).toBeVisible();
  await page.goto('https://gt.nic.gt/');
  await page.getByRole('textbox', {name: /escribe un nombre de dominio/i}).fill('intelaf.com.gt');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('heading', { name: 'intelaf.com.gt' })).toBeVisible();
});
