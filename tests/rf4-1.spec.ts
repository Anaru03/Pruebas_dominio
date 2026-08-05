import { test, expect } from '@playwright/test';

//TC-25 - Acceder a la información de renovación sin iniciar sesión
test('TC-25 - Acceder a la información de renovación sin iniciar sesión', async ({ page }) => {
  await page.goto('https://gt.nic.gt/');
  await page.getByRole('link', { name: 'Procedimientos' }).click();
  await page.getByRole('button', {name: /autorenew Renovación/i}).click();
  await expect(page.getByRole('heading', { name: /Pasos para Verificación/i })).toBeVisible();
});

//TC-26 - Visualizar los pasos de renovación
test('TC-26 - Visualizar los pasos de renovación', async ({ page }) => {
  await page.goto('https://gt.nic.gt/');
  await page.getByRole('link', { name: 'Procedimientos' }).click();
  await page.getByRole('button', {name: /autorenew Renovación/i}).click();
  await expect(page.getByText('Verificar Estado')).toBeVisible();
  await expect(page.getByText('Validar Contactos')).toBeVisible();
  await expect(page.getByText('Seleccionar Período')).toBeVisible();
});

//TC-27 - Visualizar información de pago para renovación
test('TC-27 - Visualizar información de pago para renovación', async ({ page }) => {
  await page.goto('https://gt.nic.gt/');
  await page.getByRole('link', { name: 'Procedimientos' }).click();
  await page.getByRole('button', {name: /autorenew Renovación/i}).click();
  await expect(page.getByText(/Detalles de Pago/i)).toBeVisible();
  await expect(page.getByText(/Aceptamos los siguientes métodos/i)).toBeVisible();
});
