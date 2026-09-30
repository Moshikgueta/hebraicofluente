/* A lição 21: onde o ponto aparece, e ler sem ele (lib/engine/posicao-do-ponto.ts). */
import { describe, expect, it } from 'vitest';
import { allLetters, course, extras } from '../src/lib/content';
import {
  analisar, classificar, exerciciosDoPonto, outraLeitura, palavrasDoPonto, semOPonto
} from '@/lib/engine/posicao-do-ponto';

const { certas, excecoes } = classificar(palavrasDoPonto(extras(), allLetters()));
const DAGUESH = 'ּ';

describe('onde o ponto aparece', () => {
  it('lê a posição da letra', () => {
    expect(analisar('בַּיִת')[0]).toMatchObject({ posicao: 'comeco', real: true, previsto: true });
    expect(analisar('סֵפֶר')[0]).toMatchObject({ posicao: 'depois-de-vogal', real: false, previsto: false });
    expect(analisar('מִשְׁפָּחָה')[0]).toMatchObject({ posicao: 'depois-de-consoante', real: true });
    expect(analisar('טוֹב')[0]).toMatchObject({ posicao: 'depois-de-vogal', real: false });
  });

  it('o ponto que dobra a consoante vira exceção, nunca exercício', () => {
    expect(excecoes.map(w => w.he)).toContain('אַבָּא');
    expect(certas.map(w => w.he)).not.toContain('אַבָּא');
    for (const w of certas) expect(w.analise.previsto, w.he).toBe(w.analise.real);
  });

  it('há palavra para as três posições e para as três letras', () => {
    expect(new Set(certas.map(w => w.analise.posicao)).size).toBe(3);
    expect(new Set(certas.map(w => w.analise.letra.id)).size).toBe(3);
  });

  it('tira só o ponto da letra, e troca só o som dela', () => {
    expect(semOPonto('כִּתָּה', 0)).toBe('כִתָּה'.normalize('NFC'));
    expect(outraLeitura('báyit', 'b', 'v')).toBe('váyit');
  });

  it('cada exercício mostra a letra sem o ponto e tem a leitura certa entre as duas', () => {
    for (const seed of ['a', 'b', 'c']) {
      const ex = exerciciosDoPonto(certas, { seed, count: 8 });
      expect(ex.length).toBe(8);
      for (const e of ex) {
        if (e.kind !== 'syllable-reading') throw new Error(e.kind);
        const w = certas.find(c => semOPonto(c.he, c.analise.indice) === e.he)!;
        expect(w, e.he).toBeDefined();
        expect(e.options[e.answer]).toBe(w.translit);
        expect(e.options).toHaveLength(2);
        /* A letra da pergunta não tem ponto nenhum. */
        const g = [...e.he].findIndex(c => c === w.analise.letra.he);
        expect(e.he[g + 1] === DAGUESH).toBe(false);
      }
    }
  });

  it('a lição 21 do plano diz o que ela é agora, e o 23 e o 27 não são mais "prática"', () => {
    const l = course.modules.flatMap(m => m.lessons);
    expect(l.find(x => x.n === 21)!.topicPt).toContain('Onde o ponto aparece');
    expect(l.find(x => x.n === 23)!.kind).toBeUndefined();
    expect(l.find(x => x.n === 27)!.kind).toBeUndefined();
  });
});
