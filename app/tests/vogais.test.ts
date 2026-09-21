/* Os pares de vogal: dois desenhos, um som.
 *
 * A introdução do nikud promete ao aluno, com todas as letras, que a
 * dificuldade de verdade é haver dois sinais para o mesmo som. Por muito
 * tempo essa foi a única dificuldade que o curso NOMEAVA e não exercitava -
 * e não por descuido: as sílabas de uma letra trazem um sinal por som, então
 * a segunda grafia não era mostrada em lugar nenhum. Um aluno podia terminar
 * o curso sem nunca ter visto um kamats.
 */

import { describe, expect, it } from 'vitest';
import { allLetters, nikud, sentencesUpTo } from '@/lib/content';
import { exVowelPair, type Ctx } from '@/lib/engine/generators';
import { rng } from '@/lib/engine/rng';

const letras = allLetters();
const ctx = (ordem: number): Ctx => ({
  history: letras.filter(l => l.order <= ordem),
  alphabet: letras.find(l => l.order === ordem)!.alphabetSoFar,
  allGlyphs: letras.flatMap(l => (l.finalForm ? [l.letter, l.finalForm] : [l.letter])),
  sentences: sentencesUpTo(ordem),
  nikud: nikud().sounds
});

const gerar = (ordem: number, i: number) => {
  const L = letras.find(l => l.order === ordem)!;
  return exVowelPair(L, ctx(ordem), rng(`vogal-${ordem}-${i}`), i);
};

describe('a segunda grafia de cada som é mostrada', () => {
  it('cobre os quatro sons que se escrevem de dois jeitos', () => {
    const sons = nikud().sounds.filter(s => s.signs.length >= 2).map(s => s.sound);
    /* a, e, o, u. Se um dia `i` ganhar segunda grafia, este caso passa a
       exigi-la sem ninguém editar nada. */
    expect(sons.length).toBeGreaterThanOrEqual(4);

    const gerados = sons.map((_, i) => gerar(1, i)).filter(Boolean);
    expect(gerados.length).toBe(sons.length);
    /* Um item por som, e nenhum repetido. */
    expect(new Set(gerados.map(e => e!.id)).size).toBe(sons.length);
  });

  it('mostra as DUAS grafias, e elas são diferentes', () => {
    for (let i = 0; i < 4; i++) {
      const ex = gerar(3, i);
      expect(ex, `som ${i}`).toBeTruthy();
      const partes = (ex as { he: string }).he.split(/\s+/).filter(Boolean);
      expect(partes.length, `som ${i}`).toBe(2);
      expect(partes[0], `som ${i}: as duas grafias saíram iguais`).not.toBe(partes[1]);
      /* E as duas são a MESMA consoante: o que muda é só o sinal. */
      const L = letras.find(l => l.order === 3)!;
      for (const p of partes) expect(p.startsWith(L.letter), `som ${i}`).toBe(true);
    }
  });

  it('tem uma resposta certa só, e não é chute de 50%', () => {
    for (let i = 0; i < 4; i++) {
      const ex = gerar(5, i) as { options: string[]; answer: number } | null;
      expect(ex).toBeTruthy();
      /* O invariante da suíte inteira: três alternativas, no mínimo. Uma
         pergunta de sim ou não daria 50% no chute, e este item entra em
         prova - foi por isso que o primeiro desenho deste gerador, binário,
         foi descartado. */
      expect(ex!.options.length).toBeGreaterThanOrEqual(3);
      expect(new Set(ex!.options).size).toBe(ex!.options.length);
      expect(ex!.answer).toBeGreaterThanOrEqual(0);
      expect(ex!.answer).toBeLessThan(ex!.options.length);
    }
  });

  it('a explicação nomeia os dois sinais', () => {
    const ex = gerar(2, 0) as { explainPt: string } | null;
    expect(ex).toBeTruthy();
    const nomes = nikud().sounds.find(s => s.sound === 'a')!.signs.map(g => g.namePt);
    for (const n of nomes) expect(ex!.explainPt).toContain(n);
  });
});
