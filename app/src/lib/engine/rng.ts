/* A seeded PRNG. There is no Math.random() anywhere in the learning engine.
 *
 * Two reasons, both pedagogical rather than technical:
 *
 *   · a learner who leaves a lesson and comes back must find the same
 *     exercise, not a new one — otherwise "tentar de novo" silently becomes
 *     "tentar outra coisa", and the retry teaches nothing about the item that
 *     was missed;
 *   · two learners must be able to talk about question 3.
 *
 * It also makes the whole engine testable: the order-rule test can enumerate
 * every exercise the course will ever generate. */

export type Rand = () => number;

export function rng(seed: string): Rand {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(arr: readonly T[], rand: Rand): T[] {
  const r = arr.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = r[i]!, b = r[j]!;
    r[i] = b; r[j] = a;
  }
  return r;
}

export function pick<T>(arr: readonly T[], rand: Rand): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.floor(rand() * arr.length)];
}

export const take = <T,>(arr: readonly T[], n: number, rand: Rand): T[] =>
  shuffled(arr, rand).slice(0, n);
