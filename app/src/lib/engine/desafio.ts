/* O desafio do dia (28/10/2026, master prompt 3.0, parte 6.3).
 * ─────────────────────────────────────────────────────────────────────────
 * Cinco perguntas, uns três minutos, opcional. Sai dos exercícios que já
 * existem (`buildLetterPractice`), de letras que o aluno já começou, com
 * preferência pelas que andam custando (`weakLetters`). A semente é o DIA:
 * o desafio é o mesmo o dia inteiro, em qualquer aparelho, e muda amanhã.
 *
 * Nada aqui pune: não fazer o desafio não tira sequência, XP nem nada. Feito,
 * ele fica como um treino da academia (`finishGym` com DESAFIO_ID), e o
 * "feito hoje" é o `lastOn` desse registro, que já é fundido entre aparelhos.
 */

import type { Letter } from '@/lib/content';
import { buildLetterPractice } from './exercises';
import { rng, shuffled } from './rng';
import type { Exercise } from './types';

import { DESAFIO_ID } from '@/lib/desafio-feito';
export { DESAFIO_ID, desafioFeitoHoje } from '@/lib/desafio-feito';
export const DESAFIO_PERGUNTAS = 5;

/** Os tipos que pedem só tocar numa resposta: o desafio é para ser rápido. */
const RAPIDOS = new Set<Exercise['kind']>([
  'letter-recognition', 'final-form', 'print-vs-cursive', 'syllable-reading', 'word-meaning',
  'meaning-to-word', 'image-to-word', 'vowel-sound', 'odd-one-out', 'letter-in-word',
  'complete-word', 'audio-recognition'
]);

export function desafioDoDia(
  comecadas: readonly Letter[], fracas: readonly string[], dia: string, audioAvailable: boolean
): Exercise[] {
  if (!comecadas.length) return [];
  const rand = rng(`${DESAFIO_ID}-${dia}`);
  const porOrdem = [...comecadas].sort((a, b) => a.order - b.order);
  /* As que custam primeiro, depois as outras embaralhadas pelo dia. */
  const alvo = [
    ...porOrdem.filter(l => fracas.includes(l.id)),
    ...shuffled(porOrdem.filter(l => !fracas.includes(l.id)), rand)
  ];
  const out: Exercise[] = [];
  const vistos = new Set<string>();
  for (let volta = 0; volta < 6 && out.length < DESAFIO_PERGUNTAS; volta++) {
    for (const L of alvo) {
      if (out.length >= DESAFIO_PERGUNTAS) break;
      const hist = porOrdem.filter(l => l.order <= L.order);
      const opcoes = shuffled(
        buildLetterPractice(L, hist, { audioAvailable, seed: `${DESAFIO_ID}-${dia}-${L.id}-${volta}` })
          /* Na primeira volta, um tipo por letra; depois, só não repete a
             mesma pergunta (quem tem uma letra só ainda fecha as cinco). */
          .filter(e => RAPIDOS.has(e.kind) && !vistos.has(volta === 0 ? e.kind + e.letterId : e.id)),
        rand
      );
      const e = opcoes[0];
      if (e) {
        out.push({ ...e, id: `${DESAFIO_ID}-${dia}-${out.length}-${e.id}` });
        vistos.add(e.kind + e.letterId); vistos.add(e.id);
      }
    }
  }
  return out;
}
