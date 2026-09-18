/* A capa, vista por um navegador de verdade.
 * ─────────────────────────────────────────────────────────────────────────
 * O `curl` do e2e responde "o servidor mandou a página". Isso NÃO é a mesma
 * pergunta que "a página aparece". Entre uma coisa e outra existem:
 *
 *   · um erro de JavaScript que apaga a tela depois de ela pintar;
 *   · uma fonte, um CSS ou um chunk que não vem e derruba a renderização;
 *   · uma chamada de API que falha e deixa o app preso num estado vazio.
 *
 * Nenhum desses aparece num código 200, e todos os três chegam ao aluno como
 * "o site não abre" — que foi exatamente o relato que este arquivo existe
 * para investigar.
 *
 * O que ele faz: abre a capa num Chromium, espera a rede sossegar, e então
 * mede o que um olho mediria — quanto texto visível existe no corpo da
 * página. Junto, recolhe tudo que o navegador reclamou: erro de script,
 * requisição que falhou, resposta 4xx/5xx.
 *
 * Roda dentro do GitHub Actions, contra a URL publicada.
 */

import { chromium } from 'playwright';

const BASE = (process.env.HF_BASE || '').replace(/\/+$/, '');
if (!BASE) {
  console.error('Defina HF_BASE com a URL do site.');
  process.exit(2);
}

/* As rotas que um visitante vê antes de comprar. Se qualquer uma destas
   estiver em branco, não há venda. */
const PAGES = ['/', '/cursos/', '/cursos/alfabetizacao/', '/metodo/', '/entrar/'];

/* Abaixo disto a página está em branco na prática. A capa tem milhares de
   caracteres; 200 é generoso e ainda assim pega uma tela vazia. */
const MIN_TEXTO = 200;

/* Em ambientes que já trazem um Chromium (sandboxes de desenvolvimento, e
   imagens de CI que o preinstalam), a versão do pacote `playwright` raramente
   casa com a do navegador que está lá — e a mensagem que o Playwright dá
   nesse caso ("run npx playwright install") manda baixar outro, o que nem
   sempre é possível nem desejado. HF_CHROMIUM aponta para o executável
   existente e resolve. No GitHub Actions ele não é definido, e o padrão vale. */
const browser = await chromium.launch(
  process.env.HF_CHROMIUM ? { executablePath: process.env.HF_CHROMIUM } : {}
);
let falhas = 0;

for (const path of PAGES) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const problemas = [];

  page.on('console', m => {
    if (m.type() === 'error') problemas.push(`console: ${m.text().slice(0, 200)}`);
  });
  page.on('pageerror', e => problemas.push(`erro de script: ${String(e).slice(0, 200)}`));
  page.on('requestfailed', r =>
    problemas.push(`não carregou: ${r.url().replace(BASE, '')} (${r.failure()?.errorText})`));
  page.on('response', r => {
    if (r.status() >= 400) problemas.push(`${r.status()} em ${r.url().replace(BASE, '')}`);
  });

  let texto = '', titulo = '', erroDeIda = null;
  try {
    /* `networkidle` e não `load`: o que interessa é o estado depois de o app
       ter feito o que ia fazer, inclusive a chamada de sessão. */
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45_000 });
    titulo = await page.title();
    texto = (await page.locator('body').innerText().catch(() => '')).trim();
  } catch (e) {
    erroDeIda = String(e).split('\n')[0];
  }

  const vazia = texto.length < MIN_TEXTO;
  const ok = !erroDeIda && !vazia;
  if (!ok) falhas++;

  console.log(`${ok ? '  ✓' : '  ✗'} ${path}` +
    (erroDeIda ? ` — não carregou: ${erroDeIda}`
      : vazia ? ` — página em branco (${texto.length} caracteres de texto visível)`
      : ` — ${texto.length} caracteres, título "${titulo}"`));

  /* Os problemas do navegador saem SEMPRE, mesmo quando a página passou: um
     erro de console numa página que renderizou é o aviso que antecede a que
     não vai renderizar. */
  for (const p of [...new Set(problemas)].slice(0, 8)) console.log(`      · ${p}`);

  /* A captura é o que resolve a discussão quando o texto não basta. */
  await page.screenshot({
    path: `captura${path.replace(/\//g, '_') || '_raiz'}.png`, fullPage: false
  }).catch(() => {});

  await page.close();
}

await browser.close();

if (falhas) {
  console.log(`\n${falhas} página(s) não apareceram.`);
  process.exit(1);
}
console.log('\nTodas as páginas públicas renderizaram num navegador de verdade.');
