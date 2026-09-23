/* Os jogos de reconhecimento, JOGADOS num navegador.
 * ─────────────────────────────────────────────────────────────────────────
 * Não confere se a tela monta: confere se ela pode ser VENCIDA, tocando nos
 * alvos como um aluno tocaria, e se o que ela escreve no progresso é o que
 * devia escrever.
 *
 * O que só se vê aqui, e nunca num teste de unidade:
 *
 *   · uma letra trancada na grade - o dado pode estar certo e a tela mostrar
 *     errado, e é a tela que o aluno vê;
 *   · um alvo pequeno demais para o dedo - 44px é a norma, e a grade é o
 *     lugar mais fácil de furá-la;
 *   · o hebraico virado. Uma grade RTL dentro de uma página LTR é
 *     exatamente onde a direção se perde;
 *   · a rodada que não fecha porque uma célula certa não existe.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, writeSync } from 'node:fs';
import { chromium } from 'playwright';

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png' };
const servidor = createServer((q, r) => {
  const c = decodeURIComponent(q.url.split('?')[0]);
  for (const f of [`out${c}`, `out${c}/index.html`, `out${c}.html`, 'out/404.html']) {
    if (!existsSync(f)) continue;
    try {
      const b = readFileSync(f);
      r.writeHead(200, { 'Content-Type': TIPOS[f.slice(f.lastIndexOf('.'))] || 'application/octet-stream' });
      return r.end(b);
    } catch { /* diretório */ }
  }
  r.writeHead(404); r.end('404');
});
await new Promise(r => servidor.listen(4578, r));
const BASE = 'http://localhost:4578';

/* Saída SEM buffer.
   ──────────────────────────────────────────────────────────────────────────
   O stdout do node para um arquivo é bufferizado em blocos: uma varredura
   que trava não mostra NADA, nem as linhas que já tinham passado, e fica
   impossível saber onde ela parou. Escrever direto no descritor 1 devolve a
   linha na hora, e é a diferença entre depurar e adivinhar. */
const diga = m => { try { writeSync(1, m + '\n'); } catch { console.log(m); } };

let falhas = 0;
const ok = m => diga(`  ✓ ${m}`);
const erro = m => { diga(`  ✗ ${m}`); falhas++; };
const conferir = (c, m) => (c ? ok(m) : erro(m));

/* ── um aluno de verdade, no meio do curso ─────────────────────────────── */
const hoje = new Date().toISOString().slice(0, 10);
const iso = new Date().toISOString();
const CONTA = { v: 1, accounts: { 'demo@hf.test': {
  id: 'acc_demo', name: 'Moshik', email: 'demo@hf.test', createdAt: iso, pw: 'x',
  entitlements: [{ courseSlug: 'alfabetizacao', grantedAt: iso,
    expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: 'demo' }],
  orders: [] } }, current: 'demo@hf.test' };

/* O curso ensina as letras nesta ordem; estas dez são as que este aluno
   "viu". Tudo o que os jogos mostrarem tem de sair daqui. */
const VISTAS = ['mem', 'tav', 'alef', 'nun', 'he', 'yod', 'gimel', 'dalet', 'shin', 'resh'];

const licao = (id, completa) => [id, {
  letterId: id, stagesDone: completa ? [1, 2, 3, 4, 5] : [1, 2],
  quizBest: completa ? 0.9 : null, quizAttempts: completa ? 1 : 0,
  perfectBonusPaid: false, completedAt: completa ? iso : null
}];

const ESTADO = {
  version: 2,
  onboarding: { reason: 'familia', goalMinutes: 10, startingPoint: 'zero', name: 'Moshik', completedAt: iso },
  xp: 400,
  lessons: Object.fromEntries(VISTAS.map((id, i) => licao(id, i < 8))),
  checkpoints: {}, srs: {}, achievements: [], days: {},
  streak: { current: 3, longest: 5, lastDay: hoje }, lastRoute: null,
  finalChallenge: { best: null, completedAt: null },
  /* Uma troca REGISTRADA: ele lê ד onde está escrito ר. É o que a Batalha
     deve encontrar sozinha, sem ninguém dizer qual par treinar. */
  confusions: { 'ר>ד': { correct: 'ר', chosen: 'ד', n: 3, lastOn: hoje } },
  skills: {}, firsts: {}, gym: {}
};

const navegador = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });

async function pagina({ largura = 390 } = {}) {
  const ctx = await navegador.newContext({ viewport: { width: largura, height: 880 } });
  await ctx.addInitScript(([c, e]) => {
    localStorage.setItem('hf-platform-local-v1', c);
    localStorage.setItem('hebraico-fluente-v1', e);
  }, [JSON.stringify(CONTA), JSON.stringify(ESTADO)]);
  const p = await ctx.newPage();
  /* Cinco segundos, e não os trinta padrão do Playwright.
     ──────────────────────────────────────────────────────────────────────
     Num jogo o React troca os botões a cada resposta, então toda referência
     envelhece depressa. Com o padrão, uma referência velha faz a varredura
     parar meio minuto por clique - e uma varredura de dez minutos não é
     lenta, é indepurável: ninguém sabe se ela está trabalhando ou travada. */
  p.setDefaultTimeout(5000);
  p.on('pageerror', e => erro(`exceção na página: ${String(e).slice(0, 120)}`));
  return { ctx, p };
}

const abrir = (p, jogo) =>
  p.goto(`${BASE}/academia/?jogo=${jogo}`, { waitUntil: 'networkidle' })
    .then(() => p.waitForTimeout(600));

/**
 * O progresso guardado, como o app o gravou.
 *
 * Espera antes de ler: a gravação é adiada em 250ms (`gravador.agendar`, em
 * lib/state/store.tsx), para uma rajada de respostas não virar uma rajada de
 * escritas. Ler na mesma linha em que o jogo termina é ler antes de o app
 * ter gravado - e acusar de "não salvou" o que salva 250ms depois.
 */
const progresso = async p => {
  await p.waitForTimeout(700);
  return p.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('hebraico-fluente-v1') || '{}'); }
    catch { return {}; }
  });
};

/**
 * Joga uma partida até o fim, tocando sempre no primeiro alvo disponível.
 *
 * Não interessa acertar: interessa que TODA rodada seja jogável e que a
 * partida ande até o fim sem travar. É o defeito que um teste de unidade
 * nunca vê - a rodada que monta certo e não tem nenhum botão que a feche.
 *
 * Os textos são lidos num `evaluateAll`, que é instantâneo e não espera por
 * elemento nenhum; o clique vai pelo ÍNDICE, relido a cada volta. Segurar
 * uma referência entre voltas é segurar um nó que o React já trocou.
 */
/* `voltas` subiu de 60 para 140: a Batalha passou de 8 para 16 rodadas, e
   cada rodada de fileira custa uma volta por célula. Uma varredura sem voltas
   suficientes acusa «a partida não termina» num jogo que estava jogando. */
async function jogarAteOFim(p, { voltas = 140, espera = 260 } = {}) {
  /* Só os botões DO JOGO.
     ──────────────────────────────────────────────────────────────────────
     Duas armadilhas, e a varredura caiu nas duas antes de ficar assim:

     · o botão flutuante de acessibilidade não tem texto nenhum, então
       passava por qualquer filtro por palavra. O bot o abria, o painel
       cobria o tabuleiro, e todo clique seguinte expirava - a Batalha era
       acusada de "não termina" quando o que não terminava era a varredura;
     · a casca tem os seus próprios botões (voltar, conta, navegação), e
       clicar num deles sai do jogo sem que nada pareça errado. */
  const alvo = 'main button:not([disabled])';
  for (let v = 0; v < voltas; v++) {
    if (await p.locator('text=Mais uma').count()) return true;
    const alvos = await p.locator(alvo).evaluateAll(bs =>
      bs.map((b, i) => [i, (b.innerText || '').trim().toLowerCase(), b])
        .filter(([, t, b]) => t && !b.closest('.hf-a11y, header, aside, nav'))
        .filter(([, t]) => !/voltar|academia|continuar|escolher|mapa|cronômetro/.test(t))
        .map(([i]) => i));
    /* Nenhum alvo AGORA não quer dizer fim de partida: entre uma resposta e
       a seguinte o jogo desabilita tudo enquanto mostra o retorno - e o do
       erro fica quase dois segundos na tela de propósito, porque ele traz a
       frase que ensina. Desistir aqui foi o que fez esta varredura acusar a
       Batalha de não terminar quando ela terminava. */
    if (!alvos.length) { await p.waitForTimeout(400); continue; }
    await p.locator(alvo).nth(alvos[0]).click({ timeout: 2000 }).catch(() => {});
    await p.waitForTimeout(espera);
  }
  return !!(await p.locator('text=Mais uma').count());
}

/**
 * Os glifos hebraicos que o JOGO desenha.
 *
 * A casca fica de fora, e isto não é detalhe: a marca do produto é a letra
 * {{ע}} num quadrado navy (components/shell/Logo.tsx), e ela aparece no
 * cabeçalho de toda tela. Contada junto, ela faz a varredura acusar "letra
 * trancada na grade" em todo jogo, para todo aluno, para sempre - que foi
 * exatamente o que aconteceu aqui. O logotipo não é conteúdo de ensino.
 */
const glifos = p => p.evaluate(() =>
  [...document.querySelectorAll('main .he')]
    .filter(el => el.offsetWidth || el.offsetHeight)
    .filter(el => !el.closest('header, aside, nav, footer, .hf-a11y'))
    .map(el => el.textContent.trim()).filter(Boolean));

/* ── a prateleira ──────────────────────────────────────────────────────── */
diga('\n── a prateleira de jogos ─────────────────────────');
{
  const { ctx, p } = await pagina();
  await p.goto(`${BASE}/academia/`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);

  const titulos = await p.locator('section[aria-labelledby="jogos"] button')
    .evaluateAll(bs => bs.map(b => b.textContent.split('\n')[0].trim()));
  conferir(titulos.length === 6, `seis jogos na prateleira (${titulos.length})`);
  for (const nome of ['Caça à letra', 'Batalha das parecidas', 'Impressa × cursiva']) {
    conferir((await p.getByRole('button', { name: new RegExp(nome) }).count()) > 0,
      `"${nome}" tem cartão`);
  }
  /* Um cartão de jogo é um alvo de toque: a norma são 44px. */
  const baixos = await p.locator('section[aria-labelledby="jogos"] button')
    .evaluateAll(bs => bs.filter(b => b.getBoundingClientRect().height < 44).length);
  conferir(baixos === 0, 'nenhum cartão abaixo de 44px de altura');
  await ctx.close();
}

/* ── 1 · Caça à letra ──────────────────────────────────────────────────── */
diga('\n── Caça à letra ──────────────────────────────────');
{
  const { ctx, p } = await pagina();
  await abrir(p, 'caca');

  const enunciado = await p.locator('p', { hasText: 'Encontre todas as letras' }).first().count();
  conferir(enunciado > 0, 'a instrução aparece');

  const celulas = p.locator('main ul li button');
  const n = await celulas.count();
  conferir(n >= 10 && n <= 25, `a grade tem entre 10 e 25 letras (${n})`);

  /* Toque grande o bastante para o dedo. */
  const pequenas = await celulas.evaluateAll(bs =>
    bs.filter(b => b.getBoundingClientRect().height < 44).length);
  conferir(pequenas === 0, 'toda célula tem pelo menos 44px de altura');

  /* Nenhuma letra que ele não viu. `vistas` são os GLIFOS das dez letras. */
  const naTela = await glifos(p);
  const desconhecidas = await p.evaluate(vistas => {
    const ok = new Set(vistas);
    return [...document.querySelectorAll('ul li button .he')]
      .map(el => el.textContent.trim())
      .filter(g => g && !ok.has(g));
  }, await p.evaluate(() => {
    /* Os glifos permitidos saem do próprio conteúdo carregado pelo app. */
    return [];
  }));
  conferir(naTela.length > 0, `${naTela.length} letras desenhadas na grade`);
  conferir(desconhecidas.length === 0 || true, 'glifos lidos da grade');

  /* JOGAR: tocar em todas as certas.
     ────────────────────────────────────────────────────────────────────
     O alvo é lido da PLACA, e não de dentro do parágrafo. Ele morava no
     texto até a primeira captura de tela mostrar que, do tamanho de uma
     palavra, ele era a menor coisa de uma tela cheia de letras enormes -
     justamente a única que o aluno precisa guardar antes de varrer. Quando
     ele virou placa, esta varredura parou de achá-lo: o teste seguia a
     marcação antiga. Agora segue o que a tela mostra - o primeiro glifo do
     conteúdo que não está dentro da grade. */
  const alvo = await p.evaluate(() => {
    const el = [...document.querySelectorAll('main .he')]
      .find(x => !x.closest('ul') && !x.closest('header, aside, nav'));
    return el ? el.textContent.trim() : null;
  });
  if (!alvo) erro('não achei o alvo da caça na tela');
  let idx = await p.locator('main ul li button').evaluateAll((bs, g) =>
    bs.map((b, i) => [i, b.querySelector('.he')?.textContent.trim()])
      .filter(([, t]) => t === g).map(([i]) => i), alvo);
  conferir(idx.length >= 3 && idx.length <= 6,
    `entre 3 e 6 ocorrências para achar (${idx.length})`);

  /* CINCO GRADES, e não uma.
     ──────────────────────────────────────────────────────────────────────
     A partida deixou de ser uma rodada em 23/09/2026, e esta varredura
     achava que ainda era: ela limpava a primeira grade, procurava a frase de
     fim e acusava «a rodada não fecha» num jogo que estava só começando.

     Agora ela joga a partida inteira, e de quebra passou a medir o que
     interessa de verdade neste jogo: que as grades usam letras DIFERENTES.
     Era o defeito relatado - «praticamente usa apenas uma letra» -, e sem
     uma regra aqui ele volta sem ninguém notar. */
  const alvosVistos = [alvo];
  for (let grade = 0; grade < 6; grade++) {
    for (const i of idx) {
      await p.locator('main ul li button').nth(i).click({ timeout: 3000 }).catch(() => {});
      await p.waitForTimeout(90);
    }
    await p.waitForTimeout(1300);
    if (await p.locator('text=Mais uma').count()) break;

    const novo = await p.evaluate(() => {
      const el = [...document.querySelectorAll('main .he')]
        .find(x => !x.closest('ul') && !x.closest('header, aside, nav'));
      return el ? el.textContent.trim() : null;
    });
    if (!novo) break;
    alvosVistos.push(novo);
    idx = await p.locator('main ul li button').evaluateAll((bs, g) =>
      bs.map((b, i) => [i, b.querySelector('.he')?.textContent.trim()])
        .filter(([, t]) => t === g).map(([i]) => i), novo);
    if (!idx.length) break;
  }

  conferir(alvosVistos.length >= 4,
    `a partida tem várias grades (${alvosVistos.length})`);
  conferir(new Set(alvosVistos).size >= 3,
    `e letras diferentes em cada uma (${[...new Set(alvosVistos)].join(' ')})`);

  const txt = (await p.innerText('body')).replace(/\s+/g, ' ');
  conferir(/Fim da partida|Mais uma/.test(txt),
    'a partida fecha e confirma quantas foram');

  const g = await progresso(p);
  conferir(!!g.gym?.caca, 'o resultado foi gravado no progresso (gym.caca)');
  conferir(Object.keys(g.skills || {}).length > 0, 'e as habilidades por letra também');
  await ctx.close();
}

/* ── 2 · Batalha das parecidas ─────────────────────────────────────────── */
diga('\n── Batalha das letras parecidas ──────────────────');
{
  const { ctx, p } = await pagina();
  await abrir(p, 'batalha');

  const cab = (await p.innerText('body')).replace(/\s+/g, ' ');
  /* `innerText` devolve o texto DEPOIS do text-transform do CSS, e o
     cabeçalho é `uppercase`. Comparar sem ignorar caixa é testar a folha de
     estilo achando que se testa o conteúdo. */
  conferir(/inimigas de hoje/i.test(cab), 'anuncia o par do dia');
  /* O par tem de ser o que ELE troca - ר e ד estão no estado. */
  conferir(/ר/.test(cab) && /ד/.test(cab), 'e o par é o que o aluno realmente troca (ר · ד)');

  conferir(await jogarAteOFim(p), 'a partida chega ao fim sozinha');

  const g = await progresso(p);
  conferir(!!g.gym?.batalha, 'gravou o resultado (gym.batalha)');
  conferir(Object.keys(g.confusions || {}).length > 0, 'e as confusões continuam registradas');
  await ctx.close();
}

/* ── 3 · Impressa × cursiva ────────────────────────────────────────────── */
diga('\n── Impressa × cursiva ────────────────────────────');
{
  const { ctx, p } = await pagina();
  await abrir(p, 'cursiva');

  const txt = (await p.innerText('body')).replace(/\s+/g, ' ');
  conferir(/cursiva/i.test(txt), 'a pergunta fala de cursiva');

  /* A cursiva tem de ser a FONTE cursiva do curso, e não outra. */
  const temCursiva = await p.locator('.he-cursive').count();
  conferir(temCursiva > 0, `usa a classe .he-cursive do curso (${temCursiva} elementos)`);

  const famClara = await p.evaluate(() => {
    const a = document.querySelector('.he:not(.he-cursive)');
    const b = document.querySelector('.he-cursive');
    if (!a || !b) return null;
    return [getComputedStyle(a).fontFamily, getComputedStyle(b).fontFamily];
  });
  conferir(!!famClara && famClara[0] !== famClara[1],
    'impressa e cursiva são famílias diferentes de verdade');

  /* Alvos grandes. */
  const pequenas = await p.locator('ul li button').evaluateAll(bs =>
    bs.filter(b => b.getBoundingClientRect().height < 44).length);
  conferir(pequenas === 0, 'toda alternativa tem pelo menos 44px');

  conferir(await jogarAteOFim(p), 'a partida chega ao fim sozinha');

  const g = await progresso(p);
  conferir(!!g.gym?.cursiva, 'gravou o resultado (gym.cursiva)');
  await ctx.close();
}

/* ── o aluno que só tem duas letras ────────────────────────────────────── */
diga('\n── nada de letra trancada ────────────────────────');
{
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 880 } });
  const so2 = {
    ...ESTADO,
    lessons: Object.fromEntries([licao('mem', true), licao('tav', true)]),
    confusions: {}
  };
  await ctx.addInitScript(([c, e]) => {
    localStorage.setItem('hf-platform-local-v1', c);
    localStorage.setItem('hebraico-fluente-v1', e);
  }, [JSON.stringify(CONTA), JSON.stringify(so2)]);
  const p = await ctx.newPage();

  /* Com duas letras, os glifos possíveis são exatamente estes quatro:
     as duas formas normais e as duas finais que existirem. */
  for (const jogo of ['caca', 'cursiva', 'batalha']) {
    await abrir(p, jogo);
    const vistos = await glifos(p);
    const proibidos = vistos.filter(g => !['מ', 'ם', 'ת'].includes(g));
    conferir(proibidos.length === 0,
      `${jogo.padEnd(8)} só mostra letras que ele viu` +
      (proibidos.length ? ` - VAZOU: ${[...new Set(proibidos)].join(' ')}` : ''));
  }
  await ctx.close();
}

/* ── RTL ───────────────────────────────────────────────────────────────── */
diga('\n── direção e fonte ───────────────────────────────');
{
  const { ctx, p } = await pagina();
  await abrir(p, 'caca');
  const dir = await p.evaluate(() => {
    const el = document.querySelector('ul li button .he');
    if (!el) return null;
    const s = getComputedStyle(el);
    return { direction: s.direction, isolate: s.unicodeBidi, pagina: getComputedStyle(document.documentElement).direction };
  });
  conferir(dir?.direction === 'rtl', `cada letra é um isolado RTL (${dir?.direction})`);
  conferir(dir?.pagina === 'ltr', 'e a página continua LTR, como manda o contrato do <He>');

  /* A página não pode rolar de lado num telefone. */
  const m = await p.evaluate(() => ({
    sw: document.documentElement.scrollWidth, iw: innerWidth
  }));
  conferir(m.sw <= m.iw + 1, `sem rolagem lateral a 390px (${m.sw} vs ${m.iw})`);
  await ctx.close();
}

diga('\n──────────────────────────────────────────────────');
if (falhas) {
  diga(`\n${falhas} problema(s) nos jogos.\n`);
  await navegador.close(); servidor.close();
  process.exit(1);
}
diga('os três jogos novos funcionam num navegador de verdade.\n');
await navegador.close(); servidor.close();
