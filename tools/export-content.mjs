/* export-content.mjs — data/ → app/content/
 * ─────────────────────────────────────────────────────────────────────────
 * The app does NOT read data/letters.json directly, and it does not read the
 * PDF at all. This is the one bridge between the two, and it exists for three
 * reasons:
 *
 *   1. The order rule has to be a value, not a convention. Every letter here
 *      carries `alphabetSoFar` — the exact set of glyphs the learner may be
 *      shown at that point. The exercise generator receives only that set, so
 *      it CANNOT produce a distractor with an unlearned letter. In the book
 *      that guarantee is validate.js V1; in the app it is this field.
 *
 *   2. Nikud must not be normalised, reordered or trimmed on its way to the
 *      browser. Everything is written NFC and copied verbatim — no cleaning,
 *      no "helpful" whitespace handling. A pointed Hebrew word is 2–4
 *      codepoints per letter and any string surgery corrupts it.
 *
 *   3. The book and the app must never drift. One source, two outputs: change
 *      a word in data/letters.json and both the printed workbook and the
 *      course change with it, or neither does.
 *
 * Run: npm run export-content (from app/), or node tools/export-content.mjs
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'app/content');
const readJson = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const NFC = s => String(s ?? '').normalize('NFC');

/* Same hash as tools/gen-audio.mjs, so a clip recorded for the book plays in
   the app without a second naming scheme. Content-derived, never positional. */
const audioIdFor = he => 'he-' + createHash('sha256').update(NFC(he)).digest('hex').slice(0, 8);

const word = w => ({
  he: NFC(w.he),
  translit: w.translit,
  pt: w.pt,
  use: w.use ?? null,
  audioId: audioIdFor(w.he)
});

function main() {
  const letters = readJson('data/letters.json').sort((a, b) => a.order - b.order);
  const modules = readJson('data/modules.json').modules;
  const nikud = readJson('data/nikud.json');

  /* Where each letter's pages start in the printed workbook, so the app can
     say "quer praticar à mão? páginas X–Y". Absent before the first `npm run
     pdf`; the link is then simply not shown. */
  let pageMap = {};
  try { pageMap = readJson('data/page-map.json').sections || {}; } catch { /* no pdf yet */ }
  const sectionOrder = Object.keys(pageMap).sort((a, b) => pageMap[a] - pageMap[b]);
  const pagesFor = id => {
    const at = sectionOrder.indexOf(id);
    if (at < 0) return null;
    const from = pageMap[id];
    const next = sectionOrder[at + 1];
    return { from, to: next ? pageMap[next] - 1 : from };
  };

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, 'letters'), { recursive: true });
  const exported = [];

  /* ── the order rule, materialised ───────────────────────────────────── */
  const alphabetUpTo = order => {
    const out = [];
    for (const L of letters) {
      if (L.order > order) break;
      out.push(L.letter);
      if (L.finalForm) out.push(L.finalForm);
    }
    return out;
  };

  const strokeSvg = id => {
    const p = join(ROOT, 'assets/stroke-order', `${id}.svg`);
    return existsSync(p) ? `/stroke-order/${id}.svg` : null;
  };

  for (const L of letters) {
    const out = {
      id: L.id,
      order: L.order,
      module: L.module,
      lesson: L.lesson,
      letter: NFC(L.letter),
      finalForm: L.finalForm ? NFC(L.finalForm) : null,
      nameHe: NFC(L.nameHe),
      namePt: L.namePt,
      translit: L.translit,
      sound: L.sound,
      soundNotePt: L.soundNotePt,
      didYouKnow: L.didYouKnow,
      brazilianMistake: L.brazilianMistake,
      confusableWith: (L.confusableWith || []).map(NFC),
      syllables: (L.syllables || []).map(s => ({
        vowel: s.vowel, he: NFC(s.he), translit: s.translit,
        ptApprox: s.ptApprox, audioId: audioIdFor(s.he)
      })),
      wordsToRead: (L.wordsToRead || []).map(word),
      wordsToRecognize: (L.wordsToRecognize || []).map(word),
      bridgeWords: (L.bridgeWords || []).map(b => ({ he: NFC(b.he), pt: b.pt })),
      alphabetSoFar: alphabetUpTo(L.order),
      strokeOrder: { base: strokeSvg(L.id), final: L.finalForm ? strokeSvg(`${L.id}-final`) : null },
      workbookPages: pagesFor(L.id),
      audioId: audioIdFor(L.nameHe)
    };
    exported.push(out);
    writeFileSync(join(OUT, 'letters', `${L.id}.json`), JSON.stringify(out, null, 2) + '\n');
  }

  /* One bundle as well as one file per letter. The per-letter files are for
     reading and diffing; this is what the app imports, because every screen
     that is not a single lesson — the map, a checkpoint, the review — needs
     most of them at once, and 96 KB of JSON split 22 ways would be 22 requests
     to show one page. */
  writeFileSync(join(OUT, 'letters.json'), JSON.stringify(exported) + '\n');

  /* ── the course spine ───────────────────────────────────────────────── */
  const course = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: 'data/letters.json + data/modules.json — «בא לי עברית!» חוברת למורה',
    totalLetters: letters.length,
    modules: modules.map(M => {
      const own = letters.filter(l => l.module === M.n);
      return {
        n: M.n,
        id: M.id,
        kind: M.kind ?? 'letters',
        titlePt: M.titlePt,
        subPt: M.subPt,
        introPt: M.introPt,
        goalsPt: M.goalsPt,
        milestonePt: M.milestonePt,
        lessons: M.lessons,
        letterIds: own.map(l => l.id),
        upTo: own.length ? own[own.length - 1].order : null,
        checkpoint: own.length
          ? { id: `cp${M.n}`, module: M.n, upTo: own[own.length - 1].order,
              letterIds: own.map(l => l.id), workbookPages: pagesFor(`rev${M.n}`) }
          : null,
        workbookPages: pagesFor(M.id)
      };
    }),
    letters: letters.map(l => ({
      id: l.id, order: l.order, module: l.module,
      letter: NFC(l.letter), namePt: l.namePt, sound: l.sound
    }))
  };
  writeFileSync(join(OUT, 'course.json'), JSON.stringify(course, null, 2) + '\n');

  /* ── the vowel signs, taught by SOUND and not by name ───────────────── */
  writeFileSync(join(OUT, 'nikud.json'), JSON.stringify({
    intro: nikud.intro,
    dagesh: nikud.dagesh,
    sounds: nikud.sounds.map(s => ({
      sound: s.sound,
      ptApprox: s.ptApprox ?? null,
      signs: s.signs.map(g => ({
        nameHe: NFC(g.nameHe), namePt: g.namePt,
        demo: NFC(g.demo), position: g.position, audioId: audioIdFor(g.demo)
      }))
    }))
  }, null, 2) + '\n');

  /* ── static assets the app serves ───────────────────────────────────── */
  const pub = join(ROOT, 'app/public');
  mkdirSync(pub, { recursive: true });
  cpSync(join(ROOT, 'assets/fonts'), join(pub, 'fonts'), { recursive: true });
  cpSync(join(ROOT, 'assets/stroke-order'), join(pub, 'stroke-order'), { recursive: true });
  mkdirSync(join(pub, 'audio'), { recursive: true });


  /* The audio manifest is generated from what is actually on disk, so the app
     can never claim a clip it does not have. Today that list is empty. */
  const audioDir = join(pub, 'audio');
  const clips = existsSync(audioDir)
    ? readdirSync(audioDir).filter(f => f.endsWith('.mp3')).map(f => f.replace(/\.mp3$/, ''))
    : [];
  writeFileSync(join(ROOT, 'app/src/lib/audio-manifest.ts'),
    `/* GENERATED by tools/export-content.mjs from the contents of public/audio/.\n` +
    ` *\n` +
    ` * Empty means there are no recordings yet. That is the current, honest state\n` +
    ` * of the course: see ARCHITECTURE.md \u00a76.3. Everything downstream \u2014 the audio\n` +
    ` * button, the listening exercises, the quiz composition \u2014 reads this array and\n` +
    ` * degrades visibly rather than inventing a pronunciation. */\n` +
    `export const AUDIO_MANIFEST: readonly string[] = ${JSON.stringify(clips)};\n`);

  const words = letters.reduce((a, l) => a + l.wordsToRead.length + l.wordsToRecognize.length, 0);
  console.log(`  ${letters.length} letras · ${modules.length} módulos · ${words} palavras → app/content/`);
  console.log(`  áudio: ${clips.length} arquivo(s) em app/public/audio` +
    (clips.length ? '' : ' — os exercícios de audição ficam marcados como indisponíveis'));
}

main();
