/* Raízes Sefarditas num navegador de verdade, a 390 px.
   ────────────────────────────────────────────────────────────────────────
   Contra o export local (npm run build), com uma conta de demonstração que
   tem o direito raizes-sefarditas. Percorre o módulo 1 como um aluno (e
   depois os outros módulos com conteúdo, só acertando):
     · a casa abre, com a jornada e o "Começar pelo módulo 1";
     · cada etapa abre sem rolagem lateral e sem erro de console;
     · cada atividade é feita: primeiro errando (a explicação aparece e nada
       tranca), depois acertando;
     · uma fonte abre e mostra o status e a referência;
     · depois de recarregar, o progresso continua lá e o módulo está concluído;
     · uma conta SEM o direito não vê o conteúdo.
   Fotos em .shots/raizes-*.png. Uso: HF_CHROMIUM=... node raizes.mjs */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.txt': 'text/plain' };
const s = createServer((q, r) => {
  const c = decodeURIComponent(q.url.split('?')[0]);
  for (const f of [`out${c}`, `out${c}/index.html`, `out${c}.html`, 'out/404.html']) {
    if (!existsSync(f)) continue;
    try { const b = readFileSync(f); r.writeHead(200, { 'Content-Type': T[f.slice(f.lastIndexOf('.'))] || 'application/octet-stream' }); return r.end(b); } catch { /* diretório */ }
  }
  r.writeHead(404); r.end('404');
});
await new Promise(r => s.listen(4411, r));
mkdirSync('.shots', { recursive: true });

const BASE = 'http://127.0.0.1:4411';
const DADOS = JSON.parse(readFileSync('content/raizes.json', 'utf8'));
const M1 = DADOS.conteudo[0];
const EM_PREPARACAO = DADOS.modulos.length - DADOS.conteudo.length;
const conta = cursos => ({
  v: 1, current: 'r@h.test',
  accounts: { 'r@h.test': { id: 'r', name: 'R', email: 'r@h.test', createdAt: new Date().toISOString(), pw: 'x', orders: [],
    entitlements: cursos.map(c => ({ courseSlug: c, grantedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: c })) } }
});

const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM, args: ['--no-sandbox'] });
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); console.log(`  ${cond ? '✓' : '✗'} ${msg}`); };

async function contexto(cursos) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(a => {
    if (!sessionStorage.getItem('semeado')) {
      localStorage.setItem('hf-platform-local-v1', a);
      sessionStorage.setItem('semeado', '1');
    }
  }, JSON.stringify(conta(cursos)));
  const p = await ctx.newPage();
  const erros = [];
  p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  p.on('pageerror', e => erros.push(e.message));
  return { ctx, p, erros };
}
const semRolagemLateral = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
/* O módulo é uma leitura contínua: abre no endereço da seção e devolve a seção. */
const etapa = async (p, id, n = 1) => {
  await p.goto(`${BASE}/raizes/modulo/${n}/?etapa=${id}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(300);
  const S = p.locator(`#secao-${id}`);
  if (await S.count()) await S.scrollIntoViewIfNeeded();
  return S;
};
const re = t => new RegExp(t.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const textoDe = t => t.replace(/\[\[[^\]]*\]\]/g, '').trim();

/* ── com o direito ─────────────────────────────────────────────────────── */
console.log('\n  conta com Raízes');
const { ctx, p, erros } = await contexto(['raizes-sefarditas']);
await p.goto(`${BASE}/raizes/`, { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
ok(await p.locator('h1', { hasText: 'Raízes Sefarditas' }).count() === 1, 'a casa abre com o título');
ok(await p.locator('text=Começar pelo módulo 1').count() === 1, 'oferece começar pelo módulo 1');
ok(await p.getByText('em preparação', { exact: true }).count() === EM_PREPARACAO, `os ${EM_PREPARACAO} módulos em preparação aparecem como tais`);
if (DADOS.conteudo.length > 1) {
  await etapa(p, 'descobrir', 2);
  ok(await p.locator('text=Este módulo abre quando o módulo 1 estiver concluído.').count() === 1, 'o módulo 2 espera o 1');
  await p.goto(`${BASE}/raizes/`, { waitUntil: 'networkidle' });
}
ok(await semRolagemLateral(p), 'casa sem rolagem lateral');
ok(await p.getByText('Meu curso', { exact: true }).count() === 0 && await p.locator('text=/\\d+ XP/').count() === 0,
  'casca própria: nada do menu nem do XP do curso de hebraico');
ok(await p.locator('header', { hasText: 'Raízes Sefarditas' }).count() > 0, 'o cabeçalho é o do Raízes');
await p.screenshot({ path: '.shots/raizes-casa.png', fullPage: true });

let S;
/* Descobrir: errar, ver a explicação, tentar de novo, acertar. */
S = await etapa(p, 'descobrir');
const desc = M1.atividades.descobrir;
const errada = desc.opcoes.find(o => !o.correta), certa = desc.opcoes.find(o => o.correta);
await S.getByRole('button', { name: errada.texto }).click();
ok(await p.locator('text=Ainda não.').count() > 0, 'errar mostra "Ainda não." com a explicação');
await S.getByRole('button', { name: 'Tentar de novo' }).click();
await S.getByRole('button', { name: certa.texto }).click();
ok(await p.locator('text=Certo.').count() > 0, 'acertar mostra "Certo."');
await p.screenshot({ path: '.shots/raizes-descobrir.png', fullPage: true });

/* Contextualizar: abrir uma fonte. */
S = await etapa(p, 'contextualizar');
await S.getByRole('button', { name: /Fonte 1: abrir/ }).first().click();
ok(await p.locator('text=O que a fonte diz:').count() > 0, 'a fonte abre com a evidência');
ok(await p.locator('text=/Verificada por busca|Em debate/').count() > 0, 'a fonte mostra o status');
ok(await semRolagemLateral(p), 'contextualizar sem rolagem lateral');
await p.screenshot({ path: '.shots/raizes-contextualizar.png', fullPage: true });

/* Explorar: cinco lugares, três perguntas. */
S = await etapa(p, 'explorar');
const mapa = M1.atividades.mapa;
/* Quatro pelo teclado (o caminho do leitor de tela)... */
for (const l of mapa.lugares.filter(x => x.id !== 'sevilha').slice(0, mapa.minimoExplorados - 1)) {
  const b = S.locator(`button[aria-label^="${l.nome}"]`).first();
  await b.focus();
  await p.keyboard.press('Enter');
}
/* ...e um pelo toque, perto (não em cima) de Sevilha, que tem o Guadalete a 20 px. */
const sevilha = await S.locator('button[aria-label^="Sevilha"]').boundingBox();
await p.mouse.click(sevilha.x + sevilha.width / 2 + 4, sevilha.y + sevilha.height / 2 - 6);
ok(await p.locator('article.rz-ficha h4', { hasText: 'Sevilha' }).count() === 1, 'o toque perto de Sevilha abre Sevilha, não o Guadalete');
/* A etiqueta com o nome é o segundo filho do botão: ela não pode herdar o
   desenho do ponto (era uma bolinha escura por baixo do nome, 22/10/2026). */
const etiqueta = await p.locator('button[aria-label^="Sevilha"] > span').nth(1).evaluate(e => {
  const c = getComputedStyle(e); return { raio: c.borderTopLeftRadius, largura: e.getBoundingClientRect().width };
});
ok(etiqueta.raio !== '50%' && etiqueta.largura > 30, `a etiqueta do ponto não vira bolinha (${etiqueta.raio}, ${Math.round(etiqueta.largura)} px)`);
ok(await p.locator(`text=Explorados: ${mapa.minimoExplorados} de`).count() > 0, 'o mapa conta os lugares explorados');
await p.screenshot({ path: '.shots/raizes-mapa.png', fullPage: false });
const selects = S.locator('select');
for (const [i, q] of mapa.perguntas.entries()) await selects.nth(i).selectOption(q.resposta);
await S.getByRole('button', { name: 'Conferir', exact: true }).click();
ok(await p.locator('text=/As três certas/').count() > 0, 'as três perguntas do mapa certas');
ok(await semRolagemLateral(p), 'mapa sem rolagem lateral');

/* Investigar: documentos (um errado primeiro) e "o que prova". */
S = await etapa(p, 'investigar');
const docs = M1.atividades.documentos;
const sel = S.locator('select');
for (const [i, d] of docs.documentos.entries()) {
  const titulo = await S.locator('h4').nth(i).innerText();
  const doc = docs.documentos.find(x => x.titulo === titulo);
  const ctxErrado = docs.contextos.find(c => c.id !== doc.contexto).id;
  await sel.nth(i).selectOption(i === 0 ? ctxErrado : doc.contexto);
}
await S.getByRole('button', { name: 'Conferir', exact: true }).first().click();
ok(await p.locator('text=/4 de 5 certos/').count() > 0, 'documentos: um errado é apontado');
await S.getByRole('button', { name: 'Corrigir' }).click();
const titulo0 = await S.locator('h4').nth(0).innerText();
await sel.nth(0).selectOption(docs.documentos.find(x => x.titulo === titulo0).contexto);
await S.getByRole('button', { name: 'Conferir', exact: true }).first().click();
ok(await p.locator('text=O que ele não prova:').count() === 5, 'documentos certos mostram o que cada um não prova');
const prova = M1.atividades.prova;
for (const o of prova.opcoes.filter(x => x.correta)) await S.getByRole('checkbox', { name: o.texto }).click();
await S.getByRole('button', { name: 'Conferir', exact: true }).last().click();
ok(await p.locator('text=Todas certas.').count() > 0, '"o que prova": seleção certa');
await p.screenshot({ path: '.shots/raizes-investigar.png', fullPage: true });

/* Aplicar: ordenar pelas setas, depois os dois desafios. */
S = await etapa(p, 'aplicar');
const lt = M1.atividades['linha-do-tempo'];
for (let alvo = 0; alvo < lt.eventos.length; alvo++) {
    const atuais = await S.locator('button[aria-label^="Subir: "]').evaluateAll(bs => bs.map(x => x.getAttribute('aria-label').slice(7)));
  const i = atuais.indexOf(lt.eventos[alvo].texto);
  for (let k = i; k > alvo; k--) await S.getByRole('button', { name: `Subir: ${lt.eventos[alvo].texto}` }).click();
}
await S.getByRole('button', { name: 'Conferir a ordem' }).click();
ok(await p.locator(`text=${lt.explicacao.slice(0, 40)}`).count() > 0, 'linha do tempo em ordem, com a explicação');
const df = M1.atividades['desafio-fatos'];
for (const o of df.opcoes.filter(x => x.correta)) await S.getByRole('checkbox', { name: o.texto }).click();
await S.getByRole('button', { name: 'Conferir', exact: true }).click();
ok(await p.locator('text=Todas certas.').count() > 0, 'desafio: os fatos certos');
const dfr = M1.atividades['desafio-frase'];
await S.getByRole('button', { name: dfr.opcoes.find(o => o.correta).texto }).click();
ok(await p.locator('text=Certo.').count() > 0, 'desafio: a versão fiel');
ok(await semRolagemLateral(p), 'aplicar sem rolagem lateral');
await p.screenshot({ path: '.shots/raizes-aplicar.png', fullPage: true });

/* Refletir: escrever, e o texto fica no aparelho. */
S = await etapa(p, 'refletir');
await S.locator('textarea').fill('Acomodação, com conflito.');
ok(await p.locator('text=Guardado neste aparelho.').count() > 0, 'a reflexão fica no aparelho');

/* Consolidar: classificar, primeiro abaixo do mínimo. */
S = await etapa(p, 'consolidar');
const cl = M1.atividades['mito-ou-evidencia'];
const nomeCat = id => cl.categorias.find(c => c.id === id).nome;
const ordemNaTela = await S.locator('ol li > p[id^="cl-"]').evaluateAll(ps => ps.map(x => x.id.slice(3)));
for (const id of ordemNaTela) {
  const it = cl.itens.find(x => x.id === id);
  await S.getByRole('radiogroup', { name: new RegExp(it.texto.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })
    .getByRole('radio', { name: nomeCat('sustentada') }).click();
}
await S.getByRole('button', { name: 'Conferir' }).click();
ok(await p.locator('text=/São precisas/').count() > 0, 'abaixo do mínimo: diz quanto falta e deixa refazer');
await S.getByRole('button', { name: 'Refazer' }).click();
for (const id of ordemNaTela) {
  const it = cl.itens.find(x => x.id === id);
  await S.getByRole('radiogroup', { name: new RegExp(it.texto.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })
    .getByRole('radio', { name: nomeCat(it.categoria) }).click();
}
await S.getByRole('button', { name: 'Conferir' }).click();
ok(await p.locator('text=Critério cumprido.').count() > 0, 'mito ou evidência: critério cumprido');
await p.screenshot({ path: '.shots/raizes-consolidar.png', fullPage: true });

/* Recarregar: o progresso continua, e o módulo está concluído. */
await etapa(p, 'avancar');
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(500);
ok(await p.locator('text=/Módulo 1 concluído/').count() > 0, 'depois de recarregar, o módulo continua concluído');
await p.screenshot({ path: '.shots/raizes-avancar.png', fullPage: true });
await p.goto(`${BASE}/raizes/`, { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
ok(await p.locator('text=Continuar de onde parei').count() === 1, 'a casa oferece continuar de onde parou');
ok(await p.locator('[aria-label="Seu progresso"]', { hasText: '1/10' }).count() === 1, 'a casa mostra o progresso geral');
ok(await p.locator('li', { hasText: 'Explorador de Sefarad' }).locator('text=✓').count() === 1, 'a conquista do módulo aparece');
await p.screenshot({ path: '.shots/raizes-casa-depois.png', fullPage: true });

/* ── os outros módulos com conteúdo: cada atividade, só acertando ─────── */
async function resolver(sec, a) {
  if (a.tipo === 'escolha') await sec.getByRole('button', { name: a.opcoes.find(o => o.correta).texto }).click();
  if (a.tipo === 'multipla') {
    for (const o of a.opcoes.filter(x => x.correta)) await sec.getByRole('checkbox', { name: o.texto }).click();
    await sec.getByRole('button', { name: 'Conferir', exact: true }).click();
  }
  if (a.tipo === 'mapa') {
    for (const l of a.lugares.slice(0, a.minimoExplorados)) {
      const bt = sec.locator(`button[aria-label^="${l.nome}"]`).first();
      await bt.focus();
      await p.keyboard.press('Enter');
    }
    for (const [i, q] of a.perguntas.entries()) await sec.locator('select').nth(i).selectOption(q.resposta);
    await sec.getByRole('button', { name: 'Conferir', exact: true }).click();
  }
  if (a.tipo === 'associacao') {
    for (let i = 0; i < a.documentos.length; i++) {
      const titulo = await sec.locator('h4').nth(i).innerText();
      await sec.locator('select').nth(i).selectOption(a.documentos.find(x => x.titulo === titulo).contexto);
    }
    await sec.getByRole('button', { name: 'Conferir', exact: true }).click();
  }
  if (a.tipo === 'ordenar') {
    for (let alvo = 0; alvo < a.eventos.length; alvo++) {
      const atuais = await sec.locator('button[aria-label^="Subir: "]').evaluateAll(bs => bs.map(x => x.getAttribute('aria-label').slice(7)));
      const i = atuais.indexOf(a.eventos[alvo].texto);
      for (let k = i; k > alvo; k--) await sec.getByRole('button', { name: `Subir: ${a.eventos[alvo].texto}` }).click();
    }
    await sec.getByRole('button', { name: 'Conferir a ordem' }).click();
  }
  if (a.tipo === 'classificar') {
    const nome = id => a.categorias.find(c => c.id === id).nome;
    for (const it of a.itens) {
      await sec.getByRole('radiogroup', { name: re(it.texto) }).getByRole('radio', { name: nome(it.categoria) }).click();
    }
    await sec.getByRole('button', { name: 'Conferir' }).click();
  }
}

for (const M of DADOS.conteudo.slice(1)) {
  console.log(`\n  módulo ${M.n}`);
  for (const e of M.etapas) {
    const S = await etapa(p, e.id, M.n);
    const ids = e.blocos.filter(x => x.tipo === 'atividade').map(x => x.id);
    for (const [i, id] of ids.entries()) {
      const sec = S.locator('section.rz-atividade:not(.rz-lab)').nth(i);
      await resolver(sec, M.atividades[id]);
      ok(await sec.locator('.rz-rot', { hasText: 'Concluída' }).count() > 0, `módulo ${M.n}, ${e.id}: ${id} concluída`);
    }
    if (e.blocos.some(x => x.tipo === 'laboratorio')) {
      /* O Laboratório guarda no aparelho, sobrevive à recarga e apaga tudo quando pedido. */
      const lab = p.locator('section.rz-lab');
      await lab.getByLabel('Nome', { exact: true }).fill('Maria (teste)');
      await lab.getByRole('radio', { name: /Hipótese/ }).check();
      await lab.getByRole('button', { name: 'Guardar a ficha' }).click();
      await p.reload({ waitUntil: 'networkidle' });
      await p.waitForTimeout(400);
      ok(await p.locator('section.rz-lab h3', { hasText: 'Maria (teste)' }).count() === 1, `módulo ${M.n}: a ficha do Laboratório volta depois de recarregar`);
      ok(await p.locator('section.rz-lab li', { hasText: /^1 hipótese$/ }).count() === 1, `módulo ${M.n}: o resumo conta a ficha como hipótese`);
      await p.locator('section.rz-lab').getByRole('button', { name: 'Apagar tudo do laboratório' }).click();
      await p.locator('section.rz-lab').getByRole('button', { name: 'Sim, apagar' }).click();
      ok(await p.locator('section.rz-lab h3', { hasText: 'Maria (teste)' }).count() === 0, `módulo ${M.n}: apagar tudo limpa o Laboratório`);
    }
    if (e.blocos.some(x => x.tipo === 'reflexao')) await S.locator('textarea').fill('Preciso saber mais da família de cada um.');
    ok(await semRolagemLateral(p), `módulo ${M.n}, ${e.id}: sem rolagem lateral`);
    await S.screenshot({ path: `.shots/raizes-m${M.n}-${e.id}.png` });
  }
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  ok(await p.locator(`text=/Módulo ${M.n} concluído/`).count() > 0, `módulo ${M.n} concluído depois de recarregar`);
  /* O objeto da unidade abre e mostra o que guarda. */
  await p.locator('#rz-objeto-do-modulo').click();
  await p.waitForTimeout(450);
  ok(await p.locator('dialog[open]').count() === 1, `módulo ${M.n}: o objeto da unidade abre`);
  await p.locator('dialog[open] header').screenshot({ path: `.shots/objeto-m${M.n}.png` });
  await p.keyboard.press('Escape');
}
if (DADOS.conteudo.length > 1) {
  await p.goto(`${BASE}/raizes/`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  ok(await p.locator('[aria-label="Seu progresso"]', { hasText: `${DADOS.conteudo.length}/10` }).count() === 1, 'a casa conta os módulos concluídos');
  if (DADOS.conteudo.length === 10) {
    /* Os dez concluídos: o certificado abre, com o nome e o que ele não certifica. */
    await p.goto(`${BASE}/raizes/certificado/`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    await p.getByLabel('Nome que aparece no certificado').fill('Ana de Teste');
    const cert = p.locator('article.rz-certificado');
    ok(await cert.locator('text=Ana de Teste').count() === 1, 'o certificado leva o nome digitado');
    ok(await cert.locator('text=Este certificado não certifica:').count() === 1, 'o certificado diz o que não certifica');
    ok(await semRolagemLateral(p), 'certificado sem rolagem lateral');
    await p.screenshot({ path: '.shots/raizes-certificado.png', fullPage: true });
  }
}

/* O protótipo "O Arquivo Aberto" no módulo 3: abertura, narrativa com o mapa, o édito. */
if (DADOS.conteudo.some(x => x.n === 3 && x.experiencia)) {
  await etapa(p, 'descobrir', 3);
  await p.waitForTimeout(3200);
  ok(await p.locator('header.rz-abertura figure svg').count() === 1, 'm3: a abertura tem a folha desenhada');
  ok(await p.locator('header.rz-abertura figcaption', { hasText: 'interpretativa' }).count() === 1, 'm3: a ilustração se diz interpretativa');
  ok(await semRolagemLateral(p), 'm3: abertura sem rolagem lateral');
  await p.screenshot({ path: '.shots/arquivo-abertura.png', fullPage: false });
  await etapa(p, 'contextualizar', 3);
  ok(await p.locator('.rz-ficha-mapa svg').count() === 1, 'm3: a ficha com o mapa aparece');
  await p.evaluate(() => {
    const el = document.querySelector('[data-passo="2"]');
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3);
  });
  await p.waitForTimeout(1200);
  ok(await p.locator('.rz-ficha-mapa .rz-ano', { hasText: '1497' }).count() === 1, 'm3: ao ler 1497, o ano da ficha muda');
  ok(await p.locator('.rz-ficha-mapa circle.aceso').count() === 2, 'm3: Évora e Lisboa acendem no mapa');
  await p.screenshot({ path: '.shots/arquivo-narrativa.png', fullPage: false });
  const marcos = p.locator('.rz-edito .rz-marco');
  ok(await marcos.count() === 4, 'm3: a folha tem quatro partes tocáveis');
  for (let k = 0; k < 4; k++) { await marcos.nth(k).click(); await p.waitForTimeout(250); }
  ok(await p.locator('text=4 de 4 partes lidas').count() === 1, 'm3: as quatro partes contam como lidas');
  ok(await p.locator('text=O que a folha ensina').count() === 1, 'm3: o fecho aparece depois de ler tudo');
  ok(await semRolagemLateral(p), 'm3: Contextualizar sem rolagem lateral');
  await p.locator('h2', { hasText: 'Leia o édito' }).scrollIntoViewIfNeeded();
  await p.screenshot({ path: '.shots/arquivo-edito.png', fullPage: false });
  await p.screenshot({ path: '.shots/arquivo-contextualizar.png', fullPage: true });
}

/* O Atlas: lugares, um ponto aberto, os Caminhos tocando. */
if (DADOS.atlas) {
  await p.goto(`${BASE}/raizes/atlas/`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  ok(await p.locator('h1', { hasText: 'O que a história dos sefarditas' }).count() === 1, 'o Atlas abre');
  ok(await semRolagemLateral(p), 'Atlas sem rolagem lateral');
  await p.locator('.rz-atlas button.rz-ponto').first().click();
  await p.waitForTimeout(300);
  await p.getByRole('button', { name: 'De onde vem isso?' }).click();
  await p.waitForTimeout(200);
  ok(await p.locator('text=O que a fonte diz:').count() > 0, 'um lugar abre a ficha, e a ficha abre as fontes');
  await p.screenshot({ path: '.shots/raizes-atlas.png', fullPage: false });
  await p.getByRole('tab', { name: 'Caminhos do Exílio' }).click();
  await p.getByRole('button', { name: /^Tocar/ }).click();
  await p.waitForTimeout(3000);
  ok(await p.locator('.rz-atlas svg path[stroke-dasharray], .rz-atlas svg path[mask]').count() > 0, 'as rotas se desenham ao tocar');
  ok(await p.locator('text=Hipótese').count() > 0, 'a legenda diz o que é hipótese');
  ok(await semRolagemLateral(p), 'Caminhos sem rolagem lateral');
  await p.screenshot({ path: '.shots/raizes-caminhos.png', fullPage: true });

  await p.goto(`${BASE}/raizes/lugar/lisboa/`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  ok(await p.locator('h1', { hasText: 'Lisboa' }).count() === 1, 'a página de Lisboa abre');
  ok(await p.locator('text=Ilustração interpretativa.').count() === 1, 'a ilustração se diz interpretativa');
  ok(await semRolagemLateral(p), 'Lisboa sem rolagem lateral');
  await p.screenshot({ path: '.shots/raizes-lisboa.png', fullPage: true });

  await p.goto(`${BASE}/raizes/familia/`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  await p.getByRole('button', { name: 'Ver um exemplo fictício' }).click();
  await p.waitForTimeout(300);
  ok(await p.locator('text=Exemplo didático, fictício').count() === 1, 'o exemplo se diz fictício');
  ok(await p.locator('text=não comprova, por si só, ascendência judaica').count() === 1, 'o aviso do sobrenome está à vista');
  ok(await p.locator('svg[aria-label^="Mapa com"]').count() === 1, 'o Caminho da Família aparece no mapa');
  ok(await semRolagemLateral(p), 'árvore sem rolagem lateral');
  await p.screenshot({ path: '.shots/raizes-familia.png', fullPage: true });
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  ok(await p.locator('text=Exemplo didático, fictício').count() === 1, 'a árvore continua no aparelho depois de recarregar');
}

/* ── o objeto da unidade, a folha que voa e o mapa do capítulo ───────────── */
await p.goto(`${BASE}/raizes/modulo/2/`, { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
ok(await p.locator('#rz-objeto-do-modulo').count() === 1, 'o objeto da unidade aparece');
const mapaCap = p.locator('section', { has: p.locator('h2', { hasText: 'O mapa do capítulo' }) });
ok(await mapaCap.count() === 1, 'o mapa do capítulo aparece');
await mapaCap.scrollIntoViewIfNeeded();
await p.waitForTimeout(900);
await mapaCap.locator('.sr-only button').first().evaluate(b => b.click());
await p.waitForTimeout(400);
ok(await mapaCap.locator('.rz-ficha').count() === 1, 'tocar num lugar abre a ficha');
ok(await semRolagemLateral(p), 'mapa do capítulo sem rolagem lateral');
await mapaCap.screenshot({ path: '.shots/raizes-mapa-capitulo.png' });
const contaAntes = await p.locator('.rz-objeto-conta').innerText();
const folha1 = p.locator('.rz-folha-secao').first();
await folha1.scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
await p.screenshot({ path: '.shots/raizes-folha-voando.png' });
await p.waitForTimeout(1900);
ok(await p.locator('.rz-objeto-conta').innerText() !== contaAntes, `a folha vista entra no objeto (${contaAntes} → ${await p.locator('.rz-objeto-conta').innerText()})`);
ok(await folha1.locator('text=✓ Guardada').count() === 1, 'a folha diz que foi guardada');
await p.screenshot({ path: '.shots/raizes-folha-guardada.png' });
await p.locator('#rz-objeto-do-modulo').click();
await p.waitForTimeout(500);
ok(await p.locator('dialog[open] h2', { hasText: 'baú de viagem' }).count() === 1, 'o baú abre e mostra o que guarda');
await p.screenshot({ path: '.shots/raizes-objeto-aberto.png' });
await p.keyboard.press('Escape');

/* ── as fotos históricas, sempre com o crédito ao lado ─────────────────── */
if (DADOS.fotos?.length) {
  await p.goto(`${BASE}/raizes/lugar/lisboa/`, { waitUntil: 'networkidle' });
  const fotoLisboa = p.locator('figure.rz-foto').first();
  await fotoLisboa.scrollIntoViewIfNeeded();
  await p.waitForTimeout(600);
  ok(await fotoLisboa.locator('button.rz-foto-quadro img').evaluate(i => i.complete && i.naturalWidth > 0), 'a foto de Lisboa carrega');
  ok(await fotoLisboa.locator('figcaption a', { hasText: 'Wikimedia Commons' }).count() === 1, 'a foto traz o crédito com o link de origem');
  await fotoLisboa.screenshot({ path: '.shots/raizes-foto-lisboa.png' });
  await fotoLisboa.locator('button.rz-foto-quadro').click();
  await p.waitForTimeout(400);
  ok(await p.locator('dialog.rz-foto-grande[open]').count() === 1, 'tocar na foto abre a imagem grande');
  await p.keyboard.press('Escape');
  await p.goto(`${BASE}/raizes/modulo/1/`, { waitUntil: 'networkidle' });
  const faixa = p.locator('section[aria-label="Imagens deste capítulo"]');
  ok(await faixa.count() === 1, 'o módulo 1 mostra as imagens do capítulo');
  await faixa.scrollIntoViewIfNeeded();
  await p.waitForTimeout(600);
  ok(await semRolagemLateral(p), 'faixa de imagens sem rolagem lateral da página');
  await faixa.screenshot({ path: '.shots/raizes-fotos-modulo.png' });
}

/* ── a jornada: interesses, personagens, coleção, busca, glossário, passaporte ── */
await p.goto(`${BASE}/raizes/`, { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
const cartao = p.locator('section[aria-labelledby="interesses"]');
if (await cartao.count()) {
  await cartao.getByRole('button', { name: 'Conhecer a presença sefardita no Brasil' }).click();
  await cartao.getByRole('button', { name: 'Guardar' }).click();
  await p.waitForTimeout(200);
}
ok(await p.locator('text=Seus interesses').count() === 1, 'os interesses ficam guardados');
ok(await p.locator('text=Porque você escolheu').count() > 0, 'a sugestão diz por quê');
ok(await p.locator('h3', { hasText: 'A herança sefardita no Brasil' }).count() === 1, 'os cinco mundos aparecem na casa');
ok(await semRolagemLateral(p), 'casa sem rolagem lateral');
await p.screenshot({ path: '.shots/raizes-casa-jornada.png', fullPage: true });

if (DADOS.personagens?.length) {
  await p.goto(`${BASE}/raizes/personagens/`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(300);
  const nome = DADOS.personagens[0].nome;
  await p.getByRole('button', { name: new RegExp(nome) }).first().click();
  await p.waitForTimeout(200);
  await p.getByRole('button', { name: 'Guardar na coleção' }).first().click();
  await p.waitForTimeout(800);
  ok(await p.getByRole('button', { name: 'Na sua coleção' }).count() === 1, 'o botão diz que guardou');
  ok(await semRolagemLateral(p), 'personagens sem rolagem lateral');
  await p.screenshot({ path: '.shots/raizes-personagens.png', fullPage: false });
  await p.goto(`${BASE}/raizes/colecao/`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  ok(await p.locator('.rz-lista li', { hasText: nome }).count() === 1, 'o personagem guardado está na coleção');
  ok(await semRolagemLateral(p), 'coleção sem rolagem lateral');
  await p.screenshot({ path: '.shots/raizes-colecao.png', fullPage: false });
}

await p.goto(`${BASE}/raizes/busca/?q=lisboa`, { waitUntil: 'networkidle' });
await p.waitForTimeout(300);
ok(await p.locator('.rz-lista li').count() > 0, 'a busca acha Lisboa');
ok(await semRolagemLateral(p), 'busca sem rolagem lateral');
await p.screenshot({ path: '.shots/raizes-busca.png', fullPage: false });

await p.goto(`${BASE}/raizes/glossario/`, { waitUntil: 'networkidle' });
await p.waitForTimeout(300);
ok(await p.locator('dl dt').count() > 10, 'o glossário lista os termos');
ok(await semRolagemLateral(p), 'glossário sem rolagem lateral');
await p.screenshot({ path: '.shots/raizes-glossario.png', fullPage: false });

await p.goto(`${BASE}/raizes/passaporte/`, { waitUntil: 'networkidle' });
await p.waitForTimeout(300);
ok(await p.locator('.rz-selo-pass').count() >= 9, 'o passaporte mostra os selos');
ok(await p.locator('text=não vale como documento').count() === 1, 'o passaporte diz que não certifica origem');
ok(await semRolagemLateral(p), 'passaporte sem rolagem lateral');
await p.screenshot({ path: '.shots/raizes-passaporte.png', fullPage: true });

await p.goto(`${BASE}/raizes/biblioteca/`, { waitUntil: 'networkidle' });
await p.waitForTimeout(300);
ok(await p.locator('h1', { hasText: 'Biblioteca' }).count() === 1, 'a biblioteca abre');
ok(await semRolagemLateral(p), 'biblioteca sem rolagem lateral');
await p.screenshot({ path: '.shots/raizes-biblioteca.png', fullPage: false });
ok(erros.length === 0, `sem erro de console${erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''}`);
await ctx.close();

/* ── sem o direito ─────────────────────────────────────────────────────── */
console.log('\n  conta só com o alfabeto');
const sem = await contexto(['alfabetizacao']);
await sem.p.goto(`${BASE}/raizes/modulo/1/`, { waitUntil: 'networkidle' });
await sem.p.waitForTimeout(800);
ok(!(await sem.p.locator('text=Onde fica Sefarad?').count()), 'o conteúdo não aparece');
ok(/\/cursos\/?$/.test(new URL(sem.p.url()).pathname), `vai para a lista de cursos (${new URL(sem.p.url()).pathname})`);
await sem.ctx.close();

await b.close();
s.close();
console.log(falhas.length ? `\n  ${falhas.length} falha(s)` : '\n  tudo certo');
process.exit(falhas.length ? 1 : 0);
