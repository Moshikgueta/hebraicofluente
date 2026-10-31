/* O SEO publicado confere com as regras?
   ─────────────────────────────────────────────────────────────────────────
   O `seo.mjs` gera; este confere o que foi GERADO contra o HTML que foi
   PUBLICADO. São duas coisas diferentes, e é a segunda que o visitante vê:
   um sitemap perfeito ao lado de uma página sem canonical não resolve nada.

   O que ele exige, por classe de página:

     ANUNCIÁVEL   está no sitemap · tem canonical apontando para si mesma ·
                  tem description · tem og:title, og:description e og:image ·
                  NÃO tem noindex;
     NÃO LISTADA  (login, conta, checkout, 404) fora do sitemap · com noindex
                  no próprio HTML, porque ela é servida de verdade a quem
                  chega;
     PAGA         fora do sitemap. O `noindex` dela NÃO mora no HTML: mora no
                  `X-Robots-Tag` que o Worker carimba em toda rota do portão
                  (worker/src/worker.js, `blindar`). É o lugar certo - uma
                  rota nova do curso nasce fora do índice pelo mesmo motivo
                  que nasce atrás do login, e não porque alguém lembrou de
                  escrever `metadata` naquele arquivo. Aqui se confere que a
                  regra existe.

   E mais três coisas que só se veem olhando o conjunto:

     · o `SITE_ORIGIN` do wrangler.toml e o domínio que saiu nos canonicals
       são o mesmo. Divergir aqui é anunciar um domínio e servir outro;
     · a imagem do og:image existe mesmo em `out/`. Um og:image apontando
       para 404 é pior do que nenhum: o leitor de cartão tenta, falha, e
       mostra o link pelado depois de esperar;
     · duas páginas não declaram o mesmo canonical. Canonical repetido diz ao
       buscador que uma das duas não deve existir.

   node checa-seo.mjs  (de dentro de app/, depois do build e do seo.mjs) */

import { readFileSync, existsSync } from 'node:fs';
import { classificar, rotas, ESPELHOS } from './seo.mjs';

const toml = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
const SITE = toml.match(/^\s*SITE_ORIGIN\s*=\s*"([^"]+)"/m)[1].replace(/\/+$/, '');

const problemas = [];
const nota = (s) => problemas.push(s);

const DIR = process.env.NEXT_PUBLIC_LOCALE === 'en' ? 'out-en' : 'out';
const html = (rota) => readFileSync(`${DIR}${rota}index.html`, 'utf8');
const tag = (h, re) => (h.match(re) || [])[1] || null;

const canonicalDe = h => tag(h, /<link rel="canonical" href="([^"]+)"/);
const robotsDe    = h => tag(h, /<meta name="robots" content="([^"]+)"/);
const descDe      = h => tag(h, /<meta name="description" content="([^"]*)"/);
const ogDe        = (h, p) => tag(h, new RegExp(`<meta property="og:${p}" content="([^"]*)"`));

/* ── o sitemap e o robots existem e são coerentes ───────────────────── */
if (!existsSync(`${DIR}/sitemap.xml`)) nota('out/sitemap.xml não existe - rode seo.mjs');
if (!existsSync(`${DIR}/robots.txt`)) nota('out/robots.txt não existe - rode seo.mjs');
if (problemas.length) { fim(); }

const sitemap = readFileSync(`${DIR}/sitemap.xml`, 'utf8');
const noSitemap = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(m => m[1].replace(SITE, '')));

const robots = readFileSync(`${DIR}/robots.txt`, 'utf8');
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) {
  nota('robots.txt não aponta o sitemap no domínio do SITE_ORIGIN');
}
/* A regra do arquivo: nada de Disallow nas rotas pagas - um endereço
   bloqueado é um em que o rastreador nunca lê o noindex. */
for (const [, alvo] of robots.matchAll(/^Disallow:\s*(\S+)/gm)) {
  nota(`robots.txt bloqueia "${alvo}" - um Disallow impede o rastreador de ler o noindex`);
}

/* ── página por página ──────────────────────────────────────────────── */
const { listadas, pagas, ocultas, espelhos } = classificar(rotas());
const canonicais = new Map();

for (const rota of listadas) {
  const h = html(rota);
  const c = canonicalDe(h);
  const esperado = `${SITE}${rota}`;

  if (!noSitemap.has(rota)) nota(`${rota} é anunciável e não está no sitemap`);
  if (!c) nota(`${rota} não declara canonical`);
  else if (c !== esperado) nota(`${rota} tem canonical "${c}", esperado "${esperado}"`);
  if (robotsDe(h)?.includes('noindex')) nota(`${rota} está no sitemap E com noindex`);
  if (!descDe(h)) nota(`${rota} não tem meta description`);
  for (const p of ['title', 'description', 'image']) {
    if (!ogDe(h, p)) nota(`${rota} não tem og:${p}`);
  }

  if (c) {
    if (canonicais.has(c)) nota(`${rota} e ${canonicais.get(c)} declaram o mesmo canonical`);
    else canonicais.set(c, rota);
  }
}

for (const rota of ocultas) {
  if (noSitemap.has(rota)) nota(`${rota} não responde a busca e está no sitemap`);
  if (!robotsDe(html(rota))?.includes('noindex')) nota(`${rota} não responde a busca e não tem noindex`);
}

/* ESPELHO (31/10/2026): a mesma página da capa noutro endereço. Fora do
   sitemap, canonical no principal, e SEM noindex (os dois sinais juntos se
   contradizem). */
for (const rota of espelhos) {
  const h = html(rota);
  const alvo = `${SITE}${ESPELHOS[rota.replace(/\/+$/, '')]}`.replace(/([^/])$/, '$1/');
  if (noSitemap.has(rota)) nota(`${rota} repete outra página e está no sitemap`);
  if (canonicalDe(h) !== alvo) nota(`${rota} repete ${alvo} e tem canonical "${canonicalDe(h)}"`);
  if (robotsDe(h)?.includes('noindex')) nota(`${rota} tem canonical em outra página E noindex`);
}

for (const rota of pagas) {
  if (noSitemap.has(rota)) nota(`${rota} é paga e está no sitemap`);
}

/* O noindex das pagas é um cabeçalho, não uma meta - então a prova é de
   FORMA, no código do Worker: o carimbo tem de estar dentro do mesmo `if`
   que já reconhece a rota pelo portão. Conferir o texto do cabeçalho numa
   resposta exigiria subir o Worker; conferir que a regra existe e está presa
   ao `isGatedPath` é o que impede alguém de apagá-la sem perceber. */
const worker = readFileSync(new URL('../worker/src/worker.js', import.meta.url), 'utf8');
const blindar = worker.slice(worker.indexOf('function blindar'));
const trecho = blindar.slice(blindar.indexOf('isGatedPath(path)'), blindar.indexOf('return out;'));
if (!/X-Robots-Tag['"],\s*['"]noindex/.test(trecho)) {
  nota('o Worker não carimba X-Robots-Tag: noindex nas rotas do portão (worker.js, blindar)');
}

/* ── a imagem do cartão existe de verdade ───────────────────────────── */
const og = ogDe(html('/'), 'image');
if (og) {
  const caminho = DIR + og.replace(SITE, '');
  if (!existsSync(caminho)) nota(`og:image aponta para ${og}, que não existe em out/`);
  else {
    const kb = readFileSync(caminho).length / 1024;
    console.log(`  cartão: ${og.replace(SITE, '')}  ${kb.toFixed(1)} KB`);
    if (kb > 300) nota(`o cartão tem ${kb.toFixed(0)} KB - prévia grande demais costuma não carregar`);
  }
}

/* ── a description cabe no resultado da busca ───────────────────────────
   Acima de ~155 caracteres o Google corta (auditoria de 01/10, SEO-003).
   Desde 31/10/2026 reprova em toda página anunciável: as do A1, A2 e B1, as
   últimas que passavam, saíam cortadas no meio da palavra. */
for (const rota of listadas) {
  const d = descDe(html(rota));
  const n = d ? [...d.replace(/&[a-z#0-9]+;/gi, 'x')].length : 0;
  if (n > 155) nota(`${rota} tem description com ${n} caracteres (máximo 155)`);
}

/* ── os dados estruturados da página do curso (lib/jsonld.ts, SEO-001) ──
   JSON válido; o preço do Course é o da caixa de preço (catálogo, ou o do
   PIX quando a loja só cobra por PIX); a validade é o fim do
   pré-lançamento; o CNPJ é o de data/empresa.json; a FAQPage tem as
   perguntas que a página mostra. Até 23/10/2026 isto morava na capa; desde
   então a capa é o portal e a página de venda é /curso-de-hebraico/. */
{
  const capa = html('/curso-de-hebraico/');
  const blocos = [...capa.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (!blocos.length) nota('/curso-de-hebraico/ não tem JSON-LD (application/ld+json)');
  const nos = [];
  for (const b of blocos) {
    try {
      const j = JSON.parse(b);
      nos.push(...(j['@graph'] || [j]));
    } catch (e) { nota(`/curso-de-hebraico/ tem JSON-LD inválido: ${e.message}`); }
  }
  const tipo = t => nos.find(n => n['@type'] === t);
  const catalogo = JSON.parse(readFileSync(new URL('./content/courses.json', import.meta.url), 'utf8'));
  const empresa = JSON.parse(readFileSync(new URL('./content/empresa.json', import.meta.url), 'utf8'));
  const c = catalogo.courses.find(x => x.slug === 'alfabetizacao');
  const pix = c.price.pixDiscountPct > 0
    ? Math.round(c.price.brl * (1 - c.price.pixDiscountPct / 100) * 100) / 100 : c.price.brl;
  const esperado = (empresa.pagamento?.modo === 'pix-direto' ? pix : c.price.brl).toFixed(2);
  const curso = tipo('Course'), org = tipo('Organization'), faq = tipo('FAQPage'), pessoa = tipo('Person');
  if (!curso) nota('JSON-LD da página do curso sem Course');
  else {
    if (curso.offers?.price !== esperado) nota(`JSON-LD: preço ${curso.offers?.price}, o catálogo cobra ${esperado}`);
    if (curso.offers?.priceCurrency !== catalogo.currency) nota(`JSON-LD: moeda do Course não é ${catalogo.currency}`);
    const ate = c.price.listBrl && c.price.listBrl > c.price.brl ? c.price.preLancamentoAte || null : null;
    if ((curso.offers?.priceValidUntil || null) !== ate) {
      nota(`JSON-LD: priceValidUntil ${curso.offers?.priceValidUntil}, o catálogo diz ${ate}`);
    }
  }
  /* O que o resultado de curso do Google pede (31/10/2026): a instância
     online com um ritmo, e o currículo, um módulo por módulo do curso. */
  if (curso) {
    const inst = curso.hasCourseInstance;
    if (!inst || inst.courseMode !== 'Online' || !(inst.courseSchedule || inst.courseWorkload)) {
      nota('JSON-LD: Course sem hasCourseInstance online com courseSchedule ou courseWorkload');
    }
    const estrutura = JSON.parse(readFileSync(new URL('./content/course.json', import.meta.url), 'utf8'));
    if ((curso.syllabusSections || []).length !== estrutura.modules.length) {
      nota(`JSON-LD: ${(curso.syllabusSections || []).length} módulos no Course, o curso tem ${estrutura.modules.length}`);
    }
    /* O endereço do Course é o canonical da página do curso (a capa, enquanto
       ela for o espelho de /curso-de-hebraico). */
    const doCurso = `${SITE}${ESPELHOS['/curso-de-hebraico'] ?? '/curso-de-hebraico/'}`;
    if (curso.url !== doCurso) nota(`JSON-LD: o Course aponta ${curso.url}, o canonical da página do curso é ${doCurso}`);
    if (curso.aggregateRating || curso.review) nota('JSON-LD: Course com avaliação - só com avaliações reais e conferíveis');
  }
  if (!tipo('WebSite')) nota('JSON-LD da página do curso sem WebSite');
  if (!org) nota('JSON-LD da página do curso sem Organization');
  /* O site em inglês sai sem CNPJ no JSON-LD (decisão do dono, 29/10/2026); lá, ele não pode aparecer. */
  else if (DIR === 'out-en') { if (org.taxID || org.address) nota('JSON-LD em inglês com CNPJ ou endereço da empresa'); }
  else if (empresa.cnpj && org.taxID !== empresa.cnpj) nota(`JSON-LD: CNPJ ${org.taxID}, empresa.json diz ${empresa.cnpj}`);
  if (!faq || !faq.mainEntity?.length) nota('JSON-LD da página do curso sem FAQPage com perguntas');
  else for (const q of faq.mainEntity) {
    if (!q.name || !q.acceptedAnswer?.text) nota('JSON-LD: pergunta da FAQPage sem nome ou resposta');
    else if (!capa.includes(q.name)) nota(`JSON-LD: a pergunta "${q.name}" não aparece na página do curso`);
  }
  if (!pessoa || pessoa.name !== 'Moshik Gueta') nota('JSON-LD da página do curso sem Person (o professor)');
  if (blocos.length) console.log(`  JSON-LD do curso: ${nos.map(n => n['@type']).join(', ')} · preço ${curso?.offers?.price} ${org?.taxID ? ` · CNPJ ${org.taxID}` : ''}`);
}

/* ── e os da capa ───────────────────────────────────────────────────────
   Desde 27/10/2026 a capa é a página do curso (o site é só o curso de
   alfabetização, decisão do dono): o mesmo grafo dela, com o Course e a
   FAQPage. Quando o portal voltar, a regra antiga volta junto: sem Course nem
   FAQPage na capa. */
{
  const capa = html('/');
  const nos = [];
  for (const m of capa.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const j = JSON.parse(m[1]); nos.push(...(j['@graph'] || [j])); }
    catch (e) { nota(`/ tem JSON-LD inválido: ${e.message}`); }
  }
  const tipos = nos.map(n => n['@type']);
  for (const t of ['Organization', 'Person', 'Course', 'FAQPage']) if (!tipos.includes(t)) nota(`JSON-LD da capa sem ${t}`);
  console.log(`  JSON-LD da capa: ${tipos.join(', ')}`);
}

console.log(`  site: ${SITE}`);
console.log(`  anunciáveis: ${listadas.length} · pagas: ${pagas.length} · não listadas: ${ocultas.length} · espelhos: ${espelhos.length}`);
fim();

function fim() {
  console.log('──────────────────────────────────────────────────────────────────');
  if (problemas.length) {
    for (const p of problemas) console.log(`✗ ${p}`);
    console.log('\nO SEO publicado não confere com as regras.');
    process.exit(1);
  }
  console.log('✓ canonical, Open Graph, noindex e sitemap conferem em toda página');
  process.exit(0);
}
