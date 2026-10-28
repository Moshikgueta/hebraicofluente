/* robots.txt e sitemap.xml, gerados do que o site de fato publica.
   ─────────────────────────────────────────────────────────────────────────
   Duas fontes, e nenhuma delas é uma lista escrita à mão aqui:

     · as PÁGINAS, varridas do `out/` recém-construído;
     · quem é PAGO, lido do `GATED` de worker/src/gate.js - o mesmo array que
       devolve 302 para quem não comprou.

   É essa segunda parte que importa. Uma lista de rotas pagas mantida à mão
   num gerador de sitemap fica velha no dia em que nasce uma rota nova, e o
   defeito é silencioso e caro: o endereço de uma aula paga anunciado num
   sitemap que o Google lê. Aqui uma rota nova nasce fora do sitemap pelo
   mesmo motivo que nasce atrás do login.

   O endereço vem de `SITE_ORIGIN`, em wrangler.toml [vars] - o mesmo valor
   que o Worker usa. Trocar de domínio é uma edição e um comando.

   ── por que o robots.txt NÃO bloqueia as rotas pagas ───────────────────
   Porque `Disallow` e `noindex` não são a mesma coisa e não se somam: uma
   URL bloqueada no robots é uma URL que o rastreador não busca, e portanto
   uma em que ele nunca LÊ o `noindex`. O resultado clássico é o endereço
   aparecendo na busca sem título nem descrição, que é pior do que não ter
   feito nada. As páginas pagas já respondem 302 e já saem com `noindex`;
   o robots fica aberto e só aponta o sitemap.

   node seo.mjs  (de dentro de app/, depois do build) */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { isGatedPath } from '../worker/src/gate.js';

/* Lido do TOML sem dependência: é uma linha `SITE_ORIGIN = "..."` dentro de
   [vars], e um parser inteiro para isso seria mais coisa para quebrar. */
function origem() {
  const toml = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
  const m = toml.match(/^\s*SITE_ORIGIN\s*=\s*"([^"]+)"/m);
  if (!m) throw new Error('wrangler.toml: SITE_ORIGIN não encontrado em [vars]');
  return m[1].replace(/\/+$/, '');
}

/* Abertas, mas não anunciáveis. Precisa bater com NAO_LISTADAS de
   src/lib/seo.ts - checa-seo.mjs confere as duas contra o HTML. */
const NAO_LISTADAS = [
  '/entrar', '/criar-conta', '/esqueci-senha', '/nova-senha', '/confirmar-email', '/perfil',
  '/checkout', '/conta-apagada', '/admin', '/sair-da-lista', '/confirmar-lista', '/verificar-certificado',
  '/termos/v', '/reembolso/v', '/privacidade/v',
  /* Responde 301 para /curso-de-hebraico (worker.js, 23/10/2026). */
  '/cursos/alfabetizacao',
  /* A prévia grátis do e-book, só para quem recebe o link no direct (23/10/2026). */
  '/previa',
  /* O destino do link da bio do Instagram (24/10/2026). */
  '/comece-aqui',
  /* A Minha Biblioteca, da conta (23/10/2026). */
  '/minha-biblioteca',
  /* O desafio com um amigo (28/10/2026). */
  '/desafio-amigo',
  /* Só o curso de alfabetização no site (27/10/2026): respondem 301 para a capa. */
  '/aprender-hebraico', '/descobrir-israel', '/israel-alem-do-obvio', '/raizes-sefarditas'
];

/* Quanto o Google deve voltar. Não é ranking - é só uma dica de frequência,
   e a única distinção honesta aqui é entre a página que muda quando o curso
   muda e o texto jurídico que fica anos parado. */
const CADENCIA = (rota) =>
  rota === '/' ? 'weekly'
  : ['/termos/', '/privacidade/', '/reembolso/', '/suporte/', '/acessibilidade/'].includes(rota) ? 'yearly'
  : 'monthly';

export function rotas(dir = 'out', base = '') {
  const achadas = [];
  for (const nome of readdirSync(dir)) {
    const cheio = join(dir, nome);
    if (statSync(cheio).isDirectory()) achadas.push(...rotas(cheio, `${base}/${nome}`));
    else if (nome === 'index.html') achadas.push(`${base}/`);
  }
  return achadas.sort();
}

/* O 404 é uma página de verdade no export estático, e por isso aparece na
   varredura. Anunciá-la é pedir ao Google que indexe a tela de erro. */
const TECNICAS = ['/404', '/500'];

const semBarra = (r) => r.replace(/\/+$/, '') || '/';
const naoListada = (r) =>
  [...NAO_LISTADAS, ...TECNICAS].some(x => semBarra(r) === x || semBarra(r).startsWith(x + '/'));

/** As rotas que entram no sitemap, e por quê as outras não entram. */
export function classificar(todas) {
  const listadas = [], pagas = [], ocultas = [];
  for (const r of todas) {
    if (r.includes('/_next/')) continue;
    if (isGatedPath(semBarra(r))) pagas.push(r);
    else if (naoListada(r)) ocultas.push(r);
    else listadas.push(r);
  }
  return { listadas, pagas, ocultas };
}

export function sitemapXml(site, listadas, data) {
  const linhas = listadas.map(r =>
    `  <url>\n    <loc>${site}${r}</loc>\n` +
    `    <lastmod>${data}</lastmod>\n` +
    `    <changefreq>${CADENCIA(r)}</changefreq>\n` +
    `    <priority>${r === '/' ? '1.0' : '0.7'}</priority>\n  </url>`
  );
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
         '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
         linhas.join('\n') + '\n</urlset>\n';
}

export function robotsTxt(site) {
  return [
    '# As rotas do curso pago não estão aqui de propósito: elas já respondem',
    '# 302 a quem não comprou e já saem com noindex. Um Disallow aqui só',
    '# impediria o rastreador de LER esse noindex.',
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${site}/sitemap.xml`,
    ''
  ].join('\n');
}

/* ── llms.txt (26/10/2026, plano de marketing) ────────────────────────────
   O resumo do site para os assistentes de IA (o formato de llmstxt.org): o
   nome e a descrição da capa, e uma linha por página anunciável, com o
   título e a descrição que a própria página publica. Nada é escrito aqui à
   mão: um preço ou uma contagem que mude no catálogo muda na página, e a
   página é a fonte. Só as rotas do sitemap; nenhuma paga, nenhuma oculta. */
const desfazer = (t) => t.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** O título e a descrição publicados no HTML de uma página. */
export function cabecalho(html) {
  const titulo = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const descricao = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  return { titulo: titulo ? desfazer(titulo).trim() : null, descricao: descricao ? desfazer(descricao).trim() : null };
}

export function llmsTxt(site, paginas) {
  const capa = paginas.find(p => p.rota === '/');
  const nome = (capa && capa.titulo ? capa.titulo.split(' | ')[0] : 'Hebraico Fluente');
  const linhas = [`# ${nome}`, ''];
  if (capa && capa.descricao) linhas.push(`> ${capa.descricao}`, '');
  linhas.push('## Páginas', '');
  for (const p of paginas) {
    if (!p.titulo) continue;
    linhas.push(`- [${p.titulo}](${site}${p.rota})${p.descricao ? `: ${p.descricao}` : ''}`);
  }
  return linhas.join('\n') + '\n';
}

/* ── execução ─────────────────────────────────────────────────────────── */
if (import.meta.url === `file://${process.argv[1]}`) {
  const site = origem();
  const { listadas, pagas, ocultas } = classificar(rotas());
  const hoje = new Date().toISOString().slice(0, 10);

  writeFileSync('out/sitemap.xml', sitemapXml(site, listadas, hoje));
  writeFileSync('out/robots.txt', robotsTxt(site));
  const paginas = listadas.map(rota => ({ rota, ...cabecalho(readFileSync(join('out', rota, 'index.html'), 'utf8')) }));
  writeFileSync('out/llms.txt', llmsTxt(site, paginas));

  console.log(`  site: ${site}`);
  console.log(`  no sitemap (${listadas.length}): ${listadas.join(' ')}`);
  console.log(`  fora, por serem pagas (${pagas.length})`);
  console.log(`  fora, por não responderem a busca (${ocultas.length}): ${ocultas.join(' ')}`);
  console.log('\n✓ out/sitemap.xml, out/robots.txt e out/llms.txt escritos');
}
