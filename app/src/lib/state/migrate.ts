/* Reading saved progress written by an older version of the course.
 * ─────────────────────────────────────────────────────────────────────────
 * There are learners with v1 state in their browser right now. Their XP,
 * streak, finished lessons and review queue are the only record that the work
 * happened — localStorage is the database here — so a shape change that drops
 * them is data loss, not a refactor.
 *
 * The rules this file follows:
 *
 *   · one step per version, applied in order, so a v1 save reaches the current
 *     shape through the same path a v2 save took when it was written;
 *   · every step ADDS; no step removes a field an older build wrote, because a
 *     learner may open an older cached build tomorrow;
 *   · unknown, corrupt or newer-than-us data yields EMPTY_STATE rather than a
 *     crash. A course that throws on load because a field changed type is a
 *     course nobody finishes;
 *   · the storage KEY never changes. It is how we find the old save at all.
 */

import { EMPTY_STATE, STATE_VERSION, type LearnerState } from './types';

/** v1: everything before per-skill mastery. */
type V1 = Omit<LearnerState, 'version' | 'skills' | 'confusions' | 'firsts' | 'gym'> & { version: 1 };

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * v1 → v2. The three new maps start empty on purpose.
 *
 * It is tempting to seed `skills` from the finished lessons — five stages done,
 * so call every skill strong. That would be a lie the system then acts on: it
 * would stop offering review for letters this learner may well have forgotten,
 * and the first thing they would notice is that the course thinks they are
 * better than they are. An empty record reads as "no evidence yet", which is
 * exactly true, and the next answer they give fills it in honestly.
 *
 * Nothing else is touched: XP, streak, days, lessons, checkpoints, srs,
 * achievements and the final challenge all carry over by value.
 */
function v1ToV2(s: V1): LearnerState {
  return { ...s, version: 2, skills: {}, confusions: {}, firsts: {}, gym: {} };
}

/**
 * Parse whatever is in storage into the current shape.
 *
 * Returns EMPTY_STATE for anything it cannot vouch for — including state from a
 * FUTURE version, which happens when a learner opens a stale cached build after
 * using a newer one. Overwriting newer data with our guess at its meaning would
 * be worse than starting the session empty, and the newer build will still find
 * its own save when it loads.
 */
export function migrate(raw: unknown): LearnerState {
  if (!isObject(raw)) return EMPTY_STATE;
  const version = raw['version'];
  if (typeof version !== 'number') return EMPTY_STATE;
  if (version > STATE_VERSION) return EMPTY_STATE;

  let state = raw;
  if (version === 1) state = v1ToV2(raw as unknown as V1) as unknown as Record<string, unknown>;

  /* Spread over EMPTY_STATE last: a save written by a build between these two
     versions may be missing a field entirely, and every consumer here assumes
     the maps exist. */
  const merged = { ...EMPTY_STATE, ...(state as Partial<LearnerState>) } as LearnerState;
  return {
    ...merged,
    version: 2,
    lessons: merged.lessons ?? {},
    checkpoints: merged.checkpoints ?? {},
    srs: merged.srs ?? {},
    days: merged.days ?? {},
    achievements: merged.achievements ?? [],
    skills: merged.skills ?? {},
    confusions: merged.confusions ?? {},
    firsts: merged.firsts ?? {},
    /* Added to v2 after it shipped. A save written between the two has no
       such key, and every reader assumes the map exists. */
    gym: merged.gym ?? {},
    streak: merged.streak ?? { current: 0, longest: 0, lastDay: null },
    finalChallenge: merged.finalChallenge ?? { best: null, completedAt: null }
  };
}
