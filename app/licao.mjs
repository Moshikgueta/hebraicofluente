/* O que sobra gravado quando a lição termina.
   ─────────────────────────────────────────────────────────────────────────
   O aluno fecha os exercícios, volta ao painel, e a letra que ele acabou de
   terminar não entrou na conta de "letras dominadas". Nada na tela explica
   por quê: as cinco etapas estão marcadas, a nota apareceu no fim do bloco,
   e mesmo assim a barra não andou.

   ── a causa, que nenhum teste de unidade alcançava ──────────────────────
   O fim dos exercícios chama DOIS mutadores no mesmo manipulador:

       p.finishQuiz(letra, nota);   // grava a nota
       p.finishStage(letra, 5);     // marca a quinta etapa

   Cada um partia do `state` do render em que foi criado. Entre os dois não
   há render, então o segundo partia do estado de ANTES do primeiro e o
   sobrescrevia: `quizBest` voltava a `null` um instante depois de ter sido
   gravado. E como `isLessonMastered` exige as cinco etapas E a nota, a letra
   ficava para sempre a um passo do fim - no painel, no mapa, na barra de
   progresso e no cadeado do exame final, todos de uma vez.

   Um teste do `rules.ts` não via nada: as funções puras sempre estiveram
   certas. O defeito morava na ORDEM em que a tela as chamava, e é por isso
   que esta verificação termina a lição de verdade, num navegador, e depois
   lê o que ficou no armazenamento - que é a única testemunha que não tem
   opinião.

   Precisa do out/ construído em modo LOCAL (`npm run build`).
   node licao.mjs (de dentro de app/). */

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
await new Promise(r => srv.listen(4495, r));
const BASE = 'http://127.0.0.1:4495';

const agora = new Date().toISOString();
const ACC = { v: 1, accounts: { 'd@h.t': {
  id: 'a', name: 'M', email: 'd@h.t', createdAt: agora, pw: 'x',
  entitlements: [{ courseSlug: 'alfabetizacao', grantedAt: agora,
    expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: 'd' }], orders: []
} }, current: 'd@h.t' };

const base = licoes => ({ version: 2, onboarding: { reason: 'familia', goalMinutes: 10,
  startingPoint: 'zero', name: 'M', completedAt: agora }, xp: 0, lessons: licoes,
  checkpoints: {}, srs: {}, achievements: [], days: {},
  streak: { current: 0, longest: 0, lastDay: null }, lastRoute: null,
  finalChallenge: { best: null, completedAt: null },
  skills: {}, confusions: {}, firsts: {}, gym: {} });

const licao = (id, etapas, nota) => ({ letterId: id, stagesDone: etapas, quizBest: nota,
  quizAttempts: nota == null ? 0 : 1, perfectBonusPaid: false,
  completedAt: etapas.length >= 5 ? agora : null });

let falhas = 0;
const erro = m => { log(`  ✗ ${m}`); falhas++; };
const ok = m => log(`  ✓ ${m}`);

const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });

async function pagina(estado) {
  const ctx = await b.newContext({ viewport: { width: 420, height: 1000 } });
  await ctx.addInitScript(([a, s]) => {
    localStorage.setItem('hf-platform-local-v1', a);
    localStorage.setItem('hebraico-fluente-v1', s);
  }, [JSON.stringify(ACC), JSON.stringify(estado)]);
  return { ctx, p: await ctx.newPage() };
}

/* ── 1 · terminar os exercícios de verdade ──────────────────────────────────
   A letra chega com as quatro primeiras etapas feitas e SEM nota, que é
   exatamente o estado de quem abre os exercícios pela primeira vez. */
log('\n── os exercícios gravam a nota ───────────────────────');
{
  const { ctx, p } = await pagina(base({ alef: licao('alef', [1, 2, 3, 4], null) }));

  await p.goto(`${BASE}/licao/alef/`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  if (p.url().includes('/entrar')) {
    erro('o portão mandou para o login - o out/ está em modo plataforma. Rode `npm run build`.');
  } else {
    const etapa = p.getByLabel(/^Etapa 5 de 5/).first();
    if (!(await etapa.count())) erro('não achei a etapa 5 no cabeçalho da lição');
    else {
      await etapa.click();
      await p.waitForTimeout(500);

      /* O mesmo laço de `exercicios.mjs`, reduzido ao necessário: responder
         qualquer coisa e seguir. A NOTA não importa aqui - o que se prova é
         que ela foi gravada, não que foi boa. */
      const estado = () => p.evaluate(() => {
        const main = document.querySelector('main');
        const botoes = [...main.querySelectorAll('button')].map((el, i) => ({
          i, txt: (el.innerText || '').replace(/\s+/g, ' ').trim(),
          off: el.disabled || el.getAttribute('aria-disabled') === 'true', etapa: !!el.getAttribute('aria-label')?.startsWith('Etapa'),
          rotulo: el.getAttribute('aria-label') || ''
        }));
        return {
          txt: (main?.innerText || '').replace(/\s+/g, ' '),
          temCampo: !!main.querySelector('input[type="text"], input:not([type])'),
          temContador: !!main.querySelector('[data-progresso]'),
          botoes
        };
      });

      let acabou = false;
      for (let passo = 0; passo < 140; passo++) {
        const e = await estado();
        /* O fim do bloco: o player sai e o resultado entra, com o botão que
           a lição chama de "Concluir e continuar". */
        /* Abaixo de 80% o botão é "Refazer os exercícios" (UXQA-002): também é o
           fim, e a nota já foi gravada. */
        if (/Concluir e continuar|Refazer os exercícios/.test(e.txt)) { acabou = true; break; }

        const seguir = e.botoes.find(x => !x.off
          && /^Continuar|^Próxim|^Ver resultado|^Concluir/.test(x.txt));
        if (seguir) { await p.locator('main button').nth(seguir.i).click().catch(() => {}); }
        else if (e.temCampo) {
          await p.locator('main input').first().fill('x');
          await p.keyboard.press('Enter');
        } else {
          const alvos = e.botoes.filter(x => !x.off && !x.etapa && x.txt
            && !/dica|Pular|Ouvir|Tocar|Limpar|Desfazer/i.test(x.txt)
            /* "0,7×" é o "Ouvir devagar": o nome está só no rótulo acessível. */
            && !/Ouvir|Tocar/i.test(x.rotulo));
          if (!alvos.length) { await p.waitForTimeout(300); continue; }
          /* Uma alternativa sorteada, e não sempre a primeira: o erro volta
             até ser acertado (a prática de revisão), e um robô que toca
             sempre a primeira nunca acerta quando a certa não é ela. */
          const alvo = alvos[Math.floor(Math.random() * alvos.length)];
          await p.locator('main button').nth(alvo.i).click().catch(() => {});
        }
        await p.waitForTimeout(260);
      }

      if (!acabou) erro('não cheguei ao fim dos exercícios em 140 toques');
      else {
        /* A gravação tem debounce de 250 ms. */
        await p.waitForTimeout(900);
        const guardado = await p.evaluate(() =>
          JSON.parse(localStorage.getItem('hebraico-fluente-v1') || '{}'));
        const l = guardado.lessons?.alef;

        if (!l) erro('a lição não deixou registro nenhum no armazenamento');
        else {
          if (l.stagesDone?.includes(5)) ok('a quinta etapa ficou marcada');
          else erro(`a quinta etapa não ficou marcada (stagesDone: ${JSON.stringify(l.stagesDone)})`);

          if (typeof l.quizBest === 'number') {
            ok(`a nota dos exercícios ficou gravada (${l.quizBest.toFixed(2)})`);
          } else {
            erro('a NOTA dos exercícios não ficou gravada (quizBest: '
               + `${JSON.stringify(l.quizBest)}) - a letra nunca vai contar como dominada`);
          }
        }
      }
    }
  }
  await ctx.close();
}

/* ── 2 · e a conta de letras enxerga isso ───────────────────────────────
   A regra acima prova que a nota é gravada. Esta prova que gravá-la muda o
   número que o aluno lê - e que NÃO gravá-la o deixa parado, que é o outro
   lado da mesma frase e o controle desta verificação. */
log('\n── a conta de lições concluídas ────────────────────');
{
  const casos = [
    { nome: 'cinco etapas e nota cheia', licoes: { alef: licao('alef', [1, 2, 3, 4, 5], 1) }, conta: 1 },
    { nome: 'cinco etapas sem nota', licoes: { alef: licao('alef', [1, 2, 3, 4, 5], null) }, conta: 0 },
    { nome: 'cinco etapas com nota fraca', licoes: { alef: licao('alef', [1, 2, 3, 4, 5], 0.5) }, conta: 0 },
    { nome: 'duas lições concluídas', conta: 2,
      licoes: { alef: licao('alef', [1, 2, 3, 4, 5], 1), bet: licao('bet', [1, 2, 3, 4, 5], 0.875) } }
  ];

  for (const caso of casos) {
    const { ctx, p } = await pagina(base(caso.licoes));
    await p.goto(`${BASE}/meu-hebraico/`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);

    const texto = await p.evaluate(() => (document.querySelector('main')?.innerText || '')
      .replace(/\s+/g, ' '));
    const m = texto.match(/(\d+)\s+de\s+(\d+)\s+lições\s+concluídas/);
    if (!m) erro(`${caso.nome}: não achei a frase "N de M lições concluídas" no painel`);
    else if (Number(m[1]) !== caso.conta) {
      erro(`${caso.nome}: o painel diz ${m[1]} e deveria dizer ${caso.conta}`);
    } else {
      ok(`${caso.nome}: ${m[1]} de ${m[2]}`);
    }
    await ctx.close();
  }
}

await b.close();
srv.close();
log('');
if (falhas) {
  log(`${falhas} problema(s) no que a lição grava.\n`);
  process.exit(1);
}
log('a lição grava a nota, e a conta de lições concluídas a enxerga.\n');
