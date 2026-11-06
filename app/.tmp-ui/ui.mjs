import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const B = 'http://127.0.0.1:8787';
const MAIL = readFileSync('/tmp/claude-0/ui-mail', 'utf8').trim();
const _d = JSON.parse(readFileSync(new URL('../../data/letters.json', import.meta.url))); const ids = (Array.isArray(_d) ? _d : _d.letters).map(l => l.id);
const ok = (c, m) => console.log(`${c ? '✓' : '✗'} ${m}`);
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

// 1. 404 para visitante
{
  const ctx = await br.newContext(); const p = await ctx.newPage();
  await p.goto(`${B}/nao-existe-xyz/`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  ok(!p.url().includes('/entrar'), `404: ficou em ${new URL(p.url()).pathname}`);
  ok((await p.textContent('body')).includes('Esta página não existe'), '404: mostra "Esta página não existe"');
  await ctx.close();
}

const ctx = await br.newContext(); const p = await ctx.newPage();
const r = await p.request.post(`${B}/api/auth/login`, { data: { email: MAIL, password: 'senha-boa-123' } });
ok(r.ok(), `login ${r.status()}`);

// 2. sessão cai no meio da lição
await p.goto(`${B}/licao/alef/`, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await ctx.clearCookies();
const falhas = [];
p.on('response', res => { if (res.url().includes('/api/progress') && res.request().method() === 'PUT') falhas.push(res.status()); });
for (let i = 0; i < 8 && !(await p.getByText('Sua sessão terminou').count()); i++) {
  const bt = p.getByRole('button', { name: /Continuar|Próxima etapa|Próximo|Entendi/ }).first();
  if (await bt.count()) { await bt.click().catch(() => {}); await p.waitForTimeout(900); } else break;
}
ok(falhas.includes(401), `PUT /api/progress sem cookie: ${falhas.join(',') || 'nenhum PUT'}`);
ok(await p.getByText('Sua sessão terminou').count() > 0, 'aviso "Sua sessão terminou" apareceu');
const link = await p.getByRole('link', { name: 'Entrar de novo' }).getAttribute('href').catch(() => null);
ok(link && link.includes('next=%2Flicao%2Falef'), `link volta para a lição: ${link}`);

// 3. exame sobrevive a recarregar
const r2 = await p.request.post(`${B}/api/auth/login`, { data: { email: MAIL, password: 'senha-boa-123' } });
await p.goto(`${B}/perfil/`, { waitUntil: 'networkidle' });
await p.evaluate(ids => {
  const s = JSON.parse(localStorage.getItem('hebraico-fluente-v1') || '{}');
  s.lessons = s.lessons || {};
  for (const id of ids) s.lessons[id] = { ...(s.lessons[id] || {}), stagesDone: [0, 1, 2, 3, 4], quizBest: 1 };
  localStorage.setItem('hebraico-fluente-v1', JSON.stringify(s));
}, ids);
await p.goto(`${B}/desafio-final/`, { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
ok(!(await p.getByText('ainda está trancado').count()), 'exame destravado');
await p.getByRole('button', { name: /Começar/ }).first().click();
await p.waitForTimeout(500);
ok(await p.getByText(/Parte 1 de \d+/).count() > 0, 'abriu a parte 1');
await p.getByRole('button', { name: /Começar/ }).first().click();
await p.waitForTimeout(800);
await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
ok(await p.getByText(/Parte 1 de \d+/).count() > 0, 'depois de recarregar: voltou à parte 1, não à abertura');
const salvo = await p.evaluate(() => JSON.parse(localStorage.getItem('hf-exame-em-andamento-v1')));
await p.evaluate(s => localStorage.setItem('hf-exame-em-andamento-v1', JSON.stringify({ ...s, index: 2,
  results: [{ partId: 'a', correct: 4, total: 5 }, { partId: 'b', correct: 5, total: 5 }], em: Date.now() })), salvo);
await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
ok(await p.getByText(/Parte 3 de \d+/).count() > 0, 'com duas partes feitas: volta à parte 3');
ok(await p.getByText('As partes 1 a 2 já estão contadas').count() > 0, 'e diz que as partes 1 e 2 já contam');
await p.evaluate(s => localStorage.setItem('hf-exame-em-andamento-v1', JSON.stringify({ ...s, em: Date.now() - 25 * 3600e3 })), salvo);
await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
ok(!(await p.getByText(/Parte \d+ de \d+/).count()), 'exame de mais de 24 h não é retomado');
await br.close();
