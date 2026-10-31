/* Meu caderno de palavras (28/10/2026): pôr e tirar, e a fusão monotônica
   entre aparelhos - o gesto mais recente vence, e repetir a fusão não muda
   nada. */
import { describe, expect, it } from 'vitest';
import { alternarNoCaderno, fundirCaderno, noCaderno, palavrasDoCaderno } from '@/lib/caderno';
import { mergeStates } from '@/lib/state/merge';
import { EMPTY_STATE } from '@/lib/state/types';

const T1 = '2026-10-28T10:00:00Z', T2 = '2026-10-28T11:00:00Z', T3 = '2026-10-28T12:00:00Z';

describe('o caderno de palavras', () => {
  it('põe, tira e põe de novo; com os pontos, שֵׁם e שָׁם são duas palavras', () => {
    let c = alternarNoCaderno(undefined, 'שָׁלוֹם', T1);
    expect(noCaderno(c, 'שָׁלוֹם')).toBe(true);
    expect(noCaderno(alternarNoCaderno(undefined, 'שֵׁם', T1), 'שָׁם')).toBe(false);
    c = alternarNoCaderno(c, 'שָׁלוֹם', T2);
    expect(noCaderno(c, 'שָׁלוֹם')).toBe(false);
    c = alternarNoCaderno(c, 'שָׁלוֹם', T3);
    expect(noCaderno(c, 'שָׁלוֹם')).toBe(true);
    expect(palavrasDoCaderno(c, [{ he: 'אִמָּא' }, { he: 'שָׁלוֹם' }]).map(w => w.he)).toEqual(['שָׁלוֹם']);
  });

  it('a fusão fica com o gesto mais recente, e é comutativa e idempotente', () => {
    const posto = alternarNoCaderno(undefined, 'יָם', T1);
    const tirado = alternarNoCaderno(posto, 'יָם', T2);
    const deNovo = alternarNoCaderno(tirado, 'יָם', T3);
    expect(noCaderno(fundirCaderno(posto, tirado), 'יָם')).toBe(false);
    expect(noCaderno(fundirCaderno(tirado, deNovo), 'יָם')).toBe(true);
    expect(fundirCaderno(posto, tirado)).toEqual(fundirCaderno(tirado, posto));
    const f = fundirCaderno(posto, tirado);
    expect(fundirCaderno(f, tirado)).toEqual(f);
  });

  it('entra na fusão do progresso, e quem não tem caderno não ganha um', () => {
    const a = { ...EMPTY_STATE, caderno: alternarNoCaderno(undefined, 'יָם', T1) };
    expect(noCaderno(mergeStates(a, EMPTY_STATE).caderno, 'יָם')).toBe(true);
    expect(noCaderno(mergeStates(EMPTY_STATE, a).caderno, 'יָם')).toBe(true);
    expect(mergeStates(EMPTY_STATE, EMPTY_STATE).caderno).toBeUndefined();
  });
});
