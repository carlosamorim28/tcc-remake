/**
 * Captura screenshots para o manual (Playwright).
 * Pré-requisito: servidor em http://127.0.0.1:5173 (npm run dev).
 * Execução: npx playwright install chromium && node outputs/capture-manual-screenshots.mjs
 */
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdir } from 'node:fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, 'images')
/** Vite usa 5173 por omissão; se a porta estiver ocupada, defina MANUAL_BASE_URL (ex.: http://localhost:5174). */
const baseURL = process.env.MANUAL_BASE_URL || 'http://localhost:5173'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})
const page = await context.newPage()

async function shot(name) {
  const path = join(outDir, name)
  await page.screenshot({ path, fullPage: true })
  console.log('Wrote', path)
}

async function fillByLabel(labelSubstring, value) {
  await page
    .locator('div.input-container')
    .filter({ hasText: labelSubstring })
    .locator('input.input')
    .first()
    .fill(value)
}

page.setDefaultTimeout(60000)
await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
await sleep(8000)

await shot('01-layout-principal.png')

const mapBox = await page.locator('.map-contianer').boundingBox()
if (mapBox) {
  const x1 = mapBox.x + mapBox.width * 0.35
  const y1 = mapBox.y + mapBox.height * 0.45
  await page.mouse.click(x1, y1)
  await sleep(5000)
  await shot('02-mapa-torre-a.png')

  const x2 = mapBox.x + mapBox.width * 0.65
  const y2 = mapBox.y + mapBox.height * 0.55
  await page.mouse.click(x2, y2)
  await sleep(8000)
  await shot('03-mapa-enlace-completo.png')
} else {
  console.warn('Map container not found; skipping map clicks')
}

async function selectMenu(label) {
  await page.locator('.menu-item-container').filter({ hasText: label }).first().click()
  await sleep(1500)
}

await selectMenu('geral')
await shot('04-aba-geral-campos.png')
await page.evaluate(() => window.scrollTo(0, 400))
await sleep(500)
await shot('05-aba-geral-grafico-perfil.png')
await page.evaluate(() => window.scrollTo(0, 900))
await sleep(500)
await shot('06-aba-geral-grafico-visada.png')

await page.evaluate(() => window.scrollTo(0, 0))
await selectMenu('Dados do Enlace')
await shot('07-aba-dados-enlace.png')

await selectMenu('Rugosidade e Raio Refletido')
await sleep(2000)
await shot('08-aba-rugosidade.png')

await selectMenu('Balanço do potência')
await sleep(500)
await fillByLabel('Potência de Tx', '30')
await fillByLabel('Limiar de Rx', '-90')
await fillByLabel('Ganho da antena A', '18')
await fillByLabel('Ganho da antena B', '18')
await fillByLabel('Perda no Guia de onda', '0.05')
await fillByLabel('Comprimento do cabo', '30')
await fillByLabel('Perda por conector', '0.5')
await fillByLabel('Quantidade de Potências interferentes', '0')
await page.getByRole('button', { name: /Calcular Margem de segurança/i }).click()
await sleep(1500)
await shot('09-aba-balanco-potencia.png')

await selectMenu('Atenuação Por Chuva')
await fillByLabel('Taxa Pluviometrica', '50')
await page.getByRole('button', { name: /Calcular Taxa Pluviométrica/i }).click()
await sleep(2000)
await shot('10-aba-atenuacao-chuva.png')

await browser.close()
console.log('Done.')
