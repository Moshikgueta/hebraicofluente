// Ponta a ponta, num navegador de verdade, a 390 px.
//
//   npm run e2e            (servidor de desenvolvimento)
//   E2E_PROD=1 npm run e2e (usa a build de producao: rode npm run build antes)
//
// Monta um banco PGlite proprio em .data/e2e (nunca toca no de desenvolvimento),
// carrega a biblioteca, cria um superadministrador e percorre:
//   1. superadministrador define a senha, entra, cria uma agencia e um acesso;
//   2. a agencia define a senha, cria a caravana, monta o roteiro, escolhe o
//      conteudo, publica e cria convites;
//   3. o viajante abre o link do convite e entra;
//   4. o visitante da demonstracao faz um quiz, ganha o selo e ve o passaporte;
//   5. o painel da demonstracao recusa escrita;
//   6. a outra agencia nao abre a caravana da primeira.
// Em cada tela: sem rolagem lateral e sem erro de console.

import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = 3200;
const BASE = `http://localhost:${PORT}`;
const DIR = '.data/e2e';
const env = { MCD_SECRET: 'segredo-local-do-e2e-com-mais-de-32-caracteres', ...process.env, MCD_PGLITE_DIR: `${DIR}/pglite`, MCD_PUBLIC_URL: BASE, NEXT_TELEMETRY_DISABLED: '1', MCD_PBKDF2_ITERATIONS: '20000' };
const tsx = (script, args = []) => execFileSync('npx', ['tsx', '--tsconfig', 'tsconfig.json', script, ...args], { env, encoding: 'utf8' });

rmSync(DIR, { recursive: true, force: true });
mkdirSync(DIR, { recursive: true });
tsx('scripts/seed.ts');
const adminLink = /(http\S+definir-senha\S+)/.exec(tsx('scripts/create-user.ts', ['--email', 'super@plataforma.test', '--name', 'Super Admin', '--platform']))[1];

try {
  await fetch(BASE);
  console.error(`A porta ${PORT} ja esta em uso. Pare o processo antes de rodar o e2e.`);
  process.exit(1);
} catch {
  /* livre */
}
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', process.env.E2E_PROD ? 'start' : 'dev', '--port', String(PORT)], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = '';
server.stdout.on('data', (d) => (serverLog += d));
server.stderr.on('data', (d) => (serverLog += d));
for (let i = 0; i < 90; i++) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {
    /* subindo */
  }
  await new Promise((r) => setTimeout(r, 1000));
}

let failures = 0;
const ok = (cond, msg) => {
  if (cond) console.log(`  ok  ${msg}`);
  else {
    failures++;
    console.log(`  FALHOU  ${msg}`);
  }
};

const browser = await chromium.launch({ executablePath: process.env.MCD_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('console', (m) => m.type() === 'error' && page.errors.push(m.text()));
  page.on('pageerror', (e) => page.errors.push(String(e)));
  return page;
}
async function check(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(overflow <= 0, `${label}: sem rolagem lateral (${overflow}px)`);
  const errs = page.errors.splice(0);
  ok(errs.length === 0, `${label}: sem erro de console${errs.length ? ` -> ${errs.join(' | ')}` : ''}`);
}
const go = async (page, path) => {
  await page.goto(path.startsWith('http') ? path : `${BASE}${path}`, { waitUntil: 'networkidle' });
};
const text = (page) => page.locator('body').innerText();
// Espera o texto aparecer (a navegacao termina antes de a pagina pintar).
const seeText = async (page, str) => {
  try {
    await page.getByText(str, { exact: false }).first().waitFor({ timeout: 10000 });
    return true;
  } catch {
    return false;
  }
};

try {
  // ── 1. Superadministrador ──────────────────────────────────────────────
  console.log('1. Superadministrador');
  const sa = await newPage();
  await go(sa, adminLink);
  await sa.fill('#password', 'senha-forte-do-admin');
  await sa.fill('#confirm', 'senha-forte-do-admin');
  await sa.click('button[type=submit]');
  await sa.waitForURL(/\/entrar\?senha=1/);
  await sa.fill('#email', 'super@plataforma.test');
  await sa.fill('#password', 'senha-forte-do-admin');
  await sa.click('button[type=submit]');
  await sa.waitForURL(/\/admin/);
  ok(await seeText(sa, 'Agências ativas'), 'entra no painel da plataforma');
  await check(sa, '/admin');
  await go(sa, '/admin/agencias');
  await sa.fill('#f-name', 'Rotas Teste Viagens');
  await sa.fill('#f-defaultSeatLimit', '3');
  await sa.click('text=Criar agência');
  await sa.waitForURL(/\/admin\/agencias\/[0-9a-f-]+\?ok=criado/);
  ok(await seeText(sa, 'Rotas Teste Viagens'), 'cria a agência');
  await sa.fill('#u-name', 'Gerente Teste');
  await sa.fill('#u-email', 'gerente@rotas.test');
  await sa.click('text=Gerar link de acesso');
  await sa.waitForSelector('text=definir a senha (vale uma vez');
  const agencyLink = /(http\S+definir-senha\?token=\S+)/.exec(await text(sa))[1];
  ok(Boolean(agencyLink), 'gera o link de acesso da agência');
  await check(sa, '/admin/agencias/[id]');
  // segunda agencia, para o teste de isolamento
  await go(sa, '/admin/agencias');
  await sa.fill('#f-name', 'Outra Agencia');
  await sa.click('text=Criar agência');
  await sa.waitForURL(/\/admin\/agencias\/[0-9a-f-]+/);
  await sa.fill('#u-name', 'Outra Pessoa');
  await sa.fill('#u-email', 'outra@outra.test');
  await sa.click('text=Gerar link de acesso');
  await sa.waitForSelector('text=definir a senha (vale uma vez');
  const otherLink = /(http\S+definir-senha\?token=\S+)/.exec(await text(sa))[1];
  for (const p of ['/admin/biblioteca', '/admin/biblioteca/massada', '/admin/hebraico', '/admin/atividades', '/admin/planos', '/admin/auditoria']) {
    await go(sa, p);
    await check(sa, p);
  }

  // ── 2. Agencia ─────────────────────────────────────────────────────────
  console.log('2. Agência');
  const ag = await newPage();
  await go(ag, agencyLink);
  await ag.fill('#password', 'senha-forte-da-agencia');
  await ag.fill('#confirm', 'senha-forte-da-agencia');
  await ag.click('button[type=submit]');
  await ag.waitForURL(/\/entrar/);
  await ag.fill('#email', 'gerente@rotas.test');
  await ag.fill('#password', 'senha-forte-da-agencia');
  await ag.click('button[type=submit]');
  await ag.waitForURL(/\/painel/);
  await check(ag, '/painel');
  await go(ag, '/painel/caravanas/nova');
  await ag.fill('#f-name', 'Caravana Teste Jerusalém');
  await ag.fill('#f-start', '2027-09-01');
  await ag.fill('#f-end', '2027-09-02');
  await ag.click('text=Criar e seguir para o roteiro');
  await ag.waitForURL(/\/roteiro\?ok=criado/);
  const carBase = ag.url().split('/roteiro')[0];
  await ag.fill('#nd-title', 'Cidade Antiga');
  await ag.click('button:has-text("Adicionar dia")');
  await ag.waitForURL(/ok=salvo/);
  await ag.click('summary:has-text("+ Adicionar parada")');
  await ag.locator('input[name=title][id^=nt-]').fill('Muro Ocidental');
  await ag.locator('input[name=timeLabel][id^=nh-]').fill('09:00');
  await ag.locator('select[id^=nd-]').selectOption({ label: 'Muro Ocidental' });
  await ag.click('button:has-text("Adicionar parada")');
  await ag.waitForURL(/ok=salvo/);
  ok(await seeText(ag, '09:00 · Muro Ocidental'), 'parada criada com horário');
  await check(ag, 'roteiro');
  await go(ag, `${carBase.replace(BASE, '')}/conteudo`);
  ok(await ag.locator('label:has-text("Muro Ocidental") input[type=checkbox]').isChecked(), 'destino da parada vem sugerido no conteúdo');
  await check(ag, 'conteudo');
  for (const step of ['geral', 'identidade', 'atividades', 'informacoes', 'previa']) {
    await go(ag, `${carBase.replace(BASE, '')}/${step}`);
    await check(ag, step);
  }
  await go(ag, `${carBase.replace(BASE, '')}/publicacao`);
  await check(ag, 'publicacao');
  await ag.check('input[name=confirm]');
  await ag.click('button:has-text("Publicar caravana")');
  await ag.waitForURL(/ok=publicado/);
  ok(await seeText(ag, 'Versão 1'), 'publica a versão 1');
  await go(ag, `${carBase.replace(BASE, '')}/convites`);
  await ag.fill('textarea[name=names]', 'Ana\nBruno\nCarla\nDiego');
  await ag.click('button:has-text("Criar convites")');
  await ag.waitForURL(/convites/);
  ok(await seeText(ag, 'Limite de vagas do contrato atingido'), 'o banco recusa o quarto convite num contrato de 3 vagas');
  await ag.fill('textarea[name=names]', 'Ana\nBruno');
  await ag.click('button:has-text("Criar convites")');
  await ag.waitForURL(/ok=convites/);
  await ag.locator('summary:has-text("Ana")').click();
  const inviteLink = /(http\S+\/entrar\?codigo=\S+)/.exec(await text(ag))[1];
  ok(Boolean(inviteLink), 'mostra o link pessoal do convite');
  await check(ag, 'convites');

  // ── 3. Viajante pelo convite ───────────────────────────────────────────
  console.log('3. Viajante pelo convite');
  const tr = await newPage();
  await go(tr, inviteLink);
  await check(tr, 'entrada');
  await tr.click('button:has-text("Entrar na caravana")');
  await tr.waitForURL((u) => /\/c\/[a-z0-9-]+$/.test(u.pathname));
  ok(await seeText(tr, 'Shalom, Ana!'), 'entra e é cumprimentada pelo nome');
  await check(tr, 'boas-vindas (convite)');
  await go(tr, `${new URL(tr.url()).pathname}/descubra/muro-ocidental`);
  ok(await seeText(tr, 'Conteúdo em preparação'), 'agência real: texto em revisão não aparece');

  // ── 4. Viajante da demonstracao ────────────────────────────────────────
  console.log('4. Viajante da demonstração');
  const dv = await newPage();
  await go(dv, '/demo');
  await check(dv, '/demo');
  await dv.click('button:has-text("Entrar como viajante")');
  await dv.waitForURL(/\/c\/descubra-israel-2027$/);
  const demo = '/c/descubra-israel-2027';
  for (const p of ['', '/roteiro', '/roteiro/5', '/descubra', '/descubra/massada', '/hebraico', '/atividades', '/passaporte', '/informacoes', '/depois']) {
    await go(dv, `${demo}${p}`);
    await check(dv, `viajante ${p || '/'}`);
  }
  await go(dv, `${demo}/hebraico`);
  await dv.click('label:has-text("Mostrar as vogais")');
  ok(await seeText(dv, 'שָׁלוֹם'), 'mostra o nikud quando pedido');
  await go(dv, `${demo}/atividades/quiz-massada`);
  // pergunta 1: erra, tenta de novo, acerta
  await dv.click('button:has-text("O rei Salomão")');
  await dv.waitForSelector('text=Não é essa.');
  ok(true, 'erro recebe retorno imediato');
  await dv.click('button:has-text("Tentar de novo")');
  await dv.click('button:has-text("Herodes, o Grande")');
  await dv.waitForSelector('text=Isso mesmo.');
  await dv.click('button:has-text("Próxima pergunta")');
  await dv.click('button:has-text("Flávio Josefo")');
  await dv.waitForSelector('text=Isso mesmo.');
  await dv.click('button:has-text("Próxima pergunta")');
  // pergunta 3: pede a resposta e toca na destacada
  await dv.click('button:has-text("Falso")');
  await dv.waitForSelector('text=Não é essa.');
  await dv.click('button:has-text("Ver a resposta")');
  await dv.waitForSelector('text=Toque na opção destacada');
  await dv.click('button:has-text("Verdadeiro")');
  await dv.waitForSelector('text=Isso mesmo.');
  await dv.click('button:has-text("Próxima pergunta")');
  await dv.click('button:has-text("Fortaleza")');
  await dv.waitForSelector('text=Isso mesmo.');
  await dv.click('button:has-text("Concluir")');
  await dv.waitForSelector('text=Atividade concluída');
  ok(await seeText(dv, 'Você acertou 2 de 4 na primeira tentativa.'), 'placar de primeira tentativa correto');
  ok(await dv.locator('[aria-label="Selo conquistado: Explorador de Massada"]').count(), 'selo novo aparece ao concluir');
  await check(dv, 'quiz concluído');
  await go(dv, `${demo}/passaporte`);
  ok(await seeText(dv, '1 de 7 selos'), 'passaporte mostra o selo');
  // pares
  await go(dv, `${demo}/atividades/hebraico-placas`);
  await dv.click('button:has-text("Entrada")');
  await dv.click('button:has-text("Próxima pergunta")');
  await dv.click('button:has-text("Saída")');
  await dv.click('button:has-text("Próxima pergunta")');
  await dv.locator('button', { hasText: 'שירותים' }).click();
  await dv.click('button:has-text("Próxima pergunta")');
  for (const [i, v] of ['fechado', 'aberto', 'à direita', 'à esquerda'].entries()) await dv.selectOption(`#par-${i}`, v);
  await dv.click('button:has-text("Conferir")');
  await dv.waitForSelector('text=Isso mesmo.');
  ok(true, 'ligar pares confere no servidor');
  await check(dv, 'pares');
  // datas simuladas
  await go(dv, demo);
  await dv.click('button:has-text("Durante (dia 4)")');
  await dv.waitForSelector('text=dia da viagem');
  ok(await seeText(dv, 'Ver o dia de hoje'), 'modo durante a viagem destaca o dia');
  await dv.click('button:has-text("Depois da volta")');
  await dv.waitForSelector('text=Viagem concluída');
  ok(true, 'modo depois da viagem');

  // ── 5. Painel da demonstracao e somente leitura ────────────────────────
  console.log('5. Painel da demonstração');
  const dp = await newPage();
  await go(dp, '/demo');
  await dp.click('button:has-text("Ver o painel da agência")');
  await dp.waitForURL(/\/painel$/);
  ok(await seeText(dp, 'viajantes fictícios'), 'painel da demonstração avisa que os dados são fictícios');
  await check(dp, 'painel demo');
  await dp.click('a:has-text("Caravana Descubra Israel 2027")');
  await dp.waitForURL(/\/geral/);
  ok(await dp.locator('fieldset[disabled]').count(), 'formulários desabilitados para leitura');
  // forca o envio mesmo assim: o servidor recusa
  await dp.evaluate(() => {
    document.querySelectorAll('fieldset').forEach((f) => f.removeAttribute('disabled'));
  });
  await dp.fill('#f-name', 'Tentativa de alteração');
  await dp.click('button:has-text("Salvar informações")');
  await dp.waitForURL(/erro=demo/);
  ok(await seeText(dp, 'nada foi salvo'), 'servidor recusa escrita no modo demonstração');
  ok(!(await text(dp)).includes('Tentativa de alteração'), 'nome continua o mesmo');

  // ── 6. Isolamento pelo navegador ───────────────────────────────────────
  console.log('6. Isolamento');
  const ot = await newPage();
  await go(ot, otherLink);
  await ot.fill('#password', 'senha-forte-da-outra');
  await ot.fill('#confirm', 'senha-forte-da-outra');
  await ot.click('button[type=submit]');
  await ot.waitForURL(/\/entrar/);
  await ot.fill('#email', 'outra@outra.test');
  await ot.fill('#password', 'senha-forte-da-outra');
  await ot.click('button[type=submit]');
  await ot.waitForURL(/\/painel/);
  const res = await ot.goto(`${carBase}/geral`);
  ok(res.status() === 404, `outra agência recebe 404 na caravana da primeira (${res.status()})`);
  const res2 = await ot.goto(`${BASE}/admin`);
  ok(res2.status() === 404, `agência não abre a superadministração (${res2.status()})`);
} catch (e) {
  failures++;
  console.error('ERRO NO ROTEIRO:', e);
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
if (failures) {
  console.log(`\n${failures} falha(s).`);
  if (process.env.E2E_LOG) console.log(serverLog.slice(-4000));
  process.exit(1);
}
console.log('\nTudo certo.');
