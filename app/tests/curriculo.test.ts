/* A espinha do curso: módulos, checkpoints e o que cada um cobra.
 *
 * Estas provas são sobre a ESTRUTURA, não sobre o conteúdo de uma lição. Elas
 * existem porque a estrutura é gerada (`tools/export-content.mjs`) e uma regra
 * de geração errada não aparece em nenhuma tela: ela some. Foi o que
 * aconteceu com os dois últimos módulos, que ficaram sem verificação nenhuma
 * antes do exame final e ninguém notou - inclusive o mais difícil do curso.
 */

import { describe, expect, it } from 'vitest';
import { allLetters } from '@/lib/content';
import { course } from '@/lib/content-publico';
import { letrasDoCheckpoint } from '@/lib/content-servidor';
import { buildCheckpoint } from '@/lib/engine/exercises';

describe('todo módulo é verificado antes do exame final', () => {
  it('nenhum módulo fica sem checkpoint', () => {
    /* A regra antiga era `tem letras próprias ? checkpoint : null`. Ela
       descreve bem um módulo de LETRAS e esquece o de consolidação - e os
       dois últimos do curso são de consolidação. */
    const sem = course.modules.filter(m => !m.checkpoint).map(m => `M${m.n} ${m.titlePt}`);
    expect(sem).toEqual([]);
  });

  it('o checkpoint de um módulo de letras cobra o que ELE ensinou', () => {
    for (const m of course.modules.filter(x => x.letterIds.length)) {
      expect(m.checkpoint!.letterIds, `M${m.n}`).toEqual(m.letterIds);
      expect(m.checkpoint!.cumulativo, `M${m.n}`).toBeFalsy();
    }
  });

  it('o de um módulo de consolidação cobra tudo o que veio antes', () => {
    const consolidacao = course.modules.filter(m => !m.letterIds.length);
    /* Se um dia todo módulo passar a ensinar letra, este caso deixa de ter
       objeto - e aí ele avisa, em vez de passar vazio em silêncio. */
    expect(consolidacao.length, 'nenhum módulo de consolidação').toBeGreaterThan(0);

    for (const m of consolidacao) {
      const cp = m.checkpoint!;
      expect(cp.cumulativo, `M${m.n}`).toBe(true);
      /* Todas as letras dos módulos até aqui, e nenhuma de depois. */
      const esperado = course.modules
        .filter(x => x.n <= m.n).flatMap(x => x.letterIds);
      expect(cp.letterIds, `M${m.n}`).toEqual(esperado);
      expect(cp.letterIds.length, `M${m.n}`).toBe(course.totalLetters);
    }
  });
});

describe('o checkpoint tem o que perguntar', () => {
  it('monta 12 itens em todos os módulos, inclusive nos de consolidação', () => {
    for (const m of course.modules) {
      const cp = m.checkpoint!;
      const letras = letrasDoCheckpoint(cp.letterIds);
      /* O escopo tem de resolver para letras de verdade. Era aqui que o
         módulo de consolidação quebrava: `letrasDoModulo(6)` devolve lista
         vazia porque nenhuma letra pertence ao módulo 6. */
      expect(letras.length, `M${m.n}: escopo não resolveu`).toBe(cp.letterIds.length);

      const itens = buildCheckpoint(letras, letras, {
        audioAvailable: false, count: 12, seed: `cp-${m.n}-teste`
      });
      expect(itens.length, `M${m.n}`).toBe(12);
      /* Sem gravação nenhuma, nada de escuta pode entrar. */
      for (const ex of itens) expect(ex.skill, `M${m.n}`).not.toBe('ouvir');
    }
  });
});

describe('todo par de letras parecidas tem a frase que diz onde olhar', () => {
  /* O campo `contrastes` existe para que errar ד por ר devolva a DIFERENÇA, e
     não só o nome da letra certa. Sem frase, o retorno degrada para "essa é a
     letra X, olhe o desenho de novo" - que nomeia o erro e não o corrige, e o
     aluno erra de novo pelo mesmo motivo.

     A busca do motor é nos DOIS sentidos: quem escreve a frase em ד cobre
     também quem errar ר por ד. Então o par é a unidade, não a letra. */
  const letras = allLetters();
  const nfc = (x: string) => x.normalize('NFC');
  const chave = (a: string, b: string) => [nfc(a), nfc(b)].sort().join('|');

  const cobertos = new Set(
    letras.flatMap(l => Object.keys(l.contrastes ?? {}).map(g => chave(l.letter, g)))
  );

  it('nenhum par declarado fica sem frase', () => {
    const faltando = new Set<string>();
    for (const l of letras) {
      for (const g of l.confusableWith ?? []) {
        if (!cobertos.has(chave(l.letter, g))) faltando.add(chave(l.letter, g));
      }
    }
    expect([...faltando].map(k => k.replace('|', ' / '))).toEqual([]);
  });

  it('nenhuma letra fica sem nenhuma frase', () => {
    const sem = letras.filter(l => !Object.keys(l.contrastes ?? {}).length);
    expect(sem.map(l => `${l.letter} ${l.namePt}`)).toEqual([]);
  });

  it('a frase de um par cita as duas letras', () => {
    /* Uma frase que fala de uma letra só não serve para distinguir: o aluno
       precisa saber o que olhar EM CADA UMA.

       "Cita a letra" aceita a forma FINAL no lugar da base, e não por
       tolerância: em ם/ס quem se parece com o ס é o mem final, e a frase que
       está escrita fala dele. Exigir a base ali seria exigir que o conteúdo
       ficasse errado para o teste passar. */
    for (const l of letras) {
      const formas = [nfc(l.letter), ...(l.finalForm ? [nfc(l.finalForm)] : [])];
      for (const [glifo, frase] of Object.entries(l.contrastes ?? {})) {
        expect(formas.some(f => frase.includes(f)), `${l.letter}/${glifo}: não cita ${l.letter}`)
          .toBe(true);
        expect(frase, `${l.letter}/${glifo}: não cita ${glifo}`).toContain(nfc(glifo));
      }
    }
  });
});
