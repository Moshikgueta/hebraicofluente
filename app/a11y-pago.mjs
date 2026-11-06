/* A acessibilidade DENTRO do curso, com uma conta de aluno de verdade.
 * ─────────────────────────────────────────────────────────────────────────
 * `a11y.mjs` roda num servidor estático, sem conta e sem o conteúdo pago:
 * ele prova o menu, mas não abre uma lição. Foi assim que o 150% no celular
 * quebrando o vocabulário, a conta e o painel passou por ele (auditoria de
 * 01/10/2026, VIS-002). Este abre as telas pagas atrás do Worker, com a
 * sessão de quem comprou, a 360 e 390 px, com o texto em 100% e em 150%, e
 * reprova qualquer tela mais larga que o celular.
 *
 * Precisa de um Worker rodando (wrangler dev) e de uma conta com o curso:
 *
 *   HF_BASE=http://127.0.0.1:8787 HF_EMAIL=... HF_SENHA=... node a11y-pago.mjs
 *
 * Sem HF_EMAIL, cria uma conta nova e libera o curso no D1 LOCAL do wrangler
 * (`HF_PERSIST` = a pasta do --persist-to, se não for a padrão). Nunca
 * aponte isso para a produção: a liberação só existe no banco local.
 */

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const BASE = process.env.HF_BASE;
if (!BASE) { console.error('Defina HF_BASE (um wrangler dev).'); process.exit(2); }
if (!/^http:\/\/(127\.0\.0\.1|localhost)/.test(BASE) && !process.env.HF_EMAIL) {
  console.error('Sem HF_EMAIL, só contra um Worker local.'); process.exit(2);
}

let falhas = 0;
const ok = m => console.log(`  ✓ ${m}`);
const erro = m => { console.log(`  ✗ ${m}`); falhas++; };

const navegador = await chromium.launch({ executablePath: process.env.HF_CHROMIUM || undefined });

/* ── a conta ────────────────────────────────────────────────────────────── */
let email = process.env.HF_EMAIL;
let senha = process.env.HF_SENHA;
if (!email) {
  email = `a11y-${Date.now()}@example.invalid`;
  senha = 'senha-boa-123';
  const ctx = await navegador.newContext();
  const r = await ctx.request.post(`${BASE}/api/auth/signup`, {
    headers: { Origin: BASE, 'Content-Type': 'application/json' },
    data: { name: 'Robô', email, password: senha, aceitouTermos: true, declarouIdade: true }
  });
  if (!r.ok()) { console.error('cadastro falhou', r.status(), await r.text()); process.exit(1); }
  await ctx.close();
  const persist = process.env.HF_PERSIST ? ['--persist-to', process.env.HF_PERSIST] : [];
  const sql = `INSERT INTO orders (id, account_id, course_slug, amount_cents, method, status, provider, created_at, paid_at)
    SELECT 'HFa11y' || id, id, 'alfabetizacao', 0, 'pix', 'paid', 'manual', unixepoch()*1000, unixepoch()*1000 FROM accounts WHERE email = '${email}';
    INSERT OR REPLACE INTO entitlements (account_id, course_slug, granted_at, expires_at, order_id)
    SELECT id, 'alfabetizacao', unixepoch()*1000, unixepoch()*1000 + 31536000000, 'HFa11y' || id FROM accounts WHERE email = '${email}'`;
  /* O nome do banco sai do wrangler.toml deste repositório (fluent-hebrew). */
  const banco = (readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8').match(/^database_name\s*=\s*"([^"]+)"/m) || [])[1];
  execFileSync('npx', ['wrangler', 'd1', 'execute', banco, '--local', ...persist, '--command', sql],
    { cwd: new URL('..', import.meta.url), stdio: 'ignore' });
  ok('conta nova com o curso liberado no D1 local');
}

/* ── as telas ───────────────────────────────────────────────────────────── */
const TELAS = ['/meu-hebraico/', '/licao/alef/', '/vocabulario/', '/revisao/', '/perfil/',
  '/mapa/', '/conquistas/', '/academia/', '/loja/'];

for (const largura of [360, 390]) {
  for (const texto of [100, 150]) {
    const ctx = await navegador.newContext({ viewport: { width: largura, height: 800 }, deviceScaleFactor: 2 });
    await ctx.addInitScript(t => {
      try { localStorage.setItem('hf-acessibilidade-v1', JSON.stringify({ texto: t })); } catch { /* sem armazenamento */ }
    }, texto);
    const p = await ctx.newPage();
    await p.goto(`${BASE}/entrar/`, { waitUntil: 'load' });
    await p.locator('#email').fill(email);
    await p.locator('#senha').fill(senha);
    await p.locator('form button[type="submit"]').click();
    await p.waitForURL(u => !u.pathname.startsWith('/entrar'), { timeout: 20_000 }).catch(() => {});

    for (const tela of TELAS) {
      await p.goto(`${BASE}${tela}`, { waitUntil: 'load' });
      await p.waitForTimeout(1200);
      const m = await p.evaluate(() => ({
        rota: location.pathname,
        larg: document.documentElement.scrollWidth,
        vis: document.documentElement.clientWidth,
        main: !!document.querySelector('main'),
        texto: document.documentElement.getAttribute('data-a11y-texto')
      }));
      const nome = `${tela} a ${largura}px, texto ${texto}%`;
      if (!m.rota.startsWith(tela.replace(/\/$/, ''))) { erro(`${nome}: foi para ${m.rota} (sem acesso?)`); continue; }
      if (!m.main) { erro(`${nome}: sem <main>`); continue; }
      if (texto === 150 && m.texto !== '150') { erro(`${nome}: o ajuste de texto não foi aplicado`); continue; }
      if (m.larg > m.vis + 1) erro(`${nome}: mais larga que a tela (${m.larg}px em ${m.vis}px)`);
      else ok(`${nome}: cabe na tela`);
    }
    await ctx.close();
  }
}

await navegador.close();
console.log(falhas ? `\n${falhas} problema(s).` : '\nas telas do curso cabem no celular, também com o texto em 150%.');
process.exit(falhas ? 1 : 0);
