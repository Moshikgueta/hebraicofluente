/* Raízes Sefarditas num navegador de verdade, a 390 px.
   ────────────────────────────────────────────────────────────────────────
   Contra o export local (npm run build), com uma conta de demonstração que
   tem o direito raizes-sefarditas. Percorre o módulo 1 como um aluno:
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
const etapa = async (p, id) => { await p.goto(`${BASE}/raizes/modulo/1/?etapa=${id}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(300); };
const textoDe = t => t.replace(/\[\[[^\]]*\]\]/g, '').trim();

/* ── com o direito ─────────────────────────────────────────────────────── */
console.log('\n  conta com Raízes');
const { ctx, p, erros } = await contexto(['raizes-sefarditas']);
await p.goto(`${BASE}/raizes/`, { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
ok(await p.locator('h1', { hasText: 'Raízes Sefarditas' }).count() === 1, 'a casa abre com o título');
ok(await p.locator('text=Começar pelo módulo 1').count() === 1, 'oferece começar pelo módulo 1');
ok(await p.getByText('Em preparação', { exact: true }).count() === 9, 'os nove módulos em preparação aparecem como tais');
ok(await semRolagemLateral(p), 'casa sem rolagem lateral');
ok(await p.getByText('Meu curso', { exact: true }).count() === 0 && await p.locator('text=/\\d+ XP/').count() === 0,
  'casca própria: nada do menu nem do XP do curso de hebraico');
ok(await p.locator('header', { hasText: 'Raízes Sefarditas' }).count() > 0, 'o cabeçalho é o do Raízes');
await p.screenshot({ path: '.shots/raizes-casa.png', fullPage: true });

/* Descobrir: errar, ver a explicação, tentar de novo, acertar. */
await etapa(p, 'descobrir');
const desc = M1.atividades.descobrir;
const errada = desc.opcoes.find(o => !o.correta), certa = desc.opcoes.find(o => o.correta);
await p.getByRole('button', { name: errada.texto }).click();
ok(await p.locator('text=Ainda não.').count() > 0, 'errar mostra "Ainda não." com a explicação');
await p.getByRole('button', { name: 'Tentar de novo' }).click();
await p.getByRole('button', { name: certa.texto }).click();
ok(await p.locator('text=Certo.').count() > 0, 'acertar mostra "Certo."');
await p.screenshot({ path: '.shots/raizes-descobrir.png', fullPage: true });

/* Contextualizar: abrir uma fonte. */
await etapa(p, 'contextualizar');
await p.getByRole('button', { name: /Fonte 1: abrir/ }).first().click();
ok(await p.locator('text=O que a fonte diz:').count() > 0, 'a fonte abre com a evidência');
ok(await p.locator('text=/Verificada por busca|Em debate/').count() > 0, 'a fonte mostra o status');
ok(await semRolagemLateral(p), 'contextualizar sem rolagem lateral');
await p.screenshot({ path: '.shots/raizes-contextualizar.png', fullPage: true });

/* Explorar: cinco lugares, três perguntas. */
await etapa(p, 'explorar');
const mapa = M1.atividades.mapa;
for (const l of mapa.lugares.slice(0, mapa.minimoExplorados)) {
  await p.locator(`button[aria-label^="${l.nome}"]`).first().click();
}
ok(await p.locator(`text=Lugares explorados: ${mapa.minimoExplorados}`).count() > 0, 'o mapa conta os lugares explorados');
await p.screenshot({ path: '.shots/raizes-mapa.png', fullPage: false });
const selects = p.locator('select');
for (const [i, q] of mapa.perguntas.entries()) await selects.nth(i).selectOption(q.resposta);
await p.getByRole('button', { name: 'Conferir', exact: true }).click();
ok(await p.locator('text=/As três certas/').count() > 0, 'as três perguntas do mapa certas');
ok(await semRolagemLateral(p), 'mapa sem rolagem lateral');

/* Investigar: documentos (um errado primeiro) e "o que prova". */
await etapa(p, 'investigar');
const docs = M1.atividades.documentos;
const sel = p.locator('select');
for (const [i, d] of docs.documentos.entries()) {
  const titulo = await p.locator('h4').nth(i).innerText();
  const doc = docs.documentos.find(x => x.titulo === titulo);
  const ctxErrado = docs.contextos.find(c => c.id !== doc.contexto).id;
  await sel.nth(i).selectOption(i === 0 ? ctxErrado : doc.contexto);
}
await p.getByRole('button', { name: 'Conferir', exact: true }).first().click();
ok(await p.locator('text=/4 de 5 certos/').count() > 0, 'documentos: um errado é apontado');
await p.getByRole('button', { name: 'Corrigir' }).click();
const titulo0 = await p.locator('h4').nth(0).innerText();
await sel.nth(0).selectOption(docs.documentos.find(x => x.titulo === titulo0).contexto);
await p.getByRole('button', { name: 'Conferir', exact: true }).first().click();
ok(await p.locator('text=O que ele não prova:').count() === 5, 'documentos certos mostram o que cada um não prova');
const prova = M1.atividades.prova;
for (const o of prova.opcoes.filter(x => x.correta)) await p.getByRole('checkbox', { name: o.texto }).click();
await p.getByRole('button', { name: 'Conferir', exact: true }).last().click();
ok(await p.locator('text=Todas certas.').count() > 0, '"o que prova": seleção certa');
await p.screenshot({ path: '.shots/raizes-investigar.png', fullPage: true });

/* Aplicar: ordenar pelas setas, depois os dois desafios. */
await etapa(p, 'aplicar');
const lt = M1.atividades['linha-do-tempo'];
for (let alvo = 0; alvo < lt.eventos.length; alvo++) {
  const textos = await p.locator('ol li button[aria-pressed] >> nth=0').evaluateAll(() => []);
  void textos;
  const atuais = await p.$$eval('button[aria-label^="Subir: "]', bs => bs.map(x => x.getAttribute('aria-label').slice(7)));
  const i = atuais.indexOf(lt.eventos[alvo].texto);
  for (let k = i; k > alvo; k--) await p.getByRole('button', { name: `Subir: ${lt.eventos[alvo].texto}` }).click();
}
await p.getByRole('button', { name: 'Conferir a ordem' }).click();
ok(await p.locator(`text=${lt.explicacao.slice(0, 40)}`).count() > 0, 'linha do tempo em ordem, com a explicação');
const df = M1.atividades['desafio-fatos'];
for (const o of df.opcoes.filter(x => x.correta)) await p.getByRole('checkbox', { name: o.texto }).click();
await p.getByRole('button', { name: 'Conferir', exact: true }).click();
ok(await p.locator('text=Todas certas.').count() > 0, 'desafio: os fatos certos');
const dfr = M1.atividades['desafio-frase'];
await p.getByRole('button', { name: dfr.opcoes.find(o => o.correta).texto }).click();
ok(await p.locator('text=Certo.').count() > 0, 'desafio: a versão fiel');
ok(await semRolagemLateral(p), 'aplicar sem rolagem lateral');
await p.screenshot({ path: '.shots/raizes-aplicar.png', fullPage: true });

/* Refletir: escrever, e o texto fica no aparelho. */
await etapa(p, 'refletir');
await p.locator('textarea').fill('Acomodação, com conflito.');
ok(await p.locator('text=Guardado neste aparelho.').count() > 0, 'a reflexão fica no aparelho');

/* Consolidar: classificar, primeiro abaixo do mínimo. */
await etapa(p, 'consolidar');
const cl = M1.atividades['mito-ou-evidencia'];
const nomeCat = id => cl.categorias.find(c => c.id === id).nome;
const ordemNaTela = await p.$$eval('ol li > p[id^="cl-"]', ps => ps.map(x => x.id.slice(3)));
for (const id of ordemNaTela) {
  const it = cl.itens.find(x => x.id === id);
  await p.getByRole('radiogroup', { name: new RegExp(it.texto.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })
    .getByRole('radio', { name: nomeCat('sustentada') }).click();
}
await p.getByRole('button', { name: 'Conferir' }).click();
ok(await p.locator('text=/São precisas/').count() > 0, 'abaixo do mínimo: diz quanto falta e deixa refazer');
await p.getByRole('button', { name: 'Refazer' }).click();
for (const id of ordemNaTela) {
  const it = cl.itens.find(x => x.id === id);
  await p.getByRole('radiogroup', { name: new RegExp(it.texto.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })
    .getByRole('radio', { name: nomeCat(it.categoria) }).click();
}
await p.getByRole('button', { name: 'Conferir' }).click();
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
ok(await p.locator('text=1 de 10 módulos concluídos').count() === 1, 'a casa mostra o progresso geral');
ok(await p.locator('text=✓ Explorador de Sefarad').count() === 1, 'a conquista do módulo aparece');
await p.screenshot({ path: '.shots/raizes-casa-depois.png', fullPage: true });

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
