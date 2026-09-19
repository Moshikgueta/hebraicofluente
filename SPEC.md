# Hebraico Fluente - Alfabetização workbook generator
## SPEC (STEP 1) - for approval

> **Blocked item:** the reference PDF (letter Mem, 5 pages) never arrived in this
> environment. `/mnt/attach` is empty and the only PDFs on disk are the Spanish project's
> own chapter designs. Everything below that does **not** depend on seeing the PDF is
> specified in full. §2 (design tokens) is deliberately left unfilled rather than invented -
> the brief says "Match the PDF, do not invent a new look", so I have not.
> Please re-attach `mem.pdf` (or paste it anywhere under `/home/user/`).

---

## 1. Architecture

```
hebraico-fluente/
├── data/
│   ├── letters.json          22 letter objects, authored
│   ├── translit.json         single source of truth for every transliteration
│   ├── nikud.json            the 6 vowel signs (Página 0 + appendix)
│   └── reviews.json          the 6 review units' composition rules
├── templates/
│   ├── letter/               p1.js … p5.js  - one per stage
│   ├── page-0.js             Os sinais de vogal
│   ├── review.js             parameterised by letter range
│   ├── appendix.js
│   ├── index.js
│   └── partials/             callout, badge, syllable-table, tracing-row, word-card…
├── styles/
│   ├── tokens.css            ← §2, from the PDF
│   ├── print.css             A4 page geometry, break hygiene
│   └── components.css
├── assets/
│   ├── fonts/                self-hosted, licence files alongside
│   └── stroke-order/         mem.svg … tsadi.svg (22 placeholders)
├── scripts/
│   ├── build.js              data + templates → dist/
│   ├── validate.js           fails the build (see §5)
│   └── lib/
│       ├── hebrew.js         normalise, strip-nikud, order-of-letter, final-form map
│       └── render.js         `he()` - the ONLY way Hebrew reaches the page
├── dist/                     generated, gitignored
├── README.md   PLAN.md   SPEC.md
```

**Templates are plain JS template functions returning strings.** No framework, no runtime
compiler, no client-side JS in the output at all - these are printable pages. `npm run
build` is `node scripts/build.js`, which runs `validate.js` first and exits non-zero on any
violation.

**The one rule that keeps this a generator:** no template may reference a specific letter.
Every template takes `(letter, ctx)` where `ctx` carries the alphabet learned so far, the
transliteration table, and the design tokens. A change to `templates/letter/p3.js` must
change all 22 outputs.

---

## 2. Design tokens - BLOCKED, awaiting the PDF

`styles/tokens.css` will be a flat `:root` block extracted from the reference, covering at
minimum the items the brief names:

| Token group | What I need from the PDF |
|---|---|
| `--c-teal-*` | the table header fill, its text colour, and the rule beneath it |
| `--c-green-*` | the callout background, border and heading colour |
| `--c-badge-*` | badge fill / text / radius / the stage-number treatment |
| `--c-ink`, `--c-ink-muted`, `--c-paper`, `--c-rule` | body text, secondary text, page, hairlines |
| `--type-*` | the full scale: page title, stage heading, body, Hebrew display, Hebrew inline, caption, table |
| `--space-*` | the spacing ramp actually used |
| `--radius-*`, `--border-*` | box treatments |

I will extract these by measurement from the PDF, not by eye, and list each token with the
page and element it came from so you can check the derivation.

Until it arrives the build will use a clearly-marked `tokens.placeholder.css` so the
generator can be developed and tested; **no placeholder values will survive into a page you
are asked to compare against the reference.**

---

## 3. `data/letters.json` schema

One object per letter. Types are strict; `validate.js` enforces them.

```jsonc
{
  "id": "mem",                    // string, ^[a-z]+$, unique, used for filenames + SVG lookup
  "order": 1,                     // integer 1..22, unique, defines what is "learned so far"
  "letter": "מ",                  // string, exactly one Hebrew consonant, U+05D0..U+05EA
  "finalForm": "ם",               // string (one char) or null
  "nameHe": "מֵם",                // Hebrew letter name, WITH nikud
  "namePt": "Mem",                // how the name is written in Portuguese prose
  "translit": "m",                // the letter's key into translit.json
  "sound": "/m/",                 // IPA, for the appendix and for precision
  "soundNotePt": "Como o M de 'mãe'. Idêntico ao português.",
  "confusableWith": ["ס", "ם"],   // array of Hebrew chars; drives the P4 discrimination drill
  "syllables": [                  // exactly 6, in this order: a e i o u sheva
    { "he": "מַ", "translit": "ma", "ptApprox": "má", "vowel": "a" },
    …
    { "he": "מְ", "translit": "me", "ptApprox": "(mudo/breve)", "vowel": "sheva" }
  ],
  "wordsToRecognize": [           // whole-word recognition; MAY contain unlearned letters
    { "he": "מַיִם", "translit": "máyim", "pt": "água", "note": null }
  ],
  "wordsToRead": [                // MUST contain only letters of order <= this.order
    { "he": "שֵׁם", "translit": "shem", "pt": "nome" }
  ],
  "didYouKnow": "…",              // pt-BR, 1-3 sentences, "Você sabia?" box
  "brazilianMistake": {           // "Cuidado" box
    "wrong": "…",                 // what a pt-BR speaker typically does
    "right": "…",                 // the correction
    "why": "…"                    // one sentence
  },
  "audioIds": [],                 // reserved; empty for now
  "biblicalWord": null            // reserved for the Christian-audience edition
}
```

### Letter order and final forms (as specified)

| # | Letter | id | Final | # | Letter | id | Final |
|---|---|---|---|---|---|---|---|
| 1 | מ | mem | **ם** | 12 | ק | qof | - |
| 2 | ש | shin | - | 13 | ד | dalet | - |
| 3 | ל | lamed | - | 14 | ח | het | - |
| 4 | ב | bet | - | 15 | ס | samekh | - |
| 5 | ת | tav | - | 16 | פ | pe | **ף** |
| 6 | י | yod | - | 17 | ג | gimel | - |
| 7 | ה | he | - | 18 | ע | ayin | - |
| 8 | ו | vav | - | 19 | כ | kaf | **ך** |
| 9 | ר | resh | - | 20 | ז | zayin | - |
| 10 | א | alef | - | 21 | ט | tet | - |
| 11 | נ | nun | **ן** | 22 | צ | tsadi | **ץ** |

Five letters carry a final form → five dedicated final-form recognition exercises (brief
§3.4), at orders 1, 11, 16, 19, 22.

### A consequence of the order that the schema must accommodate

I traced the `wordsToRead` constraint forward against this exact sequence:

- **Letter 1 (מ): no readable word exists.** With only מ/ם there is no Hebrew word.
  `wordsToRead` **must** be allowed to be `[]`, and P2/P3/P5 must degrade to
  syllable-level reading and writing. This is a template requirement, not an authoring gap.
- Letter 2 (ש) → **שָׁם** ("lá"). First real word.
- Letter 3 (ל) → **שֶׁל** ("de"), **מָשָׁל** ("parábola").
- Letter 4 (ב) → **לֵב** ("coração"), **בֹּשֶׂם** ("perfume") - and **review unit 1** lands here.
- Letter 5 (ת) → **שַׁבָּת**. Letter 6 (י) → **בַּיִת** ("casa"), **יָם** ("mar").
- Letter 7 (ה) → **מַה**. Letter 8 (ו) → **שָׁלוֹם**, exactly at **review unit 2**.

The order you gave is well constructed - high-frequency words unlock early and שלום lands
on a review boundary. I am not proposing changes. I am flagging that **letter 1 is
structurally special** and the template must handle an empty `wordsToRead` without breaking.

---

## 4. `data/translit.json` - single source of truth (brief §3.6)

Two layers, because a per-word table alone will drift:

```jsonc
{
  "system": "pt-BR-practical-v1",
  "consonants": { "מ": "m", "שׁ": "sh", "שׂ": "s", "ב": "v", "בּ": "b", … },
  "vowels":     { "ַ": "a", "ֵ": "e", "ִ": "i", "ֹ": "o", "ֻ": "u", "ְ": "" , … },
  "rules":      [ … ordered rewrite rules: dagesh, shva na/nach, final-he, matres … ],
  "words": {                       // the authoritative override table
    "שָׁלוֹם": "shalom",
    "בַּיִת":  "báyit"
  }
}
```

`lib/hebrew.js` exposes `translit(he)` which consults `words` first, then generates from
`consonants`/`vowels`/`rules`. **`validate.js` fails the build if any Hebrew string appears
anywhere in the corpus with two different transliterations**, and reports both sites. No
transliteration is ever typed into `letters.json` free-hand except as a `words` entry.

Decision needed from you: accent marks. Portuguese readers read stress from accents, so
`báyit`/`shalóm` is more useful than `bayit`/`shalom`, but it is less conventional. My
recommendation: **mark stress with a Portuguese acute only when the stress is not final**,
since Hebrew default stress is final (milra) - so `shalom`, `máyim`, `bóker`. Say the word
and I will fix the rule before any content is generated.

---

## 5. `scripts/validate.js` - the build gate

Ordered, all run, all failures reported together, exit 1 on any.

| # | Rule | Severity |
|---|---|---|
| **V1** | **Every word in `wordsToRead` contains only letters with `order <= letter.order`** (final forms count as their base letter's order; nikud, maqaf and geresh ignored). *The single most important check.* | **fail** |
| V2 | Every word in `wordsToRead` **and** `wordsToRecognize` carries nikud on every consonant that needs one | fail |
| V3 | No Hebrew string has two different transliterations anywhere in the corpus (§4) | fail |
| V4 | `order` values are exactly 1..22, no gaps, no duplicates; `id` unique; `letter` unique | fail |
| V5 | `finalForm` is non-null exactly for מ נ כ פ צ and matches the correct codepoint | fail |
| V6 | `syllables` has exactly 6 entries, vowels `a e i o u sheva` in that order, each `he` starts with this letter | fail |
| V7 | Every `confusableWith` entry is a real Hebrew letter or final form | fail |
| V8 | No Hebrew appears in output outside a `he()` call - checked by scanning `dist/*.html` for Hebrew codepoints not inside `<span class="he"` (§6) | fail |
| V9 | No Hebrew-adjacent `( ) : / , .` inside a `.he` span (brief §3.1) | fail |
| V10 | Review unit N's content draws only from letters of `order <= 4N` | fail |
| V11 | Stroke-order SVG missing for a letter | **warn** - build continues, page shows "em breve" (brief §4) |
| V12 | `wordsToRead` empty | **warn** - expected for letter 1, template degrades |

`npm run build` reports: `✓ 30 modules, 0 violations, 2 warnings` or the full failure list.

---

## 6. The bidi contract (brief §3.1)

**One function, `he(text, opts)` in `lib/render.js`, is the only way a Hebrew codepoint may
reach the output.** It returns:

```html
<span class="he" lang="he">שָׁלוֹם</span>
```

```css
.he {
  direction: rtl;
  unicode-bidi: isolate;
  font-family: var(--font-he);
}
```

Enforced rules, all machine-checked (V8, V9):

1. **Punctuation never enters the span.** `he("מ") + ") Mem"` is forbidden; the template
   emits `<span class="he">מ</span>` then `) Mem` outside it. The PDF's `מ) Mem)` artefact
   is exactly what `unicode-bidi: isolate` plus this rule eliminates.
2. **No nesting.** A `.he` span never contains another `.he` span, and never contains
   Latin text. Mixed sentences are built by concatenating alternating isolated runs.
3. **Lists and tables of Hebrew** get `dir="rtl"` on the row/cell, not on the page, so the
   surrounding pt-BR layout stays LTR.
4. **Never rely on the browser guessing.** No content is emitted without an explicit
   direction decision made by the generator.
5. `U+200E/U+200F/U+061C` are stripped from all input data at load - invisible marks pasted
   from a word processor are a classic source of irreproducible bidi bugs.

The brief's §3.3 wording correction is a content constant, not per-page:
> *"O hebraico tem 22 letras. Todas são consoantes - mas quatro delas (א ה ו י) também
> funcionam como apoio de vogal."*

---

## 7. Writing practice without hand-drawn assets (brief §4)

Three states generated in CSS from **the same character**, no images:

```css
.trace-model  { color: var(--c-ink); }
.trace-dashed { color: transparent;
                -webkit-text-stroke: 1.5px var(--c-rule);
                /* dashed effect via a repeating-linear-gradient mask */ }
.trace-ghost  { color: var(--c-ink); opacity: .14; }
```

**Print caveat I will verify before STEP 4 is called done:** `-webkit-text-stroke` and
`mask-image` are not guaranteed in print in every engine. The build will render the tracing
row at A4 through headless Chromium and assert visible stroke output; if it fails I will
fall back to a generated per-letter outline SVG (extracted from the font with `fontTools`,
which is already available here) - same data, no hand drawing.

**Stroke order:** `assets/stroke-order/<id>.svg`, 22 empty placeholders with a documented
viewBox and numbering convention so you can draw them later without touching templates. The
build must not break when one is missing - it shows the model letter and an "em breve" note
(V11 warns).

### Fonts - verified, not assumed

I inspected the actual binaries with `fontTools` rather than trusting descriptions:

| Font | Source | Licence | Hebrew block | **Nikud** (U+0591-05C7) | Finals | GPOS | GSUB |
|---|---|---|---|---|---|---|---|
| **Frank Ruhl Libre** | `@fontsource/frank-ruhl-libre` | OFL-1.1 | 53 | **21 ✓** | 5/5 | `kern` **`mark` `mkmk`** | **`ccmp` ✓** |
| Assistant | `@fontsource/assistant` | OFL-1.1 | 49 | 20 ✓ | 5/5 | `kern` `mark` `mkmk` | *(none)* |
| **Gveret Levin AlefAlefAlef** *(handwriting)* | `@fontsource/gveret-levin` | **OFL-1.1** | 53 | **21 ✓** | **5/5** | `kern` **`mark`** | `calt` only |

Conclusions:

- **`--font-he` (print/body, pointed text) = Frank Ruhl Libre.** It is the only candidate
  with `ccmp`, which is what composes shin + shin-dot + dagesh (שּׁ) and hataf vowels
  correctly. Assistant lacks `ccmp` and must never carry nikud.
- **`--font-he-cursive` = Gveret Levin AlefAlefAlef**, OFL-1.1, self-hostable from npm,
  with the full nikud repertoire and all five finals - which is rare and is why I checked.
  **Two caveats you should decide on:** it has `mark` but **no `mkmk`**, so two stacked
  marks (dagesh + shin-dot) may collide slightly; and I cannot render it here, so **whether
  its hand matches Israeli school cursive (כתב מחובר) is a judgement only your eye can
  make.** I will produce a one-page font proof as the first artefact of STEP 4 - all 22
  letters, 5 finals, and the worst-case nikud stacks at 14px/48px/96px - for you to approve
  or reject before anything is generated with it.
- Alternatives if you reject it: the **Culmus** faces (Ellinia CLM / Caladings CLM, GPL
  with font exception - needs manual sourcing, this environment's egress blocks
  fonts.google.com but npm is reachable), or a commercial cursive you license and drop in.
- **Nikud clips at tight leading.** Points descend below the baseline; any box holding
  pointed Hebrew gets `line-height: 1.65` minimum and never `overflow: hidden`. The test
  strings are `בְּרֵאשִׁית`, `שָׁלוֹם`, plus `אֳ` (hataf-qamats) and `שּׁ` as worst cases.

---

## 8. Output inventory

| Module | Files | Print pages |
|---|---|---|
| Página 0 - Os sinais de vogal (brief §3.2, by **sound** not name) | 1 | 1-2 |
| 22 letter modules × 5 stages (P1 conhecer/sílabas · P2 palavras+leitura · P3 escrever 3A/3B/3C · P4 praticando 4 atividades · P5 fixação+ditado) | 22 | 110 |
| Review units after letters 4, 8, 12, 16, 20 - cumulative, all letters so far | 5 | 10-15 |
| Final cumulative review (all 22) | 1 | 3-4 |
| Appendix - alphabet table · **nikud names** · transliteration key · cursive chart | 1 | 4-6 |
| `dist/index.html` | 1 | - |
| **Total** | **31 HTML files** | **≈ 130 A4 pages** |

Print CSS: A4 portrait, `@page { size: A4; margin: 0 }` with the visual margin on the
sheet's own padding (so Chrome draws no header/footer), `break-inside: avoid` on exercise
blocks, tracing rows and callouts, `orphans/widows: 3`.

---

## 9. Tone and language (brief)

All chrome, instructions and explanations in **Brazilian Portuguese**; all target content in
**Hebrew with nikud**. Adult, practical, encouraging. Explanations short and tied to
immediate use. No childish framing, no academic register, no "vamos aprender juntinhos".

---

## 10. What I need from you before STEP 2

1. **The Mem PDF.** Blocks §2 entirely, and I will not generate a page for side-by-side
   comparison without it.
2. **Transliteration stress rule** (§4) - acute accents on non-final stress, or none?
3. **Cursive font** (§7) - proceed on Gveret Levin subject to your approval of a font proof,
   or do you have a licensed cursive you want used?

Once the PDF lands I will deliver `styles/tokens.css` with each token's derivation, then
stop again for your approval before writing any letter data - as the brief requires.
