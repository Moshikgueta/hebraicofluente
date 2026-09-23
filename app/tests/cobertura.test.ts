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
      /* `par-*`, `parodd-*` e `parword-*` são os exercícios de PAR
         (lib/engine/pares.ts): discriminação com a gêmea garantida na tela,
         que é a versão mais exigente da mesma coisa. */
      .filter(u => !u.familias.has('conf') && !u.familias.has('odd')
        && ![...u.familias].some(f => f.startsWith('par')))
      .map(u => u.L.namePt);
    expect(faltando).toEqual([]);
  });
});

describe('o mini-teste que fecha a letra', () => {
  it('tem sempre dez questões', () => {
    /* Cinco até 21/09/2026; seis quando a cursiva ganhou camada própria; dez
       desde 23/09/2026, quando a fixação passou a cobrar também os gestos de
       MONTAR, de LER e de ligar palavra a significado - a prova media um
       quarto do que a lição ensina, e ensinava ao aluno que os outros três
       gestos não valiam nota.

       E dez não é escolha estética: é o único tamanho que mantém as duas
       réguas coerentes. Dominar pede 75% e destravar a próxima pede 80%. Com
       nove itens, 7 acertos dão 78% - dominada e mesmo assim trancada, um
       estado que nenhuma tela consegue explicar. Com dez, 8 dão 80% e passam
       nas duas; 7 dão 70% e falham nas duas. Não sobra nota no meio, e o
       aluno passa a ter dois erros perdoados em vez de um. */
    const fora = letters
      .map(L => ({ L, n: buildMiniTest(L, historyOf(L.order), { seed: `mini-${L.id}-0` }).length }))
      .filter(x => x.n !== 10)
      .map(x => `${x.L.namePt}: ${x.n}`);
    expect(fora).toEqual([]);
  });

  it('e nenhuma nota cai entre as duas réguas', () => {
    /* A regra que justifica o dez, medida em vez de afirmada: para todo
       número de acertos possível, "dominou" e "destravou" têm de dar a mesma
       resposta. Uma prova em que dá para dominar a letra e continuar com a
       seguinte trancada é a pior forma de travar alguém - ela não tem tela
       que explique. */
    const n = 10;
    const ambiguos = Array.from({ length: n + 1 }, (_, k) => k / n)
      .filter(nota => nota >= 0.75 && nota < 0.8)
      .map(nota => `${Math.round(nota * n)}/${n} = ${Math.round(nota * 100)}%`);
    expect(ambiguos, 'notas que dominam a letra sem destravar a próxima').toEqual([]);
  });

  it('e cobra a direção CONTRÁRIA à da prática, em todas as 22', () => {
    /* Prática: impressa → cursiva, que é escrever. Checkpoint: cursiva →
       impressa, que é ler o bilhete de alguém. Eram a mesma pergunta duas
       vezes - o gerador `exCursiveToPrint` tinha o nome da volta e fazia a
       ida -, e o curso nunca pedia para LER uma cursiva. */
    const fora = letters.map(L => {
      const hist = historyOf(L.order);
      const pratica = buildLetterPractice(L, hist, { count: 10, seed: `pratica-${L.id}` });
      const mini = buildMiniTest(L, hist, { seed: `mini-${L.id}-0` });
      const ida = pratica.some(e => /-cur-/.test(e.id));
      /* Desde 23/09 a volta também pode ser a PALAVRA inteira à mão
         (`-curw-qual-palavra-`): a mesma direção - ler a cursiva de alguém -,
         num grau acima. */
      const volta = mini.some(e => /-cur2-|-curw-(qual-palavra|significado|letra)-/.test(e.id));
      return { L, ida, volta };
    }).filter(x => !x.ida || !x.volta)
      .map(x => `${x.L.namePt}: prática ${x.ida ? 'ok' : 'SEM ida'}, checkpoint ${x.volta ? 'ok' : 'SEM volta'}`);
    expect(fora).toEqual([]);
  });

  it('cobra a cursiva em todas as 22 - a etapa que ninguém conferia', () => {
    /* Medido antes da correção: 0 de 22. A lição ensinava a cursiva numa
       etapa inteira e a prova que decide o domínio - e, com a trava, a
       abertura da próxima letra - nunca perguntava nada sobre ela. */
    const sem = letters
      .map(L => ({ L, q: buildMiniTest(L, historyOf(L.order), { seed: `mini-${L.id}-0` }) }))
      .filter(x => !x.q.some(e => /-cur2?-|-curw-/.test(e.id)))
      .map(x => x.L.namePt);
    expect(sem).toEqual([]);
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
