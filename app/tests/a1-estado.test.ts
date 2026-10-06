/* O progresso do A1 (lib/state/a1-estado.ts), no mesmo estado do aluno.
 * A fusão entre aparelhos tem as mesmas exigências do resto (merge.ts):
 * comutativa, idempotente, e sem perder conquista; e o que vem do servidor
 * ou do navegador só entra com a forma certa. */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  A1_APROVA, A1_VAZIO, a1Valido, chaveDoItem, dominio, fundirA1, paraRevisarHoje, registrarExameA1,
  registrarHabilidade, registrarUnidade, responderRevisao, situacaoRevisao, unidadeConcluida,
  type EstadoA1
} from '@/lib/state/a1-estado';
import { mergeStates } from '@/lib/state/merge';
import { migrate } from '@/lib/state/migrate';
import { EMPTY_STATE } from '@/lib/state/types';
import { UNIDADES_A1 } from '@/lib/a1';

const T1 = '2026-10-06T10:00:00.000Z', T2 = '2026-10-07T10:00:00.000Z';

describe('o progresso do A1', () => {
  it('uma unidade só conclui a partir de 70%, e a data da conclusão não muda depois', () => {
    let e = registrarUnidade(A1_VAZIO, 3, 0.6, T1);
    expect(unidadeConcluida(e, 3)).toBe(false);
    e = registrarUnidade(e, 3, A1_APROVA, T1);
    expect(unidadeConcluida(e, 3)).toBe(true);
    e = registrarUnidade(e, 3, 1, T2);
    expect(e.unidades['3']).toEqual({ best: 1, runs: 3, concluidaEm: T1 });
  });

  it('o exame guarda a melhor nota, as tentativas e a primeira aprovação', () => {
    let e = registrarExameA1(A1_VAZIO, 0.5, { escrita: { correct: 1, total: 4 } }, 0.7, T1);
    e = registrarExameA1(e, 0.8, { escrita: { correct: 4, total: 4 } }, 0.7, T2);
    e = registrarExameA1(e, 0.75, {}, 0.7, T2);
    expect(e.exame.best).toBe(0.8);
    expect(e.exame.attempts).toBe(3);
    expect(e.exame.passedAt).toBe(T2);
  });

  it('a fusão é comutativa e idempotente, e não perde conquista', () => {
    const a: EstadoA1 = {
      ...A1_VAZIO,
      genero: { valor: 'f', em: T1 },
      unidades: { '1': { best: 0.9, runs: 2, concluidaEm: T2 } },
      exame: { best: 0.6, attempts: 1, passedAt: null }
    };
    const b: EstadoA1 = {
      ...A1_VAZIO,
      genero: { valor: 'm', em: T2 },
      unidades: { '1': { best: 0.7, runs: 5, concluidaEm: T1 }, '2': { best: 0.4, runs: 1, concluidaEm: null } },
      exame: { best: 0.8, attempts: 2, passedAt: T2 }
    };
    const ab = fundirA1(a, b);
    expect(fundirA1(b, a)).toEqual(ab);
    expect(fundirA1(ab, ab)).toEqual(ab);
    expect(ab.genero).toEqual({ valor: 'm', em: T2 });                     // a decisão mais recente
    expect(ab.unidades['1']).toEqual({ best: 0.9, runs: 5, concluidaEm: T1 });
    expect(ab.unidades['2']!.best).toBe(0.4);
    expect(ab.exame).toMatchObject({ best: 0.8, attempts: 2, passedAt: T2 });
  });

  it('o que vem com forma errada não entra', () => {
    expect(a1Valido(null)).toEqual(A1_VAZIO);
    const e = a1Valido({
      genero: { valor: 'x', em: T1 },
      unidades: { '1': { best: 'muito', runs: -3 }, '99': { best: 1 }, __proto__: { best: 1 } },
      exame: { best: 0.9, attempts: 'dois' }
    });
    expect(e.genero).toBeNull();
    expect(e.unidades).toEqual({ '1': { best: null, runs: 0, concluidaEm: null } });
    expect(e.exame).toEqual({ best: 0.9, attempts: 0, passedAt: null });
  });

  it('entra no estado do aluno: migração e fusão dos dois aparelhos levam o A1 junto', () => {
    const local = { ...EMPTY_STATE, a1: registrarUnidade(A1_VAZIO, 1, 0.9, T1) };
    const remoto = { ...EMPTY_STATE, a1: registrarUnidade(A1_VAZIO, 2, 0.8, T2) };
    const junto = mergeStates(local, remoto);
    expect(Object.keys(junto.a1.unidades).sort()).toEqual(['1', '2']);
    /* Um progresso salvo antes do A1 existir migra com o A1 vazio. */
    const antigo = { ...EMPTY_STATE } as Record<string, unknown>;
    delete antigo.a1;
    expect(migrate(antigo).a1).toEqual(A1_VAZIO);
  });

  it('as páginas geradas são as unidades dos módulos de data/a1/curso.json, na ordem', () => {
    const curso = JSON.parse(readFileSync(new URL('../../data/a1/curso.json', import.meta.url), 'utf8')) as { modulos: { unidades: number[] }[] };
    expect([...UNIDADES_A1]).toEqual(curso.modulos.flatMap(m => m.unidades));
  });

  it('revisão espaçada: só o erro entra; acertar sobe de caixa, errar volta à 0', () => {
    const k = chaveDoItem(3, { t: 'vf', q: 'x', certa: true, porque: 'y' });
    expect(k).toMatch(/^u3:[0-9a-f]{8}$/);
    let e = responderRevisao(A1_VAZIO, k, true, '2026-10-06');
    expect(e.revisao).toEqual({});                                         // acerto de primeira não entra
    e = responderRevisao(e, k, false, '2026-10-06');
    expect(e.revisao[k]).toMatchObject({ caixa: 0, vence: '2026-10-06', erros: 1 });
    expect(paraRevisarHoje(e, '2026-10-06')).toEqual([k]);
    expect(situacaoRevisao(e.revisao[k]!, '2026-10-06')).toBe('agora');
    e = responderRevisao(e, k, true, '2026-10-06');
    expect(e.revisao[k]).toMatchObject({ caixa: 1, vence: '2026-10-07' });
    expect(paraRevisarHoje(e, '2026-10-06')).toEqual([]);
    for (const d of ['2026-10-07', '2026-10-10', '2026-10-17']) e = responderRevisao(e, k, true, d);
    expect(situacaoRevisao(e.revisao[k]!, '2026-10-17')).toBe('dominado');
  });

  it('o domínio de uma habilidade só aparece com 10 respostas', () => {
    let e = A1_VAZIO;
    for (let i = 0; i < 9; i++) e = registrarHabilidade(e, 'escuta', i < 6);
    expect(dominio(e, 'escuta')).toBeNull();
    e = registrarHabilidade(e, 'escuta', true);
    expect(dominio(e, 'escuta')).toBe(0.7);
  });

  it('o caderno funde entre aparelhos sem perder nada, e comutativo', () => {
    const k = 'u2:0000abcd';
    const a: EstadoA1 = {
      ...A1_VAZIO,
      revisao: { [k]: { caixa: 2, vence: '2026-10-09', acertos: 2, erros: 1, visto: '2026-10-06' } },
      habilidades: { leitura: { h: 5, m: 1 } },
      favoritos: { 'w:שלום': { on: true, em: T1 } },
      translit: { valor: 'esconder', em: T2 },
      dias: { '2026-10-06': 4 }
    };
    const b: EstadoA1 = {
      ...A1_VAZIO,
      revisao: { [k]: { caixa: 0, vence: '2026-10-07', acertos: 2, erros: 2, visto: '2026-10-07' } },
      habilidades: { leitura: { h: 3, m: 4 }, escuta: { h: 1, m: 0 } },
      favoritos: { 'w:שלום': { on: false, em: T2 } },
      translit: { valor: 'mostrar', em: T1 },
      dias: { '2026-10-06': 2, '2026-10-07': 1 }
    };
    const ab = fundirA1(a, b);
    expect(fundirA1(b, a)).toEqual(ab);
    expect(fundirA1(ab, ab)).toEqual(ab);
    expect(ab.revisao[k]!.visto).toBe('2026-10-07');                       // o visto por último
    expect(ab.habilidades).toEqual({ leitura: { h: 5, m: 4 }, escuta: { h: 1, m: 0 } });
    expect(ab.favoritos['w:שלום']!.on).toBe(false);                         // a decisão mais recente
    expect(ab.translit!.valor).toBe('esconder');
    expect(ab.dias).toEqual({ '2026-10-06': 4, '2026-10-07': 1 });
  });

  it('chaves do caderno com forma errada não entram', () => {
    const e = a1Valido({
      revisao: { 'u3:zzzz': { caixa: 1, vence: '2026-10-06', visto: '2026-10-06' }, 'u3:0000abcd': { caixa: 9, vence: '2026-10-06', visto: '2026-10-06' } },
      favoritos: { 'w:abc': { on: true, em: T1 }, 'w:שלום': { on: true, em: T1 } },
      translit: { valor: 'sempre', em: T1 }
    });
    expect(e.revisao).toEqual({});
    expect(Object.keys(e.favoritos)).toEqual(['w:שלום']);
    expect(e.translit).toBeNull();
  });
});
