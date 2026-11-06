import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const B = 'http://127.0.0.1:8787';
const MAIL = readFileSync('/tmp/claude-0/ui-mail', 'utf8').trim();
const ok = (c, m) => console.log(`${c ? '✓' : '✗'} ${m}`);
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
{ const ctx = await br.newContext(); const p = await ctx.newPage();
  const r = await p.goto(`${B}/acessibilidade/`, { waitUntil: 'networkidle' });
  ok(r.status() === 200 && !p.url().includes('/entrar'), `/acessibilidade abre para visitante (${r.status()})`);
  ok(await p.getByRole('heading', { level: 1, name: 'Declaração de Acessibilidade' }).count() === 1, 'h1 da declaração');
  await p.goto(`${B}/`, { waitUntil: 'domcontentloaded' });
  ok(await p.locator('footer a[href="/acessibilidade"], footer a[href="/acessibilidade/"]').count() > 0, 'link no rodapé público');
  // menu móvel com Escape
  await p.setViewportSize({ width: 390, height: 844 }); await p.reload({ waitUntil: "load" }); await p.waitForTimeout(1500);
  const menu = p.getByRole('button', { name: /Abrir menu/ });
  await menu.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok(await p.getByRole('button', { name: /Abrir menu/ }).getAttribute('aria-expanded') === 'false', 'menu fecha com Escape');
  ok(await p.evaluate(() => document.body.style.overflow !== 'hidden'), 'e o fundo destrava');
  // painel de acessibilidade: foco entra
  await p.keyboard.press('Alt+Shift+KeyA'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')), 'painel de acessibilidade recebe o foco');
  await ctx.close(); }
const ctx = await br.newContext({ viewport: { width: 320, height: 700 } }); const p = await ctx.newPage();
await p.request.post(`${B}/api/auth/login`, { data: { email: MAIL, password: 'senha-boa-123' } });
await p.goto(`${B}/teclado-hebraico/`, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
const extra = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok(extra <= 0, `teclado hebraico a 320 px: rolagem lateral de ${extra} px`);
await p.setViewportSize({ width: 1280, height: 900 });
await p.goto(`${B}/vocabulario/`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1000);
const nomes = await p.$$eval('button[aria-label^="Ouvir"]', bs => bs.map(b => b.getAttribute('aria-label')));
ok(nomes.length === 0 || new Set(nomes).size > 1, `vocabulário: ${nomes.length} botões, ex.: ${nomes.slice(0,2).join(' | ') || '(nenhuma palavra ainda)'}`);
await br.close();
