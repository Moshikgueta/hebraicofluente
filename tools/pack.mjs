/* pack.mjs - author's tool. Measures each unit and writes data/layout.json,
 * so the build can group units onto sheets instead of giving every one its own
 * half-empty page.
 *
 *   npm run pack
 *
 * A "unit" is what a template emits: a self-contained block with its own badge
 * and heading - the syllable table, the tracing rows, one chunk of the alphabet
 * table. Splitting at those boundaries is what keeps every sheet printable, but
 * splitting alone leaves pages 69% full on average, because a unit like the
 * two-row "impressa e cursiva" comparison is 110mm on a 265mm page.
 *
 * So: build with packing off (one unit per sheet), measure every sheet, and
 * hand those heights back to the build, which then fills each sheet up to the
 * printable height. The heights are a safe overestimate - a unit that is not
 * first on its sheet loses its badge and its h1 becomes an h2, which only makes
 * it shorter - so a group that fits by the sum certainly fits on paper.
 *
 * `npm run check-fit` is still the proof; this only decides the grouping.
 */

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const PORT = 8481;
const MM = 96 / 25.4;
const PX_W = Math.round(182.8 * MM);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json'
};

async function chromium() {
  for (const spec of ['/opt/node22/lib/node_modules/playwright/index.mjs', 'playwright']) {
    try { return (await import(spec)).chromium; } catch { /* next */ }
  }
  console.error('Playwright não encontrado: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

function serve() {
  return new Promise(resolve => {
    const srv = createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      const f = join(DIST, p === '/' ? 'index.html' : p.replace(/^\//, ''));
      try {
        if (!existsSync(f) || statSync(f).isDirectory()) throw new Error('404');
        res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' });
        res.end(readFileSync(f));
      } catch { res.writeHead(404); res.end('404'); }
    }).listen(PORT, () => resolve(srv));
  });
}

function build(env) {
  const r = spawnSync('node', [join(ROOT, 'scripts/build.js')],
                      { encoding: 'utf8', env: { ...process.env, ...env } });
  if (r.status !== 0) { console.error(r.stdout || r.stderr); process.exit(1); }
  return r.stdout;
}

async function main() {
  console.log('\n  medindo as unidades (build sem empacotamento)…');
  build({ PACK: '0' });

  /* Section ids and their files come straight out of the build, so this cannot
     drift from what was generated. */
  const files = JSON.parse(readFileSync(join(DIST, 'sections.json'), 'utf8'));

  const srv = await serve();
  const browser = await (await chromium()).launch();
  const page = await browser.newPage({ viewport: { width: PX_W, height: 1200 } });
  await page.emulateMedia({ media: 'print' });

  const units = {};
  for (const { id, file } of files) {
    await page.goto(`http://127.0.0.1:${PORT}/${file}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    /* `full` is the sheet as printed. `chrome` is what the badge + h1 cost -
       the distance from the top of the sheet to the first thing under the
       heading - because a piece that follows another on a sheet drops exactly
       that and nothing else. Measuring it beats guessing a constant. */
    const hs = await page.evaluate(() =>
      [...document.querySelectorAll('.sheet')].map(el => {
        const box = el.getBoundingClientRect();
        const h1 = el.querySelector('h1');
        let chrome = 0;
        if (h1) {
          let next = h1.nextElementSibling;
          while (next && next.classList.contains('folio')) next = next.nextElementSibling;
          chrome = next ? next.getBoundingClientRect().top - box.top
                        : h1.getBoundingClientRect().bottom - box.top;
        }
        return { full: box.height, chrome: Math.max(0, chrome) };
      }));
    const MMpx = 96 / 25.4;
    units[id] = hs.map(h => ({ full: Math.ceil(h.full / MMpx), chrome: Math.floor(h.chrome / MMpx) }));
  }

  const browserClose = async () => { await browser.close(); srv.close(); };

  const total = Object.values(units).reduce((a, v) => a + v.length, 0);
  const breaks = {};
  const save = () => writeFileSync(join(ROOT, 'data/layout.json'),
    JSON.stringify({ measuredAt: new Date().toISOString().slice(0, 10),
                     units, breaks }, null, 2) + '\n');
  save();
  console.log(`  ${total} peças medidas em ${files.length} seções → data/layout.json`);

  /* ── repair loop ──────────────────────────────────────────────────────
     The packer is deliberately optimistic: a global safety margin big enough
     for the worst join costs more pages across the book than the few bad
     joins do. So pack, measure the PACKED result, and for every sheet that
     came out over, force a break before the last piece on it. Repeat until
     nothing overflows - usually two rounds. */
  const LIMIT = 265 * MM;
  for (let round = 1; round <= 6; round++) {
    build({});
    const map = JSON.parse(readFileSync(join(DIST, 'sheets.json'), 'utf8'));
    let added = 0;

    for (const sec of map) {
      await page.goto(`http://127.0.0.1:${PORT}/${sec.file}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const hs = await page.evaluate(() =>
        [...document.querySelectorAll('.sheet')].map(el => el.getBoundingClientRect().height));

      hs.forEach((h, i) => {
        if (h <= LIMIT + 1) return;
        const onSheet = sec.pieces[i] || [];
        if (onSheet.length < 2) return;           // a single piece cannot be split further
        const victim = onSheet[onSheet.length - 1];
        breaks[sec.id] = breaks[sec.id] || [];
        if (!breaks[sec.id].includes(victim)) { breaks[sec.id].push(victim); added++; }
      });
    }

    if (!added) {
      console.log(`  empacotamento estável na rodada ${round}`);
      break;
    }
    console.log(`  rodada ${round}: ${added} quebra(s) forçada(s)`);
    save();
  }

  await browserClose();
  const out = build({});
  console.log('  ' + out.trim().split('\n').slice(-1)[0].trim());
  console.log('\n  agora rode: npm run check-fit\n');
}

main();
