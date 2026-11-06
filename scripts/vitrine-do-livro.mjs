/* As imagens da página de venda do Israel Além do Óbvio (23/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * A página de venda mostra o PRÓPRIO produto: ilustrações do livro e telas
 * de verdade da versão interativa, nunca banco de imagens. Mas o livro mora
 * no repositório PRIVADO (editorial/), e nada dele pode entrar no git deste
 * repositório, que é público (CLAUDE.md, "E-book"). Por isso as imagens
 * nascem na publicação, como a prévia: este script roda logo depois de
 * scripts/ebook-no-site.sh, lê o livro já montado em app/public/israel/ e as
 * ilustrações de editorial/, e escreve em app/public/vitrine-livro/, que está
 * no .gitignore.
 *
 *   · ilustrações: as aberturas de capítulo SEM texto, copiadas como SVG
 *     (vetor, leves; num <img> o SVG não carrega fonte, por isso só as que não
 *     têm texto);
 *   · capturas: telas reais do livro num Chromium, com as fontes dele (mapa
 *     ilustrado, mochila, monte a sua comida, roleta, diário, capa), em JPEG.
 *
 * Falta uma captura ou uma ilustração: a publicação para, como na prévia.
 * Nada é inventado: se o livro mudar e um seletor sumir, o erro diz qual.
 *
 * Uso: HF_CHROMIUM=<chromium> node scripts/vitrine-do-livro.mjs
 */

import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PUBLICO = join(RAIZ, 'app/public');
const DEST = join(PUBLICO, 'vitrine-livro');
const ILU = join(RAIZ, 'editorial/israel-alem-do-roteiro/ativos/ilustracoes');

/** As aberturas sem texto (conferido: nenhum <text> dentro). */
export const ILUSTRACOES = [
  'abertura-israel-no-mapa', 'abertura-jerusalem', 'abertura-alem-de-jerusalem',
  'abertura-vida-real', 'abertura-sabores', 'abertura-pratica', 'abertura-diario'
];

/** As capturas: onde, em que tela e o quê. `alvo` = seletor do elemento;
 *  sem alvo, a tela inteira. `altura` corta o elemento (no celular, a
 *  primeira dobra dele). */
export const CAPTURAS = [
  { nome: 'capa-computador', url: '/israel/#inicio', largura: 1280, alturaTela: 800 },
  { nome: 'capa-celular', url: '/israel/#inicio', largura: 390, alturaTela: 844 },
  { nome: 'jerusalem-tablet', url: '/israel/#cap03', largura: 834, alturaTela: 1112 },
  { nome: 'mapa-destinos', url: '/israel/#cap04', largura: 1280, alturaTela: 900, alvo: 'svg.fig-mapa-destinos-ilustrado' },
  /* A mochila e o monte em uso: o script toca em alguns itens antes, como o
     leitor faria (a interação é a de verdade; só a foto vem depois dela). */
  { nome: 'mochila', url: '/israel/#cap08', largura: 390, alturaTela: 844, alvo: '.mochila', altura: 1000, tocar: ['.mochila .mo-toque', 9] },
  /* O monte da PRÉVIA, o livre (sem certo nem errado): no do livro, tocar
     no ingrediente que não vai no prato marca o erro em vermelho. */
  { nome: 'monte', url: '/previa/', largura: 390, alturaTela: 844, alvo: '.monte.livre', altura: 1000, antes: '.monte.livre .monte-aba', tocar: ['.monte.livre .monte-ingr', 6] },
  { nome: 'roleta', url: '/israel/#cap09', largura: 390, alturaTela: 844, alvo: '.jogo', altura: 900 },
  { nome: 'diario', url: '/israel/#diario', largura: 390, alturaTela: 844 }
];

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.mp3': 'audio/mpeg' };

function servidor() {
  return new Promise(ok => {
    const s = createServer(async (req, res) => {
      try {
        let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
        if (p.endsWith('/')) p += 'index.html';
        const f = join(PUBLICO, p);
        if (!f.startsWith(PUBLICO)) { res.writeHead(403).end(); return; }
        const corpo = await readFile(f);
        res.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream' }).end(corpo);
      } catch { if (!res.headersSent) res.writeHead(404).end(); }
    });
    s.listen(0, '127.0.0.1', () => ok(s));
  });
}

async function main() {
  if (!existsSync(join(PUBLICO, 'israel/index.html'))) throw new Error('o livro não está montado em app/public/israel (rode scripts/ebook-no-site.sh antes)');
  const exe = process.env.HF_CHROMIUM;
  if (!exe) throw new Error('HF_CHROMIUM não definido');
  const { chromium } = await import(join(RAIZ, 'editorial/node_modules/playwright-core/index.mjs'));

  rmSync(DEST, { recursive: true, force: true });
  mkdirSync(DEST, { recursive: true });
  for (const n of ILUSTRACOES) {
    const f = join(ILU, `${n}.svg`);
    if (!existsSync(f)) throw new Error(`ilustração ausente: ${n}.svg`);
    copyFileSync(f, join(DEST, `${n}.svg`));
  }

  const s = await servidor();
  const base = `http://127.0.0.1:${s.address().port}`;
  const b = await chromium.launch({ executablePath: exe });
  const manifesto = {};
  try {
    for (const c of CAPTURAS) {
      const p = await b.newPage({ viewport: { width: c.largura, height: c.alturaTela }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
      await p.goto(base + c.url, { waitUntil: 'networkidle' });
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(600);
      /* O que fica fixo na tela (menu do livro, botão de acessibilidade, "Menu
         inicial") não é o produto, e sairia por cima do recorte. */
      /* `soEmbaixo`: nas telas cheias o menu do topo É a tela do livro e fica;
         sai só o que flutua no rodapé (o botão de acessibilidade). */
      const esconderFixos = (soEmbaixo = false) => p.evaluate(soEmbaixo => {
        for (const e of document.querySelectorAll('body *')) {
          const pos = getComputedStyle(e).position;
          if (pos !== 'fixed' && pos !== 'sticky') continue;
          if (soEmbaixo && e.getBoundingClientRect().top < window.innerHeight / 2) continue;
          e.style.setProperty('visibility', 'hidden', 'important');
        }
      }, soEmbaixo);
      const arquivo = join(DEST, `${c.nome}.jpg`);
      if (c.antes) { const a = await p.$(c.antes); if (!a) throw new Error(`${c.nome}: ${c.antes} não existe`); await a.click(); await p.waitForTimeout(200); }
      if (c.tocar) {
        const [sel, n] = c.tocar;
        const itens = await p.$$(sel);
        if (itens.length < n) throw new Error(`${c.nome}: menos de ${n} ${sel}`);
        for (const it of itens.slice(0, n)) { await it.scrollIntoViewIfNeeded(); await it.click(); await p.waitForTimeout(120); }
        await p.waitForTimeout(500);
      }
      if (c.alvo) {
        await esconderFixos();
        const el = await p.$(c.alvo);
        if (!el) throw new Error(`${c.nome}: o seletor ${c.alvo} não existe mais em ${c.url}`);
        await el.scrollIntoViewIfNeeded();
        await p.waitForTimeout(300);
        const caixa = await el.boundingBox();
        const altura = Math.min(caixa.height, c.altura ?? caixa.height);
        const y = await p.evaluate(() => window.scrollY);
        await p.screenshot({ path: arquivo, type: 'jpeg', quality: 82, fullPage: true,
          clip: { x: caixa.x, y: caixa.y + y, width: caixa.width, height: altura } });
        manifesto[c.nome] = { largura: Math.round(caixa.width), altura: Math.round(altura) };
      } else {
        await esconderFixos(true);
        await p.screenshot({ path: arquivo, type: 'jpeg', quality: 82 });
        manifesto[c.nome] = { largura: c.largura, altura: c.alturaTela };
      }
      await p.close();
    }
  } finally {
    await b.close();
    s.close();
  }
  writeFileSync(join(DEST, 'manifesto.json'), JSON.stringify({ ilustracoes: ILUSTRACOES, capturas: manifesto }, null, 1));
  console.log(`vitrine do livro em app/public/vitrine-livro: ${ILUSTRACOES.length} ilustrações, ${Object.keys(manifesto).length} capturas`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(`vitrine-do-livro: ${e.message}`); process.exit(1); });
}
