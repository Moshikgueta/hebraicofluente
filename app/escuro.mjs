/* O tema escuro, num navegador de verdade.
 * ─────────────────────────────────────────────────────────────────────────
 * Três coisas, e as três só existem quando a página é pintada:
 *
 *  1. A FRONTEIRA. O escuro vale nas telas do aluno e a vitrine continua
 *     clara. É uma decisão de design escrita em styles/tokens.css, e ela é
 *     sustentada por um seletor - `html:has([data-plataforma])` - que nenhum
 *     teste de unidade alcança. Se alguém tirar a marca da casca, ou mexer no
 *     seletor, o site inteiro escurece e nada quebra.
 *
 *  2. O CONTRASTE. Uma paleta escura é fácil de escrever e fácil de errar: o
 *     texto secundário sobre o papel escuro, o texto dentro das caixas
 *     tingidas, o branco sobre o botão primário. Aqui a razão é MEDIDA nos
 *     pixels que o navegador calculou, pela fórmula da WCAG, e não conferida
 *     no olho de quem escolheu as cores.
 *
 *  3. O LAMPEJO. Sem o script de arranque, quem estuda no escuro vê um
 *     clarão branco a cada troca de página. É o defeito que mais incomoda
 *     exatamente quem ligou o recurso, e ele some do teste se o teste
 *     esperar a página montar - por isso a conferência é feita no `commit`,
 *     antes de qualquer JavaScript da aplicação rodar.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
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
await new Promise(r => servidor.listen(4574, r));
const BASE = 'http://localhost:4574';

let falhas = 0;
const ok = m => console.log(`  ✓ ${m}`);
const erro = m => { console.log(`  ✗ ${m}`); falhas++; };
const conferir = (c, m) => (c ? ok(m) : erro(m));

/* ── contraste, pela fórmula da WCAG ─────────────────────────────────── */
const canal = c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luz = rgb => {
  const [r, g, b] = rgb.map(v => canal(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const razao = (a, b) => {
  const [x, y] = [luz(a), luz(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const rgb = css => (css.match(/\d+/g) || []).slice(0, 3).map(Number);
const claro = css => luz(rgb(css)) > 0.4;

const navegador = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });

/* Uma conta com o curso e algum progresso.
   ──────────────────────────────────────────────────────────────────────────
   Sem isto o portão manda toda rota do aluno para /entrar, que é PÚBLICA - e
   a varredura mediria a cor da tela de login achando que mediu a do mapa.
   Foi o que aconteceu na primeira execução: catorze falhas, todas porque o
   navegador nunca chegou a ver a plataforma. */
const hoje = new Date().toISOString().slice(0, 10);
const CONTA = { v: 1, accounts: { 'demo@hf.test': {
  id: 'acc_demo', name: 'Moshik', email: 'demo@hf.test',
  createdAt: new Date().toISOString(), pw: 'x',
  entitlements: [{ courseSlug: 'alfabetizacao', grantedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: 'demo' }],
  orders: [] } }, current: 'demo@hf.test' };
const ESTADO = { version: 2, onboarding: { reason: 'familia', goalMinutes: 10,
  startingPoint: 'zero', name: 'Moshik', completedAt: new Date().toISOString() },
  xp: 340, lessons: { mem: { letterId: 'mem', stagesDone: [1, 2, 3, 4, 5], quizBest: 1,
    quizAttempts: 1, perfectBonusPaid: true, completedAt: new Date().toISOString() } },
  checkpoints: {}, srs: {}, achievements: [], days: {},
  streak: { current: 3, longest: 5, lastDay: hoje }, lastRoute: null,
  finalChallenge: { best: null, completedAt: null },
  skills: {}, confusions: {}, firsts: {}, gym: {} };

/** Um contexto já logado, com o tema e o sistema que o caso pedir. */
async function contexto({ sistema = 'dark', prefs = null } = {}) {
  const ctx = await navegador.newContext({
    viewport: { width: 1280, height: 900 }, colorScheme: sistema
  });
  await ctx.addInitScript(([c, e, pr]) => {
    localStorage.setItem('hf-platform-local-v1', c);
    localStorage.setItem('hebraico-fluente-v1', e);
    if (pr) localStorage.setItem('hf-acessibilidade-v1', pr);
  }, [JSON.stringify(CONTA), JSON.stringify(ESTADO), prefs && JSON.stringify(prefs)]);
  return ctx;
}

/* O aparelho no escuro, que é o caso de quem não toca em ajuste nenhum. */
const noEscuro = () => contexto();

const ROTAS_DO_ALUNO = ['/meu-hebraico/', '/mapa/', '/licao/alef/', '/revisao/',
                        '/academia/', '/conquistas/', '/perfil/', '/inicio/'];
const ROTAS_PUBLICAS = ['/', '/metodo/', '/curso-de-hebraico/', '/faq/', '/entrar/'];

const fundo = p => p.evaluate(() => getComputedStyle(document.body).backgroundColor);

/* ── 0 · o build certo ────────────────────────────────────────────────────
   Este script mede as telas do aluno com a conta e o progresso no
   localStorage, no build LOCAL (`npm run build`). O build publicado
   (`NEXT_PUBLIC_PLATFORM_API=worker`) pede a sessão ao Worker, que este
   servidor estático não tem: a casca do curso não monta, a tela fica no
   esqueleto claro, e o resultado eram 13 "problemas" que não existiam
   (23/10/2026). Sem a casca, para aqui e diz o que fazer. */
{
  const ctx = await noEscuro();
  const p = await ctx.newPage();
  await p.goto(BASE + '/mapa/', { waitUntil: 'networkidle' });
  const temCasca = await p.evaluate(() => !!document.querySelector('[data-plataforma]'));
  await ctx.close();
  if (!temCasca) {
    console.log('\nA casca do curso não montou em /mapa/: este out/ parece ser o build publicado,');
    console.log('que pede a sessão ao Worker. Rode `npm run build` (sem NEXT_PUBLIC_PLATFORM_API)');
    console.log('e depois `npm run escuro` de novo.');
    await navegador.close(); servidor.close();
    process.exit(2);
  }
}

/* ── 1 · a fronteira ──────────────────────────────────────────────────── */
console.log('\n── a fronteira: plataforma escurece, vitrine não ──');
{
  const ctx = await noEscuro();
  const p = await ctx.newPage();

  for (const rota of ROTAS_DO_ALUNO) {
    await p.goto(BASE + rota, { waitUntil: 'networkidle' });
    const f = await fundo(p);
    conferir(!claro(f), `${rota.padEnd(18)} escurece  (${f})`);
  }
  for (const rota of ROTAS_PUBLICAS) {
    await p.goto(BASE + rota, { waitUntil: 'networkidle' });
    const f = await fundo(p);
    conferir(claro(f), `${rota.padEnd(18)} continua clara  (${f})`);
  }
  await ctx.close();
}

/* ── 2 · sem lampejo ──────────────────────────────────────────────────── */
console.log('\n── sem lampejo branco ────────────────────────────');
{
  const ctx = await noEscuro();
  const p = await ctx.newPage();

  /* O JavaScript DA APLICAÇÃO é bloqueado, e só ele.
     ────────────────────────────────────────────────────────────────────
     É a prova de que o tema não depende do React: sem os pacotes do Next
     nada da aplicação roda, e o único código que sobra é o script embutido
     no <head> - o mesmo que roda antes da primeira pintura num carregamento
     normal. Se a tela sai escura assim, ela sai escura já pintada, e o
     lampejo branco não existe.

     Medir isto esperando a página montar não prova nada: aí o React já
     carimbou de novo, e o resultado seria o mesmo com ou sem o script. */
  await p.route('**/_next/static/**/*.js', r => r.abort());
  await p.goto(BASE + '/mapa/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(250);

  const cedo = await p.evaluate(() => document.documentElement.getAttribute('data-a11y-tema'));
  conferir(cedo === 'escuro', 'o <html> é carimbado sem nenhum JavaScript da aplicação');
  const semJs = await fundo(p);
  conferir(!claro(semJs), `e a tela já pinta escura sem o React  (${semJs})`);

  /* E a marca da plataforma vem no HTML ENTREGUE, não do React depois. Lido
     do arquivo servido, e não do DOM: em `commit` o corpo ainda não chegou. */
  const html = readFileSync('out/mapa/index.html', 'utf8');
  conferir(html.includes('data-plataforma'),
    'a marca da plataforma já vem no HTML gerado, antes de o React montar');
  await ctx.close();
}

/* ── 3 · a escolha explícita vence o aparelho ─────────────────────────── */
console.log('\n── os três estados ───────────────────────────────');
{
  for (const [tema, sistema, esperado] of [
    ['claro', 'dark', 'clara'], ['escuro', 'light', 'escura'], ['auto', 'light', 'clara']
  ]) {
    const ctx = await contexto({ sistema, prefs: { tema } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/mapa/', { waitUntil: 'networkidle' });
    const f = await fundo(p);
    conferir(claro(f) === (esperado === 'clara'),
      `tema "${tema}" com o sistema em ${sistema}: tela ${esperado}`);
    await ctx.close();
  }
}

/* ── 4 · contraste medido ─────────────────────────────────────────────── */
console.log('\n── contraste, medido nos pixels ──────────────────');
{
  const ctx = await noEscuro();
  const p = await ctx.newPage();
  await p.goto(BASE + '/mapa/', { waitUntil: 'networkidle' });

  /* Os pares que importam: cada tinta sobre o fundo em que ela é usada de
     verdade. Lidos do CSS resolvido, e não da tabela de tokens - é o valor
     que o navegador calculou que chega ao olho. */
  const pares = await p.evaluate(() => {
    const v = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const sobre = (tinta, fundo) => ({ tinta: v(tinta), fundo: v(fundo) });
    return {
      'texto principal sobre o papel':   sobre('--ink', '--paper'),
      'corpo sobre o papel':             sobre('--ink-body', '--paper'),
      'secundário sobre o papel':        sobre('--ink-muted', '--paper'),
      'texto principal sobre o cartão':  sobre('--ink', '--surface'),
      'secundário sobre o cartão':       sobre('--ink-muted', '--surface'),
      'secundário sobre o trilho':       sobre('--ink-muted', '--surface-2'),
      'teal-ink na caixa de acerto':     sobre('--teal-ink', '--teal-soft'),
      'corpo teal na caixa de acerto':   sobre('--teal-body', '--teal-soft'),
      'gold-ink na caixa de revisão':    sobre('--gold-ink', '--gold-soft'),
      'corpo gold na caixa de revisão':  sobre('--gold-body', '--gold-soft')
    };
  });

  /* O navegador devolve os tokens como texto ("#ECF1EF"), então a conversão
     é feita aqui. */
  const hex = s => {
    const m = s.replace('#', '');
    return m.length === 6 ? [0, 2, 4].map(i => parseInt(m.slice(i, i + 2), 16)) : rgb(s);
  };
  for (const [nome, { tinta, fundo }] of Object.entries(pares)) {
    const r = razao(hex(tinta), hex(fundo));
    conferir(r >= 4.5, `${nome.padEnd(32)} ${r.toFixed(2)}:1`);
  }

  /* O branco sobre o botão primário. No claro o navy é escuro e o branco
     passa folgado; no escuro o navy SOBE, e é exatamente aí que ele poderia
     subir demais e engolir o texto. */
  const navy = await p.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--navy').trim());
  const rBotao = razao([255, 255, 255], hex(navy));
  conferir(rBotao >= 4.5, `branco sobre o botão primário      ${rBotao.toFixed(2)}:1`);

  /* E o navy tem de ser mais CLARO que o papel: é a elevação invertida que
     faz o destaque continuar sendo destaque, em vez de virar um buraco. */
  const papel = await p.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--paper').trim());
  conferir(luz(hex(navy)) > luz(hex(papel)),
    'o botão primário é mais claro que o papel (a elevação inverteu)');

  await ctx.close();
}

/* ── 5 · escuro + alto contraste ──────────────────────────────────────── */
console.log('\n── escuro com alto contraste ─────────────────────');
{
  const ctx = await contexto({ prefs: { tema: 'escuro', contraste: true } });
  const p = await ctx.newPage();
  await p.goto(BASE + '/mapa/', { waitUntil: 'networkidle' });

  const f = await fundo(p);
  /* Sem o bloco da interseção, o alto contraste devolvia o tema CLARO de alto
     contraste a quem tinha pedido escuro - vem depois na folha e vencia. */
  conferir(!claro(f), `continua escuro com alto contraste ligado  (${f})`);

  const cor = await p.evaluate(() => getComputedStyle(document.body).color);
  conferir(razao(rgb(cor), rgb(f)) >= 7,
    `e o contraste sobe para o nível AAA  (${razao(rgb(cor), rgb(f)).toFixed(2)}:1)`);
  await ctx.close();
}

/* ── 6 · todo texto visível da lição, medido ──────────────────────────── */
/* A seção 4 mede dez pares de tokens. Foi assim que o tema escuro passou na
   auditoria de 28/09 com a tinta de destaque (`--accent`) a 1,7:1 sobre o
   papel escuro: o par "accent sobre o papel" não estava na lista, e os 149
   lugares que usam essa tinta nunca foram medidos (auditoria de 01/10/2026,
   VIS-001). Aqui não há lista: todo elemento com texto próprio visível na
   lição é lido do DOM, com a cor que o navegador calculou sobre o fundo que
   de fato está atrás dele (somando os fundos semitransparentes pela árvore
   acima). Fica de fora o que a WCAG também deixa: o decorativo (`aria-hidden`),
   o que está desligado (`opacity` < 1 em qualquer ancestral, `inert`) e o
   que não ocupa um pixel. O limite é 4,5:1 para todo texto, sem a folga de
   3:1 do texto grande: a lição é lida no celular, à noite. */
console.log('\n── contraste de todo texto visível na lição ──────');
{
  const ROTA = '/licao/alef/';
  const ctx = await noEscuro();
  const p = await ctx.newPage();
  await p.goto(BASE + ROTA, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);

  const medidos = await p.evaluate(() => {
    const cor = css => {
      const m = css.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const v = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 };
    };
    /* `cima` sobre `baixo`, as duas com alfa. */
    const sobre = (cima, baixo) => {
      const a = cima.a + baixo.a * (1 - cima.a);
      const mistura = k => a ? (cima[k] * cima.a + baixo[k] * baixo.a * (1 - cima.a)) / a : 0;
      return { r: mistura('r'), g: mistura('g'), b: mistura('b'), a };
    };
    /* O fundo que está atrás do elemento: a soma dos fundos da árvore acima
       dele, do mais perto ao mais longe, até ficar opaco. Um fundo com imagem
       ou gradiente não tem UMA cor, e o elemento sai da conta. */
    const fundoDe = el => {
      let acumulado = null;
      for (let e = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.backgroundImage !== 'none') return null;
        const bg = cor(cs.backgroundColor);
        if (bg && bg.a > 0) {
          acumulado = acumulado ? sobre(acumulado, bg) : bg;
          if (acumulado.a >= 0.999) return acumulado;
        }
      }
      return acumulado;
    };
    const ignorado = el => {
      for (let e = el; e; e = e.parentElement) {
        if (e.getAttribute('aria-hidden') === 'true' || e.hasAttribute('inert')) return true;
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden') return true;
        if (parseFloat(cs.opacity) < 1) return true;
      }
      return false;
    };
    const saida = [];
    for (const el of document.body.querySelectorAll('*')) {
      const texto = [...el.childNodes]
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent.replace(/\s+/g, ' ').trim())
        .filter(Boolean).join(' ');
      if (!texto) continue;
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (ignorado(el)) continue;
      const cs = getComputedStyle(el);
      const tinta = cor(cs.color);
      const fundo = fundoDe(el);
      if (!tinta || !fundo) continue;
      const t = tinta.a < 1 ? sobre(tinta, fundo) : tinta;
      saida.push({
        texto: texto.slice(0, 40), tag: el.tagName.toLowerCase(),
        classe: (el.getAttribute('class') || '').split(/\s+/)
          .filter(c => /accent|navy|teal|ink|gold/.test(c)).join(' '),
        tinta: [t.r, t.g, t.b].map(Math.round), fundo: [fundo.r, fundo.g, fundo.b].map(Math.round),
        px: parseFloat(cs.fontSize), peso: cs.fontWeight
      });
    }
    return saida;
  });

  const hexDe = v => '#' + v.map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase();
  const abaixo = medidos
    .map(m => ({ ...m, r: razao(m.tinta, m.fundo) }))
    .filter(m => m.r < 4.5)
    .sort((a, b) => a.r - b.r);
  for (const m of abaixo.slice(0, 40)) {
    erro(`${m.r.toFixed(2)}:1  <${m.tag}> "${m.texto}"  ${hexDe(m.tinta)} sobre ${hexDe(m.fundo)}` +
         `  ${m.px}px/${m.peso}${m.classe ? `  [${m.classe}]` : ''}`);
  }
  if (abaixo.length > 40) erro(`... e mais ${abaixo.length - 40}`);
  conferir(medidos.length > 30, `${medidos.length} elementos com texto visível medidos em ${ROTA}`);
  if (abaixo.length) console.log(`  ${abaixo.length} de ${medidos.length} abaixo de 4,5:1`);
  else ok(`todos passam de 4,5:1 (o menor: ${
    Math.min(...medidos.map(m => razao(m.tinta, m.fundo))).toFixed(2)}:1)`);

  await ctx.close();
}

console.log('\n──────────────────────────────────────────────────');
if (falhas) {
  console.log(`\n${falhas} problema(s) no tema escuro.\n`);
  await navegador.close(); servidor.close();
  process.exit(1);
}
console.log('o tema escuro funciona num navegador de verdade.\n');
await navegador.close(); servidor.close();
