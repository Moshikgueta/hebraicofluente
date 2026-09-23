/* A prática deixa de girar em torno do A.
 * ─────────────────────────────────────────────────────────────────────────
 * O que estes casos travam foi um defeito que ninguém tinha como ver num
 * arquivo: todo gerador escolhe o seu item com `at(pool, i)` - a sílaba, a
 * palavra, o par de vogais -, e `i` é o número da RODADA. Nos construtores em
 * camadas a rodada só avança quando um gerador falha ou repete, então ela era
 * zero quase sempre.
 *
 * `at(pool, 0)` é o primeiro item de cada lista, e a primeira sílaba de toda
 * letra é a do A. Medido no estado anterior: das 22 lições, a prática inteira
 * do curso girava na mesma vogal, e a única coisa que mudava de uma letra
 * para a outra era a consoante. Quem fazia duas lições seguidas via o mesmo
 * exercício duas vezes, e tinha razão.
 *
 * Não é um teste de aparência: é o que separa "22 lições" de "uma lição
 * repetida 22 vezes". Por isso mede o CURSO INTEIRO, e não uma letra.
 */

import { describe, expect, it } from 'vitest';
import { allLetters } from '../src/lib/content';
import { buildLetterPractice, buildMiniTest } from '../src/lib/engine/exercises';

const letters = allLetters();
const historyOf = (order: number) => letters.filter(l => l.order <= order);

/** As vogais que aparecem em qualquer hebraico de um exercício.
 *
 *  O `u` NÃO é um sinal solto, e a primeira versão deste arquivo caiu por
 *  causa disso: ela procurava o kubutz e concluía que o curso nunca praticava
 *  o som U. O curso pratica - só que escreve «mu» com SHURUK, que é a letra
 *  vav com um ponto dentro, e não um sinal embaixo da consoante. O mesmo vale
 *  para o O com holam-vav.
 *
 *  Vale registrar porque é o erro clássico de quem mede hebraico com uma
 *  tabela de sinais: duas das cinco vogais do curso não são sinais, são
 *  letras. Um verificador que não sabe disso acusa o conteúdo de um buraco
 *  que ele não tem. */
const NIKUD: Record<string, string> = {
  '\u05B7': 'a', '\u05B8': 'a', '\u05B6': 'e', '\u05B5': 'e',
  '\u05B4': 'i', '\u05B0': 'sheva'
};

const COM_VAV = /\u05D5([\u05B9\u05BC])/g;

function vogaisDe(texto: string): string[] {
  const fora: string[] = [];
  /* Primeiro as duas escritas com vav: elas ocupam dois caracteres, e o laço
     de sinais soltos passaria por cima delas. */
  for (const m of texto.matchAll(COM_VAV)) fora.push(m[1] === '\u05B9' ? 'o' : 'u');
  for (const c of texto.replace(COM_VAV, '')) {
    const v = NIKUD[c];
    if (v && v !== 'sheva') fora.push(v);
  }
  return fora;
}

/** Toda vogal que o bloco mostra, no enunciado e nas alternativas. */
function vogaisDoBloco(itens: { promptPt: string; options?: string[] }[]): string[] {
  const fora: string[] = [];
  for (const ex of itens) {
    const campos = [ex.promptPt, ...(ex.options ?? []),
      ...Object.values(ex as Record<string, unknown>).filter((v): v is string => typeof v === 'string')];
    for (const c of campos) fora.push(...vogaisDe(c));
  }
  return fora;
}

describe('a prática não fica toda na mesma vogal', () => {
  it('o curso inteiro usa as cinco vogais, e nenhuma domina', () => {
    const conta: Record<string, number> = { a: 0, e: 0, i: 0, o: 0, u: 0 };
    for (const L of letters) {
      const bloco = buildLetterPractice(L, historyOf(L.order), { seed: `pratica-${L.id}` });
      for (const v of vogaisDoBloco(bloco)) if (v in conta) conta[v]! += 1;
    }
    const total = Object.values(conta).reduce((a, b) => a + b, 0);
    expect(total, 'nenhuma vogal encontrada - o leitor de nikud quebrou').toBeGreaterThan(50);

    /* As cinco existem. Antes do conserto, `e`, `i`, `o` e `u` apareciam
       quase só como DISTRATOR, nunca como o item medido. */
    for (const v of ['a', 'e', 'i', 'o', 'u']) {
      expect(conta[v], `a vogal ${v} não aparece na prática de nenhuma letra`).toBeGreaterThan(0);
    }

    /* E nenhuma leva mais da metade. O piso é generoso de propósito: o A é
       legitimamente mais comum em hebraico, e a regra existe para pegar a
       volta do "só o A", não para forçar uma divisão igual que a língua não
       tem. */
    const maior = Math.max(...Object.values(conta));
    expect(maior / total, `uma vogal sozinha leva ${Math.round(maior / total * 100)}% da prática`)
      .toBeLessThan(0.55);
  });

  it('letras diferentes não recebem o mesmo bloco de sempre', () => {
    /* A assinatura de um bloco é a sequência de GESTOS. Duas letras seguidas
       com a mesma sequência é a sensação de "é tudo igual" que o aluno
       relata, e ela era literal: a composição em camadas é fixa, então sem
       giro os blocos saíam idênticos em forma. */
    const formas = letters.map(L =>
      buildLetterPractice(L, historyOf(L.order), { seed: `pratica-${L.id}` })
        .map(e => e.kind).join(','));
    const distintas = new Set(formas).size;
    expect(distintas, 'as 22 letras recebem menos de 8 formas de bloco diferentes')
      .toBeGreaterThanOrEqual(8);
  });

  it('a mesma pergunta nunca aparece duas vezes no mesmo bloco', () => {
    for (const L of letters) {
      for (const bloco of [
        buildLetterPractice(L, historyOf(L.order), { seed: `pratica-${L.id}` }),
        buildMiniTest(L, historyOf(L.order), { seed: `mini-${L.id}-0` })
      ]) {
        const vistas = bloco.map(e =>
          [e.kind, e.promptPt, ((e as { options?: string[] }).options ?? []).join('|')].join('::'));
        expect(new Set(vistas).size, `${L.id} repete uma pergunta dentro do mesmo bloco`)
          .toBe(vistas.length);
      }
    }
  });
});

describe('a fixação cobra mais de um gesto', () => {
  it('toda letra recebe pelo menos quatro tipos diferentes', () => {
    const magros = letters
      .map(L => ({ id: L.id, tipos: new Set(buildMiniTest(L, historyOf(L.order), { seed: `mini-${L.id}-0` }).map(e => e.kind)).size }))
      .filter(x => x.tipos < 4);
    expect(magros, `fixações com menos de 4 tipos: ${magros.map(m => `${m.id}(${m.tipos})`).join(' ')}`)
      .toEqual([]);
  });

  it('e refazer devolve outras perguntas', () => {
    for (const L of letters.slice(0, 8)) {
      const hist = historyOf(L.order);
      const a = buildMiniTest(L, hist, { seed: `mini-${L.id}-0` }).map(e => e.id);
      const b = buildMiniTest(L, hist, { seed: `mini-${L.id}-1` }).map(e => e.id);
      const iguais = a.filter(id => b.includes(id)).length;
      expect(iguais, `${L.id}: refazer devolve ${iguais} de ${a.length} perguntas idênticas`)
        .toBeLessThan(a.length);
    }
  });
});
