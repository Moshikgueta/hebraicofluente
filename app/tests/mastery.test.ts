/* The v2 learning model: migration, per-skill mastery, confusion pairs.
 *
 * The migration tests are the ones that matter most. There are learners with v1
 * state in a browser right now, and that state is the only record their work
 * exists - so "the upgrade lost my streak" is not a bug report we can answer. */

import { describe, expect, it } from 'vitest';
import { migrate } from '@/lib/state/migrate';
import { EMPTY_STATE, type LearnerState } from '@/lib/state/types';
import {
  clearConfusion, confusionKey, dueItems, letterMastery, needsWarmUp, recordAnswer,
  recordConfusion, recordGym, recordSkill, reviewDebt, skillLevel, topConfusions,
  weakestSkill, weakLetters
} from '@/lib/state/rules';

/* A v1 save as an older build actually wrote it: no skills, no confusions, no
   firsts, version 1. */
const V1_SAVE = {
  version: 1,
  onboarding: {
    reason: 'viagem', goalMinutes: 10, startingPoint: 'zero',
    name: 'Ana', completedAt: '2026-01-02T10:00:00.000Z'
  },
  xp: 1480,
  lessons: {
    mem: { letterId: 'mem', stagesDone: [1, 2, 3, 4, 5], quizBest: 1, quizAttempts: 2,
           perfectBonusPaid: true, completedAt: '2026-01-03T10:00:00.000Z' },
    tav: { letterId: 'tav', stagesDone: [1, 2], quizBest: null, quizAttempts: 0,
           perfectBonusPaid: false, completedAt: null }
  },
  checkpoints: { cp1: { id: 'cp1', best: 0.92, attempts: 1, passedAt: '2026-01-05T10:00:00.000Z' } },
  srs: {
    'tav-rec-0': { itemId: 'tav-rec-0', letterId: 'tav', box: 0, misses: 2, hits: 0,
                   dueOn: '2026-01-06', lastSeen: '2026-01-05' }
  },
  achievements: [{ id: 'primeira-letra', unlockedAt: '2026-01-03T10:00:00.000Z' }],
  days: { '2026-01-05': { answered: 12, units: 31, xp: 45, goalMet: true } },
  streak: { current: 6, longest: 9, lastDay: '2026-01-05' },
  lastRoute: '/licao/tav',
  finalChallenge: { best: null, completedAt: null }
};

describe('migration v1 → v2', () => {
  const s = migrate(V1_SAVE);

  it('keeps every piece of earned progress', () => {
    expect(s.xp).toBe(1480);
    expect(s.streak).toEqual({ current: 6, longest: 9, lastDay: '2026-01-05' });
    expect(s.lessons['mem']?.stagesDone).toEqual([1, 2, 3, 4, 5]);
    expect(s.lessons['tav']?.stagesDone).toEqual([1, 2]);
    expect(s.checkpoints['cp1']?.best).toBe(0.92);
    expect(s.srs['tav-rec-0']?.misses).toBe(2);
    expect(s.achievements).toHaveLength(1);
    expect(s.days['2026-01-05']?.units).toBe(31);
    expect(s.onboarding?.name).toBe('Ana');
    expect(s.lastRoute).toBe('/licao/tav');
  });

  it('arrives at the current version with the new maps present and empty', () => {
    expect(s.version).toBe(2);
    expect(s.skills).toEqual({});
    expect(s.confusions).toEqual({});
    expect(s.firsts).toEqual({});
  });

  it('does not invent skill evidence from finished lessons', () => {
    /* mem is a completed lesson. Seeding it as "forte" would make the course
       stop reviewing a letter it has no evidence the learner still knows. */
    expect(letterMastery(s, 'mem')).toBe('novo');
  });

  it('is idempotent - migrating twice changes nothing', () => {
    expect(migrate(s)).toEqual(s);
  });
});

describe('migration, hostile input', () => {
  it('survives junk', () => {
    for (const junk of [null, undefined, 0, '', 'nope', [], { }, { version: 'x' }]) {
      expect(migrate(junk)).toEqual(EMPTY_STATE);
    }
  });

  it('refuses state from a FUTURE version rather than guessing at it', () => {
    expect(migrate({ ...V1_SAVE, version: 99 })).toEqual(EMPTY_STATE);
  });

  it('fills in a field a half-written save is missing', () => {
    const partial = { version: 2, xp: 40 };
    const s = migrate(partial);
    expect(s.xp).toBe(40);
    expect(s.lessons).toEqual({});
    expect(s.skills).toEqual({});
    expect(s.streak.current).toBe(0);
  });
});

describe('skill levels', () => {
  const stat = (hits: number, misses: number, streak: number) =>
    ({ hits, misses, streak, lastOn: '2026-01-01' });

  it('reads no evidence as new, not as weak', () => {
    expect(skillLevel(undefined)).toBe('novo');
    expect(skillLevel(stat(0, 0, 0))).toBe('novo');
  });

  it('needs four clean answers in a row to call anything strong', () => {
    expect(skillLevel(stat(1, 0, 1))).toBe('aprendendo');
    expect(skillLevel(stat(2, 0, 2))).toBe('praticando');
    expect(skillLevel(stat(3, 0, 3))).toBe('praticando');
    expect(skillLevel(stat(4, 0, 4))).toBe('forte');
  });

  it('drops a strong skill straight to needs-review on one miss', () => {
    expect(skillLevel(stat(9, 1, 0))).toBe('revisar');
  });
});

describe('letter mastery is the weakest skill, not the average', () => {
  it('does not let a strong reader hide a deaf ear', () => {
    let s: LearnerState = EMPTY_STATE;
    for (let i = 0; i < 5; i++) s = recordSkill(s, 'qof', 'ler', true, '2026-01-01');
    s = recordSkill(s, 'qof', 'ouvir', false, '2026-01-01');
    expect(skillLevel(s.skills['qof']?.ler)).toBe('forte');
    expect(letterMastery(s, 'qof')).toBe('revisar');
    expect(weakestSkill(s.skills['qof'])).toBe('ouvir');
  });

  it('is strong only when every skill with evidence is strong', () => {
    let s: LearnerState = EMPTY_STATE;
    for (const skill of ['rec', 'som', 'ler'] as const) {
      for (let i = 0; i < 4; i++) s = recordSkill(s, 'mem', skill, true, '2026-01-01');
    }
    expect(letterMastery(s, 'mem')).toBe('forte');
  });

  it('ignores skills never attempted', () => {
    let s: LearnerState = EMPTY_STATE;
    for (let i = 0; i < 4; i++) s = recordSkill(s, 'mem', 'rec', true, '2026-01-01');
    expect(letterMastery(s, 'mem')).toBe('forte');   // not dragged down by 'novo'
  });
});

describe('confusion pairs', () => {
  const day = '2026-02-01';

  it('records which wrong letter was chosen', () => {
    const s = recordConfusion(EMPTY_STATE, 'ד', 'ר', day);
    expect(s.confusions[confusionKey('ד', 'ר')]?.n).toBe(1);
  });

  it('never records a letter confused with itself', () => {
    expect(recordConfusion(EMPTY_STATE, 'ד', 'ד', day)).toEqual(EMPTY_STATE);
  });

  it('treats both directions of a pair as one problem', () => {
    let s = recordConfusion(EMPTY_STATE, 'ד', 'ר', day);
    s = recordConfusion(s, 'ר', 'ד', day);
    const top = topConfusions(s);
    expect(top).toHaveLength(1);
    expect(top[0]!.n).toBe(2);
  });

  it('ignores a single slip and reports a repeated one', () => {
    let s = recordConfusion(EMPTY_STATE, 'ב', 'כ', day);
    expect(topConfusions(s)).toHaveLength(0);
    s = recordConfusion(s, 'ב', 'כ', day);
    expect(topConfusions(s)).toHaveLength(1);
  });

  it('fades a confusion as the learner gets it right', () => {
    let s = recordConfusion(EMPTY_STATE, 'ד', 'ר', day);
    s = recordConfusion(s, 'ד', 'ר', day);
    s = clearConfusion(s, 'ד', 'ר');
    expect(s.confusions[confusionKey('ד', 'ר')]?.n).toBe(1);
    s = clearConfusion(s, 'ד', 'ר');
    expect(s.confusions[confusionKey('ד', 'ר')]).toBeUndefined();
  });

  it('orders by how often, worst first', () => {
    let s: LearnerState = EMPTY_STATE;
    for (let i = 0; i < 2; i++) s = recordConfusion(s, 'ב', 'כ', day);
    for (let i = 0; i < 5; i++) s = recordConfusion(s, 'ד', 'ר', day);
    expect(topConfusions(s).map(c => c.n)).toEqual([5, 2]);
  });
});

describe('the SRS still behaves as it did', () => {
  it('does not add an entry for something answered right the first time', () => {
    const s = recordAnswer(EMPTY_STATE, 'mem-rec-0', 'mem', true, '2026-01-01', 'rec');
    expect(s.srs['mem-rec-0']).toBeUndefined();
  });

  it('remembers which skill an item exercised', () => {
    let s = recordAnswer(EMPTY_STATE, 'mem-rec-0', 'mem', false, '2026-01-01', 'rec');
    s = { ...s, srs: { ...s.srs, 'mem-rec-0': {
      itemId: 'mem-rec-0', letterId: 'mem', box: 0, misses: 1, hits: 0,
      dueOn: '2026-01-01', lastSeen: '2026-01-01', skill: 'rec'
    } } };
    s = recordAnswer(s, 'mem-rec-0', 'mem', true, '2026-01-02', 'rec');
    expect(s.srs['mem-rec-0']?.skill).toBe('rec');
  });
});

describe('the reading gym record', () => {
  const day = '2026-03-01';

  it('counts runs and keeps the best of each thing it measures', () => {
    let s = recordGym(EMPTY_STATE, 'relogio', 0.8, 62, day);
    s = recordGym(s, 'relogio', 0.6, 48, day);
    const rec = s.gym['relogio']!;
    expect(rec.runs).toBe(2);
    expect(rec.best).toBe(0.8);        // best SCORE, not the latest
    expect(rec.bestSeconds).toBe(48);  // best TIME is the smallest
  });

  it('remembers the run before this one, so the comparison is not with itself', () => {
    let s = recordGym(EMPTY_STATE, 'relogio', 1, 70, day);
    expect(s.gym['relogio']!.previousSeconds).toBeNull();   // nothing to compare yet
    s = recordGym(s, 'relogio', 1, 55, day);
    expect(s.gym['relogio']!.previousSeconds).toBe(70);
    expect(s.gym['relogio']!.lastSeconds).toBe(55);
    s = recordGym(s, 'relogio', 1, 59, day);
    expect(s.gym['relogio']!.previousSeconds).toBe(55);
    expect(s.gym['relogio']!.bestSeconds).toBe(55);         // a slower run is still kept
  });

  it('keeps modes apart', () => {
    let s = recordGym(EMPTY_STATE, 'letras', 1, 30, day);
    s = recordGym(s, 'vogais', 0.5, 90, day);
    expect(s.gym['letras']!.runs).toBe(1);
    expect(s.gym['vogais']!.bestSeconds).toBe(90);
  });
});

describe('what the review asks for', () => {
  const day = '2026-04-10';
  const byGlyph = new Map([['ד', 'dalet'], ['ר', 'resh'], ['מ', 'mem']]);

  it('sees a skill that slipped even when the SRS queue is quiet', () => {
    /* The old model only had the queue, which goes silent as soon as an
       interval pushes an item past today - for a letter still being failed. */
    let s: LearnerState = EMPTY_STATE;
    for (let i = 0; i < 5; i++) s = recordSkill(s, 'qof', 'ouvir', true, day);
    s = recordSkill(s, 'qof', 'ouvir', false, day);
    expect(dueItems(s, day)).toHaveLength(0);
    expect(weakLetters(s, day, 3)).toContain('qof');
  });

  it('pulls BOTH letters of a traded pair into the review', () => {
    let s: LearnerState = EMPTY_STATE;
    for (let i = 0; i < 3; i++) s = recordConfusion(s, 'ד', 'ר', day);
    const weak = weakLetters(s, day, 4, byGlyph);
    expect(weak).toContain('dalet');
    expect(weak).toContain('resh');
  });

  it('says nothing when there is nothing', () => {
    expect(weakLetters(EMPTY_STATE, day, 3, byGlyph)).toEqual([]);
  });
});

describe('the mistake notebook', () => {
  const day = '2026-04-10';
  const byGlyph = new Map([['ד', 'dalet'], ['ר', 'resh']]);

  it('names the reason, not just the letter', () => {
    let s: LearnerState = EMPTY_STATE;
    for (let i = 0; i < 4; i++) s = recordSkill(s, 'dalet', 'ler', true, day);
    s = recordSkill(s, 'dalet', 'ler', false, day);
    const debt = reviewDebt(s, day, byGlyph);
    expect(debt[0]!.letterId).toBe('dalet');
    expect(debt[0]!.skills).toEqual(['ler']);
  });

  it('shows which letter is being traded for which', () => {
    let s: LearnerState = EMPTY_STATE;
    for (let i = 0; i < 2; i++) s = recordConfusion(s, 'ד', 'ר', day);
    const debt = reviewDebt(s, day, byGlyph);
    const dalet = debt.find(d => d.letterId === 'dalet')!;
    expect(dalet.confusedWith).toContain('ר');
  });

  it('is empty for a learner who has not missed anything', () => {
    expect(reviewDebt(EMPTY_STATE, day, byGlyph)).toEqual([]);
  });
});

describe('the warm-up', () => {
  it('does not greet a learner who studied yesterday', () => {
    const s: LearnerState = {
      ...EMPTY_STATE,
      streak: { current: 3, longest: 3, lastDay: '2026-04-09' },
      srs: { x: { itemId: 'x', letterId: 'mem', box: 0, misses: 1, hits: 0,
                  dueOn: '2026-01-01', lastSeen: '2026-01-01' } }
    };
    expect(needsWarmUp(s, '2026-04-10')).toBe(false);
  });

  it('greets one who has been away and owes something', () => {
    const s: LearnerState = {
      ...EMPTY_STATE,
      streak: { current: 3, longest: 3, lastDay: '2026-04-01' },
      srs: { x: { itemId: 'x', letterId: 'mem', box: 0, misses: 1, hits: 0,
                  dueOn: '2026-01-01', lastSeen: '2026-01-01' } }
    };
    expect(needsWarmUp(s, '2026-04-10')).toBe(true);
  });

  it('does not invent a warm-up for someone with nothing to review', () => {
    const s: LearnerState = {
      ...EMPTY_STATE,
      streak: { current: 3, longest: 3, lastDay: '2026-04-01' }
    };
    expect(needsWarmUp(s, '2026-04-10')).toBe(false);
  });
});
