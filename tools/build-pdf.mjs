/* build-pdf.mjs — author's tool. Prints dist/ to a single A4 PDF.
 *
 *   npm run pdf                 # the whole book
 *   npm run pdf -- 01-mem       # one module
 *
 * Needs Playwright + Chromium, which is why it is NOT part of `npm run build`:
 * the build itself has no dependencies and must stay that way.
 *
 * The whole book prints from dist/livro-completo.html in ONE pass rather than
 * printing thirty files and merging them. That matters: a merge would restart
 * pagination at every module and would not let a table break across a module
 * boundary. One document means Chromium paginates the book as a book, and the
 * folio numbers that build.js already made continuous line up with the real
 * PDF page numbers.
 *
 * Page geometry comes from styles/print.css (@page { size: A4; margin: 0 }),
 * so nothing here sets margins — printBackground is on because the teal bands
 * and mint callouts carry the page structure.
 */

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'pdf');
const PORT = 8477;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg'
};

/* Playwright lives outside the project on this machine; fall back to a local
   install so the tool works on a normal checkout too. */
async function chromium() {
  for (const spec of ['/opt/node22/lib/node_modules/playwright/index.mjs', 'playwright']) {
    try { return (await import(spec)).chromium; } catch { /* next */ }
  }
  console.error(
    'Playwright não encontrado.\n' +
    '  npm i -D playwright && npx playwright install chromium\n');
  process.exit(1);
}

function serve() {
  return new Promise(resolve => {
    const srv = createServer((req, res) => {
      const path = decodeURIComponent(req.url.split('?')[0]);
      const file = join(DIST, path === '/' ? 'index.html' : path.replace(/^\//, ''));
      try {
        if (!existsSync(file) || statSync(file).isDirectory()) throw new Error('404');
        res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
        res.end(readFileSync(file));
      } catch {
        res.writeHead(404); res.end('404');
      }
    }).listen(PORT, () => resolve(srv));
  });
}

async function main() {
  if (!existsSync(join(DIST, 'livro-completo.html'))) {
    console.error('dist/ está vazio ou desatualizado — rode `npm run build` primeiro.');
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });

  const only = process.argv[2];
  const jobs = only
    ? [[`${only.replace(/\.html$/, '')}.html`, `${only.replace(/\.html$/, '')}.pdf`]]
    : [['livro-completo.html', 'hebraico-moderno-workbook.pdf']];

  const srv = await serve();
  const launch = await chromium();
  const browser = await launch.launch();
  const page = await browser.newPage();

  const print = async (src, dest) => {
    process.stdout.write(`  ${src} → pdf/${dest} … `);
    await page.goto(`http://127.0.0.1:${PORT}/${src}`, { waitUntil: 'networkidle' });
    /* Fonts must be resolved before layout is measured, or the nikud sits at
       the wrong height and lines break differently in the PDF than on screen. */
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: join(OUT, dest),
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      /* Real PDF page numbers, drawn in the @page margin. The HTML folio is
         hidden at print (see print.css) so there is exactly one number on the
         page, and it is the one that matches the PDF. */
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `<div style="width:100%;padding:0 13.6mm;
        font:400 8pt Inter,system-ui,sans-serif;color:#8A8172;
        display:flex;justify-content:space-between;align-items:center">
        <span>Hebraico Moderno · Workbook de Alfabetização</span>
        <span class="pageNumber"></span></div>`
    });
    const kb = Math.round(statSync(join(OUT, dest)).size / 1024);
    console.log(`${kb} KB`);
  };

  for (const [src, dest] of jobs) {
    await print(src, dest);

    /* Only the whole book has a contents page to correct. */
    if (src !== 'livro-completo.html') continue;

    let prev = '';
    for (let pass = 1; pass <= 2; pass++) {
      const map = measure(join(OUT, dest));
      if (!map) {
        console.log('  ! page-map.py indisponível — o sumário fica sem números ' +
                    '(pip install pymupdf)');
        break;
      }

      /* The whole design rests on one sheet being one printed page. If that
         stops holding, every page number in the contents is wrong and the
         folio no longer matches the paper — so it is asserted, not assumed.
         `npm run check-fit` says WHICH sheet overflowed. */
      const html = readFileSync(join(DIST, src), 'utf8');
      const sheets = (html.match(/class="sheet"/g) || []).length;
      if (map.pages !== sheets) {
        console.error(`\n  ✗ ${sheets} folhas viraram ${map.pages} páginas — ` +
                      `alguma folha estourou a página.\n    rode: npm run check-fit\n`);
        process.exitCode = 1;
      }
      const next = JSON.stringify(map.sections);
      if (next === prev) break;
      prev = next;
      writeFileSync(join(ROOT, 'data/page-map.json'), JSON.stringify(map, null, 2) + '\n');
      console.log(`  sumário: ${Object.keys(map.sections).length} seções mapeadas ` +
                  `em ${map.pages} páginas — reconstruindo`);
      rebuild();
      await print(src, dest);
    }
  }

  await browser.close();
  srv.close();
  console.log(`\n  pronto → pdf/`);
}

/* ── the contents page needs real page numbers ─────────────────────────────
   A contents page cannot know what page a section lands on until the book has
   been paginated, and adding the numbers changes nothing about the layout
   (the slot is fixed width), so one measure-then-rebuild pass is enough.
   The loop below runs at most twice and stops as soon as the map stops
   changing. If Python or PyMuPDF is missing the book still builds — the
   contents just keeps its dashes, and the run says so. */
function measure(pdfPath) {
  const r = spawnSync('python3', [join(ROOT, 'tools/page-map.py'), pdfPath],
                      { encoding: 'utf8' });
  if (r.status !== 0) return null;
  try { return JSON.parse(r.stdout); } catch { return null; }
}

function rebuild() {
  const r = spawnSync('node', [join(ROOT, 'scripts/build.js')], { encoding: 'utf8' });
  if (r.status !== 0) { console.error(r.stdout || r.stderr); process.exit(1); }
}

main();
