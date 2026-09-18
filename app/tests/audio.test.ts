/* The audio contract.
 *
 * Two independent pieces of code compute the clip id: tools/gen-audio.mjs, which
 * names what the speaker records, and tools/export-content.mjs, which names what
 * the app asks for. They use the same hash, but they are separate
 * implementations — and if they ever drift the app requests files nobody
 * recorded and every button silently reads "áudio em breve" forever.
 *
 * So the app's view of the world is checked against the recording manifest. */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allLetters, extras, nikud, scenesUpTo } from '../src/lib/content';
import { AUDIO_MANIFEST } from '../src/lib/audio-manifest';

type Clip = { num: number; he: string; file: string; wave: number; kind: string };
const manifest = JSON.parse(
  readFileSync(new URL('../../data/audio.json', import.meta.url), 'utf8')
) as { total: number; clips: Clip[]; waves: { id: number; count: number }[] };

const byId = new Map(manifest.clips.map(c => [c.file.replace(/\.mp3$/, ''), c]));

/** Every audioId the app can ask for, with where it came from. */
function requested(): { id: string; where: string }[] {
  const out: { id: string; where: string }[] = [];
  for (const L of allLetters()) {
    out.push({ id: L.audioId, where: `${L.id}.nameHe` });
    L.syllables.forEach(s => out.push({ id: s.audioId, where: `${L.id}.syllable ${s.vowel}` }));
    L.wordsToRead.forEach(w => out.push({ id: w.audioId, where: `${L.id}.read ${w.he}` }));
    L.wordsToRecognize.forEach(w => out.push({ id: w.audioId, where: `${L.id}.recognize ${w.he}` }));
  }
  for (const s of nikud.sounds) {
    s.signs.forEach(g => out.push({ id: g.audioId, where: `nikud ${g.namePt}` }));
  }
  for (const D of extras.dagesh.letters) {
    [...D.hardWords, ...D.softWords].forEach(w => out.push({ id: w.audioId, where: `mod6 ${w.he}` }));
  }
  extras.finals.forEach(F => out.push({ id: F.audioId, where: `mod6 final ${F.word}` }));
  extras.unpointed.words.forEach(u => out.push({ id: u.audioId, where: `mod6 unpointed ${u.bare}` }));
  extras.gerech.letters.forEach(g => {
    out.push({ id: g.audioId, where: `mod7 letter ${g.he}` });
    g.words.forEach(w => out.push({ id: w.audioId, where: `mod7 ${w.he}` }));
  });
  scenesUpTo(22).forEach(s => out.push({ id: s.audioId, where: `scene ${s.id}` }));
  return out;
}

describe('the audio manifest and the app agree', () => {
  it('has a recorded clip planned for everything the app can play', () => {
    const missing = requested().filter(r => !byId.has(r.id));
    expect(missing.map(m => `${m.where} → ${m.id}`)).toEqual([]);
  });

  it('plans no clip the app never asks for', () => {
    /* An orphan is not an error — vocabulary changes leave them behind — but a
       large number means the manifest was not regenerated, and the speaker
       would be recording words the course dropped. */
    const asked = new Set(requested().map(r => r.id));
    const orphans = manifest.clips.filter(c => !asked.has(c.file.replace(/\.mp3$/, '')));
    expect(orphans.map(o => o.he)).toEqual([]);
  });

  it('maps the unpointed reading list onto its pointed twin', () => {
    /* ספר and סֵפֶר are the same word said the same way. Two clips would mean
       asking the speaker to read it twice and risking two different takes. */
    for (const u of extras.unpointed.words) {
      const pointed = allLetters()
        .flatMap(l => [...l.wordsToRead, ...l.wordsToRecognize])
        .find(w => w.he === u.pointed);
      if (pointed) expect(u.audioId, u.bare).toBe(pointed.audioId);
    }
  });

  it('gives every clip a unique filename', () => {
    const files = manifest.clips.map(c => c.file);
    expect(new Set(files).size).toBe(files.length);
  });

  it('keeps every clip in exactly one wave, and wave 1 first', () => {
    for (const c of manifest.clips) expect([1, 2, 3]).toContain(c.wave);
    const w1 = manifest.clips.filter(c => c.wave === 1);
    /* Wave 1 must carry every letter name and every syllable: it is the wave
       that makes the course's central claim — this letter makes this sound —
       actually audible. */
    expect(w1.filter(c => c.kind === 'nome').length).toBeGreaterThanOrEqual(22);
    expect(w1.filter(c => c.kind === 'silaba').length).toBeGreaterThanOrEqual(132);
  });

  it('never claims a clip that is not in the manifest', () => {
    /* AUDIO_MANIFEST is built from whatever is in public/audio/, so a stray or
       mistyped file would make the app offer a play button for a recording that
       is not part of the course. It also caught the export bug that left a
       withdrawn recording behind: the directory is cleared before copying now,
       so removing a file from audio/ actually removes it from the app. */
    const known = new Set(manifest.clips.map(c => c.file.replace(/\.mp3$/, '')));
    const stray = AUDIO_MANIFEST.filter(id => !known.has(id));
    expect(stray).toEqual([]);
  });

  it('reports coverage honestly', () => {
    /* Not an assertion about how much audio exists — that changes as waves
       arrive — but about the two states being consistent: every id present is a
       real clip, and the count is what the app will actually be able to play. */
    expect(AUDIO_MANIFEST.length).toBeLessThanOrEqual(manifest.clips.length);
    expect(new Set(AUDIO_MANIFEST).size).toBe(AUDIO_MANIFEST.length);
  });
});
