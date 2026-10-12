/* O Laboratório de Leitura, a Primeira Leitura, o Meu domínio e o painel,
   num navegador de verdade (12/10/2026).

   O que se prova aqui é o que só uma tela mostra: que a primeira letra
   acende à DIREITA, que o botão de ouvir só existe com gravação, que a
   autoavaliação fica fora do domínio, que a Primeira Leitura trava e abre na
   hora certa e grava que foi feita, e que os números do painel têm cada um
   o seu nome.

   Precisa do out/ construído em modo LOCAL (`npm run build`).
   HF_CHROMIUM=/caminho/do/chromium node laboratorio.mjs (de dentro de app/). */

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
await new Promise(r => srv.listen(4496, r));
const BASE = 'http://127.0.0.1:4496';

const agora = new Date().toISOString();
const ACC = { v: 1, accounts: { 'd@h.t': {
  id: 'a', name: 'M', email: 'd@h.t', createdAt: agora, pw: 'x',
  entitlements: [{ courseSlug: 'alfabetizacao', grantedAt: agora,
    expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: 'd' }], orders: []
} }, current: 'd@h.t' };
const lic = id => ({ letterId: id, stagesDone: [1, 2, 3, 4, 5], quizBest: 1, quizAttempts: 1,
  perfectBonusPaid: false, completedAt: agora });
const estado = ({ licoes = [], firsts = {}, skills = {} } = {}) => ({
  version: 2, onboarding: { reason: 'familia', goalMinutes: 10, startingPoint: 'zero', name: 'M', completedAt: agora },
  xp: 0, lessons: Object.fromEntries(licoes.map(id => [id, lic(id)])),
  checkpoints: {}, srs: {}, achievements: [], days: {},
  streak: { current: 0, longest: 0, lastDay: null }, lastRoute: null,
  finalChallenge: { best: null, completedAt: null }, skills, confusions: {}, firsts, gym: {}
});
const AULA0 = { 'aula-0-concluida': agora };
const MOD1 = ['alef', 'mem', 'tav', 'nun', 'he', 'yod'];

let falhas = 0;
const erro = m => { log(`  ✗ ${m}`); falhas++; };
const ok = m => log(`  ✓ ${m}`);
const confere = (cond, bom, ruim) => (cond ? ok(bom) : erro(ruim));

const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });
async function abrir(rota, est, largura = 390) {
  const ctx = await b.newContext({ viewport: { width: largura, height: 900 } });
  await ctx.addInitScript(([a, s]) => {
    localStorage.setItem('hf-platform-local-v1', a);
    localStorage.setItem('hebraico-fluente-v1', s);
  }, [JSON.stringify(ACC), JSON.stringify(est)]);
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(e.message));
  await p.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  return { ctx, p, erros, texto: async () => (await p.locator('main').innerText()).replace(/\s+/g, ' ') };
}
const lerEstado = async p => { await p.waitForTimeout(1200); return p.evaluate(() => JSON.parse(localStorage.getItem('hebraico-fluente-v1') || '{}')); };
const semRolagemLateral = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

/* ── 1 · estado vazio ─────────────────────────────────────────────────── */
log('\n── laboratório sem palavras ─────────────────────────');
{
  const t = await abrir('/leitura/', estado());
  const s = await t.texto();
  confere(s.includes('Conclua a lição da letra Mem para liberar suas primeiras palavras.'),
    'mensagem do estado vazio', 'sem a mensagem do estado vazio');
  confere((await t.p.locator('main a', { hasText: 'Ir para o curso' }).getAttribute('href') ?? '').replace(/\/$/, '') === '/inicio',
    '"Ir para o curso" leva à Aula 0 quando ela falta', '"Ir para o curso" não leva à Aula 0');
  await t.ctx.close();
  const u = await abrir('/leitura/', estado({ firsts: AULA0 }));
  confere(/\/licao\/alef\/?$/.test(await u.p.locator('main a', { hasText: 'Ir para o curso' }).getAttribute('href') ?? ''),
    'depois da Aula 0, leva à lição do Álef', 'depois da Aula 0 não leva à lição atual');
  await u.ctx.close();
}

/* ── 2 · uma rodada guiada ────────────────────────────────────────────── */
log('\n── uma rodada guiada ────────────────────────────────');
{
  const t = await abrir('/leitura/', estado({ licoes: MOD1, firsts: AULA0 }));
  let s = await t.texto();
  confere(s.includes('Aprenda a ler hebraico, uma palavra de cada vez.'), 'título novo', 'título antigo');
  confere(s.includes('De quanta ajuda você precisa?'), 'pergunta de nível nova', 'pergunta de nível antiga');
  confere(!/transliter/i.test(s) || !s.includes('Quer dizer'), 'a resposta não aparece antes de tentar', 'a resposta aparece antes');
  await t.p.getByRole('button', { name: 'Ver as letras' }).click();
  await t.p.getByRole('button', { name: 'Explorar letra por letra' }).click();
  /* A letra acesa é a da DIREITA. */
  const lado = await t.p.evaluate(() => {
    const he = document.querySelector('main .he b')?.parentElement;
    const pecas = he ? [...he.children] : [];
    const acesa = pecas.findIndex(x => x.tagName === 'B');
    const xs = pecas.map(x => x.getBoundingClientRect().x);
    return { acesa, maisDireita: xs.indexOf(Math.max(...xs)), n: pecas.length };
  });
  confere(lado.n > 1 && lado.acesa === lado.maisDireita, 'a primeira letra acesa é a da direita',
    `a primeira letra acesa não é a da direita (${JSON.stringify(lado)})`);
  const listaRtl = await t.p.evaluate(() => {
    const itens = [...document.querySelectorAll('main ol[dir="rtl"] li')].map(li => li.getBoundingClientRect().x);
    return itens.length > 1 && itens[0] > itens[1];
  });
  confere(listaRtl, 'a lista de letras corre da direita para a esquerda', 'a lista de letras está LTR');
  await t.p.getByRole('button', { name: 'Próxima letra' }).click();
  confere(await semRolagemLateral(t.p), 'sem rolagem lateral a 390px', 'rolagem lateral a 390px');

  for (let k = 0; k < 5; k++) {
    await t.p.getByRole('button', { name: 'Já li. Conferir resposta' }).click();
    const temOuvir = await t.p.getByRole('button', { name: /Ouvir e comparar|^Ouvir / }).count();
    const temTranslit = await t.p.getByRole('button', { name: 'Conferir a transliteração' }).count();
    if (!temOuvir && !temTranslit && !(await t.texto()).match(/[a-z]{2,}/)) erro('sem áudio e sem transliteração para conferir');
    if (temTranslit) await t.p.getByRole('button', { name: 'Conferir a transliteração' }).click();
    await t.p.getByRole('button', { name: 'Ver o significado' }).click();
    s = await t.texto();
    if (!s.includes('Quer dizer:')) erro('o significado não apareceu');
    if (!s.includes('Você conseguiu ler corretamente?')) erro('pergunta de autoavaliação antiga');
    await t.p.getByRole('button', { name: k % 2 ? 'Ainda preciso praticar.' : 'Sim, consegui!' }).click();
    await t.p.waitForTimeout(150);
  }
  s = await t.texto();
  confere(s.includes('Rodada concluída') && s.includes('Você marcou 3 de 5 palavras como lidas corretamente.'),
    'fim da rodada com a contagem certa', `fim da rodada errado: ${s.slice(0, 200)}`);
  const st = await lerEstado(t.p);
  confere(st.leituraAutoavaliada?.['laboratorio-guiada']?.tentadas === 5 && st.leituraAutoavaliada['laboratorio-guiada'].consegui === 3,
    'a autoavaliação ficou gravada à parte', 'a autoavaliação não foi gravada');
  confere(JSON.stringify(st.skills) === '{}' && JSON.stringify(st.srs) === '{}',
    'e não mexeu no domínio nem na revisão', 'a autoavaliação mexeu no domínio');
  confere(!t.erros.length, 'sem erro de página', `erros: ${t.erros.slice(0, 2)}`);
  await t.ctx.close();
}

/* ── 3 · nível independente antes do módulo 6 ─────────────────────────── */
log('\n── leitura independente ─────────────────────────────');
{
  const t = await abrir('/leitura/', estado({ licoes: MOD1, firsts: AULA0 }));
  await t.p.getByText('Leitura independente', { exact: true }).click();
  const s = await t.texto();
  confere(s.includes('A leitura sem nikud será liberada depois da etapa "Sem o ponto", no módulo 6.'),
    'avisa que sem nikud vem no módulo 6', 'sem o aviso do módulo 6');
  confere(s.includes('Leia a palavra em voz alta por conta própria. Depois, confira a pronúncia.'),
    'instrução da independente', 'instrução errada na independente');
  confere(!(await t.p.getByRole('button', { name: 'Ver as letras' }).count()), 'sem ajuda na independente', 'há ajuda na independente');
  await t.ctx.close();
}

/* ── 4 · Primeira Leitura ─────────────────────────────────────────────── */
log('\n── Minha Primeira Leitura ───────────────────────────');
{
  const t = await abrir('/leitura/?primeira=1', estado({ licoes: ['alef', 'mem'], firsts: AULA0 }));
  confere((await t.texto()).includes('Esta atividade será liberada quando você concluir todas as lições do módulo 1.'),
    'trancada antes do módulo', 'não trancou antes do módulo');
  await t.ctx.close();

  const u = await abrir('/leitura/?primeira=1', estado({ licoes: MOD1, firsts: AULA0 }));
  let s = await u.texto();
  confere(/\d palavras formadas com as letras e os sinais vocálicos que você já aprendeu/.test(s),
    'abre com o módulo concluído', 'não abriu com o módulo concluído');
  await u.p.getByRole('button', { name: 'Começar a leitura' }).click();
  let n = 0;
  while (n < 8 && await u.p.getByRole('button', { name: 'Já li. Conferir resposta' }).count()) {
    await u.p.getByRole('button', { name: 'Já li. Conferir resposta' }).click();
    await u.p.getByRole('button', { name: 'Sim, consegui!' }).click();
    await u.p.waitForTimeout(150); n++;
  }
  await u.p.waitForTimeout(300);
  s = await u.texto();
  confere(s.includes('Primeira leitura concluída!') && s.includes('sem ouvir a pronúncia antes'),
    `concluída depois de ${n} palavras, com a mensagem de leitura sem áudio antes`, `fim errado: ${s.slice(0, 200)}`);
  const st = await lerEstado(u.p);
  confere(!!st.firsts?.['primeira-leitura-m1'], 'a conclusão ficou gravada', 'a conclusão não foi gravada');
  await u.p.getByRole('button', { name: 'Ler de novo' }).click();
  confere(await u.p.getByRole('button', { name: 'Já li. Conferir resposta' }).count() === 1, 'dá para ler de novo', 'não dá para ler de novo');
  await u.ctx.close();

  const x = await abrir('/leitura/?primeira=99', estado({ firsts: AULA0 }));
  confere((await x.texto()).includes('Não encontramos esta atividade.'), 'endereço errado é erro, não trava', 'endereço errado virou trava');
  await x.ctx.close();
  const y = await abrir('/leitura/?primeira=6', estado({ firsts: AULA0 }));
  confere((await y.texto()).includes('Esta atividade ainda não está disponível.'), 'módulo sem letras: indisponível', 'módulo 6 sem a mensagem');
  await y.ctx.close();
}

/* ── 5 · Meu domínio e o painel ───────────────────────────────────────── */
log('\n── Meu domínio e o painel ───────────────────────────');
{
  const t = await abrir('/meu-hebraico/dominio/', estado({ firsts: AULA0 }));
  confere((await t.texto()).includes('Assim que você fizer os primeiros exercícios, seu progresso começará a aparecer aqui.'),
    'domínio sem dados', 'domínio sem dados: texto errado');
  await t.ctx.close();
  const forte = { hits: 9, misses: 0, streak: 9, lastOn: '2026-10-10', diasDeAcerto: 3 };
  const fraca = { hits: 3, misses: 3, streak: 1, lastOn: '2026-10-10', diasDeAcerto: 2 };
  const skills = { alef: { rec: forte, som: forte, ler: forte }, mem: { rec: forte, ler: fraca } };
  const u = await abrir('/meu-hebraico/dominio/', estado({ licoes: ['alef', 'mem'], firsts: AULA0, skills }));
  const s = await u.texto();
  confere(s.includes('Dominada: 1') && s.includes('Leitura em palavras') && s.includes('Dados insuficientes'),
    'níveis por habilidade, com "Dados insuficientes"', `domínio com dados errado: ${s.slice(0, 300)}`);
  confere(s.includes('O que vale praticar agora') && s.includes('Mem: reconhecer e ler a letra dentro de palavras'),
    'a recomendação bate com a habilidade fraca', 'a recomendação não bate');
  await u.ctx.close();

  const d = await abrir('/meu-hebraico/', estado({ licoes: ['alef', 'mem'], firsts: AULA0, skills }), 1280);
  const ds = await d.texto();
  confere(/\b1 letra dominada\b/.test(ds) && /\b2 lições concluídas\b/.test(ds),
    'painel: 1 letra dominada e 2 lições concluídas, cada número com o seu nome', `painel: ${ds.slice(0, 400)}`);
  confere(await d.p.locator('main a[href^="/leitura"]').count() > 0 && await d.p.locator('main a[href^="/meu-hebraico/dominio"]').count() > 0,
    'painel leva à Leitura e ao domínio', 'painel sem os links');
  confere(/de 22 lições concluídas/.test(ds), 'a grade conta lições concluídas', 'a grade ainda diz dominadas');
  await d.ctx.close();
}

await b.close(); srv.close();
log(falhas ? `\n${falhas} problema(s).` : '\no laboratório, a primeira leitura, o domínio e o painel funcionam num navegador de verdade.');
process.exit(falhas ? 1 : 0);
