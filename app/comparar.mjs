/* Ouça a diferença: ר ou ח, num navegador de verdade (19/10/2026).

   Precisa do out/ construído em modo LOCAL (`npm run build`).
   HF_CHROMIUM=/caminho/do/chromium node comparar.mjs (de dentro de app/). */

import { createServer } from 'node:http';
import { readFileSync, existsSync, writeSync } from 'node:fs';
import { chromium } from 'playwright';

const log = s => writeSync(1, s + '\n');
const T = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg'
};
/* As gravações são as sílabas de estúdio da própria lição (public/audio). */

const srv = createServer((q, r) => {
  const c = decodeURIComponent(q.url.split('?')[0]);
  if (c === '/api/audio/manifest') {
    r.writeHead(200, { 'Content-Type': 'application/json' });
    return r.end(JSON.stringify({ clips: {} }));
  }
  for (const f of [`out${c}`, `out${c}/index.html`, `out${c}.html`, 'out/404.html']) {
    if (!existsSync(f) || f.endsWith('/')) continue;
    try {
      const b = readFileSync(f);
      r.writeHead(200, { 'Content-Type': T[f.slice(f.lastIndexOf('.'))] || 'application/octet-stream' });
      return r.end(b);
    } catch { /* diretório */ }
  }
  r.writeHead(404); r.end('404');
});
await new Promise(r => srv.listen(4521, r));
const BASE = 'http://127.0.0.1:4521';

const agora = new Date().toISOString();
const ACC = { v: 1, accounts: { 'd@h.t': {
  id: 'a', name: 'M', email: 'd@h.t', createdAt: agora, pw: 'x',
  entitlements: [{ courseSlug: 'alfabetizacao', grantedAt: agora,
    expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: 'd' }], orders: []
} }, current: 'd@h.t' };
const lic = id => ({ letterId: id, stagesDone: [1, 2, 3, 4, 5], quizBest: 1, quizAttempts: 1,
  perfectBonusPaid: false, completedAt: agora });
const LETRAS = ['alef', 'mem', 'tav', 'nun', 'he', 'yod', 'gimel', 'dalet', 'shin', 'lamed'];
const estado = {
  version: 2, onboarding: { reason: 'familia', goalMinutes: 10, startingPoint: 'zero', name: 'M', completedAt: agora },
  xp: 0, lessons: Object.fromEntries(LETRAS.map(id => [id, lic(id)])),
  checkpoints: {}, srs: {}, achievements: [], days: {},
  streak: { current: 0, longest: 0, lastDay: null }, lastRoute: null,
  finalChallenge: { best: null, completedAt: null }, skills: {}, confusions: {},
  firsts: { 'aula-0-concluida': agora }, gym: {}
};

let falhas = 0;
const erro = m => { log(`  ✗ ${m}`); falhas++; };
const ok = m => log(`  ✓ ${m}`);
const confere = (c, bom, ruim) => (c ? ok(bom) : erro(ruim));

const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });
async function abrir(largura) {
  const ctx = await b.newContext({ viewport: { width: largura, height: 900 } });
  await ctx.addInitScript(([a, s]) => {
    localStorage.setItem('hf-platform-local-v1', a);
    localStorage.setItem('hebraico-fluente-v1', s);
  }, [JSON.stringify(ACC), JSON.stringify(estado)]);
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(e.message));
  await p.goto(`${BASE}/licao/resh/`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const quadro = p.locator('[data-comparar-sons]');
  /* O quadro mora na etapa das palavras: avança até ele. */
  for (let k = 0; k < 6 && !(await quadro.count()); k++) {
    const seguir = p.getByRole('button', { name: /Próxim|Continuar|Seguir/ }).first();
    if (!(await seguir.count())) break;
    await seguir.click(); await p.waitForTimeout(600);
  }
  return { ctx, p, erros, quadro };
}

log('\n── com as gravações ─────────────────────────────────');
{
  const t = await abrir(1280);
  const ouvir = t.quadro.getByRole('button', { name: /Ouvir o som de/ });
  confere(await ouvir.count() === 2, 'dois botões de ouvir', `botões: ${await ouvir.count()}`);
  await ouvir.first().click();
  await t.p.waitForTimeout(700);
  const rotulo = await t.quadro.locator('li').first().locator('button').innerText();
  confere(/Pausar|Carregando|Ouvir/.test(rotulo), `o botão mostra o estado (${rotulo.trim()})`, `rótulo: ${rotulo}`);
  if (/Pausar/.test(rotulo)) {
    await t.quadro.locator('li').first().locator('button').click();
    await t.p.waitForTimeout(200);
    confere(/Continuar/.test(await t.quadro.locator('li').first().locator('button').innerText()), 'pausar mostra Continuar', 'pausa sem estado');
  }
  const exerc = t.quadro.getByText('Você consegue identificar o som?');
  confere(await exerc.count() === 1, 'com as gravações, o exercício aparece', 'sem o exercício');
  await t.quadro.getByRole('button', { name: 'Tocar um som' }).click();
  await t.p.waitForTimeout(300);
  confere(await t.quadro.getByRole('button', { name: 'Ouvir de novo' }).count() === 1, 'dá para ouvir de novo antes de responder', 'sem ouvir de novo');
  await t.quadro.getByRole('group', { name: 'Qual letra você ouviu?' }).getByRole('button', { name: 'Resh' }).click();
  await t.p.waitForTimeout(200);
  const s = (await t.quadro.innerText()).replace(/\s+/g, ' ');
  confere(/Isso! Era o Resh\.|Era o Chet\. Ouça os dois de novo/.test(s), 'retorno na hora', `sem retorno: ${s.slice(-200)}`);
  confere(s.includes('Acertos:') && s.includes('de 1'), 'o placar conta a tentativa', 'sem placar');
  confere(await t.quadro.getByRole('button', { name: 'Próximo som' }).count() === 1, 'segue para o próximo som', 'sem próximo');
  confere(!t.erros.length, 'sem erro de página', `erros: ${t.erros.slice(0, 2)}`);
  await t.ctx.close();

  const m = await abrir(390);
  const larg = await m.p.evaluate(() => document.documentElement.scrollWidth);
  confere(larg <= 390, 'no celular, sem rolagem para o lado', `largura ${larg}`);
  await m.quadro.scrollIntoViewIfNeeded();
  await m.quadro.screenshot({ path: '../../comparar-390.png' });
  await m.ctx.close();
}

await b.close(); srv.close();
log(falhas ? `\n${falhas} problema(s).` : '\no quadro ר ou ח toca as gravações da lição e o exercício funciona, no computador e no celular.');
process.exit(falhas ? 1 : 0);
