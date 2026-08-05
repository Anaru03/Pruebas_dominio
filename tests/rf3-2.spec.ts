import { test, expect, type Page, type TestInfo } from '@playwright/test';

/*
RF-3.2
El sistema debe requerir que el usuario inicie sesión para poder finalizar la
compra de los dominios en el carrito.
*/

const URL_BASE = 'https://dev2.registro.gt';

test.use({ ignoreHTTPSErrors: true });

const crearNombreDisponible = () =>
  `qa-compra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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

const prepararCarritoAnonimo = async (page: Page) => {
  const base = crearNombreDisponible();
  const dominio = `${base}.gt`;

  await page.goto(`${URL_BASE}/results/?q=${encodeURIComponent(base)}`);
  await cerrarAvisoSiAparece(page);

  await page.locator(`button[data-domain="${dominio}"]`).click();
  await expect(page).toHaveURL(/\/cart\/?$/);
  await expect(page.getByText(dominio, { exact: true })).toBeVisible();

  return dominio;
};

const guardarEvidencia = async (
  page: Page,
  testInfo: TestInfo,
  caso: string,
) => {
  await page.screenshot({
    path: `evidencia/rf3-2/${caso}-${testInfo.project.name}.png`,
    fullPage: true,
  });
};

// TC-22
test('TC-22 - Solicitar autenticación al abrir un carrito con dominios', async ({ page }, testInfo) => {
  await prepararCarritoAnonimo(page);

  await expect(page.locator('#cart-auth-panel')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Inicia sesión para continuar' }),
  ).toBeVisible();
  await expect(
    page.getByText(/necesitas iniciar sesión o crear una cuenta nueva/i),
  ).toBeVisible();

  await guardarEvidencia(page, testInfo, 'tc22-autenticacion-requerida');
});

// TC-23
test('TC-23 - Dirigir al inicio de sesión antes de continuar con la compra', async ({ page }, testInfo) => {
  await prepararCarritoAnonimo(page);

  await page.getByRole('link', { name: 'Iniciar Sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/login\/?$/);
  await cerrarAvisoSiAparece(page);

  await expect(page.getByRole('heading', { name: 'Bienvenido' })).toBeVisible();
  await expect(page.locator('input[type="email"]:visible')).toBeVisible();
  await expect(page.locator('input[type="password"]:visible')).toBeVisible();

  await guardarEvidencia(page, testInfo, 'tc23-formulario-login');
});

// TC-24
test('TC-24 - Impedir finalizar la compra mientras la sesión esté cerrada', async ({ page }, testInfo) => {
  await prepararCarritoAnonimo(page);

  await expect(page.locator('#cart-auth-panel')).toBeVisible();
  await expect(page.locator('#cart-checkout-panel')).toBeHidden();
  await expect(page.locator('#checkout-btn')).toBeHidden();
  await expect(page.getByText('Resumen de compra', { exact: true })).toBeHidden();

  await guardarEvidencia(page, testInfo, 'tc24-compra-bloqueada');
});
