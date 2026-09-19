/* Captura as telas do curso num telefone. Ferramenta de revisão, não de build.
   node shot.mjs [--w 390] [--dir .shots] */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const W = Number(process.argv.includes('--w') ? process.argv[process.argv.indexOf('--w') + 1] : 390);
const DIR = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : '.shots';
mkdirSync(DIR, { recursive: true });

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.txt': 'text/plain'
};

const server = createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0]);
  const tries = [`out${clean}`, `out${clean}/index.html`, `out${clean}.html`, 'out/404.html'];
  for (const f of tries) {
    if (!existsSync(f) || f.endsWith('/')) continue;
    try {
      const body = readFileSync(f);
      const ext = f.slice(f.lastIndexOf('.'));
      res.writeHead(f.endsWith('404.html') ? 404 : 200, { 'Content-Type': TYPES[ext] || 'application/octet-stream' });
      return res.end(body);
    } catch { /* diretório: tenta o próximo */ }
  }
  res.writeHead(404); res.end('404');
});
await new Promise(r => server.listen(4321, r));

const ACCOUNT = {
  v: 1,
  accounts: {
    'demo@hf.test': {
      id: 'acc_demo', name: 'Moshik', email: 'demo@hf.test',
      createdAt: new Date().toISOString(), pw: 'pbkdf2$1$AA==$AA==',
      entitlements: [{
        courseSlug: 'alfabetizacao', grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: 'demo'
      }],
      orders: []
    }
  },
  current: 'demo@hf.test'
};

const hoje = new Date().toISOString().slice(0, 10);
const STATE = {
  version: 2,
  onboarding: { reason: 'familia', goalMinutes: 10, startingPoint: 'zero', name: 'Moshik', completedAt: new Date().toISOString() },
  xp: 340,
  lessons: {
    mem: { letterId: 'mem', stagesDone: [0, 1, 2, 3, 4], quizBest: 1, quizAttempts: 1, perfectBonusPaid: true, completedAt: new Date().toISOString() },
    tav: { letterId: 'tav', stagesDone: [0, 1, 2, 3, 4], quizBest: 0.9, quizAttempts: 2, perfectBonusPaid: false, completedAt: new Date().toISOString() },
    alef: { letterId: 'alef', stagesDone: [0, 1], quizBest: null, quizAttempts: 0, perfectBonusPaid: false, completedAt: null }
  },
  checkpoints: {}, srs: {
    'tav': { itemId: 'tav', letterId: 'tav', box: 1, misses: 2, hits: 1, dueOn: hoje, lastSeen: hoje, skill: 'ler' },
    'mem': { itemId: 'mem', letterId: 'mem', box: 0, misses: 1, hits: 0, dueOn: hoje, lastSeen: hoje, skill: 'som' }
  },
  achievements: ['primeira-letra'],
  days: { [hoje]: { day: hoje, units: 2, xp: 120, minutes: 8 } },
  streak: { current: 3, longest: 5, lastDay: hoje },
  lastRoute: null, finalChallenge: { best: null, completedAt: null },
  skills: {}, confusions: {}, firsts: {}, gym: {}
};

const browser = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });
const ctx = await browser.newContext({ viewport: { width: W, height: 844 }, deviceScaleFactor: 2 });
await ctx.addInitScript(([acc, st]) => {
  localStorage.setItem('hf-platform-local-v1', acc);
  localStorage.setItem('hebraico-fluente-v1', st);
}, [JSON.stringify(ACCOUNT), JSON.stringify(STATE)]);

const page = await ctx.newPage();
const ROTAS = ['/meu-hebraico/', '/licao/alef/', '/mapa/', '/revisao/', '/academia/', '/conquistas/'];
for (const rota of ROTAS) {
  const erros = [];
  page.removeAllListeners('console');
  page.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  await page.goto(`http://127.0.0.1:4321${rota}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const nome = rota.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home';
  await page.screenshot({ path: `${DIR}/${W}-${nome}.png`, fullPage: true });
  const m = await page.evaluate(() => {
    const largura = document.documentElement.scrollWidth;
    let culpados = [];
    if (largura > innerWidth + 1) {
      culpados = [...document.querySelectorAll('*')]
        .filter(e => e.getBoundingClientRect().right > innerWidth + 1)
        .slice(0, 4)
        .map(e => e.tagName.toLowerCase() + '.' + String(e.className).slice(0, 60));
    }
    return { h: document.documentElement.scrollHeight, largura, culpados };
  });
  console.log(`${rota.padEnd(18)} ${String(m.h).padStart(5)}px  w=${m.largura} ${m.culpados.join(' | ')} ${erros.length ? 'erros: ' + erros[0].slice(0, 80) : ''}`);
}
await browser.close();
server.close();
