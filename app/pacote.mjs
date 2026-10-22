/* O curso não pode viajar no pacote público.
 * ─────────────────────────────────────────────────────────────────────────
 * Este é o teste de aceitação do conserto de 20/09/2026. Antes dele, os seis
 * JSONs do curso eram importados por `lib/content.ts`, que a home carrega -
 * e por isso o material de ensino ia inteiro para dentro de
 * `/_next/static/chunks/*.js`, que não tem portão nenhum e nem pode ter. A
 * auditoria mediu: 48 de 60 amostras de `letters.json` achadas num pedaço que
 * um visitante deslogado baixa. Um `curl` levava o produto.
 *
 * Um teste de unidade não pega isso. O que decide é o que foi PUBLICADO, não
 * o que o código diz importar - um `import()` que o empacotador não apagou é
 * exatamente o defeito, e ele só aparece no arquivo final. Então este script
 * lê o export de verdade e procura o conteúdo dentro dele.
 *
 *   npm run build && node pacote.mjs
 *
 * ── o que ele olha ───────────────────────────────────────────────────────
 *   · todo arquivo de /_next/static/ - o JavaScript e o CSS que qualquer um
 *     baixa, e que é o caminho pelo qual o conteúdo vazava;
 *   · o HTML de toda rota LIVRE - a home, o método, o FAQ, o checkout.
 *
 * O HTML das rotas pagas é o único lugar onde o material PODE aparecer, e
 * deve: ele é gerado no servidor e o Worker só o entrega a quem tem cookie e
 * direito de acesso (worker/src/gate.js). Por isso o script confere as duas
 * metades: nada de conteúdo do lado de fora, e conteúdo de verdade do lado de
 * dentro - uma página paga que ficou vazia é um conserto que quebrou o curso.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT = 'out';
if (!existsSync(OUT)) {
  console.error('out/ não existe. Rode a build antes:  npm run build && node pacote.mjs');
  process.exit(1);
}

/* ── os prefixos pagos, lidos do próprio portão ────────────────────────────
   Copiar a lista aqui deixaria as duas divergirem em silêncio no dia em que
   uma rota nova nascesse - e o script passaria a chamar de "livre" uma
   página que o portão protege, ou o contrário. */
const gateJs = readFileSync(new URL('../worker/src/gate.js', import.meta.url), 'utf8');
const GATED = [...gateJs.matchAll(/'(\/[a-z-]+)'/g)]
  .map(m => m[1])
  .filter((p, i, a) => a.indexOf(p) === i);
if (GATED.length < 10) {
  console.error('não consegui ler a lista de rotas pagas de worker/src/gate.js');
  process.exit(1);
}
const pago = rota => GATED.some(g => rota === g || rota.startsWith(g + '/'));

/* ── as amostras ───────────────────────────────────────────────────────────
   Trechos longos e distintivos, não letras soltas: a home mostra o alfabeto
   de propósito, e procurar por "א" acusaria uma página livre que está certa.
   O que não pode sair de graça é a AULA - a explicação, a palavra com nikud,
   a carta de cultura.

   `course.json` fica DE FORA das amostras, e isso é decisão, não esquecimento:
   ele é a grade do curso - títulos de módulo, metas, os 22 glifos e os nomes
   deles -, que a página de vendas mostra de propósito. Esconder a vitrine não
   protege nada; esconder a aula, sim. É a mesma régua de
   `lib/content-publico.ts`, e os dois têm de continuar concordando. */
const j = p => JSON.parse(readFileSync(join('content', p), 'utf8'));

const amostras = [];

/* A prosa do curso é salpicada de `{{מ}}`, que o componente troca pela letra
   desenhada. A amostra tem de ser um pedaço SEM marcador: tirar as chaves e
   deixar o hebraico produziria um texto que não existe em lugar nenhum, e o
   script passaria a procurar uma coisa que nunca vai achar - passando sempre,
   inclusive quando o conteúdo estivesse vazando. Então a amostra é o maior
   trecho limpo entre dois marcadores. */
const por = (fonte, texto) => {
  const pedaco = String(texto || '')
    .split(/\{\{[^}]*\}\}/)
    .map(s => s.trim())
    .sort((a, b) => b.length - a.length)[0] || '';
  if (pedaco.length >= 24) amostras.push({ fonte, t: pedaco.slice(0, 48) });
};

for (const L of j('letters.json')) {
  por(`letters/${L.id}.soundNotePt`, L.soundNotePt);
  por(`letters/${L.id}.didYouKnow`, L.didYouKnow);
  por(`letters/${L.id}.brazilianMistake.why`, L.brazilianMistake?.why);
}
const nikud = j('nikud.json');
por('nikud.intro', JSON.stringify(nikud.intro).replace(/[{}"\[\]]/g, ' '));
for (const s of nikud.sounds) por(`nikud/${s.sound}`, s.signs?.[0]?.position);

const extras = j('extras.json');
por('extras.dagesh.rulePt', extras.dagesh?.rulePt);
por('extras.dagesh.warningPt', extras.dagesh?.warningPt);
por('extras.unpointed.introPt', extras.unpointed?.introPt);
por('extras.gerech.introPt', extras.gerech?.introPt);
por('extras.gerech.signNotePt', extras.gerech?.signNotePt);

/* As frases e os pares de era nasceram depois deste script e ficaram de fora
   da amostragem - conteúdo pago sem conferência nenhuma, que é exatamente o
   buraco que a auditoria de 20/09 encontrou da primeira vez. A amostra é a
   PROSA em português (`notePt`), e não o hebraico: a frase em si é curta, e
   um trecho curto acusaria uma página livre que está certa.

   `biblia.json` NÃO entra aqui, e é decisão e não esquecimento: ele é público
   de propósito, como `course.json` - a página /biblia mostra um versículo de
   domínio público justamente para quem ainda não comprou. A régua é a mesma
   de lib/content-publico.ts, e os dois têm de continuar concordando. */
for (const s of j('sentences.json').sentences) por(`frase/${s.id}`, s.notePt);
for (const p of j('eras.json').pairs) por(`era/${p.id}`, p.notePt);

for (const s of j('real-world.json').scenes) por(`cena/${s.id}`, s.contextPt);
/* As leituras bônus (27/09/2026): a prosa da introdução, pelo mesmo motivo. */
for (const l of j('bonus.json').leituras) por(`bonus/${l.id}`, l.introPt);
for (const c of j('culture.json').cards) {
  por(`cultura/${c.id}.leadPt`, c.leadPt);
  por(`cultura/${c.id}.bodyPt`, c.bodyPt?.[0]);
}
/* O curso Hebraico A1 (06/10/2026): a explicação da gramática e o objetivo
   de cada unidade. É pago por OUTRO curso, e nada dele pode aparecer em
   página livre. */
for (const u of j('a1.json').unidades) {
  por(`a1/unidade-${u.n}.objetivoPt`, u.objetivoPt);
  for (const [i, g] of u.gramatica.entries()) por(`a1/unidade-${u.n}.gramatica-${i + 1}`, g.textoPt);
  for (const [i, c] of [...(u.cultura ?? []), ...(u.sabia ?? [])].entries()) por(`a1/unidade-${u.n}.caixa-${i + 1}`, c.textoPt);
}
/* O exame do A1 é corrigido no servidor: nem pergunta nem gabarito podem
   chegar ao navegador por nenhum caminho, nem pago. */
for (const p of j('a1-exame.json').partes) {
  for (const [i, it] of p.itens.entries()) por(`a1/exame-${p.id}-${i + 1}`, it.q ?? it.pt);
}
/* Raízes Sefarditas (21/10/2026): outro produto pago. A prosa de cada
   módulo, a evidência da matriz e o enunciado das atividades. */
const semMarcas = t => String(t || '').replace(/\[\[[^\]]*\]\]/g, ' ');
for (const m of j('raizes.json').conteudo) {
  for (const e of m.etapas) {
    for (const [i, b] of e.blocos.entries()) {
      if (b.tipo === 'texto') por(`raizes/m${m.n}.${e.id}.${i}`, semMarcas(b.paragrafos[0]));
    }
  }
  for (const [id, a] of Object.entries(m.atividades)) por(`raizes/m${m.n}.atividade.${id}`, a.enunciado);
}
for (const a of j('raizes.json').afirmacoes.slice(0, 8)) por(`raizes/${a.id}`, a.evidencia);
const traços = j('stroke-paths.json').letters;
for (const [id, set] of Object.entries(traços).slice(0, 6)) {
  por(`traço/${id}`, set.strokes?.[0]?.d);
}

/* Um empacotador pode escrever `á` como `á`, e um JSON embutido escapa
   as aspas. Procurar só a forma crua deixaria o vazamento passar. */
const formas = t => [
  t,
  t.replace(/[^\x00-\x7F]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')),
  JSON.stringify(t).slice(1, -1)
].filter((x, i, a) => a.indexOf(x) === i);

const variantes = amostras.map(a => ({ ...a, formas: formas(a.t) }));

/* ── onde procurar ─────────────────────────────────────────────────────── */
function arquivos(dir) {
  const out = [];
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) out.push(...arquivos(p));
    else out.push(p);
  }
  return out;
}

const todos = arquivos(OUT);
const estaticos = todos.filter(p => p.includes(`${OUT}/_next/`) && /\.(js|css|json)$/.test(p));

/* Cada rota tem duas caras: o `index.html`, que o navegador abre, e o
   `index.txt`, que o Next busca quando se navega sem recarregar. As duas
   carregam o mesmo conteúdo renderizado, e as duas ficam no mesmo endereço -
   então as duas entram na conta. Olhar só o HTML deixaria metade de fora. */
const paginas = todos.filter(p => /\/index\.(html|txt)$/.test(p) || /\.html$/.test(p));
const rotaDe = p => {
  const r = '/' + relative(OUT, p).replace(/\/?index\.(html|txt)$/, '').replace(/\.html$/, '');
  return r.replace(/\/+$/, '') || '/';
};

const htmlLivre = paginas.filter(p => !pago(rotaDe(p)));
const htmlPago = paginas.filter(p => pago(rotaDe(p)));

/* Os JSONs do curso NÃO devem estar em out/ como arquivo servível: o export
   só copia o que está em public/, e o conteúdo mora fora dele - mas uma
   cópia acidental para lá desfaria tudo sem tocar em nenhum import. */
const jsonsSoltos = todos.filter(p =>
  /(letters|nikud|extras|real-world|stroke-paths|culture)\.json$/.test(p));

/* ── a varredura ───────────────────────────────────────────────────────── */
function acha(lista) {
  const achados = [];
  for (const p of lista) {
    let texto;
    try { texto = readFileSync(p, 'utf8'); } catch { continue; }
    for (const a of variantes) {
      if (a.formas.some(f => texto.includes(f))) achados.push({ arquivo: p, fonte: a.fonte });
    }
  }
  return achados;
}

const noPacote = acha(estaticos);
const noLivre = acha(htmlLivre);
const noPago = acha(htmlPago);

/* ── o veredito ────────────────────────────────────────────────────────── */
const linha = n => '─'.repeat(n);
console.log(linha(66));
console.log(`amostras: ${variantes.length} · estáticos: ${estaticos.length} · `
  + `html livre: ${htmlLivre.length} · html pago: ${htmlPago.length}`);
console.log(linha(66));

let falhou = false;

const mostrar = (titulo, achados) => {
  const porArquivo = new Map();
  for (const a of achados) {
    if (!porArquivo.has(a.arquivo)) porArquivo.set(a.arquivo, []);
    porArquivo.get(a.arquivo).push(a.fonte);
  }
  console.error(`\n✗ ${titulo}: ${achados.length} ocorrência(s) em ${porArquivo.size} arquivo(s)`);
  for (const [arquivo, fontes] of [...porArquivo].slice(0, 8)) {
    console.error(`   ${arquivo}`);
    console.error(`      ${fontes.slice(0, 6).join(', ')}${fontes.length > 6 ? ` … +${fontes.length - 6}` : ''}`);
  }
};

if (noPacote.length) { mostrar('conteúdo pago dentro de /_next/static', noPacote); falhou = true; }
else console.log('✓ /_next/static não carrega nenhuma amostra do curso');

if (noLivre.length) { mostrar('conteúdo pago no HTML de rota LIVRE', noLivre); falhou = true; }
else console.log('✓ nenhuma página livre carrega conteúdo do curso');

if (jsonsSoltos.length) {
  console.error('\n✗ JSON do curso servível dentro de out/:');
  jsonsSoltos.forEach(p => console.error(`   ${p}`));
  falhou = true;
} else console.log('✓ nenhum JSON do curso foi copiado para o export');

/* A outra metade: o conserto não pode ter esvaziado o curso. Uma página paga
   renderizada no servidor tem de continuar trazendo o material - se nenhuma
   trouxer, o "vazamento resolvido" é só uma aula que sumiu. */
if (!noPago.length) {
  console.error('\n✗ nenhuma página PAGA traz conteúdo do curso.');
  console.error('   Ou a build não gerou as rotas pagas, ou o conteúdo sumiu do');
  console.error('   servidor junto com o do pacote - as duas são quebra do curso.');
  falhou = true;
} else {
  const arquivos = new Set(noPago.map(a => a.arquivo)).size;
  console.log(`✓ o HTML pago continua trazendo o curso (${arquivos} página(s))`);
}

console.log(linha(66));
if (falhou) {
  console.error('\nO pacote público leva conteúdo pago. Ver lib/content.ts e');
  console.error('lib/content-servidor.ts: quem importa o conteúdo inteiro tem de');
  console.error('ser componente de SERVIDOR, e só.');
  process.exit(1);
}
console.log('O conteúdo pago não está no pacote público.');
