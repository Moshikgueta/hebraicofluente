/* Os números que o site ANUNCIA batem com o curso que existe?
   ─────────────────────────────────────────────────────────────────────────
   Este arquivo nasceu de um defeito que passou por testes, build, duas
   revisões e um deploy: a capa dizia "21 lições" e o FAQ dizia "São 22
   lições". Ninguém escreveu 22 à mão - o FAQ usava `course.totalLetters`
   achando que era a contagem de lições. São 22 letras e 21 lições, duas
   grandezas diferentes e por azar parecidas, e o erro ficou no ar.

   Nenhum teste de unidade pegaria isso: cada arquivo estava internamente
   coerente. O defeito só existe quando se olham DUAS PÁGINAS JUNTAS, que é
   o que um comprador faz.

   Então a verificação é sobre o HTML publicado: varre todas as páginas
   livres, colhe cada "N lições", "N letras", "N módulos" e exige que N seja
   o número do course.json. Um número que o site anuncia e o curso não
   entrega é oferta que não bate com o produto.

   Pelo mesmo motivo, e desde que a taxa do cartão passou a ser repassada ao
   comprador, ele também recusa "Nx de R$ …" e "sem juros" em qualquer
   página da vitrine: são condições de pagamento que o checkout não dá.

   Precisa do `out/` construído. node numeros.mjs (de dentro de app/). */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const curso = JSON.parse(readFileSync(new URL('./content/course.json', import.meta.url), 'utf8'));

const TOTAL = {
  licoes: curso.modules.reduce((n, m) => n + m.lessons.length, 0),
  letras: curso.letters.length,
  modulos: curso.modules.length
};

/* As contagens de UM módulo, que a vitrine mostra de propósito ("Módulo 05 ·
   7 lições"). Uma delas pode coincidir com o total de outra unidade - desde
   26/09/2026 o módulo 5 tem 7 lições, e o curso tem 7 módulos - sem ser o
   defeito que a segunda regra procura. O defeito ("22 lições") nunca é a
   contagem de um módulo. */
const PARCIAIS = {
  licoes: new Set(curso.modules.map(m => m.lessons.length)),
  letras: new Set(curso.modules.map(m => curso.letters.filter(l => l.module === m.n).length)),
  modulos: new Set()
};

const UNIDADE = {
  'lições': 'licoes', 'lição': 'licoes',
  'letras': 'letras', 'letra': 'letras',
  'módulos': 'modulos', 'módulo': 'modulos'
};

/* Duas regras, e as duas foram escolhidas para não gritar à toa.
 *
 *   MAIOR QUE O TOTAL   "23 letras" não existe em lugar nenhum. É promessa
 *                       de mais do que o curso entrega, sempre erro.
 *   TROCA DE GRANDEZA   o número é MENOR que o total desta unidade - o que
 *                       normalmente é uma contagem parcial legítima, como
 *                       "3 lições" de um módulo - MAS é exatamente o total
 *                       de OUTRA unidade. É a assinatura do defeito real:
 *                       "22 lições" onde 22 é a contagem de letras.
 *
 * Um número menor que não bate com nenhum outro total é contagem parcial e
 * passa. É por isso que "6 letras" de um módulo não aparece aqui.
 */
function julgar(n, unidade) {
  const total = TOTAL[unidade];
  if (n > total) return `promete mais do que existe (${total})`;
  if (n === total) return null;
  if (PARCIAIS[unidade].has(n)) return null;
  for (const [outra, valor] of Object.entries(TOTAL)) {
    if (outra !== unidade && n === valor) {
      return `é o total de ${outra} (${valor}), não de ${unidade} (${total})`;
    }
  }
  return null;
}

/* As páginas PAGAS falam do pedaço que o aluno está vendo ("3 lições",
   "6 letras" dentro de um módulo), e ali um número menor é correto. A
   verificação é da VITRINE: o que se promete a quem ainda não comprou. */
const LIVRES = new Set([
  '/', '/metodo/', '/cursos/', '/cursos/alfabetizacao/', '/sobre/', '/faq/',
  '/biblia/', '/termos/', '/privacidade/', '/reembolso/', '/suporte/',
  '/checkout/alfabetizacao/'
]);

function paginas(dir, base = '') {
  const achadas = [];
  for (const nome of readdirSync(dir)) {
    const cheio = join(dir, nome);
    if (statSync(cheio).isDirectory()) achadas.push(...paginas(cheio, `${base}/${nome}`));
    else if (nome === 'index.html') achadas.push([`${base}/`, cheio]);
  }
  return achadas;
}

/* Só o texto: um "22" dentro de um atributo ou de um script não é uma
   promessa lida por ninguém. */
const texto = html => html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z]+;|&#\d+;/g, ' ');

const problemas = [];
let conferidas = 0;

for (const [rota, arquivo] of paginas('out').sort()) {
  if (!LIVRES.has(rota)) continue;
  conferidas++;
  const t = texto(readFileSync(arquivo, 'utf8'));
  const vistos = new Map();

  for (const [, n, palavra] of t.matchAll(/(\d+)\s+(lições|lição|letras|letra|módulos|módulo)\b/g)) {
    const chave = `${n} ${palavra}`;
    if (vistos.has(chave)) continue;
    vistos.set(chave, true);
    const queixa = julgar(Number(n), UNIDADE[palavra]);
    if (queixa) problemas.push(`${rota.padEnd(28)} diz "${chave}", que ${queixa}`);
  }

  /* A segunda regra: o valor da parcela.
     ─────────────────────────────────────────────────────────────────────
     A taxa do cartão é repassada ao comprador, então o valor de cada
     parcela é fechado pela operadora no momento da compra - não pelo
     preço dividido por doze. Uma página que escreve "12x de R$ 12,25" ou
     "sem juros" está anunciando uma condição que o checkout não dá, e é a
     página lida logo antes de decidir.

     `parcelasMax` em lib/catalog.ts já não devolve o valor, então o
     defeito só pode voltar por uma conta refeita à mão. É essa que a regra
     aqui pega - no HTML publicado, que é o que o comprador lê. */
  for (const [trecho] of t.matchAll(/\d+\s*[x×]\s*de\s*R\$/gi)) {
    problemas.push(`${rota.padEnd(28)} anuncia o valor da parcela ("${trecho.trim()}…")`);
  }
  for (const [trecho] of t.matchAll(/sem\s+juros/gi)) {
    problemas.push(`${rota.padEnd(28)} promete "${trecho.trim()}", e os juros são repassados`);
  }

  const lista = [...vistos.keys()].join(' · ');
  console.log(`  ${rota.padEnd(28)} ${lista || '(nenhum número)'}`);
}

console.log('\n──────────────────────────────────────────────────────────────────');
console.log(`páginas livres conferidas: ${conferidas} · lições ${TOTAL.licoes} · ` +
            `letras ${TOTAL.letras} · módulos ${TOTAL.modulos}`);
console.log('──────────────────────────────────────────────────────────────────');

if (problemas.length) {
  for (const p of problemas) console.log(`✗ ${p}`);
  console.log('\nA vitrine anuncia um número que o curso não entrega.');
  process.exit(1);
}
console.log('✓ todo número anunciado na vitrine bate com o course.json');
console.log('✓ nenhuma página anuncia o valor da parcela nem "sem juros"');
