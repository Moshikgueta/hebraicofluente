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
  '/entrar', '/criar-conta', '/esqueci-senha', '/nova-senha', '/perfil', '/checkout',
  '/conta-apagada'
];

/* Quanto o Google deve voltar. Não é ranking - é só uma dica de frequência,
   e a única distinção honesta aqui é entre a página que muda quando o curso
   muda e o texto jurídico que fica anos parado. */
const CADENCIA = (rota) =>
  rota === '/' ? 'weekly'
  : ['/termos/', '/privacidade/', '/reembolso/', '/suporte/'].includes(rota) ? 'yearly'
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

/* ── execução ─────────────────────────────────────────────────────────── */
if (import.meta.url === `file://${process.argv[1]}`) {
  const site = origem();
  const { listadas, pagas, ocultas } = classificar(rotas());
  const hoje = new Date().toISOString().slice(0, 10);

  writeFileSync('out/sitemap.xml', sitemapXml(site, listadas, hoje));
  writeFileSync('out/robots.txt', robotsTxt(site));

  console.log(`  site: ${site}`);
  console.log(`  no sitemap (${listadas.length}): ${listadas.join(' ')}`);
  console.log(`  fora, por serem pagas (${pagas.length})`);
  console.log(`  fora, por não responderem a busca (${ocultas.length}): ${ocultas.join(' ')}`);
  console.log('\n✓ out/sitemap.xml e out/robots.txt escritos');
}
