import { test, expect } from '@playwright/test';

test('RF-1.2 cada publicación contiene título, fecha y extracto', async ({ page }) => {
  await page.goto('https://gt.nic.gt/');

  const publicaciones = page
    .getByRole('heading', { name: 'Novedades y Noticias' })
    .locator('..')
    .locator('article');

  await expect(publicaciones).toHaveCount(3);

  for (const publicacion of await publicaciones.all()) {
    const titulo = publicacion.locator('h3');
    const fecha = publicacion.locator('h3 + p');
    const extracto = publicacion.locator(':scope > p');

    await expect(titulo).toBeVisible();
    await expect(titulo).not.toHaveText(/^\s*$/);
    await expect(fecha).toHaveText(
      /^\s*\d{1,2} de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de \d{4}\s*$/i,
    );
    await expect(extracto).toBeVisible();
    await expect(extracto).not.toHaveText(/^\s*$/);
  }
});
