import { test, expect, type Page, type TestInfo } from '@playwright/test';

/*
RF-1.3
El sistema debe mostrar estadísticas de dominios registrados por subdominio,
filtradas por un rango de fechas, en la sección de "Estadísticas".
*/

const URL_ESTADISTICAS = 'https://dev2.registro.gt/estadisticas/';

test.use({ ignoreHTTPSErrors: true });

const cerrarAvisoDePruebas = async (page: Page) => {
  const aviso = page.locator('#testPageNoticeModal');

  await aviso.waitFor({ state: 'visible', timeout: 10_000 });
  await aviso.getByRole('button', { name: 'Entendido' }).click();
  await expect(aviso).toBeHidden();
};

const abrirEstadisticas = async (page: Page) => {
  await page.goto(URL_ESTADISTICAS);
  await cerrarAvisoDePruebas(page);

  return {
    fechas: page.locator('input[type="date"]'),
    sufijo: page.locator('select'),
    consultar: page.getByRole('button', { name: /Consultar/i }),
    tabla: page.getByRole('table'),
  };
};

const guardarEvidencia = async (
  page: Page,
  testInfo: TestInfo,
  caso: string,
) => {
  await page.screenshot({
    path: `evidencia/rf1-3/${caso}-${testInfo.project.name}.png`,
    fullPage: true,
  });
};

// TC-07
test('TC-07 - Mostrar el resumen y desglose de estadísticas por subdominio', async ({ page }, testInfo) => {
  const estadisticas = await abrirEstadisticas(page);

  await expect(
    page.getByRole('heading', { name: 'Estadísticas de Dominios .GT' }),
  ).toBeVisible();
  await expect(page.getByText(/Total de Dominios/i, { exact: true })).toBeVisible();
  await expect(page.locator('#suffixChart')).toBeVisible();
  await expect(page.locator('#statusChart')).toBeVisible();
  await expect(estadisticas.tabla).toBeVisible();
  await expect(estadisticas.tabla.getByText('.com.gt', { exact: true })).toBeVisible();
  await expect(estadisticas.tabla.getByText('.gt', { exact: true })).toBeVisible();
  await expect(
    estadisticas.tabla.getByText(/Total General/i, { exact: true }),
  ).toBeVisible();

  await guardarEvidencia(page, testInfo, 'tc07-resumen');
});

// TC-08
test('TC-08 - Filtrar el desglose por un sufijo específico', async ({ page }, testInfo) => {
  const estadisticas = await abrirEstadisticas(page);

  await estadisticas.sufijo.selectOption('.edu.gt');
  await estadisticas.consultar.click();

  await expect(estadisticas.sufijo).toHaveValue('.edu.gt');
  await guardarEvidencia(page, testInfo, 'tc08-filtro-sufijo');

  const filasDeDatos = estadisticas.tabla
    .locator('tbody tr')
    .filter({ hasNotText: 'TOTAL GENERAL' });

  await expect(filasDeDatos).toHaveCount(1);
  await expect(filasDeDatos.first().locator('td').first()).toHaveText('.edu.gt');
});

// TC-09
test('TC-09 - Actualizar las estadísticas al cambiar el rango de fechas', async ({ page }, testInfo) => {
  const estadisticas = await abrirEstadisticas(page);
  const desgloseInicial = await estadisticas.tabla.innerText();

  await estadisticas.fechas.nth(0).fill('2026-02-01');
  await estadisticas.fechas.nth(1).fill('2026-02-28');
  await estadisticas.consultar.click();

  await expect(estadisticas.fechas.nth(0)).toHaveValue('2026-02-01');
  await expect(estadisticas.fechas.nth(1)).toHaveValue('2026-02-28');
  await guardarEvidencia(page, testInfo, 'tc09-filtro-fechas');

  const desgloseFiltrado = await estadisticas.tabla.innerText();
  expect(desgloseFiltrado.trim()).not.toBe(desgloseInicial.trim());
});
