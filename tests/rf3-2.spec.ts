import { test, expect, Page } from '@playwright/test';
 
// RF-3.2: El sistema debe requerir que el usuario inicie sesión para poder finalizar
// la compra de los dominios en el carrito.
 


 

async function buscarDominio(page: Page, dominio: string) {
  await page.goto('https://gt.nic.gt/');
  await page.getByRole('checkbox', { name: 'No volver a mostrar este' }).check();
  await page.getByRole('button', { name: 'Entendido' }).click();
 
  const searchBox = page.getByRole('textbox', { name: 'escribe un nombre de dominio' });
  await expect(searchBox).toBeVisible();
  await searchBox.fill(dominio);
  await page.getByRole('button', { name: 'Buscar' }).click();
 
  // Esperar a que el resultado de búsqueda (con el nombre del dominio) esté visible
  // antes de intentar interactuar con sus botones.
  await expect(page.getByText(dominio, { exact: false })).toBeVisible();
}
 
test.describe('Login requerido para finalizar compra', () => {
 
  test('Solicitar inicio de sesión al reservar un dominio', async ({ page }) => {
    const dominio = `dominioprueba18.gt`;
    await buscarDominio(page, dominio);
 
    // Selector robusto: el botón "Reservar" DENTRO del bloque que contiene
    // el dominio que buscamos, no por posición (.nth) que es frágil.
    const reservarBtn = page
      .locator('div', { hasText: dominio })
      .getByRole('button', { name: /Reservar/ })
      .first();
    await reservarBtn.click();
 
    // Verificar que el sistema solicite iniciar sesión
    await expect(page.getByText('Inicia sesión para continuar')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
 
  });
 
  test('El botón "Iniciar Sesión" lleva al flujo de autenticación', async ({ page }) => {
    const dominio = `dominioprueba18.gt`;
    await buscarDominio(page, dominio);
 
    const reservarBtn = page
      .locator('div', { hasText: dominio })
      .getByRole('button', { name: /Reservar/ })
      .first();
    await reservarBtn.click();
 
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
 
    await expect(page.getByText('Bienvenido')).toBeVisible();
    await expect(page.getByPlaceholder('ejemplo@dominio.gt')).toBeVisible();
    
    await expect(
      page.locator('button[type="submit"]', { hasText: 'Iniciar Sesión' })
    ).toBeVisible();
 
  });

});