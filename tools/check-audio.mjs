/* check-audio.mjs — what arrived, what is missing, and what does not belong.
 *
 *   npm run check-audio
 *
 * This is the whole ingestion pipeline. A speaker drops files into audio/ and
 * runs this; it reports coverage wave by wave and names the gaps. Nothing else
 * has to be edited — `npm run export-content` copies whatever is there into the
 * app, and the app plays the clips that exist and shows "áudio em breve" for
 * the rest.
 *
 * It reports three kinds of problem, and the third is the one that matters most
 * after a session:
 *
 *   MISSING   a clip the course needs and no file provides;
 *   ORPHAN    a file whose clip no longer exists in the course — safe to
 *             archive, and expected after vocabulary changes;
 *   UNKNOWN   a file whose name matches no clip at all. Almost always a
 *             mistyped filename, which means a take exists but is invisible —
 *             the failure mode that costs a re-session if it goes unnoticed.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DROP = join(ROOT, 'audio');
const readJson = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

/* An MP3 shorter than this is almost certainly a mis-click or a truncated
   export, not a word. Cheap check, and it catches a bad session early. */
const MIN_BYTES = 2_000;

function main() {
  const audio = readJson('data/audio.json');
  const byFile = new Map(audio.clips.map(c => [c.file, c]));

  const present = existsSync(DROP)
    ? readdirSync(DROP).filter(f => /\.(mp3|m4a|ogg|wav)$/i.test(f))
    : [];

  const mp3 = new Set(present.filter(f => f.endsWith('.mp3')));
  const nonMp3 = present.filter(f => !f.endsWith('.mp3'));

  const missing = audio.clips.filter(c => !mp3.has(c.file));
  const unknown = [...mp3].filter(f => !byFile.has(f));
  const tiny = [...mp3].filter(f => {
    try { return statSync(join(DROP, f)).size < MIN_BYTES; } catch { return false; }
  });

  const have = audio.clips.length - missing.length;
  const pct = audio.clips.length ? Math.round((have / audio.clips.length) * 100) : 0;

  console.log(`\n  ${have} de ${audio.clips.length} clipes gravados — ${pct}%\n`);

  for (const w of audio.waves) {
    const inWave = audio.clips.filter(c => c.wave === w.id);
    const got = inWave.filter(c => mp3.has(c.file)).length;
    const bar = '█'.repeat(Math.round((got / Math.max(1, inWave.length)) * 24))
              .padEnd(24, '·');
    console.log(`    onda ${w.id}  ${bar}  ${got}/${inWave.length}  ${w.titlePt}`);
  }
  console.log('');

  if (nonMp3.length) {
    console.log(`  ! ${nonMp3.length} arquivo(s) não são .mp3 — converta antes de usar:`);
    nonMp3.slice(0, 6).forEach(f => console.log(`      ${f}`));
    if (nonMp3.length > 6) console.log(`      … e mais ${nonMp3.length - 6}`);
    console.log('');
  }

  if (tiny.length) {
    console.log(`  ✗ ${tiny.length} arquivo(s) com menos de ${MIN_BYTES} bytes — provavelmente truncados:`);
    tiny.forEach(f => console.log(`      ${f}  (${byFile.get(f)?.he ?? '?'})`));
    console.log('');
    process.exitCode = 1;
  }

  if (unknown.length) {
    console.log(`  ✗ ${unknown.length} arquivo(s) com nome que não corresponde a clipe nenhum.`);
    console.log(`    Quase sempre é nome digitado errado — a tomada existe e está invisível:`);
    unknown.forEach(f => console.log(`      ${f}`));
    console.log('');
    process.exitCode = 1;
  }

  if (missing.length) {
    const firstWave = Math.min(...missing.map(c => c.wave));
    const next = missing.filter(c => c.wave === firstWave);
    console.log(`  faltam ${missing.length} clipe(s). Os próximos ${Math.min(10, next.length)} da onda ${firstWave}:`);
    next.slice(0, 10).forEach(c =>
      console.log(`      ${String(c.num).padStart(3)}  ${c.he}   ${c.translit ?? ''}  → ${c.file}`));
    if (next.length > 10) console.log(`      … e mais ${next.length - 10} nessa onda`);
    console.log('');
  }

  if (!missing.length && !unknown.length && !tiny.length) {
    console.log('  ✓ áudio completo — rode `npm run export-content` e o app passa a tocar tudo\n');
  } else if (have > 0) {
    console.log('  rode `npm run export-content` para levar o que já existe para o app\n');
  }
}

main();
