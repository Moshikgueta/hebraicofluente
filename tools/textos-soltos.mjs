/* textos-soltos.mjs - o português que ainda está escrito no código das telas
 * ─────────────────────────────────────────────────────────────────────────
 * O site em inglês (PLANO-INGLES.md) só fica pronto quando nenhuma tela do
 * curso de alfabetização escreve texto direto no componente: todo texto
 * visível sai de app/src/i18n/telas/. Este script lê o código com o
 * compilador do TypeScript (e não com regex, que confunde comentário, classe
 * CSS e texto) e lista o que sobrou:
 *
 *   - todo texto solto no JSX (`<p>Olá</p>`), que é sempre visível;
 *   - texto em atributo que a pessoa lê ou ouve (aria-label, title, alt,
 *     placeholder, label...);
 *   - string que parece português (acento, ou palavra comum como "de",
 *     "você", "não" numa frase de duas palavras ou mais).
 *
 * Fora: comentários, imports, a própria pasta i18n, `console.*`, e a linha
 * que termina com o comentário `i18n-ok` (código interno que parece frase:
 * mensagem de erro de desenvolvedor, chave de evento, nome de arquivo).
 *
 * Uso (de app/):
 *   node ../tools/textos-soltos.mjs                 tudo o que está no escopo
 *   node ../tools/textos-soltos.mjs src/components/learn src/app/licao
 *   node ../tools/textos-soltos.mjs --resumo        só a contagem por arquivo
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createRequire } from 'node:module';

const APP = new URL('../app/', import.meta.url).pathname;
/* O compilador mora nas dependências de app/, não na raiz. */
const ts = createRequire(join(APP, 'package.json'))('typescript');

/* O que vai ao ar no site em inglês: o curso de alfabetização, a venda dele,
   a conta e o checkout. Fora (ver PLANO-INGLES.md): Raízes, A1, os painéis de
   administrador, as páginas guardadas do portal e do livro, e as políticas
   (Termos, Privacidade e Reembolso em inglês são escritos à parte). */
export const FORA_DO_ESCOPO = [
  'src/i18n/',
  'src/app/raizes/', 'src/components/raizes/', 'src/app/raizes-sefarditas/',
  'src/app/a1/', 'src/components/a1/',
  'src/app/admin/',
  'src/app/aprender-hebraico/', 'src/app/descobrir-israel/',
  'src/app/israel-alem-do-obvio/', 'src/app/comece-aqui/', 'src/app/PortalClient.tsx',
  'src/app/termos/', 'src/app/privacidade/', 'src/app/reembolso/',
  'src/lib/raizes', 'src/lib/a1', 'src/lib/state/raizes-estado.ts',
  'src/lib/audio-manifest.ts', 'src/lib/painel-estatisticas.ts', 'src/lib/ecossistema.ts',
  'src/components/portal/', 'src/app/cursos/[slug]/LivroClient.tsx',
  'src/app/cursos/[slug]/ProdutoClient.tsx'
];

const ATRIBUTOS_LIDOS = new Set([
  'aria-label', 'aria-description', 'aria-roledescription', 'aria-valuetext',
  'title', 'alt', 'placeholder', 'label', 'legenda', 'rotulo', 'titulo', 'texto',
  'descricao', 'dica', 'mensagem', 'confirmar', 'cancelar'
]);
const ATRIBUTOS_TECNICOS = new Set([
  'className', 'href', 'src', 'id', 'key', 'type', 'name', 'role', 'rel', 'target',
  'htmlFor', 'lang', 'dir', 'inputMode', 'autoComplete', 'pattern', 'method',
  'action', 'variant', 'size', 'as', 'tone', 'value', 'd', 'viewBox', 'fill',
  'stroke', 'transform', 'xmlns', 'mode', 'kind', 'icon', 'tipo', 'evento'
]);

const ACENTO = /[ãõçáéíóúâêôàÃÕÇÁÉÍÓÚÂÊÔÀ]/;
const PALAVRA_PT = /(^|[\s(])(de|do|da|dos|das|que|para|com|não|você|seu|sua|um|uma|os|as|em|no|na|ao|e|é|ou|se|por|mais|já|até|quando|como|está|sem)(?=[\s,.!?:;)]|$)/i;
const DUAS_PALAVRAS = /[A-Za-zÀ-ú]{2,}\s+[A-Za-zÀ-ú]{2,}/;

export function pareceTexto(s) {
  if (!/[A-Za-zÀ-ú]{2}/.test(s)) return false;
  if (/^[\w./@#:-]+$/.test(s) && !ACENTO.test(s)) return false; // id, rota, classe
  if (ACENTO.test(s)) return true;
  return DUAS_PALAVRAS.test(s) && PALAVRA_PT.test(s);
}

function arquivos(alvos) {
  const out = [];
  const andar = p => {
    const rel = relative(APP, p);
    if (FORA_DO_ESCOPO.some(f => rel.startsWith(f) || rel === f.replace(/\/$/, ''))) return;
    if (statSync(p).isDirectory()) { for (const f of readdirSync(p)) andar(join(p, f)); return; }
    if (/\.(tsx?|mts)$/.test(p) && !p.endsWith('.d.ts')) out.push(p);
  };
  for (const a of alvos) {
    const p = join(APP, a);
    if (existsSync(p)) andar(p);
  }
  return out;
}

function nomeDoAtributo(no) {
  for (let p = no.parent; p; p = p.parent) {
    if (ts.isJsxAttribute(p)) return p.name.getText();
    if (ts.isJsxElement(p) || ts.isJsxSelfClosingElement(p) || ts.isBlock(p)) return null;
  }
  return null;
}

function dentroDe(no, teste) {
  for (let p = no.parent; p; p = p.parent) if (teste(p)) return true;
  return false;
}

export function soltosDe(arquivo) {
  const fonte = readFileSync(arquivo, 'utf8');
  const sf = ts.createSourceFile(arquivo, fonte, ts.ScriptTarget.Latest, true,
    arquivo.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const linhas = fonte.split('\n');
  const achados = [];
  const anotar = (no, texto) => {
    const { line } = sf.getLineAndCharacterOfPosition(no.getStart(sf));
    if (/i18n-ok/.test(linhas[line] ?? '')) return;
    achados.push({ linha: line + 1, texto: texto.replace(/\s+/g, ' ').trim().slice(0, 90) });
  };
  const visitar = no => {
    if (ts.isImportDeclaration(no) || ts.isExportDeclaration(no)) return;
    if (ts.isCallExpression(no) && /^console\./.test(no.expression.getText(sf))) return;
    if (ts.isJsxText(no)) {
      if (/[A-Za-zÀ-ú]{2}/.test(no.text)) anotar(no, no.text);
    } else if (ts.isStringLiteral(no) || ts.isNoSubstitutionTemplateLiteral(no) || ts.isTemplateExpression(no)) {
      const texto = ts.isTemplateExpression(no)
        ? [no.head.text, ...no.templateSpans.map(s => s.literal.text)].join(' ')
        : no.text;
      const attr = nomeDoAtributo(no);
      const chaveDeObjeto = ts.isPropertyAssignment(no.parent) && no.parent.name === no;
      const tipo = dentroDe(no, n => ts.isTypeNode(n));
      if (!chaveDeObjeto && !tipo && !(attr && ATRIBUTOS_TECNICOS.has(attr))) {
        if ((attr && ATRIBUTOS_LIDOS.has(attr) && /[A-Za-zÀ-ú]{2}/.test(texto)) || pareceTexto(texto)) {
          anotar(no, texto);
        }
      }
      if (ts.isTemplateExpression(no)) no.templateSpans.forEach(s => visitar(s.expression));
      return;
    }
    ts.forEachChild(no, visitar);
  };
  visitar(sf);
  return achados;
}

function principal(argv) {
  const resumo = argv.includes('--resumo');
  const alvos = argv.filter(a => !a.startsWith('--'));
  const lista = arquivos(alvos.length ? alvos : ['src']);
  let total = 0;
  const porArquivo = [];
  for (const f of lista) {
    const a = soltosDe(f);
    if (!a.length) continue;
    total += a.length;
    porArquivo.push([relative(APP, f), a]);
  }
  porArquivo.sort((x, y) => y[1].length - x[1].length);
  for (const [f, a] of porArquivo) {
    if (resumo) { console.log(`${String(a.length).padStart(4)}  ${f}`); continue; }
    console.log(f);
    for (const { linha, texto } of a) console.log(`  ${linha}: ${texto}`);
  }
  console.log(`\n${total} texto(s) solto(s) em ${porArquivo.length} arquivo(s).`);
  return total;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = principal(process.argv.slice(2)) ? 1 : 0;
}
