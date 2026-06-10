/**
 * Captura screenshots para o manual (Playwright + Google Chrome instalado).
 * Pré-requisito: servidor em http://127.0.0.1:5173 (npm run dev).
 * Execução: npx playwright install chrome && node outputs/capture-manual-screenshots.mjs
 *
 * O script usa o Google Chrome instalado na máquina (channel: 'chrome')
 * e abre uma janela visível para renderizar cada tela antes de capturar.
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

// Usa o Google Chrome instalado na máquina em modo visível (headless: false)
const browser = await chromium.launch({
  channel: 'chrome',
  headless: false,
})
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

/** Preenche um input dentro de um div.input-container pelo texto do label. */
async function fillByLabel(labelSubstring, value) {
  await page
    .locator('div.input-container')
    .filter({ hasText: labelSubstring })
    .locator('input.input')
    .first()
    .fill(value)
}

/** Seleciona uma opção em um <select> dentro de um div.input-container pelo texto do label. */
async function selectByLabel(labelSubstring, value) {
  await page
    .locator('div.input-container')
    .filter({ hasText: labelSubstring })
    .locator('select')
    .first()
    .selectOption(value)
}

/** Clica em uma aba do menu pelo texto do label. */
async function selectMenu(label) {
  await page.locator('.menu-item-container').filter({ hasText: label }).first().click()
  await sleep(1500)
}

// ─── Carregamento inicial ────────────────────────────────────────────────────

page.setDefaultTimeout(60000)
await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
await sleep(8000)

// Figura 1 — Layout principal
await shot('01-layout-principal.png')

// ─── Cliques no mapa (Torre A e Torre B) ────────────────────────────────────

const mapBox = await page.locator('.map-contianer').boundingBox()
if (mapBox) {
  const x1 = mapBox.x + mapBox.width * 0.35
  const y1 = mapBox.y + mapBox.height * 0.45
  await page.mouse.click(x1, y1)
  await sleep(5000)
  // Figura 2 — Torre A definida
  await shot('02-mapa-torre-a.png')

  const x2 = mapBox.x + mapBox.width * 0.65
  const y2 = mapBox.y + mapBox.height * 0.55
  await page.mouse.click(x2, y2)
  await sleep(8000)
  // Figura 3 — Enlace completo
  await shot('03-mapa-enlace-completo.png')
} else {
  console.warn('Map container not found; skipping map clicks')
}

// ─── Aba Geral ───────────────────────────────────────────────────────────────

await selectMenu('geral')
// Figura 4 — Campos da aba Geral
await shot('04-aba-geral-campos.png')
await page.evaluate(() => window.scrollTo(0, 400))
await sleep(500)
// Figura 5 — Gráfico de perfil e visada
await shot('05-aba-geral-grafico-perfil.png')
await page.evaluate(() => window.scrollTo(0, 900))
await sleep(500)
// Figura 6 — Gráfico de visada não obstruída
await shot('06-aba-geral-grafico-visada.png')

// ─── Aba Dados do Enlace ─────────────────────────────────────────────────────

await page.evaluate(() => window.scrollTo(0, 0))
await selectMenu('Dados do Enlace')
// Figura 7 — Dados do enlace
await shot('07-aba-dados-enlace.png')

// ─── Aba Rugosidade e Raio Refletido ─────────────────────────────────────────

await selectMenu('Rugosidade e Raio Refletido')
await sleep(2000)
// Figura 8 — Rugosidade e raio refletido
await shot('08-aba-rugosidade.png')

// ─── Aba Balanço do potência ─────────────────────────────────────────────────

await selectMenu('Balanço do potência')
await sleep(500)
await fillByLabel('Potência de Tx', '30')
await fillByLabel('Limiar de Rx', '-90')
await fillByLabel('Ganho da antena A', '18')
await fillByLabel('Ganho da antena B', '18')
await fillByLabel('Comprimento total do guia de onda', '30')
await fillByLabel('Reserva técnica', '5')
await fillByLabel('Perda no Guia de onda', '0.05')
await fillByLabel('Perda por conector', '0.5')
await fillByLabel('Perdas nos duplexadores', '1')
await fillByLabel('Quantidade de Potências interferentes', '0')
await page.getByRole('button', { name: /Calcular Margem de segurança/i }).click()
await sleep(1500)
// Figura 9 — Balanço de potência
await shot('09-aba-balanco-potencia.png')

// ─── Aba Atenuação Por Chuva ─────────────────────────────────────────────────

await selectMenu('Atenuação Por Chuva')
await fillByLabel('Taxa Pluviometrica', '50')
await page.getByRole('button', { name: /Calcular Taxa Pluviométrica/i }).click()
await sleep(2000)
// Figura 10 — Atenuação por chuva
await shot('10-aba-atenuacao-chuva.png')

// ─── Aba Devanecimento Plano ─────────────────────────────────────────────────

await selectMenu('Devanecimento Plano')
await sleep(500)
// Seleciona clima e relevo antes de calcular
await selectByLabel('Clima', { index: 1 })
await selectByLabel('Relevo', { index: 2 })
await page.getByRole('button', { name: /Calcular devanecimento plano/i }).click()
await sleep(1500)
// Figura 11 — Devanecimento plano
await shot('11-aba-devanecimento-plano.png')

// ─── Aba Devanecimento Seletivo ──────────────────────────────────────────────

await selectMenu('Devanecimento Seletivo')
await sleep(500)
await fillByLabel('Rolloff', '0.25')
await selectByLabel('Tipo radioclima', { index: 2 })
await page.getByRole('button', { name: /Calcular devanecimento seletivo/i }).click()
await sleep(1500)
// Figura 12 — Devanecimento seletivo
await shot('12-aba-devanecimento-seletivo.png')

// ─── Aba Relatório técnico ───────────────────────────────────────────────────

await selectMenu('Relatório técnico')
await sleep(1000)
// Figura 13 — Relatório técnico
await shot('13-aba-relatorio-tecnico.png')

// ─── Encerramento ────────────────────────────────────────────────────────────

await browser.close()
console.log('Done. 13 screenshots saved to', outDir)
