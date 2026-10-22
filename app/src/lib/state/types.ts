/* The learner's state. One shape, two adapters (localStorage now, Supabase
 * when there are keys), so nothing above this line knows where it is stored. */

import { A1_VAZIO, type EstadoA1 } from './a1-estado';
import type { EstadoRaizes } from './raizes-estado';
import type { Rodadas } from '@/lib/rodadas';

export type DailyGoalMinutes = 5 | 10 | 15 | 20;

export type Onboarding = {
  reason: 'viagem' | 'familia' | 'morar' | 'biblia' | 'idiomas' | 'trabalho' | 'outro';
  goalMinutes: DailyGoalMinutes;
  startingPoint: 'zero' | 'algumas-letras' | 'leio-um-pouco';
  name?: string;
  completedAt: string;
};

/** Progress inside one letter lesson: which of the five stages are done. */
export type LessonProgress = {
  letterId: string;
  stagesDone: number[];
  quizBest: number | null;       // 0..1
  quizAttempts: number;
  perfectBonusPaid: boolean;     // the +10 is once per letter, not per retry
  completedAt: string | null;
};

export type CheckpointProgress = {
  id: string;
  best: number | null;           // 0..1
  attempts: number;
  passedAt: string | null;
};

/** One Leitner box per item the learner got wrong. */
export type SrsItem = {
  itemId: string;                // letter id, or `${letterId}:${word}`
  letterId: string;
  box: 0 | 1 | 2 | 3 | 4;
  misses: number;
  hits: number;
  dueOn: string;                 // YYYY-MM-DD
  lastSeen: string;
  /** Which of the five skills this item exercised. Absent on v1 rows. */
  skill?: Skill;
};

/* ── the five skills ────────────────────────────────────────────────────
   "Knowing a letter" is not one thing, and treating it as one was the old
   model's central flaw: it could not tell a learner who recognises ם but
   cannot write it from one who writes it and confuses its sound. These are the
   five dimensions the course actually teaches, and every exercise declares
   which one it is testing.

     rec      - pick this letter out of a row (shape)
     som      - which sound it makes (letter ↔ sound, both directions)
     ler      - decode it inside a syllable or a word
     ouvir    - identify it from a recording
     escrever - produce the shape by hand

   Kept deliberately coarse. A learner never sees "domínio: 93,482%", and the
   system never pretends to a precision it does not have. */
export type Skill = 'rec' | 'som' | 'ler' | 'ouvir' | 'escrever';

export const SKILLS: readonly Skill[] = ['rec', 'som', 'ler', 'ouvir', 'escrever'];

export const SKILL_LABEL: Record<Skill, string> = {
  rec: 'Reconhecimento',
  som: 'Som',
  ler: 'Leitura',
  ouvir: 'Audição',
  escrever: 'Escrita'
};

export type SkillStat = {
  hits: number;
  misses: number;
  /** Consecutive correct answers. Resets to 0 on a miss - the honest signal
   *  that something was relearned rather than merely met often. */
  streak: number;
  lastOn: string | null;         // YYYY-MM-DD
  /** Em quantos dias diferentes houve pelo menos um acerto (11/10/2026).
   *  É o "ao longo do tempo" do domínio (lib/dominio.ts): quatro acertos
   *  seguidos numa tarde só não provam que a letra ficou. Ausente nos
   *  registros de antes dessa data, e aí o critério de dias não se aplica:
   *  ninguém perde o nível que já tinha por causa de um campo novo. */
  diasDeAcerto?: number;
  /** O dia do último acerto, para contar `diasDeAcerto` uma vez por dia. */
  ultimoAcerto?: string | null;
};

export type LeituraAutoavaliada = {
  /** Palavras que ele tentou ler (respondeu a pergunta). */
  tentadas: number;
  /** Destas, quantas ele marcou como lidas corretamente. */
  consegui: number;
  /** YYYY-MM-DD da última. */
  ultima: string;
};

/** What the learner knows about one letter, per skill. Sparse: a skill with no
 *  attempts has no entry, which is different from a skill with a bad record. */
export type LetterSkills = Partial<Record<Skill, SkillStat>>;

/**
 * How often this learner picked B when the answer was A.
 *
 * `confusableWith` in the content names the pairs that TEND to be mixed up;
 * this records the ones THIS learner actually mixes up, which is the difference
 * between a generic course and an adaptive one. Keyed `correct>chosen`.
 */
export type Confusion = {
  correct: string;
  chosen: string;
  n: number;
  lastOn: string;
};

export type Achievement = {
  id: string;
  unlockedAt: string;
};

export type DayRecord = {
  /** Questions answered that day. Kept for analytics and for honesty. */
  answered: number;
  /**
   * Practice credit toward the daily goal, in 20-second units.
   *
   * Counting only answered questions was wrong and the full-course simulation
   * caught it: a complete letter lesson is eight questions, so a learner who
   * did exactly one lesson a day - five stages of reading, listening, tracing
   * and writing - never met a ten-minute goal and never built a streak. Most of
   * the learning in this course is not a multiple-choice answer.
   */
  units: number;
  xp: number;
  goalMet: boolean;
  /** XP pago por acertos neste dia, para o teto (`XP_ACERTOS_POR_DIA`). */
  xpAcertos?: number;
};

/** The current shape. Bump this and add a step to `migrate()` - never both
 *  silently, and never a shape change without a migration. */
export const STATE_VERSION = 2;

export type LearnerState = {
  version: 2;
  onboarding: Onboarding | null;
  xp: number;
  lessons: Record<string, LessonProgress>;
  checkpoints: Record<string, CheckpointProgress>;
  srs: Record<string, SrsItem>;
  achievements: Achievement[];
  days: Record<string, DayRecord>;  // YYYY-MM-DD
  streak: { current: number; longest: number; lastDay: string | null };
  lastRoute: string | null;
  /**
   * The final exam.
   *
   * `completedAt` is the first sitting of any score - the course was finished.
   * `passedAt` is the first sitting at or above the pass mark, and it is what
   * the certificate is issued against; the two are deliberately different
   * dates, because finishing and passing are different facts.
   *
   * `parts` holds the LAST sitting's part scores, which is what the report
   * shows. Keeping the best of each part separately would produce a report
   * describing an exam nobody ever sat.
   */
  finalChallenge: {
    best: number | null;
    completedAt: string | null;
    passedAt?: string | null;
    attempts?: number;
    parts?: Record<string, { correct: number; total: number }>;
  };

  /* ── added in v2 ──────────────────────────────────────────────────── */

  /** Per-letter, per-skill record. Drives review, the dashboard and which
   *  exercise kind a letter gets offered next. */
  skills: Record<string, LetterSkills>;
  /** `correct>chosen` → how often. Feeds the confusion drills. */
  confusions: Record<string, Confusion>;
  /** Milestones that are moments rather than badges: the first word read with
   *  no transliteration on screen, the first letter written from memory. Stored
   *  as ISO timestamps so each can only happen once. */
  firsts: Record<string, string>;
  /** One record per reading-gym mode. See `GymRecord`. */
  gym: Record<string, GymRecord>;

  /* ── acrescentados à v2 em 23/09/2026, como o `gym` antes deles ───── */

  /**
   * O nome do aluno em hebraico, como ELE o confirmou.
   *
   * Transliterar nome não tem resposta única - Gabriel pode ser גבריאל ou
   * גבריאֵל, Moshik pode ser מושיק ou מושיק׳ - então o curso sugere e o aluno
   * decide. O que fica gravado é a decisão dele, com a data, e é isso que o
   * certificado usa. `null` enquanto ele não confirmou nenhuma.
   */
  nomeHebraico: { texto: string; confirmadoEm: string } | null;
  /**
   * Acertos e erros por TIPO de exercício (`letter-recognition`,
   * `build-letters`, `cursive-word`...). As habilidades dizem O QUE o aluno
   * sabe; isto diz em QUE FORMATO ele erra - "ele lê bem e erra montando",
   * "a cursiva em palavra está custando". É o dado que o painel de alunos
   * precisa para mostrar erro por exercício sem guardar resposta a resposta.
   */
  kinds: Record<string, { h: number; m: number }>;

  /* ── acrescentado à v2 em 27/09/2026 ─────────────────────────────── */

  /**
   * As rodadas de cada categoria de exercício: quantas o aluno concluiu e a
   * "impressão" das perguntas que já viu (lib/rodadas.ts). Estava só no
   * navegador; aqui ela vai para a conta, e refazer um exercício em outro
   * aparelho também traz perguntas novas.
   */
  rodadas: Rodadas;

  /* ── acrescentado à v2 em 27/09/2026 ─────────────────────────────── */

  /**
   * As trocas de XP (lib/loja.ts). O XP TOTAL (`xp`) é a conquista e nunca
   * diminui; o que se pode gastar é o SALDO, `xp` menos a soma do que está
   * aqui. Por isso gastar não apaga esforço nenhum.
   */
  loja: { compras: Record<string, Compra> };

  /* ── acrescentado à v2 em 06/10/2026 ─────────────────────────────── */

  /** O curso Hebraico A1: gênero dos exercícios, unidades e exame
   *  (lib/state/a1-estado.ts). Chave própria, para não misturar com as letras. */
  a1: EstadoA1;

  /* ── acrescentado à v2 em 12/10/2026 ─────────────────────────────── */

  /**
   * O que o aluno DISSE da própria leitura no Laboratório de Leitura e na
   * Primeira Leitura ("Sim, consegui!" / "Ainda preciso praticar"), por
   * atividade. É autoavaliação: fica separada de propósito e NÃO entra em
   * `skills`, no domínio das letras nem na revisão - só um exercício
   * corrigido pelo curso mede. Opcional: estados antigos não o têm.
   */
  leituraAutoavaliada?: Record<string, LeituraAutoavaliada>;

  /* ── acrescentado à v2 em 21/10/2026 ─────────────────────────────── */

  /**
   * Raízes Sefarditas: atividades, etapas abertas e onde o aluno parou
   * (lib/state/raizes-estado.ts). Opcional: só existe para quem abriu o
   * produto, e nada do curso de hebraico lê esta chave.
   */
  raizes?: EstadoRaizes;
};

/** Uma troca de XP. O id é único por compra (`folga:<instante>`, `carta:<id>`). */
export type Compra = {
  item: string;
  custo: number;
  /** ISO, quando foi comprada. */
  em: string;
  /** O que ela abriu, quando é um item com alvo (o id da carta). */
  alvo?: string;
  /** Só nas folgas: o dia que ela cobriu, quando já foi usada. */
  usadaEm?: string | null;
};

/**
 * What a reading-gym mode remembers between sessions.
 *
 * `previousSeconds` exists so the result screen can say "da última vez, 41 s"
 * AFTER this run has already been written - otherwise the comparison is
 * against the run the learner just finished, which is always a tie.
 *
 * The times are the learner's own and nothing else. There is no target and no
 * average: "you were faster than last time" is motivating, "you are slower
 * than most people" is a reason to stop.
 */
export type GymRecord = {
  runs: number;
  /** Best score, 0-1. */
  best: number | null;
  /** Best time in seconds, for the timed modes only. */
  bestSeconds: number | null;
  /** How long the most recent run took. */
  lastSeconds: number | null;
  /** How long the run BEFORE that took - what the result screen compares to. */
  previousSeconds: number | null;
  lastOn: string;
};

export const EMPTY_STATE: LearnerState = {
  version: 2,
  onboarding: null,
  xp: 0,
  lessons: {},
  checkpoints: {},
  srs: {},
  achievements: [],
  days: {},
  streak: { current: 0, longest: 0, lastDay: null },
  lastRoute: null,
  finalChallenge: { best: null, completedAt: null },
  skills: {},
  confusions: {},
  firsts: {},
  gym: {},
  nomeHebraico: null,
  kinds: {},
  rodadas: {},
  loja: { compras: {} },
  a1: A1_VAZIO
};

export interface ProgressStore {
  load(): Promise<LearnerState>;
  save(state: LearnerState): Promise<void>;
  /** Apaga em todo lugar: é o "apagar meu progresso" do perfil. */
  clear(): Promise<void>;
  /**
   * Esquece o que está guardado NESTE aparelho, sem tocar no servidor.
   *
   * Sair da conta não é apagar o progresso: ele continua na conta e volta no
   * próximo login. Mas deixá-lo no navegador entrega o estudo de quem saiu a
   * quem sentar depois, que numa máquina compartilhada é outra pessoa.
   * Por isso existe separado de `clear()`, que apaga dos dois lados.
   */
  esquecerAqui(): Promise<void>;
  /**
   * O servidor já confirmou tudo o que este aparelho tem?
   *
   * Só faz sentido com sessão: sem conta, o aparelho é o único lugar onde o
   * progresso mora e não há nada a sincronizar. Quem não fala com servidor
   * nenhum responde sempre `true`, e a interface não inventa um aviso.
   */
  sincronizado(): boolean;
}
