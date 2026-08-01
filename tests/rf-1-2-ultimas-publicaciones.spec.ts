import { test, expect } from '@playwright/test';

type PublicacionWordPress = {
  title: { rendered: string };
};

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

test('RF-1.2 presenta las 3 publicaciones más recientes de noticias', async ({
  page,
  request,
}) => {
  const respuesta = await request.get(
    'https://news.registro.gt/wp-json/wp/v2/posts?categories=1&per_page=3&orderby=date&order=desc&_fields=title',
  );

  expect(respuesta.ok()).toBeTruthy();
  const ultimasPublicaciones = (await respuesta.json()) as PublicacionWordPress[];
  expect(ultimasPublicaciones).toHaveLength(3);

  await page.goto('https://gt.nic.gt/');
  const titulosMostrados = await page
    .getByRole('heading', { name: 'Novedades y Noticias' })
    .locator('..')
    .locator('article h3')
    .allTextContents();

  const titulosEsperados = ultimasPublicaciones.map((publicacion) =>
    normalizarTexto(publicacion.title.rendered),
  );

  expect(titulosMostrados.map(normalizarTexto)).toEqual(titulosEsperados);
});
