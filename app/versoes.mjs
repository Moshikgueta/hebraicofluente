/* A versão de cada política, tirada do TEXTO publicado (auditoria de 01/10/2026, LEGAL-104).
   ────────────────────────────────────────────────────────────────────────
   Até aqui a "versão" aceita no cadastro e citada no recibo era a data
   `politicas.atualizadoEm`, comum às quatro políticas e solta do texto: em
   29/09/2026 os Termos mudaram duas vezes no mesmo dia sem a data mudar, e o
   texto também muda com o preço e com as formas de pagamento da publicação.
   Duas pessoas com a mesma "versão" podiam ter aceitado contratos diferentes,
   e nenhuma das duas tinha como ver o que aceitou: o link do recibo era
   /termos/, que mostra sempre o texto de hoje.

   Agora:

     1. a versão é o começo do sha256 do texto que o visitante lê dentro de
        `<article data-politica="...">` (components/legal/Legal.tsx), já
        renderizado no export - o mesmo texto, a mesma versão; uma vírgula a
        mais, outra versão;
     2. cada versão vira um arquivo IMUTÁVEL em data/politicas-versoes/
        (`termos-<versao>.html`), que vai para o git e nunca é reescrito;
     3. todos esses arquivos são publicados em /<documento>/v/<versao>/, para
        sempre - o recibo linka a versão da compra, não a página de hoje;
     4. data/politicas-versoes/atual.json diz a versão de agora. O Worker o
        importa: é o que vai para `aceites.versao` no cadastro e para
        `orders.termos_versao` no pedido.

   Roda dentro de `npm run build`, depois do `next build`. `check-legal.mjs`
   confere que a versão bate com o texto, que o arquivo existe e que ele está
   no git.

   Uma publicação com formas de pagamento diferentes das do repositório (o
   `pagamento-ativo.mjs` reescreve `pagamento.formas` só naquela execução)
   gera um texto diferente e, portanto, uma versão que não está no git. Ela é
   publicada normalmente naquela execução, e o resumo do Actions avisa; para
   que ela fique para sempre, rode o build com as mesmas formas e faça commit
   do arquivo novo. Ver RUNBOOK-ATENDIMENTO.md.

   node versoes.mjs   (de dentro de app/, com o export em out/) */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

/* O site em inglês (NEXT_PUBLIC_LOCALE=en, export em out-en) tem Termos,
   Privacidade e Reembolso próprios (PLANO-INGLES.md, etapa 6), e as versões
   deles moram à parte, em data/politicas-versoes-en/: o Worker em inglês lê
   o atual.json de lá (worker/src/lib/versoes.js), e as versões do site
   brasileiro, que nasceram neste repositório, não se misturam com elas. */
const EM_INGLES = process.env.NEXT_PUBLIC_LOCALE === 'en';
const OUT = EM_INGLES ? 'out-en' : 'out';
const ARQUIVO = EM_INGLES ? '../data/politicas-versoes-en' : '../data/politicas-versoes';
const ATUAL = join(ARQUIVO, 'atual.json');

export const DOCUMENTOS = EM_INGLES
  ? [['termos', 'Terms of Use'], ['reembolso', 'Refunds and Cancellation'], ['privacidade', 'Privacy Policy']]
  : [['termos', 'Termos de Uso'], ['reembolso', 'Reembolso e Cancelamento'], ['privacidade', 'Política de Privacidade']];

/** O HTML de dentro de `<article data-politica="doc">`, ou null. */
export function trechoDoDocumento(html, doc) {
  const m = html.match(new RegExp(`<article[^>]*data-politica="${doc}"[^>]*>([\\s\\S]*?)</article>`));
  return m ? m[1] : null;
}

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", '#x27': "'" };

/** O texto como se lê: sem marcação, entidades resolvidas, espaços juntos. */
export function textoDe(trecho) {
  return trecho
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (t, e) => {
      if (ENTIDADES[e.toLowerCase()] !== undefined) return ENTIDADES[e.toLowerCase()];
      if (e[0] === '#') {
        const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : t;
      }
      return t;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/** Dez caracteres do sha256 do texto: curto para um link, longo para não colidir. */
export const versaoDe = texto => createHash('sha256').update(texto, 'utf8').digest('hex').slice(0, 10);

/** O HTML guardado: só a marcação do texto, sem classes nem scripts, com
 *  estilo próprio. Não depende dos arquivos de estilo de uma publicação, que
 *  mudam de nome a cada build - a cópia tem de abrir igual daqui a anos. */
function copiaFixa(doc, titulo, versao, trecho, hojeIso) {
  const limpo = trecho
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, '')
    .replace(/<(\w+)((?:\s+[^>]*?)?)(\/?)>/g, (_t, tag, attrs, fecha) => {
      const href = attrs.match(/\shref="([^"]*)"/);
      return `<${tag}${href ? ` href="${href[1]}"` : ''}${fecha}>`;
    });
  const dia = hojeIso.split('-').reverse().join('/');
  const aviso = EM_INGLES
    ? `Fixed copy of this version (code <strong>${versao}</strong>), saved on ${hojeIso} and never changed afterwards. The version in force today is at <a href="/${doc}/">/${doc}/</a>.`
    : `Cópia fixa desta versão (código <strong>${versao}</strong>), guardada em ${dia} e nunca alterada depois. A versão em vigor hoje está em <a href="/${doc}/">/${doc}/</a>.`;
  return `<!doctype html>
<html lang="${EM_INGLES ? 'en' : 'pt-BR'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${titulo} - ${EM_INGLES ? 'version' : 'versão'} ${versao} - Hebraico Fluente</title>
<style>
body{margin:0;background:#fff;color:#1d2a2e;font:16px/1.65 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:760px;margin:0 auto;padding:24px 16px 48px}
.aviso{background:#f2efe6;border-radius:10px;padding:12px 14px;font-size:14px}
h1{font-size:28px;line-height:1.2}h2{font-size:20px;margin-top:28px}
a{color:#1d545e}ul{padding-left:20px}dl div{display:flex;gap:12px}dt{min-width:140px;color:#5b6a6e}dd{margin:0}
@media (prefers-color-scheme:dark){body{background:#0e1416;color:#e6eceb}.aviso{background:#1b2527}a{color:#7fdaca}dt{color:#a8b5b3}}
</style>
</head>
<body>
<main>
<p class="aviso">${aviso}</p>
${limpo}
</main>
</body>
</html>
`;
}

/* ── só quando chamado como script ─────────────────────────────────────── */
if (process.argv[1] && process.argv[1].endsWith('versoes.mjs')) {
  mkdirSync(ARQUIVO, { recursive: true });
  const hoje = new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10);   // Brasília
  const antes = existsSync(ATUAL) ? JSON.parse(readFileSync(ATUAL, 'utf8')) : {};
  const atual = {};
  const novas = [];

  for (const [doc, titulo] of DOCUMENTOS) {
    const f = join(OUT, doc, 'index.html');
    if (!existsSync(f)) { console.error(`  ✗ ${f} não existe - rode o next build antes`); process.exit(1); }
    const trecho = trechoDoDocumento(readFileSync(f, 'utf8'), doc);
    if (!trecho) { console.error(`  ✗ ${f} sem <article data-politica="${doc}">`); process.exit(1); }
    const versao = versaoDe(textoDe(trecho));
    atual[doc] = versao;
    const guardado = join(ARQUIVO, `${doc}-${versao}.html`);
    if (!existsSync(guardado)) {
      writeFileSync(guardado, copiaFixa(doc, titulo, versao, trecho, hoje));
      novas.push(guardado);
    }
  }

  /* Só reescreve quando muda: um build sem mudança de texto não mexe no git. */
  const igual = DOCUMENTOS.every(([d]) => antes[d] === atual[d]);
  if (!igual) {
    writeFileSync(ATUAL, JSON.stringify({
      _nota: [
        'GERADO por app/versoes.mjs a cada build. Não editar à mão.',
        'A versão de cada política é o começo do sha256 do texto publicado; a cópia',
        'fixa de cada versão mora ao lado, em <documento>-<versao>.html, e é',
        'publicada em /<documento>/v/<versao>/. O Worker grava a de termos em',
        'aceites.versao e em orders.termos_versao.'
      ],
      ...atual
    }, null, 2) + '\n');
  }

  /* Toda versão guardada, publicada no seu endereço fixo. */
  let publicadas = 0;
  for (const nome of readdirSync(ARQUIVO)) {
    const m = nome.match(/^([a-z]+)-([0-9a-f]{10})\.html$/);
    if (!m) continue;
    const destino = join(OUT, m[1], 'v', m[2]);
    mkdirSync(destino, { recursive: true });
    writeFileSync(join(destino, 'index.html'), readFileSync(join(ARQUIVO, nome)));
    publicadas++;
  }

  for (const [doc] of DOCUMENTOS) console.log(`  ✓ ${doc}: versão ${atual[doc]}`);
  console.log(`  ✓ ${publicadas} cópia(s) fixa(s) publicada(s) em /<documento>/v/<versao>/`);
  if (novas.length) {
    console.log(`  · versão nova: ${novas.join(' ')} - faça commit, é a cópia que fica para sempre`);
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY,
        `\n> Atenção: esta publicação gerou uma versão de política que não está no repositório (${novas.join(', ')}). ` +
        'Ela está no ar, mas só fica para sempre com commit: rode o build com as mesmas formas de pagamento ' +
        'e faça commit do arquivo. Ver RUNBOOK-ATENDIMENTO.md.\n');
    }
  }
}
