# Pruebas de dominio .gt

Proyecto de pruebas funcionales de caja negra para la plataforma de registro de
dominios `.gt`. Las pruebas automatizadas utilizan Playwright y se ejecutan en
Chromium, Firefox y WebKit. Los flujos que requieren pagos, correos o condiciones
que el sistema no ofrece se documentan como pruebas manuales.

## Requisitos evaluados

| Requisito | Descripción | Método | Casos |
|---|---|---|---:|
| RF-1.1 | Información principal del servicio en la página de inicio | Automatizado | 3 |
| RF-1.2 | Resumen de las últimas tres publicaciones | Automatizado | 3 |
| RF-1.3 | Estadísticas por subdominio y rango de fechas | Automatizado | 3 |
| RF-2.1 | Buscador para verificar disponibilidad de dominios | Automatizado | 3 |
| RF-2.3 | Conversión de nombres IDN a Punycode y viceversa | Automatizado | 3 |
| RF-4.2 | Renovación, pago, facturación y notificaciones | Manual | 3 |

## Estructura

```text
tests/
├── rf1-1.spec.ts   # Página principal
├── rf1-2.spec.ts   # Publicaciones de noticias
├── rf1-3.spec.ts   # Estadísticas y filtros
├── rf2-1.spec.ts   # Disponibilidad de dominios
├── rf2-3.spec.ts   # Herramienta IDN/Punycode
└── rf4-2.md        # Diseño y resultados de renovación manual
```

## Requisitos para ejecutar el proyecto

- Node.js y npm.
- Conexión a Internet.
- Acceso a `https://gt.nic.gt/`.
- Navegadores de Playwright instalados.

## Instalación

```powershell
npm install
npx playwright install
```

## Ejecución

Ejecutar todas las pruebas automatizadas:

```powershell
npm test
```

Ejecutar un requisito específico:

```powershell
npx playwright test tests/rf1-1.spec.ts
npm run test:rf-1.2
npm run test:rf-1.3
npx playwright test tests/rf2-1.spec.ts
npm run test:rf-2.3
```

Ejecutar solamente en Chromium:

```powershell
npm test -- --project=chromium
```

Abrir el último reporte HTML:

```powershell
npx playwright show-report
```

## Cobertura automatizada

### RF-1.1 — Página principal

- Carga correcta de la página.
- Visibilidad del botón de búsqueda.
- Disponibilidad del campo de búsqueda de dominios.

### RF-1.2 — Publicaciones

- Presentación de exactamente tres publicaciones.
- Presencia de título, fecha y extracto en cada publicación.
- Comparación con las tres publicaciones más recientes de
  `news.registro.gt`.

### RF-2.1 — Buscador de dominios

- Búsqueda de un dominio disponible.
- Búsqueda de un dominio existente.
- Búsqueda sin especificar una extensión.

### RF-2.3 — Herramienta IDN

- Conversión de caracteres especiales a Punycode.
- Conversión inversa de Punycode a caracteres especiales.
- Validación de entradas inválidas y limpieza de campos.

El entorno de RF-2.3 utiliza un certificado que no coincide con el host de
pruebas. El archivo configura `ignoreHTTPSErrors` solamente para esos casos.

### RF-1.3 — Estadísticas

- Presentación del resumen, gráficas y desglose por sufijo.
- Aplicación de un filtro de sufijo específico.
- Actualización de resultados al cambiar el rango de fechas.

Los casos TC-08 y TC-09 están diseñados para detectar el defecto observado en
el entorno de pruebas: el botón **Consultar** conserva los valores elegidos,
pero no modifica el desglose ni realiza una consulta de datos.

## RF-4.2 — Pruebas manuales

La renovación no se automatizó porque requiere una cuenta autorizada, un
dominio renovable, una pasarela sandbox y acceso a los correos de los contactos
Administrativo, Técnico y Cobro.

Durante la exploración se encontró que el dashboard muestra el dominio
`magic.com.gt` como activo, pero la única acción disponible es **Gestionar**. No
existe una opción para renovar, seleccionar años o pagar la renovación. El pago
disponible corresponde a comprar un dominio nuevo y no demuestra RF-4.2.

Por esta razón:

- El caso principal de renovación queda fallido.
- La comprobación de facturación queda bloqueada.
- La comprobación de notificaciones queda bloqueada.
- RF-4.2 se considera fallido por ausencia del flujo de renovación.

Los pasos, precondiciones, resultados esperados y hallazgos completos están en
[tests/rf4-2.md](tests/rf4-2.md).

## Hallazgos relevantes

1. La sección de noticias muestra tres tarjetas con título, fecha y extracto,
   pero puede quedar desactualizada respecto de las publicaciones más recientes
   obtenidas desde `news.registro.gt`.
2. El sistema permite buscar dominios y utilizar la herramienta IDN desde sus
   entornos públicos de prueba.
3. No existe una acción visible para renovar un dominio administrado, lo que
   impide continuar al pago y verificar facturación o notificaciones.

Una prueba automatizada puede fallar porque encontró un incumplimiento real. Un
fallo no significa necesariamente que el código de la prueba sea incorrecto.

## Conclusiones

Probar sin acceso al código fue práctico para comprobar el comportamiento
visible desde la perspectiva del usuario. La caja negra permitió validar la
carga de páginas, controles, contenido, búsquedas y conversiones. Sin embargo,
no permitió conocer la causa técnica de los defectos ni revisar base de datos,
logs del servidor, servicio de correo o integración de pagos.

Playwright resultó útil para automatizar funciones públicas, repetibles y con
resultados observables. Permitió ejecutar los mismos casos en tres motores de
navegador y generar reportes con evidencia. Su utilidad fue menor en procesos
dependientes de credenciales, estados internos, transacciones y servicios
externos.

El trabajo combinó ambos enfoques: RF-1.1, RF-1.2, RF-2.1 y RF-2.3 se cubrieron
con pruebas automatizadas; RF-4.2 se diseñó y exploró manualmente. La
automatización aportó rapidez y consistencia, mientras que la prueba manual
permitió detectar que el flujo de renovación no está disponible.

## Consideraciones de seguridad

- No realizar pagos con tarjetas reales durante las pruebas.
- No renovar dominios de producción sin autorización.
- Utilizar cuentas, dominios, medios de pago y correos de QA cuando estén
  disponibles.
- No almacenar credenciales ni datos de tarjetas en el repositorio.
