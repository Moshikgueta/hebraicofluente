/* localStorage adapter. The default, and the only one wired up today.
 *
 * Every read and write is wrapped: a private window, cleared site data or a
 * blocked-cookies setting makes localStorage throw on ACCESS, not just return
 * null, and a course that crashes on load because someone is browsing
 * privately is a course nobody finishes. Failure here degrades to "no saved
 * progress", never to a broken page. */

import { EMPTY_STATE, type LearnerState, type ProgressStore } from './types';
import { migrate } from './migrate';

/* The key is a name, not a version number, and it must never change: it is the
   only way to find the progress a learner already has. Shape changes are
   handled by migrate(), not by writing to a second key - which would leave the
   old one behind, full of work, unreadable. */
const KEY = 'hebraico-fluente-v1';

export class LocalProgressStore implements ProgressStore {
  async load(): Promise<LearnerState> {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return EMPTY_STATE;
      return migrate(JSON.parse(raw));
    } catch {
      return EMPTY_STATE;
    }
  }

  async save(state: LearnerState): Promise<void> {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* Quota or private mode. The session still works; it just will not
         survive a reload, and the UI says so via `persistenceAvailable`. */
    }
  }

  async clear(): Promise<void> {
    try { window.localStorage.removeItem(KEY); } catch { /* nothing to do */ }
  }
}

export function persistenceAvailable(): boolean {
  try {
    const probe = '__hf_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
