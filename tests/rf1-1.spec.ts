import { test, expect } from '@playwright/test';

/*
RF-1.1
El sistema debe mostrar la información principal del servicio de
registro de dominios en la página de inicio.
*/

// TC-01
test('TC-01 - Verificar que la página principal cargue correctamente', async ({ page }) => {

  await page.goto('https://gt.nic.gt/');

  await expect(page).toHaveURL('https://gt.nic.gt/');

});

// TC-02
test('TC-02 - Verificar que el botón Buscar sea visible', async ({ page }) => {

  await page.goto('https://gt.nic.gt/');

  await expect(
    page.getByRole('button', { name: 'Buscar' })
  ).toBeVisible();

});

// TC-03
test('TC-03 - Verificar que el campo de búsqueda de dominios esté disponible', async ({ page }) => {

  await page.goto('https://gt.nic.gt/');

  await expect(
    page.getByRole('textbox')
  ).toBeVisible();

});