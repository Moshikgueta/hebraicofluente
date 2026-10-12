/* A Batalha com par pedido e rodadas de som, e a sugestão de treinar um par,
   num navegador de verdade (12/10/2026).

   Precisa do out/ construído em modo LOCAL (`npm run build`).
   HF_CHROMIUM=/caminho/do/chromium node batalha.mjs (de dentro de app/). */

import { createServer } from 'node:http';
import { readFileSync, existsSync, writeSync } from 'node:fs';
import { chromium } from 'playwright';

const log = s => writeSync(1, s + '\n');
const T = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg'
};
const srv = createServer((q, r) => {
  const c = decodeURIComponent(q.url.split('?')[0]);
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
await new Promise(r => srv.listen(4497, r));
const BASE = 'http://127.0.0.1:4497';

const agora = new Date().toISOString();
const hoje = agora.slice(0, 10);
const ACC = { v: 1, accounts: { 'd@h.t': {
  id: 'a', name: 'M', email: 'd@h.t', createdAt: agora, pw: 'x',
  entitlements: [{ courseSlug: 'alfabetizacao', grantedAt: agora,
    expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: 'd' }], orders: []
} }, current: 'd@h.t' };
const lic = id => ({ letterId: id, stagesDone: [1, 2, 3, 4, 5], quizBest: 1, quizAttempts: 1,
  perfectBonusPaid: false, completedAt: agora });
const LETRAS = ['alef', 'mem', 'tav', 'nun', 'he', 'yod', 'gimel', 'dalet', 'shin', 'lamed', 'resh', 'vav', 'zayin', 'het'];
const estado = (confusions = {}) => ({
  version: 2, onboarding: { reason: 'familia', goalMinutes: 10, startingPoint: 'zero', name: 'M', completedAt: agora },
  xp: 0, lessons: Object.fromEntries(LETRAS.map(id => [id, lic(id)])),
  checkpoints: {}, srs: {}, achievements: [], days: {},
  streak: { current: 0, longest: 0, lastDay: null }, lastRoute: null,
  finalChallenge: { best: null, completedAt: null }, skills: {}, confusions,
  firsts: { 'aula-0-concluida': agora }, gym: {}
});

let falhas = 0;
const erro = m => { log(`  ✗ ${m}`); falhas++; };
const ok = m => log(`  ✓ ${m}`);
const confere = (c, bom, ruim) => (c ? ok(bom) : erro(ruim));

const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });
async function abrir(rota, est) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
  await ctx.addInitScript(([a, s]) => {
    localStorage.setItem('hf-platform-local-v1', a);
    localStorage.setItem('hebraico-fluente-v1', s);
  }, [JSON.stringify(ACC), JSON.stringify(est)]);
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(e.message));
  await p.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  return { ctx, p, erros, texto: async () => (await p.locator('main').innerText()).replace(/\s+/g, ' ') };
}

log('\n── a sugestão de treinar o par ──────────────────────');
{
  const conf = { 'ד>ר': { correct: 'ד', chosen: 'ר', n: 3, lastOn: hoje } };
  const t = await abrir('/revisao/', estado(conf));
  const s = await t.texto();
  confere(s.includes('Vamos praticar a diferença entre') && s.includes('Você trocou estas duas letras 3 vezes.'),
    'a revisão sugere o par trocado', `sem a sugestão: ${s.slice(0, 200)}`);
  const href = await t.p.locator('main a', { hasText: 'Praticar agora' }).getAttribute('href');
  confere(decodeURIComponent(href ?? '').includes('jogo=batalha&par=דר'), 'o link leva à Batalha com o par', `link: ${href}`);
  await t.ctx.close();
  const u = await abrir('/revisao/', estado());
  confere(!(await u.texto()).includes('Vamos praticar a diferença'), 'sem troca repetida, nenhuma sugestão', 'sugestão sem troca');
  await u.ctx.close();
}

log('\n── a Batalha com o par pedido e as rodadas de som ───');
{
  const t = await abrir(`/academia/?jogo=batalha&par=${encodeURIComponent('דר')}`, estado());
  let s = await t.texto();
  confere(s.includes('Parecidas no desenho'), 'a rodada diz que o par é de desenho', 'sem o rótulo de desenho');
  const par = await t.p.evaluate(() => [...document.querySelectorAll('main p .he')].slice(0, 2).map(e => e.textContent).join(''));
  confere(/[דר]{2}/.test(par) && par.includes('ד') && par.includes('ר'), 'a primeira rodada é ד/ר', `primeiro par: ${par}`);

  /* Joga até chegar à rodada de som: responde qualquer coisa e segue. */
  let viuSom = false;
  for (let k = 0; k < 60 && !viuSom; k++) {
    s = await t.texto();
    if (s.includes('Parecidas no som')) { viuSom = true; break; }
    if (await t.p.getByRole('button', { name: 'Mostrar a letra' }).count()) {
      await t.p.getByRole('button', { name: 'Mostrar a letra' }).click(); await t.p.waitForTimeout(1000);
    }
    const alvos = t.p.locator('main [role="group"] button:not([disabled])');
    const n = await alvos.count();
    if (n) await alvos.nth(0).click().catch(() => {});
    await t.p.waitForTimeout(700);
    /* Fileira "toque em todas": confirma, se houver botão de pronto. */
    const pronto = t.p.getByRole('button', { name: /Pronto|Conferir/ });
    if (await pronto.count()) await pronto.first().click().catch(() => {});
    await t.p.waitForTimeout(400);
  }
  confere(viuSom, 'chegou à rodada de som', 'nenhuma rodada de som');
  if (viuSom) {
    const opcoes = t.p.locator('main [role="group"] div[dir="rtl"] button');
    confere(await opcoes.first().isDisabled(), 'as opções esperam o áudio', 'dá para responder sem ouvir');
    await t.p.getByRole('button', { name: 'Ouvir a sílaba' }).click();
    await t.p.waitForTimeout(300);
    confere(!(await opcoes.first().isDisabled()), 'depois de ouvir, dá para responder', 'continua travado depois de ouvir');
  }
  confere(!t.erros.length, 'sem erro de página', `erros: ${t.erros.slice(0, 2)}`);
  await t.ctx.close();
}

await b.close(); srv.close();
log(falhas ? `\n${falhas} problema(s).` : '\na sugestão de par e a Batalha de desenho e de som funcionam num navegador de verdade.');
process.exit(falhas ? 1 : 0);
