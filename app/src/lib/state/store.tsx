'use client';

/* The one React entry point to learner state.
 *
 * Components never touch a store adapter or the rules module directly: they
 * call the actions here, which apply a pure rule, sync achievements, persist,
 * and emit an analytics event. Keeping that sequence in one place is what
 * stops XP being awarded twice from two different screens. */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode
} from 'react';
import {
  EMPTY_STATE, type Achievement, type Confusion, type LearnerState, type Onboarding,
  type ProgressStore, type Skill
} from './types';
import { LocalProgressStore, persistenceAvailable } from './local';
import { SupabaseProgressStore, supabaseConfigured } from './supabase';
import { WorkerProgressStore } from './worker';
import { criarGravador } from './gravador';
import { mergeStates, sameState } from './merge';
import { apiMode } from '@/lib/account/api';
import { SESSAO_MUDOU } from '@/lib/account/store';
import {
  ANSWER_UNITS, applyPractice, awardXp, clearConfusion, completeStage, courseProgress,
  displayStreak, dueItems, goalTarget, lettersMastered, markFirst, recordAnswer,
  recordCheckpoint, recordConfusion, recordExam, recordGym, recordQuiz, recordSkill,
  syncAchievements, today,
  topConfusions, weakLetters, XP
} from './rules';
import { track } from '@/lib/analytics';
import { EXAM_PASS } from '@/lib/engine/exam';

/* Onde o progresso mora, nesta build.
 * ─────────────────────────────────────────────────────────────────────────
 * O Worker vem primeiro porque é o único dos três que resolve o problema de
 * verdade: o aluno que troca de aparelho, ou limpa o navegador, e encontra o
 * curso onde deixou. Ele não abandona o localStorage - embrulha (ver
 * ./worker.ts), porque o curso tem de continuar funcionando sem sinal.
 *
 * O Supabase continua aqui por ser uma porta escrita e nunca ligada; só entra
 * se alguém configurar as duas variáveis, e numa build de Worker isso seria
 * duas fontes de verdade para o mesmo progresso. */
function createStore(): ProgressStore {
  if (apiMode() === 'worker') return new WorkerProgressStore();
  return supabaseConfigured() ? new SupabaseProgressStore() : new LocalProgressStore();
}

type Ctx = {
  state: LearnerState;
  ready: boolean;
  /** False in a private window with storage blocked - the UI says so. */
  persistent: boolean;
  /**
   * O servidor já confirmou o que este aparelho tem?
   *
   * Verdadeiro também quando não há conta: aí o aparelho é o único lugar, e
   * não há sincronização prometida a ninguém. Serve para a interface dizer
   * que algo ainda NÃO subiu - nunca para afirmar que subiu.
   */
  sincronizado: boolean;
  day: string;
  /* derived */
  streak: number;
  mastered: number;
  progress: number;
  dueCount: number;
  weak: string[];
  /** Practice credit today, in the same units as `goalTargetToday`. */
  goalUnits: number;
  goalTargetToday: number;
  /* celebrations the shell shows and then clears */
  pending: Achievement[];
  clearPending: () => void;
  /* actions */
  /** The confusions this learner actually has, worst first. */
  confusions: Confusion[];
  setOnboarding: (o: Onboarding) => void;
  finishStage: (letterId: string, stage: number, units?: number) => void;
  /**
   * One answer, with everything the adaptive layer needs to learn from it:
   * which skill it tested, and - on a miss - which wrong option was chosen, so
   * ד answered for ר is recorded as that pair rather than as a generic slip.
   */
  answer: (args: {
    itemId: string; letterId: string; correct: boolean;
    skill?: Skill; expected?: string; chosen?: string;
    /** O tipo do exercício, para o acerto por tipo (`state.kinds`). */
    kind?: string;
  }) => void;
  /** O nome em hebraico, como o aluno o confirmou. `null` apaga. */
  setNomeHebraico: (texto: string | null) => void;
  /** Record a moment that can only happen once, and say so. */
  markFirst: (id: string) => void;
  /**
   * A traced or freehand attempt at a letter, scored 0-1 by the canvas.
   *
   * Writing is the one skill with no question to answer, so it needs its own
   * door into the model - without it `escrever` would stay permanently 'novo'
   * and the dashboard would keep claiming a letter is strong that the learner
   * cannot actually produce.
   */
  recordWriting: (letterId: string, score: number) => void;
  /** One finished reading-gym run: its score and how long it took. */
  finishGym: (modeId: string, score: number, seconds: number) => void;
  finishQuiz: (letterId: string, score: number) => void;
  finishCheckpoint: (id: string, score: number) => void;
  finishReview: (score: number) => void;
  finishFinalChallenge: (score: number) => void;
  /** One sitting of the final exam: its overall score and each part's. */
  finishExam: (
    score: number, parts: Record<string, { correct: number; total: number }>
  ) => void;
  remember: (route: string) => void;
  reset: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function ProgressProvider({
  children, totalLetters, extraModuleIds = [], somIds = []
}: { children: ReactNode; totalLetters: number; extraModuleIds?: string[]; somIds?: string[] }) {
  const store = useMemo(createStore, []);
  /* The caller passes a fresh array literal on every render; keying the memo on
     its contents rather than its identity keeps the context value stable. */
  const extraKey = extraModuleIds.join(',');
  const somKey = somIds.join(',');
  const [state, setState] = useState<LearnerState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  /* Começa em `true` para que a tela não pisque um aviso de "não sincronizado"
     no primeiro render, antes de haver o que sincronizar. */
  const [sincronizado, setSincronizado] = useState(true);
  const [pending, setPending] = useState<Achievement[]>([]);
  /* A última rota avisada pelo AppShell. Guardada num ref porque ela chega
     antes de o estado carregar, e naquele momento não há estado onde pô-la. */
  const rotaPendente = useRef<string | null>(null);
  const [day, setDay] = useState(() => today());
  /* O estado de agora, legível de dentro de um ouvinte de evento que foi
     registrado uma vez só. Sem o ref, o ouvinte guardaria o estado do
     primeiro render para sempre. */
  const stateRef = useRef(state);
  stateRef.current = state;

  /* O estado de AGORA, e é por isto que todo mutador abaixo passa por aqui.
     ──────────────────────────────────────────────────────────────────────
     Um mutador que lê o `state` do render em que foi criado lê o estado de
     ANTES. Sozinho isso não aparece: o React redesenha e o próximo já vê o
     novo. O defeito nasce quando dois mutadores são chamados no MESMO
     manipulador, que é exatamente o que o fim de uma lição faz:

         p.finishQuiz(letra, nota);   // grava a nota  → S1
         p.finishStage(letra, 5);     // parte de S0!  → S2, sem a nota

     O segundo não viu o primeiro, porque entre os dois não houve render.
     Resultado medido: `quizBest` continuava `null` depois de uma fixação
     perfeita, `isLessonMastered` dava falso para sempre, e a letra recém
     concluída nunca entrava na conta de "letras dominadas" - nem ali, nem
     no mapa, nem no cadeado do exame final.

     `commit` já mantinha `stateRef` em dia justamente para o gravador. Ler
     dele custa nada e fecha a classe inteira do defeito, não só esta
     ocorrência: qualquer par de chamadas seguidas passa a compor. */
  const agora = useCallback(() => stateRef.current, []);

  /* Toda gravação passa por aqui, e por um motivo só: ver ./gravador.ts.
     Em resumo, ele grava o estado DE AGORA em vez de uma cópia velha, e não
     grava nada antes de a leitura terminar - que juntos eram o apagamento
     silencioso do progresso a cada troca de página. */
  const gravador = useMemo(
    () => criarGravador(store, () => stateRef.current, () => setSincronizado(store.sincronizado())),
    [store]
  );
  useEffect(() => () => gravador.cancelar(), [gravador]);

  useEffect(() => {
    let alive = true;
    setPersistent(supabaseConfigured() || persistenceAvailable());
    store.load().then(s => {
      if (!alive) return;
      /* O que a pessoa fez ENQUANTO isto carregava não pode ser jogado fora.
         Com o adaptador do Worker a leitura espera a rede, e numa conexão
         ruim cabe uma lição inteira nesse intervalo. `mergeStates` é a mesma
         fusão que concilia dois aparelhos, e ela não desfaz nada. */
      const emMemoria = stateRef.current;
      const inicial = sameState(emMemoria, EMPTY_STATE) ? s : mergeStates(emMemoria, s);
      stateRef.current = inicial;
      setState(inicial);
      setReady(true);
      /* Só agora a gravação é liberada, e nesta ordem: liberar antes de o
         estado estar em mãos é reabrir o defeito que este arquivo conserta. */
      gravador.liberar();
      /* A rota que o AppShell avisou enquanto o estado carregava ficou de
         fora da fusão; se ela não chegou a entrar, entra agora. */
      if (rotaPendente.current && inicial.lastRoute !== rotaPendente.current) {
        const comRota = { ...inicial, lastRoute: rotaPendente.current };
        stateRef.current = comRota;
        setState(comRota);
        gravador.agendar(400);
      }
    });
    return () => { alive = false; };
  }, [store, gravador]);

  /* Entrar ou sair muda de quem é o progresso: o que estava só neste aparelho
     passa a ser da conta, e o que estava na conta chega aqui. Uma recarga
     resolve as duas coisas de uma vez, porque `load()` é quem funde.
     O `save` antes dela existe por causa do debounce de 250 ms: sem ele, a
     resposta dada um instante antes de clicar em "entrar" ainda não chegou ao
     armazenamento e a fusão não a encontraria. */
  useEffect(() => {
    let alive = true;
    const aoMudar = (e: Event) => {
      const saiu = !!(e as CustomEvent<{ saiu?: boolean }>).detail?.saiu;

      /* SAIR é o oposto de entrar, e tratá-los igual era o defeito: uma
         recarga depois do logout relia o aparelho, achava o progresso de quem
         saiu e o deixava lá. Numa máquina compartilhada, o próximo a sentar
         lê o estudo do anterior. O progresso não se perde - ele está na conta
         e volta no login. */
      if (saiu) {
        gravador.cancelar();
        void store.esquecerAqui().then(() => {
          if (!alive) return;
          stateRef.current = EMPTY_STATE;
          setState(EMPTY_STATE);
          setPending([]);
          setSincronizado(true);
        });
        return;
      }

      void gravador.agora()
        .then(() => store.load())
        .then(s => {
          if (!alive) return;
          stateRef.current = s;
          setState(s);
          setSincronizado(store.sincronizado());
        });
    };
    window.addEventListener(SESSAO_MUDOU, aoMudar);
    return () => { alive = false; window.removeEventListener(SESSAO_MUDOU, aoMudar); };
  }, [store, gravador]);

  /* A session left open across midnight must not keep crediting yesterday. */
  useEffect(() => {
    const t = setInterval(() => setDay(d => { const n = today(); return n === d ? d : n; }), 60_000);
    return () => clearInterval(t);
  }, []);

  const commit = useCallback((next: LearnerState) => {
    const synced = syncAchievements(next, today());
    if (synced.unlocked.length) {
      setPending(p => [...p, ...synced.unlocked]);
      synced.unlocked.forEach(a => track('achievement_unlocked', { achievementId: a.id }));
    }
    stateRef.current = synced.state;
    setState(synced.state);
    gravador.agendar(250);
  }, [gravador]);

  const setOnboarding = useCallback((o: Onboarding) => {
    commit({ ...agora(), onboarding: o });
    track('onboarding_completed', { goalMinutes: o.goalMinutes, reason: o.reason });
  }, [commit, agora]);

  const finishStage = useCallback((letterId: string, stage: number, units?: number) => {
    const d = today();
    const total = units === undefined ? 5 : 3;
    const before = agora().lessons[letterId]?.stagesDone.length ?? 0;
    const next = completeStage(agora(), letterId, stage, d, units);
    commit(next);
    track('stage_completed', { letterId, stage });
    if (before < total && (next.lessons[letterId]?.stagesDone.length ?? 0) >= total) {
      track('lesson_completed', { letterId });
    }
  }, [commit, agora]);

  const answer = useCallback((args: {
    itemId: string; letterId: string; correct: boolean;
    skill?: Skill; expected?: string; chosen?: string; kind?: string;
  }) => {
    const { itemId, letterId, correct, skill, expected, chosen, kind } = args;
    const d = today();
    let next = recordAnswer(agora(), itemId, letterId, correct, d, skill);
    /* A miss always creates the review entry, even the first time. */
    if (!correct && !next.srs[itemId]) {
      next = { ...next, srs: { ...next.srs, [itemId]: {
        itemId, letterId, box: 0, misses: 1, hits: 0, dueOn: d, lastSeen: d, skill
      } } };
    }
    if (skill) next = recordSkill(next, letterId, skill, correct, d);
    /* The chosen option is the whole point: a wrong answer that names WHICH
       letter was picked instead turns a generic miss into a drillable pair. */
    if (expected && chosen) {
      next = correct
        ? clearConfusion(next, expected, chosen)
        : recordConfusion(next, expected, chosen, d);
    }
    if (kind) {
      const k = next.kinds?.[kind] ?? { h: 0, m: 0 };
      next = { ...next, kinds: { ...(next.kinds ?? {}),
        [kind]: { h: k.h + (correct ? 1 : 0), m: k.m + (correct ? 0 : 1) } } };
    }
    next = applyPractice(next, d, { answered: 1, units: ANSWER_UNITS });
    commit(next);
    track('exercise_answered', { letterId, itemId, correct, skill, kind });
    if (!correct) track('exercise_wrong', { letterId, itemId, chosen });
  }, [commit, agora]);

  const setNomeHebraico = useCallback((texto: string | null) => {
    const limpo = texto?.trim() ?? '';
    commit({ ...agora(), nomeHebraico: limpo ? { texto: limpo, confirmadoEm: new Date().toISOString() } : null });
  }, [commit, agora]);

  const recordWriting = useCallback((letterId: string, score: number) => {
    const d = today();
    /* The bar is 0.5, which is low, and that is the decision: a finger on glass
       is not a pen on paper, and a learner told their readable ג is wrong stops
       trusting the whole app. The canvas is generous; this agrees with it. */
    let next = recordSkill(agora(), letterId, 'escrever', score >= 0.5, d);
    /* Writing is practice even when it comes out badly - more so, in fact. */
    next = applyPractice(next, d, { units: ANSWER_UNITS });
    commit(next);
    track('exercise_answered', { letterId, skill: 'escrever', correct: score >= 0.5 });
  }, [commit, agora]);

  const finishGym = useCallback((modeId: string, score: number, seconds: number) => {
    const d = today();
    /* XP for a gym run is the review award: it is the same kind of work, and
       paying more for it would turn the gym into the cheapest way to farm. */
    let next = recordGym(agora(), modeId, score, seconds, d);
    next = awardXp(next, d, XP.review);
    commit(next);
    track('gym_completed', { mode: modeId, score, seconds });
  }, [commit, agora]);

  const doMarkFirst = useCallback((id: string) => {
    if (agora().firsts[id]) return;
    commit(markFirst(agora(), id));
    track('first_reached', { id });
  }, [commit, agora]);

  const finishQuiz = useCallback((letterId: string, score: number) => {
    commit(recordQuiz(agora(), letterId, score, today()));
    track('quiz_completed', { letterId, score });
  }, [commit, agora]);

  const finishCheckpoint = useCallback((id: string, score: number) => {
    commit(recordCheckpoint(agora(), id, score, today()));
    track('checkpoint_completed', { checkpointId: id, score });
  }, [commit, agora]);

  const finishReview = useCallback((score: number) => {
    commit(awardXp(agora(), today(), XP.review));
    track('review_completed', { score });
  }, [commit, agora]);

  const finishFinalChallenge = useCallback((score: number) => {
    const d = today();
    const s = agora();
    let next: LearnerState = {
      ...s,
      finalChallenge: {
        best: s.finalChallenge.best == null ? score : Math.max(s.finalChallenge.best, score),
        completedAt: s.finalChallenge.completedAt ?? new Date().toISOString()
      }
    };
    next = awardXp(next, d, XP.checkpoint);
    commit(next);
    track('course_completed', { score });
  }, [commit, agora]);

  const finishExam = useCallback((
    score: number, parts: Record<string, { correct: number; total: number }>
  ) => {
    commit(recordExam(agora(), score, parts, today(), EXAM_PASS));
    track('course_completed', { score });
  }, [commit, agora]);

  /* Trocar de tela é a ação mais barata do app e era a mais cara: era ela
     que disparava a gravação do estado vazio por cima do progresso guardado.
     Agora, enquanto o estado não chegou, a rota só é anotada - quem a aplica
     é o efeito de carga, depois de ter o progresso em mãos. */
  const remember = useCallback((route: string) => {
    rotaPendente.current = route;
    if (!gravador.liberado) return;
    setState(s => {
      if (s.lastRoute === route) return s;
      const next = { ...s, lastRoute: route };
      stateRef.current = next;
      return next;
    });
    gravador.agendar(400);
  }, [gravador]);

  const reset = useCallback(() => {
    gravador.cancelar();
    void store.clear();
    stateRef.current = EMPTY_STATE;
    setState(EMPTY_STATE);
    setPending([]);
  }, [store, gravador]);

  const value = useMemo<Ctx>(() => {
    const goal = state.onboarding?.goalMinutes ?? 10;
    return {
      state, ready, persistent, sincronizado, day,
      streak: displayStreak(state, day),
      mastered: lettersMastered(state),
      progress: courseProgress(state, totalLetters, extraKey ? extraKey.split(',') : [],
        somKey ? somKey.split(',') : []),
      dueCount: dueItems(state, day).length,
      weak: weakLetters(state, day),
      goalUnits: state.days[day]?.units ?? 0,
      goalTargetToday: goalTarget(goal),
      confusions: topConfusions(state),
      pending,
      clearPending: () => setPending([]),
      setOnboarding, finishStage, answer, markFirst: doMarkFirst, recordWriting, finishGym,
      finishQuiz, finishCheckpoint, finishReview, finishFinalChallenge, finishExam,
      remember, reset, setNomeHebraico
    };
  }, [
    state, ready, persistent, sincronizado, day, totalLetters, extraKey, somKey, pending,
    setOnboarding, finishStage, answer, doMarkFirst, recordWriting, finishGym, finishQuiz,
    finishCheckpoint, finishReview, finishFinalChallenge, finishExam, remember, reset,
    setNomeHebraico
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useProgress(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
