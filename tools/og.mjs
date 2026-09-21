/* O cartão de compartilhamento: app/public/media/og.jpg, 1200x630.
   ─────────────────────────────────────────────────────────────────────────
   Este curso vai ser vendido por link colado em conversa - WhatsApp, grupo
   de sinagoga, story. O que aparece ali é o cartão, e até agora não havia
   nenhum: o link chegava pelado. O cartão é a primeira impressão do produto
   para muito mais gente do que a própria capa.

   Três decisões:

   · É GERADO COM AS FONTES E AS CORES DO PRODUTO, num navegador de verdade -
     e não desenhado à parte, que é como um cartão fica diferente do site no
     mês seguinte. As faces são as mesmas de app/public/fonts.
   · O HEBRAICO É DESENHADO PELA FONTE, nunca por um gerador de imagem. Vale
     aqui a mesma regra do hero: uma grafia errada na vitrine de um curso de
     hebraico é o pior defeito possível. A palavra é שָׁלוֹם - a única que um
     brasileiro reconhece antes de estudar.
   · PROMESSA NENHUMA QUE O SITE NÃO FAÇA. Os números saem do course.json, e
     não da cabeça de quem escreveu o cartão.

   Só roda quando alguém pede. O JPEG fica no repositório, porque o deploy
   não pode depender de um navegador para ter cartão.

   node tools/og.mjs  (da raiz) */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const raiz = new URL('..', import.meta.url);
const arq = (p) => new URL(p, raiz);
const b64 = (p) => readFileSync(arq(p)).toString('base64');

const curso = JSON.parse(readFileSync(arq('app/content/course.json'), 'utf8'));
const licoes = curso.modules.reduce((n, m) => n + m.lessons.length, 0);

const FONTES = {
  display: 'app/public/fonts/bricolage-grotesque-latin-600-normal.woff2',
  displayBold: 'app/public/fonts/bricolage-grotesque-latin-700-normal.woff2',
  ui: 'app/public/fonts/instrument-sans-latin-500-normal.woff2',
  he: 'app/public/fonts/noto-serif-hebrew-hebrew-500-normal.woff2'
};

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: D; src: url(data:font/woff2;base64,${b64(FONTES.display)}) format('woff2'); font-weight: 600 }
  @font-face { font-family: D; src: url(data:font/woff2;base64,${b64(FONTES.displayBold)}) format('woff2'); font-weight: 700 }
  @font-face { font-family: U; src: url(data:font/woff2;base64,${b64(FONTES.ui)}) format('woff2') }
  @font-face { font-family: H; src: url(data:font/woff2;base64,${b64(FONTES.he)}) format('woff2') }

  :root { --navy:#0E3B43; --teal:#1F8A7D; --cream:#FBF9F5; --sand:#F3F0E9; --line:#E4DFD3; --ink-muted:#5B6560 }
  * { margin:0; padding:0; box-sizing:border-box }
  body { width:1200px; height:630px; background:var(--cream); position:relative; overflow:hidden }

  /* A mesma foto do hero, no mesmo papel: quem chega pelo cartão e depois
     abre o site reconhece o lugar. */
  .foto { position:absolute; inset:0; background:url(data:image/webp;base64,${b64('app/public/media/hero.webp')}) 68% 50% / cover; opacity:.5 }
  .veu  { position:absolute; inset:0;
          background:linear-gradient(95deg, var(--cream) 0%, rgba(251,249,245,.97) 34%,
                     rgba(251,249,245,.7) 54%, rgba(251,249,245,.4) 78%, rgba(251,249,245,.62) 100%) }

  .card { position:relative; height:100%; padding:64px 72px; display:flex; flex-direction:column; justify-content:space-between }

  .marca { display:flex; align-items:center; gap:14px }
  .selo  { width:52px; height:52px; border-radius:15px; background:var(--navy);
           display:grid; place-items:center }
  .selo span { font-family:H; font-size:30px; color:#8FD6C8; line-height:1; margin-top:-2px }
  .marca b { font-family:D; font-weight:700; font-size:25px; letter-spacing:-.02em; color:var(--navy) }

  h1 { font-family:D; font-weight:700; font-size:74px; line-height:1.03; letter-spacing:-.035em;
       color:var(--navy); max-width:15ch }

  .pe { display:flex; align-items:flex-end; justify-content:space-between; gap:40px }
  .fatos { font-family:U; font-size:23px; color:var(--ink-muted); display:flex; gap:14px; align-items:center }
  .fatos i { width:4px; height:4px; border-radius:50%; background:var(--line); display:block; font-style:normal }

  .palavra { text-align:center; background:rgba(255,255,255,.72); border:1px solid var(--line);
             border-radius:22px; padding:20px 34px 18px }
  .palavra .he { font-family:H; font-size:62px; line-height:1.25; color:var(--navy); display:block }
  .palavra .tr { font-family:U; font-size:19px; color:var(--teal); display:block; margin-top:2px }
  .palavra .pt { font-family:U; font-size:19px; color:var(--ink-muted); display:block }
</style></head><body>
  <div class="foto"></div><div class="veu"></div>
  <div class="card">
    <div class="marca"><span class="selo"><span>ע</span></span><b>Hebraico Fluente</b></div>
    <h1>Aprenda a ler hebraico do zero.</h1>
    <div class="pe">
      <div class="fatos">
        <span>${licoes} lições</span><i></i>
        <span>${curso.letters.length} letras</span><i></i>
        <span>feito para brasileiros</span>
      </div>
      <div class="palavra">
        <span class="he" lang="he" dir="rtl">שָׁלוֹם</span>
        <span class="tr">shalóm</span>
        <span class="pt">olá · paz</span>
      </div>
    </div>
  </div>
</body></html>`;

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await pagina.setContent(html, { waitUntil: 'load' });
await pagina.evaluate(() => document.fonts.ready);
await pagina.waitForTimeout(250);

mkdirSync(new URL('app/public/media/', raiz), { recursive: true });
/* JPEG, e não PNG: a mesma imagem sai em 340 KB em PNG e num décimo disso
   em JPEG, e é uma fotografia - não tem área chapada nem texto minúsculo que
   o JPEG estrague. O WhatsApp busca esta imagem antes de desenhar a prévia,
   e uma prévia que demora é uma prévia que não aparece. */
const jpg = await pagina.screenshot({ type: 'jpeg', quality: 90 });
writeFileSync(arq('app/public/media/og.jpg'), jpg);
await navegador.close();

console.log(`app/public/media/og.jpg  1200x630  ${(jpg.length / 1024).toFixed(1)} KB`);
console.log(`(${licoes} lições · ${curso.letters.length} letras, lidos do course.json)`);
