/* Typed access to the content generated from data/ by tools/export-content.mjs.
 *
 * Content is imported, not fetched: it is small, it never changes at runtime,
 * and importing it lets every route prerender. The `alphabetSoFar` field on a
 * letter is the load-bearing one — see lib/engine/exercises.ts. */

import courseJson from '@content/course.json';
import nikudJson from '@content/nikud.json';
import lettersJson from '@content/letters.json';
import extrasJson from '@content/extras.json';
import realWorldJson from '@content/real-world.json';
import strokeJson from '@content/stroke-paths.json';
import cultureJson from '@content/culture.json';

export type Word = {
  he: string;
  translit: string;
  pt: string;
  use: string | null;
  audioId: string;
};

export type Syllable = {
  vowel: 'a' | 'e' | 'i' | 'o' | 'u' | 'sheva' | string;
  he: string;
  translit: string;
  ptApprox: string;
  audioId: string;
};

export type Letter = {
  id: string;
  order: number;
  module: number;
  lesson: number;
  letter: string;
  finalForm: string | null;
  nameHe: string;
  namePt: string;
  translit: string;
  sound: string;
  soundNotePt: string;
  didYouKnow: string;
  brazilianMistake: { wrong: string; right: string; why: string };
  confusableWith: string[];
  syllables: Syllable[];
  wordsToRead: Word[];
  wordsToRecognize: Word[];
  bridgeWords: { he: string; pt: string }[];
  /** Every glyph the learner may legally be shown at this point. */
  alphabetSoFar: string[];
  strokeOrder: { base: string | null; final: string | null };
  workbookPages: { from: number; to: number } | null;
  audioId: string;
};

export type Checkpoint = {
  id: string;
  module: number;
  upTo: number;
  letterIds: string[];
  workbookPages: { from: number; to: number } | null;
};

export type CourseModule = {
  n: number;
  id: string;
  kind: 'letters' | 'consolidation' | 'extra' | string;
  titlePt: string;
  subPt: string;
  introPt: string;
  goalsPt: string[];
  milestonePt: string;
  lessons: { n: number; kind?: string; letters?: string[]; topicPt?: string }[];
  letterIds: string[];
  upTo: number | null;
  checkpoint: Checkpoint | null;
  workbookPages: { from: number; to: number } | null;
};

export type Course = {
  generatedAt: string;
  source: string;
  totalLetters: number;
  modules: CourseModule[];
  letters: { id: string; order: number; module: number; letter: string; namePt: string; sound: string }[];
};

export type NikudSign = {
  nameHe: string;
  namePt: string;
  /** The sign shown on mem, e.g. מַ. */
  demo: string;
  /** The mark alone, to put on another consonant. */
  sign: string;
  position: string;
  /** The syllable said out loud. */
  audioId: string;
  /** The sign's own name said out loud — "patach". */
  nameAudioId: string;
};

export type NikudSound = {
  sound: string;
  ptApprox: string | null;
  signs: NikudSign[];
};

export const course = courseJson as unknown as Course;
export type NikudIntro = { title: string; lead: string; correction: string };

/** Modules 6 and 7, shared verbatim with the printed workbook. */
export const extras = extrasJson as unknown as import('./engine/extras').Extras;

export type Scene = {
  id: string; fromOrder: number; sceneType: string; labelPt: string;
  he: string; contextPt: string; translit: string; pt: string; audioId: string;
};
const SCENES = (realWorldJson as unknown as { scenes: Scene[] }).scenes;

/** Scenes the learner can actually decode right now, newest first.
 *  A sign they cannot read is not a reward. */
export const scenesUpTo = (order: number): Scene[] =>
  SCENES.filter(s => s.fromOrder <= order).sort((a, b) => b.fromOrder - a.fromOrder);

/** The scenes a given letter unlocks. Most letters unlock none. */
export const scenesForOrder = (order: number): Scene[] =>
  SCENES.filter(s => s.fromOrder === order);

/* ── stroke geometry ────────────────────────────────────────────────────
   Generated with the stroke-order diagrams, from the same font outline, in the
   same run — so the count and the starting points can never disagree with the
   printed page. `null` for a letter with no data is a normal answer: the
   tracing screen falls back to the static diagram. */
export type Stroke = {
  /** The stroke's own outline, in the 200-unit box. */
  d: string;
  /** Where the pen lands. */
  start: [number, number];
  /** A unit vector into the form. Says "this way", not "round this way". */
  dir: [number, number];
};
export type StrokeSet = { box: number; strokes: Stroke[] };

const STROKES = (strokeJson as unknown as {
  box: number; letters: Record<string, StrokeSet>;
}).letters;

/** `letterId`, or `${letterId}-final` for a final form. */
export const strokesFor = (id: string): StrokeSet | null => STROKES[id] ?? null;

/* ── culture and history ────────────────────────────────────────────────
   Optional and unlockable. `unlockAt` is a letter count, not a lesson id: a
   card appears once the learner has mastered that many letters, which keeps it
   a reward for progress rather than another thing to do. Nothing in the main
   path depends on any of it. */
export type CultureCard = {
  id: string;
  titlePt: string;
  kind: 'historia' | 'curiosidade' | 'cultura' | string;
  /** Letters mastered before this card appears. */
  unlockAt: number;
  leadPt: string;
  bodyPt: string[];
  /** Where the claim comes from. Not shown to the learner; kept for review. */
  sources?: string;
};

const CULTURE = (cultureJson as unknown as { cards: CultureCard[] }).cards;

export const cultureCards = (): CultureCard[] => CULTURE;

/** The cards this learner has earned, newest unlock first. */
export const cultureUnlocked = (mastered: number): CultureCard[] =>
  CULTURE.filter(c => c.unlockAt <= mastered).sort((a, b) => b.unlockAt - a.unlockAt);

/** A card unlocked by crossing exactly this count, if any. */
export const cultureAt = (mastered: number): CultureCard | undefined =>
  CULTURE.find(c => c.unlockAt === mastered);

export const nikud = nikudJson as unknown as {
  intro: NikudIntro;
  dagesh: { title?: string; body?: string } | null;
  sounds: NikudSound[];
};

/* Bundled, not fetched: 58 KB of JSON that never changes at runtime, and every
   screen that is not a single lesson needs most of it at once. */
const LETTERS: Letter[] = (lettersJson as unknown as Letter[])
  .slice()
  .sort((a, b) => a.order - b.order);

const BY_ID = new Map(LETTERS.map(l => [l.id, l]));

export const allLetters = (): Letter[] => LETTERS;
export const getLetter = (id: string): Letter | undefined => BY_ID.get(id);
export const lettersOfModule = (n: number): Letter[] => LETTERS.filter(l => l.module === n);
export const getModule = (n: number): CourseModule | undefined => course.modules.find(m => m.n === n);

/** The letters of the whole course in teaching order, modules interleaved. */
export type MapNode =
  | { kind: 'intro' }
  | { kind: 'module'; module: CourseModule }
  | { kind: 'letter'; letter: Letter }
  | { kind: 'checkpoint'; checkpoint: Checkpoint; module: CourseModule }
  | { kind: 'final' };

export function courseMap(): MapNode[] {
  const nodes: MapNode[] = [{ kind: 'intro' }];
  for (const m of course.modules) {
    nodes.push({ kind: 'module', module: m });
    for (const id of m.letterIds) {
      const l = BY_ID.get(id);
      if (l) nodes.push({ kind: 'letter', letter: l });
    }
    if (m.checkpoint) nodes.push({ kind: 'checkpoint', checkpoint: m.checkpoint, module: m });
  }
  nodes.push({ kind: 'final' });
  return nodes;
}

/** The lesson that follows this one, for "continuar". */
export function nextLetter(id: string): Letter | undefined {
  const l = BY_ID.get(id);
  if (!l) return undefined;
  return LETTERS.find(x => x.order === l.order + 1);
}
