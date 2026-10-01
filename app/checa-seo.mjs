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
import { classificar, rotas } from './seo.mjs';

const toml = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
const SITE = toml.match(/^\s*SITE_ORIGIN\s*=\s*"([^"]+)"/m)[1].replace(/\/+$/, '');

const problemas = [];
const nota = (s) => problemas.push(s);

const html = (rota) => readFileSync(`out${rota}index.html`, 'utf8');
const tag = (h, re) => (h.match(re) || [])[1] || null;

const canonicalDe = h => tag(h, /<link rel="canonical" href="([^"]+)"/);
const robotsDe    = h => tag(h, /<meta name="robots" content="([^"]+)"/);
const descDe      = h => tag(h, /<meta name="description" content="([^"]*)"/);
const ogDe        = (h, p) => tag(h, new RegExp(`<meta property="og:${p}" content="([^"]*)"`));

/* ── o sitemap e o robots existem e são coerentes ───────────────────── */
if (!existsSync('out/sitemap.xml')) nota('out/sitemap.xml não existe - rode seo.mjs');
if (!existsSync('out/robots.txt')) nota('out/robots.txt não existe - rode seo.mjs');
if (problemas.length) { fim(); }

const sitemap = readFileSync('out/sitemap.xml', 'utf8');
const noSitemap = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(m => m[1].replace(SITE, '')));

const robots = readFileSync('out/robots.txt', 'utf8');
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) {
  nota('robots.txt não aponta o sitemap no domínio do SITE_ORIGIN');
}
/* A regra do arquivo: nada de Disallow nas rotas pagas - um endereço
   bloqueado é um em que o rastreador nunca lê o noindex. */
for (const [, alvo] of robots.matchAll(/^Disallow:\s*(\S+)/gm)) {
  nota(`robots.txt bloqueia "${alvo}" - um Disallow impede o rastreador de ler o noindex`);
}

/* ── página por página ──────────────────────────────────────────────── */
const { listadas, pagas, ocultas } = classificar(rotas());
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
  const caminho = 'out' + og.replace(SITE, '');
  if (!existsSync(caminho)) nota(`og:image aponta para ${og}, que não existe em out/`);
  else {
    const kb = readFileSync(caminho).length / 1024;
    console.log(`  cartão: ${og.replace(SITE, '')}  ${kb.toFixed(1)} KB`);
    if (kb > 300) nota(`o cartão tem ${kb.toFixed(0)} KB - prévia grande demais costuma não carregar`);
  }
}

/* ── a description cabe no resultado da busca ───────────────────────────
   Acima de ~155 caracteres o Google corta (auditoria de 01/10, SEO-003).
   A capa reprova; nas outras é aviso, por enquanto. */
for (const rota of listadas) {
  const d = descDe(html(rota));
  const n = d ? [...d.replace(/&[a-z#0-9]+;/gi, 'x')].length : 0;
  if (n <= 155) continue;
  if (rota === '/') nota(`a capa tem description com ${n} caracteres (máximo 155)`);
  else console.log(`  aviso: ${rota} tem description com ${n} caracteres (o resultado corta em ~155)`);
}

/* ── os dados estruturados da capa (lib/jsonld.ts, SEO-001) ─────────────
   JSON válido; o preço do Course é o da caixa de preço (catálogo, ou o do
   PIX quando a loja só cobra por PIX); a validade é o fim do
   pré-lançamento; o CNPJ é o de data/empresa.json; a FAQPage tem as
   perguntas que a capa mostra. */
{
  const capa = html('/');
  const blocos = [...capa.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (!blocos.length) nota('/ não tem JSON-LD (application/ld+json)');
  const nos = [];
  for (const b of blocos) {
    try {
      const j = JSON.parse(b);
      nos.push(...(j['@graph'] || [j]));
    } catch (e) { nota(`/ tem JSON-LD inválido: ${e.message}`); }
  }
  const tipo = t => nos.find(n => n['@type'] === t);
  const catalogo = JSON.parse(readFileSync(new URL('./content/courses.json', import.meta.url), 'utf8'));
  const empresa = JSON.parse(readFileSync(new URL('./content/empresa.json', import.meta.url), 'utf8'));
  const c = catalogo.courses.find(x => x.slug === 'alfabetizacao');
  const pix = c.price.pixDiscountPct > 0
    ? Math.round(c.price.brl * (1 - c.price.pixDiscountPct / 100) * 100) / 100 : c.price.brl;
  const esperado = (empresa.pagamento?.modo === 'pix-direto' ? pix : c.price.brl).toFixed(2);
  const curso = tipo('Course'), org = tipo('Organization'), faq = tipo('FAQPage'), pessoa = tipo('Person');
  if (!curso) nota('JSON-LD da capa sem Course');
  else {
    if (curso.offers?.price !== esperado) nota(`JSON-LD: preço ${curso.offers?.price}, o catálogo cobra ${esperado}`);
    if (curso.offers?.priceCurrency !== 'BRL') nota('JSON-LD: moeda do Course não é BRL');
    const ate = c.price.listBrl && c.price.listBrl > c.price.brl ? c.price.preLancamentoAte || null : null;
    if ((curso.offers?.priceValidUntil || null) !== ate) {
      nota(`JSON-LD: priceValidUntil ${curso.offers?.priceValidUntil}, o catálogo diz ${ate}`);
    }
  }
  if (!org) nota('JSON-LD da capa sem Organization');
  else if (empresa.cnpj && org.taxID !== empresa.cnpj) nota(`JSON-LD: CNPJ ${org.taxID}, empresa.json diz ${empresa.cnpj}`);
  if (!faq || !faq.mainEntity?.length) nota('JSON-LD da capa sem FAQPage com perguntas');
  else for (const q of faq.mainEntity) {
    if (!q.name || !q.acceptedAnswer?.text) nota('JSON-LD: pergunta da FAQPage sem nome ou resposta');
    else if (!capa.includes(q.name)) nota(`JSON-LD: a pergunta "${q.name}" não aparece na capa`);
  }
  if (!pessoa || pessoa.name !== 'Moshik Gueta') nota('JSON-LD da capa sem Person (o professor)');
  if (blocos.length) console.log(`  JSON-LD da capa: ${nos.map(n => n['@type']).join(', ')} · preço ${curso?.offers?.price} · CNPJ ${org?.taxID}`);
}

console.log(`  site: ${SITE}`);
console.log(`  anunciáveis: ${listadas.length} · pagas: ${pagas.length} · não listadas: ${ocultas.length}`);
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
