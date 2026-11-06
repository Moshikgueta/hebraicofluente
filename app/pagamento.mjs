/* O que o site promete sobre pagamento, conferido no navegador.
 * ─────────────────────────────────────────────────────────────────────────
 * `data/empresa.json` tem um campo, `pagamento.modo`, e ele decide duas
 * coisas que aparecem em texto corrido espalhado por meia dúzia de páginas:
 * quais formas de pagamento existem, e se o acesso se libera sozinho.
 *
 * O problema desse tipo de configuração é que ela não quebra quando alguém
 * esquece um lugar. A página continua bonita, o build passa, os testes
 * passam - e o rodapé segue oferecendo "cartão em até 12x" numa loja que só
 * processa PIX. Isso não é um texto desatualizado: é uma oferta que o
 * fornecedor não cumpre, lida antes da compra, que é quando ela mais decide.
 *
 * Então esta varredura lê o modo e vai atrás das frases proibidas por ele,
 * nas páginas onde elas moram, no navegador, no HTML que o visitante recebe.
 * Ela também leva o checkout até o fim - cria conta, gera o código PIX - e
 * confere o que o painel de espera diz, porque é a única tela que promete um
 * prazo à pessoa que já pagou.
 *
 *   node pagamento.mjs              só confere
 *   node pagamento.mjs ./tiros      confere e guarda as capturas
 *
 * Precisa de `npm run build` antes: ela serve `out/`, que é o que vai ao ar.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const empresa = JSON.parse(readFileSync('../data/empresa.json', 'utf8'));
const MODO = (empresa.pagamento && empresa.pagamento.modo) || 'mercadopago';
const SO_PIX = MODO === 'pix-direto';
const CONFIRMA_SOZINHO = MODO === 'mercadopago';

const DEST = process.argv[2] || null;
if (DEST) mkdirSync(DEST, { recursive: true });

const T = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.woff2':'font/woff2', '.svg':'image/svg+xml', '.json':'application/json', '.png':'image/png' };
const servidor = createServer((q, r) => {
  const c = decodeURIComponent(q.url.split('?')[0]);
  for (const f of [`out${c}`, `out${c}/index.html`, `out${c}.html`, 'out/404.html']) {
    if (!existsSync(f)) continue;
    try {
      const b = readFileSync(f);
      r.writeHead(200, { 'Content-Type': T[f.slice(f.lastIndexOf('.'))] || 'application/octet-stream' });
      return r.end(b);
    } catch { /* tenta o próximo candidato */ }
  }
  r.writeHead(404); r.end('404');
});
await new Promise(r => servidor.listen(4408, r));
const url = rota => `http://127.0.0.1:4408${rota}`;

let ruim = 0;
const ok = (bom, texto) => { if (!bom) ruim++; console.log(`  ${bom ? '✓' : '✗'} ${texto}`); };

/* As frases que o modo atual torna falsas. Cada uma foi tirada de uma página
   de verdade - não são exemplos, são o texto que estava lá. */
const PROIBIDO_SEM_CARTAO = [
  /em at[ée] \d+x/i,
  /cart[ãa]o de cr[ée]dito/i,
  /PIX ou cart[ãa]o/i
];
const PROIBIDO_SEM_AUTOMATICO = [
  /libera[çc][ãa]o (é )?autom[áa]tica/i,
  /liberado automaticamente/i,
  /sem libera[çc][ãa]o manual/i,
  /ela se atualiza sozinha/i
];

const PAGINAS = ['/', '/cursos/', '/curso-de-hebraico/', '/faq/', '/termos/',
                 '/privacidade/', '/reembolso/', '/suporte/', '/checkout/alfabetizacao/'];

const navegador = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });

console.log(`\nMODO DE PAGAMENTO: ${MODO}\n`);
console.log('AS PÁGINAS PÚBLICAS\n');

const pagina = await navegador.newPage({ viewport: { width: 1280, height: 1000 } });
for (const rota of PAGINAS) {
  await pagina.goto(url(rota), { waitUntil: 'networkidle' });
  const texto = await pagina.locator('body').innerText();
  const achados = [
    ...(SO_PIX ? PROIBIDO_SEM_CARTAO : []),
    ...(CONFIRMA_SOZINHO ? [] : PROIBIDO_SEM_AUTOMATICO)
  ].map(re => texto.match(re)).filter(Boolean);
  ok(achados.length === 0,
    `${rota}${achados.length ? ` promete "${achados[0][0]}"` : ''}`);
}
await pagina.close();

/* O checkout inteiro, nas duas larguras que importam. */
console.log('\nO CHECKOUT, ATÉ O CÓDIGO PIX\n');
for (const w of [390, 1280]) {
  const p = await navegador.newPage({ viewport: { width: w, height: 1000 } });
  const erros = [];
  p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  p.on('pageerror', e => erros.push(String(e)));

  await p.goto(url('/checkout/alfabetizacao/'), { waitUntil: 'networkidle' });

  const criar = p.getByRole('button', { name: /criar conta/i }).first();
  if (await criar.isVisible().catch(() => false)) await criar.click().catch(() => {});
  await p.waitForTimeout(300);
  for (const [rotulo, valor] of [[/nome/i, 'Teste'], [/e-mail/i, `pix${w}@exemplo.com`], [/senha/i, 'senhaboa123']]) {
    const campo = p.getByLabel(rotulo).first();
    if (await campo.isVisible().catch(() => false)) await campo.fill(valor).catch(() => {});
  }
  const aceite = p.getByRole('checkbox', { name: /aceito os termos/i }).first();
  if (await aceite.isVisible().catch(() => false)) await aceite.check().catch(() => {});
  await p.getByRole('button', { name: /criar minha conta|criar conta|continuar/i })
         .last().click().catch(() => {});
  await p.waitForTimeout(1200);
  /* Quem cria a conta no checkout tem de continuar nele. Este roteiro voltava
     ao checkout sozinho quando saía dele, e por isso nunca viu que o cadastro
     mandava a pessoa para a página de venda (growth, 23/10/2026). */
  ok(new URL(p.url()).pathname === '/checkout/alfabetizacao/',
    `${w}px · depois de criar a conta, continua no checkout (${new URL(p.url()).pathname})`);

  const pagar = p.getByRole('button', { name: /^Pagar/i }).first();
  const chegou = await pagar.isVisible().catch(() => false);
  if (chegou) { await pagar.click(); await p.waitForTimeout(1500); }
  if (DEST) await p.screenshot({ path: `${DEST}/checkout-${w}.png`, fullPage: true });

  const texto = await p.locator('main').innerText().catch(() => '');
  const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));

  ok(chegou, `${w}px · o botão de pagar aparece`);
  ok(/PIX COPIA E COLA/i.test(texto), `${w}px · o código copia e cola foi gerado`);
  ok(m.sw <= m.iw + 1, `${w}px · sem rolagem lateral`);
  ok(erros.length === 0, `${w}px · sem erro de console${erros[0] ? `: ${erros[0].slice(0, 80)}` : ''}`);

  /* A promessa de prazo feita a quem já pagou. */
  if (SO_PIX) {
    ok(/alguns minutos/i.test(texto), `${w}px · o painel promete minutos, não instantâneo`);
    ok(!/atualiza sozinha/i.test(texto), `${w}px · o painel não promete atualização automática`);
    ok(texto.includes(empresa.contato.emailSuporte), `${w}px · o painel dá para onde escrever`);
  }
  await p.close();
}

await navegador.close();
servidor.close();
console.log(ruim === 0
  ? '\nO que o site promete é o que o site faz.\n'
  : `\n${ruim} promessa(s) que o modo "${MODO}" não cumpre.\n`);
process.exit(ruim === 0 ? 0 : 1);
