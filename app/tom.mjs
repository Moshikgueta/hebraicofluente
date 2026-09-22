/* O tom e o tamanho das telas do curso.
   ─────────────────────────────────────────────────────────────────────────
   Duas coisas que não quebram nada e estragam o produto devagar:

   TOM. "Hebraico é super fácil!" é a frase que o pedido proíbe by name, e
   ela não é proibida por pudor: um adulto que leu isso e travou na terceira
   letra conclui que o problema é ele. A régua daqui é a mesma do pedido -
   nada de promessa de facilidade, nada de diminutivo de escola infantil,
   nada de entusiasmo exclamado.

   TAMANHO. "Evite páginas gigantescas de texto" também é do pedido, e é o
   defeito que entra sozinho: cada coisa nova que alguém acrescenta numa
   tela é defensável, e vinte delas depois a página tem dezoito mil pixels.
   Aqui há um teto por rota, e uma exceção NOMEADA - a aula 0, que é longa
   por decisão e por isso tem índice.

   Precisa do out/ em modo local. node tom.mjs (de dentro de app/). */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';

const T = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp'
};
const srv = createServer((q, r) => {
  const c = decodeURIComponent(q.url.split('?')[0]);
  for (const f of [`out${c}`, `out${c}/index.html`, `out${c}.html`, 'out/404.html']) {
    if (!existsSync(f) || f.endsWith('/')) continue;
    try {
      const b = readFileSync(f);
      r.writeHead(200, { 'Content-Type': T[f.slice(f.lastIndexOf('.'))] || 'application/octet-stream' });
      return r.end(b);
    } catch { /* próximo */ }
  }
  r.writeHead(404); r.end('404');
});
await new Promise(r => srv.listen(4492, r));

const agora = new Date().toISOString();
const ACC = { v: 1, accounts: { 'd@h.t': {
  id: 'a', name: 'M', email: 'd@h.t', createdAt: agora, pw: 'x',
  entitlements: [{ courseSlug: 'alfabetizacao', grantedAt: agora,
    expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: 'd' }], orders: []
} }, current: 'd@h.t' };
const curso = JSON.parse(readFileSync('content/course.json', 'utf8'));
const lessons = {};
for (const l of curso.letters) {
  lessons[l.id] = { letterId: l.id, stagesDone: [1, 2, 3, 4, 5], quizBest: 1,
    quizAttempts: 1, perfectBonusPaid: true, completedAt: agora };
}
const ST = { version: 2, onboarding: { reason: 'familia', goalMinutes: 10,
  startingPoint: 'zero', name: 'M', completedAt: agora }, xp: 900, lessons,
  checkpoints: {}, srs: {}, achievements: [], days: {},
  streak: { current: 0, longest: 0, lastDay: null }, lastRoute: null,
  finalChallenge: { best: null, completedAt: null }, skills: {}, confusions: {},
  firsts: {}, gym: {} };

/* ── o que o curso não diz ────────────────────────────────────────────────
   Cada linha existe contra uma frase concreta, e não contra um estilo. */
const PROIBIDO = [
  [/\b(super|muito|bem)\s+f[áa]ce?i[sl]\b/i, 'promessa de facilidade'],
  [/\b[ée]\s+f[áa]cil\b/i, 'promessa de facilidade'],
  [/\bfacil[íi]?ssimo|moleza|sopa|canja\b/i, 'promessa de facilidade'],
  [/\brapidinho|num piscar de olhos|em poucos minutos voc[êe] j[áa]\b/i, 'promessa de velocidade'],
  [/\bamiguinh|criançada|queridinh|fofinh/i, 'diminutivo de escola infantil'],
  [/\bparab[ée]ns!{2,}|incr[íi]vel!{2,}|uau/i, 'entusiasmo exclamado'],
  [/!{2,}/, 'duas exclamações seguidas']
];

/* O teto de altura por rota, a 390px de largura. A aula 0 é a exceção
   nomeada: ela é longa por decisão - o pedido pedia doze blocos de
   explicação antes da primeira letra - e o que a torna navegável é o
   índice, que é conferido em varrer-curso.mjs.

   Medido hoje: a aula 0 dá 19.766px, e as lições ficam entre 4.100 e
   5.300. O teto dela está pouco acima do que ela já ocupa, e isso é a
   intenção: o próximo bloco que alguém quiser acrescentar ali não deve
   caber sem uma decisão. Os mil pixels de folga são para variação de
   renderização entre máquinas, não para conteúdo novo. */
const TETO_PADRAO = 12000;
const TETO = { '/inicio/': 21000 };

const ROTAS = ['/meu-hebraico/', '/mapa/', '/inicio/', '/historia/', '/revisao/',
  '/academia/', '/conquistas/', '/perfil/', '/modulo/6/', '/desafio-final/',
  '/licao/alef/', '/licao/he/', '/licao/vav/', '/licao/bet/', '/licao/pe/'];

let falhas = 0;
const erro = m => { console.log(`  ✗ ${m}`); falhas++; };

const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });
const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
await ctx.addInitScript(([a, s]) => {
  localStorage.setItem('hf-platform-local-v1', a);
  localStorage.setItem('hebraico-fluente-v1', s);
}, [JSON.stringify(ACC), JSON.stringify(ST)]);
const p = await ctx.newPage();

for (const rota of ROTAS) {
  await p.goto(`http://127.0.0.1:4492${rota}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(350);

  /* Todas as etapas da lição, e não só a primeira: o texto das outras
     quatro não aparece no innerText de quem acabou de chegar. */
  const textos = [];
  const alturas = [];
  const etapas = await p.locator('[aria-label^="Etapa "]').count();
  for (let k = 0; k <= etapas; k++) {
    if (k > 0) {
      await p.locator('[aria-label^="Etapa "]').nth(k - 1).click().catch(() => {});
      await p.waitForTimeout(300);
    }
    textos.push(await p.innerText('body'));
    alturas.push(await p.evaluate(() => document.documentElement.scrollHeight));
    if (!etapas) break;
  }

  const texto = textos.join('\n').replace(/\s+/g, ' ');
  const alto = Math.max(...alturas);
  const teto = TETO[rota] ?? TETO_PADRAO;

  const achados = PROIBIDO
    .map(([re, oque]) => [texto.match(re), oque])
    .filter(([m]) => m)
    .map(([m, oque]) => `${oque}: "${String(m[0]).trim()}"`);

  console.log(`  ${rota.padEnd(18)} ${String(alto).padStart(6)}px ` +
              `${alto > teto ? `ACIMA DO TETO (${teto})` : 'ok'}` +
              `${achados.length ? ' · ' + achados.join(' · ') : ''}`);
  if (alto > teto) falhas++;
  falhas += achados.length;
}

await b.close(); srv.close();
console.log('');
console.log(falhas === 0
  ? 'nenhuma tela do curso promete facilidade nem virou parede de texto.'
  : `${falhas} problema(s)`);
if (falhas) process.exit(1);
