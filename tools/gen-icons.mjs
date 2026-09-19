/* gen-icons.mjs - author's tool. Vendors the icons data/icons.json actually
 * uses into assets/icons/, and nothing else.
 *
 *   npm i -D lucide-static && node tools/gen-icons.mjs
 *
 * Only the used icons are copied: the full set is 2112 files, the workbook
 * needs about 60, and a repo should carry what it ships rather than a library
 * it mostly ignores. The licence travels with them.
 *
 * width/height are stripped so the size is decided by CSS at the point of use -
 * the same icon appears at 34px in a table cell and 56px in the word gallery.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/icons');

const SRC = ['node_modules/lucide-static/icons', '/tmp/iconprobe/node_modules/lucide-static/icons']
  .map(p => (p.startsWith('/') ? p : join(ROOT, p)))
  .find(p => existsSync(p));

if (!SRC) {
  console.error('lucide-static não encontrado: npm i -D lucide-static');
  process.exit(1);
}

const icons = JSON.parse(readFileSync(join(ROOT, 'data/icons.json'), 'utf8'));
const names = [...new Set(Object.values(icons.words).filter(v => v && !v.startsWith('#')))];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let n = 0;
for (const name of names) {
  const f = join(SRC, `${name}.svg`);
  if (!existsSync(f)) { console.error(`  ! ícone inexistente: ${name}`); continue; }
  const svg = readFileSync(f, 'utf8')
    .replace(/\s(width|height)="[^"]*"/g, '')
    .replace('<svg ', '<svg class="icon" aria-hidden="true" focusable="false" ')
    .trim();
  writeFileSync(join(OUT, `${name}.svg`), svg + '\n');
  n++;
}

const lic = ['node_modules/lucide-static/LICENSE', '/tmp/iconprobe/node_modules/lucide-static/LICENSE']
  .map(p => (p.startsWith('/') ? p : join(ROOT, p)))
  .find(p => existsSync(p));
if (lic) writeFileSync(join(OUT, 'LICENSE-lucide.txt'), readFileSync(lic, 'utf8'));

console.log(`${n} ícones → assets/icons/`);
