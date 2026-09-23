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
import { buildConfusionDrill, buildReview, contextFor, type Exercise } from './exercises';
import {
  CURSIVA_DESDE, itemConstruir, itemCursiva, itemDigitar, letrasDaGrafia, nivelDeConstrucao,
  palavrasAcumuladas, type ModoCursiva, type PalavraDoCurso
} from './palavras';
import { rng, shuffled, type Rand } from './rng';

export type GymModeId =
  | 'letras' | 'vogais' | 'silabas' | 'palavras' | 'ouvir'
  | 'parecidas' | 'relogio' | 'revisao'
  | 'construir' | 'palavras-cursiva' | 'digitar';

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
  /** Pede o teclado hebraico instalado - e a confirmação dele antes. É o
   *  ÚNICO lugar do curso que pede: ler e reconhecer nunca trocam de teclado. */
  needsKeyboard?: boolean;
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
  revisao: [],         // built from the SRS instead
  /* Os três modos de palavra não passam por geradores por letra: a palavra
     de cada item sai do vocabulário ACUMULADO (ver `rodadaDePalavras`). */
  construir: [],
  'palavras-cursiva': [],
  digitar: []
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
    id: 'construir', titlePt: 'Construir palavras', icon: '⌂',
    descPt: 'O som na tela, as letras na mesa: monte a palavra, da direita para a esquerda.',
    skills: ['ler'], count: 8
  },
  {
    id: 'palavras-cursiva', titlePt: 'Palavras à mão', icon: '✎',
    descPt: 'Palavras inteiras em cursiva: reconhecer, entender e montar.',
    skills: ['ler'], count: 10
  },
  {
    id: 'digitar', titlePt: 'Digitar em hebraico', icon: '⌨',
    descPt: 'Escreva palavras no teclado hebraico do seu aparelho.',
    skills: ['escrever'], needsKeyboard: true, count: 8
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
    /* Montar, ver à mão e digitar pedem uma palavra cujas letras TODAS o
       aluno já tem - inclusive o ו que numa leitura seria só vogal. */
    if (MODOS_DE_PALAVRA.has(mode.id)) {
      if (!palavrasAcumuladas(unlocked).length) {
        return { mode, ready: false, whyNot: 'Chega com a primeira palavra, na lição do Mem.' };
      }
      if (mode.id === 'palavras-cursiva' && unlocked.length < 3) {
        return { mode, ready: false, whyNot: 'Chega na lição do Tav.' };
      }
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
        audioAvailable, count: mode.count, seed, history: letters
      }),
      label: `${pair[0].namePt} e ${pair[1].namePt}`
    };
  }

  if (MODOS_DE_PALAVRA.has(mode.id)) {
    const exercises = rodadaDePalavras(mode, state, letters, rng(seed));
    const n = palavrasAcumuladas(letters).length;
    return { exercises, label: `Das ${n} palavras que você já acumulou` };
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

/* ── os modos de palavra: o vocabulário acumulado ─────────────────────── */

const MODOS_DE_PALAVRA = new Set<GymModeId>(['construir', 'palavras-cursiva', 'digitar']);

/** Quantas palavras de uma rodada vêm das três últimas letras. O resto sai
 *  do que ficou para trás - é para isso que serve praticar fora da lição. */
const FRACAO_RECENTE = 1 / 3;

/**
 * Uma rodada dos modos de palavra.
 * ─────────────────────────────────────────────────────────────────────────
 * Antes cada item escolhia a palavra pela posição dele na rodada, e a lista
 * de onde escolhia era sempre a mesma, na mesma ordem: "Digitar" pedia אמא
 * oito vezes, e "Palavras à mão" girava em volta das mesmas quatro ou cinco
 * palavras das primeiras lições, qualquer que fosse o vocabulário do aluno.
 *
 * Agora a rodada:
 *   · tira de TODAS as palavras que o aluno acumulou (`palavrasAcumuladas`):
 *     um terço das três últimas letras e o resto das antigas, em RODÍZIO - a
 *     rodada n continua de onde a n-1 parou, então em poucas rodadas todo o
 *     vocabulário passou, em vez de o sorteio insistir sempre nas mesmas;
 *   · nunca repete palavra enquanto houver palavra nova. Com vocabulário
 *     pequeno (as primeiras lições), a volta repete a palavra com OUTRO gesto
 *     e nunca em seguida - e digitar, que só tem um gesto, fica mais curto;
 *   · muda a cada rodada: a semente vem do começo da sessão (ver a academia),
 *     então fazer o modo duas vezes no mesmo dia dá duas rodadas diferentes.
 */
function rodadaDePalavras(
  mode: GymMode, state: LearnerState, letters: Letter[], rand: Rand
): Exercise[] {
  const ordenadas = [...letters].sort((a, b) => a.order - b.order);
  const atual = ordenadas[ordenadas.length - 1];
  if (!atual) return [];
  const ctx = contextFor(atual, ordenadas);
  const todas = palavrasAcumuladas(ordenadas);
  const pool = mode.id === 'digitar'
    ? todas.filter(w => letrasDaGrafia(w.he).length <= 6)
    : todas;
  if (!pool.length) return [];

  const volta = state.gym[mode.id]?.runs ?? 0;
  const escolhidas = escolherPalavras(pool, atual.order, mode, volta, rand);
  const donoDe = (w: PalavraDoCurso) => ordenadas.find(l => l.order === w.desde) ?? atual;

  /* Os gestos de cada modo, pela etapa em que o aluno está. */
  const nivel = nivelDeConstrucao(atual.order);
  const modosCursiva = (Object.keys(CURSIVA_DESDE) as ModoCursiva[])
    .filter(m => atual.order >= CURSIVA_DESDE[m]);
  type Gesto = ModoCursiva | 'montar-impressa' | 'montar-cursiva' | 'digitar';
  const gestos: Gesto[] = mode.id === 'digitar' ? ['digitar']
    : mode.id === 'construir' ? ['montar-impressa', 'montar-cursiva']
    : [...modosCursiva, 'montar-cursiva'];
  const giro = Math.floor(rand() * gestos.length);

  const item = (w: PalavraDoCurso, gesto: Gesto, k: number): Exercise | null => {
    const L = donoDe(w);
    if (gesto === 'digitar') return itemDigitar(w, L, k);
    if (gesto === 'montar-impressa' || gesto === 'montar-cursiva') {
      return itemConstruir(w, L, ctx, rand, k, gesto === 'montar-cursiva', nivel);
    }
    return itemCursiva(gesto, w, todas, L, ctx, rand, k)
      /* Sem alternativas bastantes (vocabulário mínimo): monta à mão. */
      ?? itemConstruir(w, L, ctx, rand, k, true, nivel);
  };

  const out: Exercise[] = [];
  escolhidas.forEach((w, k) => {
    const ex = item(w, gestos[(k + giro) % gestos.length]!, k);
    if (ex) out.push(ex);
  });

  /* Vocabulário menor que a rodada: uma segunda volta com o gesto seguinte,
     nunca a mesma palavra duas vezes em seguida. Digitar não tem outro gesto
     e para aqui. */
  if (out.length < mode.count && gestos.length > 1) {
    let volta = shuffled(escolhidas, rand);
    if (volta.length > 1 && volta[0] === escolhidas[escolhidas.length - 1]) {
      volta = [...volta.slice(1), volta[0]!];
    }
    volta.slice(0, mode.count - out.length).forEach((w, j) => {
      const k = escolhidas.length + j;
      const ex = item(w, gestos[(escolhidas.indexOf(w) + giro + 1) % gestos.length]!, k);
      if (ex) out.push(ex);
    });
  }
  /* Sem `spread`: ele reordena por tipo de item e podia pôr a mesma palavra
     duas vezes em seguida. Os gestos já se alternam pela ordem acima. */
  return out;
}

/** As palavras da rodada, sem repetir: um terço das três últimas letras, o
 *  resto das antigas, e os DOIS grupos em rodízio.
 *
 *  Rodízio: uma ordem fixa para este aluno neste ponto do curso (a semente
 *  não muda de rodada para rodada), e cada rodada pega a janela seguinte. Um
 *  sorteio novo a cada rodada insiste nas mesmas palavras: com as 22 letras,
 *  cinco rodadas sorteadas cobriam 44 das 139. */
function escolherPalavras(
  pool: readonly PalavraDoCurso[], ordemAtual: number, mode: GymMode, volta: number, rand: Rand
): PalavraDoCurso[] {
  const quantas = mode.count;
  const janela = (ws: PalavraDoCurso[], grupo: string, n: number) => {
    const fixa = shuffled(ws, rng(`${mode.id}-${grupo}-${ordemAtual}`));
    const inicio = fixa.length ? (volta * n) % fixa.length : 0;
    return [...fixa.slice(inicio), ...fixa.slice(0, inicio)];
  };
  const nRecentes = Math.max(1, Math.round(quantas * FRACAO_RECENTE));
  const recentes = janela(pool.filter(w => w.desde > ordemAtual - 3), 'recentes', nRecentes);
  const antigas = janela(pool.filter(w => w.desde <= ordemAtual - 3), 'antigas', quantas - nRecentes);
  const escolha = [...recentes.slice(0, nRecentes), ...antigas.slice(0, quantas - nRecentes)];
  /* Faltando de um lado, completa do outro. */
  for (const w of [...recentes, ...antigas]) {
    if (escolha.length >= quantas) break;
    if (!escolha.includes(w)) escolha.push(w);
  }
  return shuffled(escolha.slice(0, quantas), rand);
}
