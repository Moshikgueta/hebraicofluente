/* O fluxo de senha, num navegador de verdade, num celular de 390.
   ────────────────────────────────────────────────────────────────────────
   O servidor já é provado em tests/senha.test.ts e em worker/e2e.sh. O que
   falta, e que nenhum dos dois vê, é se a PESSOA consegue atravessar: se o
   link de "esqueci minha senha" existe onde ela vai procurar, se a tela
   seguinte funciona, se o formulário cabe na tela e se, no fim, ela entra.

   Roda contra o export em modo demonstração (app/out), onde não há e-mail
   para mandar e o adaptador local devolve o link na própria tela - que é
   justamente o que torna o caminho percorrível aqui. O token continua sendo
   sorteado, expirando e valendo uma vez: o atalho é a ENTREGA, não a regra.

   Mede também transbordo horizontal a 390. Um formulário de senha que
   empurra a página para o lado é o tipo de defeito que só aparece no
   telefone de quem está com pressa.

   npm run senha
*/
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const T = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.png': 'image/png'
};
const s = createServer((q, r) => {
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
await new Promise(r => s.listen(4411, r));
mkdirSync('.shots', { recursive: true });

const BASE = 'http://127.0.0.1:4411';
const EMAIL = 'aluno@exemplo.com.br';
const SENHA_VELHA = 'senha-inicial-1';
const SENHA_NOVA = 'senha-nova-12345';

const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const erros = [];
const p = await ctx.newPage();
p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
p.on('pageerror', e => erros.push('pageerror: ' + e.message));

const falhas = [];
const ok = (rotulo, certo, detalhe = '') => {
  console.log(`  ${certo ? '✓' : '✗'} ${rotulo}${detalhe ? ' - ' + detalhe : ''}`);
  if (!certo) falhas.push(rotulo);
};

/** Quanto a página passa da largura da tela. Zero é o que se espera. */
const transbordo = () => p.evaluate(() =>
  Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));

const preencher = async (id, valor) => { await p.fill(`#${id}`, valor); };

/* ── 1. uma conta para esquecer a senha de ─────────────────────────────── */
console.log('\n  Criar a conta');
await p.goto(`${BASE}/criar-conta/`, { waitUntil: 'networkidle' });
await preencher('nome', 'Daniel');
await preencher('email', EMAIL);
await preencher('senha', SENHA_VELHA);
await p.check('#aceite-termos');
await p.getByRole('button', { name: /Criar conta/ }).click();
await p.waitForURL(/meu-hebraico|onboarding/, { timeout: 15000 });
ok('a conta foi criada e entrou', true, new URL(p.url()).pathname);

/* Sai, para chegar à tela de entrar como quem esqueceu a senha chega. */
await p.goto(`${BASE}/perfil/`, { waitUntil: 'networkidle' });
await p.getByRole('button', { name: /^Sair da conta$/ }).click();
await p.getByRole('button', { name: /Sair mesmo assim/ }).click();
await p.waitForURL(url => new URL(url).pathname === '/', { timeout: 15000 });

/* ── 2. o link existe onde a pessoa procura ────────────────────────────── */
console.log('\n  A tela de entrar');
await p.goto(`${BASE}/entrar/`, { waitUntil: 'networkidle' });
const link = p.getByRole('link', { name: /Esqueci minha senha/ });
ok('tem "Esqueci minha senha"', await link.count() > 0);
ok('sem transbordo horizontal', await transbordo() === 0, `${await transbordo()}px`);

/* Digita o e-mail antes de clicar: ele tem de viajar junto. */
await preencher('email', EMAIL);
await link.click();
await p.waitForURL(/esqueci-senha/, { timeout: 15000 });

console.log('\n  Pedir o link');
ok('o e-mail já veio preenchido', (await p.inputValue('#email')) === EMAIL);
ok('sem transbordo horizontal', await transbordo() === 0, `${await transbordo()}px`);
await p.screenshot({ path: '.shots/senha-1-pedir.png' });

await p.getByRole('button', { name: /Mandar o link/ }).click();
await p.waitForSelector('text=/o link já está a caminho/i', { timeout: 15000 });
ok('a confirmação não afirma que a conta existe',
  await p.locator('text=/Se existir uma conta/').count() > 0);
ok('oferece o suporte como saída', await p.locator('a[href^="mailto:"]').count() > 0);
await p.screenshot({ path: '.shots/senha-2-enviado.png' });

/* ── 3. o link, que aqui aparece na tela ───────────────────────────────── */
const href = await p.locator('a[href*="/nova-senha/"]').first().getAttribute('href');
ok('o modo demonstração mostra o link em vez de fingir que mandou', !!href);

await p.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
console.log('\n  Escolher a senha nova');
ok('sem transbordo horizontal', await transbordo() === 0, `${await transbordo()}px`);

/* Senhas diferentes: tem de recusar ANTES de gastar o token. */
await preencher('senha', SENHA_NOVA);
await preencher('senha2', 'outra-coisa-9999');
await p.getByRole('button', { name: /Salvar e entrar/ }).click();
await p.waitForSelector('p[role=alert]', { timeout: 10000 });
ok('recusa quando as duas senhas não batem',
  /não são iguais/.test(await p.locator('p[role=alert]').innerText()));

await preencher('senha2', SENHA_NOVA);
await p.screenshot({ path: '.shots/senha-3-nova.png' });
await p.getByRole('button', { name: /Salvar e entrar/ }).click();
await p.waitForURL(/meu-hebraico|onboarding|inicio/, { timeout: 15000 });
ok('salvou e já entrou', true, new URL(p.url()).pathname);

/* ── 4. a senha nova é a que vale ──────────────────────────────────────── */
await p.goto(`${BASE}/perfil/`, { waitUntil: 'networkidle' });
await p.getByRole('button', { name: /^Sair da conta$/ }).click();
await p.getByRole('button', { name: /Sair mesmo assim/ }).click();
await p.waitForURL(url => new URL(url).pathname === '/', { timeout: 15000 });

console.log('\n  Entrar com a senha nova');
await p.goto(`${BASE}/entrar/`, { waitUntil: 'networkidle' });
await preencher('email', EMAIL);
await preencher('senha', SENHA_VELHA);
await p.getByRole('button', { name: /^Entrar$/ }).click();
await p.waitForSelector('p[role=alert]', { timeout: 10000 });
ok('a senha antiga não entra mais', true);

await preencher('senha', SENHA_NOVA);
await p.getByRole('button', { name: /^Entrar$/ }).click();
await p.waitForURL(/meu-hebraico|onboarding|inicio/, { timeout: 15000 });
ok('a senha nova entra', true);

/* ── 5. o link já usado não vale de novo ───────────────────────────────── */
await p.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
await preencher('senha', 'mais-uma-senha-1');
await preencher('senha2', 'mais-uma-senha-1');
await p.getByRole('button', { name: /Salvar e entrar/ }).click();
await p.waitForSelector('p[role=alert]', { timeout: 10000 });
console.log('\n  O link gasto');
ok('o mesmo link não funciona duas vezes',
  /não vale mais/.test(await p.locator('p[role=alert]').innerText()));

/* ── 6. trocar a senha no perfil ───────────────────────────────────────── */
console.log('\n  Trocar a senha no perfil');
await p.goto(`${BASE}/perfil/`, { waitUntil: 'networkidle' });
ok('começa fechado, atrás de um botão',
  await p.locator('#senha-atual').count() === 0);
await p.getByRole('button', { name: /^Trocar a senha$/ }).click();
await preencher('senha-atual', 'chute-errado');
await preencher('senha-nova', 'terceira-senha-1');
await preencher('senha-nova2', 'terceira-senha-1');
await p.getByRole('button', { name: /^Trocar a senha$/ }).click();
await p.waitForSelector('p[role=alert]', { timeout: 10000 });
ok('recusa sem a senha atual certa',
  /não confere/.test(await p.locator('p[role=alert]').innerText()));

await preencher('senha-atual', SENHA_NOVA);
ok('sem transbordo horizontal', await transbordo() === 0, `${await transbordo()}px`);
await p.screenshot({ path: '.shots/senha-4-perfil.png' });
await p.getByRole('button', { name: /^Trocar a senha$/ }).click();
await p.waitForSelector('text=/Senha trocada/', { timeout: 15000 });
ok('troca e confirma na tela', true);
ok('o formulário fecha depois de trocar', await p.locator('#senha-atual').count() === 0);

/* ── 7. sem token, nenhum formulário ───────────────────────────────────── */
console.log('\n  /nova-senha sem link');
await p.goto(`${BASE}/nova-senha/`, { waitUntil: 'networkidle' });
ok('não mostra formulário que não teria como funcionar',
  await p.locator('#senha').count() === 0);
/* Pelo papel e pelo rótulo, e não pelo href exato: `trailingSlash` faz o
   Next escrever `/esqueci-senha/`, e uma asserção presa à barra final quebra
   numa mudança de configuração que não muda nada para quem usa. */
ok('oferece pedir um link novo',
  await p.getByRole('link', { name: /Pedir um link novo/ }).count() > 0);

console.log('\n  erros de console:', erros.length ? erros.slice(0, 3) : 'nenhum');
console.log(falhas.length ? `\n  FALHAS: ${falhas.join(' · ')}\n` : '\n  tudo certo.\n');

await b.close(); s.close();
process.exit(falhas.length || erros.length ? 1 : 0);
