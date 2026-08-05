import { test, expect, type Page, type TestInfo } from '@playwright/test';

/*
RF-3.1
El sistema debe permitir agregar dominios al carrito y guardarlos en
localStorage sin iniciar sesión.
*/

const URL_BASE = 'https://dev2.registro.gt';

test.use({ ignoreHTTPSErrors: true });

type DominioEnCarrito = {
  domain: string;
  unitPrice: number;
  totalPrice: number;
  years: number;
};

const crearNombreDisponible = () =>
  `qa-carrito-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const cerrarAvisoSiAparece = async (page: Page) => {
  const aviso = page.locator('#testPageNoticeModal');
  const aparecio = await aviso
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (aparecio) {
    await aviso.getByRole('button', { name: 'Entendido' }).click();
    await expect(aviso).toBeHidden();
  }
};

const reservarDominio = async (page: Page, base: string, dominio: string) => {
  await page.goto(`${URL_BASE}/results/?q=${encodeURIComponent(base)}`);
  await cerrarAvisoSiAparece(page);

  const reservar = page.locator(`button[data-domain="${dominio}"]`);
  await expect(reservar).toBeVisible();
  await reservar.click();

  await expect(page).toHaveURL(/\/cart\/?$/);
  await expect(page.getByText(dominio, { exact: true })).toBeVisible();
};

const leerCarrito = async (page: Page) =>
  page.evaluate(() => {
    const contenido = window.localStorage.getItem('domain-cart');
    return contenido ? (JSON.parse(contenido) as DominioEnCarrito[]) : [];
  });

const guardarEvidencia = async (
  page: Page,
  testInfo: TestInfo,
  caso: string,
) => {
  await page.screenshot({
    path: `evidencia/rf3-1/${caso}-${testInfo.project.name}.png`,
    fullPage: true,
  });
};

// TC-19
test('TC-19 - Agregar un dominio disponible al carrito sin iniciar sesión', async ({ page }, testInfo) => {
  const base = crearNombreDisponible();
  const dominio = `${base}.gt`;

  await reservarDominio(page, base, dominio);

  await expect(
    page.getByRole('heading', { name: 'Inicia sesión para continuar' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Carrito/i }).first()).toContainText('1');

  await guardarEvidencia(page, testInfo, 'tc19-dominio-agregado');
});

// TC-20
test('TC-20 - Guardar y conservar el carrito en localStorage', async ({ page }, testInfo) => {
  const base = crearNombreDisponible();
  const dominio = `${base}.gt`;

  await reservarDominio(page, base, dominio);

  const carritoInicial = await leerCarrito(page);
  expect(carritoInicial).toHaveLength(1);
  expect(carritoInicial[0]).toMatchObject({
    domain: dominio,
    unitPrice: 40,
    totalPrice: 40,
    years: 1,
  });

  await page.reload();
  await cerrarAvisoSiAparece(page);

  await expect(page.getByText(dominio, { exact: true })).toBeVisible();
  expect(await leerCarrito(page)).toEqual(carritoInicial);

  await guardarEvidencia(page, testInfo, 'tc20-carrito-persistente');
});

// TC-21
test('TC-21 - Acumular varios dominios en el carrito anónimo', async ({ page }, testInfo) => {
  const base = crearNombreDisponible();
  const dominioGt = `${base}.gt`;
  const dominioComGt = `${base}.com.gt`;

  await reservarDominio(page, base, dominioGt);
  await reservarDominio(page, base, dominioComGt);

  await expect(page.getByText(dominioGt, { exact: true })).toBeVisible();
  await expect(page.getByText(dominioComGt, { exact: true })).toBeVisible();

  const carrito = await leerCarrito(page);
  expect(carrito.map(({ domain }) => domain).sort()).toEqual(
    [dominioComGt, dominioGt].sort(),
  );

  await guardarEvidencia(page, testInfo, 'tc21-varios-dominios');
});
