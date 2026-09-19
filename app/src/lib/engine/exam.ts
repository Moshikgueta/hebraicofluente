/* O exame final.
 * ─────────────────────────────────────────────────────────────────────────
 * Not a longer quiz. An exam has to answer a question a quiz cannot - "can
 * this person read Hebrew?" - and that question has parts, because reading is
 * several skills stacked and a learner can be strong in three of them and
 * still not read.
 *
 * So: five parts (six once there are recordings), each with its own score, and
 * a report at the end that says which part was weak and where to go and fix
 * it. A single percentage would hide exactly the information the learner
 * needs.
 *
 * Three rules it inherits from the rest of the engine and one of its own:
 *   · every item is generated, so the order rule holds here as everywhere;
 *   · nothing needing a recording appears before the recording exists;
 *   · nothing new is taught - an exam that introduces material is a lesson;
 *   · and each attempt is a DIFFERENT exam. Retries are free and unlimited in
 *     this course, so the seed moves with the attempt: a learner who repeats
 *     it is answering new questions, not remembering the last set.
 */

import type { Letter } from '@/lib/content';
import type { Skill } from '@/lib/state/types';
import {
  exBuildSyllable, exBuildWord, exCompleteWord, exFinalForm, exLetterRecognition,
  exListenSyllable, exMatchLetterSound, exMatchSyllable, exMeaningToWord, exOddOneOut,
  exPrintVsCursive, exSoundToSyllable, exSyllableReading, exTypeHeard, exTypeTranslit,
  exVowelSound, exAudioWord,
  exConfusablePick, exCursiveToPrint, exFinalInWord, exLetterInWord, exLetterPosition,
  type Gen
} from './generators';
import { buildReview, buildScenes, spread, type Exercise, type SceneLike } from './exercises';
import { rng, shuffled } from './rng';

export type ExamPartId =
  'letras' | 'dificeis' | 'sinais' | 'silabas' | 'palavras' | 'mundo' | 'escuta';

export type ExamPart = {
  id: ExamPartId;
  titlePt: string;
  /** One line, on the screen before the part starts. */
  descPt: string;
  skill: Skill;
  count: number;
  /** Where to go and practise this, in the Academia. */
  practiceMode: string;
  needsAudio?: boolean;
};

export const EXAM_PARTS: ExamPart[] = [
  {
    id: 'letras', titlePt: 'As letras', skill: 'rec', count: 5, practiceMode: 'letras',
    descPt: 'Reconhecer a forma, fora de ordem, incluindo as cinco formas finais.'
  },
  /* A parte que separa reconhecer de ter decorado.
   *
   * Ela existe SEPARADA da anterior porque o relatório é o produto do exame:
   * "sua parte fraca são as letras" não diz o que fazer, e era só isso que o
   * exame conseguia dizer quando tudo isto vivia dentro de "As letras". Quem
   * acerta a letra isolada e erra aqui tem um problema nomeável - confunde as
   * parecidas, ou não reconhece a mesma letra noutra fonte - e é esse nome que
   * a pessoa leva para a Academia. */
  {
    id: 'dificeis', titlePt: 'As letras difíceis', skill: 'rec', count: 5,
    practiceMode: 'letras',
    descPt: 'As que se parecem entre si, a mesma letra em outra fonte, e achar ' +
      'uma letra dentro de uma palavra - no começo, no meio ou no fim.'
  },
  {
    id: 'sinais', titlePt: 'Os sinais de vogal', skill: 'som', count: 5, practiceMode: 'vogais',
    descPt: 'Que som cada sinal faz - independente da consoante em que ele está.'
  },
  {
    id: 'silabas', titlePt: 'Sílabas', skill: 'ler', count: 5, practiceMode: 'silabas',
    descPt: 'Consoante mais vogal, nas duas direções: ler e montar.'
  },
  {
    id: 'palavras', titlePt: 'Palavras', skill: 'ler', count: 7, practiceMode: 'palavras',
    descPt: 'Palavras inteiras: ler, completar, montar, escrever - e achar uma ' +
      'letra dentro delas, no começo, no meio ou no fim.'
  },
  {
    id: 'escuta', titlePt: 'Escuta', skill: 'ouvir', count: 5, practiceMode: 'ouvir',
    needsAudio: true,
    descPt: 'Só o som, sem ver antes.'
  },
  {
    id: 'mundo', titlePt: 'Hebraico de verdade', skill: 'ler', count: 5, practiceMode: 'palavras',
    descPt: 'Palavras como você vai encontrá-las: numa garrafa, numa porta, num recibo.'
  }
];

/* Which generators each part draws from. Named per part rather than per skill,
   for the same reason the gym does it: "sílabas" is a thing to be examined on;
   "ler" is a taxonomy. */
const GENS: Record<ExamPartId, readonly Gen[]> = {
  /* A letra sozinha, na fonte em que foi ensinada. */
  letras: [exLetterRecognition, exOddOneOut, exFinalForm, exPrintVsCursive],
  /* A letra sob pressão. Uma prova que mostra a letra sempre isolada, sempre
     na mesma fonte e nunca ao lado da parecida aprova quem memorizou vinte e
     duas figuras - e essa pessoa trava na primeira placa de rua. Achar a
     letra DENTRO de uma palavra é `rec` e não `ler` de propósito: o que se
     pede não é decodificar a palavra, é enxergar a letra nela. */
  dificeis: [
    exConfusablePick, exCursiveToPrint, exLetterInWord, exLetterPosition, exFinalInWord
  ],
  sinais: [exVowelSound, exMatchLetterSound],
  silabas: [exSyllableReading, exSoundToSyllable, exBuildSyllable, exMatchSyllable],
  palavras: [exCompleteWord, exBuildWord, exMeaningToWord, exTypeTranslit],
  escuta: [exListenSyllable, exAudioWord, exTypeHeard],
  mundo: []          // built from the real-world scenes instead
};

export type ExamSection = { part: ExamPart; exercises: Exercise[] };
export type Exam = { sections: ExamSection[]; total: number; attempt: number };

/** 70%. The same bar as a checkpoint: this is a course, not a gate. */
export const EXAM_PASS = 0.7;

export function partsFor(audioAvailable: boolean): ExamPart[] {
  return EXAM_PARTS.filter(p => !p.needsAudio || audioAvailable);
}

/**
 * Build one attempt.
 *
 * `attempt` seeds it, so the second sitting is a different exam. `letters` is
 * the whole alphabet by the time anyone reaches this, but it is still passed
 * in rather than imported - the engine never decides for itself what a learner
 * has met.
 */
export function buildExam(
  letters: Letter[], scenes: readonly SceneLike[],
  opts: { audioAvailable: boolean; attempt?: number }
): Exam {
  const { audioAvailable, attempt = 1 } = opts;

  const sections = partsFor(audioAvailable).map(part => {
    const seed = `exam-${attempt}-${part.id}`;
    /* The LETTER ORDER is seeded, not just the option shuffling.
       Without this a retry was the same paper: the builder walks letters in the
       order it is given and picks each item by round number, so a new seed only
       reshuffled the four options while the 30 questions stayed identical. A
       learner retaking the exam would be remembering, not reading. */
    const pool = shuffled(letters, rng(`${seed}-pool`)).map(l => l.id);
    const exercises = part.id === 'mundo'
      ? buildScenes(scenes, rng(seed), part.count)
      : spread(buildReview(pool, letters, {
          audioAvailable, count: part.count, seed, gens: GENS[part.id]
        }));
    return { part, exercises };
  }).filter(s => s.exercises.length > 0);

  return {
    sections,
    total: sections.reduce((n, s) => n + s.exercises.length, 0),
    attempt
  };
}

/* ── the report ─────────────────────────────────────────────────────────
   What the learner gets back is not a number. It is which part was weak, in
   words, with somewhere to go about it. */

export type PartResult = { partId: ExamPartId; correct: number; total: number };

export type ExamReport = {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  /** Parts under 70%, worst first. Empty is the good case. */
  weak: { part: ExamPart; score: number }[];
  bandPt: { titlePt: string; bodyPt: string };
};

export function examReport(results: PartResult[]): ExamReport {
  const correct = results.reduce((n, r) => n + r.correct, 0);
  const total = results.reduce((n, r) => n + r.total, 0);
  const score = total ? correct / total : 0;
  const passed = score >= EXAM_PASS;

  const weak = results
    .map(r => ({
      part: EXAM_PARTS.find(p => p.id === r.partId)!,
      score: r.total ? r.correct / r.total : 0
    }))
    .filter(w => w.part && w.score < EXAM_PASS)
    .sort((a, b) => a.score - b.score);

  return { score, correct, total, passed, weak, bandPt: band(score, weak.length) };
}

/**
 * Three bands, and the failing one is written carefully.
 *
 * "Reprovado" is a word that ends courses. What a learner who scored 60% needs
 * to hear is which part was weak and that the exam is free to retake - both of
 * which are true, and neither of which is a consolation prize.
 */
function band(score: number, weakCount: number): { titlePt: string; bodyPt: string } {
  if (score >= 0.9) {
    return {
      titlePt: 'Você lê hebraico.',
      bodyPt: 'Não é força de expressão: você decodificou palavras que não viu antes, ' +
        'sem transliteração e sem pistas. O que falta agora é volume de leitura, não método.'
    };
  }
  if (score >= EXAM_PASS) {
    return {
      titlePt: 'Aprovado - e dá para ver onde apertar.',
      bodyPt: weakCount
        ? 'Você lê. Uma parte ficou abaixo do resto, e ela está marcada aqui embaixo ' +
          'com o link para treinar exatamente isso.'
        : 'Você lê, e de forma equilibrada - nenhuma parte ficou para trás.'
    };
  }
  return {
    titlePt: 'Ainda não - e isso é informação, não veredito.',
    bodyPt: 'O exame não tem limite de tentativas e não custa nada. Abaixo está ' +
      'exatamente qual parte derrubou a nota e onde treinar. Volte quando quiser: ' +
      'quase sempre é uma parte só.'
  };
}
