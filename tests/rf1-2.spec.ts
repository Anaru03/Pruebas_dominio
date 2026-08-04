import { test, expect, type Page } from '@playwright/test';

/*
RF-1.2
El sistema debe mostrar un resumen (título, fecha, extracto) de las últimas 3
publicaciones de la sección de noticias de news.registro.gt.
*/

type PublicacionWordPress = {
  title: { rendered: string };
};

const obtenerPublicaciones = (page: Page) =>
  page
    .getByRole('heading', { name: 'Novedades y Noticias' })
    .locator('..')
    .locator('article');

const normalizarTexto = (texto: string) =>
  texto
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, codigo) => String.fromCodePoint(Number(codigo)))
    .replace(/&#x([0-9a-f]+);/gi, (_, codigo) =>
      String.fromCodePoint(Number.parseInt(codigo, 16)),
    )
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

// TC-04
test('TC-04 - Verificar que se muestren exactamente 3 publicaciones', async ({ page }) => {

  await page.goto('https://gt.nic.gt/');

  const publicaciones = obtenerPublicaciones(page);

  await expect(publicaciones).toHaveCount(3);

});

// TC-05
test('TC-05 - Verificar que cada publicación contenga título, fecha y extracto', async ({ page }) => {

  await page.goto('https://gt.nic.gt/');

  const publicaciones = obtenerPublicaciones(page);

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

// TC-06
test('TC-06 - Verificar que se presenten las 3 publicaciones más recientes', async ({ page, request }) => {

  const respuesta = await request.get(
    'https://news.registro.gt/wp-json/wp/v2/posts?categories=1&per_page=3&orderby=date&order=desc&_fields=title',
  );

  expect(respuesta.ok()).toBeTruthy();

  const ultimasPublicaciones = (await respuesta.json()) as PublicacionWordPress[];

  expect(ultimasPublicaciones).toHaveLength(3);

  await page.goto('https://gt.nic.gt/');

  const titulosMostrados = await obtenerPublicaciones(page)
    .locator('h3')
    .allTextContents();
  const titulosEsperados = ultimasPublicaciones.map((publicacion) =>
    normalizarTexto(publicacion.title.rendered),
  );

  expect(titulosMostrados.map(normalizarTexto)).toEqual(titulosEsperados);

});
