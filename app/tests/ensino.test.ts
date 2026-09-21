/* A camada pedagógica de cada letra, no conteúdo QUE CHEGA NO APP.
 * ─────────────────────────────────────────────────────────────────────────
 * A V23 do validate.js já cobra tudo isto na FONTE (data/letters.json). Este
 * arquivo confere o outro lado da tubulação: o que o exportador de fato
 * entregou em app/content. São coisas diferentes, e a diferença já custou
 * caro neste projeto - um campo pode existir na fonte e não estar na lista
 * do exportador, e aí ele some sem que nada reclame: a tela renderiza
 * faltando um quadro, ninguém vê erro, e a lição fica pior do que as
 * vizinhas em silêncio.
 *
 * Foi exatamente assim que o `ensino` poderia ter nascido morto: ele é um
 * campo novo, e o exportador copia campo a campo.
 */

import { describe, expect, it } from 'vitest';
import { allLetters } from '@/lib/content';

const letras = allLetters();

describe('toda letra explica o que ela FAZ', () => {
  it('nenhuma letra chega ao app sem a camada de ensino', () => {
    const sem = letras.filter(l => !l.ensino).map(l => `${l.letter} ${l.namePt}`);
    expect(sem, 'o exportador não está copiando `ensino`').toEqual([]);
  });

  it('a função e o "o que lembrar" existem e dizem alguma coisa', () => {
    for (const l of letras) {
      expect(l.ensino.funcaoPt.trim().length, `${l.id}: funcaoPt`).toBeGreaterThan(40);
      expect(l.ensino.lembrePt.trim().length, `${l.id}: lembrePt`).toBeGreaterThan(40);
    }
  });

  it('quem tem forma final ou dois sons explica o detalhe', () => {
    /* Onde a ausência é omissão e não economia: o aluno VAI encontrar a
       forma final na leitura, e descobrir sozinho que "a letra mudou" é a
       pior forma de aprender isso. */
    const precisam = letras.filter(l => l.finalForm || / ou /.test(l.sound));
    expect(precisam.length, 'nenhuma letra com forma final?').toBeGreaterThanOrEqual(5);
    for (const l of precisam) {
      expect(l.ensino.detalhePt, `${l.id} tem forma final ou dois sons e não explica`).toBeTruthy();
    }
  });

  it('as cinco formas finais são todas explicadas', () => {
    const finais = letras.filter(l => l.finalForm);
    expect(finais.length).toBe(5);
    for (const l of finais) {
      /* A explicação tem de FALAR da forma final, e não só existir. O teste
         aceita o glifo ou a palavra "final": o texto pode mostrar o
         desenho ou nomear a coisa. */
      const t = l.ensino.detalhePt ?? '';
      expect(t.includes(l.finalForm!) || /final/i.test(t), `${l.id}`).toBe(true);
    }
  });
});

describe('a checagem de compreensão de cada letra', () => {
  it('toda letra pergunta pelo menos duas coisas', () => {
    for (const l of letras) {
      expect(l.ensino.checagem.length, `${l.id}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('nenhuma pergunta aponta para uma alternativa que não existe', () => {
    for (const l of letras) {
      l.ensino.checagem.forEach((p, i) => {
        const onde = `${l.id}[${i}]`;
        if (p.t === 'escolha' || p.t === 'visual') {
          expect(p.opcoes.length, onde).toBeGreaterThanOrEqual(2);
          expect(p.certa, onde).toBeGreaterThanOrEqual(0);
          expect(p.certa, onde).toBeLessThan(p.opcoes.length);
          expect(new Set(p.opcoes).size, `${onde}: alternativas repetidas`).toBe(p.opcoes.length);
        } else if (p.t === 'vf') {
          expect(typeof p.certa, onde).toBe('boolean');
        }
      });
    }
  });

  it('nenhum retorno é um "incorreto" disfarçado', () => {
    /* O curso não diz "Incorreto" sozinho em lugar nenhum: o motivo aparece
       sempre, inclusive no acerto. Um motivo de meia dúzia de palavras é a
       mesma coisa com outra roupa. */
    for (const l of letras) {
      for (const p of l.ensino.checagem) {
        expect(p.porque.trim().length, `${l.id}: "${p.q}"`).toBeGreaterThan(40);
      }
    }
  });

  it('a regra de ordem vale também no que a checagem mostra', () => {
    /* O mesmo princípio do curso inteiro: nenhuma tela mostra uma letra que
       ainda não foi ensinada. É o erro mais fácil de cometer escrevendo
       explicação - a frase mais clara do mundo não serve se o exemplo dela
       traz uma letra que o aluno só vê daqui a nove lições. */
    const ordemDe = new Map<string, number>();
    for (const l of letras) {
      ordemDe.set(l.letter, l.order);
      if (l.finalForm) ordemDe.set(l.finalForm, l.order);
    }
    /* O vav de `וֹ` e `וּ` não conta: ali ele é sinal de vogal, e o curso
       ensina essas vogais desde a primeira lição. */
    const semVogalVav = (s: string) => s.replace(/ו[ֹּ]/g, '');
    const consoantes = (s: string) => [...semVogalVav(s)].filter(c => ordemDe.has(c));

    for (const l of letras) {
      const marcado = (txt: string) =>
        [...txt.matchAll(/\{\{(.+?)\}\}/g)].map(m => m[1]).join(' ');

      const textos = [
        l.ensino.funcaoPt, l.ensino.detalhePt ?? '',
        l.ensino.paraBrasileiroPt ?? '', l.ensino.lembrePt
      ].map(marcado);

      for (const p of l.ensino.checagem) {
        textos.push(marcado(p.q), marcado(p.porque));
        if (p.t === 'visual') textos.push(p.opcoes.join(' '));
      }

      for (const t of textos) {
        for (const c of consoantes(t)) {
          expect(ordemDe.get(c)!, `${l.id} (ordem ${l.order}) mostra "${c}"`).toBeLessThanOrEqual(l.order);
        }
      }
    }
  });
});
