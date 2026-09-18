/* gen-audio.mjs — author's tool. Builds data/audio.json: every clip the
 * workbook needs, with a stable filename for each.
 *
 *   node tools/gen-audio.mjs
 *
 * FILENAMES ARE CONTENT-DERIVED, NOT POSITIONAL. The obvious design — number
 * the clips 001, 002, 003 in reading order — breaks the moment a word is added
 * to letter 3: everything after it shifts, and every file already recorded is
 * now misnamed. So the filename is a short hash of the pointed Hebrew itself.
 * Add a word, reorder a lesson, drop a letter: existing files keep working and
 * only the genuinely new clip is missing.
 *
 * THE SEQUENCE NUMBER IS ALSO STABLE, and for a harder reason: it is printed
 * in the workbook, beside each item, as the learner's way of finding the clip.
 * Paper cannot be re-numbered after the fact. So numbers already assigned are
 * read back from the previous data/audio.json and kept; only genuinely new
 * clips take the next free number. Reordering a lesson therefore leaves every
 * printed number correct — the recording script simply stops being in numeric
 * order, which costs the speaker nothing.
 *
 * Nikud is part of the hash on purpose: שָׁם and שֵׁם are different words that
 * differ only by pointing, and they must never share a recording.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = new URL('..', import.meta.url).pathname;
const readJson = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

/* Stable, short, collision-safe enough for a few hundred clips. */
const fileFor = he => 'he-' + createHash('sha256').update(he.normalize('NFC')).digest('hex').slice(0, 8) + '.mp3';

function main() {
  const letters = readJson('data/letters.json').sort((a, b) => a.order - b.order);
  const nikud = readJson('data/nikud.json');

  const seen = new Map();
  const add = (he, translit, gloss, kind, lesson) => {
    const key = String(he || '').normalize('NFC');
    if (!key || seen.has(key)) return;
    seen.set(key, { he: key, translit: translit || null, gloss, kind, lesson, file: fileFor(key) });
  };

  /* Recording order follows the book: a speaker works through it once, in the
     order a learner meets it, which keeps the register consistent. */
  for (const L of letters) {
    add(L.nameHe, L.namePt, `nome da letra ${L.namePt}`, 'nome', L.order);
    for (const s of L.syllables) add(s.he, s.translit, 'sílaba', 'silaba', L.order);
    for (const w of L.wordsToRead) add(w.he, w.translit, w.pt, 'palavra', L.order);
    for (const w of L.wordsToRecognize) add(w.he, w.translit, w.pt, 'palavra', L.order);
  }
  for (const s of nikud.sounds) {
    for (const g of s.signs) add(g.demo, null, `sinal ${g.namePt}`, 'silaba', 0);
  }

  /* Keep every number already handed out; only new clips take new ones. */
  let previous = {};
  try {
    for (const c of readJson('data/audio.json').clips) previous[c.he.normalize('NFC')] = c.num;
  } catch { /* first run */ }

  let next = Math.max(0, ...Object.values(previous)) + 1;
  const clips = [...seen.values()].map(c => ({
    num: previous[c.he] ?? next++,
    ...c
  }));
  const reused = clips.filter(c => previous[c.he] !== undefined).length;

  const dupes = new Map();
  for (const c of clips) {
    if (dupes.has(c.file)) {
      console.error(`  ! colisão de hash: ${c.he} e ${dupes.get(c.file)} → ${c.file}`);
      process.exitCode = 1;
    }
    dupes.set(c.file, c.he);
  }

  writeFileSync(join(ROOT, 'data/audio.json'), JSON.stringify({
    note: [
      'GERADO por tools/gen-audio.mjs — não edite à mão.',
      'O nome do arquivo vem de um hash do hebraico pontuado, não da posição:',
      'acrescentar uma palavra não renomeia nada do que já foi gravado.',
      'O número é impresso no livro ao lado de cada item, então também é estável:',
      'números já atribuídos são preservados e só clipes novos recebem números novos.',
      'Coloque os arquivos em assets/audio/ e rode `npm run check-audio`.'
    ],
    generatedAt: new Date().toISOString().slice(0, 10),
    total: clips.length,
    clips
  }, null, 2) + '\n');

  const by = k => clips.filter(c => c.kind === k).length;
  const orphans = Object.keys(previous).filter(h => !seen.has(h));
  console.log(`  ${clips.length} clipes → data/audio.json`);
  console.log(`    ${by('nome')} nomes de letra · ${by('silaba')} sílabas · ${by('palavra')} palavras`);
  if (reused) console.log(`    ${reused} número(s) preservado(s), ${clips.length - reused} novo(s)`);
  if (orphans.length) {
    console.log(`    ! ${orphans.length} clipe(s) não são mais usados — os arquivos podem ser arquivados:`);
    orphans.slice(0, 8).forEach(h => console.log(`      ${h} (${fileFor(h)})`));
  }
}

main();
