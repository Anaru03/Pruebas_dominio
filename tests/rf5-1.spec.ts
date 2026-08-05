import { test, expect } from '@playwright/test';

/*
RF-5.1
El sistema debe soportar y permitir alternar el idioma de la interfaz entre español e inglés.
*/

// TC-31
test('TC-31 - Cambiar el idioma de español a inglés', async ({ page }) => {

  await page.goto('https://gt.nic.gt/');

  await page.getByRole('button', { name: 'Entendido' }).click();

  await page.getByRole('link', { name: 'EN', exact: true }).click();

  await expect(page).toHaveURL(/\/en/);

  await expect(
    page.getByRole('button', { name: 'Search' })
  ).toBeVisible();

});

// TC-32
test('TC-32 - Cambiar el idioma de inglés a español', async ({ page }) => {

  await page.goto('https://gt.nic.gt/en');

  await page.getByRole('button', { name: 'Understood' }).click();

  await page.getByRole('link', { name: 'ES', exact: true }).click();

  await expect(page).not.toHaveURL(/\/en/);

  await expect(
    page.getByRole('button', { name: 'Buscar' })
  ).toBeVisible();

});

// TC-33
test('TC-33 - Verificar que los textos cambian al seleccionar otro idioma', async ({ page }) => {

  await page.goto('https://gt.nic.gt/');

  await page.getByRole('button', { name: 'Entendido' }).click();

  await page.getByRole('link', { name: 'EN', exact: true }).click();

  await expect(page).toHaveURL(/\/en/);

  await expect(
      page.getByRole('button', { name: 'Search' })
  ).toBeVisible();

});