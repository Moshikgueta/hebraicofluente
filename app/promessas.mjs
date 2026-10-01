/* A vitrine não pode prometer o que o curso não entrega.
 * ─────────────────────────────────────────────────────────────────────────
 * Em 21/09/2026 o site vendia um áudio que não existe. O manifesto estava
 * vazio - zero gravações -, o curso desligava os exercícios de escuta e o FAQ
 * dizia a verdade sobre isso, com duas versões da frase e uma escolhida pelo
 * manifesto. O resto da landing, não: a seção de demonstração listava "Áudio
 * gravado por falante nativo" como coisa entregue, punha "escuta" entre os
 * cinco tipos de exercício, desenhava uma maquete de exercício de escuta com
 * botão de tocar, e o herói - a PRIMEIRA tela - mostrava um "Ouvir".
 *
 * Ou seja: o site se contradizia, e a parte que contradizia era justamente a
 * que vendia. No Brasil a oferta vincula (CDC art. 30), então isso não é
 * detalhe de texto - é reembolso com passos extras, e é reembolso que o
 * comprador tem razão em pedir.
 *
 * O conserto foi condicionar cada frase ao mesmo `audioAvailable()` que o FAQ
 * já usava. Este script é o que impede a volta: ele lê o HTML PUBLICADO das
 * páginas livres e, enquanto o manifesto estiver vazio, falha se achar
 * qualquer promessa de gravação.
 *
 *   npm run build && node promessas.mjs
 *
 * Por que contra o HTML e não contra a fonte: porque o que vende é o que foi
 * publicado. Uma frase nova numa seção nova, escrita por quem não leu esta
 * nota, não aparece em nenhum `grep` de `TEM_AUDIO` - aparece na página.
 *
 * ── o que este script NÃO alcança, e quem alcança ────────────────────────
 * Só o que RENDERIZA. E o HTML da home traz apenas a primeira aba da
 * demonstração: as outras quatro aparecem ao clicar. O ensaio deste script
 * mostrou esse furo na hora, e a saída óbvia - varrer também o JavaScript -
 * não serve: `audioAvailable()` é chamada de função sobre um array importado, e
 * o empacotador não dobra isso, então os DOIS lados de cada
 * `TEM_AUDIO ? a : b` sobrevivem no arquivo final. (Tentei trocar por um
 * booleano literal gerado; também não dobrou.) Uma string morta no JavaScript
 * minificado não é oferta - ninguém a vê -, mas um script que não distingue
 * morta de viva acusa sempre, e um verificador que acusa sempre é um
 * verificador que alguém desliga.
 *
 * Então a divisão é: aqui se prova o que a página MOSTRA, contra o artefato
 * publicado; e `tests/vitrine.test.ts` cobre o texto das cinco abas e dos
 * passos do método, lendo os mesmos arrays que a página renderiza.
 *
 * ── quando as gravações entrarem ─────────────────────────────────────────
 * Nada a fazer aqui. O manifesto deixa de estar vazio, este script para de
 * cobrar, e as frases voltam sozinhas porque são condicionais. É de propósito
 * que a regra seja "o manifesto manda", e não uma lista de exceções.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT = 'out';
if (!existsSync(OUT)) {
  console.error('out/ não existe. Rode a build antes:  npm run build && node promessas.mjs');
  process.exit(1);
}

/* ── existe gravação? ─────────────────────────────────────────────────────
   Lido do mesmo arquivo gerado que o app lê (src/lib/audio-manifest.ts), e
   não de uma contagem de arquivos em public/audio: é o manifesto que decide o
   comportamento do curso, então é ele que tem de decidir o do teste. */
const manifesto = readFileSync(new URL('./src/lib/audio-manifest.ts', import.meta.url), 'utf8');
const TEM_AUDIO = !/AUDIO_MANIFEST:\s*readonly string\[\]\s*=\s*\[\s*\]/.test(manifesto);

/* ── as promessas ─────────────────────────────────────────────────────────
   Trechos que só podem estar no ar quando há gravação. Deliberadamente
   incluem o texto do herói e da demonstração, que foram os que erraram. */
const PROMESSAS = [
  'gravado por falante nativo',
  'gravada por falante nativo',
  'Reproduzir áudio',
  'Qual som você ouviu',
  'escuta e leitura',
  'Cinco tipos de exercício'
];

/* As rotas pagas não entram: o HTML delas só sai para quem já comprou, e não
   é vitrine. Quem decide é a mesma lista do portão, lida dele. */
const gateJs = readFileSync(new URL('../worker/src/gate.js', import.meta.url), 'utf8');
const GATED = [...gateJs.matchAll(/'(\/[a-z-]+)'/g)].map(m => m[1]);
const pago = rota => GATED.some(g => rota === g || rota.startsWith(g + '/'));

function arquivos(dir) {
  const out = [];
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) out.push(...arquivos(p));
    else out.push(p);
  }
  return out;
}

const rotaDe = p => {
  const r = '/' + relative(OUT, p).replace(/\/?index\.(html|txt)$/, '').replace(/\.html$/, '');
  return r.replace(/\/+$/, '') || '/';
};

const todos = arquivos(OUT);

const paginas = todos
  .filter(p => /\/index\.(html|txt)$/.test(p) || /\.html$/.test(p))
  .filter(p => !pago(rotaDe(p)));

console.log('─'.repeat(66));
console.log(`gravações: ${TEM_AUDIO ? 'existem' : 'NENHUMA'} · `
  + `páginas livres conferidas: ${paginas.length}`);
console.log('─'.repeat(66));

/* ── marcação crua na vitrine ─────────────────────────────────────────────
   Os textos de data/*.json marcam hebraico como {{...}}, e só o componente
   <Prose> transforma isso em texto. A página do curso mostrou `{{בּ}} ·
   {{כּ}} · {{פּ}}` para quem ia comprar porque renderizava a string crua
   (auditoria de 28/09/2026, UX-001). Conta só o texto VISÍVEL: dentro dos
   <script> de dados da página as chaves são normais. */
const cruas = [];
for (const p of paginas.filter(p => p.endsWith('.html'))) {
  let html;
  try { html = readFileSync(p, 'utf8'); } catch { continue; }
  const visivel = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  const m = visivel.match(/\{\{[^}]{0,40}\}\}/);
  if (m) cruas.push({ onde: rotaDe(p), trecho: m[0] });
}
if (cruas.length) {
  console.error(`\n✗ ${cruas.length} página(s) livre(s) mostram marcação crua de hebraico:\n`);
  for (const c of cruas) console.error(`   ${c.onde.padEnd(46)} ${c.trecho}`);
  console.error('\nUse <Prose text={...} /> (components/hebrew/Prose.tsx) em vez da string.');
  console.error('─'.repeat(66));
  process.exit(1);
}
console.log('✓ nenhuma página livre mostra {{...}} cru.');

/* ── a ordem das letras é do método, não do professor ────────────────────
   Decisão do dono (01/10/2026): a ordem em que as letras entram vem do
   método do Dr. Damián; são adaptação do Moshik os exercícios, as
   explicações para quem fala português e a cursiva. A única frase sobre a
   ordem mora em lib/credito.ts (`adaptacoesPt`). Em 01/10 /sobre dizia, ao
   lado dela, que "a sequência em que as letras entram" foi organizada pelo
   Moshik (auditoria, CONV-004). Duas cercas:
     · na FONTE (app/src e data/, sem comentários), nenhuma string fala em
       "sequência/ordem das letras" fora de lib/credito.ts;
     · no HTML publicado, toda frase visível que fala da ordem das letras
       atribui ao método ("vem do método"). */
const ORDEM = /(sequ[eê]ncia|ordem)\s+(das|em que as)\s+letras/i;
const semComentarios = s => s
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
const fontes = [
  ...arquivos(new URL('./src', import.meta.url).pathname).filter(p => /\.(tsx?|mjs)$/.test(p)),
  ...arquivos(new URL('../data', import.meta.url).pathname).filter(p => p.endsWith('.json'))
].filter(p => !p.endsWith('/lib/credito.ts'));
const ordemNaFonte = [];
for (const p of fontes) {
  let s = readFileSync(p, 'utf8');
  if (p.endsWith('.json')) {
    /* Nos JSON, as chaves "_", "note" e "notes" são notas internas do
       arquivo: não vão à tela. */
    const NOTAS = new Set(['_', 'note', 'notes', 'nota', 'notaInterna']);
    try {
      s = JSON.stringify(JSON.parse(s), (k, v) => (NOTAS.has(k) ? undefined : v));
    } catch { /* fica cru */ }
  } else s = semComentarios(s);
  const m = s.match(ORDEM);
  if (m) ordemNaFonte.push(`${relative(new URL('..', import.meta.url).pathname, p)}: "${m[0]}"`);
}
const ordemNoHtml = [];
for (const p of paginas.filter(p => p.endsWith('.html'))) {
  let html;
  try { html = readFileSync(p, 'utf8'); } catch { continue; }
  const visivel = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  for (const frase of visivel.split(/(?<=[.!?])\s+/)) {
    if (ORDEM.test(frase) && !/vem do método/i.test(frase)) {
      ordemNoHtml.push(`${rotaDe(p)}: "${frase.trim().slice(0, 120)}"`);
    }
  }
}
if (ordemNaFonte.length || ordemNoHtml.length) {
  console.error('\n✗ a ordem das letras aparece fora de lib/credito.ts, ou atribuída a outro que não o método:\n');
  for (const x of [...ordemNaFonte, ...ordemNoHtml]) console.error(`   ${x}`);
  console.error('\nA ordem das letras vem do método do Dr. Damián (decisão do dono, 01/10/2026).');
  console.error('Use METODO_ORIGINAL.adaptacoesPt (lib/credito.ts) e nada mais.');
  console.error('─'.repeat(66));
  process.exit(1);
}
console.log('✓ a ordem das letras só aparece como do método (lib/credito.ts).');

/* ── o contrário: com gravação, nenhuma página pode NEGÁ-LA ─────────────
   Em 28/09/2026 a FAQ dizia "sintetizador do próprio navegador, com voz de
   espanhol latino" com 526 gravações no ar - um texto fixo herdado do curso
   de espanhol, que este script não via porque só cobrava o lado da promessa
   (auditoria, COM-003). Prometer a menos custa a venda. */
const NEGACOES = [
  'sintetizador',
  'voz sintética',
  'espanhol latino',
  'gravações estão em produção',
  'gravações com falante nativo estão planejadas'
];

if (TEM_AUDIO) {
  const negadas = [];
  for (const p of paginas) {
    let texto;
    try { texto = readFileSync(p, 'utf8'); } catch { continue; }
    for (const frase of NEGACOES) if (texto.includes(frase)) negadas.push({ onde: rotaDe(p), frase });
  }
  if (negadas.length) {
    console.error(`\n✗ ${negadas.length} página(s) negam o áudio que o curso TEM:\n`);
    for (const a of negadas) console.error(`   ${a.onde.padEnd(46)} "${a.frase}"`);
    console.error('\nO manifesto tem gravação. Cada frase sobre áudio tem de sair dele');
    console.error('(ver components/landing/copy.ts e app/faq/page.tsx).');
    console.error('─'.repeat(66));
    process.exit(1);
  }
  console.log('✓ o manifesto tem gravação: a vitrine pode prometer áudio,');
  console.log('  e nenhuma página livre diz que ele é sintetizado ou que não existe.');
  process.exit(0);
}

const achados = [];
const varrer = (lista, onde) => {
  for (const p of lista) {
    let texto;
    try { texto = readFileSync(p, 'utf8'); } catch { continue; }
    for (const frase of PROMESSAS) {
      if (texto.includes(frase)) achados.push({ onde: onde(p), frase });
    }
  }
};
varrer(paginas, rotaDe);

if (!achados.length) {
  console.log('✓ nenhuma página livre promete gravação que não existe.');
  console.log('  (o texto das abas fechadas é coberto por tests/vitrine.test.ts)');
  console.log('─'.repeat(66));
  process.exit(0);
}

console.error(`\n✗ ${achados.length} promessa(s) de áudio no ar, sem nenhuma gravação:\n`);
for (const a of achados) console.error(`   ${a.onde.padEnd(46)} "${a.frase}"`);
console.error('\nO manifesto de áudio está vazio: o curso desliga os exercícios de');
console.error('escuta e mostra "áudio em breve". A vitrine tem de dizer a mesma coisa.');
console.error('Cada frase sobre gravação tem duas versões, escolhidas por');
console.error('`audioAvailable()` - ver components/landing/Fecho.tsx.');
console.error('─'.repeat(66));
process.exit(1);
