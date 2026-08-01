import { test, expect } from '@playwright/test';

test('RF-1.2 muestra exactamente las últimas 3 publicaciones', async ({ page }) => {
  await page.goto('https://gt.nic.gt/');

  const seccionNoticias = page
    .getByRole('heading', { name: 'Novedades y Noticias' })
    .locator('..');
  const publicaciones = seccionNoticias.locator('article');

  await expect(seccionNoticias).toBeVisible();
  await expect(publicaciones).toHaveCount(3);
});
