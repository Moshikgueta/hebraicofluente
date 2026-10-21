// Capturas para revisao visual: node e2e/shot.mjs <rota> [<rota>...]
// Entra como viajante da demonstracao antes, se a rota comecar com /c/.
// Rotas com prefixo "agencia:" entram no painel de demonstracao.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.MCD_BASE ?? 'http://localhost:3100';
const exe = process.env.MCD_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const width = Number(process.env.W ?? 390);
mkdirSync('e2e/shots', { recursive: true });
const browser = await chromium.launch({ executablePath: exe });
const ctx = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
let asTraveler = false;
let asAgency = false;
for (const arg of process.argv.slice(2)) {
  let route = arg;
  if (route.startsWith('agencia:')) {
    route = route.slice(8);
    if (!asAgency) {
      await page.goto(`${BASE}/demo`);
      await page.getByRole('button', { name: 'Ver o painel da agência' }).click();
      await page.waitForURL(/\/painel/);
      asAgency = true;
    }
  } else if (route.startsWith('/c/') && !asTraveler) {
    await page.goto(`${BASE}/demo`);
    await page.getByRole('button', { name: 'Entrar como viajante' }).click();
    await page.waitForURL(/\/c\//);
    asTraveler = true;
  }
  if (route.includes('{car}')) {
    await page.goto(`${BASE}/painel/caravanas`);
    const href = await page.locator('table a').first().getAttribute('href');
    route = route.replace('{car}', href.split('/').pop());
  }
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  const name = (width + route).replace(/[^a-z0-9]+/gi, '_');
  await page.screenshot({ path: `e2e/shots/${name}.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(`${route} -> ${page.url()} ${overflow > 0 ? `ROLAGEM LATERAL ${overflow}px` : ''}`);
}
if (errors.length) console.log('ERROS DE CONSOLE:\n' + errors.join('\n'));
await browser.close();
