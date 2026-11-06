/* O bloco P0 da auditoria de 23/09 (AUDITORIA-EXERCICIOS.md, seção 12).
 * ─────────────────────────────────────────────────────────────────────────
 * Cada teste aqui trava um achado medido. Todos foram vistos FALHAR contra o
 * motor anterior antes de passar - um teste que nunca falhou não prova que
 * pegaria a volta do defeito.
 */

import { describe, expect, it } from 'vitest';
import { allLetters } from '../src/lib/content';
import {
  assinatura, buildLetterPractice, buildMiniTest, INTERVALOS_DE_REVISAO, isChoice, violatesOrderRule
} from '../src/lib/engine/exercises';
import { typedIsCorrect } from '../src/lib/engine/types';
import { deLetras, habilidadeDoJogo, montarBaralho, perguntasDe } from '../src/lib/engine/deck';
import type { Exercise } from '../src/lib/engine/types';

const letters = allLetters();
const historyOf = (order: number) => letters.filter(l => l.order <= order);

describe('P0-2 · a fixação cobra a variante', () => {
  const comDuas = letters.filter(l => (l.variantes?.length ?? 0) >= 2);

  it('existem as quatro letras de duas leituras', () => {
    expect(comDuas.map(l => l.id).sort()).toEqual(['bet', 'kaf', 'pe', 'shin']);
  });

  it('toda fixação delas, em cinco tentativas, tem um item de variante', () => {
    const sem: string[] = [];
    for (const L of comDuas) {
      for (let t = 0; t < 5; t++) {
        const mini = buildMiniTest(L, historyOf(L.order), { seed: `mini-${L.id}-${t}` });
        if (!mini.some(e => e.kind === 'letter-variant')) sem.push(`${L.namePt} tentativa ${t}`);
      }
    }
    expect(sem).toEqual([]);
  });

  it('e a fixação continua com vinte itens', () => {
    for (const L of comDuas) {
      expect(buildMiniTest(L, historyOf(L.order), { seed: `mini-${L.id}-0` })).toHaveLength(20);
    }
  });
});

describe('P0-3 · cada jogo grava a habilidade que exercita', () => {
  it('o tipo do par decide a habilidade', () => {
    expect(habilidadeDoJogo('nome:mem')).toBe('rec');
    expect(habilidadeDoJogo('som:mem:he:3')).toBe('som');
    expect(habilidadeDoJogo('sil:mem:a:pt:0')).toBe('ler');
    expect(habilidadeDoJogo('pal:mem:אמא:he:1')).toBe('ler');
    /* Caça, Batalha e Cursiva: forma pura. */
    expect(habilidadeDoJogo('c3')).toBe('rec');
    expect(habilidadeDoJogo('f4-2')).toBe('rec');
  });

  it('os ids que o baralho produz de verdade carregam o tipo', () => {
    const fontes = deLetras(letters, ['nome', 'som', 'silaba', 'palavra']);
    const baralho = montarBaralho(fontes, { quantos: 40, semente: 'p0' });
    const perguntas = perguntasDe(baralho, fontes, { semente: 'p0-q', sentido: 'misto' });
    const vistas = new Set(perguntas.map(q => `${q.tipo}>${habilidadeDoJogo(q.id)}`));
    expect(vistas).toEqual(new Set(['nome>rec', 'som>som', 'silaba>ler', 'palavra>ler']));
  });
});

describe('P0-5 · o filtro de repetidas enxerga o item de ligar', () => {
  const liga = (pares: [string, string][]): Exercise => ({
    id: 'x', kind: 'match', letterId: 'mem', skill: 'som',
    promptPt: 'Ligue cada letra ao seu som.', explainPt: '',
    pairs: pares.map(([left, right]) => ({ left, right })),
    leftKind: 'glyph', rightKind: 'text', labelLeft: 'Letra', labelRight: 'Som'
  });

  it('ligações diferentes têm assinaturas diferentes', () => {
    expect(assinatura(liga([['מ', 'm'], ['ת', 't'], ['נ', 'n']])))
      .not.toBe(assinatura(liga([['מ', 'm'], ['ה', 'h'], ['י', 'y']])));
  });

  it('a mesma ligação em outra ordem é a mesma pergunta', () => {
    expect(assinatura(liga([['מ', 'm'], ['ת', 't'], ['נ', 'n']])))
      .toBe(assinatura(liga([['נ', 'n'], ['מ', 'm'], ['ת', 't']])));
  });
});

describe('P0-6 · nenhuma letra some depois de ensinada', () => {
  /* Em que lições cada letra volta como alvo, para quem não erra. */
  const voltas = new Map<string, Set<number>>();
  for (const L of letters) {
    const h = historyOf(L.order);
    const itens = [
      ...buildLetterPractice(L, h, { seed: `pratica-${L.id}` }),
      ...buildMiniTest(L, h, { seed: `mini-${L.id}-0` })
    ];
    for (const e of itens) {
      if (e.letterId === L.id) continue;
      if (!voltas.has(e.letterId)) voltas.set(e.letterId, new Set());
      voltas.get(e.letterId)!.add(L.order);
    }
  }

  it('toda letra volta em n+1, n+2, n+4, n+8 e n+16', () => {
    const faltas: string[] = [];
    for (const A of letters) {
      for (const d of INTERVALOS_DE_REVISAO) {
        if (A.order + d > letters.length) continue;
        if (!voltas.get(A.id)?.has(A.order + d)) faltas.push(`${A.namePt} na lição ${A.order + d}`);
      }
    }
    expect(faltas).toEqual([]);
  });

  it('o maior intervalo sem ver uma letra é de no máximo 8 lições', () => {
    const longos: string[] = [];
    for (const A of letters) {
      const vezes = [A.order, ...[...(voltas.get(A.id) ?? [])].sort((a, b) => a - b), letters.length + 1];
      for (let i = 1; i < vezes.length; i++) {
        const buraco = vezes[i]! - vezes[i - 1]! - 1;
        if (buraco > 8) longos.push(`${A.namePt}: ${buraco} lições`);
      }
    }
    expect(longos).toEqual([]);
  });

  it('muitas letras fracas não expulsam as devidas', () => {
    const L = letters.find(l => l.id === 'tsadi')!;
    const h = historyOf(L.order);
    const weak = h.filter(x => x.id !== L.id && x.order < 6).map(x => x.id);
    const alvos = new Set(buildLetterPractice(L, h, { seed: 'x', weak }).map(e => e.letterId));
    /* Tsadi é a 18ª: devidas as de ordem 17, 16, 14 e 10. Pelo menos as duas
       de intervalo mais longo têm de sobreviver a cinco fracas. */
    const devidas = h.filter(x => [10, 14].includes(x.order)).map(x => x.id);
    expect(devidas.filter(id => !alvos.has(id))).toEqual([]);
  });
});

/* A família de um item, lida do id: `nun-inword-3` → `inword`. */
const familia = (id: string) => id.replace(/^[a-z]+-/, '').replace(/-\d+$/, '')
  .replace(/^frase-.*/, 'frase').replace(/^parvogal-.*/, 'parvogal');

function unidade(L: typeof letters[number], tentativa = 0) {
  const h = historyOf(L.order);
  return {
    pratica: buildLetterPractice(L, h, { seed: `pratica-${L.id}` }),
    mini: buildMiniTest(L, h, { seed: `mini-${L.id}-${tentativa}` })
  };
}

describe('P0-1 · a lição deixa de ser a mesma lição', () => {
  const todas = letters.map(L => ({ L, ...unidade(L) }));

  it('nenhuma fixação repete a sequência de gestos da letra anterior', () => {
    const seq = todas.map(u => u.mini.map(e => familia(e.id)).join(','));
    const iguais = seq.map((s, i) => i > 0 && s === seq[i - 1] ? todas[i]!.L.namePt : null)
      .filter(Boolean);
    expect(iguais).toEqual([]);
  });

  it('as letras 3 a 11 não recebem mais o mesmo conjunto de exercícios', () => {
    const conjuntos = todas.slice(2, 11).map(u =>
      [...new Set([...u.pratica, ...u.mini].filter(e => e.letterId === u.L.id).map(e => familia(e.id)))]
        .sort().join(','));
    /* Antes: 1 conjunto para as nove. */
    expect(new Set(conjuntos).size).toBeGreaterThanOrEqual(6);
  });

  it('os gestos que eram decorativos aparecem de verdade', () => {
    const conta = new Map<string, number>();
    for (const u of todas) for (const e of [...u.pratica, ...u.mini]) {
      conta.set(familia(e.id), (conta.get(familia(e.id)) ?? 0) + 1);
    }
    /* Medido antes: vow 8, odd 2, gap 2, bwd 1, s2s 0, tsy/typ 0. */
    const pobres = ['vow', 'odd', 'gap', 'bwd', 's2s', 'm2w', 'typ', 'tsy']
      .filter(f => (conta.get(f) ?? 0) < 10)
      .map(f => `${f}: ${conta.get(f) ?? 0}`);
    expect(pobres).toEqual([]);
  });

  it('escolha múltipla não passa de 82% do curso (era 84%)', () => {
    const itens = todas.flatMap(u => [...u.pratica, ...u.mini]);
    expect(itens.filter(isChoice).length / itens.length).toBeLessThanOrEqual(0.82);
  });

  it('toda letra tem pelo menos 11 famílias de exercício (eram 10)', () => {
    const pobres = todas
      .map(u => ({ L: u.L, n: new Set([...u.pratica, ...u.mini]
        .filter(e => e.letterId === u.L.id).map(e => familia(e.id))).size }))
      .filter(x => x.n < 11)
      .map(x => `${x.L.namePt}: ${x.n}`);
    expect(pobres).toEqual([]);
  });
});

describe('P0-4 · recuperação ativa na prática e na fixação', () => {
  it('toda fixação, em cinco tentativas, tem exatamente um item digitado', () => {
    const erradas: string[] = [];
    for (const L of letters) for (let t = 0; t < 5; t++) {
      const n = unidade(L, t).mini.filter(e => e.kind === 'type-answer').length;
      if (n !== 1) erradas.push(`${L.namePt} tentativa ${t}: ${n}`);
    }
    expect(erradas).toEqual([]);
  });

  it('toda prática tem um item digitado antes da fixação cobrar', () => {
    const sem = letters.filter(L => !unidade(L).pratica.some(e => e.kind === 'type-answer'))
      .map(L => L.namePt);
    expect(sem).toEqual([]);
  });

  it('o que se digita é legível com as letras já ensinadas', () => {
    const furos: string[] = [];
    for (const L of letters) for (let t = 0; t < 3; t++) {
      const { pratica, mini } = unidade(L, t);
      for (const e of [...pratica, ...mini]) {
        const v = violatesOrderRule(e, L.alphabetSoFar);
        if (v.length) furos.push(`${L.namePt} ${e.id}: ${v.join(' ')}`);
      }
    }
    expect(furos).toEqual([]);
  });

  it('a resposta aceita é a transliteração do que está na tela', () => {
    for (const L of letters) {
      for (const e of [...unidade(L).pratica, ...unidade(L).mini]) {
        if (e.kind !== 'type-answer') continue;
        expect(e.accept.length).toBeGreaterThan(0);
        expect(typedIsCorrect(e.accept[0]!, e.accept)).toBe(true);
      }
    }
  });
});

describe('P0-4 · a comparação do digitado é tolerante onde deve e só onde deve', () => {
  it('aceita as grafias brasileiras do mesmo som', () => {
    expect(typedIsCorrect('imma', ['imá'])).toBe(true);
    expect(typedIsCorrect('abba', ['abá'])).toBe(true);
    expect(typedIsCorrect('shabbat', ['shabat'])).toBe(true);
    expect(typedIsCorrect('iam', ['yam'])).toBe(true);
    expect(typedIsCorrect('tiul', ['tiyul'])).toBe(true);
    expect(typedIsCorrect('lekhem', ['léchem'])).toBe(true);
    expect(typedIsCorrect('eretz', ['érets'])).toBe(true);
  });

  it('não apaga as diferenças que o curso ensina', () => {
    /* O "ch" do português é o som do שׁ: aceitar isto confundiria שׁ e ח. */
    expect(typedIsCorrect('chalom', ['shalom'])).toBe(false);
    expect(typedIsCorrect('sam', ['sham'])).toBe(false);
    expect(typedIsCorrect('ma', ['mi'])).toBe(false);
    /* Duas vogais seguidas são duas sílabas: שָׁעָה não é "sha". */
    expect(typedIsCorrect('sha', ['shaá'])).toBe(false);
  });
});
