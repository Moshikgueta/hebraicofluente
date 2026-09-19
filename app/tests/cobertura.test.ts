/* Quanta prática cada letra recebe, de verdade.
 * ─────────────────────────────────────────────────────────────────────────
 * Esta suíte existe porque "falta exercício" era opinião até alguém contar.
 * A auditoria que motivou o trabalho mediu o seguinte no estado anterior:
 *
 *   13 itens por letra, 8 tipos, e os TREZE da própria letra - zero revisão
 *   cumulativa dentro da lição. A forma final aparecia só no Mem, e a letra
 *   em outra fonte só no Tav, porque a rotação de geradores é posicional e
 *   metade da lista nunca era alcançada em treze passos.
 *
 * O que estes testes travam é o piso: se alguém mexer na composição e uma
 * letra voltar a receber pouco, ou perder a discriminação, ou perder a forma
 * final, a suíte cai aqui e diz qual letra.
 *
 * As famílias são lidas do ID e não do `kind` de propósito: `exConfusablePick`
 * emite kind 'letter-recognition' - é o mesmo gesto -, e contar por kind
 * esconderia exatamente o exercício que se quer verificar.
 */

import { describe, expect, it } from 'vitest';
import { allLetters } from '../src/lib/content';
import { buildLetterPractice, buildMiniTest } from '../src/lib/engine/exercises';

const letters = allLetters();
const historyOf = (order: number) => letters.filter(l => l.order <= order);

/** A família do gerador, tirada do id: `nun-inword-0` → `inword`. */
const familia = (id: string) => id.replace(/^[a-z]+-/, '').replace(/-\d+$/, '');

function unidade(order: number) {
  const L = letters[order - 1]!;
  const hist = historyOf(L.order);
  const pratica = buildLetterPractice(L, hist, { count: 10, seed: `pratica-${L.id}` });
  const mini = buildMiniTest(L, hist, { seed: `mini-${L.id}-0` });
  const todos = [...pratica, ...mini];
  return {
    L, todos,
    familias: new Set(todos.map(e => familia(e.id))),
    cumulativos: todos.filter(e => e.letterId !== L.id).length
  };
}

describe('a unidade de prática de cada letra', () => {
  it('entrega pelo menos 12 interações por letra', () => {
    const curtas = letters
      .map(L => unidade(L.order))
      .filter(u => u.todos.length < 12)
      .map(u => `${u.L.namePt}: ${u.todos.length}`);
    expect(curtas).toEqual([]);
  });

  it('varia: pelo menos 7 famílias de exercício por letra', () => {
    const pobres = letters
      .map(L => unidade(L.order))
      .filter(u => u.familias.size < 7)
      .map(u => `${u.L.namePt}: ${u.familias.size} famílias`);
    expect(pobres).toEqual([]);
  });

  it('nunca repete o mesmo gesto duas vezes seguidas na prática', () => {
    const seguidos: string[] = [];
    for (const L of letters) {
      const pratica = buildLetterPractice(L, historyOf(L.order), { count: 10, seed: `pratica-${L.id}` });
      pratica.forEach((ex, i) => {
        if (i > 0 && ex.kind === pratica[i - 1]!.kind) {
          seguidos.push(`${L.namePt}: ${ex.kind} duas vezes`);
        }
      });
    }
    expect(seguidos).toEqual([]);
  });

  it('revisa letras anteriores dentro da própria lição, da segunda em diante', () => {
    const semRevisao = letters
      .filter(L => L.order > 1)
      .map(L => unidade(L.order))
      .filter(u => u.cumulativos < 2)
      .map(u => `${u.L.namePt}: ${u.cumulativos} cumulativos`);
    expect(semRevisao).toEqual([]);
  });

  it('exercita a forma final nas cinco letras que têm uma', () => {
    const comFinal = letters.filter(l => l.finalForm);
    expect(comFinal.length).toBe(5);
    const faltando = comFinal
      .map(L => unidade(L.order))
      .filter(u => !u.familias.has('finword') && !u.familias.has('fin'))
      .map(u => u.L.namePt);
    expect(faltando).toEqual([]);
  });

  it('exercita a letra dentro de uma palavra sempre que houver palavra legível', () => {
    const faltando = letters
      .map(L => unidade(L.order))
      .filter(u => {
        /* O Mem é a primeira letra e ainda não há palavra que se possa LER
           com uma consoante só - a auditoria registrou isso, e é honesto. */
        const temPalavra = historyOf(u.L.order).some(x => x.wordsToRead.length > 0);
        return temPalavra && !u.familias.has('inword') && !u.familias.has('pos');
      })
      .map(u => u.L.namePt);
    expect(faltando).toEqual([]);
  });

  it('mostra a letra em outra fonte em todas', () => {
    const faltando = letters
      .map(L => unidade(L.order))
      .filter(u => !u.familias.has('cur') && !u.familias.has('cur2'))
      .map(u => u.L.namePt);
    expect(faltando).toEqual([]);
  });

  it('treina discriminação em toda letra que declara confundíveis', () => {
    const faltando = letters
      .filter(L => L.confusableWith.filter(c => c !== L.letter).length >= 2)
      .map(L => unidade(L.order))
      .filter(u => !u.familias.has('conf') && !u.familias.has('odd'))
      .map(u => u.L.namePt);
    expect(faltando).toEqual([]);
  });
});

describe('o mini-teste que fecha a letra', () => {
  it('tem sempre cinco questões', () => {
    const fora = letters
      .map(L => ({ L, n: buildMiniTest(L, historyOf(L.order), { seed: `mini-${L.id}-0` }).length }))
      .filter(x => x.n !== 5)
      .map(x => `${x.L.namePt}: ${x.n}`);
    expect(fora).toEqual([]);
  });

  it('inclui uma questão de letra anterior, da segunda letra em diante', () => {
    const fora = letters
      .filter(L => L.order > 1)
      .map(L => ({
        L, n: buildMiniTest(L, historyOf(L.order), { seed: `mini-${L.id}-0` })
          .filter(e => e.letterId !== L.id).length
      }))
      .filter(x => x.n < 1)
      .map(x => x.L.namePt);
    expect(fora).toEqual([]);
  });

  it('gera questões diferentes a cada tentativa', () => {
    /* Compara o CONTEÚDO, e não o id. Nas duas primeiras letras o alfabeto
       disponível é tão pequeno que o mesmo gerador volta com o mesmo id - o
       que muda são os distratores e a sílaba sorteada, e é isso que faz a
       segunda tentativa ser outra tentativa. */
    const impressao = (L: (typeof letters)[number], n: number) =>
      buildMiniTest(L, historyOf(L.order), { seed: `mini-${L.id}-${n}` })
        .map(e => `${e.id}:${'options' in e ? e.options.join(',') : e.kind}`)
        .join('|');
    for (const L of letters.slice(0, 6)) {
      expect(impressao(L, 0), L.namePt).not.toBe(impressao(L, 1));
    }
  });
});
