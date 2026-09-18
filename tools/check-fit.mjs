/* check-fit.mjs — does every sheet fit on one A4 page?
 *
 *   npm run check-fit            # all modules
 *   npm run check-fit -- 01-mem  # one module
 *
 * The workbook's contract is one stage, one sheet, one printed page. That only
 * holds if the content actually fits, and "looks about right" is not a check —
 * a sheet that overflows by 3mm silently becomes two pages, the folio stops
 * matching the real page, and the contents page starts lying.
 *
 * So this measures. It loads each built page with print media emulated and the
 * viewport set to the printable width, and compares every .sheet's rendered
 * height against the printable height that @page leaves.
 *
 * Printable area, from styles/print.css @page { size: A4; margin: 15mm 13.6mm 17mm }:
 *     width  = 210 - 13.6 - 13.6 = 182.8mm
 *     height = 297 - 15   - 17   = 265mm
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const PORT = 8479;

const MM = 96 / 25.4;                 // CSS px per mm
const PRINT_W = 182.8, PRINT_H = 265; // mm
const PX_W = Math.round(PRINT_W * MM);
const PX_H = PRINT_H * MM;

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

async function main() {
  const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const only = args[0];
  const files = readdirSync(DIST)
    .filter(f => f.endsWith('.html') && f !== 'livro-completo.html')
    .filter(f => !only || f.startsWith(only.replace(/\.html$/, '')))
    .sort();

  if (!files.length) { console.error('nada para medir — rode `npm run build`'); process.exit(1); }

  const srv = await serve();
  const browser = await (await chromium()).launch();
  const page = await browser.newPage({ viewport: { width: PX_W, height: 1200 } });
  await page.emulateMedia({ media: 'print' });

  const over = [];
  const all = [];
  let sheets = 0;

  for (const f of files) {
    await page.goto(`http://127.0.0.1:${PORT}/${f}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const measured = await page.evaluate(() =>
      [...document.querySelectorAll('.sheet')].map(el => {
        const badge = el.querySelector('.badge');
        const h1 = el.querySelector('h1');
        return {
          h: el.getBoundingClientRect().height,
          badge: badge ? badge.textContent.trim().slice(0, 44) : '',
          title: h1 ? h1.textContent.trim().slice(0, 44) : ''
        };
      }));

    measured.forEach((m, i) => {
      sheets++;
      const rec = { file: f, n: i + 1, mm: m.h / MM, badge: m.badge, title: m.title };
      rec.fill = rec.mm / PRINT_H;
      all.push(rec);
      if (m.h > PX_H + 1) over.push(rec);
    });
  }

  await browser.close();
  srv.close();

  console.log(`\n  ${sheets} folhas medidas · limite ${PRINT_H}mm de altura útil\n`);

  /* How full is the book? A page that is half empty is not a bug, but a lot of
     them means the splits are in the wrong places and the book is longer than
     it needs to be. */
  const buckets = [[0, .4], [.4, .6], [.6, .8], [.8, 1.001], [1.001, 99]];
  const names = ['< 40% cheia', '40–60%', '60–80%', '80–100%', 'estoura'];
  console.log('  distribuição de ocupação:');
  buckets.forEach((b, i) => {
    const n = all.filter(r => r.fill >= b[0] && r.fill < b[1]).length;
    const bar = '█'.repeat(Math.round(n / sheets * 44));
    console.log(`    ${names[i].padEnd(12)} ${String(n).padStart(4)}  ${bar}`);
  });
  const avg = all.reduce((a, r) => a + r.fill, 0) / all.length;
  console.log(`    média ${(avg * 100).toFixed(0)}%\n`);

  if (process.argv.includes('--empty')) {
    console.log('  folhas mais vazias:');
    all.slice().sort((a, b) => a.mm - b.mm).slice(0, 25).forEach(r =>
      console.log(`    ${(r.fill * 100).toFixed(0).padStart(3)}%  ${r.mm.toFixed(0).padStart(3)}mm  ` +
                  `${r.file} folha ${r.n}  ${(r.title || r.badge).slice(0, 40)}`));
    console.log();
  }
  if (!over.length) {
    console.log('  ✓ todas cabem em uma página A4\n');
    process.exit(0);
  }
  over.sort((a, b) => b.mm - a.mm);
  for (const o of over) {
    console.log(`  ✗ ${o.file} folha ${o.n}  ${o.mm.toFixed(0)}mm ` +
                `(+${(o.mm - PRINT_H).toFixed(0)}mm)  ${o.title || o.badge}`);
  }
  console.log(`\n  ${over.length} de ${sheets} folhas estouram a página\n`);
  process.exit(1);
}

main();
