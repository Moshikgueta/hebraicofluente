/* A conta de "você já consegue ler N palavras", sem nada de tela.
 * ─────────────────────────────────────────────────────────────────────────
 * Separada do hook (lib/vocabulario.ts) para poder ser testada e usada na
 * simulação do curso inteiro sem React. A regra está explicada lá.
 */

import { allLetters, textosDoCurso, type Letter } from '@/lib/content';
import { palavrasDoTexto, textoLidoId } from '@/lib/engine/textos';
import { clean } from '@/lib/hebrew';
import { isLessonComplete } from '@/lib/state/rules';
import type { LearnerState } from '@/lib/state/types';
import {
  alfabetoDe, palavrasLegiveis, vocabularioDoCurso, type PalavraDoCurso
} from '@/lib/engine/palavras';

/** As letras cuja lição o aluno terminou - as cinco etapas. */
export function letrasConcluidas(state: LearnerState, letras: readonly Letter[] = allLetters()): Letter[] {
  return letras.filter(l => isLessonComplete(state, l.id));
}

export type Leitura = {
  /** As palavras que ele lê hoje, na ordem em que o curso as apresentou. */
  legiveis: PalavraDoCurso[];
  /** Quantas o curso tem ao todo. Mostrado só como número, nunca a lista. */
  total: number;
  letras: Letter[];
  alfabeto: string[];
};

/**
 * As palavras novas dos mini-textos que o aluno já leu (respondeu as
 * perguntas). Entram no vocabulário DEPOIS das palavras das lições, e só uma
 * vez cada: a que a lição já ensinou fica com a entrada da lição.
 */
export function palavrasDosTextosLidos(state: LearnerState): PalavraDoCurso[] {
  return textosDoCurso()
    .filter(t => state.firsts[textoLidoId(t.modulo)])
    .flatMap(t => palavrasDoTexto(t).map(w => ({ ...w, desde: 100 + t.modulo })));
}

function comTextos(vocab: PalavraDoCurso[], state: LearnerState): PalavraDoCurso[] {
  const visto = new Set(vocab.map(w => clean(w.he)));
  const extras = palavrasDosTextosLidos(state).filter(w => {
    const k = clean(w.he);
    if (visto.has(k)) return false;
    visto.add(k);
    return true;
  });
  return [...vocab, ...extras];
}

export function leituraDe(state: LearnerState): Leitura {
  const todas = allLetters();
  const letras = letrasConcluidas(state, todas);
  const alfabeto = alfabetoDe(letras);
  const vocab = comTextos(vocabularioDoCurso(todas), state);
  return { legiveis: palavrasLegiveis(vocab, alfabeto), total: vocab.length, letras, alfabeto };
}

/** Quantas palavras NOVAS uma letra acrescentou, para o fim da lição. */
export function novasCom(state: LearnerState, letra: Letter): number {
  const todas = allLetters();
  const antes = letrasConcluidas(state, todas).filter(l => l.id !== letra.id);
  const vocab = vocabularioDoCurso(todas);
  const semEla = palavrasLegiveis(vocab, alfabetoDe(antes)).length;
  const comEla = palavrasLegiveis(vocab, alfabetoDe([...antes, letra])).length;
  return comEla - semEla;
}

