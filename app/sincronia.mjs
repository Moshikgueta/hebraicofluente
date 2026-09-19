/* O progresso atravessando dois aparelhos, de verdade.
   ────────────────────────────────────────────────────────────────────────
   Contra o Worker rodando (npm run dev:worker, porta 8788) e o D1 local.
   Uma conta, dois contextos de navegador com estados DIFERENTES no
   localStorage - é o celular e o notebook. O que se prova aqui é a frase que
   justifica a tabela `progress` existir: ninguém perde trabalho.

     1. o aparelho A estudou o Mem e sobe sozinho ao abrir o site;
     2. o aparelho B, que estudou o Tav, encontra o Mem ao abrir;
     3. o aparelho A, recarregado, encontra o Tav;
     4. apagar progresso num aparelho limpa também o servidor.

   Roda com: node sincronia.mjs   (variável HF_CHROMIUM para o navegador) */

import { chromium } from 'playwright';

const BASE = process.env.HF_BASE || 'http://127.0.0.1:8788';
const hoje = new Date().toISOString().slice(0, 10);
const email = `sync-${Date.now()}@hebraico.test`;

const licao = id => ({
  letterId: id, stagesDone: [1, 2, 3, 4, 5], quizBest: 1, quizAttempts: 1,
  perfectBonusPaid: true, completedAt: new Date().toISOString()
});

const estado = (licoes, xp) => ({
  version: 2,
  onboarding: { reason: 'familia', goalMinutes: 10, startingPoint: 'zero', name: 'M', completedAt: new Date().toISOString() },
  xp,
  lessons: Object.fromEntries(licoes.map(id => [id, licao(id)])),
  checkpoints: {}, srs: {}, achievements: [],
  days: { [hoje]: { answered: 4, units: 8, xp, goalMet: false } },
  streak: { current: 1, longest: 1, lastDay: hoje },
  lastRoute: null, finalChallenge: { best: null, completedAt: null },
  skills: {}, confusions: {}, firsts: {}, gym: {}
});

/* ── a conta ────────────────────────────────────────────────────────────── */
const cadastro = await fetch(`${BASE}/api/auth/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Sincronia', email, password: 'senha-de-teste-123' })
});
if (!cadastro.ok) {
  console.error('não deu para criar a conta:', cadastro.status, await cadastro.text());
  process.exit(1);
}
const bruto = cadastro.headers.get('set-cookie') || '';
const valor = (bruto.match(/hf_session=([^;]+)/) || [])[1];
if (!valor) { console.error('sem cookie de sessão na resposta'); process.exit(1); }

const comCookie = (extra = {}) => ({
  headers: { Cookie: `hf_session=${valor}`, ...extra }
});

const servidor = async () => {
  const r = await fetch(`${BASE}/api/progress`, comCookie());
  const j = await r.json();
  return {
    rev: j.rev,
    letras: j.state ? Object.keys(j.state.lessons || {}).sort() : [],
    xp: j.state ? j.state.xp : null
  };
};

/* ── os dois aparelhos ──────────────────────────────────────────────────── */
const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });
const erros = [];
const url = new URL(BASE);

async function aparelho(nome, semente) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addCookies([{
    name: 'hf_session', value: valor, domain: url.hostname, path: '/',
    httpOnly: true, secure: false, sameSite: 'Lax'
  }]);
  if (semente) {
    await ctx.addInitScript(s => {
      try { localStorage.setItem('hebraico-fluente-v1', s); } catch { /* */ }
    }, JSON.stringify(semente));
  }
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error') erros.push(`${nome}: ${m.text()}`); });
  p.on('pageerror', e => erros.push(`${nome} pageerror: ${e.message}`));
  return { ctx, p };
}

const leLocal = p => p.evaluate(() => {
  try {
    const s = JSON.parse(localStorage.getItem('hebraico-fluente-v1') || '{}');
    return { letras: Object.keys(s.lessons || {}).sort(), xp: s.xp ?? null };
  } catch { return { letras: [], xp: null }; }
});

const abrir = async p => {
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1400);            /* load + fusão + PUT */
};

console.log('\n  SINCRONIA ENTRE APARELHOS\n');
console.log(`  conta: ${email}`);
console.log('  servidor no começo:', JSON.stringify(await servidor()));

/* 1. o celular estudou o Mem e abre o site */
const A = await aparelho('celular', estado(['mem'], 120));
await abrir(A.p);
console.log('  1) celular abre  → servidor:', JSON.stringify(await servidor()));

/* 2. o notebook estudou o Tav e abre o site */
const B = await aparelho('notebook', estado(['tav'], 90));
await abrir(B.p);
console.log('  2) notebook abre → local:   ', JSON.stringify(await leLocal(B.p)));
console.log('                     servidor:', JSON.stringify(await servidor()));

/* 3. o celular recarrega e encontra o que o notebook fez */
await abrir(A.p);
console.log('  3) celular volta → local:   ', JSON.stringify(await leLocal(A.p)));

/* 3b. e abrir de novo, sem nada novo, NÃO pode gravar: `rev` tem de ficar
   parada. Se ela subir a cada carregamento, todo aluno escreve no D1 em toda
   página que abre, para sempre. */
const antes = (await servidor()).rev;
await abrir(A.p);
await abrir(B.p);
const depois = (await servidor()).rev;
console.log(`  3b) duas aberturas sem novidade → rev ${antes} → ${depois}`,
            depois === antes ? '(não gravou, certo)' : '(GRAVOU À TOA)');

/* 4. apagar num aparelho apaga no servidor */
await A.p.evaluate(async () => {
  await fetch('/api/progress', { method: 'DELETE', credentials: 'same-origin' });
});
console.log('  4) apagou        → servidor:', JSON.stringify(await servidor()));

console.log('\n  erros de console:', erros.length ? erros.slice(0, 3) : 'nenhum', '\n');
await b.close();
