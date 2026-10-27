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

import type { Letter, NikudSound, Sentence, Syllable, Word } from '@/lib/content';
import {
  BASE_TO_FINAL, clean, clusters, containsLetter, gapAtLetter, gappedGlyph,
  isReadableWith, onCarrier, splitSyllable
} from '@/lib/hebrew';
import { shuffled, take, type Rand } from './rng';
import { temClipe } from '@/lib/audio-registro';
import { somEmComum, somPt } from '@/lib/som-pt';

/* ── só o que já foi GRAVADO vira exercício de escuta ─────────────────────
   Todo item do curso tem `audioId`, gravado ou não: o id sai do hebraico.
   Enquanto não havia nenhuma gravação, `audioAvailable()` era falso e os
   três geradores de escuta nem rodavam. Com a primeira letra gravada ele
   virou verdadeiro para o curso INTEIRO - e sem esta checagem cada letra
   ainda sem áudio ganharia um "qual sílaba você ouviu?" sem som nenhum.
   O áudio chega em levas, letra por letra; a escuta acompanha item a item.
   "Gravado" vale para o estúdio (git) e para o painel: lib/audio-registro.ts. */
export const gravado = (audioId: string | null | undefined): boolean => temClipe(audioId);
import type { Exercise } from './types';

export type Ctx = {
  /** The letters taught so far, in order - the pool WORD distractors come from. */
  history: Letter[];
  /** Glyphs (base + final) the learner has met. Governs reading material. */
  alphabet: string[];
  /** Every glyph in the language, for single-letter distractors. */
  allGlyphs: string[];
  /**
   * As frases que este aluno já consegue ler, por ordem de letra.
   *
   * Vazio enquanto ele não tiver letras suficientes - até a letra 11 não há
   * frase nenhuma, e isso é o desenho, não uma falha: uma frase precisa de
   * verbo, e verbo precisa de letras que só chegam no meio do alfabeto.
   */
  sentences: Sentence[];
  /**
   * Os sons do nikud com TODOS os sinais que os escrevem.
   *
   * As sílabas de uma letra trazem um sinal por som - `מַ` e nunca `מָ` -, o
   * que basta para ler e não basta para a dificuldade que o próprio curso
   * anuncia ao aluno: dois desenhos para o mesmo som. Este campo é o que
   * permite montar os dois lados do par.
   */
  nikud: NikudSound[];
};

export type Gen = (L: Letter, ctx: Ctx, rand: Rand, round: number) => Exercise | null;

/* ── shared helpers ─────────────────────────────────────────────────────── */

/** Deduped, shuffled, with the index of the right answer. */
function optionsWith<T>(correct: T, wrong: T[], rand: Rand): { options: T[]; answer: number } {
  const unique = [...new Set([correct, ...wrong])];
  const options = shuffled(unique, rand);
  return { options, answer: options.indexOf(correct) };
}

/**
 * O glifo é a PRÓPRIA letra, em qualquer das duas formas?
 *
 * ם é Mem, ן é Nun. Uma pergunta "qual destas é Mem?" ou "uma destas não é
 * Mem" que traz ם como a errada está errada - e foi uma aluna que apontou
 * (27/09/2026): "essas letras todas são Mem". O alfabeto aprendido traz as
 * formas finais, e o `confusableWith` de cinco letras trazia a própria final;
 * as duas portas passam por aqui. A forma final tem exercício próprio
 * (`exFinalForm`), onde a base É a errada de propósito.
 */
export const mesmaLetra = (L: Letter, g: string): boolean => g === L.letter || g === L.finalForm;

function letterDistractors(L: Letter, ctx: Ctx, rand: Rand, n: number): string[] {
  const confusable = L.confusableWith.filter(c => !mesmaLetra(L, c));
  const learned = ctx.alphabet.filter(c => !mesmaLetra(L, c) && !confusable.includes(c));
  const rest = ctx.allGlyphs.filter(
    c => !mesmaLetra(L, c) && !confusable.includes(c) && !learned.includes(c)
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

/** Syllables that spell a vowel. Shva is excluded: it is the absence of one. */
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
    explainPt: `${L.namePt} faz o som ${somPt(L.sound)}.`
  };
};

export const exPrintVsCursive: Gen = (L, ctx, rand, i) => {
  const wrong = letterDistractors(L, ctx, rand, 3);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(L.letter, wrong, rand);
  return {
    id: `${L.id}-cur-${i}`, kind: 'print-vs-cursive', letterId: L.id, skill: 'rec',
    promptPt: 'Qual destas é a mesma letra, escrita à mão?',
    letter: L.letter, mostra: 'impressa', options, answer,
    explainPt: 'A cursiva é o que se escreve à mão; a de imprensa é o que se lê.'
  };
};

/* ך e ף não são "o mesmo som" da letra da lição: a lição de Kaf e a de Pe
   mostram o lado com o ponto (K, P), e no fim da palavra o som é sempre o
   suave - ך = CH, ף = F (auditoria 09, "Mesmo som" para as finais). Só
   ם, ן e ץ têm de fato o mesmo som da forma de começo e meio. */
const SOM_DA_FINAL_SUAVE: Record<string, string> = { 'ך': 'CH', 'ף': 'F' };

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
    explainPt: SOM_DA_FINAL_SUAVE[L.finalForm]
      ? `Outro desenho, e quase sempre descendo abaixo da linha. E no fim da palavra o som é sempre o suave: ${L.finalForm} = ${SOM_DA_FINAL_SUAVE[L.finalForm]}.`
      : 'Mesmo som, outro desenho - e quase sempre descendo abaixo da linha.'
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
  const outras = L.confusableWith.filter(c => !mesmaLetra(L, c));
  const intruder = outras[i % Math.max(1, outras.length)];
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

/**
 * Duas grafias, um som.
 * ─────────────────────────────────────────────────────────────────────────
 * A introdução do nikud diz ao aluno, com todas as letras, que a dificuldade
 * de verdade é haver dois sinais para o mesmo som. Nenhum exercício treinava
 * isso, e não por esquecimento: as sílabas de uma letra trazem UM sinal por
 * som - `מַ` e nunca `מָ` -, então a segunda grafia simplesmente não era
 * mostrada em lugar nenhum. O aluno saía do curso sem nunca ter visto kamats.
 *
 * Aqui as duas aparecem lado a lado e a pergunta é o som. A resposta é uma
 * só, e as opções são os sons do nikud - a mesma régua do `exVowelSound`,
 * inclusive no mínimo de três alternativas: uma pergunta de sim ou não seria
 * 50% de acerto no chute, e este é um item que entra em prova.
 *
 * As sílabas são COMPOSTAS (consoante + sinal solto de `nikud.json`) em vez
 * de lidas da letra, porque é justamente a grafia que falta na letra.
 */
export const exVowelPair: Gen = (L, ctx, rand, i) => {
  /* Só os sons escritos de dois jeitos: a, e, o, u. `i` e `sheva` têm um
     sinal cada e não têm par para mostrar. */
  /* A grafia com ו (holam malé וֹ, shuruk וּ) só depois de o ו ser ensinado:
     antes disso ela põe na tela uma letra que o aluno ainda não conhece. O
     defeito ficou escondido enquanto o índice seguia a ordem fixa, e apareceu
     quando as rodadas passaram a variar (26/09/2026). */
  const temVav = ctx.alphabet.includes('ו');
  const comDois = ctx.nikud
    .map(s => ({ ...s, signs: s.signs.filter(g => temVav || !g.sign.includes('ו')) }))
    .filter(s => s.signs.length >= 2);
  const som = at(comDois, i);
  if (!som) return null;

  const [a, b] = shuffled(som.signs, rand);
  if (!a || !b) return null;

  /* As cinco vogais, na ordem de sempre. `sheva` fica de fora das opções: ele
     não é uma vogal a escolher, é a ausência de uma. */
  const options: string[] = VOWEL_ORDER.filter(v => ctx.nikud.some(s => s.sound === v));
  const answer = options.indexOf(som.sound);
  if (answer < 0 || options.length < 3) return null;

  /* A consoante como a lição a ensina (27/10/2026): na lição do Kaf, que só
     mostra o lado COM o ponto (soOLadoDoPonto), כַ sem o ponto já se lê
     "cha", o som do Chaf, que ainda não foi ensinado. Quando todas as
     leituras que a letra traz têm daguesh, a sílaba sai com ele: כַּ כָּ. */
  const V = L.variantes ?? [];
  const base = V.length && V.every(v => v.he.includes('\u05BC')) ? V[0]!.he : L.letter;
  const silaba = (sinal: string) => `${base}${sinal}`.normalize('NFC');
  return {
    id: `${L.id}-parvogal-${som.sound}`,
    kind: 'vowel-pair', letterId: L.id, skill: 'som',
    promptPt: 'Estas duas escrevem o MESMO som. Qual é?',
    he: `${silaba(a.sign)} ${silaba(b.sign)}`,
    options, answer,
    whyPt: options.map(v => v === som.sound ? null : `Esse som se escreve de outro jeito.`),
    hintsPt: ['Os dois desenhos são diferentes. O som que sai é o mesmo.'],
    explainPt: `${a.namePt} e ${b.namePt} escrevem o mesmo som. ` +
      'Dois desenhos para um som é a parte do nikud que mais confunde no começo - ' +
      'e é por isso que não adianta decorar o desenho sozinho.'
  };
};

/* ── as leituras de uma letra que tem mais de uma ──────────────────────────
 * Dá o SOM e pede o desenho: "qual destas se lê com o som do CH de chave?",
 * com {{שׁ}}, {{שׂ}} e o {{ש}} sem sinal nenhum na mesa.
 *
 * Era o buraco mais concreto do curso: {{ש}} tem duas leituras, a lição
 * explicava a diferença em prosa, e nenhum exercício jamais pedia ao aluno
 * para usá-la. Dava para terminar a lição do shin sem nunca ter decidido,
 * uma vez que fosse, se aquele ponto estava à direita ou à esquerda.
 *
 * ── por que esta direção, e não "que som tem este desenho" ───────────────
 * A primeira versão mostrava um desenho e pedia o som, com uma alternativa
 * por leitura. O invariante da suíte a rejeitou, e com razão: shin tem dois
 * sons, duas alternativas são 50% no chute, e um item de 50% não mede nada.
 * Virando a pergunta, as alternativas passam a ser DESENHOS - e aí entra o
 * terceiro, que é o mais instrutivo de todos: a letra sem sinal, do jeito
 * que ela aparece num texto sem niqqud, onde nada diz qual leitura é.
 */
export const exLetterVariant: Gen = (L, _ctx, rand, i) => {
  const V = L.variantes ?? [];
  if (V.length < 2) return null;

  const alvo = at(V, i);
  if (!alvo) return null;

  /* Os desenhos: as leituras, mais a letra crua. Nenhum repetido - em
     {{כ}} a forma sem ponto JÁ É a letra crua, e duas alternativas iguais
     fazem a pergunta não ter resposta certa. */
  const desenhos: string[] = [];
  for (const v of V) if (!desenhos.includes(v.he)) desenhos.push(v.he);
  if (!desenhos.includes(L.letter)) desenhos.push(L.letter);
  if (desenhos.length < 3) return null;

  /* A pergunta dá o SOM e pede o desenho, então dois desenhos do mesmo som
     na mesa tiram a resposta única: em {{כ}} e {{פ}} a forma final soa
     igual à forma sem ponto, e perguntar “qual se lê F, sempre?” com {{פ}} e
     {{ף}} lado a lado só se responde lendo o enunciado com lupa. Quando é
     esse o alvo, este formato não serve - e quem serve é o de sílaba. */
  const somDe = new Map(V.map(v => [v.he, v.som]));
  if (desenhos.some(g => g !== alvo.he && somDe.get(g) === alvo.som)) return null;

  const options = shuffled(desenhos, rand);
  const answer = options.indexOf(alvo.he);
  if (answer < 0) return null;

  const crua = (g: string) => g === L.letter;
  return {
    /* O id leva o índice, e não o desenho: o SRS guarda ids, e um id com
       niqqud dentro é um id que muda de forma conforme quem o normaliza. */
    id: `${L.id}-variante-${i}`,
    kind: 'letter-variant', letterId: L.id, skill: 'som',
    promptPt: `Qual destas se lê com ${alvo.comoPt}?`,
    /* O enunciado já traz o som; o estímulo grande seria repetir. */
    he: '',
    options, answer,
    whyPt: options.map(g => g === alvo.he ? null
      : crua(g)
        ? 'Essa é a letra sem sinal nenhum: ela não diz qual das leituras é. '
          + `Para ${alvo.comoPt}, o sinal é ${alvo.ondePt}.`
        : `Essa é a outra leitura. Para ${alvo.comoPt}, o sinal é ${alvo.ondePt}.`),
    hintsPt: [`O sinal de ${alvo.nomePt} é ${alvo.ondePt}.`],
    explainPt: `${alvo.nomePt}: ${alvo.ondePt}, e o som é ${alvo.comoPt}. `
      + 'A letra é a mesma nas duas - quem decide é o sinal. Sem sinal, é o '
      + 'contexto da palavra que diz, e é por isso que ler sem niqqud vem depois.'
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
  const pool = vowelSyllables(L).filter(s => gravado(s.audioId));
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
  /* Nunca duas cartas com o mesmo som (auditoria de 01/10/2026, CONT-001).
     O Match corrige por índice: com כ e ק ambos "k", ligar ק ao "k" do כ
     contava erro, e o modelo de confusões aprendia um par que não existe.
     A letra da lição entra sempre; das recentes, só as que não dividem
     nenhum som com quem já está na mesa (Tav/Tet, Álef/Áyin, Kaf/Kuf). */
  const recentes = shuffled(ctx.history.filter(x => x.id !== L.id).slice(-5), rand);
  const chosen: Letter[] = [L];
  for (const x of recentes) {
    if (chosen.length >= 4) break;
    if (chosen.some(c => somEmComum(c.sound, x.sound))) continue;
    chosen.push(x);
  }
  if (chosen.length < 3) return null;
  return {
    id: `${L.id}-mls-${i}`, kind: 'match', letterId: L.id, skill: 'som',
    promptPt: 'Ligue cada letra ao seu som.',
    pairs: shuffled(chosen, rand).map(x => ({ left: x.letter, right: somPt(x.sound) })),
    leftKind: 'glyph', rightKind: 'text',
    labelLeft: 'Letra', labelRight: 'Som',
    explainPt: 'O som é a única coisa que a forma da letra não mostra - é o que precisa ser decorado.'
  };
};

/* A mesma diferença, agora dentro de uma sílaba.
 * ────────────────────────────────────────────────────────────────────────
 * O companheiro do `exLetterVariant`, e o único formato possível em {{ב}},
 * {{כ}} e {{פ}}: nelas a forma SEM ponto JÁ É uma das leituras, então não
 * existe um terceiro desenho para pôr na mesa e a pergunta de escolha entre
 * dois vira cara ou coroa - que a suíte recusa, com razão.
 *
 * A saída não é baixar a exigência: é mudar de nível. A mesma letra com dois
 * sinais e duas vogais dá quatro sílabas diferentes - {{בָּ}}, {{בָ}},
 * {{בִּ}}, {{בִ}} -, cada uma com a sua leitura, nenhuma repetida. E é o
 * gesto que o aluno vai precisar de verdade: o ponto nunca aparece sozinho
 * numa página, aparece numa sílaba, ao lado de uma vogal.
 *
 * Também serve ao {{ש}}, e por isso os dois geradores são tentados na ordem:
 * primeiro o desenho puro, que ensina o LADO do ponto, e este quando aquele
 * não tem três desenhos para oferecer.
 */

/* As marcas que distinguem uma leitura da outra: daguesh, ponto de shin,
   ponto de sin. São as únicas que este gerador troca. */
const MARCA_DE_LEITURA = /[\u05BC\u05C1\u05C2]/;
/* Todo sinal que gruda numa letra. Serve para achar onde a PRIMEIRA letra
   da sílaba termina - e é por isso que existe: em {{שׁוּ}} o ponto do shuruk
   é o mesmo caractere do daguesh, mas está no vav, e trocar o do vav
   destruiria a vogal em vez de trocar a leitura. */
const SINAL = /[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/;

/** A sílaba reescrita na outra leitura da mesma letra, ou `null`. */
function comLeitura(silaba: string, base: string, leitura: string): string | null {
  if (silaba[0] !== base) return null;
  let k = 1;
  while (k < silaba.length && SINAL.test(silaba[k]!)) k++;
  const vogal = [...silaba.slice(1, k)].filter(c => !MARCA_DE_LEITURA.test(c)).join('');
  /* NFC porque a ordem canônica dos sinais não é a ordem em que eles foram
     concatenados aqui, e o dado do curso está em NFC. */
  return (leitura + vogal + silaba.slice(k)).normalize('NFC');
}

export const exVariantSyllable: Gen = (L, _ctx, rand, i) => {
  /* A forma final fica de fora: ela só existe no fim de uma palavra, e uma
     sílaba solta começada por ela não é hebraico. */
  const V = (L.variantes ?? []).filter(v => v.he !== L.finalForm);
  if (V.length < 2) return null;

  const silabas = vowelSyllables(L);
  if (silabas.length < 2) return null;

  const alvo = at(V, i);
  const primeira = at(silabas, i);
  const segunda = at(silabas, i + 1);
  if (!alvo || !primeira || !segunda || primeira.vowel === segunda.vowel) return null;

  /* Duas leituras × duas vogais. A resposta é uma só porque nenhuma outra
     combinação se lê igual. */
  const montadas: { he: string; leitura: string; v: typeof V[number] }[] = [];
  for (const s of [primeira, segunda]) {
    for (const v of V.slice(0, 2)) {
      const he = comLeitura(s.he, L.letter, v.he);
      if (he) montadas.push({ he, leitura: v.translit + s.vowel, v });
    }
  }
  const certa = montadas.find(m => m.v.he === alvo.he && m.leitura.endsWith(primeira.vowel));
  if (!certa) return null;
  /* Um desenho repetido ou uma leitura repetida tiraria a resposta única. */
  if (new Set(montadas.map(m => m.he)).size !== montadas.length) return null;
  if (new Set(montadas.map(m => m.leitura)).size !== montadas.length) return null;
  if (montadas.length < 3) return null;

  const opcoes = shuffled(montadas, rand);
  const options = opcoes.map(m => m.he);
  const answer = opcoes.findIndex(m => m.he === certa.he);
  if (answer < 0) return null;

  return {
    id: `${L.id}-varsil-${i}`,
    kind: 'letter-variant', letterId: L.id, skill: 'ler',
    promptPt: `Qual destas se lê “${certa.leitura}”?`,
    he: '',
    options, answer,
    whyPt: opcoes.map(m => m.he === certa.he ? null
      : m.v.he === alvo.he
        ? `A leitura está certa, a vogal não: essa lê-se “${m.leitura}”.`
        : `Essa lê-se “${m.leitura}” - é a outra leitura da letra, ${m.v.ondePt}.`),
    hintsPt: [`${alvo.nomePt}: ${alvo.ondePt}.`],
    explainPt: `${alvo.nomePt} é ${alvo.ondePt}, e soa ${alvo.comoPt}. `
      + 'A letra é a mesma nas duas - quem decide é o sinal, e a vogal vem depois dele.'
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

/**
 * A sílaba, digitada. O item de recuperação ativa que serve a TODA letra.
 * ─────────────────────────────────────────────────────────────────────────
 * `exTypeTranslit` pede uma palavra, e as duas primeiras letras não têm
 * palavra legível nenhuma. A sílaba toda letra tem - seis delas -, e a
 * transliteração de uma sílaba é curta e sem ambiguidade: "mo", "tsi", "ve".
 *
 * É o gesto que as quatro alternativas não conseguem pedir: LEMBRAR a leitura
 * em vez de reconhecê-la numa lista. Quem escolhe "mo" entre "ma, mi, mo" só
 * precisa saber que não é "ma" nem "mi"; quem digita precisa saber que é "mo".
 */
export const exTypeSyllable: Gen = (L, _ctx, _rand, i) => {
  const pool = vowelSyllables(L);
  const target = at(pool, i + 2);
  if (!target || !target.translit) return null;
  return {
    id: `${L.id}-tsy-${i}`, kind: 'type-answer', letterId: L.id, skill: 'ler',
    promptPt: 'Como se lê esta sílaba? Escreva.',
    he: target.he,
    accept: [target.translit],
    placeholder: 'escreva aqui',
    want: 'translit',
    audioId: target.audioId,
    hintsPt: [
      'Primeiro o som da consoante, depois o da vogal.',
      `Começa com “${target.translit[0]}”.`
    ],
    explainPt: `${target.he} - ${target.translit}. ${target.ptApprox}.`
  };
};

export const exTypeHeard: Gen = (L, _ctx, rand, i) => {
  const usable = L.wordsToRead.filter(w => gravado(w.audioId) && w.translit.length <= 9);
  const target = at(usable, i);
  if (!target) return null;
  return {
    id: `${L.id}-tph-${i}`, kind: 'type-answer', letterId: L.id, skill: 'ouvir',
    promptPt: 'Escreva o que você ouviu.',
    /* A transliteração ou a própria palavra em hebraico, com ou sem nikud
       (`typedIsCorrect`, 04/10/2026). Só aqui: onde a palavra hebraica está
       na tela, aceitá-la de volta seria copiar, e não ler. */
    accept: [target.translit, target.he],
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

/**
 * Ler uma FRASE inteira e dizer o que ela quer dizer.
 * ─────────────────────────────────────────────────────────────────────────
 * O exercício que faltava. Até aqui o item mais longo do curso eram duas
 * palavras, e o aluno chegava ao fim com 22 letras, 99 palavras soltas e
 * nenhuma linha lida - que é exatamente o que ele acha que comprou.
 *
 * Três decisões, e as três são sobre NÃO facilitar:
 *
 * · a transliteração não aparece. Ela é a muleta que faz o aluno ler o
 *   alfabeto latino e achar que leu hebraico. Fica na explicação, depois de
 *   responder, que é quando ela ensina em vez de substituir;
 * · a frase recém-destravada vem primeiro. Ela é a que produz o "eu li isto
 *   sozinho", e esse momento vale mais quando chega no dia em que a última
 *   letra dela foi aprendida;
 * · os distratores são significados de OUTRAS frases do curso, nunca
 *   inventados. Um distrator absurdo se elimina sem ler o hebraico, e aí o
 *   exercício mede outra coisa.
 */
export const exSentenceReading: Gen = (L, ctx, rand, i) => {
  if (!ctx.sentences.length) return null;
  /* A que esta letra acabou de destravar tem prioridade; depois as outras,
     da mais tardia para a mais antiga, porque as tardias são as que o aluno
     ainda não viu. */
  const recem = ctx.sentences.filter(s => s.after === L.order);
  const resto = ctx.sentences.filter(s => s.after !== L.order).sort((a, b) => b.after - a.after);
  const fila = [...recem, ...resto];
  const alvo = at(fila, i);
  if (!alvo) return null;

  const outras = ctx.sentences.filter(s => s.id !== alvo.id);
  const wrong = take(shuffled(outras, rand).map(s => s.pt), 3, rand);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(alvo.pt, wrong, rand);

  return {
    id: `${L.id}-frase-${alvo.id}`, kind: 'sentence-reading', letterId: L.id, skill: 'ler',
    promptPt: alvo.words.length > 1
      ? 'Leia a frase inteira. O que ela quer dizer?'
      : 'Leia. O que está escrito?',
    he: alvo.he,
    words: alvo.words.map(w => ({ he: w.he, translit: w.translit, pt: w.pt })),
    options, answer,
    audioId: alvo.audioId,
    /* A dica dá a PRIMEIRA palavra, não a frase. Quem trava numa palavra
       destrava com ela; quem não leu nada continua sem ler. */
    hintsPt: alvo.words.length > 1
      ? [`A primeira palavra é “${alvo.words[0]!.pt}”.`]
      : undefined,
    explainPt: `${alvo.he} - ${alvo.translit} - ${alvo.pt}. ${alvo.notePt}`
  };
};

/* ── a frase ouvida ──────────────────────────────────────────────────────
 * Até aqui a escuta do curso era de palavra solta. Estes dois pegam as frases
 * que o aluno já sabe ler - as mesmas de `exSentenceReading` - e tiram o
 * texto da tela: primeiro ouvir e achar a frase escrita (o ouvido guiando o
 * olho), depois ouvir e entender sem texto nenhum. Só com frase gravada: a
 * régua é a mesma `gravado` das outras escutas.
 */
const frasesGravadas = (L: Letter, ctx: Ctx) => {
  const recem = ctx.sentences.filter(s => s.after === L.order);
  const resto = ctx.sentences.filter(s => s.after !== L.order).sort((a, b) => b.after - a.after);
  return [...recem, ...resto].filter(s => gravado(s.audioId));
};

/** Ouça e ache a frase escrita. As alternativas são outras frases que ele já lê. */
export const exListenSentence: Gen = (L, ctx, rand, i) => {
  const alvo = at(frasesGravadas(L, ctx), i);
  if (!alvo) return null;
  const wrong = take(shuffled(ctx.sentences.filter(s => s.id !== alvo.id), rand).map(s => s.he), 3, rand);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(alvo.he, wrong, rand);
  return {
    id: `${L.id}-ouvir-frase-${alvo.id}`, kind: 'audio-recognition', letterId: L.id, skill: 'ouvir',
    promptPt: 'Qual frase você ouviu?',
    audioId: alvo.audioId, options, answer,
    explainPt: `${alvo.he} - ${alvo.translit} - ${alvo.pt}`
  };
};

/** Ouça, sem texto, e diga o que a frase quer dizer. */
export const exListenMeaning: Gen = (L, ctx, rand, i) => {
  const alvo = at(frasesGravadas(L, ctx), i + 1);
  if (!alvo) return null;
  const wrong = take(shuffled(ctx.sentences.filter(s => s.id !== alvo.id), rand).map(s => s.pt), 3, rand);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(alvo.pt, wrong, rand);
  return {
    id: `${L.id}-ouvir-sentido-${alvo.id}`, kind: 'listen-meaning', letterId: L.id, skill: 'ouvir',
    promptPt: 'Ouça a frase. O que ela quer dizer?',
    audioId: alvo.audioId, options, answer,
    /* A primeira palavra, como na leitura: destrava quem pegou metade. */
    hintsPt: alvo.words.length > 1 ? [`A frase começa com “${alvo.words[0]!.translit}”.`] : undefined,
    explainPt: `${alvo.he} - ${alvo.translit} - ${alvo.pt}`
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
  const target = at(L.wordsToRead.filter(w => gravado(w.audioId)), i);
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
  /* Só palavras em que a letra aparece UMA vez (base ou final): em שֶׁמֶשׁ,
     נֹתֵן ou לַיְלָה ela está em duas posições, e a pergunta teria duas
     respostas certas (auditoria de 01/10/2026, CONT-006). */
  const vezes = (he: string) =>
    clusters(he).filter(c => c[0] === L.letter || (!!L.finalForm && c[0] === L.finalForm)).length;
  const pool = legiveis(ctx).filter(w => containsLetter(w.he, L.letter) && vezes(w.he) === 1);
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
  const confusos = L.confusableWith.filter(c => !mesmaLetra(L, c) && ctx.allGlyphs.includes(c));
  /* UM parecido já basta.
     ──────────────────────────────────────────────────────────────────────
     Exigia dois, e por isso cinco letras atravessavam o curso inteiro sem
     nunca receber este exercício: Lámed (nenhum declarado), Pe, Álef, Shin e
     Bet (um cada). Justo as duas últimas são metade do par que mais engana -
     ב contra כ. Inventar um segundo parecido para cada uma seria pior: um par
     falso ensina uma diferença que não existe. Então o parecido de verdade
     entra como distrator principal e o resto é completado com o alfabeto. */
  if (!confusos.length) return null;
  const enchimento = ctx.allGlyphs.filter(c => !mesmaLetra(L, c) && !confusos.includes(c));
  const wrong = [...take(confusos, 3, rand), ...shuffled(enchimento, rand)].slice(0, 3);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(L.letter, wrong, rand);
  const nomeDe = (g: string) => ctx.history.find(x => x.letter === g || x.finalForm === g)?.namePt;

  /* A frase que diz a DIFERENÇA, não só o nome.
     "Essa é Dálet" informa e não corrige: a pessoa erra de novo pelo mesmo
     motivo, porque ninguém disse onde olhar. O contraste é escrito de um lado
     só do par no conteúdo, então procura-se nos dois sentidos. */
  const contraste = (outro: string): string | null => {
    const meu = L.contrastes?.[outro];
    if (meu) return meu;
    const dono = ctx.history.find(x => x.letter === outro || x.finalForm === outro);
    return dono?.contrastes?.[L.letter] ?? null;
  };

  return {
    id: `${L.id}-conf-${i}`, kind: 'letter-recognition', letterId: L.id, skill: 'rec',
    promptPt: `Entre estas parecidas, qual é ${L.namePt}?`,
    letter: L.letter, options, answer,
    whyPt: options.map(o => {
      if (o === L.letter) return null;
      const traco = contraste(o);
      if (traco) return traco;
      const nome = nomeDe(o);
      return nome ? `Essa é ${nome}. Olhe o desenho de novo.` : 'Essa é outra letra, bem parecida.';
    }),
    hintsPt: [L.soundNotePt],
    explainPt: `${L.namePt} faz o som ${somPt(L.sound)}. As outras aqui são as que mais se parecem com ela.`
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
    explainPt: SOM_DA_FINAL_SUAVE[L.finalForm]
      ? `${alvo.pt} termina em ${L.finalForm}. Mesma letra, outro desenho - e no fim da palavra o som é sempre o suave: ${L.finalForm} = ${SOM_DA_FINAL_SUAVE[L.finalForm]}.`
      : `${alvo.pt} termina em ${L.finalForm}. Mesma letra, mesmo som - só o desenho muda no fim da palavra.`
  };
};

/**
 * A direção contrária: a letra chega escrita à mão e a pergunta é que letra
 * é aquela no livro.
 *
 * Ela não existia. Este gerador tinha o nome da volta e fazia a ida - mesmo
 * estímulo impresso, mesmas alternativas cursivas do `exPrintVsCursive` -, e
 * assim o curso treinava escrever a cursiva e nunca treinava LER a cursiva.
 * São habilidades diferentes: reconhecer o bilhete de outra pessoa é a que
 * se usa primeiro, e era a que faltava.
 */
export const exCursiveToPrint: Gen = (L, ctx, rand, i) => {
  const wrong = letterDistractors(L, ctx, rand, 3);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(L.letter, wrong, rand);
  return {
    id: `${L.id}-cur2-${i}`, kind: 'print-vs-cursive', letterId: L.id, skill: 'rec',
    promptPt: 'Esta letra está escrita à mão. Qual é ela em letra de imprensa?',
    letter: L.letter, mostra: 'cursiva', options, answer,
    whyPt: options.map(o => o === L.letter ? null : 'Essa é outra letra.'),
    hintsPt: ['Na cursiva vale olhar a direção dos traços, e não o contorno.'],
    explainPt: `${L.namePt} à mão e ${L.namePt} no livro são a mesma letra em dois desenhos - `
      + 'e ler o bilhete de alguém pede a primeira.'
  };
};

/* ── the catalogue ──────────────────────────────────────────────────────── */

/** Every generator that needs a recording to be honest. */
export const NEEDS_AUDIO = new Set<Gen>([exAudioWord, exListenSyllable, exTypeHeard, exListenSentence, exListenMeaning]);

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
  exSentenceReading,
  exOddOneOut,
  exVowelSound,
  exVowelPair,
  exLetterVariant,
  exVariantSyllable,
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
  exTypeHeard,
  exListenSentence,
  exListenMeaning
];

/** Skill → the generators that exercise it, for targeted practice. */
export const BY_SKILL: Record<string, readonly Gen[]> = {
  rec: [exLetterRecognition, exOddOneOut, exLetterInWord, exConfusablePick,
        exLetterPosition, exFinalForm, exFinalInWord, exPrintVsCursive, exCursiveToPrint],
  som: [exVowelSound, exVowelPair, exLetterVariant, exMatchLetterSound],
  ler: [exVariantSyllable, exSyllableReading, exBuildSyllable, exSoundToSyllable, exWordMeaning,
        exCompleteWord, exBuildWord, exMeaningToWord, exMatchSyllable,
        exMatchWordMeaning, exTypeTranslit, exSentenceReading],
  ouvir: [exListenSyllable, exAudioWord, exTypeHeard, exListenSentence, exListenMeaning],
  /* Writing is produced on a canvas, not generated as a question - see
     components/learn/Tracing.tsx. The key exists so callers can ask for any
     skill without a special case. */
  escrever: []
};

export { onCarrier };
