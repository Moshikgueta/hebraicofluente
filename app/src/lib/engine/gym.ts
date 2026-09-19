/* The Academia de Leitura: practice that is not a lesson.
 * ─────────────────────────────────────────────────────────────────────────
 * The course had exactly one path - lesson, checkpoint, lesson - and a
 * five-question review of whatever was missed. Which means a learner who wants
 * to drill only the vowels, or only the letters that look alike, or who has
 * finished all 22 and wants to keep their reading warm, has nowhere to go. A
 * course you cannot practise is a course you finish once.
 *
 * Every mode is generated from the SAME engine as the lessons, so two rules
 * come along for free and cannot be forgotten here:
 *   · nothing appears that uses a letter the learner has not met;
 *   · nothing that needs a recording appears until the recording exists.
 *
 * What a mode chooses is which generators to draw from and which letters to
 * aim at - never a separate pool of hand-written questions, which would drift
 * from the lessons within a month.
 */

import type { Letter } from '@/lib/content';
import type { LearnerState, Skill } from '@/lib/state/types';
import { letterMastery, topConfusions, weakLetters } from '@/lib/state/rules';
import {
  exAudioWord, exBuildSyllable, exBuildWord, exCompleteWord, exFinalForm,
  exLetterRecognition, exListenSyllable, exMatchLetterSound, exMatchSyllable,
  exMatchWordMeaning, exMeaningToWord, exOddOneOut, exPrintVsCursive,
  exSoundToSyllable, exSyllableReading, exTypeHeard, exTypeTranslit, exVowelSound,
  type Gen
} from './generators';
import { buildConfusionDrill, buildReview, type Exercise } from './exercises';

export type GymModeId =
  | 'letras' | 'vogais' | 'silabas' | 'palavras' | 'ouvir'
  | 'parecidas' | 'relogio' | 'revisao';

export type GymMode = {
  id: GymModeId;
  titlePt: string;
  descPt: string;
  icon: string;
  /** Which skills a run of this mode records against. */
  skills: Skill[];
  /** Nothing is offered until a recording exists. */
  needsAudio?: boolean;
  /** Against the clock, against your own previous time. */
  timed?: boolean;
  count: number;
};

/* The generator sets, named by what a learner would call them rather than by
   the skill taxonomy - "sílabas" is a thing to practise; "ler" is not. */
const GENS: Record<GymModeId, readonly Gen[]> = {
  letras: [exLetterRecognition, exOddOneOut, exFinalForm, exPrintVsCursive],
  vogais: [exVowelSound, exBuildSyllable, exSoundToSyllable],
  silabas: [exSyllableReading, exBuildSyllable, exMatchSyllable, exSoundToSyllable],
  palavras: [exWordLike(), exBuildWord, exCompleteWord, exMeaningToWord, exMatchWordMeaning, exTypeTranslit],
  ouvir: [exListenSyllable, exAudioWord, exTypeHeard],
  parecidas: [exLetterRecognition, exOddOneOut, exCompleteWord],
  relogio: [exLetterRecognition, exSyllableReading, exOddOneOut, exVowelSound, exSoundToSyllable],
  revisao: []          // built from the SRS instead
};

/* Kept out of the list above only because the import would shadow the name. */
function exWordLike(): Gen {
  return (L, ctx, rand, i) => {
    const gen = [exMatchLetterSound, exMeaningToWord][i % 2]!;
    return gen(L, ctx, rand, i);
  };
}

export const GYM_MODES: GymMode[] = [
  {
    id: 'revisao', titlePt: 'Revisão personalizada', icon: '↻',
    descPt: 'O que você errou, no dia certo de rever.',
    skills: ['rec', 'som', 'ler'], count: 8
  },
  {
    id: 'letras', titlePt: 'Letras', icon: 'א',
    descPt: 'Reconhecer a forma, rápido, fora de ordem.',
    skills: ['rec'], count: 10
  },
  {
    id: 'vogais', titlePt: 'Vogais', icon: 'ָ',
    descPt: 'Os sinais: que som fazem e onde ficam.',
    skills: ['som'], count: 10
  },
  {
    id: 'silabas', titlePt: 'Sílabas', icon: 'מַ',
    descPt: 'Consoante mais vogal - a operação da leitura.',
    skills: ['ler'], count: 10
  },
  {
    id: 'palavras', titlePt: 'Palavras', icon: '◉',
    descPt: 'Ler palavras inteiras, montar, escrever.',
    skills: ['ler'], count: 10
  },
  {
    id: 'ouvir', titlePt: 'Ouvir e escolher', icon: '♪',
    descPt: 'Só o som, sem ver antes.',
    skills: ['ouvir'], needsAudio: true, count: 10
  },
  {
    id: 'parecidas', titlePt: 'Letras parecidas', icon: '◫',
    descPt: 'As que você está trocando, lado a lado.',
    skills: ['rec'], count: 8
  },
  {
    id: 'relogio', titlePt: 'Contra o relógio', icon: '◷',
    descPt: 'O mesmo que você já sabe, mais rápido que da última vez.',
    skills: ['rec', 'ler'], timed: true, count: 12
  }
];

export const getMode = (id: string): GymMode | undefined =>
  GYM_MODES.find(m => m.id === id);

/** Which modes make sense right now, with the reason when one does not. */
export function availableModes(
  state: LearnerState, unlocked: Letter[], audioAvailable: boolean, day: string
): { mode: GymMode; ready: boolean; whyNot?: string }[] {
  return GYM_MODES.map(mode => {
    if (mode.needsAudio && !audioAvailable) {
      return { mode, ready: false, whyNot: 'Esperando as gravações.' };
    }
    if (!unlocked.length) {
      return { mode, ready: false, whyNot: 'Faça a primeira lição.' };
    }
    if (mode.id === 'revisao' && !weakLetters(state, day, 5).length) {
      return { mode, ready: false, whyNot: 'Nada pendente - você está em dia.' };
    }
    if (mode.id === 'parecidas' && !confusionPair(state, unlocked)) {
      return { mode, ready: false, whyNot: 'Nenhuma troca registrada ainda.' };
    }
    if (mode.id === 'palavras' && !unlocked.some(l => l.wordsToRead.length)) {
      return { mode, ready: false, whyNot: 'Ainda não há palavras para ler.' };
    }
    return { mode, ready: true };
  });
}

/**
 * The pair to drill: the one this learner actually trades, if there is one.
 *
 * Falls back to the content's own `confusableWith` among letters already
 * learned - a learner who has not yet confused anything can still practise the
 * pairs that are about to confuse them, which is cheaper than waiting for the
 * mistake.
 */
export function confusionPair(
  state: LearnerState, unlocked: Letter[]
): [Letter, Letter] | null {
  const byGlyph = new Map(unlocked.map(l => [l.letter, l]));
  for (const c of topConfusions(state, 5)) {
    const a = byGlyph.get(c.correct), b = byGlyph.get(c.chosen);
    if (a && b && a.id !== b.id) return [a, b];
  }
  /* Nothing recorded: take the most recently learned letter that has a
     confusable already in hand. */
  for (const L of [...unlocked].reverse()) {
    for (const glyph of L.confusableWith) {
      const other = byGlyph.get(glyph);
      if (other && other.id !== L.id) return [L, other];
    }
  }
  return null;
}

export type GymRun = { exercises: Exercise[]; label: string };

/**
 * Build a run.
 *
 * `letters` is what the learner has unlocked - the caller decides that, and
 * passing more than they have met is the one way to break the order rule from
 * outside the engine.
 */
export function buildGym(
  mode: GymMode, state: LearnerState, letters: Letter[],
  opts: { audioAvailable: boolean; day: string; seed?: string }
): GymRun {
  const { audioAvailable, day, seed = `${mode.id}-${day}-${letters.length}` } = opts;

  if (mode.id === 'revisao') {
    const weak = weakLetters(state, day, 5);
    return {
      exercises: buildReview(weak, letters, { audioAvailable, count: mode.count, seed }),
      label: weak.length ? 'Tirado dos seus erros' : 'As letras mais recentes'
    };
  }

  if (mode.id === 'parecidas') {
    const pair = confusionPair(state, letters);
    if (!pair) return { exercises: [], label: '' };
    return {
      exercises: buildConfusionDrill(pair[0], pair[1], {
        audioAvailable, count: mode.count, seed
      }),
      label: `${pair[0].namePt} e ${pair[1].namePt}`
    };
  }

  /* Everything else: aim at the letters this learner is weakest on, then fill
     from the rest. Practising what is already strong feels good and teaches
     nothing. */
  const ranked = [...letters].sort((a, b) => {
    const rank = (l: Letter) => {
      const m = letterMastery(state, l.id);
      return m === 'revisar' ? 0 : m === 'aprendendo' ? 1 : m === 'praticando' ? 2 : m === 'novo' ? 3 : 4;
    };
    return rank(a) - rank(b) || b.order - a.order;
  });

  return {
    exercises: buildFromGens(ranked, letters, GENS[mode.id], {
      audioAvailable, count: mode.count, seed
    }),
    label: ranked.length > 6 ? 'Começando pelo que está mais fraco' : ''
  };
}

/* The gym hands the engine a generator list directly - a mode is defined by
   the exercises it contains, and mapping that through the skill taxonomy and
   back would turn "vogais" into "everything that trains som". */
function buildFromGens(
  pool: Letter[], history: Letter[], gens: readonly Gen[],
  opts: { audioAvailable: boolean; count: number; seed: string }
): Exercise[] {
  return buildReview(pool.map(l => l.id), history, {
    audioAvailable: opts.audioAvailable,
    count: opts.count,
    seed: opts.seed,
    gens
  });
}
