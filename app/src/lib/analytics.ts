/* Learning analytics.
 *
 * The question this exists to answer is "which letters cost learners the
 * most, and where do they stop" - not "who is this person". So: a closed
 * event vocabulary, no free text, no identifiers beyond what the course
 * already knows (a letter id, an exercise id, a score), and no third-party
 * script. Events queue in memory and are flushed by a sink that is not
 * installed by default, which means nothing leaves the browser today. */

export type EventName =
  | 'onboarding_completed'
  | 'lesson_started' | 'stage_completed' | 'lesson_completed'
  | 'exercise_answered' | 'exercise_wrong'
  | 'audio_played' | 'audio_unavailable'
  | 'quiz_completed'
  | 'review_started' | 'review_completed'
  | 'checkpoint_started' | 'checkpoint_completed'
  | 'streak_updated' | 'achievement_unlocked'
  | 'workbook_opened'
  | 'first_reached'
  | 'gym_started' | 'gym_completed'
  /* Match, Blast e Teste. `jogo` diz qual. */
  | 'game_started' | 'game_completed'
  | 'trace_completed' | 'trace_retried'
  | 'certificate_downloaded' | 'certificate_shared'
  | 'course_completed' | 'next_course_clicked'
  /* Um dos CTAs de lib/cta.ts. `itemId` diz onde ele estava e se vendia. */
  | 'cta_clicked';

export type EventProps = {
  /** Qual dos três jogos da academia. */
  jogo?: 'match' | 'blast' | 'teste';
  letterId?: string;
  itemId?: string;
  checkpointId?: string;
  achievementId?: string;
  stage?: number;
  score?: number;
  correct?: boolean;
  goalMinutes?: number;
  reason?: string;
  audioId?: string;
  pages?: string;
  /** Which of the five skills an answer exercised. */
  skill?: string;
  /** The wrong option a learner picked - a glyph, never free text. */
  chosen?: string;
  /** A one-time milestone id, e.g. 'leitura-sem-translit'. */
  id?: string;
  /** A reading-gym mode id. */
  mode?: string;
  /** Seconds, for the timed modes. */
  seconds?: number;
};

export type LearningEvent = { name: EventName; props: EventProps; at: number };

type Sink = (events: LearningEvent[]) => void;

const queue: LearningEvent[] = [];
let sink: Sink | null = null;

/** Install a destination. Without one, events stay in memory and are dropped
 *  on reload - which is the correct default for a course nobody has consented
 *  to be measured in yet. */
export function setAnalyticsSink(next: Sink | null): void {
  sink = next;
  if (sink && queue.length) { sink(queue.splice(0, queue.length)); }
}

export function track(name: EventName, props: EventProps = {}): void {
  const ev: LearningEvent = { name, props, at: Date.now() };
  if (sink) sink([ev]);
  else {
    queue.push(ev);
    if (queue.length > 500) queue.splice(0, queue.length - 500);
  }
}

/** For the dev overlay and for tests. */
export const pendingEvents = (): readonly LearningEvent[] => queue;
