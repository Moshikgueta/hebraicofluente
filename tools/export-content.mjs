/* export-content.mjs - data/ → app/content/
 * ─────────────────────────────────────────────────────────────────────────
 * The app does NOT read data/letters.json directly, and it does not read the
 * PDF at all. This is the one bridge between the two, and it exists for three
 * reasons:
 *
 *   1. The order rule has to be a value, not a convention. Every letter here
 *      carries `alphabetSoFar` - the exact set of glyphs the learner may be
 *      shown at that point. The exercise generator receives only that set, so
 *      it CANNOT produce a distractor with an unlearned letter. In the book
 *      that guarantee is validate.js V1; in the app it is this field.
 *
 *   2. Nikud must not be normalised, reordered or trimmed on its way to the
 *      browser. Everything is written NFC and copied verbatim - no cleaning,
 *      no "helpful" whitespace handling. A pointed Hebrew word is 2-4
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

/* A scene names a word; its reading and meaning must come from the one place
   that already holds them, or the two drift. A multi-word sign (בֹּקֶר טוֹב)
   is looked up word by word and joined. */
function lookupWord(letters, phrase, scene) {
  const all = new Map();
  for (const L of letters) {
    for (const w of [...L.wordsToRead, ...L.wordsToRecognize]) all.set(NFC(w.he), w);
  }
  /* A gloss written ON the scene wins. Joining the dictionary entries of
     בֹּקֶר and טוֹב gives "manhã bom", which is not Portuguese - a phrase means
     something the words do not, and the scene is where that is recorded. */
  if (scene.pt) return { translit: scene.translit ?? null, pt: scene.pt };

  const parts = NFC(phrase).split(/\s+/).filter(Boolean);
  const found = parts.map(p => all.get(p));
  if (found.every(Boolean)) {
    return {
      translit: found.map(w => w.translit).join(' '),
      pt: found.map(w => w.pt).join(' ')
    };
  }
  /* Not a plain vocabulary word (an inflected form such as הַמֶּלֶךְ). The
     scene then carries its own gloss, and V18 has already proved it is
     readable at that point. */
  return { translit: scene.translit ?? null, pt: scene.pt ?? null };
}

function main() {
  const letters = readJson('data/letters.json').sort((a, b) => a.order - b.order);
  const modules = readJson('data/modules.json').modules;
  const nikud = readJson('data/nikud.json');
  const extras = readJson('data/extras.json');
  const realWorld = readJson('data/real-world.json');

  /* Where each letter's pages start in the printed workbook, so the app can
     say "quer praticar à mão? páginas X-Y". Absent before the first `npm run
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
     that is not a single lesson - the map, a checkpoint, the review - needs
     most of them at once, and 96 KB of JSON split 22 ways would be 22 requests
     to show one page. */
  writeFileSync(join(OUT, 'letters.json'), JSON.stringify(exported) + '\n');

  /* ── the course spine ───────────────────────────────────────────────── */
  const course = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: 'data/letters.json + data/modules.json - «בא לי עברית!» חוברת למורה',
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

  /* ── the catalogue ──────────────────────────────────────────────────────
     data/courses.json is the platform's product list: what /cursos shows,
     what the checkout charges, and what a paid account is allowed to open.
     Only one thing is resolved here rather than copied - a course that says
     `modulesFrom: "alfabetizacao"` takes its module list from the course just
     built above, so the sales page and the course itself cannot describe
     different módulos. Everything else passes through verbatim: a price the
     exporter "helped with" is a price nobody can trust. */
  /* ── quem vende ─────────────────────────────────────────────────────────
     Identificação do fornecedor, canais de atendimento e prazos das
     políticas. Passa verbatim, menos o `_nota`, que é comentário para quem
     edita o arquivo e não tem por que viajar até o navegador de um aluno. */
  {
    const { _nota, ...empresa } = readJson('data/empresa.json');
    void _nota;
    writeFileSync(join(OUT, 'empresa.json'), JSON.stringify(empresa, null, 2) + '\n');
  }

  const catalogue = readJson('data/courses.json');
  const builtModules = course.modules.map(m => ({
    n: m.n, titlePt: m.titlePt, subPt: m.subPt, letters: m.letterIds.length
  }));
  writeFileSync(join(OUT, 'courses.json'), JSON.stringify({
    currency: catalogue.currency,
    courses: catalogue.courses.map(c => {
      const { modulesFrom, ...rest } = c;
      if (modulesFrom && modulesFrom !== 'alfabetizacao') {
        throw new Error(`courses.json: modulesFrom "${modulesFrom}" não corresponde a nenhum curso construído`);
      }
      const modules = modulesFrom ? builtModules : (c.modules ?? []);
      return {
        ...rest,
        modules,
        stats: modulesFrom
          ? { modules: course.modules.length, lessons: course.totalLetters }
          : { modules: modules.length, lessons: null }
      };
    })
  }, null, 2) + '\n');

  /* ── the vowel signs, taught by SOUND and not by name ───────────────── */
  writeFileSync(join(OUT, 'nikud.json'), JSON.stringify({
    intro: nikud.intro,
    dagesh: nikud.dagesh,
    sounds: nikud.sounds.map(s => ({
      sound: s.sound,
      ptApprox: s.ptApprox ?? null,
      signs: s.signs.map(g => ({
        nameHe: NFC(g.nameHe), namePt: g.namePt,
        demo: NFC(g.demo), position: g.position,
        /* Two clips, because they are two different things: the SOUND the sign
           makes on a consonant, and the sign's own NAME. The lab plays the
           first; the card that teaches the sign plays the second. */
        audioId: audioIdFor(g.demo),
        nameAudioId: audioIdFor(g.nameHe),
        /* The vowel mark on its own, for the places that show the sign rather
           than a syllable. Derived here so no component ever takes a Hebrew
           string apart by hand. */
        sign: NFC(g.demo).replace(/^[\u05D0-\u05EA]/, '')
      }))
    }))
  }, null, 2) + '\n');

  /* ── modules 6 and 7, and the real-world scenes ─────────────────────
     Both are shared with the book verbatim; what is added here is the audio id
     per item, computed the same way as everywhere else. */
  const withAudio = w => ({ ...w, he: NFC(w.he), audioId: audioIdFor(w.he) });

  writeFileSync(join(OUT, 'extras.json'), JSON.stringify({
    dagesh: {
      ...extras.dagesh,
      letters: extras.dagesh.letters.map(D => ({
        ...D,
        hard: NFC(D.hard), soft: NFC(D.soft),
        hardWords: D.hardWords.map(withAudio),
        softWords: D.softWords.map(withAudio)
      }))
    },
    finals: extras.finals.map(F => ({
      ...F, base: NFC(F.base), fin: NFC(F.fin),
      word: NFC(F.word), nameHe: NFC(F.nameHe), audioId: audioIdFor(F.word)
    })),
    unpointed: {
      ...extras.unpointed,
      words: extras.unpointed.words.map(u => ({
        ...u, bare: NFC(u.bare), pointed: NFC(u.pointed), audioId: audioIdFor(u.pointed)
      }))
    },
    gerech: {
      ...extras.gerech,
      signHe: NFC(extras.gerech.signHe),
      letters: extras.gerech.letters.map(g => ({
        ...g, he: NFC(g.he), base: NFC(g.base),
        /* The letter itself is a clip: module 7 is three SOUNDS, and hearing
           צ׳ is the thing the module exists to teach. */
        audioId: audioIdFor(g.he),
        words: g.words.map(w => ({ ...w, he: NFC(w.he), audioId: audioIdFor(w.he) }))
      }))
    }
  }, null, 2) + '\n');

  writeFileSync(join(OUT, 'real-world.json'), JSON.stringify({
    scenes: realWorld.scenes.map(s2 => ({
      /* The translit and gloss come from the letter data, so a scene can never
         disagree with the lesson that taught the word. A scene may override
         them - an inflected form such as הַמֶּלֶךְ is not a dictionary entry. */
      ...s2,
      he: NFC(s2.he),
      audioId: audioIdFor(s2.he),
      ...lookupWord(letters, s2.he, s2)
    }))
  }, null, 2) + '\n');

  /* ── culture and history ────────────────────────────────────────────
     Optional, unlockable, and deliberately OUTSIDE the main path: the course
     teaches reading, and a learner who wants to know where the pointinhos came
     from should be able to find out without the alphabet turning into a
     history class. Copied verbatim; the Hebrew inside it is normalised like
     everything else. */
  const culturePath = join(ROOT, 'data/culture.json');
  if (existsSync(culturePath)) {
    const culture = readJson('data/culture.json');
    writeFileSync(join(OUT, 'culture.json'), JSON.stringify({
      cards: culture.cards.map(c => ({
        ...c,
        leadPt: NFC(c.leadPt),
        bodyPt: c.bodyPt.map(NFC)
      }))
    }, null, 2) + '\n');
  } else {
    writeFileSync(join(OUT, 'culture.json'), JSON.stringify({ cards: [] }, null, 2) + '\n');
  }

  /* ── stroke geometry ────────────────────────────────────────────────
     The SVG in assets/stroke-order/ is the printed diagram: the whole letter,
     with numbered start dots. This is the same run's machine-readable half -
     one path per stroke, where the pen lands, which way it sets off - and it is
     what the app animates, revealing he, alef and qof one stroke at a time.

     Copied verbatim, and only if present. A missing file is not an error: the
     tracing screen falls back to the static diagram, which is what it showed
     before this existed. */
  const strokePaths = join(ROOT, 'data/stroke-paths.json');
  writeFileSync(
    join(OUT, 'stroke-paths.json'),
    existsSync(strokePaths)
      ? readFileSync(strokePaths, 'utf8')
      : JSON.stringify({ box: 200, letters: {} }, null, 2) + '\n'
  );

  /* ── static assets the app serves ───────────────────────────────────── */
  const pub = join(ROOT, 'app/public');
  mkdirSync(pub, { recursive: true });
  cpSync(join(ROOT, 'assets/fonts'), join(pub, 'fonts'), { recursive: true });
  cpSync(join(ROOT, 'assets/stroke-order'), join(pub, 'stroke-order'), { recursive: true });

  /* The recordings land in audio/ at the repo root - one obvious place for a
     speaker to drop files - and are copied in from there. The app serves
     whatever is present and marks the rest as "áudio em breve"; nothing has to
     be edited when a wave arrives. */
  const drop = join(ROOT, 'audio');
  /* Cleared, not merged. Copying without clearing left a withdrawn recording in
     app/public/audio/, so the app went on offering a clip that had been pulled -
     and the manifest, which is built from this directory, went on claiming it. */
  rmSync(join(pub, 'audio'), { recursive: true, force: true });
  mkdirSync(join(pub, 'audio'), { recursive: true });
  if (existsSync(drop)) {
    for (const f of readdirSync(drop).filter(f => f.endsWith('.mp3'))) {
      cpSync(join(drop, f), join(pub, 'audio', f));
    }
  }


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
    ` * of the course: see ARCHITECTURE.md \u00a76.3. Everything downstream - the audio\n` +
    ` * button, the listening exercises, the quiz composition - reads this array and\n` +
    ` * degrades visibly rather than inventing a pronunciation. */\n` +
    `export const AUDIO_MANIFEST: readonly string[] = ${JSON.stringify(clips)};\n`);

  const words = letters.reduce((a, l) => a + l.wordsToRead.length + l.wordsToRecognize.length, 0);
  console.log(`  ${letters.length} letras · ${modules.length} módulos · ${words} palavras → app/content/`);
  console.log(`  áudio: ${clips.length} arquivo(s) em app/public/audio` +
    (clips.length ? '' : ' - os exercícios de audição ficam marcados como indisponíveis'));
}

main();
