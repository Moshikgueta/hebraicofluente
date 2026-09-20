/* A CSP não pode quebrar o site.
 * ─────────────────────────────────────────────────────────────────────────
 * O Worker passa a mandar uma Content-Security-Policy em toda página HTML
 * (worker/src/worker.js, `blindar`). Uma CSP errada não dá erro de build nem
 * de teste: dá página em branco, em produção, para todo mundo. Então este
 * script serve o export com EXATAMENTE os cabeçalhos do Worker e abre as
 * páginas num Chromium de verdade, ouvindo as violações de CSP e os erros de
 * console. Uma violação é uma falha.
 *
 *   npm run build && node csp.mjs
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "object-src 'none'"
].join('; ');

/* A mesma lista que o Worker monta - conferida contra ele, para que este
   script não teste uma política e a produção mande outra. */
const doWorker = readFileSync(new URL('../worker/src/worker.js', import.meta.url), 'utf8');
for (const dir of CSP.split('; ')) {
  if (!doWorker.includes(`"${dir}"`)) { console.error(`worker.js não tem a diretiva: ${dir}`); process.exit(1); }
}

const T = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.woff2':'font/woff2', '.svg':'image/svg+xml', '.json':'application/json', '.png':'image/png', '.txt':'text/plain', '.ico':'image/x-icon' };
const s = createServer((q, r) => {
  const c = decodeURIComponent(q.url.split('?')[0]);
  for (const f of [`out${c}`, `out${c}/index.html`, `out${c}.html`, 'out/404.html']) {
    if (!existsSync(f) || !f.includes('.')) continue;
    try {
      const b = readFileSync(f);
      const tipo = T[f.slice(f.lastIndexOf('.'))] || 'application/octet-stream';
      const h = { 'Content-Type': tipo, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
      if (tipo.startsWith('text/html')) { h['Content-Security-Policy'] = CSP; h['X-Frame-Options'] = 'DENY'; }
      r.writeHead(200, h); return r.end(b);
    } catch { /* próximo candidato */ }
  }
  r.writeHead(404); r.end('404');
});
await new Promise(r => s.listen(4409, r));

/* O que dá para abrir sem Worker: as páginas públicas e a CASCA das pagas.
   As páginas pagas com conteúdo de verdade só existem para uma sessão com
   o curso, e não há sessão aqui - o que este script prova sobre elas é que a
   casca e o roteador não violam a política, não a aula inteira. */
const ROTAS = ['/', '/cursos/alfabetizacao/', '/entrar/', '/criar-conta/', '/checkout/alfabetizacao/',
               '/checkout/alfabetizacao/obrigado/', '/nova-senha/', '/perfil/', '/faq/',
               '/licao/alef/', '/meu-hebraico/', '/desafio-final/'];
const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });
let ruim = 0;
for (const w of [390, 1280]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  for (const rota of ROTAS) {
    const problemas = [];
    p.removeAllListeners('console');
    p.on('console', m => {
      const t = m.text();
      if (m.type() === 'error' || /Content Security Policy|Refused to/i.test(t)) problemas.push(t);
    });
    p.on('pageerror', e => problemas.push(String(e)));
    await p.goto(`http://127.0.0.1:4409${rota}`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);
    const texto = (await p.locator('body').innerText().catch(() => '')).trim();
    const vazia = texto.length < 40;
    /* 401 em /api/* é esperado: não há Worker aqui. */
    const reais = problemas.filter(t => !/\/api\//.test(t));
    if (reais.length || vazia) ruim++;
    console.log(`${String(w).padEnd(5)} ${rota.padEnd(26)} ${vazia ? 'PÁGINA VAZIA' : 'renderiza'} ${reais[0] ? 'PROBLEMA: ' + reais[0].slice(0, 120) : ''}`);
  }
  await p.close();
}
await b.close(); s.close();
console.log(ruim === 0 ? '\nA CSP do Worker não quebra nenhuma página.\n' : `\n${ruim} página(s) com problema sob a CSP.\n`);
process.exit(ruim === 0 ? 0 : 1);
