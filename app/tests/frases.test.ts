/* A frase inteira - o item que o curso não tinha.
 * ─────────────────────────────────────────────────────────────────────────
 * A auditoria pedagógica mediu: o item mais longo do curso eram duas
 * palavras, e um aluno chegava ao fim com 22 letras, 99 palavras soltas e
 * nenhuma linha lida. "Ler frases básicas" estava marcado NÃO ALCANÇADO.
 *
 * O que estes casos travam não é a existência das frases - isso o
 * `validate.js` já faz, com a V20 calculando a ordem de cada uma. É o
 * COMPORTAMENTO do exercício, que é onde as decisões pedagógicas moram:
 *
 *   · uma frase nunca aparece antes das letras que ela usa;
 *   · a transliteração não está na tela, só na explicação;
 *   · os distratores são significados de outras frases, nunca inventados;
 *   · a frase recém-destravada vem primeiro.
 */

import { describe, expect, it } from 'vitest';
import { exSentenceReading, type Ctx } from '@/lib/engine/generators';
import type { Exercise } from '@/lib/engine/types';
import { buildLetterPractice } from '@/lib/engine/exercises';
import {
  allLetters, sentencesUpTo, sentencesForOrder, sentencesByEra, type Letter, nikud } from '@/lib/content';
import { rng } from '@/lib/engine/rng';

const letras = allLetters();
const letraNa = (ordem: number): Letter => {
  const l = letras.find(x => x.order === ordem);
  if (!l) throw new Error(`sem letra na ordem ${ordem}`);
  return l;
};

const ctxNa = (ordem: number): Ctx => ({
  history: letras.filter(l => l.order <= ordem),
  alphabet: letraNa(ordem).alphabetSoFar,
  allGlyphs: letras.flatMap(l => (l.finalForm ? [l.letter, l.finalForm] : [l.letter])),
  sentences: sentencesUpTo(ordem),
  nikud: nikud().sounds
});

const rand = () => rng('frases');

describe('as frases do curso', () => {
  it('existem, e só entram depois da metade do alfabeto', () => {
    /* Não é falha: uma frase precisa de verbo, e verbo precisa de letras que
       só chegam no meio. Antes disso o curso tem sílabas e palavras. */
    expect(sentencesUpTo(22).length).toBeGreaterThanOrEqual(12);
    expect(sentencesUpTo(10)).toHaveLength(0);
    expect(sentencesUpTo(12).length).toBeGreaterThan(0);
  });

  it('cada frase só usa letras já ensinadas na ordem em que aparece', () => {
    /* A mesma garantia da V20, do lado do app: se o exportador ou a fusão de
       dados corromperem o `after`, é aqui que aparece. */
    const glifosAte = (ordem: number) => {
      const s = new Set<string>();
      for (const l of letras.filter(x => x.order <= ordem)) {
        s.add(l.letter);
        if (l.finalForm) s.add(l.finalForm);
      }
      return s;
    };
    for (const f of sentencesUpTo(22)) {
      const permitido = glifosAte(f.after);
      const usadas = [...f.he].filter(c => /[א-ת]/.test(c));
      for (const c of usadas) expect(permitido.has(c)).toBe(true);
    }
  });

  it('da primeira frase em diante, TODA letra destrava uma frase nova', () => {
    /* Sem isto a promessa "hoje você lê uma frase que ontem não lia" vale só
       em algumas aulas, e o exercício cai de volta numa frase repetida. As
       seis letras que ficavam de fora eram Záyin, Chet, Tet, Tsadi, Kuf e Pê -
       e o Pê, a última letra do curso, fechava o alfabeto sem nada novo. */
    const inicio = Math.min(...sentencesUpTo(22).map(f => f.after));
    const vazias = letras
      .filter(L => L.order >= inicio)
      .filter(L => sentencesForOrder(L.order).length === 0)
      .map(L => `${L.namePt} (${L.order})`);
    expect(vazias).toEqual([]);
  });

  it('há hebraico de hoje E texto antigo, que é o contraste do fim do curso', () => {
    expect(sentencesByEra('moderno').length).toBeGreaterThan(5);
    expect(sentencesByEra('antigo').length).toBeGreaterThan(0);
  });

  it('as palavras somadas reconstroem a frase', () => {
    const limpo = (t: string) => t.replace(/[,.;!?]/g, '').replace(/\s+/g, ' ').trim();
    for (const f of sentencesUpTo(22)) {
      expect(limpo(f.words.map(w => w.he).join(' '))).toBe(limpo(f.he));
    }
  });
});

/** O exercício da letra `ordem`, já estreitado - e nunca outro tipo por engano. */
type FraseEx = Extract<Exercise, { kind: 'sentence-reading' }>;
const lerFrase = (ordem: number, i = 0): FraseEx | null => {
  const ex = exSentenceReading(letraNa(ordem), ctxNa(ordem), rand(), i);
  if (!ex) return null;
  if (ex.kind !== 'sentence-reading') throw new Error(`veio um ${ex.kind}`);
  return ex;
};
const frasePor = (he: string, ordem: number) => {
  const f = sentencesUpTo(ordem).find(x => x.he === he);
  if (!f) throw new Error(`o exercício mostrou uma frase que não existe: ${he}`);
  return f;
};

describe('o exercício de ler a frase', () => {
  it('não existe antes de haver frase para ler', () => {
    expect(lerFrase(5)).toBeNull();
  });

  it('aparece assim que a primeira frase é destravada', () => {
    expect(lerFrase(12)).not.toBeNull();
  });

  it('NÃO mostra a transliteração na tela', () => {
    /* A muleta que faz o aluno ler o alfabeto latino e achar que leu
       hebraico. Ela pertence à explicação, depois da resposta. */
    const ex = lerFrase(20)!;
    const naTela = JSON.stringify({ he: ex.he, words: ex.words.map(w => w.he), options: ex.options, promptPt: ex.promptPt });
    const frase = frasePor(ex.he, 20);
    expect(naTela).not.toContain(frase.translit);
    expect(ex.explainPt).toContain(frase.translit);
  });

  it('os distratores são significados de OUTRAS frases, nunca inventados', () => {
    const ex = lerFrase(21)!;
    const todos = new Set(sentencesUpTo(21).map(f => f.pt));
    for (const o of ex.options) expect(todos.has(o)).toBe(true);
  });

  it('a resposta certa é o significado da frase mostrada', () => {
    const ex = lerFrase(20)!;
    expect(ex.options[ex.answer]).toBe(frasePor(ex.he, 20).pt);
  });

  it('a frase recém-destravada vem primeiro', () => {
    /* O "eu li isto sozinho" vale mais no dia em que a última letra dela
       entrou. */
    const recem = sentencesUpTo(17).filter(f => f.after === 17);
    expect(recem.length).toBeGreaterThan(0);
    expect(recem.map(f => f.he)).toContain(lerFrase(17)!.he);
  });

  it('a dica dá a primeira palavra, nunca a frase', () => {
    const ex = lerFrase(20)!;
    const frase = frasePor(ex.he, 20);
    if (frase.words.length > 1) {
      expect(ex.hintsPt?.[0]).toContain(frase.words[0]!.pt);
      expect(ex.hintsPt?.[0]).not.toContain(frase.pt);
    }
  });

  it('rodadas diferentes dão frases diferentes', () => {
    const vistos = new Set<string>();
    for (let i = 0; i < 4; i++) {
      const ex = lerFrase(21, i);
      if (ex) vistos.add(ex.he);
    }
    expect(vistos.size).toBeGreaterThan(1);
  });

  it('e o id é estável, para o SRS saber que é o mesmo item', () => {
    expect(lerFrase(20)!.id).toBe(lerFrase(20)!.id);
  });
});

describe('a frase dentro da lição', () => {
  const pratica = (ordem: number) =>
    buildLetterPractice(letraNa(ordem), letras.filter(l => l.order <= ordem),
                        { count: 10, seed: `pratica-${letraNa(ordem).id}` });

  it('chega ao bloco de prática de toda letra que já tem frase', () => {
    /* Um gerador registrado e nunca alcançado é a falha silenciosa desta
       engine: a rotação é posicional, e metade da lista não chega ao fim. */
    const sem = letras
      .filter(L => sentencesUpTo(L.order).length >= 3)
      .filter(L => !pratica(L.order).some(e => e.kind === 'sentence-reading'))
      .map(L => L.namePt);
    expect(sem).toEqual([]);
  });

  it('e não come a revisão cumulativa para caber', () => {
    /* A frase ocupa o lugar de UM item de leitura, não um lugar a mais. Somá-la
       ao bloco empurrava as letras anteriores para fora dele. */
    const fracos = letras
      .filter(L => sentencesUpTo(L.order).length >= 3)
      .map(L => ({ L, n: pratica(L.order).filter(e => e.letterId !== L.id).length }))
      .filter(x => x.n < 1)
      .map(x => x.L.namePt);
    expect(fracos).toEqual([]);
  });

  it('vem depois das sílabas, nunca antes', () => {
    /* É o item mais difícil do bloco. O aluno chega nele aquecido. */
    for (const L of letras.filter(L => sentencesUpTo(L.order).length >= 3)) {
      const itens = pratica(L.order);
      const iFrase = itens.findIndex(e => e.kind === 'sentence-reading');
      if (iFrase < 0) continue;
      const leitura = itens.findIndex(e => e.kind === 'syllable-reading' || e.kind === 'build-syllable');
      if (leitura >= 0) expect(leitura, L.namePt).toBeLessThan(iFrase);
    }
  });
});
