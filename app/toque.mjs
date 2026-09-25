/* O dedo alcança o que a tela mostra?
   ─────────────────────────────────────────────────────────────────────────
   A plataforma tem uma barra de navegação FIXA no rodapé abaixo de 1024px.
   Tudo o que o aluno precisa tocar tem de terminar ACIMA dela - e isso não
   é questão de estética: um botão que termina por baixo da barra continua
   visível, continua habilitado, e o toque nele abre outra página.

   Foi o que aconteceu, e por um motivo que nenhum teste de unidade vê. O
   `<main>` reservava `pb-[92px]`, mas dividia classe com `sm:py-8`; a media
   query vem depois na folha gerada e o `py` sobrescreve o `pb`. De 640px
   para cima sobravam 32px de espaço para uma barra de 60px. Medido nesta
   varredura: "Continuar para as palavras" na lição, os cartões dos módulos
   6 e 7 no painel, "Ver todos os cursos" - todos inalcançáveis.

   A regra aqui não é "o CSS está certo": é `elementFromPoint` no meio de
   cada alvo, com a página rolada até o fim. Se quem responde no ponto do
   botão for a barra, o botão não é do aluno.

   Precisa do `out/` construído em modo local. node toque.mjs (de app/). */

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg'
};
const servidor = createServer((req, res) => {
  const limpo = decodeURIComponent(req.url.split('?')[0]);
  for (const f of [`out${limpo}`, `out${limpo}/index.html`, `out${limpo}.html`, 'out/404.html']) {
    if (!existsSync(f) || f.endsWith('/')) continue;
    try {
      const corpo = readFileSync(f);
      res.writeHead(200, { 'Content-Type': TIPOS[f.slice(f.lastIndexOf('.'))] || 'application/octet-stream' });
      return res.end(corpo);
    } catch { /* diretório */ }
  }
  res.writeHead(404); res.end('404');
});
await new Promise(r => servidor.listen(4443, r));
const BASE = 'http://127.0.0.1:4443';

const agora = new Date().toISOString();
const ACC = { v: 1, accounts: { 'demo@hf.test': { id: 'acc_demo', name: 'M', email: 'demo@hf.test',
  createdAt: agora, pw: 'x', entitlements: [{ courseSlug: 'alfabetizacao', grantedAt: agora,
  expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: 'demo' }], orders: [] } },
  current: 'demo@hf.test' };
const feita = id => ({ letterId: id, stagesDone: [1, 2, 3, 4, 5], quizBest: 1, quizAttempts: 1,
  perfectBonusPaid: true, completedAt: agora });
const FEITAS = ['alef','mem','tav','nun','he','yod','gimel','dalet','shin','lamed','resh','vav'];
const ST = { version: 2, onboarding: { reason: 'familia', goalMinutes: 10, startingPoint: 'zero',
  name: 'M', completedAt: agora }, xp: 500, lessons: Object.fromEntries(FEITAS.map(i => [i, feita(i)])),
  checkpoints: {}, srs: {}, achievements: [], days: {}, streak: { current: 1, longest: 1, lastDay: null },
  lastRoute: null, finalChallenge: { best: null, completedAt: null }, skills: {}, confusions: {},
  firsts: {}, gym: {} };

/* As larguras onde a barra existe. 834 é um iPad em pé e 1000 é uma janela
   de notebook estreita - as duas ficavam de fora de quem só testa "celular
   ou desktop", e as duas estavam quebradas. */
const LARGURAS = [390, 430, 834, 1000];
const ROTAS = ['/meu-hebraico/', '/mapa/', '/licao/zayin/', '/licao/alef/', '/inicio/',
               '/revisao/', '/academia/', '/conquistas/', '/perfil/', '/modulo/6/',
               /* 23/09/2026: as telas das atividades de produção. */
               '/vocabulario/', '/meu-nome/', '/teclado-hebraico/',
               /* 25/09/2026: a missão de módulo. */
               '/modulo/1/missao/'];

let falhas = 0;
const navegador = await chromium.launch();

for (const width of LARGURAS) {
  const ctx = await navegador.newContext({ viewport: { width, height: 900 }, hasTouch: width < 700 });
  await ctx.addInitScript(([a, st]) => {
    localStorage.setItem('hf-platform-local-v1', a);
    localStorage.setItem('hebraico-fluente-v1', st);
  }, [JSON.stringify(ACC), JSON.stringify(ST)]);
  const p = await ctx.newPage();

  for (const rota of ROTAS) {
    await p.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(350);

    const cobertos = await p.evaluate(() => {
      /* Rolagem natural até o fim: é onde o aluno chega ao terminar de ler
         a página, e é a posição em que o último controle tem de estar livre. */
      window.scrollTo(0, document.documentElement.scrollHeight);
      const nav = document.querySelector('nav[aria-label="Navegação principal"]');
      if (!nav) return [];
      const rn = nav.getBoundingClientRect();
      const nome = e => (e.getAttribute('aria-label') || e.textContent || '')
        .replace(/\s+/g, ' ').trim().slice(0, 40) || e.tagName;

      return [...document.querySelectorAll('button, a, input, [role="button"]')]
        .filter(e => {
          if (e.closest('nav[aria-label="Navegação principal"]')) return false;
          /* Visível DE VERDADE. Sem isto a regra acusava dois cartões que
             moram dentro de um <details> fechado: o Chromium mantém caixa
             de layout para os filhos de um detalhe recolhido, então eles
             têm retângulo, coordenada e tudo - e nenhum aluno os vê. Um
             verificador que grita à toa é um verificador que alguém
             desliga. */
          if (typeof e.checkVisibility === 'function' && !e.checkVisibility({
            contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true
          })) return false;
          if (e.closest('details:not([open])')) return false;
          const r = e.getBoundingClientRect();
          /* Só o que está na tela e é grande o bastante para ser um alvo. */
          return r.width > 40 && r.height > 20 && r.top >= 0 && r.top < innerHeight;
        })
        .filter(e => {
          const r = e.getBoundingClientRect();
          if (r.bottom <= rn.top) return false;
          const y = Math.min(r.y + r.height / 2, innerHeight - 1);
          const quem = document.elementFromPoint(r.x + r.width / 2, y);
          return !!(quem && quem.closest('nav[aria-label="Navegação principal"]'));
        })
        .map(nome);
    });

    if (cobertos.length) {
      console.log(`  ✗ ${String(width).padStart(4)}px ${rota.padEnd(18)} a barra engole: ${cobertos.join(' | ')}`);
      falhas++;
    } else {
      console.log(`  ✓ ${String(width).padStart(4)}px ${rota.padEnd(18)} todo alvo alcançável`);
    }
  }
  await ctx.close();
}

await navegador.close();
servidor.close();
console.log('');
if (falhas) {
  console.log(`${falhas} tela(s) com alvo por baixo da barra fixa.\n`);
  process.exit(1);
}
console.log('nenhum alvo de toque fica por baixo da navegação fixa.\n');
