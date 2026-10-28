/* O curso pago do site em inglês, tela por tela, num navegador.
   ────────────────────────────────────────────────────────────────────────
   As conferências da publicação abrem só as páginas livres. Este abre TODA
   página atrás do portão que a build em inglês escreveu (as lições, os
   módulos, a Academia, o exame, o perfil...), com um aluno que já concluiu
   as 22 letras, a 390 px, e procura o que só aparece com o curso aberto:

     · português que sobrou: letra com acento (texto em inglês não tem
       nenhuma, nem na transliteração) ou palavra portuguesa comum;
     · tela mais larga que o celular;
     · marcação crua ({{...}}) e erro de console ou de script.

   Em cada lição, anda pelas etapas e pelos passos da etapa 1 (Descobrir,
   Ouvir, Entender...) e responde os exercícios (errando quando dá, com o
   responder.mjs dos outros roteiros): o texto da correção só existe depois
   da resposta. O mesmo nas telas de exercício fora da lição (revisão,
   checkpoint, exame, missão, prática).

   Roda sobre a build LOCAL em inglês, sem Worker (o adaptador do aparelho
   aceita a conta injetada, como em varrer-curso.mjs):

     NEXT_PUBLIC_LOCALE=en HF_I18N_ESTRITO=1 npm run build
     node percurso-en.mjs            # HF_ROTAS=/licao/alef/,/perfil/ para algumas

   Sai com código 1 se achar qualquer coisa. */
import { createServer } from 'node:http';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { responder } from './responder.mjs';
// @ts-expect-error - módulo JS do Worker
import { isGatedPath } from '../worker/src/gate.js';

const OUT = 'out-en';
if (!existsSync(`${OUT}/index.html`)) {
  console.error(`${OUT}/ não existe. Rode antes: NEXT_PUBLIC_LOCALE=en npm run build`);
  process.exit(2);
}
if (readFileSync(`${OUT}/index.html`, 'utf8').includes('Ambiente de demonstra')) {
  console.error(`${OUT}/ está em português.`);
  process.exit(2);
}

const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.mp3': 'audio/mpeg', '.txt': 'text/plain' };
const s = createServer((q, r) => {
  const c = decodeURIComponent(q.url.split('?')[0]);
  for (const f of [`${OUT}${c}`, `${OUT}${c}/index.html`, `${OUT}${c}.html`, `${OUT}/404.html`]) {
    if (!existsSync(f) || statSync(f).isDirectory()) continue;
    r.writeHead(200, { 'Content-Type': T[f.slice(f.lastIndexOf('.'))] || 'application/octet-stream' });
    return r.end(readFileSync(f));
  }
  r.writeHead(404); r.end('404');
});
await new Promise(r => s.listen(4421, r));
const BASE = 'http://127.0.0.1:4421';

/* ── as rotas: toda página da build que o portão guarda ─────────────────── */
function paginas(dir, rota = '/') {
  const out = [];
  for (const nome of readdirSync(dir)) {
    const f = join(dir, nome);
    if (statSync(f).isDirectory()) {
      if (nome.startsWith('_') || nome === 'audio' || nome === 'stroke-order') continue;
      out.push(...paginas(f, `${rota}${nome}/`));
    } else if (nome === 'index.html') out.push(rota);
  }
  return out;
}
const ROTAS = process.env.HF_ROTAS ? process.env.HF_ROTAS.split(',')
  : paginas(OUT).filter(r => isGatedPath(r)).sort();

/* ── o aluno ─────────────────────────────────────────────────────────── */
const agora = new Date().toISOString();
const hoje = agora.slice(0, 10);
const LETRAS = ['alef', 'mem', 'tav', 'nun', 'he', 'yod', 'gimel', 'dalet', 'shin', 'lamed', 'resh', 'vav', 'zayin',
  'het', 'tet', 'samekh', 'ayin', 'tsadi', 'qof', 'bet', 'kaf', 'pe'];
const SONS = ['sin', 'vet', 'chaf', 'fe', 'contraste', 'tch', 'dj', 'j'];
const feita = id => ({ letterId: id, stagesDone: [1, 2, 3, 4, 5], quizBest: 1, quizAttempts: 1, perfectBonusPaid: true, completedAt: agora });
const lessons = {};
for (const l of LETRAS) lessons[l] = feita(l);
for (const x of SONS) lessons[`som-${x}`] = feita(`som-${x}`);
const ACC = { v: 1, accounts: { 'demo@hf.test': { id: 'acc_demo', name: 'Ann', email: 'demo@hf.test', createdAt: agora, pw: 'x',
  entitlements: [{ courseSlug: 'alfabetizacao', grantedAt: agora, expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: 'demo' }],
  orders: [] } }, current: 'demo@hf.test' };
const ST = { version: 2,
  onboarding: { reason: 'familia', goalMinutes: 10, startingPoint: 'zero', name: 'Ann', completedAt: agora },
  xp: 1800, lessons, checkpoints: {}, srs: {}, achievements: [{ id: 'primeira-letra', unlockedAt: agora }],
  days: { [hoje]: { answered: 12, units: 3, xp: 120, goalMet: false } }, streak: { current: 3, longest: 5, lastDay: hoje },
  lastRoute: null, finalChallenge: { best: null, completedAt: null }, skills: {}, confusions: {},
  firsts: { 'aula-0': agora }, gym: {} };

/* ── o que conta como português ───────────────────────────────────────── */
/* Acento em letra latina: o texto em inglês não tem nenhum, nem a
   transliteração (tests/translit.test.ts). As palavras pegam o que escapa
   do acento. O hebraico e os nomes próprios ficam de fora sozinhos. */
const ACENTO = /[A-Za-z]*[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ][A-Za-zÀ-ÿ]*/g;
const PALAVRAS = /\b(você|voce|não|nao|lição|licao|lições|palavra|palavras|letra|letras|também|está|então|porque|isso|aqui|agora|muito|quando|mais|sem|com|uma|um|para|pelo|pela|seu|sua|ouça|ouvir|leia|escreva|próxima|voltar|continuar|começar|concluir|parabéns)\b/gi;
/* Palavras que existem nos dois idiomas, ou que são do hebraico transliterado. */
const NOS_DOIS = new Set(['um', 'sem', 'com', 'mais', 'para', 'seu', 'sua']);
/* Nomes próprios que levam acento em qualquer idioma. */
const NOMES = new Set(['Damián']);

function portugues(texto) {
  const achados = new Set();
  for (const m of texto.match(ACENTO) || []) if (!NOMES.has(m)) achados.add(m);
  for (const m of texto.match(PALAVRAS) || []) {
    const w = m.toLowerCase();
    if (NOS_DOIS.has(w)) {
      /* Só conta se vier no meio de uma frase portuguesa: com outra palavra
         da lista por perto. */
      const re = new RegExp(`\\b${w}\\b\\s+(o|a|os|as|de|do|da|que|e)\\b`, 'i');
      if (!re.test(texto)) continue;
    }
    achados.add(m);
  }
  return [...achados];
}

function trecho(texto, palavra) {
  const i = texto.indexOf(palavra);
  return texto.slice(Math.max(0, i - 50), i + palavra.length + 50).replace(/\s+/g, ' ').trim();
}

/* ── o percurso ───────────────────────────────────────────────────────── */
const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM || undefined });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await ctx.addInitScript(([a, st]) => {
  localStorage.setItem('hf-platform-local-v1', a);
  if (!localStorage.getItem('hf-percurso')) { localStorage.setItem('hebraico-fluente-v1', st); localStorage.setItem('hf-percurso', '1'); }
}, [JSON.stringify(ACC), JSON.stringify(ST)]);
const p = await ctx.newPage();
p.setDefaultTimeout(4000);

const problemas = [];
let erros = [];
p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|404/.test(m.text())) erros.push(m.text().slice(0, 160)); });
p.on('pageerror', e => erros.push(`script: ${String(e).slice(0, 160)}`));

/* Junta o texto visível e mede a tela. */
async function medir() {
  return p.evaluate(() => ({
    rota: location.pathname,
    texto: document.body.innerText,
    sw: document.documentElement.scrollWidth,
    iw: innerWidth,
    cru: (document.body.innerText.match(/\{\{[^}]{1,40}\}\}/g) || [])[0] || null
  }));
}

/* Os botões que levam adiante dentro da mesma tela. */
const ADIANTE = /^(Next|See more|See the full explanation)/i;

/* Avança o que a tela oferece: "Next" nos passos, ou uma resposta por vez.
   Para quando nada mais anda, ou no teto, para o percurso ter fim. */
async function andar(rota, onde) {
  for (let k = 0; k < 30; k++) {
    const adiante = p.getByRole('button', { name: ADIANTE }).first();
    let r;
    if (await adiante.isVisible().catch(() => false)) {
      await adiante.click({ timeout: 2000 }).catch(() => {});
      await p.waitForTimeout(250);
      r = 'seguiu';
    } else {
      r = await responder(p).catch(() => 'nada');
    }
    if (r === 'nada') break;
    anotar(rota, await medir(), `${onde}, ação ${k + 1}`);
    /* Saiu da tela (um Continuar que leva à etapa seguinte da rota). */
    if (new URL(p.url()).pathname !== rota) { await p.goto(BASE + rota, { waitUntil: 'networkidle' }).catch(() => {}); break; }
  }
}

const visto = new Map();
let vistas = 0;
function anotar(rota, m, onde) {
  vistas++;
  const pt = portugues(m.texto);
  for (const w of pt) {
    const chave = `${w}|${trecho(m.texto, w)}`;
    if (visto.has(chave)) continue;
    visto.set(chave, rota);
    problemas.push(`${rota}${onde}: português? «${w}» em "${trecho(m.texto, w)}"`);
  }
  if (m.sw > m.iw + 1) problemas.push(`${rota}${onde}: mais larga que a tela (${m.sw}px em ${m.iw}px)`);
  if (m.cru) problemas.push(`${rota}${onde}: marcação crua na tela: ${m.cru}`);
}

for (const rota of ROTAS) {
  erros = [];
  vistas = 0;
  try {
    await p.goto(BASE + rota, { waitUntil: 'networkidle', timeout: 20_000 });
  } catch (e) {
    problemas.push(`${rota}: não carregou (${String(e).split('\n')[0]})`);
    continue;
  }
  await p.waitForTimeout(400);
  let m = await medir();
  anotar(rota, m, '');

  /* As lições: cada etapa da barra, e dentro dela os passos e as perguntas. */
  const BARRA = '[aria-label="Lesson steps"] button, [aria-label="Module steps"] button';
  const etapas = await p.locator(BARRA).count().catch(() => 0);
  if (etapas) {
    for (let i = 0; i < etapas; i++) {
      await p.locator(BARRA).nth(i).click({ timeout: 2000 }).catch(() => {});
      await p.waitForTimeout(250);
      anotar(rota, await medir(), ` (etapa ${i + 1})`);
      await andar(rota, ` (etapa ${i + 1})`);
    }
  } else if (/\/(checkpoint|revisao|desafio-final|missao|pratica|texto)\b/.test(rota)) {
    await andar(rota, '');
  }
  for (const e of [...new Set(erros)]) problemas.push(`${rota}: ${e}`);
  console.log(`${problemas.length ? '·' : '✓'} ${rota} (${vistas} estados da tela)`);
}

await b.close();
s.close();

console.log(`\n${ROTAS.length} telas.`);
if (problemas.length) {
  console.log(`\n${problemas.length} achado(s):`);
  for (const x of problemas) console.log(`  ✗ ${x}`);
  process.exit(1);
}
console.log('nenhum português sobrando, nenhuma tela estourada, nenhum erro.');
