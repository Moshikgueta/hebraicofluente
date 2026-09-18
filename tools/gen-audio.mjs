/* gen-audio.mjs — builds data/audio.json: every clip the course needs, with a
 * stable filename and a stable printed number for each.
 *
 *   npm run audio-manifest
 *
 * FILENAMES ARE CONTENT-DERIVED, NOT POSITIONAL. The obvious design — number
 * the clips 001, 002, 003 in reading order — breaks the moment a word is added
 * to letter 3: everything after it shifts and every file already recorded is
 * misnamed. So the filename is a short hash of the pointed Hebrew itself. Add a
 * word, reorder a lesson, drop a letter: the existing recordings keep working
 * and only the genuinely new clip is missing.
 *
 * THE SEQUENCE NUMBER IS ALSO STABLE, for a harder reason: it is printed on the
 * recording script, and a speaker halfway through a session cannot be
 * renumbered. Numbers already handed out are read back from the previous
 * data/audio.json and kept; only new clips take the next free number. Reordering
 * a lesson therefore leaves every printed number correct — the script simply
 * stops being in numeric order, which costs the speaker nothing.
 *
 * NIKUD IS PART OF THE HASH on purpose: שָׁם and שֵׁם are different words that
 * differ only by pointing, and must never share a recording.
 *
 * ONE CLIP PER SOUND, NOT PER APPEARANCE. The same word in three places gets
 * one clip, because the hash is the same. The unpointed reading list in module
 * 6 is deliberately mapped onto its pointed twin — ספר and סֵפֶר are the same
 * word said the same way, and asking a speaker to read it twice wastes studio
 * time and invites two different takes of one word.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = new URL('..', import.meta.url).pathname;
const readJson = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const NFC = s => String(s ?? '').normalize('NFC');

export const audioIdFor = he =>
  'he-' + createHash('sha256').update(NFC(he)).digest('hex').slice(0, 8);

/* ── waves ──────────────────────────────────────────────────────────────
   A speaker does not record 300 clips in one sitting, and the course does not
   need them all at once. The waves are ordered by what unblocks the most:
   wave 1 alone makes every lesson's "ouvir a letra" and syllable table work,
   which is the audio the course actually promises. */
export const WAVES = {
  1: { id: 1, titlePt: 'O essencial', notePt: 'Nomes das letras, sílabas e os sinais de vogal. Só com esta onda, toda lição já tem áudio no que importa: o som da letra.' },
  2: { id: 2, titlePt: 'As palavras de leitura', notePt: 'Todo o vocabulário que o aluno lê sozinho, na ordem do curso.' },
  3: { id: 3, titlePt: 'Reconhecimento e os módulos finais', notePt: 'Vocabulário de reconhecimento, os módulos 6 e 7, e as cenas de «no mundo real».' }
};

function main() {
  const letters = readJson('data/letters.json').sort((a, b) => a.order - b.order);
  const nikud = readJson('data/nikud.json');
  const extras = readJson('data/extras.json');
  const realWorld = readJson('data/real-world.json');

  const seen = new Map();
  /** @param {{he:string, translit?:string|null, gloss:string, kind:string, wave:number, where:string}} c */
  const add = c => {
    const key = NFC(c.he);
    if (!key) return;
    const prev = seen.get(key);
    if (prev) {
      /* Same sound, second home. Keep the earliest wave — a clip needed by
         wave 1 must not be scheduled for wave 3 because it also appears
         there — and record both places for the script's "onde aparece". */
      prev.wave = Math.min(prev.wave, c.wave);
      if (!prev.where.includes(c.where)) prev.where.push(c.where);
      return;
    }
    seen.set(key, {
      /* Insertion index. The clip NUMBER is stable across edits and therefore
         stops matching the course order; this is what the recording script is
         actually sorted by, so a speaker works letter by letter instead of
         jumping between lesson 10 and lesson 2 because those clips happen to
         be numbered adjacently. */
      seq: seen.size,
      he: key,
      translit: c.translit ?? null,
      gloss: c.gloss,
      kind: c.kind,
      wave: c.wave,
      where: [c.where],
      file: audioIdFor(key) + '.mp3'
    });
  };

  /* ── wave 1 · the sounds the course is about ───────────────────────── */
  for (const L of letters) {
    add({ he: L.nameHe, translit: L.namePt, gloss: `nome da letra ${L.namePt}`,
          kind: 'nome', wave: 1, where: `letra ${L.order}` });
    for (const s of L.syllables) {
      add({ he: s.he, translit: s.translit, gloss: `sílaba — ${s.ptApprox}`,
            kind: 'silaba', wave: 1, where: `letra ${L.order}` });
    }
  }
  for (const s of nikud.sounds) {
    for (const g of s.signs) {
      add({ he: g.demo, translit: null, gloss: `sinal ${g.namePt} — som ${s.sound}`,
            kind: 'silaba', wave: 1, where: 'sinais de vogal' });
    }
  }

  /* ── wave 2 · what the learner reads ───────────────────────────────── */
  for (const L of letters) {
    for (const w of L.wordsToRead) {
      add({ he: w.he, translit: w.translit, gloss: w.pt,
            kind: 'palavra', wave: 2, where: `letra ${L.order}` });
    }
  }

  /* ── wave 3 · recognition, modules 6 and 7, the real-world scenes ──── */
  for (const L of letters) {
    for (const w of L.wordsToRecognize) {
      add({ he: w.he, translit: w.translit, gloss: w.pt,
            kind: 'palavra', wave: 3, where: `letra ${L.order}` });
    }
  }
  for (const D of extras.dagesh.letters) {
    for (const w of [...D.hardWords, ...D.softWords]) {
      add({ he: w.he, translit: w.translit, gloss: w.pt,
            kind: 'palavra', wave: 3, where: 'módulo 6' });
    }
  }
  for (const F of extras.finals) {
    add({ he: F.word, translit: F.translit, gloss: F.pt,
          kind: 'palavra', wave: 3, where: 'módulo 6' });
  }
  /* The unpointed list is the pointed list, said the same way. Mapping rather
     than adding is what keeps the speaker from reading ספר twice. */
  for (const u of extras.unpointed.words) {
    add({ he: u.pointed, translit: u.translit, gloss: u.pt,
          kind: 'palavra', wave: 3, where: 'módulo 6' });
  }
  for (const g of extras.gerech.letters) {
    add({ he: g.he, translit: g.pt, gloss: `a letra ${g.base} com gerech — som ${g.pt}`,
          kind: 'nome', wave: 3, where: 'módulo 7' });
    for (const w of g.words) {
      add({ he: w.he, translit: null, gloss: w.pt,
            kind: 'palavra', wave: 3, where: 'módulo 7' });
    }
  }
  for (const s of realWorld.scenes) {
    add({ he: s.he, translit: s.translit, gloss: s.pt,
          kind: 'palavra', wave: 3, where: 'no mundo real' });
  }

  /* ── stable numbering ───────────────────────────────────────────────── */
  let previous = {};
  try {
    for (const c of readJson('data/audio.json').clips) previous[NFC(c.he)] = c.num;
  } catch { /* first run */ }

  let next = Math.max(0, ...Object.values(previous)) + 1;
  const clips = [...seen.values()]
    .map(c => ({ num: previous[c.he] ?? next++, ...c }))
    .sort((a, b) => a.wave - b.wave || a.seq - b.seq);

  const reused = clips.filter(c => previous[c.he] !== undefined).length;

  /* A hash collision would silently give two words one recording. At this size
     it will not happen; if it ever does, the build must stop rather than teach
     one word with another word's sound. */
  const byFile = new Map();
  for (const c of clips) {
    if (byFile.has(c.file)) {
      console.error(`  ! colisão de hash: ${c.he} e ${byFile.get(c.file)} → ${c.file}`);
      process.exitCode = 1;
    }
    byFile.set(c.file, c.he);
  }

  const orphans = Object.keys(previous).filter(h => !seen.has(h));

  writeFileSync(join(ROOT, 'data/audio.json'), JSON.stringify({
    note: [
      'GERADO por tools/gen-audio.mjs — nao edite a mao.',
      'O nome do arquivo vem de um hash do hebraico pontuado, nao da posicao:',
      'acrescentar uma palavra nao renomeia nada do que ja foi gravado.',
      'O numero e impresso no roteiro de gravacao, entao tambem e estavel:',
      'numeros ja atribuidos sao preservados e so clipes novos recebem numeros novos.',
      'Coloque os arquivos em audio/ e rode `npm run check-audio`.'
    ],
    generatedAt: new Date().toISOString().slice(0, 10),
    total: clips.length,
    waves: Object.values(WAVES).map(w => ({
      ...w, count: clips.filter(c => c.wave === w.id).length
    })),
    clips
  }, null, 2) + '\n');

  const by = k => clips.filter(c => c.kind === k).length;
  console.log(`\n  ${clips.length} clipes → data/audio.json`);
  console.log(`    ${by('nome')} nomes · ${by('silaba')} sílabas · ${by('palavra')} palavras`);
  for (const w of Object.values(WAVES)) {
    console.log(`    onda ${w.id} — ${w.titlePt}: ${clips.filter(c => c.wave === w.id).length}`);
  }
  if (reused) console.log(`    ${reused} número(s) preservado(s), ${clips.length - reused} novo(s)`);
  if (orphans.length) {
    console.log(`    ! ${orphans.length} clipe(s) não são mais usados — os arquivos podem ser arquivados`);
  }
  console.log('');
}

main();
