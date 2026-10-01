/* Falar e ser corrigido: a regra que decide se a fala bateu (27/09/2026).
 *
 * A transcrição vem do navegador, sem pontos e em grafia cheia; o curso
 * escreve com pontos e, às vezes, em grafia defectiva (אֹמֵר). Corrigir um
 * aluno que falou certo é o pior erro que isto pode cometer - então os casos
 * que PRECISAM passar vêm primeiro.
 */

import { describe, expect, it } from 'vitest';
import { conferirFala, grafiaCheiaDe, palavrasDe } from '@/lib/fala';

describe('palavrasDe', () => {
  it('tira os pontos, a pontuação e a forma final', () => {
    expect(palavrasDe('שָׁלוֹם, דָּנָה!')).toEqual(['שלומ', 'דנה']);
    expect(palavrasDe('צ׳ק-אין')).toEqual(['צק', 'אינ']);
  });
});

describe('conferirFala: o que tem de passar', () => {
  it('a palavra dita, sem pontos', () => {
    expect(conferirFala('שָׁלוֹם', ['שלום']).certo).toBe(true);
  });
  it('a grafia cheia contra a defectiva do curso (אֹמֵר / אומר)', () => {
    expect(conferirFala('אֹמֵר', ['אומר']).certo).toBe(true);
    expect(conferirFala('נֹתֵן', ['נותן']).certo).toBe(true);
  });
  it('a palavra dentro de uma frase maior ("é ... ")', () => {
    expect(conferirFala('מַיִם', ['זה מים']).certo).toBe(true);
  });
  it('a certa numa alternativa que não é a primeira', () => {
    const v = conferirFala('כֶּלֶב', ['קלב', 'כלב']);
    expect(v.certo).toBe(true);
    expect(v.ouvi).toBe('כלב');
  });
  it('uma expressão de duas palavras, em ordem', () => {
    expect(conferirFala('מָה נִשְׁמַע', ['מה נשמע']).certo).toBe(true);
    expect(conferirFala('שַׁבָּת שָׁלוֹם', ['שבת שלום לכולם']).certo).toBe(true);
  });
  it('a palavra estrangeira com gerech (a transcrição usa apóstrofo)', () => {
    expect(conferirFala('פיג׳מה', ["פיג'מה"]).certo).toBe(true);
  });
});

describe('conferirFala: o que não pode passar', () => {
  it('outra palavra', () => {
    const v = conferirFala('כֶּלֶב', ['לב']);
    expect(v.certo).toBe(false);
    expect(v.ouvi).toBe('לב');
  });
  it('a expressão pela metade ou fora de ordem', () => {
    expect(conferirFala('מָה נִשְׁמַע', ['מה']).certo).toBe(false);
    expect(conferirFala('מָה נִשְׁמַע', ['נשמע מה']).certo).toBe(false);
  });
  it('outra letra no lugar (ק em vez de כ) não passa', () => {
    /* O reconhecimento escreve a PALAVRA que ouviu, e קלב não é palavra: se
       vier, é outra coisa. */
    expect(conferirFala('כֶּלֶב', ['קלב']).certo).toBe(false);
  });
  it('uma letra do alvo FALTANDO não passa, um ו/י a mais passa (CONT-016)', () => {
    expect(conferirFala('עִיר', ['ער']).certo).toBe(false);
    expect(conferirFala('עִיר', ['עיר']).certo).toBe(true);
    expect(conferirFala('אֹמֵר', ['אומר']).certo).toBe(true);
    expect(grafiaCheiaDe('אומר', 'אמר')).toBe(true);
    expect(grafiaCheiaDe('אמר', 'אומר')).toBe(false);
    expect(grafiaCheiaDe('אמרה', 'אמר')).toBe(false);
  });
  it('nada ouvido', () => {
    expect(conferirFala('שָׁלוֹם', []).certo).toBe(false);
  });
});
