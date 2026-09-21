/* As letras que têm mais de uma leitura.
 *
 * O curso explicava em prosa que {{ש}} soa "ch" ou "s" conforme o lado do
 * ponto, e nunca pedia ao aluno para usar essa diferença: dava para terminar
 * a lição sem nunca ter decidido, uma vez que fosse, de que lado estava o
 * ponto. E havia um botão de áudio só, para uma letra com duas leituras.
 */

import { describe, expect, it } from 'vitest';
import { allLetters } from '@/lib/content';
import { buildLetterPractice } from '@/lib/engine/exercises';
import { exLetterVariant, exVariantSyllable } from '@/lib/engine/generators';
import { rng } from '@/lib/engine/rng';

const letras = allLetters();
const ctx = () => ({ history: letras, alphabet: [], allGlyphs: [], sentences: [], nikud: [] });

describe('as leituras estão no dado', () => {
  it('toda letra de dois sons descreve as suas leituras', () => {
    const doisSons = letras.filter(l => / ou /.test(l.sound));
    expect(doisSons.map(l => l.id).sort()).toEqual(['bet', 'kaf', 'pe']);
    for (const l of doisSons) {
      expect(l.variantes.length, l.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('o shin também, mesmo sem "ou" no campo de som', () => {
    /* O som declarado do shin é só /ʃ/ - o sin é a outra letra que divide o
       desenho. É o caso que a regra automática não pegaria, e é o mais
       importante de todos. */
    const shin = letras.find(l => l.id === 'shin')!;
    expect(shin.variantes.map(v => v.nomePt)).toEqual(['Shin', 'Sin']);
  });

  it('cada leitura tem o SEU áudio, e nunca o da outra', () => {
    /* A razão de existir deste campo. Um id compartilhado faria o botão do
       Sin tocar o som do Shin no dia em que as gravações entrarem - e esse
       é o tipo de defeito que ninguém percebe sem ouvir os dois seguidos. */
    for (const l of letras) {
      if (!l.variantes.length) continue;
      const ids = l.variantes.map(v => v.audioId);
      expect(new Set(ids).size, `${l.id}: áudio repetido entre leituras`).toBe(ids.length);
      for (const id of ids) expect(id, l.id).toMatch(/^he-[0-9a-f]{8}$/);
    }
  });

  it('a variante é sempre a própria letra, com sinal', () => {
    for (const l of letras) {
      for (const v of l.variantes) {
        const temBase = [...v.he].some(c => c === l.letter || c === l.finalForm);
        expect(temBase, `${l.id}: "${v.he}" não é ${l.letter}`).toBe(true);
      }
    }
  });
});

describe('o exercício que faltava', () => {
  const shin = letras.find(l => l.id === 'shin')!;

  it('dá o som e pede o desenho', () => {
    const ex = exLetterVariant(shin, ctx() as never, rng('v1'), 0) as
      { kind: string; promptPt: string; options: string[]; answer: number };
    expect(ex).toBeTruthy();
    expect(ex.kind).toBe('letter-variant');
    /* O enunciado traz o SOM; as alternativas são os desenhos. */
    expect(ex.promptPt).toMatch(/CH|S de/);
    expect(['שׁ', 'שׂ']).toContain(ex.options[ex.answer]);
  });

  it('põe na mesa as duas leituras e a letra sem sinal', () => {
    /* A terceira alternativa é a mais instrutiva: a letra crua, do jeito
       que ela aparece num texto sem niqqud, em que nada diz qual leitura
       é. E três alternativas tiram a pergunta do cara ou coroa - o mesmo
       invariante que vale para o resto da suíte. */
    const ex = exLetterVariant(shin, ctx() as never, rng('v2'), 0) as
      { options: string[]; answer: number };
    expect(ex.options.length).toBeGreaterThanOrEqual(3);
    expect(ex.options).toContain('ש');
    expect(new Set(ex.options).size).toBe(ex.options.length);
    expect(ex.answer).toBeGreaterThanOrEqual(0);
    expect(ex.answer).toBeLessThan(ex.options.length);
  });

  it('o retorno de um erro diz ONDE OLHAR, e não só que errou', () => {
    const ex = exLetterVariant(shin, ctx() as never, rng('v3'), 0) as
      { whyPt: (string | null)[]; answer: number; explainPt: string };
    const errada = ex.whyPt.find((w, i) => i !== ex.answer && w);
    expect(errada).toMatch(/direita|esquerda/i);
    expect(ex.explainPt).toMatch(/direita|esquerda/i);
  });

  it('e nunca põe dois desenhos do mesmo som na mesma pergunta', () => {
    /* A pergunta dá o som e pede o desenho. Em {{כ}} e {{פ}} a forma final
       soa igual à forma sem ponto: perguntar “qual se lê F, sempre?” com
       {{פ}} e {{ף}} na mesa é cara ou coroa disfarçada de exercício. */
    for (const L of letras.filter(l => l.variantes.length)) {
      for (let i = 0; i < 4; i++) {
        const ex = exLetterVariant(L, ctx() as never, rng(`s-${L.id}-${i}`), i) as
          { options: string[]; answer: number } | null;
        if (!ex) continue;
        const somDe = new Map(L.variantes.map(v => [v.he, v.som]));
        const certa = ex.options[ex.answer]!;
        for (const o of ex.options) {
          if (o === certa) continue;
          expect(somDe.get(o), `${L.id}: "${o}" soa igual à resposta`)
            .not.toBe(somDe.get(certa));
        }
      }
    }
  });

  it('não existe para letra de uma leitura só', () => {
    const mem = letras.find(l => l.id === 'mem')!;
    expect(exLetterVariant(mem, ctx() as never, rng('v4'), 0)).toBeNull();
  });

  it('e não gera duas alternativas iguais em kaf, onde a final repete o som', () => {
    /* {{כ}} sem ponto e {{ך}} final têm o mesmo som. Três variantes, dois
       sons: a pergunta continua tendo uma resposta certa só. */
    const kaf = letras.find(l => l.id === 'kaf')!;
    const ex = exLetterVariant(kaf, ctx() as never, rng('v5'), 0) as { options: string[] };
    expect(new Set(ex.options).size).toBe(ex.options.length);
    /* Em kaf a forma sem ponto JÁ É a letra crua: as alternativas não
       podem ter duas iguais, e ainda assim precisam ser três. */
    expect(ex.options.length).toBeGreaterThanOrEqual(3);
  });
});

describe('a prática cobra a diferença, em todas as quatro', () => {
  it('nenhuma letra de duas leituras passa sem exercitar isso', () => {
    /* Era o buraco: a lição explicava, e a prática nunca pedia. E não bastou
       registrar o gerador - em {{ב}} e {{פ}}, letras tardias, as camadas
       anteriores lotavam o bloco de dez e a diferença que DEFINE a letra
       ficava de fora justamente nelas. */
    const letras = allLetters();
    for (const id of ['shin', 'bet', 'kaf', 'pe']) {
      const L = letras.find(l => l.id === id)!;
      const pratica = buildLetterPractice(L, letras.filter(x => x.order <= L.order),
        { audioAvailable: false, count: 10, seed: `p-${id}` });
      const tem = pratica.some(e => e.kind === 'letter-variant');
      expect(tem, `${id}: a prática não cobra as duas leituras`).toBe(true);
    }
  });

  it('em {{ב}} a diferença é cobrada dentro de uma sílaba', () => {
    /* No {{ב}} a forma sem ponto JÁ É a letra crua e não há forma final:
       só existem dois desenhos, e uma pergunta de dois é cara ou coroa.
       ({{כ}} e {{פ}} escapam porque têm {{ך}} e {{ף}}, o terceiro desenho.)
       Subir para a sílaba devolve quatro alternativas de verdade - duas
       leituras × duas vogais - sem baixar a exigência e sem inventar
       distrator. */
    {
      const bet = letras.find(l => l.id === 'bet')!;
      expect(exLetterVariant(bet, ctx() as never, rng('bet'), 0)).toBeNull();
    }
    for (const id of ['bet', 'kaf', 'pe']) {
      const L = letras.find(l => l.id === id)!;
      const ex = exVariantSyllable(L, ctx() as never, rng(id), 0) as
        { kind: string; promptPt: string; options: string[]; answer: number;
          whyPt: (string | null)[] };
      expect(ex, id).toBeTruthy();
      expect(ex.kind).toBe('letter-variant');
      expect(ex.options.length, id).toBeGreaterThanOrEqual(3);
      expect(new Set(ex.options).size, `${id}: alternativa repetida`).toBe(ex.options.length);
      expect(ex.whyPt.filter(Boolean).length, id).toBe(ex.options.length - 1);
    }
  });

  it('e a sílaba montada é a letra certa com o sinal certo', () => {
    /* A troca mexe em sinais que se parecem: o daguesh de {{בּ}} e o ponto do
       shuruk em {{שׁוּ}} são o MESMO caractere. Trocar o do vav destruiria a
       vogal em vez de trocar a leitura. */
    const bet = letras.find(l => l.id === 'bet')!;
    const ex = exVariantSyllable(bet, ctx() as never, rng('bet'), 0) as { options: string[] };
    for (const o of ex.options) {
      expect(o.normalize('NFC'), o).toBe(o);
      expect([...o][0], o).toBe('ב');
    }
    /* As quatro são duas leituras × duas vogais: metade leva daguesh. */
    const comPonto = ex.options.filter(o => o.includes('\u05BC')).length;
    expect(comPonto).toBe(ex.options.length / 2);
  });

  it('nunca começa uma sílaba com a forma final', () => {
    /* {{ך}} e {{ף}} só existem no fim de uma palavra. Uma sílaba solta
       começada por elas não é hebraico, e sairia impressa como se fosse. */
    for (const id of ['kaf', 'pe']) {
      const L = letras.find(l => l.id === id)!;
      for (let i = 0; i < 4; i++) {
        const ex = exVariantSyllable(L, ctx() as never, rng(`${id}-${i}`), i) as
          { options: string[] } | null;
        for (const o of ex?.options ?? []) {
          expect([...o][0], `${id}: ${o}`).not.toBe(L.finalForm);
        }
      }
    }
  });
});
