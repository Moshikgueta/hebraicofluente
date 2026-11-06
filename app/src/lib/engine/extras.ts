/* Exercises for modules 6 and 7 - the two units that teach no new letter.
 *
 * They need question types the 22 letter lessons never do, and the difference
 * is not cosmetic:
 *
 *   · `dagesh-sound` asks which of two sounds a letter has IN THIS WORD. It is
 *     the only exercise in the course whose answer depends on position rather
 *     than on the glyph, which is exactly the skill module 6 exists to build.
 *   · `unpointed-read` removes the nikud. Every other reading exercise in the
 *     course is pointed, because a beginner needs the vowels; real Hebrew has
 *     none, and this is where the course admits it.
 *   · `gerech-sound` covers the three modern sounds.
 *
 * The order rule does not constrain anything here: these modules come after
 * letter 22, so the whole alphabet is available. What still holds is that the
 * words are the ones the learner already met - they come from data/extras.json,
 * which validate.js V19 checks against data/letters.json.
 */

import type { Exercise } from './exercises';
import { rng, shuffled, take, type Rand } from './rng';
import { analisar } from './posicao-do-ponto';
import { stripNikud } from '@/lib/hebrew';
import { fmt } from '@/i18n';
import { tx } from '@/i18n/telas/motor-extras';

export type DageshLetter = {
  id: string;
  namePt: string;
  hard: string;
  soft: string;
  hardPt: string;
  softPt: string;
  hardWords: { he: string; translit: string; pt: string; audioId: string }[];
  softWords: { he: string; translit: string; pt: string; audioId: string }[];
  notePt: string;
};

export type FinalForm = {
  base: string; fin: string; namePt: string; nameHe: string;
  word: string; translit: string; pt: string; descends: boolean; audioId: string;
};

export type GerechLetter = {
  id: string; he: string; base: string; basePt: string; pt: string; likePt: string;
  audioId: string;
  words: { he: string; pt: string; audioId: string }[];
};

/** Uma palavra da lista sem nikud. `bare`, `translit` e `pt` são preenchidos
 *  pelo exportador a partir de letters.json - a fonte lista só a apontada. */
export type UnpointedWord = {
  bare: string; pointed: string; translit: string; pt: string; audioId: string;
};

/** Uma lição de som: Vet, Chaf, Fe (a letra sem daguesh), Sin (o ponto do
 *  ש à esquerda) ou Tch, Dj, J (a letra com guéresh). Ver data/extras.json →
 *  `sons` e lib/sons.ts. */
export type SomLicao = {
  id: string;
  tipo: 'daguesh' | 'ponto' | 'gerech';
  modulo: number;
  licao: number;
  /** A lição que vem logo antes no caminho: a letra (bet) ou outro som (tch). */
  depoisDe: string | null;
  namePt: string;
  he: string;
  som: string;
  comoPt: string;
  parHe: string;
  parNomePt: string;
  parSom: string;
  parId: string;
  /** O sinal que distingue, dito em palavras: "sem o ponto", "ponto à esquerda". */
  rotuloPt: string;
  parRotuloPt: string;
  finalHe: string | null;
  introPt: string;
  articulacao: import('@/lib/content-publico').Articulacao;
  regraPt: string;
  irmaoPt: string;
  /** A curiosidade da lição, quando ela tem uma (19/10/2026). */
  curiosidade?: { tituloPt: string; textoPt: string };
  erro: { wrong: string; right: string; why: string };
  audioId: string;
  silabas: { he: string; translit: string; audioId: string }[];
  parSilabas: { he: string; translit: string; audioId: string }[];
  palavras: { he: string; translit: string; pt: string; audioId: string }[];
  parPalavras: { he: string; translit: string; pt: string; audioId: string }[];
  checagem: import('@/lib/content-publico').ItemCompreensao[];
};

export type Extras = {
  dagesh: { titlePt: string; rulePt: string; warningPt: string; letters: DageshLetter[] };
  finals: FinalForm[];
  unpointed: {
    introPt: string;
    /** Três blocos que sobem de dificuldade. É a TELA que usa isto. */
    groups: { id: string; titlePt: string; notePt: string; words: UnpointedWord[] }[];
    /** O par que tem o mesmo desenho sem os pontos - a lição de verdade sobre
     *  ler sem nikud, e a única do curso em que a resposta é "depende". */
    ambiguous: { bare: string; notePt: string; readings: UnpointedWord[] };
    /** Os três grupos achatados, em ordem. O gerador de exercícios sorteia
     *  daqui e não precisa saber que a tela agrupa. */
    words: UnpointedWord[];
  };
  gerech: {
    titlePt: string; signNamePt: string; signHe: string;
    introPt: string; signNotePt: string; letters: GerechLetter[];
  };
  sons: SomLicao[];
};

/* The extra kinds, added to the shared Exercise union via the same shape the
   player already knows how to render: a prompt, options, an answer, a reason. */
export type ExtraExercise = Exercise;

const optionsWith = (correct: string, wrong: string[], rand: Rand) => {
  const unique = [...new Set([correct, ...wrong])];
  const options = shuffled(unique, rand);
  return { options, answer: options.indexOf(correct) };
};

/* ── module 6 ───────────────────────────────────────────────────────────── */

export function buildDageshQuiz(extras: Extras, count = 10, seed = 'mod6'): Exercise[] {
  const rand = rng(seed);
  const out: Exercise[] = [];

  /* One "which sound does it have here?" per word, hard and soft interleaved
     so the answer is never predictable from position in the list.

     SEM NIKUD (27/10/2026, pedido do dono: "na parte sem nikud ainda tem
     nikud"). O fecho é a etapa "Sem nikud" da lição 23, e esta pergunta
     mostrava a palavra pontuada, com o daguesh à vista: a resposta estava
     desenhada. Agora a palavra vem sem ponto nenhum, com o significado como
     pista, e o aluno decide pelo que a lição 21 ensinou: no começo e depois
     de consoante, o som forte; depois de vogal, o suave. Por isso só entram as
     palavras em que essa regra acerta e a letra aparece uma vez só: as do
     ponto que dobra (אַבָּא) não teriam resposta sem os pontos. A forma
     pontuada aparece na explicação, depois de responder. */
  const base = (hard: string) => hard.normalize('NFD')[0]!;
  const legivelSemPontos = (he: string, letra: string): boolean => {
    const a = analisar(he).filter(x => x.letra.he === letra);
    return a.length === 1 && a[0]!.previsto === a[0]!.real;
  };
  const rows = extras.dagesh.letters.flatMap(D => [
    ...D.hardWords.map(w => ({ D, w, isHard: true })),
    ...D.softWords.map(w => ({ D, w, isHard: false }))
  ]).filter(r => legivelSemPontos(r.w.he, base(r.D.hard)));

  for (const [i, row] of shuffled(rows, rand).entries()) {
    const correct = row.isHard ? row.D.hardPt : row.D.softPt;
    const wrong = row.isHard ? row.D.softPt : row.D.hardPt;
    const { options, answer } = optionsWith(correct, [wrong], rand);
    out.push({
      id: `mod6-dag-${row.D.id}-${i}`,
      kind: 'word-meaning',
      letterId: row.D.id, skill: 'ler',
      promptPt: fmt(tx.dagueshPergunta, { sentido: row.w.pt, nome: row.D.namePt }),
      he: stripNikud(row.w.he),
      options,
      answer,
      explainPt: fmt(tx.palavraExplica, { he: row.w.he, leitura: row.w.translit, sentido: row.w.pt }) +
        (row.isHard
          ? tx.dagueshExplicaForte
          : tx.dagueshExplicaSuave)
    });
  }

  /* The five finals, against each other. */
  for (const [i, F] of extras.finals.entries()) {
    const wrong = extras.finals.filter(x => x.fin !== F.fin).map(x => x.fin);
    const { options, answer } = optionsWith(F.fin, take(wrong, 3, rand), rand);
    out.push({
      id: `mod6-fin-${i}`,
      kind: 'final-form',
      letterId: 'mod6', skill: 'rec',
      promptPt: fmt(tx.finalPergunta, { nome: F.namePt.replace(' sofit', '') }),
      letter: F.base,
      options,
      answer,
      explainPt: fmt(tx.finalExplica, { base: F.base, final: F.fin, palavra: F.word, leitura: F.translit, sentido: F.pt })
    });
  }

  /* Unpointed reading: the real test of the module. */
  for (const [i, u] of extras.unpointed.words.entries()) {
    const wrong = extras.unpointed.words.filter(x => x.bare !== u.bare).map(x => x.pt);
    const { options, answer } = optionsWith(u.pt, take(wrong, 3, rand), rand);
    out.push({
      id: `mod6-unp-${i}`,
      kind: 'word-meaning',
      letterId: 'mod6', skill: 'ler',
      promptPt: tx.semNikudPergunta,
      he: u.bare,
      options,
      answer,
      explainPt: fmt(tx.semNikudExplica, { nua: u.bare, pontuada: u.pointed, leitura: u.translit, sentido: u.pt })
    });
  }

  return shuffled(out, rng(seed + '-order')).slice(0, count);
}

/* ── module 7 ───────────────────────────────────────────────────────────── */

export function buildGerechQuiz(extras: Extras, count = 8, seed = 'mod7'): Exercise[] {
  const rand = rng(seed);
  const out: Exercise[] = [];
  const G = extras.gerech.letters;

  /* With the sign versus without it: the whole point of the module. */
  for (const [i, g] of G.entries()) {
    const { options, answer } = optionsWith(g.pt, G.filter(x => x.id !== g.id).map(x => x.pt).concat(g.basePt), rand);
    out.push({
      id: `mod7-snd-${i}`,
      kind: 'syllable-reading',
      letterId: 'mod7', skill: 'som',
      promptPt: tx.gerechPergunta,
      he: g.he,
      options,
      answer,
      explainPt: fmt(tx.gerechExplica, { he: g.he, som: g.pt, como: g.likePt, base: g.base, baseSom: g.basePt })
    });
    const bare = optionsWith(g.basePt, G.map(x => x.pt), rand);
    out.push({
      id: `mod7-base-${i}`,
      kind: 'syllable-reading',
      letterId: 'mod7', skill: 'som',
      promptPt: tx.semSinalPergunta,
      he: g.base,
      options: bare.options,
      answer: bare.answer,
      explainPt: fmt(tx.semSinalExplica, { base: g.base, baseSom: g.basePt, he: g.he, som: g.pt })
    });
  }

  /* The loanwords: read a word you already know in Portuguese. */
  const words = G.flatMap(g => g.words.map(w => ({ g, w })));
  for (const [i, { g, w }] of shuffled(words, rand).entries()) {
    const wrong = words.filter(x => x.w.he !== w.he).map(x => x.w.pt);
    const { options, answer } = optionsWith(w.pt, take(wrong, 3, rand), rand);
    out.push({
      id: `mod7-word-${i}`,
      kind: 'word-meaning',
      letterId: 'mod7', skill: 'ler',
      promptPt: tx.palavraPergunta,
      he: w.he,
      options,
      answer,
      explainPt: fmt(tx.palavraGerechExplica, { he: w.he, sentido: w.pt, letra: g.he, som: g.pt })
    });
  }

  return shuffled(out, rng(seed + '-order')).slice(0, count);
}
