/* validate.js — the build gate.
   Runs before every build. Collects ALL violations, prints them together,
   exits non-zero if any are fatal. Warnings never fail the build.

   V1 is the reason this file exists: a learner must never be shown a word
   containing a letter they have not been taught. Everything else is support. */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  consonantsOf, hasNikud, hasHebrew, clean, stripNikud, FINAL_TO_BASE
} from './lib/hebrew.js';
import { unmarkedHebrew } from './lib/render.js';

const ROOT = new URL('..', import.meta.url).pathname;
const read = p => readFileSync(join(ROOT, p), 'utf8');
const readJson = p => JSON.parse(read(p));

const fails = [];
const warns = [];
const fail = (rule, where, detail) => fails.push({ rule, where, detail });
const warn = (rule, where, detail) => warns.push({ rule, where, detail });

export function validate({ checkDist = true } = {}) {
  fails.length = 0; warns.length = 0;

  const letters = readJson('data/letters.json');
  const translit = readJson('data/translit.json');

  /* ── V4 — identity and ordering ────────────────────────────────────── */
  const orders = letters.map(l => l.order);
  const ids = letters.map(l => l.id);
  const chars = letters.map(l => l.letter);
  orders.slice().sort((a, b) => a - b).forEach((o, i) => {
    if (o !== i + 1) fail('V4', `order ${o}`, `orders must be contiguous from 1 — expected ${i + 1}`);
  });
  [['id', ids], ['letter', chars], ['order', orders]].forEach(([name, arr]) => {
    const seen = new Set();
    arr.forEach(v => {
      if (seen.has(v)) fail('V4', String(v), `duplicate ${name}`);
      seen.add(v);
    });
  });
  if (letters.length !== 22) {
    warn('V4', 'data/letters.json', `${letters.length} of 22 letters authored`);
  }

  /* ── V16 — the teaching plan and the letters agree ──────────────────
     data/modules.json says which letters a unit of «בא לי עברית!» covers;
     data/letters.json stamps each letter with its module and lesson. Two
     files, one fact — so they are checked against each other. The build
     reads BOTH (the opener from one, the letter pages from the other), and
     a drift between them would print a module whose contents page and whose
     letters disagree. */
  let modules = null;
  try { modules = readJson('data/modules.json').modules; } catch { /* not authored */ }
  if (!modules) {
    warn('V16', 'data/modules.json', 'ausente — o livro sai sem aberturas de módulo');
  } else {
    const claimed = new Map();      // letter id -> module n
    for (const M of modules) {
      for (const id of M.letters || []) claimed.set(id, M.n);
      for (const ls of M.lessons || []) {
        for (const id of ls.letters || []) {
          if (!(M.letters || []).includes(id)) {
            fail('V16', `módulo ${M.n}`, `a lição ${ls.n} traz "${id}", que não está em letters do módulo`);
          }
        }
      }
    }
    for (const L of letters) {
      if (L.module == null) { fail('V16', L.id, 'sem módulo'); continue; }
      const M = modules.find(m => m.n === L.module);
      if (!M) { fail('V16', L.id, `módulo ${L.module} não existe em modules.json`); continue; }
      if (claimed.get(L.id) !== L.module) {
        fail('V16', L.id, `diz ser do módulo ${L.module}, que não o lista`);
      }
      if (!(M.lessons || []).some(ls => (ls.letters || []).includes(L.id))) {
        fail('V16', L.id, `nenhuma lição do módulo ${L.module} o apresenta`);
      }
      const ls = (M.lessons || []).find(x => (x.letters || []).includes(L.id));
      if (ls && ls.n !== L.lesson) {
        fail('V16', L.id, `lesson ${L.lesson} não bate com a lição ${ls.n} do plano`);
      }
    }
    /* A module must be a contiguous run of the reading order, or the opener
       page ("as letras do módulo") describes a set the book never delivers
       in one go. */
    let prev = 0;
    for (const M of modules) {
      const own = letters.filter(l => l.module === M.n).sort((a, b) => a.order - b.order);
      if (!own.length) continue;
      if (own[0].order !== prev + 1 || own[own.length - 1].order !== prev + own.length) {
        fail('V16', `módulo ${M.n}`,
          `as ordens ${own.map(l => l.order).join(', ')} não formam um bloco contínuo a partir de ${prev + 1}`);
      }
      prev = own[own.length - 1].order;
    }
  }

  /* Order lookup, finals folded to their base letter. */
  const orderOf = new Map();
  letters.forEach(l => {
    orderOf.set(l.letter, l.order);
    if (l.finalForm) orderOf.set(l.finalForm, l.order);
  });

  const EXPECTED_FINALS = { 'מ': 'ם', 'נ': 'ן', 'כ': 'ך', 'פ': 'ף', 'צ': 'ץ' };

  for (const L of letters) {
    const at = `${L.id} (${L.letter}, ordem ${L.order})`;

    /* ── V5 — final forms ────────────────────────────────────────────── */
    const expected = EXPECTED_FINALS[L.letter] || null;
    if ((L.finalForm || null) !== expected) {
      fail('V5', at, `finalForm should be ${expected ? JSON.stringify(expected) : 'null'}, got ${JSON.stringify(L.finalForm)}`);
    }

    /* ── V6 — syllable table ─────────────────────────────────────────── */
    const WANT = ['a', 'e', 'i', 'o', 'u', 'sheva'];
    if (!Array.isArray(L.syllables) || L.syllables.length !== 6) {
      fail('V6', at, `expected 6 syllables, got ${L.syllables ? L.syllables.length : 0}`);
    } else {
      L.syllables.forEach((s, i) => {
        if (s.vowel !== WANT[i]) fail('V6', at, `syllable ${i} should be "${WANT[i]}", got "${s.vowel}"`);
        if (!stripNikud(s.he).includes(L.letter)) {
          fail('V6', at, `syllable "${s.he}" does not start from ${L.letter}`);
        }
      });
    }

    /* ── V7 — confusables are real letters ───────────────────────────── */
    (L.confusableWith || []).forEach(c => {
      if (!orderOf.has(c) && !FINAL_TO_BASE[c] && !/[א-ת]/.test(c)) {
        fail('V7', at, `confusableWith contains "${c}", which is not a Hebrew letter`);
      }
    });

    /* ── V1 — THE ORDER RULE ─────────────────────────────────────────── */
    (L.wordsToRead || []).forEach(w => {
      const used = consonantsOf(w.he);
      const unknown = used.filter(ch => {
        const o = orderOf.get(ch);
        return o === undefined || o > L.order;
      });
      if (unknown.length) {
        fail('V1', at,
          `wordsToRead "${w.he}" (${w.translit}) uses ${unknown.map(c => `"${c}"` +
            (orderOf.has(c) ? ` [ordem ${orderOf.get(c)}]` : ' [não ensinada]')).join(', ')} ` +
          `— depois da ordem ${L.order}`);
      }
    });

    /* ── V2 — pointing present ───────────────────────────────────────── */
    [...(L.wordsToRead || []), ...(L.wordsToRecognize || [])].forEach(w => {
      if (!hasNikud(w.he)) fail('V2', at, `"${w.he}" has no nikud`);
    });
    if (L.nameHe && !hasNikud(L.nameHe)) fail('V2', at, `nameHe "${L.nameHe}" has no nikud`);

    /* ── V12 — empty reading list (expected for letter 1) ────────────── */
    if (!L.wordsToRead || !L.wordsToRead.length) {
      warn('V12', at, 'wordsToRead is empty — the templates fall back to syllable-only practice');
    }

    /* ── V13 — Hebrew in prose must be marked {{…}} ──────────────────
       An unmarked Hebrew run in a prose field reaches the page with no
       direction span, which is exactly how the reference PDF ends up with
       "(מ Mem)" and reversed exercise lines. */
    const proseFields = [
      ['soundNotePt', L.soundNotePt],
      ['didYouKnow', L.didYouKnow],
      ['brazilianMistake.wrong', L.brazilianMistake && L.brazilianMistake.wrong],
      ['brazilianMistake.right', L.brazilianMistake && L.brazilianMistake.right],
      ['brazilianMistake.why', L.brazilianMistake && L.brazilianMistake.why]
    ];
    for (const [fname, val] of proseFields) {
      if (!val) continue;
      const bad = unmarkedHebrew(val);
      if (bad.length) {
        fail('V13', at, `${fname}: hebraico sem {{ }} — ${bad.slice(0, 3).map(b => JSON.stringify(b)).join(', ')}`);
      }
    }

    /* ── V17 — the letter has something to gap ─────────────────────────
       The "complete a palavra" exercises need words that CONTAIN the target
       letter. wordsToRead may legitimately hold a word that does not — אַתְּ
       belongs on the He page as the partner of אַתָּה and has no he — so the
       templates filter, and this warns when the filter leaves too little to
       build an exercise from. */
    {
      const gappable = [...(L.wordsToRead || []), ...(L.wordsToRecognize || [])]
        .filter(w => w.he.includes(L.letter) || (L.finalForm && w.he.includes(L.finalForm)));
      if (gappable.length < 2) {
        warn('V17', at, `só ${gappable.length} palavra(s) contendo a própria letra — os exercícios de completar ficam curtos`);
      }
    }

    /* ── V15 — bridge words actually contain their letter ──────────────
       The whole point of a bridge word is that the reader finds the new
       letter inside a word they already know. קרם carries its mem only as
       the final ם, so a check on the base letter alone is not enough — and
       without this rule the page silently printed a word with nothing
       highlighted in it. */
    (L.bridgeWords || []).forEach(w => {
      const hasBase = w.he.includes(L.letter);
      const hasFinal = !!L.finalForm && w.he.includes(L.finalForm);
      if (!hasBase && !hasFinal) {
        fail('V15', at, `bridgeWords "${w.he}" (${w.pt}) não contém ${JSON.stringify(L.letter)}`);
      }
    });

    /* ── V11 — stroke-order artwork ──────────────────────────────────── */
    const svg = join(ROOT, 'assets/stroke-order', `${L.id}.svg`);
    if (!existsSync(svg)) warn('V11', at, `no stroke-order SVG — the page shows "em breve"`);
    else if (readFileSync(svg, 'utf8').includes('data-placeholder="true"')) {
      warn('V11', at, `stroke-order SVG is still the placeholder`);
    }
  }

  /* ── V14 — every word with an image slot has an illustration ────────
     wordsToRecognize is what fills the picture slots, so an unmapped word
     leaves a hole on the page that nothing else would report. */
  let icons = null;
  try { icons = readJson('data/icons.json').words; } catch { /* not authored yet */ }
  if (icons) {
    for (const L of letters) {
      for (const w of L.wordsToRecognize || []) {
        const v = icons[w.he];
        if (v === undefined) {
          fail('V14', L.id, `"${w.he}" (${w.translit}) não tem ilustração em data/icons.json`);
        } else if (v && !v.startsWith('#') &&
                   !existsSync(join(ROOT, 'assets/icons', `${v}.svg`))) {
          fail('V14', L.id, `"${w.he}" aponta para o ícone "${v}", que não existe em assets/icons/`);
        }
      }
    }
  } else {
    warn('V14', 'data/icons.json', 'ausente — os slots de imagem ficam vazios');
  }

  /* ── V3 — one spelling per word, everywhere ────────────────────────
     Keyed on the POINTED string. Nikud is meaningful here: שָׁם (sham, "lá")
     and שֵׁם (shem, "nome") are different words that differ only by pointing,
     and must be allowed to transliterate differently. What must never differ
     is the same pointed word read two ways.

     Letter NAMES are excluded: L.namePt is a name ("Bet / Vet"), not a
     transliteration of L.nameHe, so it is not comparable to word data. */
  const seenTranslit = new Map();   // pointed hebrew -> { translit, where }
  const record = (he_, tr, where, isSyllable = false) => {
    if (!he_ || !tr) return;
    const key = clean(he_).normalize('NFC');
    const prev = seenTranslit.get(key);
    if (prev && prev.translit.toLowerCase() !== String(tr).toLowerCase()) {
      fail('V3', key,
        `transliterado como "${prev.translit}" em ${prev.where} e "${tr}" em ${where}`);
    } else if (!prev) {
      seenTranslit.set(key, { translit: tr, where, isSyllable });
    }
  };
  for (const L of letters) {
    const at = L.id;
    (L.syllables || []).forEach(s => record(s.he, s.translit, `${at}.syllables`, true));
    (L.wordsToRead || []).forEach(w => record(w.he, w.translit, `${at}.wordsToRead`));
    (L.wordsToRecognize || []).forEach(w => record(w.he, w.translit, `${at}.wordsToRecognize`));
  }
  Object.entries(translit.words || {}).forEach(([h, t]) => record(h, t, 'translit.json'));

  /* V3b — a word written with two DIFFERENT pointings is usually a typo in one
     of them. Not fatal (שָׁם/שֵׁם are a real pair), but worth surfacing. */
  const byConsonants = new Map();
  for (const [pointed, rec] of seenTranslit) {
    if (rec.isSyllable) continue;   // a consonant + each vowel is not a clash
    const bare = stripNikud(pointed);
    if (!byConsonants.has(bare)) byConsonants.set(bare, []);
    byConsonants.get(bare).push({ pointed, ...rec });
  }
  for (const [bare, group] of byConsonants) {
    if (group.length > 1) {
      warn('V3b', bare,
        `mesma consoante, pontuações diferentes: ${group.map(g => `${g.pointed} = ${g.translit}`).join(' · ')}`);
    }
  }

  /* ── V8 / V9 / V10 — checked on the built output ──────────────────── */
  if (checkDist) {
    const dist = join(ROOT, 'dist');
    if (existsSync(dist)) {
      for (const f of readdirSync(dist).filter(f => f.endsWith('.html'))) {
        const src = readFileSync(join(dist, f), 'utf8');
        checkBidi(src, f);

        /* V10 — a review unit may only show letters already taught. The
           content is derived from the letters in range so this should hold by
           construction; it is checked anyway, because "by construction" is
           exactly the kind of claim that stops being true after an edit. */
        const rm = /^r(\d+)-revisao-(\d+|final)\.html$/.exec(f);
        if (rm) {
          const upTo = rm[2] === 'final' ? 22 : Number(rm[2]);
          const allowed = new Set();
          letters.filter(l => l.order <= upTo).forEach(l => {
            allowed.add(l.letter);
            if (l.finalForm) allowed.add(l.finalForm);
          });
          const used = new Set();
          for (const m of src.matchAll(/<span class="he[^"]*"[^>]*>([\s\S]*?)<\/span>/g)) {
            for (const ch of m[1].replace(/<[^>]*>/g, '')) {
              if (/[\u05D0-\u05EA]/.test(ch)) used.add(ch);
            }
          }
          const over = [...used].filter(c => !allowed.has(c));
          if (over.length) {
            fail('V10', f,
              `mostra letras ainda não ensinadas na revisão até a ordem ${upTo}: ${over.map(c => JSON.stringify(c)).join(', ')}`);
          }
        }
      }
    }
  }

  return { fails: fails.slice(), warns: warns.slice() };
}

/* The bidi contract, checked against the built HTML.

   V8 — every Hebrew codepoint sits inside an element whose class list contains
        the bare token `he` (the leaf Hebrew holder). Containers like .he-list
        and .he-cloze do not count: their Hebrew lives in .he children.
   V9 — no bidi-neutral punctuation inside such a leaf span.

   Spans nest (.he-list > .he, .he > b.he-mark), so this walks the tag stream
   and matches closings by depth rather than regexing for the nearest </span>. */
function checkBidi(src, file) {
  const HEB = /[֐-׿יִ-ﭏ]/;
  const NEUTRAL = /[()\[\]{}:;/,<>«»|]/;

  /* Regions that hold no rendered body text. */
  const blanked = src
    .replace(/<!--[\s\S]*?-->/g, m => ' '.repeat(m.length))
    .replace(/<style[\s\S]*?<\/style>/g, m => ' '.repeat(m.length))
    .replace(/<script[\s\S]*?<\/script>/g, m => ' '.repeat(m.length));

  /* Every leaf `he` span, with depth-matched closing tags. */
  const tagRe = /<(\/?)span\b([^>]*)>/g;
  const stack = [];
  const leaves = [];
  let t;
  while ((t = tagRe.exec(blanked))) {
    if (t[1] !== '/') {
      const cm = /class="([^"]*)"/.exec(t[2]);
      const isLeaf = !!cm && cm[1].split(/\s+/).includes('he');
      stack.push({ isLeaf, start: t.index, innerStart: t.index + t[0].length });
    } else {
      const open = stack.pop();
      if (open && open.isLeaf) {
        leaves.push({ start: open.start, end: tagRe.lastIndex, innerStart: open.innerStart, innerEnd: t.index });
      }
    }
  }

  /* V9 — punctuation inside a leaf span (nested <b class="he-mark"> stripped). */
  for (const lf of leaves) {
    const inner = blanked.slice(lf.innerStart, lf.innerEnd).replace(/<[^>]*>/g, '');
    if (NEUTRAL.test(inner)) {
      fail('V9', file, `pontuacao dentro de um span .he: ${JSON.stringify(inner.slice(0, 40))}`);
    }
  }

  /* V8 — blank every leaf span; anything Hebrew still standing is a violation. */
  const arr = blanked.split('');
  for (const lf of leaves) for (let i = lf.start; i < lf.end; i++) arr[i] = ' ';
  let rest = arr.join('');

  /* <title> and <meta content> cannot carry a direction span at all, so Hebrew
     must simply not be put there. Reported with its own message. */
  const headRe = /<title>([\s\S]*?)<\/title>|<meta[^>]*content="([^"]*)"/g;
  let h;
  while ((h = headRe.exec(rest))) {
    const text = h[1] || h[2] || '';
    if (HEB.test(text)) {
      fail('V8', file, `Hebraico em <title>/<meta>, que nao aceita span de direcao: ${JSON.stringify(text.slice(0, 50))}`);
    }
  }
  rest = rest.replace(headRe, m => ' '.repeat(m.length));

  rest.split('\n').forEach((l, i) => {
    if (HEB.test(l)) {
      const found = l.match(/[֐-׿]+/g) || [];
      fail('V8', `${file}:${i + 1}`,
        `Hebraico fora de um span .he: ${found.slice(0, 3).map(s => JSON.stringify(s)).join(', ')}`);
    }
  });
}

export function report({ fails, warns }) {
  for (const w of warns) console.log(`  ! ${w.rule}  ${w.where} — ${w.detail}`);
  for (const f of fails) console.log(`  ✗ ${f.rule}  ${f.where} — ${f.detail}`);
  if (fails.length) console.log(`\n  ${fails.length} violação(ões), ${warns.length} aviso(s)`);
  else console.log(`  ✓ validate: 0 violações, ${warns.length} aviso(s)`);
  return fails.length === 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = validate({ checkDist: true });
  process.exit(report(r) ? 0 : 1);
}
