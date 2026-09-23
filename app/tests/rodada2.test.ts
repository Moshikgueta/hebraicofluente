/* A rodada de 23/09: palavras que se constroem, cursiva em palavra, digitação
 * em hebraico, vocabulário, "você lê N palavras" e o nome em hebraico.
 * ─────────────────────────────────────────────────────────────────────────
 * Cada bloco trava um critério de conclusão do pedido. O que mais importa é
 * o primeiro deles, porque é a regra que o curso inteiro existe para guardar:
 * nenhuma atividade nova mostra uma letra que o aluno ainda não aprendeu.
 */

import { describe, expect, it } from 'vitest';
import { allLetters } from '../src/lib/content';
import {
  buildLetterPractice, buildMiniTest, violatesOrderRule, type Exercise
} from '../src/lib/engine/exercises';
import {
  CURSIVA_DESDE, MARCOS_DE_LEITURA, alfabetoDe, exBuildLetters, exBuildLettersCursive,
  exTypeHebrew, hebraicoDigitadoCerto, letrasDaGrafia, nivelDeConstrucao, palavraEmCursiva,
  palavrasLegiveis, pareceTecladoLatino, todasAsLetrasEnsinadas, vocabularioDoCurso
} from '../src/lib/engine/palavras';
import { GYM_MODES, buildGym } from '../src/lib/engine/gym';
import { leituraDe } from '../src/lib/leitura';
import { GERESH, disponibilidade, letrasDoNome, sugerirNome } from '../src/lib/nome-hebraico';
import { ACHIEVEMENTS, syncAchievements } from '../src/lib/state/rules';
import { mergeStates } from '../src/lib/state/merge';
import { migrate } from '../src/lib/state/migrate';
import { EMPTY_STATE, type LearnerState } from '../src/lib/state/types';
import { FINAL_TO_BASE, stripNikud } from '../src/lib/hebrew';
import { rng } from '../src/lib/engine/rng';

const letters = allLetters();
const historyOf = (o: number) => letters.filter(l => l.order <= o);
const ctxDe = (o: number) => {
  const L = letters.find(l => l.order === o)!;
  return {
    L,
    ctx: {
      history: historyOf(o), alphabet: L.alphabetSoFar, allGlyphs: [], sentences: [], nikud: []
    }
  };
};
const comLicoes = (n: number): LearnerState => ({
  ...EMPTY_STATE,
  lessons: Object.fromEntries(letters.slice(0, n).map(l => [l.id, {
    letterId: l.id, stagesDone: [1, 2, 3, 4, 5], quizBest: 0.9, quizAttempts: 1,
    perfectBonusPaid: false, completedAt: '2026-09-23T10:00:00.000Z'
  }]))
});
const unidade = (o: number, t = 0): Exercise[] => {
  const L = letters.find(l => l.order === o)!;
  return [
    ...buildLetterPractice(L, historyOf(o), { seed: `pratica-${L.id}` }),
    ...buildMiniTest(L, historyOf(o), { seed: `mini-${L.id}-${t}` })
  ];
};

describe('nenhuma atividade nova revela letra futura', () => {
  it('montar, cursiva e digitar - em todas as letras, cinco tentativas', () => {
    const furos: string[] = [];
    for (const L of letters) for (let t = 0; t < 5; t++) {
      for (const e of unidade(L.order, t)) {
        if (!['build-letters', 'cursive-word', 'type-hebrew'].includes(e.kind)) continue;
        const v = violatesOrderRule(e, L.alphabetSoFar);
        if (v.length) furos.push(`${L.namePt} ${e.id}: ${v.join(' ')}`);
      }
    }
    expect(furos).toEqual([]);
  });

  it('peça por peça: toda letra na mesa já foi ensinada, inclusive o ו vogal', () => {
    for (const L of letters) for (let i = 0; i < 8; i++) {
      const { ctx } = ctxDe(L.order);
      for (const gen of [exBuildLetters, exBuildLettersCursive]) {
        const e = gen(L, ctx as never, rng(`t${i}`), i);
        if (!e || e.kind !== 'build-letters') continue;
        const ok = new Set(L.alphabetSoFar.map(g => FINAL_TO_BASE[g] ?? g));
        for (const t of e.tiles) expect(ok.has(FINAL_TO_BASE[t] ?? t), `${L.namePt}: ${t}`).toBe(true);
      }
    }
  });

  it('a régua estrita recusa o ו de מוֹ antes do Vav, e a de leitura aceita', () => {
    const mem = letters.find(l => l.id === 'mem')!;
    expect(todasAsLetrasEnsinadas('מוֹ', mem.alphabetSoFar)).toBe(false);
  });

  it('digitar em hebraico nunca aparece numa lição - só na academia', () => {
    const naLicao = letters.flatMap(L => unidade(L.order)).filter(e => e.kind === 'type-hebrew');
    expect(naLicao).toEqual([]);
    expect(GYM_MODES.find(m => m.id === 'digitar')?.needsKeyboard).toBe(true);
    expect(GYM_MODES.filter(m => m.needsKeyboard).map(m => m.id)).toEqual(['digitar']);
  });
});

describe('construir a palavra', () => {
  it('a mesa tem todas as letras da resposta, na quantidade certa', () => {
    for (const L of letters.slice(1)) {
      const { ctx } = ctxDe(L.order);
      const e = exBuildLetters(L, ctx as never, rng('m'), 0);
      if (!e || e.kind !== 'build-letters') continue;
      const mesa = [...e.tiles];
      for (const g of e.letras) {
        const k = mesa.indexOf(g);
        expect(k, `${L.namePt}: falta ${g}`).toBeGreaterThanOrEqual(0);
        mesa.splice(k, 1);
      }
      expect(e.letras.join('')).toBe(letrasDaGrafia(e.target).join(''));
    }
  });

  it('três níveis: sem distrator, com um ou dois, com parecidas', () => {
    expect(nivelDeConstrucao(3)).toBe('inicial');
    expect(nivelDeConstrucao(10)).toBe('intermediario');
    expect(nivelDeConstrucao(18)).toBe('avancado');
    const extras = (o: number) => {
      const { L, ctx } = ctxDe(o);
      const e = exBuildLetters(L, ctx as never, rng('n'), 0);
      return e && e.kind === 'build-letters' ? e.tiles.length - e.letras.length : -1;
    };
    expect(extras(4)).toBe(0);
    expect(extras(10)).toBeGreaterThanOrEqual(1);
    expect(extras(10)).toBeLessThanOrEqual(2);
    expect(extras(18)).toBeGreaterThanOrEqual(1);
  });

  it('o avançado tira o significado da tela e põe as parecidas na mesa', () => {
    const { L, ctx } = ctxDe(21);
    let comParecida = 0;
    for (let i = 0; i < 6; i++) {
      const e = exBuildLetters(L, ctx as never, rng(`a${i}`), i);
      if (!e || e.kind !== 'build-letters') continue;
      expect(e.pt).toBeNull();
      const donos = historyOf(21).filter(x => e.letras.includes(x.letter));
      const parecidas = new Set(donos.flatMap(x => x.confusableWith).map(g => FINAL_TO_BASE[g] ?? g));
      if (e.tiles.some(t => !e.letras.includes(t) && parecidas.has(t))) comParecida++;
    }
    expect(comParecida).toBeGreaterThan(0);
  });

  it('entra no curso de verdade: toda letra com palavra montável tem um item de montar', () => {
    const sem = letters.slice(1).filter(L => !unidade(L.order).some(e => e.kind === 'build-letters'))
      .map(L => L.namePt);
    expect(sem).toEqual([]);
  });

  it('e é leitura, não reconhecimento', () => {
    const itens = letters.flatMap(L => unidade(L.order)).filter(e => e.kind === 'build-letters');
    expect(new Set(itens.map(e => e.skill))).toEqual(new Set(['ler']));
  });
});

describe('a palavra em cursiva', () => {
  it('cada etapa entra na letra em que foi marcada, e não antes', () => {
    for (const modo of Object.keys(CURSIVA_DESDE) as (keyof typeof CURSIVA_DESDE)[]) {
      const gen = palavraEmCursiva(modo);
      for (const L of letters) {
        const { ctx } = ctxDe(L.order);
        const e = gen(L, ctx as never, rng('c'), 0);
        if (L.order < CURSIVA_DESDE[modo]) expect(e, `${modo} em ${L.namePt}`).toBeNull();
      }
    }
  });

  it('nenhuma pergunta tem duas alternativas com a mesma grafia sem vogal', () => {
    for (const modo of ['qual-palavra', 'para-cursiva'] as const) {
      const gen = palavraEmCursiva(modo);
      for (const L of letters) for (let i = 0; i < 5; i++) {
        const { ctx } = ctxDe(L.order);
        const e = gen(L, ctx as never, rng(`d${i}`), i);
        if (!e || e.kind !== 'cursive-word') continue;
        const esq = e.options.map(o => letrasDaGrafia(o).map(g => FINAL_TO_BASE[g] ?? g).join(''));
        expect(new Set(esq).size, `${L.namePt} ${modo}`).toBe(esq.length);
        expect(e.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('a palavra à mão é mostrada sem vogais', () => {
    const { L, ctx } = ctxDe(12);
    const e = palavraEmCursiva('significado')(L, ctx as never, rng('s'), 0);
    expect(e && e.kind === 'cursive-word' && e.escrita === stripNikud(e.he)).toBe(true);
  });

  it('aparece no curso: pelo menos 25 itens de cursiva em palavra numa passagem', () => {
    const n = letters.flatMap(L => unidade(L.order)).filter(e => e.kind === 'cursive-word').length;
    expect(n).toBeGreaterThanOrEqual(25);
  });

  it('ler cursiva é `ler`; a letra destacada é `rec`', () => {
    const itens = letters.flatMap(L => unidade(L.order)).filter(e => e.kind === 'cursive-word');
    for (const e of itens) {
      if (e.kind !== 'cursive-word') continue;
      expect(e.skill).toBe(e.modo === 'letra' ? 'rec' : 'ler');
    }
  });
});

describe('digitar em hebraico', () => {
  it('aceita sem vogais e sem exigir a forma final', () => {
    expect(hebraicoDigitadoCerto('אמא', ['אמא'])).toBe(true);
    expect(hebraicoDigitadoCerto('שלום', ['שלום'])).toBe(true);
    expect(hebraicoDigitadoCerto('שלומ', ['שלום'])).toBe(true);
    expect(hebraicoDigitadoCerto('שָׁלוֹם', ['שלום'])).toBe(true);
  });
  it('e recusa a letra errada', () => {
    expect(hebraicoDigitadoCerto('שלוס', ['שלום'])).toBe(false);
    expect(hebraicoDigitadoCerto('', ['שלום'])).toBe(false);
  });
  it('percebe o teclado que não trocou', () => {
    expect(pareceTecladoLatino('shalom')).toBe(true);
    expect(pareceTecladoLatino('שלום')).toBe(false);
  });
  it('é `escrever`', () => {
    const { L, ctx } = ctxDe(12);
    expect(exTypeHebrew(L, ctx as never, rng('t'), 0)?.skill).toBe('escrever');
  });
});

describe('a academia oferece os três modos novos', () => {
  const tudo = comLicoes(22);
  for (const id of ['construir', 'palavras-cursiva', 'digitar'] as const) {
    it(id, () => {
      const mode = GYM_MODES.find(m => m.id === id)!;
      const run = buildGym(mode, tudo, letters, { audioAvailable: false, day: '2026-09-23' });
      expect(run.exercises.length).toBeGreaterThanOrEqual(5);
      const esperado = id === 'digitar' ? ['type-hebrew']
        : id === 'construir' ? ['build-letters'] : ['cursive-word', 'build-letters'];
      for (const e of run.exercises) expect(esperado).toContain(e.kind);
    });
  }
});

describe('"você já consegue ler N palavras"', () => {
  it('é calculado do vocabulário real e cresce a cada letra', () => {
    const vocab = vocabularioDoCurso(letters);
    expect(vocab.length).toBeGreaterThan(100);
    let antes = -1;
    for (let n = 0; n <= 22; n++) {
      const agora = leituraDe(comLicoes(n)).legiveis.length;
      expect(agora).toBeGreaterThanOrEqual(antes);
      antes = agora;
    }
    expect(leituraDe(comLicoes(0)).legiveis.length).toBe(0);
    expect(leituraDe(comLicoes(22)).legiveis.length).toBe(vocab.length);
  });

  it('bate com a regra de leitura, palavra por palavra', () => {
    const s = comLicoes(9);
    const alfa = alfabetoDe(letters.slice(0, 9));
    expect(leituraDe(s).legiveis.map(w => w.he))
      .toEqual(palavrasLegiveis(vocabularioDoCurso(letters), alfa).map(w => w.he));
  });

  it('os quatro marcos viram conquista quando gravados', () => {
    let s: LearnerState = { ...EMPTY_STATE };
    for (const m of MARCOS_DE_LEITURA) s = { ...s, firsts: { ...s.firsts, [`le-${m}`]: '2026-09-23' } };
    const ids = syncAchievements(s, '2026-09-23').state.achievements.map(a => a.id);
    for (const m of MARCOS_DE_LEITURA) expect(ids).toContain(`le-${m}`);
    expect(ACHIEVEMENTS.map(a => a.id)).toContain('meu-nome');
  });
});

describe('o nome em hebraico', () => {
  it('sugere pela convenção israelense, e diz quando há mais de um jeito', () => {
    expect(sugerirNome('Gabriel')[0]).toBe('גבריאל');
    expect(sugerirNome('Ana')[0]).toBe('אנה');
    expect(sugerirNome('Helena')[0]).toBe('אלנה');
    expect(sugerirNome('Daniel')[0]).toBe('דניאל');
    expect(sugerirNome('Moshik Gueta')).toContain('מושיק גואטה');
    expect(sugerirNome('Lucas').length).toBeGreaterThan(1);
  });

  it('usa a forma final e o gerech do J', () => {
    expect(sugerirNome('Miriam')[0]!.endsWith('ם')).toBe(true);
    expect(sugerirNome('Juliana')[0]!.startsWith(`ז${GERESH}`)).toBe(true);
  });

  it('só abre quando as letras do nome já foram concluídas, e diz quantas faltam', () => {
    const poucas = letters.slice(0, 5).map(l => l.letter);
    const d = disponibilidade('Gabriel', poucas);
    expect(d.escrevivel).toBeNull();
    expect(d.faltam).toBeGreaterThan(0);
    const todas = letters.map(l => l.letter);
    expect(disponibilidade('Gabriel', todas).escrevivel).toBe('גבריאל');
    expect(letrasDoNome('מושיק')).toEqual(['מ', 'ו', 'ש', 'י', 'ק']);
  });
});

describe('o estado novo é guardado e fundido', () => {
  it('uma gravação antiga ganha os campos novos vazios', () => {
    const velho = { ...EMPTY_STATE } as Record<string, unknown>;
    delete velho.nomeHebraico; delete velho.kinds;
    const m = migrate(velho);
    expect(m.nomeHebraico).toBeNull();
    expect(m.kinds).toEqual({});
  });

  it('o nome vale o confirmado por último; os contadores, o maior', () => {
    const a = { ...EMPTY_STATE, nomeHebraico: { texto: 'גטה', confirmadoEm: '2026-09-20' },
      kinds: { 'build-letters': { h: 5, m: 1 } } };
    const b = { ...EMPTY_STATE, nomeHebraico: { texto: 'גואטה', confirmadoEm: '2026-09-22' },
      kinds: { 'build-letters': { h: 3, m: 4 }, 'cursive-word': { h: 1, m: 0 } } };
    const f = mergeStates(a, b);
    expect(f.nomeHebraico?.texto).toBe('גואטה');
    expect(f.kinds['build-letters']).toEqual({ h: 5, m: 4 });
    expect(f.kinds['cursive-word']).toEqual({ h: 1, m: 0 });
    expect(mergeStates(b, a).nomeHebraico?.texto).toBe('גואטה');
  });
});
