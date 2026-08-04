import { test, expect, type Page } from '@playwright/test';

/*
RF-2.3
El sistema debe incluir una herramienta IDN para traducir nombres con
caracteres especiales a Punycode y viceversa.
*/

const URL_IDN = 'https://dev2.registro.gt/idn/';

/*
El certificado de dev2.registro.gt está emitido únicamente para dev.registro.gt,
por lo que el navegador debe aceptar la discrepancia para poder cargar el sitio.
*/
test.use({ ignoreHTTPSErrors: true });

const abrirHerramientaIdn = async (page: Page) => {
  await page.goto(URL_IDN);

  /*
  El entorno de pruebas muestra un aviso modal ("Página de Pruebas") que bloquea
  la interacción con el resto de la página hasta que el usuario lo cierra.
  */
  const aviso = page.locator('#testPageNoticeModal');

  await page.getByRole('button', { name: 'Entendido' }).click();
  await expect(aviso).toBeHidden();

  return {
    entrada: page.locator('#idnInput'),
    salida: page.locator('#idnOutput'),
    error: page.locator('#idnError'),
    convertir: page.getByRole('button', { name: 'CONVERTIR' }),
    limpiar: page.getByRole('button', { name: 'Limpiar campos' }),
  };
};

// TC-16
test('TC-16 - Verificar la conversión de dominios con caracteres especiales a Punycode', async ({ page }) => {

  const conversiones = [
    { dominio: 'niño.gt', punycode: 'xn--nio-8ma.gt' },
    { dominio: 'café.gt', punycode: 'xn--caf-dma.gt' },
    { dominio: 'güisquil.gt', punycode: 'xn--gisquil-n2a.gt' },
    { dominio: 'piñata.com.gt', punycode: 'xn--piata-pta.com.gt' },
  ];

  const idn = await abrirHerramientaIdn(page);

  for (const { dominio, punycode } of conversiones) {
    await idn.entrada.fill(dominio);
    await idn.convertir.click();

    await expect(idn.salida).toHaveValue(punycode);
    await expect(idn.error).toBeHidden();
  }

});

// TC-17
test('TC-17 - Verificar la conversión inversa de Punycode a caracteres especiales', async ({ page }) => {

  const idn = await abrirHerramientaIdn(page);

  await idn.entrada.fill('xn--nio-8ma.gt');
  await idn.convertir.click();

  await expect(idn.salida).toHaveValue('niño.gt');

});

// TC-18
test('TC-18 - Verificar la validación de entradas inválidas y el restablecimiento de los campos', async ({ page }) => {

  const entradasInvalidas = [
    { dominio: '', mensaje: 'El dominio no puede estar vacío.' },
    { dominio: '-niño.gt', mensaje: 'El dominio no puede empezar ni terminar con guion (-).' },
    { dominio: `${'a'.repeat(64)}.gt`, mensaje: 'El dominio no puede superar los 63 caracteres.' },
  ];

  const idn = await abrirHerramientaIdn(page);

  for (const { dominio, mensaje } of entradasInvalidas) {
    await idn.entrada.fill(dominio);
    await idn.convertir.click();

    await expect(idn.error).toBeVisible();
    await expect(idn.error).toHaveText(mensaje);
    await expect(idn.salida).toHaveValue('');
  }

  await idn.entrada.fill('niño.gt');
  await idn.convertir.click();

  await expect(idn.salida).toHaveValue('xn--nio-8ma.gt');

  await idn.limpiar.click();

  await expect(idn.entrada).toHaveValue('');
  await expect(idn.salida).toHaveValue('');
  await expect(idn.error).toBeHidden();

});
