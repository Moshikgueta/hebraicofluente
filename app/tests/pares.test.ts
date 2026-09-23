/* As letras parecidas como PAR (auditoria de 23/09, itens P1 7, 11 e 12).
 * ─────────────────────────────────────────────────────────────────────────
 * Três promessas, cada uma vista falhando contra o motor anterior:
 *   · a lição treina a letra de hoje contra a gêmea dela, e revisa a gêmea
 *     contra a letra de hoje;
 *   · o modo "Letras parecidas" põe as duas na tela em TODO item;
 *   · a Batalha de quem não erra traz pares antigos, e não só os recentes.
 */

import { describe, expect, it } from 'vitest';
import { allLetters, type Letter } from '../src/lib/content';
import {
  buildConfusionDrill, buildLetterPractice, buildMiniTest, violatesOrderRule
} from '../src/lib/engine/exercises';
import { contrastesDoConteudo } from '../src/lib/engine/pares';
import { paresParaTreinar } from '../src/lib/engine/jogos';
import { EMPTY_STATE, type LearnerState } from '../src/lib/state/types';

const letters = allLetters();
const L = (id: string) => letters.find(l => l.id === id)!;
const historyOf = (order: number) => letters.filter(l => l.order <= order);

/** O item mostra as duas letras do par? */
function mostraOPar(e: { kind: string; options?: string[] }, a: Letter, b: Letter): boolean {
  const opts = e.options ?? [];
  const glifos = (x: Letter) => [x.letter, ...(x.finalForm ? [x.finalForm] : [])];
  const tem = (x: Letter) => opts.some(o => glifos(x).some(g => o.includes(g)));
  return tem(a) && tem(b);
}

describe('os contrastes saem do conteúdo', () => {
  const cs = contrastesDoConteudo(letters);
  const tem = (a: string, g: string) => cs.some(c => c.alvo.id === a && c.glifoRival === g);

  it('nos dois sentidos, quando a parecida é a forma base', () => {
    expect(tem('bet', 'כ') && tem('kaf', 'ב')).toBe(true);
    expect(tem('dalet', 'ר') && tem('resh', 'ד')).toBe(true);
    expect(tem('vav', 'ז') && tem('zayin', 'ו')).toBe(true);
  });

  it('e nunca a letra contra a própria forma final', () => {
    expect(cs.filter(c => c.alvo.id === c.rival.id)).toEqual([]);
  });
});

describe('a lição treina a gêmea', () => {
  it('na lição do Kaf, o Bet é revisado com o כ na tela', () => {
    const k = L('kaf');
    const itens = [
      ...buildLetterPractice(k, historyOf(k.order), { seed: 'pratica-kaf' }),
      ...buildMiniTest(k, historyOf(k.order), { seed: 'mini-kaf-0' })
    ];
    expect(itens.some(e => e.letterId === 'bet' && mostraOPar(e as never, L('bet'), k))).toBe(true);
  });

  it('toda letra com gêmea já ensinada a encontra na própria lição', () => {
    const sem: string[] = [];
    for (const x of letters) {
      const gemea = x.confusableWith
        .map(g => letters.find(o => o.id !== x.id && (o.letter === g || o.finalForm === g)))
        .find(o => o && o.order < x.order);
      if (!gemea) continue;
      const itens = [
        ...buildLetterPractice(x, historyOf(x.order), { seed: `pratica-${x.id}` }),
        ...buildMiniTest(x, historyOf(x.order), { seed: `mini-${x.id}-0` })
      ];
      if (!itens.some(e => mostraOPar(e as never, x, gemea))) sem.push(`${x.namePt}/${gemea.namePt}`);
    }
    expect(sem).toEqual([]);
  });
});

describe('o modo "Letras parecidas" põe as duas lado a lado', () => {
  const pares: [string, string][] = [
    ['dalet', 'resh'], ['bet', 'kaf'], ['he', 'het'], ['vav', 'zayin'], ['gimel', 'nun'], ['ayin', 'tsadi']
  ];

  it('em todo item, nos pares clássicos', () => {
    const fora: string[] = [];
    for (const [x, y] of pares) {
      const a = L(x), b = L(y);
      const hist = historyOf(Math.max(a.order, b.order));
      for (const e of buildConfusionDrill(a, b, { count: 8, history: hist })) {
        if (!mostraOPar(e as never, a, b)) fora.push(`${a.namePt}/${b.namePt}: ${e.promptPt}`);
      }
    }
    expect(fora).toEqual([]);
  });

  it('com oito itens, nos dois sentidos, e sem letra que o aluno não viu', () => {
    for (const [x, y] of pares) {
      const a = L(x), b = L(y);
      const depois = a.order > b.order ? a : b;
      const drill = buildConfusionDrill(a, b, { count: 8, history: historyOf(depois.order) });
      expect(drill.length, `${x}/${y}`).toBe(8);
      expect(new Set(drill.map(e => e.letterId))).toEqual(new Set([x, y]));
      for (const e of drill) expect(violatesOrderRule(e, depois.alphabetSoFar)).toEqual([]);
    }
  });

  it('usa três formatos, não um', () => {
    const drill = buildConfusionDrill(L('dalet'), L('resh'), { count: 8, history: historyOf(11) });
    expect(new Set(drill.map(e => e.kind)).size).toBeGreaterThanOrEqual(3);
  });
});

describe('a Batalha de quem não erra traz pares antigos', () => {
  const tudo = letters;
  const state: LearnerState = { ...EMPTY_STATE };

  it('toda partida tem pelo menos um par da primeira metade do alfabeto', () => {
    for (let giro = 0; giro < 12; giro++) {
      const pares = paresParaTreinar(state, tudo, 4, giro);
      expect(pares.some(([a, b]) => Math.max(a.order, b.order) <= 14), `giro ${giro}`).toBe(true);
    }
  });

  it('e ao longo das partidas aparecem ד/ר e ה/ח', () => {
    const vistos = new Set<string>();
    for (let giro = 0; giro < 30; giro++) {
      for (const [a, b] of paresParaTreinar(state, tudo, 4, giro)) vistos.add([a.id, b.id].sort().join('/'));
    }
    expect(vistos.has('dalet/resh')).toBe(true);
    expect(vistos.has('he/het')).toBe(true);
  });

  it('os recentes continuam presentes', () => {
    const pares = paresParaTreinar(state, tudo, 4, 0);
    expect(pares.some(([a, b]) => Math.max(a.order, b.order) >= 20)).toBe(true);
  });
});
