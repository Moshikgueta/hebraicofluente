/* The generators: one function per exercise kind.
 * ─────────────────────────────────────────────────────────────────────────
 * Each takes a letter, the context of what the learner has met, a seeded
 * random source and a round number, and returns an exercise or null. Returning
 * null is normal and load-bearing: at letter 1 there is no word to build and no
 * final form to find, and a generator that invented one would break the order
 * rule or the truth.
 *
 * Distractors are chosen with intent, never at random. `confusableWith` holds
 * the letters that actually get mixed up - ד against ר, מ against ס, ב against
 * ו - so a wrong option teaches the distinction the learner needs instead of
 * being obviously wrong.
 */

import type { Letter, Syllable, Word } from '@/lib/content';
import {
  BASE_TO_FINAL, clean, clusters, containsLetter, gapAtLetter, gappedGlyph,
  isReadableWith, onCarrier, splitSyllable
} from '@/lib/hebrew';
import { shuffled, take, type Rand } from './rng';
import type { Exercise } from './types';

export type Ctx = {
  /** The letters taught so far, in order - the pool WORD distractors come from. */
  history: Letter[];
  /** Glyphs (base + final) the learner has met. Governs reading material. */
  alphabet: string[];
  /** Every glyph in the language, for single-letter distractors. */
  allGlyphs: string[];
};

export type Gen = (L: Letter, ctx: Ctx, rand: Rand, round: number) => Exercise | null;

/* ── shared helpers ─────────────────────────────────────────────────────── */

/** Deduped, shuffled, with the index of the right answer. */
function optionsWith<T>(correct: T, wrong: T[], rand: Rand): { options: T[]; answer: number } {
  const unique = [...new Set([correct, ...wrong])];
  const options = shuffled(unique, rand);
  return { options, answer: options.indexOf(correct) };
}

function letterDistractors(L: Letter, ctx: Ctx, rand: Rand, n: number): string[] {
  const confusable = L.confusableWith.filter(c => c !== L.letter);
  const learned = ctx.alphabet.filter(c => c !== L.letter && !confusable.includes(c));
  const rest = ctx.allGlyphs.filter(
    c => c !== L.letter && c !== L.finalForm && !confusable.includes(c) && !learned.includes(c)
  );
  return [...shuffled(confusable, rand), ...shuffled(learned, rand), ...shuffled(rest, rand)].slice(0, n);
}

const wordDistractors = (target: Word, pool: readonly Word[], rand: Rand, n: number): Word[] =>
  take(pool.filter(w => w.he !== target.he), n, rand);

/**
 * Palavras que a pessoa PODE LER agora.
 *
 * `wordsToRead` já respeita a regra da ordem por construção, mas
 * `wordsToRecognize` não: são palavras que o curso mostra inteiras, para
 * reconhecer de vista, e elas usam letras que ainda não foram ensinadas. Pôr
 * as duas listas no mesmo balde foi exatamente o que o teste da regra da
 * ordem pegou - a lição do Mem oferecia מַיִם, que precisa de yod.
 *
 * Então a leitura de verdade sai daqui, e daqui só.
 */
const legiveis = (ctx: Ctx): Word[] =>
  ctx.history.flatMap(x => x.wordsToRead).filter(w => isReadableWith(w.he, ctx.alphabet));

/** Syllables that spell a vowel. Shevá is excluded: it is the absence of one. */
const vowelSyllables = (L: Letter): Syllable[] => L.syllables.filter(s => s.vowel !== 'sheva');

const at = <T,>(arr: readonly T[], i: number): T | undefined =>
  arr.length ? arr[i % arr.length] : undefined;

/** The five vowel sounds, in the order the course teaches them. */
const VOWEL_ORDER = ['a', 'e', 'i', 'o', 'u'] as const;

/* ── recognition ────────────────────────────────────────────────────────── */

export const exLetterRecognition: Gen = (L, ctx, rand, i) => {
  const wrong = letterDistractors(L, ctx, rand, 3);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(L.letter, wrong, rand);
  return {
    id: `${L.id}-rec-${i}`, kind: 'letter-recognition', letterId: L.id, skill: 'rec',
    promptPt: `Qual destas é a letra ${L.namePt}?`,
    letter: L.letter, options, answer,
    whyPt: options.map(o => o === L.letter ? null : `Essa não é ${L.namePt}.`),
    hintsPt: [L.soundNotePt],
    explainPt: `${L.namePt} faz o som ${L.sound}.`
  };
};

export const exPrintVsCursive: Gen = (L, ctx, rand, i) => {
  const wrong = letterDistractors(L, ctx, rand, 3);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(L.letter, wrong, rand);
  return {
    id: `${L.id}-cur-${i}`, kind: 'print-vs-cursive', letterId: L.id, skill: 'rec',
    promptPt: 'Qual destas é a mesma letra, escrita à mão?',
    letter: L.letter, options, answer,
    explainPt: 'A cursiva é o que se escreve à mão; a de imprensa é o que se lê.'
  };
};

export const exFinalForm: Gen = (L, ctx, rand, i) => {
  if (!L.finalForm) return null;
  const otherFinals = Object.values(BASE_TO_FINAL).filter(f => f !== L.finalForm);
  const plain = ctx.allGlyphs.filter(
    c => c !== L.letter && c !== L.finalForm && !otherFinals.includes(c)
  );
  const wrong = [...new Set([...shuffled(otherFinals, rand), ...shuffled(plain, rand)])];
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(L.finalForm, wrong.slice(0, 3), rand);
  return {
    id: `${L.id}-fin-${i}`, kind: 'final-form', letterId: L.id, skill: 'rec',
    promptPt: `Qual é a forma final de ${L.namePt}, a que aparece no fim da palavra?`,
    letter: L.letter, options, answer,
    hintsPt: ['Quase todas as formas finais descem abaixo da linha.'],
    explainPt: 'Mesmo som, outro desenho - e quase sempre descendo abaixo da linha.'
  };
};

/**
 * A row of the same letter with one intruder.
 *
 * This is the drill for the thing Brazilian learners actually lose time on:
 * ד and ר differ by one corner, ב and כ by one, ה and ח by a gap. Reading them
 * apart is a visual skill, and it is trained by looking, not by reasoning.
 */
export const exOddOneOut: Gen = (L, _ctx, rand, i) => {
  const intruder = L.confusableWith.filter(c => c !== L.letter)[i % Math.max(1, L.confusableWith.length)];
  if (!intruder) return null;
  const size = 6;
  const answer = Math.floor(rand() * size);
  const options = Array.from({ length: size }, (_, k) => (k === answer ? intruder : L.letter));
  return {
    id: `${L.id}-odd-${i}`, kind: 'odd-one-out', letterId: L.id, skill: 'rec',
    promptPt: `Uma destas não é ${L.namePt}. Qual?`,
    options, answer,
    whyPt: options.map((o, k) => k === answer ? null : `Essa é ${L.namePt}.`),
    explainPt: `A intrusa era ${intruder} - repare no que muda no desenho.`
  };
};

/* ── the vowels ─────────────────────────────────────────────────────────── */

/**
 * The syllable is on screen; which vowel is it?
 *
 * The course had 132 syllables in its data and tested them once, with
 * transliterations as the options - which asks about the whole syllable. This
 * asks about the SIGN, which is the half a learner has to generalise: the
 * patach under מ is the same patach under ק.
 */
export const exVowelSound: Gen = (L, _ctx, rand, i) => {
  const pool = vowelSyllables(L);
  const target = at(pool, i);
  if (!target) return null;
  const present = new Set(pool.map(s => s.vowel));
  const options: string[] = VOWEL_ORDER.filter(v => present.has(v));
  if (options.length < 3) return null;
  const answer = options.indexOf(target.vowel);
  if (answer < 0) return null;
  const byVowel = new Map(pool.map(s => [s.vowel, s]));
  return {
    id: `${L.id}-vow-${i}`, kind: 'vowel-sound', letterId: L.id, skill: 'som',
    promptPt: 'Que vogal está escrita aqui?',
    he: target.he,
    options, answer,
    audioId: target.audioId,
    whyPt: options.map(v => v === target.vowel ? null
      : `${byVowel.get(v)?.translit ?? v} se escreve de outro jeito.`),
    hintsPt: ['Olhe só o sinal, ignore a consoante.'],
    explainPt: `${target.translit} - ${target.ptApprox}.`
  };
};

/** The sound is given; find the spelling. The direction the course never asked. */
export const exSoundToSyllable: Gen = (L, _ctx, rand, i) => {
  const pool = vowelSyllables(L);
  const target = at(pool, i + 1);
  if (!target || pool.length < 3) return null;
  const wrong = pool.filter(s => s.he !== target.he).map(s => s.he);
  const { options, answer } = optionsWith(target.he, take(wrong, 3, rand), rand);
  const byHe = new Map(pool.map(s => [s.he, s]));
  return {
    id: `${L.id}-s2s-${i}`, kind: 'sound-to-syllable', letterId: L.id, skill: 'ler',
    promptPt: `Qual destas se lê “${target.translit}”?`,
    sound: target.translit,
    options, answer,
    whyPt: options.map(o => o === target.he ? null : `Essa lê-se “${byHe.get(o)?.translit ?? '?'}”.`),
    explainPt: `${target.translit} - ${target.ptApprox}.`
  };
};

/**
 * Two syllables of the same consonant, differing only in the vowel, played.
 *
 * Needs a recording, and is withheld without one: a listening exercise
 * answered from a synthetic voice teaches the wrong sound and the learner
 * never finds out.
 */
export const exListenSyllable: Gen = (L, _ctx, rand, i) => {
  const pool = vowelSyllables(L).filter(s => s.audioId);
  const target = at(pool, i);
  if (!target || pool.length < 3) return null;
  const wrong = pool.filter(s => s.he !== target.he).map(s => s.he);
  const { options, answer } = optionsWith(target.he, take(wrong, 2, rand), rand);
  const byHe = new Map(pool.map(s => [s.he, s]));
  return {
    id: `${L.id}-lsy-${i}`, kind: 'listen-syllable', letterId: L.id, skill: 'ouvir',
    promptPt: 'Qual destas sílabas você ouviu?',
    audioId: target.audioId,
    options, answer,
    whyPt: options.map(o => o === target.he ? null
      : `Você escolheu “${byHe.get(o)?.translit}”, mas o som era “${target.translit}”.`),
    hintsPt: ['Ouça de novo e preste atenção só na vogal.'],
    explainPt: `${target.he} - ${target.translit}. ${target.ptApprox}.`
  };
};

/* ── construction ───────────────────────────────────────────────────────── */

/**
 * Consonant plus vowel, assembled by the learner.
 *
 * This is the operation the whole course is about, and it was the one thing
 * nobody was ever asked to perform. Tapping a vowel composes it onto the
 * consonant on screen, so the learner watches the sign attach rather than
 * being told that it does.
 */
export const exBuildSyllable: Gen = (L, _ctx, rand, i) => {
  const pool = vowelSyllables(L);
  const target = at(pool, i);
  if (!target || pool.length < 3) return null;
  const { consonant } = splitSyllable(target.he);
  const parts = pool.map(s => splitSyllable(s.he).vowel);
  const correct = splitSyllable(target.he).vowel;
  const wrong = parts.filter(v => v !== correct);
  const { options, answer } = optionsWith(correct, take(wrong, 3, rand), rand);
  if (options.length < 3) return null;
  return {
    id: `${L.id}-bsy-${i}`, kind: 'build-syllable', letterId: L.id, skill: 'ler',
    promptPt: `Monte a sílaba “${target.translit}”.`,
    target: target.he, consonant, vowels: options, answer, sound: target.translit,
    audioId: target.audioId,
    hintsPt: [`${target.ptApprox}.`],
    explainPt: `${target.he} - ${target.translit}. O sinal vale o mesmo em qualquer consoante.`
  };
};

/**
 * The word, in pieces, in the wrong order.
 *
 * Right to left is not a decoration here: a learner who assembles שָׁלוֹם from
 * the left has not read it. The tiles are CLUSTERS - consonant plus its own
 * marks - because anything smaller would put a vowel sign on the table with
 * nothing to sit on.
 */
export const exBuildWord: Gen = (L, _ctx, rand, i) => {
  const usable = L.wordsToRead.filter(w => {
    const n = clusters(w.he).length;
    return n >= 2 && n <= 5;
  });
  const target = at(usable, i);
  if (!target) return null;
  const tiles = clusters(target.he);
  /* A two-tile word has exactly one wrong order, which makes the exercise a
     coin toss rather than a reading. */
  if (tiles.length < 3) return null;
  let shuffledTiles = shuffled(tiles, rand);
  if (shuffledTiles.join('') === tiles.join('')) shuffledTiles = [...shuffledTiles].reverse();
  return {
    id: `${L.id}-bwd-${i}`, kind: 'build-word', letterId: L.id, skill: 'ler',
    promptPt: `Monte a palavra “${target.pt}”.`,
    target: target.he, tiles: shuffledTiles, hintPt: target.translit,
    audioId: target.audioId,
    hintsPt: ['Comece pela direita - a primeira letra da palavra fica desse lado.'],
    explainPt: `${target.he} - ${target.translit} - ${target.pt}`
  };
};

/* ── pairing ────────────────────────────────────────────────────────────── */

/**
 * Tap one, tap its pair. Never drag.
 *
 * Drag-and-drop on a phone is a precision task performed with the blunt end of
 * a finger, and a learner who drops a tile two pixels off gets punished for
 * their hand rather than their Hebrew. Two taps work at any size and are also
 * the only version that works with a keyboard or a screen reader.
 */
export const exMatchLetterSound: Gen = (L, ctx, rand, i) => {
  const pool = [L, ...ctx.history.filter(x => x.id !== L.id).slice(-5)];
  const chosen = take(pool, 4, rand);
  if (chosen.length < 3) return null;
  return {
    id: `${L.id}-mls-${i}`, kind: 'match', letterId: L.id, skill: 'som',
    promptPt: 'Ligue cada letra ao seu som.',
    pairs: chosen.map(x => ({ left: x.letter, right: x.sound })),
    leftKind: 'glyph', rightKind: 'text',
    labelLeft: 'Letra', labelRight: 'Som',
    explainPt: 'O som é a única coisa que a forma da letra não mostra - é o que precisa ser decorado.'
  };
};

export const exMatchWordMeaning: Gen = (L, ctx, rand, i) => {
  const pool = [...L.wordsToRead, ...ctx.history.flatMap(x => x.wordsToRead)];
  const seen = new Set<string>();
  const unique = pool.filter(w => !seen.has(w.he) && seen.add(w.he));
  const chosen = take(unique, 4, rand);
  if (chosen.length < 3) return null;
  return {
    id: `${L.id}-mwm-${i}`, kind: 'match', letterId: L.id, skill: 'ler',
    promptPt: 'Ligue cada palavra ao seu significado.',
    pairs: chosen.map(w => ({ left: w.he, right: w.pt })),
    leftKind: 'reading', rightKind: 'text',
    labelLeft: 'Hebraico', labelRight: 'Português',
    explainPt: 'Ler é reconhecer o bloco inteiro, não uma letra de cada vez.'
  };
};

export const exMatchSyllable: Gen = (L, _ctx, rand, i) => {
  const pool = vowelSyllables(L);
  const chosen = take(pool, 4, rand);
  if (chosen.length < 3) return null;
  return {
    id: `${L.id}-msy-${i}`, kind: 'match', letterId: L.id, skill: 'ler',
    promptPt: 'Ligue cada sílaba à sua leitura.',
    pairs: chosen.map(s => ({ left: s.he, right: s.translit })),
    leftKind: 'reading', rightKind: 'text',
    labelLeft: 'Sílaba', labelRight: 'Leitura',
    explainPt: 'A consoante é sempre a mesma. O que muda é o sinal.'
  };
};

/* ── production ─────────────────────────────────────────────────────────── */

/**
 * Typing, which is retrieval rather than recognition - and much harder, so it
 * is offered only where the answer is short and unambiguous, with a hint ladder
 * that starts with the first letter.
 *
 * Matching is forgiving by design (`normalizeTyped`): accents are a stress hint
 * in this course, not part of the answer, and a Brazilian on a phone keyboard
 * should never lose a question to á versus a.
 */
export const exTypeTranslit: Gen = (L, _ctx, rand, i) => {
  const usable = L.wordsToRead.filter(w => w.translit.length <= 9 && !w.translit.includes(' '));
  const target = at(usable, i);
  if (!target) return null;
  return {
    id: `${L.id}-typ-${i}`, kind: 'type-answer', letterId: L.id, skill: 'ler',
    promptPt: 'Leia a palavra e escreva como ela soa.',
    he: target.he,
    accept: [target.translit],
    placeholder: 'escreva aqui',
    want: 'translit',
    audioId: target.audioId,
    hintsPt: [
      `Começa com “${target.translit[0]}”.`,
      `São ${target.translit.length} letras.`
    ],
    explainPt: `${target.he} - ${target.translit} - ${target.pt}`
  };
};

export const exTypeHeard: Gen = (L, _ctx, rand, i) => {
  const usable = L.wordsToRead.filter(w => w.audioId && w.translit.length <= 9);
  const target = at(usable, i);
  if (!target) return null;
  return {
    id: `${L.id}-tph-${i}`, kind: 'type-answer', letterId: L.id, skill: 'ouvir',
    promptPt: 'Escreva o que você ouviu.',
    accept: [target.translit],
    placeholder: 'escreva aqui',
    want: 'translit',
    audioId: target.audioId,
    hintsPt: [`Começa com “${target.translit[0]}”.`, `Quer dizer “${target.pt}”.`],
    explainPt: `${target.he} - ${target.translit} - ${target.pt}`
  };
};

/* ── reading (the original four) ────────────────────────────────────────── */

export const exSyllableReading: Gen = (L, _ctx, rand, i) => {
  const s = vowelSyllables(L);
  const target = at(s, i);
  if (!target) return null;
  const wrong = s.filter(x => x.translit !== target.translit).map(x => x.translit);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(target.translit, take(wrong, 2, rand), rand);
  return {
    id: `${L.id}-syl-${i}`, kind: 'syllable-reading', letterId: L.id, skill: 'ler',
    promptPt: 'Como se lê esta sílaba?',
    he: target.he, options, answer,
    audioId: target.audioId,
    explainPt: target.ptApprox
  };
};

export const exWordMeaning: Gen = (L, ctx, rand, i) => {
  const target = at(L.wordsToRead, i);
  if (!target) return null;
  const pool = ctx.history.flatMap(x => x.wordsToRead);
  const wrong = wordDistractors(target, pool, rand, 3).map(w => w.pt);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(target.pt, wrong, rand);
  return {
    id: `${L.id}-mean-${i}`, kind: 'word-meaning', letterId: L.id, skill: 'ler',
    promptPt: 'Leia a palavra. O que ela quer dizer?',
    he: target.he, options, answer,
    audioId: target.audioId,
    hintsPt: [`Começa com o som “${target.translit[0]}”.`],
    explainPt: `${target.he} - ${target.translit} - ${target.pt}`
  };
};

export const exMeaningToWord: Gen = (L, ctx, rand, i) => {
  const target = at(L.wordsToRead, i + 1);
  if (!target) return null;
  const pool = ctx.history.flatMap(x => x.wordsToRead);
  const wrong = wordDistractors(target, pool, rand, 3).map(w => w.he);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(target.he, wrong, rand);
  return {
    id: `${L.id}-m2w-${i}`, kind: 'meaning-to-word', letterId: L.id, skill: 'ler',
    promptPt: `Qual destas palavras quer dizer “${target.pt}”?`,
    pt: target.pt, options, answer,
    explainPt: `${target.he} - ${target.translit}`
  };
};

export const exCompleteWord: Gen = (L, ctx, rand, i) => {
  const usable = L.wordsToRead.filter(w => containsLetter(w.he, L.letter));
  const target = at(usable, i);
  if (!target) return null;
  const correct = gappedGlyph(target.he, L.letter);
  const wrong = letterDistractors(L, ctx, rand, 3).filter(c => c !== correct);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(correct, wrong.slice(0, 3), rand);
  return {
    id: `${L.id}-gap-${i}`, kind: 'complete-word', letterId: L.id, skill: 'ler',
    promptPt: 'Falta uma letra. Qual delas completa a palavra?',
    parts: gapAtLetter(target.he, L.letter),
    hintPt: target.pt, options, answer,
    audioId: target.audioId,
    explainPt: `${target.he} - ${target.translit} - ${target.pt}`
  };
};

export const exAudioWord: Gen = (L, ctx, rand, i) => {
  const target = at(L.wordsToRead, i);
  if (!target) return null;
  const pool = ctx.history.flatMap(x => x.wordsToRead);
  const wrong = wordDistractors(target, pool, rand, 3).map(w => w.he);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(target.he, wrong, rand);
  return {
    id: `${L.id}-aud-${i}`, kind: 'audio-recognition', letterId: L.id, skill: 'ouvir',
    promptPt: 'Qual palavra você ouviu?',
    audioId: target.audioId, options, answer,
    explainPt: `${target.he} - ${target.translit} - ${target.pt}`
  };
};


/* ── a letra dentro da palavra ──────────────────────────────────────────
 * O buraco que a auditoria mediu: numa passagem pela letra, TODAS as treze
 * questões mostravam a forma isolada ou uma sílaba. Reconhecer מ num cartão e
 * reconhecer מ dentro de מִשְׁפָּחָה são duas habilidades diferentes, e só a
 * segunda serve para ler uma placa.
 */

/** Em qual destas palavras a letra aparece? Opções em hebraico. */
export const exLetterInWord: Gen = (L, ctx, rand, i) => {
  const pool = legiveis(ctx);
  const com = pool.filter(w => containsLetter(w.he, L.letter));
  const sem = pool.filter(w => !containsLetter(w.he, L.letter));
  const alvo = at(com, i);
  if (!alvo || sem.length < 2) return null;

  const wrong = take(sem, 3, rand).map(w => w.he);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(alvo.he, wrong, rand);
  const final = L.finalForm && clean(alvo.he).includes(L.finalForm);

  return {
    id: `${L.id}-inword-${i}`, kind: 'letter-in-word', letterId: L.id, skill: 'rec',
    promptPt: `Em qual destas palavras aparece a letra ${L.namePt}?`,
    letter: L.letter, options, answer,
    whyPt: options.map(o => {
      if (o === alvo.he) return null;
      const w = pool.find(x => x.he === o);
      return w ? `${w.pt} não tem ${L.namePt}.` : null;
    }),
    hintsPt: [final
      ? `Cuidado: no fim da palavra ela muda de desenho.`
      : `Procure a forma ${L.letter} dentro da palavra.`],
    explainPt: final
      ? `${alvo.pt} termina com ${L.finalForm}, que é a forma final de ${L.namePt}.`
      : `${alvo.pt} tem ${L.namePt}.`
  };
};

/** Onde a letra aparece nesta palavra: começo, meio ou fim? */
export const exLetterPosition: Gen = (L, ctx, rand, i) => {
  const pool = legiveis(ctx).filter(w => containsLetter(w.he, L.letter));
  const alvo = at(pool, i);
  if (!alvo) return null;

  /* Posição CONTADA EM LETRAS, da direita para a esquerda - que é a ordem em
     que se lê. `clusters` já devolve na ordem de leitura. */
  const cl = clusters(alvo.he);
  const fin = L.finalForm;
  let idx = cl.findIndex(c => c[0] === L.letter);
  if (idx < 0 && fin) idx = cl.findIndex(c => c[0] === fin);
  if (idx < 0) return null;

  const OPCOES = ['No começo', 'No meio', 'No fim'];
  const certa = idx === 0 ? 0 : idx === cl.length - 1 ? 2 : 1;

  return {
    id: `${L.id}-pos-${i}`, kind: 'letter-position', letterId: L.id, skill: 'rec',
    promptPt: `Onde está a letra ${L.namePt} nesta palavra?`,
    he: alvo.he, letter: L.letter,
    options: OPCOES, answer: certa,
    whyPt: OPCOES.map((_, k) => k === certa ? null
      : 'O hebraico se lê da direita para a esquerda - o começo da palavra é o lado direito.'),
    hintsPt: ['Lembre: o começo da palavra é a letra mais à DIREITA.'],
    explainPt: certa === 2 && fin
      ? `${alvo.pt}: no fim, ${L.namePt} vira ${fin}.`
      : `${alvo.pt} - ${alvo.translit}.`
  };
};

/**
 * Discriminação entre as letras que se confundem, com a razão escrita.
 *
 * Diferente de `exLetterRecognition`: ali os distratores são "o que sobrou",
 * aqui eles são EXATAMENTE os confundíveis declarados no conteúdo, e cada
 * opção errada explica a diferença de desenho. É o exercício que separa ד de
 * ר, e ele não pode ser deixado ao acaso da rotação.
 */
export const exConfusablePick: Gen = (L, ctx, rand, i) => {
  const confusos = L.confusableWith.filter(c => c !== L.letter && ctx.allGlyphs.includes(c));
  if (confusos.length < 2) return null;
  const wrong = take(confusos, 3, rand);
  const { options, answer } = optionsWith(L.letter, wrong, rand);
  const nomeDe = (g: string) => ctx.history.find(x => x.letter === g || x.finalForm === g)?.namePt;

  return {
    id: `${L.id}-conf-${i}`, kind: 'letter-recognition', letterId: L.id, skill: 'rec',
    promptPt: `Entre estas parecidas, qual é ${L.namePt}?`,
    letter: L.letter, options, answer,
    whyPt: options.map(o => {
      if (o === L.letter) return null;
      const nome = nomeDe(o);
      return nome ? `Essa é ${nome}. Olhe o desenho de novo.` : 'Essa é outra letra, bem parecida.';
    }),
    hintsPt: [L.soundNotePt],
    explainPt: `${L.namePt} faz ${L.sound}. As outras aqui são as que mais se parecem com ela.`
  };
};

/**
 * A forma final, perguntada ao contrário: dada a palavra, qual forma entra?
 *
 * `exFinalForm` pergunta "qual é a forma final de X" - reconhecimento. Esta
 * pergunta POR QUE ela aparece ali, que é a regra que o aluno precisa levar
 * para a leitura.
 */
export const exFinalInWord: Gen = (L, ctx, rand, i) => {
  if (!L.finalForm) return null;
  const pool = legiveis(ctx).filter(w => clean(w.he).includes(L.finalForm!));
  const alvo = at(pool, i);
  if (!alvo) return null;

  /* Três alternativas, e a terceira não é enfeite: a forma final de OUTRA
     letra. Com duas - a base e a final desta letra - a questão é cara ou
     coroa, e o teste da engine cobra três justamente por isso. Com a final de
     outra letra junto, a pergunta passa a ser "qual destas é a final DESTA
     letra", que é a confusão real de quem vê ם ן ך ף ץ pela primeira vez. */
  const outraFinal = Object.values(BASE_TO_FINAL)
    .filter(f => f !== L.finalForm && ctx.alphabet.includes(f));
  const alheia = take(outraFinal.length ? outraFinal : Object.values(BASE_TO_FINAL)
    .filter(f => f !== L.finalForm), 1, rand);
  const { options, answer } = optionsWith(L.finalForm, [L.letter, ...alheia], rand);

  const nomeFinal = (g: string) =>
    ctx.history.find(x => x.finalForm === g)?.namePt;

  return {
    id: `${L.id}-finword-${i}`, kind: 'final-form', letterId: L.id, skill: 'rec',
    promptPt: `Qual forma de ${L.namePt} aparece no FIM desta palavra?`,
    letter: alvo.he, options, answer,
    whyPt: options.map(o => {
      if (o === L.finalForm) return null;
      if (o === L.letter) {
        return `${L.letter} é a forma de começo e meio. No fim da palavra ela vira ${L.finalForm}.`;
      }
      const nome = nomeFinal(o);
      return nome ? `Essa é a forma final de ${nome}, não de ${L.namePt}.`
                  : 'Essa é a forma final de outra letra.';
    }),
    hintsPt: ['A forma final quase sempre desce abaixo da linha.'],
    explainPt: `${alvo.pt} termina em ${L.finalForm}. Mesma letra, mesmo som - só o desenho muda no fim da palavra.`
  };
};

/** A mesma letra escrita à mão: qual das cursivas é esta letra de imprensa? */
export const exCursiveToPrint: Gen = (L, ctx, rand, i) => {
  const wrong = letterDistractors(L, ctx, rand, 3);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(L.letter, wrong, rand);
  return {
    id: `${L.id}-cur2-${i}`, kind: 'print-vs-cursive', letterId: L.id, skill: 'rec',
    promptPt: `Esta é ${L.namePt} em letra de imprensa. Qual é ela na escrita à mão?`,
    letter: L.letter, options, answer,
    whyPt: options.map(o => o === L.letter ? null : 'Essa é outra letra.'),
    hintsPt: ['A cursiva é mais redonda: vale olhar a direção dos traços, não o contorno.'],
    explainPt: `Ninguém escreve hebraico à mão em letra de imprensa - a cursiva é a que se vê num bilhete.`
  };
};

/* ── the catalogue ──────────────────────────────────────────────────────── */

/** Every generator that needs a recording to be honest. */
export const NEEDS_AUDIO = new Set<Gen>([exAudioWord, exListenSyllable, exTypeHeard]);

/**
 * The order a lesson walks through. Deliberately alternating in GESTURE, not
 * just in content: recognise, then read, then assemble, then pair, then type.
 * A learner should not be able to settle into one motion.
 */
export const LESSON_GENERATORS: readonly Gen[] = [
  exLetterRecognition,
  exSyllableReading,
  exLetterInWord,
  exBuildSyllable,
  exConfusablePick,
  exWordMeaning,
  exOddOneOut,
  exVowelSound,
  exLetterPosition,
  exCompleteWord,
  exFinalInWord,
  exMatchSyllable,
  exSoundToSyllable,
  exBuildWord,
  exFinalForm,
  exPrintVsCursive,
  exListenSyllable,
  exMeaningToWord,
  exTypeTranslit,
  exMatchWordMeaning,
  exCursiveToPrint,
  exAudioWord,
  exMatchLetterSound,
  exTypeHeard
];

/** Skill → the generators that exercise it, for targeted practice. */
export const BY_SKILL: Record<string, readonly Gen[]> = {
  rec: [exLetterRecognition, exOddOneOut, exLetterInWord, exConfusablePick,
        exLetterPosition, exFinalForm, exFinalInWord, exPrintVsCursive, exCursiveToPrint],
  som: [exVowelSound, exMatchLetterSound],
  ler: [exSyllableReading, exBuildSyllable, exSoundToSyllable, exWordMeaning,
        exCompleteWord, exBuildWord, exMeaningToWord, exMatchSyllable,
        exMatchWordMeaning, exTypeTranslit],
  ouvir: [exListenSyllable, exAudioWord, exTypeHeard],
  /* Writing is produced on a canvas, not generated as a question - see
     components/learn/Tracing.tsx. The key exists so callers can ask for any
     skill without a special case. */
  escrever: []
};

export { onCarrier };
