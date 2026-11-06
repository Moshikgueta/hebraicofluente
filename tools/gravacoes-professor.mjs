/* Todas as gravações do professor, num lugar só (11/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Duas fontes:
 *   · data/gravacoes-professor.json - as explicações escritas uma a uma, com
 *     roteiro próprio (a leitura da direita para a esquerda, o ם e o ן...);
 *   · as que existem para TODA letra e TODO módulo, geradas aqui a partir do
 *     conteúdo: a abertura de cada módulo, a apresentação de cada letra, o
 *     erro comum de cada letra e a mensagem do fim do desafio final. Geradas
 *     para que uma letra nova ganhe o seu lugar sem ninguém lembrar de
 *     escrevê-lo, e para que o roteiro saia do texto que a lição já mostra.
 *
 * Quem lê: tools/gen-audio.mjs (o catálogo e o painel /admin/gravar) e
 * tools/export-content.mjs (app/content/professor.json, o que a tela usa).
 * Sem gravação, a tela não mostra nada (GravacaoDoProfessor.tsx).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const semChaves = (s) => String(s ?? '').replace(/\{\{|\}\}/g, '');

export function gravacoesDoProfessor(ROOT) {
  const ler = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
  const escritas = ler('data/gravacoes-professor.json').gravacoes;
  const letras = [...ler('data/letters.json')].sort((a, b) => a.order - b.order);
  const modulos = ler('data/modules.json').modules;

  const geradas = [];
  for (const m of modulos) {
    geradas.push({
      id: `module-${m.n}-welcome`,
      tituloPt: 'Uma mensagem do seu professor',
      ondePt: `Módulo ${m.n} · abertura`,
      roteiroPt: `Dê as boas-vindas ao módulo ${m.n}, "${m.titlePt}". Em duas ou três frases, diga o que o aluno `
        + `vai conseguir fazer no fim dele: ${semChaves(m.milestonePt)}`
    });
  }
  for (const L of letras) {
    const palavra = L.wordsToRead?.[0];
    geradas.push({
      id: `letter-${L.id}-intro`,
      tituloPt: `Conheça a letra ${L.namePt} com seu professor`,
      ondePt: `Lição do ${L.letter} · Conhecer`,
      roteiroPt: `Apresente a letra ${L.namePt} (${L.letter}): o nome, o som e como ela aparece na palavra`
        + (palavra ? `, com o exemplo ${palavra.he} (${palavra.translit}, ${palavra.pt})` : '')
        + '. Menos de um minuto.'
    });
    if (L.brazilianMistake) {
      const b = L.brazilianMistake;
      geradas.push({
        id: `letter-${L.id}-common-mistake`,
        tituloPt: 'O erro mais comum, explicado pelo professor',
        ondePt: `Lição do ${L.letter} · quadro do erro comum`,
        roteiroPt: `Explique o erro que o brasileiro costuma cometer: ${semChaves(b.wrong)} `
          + `O certo: ${semChaves(b.right)} Por quê: ${semChaves(b.why)} Diga os exemplos em hebraico em voz alta.`
      });
    }
  }
  geradas.push({
    id: 'final-exam-congrats',
    tituloPt: 'Uma mensagem do professor',
    ondePt: 'Desafio final · resultado aprovado',
    roteiroPt: 'Parabenize o aluno por passar no desafio final do alfabeto. Diga o que ele já consegue ler e qual é o '
      + 'próximo passo. Não fale em nível oficial nem em certificação: o certificado do curso não é um diploma.'
  });

  const todas = [...escritas, ...geradas];
  const ids = new Set();
  for (const g of todas) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(g.id) || ids.has(g.id)) {
      throw new Error(`gravações do professor: id inválido ou repetido: ${g.id}`);
    }
    ids.add(g.id);
    if (!g.tituloPt || !g.ondePt || !g.roteiroPt) throw new Error(`gravações do professor: ${g.id} sem título, lugar ou roteiro`);
  }
  return todas;
}
