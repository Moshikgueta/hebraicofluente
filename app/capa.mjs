/* A capa, num navegador de verdade.
   ─────────────────────────────────────────────────────────────────────────
   Quatro coisas que só aparecem depois de renderizar, e que nenhum teste de
   unidade vê:

     · a atmosfera do hero carregou, e o celular recebeu o recorte pequeno;
     · o percurso do currículo e a seção "Além do alfabeto" estão na página,
       e esta última NÃO linka rota paga (mandar visitante para /historia é
       mandá-lo para um 302 de login);
     · a barra fixa do celular aparece depois do hero e some por cima da
       caixa de preço e do fecho - as duas seções que já pedem;
     · a página não rola de lado em 390px.

   Precisa do `out/` construído. node capa.mjs (de dentro de app/). */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const DIR = '.shots/capa';
mkdirSync(DIR, { recursive: true });

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.txt': 'text/plain'
};

const server = createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0]);
  const tries = [`out${clean}`, `out${clean}/index.html`, `out${clean}.html`, 'out/404.html'];
  for (const f of tries) {
    if (!existsSync(f) || f.endsWith('/')) continue;
    try {
      const body = readFileSync(f);
      const ext = f.slice(f.lastIndexOf('.'));
      res.writeHead(f.endsWith('404.html') ? 404 : 200, { 'Content-Type': TYPES[ext] || 'application/octet-stream' });
      return res.end(body);
    } catch { /* diretório */ }
  }
  res.writeHead(404); res.end('404');
});
await new Promise(r => server.listen(4322, r));

const browser = await chromium.launch();
const problemas = [];
const nota = (s) => { problemas.push(s); console.log('  ✗', s); };
const ok = (s) => console.log('  ✓', s);

for (const W of [1280, 390]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', e => erros.push(String(e)));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (t.includes('404') || t.includes('Failed to load resource')) return; // /api/* sem Worker
    erros.push(t);
  });
  const faltando = [];
  page.on('response', r => { if (r.status() >= 400) faltando.push(`${r.status()} ${r.url()}`); });

  await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600); // a sequência de entrada do hero

  console.log(`\n── ${W}px ──────────────────────────────────`);

  /* 1 · a atmosfera nova chegou mesmo */
  const atm = await page.evaluate(() => {
    const img = document.querySelector('header picture img');
    if (!img) return null;
    return { src: img.currentSrc || img.src, w: img.naturalWidth, h: img.naturalHeight };
  });
  if (!atm) nota('a imagem de atmosfera não foi renderizada');
  else if (!atm.w) nota(`a atmosfera não carregou: ${atm.src}`);
  else ok(`atmosfera ${atm.w}x${atm.h} · ${atm.src.split('/').pop()}`);

  await page.screenshot({ path: `${DIR}/${W}-hero.png` });

  /* 2 · um h1 só */
  const h1 = await page.locator('h1').count();
  h1 === 1 ? ok('um <h1> só') : nota(`${h1} elementos <h1> na página`);

  /* 3 · o percurso, acima do acordeão */
  const barras = await page.locator('section:has(#duvidas) , div').count();
  const percurso = page.locator('text=ler sem apoio').first();
  if (await percurso.count()) {
    await percurso.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${DIR}/${W}-percurso.png` });
    ok('percurso do currículo presente');
  } else nota('percurso do currículo não encontrado');

  /* 4 · além do alfabeto, com o link para /biblia */
  const alem = page.locator('section[aria-labelledby="alem"]');
  if (await alem.count()) {
    await alem.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${DIR}/${W}-alem.png` });
    /* `trailingSlash` do export: o href sai como "/biblia/". */
    const href = await alem.locator('a[href^="/biblia"]').first().getAttribute('href').catch(() => null);
    href ? ok('“Além do alfabeto” com link para /biblia') : nota('a seção existe mas o link para /biblia sumiu');
    /* nenhum link para rota paga */
    const pago = await alem.locator('a[href*="/historia"]').count();
    pago === 0 ? ok('nenhum link para rota paga na seção') : nota('a seção linka /historia, que é paga');
  } else nota('seção “Além do alfabeto” não encontrada');

  /* 5 · a barra fixa do celular */
  const barra = page.locator('div:has(> div > a[href^="/checkout"])').filter({ hasText: 'ou ' }).first();
  const visivelDaBarra = async () => page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find(d =>
      d.className.includes('fixed') && d.className.includes('lg:hidden'));
    if (!el) return 'ausente';
    const cs = getComputedStyle(el);
    return cs.opacity === '1' ? 'visível' : 'escondida';
  });

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  const noTopo = await visivelDaBarra();

  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3));
  await page.waitForTimeout(700);
  const noMeio = await visivelDaBarra();
  await page.screenshot({ path: `${DIR}/${W}-barra.png` });

  const preco = page.locator('#preco');
  await preco.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const noPreco = await visivelDaBarra();

  console.log(`    barra: topo=${noTopo} meio=${noMeio} preço=${noPreco}`);
  if (W === 390) {
    if (noTopo !== 'escondida') nota('a barra fixa aparece antes de passar o hero');
    if (noMeio !== 'visível') nota('a barra fixa não aparece no meio da página');
    if (noPreco !== 'escondida') nota('a barra fixa fica por cima da caixa de preço');
    if (noTopo === 'escondida' && noMeio === 'visível' && noPreco === 'escondida')
      ok('barra fixa aparece e some nos pontos certos');
  }

  /* 6 · sem rolagem horizontal */
  const estoura = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  estoura <= 1 ? ok('sem rolagem horizontal') : nota(`a página rola ${estoura}px de lado`);

  if (erros.length) nota(`erros de console: ${erros.slice(0, 3).join(' | ')}`);
  else ok('console limpo');
  /* O servidor estático não tem Worker: /api/* responde 404 aqui e não no ar. */
  const reais = faltando.filter(f => !f.includes('favicon') && !f.includes('/api/'));
  if (reais.length) nota(`respostas 4xx: ${reais.slice(0, 3).join(' | ')}`);
  else ok('nenhuma resposta 4xx');

  await ctx.close();
}

await browser.close();
server.close();

console.log('\n──────────────────────────────────────────');
console.log(problemas.length ? `${problemas.length} problema(s)` : 'tudo certo');
process.exit(problemas.length ? 1 : 0);
