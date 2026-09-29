/* A prática de revisão: errou volta, depois de outras, até acertar
   (lib/engine/fila-de-revisao.ts, usada pelo ExercisePlayer em `repetirErros`). */
import { describe, expect, it } from 'vitest';
import { DISTANCIA_DA_VOLTA, reenfileirar } from '@/lib/engine/fila-de-revisao';

/** Roda a fila como o player: `erros[id]` = quantas vezes o aluno erra aquele
 *  item antes de acertar. Devolve a ordem em que as questões apareceram. */
function praticar(ids: string[], erros: Record<string, number> = {}): string[] {
  let fila = [...ids];
  const faltam = { ...erros };
  const vistos: string[] = [];
  for (let i = 0; i < fila.length; i++) {
    if (vistos.length > 200) throw new Error('não terminou');
    const id = fila[i]!;
    vistos.push(id);
    if ((faltam[id] ?? 0) > 0) { faltam[id]!--; fila = reenfileirar(fila, i); }
  }
  /* Terminou: tudo foi acertado. */
  expect(Object.values(faltam).every(n => n === 0)).toBe(true);
  return vistos;
}

describe('a fila da prática de revisão', () => {
  it('sem erro, cada questão aparece uma vez, na ordem', () => {
    expect(praticar(['a', 'b', 'c', 'd'])).toEqual(['a', 'b', 'c', 'd']);
  });

  it('um erro: a questão volta depois de outras duas, não logo em seguida', () => {
    const v = praticar(['a', 'b', 'c', 'd'], { a: 1 });
    expect(v).toEqual(['a', 'b', 'c', 'a', 'd']);
    expect(DISTANCIA_DA_VOLTA).toBe(2);
  });

  it('errar de novo faz voltar de novo, até acertar', () => {
    const v = praticar(['a', 'b', 'c', 'd'], { b: 3 });
    expect(v.filter(x => x === 'b')).toHaveLength(4);
    expect(v.at(-1)).toBe('b');
    /* A primeira volta vem depois de outras duas; quando só ela sobra, volta
       em seguida (não há outra para pôr no meio). */
    expect(v).toEqual(['a', 'b', 'c', 'd', 'b', 'b', 'b']);
  });

  it('vários erros em várias questões: todas voltam e a prática só acaba com tudo certo', () => {
    const v = praticar(['a', 'b', 'c', 'd'], { a: 2, c: 1, d: 1 });
    expect(v.filter(x => x === 'a')).toHaveLength(3);
    expect(v.filter(x => x === 'c')).toHaveLength(2);
    expect(v.filter(x => x === 'd')).toHaveLength(2);
    expect(v).toHaveLength(4 + 2 + 1 + 1);
  });

  it('a última pendente, sozinha, volta logo: não há outra para pôr no meio', () => {
    expect(praticar(['a'], { a: 2 })).toEqual(['a', 'a', 'a']);
  });
});
