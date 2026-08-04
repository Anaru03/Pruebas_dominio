import { test, expect } from '@playwright/test';

//RF-2.1 El sistema debe incluir un buscador para verificar la disponibilidad de dominios.



test('Buscar dominio disponible', async({ page })=> {
    await page.goto("https://gt.nic.gt/");
    await page.getByRole('button', { name: 'Entendido' }).click();

    //validar titulo
    await expect(page).toHaveTitle(/Registro de dominios/i);

    //validar cuadro de busqueda
    const searchBox = page.getByRole('textbox', {name: 'escribe un nombre de dominio'});
    await expect(searchBox).toBeVisible();

    //busqueda
    await searchBox.fill("dominioprueba18.gt");
    await page.getByRole('button', { name: 'Buscar' }).click();

    await page.getByRole('button', { name: 'Entendido' }).click();

    await expect(page.getByText('Disponibles para registro')).toBeVisible();
    await expect(page.getByText('dominioprueba18.gt')).toBeVisible();

});


test('Buscar dominio existente', async ({ page }) => {

    await page.goto("https://gt.nic.gt/");
    await page.getByRole('button', { name: 'Entendido' }).click();

    const searchBox = page.getByRole('textbox', {
        name: 'escribe un nombre de dominio'
    });

    await expect(searchBox).toBeVisible();

    const dominio = "uvg.edu.gt";

    await searchBox.fill(dominio);

    await page.getByRole('button', {
        name: 'Buscar'
    }).click();

    // Verificar que aparecen dominios relacionados
    await expect(page.getByText(dominio)).toBeVisible();


    // Verificar que existe la opción para solicitar el dominio
    await expect(
        page.getByRole('button', { name: 'Solicitar' }).first()
    ).toBeVisible();

});

test('Buscar dominio sin extensión', async ({ page }) => {

    await page.goto("https://gt.nic.gt/");
    await page.getByRole('button', { name: 'Entendido' }).click();

    const searchBox = page.getByRole('textbox', {
        name: 'escribe un nombre de dominio'
    });

    await searchBox.fill("dominioprueba18");

    await page.getByRole('button', {
        name: 'Buscar'
    }).click();

    await expect(page.getByText('Disponibles para registro')).toBeVisible();

    await expect(page.getByText('dominioprueba18.gt')).toBeVisible();

    await expect(page.getByText('dominioprueba18.com.gt')).toBeVisible();

});
