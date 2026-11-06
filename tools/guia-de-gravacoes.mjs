/* O guia de gravações do professor, para imprimir ou abrir no telefone.
 *
 *   node tools/guia-de-gravacoes.mjs [saida.md]
 *
 * Lista toda gravação do professor (tools/gravacoes-professor.mjs) com o
 * nome de arquivo sugerido, o lugar no curso, o roteiro, a duração sugerida
 * e o número no painel /admin/gravar, onde a gravação é feita ou enviada.
 * O que já foi gravado não sai daqui: o painel é quem sabe, e é lá que se
 * vê o que falta. */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gravacoesDoProfessor } from './gravacoes-professor.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const catalogo = JSON.parse(readFileSync(join(ROOT, 'data/audio.json'), 'utf8')).clips;
const porChave = new Map(catalogo.map(c => [c.he, c]));

const DURACAO = [
  [/^module-\d+-welcome$/, '20 a 40 s'],
  [/^letter-[a-z]+-intro$/, '30 a 50 s'],
  [/^letter-[a-z]+-common-mistake$/, '30 a 60 s'],
  [/^final-exam-congrats$/, '20 a 40 s']
];
const duracao = id => DURACAO.find(([re]) => re.test(id))?.[1] ?? '30 a 60 s';

const GRUPOS = [
  ['Explicações escritas uma a uma', g => !/^(module-|letter-[a-z]+-(intro|common-mistake)$|final-exam-congrats$)/.test(g.id)],
  ['Abertura de cada módulo', g => /^module-/.test(g.id)],
  ['Apresentação de cada letra', g => /-intro$/.test(g.id) && g.id.startsWith('letter-')],
  ['O erro comum de cada letra', g => /-common-mistake$/.test(g.id)],
  ['Fim do desafio final', g => g.id === 'final-exam-congrats']
];

const todas = gravacoesDoProfessor(ROOT);
const linhas = [
  '# Guia de gravações do professor',
  '',
  `Total: ${todas.length} gravações. Grave ou envie cada uma no painel /admin/gravar, pelo número.`,
  'Enquanto uma gravação não existe, o aluno não vê nada no lugar dela.',
  ''
];
for (const [titulo, filtro] of GRUPOS) {
  const gs = todas.filter(filtro);
  if (!gs.length) continue;
  linhas.push(`## ${titulo} (${gs.length})`, '');
  for (const g of gs) {
    const c = porChave.get(`professor ${g.id}`);
    linhas.push(
      `### ${c ? `nº ${c.num} · ` : ''}professor-${g.id}.mp3`,
      '',
      `- **Onde:** ${g.ondePt}`,
      `- **Título na tela:** ${g.tituloPt}`,
      `- **Duração sugerida:** ${duracao(g.id)}`,
      `- **O que dizer:** ${g.roteiroPt}`,
      ''
    );
  }
}

const md = linhas.join('\n');
const saida = process.argv[2];
if (saida) { writeFileSync(saida, md); console.log(`${todas.length} gravações → ${saida}`); }
else process.stdout.write(md);
