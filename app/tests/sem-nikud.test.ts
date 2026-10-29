/* Ler sem nikud - a etapa que fecha o módulo 6.
 * ─────────────────────────────────────────────────────────────────────────
 * Eram oito palavras numa lista corrida. Oito se leem em menos de um minuto,
 * e o aluno saía do módulo achando que sabia ler sem os pontos - que é o
 * contrário do que a etapa existe para produzir. São 24, em três grupos.
 *
 * A V19 do validate.js confere o DADO. O que estes casos travam é o que a
 * etapa afirma ao aluno, que é mais forte do que parece:
 *
 *   · "você já conhece todas elas" - toda palavra foi ensinada numa lição;
 *   · a forma nua é a apontada sem os pontos, e não outra grafia;
 *   · o par ambíguo é ambíguo DE VERDADE: mesmo desenho, leituras
 *     diferentes. Uma lição sobre ambiguidade com um par que não colide
 *     ensina uma coisa falsa;
 *   · e o fecho do módulo sorteia das 24, não das 8.
 */

import { describe, expect, it } from 'vitest';
import { allLetters, extras } from '@/lib/content';
import { buildDageshQuiz } from '@/lib/engine/extras';
import { stripNikud } from '@/lib/hebrew';

const U = extras().unpointed;
const vocabulario = new Set(
  allLetters().flatMap(l => [...l.wordsToRead, ...l.wordsToRecognize].map(w => w.he))
);

describe('a lista de leitura sem nikud', () => {
  it('tem três grupos e pelo menos 24 palavras', () => {
    expect(U.groups.length).toBeGreaterThanOrEqual(3);
    expect(U.words.length).toBeGreaterThanOrEqual(24);
  });

  it('os grupos somam exatamente a lista achatada, na mesma ordem', () => {
    /* O gerador de exercícios lê `words`; a tela lê `groups`. Se os dois
       divergirem, o fecho do módulo pergunta sobre uma palavra que a etapa
       de estudo não mostrou. */
    expect(U.groups.flatMap(g => g.words.map(w => w.bare)))
      .toEqual(U.words.map(w => w.bare));
  });

  it('nenhuma palavra aparece em dois grupos', () => {
    const nuas = U.words.map(w => w.bare);
    expect(new Set(nuas).size).toBe(nuas.length);
  });

  it('cada grupo tem título e nota - é o que o torna um grupo', () => {
    for (const g of U.groups) {
      expect(g.titlePt.trim().length, g.id).toBeGreaterThan(0);
      expect(g.notePt.trim().length, g.id).toBeGreaterThan(0);
      expect(g.words.length, g.id).toBeGreaterThan(0);
    }
  });

  it('"você já conhece todas elas" é verdade', () => {
    /* A frase está no introPt da etapa. Uma palavra que ninguém ensinou
       transforma a prova final do módulo em adivinhação. */
    const estranhas = U.words.filter(w => !vocabulario.has(w.pointed)).map(w => w.pointed);
    expect(estranhas).toEqual([]);
  });

  it('a forma nua é a apontada sem os pontos, e nada mais', () => {
    for (const w of U.words) {
      expect(w.bare, w.pointed).toBe(stripNikud(w.pointed));
      expect(w.bare, w.pointed).not.toBe(w.pointed);
    }
  });

  it('a transliteração e a glosa vêm da lição, sem divergir dela', () => {
    const porHe = new Map(
      allLetters().flatMap(l => [...l.wordsToRead, ...l.wordsToRecognize])
        .map(w => [w.he, w] as const)
    );
    for (const w of U.words) {
      const fonte = porHe.get(w.pointed)!;
      expect(w.translit, w.pointed).toBe(fonte.translit);
      expect(w.pt, w.pointed).toBe(fonte.pt);
    }
  });
});

describe('o par que é duas palavras', () => {
  it('as leituras têm MESMO o mesmo desenho sem os pontos', () => {
    const nuas = new Set(U.ambiguous.readings.map(r => r.bare));
    expect(nuas.size).toBe(1);
    expect([...nuas][0]).toBe(U.ambiguous.bare);
  });

  it('e são leituras diferentes - apontadas e traduzidas diferente', () => {
    const r = U.ambiguous.readings;
    expect(r.length).toBeGreaterThanOrEqual(2);
    expect(new Set(r.map(x => x.pointed)).size).toBe(r.length);
    expect(new Set(r.map(x => x.pt)).size).toBe(r.length);
  });

  it('também são palavras que o curso ensinou', () => {
    for (const r of U.ambiguous.readings) expect(vocabulario.has(r.pointed), r.pointed).toBe(true);
  });

  it('e NÃO entram na lista de estudo - não há resposta certa para dar', () => {
    /* Virar exercício ensinaria o contrário do que a palavra mostra: que dá
       para decidir olhando só para ela. */
    expect(U.words.map(w => w.pointed)).not.toContain(U.ambiguous.readings[0]!.pointed);
  });
});

describe('o fecho do módulo 6', () => {
  it('sorteia do conjunto novo, e não repete a mesma palavra duas vezes', () => {
    const q = buildDageshQuiz(extras(), 10, 'teste');
    const lidas = q.filter(e => e.id.startsWith('mod6-unp-'));
    expect(lidas.length).toBeGreaterThan(0);
    expect(new Set(lidas.map(e => e.id)).size).toBe(lidas.length);
  });

  it('e os distratores são significados de OUTRAS palavras da lista', () => {
    const todos = new Set(U.words.map(w => w.pt));
    for (const e of buildDageshQuiz(extras(), 24, 'teste-2')) {
      if (!e.id.startsWith('mod6-unp-')) continue;
      for (const o of (e as { options: string[] }).options) expect(todos.has(o), o).toBe(true);
    }
  });

  it('cobre mais do que as oito de antes quando o fecho é longo', () => {
    /* O número que importa: com 24 no pote, um fecho de 24 questões pode
       tocar mais de oito palavras distintas. Com a lista antiga não podia. */
    const q = buildDageshQuiz(extras(), 30, 'teste-3');
    const lidas = q.filter(e => e.id.startsWith('mod6-unp-'));
    expect(lidas.length).toBeGreaterThan(8);
  });
});

/* 27/10/2026, pedido do dono: "na parte sem nikud ainda tem nikud". */
describe('o fecho do módulo 6 é sem nikud', () => {
  const PONTOS = /[֑-ׇ]/;
  it('nenhuma pergunta mostra ponto, vogal ou daguesh', () => {
    for (const seed of ['a', 'b', 'c']) {
      for (const e of buildDageshQuiz(extras(), 40, seed)) {
        const x = e as { he?: string; letter?: string; options?: string[] };
        for (const t of [x.he ?? '', x.letter ?? '', ...(x.options ?? [])]) {
          expect(PONTOS.test(t), `${e.id}: ${t}`).toBe(false);
        }
      }
    }
  });

  it('a pergunta do som só usa palavras em que a regra da lição 21 acerta', () => {
    const q = buildDageshQuiz(extras(), 60, 'regra').filter(e => e.id.startsWith('mod6-dag-'));
    expect(q.length).toBeGreaterThan(5);
    /* אַבָּא (o ponto que dobra) sem os pontos não tem resposta: fica de fora. */
    expect(q.some(e => (e as { he: string }).he === 'אבא')).toBe(false);
    for (const e of q) expect(e.promptPt).toMatch(/^Sem os pontos/);
  });
});
