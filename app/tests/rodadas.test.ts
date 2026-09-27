/* Refazer um exercício traz perguntas novas (26/09/2026).
 *
 * Pedido do dono do curso: "na segunda vez que o usuário faz um exercício da
 * mesma categoria, questões diferentes, e que não repita as mesmas". O que se
 * prova aqui:
 *
 *   · enquanto a rodada não é concluída, ela não muda (a tela pode recalcular);
 *   · concluída, a próxima evita o que já apareceu - nas telas de verdade;
 *   · quando o conteúdo acaba, repete primeiro o que apareceu há mais tempo;
 *   · a "impressão" de uma pergunta ignora o id e a ordem das alternativas.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { allLetters } from '../src/lib/content';
import { buildCheckpoint, buildMiniTest, buildReview } from '@/lib/engine/exercises';
import {
  escolherRodada, fundirRegistro, fundirRodadas, impressao, lerEspelho, limparEspelho, MEMORIA,
  melhorRodada, registrarRodada, RODADAS_MUDOU, sincronizarEspelho
} from '@/lib/rodadas';
import { mergeStates } from '@/lib/state/merge';
import { migrate } from '@/lib/state/migrate';
import { EMPTY_STATE } from '@/lib/state/types';
import type { Exercise } from '@/lib/engine/types';

const mem = new Map<string, string>();
const eventos: { type: string; detail: unknown }[] = [];
beforeEach(() => {
  mem.clear();
  eventos.length = 0;
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => { mem.set(k, v); },
      removeItem: (k: string) => { mem.delete(k); }
    },
    dispatchEvent: (e: { type: string; detail: unknown }) => { eventos.push(e); return true; }
  };
});

const L = allLetters();
const repetidas = (a: Exercise[], b: Exercise[]) => {
  const vistas = new Set(a.map(impressao));
  return b.map(impressao).filter(x => vistas.has(x)).length;
};

describe('a impressão de uma pergunta', () => {
  const base = {
    id: 'x', kind: 'word-meaning', letterId: 'mem', skill: 'ler', promptPt: 'O que quer dizer?',
    he: 'מַיִם', options: ['água', 'mar', 'mãe'], answer: 0, explainPt: ''
  } as unknown as Exercise;

  it('não muda com o id nem com a ordem das alternativas', () => {
    const outra = { ...base, id: 'y', options: ['mãe', 'água', 'mar'], answer: 1 } as unknown as Exercise;
    expect(impressao(outra)).toBe(impressao(base));
  });

  it('numa pergunta sobre a própria letra, outras opções fazem outra pergunta', () => {
    const rec = {
      id: 'r', kind: 'letter-recognition', letterId: 'mem', skill: 'rec', promptPt: 'Qual destas é a letra Mem?',
      letter: 'מ', options: ['מ', 'ס', 'ט', 'ם'], answer: 0, explainPt: ''
    } as unknown as Exercise;
    /* mesma letra, outras vizinhas: é outra discriminação */
    expect(impressao({ ...rec, options: ['מ', 'נ', 'כ', 'ב'] } as unknown as Exercise)).not.toBe(impressao(rec));
    /* as mesmas vizinhas em outra ordem continuam sendo a mesma pergunta */
    expect(impressao({ ...rec, options: ['ם', 'ט', 'מ', 'ס'], answer: 2 } as unknown as Exercise)).toBe(impressao(rec));
    /* e numa pergunta sobre palavra, trocar as alternativas NÃO faz pergunta nova */
    expect(impressao({ ...base, options: ['água', 'pão', 'céu'] } as unknown as Exercise)).toBe(impressao(base));
  });

  it('muda quando a palavra na tela ou a resposta muda', () => {
    expect(impressao({ ...base, he: 'יָם', options: ['mar', 'água'], answer: 0 } as unknown as Exercise))
      .not.toBe(impressao(base));
  });
});

describe('a rodada', () => {
  const cp = (s: string) => buildCheckpoint(L.filter(x => x.module === 2), L.filter(x => x.module <= 2),
    { audioAvailable: false, count: 12, seed: s });

  it('sem nada concluído, é sempre a mesma: a tela pode recalcular sem trocar as perguntas', () => {
    const a = escolherRodada('checkpoint-2', cp).itens;
    const b = escolherRodada('checkpoint-2', cp).itens;
    expect(b.map(e => e.id)).toEqual(a.map(e => e.id));
  });

  it('concluída, a seguinte do checkpoint não repete nenhuma pergunta', () => {
    const r1 = escolherRodada('checkpoint-2', cp).itens;
    registrarRodada('checkpoint-2', r1);
    const r2 = escolherRodada('checkpoint-2', cp).itens;
    expect(r2).toHaveLength(r1.length);
    expect(repetidas(r1, r2)).toBe(0);
  });

  it('a revisão e o mini-teste também trocam a maior parte', () => {
    const rev = (s: string) => buildReview(['bet', 'kaf'], L, { audioAvailable: false, count: 5, seed: s });
    const r1 = escolherRodada('revisao', rev).itens;
    registrarRodada('revisao', r1);
    expect(repetidas(r1, escolherRodada('revisao', rev).itens)).toBeLessThanOrEqual(1);

    const bet = L.find(x => x.id === 'bet')!;
    const mini = (s: string) => buildMiniTest(bet, L.filter(x => x.order <= bet.order), { audioAvailable: false, seed: s });
    const m1 = escolherRodada('licao-fixacao-bet', mini).itens;
    registrarRodada('licao-fixacao-bet', m1);
    expect(repetidas(m1, escolherRodada('licao-fixacao-bet', mini).itens)).toBeLessThanOrEqual(3);
  });

  it('os ids continuam únicos na rodada montada de vários sorteios', () => {
    const r1 = escolherRodada('checkpoint-2', cp).itens;
    registrarRodada('checkpoint-2', r1);
    const r2 = escolherRodada('checkpoint-2', cp).itens;
    expect(new Set(r2.map(e => e.id)).size).toBe(r2.length);
  });
});

describe('quando o conteúdo acaba', () => {
  /* Um gerador de brinquedo: 3 lugares, e cada lugar só tem duas perguntas
     possíveis (A/B, C/D, E/F), sorteadas pela semente. */
  const gerar = (seed: string) => {
    let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
    return [['A', 'B'], ['C', 'D'], ['E', 'F']].map((par, i) => par[(h >> i) & 1]!);
  };
  const imp = (x: string) => x;

  it('troca tudo o que dá, e repete primeiro o que apareceu há mais tempo', () => {
    const r1 = melhorRodada(gerar, 't', 0, [], imp).itens;
    const r2 = melhorRodada(gerar, 't', 1, r1, imp).itens;
    expect(r2.filter(x => r1.includes(x))).toEqual([]);          // a 2ª é toda nova
    const vistas = [...r2, ...r1];                                   // r2 é a mais recente
    const r3 = melhorRodada(gerar, 't', 2, vistas, imp).itens;
    expect(r3).toEqual(r1);                                          // repete a mais antiga
  });
});

describe('sem armazenamento', () => {
  it('funciona igual, só sem memória', () => {
    delete (globalThis as { window?: unknown }).window;
    const g = (s: string) => [s];
    expect(escolherRodada('x', g, imp => imp).itens).toEqual(['x-r0-0']);
    expect(() => registrarRodada('x', ['a'], i => i)).not.toThrow();
  });
});

describe('na conta do aluno (27/09/2026)', () => {
  const r = (n: number, ...vistas: string[]) => ({ n, vistas });

  it('a fusão fica com o lado de mais rodadas, e é comutativa e idempotente', () => {
    expect(fundirRegistro(r(2, 'a'), r(3, 'b'))).toEqual(r(3, 'b'));
    expect(fundirRegistro(r(3, 'b'), r(2, 'a'))).toEqual(r(3, 'b'));
    /* empate: decide o conteúdo, não o lado */
    expect(fundirRegistro(r(2, 'a'), r(2, 'b'))).toEqual(fundirRegistro(r(2, 'b'), r(2, 'a')));
    const A = { x: r(1, 'a'), y: r(4, 'c') }, B = { x: r(2, 'b'), z: r(1, 'd') };
    expect(fundirRodadas(A, B)).toEqual(fundirRodadas(B, A));
    expect(fundirRodadas(fundirRodadas(A, B), B)).toEqual(fundirRodadas(A, B));
  });

  it('o progresso funde as rodadas de dois aparelhos', () => {
    const celular = { ...EMPTY_STATE, rodadas: { 'checkpoint-2': r(2, 'p', 'q') } };
    const notebook = { ...EMPTY_STATE, rodadas: { 'checkpoint-2': r(1, 'p'), revisao: r(1, 'z') } };
    expect(mergeStates(notebook, celular).rodadas).toEqual({ 'checkpoint-2': r(2, 'p', 'q'), revisao: r(1, 'z') });
  });

  it('o que vem do servidor com forma errada é descartado, não quebra a tela', () => {
    const s = migrate({ ...EMPTY_STATE, rodadas: {
      boa: r(1, 'a'), sem_n: { vistas: [] }, lixo: 'x', n_negativo: r(-1),
      longa: { n: 1, vistas: Array.from({ length: 500 }, (_, i) => `i${i}`) }
    } });
    expect(Object.keys(s.rodadas).sort()).toEqual(['boa', 'longa']);
    expect(s.rodadas.longa!.vistas).toHaveLength(MEMORIA);
    expect(migrate({ ...EMPTY_STATE, rodadas: undefined }).rodadas).toEqual({});
  });

  it('registrar avisa o store, que leva a rodada para a conta', () => {
    registrarRodada('x', ['a', 'b'], i => i);
    expect(eventos).toHaveLength(1);
    expect(eventos[0]!.type).toBe(RODADAS_MUDOU);
    expect(eventos[0]!.detail).toEqual({ categoria: 'x', registro: r(1, 'a', 'b') });
  });

  it('o que outro aparelho fez desce para este, e o que este lembrava sobe', () => {
    registrarRodada('so-aqui', ['a'], i => i);
    const junto = sincronizarEspelho({ 'so-na-conta': r(3, 'z') });
    expect(junto).toEqual({ 'so-na-conta': r(3, 'z'), 'so-aqui': r(1, 'a') });
    expect(lerEspelho()).toEqual(junto);
    /* e a escolha da rodada, que lê o espelho, já vê a da conta */
    const g = (s: string) => [s];
    expect(escolherRodada('so-na-conta', g, i => i).itens).toEqual(['so-na-conta-r3-0']);
  });

  it('sair da conta esquece o espelho', () => {
    registrarRodada('x', ['a'], i => i);
    limparEspelho();
    expect(lerEspelho()).toEqual({});
  });
});
