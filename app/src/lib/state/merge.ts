/* Fundir o progresso de dois aparelhos sem perder trabalho de ninguém.
 * ─────────────────────────────────────────────────────────────────────────
 * Guardar progresso no servidor é a parte fácil. A parte difícil é esta: a
 * pessoa estudou no celular no ônibus, sem sinal, e no notebook em casa. As
 * duas versões divergiram, as duas são verdade, e "a última escrita vence"
 * apaga uma delas em silêncio - que é a pior coisa que um curso pode fazer
 * com o esforço de alguém.
 *
 * A regra aqui é uma só, e ela é o que torna a fusão segura:
 *
 *   TUDO que este arquivo funde é MONOTÔNICO. Uma letra que fechou não
 *   reabre, uma nota melhor não piora, uma conquista não se perde. Para todo
 *   campo existe um "mais adiantado dos dois", e é esse que fica.
 *
 * Por isso a operação é comutativa e idempotente: fundir A com B dá o mesmo
 * que fundir B com A, e fundir duas vezes dá o mesmo que uma. É o que permite
 * repetir a fusão depois de um 409 do servidor sem medo, e o que garante que
 * dois aparelhos sincronizando em ordens diferentes cheguem ao mesmo estado.
 *
 * As DUAS exceções são escalares que não têm "mais adiantado" nenhum -
 * `lastRoute` e as respostas do onboarding. Para elas vale o primeiro
 * argumento, que por convenção é o lado local: quem está com o aparelho na
 * mão agora é quem tem razão sobre onde parou de ler.
 *
 * Contagens usam MÁXIMO, nunca soma. Somar parece mais justo e está errado:
 * o mesmo dia de estudo sincronizado duas vezes viraria o dobro de XP, e a
 * primeira coisa que um aluno nota num curso é o número que mente para cima.
 */

import {
  EMPTY_STATE, SKILLS,
  type Achievement, type CheckpointProgress, type Confusion, type DayRecord,
  type GymRecord, type LearnerState, type LessonProgress, type LetterSkills,
  type SkillStat, type SrsItem
} from './types';

/* ── auxiliares ─────────────────────────────────────────────────────────── */

const maiorN = (a: number | null | undefined, b: number | null | undefined): number | null =>
  a == null ? (b ?? null) : b == null ? a : Math.max(a, b);

const menorN = (a: number | null | undefined, b: number | null | undefined): number | null =>
  a == null ? (b ?? null) : b == null ? a : Math.min(a, b);

/** A mais antiga das duas datas. Um nulo perde: "aconteceu" ganha de "não". */
const cedo = (a: string | null | undefined, b: string | null | undefined): string | null =>
  !a ? (b ?? null) : !b ? a : (a < b ? a : b);

/** A mais recente das duas. Um nulo perde pelo mesmo motivo. */
const tarde = (a: string | null | undefined, b: string | null | undefined): string | null =>
  !a ? (b ?? null) : !b ? a : (a > b ? a : b);

/** As chaves dos dois lados, sem repetir. */
const chaves = (a: object, b: object): string[] =>
  [...new Set([...Object.keys(a), ...Object.keys(b)])];

/**
 * Funde dois dicionários chave a chave.
 *
 * Quando a chave existe só de um lado, aquele valor passa inteiro - é o caso
 * comum e o mais importante: a letra que só o celular fez.
 */
function fundirMapa<T>(
  a: Record<string, T>, b: Record<string, T>, um: (x: T, y: T) => T
): Record<string, T> {
  const fora: Record<string, T> = {};
  for (const k of chaves(a, b)) {
    const x = a[k], y = b[k];
    fora[k] = x === undefined ? y! : y === undefined ? x : um(x, y);
  }
  return fora;
}

/* ── cada pedaço do estado ──────────────────────────────────────────────── */

const fundirLicao = (a: LessonProgress, b: LessonProgress): LessonProgress => ({
  letterId: a.letterId || b.letterId,
  /* União das etapas: quem fez a 3 num aparelho e a 4 no outro fez as duas. */
  stagesDone: [...new Set([...a.stagesDone, ...b.stagesDone])].sort((x, y) => x - y),
  quizBest: maiorN(a.quizBest, b.quizBest),
  quizAttempts: Math.max(a.quizAttempts, b.quizAttempts),
  /* O bônus de acerto perfeito é pago uma vez por letra. Se QUALQUER lado já
     pagou, ele está pago - senão a fusão o pagaria de novo. */
  perfectBonusPaid: a.perfectBonusPaid || b.perfectBonusPaid,
  completedAt: cedo(a.completedAt, b.completedAt)
});

const fundirCheckpoint = (a: CheckpointProgress, b: CheckpointProgress): CheckpointProgress => ({
  id: a.id || b.id,
  best: maiorN(a.best, b.best),
  attempts: Math.max(a.attempts, b.attempts),
  passedAt: cedo(a.passedAt, b.passedAt)
});

/**
 * Um item da fila de revisão.
 *
 * A caixa de Leitner e a data de volta vêm do lado visto POR ÚLTIMO, e não do
 * máximo: a caixa é uma posição numa fila, não uma pontuação. Se o celular
 * errou o item ontem e o baixou para a caixa 0, o notebook não pode reerguê-lo
 * para a 3 só porque acertou anteontem.
 */
function fundirSrs(a: SrsItem, b: SrsItem): SrsItem {
  const novo = (a.lastSeen >= b.lastSeen ? a : b);
  return {
    ...novo,
    misses: Math.max(a.misses, b.misses),
    hits: Math.max(a.hits, b.hits),
    lastSeen: tarde(a.lastSeen, b.lastSeen)!,
    skill: novo.skill ?? a.skill ?? b.skill
  };
}

const fundirDia = (a: DayRecord, b: DayRecord): DayRecord => ({
  /* Máximo e não soma - ver a nota do cabeçalho. */
  answered: Math.max(a.answered, b.answered),
  units: Math.max(a.units, b.units),
  xp: Math.max(a.xp, b.xp),
  goalMet: a.goalMet || b.goalMet
});

function fundirStat(a: SkillStat, b: SkillStat): SkillStat {
  const novo = (a.lastOn ?? '') >= (b.lastOn ?? '') ? a : b;
  return {
    hits: Math.max(a.hits, b.hits),
    misses: Math.max(a.misses, b.misses),
    /* A sequência é do lado mais recente: ela mede acertos SEGUIDOS, e o
       máximo dos dois inventaria uma sequência que não houve. */
    streak: novo.streak,
    lastOn: tarde(a.lastOn, b.lastOn)
  };
}

function fundirHabilidades(a: LetterSkills, b: LetterSkills): LetterSkills {
  const fora: LetterSkills = {};
  for (const s of SKILLS) {
    const x = a[s], y = b[s];
    if (x && y) fora[s] = fundirStat(x, y);
    else if (x || y) fora[s] = (x ?? y)!;
  }
  return fora;
}

const fundirConfusao = (a: Confusion, b: Confusion): Confusion => ({
  correct: a.correct || b.correct,
  chosen: a.chosen || b.chosen,
  n: Math.max(a.n, b.n),
  lastOn: tarde(a.lastOn, b.lastOn)!
});

function fundirGym(a: GymRecord, b: GymRecord): GymRecord {
  const novo = a.lastOn >= b.lastOn ? a : b;
  return {
    runs: Math.max(a.runs, b.runs),
    best: maiorN(a.best, b.best),
    /* Tempo: menor é melhor, então aqui o "mais adiantado" é o mínimo. */
    bestSeconds: menorN(a.bestSeconds, b.bestSeconds),
    /* Os dois últimos tempos são uma narrativa ("da última vez, 41 s") e vêm
       do lado mais recente inteiros, para não contar uma história mista. */
    lastSeconds: novo.lastSeconds,
    previousSeconds: novo.previousSeconds,
    lastOn: tarde(a.lastOn, b.lastOn)!
  };
}

function fundirConquistas(a: Achievement[], b: Achievement[]): Achievement[] {
  const por = new Map<string, string>();
  for (const x of [...a, ...b]) {
    const antes = por.get(x.id);
    por.set(x.id, antes ? cedo(antes, x.unlockedAt)! : x.unlockedAt);
  }
  return [...por].map(([id, unlockedAt]) => ({ id, unlockedAt }))
    .sort((x, y) => x.unlockedAt.localeCompare(y.unlockedAt));
}

/* ── a fusão ────────────────────────────────────────────────────────────── */

/**
 * Funde dois estados num terceiro, sem mexer em nenhum dos dois.
 *
 * `local` é o lado que está com a pessoa agora: ele desempata os escalares
 * que não têm ordem (a última rota, as respostas do onboarding). Todo o resto
 * é monotônico e não depende da ordem dos argumentos.
 *
 * Os dois lados já passaram por `migrate()` - fundir um estado v1 com um v2
 * é comparar campos que não existem do mesmo jeito.
 */
export function mergeStates(local: LearnerState, remoto: LearnerState): LearnerState {
  const a = { ...EMPTY_STATE, ...local };
  const b = { ...EMPTY_STATE, ...remoto };

  const fc = {
    best: maiorN(a.finalChallenge.best, b.finalChallenge.best),
    completedAt: cedo(a.finalChallenge.completedAt, b.finalChallenge.completedAt),
    passedAt: cedo(a.finalChallenge.passedAt, b.finalChallenge.passedAt),
    attempts: Math.max(a.finalChallenge.attempts ?? 0, b.finalChallenge.attempts ?? 0),
    /* As partes descrevem UMA prova. O relatório de uma prova misturada com o
       de outra não descreve prova nenhuma, então vem inteiro de um lado só -
       o que tem mais tentativas, que é o que sentou por último. */
    parts: (a.finalChallenge.attempts ?? 0) >= (b.finalChallenge.attempts ?? 0)
      ? (a.finalChallenge.parts ?? b.finalChallenge.parts)
      : (b.finalChallenge.parts ?? a.finalChallenge.parts)
  };

  const streakLocalMaisNovo = (a.streak.lastDay ?? '') >= (b.streak.lastDay ?? '');
  const streakNovo = streakLocalMaisNovo ? a.streak : b.streak;

  return {
    version: 2,
    /* O onboarding não se funde campo a campo: são respostas, não conquistas.
       Vale o bloco que foi respondido PRIMEIRO - a pessoa respondeu uma vez,
       e as vindas depois são a mesma resposta copiada. Escolher pelo lado
       local em vez de pela data parece equivalente e não é: dois aparelhos com
       blocos diferentes ficariam trocando o seu pelo do outro para sempre, um
       envio ao servidor a cada abertura do site, sem nada ter mudado. */
    onboarding: !a.onboarding ? b.onboarding
      : !b.onboarding ? a.onboarding
      : (a.onboarding.completedAt <= b.onboarding.completedAt ? a.onboarding : b.onboarding),
    xp: Math.max(a.xp, b.xp),
    lessons: fundirMapa(a.lessons, b.lessons, fundirLicao),
    checkpoints: fundirMapa(a.checkpoints, b.checkpoints, fundirCheckpoint),
    srs: fundirMapa(a.srs, b.srs, fundirSrs),
    achievements: fundirConquistas(a.achievements, b.achievements),
    days: fundirMapa(a.days, b.days, fundirDia),
    streak: {
      /* A sequência corrente é a do dia mais recente: somar ou tirar o máximo
         das duas inventaria dias de estudo que não houve. O recorde, sim, é o
         maior dos dois - ele já aconteceu. */
      current: streakNovo.current,
      longest: Math.max(a.streak.longest, b.streak.longest),
      lastDay: tarde(a.streak.lastDay, b.streak.lastDay)
    },
    lastRoute: a.lastRoute ?? b.lastRoute,
    finalChallenge: fc,
    skills: fundirMapa(a.skills, b.skills, fundirHabilidades),
    confusions: fundirMapa(a.confusions, b.confusions, fundirConfusao),
    /* Um "primeiro" é sempre o mais antigo: a primeira palavra lida sem
       transliteração aconteceu uma vez, no aparelho em que aconteceu. */
    firsts: fundirMapa(a.firsts, b.firsts, (x, y) => cedo(x, y)!),
    gym: fundirMapa(a.gym, b.gym, fundirGym)
  };
}

/* JSON com as chaves em ordem, em qualquer profundidade.
 *
 * `JSON.stringify` cru não serviria: um estado vindo do localStorage tem as
 * chaves na ordem em que foram gravadas, e a fusão as monta na ordem deste
 * arquivo. Os dois descrevem o mesmo progresso e sairiam diferentes, o que
 * faria o app gravar no servidor a cada carregamento de página. */
function estavel(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'null';
  if (Array.isArray(v)) return `[${v.map(estavel).join(',')}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o).sort()
    .filter(k => o[k] !== undefined)
    .map(k => `${JSON.stringify(k)}:${estavel(o[k])}`).join(',')}}`;
}

/**
 * Os dois estados já são a mesma coisa?
 *
 * Serve para não gravar no servidor uma fusão que não mudou nada - o caso
 * normal de quem estuda num aparelho só.
 *
 * Compara os dois DEPOIS de passar cada um pela fusão consigo mesmo. Sem esse
 * passo, um estado recém-fundido nunca pareceria igual a um estado vindo cru
 * do servidor: a fusão preenche campos opcionais (`passedAt`, `attempts`) que
 * o outro simplesmente não tem, e o app subiria o mesmo progresso ao D1 a
 * cada carregamento de página. Fundir consigo mesmo é seguro justamente
 * porque a operação é idempotente.
 */
export const sameState = (a: LearnerState, b: LearnerState): boolean =>
  estavel(mergeStates(a, a)) === estavel(mergeStates(b, b));

/**
 * Igual a `sameState`, mas fechando os olhos para a última rota.
 *
 * É esta que decide se vale a pena gravar no servidor, e a diferença importa:
 * `lastRoute` é o único campo que cada aparelho insiste em ter o seu. Dois
 * aparelhos abertos em telas diferentes ficariam trocando a rota um do outro
 * a cada abertura do site - uma escrita no banco por visita, para sincronizar
 * nada. Sem ela na conta, a rota pega carona na próxima mudança de verdade,
 * que numa sessão de estudo vem em segundos.
 */
export const sameProgress = (a: LearnerState, b: LearnerState): boolean =>
  sameState({ ...a, lastRoute: null }, { ...b, lastRoute: null });
