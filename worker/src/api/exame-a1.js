/* O exame final do A1 e o certificado, no servidor (06/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O exame do alfabeto é corrigido no navegador, e o certificado dele sai do
 * progresso que o próprio navegador guarda: dá para "passar" mexendo no
 * estado. O do A1 não: aqui está o gabarito, aqui se sorteia a prova, aqui
 * se corrige, e é a aprovação gravada em `provas_a1` que libera o
 * certificado. O app só desenha.
 *
 *   POST /api/a1/exame/iniciar     sorteia uma prova e devolve SEM gabarito
 *   POST /api/a1/exame/entregar    corrige as respostas e grava a nota
 *   GET  /api/a1/certificado       o certificado da conta (e se já pode tê-lo)
 *   POST /api/a1/certificado       emite, com o nome confirmado pelo aluno
 *   POST /api/a1/certificado/publico   liga ou desliga a verificação pública
 *   GET  /api/certificado?id=…     a verificação pública: nome, curso, data
 *
 * O sorteio e a correção moram em app/src/lib/a1-prova.ts, um arquivo sem
 * dependências que o Worker importa direto (o esbuild do wrangler lê TS).
 */

import { fail, json, notSignedIn, readJson } from '../lib/http.js';
import { hasEntitlement, throttled } from '../lib/db.js';
import { ip, requireAccount } from './auth.js';
import { CURSO_A1 } from './content-a1.js';
import exame from '../../../app/content/a1-exame.json';
import { AUDIO_MANIFEST } from '../../../app/src/lib/audio-manifest.ts';
import { corrigir, provaPublica, sortear } from '../../../app/src/lib/a1-prova.ts';

/* Cinco provas por dia: tempo de sobra para quem estuda, e um teto para quem
   tentasse sortear o banco inteiro para decorar. */
const PROVAS_POR_DIA = 5;
const DIA_MS = 86_400_000;
/* Uma prova vale por 4 horas. Depois, sorteia-se outra. */
const VALIDADE_MS = 4 * 3_600_000;

const aleatorio = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
const hex = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');
/* O código do certificado: sem 0/O, 1/I/L, para ser ditado e digitado. */
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const codigo = () => 'A1-' + [...crypto.getRandomValues(new Uint8Array(8))].map(b => ALFABETO[b % ALFABETO.length]).join('');

/** Que gravações existem: as do site (o manifesto da build) e as do painel. */
async function gravadas(env, ids) {
  const set = new Set(AUDIO_MANIFEST);
  const faltam = ids.filter(id => id && !set.has(id));
  if (faltam.length) {
    try {
      const marcas = faltam.map(() => '?').join(',');
      const r = await env.DB.prepare(`SELECT audio_id FROM gravacoes WHERE audio_id IN (${marcas})`).bind(...faltam).all();
      for (const row of r.results || []) set.add(row.audio_id);
    } catch { /* sem a tabela, só o manifesto */ }
  }
  return set;
}

async function comA1(request, env) {
  const account = await requireAccount(request, env);
  if (!account) return { erro: notSignedIn() };
  if (!await hasEntitlement(env, account.id, CURSO_A1)) return { erro: fail('not-owned', 403) };
  return { account };
}

export async function iniciar({ request, env }) {
  const { account, erro } = await comA1(request, env);
  if (erro) return erro;
  if (await throttled(env, `prova-a1:${account.id}`, PROVAS_POR_DIA, DIA_MS)) return fail('limite', 429);

  const ids = exame.partes.flatMap(p => p.itens.map(i => i.audioId)).filter(Boolean);
  const temAudio = await gravadas(env, ids);
  const sorteio = sortear(exame, aleatorio, id => !!id && temAudio.has(id));
  const id = hex(16);
  const agora = Date.now();
  await env.DB.prepare('INSERT INTO provas_a1 (id, account_id, sorteio, criada_em) VALUES (?, ?, ?, ?)')
    .bind(id, account.id, JSON.stringify(sorteio), agora).run();
  return json({
    prova: id,
    aprovacao: exame.aprovacao,
    expiraEm: new Date(agora + VALIDADE_MS).toISOString(),
    partes: provaPublica(exame, sorteio),
    fora: exame.partes.filter(p => !sorteio.some(s => exame.partes[s.p].id === p.id)).map(p => p.id)
  });
}

export async function entregar({ request, env }) {
  const { account, erro } = await comA1(request, env);
  if (erro) return erro;
  const b = await readJson(request, 32 * 1024);
  if (!b || typeof b.prova !== 'string' || !/^[0-9a-f]{32}$/.test(b.prova) || !Array.isArray(b.respostas)) {
    return fail('invalid', 400);
  }
  const row = await env.DB.prepare(
    'SELECT sorteio, criada_em, entregue_em FROM provas_a1 WHERE id = ? AND account_id = ?'
  ).bind(b.prova, account.id).first();
  if (!row) return fail('not-found', 404);
  if (row.entregue_em) return fail('ja-entregue', 409);
  if (Date.now() - Number(row.criada_em) > VALIDADE_MS) return fail('expirada', 410);

  const sorteio = JSON.parse(row.sorteio);
  if (b.respostas.length !== sorteio.length) return fail('invalid', 400);
  const c = corrigir(exame, sorteio, b.respostas);
  /* Só grava se ainda não estava entregue: duas entregas da mesma prova ao
     mesmo tempo não viram duas notas. */
  const r = await env.DB.prepare(
    'UPDATE provas_a1 SET entregue_em = ?, nota = ?, partes = ? WHERE id = ? AND entregue_em IS NULL'
  ).bind(Date.now(), c.nota, JSON.stringify(c.partes), b.prova).run();
  if (!r.meta || !r.meta.changes) return fail('ja-entregue', 409);
  return json({ ...c, aprovacao: exame.aprovacao });
}

/** A melhor prova aprovada da conta, ou null. */
async function aprovacaoDa(env, accountId) {
  return env.DB.prepare(
    `SELECT nota, entregue_em FROM provas_a1
      WHERE account_id = ? AND entregue_em IS NOT NULL AND nota >= ?
      ORDER BY nota DESC, entregue_em ASC LIMIT 1`
  ).bind(accountId, exame.aprovacao).first();
}

const publicoDe = c => ({
  id: c.id, nome: c.nome, curso: 'Hebraico A1',
  aprovadoEm: new Date(Number(c.aprovado_em)).toISOString(),
  emitidoEm: new Date(Number(c.emitido_em)).toISOString(),
  publico: !!c.publico, nota: Number(c.nota)
});

export async function meuCertificado({ request, env }) {
  const { account, erro } = await comA1(request, env);
  if (erro) return erro;
  const c = await env.DB.prepare('SELECT * FROM certificados WHERE account_id = ? AND curso = ?')
    .bind(account.id, CURSO_A1).first();
  const ap = await aprovacaoDa(env, account.id);
  return json({
    aprovado: !!ap,
    melhorNota: ap ? Number(ap.nota) : null,
    nomeSugerido: account.name || '',
    certificado: c ? publicoDe(c) : null
  });
}

/* O nome que vai no certificado: letras (com acento), espaço, hífen,
   apóstrofo e ponto; de 3 a 80 caracteres. O aluno confirma antes de emitir:
   depois, não muda, porque o código público aponta para ele. */
const NOME = /^[\p{L}][\p{L} '.-]{1,78}[\p{L}.]$/u;

export async function emitirCertificado({ request, env }) {
  const { account, erro } = await comA1(request, env);
  if (erro) return erro;
  const b = await readJson(request, 2048);
  const nome = typeof b?.nome === 'string' ? b.nome.normalize('NFC').replace(/\s+/g, ' ').trim() : '';
  if (!NOME.test(nome)) return fail('nome-invalido', 400);
  const ap = await aprovacaoDa(env, account.id);
  if (!ap) return fail('nao-aprovado', 403);
  const existente = await env.DB.prepare('SELECT * FROM certificados WHERE account_id = ? AND curso = ?')
    .bind(account.id, CURSO_A1).first();
  if (existente) return json({ certificado: publicoDe(existente) }, 200);
  const novo = {
    id: codigo(), account_id: account.id, curso: CURSO_A1, nome, nota: Number(ap.nota),
    aprovado_em: Number(ap.entregue_em), emitido_em: Date.now(), publico: b?.publico === false ? 0 : 1
  };
  await env.DB.prepare(
    `INSERT INTO certificados (id, account_id, curso, nome, nota, aprovado_em, emitido_em, publico)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (account_id, curso) DO NOTHING`
  ).bind(novo.id, novo.account_id, novo.curso, novo.nome, novo.nota, novo.aprovado_em, novo.emitido_em, novo.publico).run();
  const gravado = await env.DB.prepare('SELECT * FROM certificados WHERE account_id = ? AND curso = ?')
    .bind(account.id, CURSO_A1).first();
  return json({ certificado: publicoDe(gravado) }, 201);
}

export async function trocarPublico({ request, env }) {
  const { account, erro } = await comA1(request, env);
  if (erro) return erro;
  const b = await readJson(request, 512);
  if (typeof b?.publico !== 'boolean') return fail('invalid', 400);
  await env.DB.prepare('UPDATE certificados SET publico = ? WHERE account_id = ? AND curso = ?')
    .bind(b.publico ? 1 : 0, account.id, CURSO_A1).run();
  return json({ ok: true, publico: b.publico });
}

/** A verificação pública. Sem sessão, com freio por IP, e só o necessário:
 *  nome, curso e datas. A nota não sai daqui. */
export async function verificar({ request, env }) {
  if (await throttled(env, `verif:${ip(request)}`, 30, 60_000)) return fail('limite', 429);
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^A1-[A-Z2-9]{8}$/.test(id)) return fail('not-found', 404);
  const c = await env.DB.prepare('SELECT * FROM certificados WHERE id = ? AND publico = 1').bind(id).first();
  if (!c) return fail('not-found', 404);
  const { nota: _nota, publico: _publico, ...resto } = publicoDe(c);
  void _nota; void _publico;
  return json(resto);
}
