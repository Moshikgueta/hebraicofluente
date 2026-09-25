/* As palavras novas dos mini-textos entram no vocabulário do aluno depois
   que ele lê o texto (responde as perguntas) - e só as que são palavra: nem
   o prefixo solto (הַ־) nem o nome próprio (Dana). */

import { describe, expect, it } from 'vitest';
import { allLetters, textosDoCurso } from '../src/lib/content';
import { palavrasDoTexto, textoLidoId } from '../src/lib/engine/textos';
import { palavrasParaEscrever } from '../src/lib/engine/palavras';
import { leituraDe, palavrasDosTextosLidos } from '../src/lib/leitura';
import { rng } from '../src/lib/engine/rng';
import { EMPTY_STATE, type LearnerState } from '../src/lib/state/types';

const letters = allLetters();
const tudoFeito = (firsts: Record<string, string> = {}): LearnerState => ({
  ...EMPTY_STATE,
  firsts,
  lessons: Object.fromEntries(letters.map(l => [l.id, {
    letterId: l.id, stagesDone: [1, 2, 3, 4, 5], quizBest: 0.9, quizAttempts: 1,
    perfectBonusPaid: false, completedAt: '2026-09-25T10:00:00.000Z'
  }]))
});
const texto3 = () => textosDoCurso().find(t => t.modulo === 3)!;

describe('as palavras dos mini-textos no vocabulário', () => {
  it('deixam de fora o prefixo solto e o nome próprio, e tiram a pontuação', () => {
    const todas = textosDoCurso().flatMap(palavrasDoTexto);
    expect(todas.some(w => w.he.includes('־'))).toBe(false);
    expect(todas.some(w => /\(nome\)/.test(w.pt))).toBe(false);
    expect(todas.some(w => /[?!.,:]$/.test(w.he))).toBe(false);
    expect(palavrasDoTexto(texto3()).map(w => w.pt)).toEqual(['quente', 'dorme, está dormindo']);
  });

  it('só entram depois que o texto foi lido', () => {
    const antes = leituraDe(tudoFeito()).legiveis.map(w => w.he);
    const depois = leituraDe(tudoFeito({ [textoLidoId(3)]: '2026-09-25T11:00:00.000Z' })).legiveis.map(w => w.he);
    expect(antes).not.toContain('חַם');
    expect(depois).toContain('חַם');
    expect(depois.length).toBeGreaterThan(antes.length);
  });

  it('entram também no treino de palavras à mão', () => {
    const lido = tudoFeito({ [textoLidoId(3)]: '2026-09-25T11:00:00.000Z' });
    const extras = palavrasDosTextosLidos(lido);
    const sorteadas = palavrasParaEscrever(letters, rng('x'), 1000, extras).map(w => w.he);
    expect(sorteadas).toContain('יָשֵׁן');
  });

  it('uma palavra que a lição já ensinou não aparece duas vezes', () => {
    const todosLidos = Object.fromEntries(textosDoCurso().map(t => [textoLidoId(t.modulo), 'x']));
    const hes = leituraDe(tudoFeito(todosLidos)).legiveis.map(w => w.he);
    expect(new Set(hes).size).toBe(hes.length);
  });
});
