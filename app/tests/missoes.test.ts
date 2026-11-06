/* As missões de módulo guardam as mesmas regras que o curso inteiro guarda.
 * ─────────────────────────────────────────────────────────────────────────
 * `data/missoes.json` é escrito à mão, e um erro nele não quebra build
 * nenhuma: uma palavra que o curso não tem só estouraria na tela do aluno,
 * e uma palavra com letra que ele ainda não viu passaria calada. Aqui as duas
 * coisas são conferidas contra o conteúdo de verdade, antes da publicação.
 */

import { describe, expect, it } from 'vitest';
import { course } from '@/lib/content-publico';
import { conteudoPago } from '@/lib/content-servidor';
import {
  lexicoDoCurso, missaoId, montarMissao, palavrasDaMissao, type Missao
} from '@/lib/engine/missao';
import { alfabetoDe, consegueLer } from '@/lib/engine/palavras';
import { rng } from '@/lib/engine/rng';
import { isChoice, typedIsCorrect } from '@/lib/engine/types';

const missoes: Missao[] = conteudoPago.missoes;
const lex = lexicoDoCurso(conteudoPago.letters, conteudoPago.scenes, conteudoPago.extras);

describe('as missões de módulo', () => {
  it('todo módulo do curso tem uma missão, e só uma', () => {
    expect(missoes.map(m => m.modulo).sort()).toEqual(course.modules.map(m => m.n).sort());
  });

  it('só citam palavras que o curso ensina', () => {
    const fora = missoes.flatMap(m =>
      palavrasDaMissao(m).filter(he => !lex.has(he)).map(he => `módulo ${m.modulo}: ${he}`));
    expect(fora).toEqual([]);
  });

  it('não mostram letra que o aluno ainda não viu', () => {
    const culpados: string[] = [];
    for (const m of missoes) {
      const mod = course.modules.find(x => x.n === m.modulo)!;
      const upTo = mod.checkpoint?.upTo ?? 22;
      const alfabeto = alfabetoDe(conteudoPago.letters.filter(l => l.order <= upTo));
      for (const he of palavrasDaMissao(m)) {
        if (!consegueLer(he, alfabeto)) culpados.push(`módulo ${m.modulo}: ${he}`);
      }
    }
    expect(culpados).toEqual([]);
  });

  it('montam exercícios que o tocador aceita, com a resposta certa entre as opções', () => {
    for (const m of missoes) {
      const ex = montarMissao(m, lex, rng(`t-${m.modulo}`));
      expect(ex).toHaveLength(m.passos.length);
      ex.forEach((e, i) => {
        const passo = m.passos[i]!;
        if (isChoice(e)) {
          /* Um distrator com o MESMO significado da certa sumiria no
             `Set` e deixaria a pergunta com uma alternativa a menos. */
          expect(e.options, `${e.id}: alternativa repetida`)
            .toHaveLength(1 + ('erradas' in passo ? passo.erradas.length : 0));
          expect(e.answer, e.id).toBeGreaterThanOrEqual(0);
        } else if (e.kind === 'type-answer') {
          const v = lex.get(passo.he)!;
          expect(typedIsCorrect(v.translit!, e.accept), e.id).toBe(true);
        }
      });
    }
  });

  it('seguem a ordem da história, e só as alternativas mudam de lugar ao refazer', () => {
    const m = missoes[0]!;
    const a = montarMissao(m, lex, rng('a')).map(e => e.id);
    const b = montarMissao(m, lex, rng('b')).map(e => e.id);
    expect(a).toEqual(b);
  });

  it('o passo sem pontos mostra a palavra sem nikud', () => {
    const m6 = missoes.find(m => m.modulo === 6)!;
    const ex = montarMissao(m6, lex, rng('x'));
    for (const e of ex) {
      if ('he' in e && e.he) expect(e.he, e.id).not.toMatch(/[֑-ׇ]/);
    }
  });

  it('o registro da missão cumprida é uma chave própria de `firsts`', () => {
    expect(missaoId(3)).toBe('missao-3');
  });
});
