/* A tinta cai onde o dedo está?
   ─────────────────────────────────────────────────────────────────────────
   O quadro de escrita é o único lugar do curso onde a posição do ponteiro
   VIRA conteúdo. Em todo o resto, errar a conta de coordenadas move um botão
   dois pixels e ninguém nota; aqui ela desenha a letra no lugar errado.

   ── o defeito que deu origem a este arquivo ─────────────────────────────
   O menu de acessibilidade aumenta o texto com `zoom` num contêiner acima
   desta tela. Com isso o quadro passa a ter DOIS tamanhos ao mesmo tempo:
   607 pixels dele mesmo e 789 na tela. O componente media os 789 e escrevia
   de volta `style.width = "789px"` - lido como 789 dos DELE, ou seja 1025 na
   tela - e depois desenhava no deslocamento cru do ponteiro. A 130% a linha
   saía um terço adiante do dedo, e a partir de três quartos do quadro saía
   do bitmap e sumia: escrever ficava impossível para exatamente quem tinha
   aumentado o texto por precisar.

   Nenhum teste de unidade vê isso, e nenhuma captura de tela também: só se
   enxerga medindo ONDE A TINTA CAIU contra ONDE O PONTEIRO ESTAVA. É o que
   este arquivo faz, nos quatro tamanhos de texto que o menu oferece, nas
   duas telas que hospedam o quadro, e num ponto perto do canto - que é onde
   um erro de escala é maior e onde os dois primeiros testes que escrevi não
   olharam.

   Precisa do out/ construído em modo LOCAL (`npm run build`), porque entra
   no curso. node escrita.mjs (de dentro de app/). */

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
    } catch { /* diretório: tenta o próximo */ }
  }
  r.writeHead(404); r.end('404');
});
await new Promise(r => srv.listen(4494, r));
const BASE = 'http://127.0.0.1:4494';

const agora = new Date().toISOString();
const ACC = { v: 1, accounts: { 'd@h.t': {
  id: 'a', name: 'M', email: 'd@h.t', createdAt: agora, pw: 'x',
  entitlements: [{ courseSlug: 'alfabetizacao', grantedAt: agora,
    expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: 'd' }], orders: []
} }, current: 'd@h.t' };
const feita = id => ({ letterId: id, stagesDone: [1, 2, 3, 4, 5], quizBest: 1,
  quizAttempts: 1, perfectBonusPaid: true, completedAt: agora });
const FEITAS = ['alef', 'bet', 'gimel', 'dalet', 'he', 'vav', 'zayin', 'het'];
const ST = { version: 2, onboarding: { reason: 'familia', goalMinutes: 10,
  startingPoint: 'zero', name: 'M', completedAt: agora }, xp: 400,
  lessons: Object.fromEntries(FEITAS.map(i => [i, feita(i)])),
  checkpoints: {}, srs: {}, achievements: [], days: {},
  streak: { current: 1, longest: 1, lastDay: null }, lastRoute: null,
  finalChallenge: { best: null, completedAt: null },
  skills: {}, confusions: {}, firsts: {}, gym: {} };

/* O menu oferece quatro tamanhos. Os três maiores usam `zoom`; o normal não
   carimba atributo nenhum, e é o controle: se a conta estiver errada de um
   jeito que não tem a ver com zoom, ele acusa junto. */
const TAMANHOS = [null, 115, 130, 150];

/* Perto do canto, e não no meio. Um erro de ESCALA é proporcional à
   distância da origem: medido no centro, o desvio de 30% aparecia como 3
   pixels e passava. */
const ONDE = [
  { nome: 'canto inferior direito', fx: 0.82, fy: 0.82 },
  { nome: 'canto superior esquerdo', fx: 0.18, fy: 0.18 }
];

/* Meio pixel de tolerância: o centroide da tinta cai no meio de um traço
   arredondado, e o arredondamento do bitmap custa essa fração. */
const TOLERANCIA = 1.5;

let falhas = 0;
const erro = m => { log(`  ✗ ${m}`); falhas++; };
const ok = m => log(`  ✓ ${m}`);

const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });

/** Abre o quadro de escrita de uma tela e devolve o `canvas` pronto para uso. */
async function abrirQuadro(p, rota) {
  await p.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  if (p.url().includes('/entrar')) {
    erro(`${rota}: o portão mandou para o login - o out/ está em modo plataforma, `
       + 'e um verificador que não consegue abrir a tela não prova nada. Rode `npm run build`.');
    return null;
  }

  /* Na academia o quadro mora atrás do cartão "Escrita"; na lição, atrás da
     etapa 3. As duas portas são as do aluno. */
  if (rota.startsWith('/academia')) {
    const cartao = p.locator('button', { hasText: 'Traçar e escrever à mão' }).first();
    if (!(await cartao.count())) { erro(`${rota}: não achei o cartão da escrita`); return null; }
    await cartao.click();
  } else {
    const etapa = p.getByLabel(/^Etapa 3 de 5/).first();
    if (!(await etapa.count())) { erro(`${rota}: não achei a etapa 3`); return null; }
    await etapa.click();
  }
  await p.waitForTimeout(400);

  const comecar = p.locator('button', { hasText: 'Começar a traçar' }).first();
  if (await comecar.count()) { await comecar.click(); await p.waitForTimeout(400); }

  const canvas = p.locator('canvas').first();
  if (!(await canvas.count())) { erro(`${rota}: nenhum quadro de escrita na tela`); return null; }
  await canvas.scrollIntoViewIfNeeded();
  await p.waitForTimeout(250);
  return canvas;
}

/** A geometria do quadro, nos dois sistemas de medida que se encontram nele. */
const geometria = p => p.evaluate(() => {
  const c = document.querySelector('canvas');
  const r = c.getBoundingClientRect();
  return {
    tela: { x: r.x, y: r.y, w: r.width, h: r.height },
    proprio: { w: c.clientWidth, h: c.clientHeight },
    bitmap: { w: c.width, h: c.height }
  };
});

/** O centro da tinta, convertido de volta para pixels de tela. */
const ondeCaiu = (p, g) => p.evaluate(g => {
  const c = document.querySelector('canvas');
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let sx = 0, sy = 0, n = 0;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    if (d[(y * c.width + x) * 4 + 3] > 40) { sx += x; sy += y; n++; }
  }
  if (!n) return null;
  return {
    n,
    x: g.tela.x + (sx / n) * (g.tela.w / c.width),
    y: g.tela.y + (sy / n) * (g.tela.h / c.height)
  };
}, g);

for (const rota of ['/licao/tet/', '/academia/']) {
  log(`\n── o quadro em ${rota} ${'─'.repeat(Math.max(0, 34 - rota.length))}`);

  for (const tamanho of TAMANHOS) {
    const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
    await ctx.addInitScript(([a, s, t]) => {
      localStorage.setItem('hf-platform-local-v1', a);
      localStorage.setItem('hebraico-fluente-v1', s);
      if (t) localStorage.setItem('hf-acessibilidade-v1', JSON.stringify({ texto: Number(t) }));
    }, [JSON.stringify(ACC), JSON.stringify(ST), tamanho]);
    const p = await ctx.newPage();

    const canvas = await abrirQuadro(p, rota);
    if (!canvas) { await ctx.close(); continue; }

    const rotulo = `texto ${tamanho ?? 'normal'}`.padEnd(12);
    const g = await geometria(p);

    /* Antes de medir a tinta: o quadro tem de COBRIR a moldura. Com o
       defeito antigo ele saía 30% maior que ela e transbordava por baixo do
       resto do cartão - o que, sozinho, já era visível. */
    const moldura = await p.evaluate(() => {
      const r = document.querySelector('canvas').parentElement.getBoundingClientRect();
      return { w: r.width, h: r.height };
    });
    if (Math.abs(moldura.w - g.tela.w) > 1 || Math.abs(moldura.h - g.tela.h) > 1) {
      erro(`${rotulo} ${rota}: o quadro (${g.tela.w.toFixed(0)}×${g.tela.h.toFixed(0)}) `
         + `não cobre a moldura (${moldura.w.toFixed(0)}×${moldura.h.toFixed(0)})`);
    }

    for (const alvo of ONDE) {
      await p.evaluate(() => {
        const c = document.querySelector('canvas'), x = c.getContext('2d');
        x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
        x.clearRect(0, 0, c.width, c.height); x.restore();
      });

      const px = g.tela.x + g.tela.w * alvo.fx;
      const py = g.tela.y + g.tela.h * alvo.fy;
      await p.mouse.move(px, py);
      await p.mouse.down();
      await p.mouse.move(px + 1, py + 1);
      await p.mouse.up();
      await p.waitForTimeout(150);

      const tinta = await ondeCaiu(p, g);
      if (!tinta) {
        erro(`${rotulo} ${rota} · ${alvo.nome}: o traço não deixou tinta nenhuma `
           + '(caiu fora do bitmap)');
        continue;
      }
      const dx = tinta.x - px, dy = tinta.y - py;
      if (Math.abs(dx) > TOLERANCIA || Math.abs(dy) > TOLERANCIA) {
        erro(`${rotulo} ${rota} · ${alvo.nome}: a tinta caiu a `
           + `Δx=${dx.toFixed(1)} Δy=${dy.toFixed(1)} do ponteiro`);
      } else {
        ok(`${rotulo} ${rota} · ${alvo.nome}: Δ ${dx.toFixed(1)}, ${dy.toFixed(1)}`);
      }
    }

    /* E a resolução acompanha o zoom: um quadro desenhado na resolução sem
       zoom e depois ampliado fica borrado, que é um defeito mais brando mas
       ainda assim um defeito - e o sintoma de a conta ter voltado a errar. */
    const porPixel = g.bitmap.w / g.proprio.w;
    const esperado = (g.tela.w / g.proprio.w);
    if (porPixel < esperado - 0.05) {
      erro(`${rotulo} ${rota}: bitmap a ${porPixel.toFixed(2)}× para um quadro `
         + `ampliado ${esperado.toFixed(2)}× - a escrita sai borrada`);
    }

    await ctx.close();
  }
}

await b.close();
srv.close();
log('');
if (falhas) {
  log(`${falhas} problema(s) no quadro de escrita.\n`);
  process.exit(1);
}
log('a tinta cai sob o ponteiro em todos os tamanhos de texto.\n');
