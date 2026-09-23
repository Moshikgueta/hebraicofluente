/* As telas da rodada de 23/09, num navegador de verdade, no celular e no
   computador.
   ─────────────────────────────────────────────────────────────────────────
   Os testes de unidade provam o motor: que montar nunca mostra letra futura,
   que a conta de palavras bate com a regra de leitura. Nenhum deles toca numa
   tela. Este arquivo toca, e cobra o que só a tela pode errar:

     · o vocabulário mostra EXATAMENTE as palavras que as letras concluídas
       leem - nenhuma com letra que o aluno ainda não viu -, e a busca filtra;
     · o nome em hebraico fica escondido enquanto faltam letras, e grava a
       grafia confirmada quando elas chegam;
     · a digitação em hebraico pede o teclado ANTES, avisa quando chega letra
       latina, e aceita a resposta certa;
     · montar a palavra aceita a ordem certa, e no erro devolve as peças para
       refazer em vez de entregar a resposta;
     · o certificado aceita o nome em hebraico só depois de conferido;
     · nenhuma dessas páginas rola de lado no celular, e nenhuma deixa erro
       no console.

   Precisa do out/ em modo LOCAL (`npm run build`).
   node rodada2.mjs (de dentro de app/). */

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
await new Promise(r => srv.listen(4493, r));
const BASE = 'http://127.0.0.1:4493';

const curso = JSON.parse(readFileSync('content/course.json', 'utf8'));
const letras = JSON.parse(readFileSync('content/letters.json', 'utf8')).sort((a, b) => a.order - b.order);
const NIKUD = /[֑-ׇ]/g;
const semVogal = s => s.replace(NIKUD, '');
const FINAL = { 'ם': 'מ', 'ן': 'נ', 'ץ': 'צ', 'ף': 'פ', 'ך': 'כ' };
const base = g => FINAL[g] ?? g;

const agora = new Date().toISOString();
const ACC = { v: 1, accounts: { 'd@h.t': {
  id: 'a', name: 'Gabriel', email: 'd@h.t', createdAt: agora, pw: 'x',
  entitlements: [{ courseSlug: 'alfabetizacao', grantedAt: agora,
    expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: 'd' }], orders: []
} }, current: 'd@h.t' };

function estado(n, extra = {}) {
  const lessons = {};
  for (const l of curso.letters.slice(0, n)) {
    lessons[l.id] = { letterId: l.id, stagesDone: [1, 2, 3, 4, 5], quizBest: 1,
      quizAttempts: 1, perfectBonusPaid: true, completedAt: agora };
  }
  return { version: 2, onboarding: { reason: 'viagem', goalMinutes: 10,
    startingPoint: 'zero', name: 'Gabriel', completedAt: agora }, xp: 900, lessons,
    checkpoints: {}, srs: {}, achievements: [], days: {}, streak: { current: 0, longest: 0, lastDay: null },
    lastRoute: null, finalChallenge: { best: null, completedAt: null },
    skills: {}, confusions: {}, firsts: {}, gym: {}, nomeHebraico: null, kinds: {}, ...extra };
}

let falhas = 0;
const erro = m => { log(`  ✗ ${m}`); falhas++; };
const ok = m => log(`  ✓ ${m}`);

const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });

async function pagina(width, st) {
  const ctx = await b.newContext({ viewport: { width, height: 900 }, hasTouch: width < 700 });
  await ctx.addInitScript(([a, s]) => {
    if (!sessionStorage.getItem('semeado')) {
      localStorage.setItem('hf-platform-local-v1', a);
      localStorage.setItem('hebraico-fluente-v1', s);
      sessionStorage.setItem('semeado', '1');
    }
  }, [JSON.stringify(ACC), JSON.stringify(st)]);
  const p = await ctx.newPage();
  const problemas = [];
  p.on('pageerror', e => problemas.push(String(e.message || e).slice(0, 160)));
  p.on('console', m => { if (m.type() === 'error') problemas.push(m.text().slice(0, 160)); });
  return { ctx, p, problemas };
}

const guardado = p => p.evaluate(() => JSON.parse(localStorage.getItem('hebraico-fluente-v1') || '{}'));
const semRolarDeLado = async (p, onde) => {
  const [sw, iw] = await p.evaluate(() => [document.scrollingElement.scrollWidth, window.innerWidth]);
  if (sw > iw + 1) erro(`${onde}: a página rola de lado (${sw} > ${iw})`);
};
const hebraicoNaTela = p => p.evaluate(() =>
  [...(document.querySelector('main')?.innerText || '')].filter(c => /[א-ת]/.test(c)));

for (const width of [390, 1280]) {
  log(`\n── ${width}px ${'─'.repeat(44)}`);

  /* ── 1 · o vocabulário ─────────────────────────────────────────────── */
  {
    const n = 9;
    const { ctx, p, problemas } = await pagina(width, estado(n));
    await p.goto(`${BASE}/vocabulario/`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);
    const titulo = await p.locator('main h1').innerText();
    const m = titulo.match(/ler (\d+) palavra/);
    const cartoes = await p.locator('[data-vocabulario] > li').count();
    if (!m) erro(`vocabulário: o título não diz o número («${titulo}»)`);
    else if (Number(m[1]) !== cartoes) erro(`vocabulário: o título diz ${m[1]} e há ${cartoes} cartões`);
    else ok(`vocabulário com ${n} letras: ${cartoes} palavras, e o título diz o mesmo número`);

    /* A palavra apontada segue a regra de LEITURA (o ו vogal é permitido, e
       os testes de unidade cobram isso). O que aparece como LETRA - a lista
       de letras e a forma à mão, sem vogal - segue a régua estrita. */
    const permitidas = new Set(letras[n - 1].alphabetSoFar.map(base));
    const comoLetra = await p.evaluate(() =>
      [...document.querySelectorAll('[data-letras], [data-cursiva]')]
        .flatMap(el => [...el.textContent].filter(c => /[\u05D0-\u05EA]/.test(c))));
    const fora = comoLetra.filter(c => !permitidas.has(base(c)));
    if (fora.length) erro(`vocabulário mostra como LETRA o que o aluno não aprendeu: ${[...new Set(fora)].join(' ')}`);
    else ok(`nenhuma letra fora das aprendidas aparece como letra (${comoLetra.length} conferidas)`);

    await p.fill('#busca-vocab', 'ma');
    await p.waitForTimeout(300);
    const filtradas = await p.locator('[data-vocabulario] > li').count();
    if (!(filtradas > 0 && filtradas < cartoes)) erro(`a busca por «ma» deu ${filtradas} de ${cartoes}`);
    else ok(`a busca filtra: «ma» → ${filtradas} de ${cartoes}`);
    await p.fill('#busca-vocab', 'אמא');
    await p.waitForTimeout(300);
    if (!(await p.locator('[data-vocabulario] > li').count())) erro('a busca em hebraico não achou אמא');
    else ok('a busca em hebraico acha אמא');

    const s = await guardado(p);
    if (cartoes >= 10 && !s.firsts?.['le-10']) erro('passou de 10 palavras e o marco le-10 não foi gravado');
    else if (cartoes >= 10) ok('o marco de 10 palavras foi gravado (conquista)');
    await semRolarDeLado(p, 'vocabulário');
    if (problemas.length) erro(`vocabulário: ${problemas[0]}`);
    await ctx.close();
  }

  /* ── 2 · o nome, antes e depois das letras ─────────────────────────── */
  {
    const n = 5;
    const { ctx, p, problemas } = await pagina(width, estado(n));
    await p.goto(`${BASE}/meu-nome/`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);
    const txt = await p.locator('main').innerText();
    if (!/Faltam \d+ letras? para escrever/.test(txt)) erro('meu-nome com 5 letras não diz quantas faltam');
    else ok('meu-nome com 5 letras: diz quantas faltam');
    const permitidas = new Set(letras[n - 1].alphabetSoFar.map(base));
    const fora = (await hebraicoNaTela(p)).filter(c => !permitidas.has(base(c)));
    if (fora.length) erro(`meu-nome revela letra futura: ${[...new Set(fora)].join(' ')}`);
    else ok('e não revela nenhuma letra que ainda não chegou');
    if (problemas.length) erro(`meu-nome (5): ${problemas[0]}`);
    await ctx.close();
  }
  {
    const { ctx, p, problemas } = await pagina(width, estado(22));
    await p.goto(`${BASE}/meu-nome/`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(700);
    const txt = await p.locator('main').innerText();
    if (!txt.includes('גבריאל')) erro('meu-nome com 22 letras não sugere גבריאל');
    else ok('meu-nome sugere גבריאל');
    /* O editor: tirar uma letra e pô-la de volta. */
    await p.getByRole('button', { name: 'Tirar a letra ל' }).first().click();
    await p.getByRole('button', { name: 'Pôr a letra ל' }).first().click();
    await p.getByRole('button', { name: /É assim que eu escrevo/ }).click();
    await p.waitForTimeout(700);
    const s = await guardado(p);
    if (s.nomeHebraico?.texto !== 'גבריאל') erro(`a grafia confirmada não foi gravada (${JSON.stringify(s.nomeHebraico)})`);
    else ok('a grafia confirmada ficou gravada na conta');
    if (!s.firsts?.['meu-nome']) erro('a conquista do nome não foi marcada');
    else ok('e a conquista do nome foi marcada');
    if (!(await p.locator('canvas').count())) erro('o quadro para escrever o nome à mão não apareceu');
    else ok('o quadro para escrever o nome à mão aparece');
    await semRolarDeLado(p, 'meu-nome');
    if (problemas.length) erro(`meu-nome (22): ${problemas[0]}`);
    await ctx.close();
  }

  /* ── 3 · digitar em hebraico, com o teclado antes ───────────────────── */
  {
    const { ctx, p, problemas } = await pagina(width, estado(22));
    await p.goto(`${BASE}/academia/`, { waitUntil: 'networkidle' });
    await p.getByRole('button', { name: /Digitar em hebraico/ }).first().click();
    await p.waitForTimeout(400);
    const guia = await p.getByRole('button', { name: 'Já adicionei o teclado hebraico' }).count();
    const sistemas = await p.getByRole('group', { name: 'Escolha o seu aparelho' }).locator('button').count();
    if (!guia || sistemas !== 4) erro(`o guia do teclado não veio antes da digitação (botão ${guia}, sistemas ${sistemas})`);
    else ok('o guia do teclado vem antes, com os quatro sistemas');
    await p.getByRole('button', { name: 'Já adicionei o teclado hebraico' }).click();
    await p.waitForTimeout(500);

    const campo = p.locator('main input[lang="he"]');
    if (!(await campo.count())) erro('depois de confirmar, o campo em hebraico não apareceu');
    else {
      await campo.fill('imma');
      await campo.press('Enter');
      await p.waitForTimeout(250);
      if (!/letras latinas/.test(await p.locator('main').innerText())) erro('letra latina não gerou o aviso do teclado');
      else ok('letra latina gera o aviso "o teclado ainda está em português"');

      const enunciado = await p.locator('main').innerText();
      const tr = enunciado.match(/Digite em hebraico: “([^”]+)”/)?.[1];
      const w = letras.flatMap(l => l.wordsToRead).find(x => x.translit === tr);
      if (!w) erro(`não achei a palavra de «${tr}» no conteúdo`);
      else {
        await campo.fill(semVogal(w.he));
        await campo.press('Enter');
        await p.waitForTimeout(400);
        const depois = await p.locator('main').innerText();
        if (/O certo era/.test(depois)) erro(`a resposta certa digitada (${semVogal(w.he)}) foi recusada`);
        else if (!(await p.getByRole('button', { name: /^Continuar|^Ver resultado/ }).count())) erro('digitou certo e o item não foi corrigido');
        else ok(`digitar ${semVogal(w.he)} para «${tr}» é aceito`);
      }
    }
    const s = await guardado(p);
    if (!s.firsts?.['teclado-hebraico']) erro('a confirmação do teclado não ficou gravada');
    await semRolarDeLado(p, 'digitar');
    if (problemas.length) erro(`digitar: ${problemas[0]}`);
    await ctx.close();
  }

  /* ── 4 · montar a palavra: certo, e errado-depois-certo ─────────────── */
  {
    const { ctx, p, problemas } = await pagina(width, estado(22));
    await p.goto(`${BASE}/academia/`, { waitUntil: 'networkidle' });
    await p.getByRole('button', { name: /Construir palavras/ }).first().click();
    await p.waitForTimeout(500);

    /* Duas palavras podem ter a mesma transliteração. A certa é a que tem
       todas as suas letras na mesa - e isso se lê da tela. */
    const alvo = async () => {
      const txt = await p.locator('main').innerText();
      const tr = txt.match(/Monte (?:em cursiva )?a palavra “([^”]+)”/)?.[1];
      const mesa = await p.evaluate(() => [...document.querySelectorAll('main button[aria-label^="Letra "]')]
        .map(b => b.getAttribute('aria-label').slice(6)));
      const cabe = seq => { const m = [...mesa]; return seq.every(g => { const k = m.indexOf(g); if (k < 0) return false; m.splice(k, 1); return true; }); };
      const w = letras.flatMap(l => l.wordsToRead)
        .filter(x => x.translit === tr).map(x => [...semVogal(x.he)]).find(cabe);
      return w ?? null;
    };
    const por = async seq => {
      for (const g of seq) {
        const livres = p.locator(`main button[aria-label="Letra ${g}"]:not([disabled])`);
        if (!(await livres.count())) {
          const tela = await p.locator('main').innerText();
          const mesa = await p.evaluate(() => [...document.querySelectorAll('main button[aria-label^="Letra "]')]
            .map(b => `${b.getAttribute('aria-label')}${b.disabled ? '(off)' : ''}`));
          throw new Error(`sem peça livre para ${g} em ${seq.join('')}\nmesa: ${mesa.join(', ')}\ntela: ${tela.slice(0, 500)}`);
        }
        await livres.first().click();
        await p.waitForTimeout(60);
      }
    };

    const certo = await alvo();
    if (!certo) erro('não achei a palavra do primeiro item de montar');
    else {
      await por(certo);
      await p.getByRole('button', { name: 'Conferir' }).click();
      await p.waitForTimeout(400);
      const txt = await p.locator('main').innerText();
      if (/contando da direita|Na primeira tentativa/.test(txt)) erro(`montar ${certo.join('')} na ordem certa não foi aceito`);
      else ok(`montar ${certo.join('')} na ordem certa é aceito de primeira`);
      await p.getByRole('button', { name: /^Continuar|^Ver resultado/ }).first().click();
      await p.waitForTimeout(400);
    }

    /* O segundo item, de propósito errado: a ordem ao contrário. */
    let testouErro = false;
    for (let tentativa = 0; tentativa < 6 && !testouErro; tentativa++) {
      const seq = await alvo();
      if (!seq) break;
      const invertida = [...seq].reverse();
      if (invertida.join('') === seq.join('')) {
        await por(seq);
        await p.getByRole('button', { name: 'Conferir' }).click();
        await p.waitForTimeout(300);
        await p.getByRole('button', { name: /^Continuar|^Ver resultado/ }).first().click().catch(() => {});
        await p.waitForTimeout(300);
        continue;
      }
      await por(invertida);
      await p.getByRole('button', { name: 'Conferir' }).click();
      await p.waitForTimeout(300);
      const aviso = await p.locator('main').innerText();
      const continuar = await p.getByRole('button', { name: /^Continuar|^Ver resultado/ }).count();
      if (!/contando da direita/.test(aviso)) erro('o erro de montagem não disse em que posição estava a letra errada');
      else if (continuar) erro('o erro de montagem entregou a resposta em vez de deixar refazer');
      else ok('o erro diz a posição e a letra certa, e devolve as peças para refazer');
      /* Refaz: tira o que sobrou e monta certo. */
      while (await p.locator('main button[aria-label^="Tirar a letra"]').count()) {
        await p.locator('main button[aria-label^="Tirar a letra"]').first().click();
        await p.waitForTimeout(40);
      }
      await por(seq);
      await p.getByRole('button', { name: 'Conferir' }).click();
      await p.waitForTimeout(400);
      const fim = await p.locator('main').innerText();
      if (!(await p.getByRole('button', { name: /^Continuar|^Ver resultado/ }).count())) erro('refazer certo não fechou o item');
      else if (!/Na primeira tentativa/.test(fim)) erro('o item refeito não explicou o erro da primeira tentativa');
      else ok('refazer certo fecha o item, e a explicação lembra o primeiro erro');
      testouErro = true;
    }
    if (!testouErro) erro('não achei um item para testar o erro de montagem');
    await semRolarDeLado(p, 'construir');
    if (problemas.length) erro(`construir: ${problemas[0]}`);
    await ctx.close();
  }

  /* ── 5 · o certificado, com o nome em hebraico conferido ────────────── */
  {
    const { ctx, p, problemas } = await pagina(width, estado(22, {
      finalChallenge: { best: 0.95, completedAt: agora, passedAt: agora, attempts: 1 }
    }));
    await p.goto(`${BASE}/certificado/`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(800);
    const caixa = p.getByLabel('Adicionar o meu nome em hebraico ao certificado');
    if (!(await caixa.count())) erro('o certificado não oferece o nome em hebraico');
    else {
      await caixa.check();
      await p.waitForTimeout(300);
      const conferi = p.getByLabel(/Conferi: é assim que se escreve/);
      if (!(await conferi.count())) erro('o certificado não pede para conferir a grafia');
      else {
        const antes = await guardado(p);
        if (antes.nomeHebraico) erro('o nome em hebraico foi gravado antes de conferido');
        await conferi.check();
        await p.waitForTimeout(700);
        const s = await guardado(p);
        if (!s.nomeHebraico?.texto) erro('a grafia conferida no certificado não foi gravada');
        else ok(`o certificado usa o nome em hebraico só depois de conferido (${s.nomeHebraico.texto})`);
      }
    }
    await semRolarDeLado(p, 'certificado');
    if (problemas.length) erro(`certificado: ${problemas[0]}`);
    await ctx.close();
  }

  /* ── 6 · o painel mostra o número e o convite do nome ───────────────── */
  {
    const { ctx, p, problemas } = await pagina(width, estado(22));
    await p.goto(`${BASE}/meu-hebraico/`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(800);
    const txt = await p.locator('main').innerText();
    if (!/Você já consegue ler \d+ palavras/.test(txt)) erro('o painel não mostra quantas palavras o aluno lê');
    else ok('o painel mostra quantas palavras o aluno lê');
    if (!/Agora você já consegue escrever o seu nome/.test(txt)) erro('o painel não convida para escrever o nome');
    else ok('o painel convida para escrever o nome');
    await semRolarDeLado(p, 'painel');
    if (problemas.length) erro(`painel: ${problemas[0]}`);
    await ctx.close();
  }
}

log('');
log(falhas === 0
  ? 'as telas novas funcionam no celular e no computador.'
  : `${falhas} problema(s)`);
await b.close(); srv.close();
if (falhas) process.exit(1);
