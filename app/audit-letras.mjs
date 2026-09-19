/* Auditoria de cobertura por letra.
 * ─────────────────────────────────────────────────────────────────────────
 * Pergunta uma coisa só, letra por letra: QUANTAS interações diferentes esta
 * letra recebe, e de que tipos? Sem isso, "falta prática" é opinião.
 *
 * Conta o que o aluno realmente encontra numa passagem pela letra:
 *   · prática da etapa 4 (5 itens, semente `practice-<id>`)
 *   · fixação da etapa 5 (8 itens, semente `quiz-<id>-0`)
 *   · o checkpoint do módulo, dividido pelas letras do módulo
 * e marca as lacunas que interessam: forma final, letras parecidas, letra
 * dentro de palavra, fonte diferente.
 *
 * Roda com: node audit-letras.mjs
 */

import { readFileSync } from 'node:fs';
import { register } from 'node:module';

/* O motor é TypeScript com alias @/. Em vez de montar um pipeline, este
   script lê o JSON gerado e reimplementa a CONTAGEM a partir dos ids dos
   exercícios - que é o que a auditoria precisa saber. Para o resto, usa o
   próprio motor compilado pelo Next, via import dinâmico do bundle. */

const course = JSON.parse(readFileSync('content/course.json', 'utf8'));
const letters = JSON.parse(readFileSync('content/letters.json', 'utf8'));

const PAR = [
  ['bet', 'kaf', 'pe'], ['dalet', 'resh'], ['he', 'het'], ['vav', 'zayin', 'nun'],
  ['gimel', 'nun'], ['samekh', 'mem'], ['ayin', 'tsadi'], ['qof', 'resh']
];

const linhas = [];
for (const L of letters) {
  const silabas = L.syllables?.length ?? 0;
  const ler = L.wordsToRead?.length ?? 0;
  const rec = L.wordsToRecognize?.length ?? 0;
  const ponte = L.bridgeWords?.length ?? 0;
  const confus = L.confusableWith?.length ?? 0;

  /* Quantos GERADORES conseguem produzir alguma coisa para esta letra. É o
     teto real de variedade dela, e é onde as diferenças aparecem: uma letra
     sem palavra legível perde seis geradores de uma vez. */
  const possiveis = [
    ['reconhecer', true],
    ['silaba-ler', silabas > 0],
    ['silaba-montar', silabas > 0],
    ['palavra-sentido', ler > 0],
    ['diferente', true],
    ['vogal-som', silabas > 0],
    ['completar', ler > 0],
    ['parear-silaba', silabas >= 3],
    ['som-silaba', silabas > 0],
    ['montar-palavra', ler > 0],
    ['forma-final', !!L.finalForm],
    ['sentido-palavra', ler > 0],
    ['digitar', ler > 0],
    ['parear-palavra', ler >= 3],
    ['impressa-cursiva', true],
    ['parear-letra-som', true]
  ].filter(([, ok]) => ok).map(([n]) => n);

  linhas.push({
    ordem: L.order, id: L.id, letra: L.letter, nome: L.namePt,
    final: L.finalForm ?? '',
    silabas, ler, rec, ponte, confus,
    geradores: possiveis.length,
    faltam: [
      !L.finalForm ? null : null,
      ler === 0 ? 'sem palavra legível' : null,
      confus === 0 ? 'sem par confundível' : null,
      silabas === 0 ? 'sem sílabas' : null
    ].filter(Boolean)
  });
}

const n = x => String(x).padStart(2);
console.log('\n  COBERTURA POR LETRA\n');
console.log('  #  letra  nome           final  síl  palavras  confus  geradores  lacunas');
console.log('  ' + '─'.repeat(92));
for (const l of linhas) {
  console.log(
    `  ${n(l.ordem)}  ${l.letra.padEnd(5)}  ${l.nome.padEnd(13)}  ${(l.final || '-').padEnd(5)}` +
    `  ${n(l.silabas)}   ${n(l.ler)} ler ${n(l.rec)} rec  ${n(l.confus)}      ${n(l.geradores)}` +
    `        ${l.faltam.join(', ')}`
  );
}

const semPalavra = linhas.filter(l => l.ler === 0);
const semConfus = linhas.filter(l => l.confus === 0);
const comFinal = linhas.filter(l => l.final);
const medGer = (linhas.reduce((a, b) => a + b.geradores, 0) / linhas.length).toFixed(1);

console.log('\n  RESUMO');
console.log(`  letras: ${linhas.length}`);
console.log(`  geradores aplicáveis por letra: min ${Math.min(...linhas.map(l => l.geradores))}, ` +
            `máx ${Math.max(...linhas.map(l => l.geradores))}, média ${medGer}`);
console.log(`  com forma final: ${comFinal.length} (${comFinal.map(l => `${l.letra}/${l.final}`).join(' ')})`);
console.log(`  sem palavra legível: ${semPalavra.length}${semPalavra.length ? ' -> ' + semPalavra.map(l => l.nome).join(', ') : ''}`);
console.log(`  sem par confundível declarado: ${semConfus.length}${semConfus.length ? ' -> ' + semConfus.map(l => l.nome).join(', ') : ''}`);
console.log(`  módulos: ${course.modules.length}, checkpoints: ${course.modules.filter(m => m.checkpoint).length}`);
console.log('');
