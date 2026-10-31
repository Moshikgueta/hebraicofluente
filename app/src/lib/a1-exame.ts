/* O exame e o certificado do A1, do lado do app (06/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Só chamadas: quem sorteia, corrige e emite é o Worker
 * (worker/src/api/exame-a1.js). O app nunca vê o gabarito antes de entregar.
 *
 * Na build de demonstração não há servidor. Para as telas poderem ser vistas
 * e testadas, o mesmo motor (lib/a1-prova.ts) roda aqui, com o exame
 * importado dentro do `if` que a build de produção apaga (o truque de
 * lib/content.ts; pacote.mjs confere que o exame não chega ao pacote). O
 * certificado da demonstração diz que é de demonstração. */

import { asset } from '@/lib/asset';
import type { Correcao, Exame, ParteDaProvaPublica, Resposta, Sorteado } from '@/lib/a1-prova';

export type ProvaA1 = { prova: string; aprovacao: number; expiraEm: string; partes: ParteDaProvaPublica[]; fora: string[] };
export type ResultadoProvaA1 = Correcao & { aprovacao: number };
export type CertificadoA1 = {
  id: string; nome: string; curso: string; aprovadoEm: string; emitidoEm: string; publico: boolean; nota?: number;
};
export type SituacaoCertificado = { aprovado: boolean; melhorNota: number | null; nomeSugerido: string; certificado: CertificadoA1 | null };
export type Falha = { erro: string };

const DEMO = process.env.NEXT_PUBLIC_PLATFORM_API !== 'worker';

async function chamar<T>(metodo: 'GET' | 'POST', caminho: string, corpo?: unknown): Promise<T | Falha> {
  try {
    const r = await fetch(asset(caminho), {
      method: metodo, credentials: 'same-origin', cache: 'no-store',
      ...(corpo === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) })
    });
    const j = await r.json().catch(() => ({})) as Record<string, unknown>;
    if (!r.ok) return { erro: typeof j.error === 'string' ? j.error : `http-${r.status}` };
    return j as T;
  } catch {
    return { erro: 'rede' };
  }
}

export const falhou = (x: unknown): x is Falha => !!x && typeof x === 'object' && 'erro' in (x as object);

/* ── a demonstração ─────────────────────────────────────────────────────── */
type Demo = { exame: Exame; provas: Map<string, Sorteado[]>; melhor: number | null; certificado: CertificadoA1 | null };
let demo: Demo | null = null;
async function demoPronta(): Promise<Demo> {
  /* A condição escrita por extenso, e não a constante DEMO: é ela que a build
     de produção troca por `false` e apaga junto com o import (o mesmo truque
     de lib/content.ts). Com a constante, o exame ia parar num pedaço do
     pacote público - pacote.mjs pegou. */
  if (!demo && process.env.NEXT_PUBLIC_PLATFORM_API !== 'worker') {
    const m = await import('@content/a1-exame.json');
    demo = { exame: ((m as { default?: unknown }).default ?? m) as Exame, provas: new Map(), melhor: null, certificado: null };
  }
  if (!demo) throw new Error('a demonstração do exame só existe na build de demonstração');
  return demo;
}

export async function iniciarProva(): Promise<ProvaA1 | Falha> {
  if (DEMO) {
    const d = await demoPronta();
    const { sortear, provaPublica } = await import('@/lib/a1-prova');
    const { hasAudio } = await import('@/components/learn/AudioButton');
    const s = sortear(d.exame, Math.random, id => hasAudio(id));
    const prova = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    d.provas.set(prova, s);
    return {
      prova, aprovacao: d.exame.aprovacao, expiraEm: new Date(Date.now() + 4 * 3_600_000).toISOString(),
      partes: provaPublica(d.exame, s),
      fora: d.exame.partes.filter(p => !s.some(x => d.exame.partes[x.p]!.id === p.id)).map(p => p.id)
    };
  }
  return chamar<ProvaA1>('POST', '/api/a1/exame/iniciar', {});
}

export async function entregarProva(prova: string, respostas: Resposta[]): Promise<ResultadoProvaA1 | Falha> {
  if (DEMO) {
    const d = await demoPronta();
    const s = d.provas.get(prova);
    if (!s) return { erro: 'not-found' };
    d.provas.delete(prova);
    const { corrigir } = await import('@/lib/a1-prova');
    const c = corrigir(d.exame, s, respostas);
    if (c.aprovado) d.melhor = Math.max(d.melhor ?? 0, c.nota);
    return { ...c, aprovacao: d.exame.aprovacao };
  }
  return chamar<ResultadoProvaA1>('POST', '/api/a1/exame/entregar', { prova, respostas });
}

export async function situacaoDoCertificado(nomeSugerido = ''): Promise<SituacaoCertificado | Falha> {
  if (DEMO) {
    const d = await demoPronta();
    return { aprovado: d.melhor != null, melhorNota: d.melhor, nomeSugerido, certificado: d.certificado };
  }
  return chamar<SituacaoCertificado>('GET', '/api/a1/certificado');
}

export async function emitirCertificado(nome: string, publico: boolean): Promise<{ certificado: CertificadoA1 } | Falha> {
  if (DEMO) {
    const d = await demoPronta();
    if (d.melhor == null) return { erro: 'nao-aprovado' };
    d.certificado ??= {
      id: 'A1-DEMQ2345', nome, curso: 'Hebraico A1', aprovadoEm: new Date().toISOString(),
      emitidoEm: new Date().toISOString(), publico, nota: d.melhor
    };
    return { certificado: d.certificado };
  }
  return chamar<{ certificado: CertificadoA1 }>('POST', '/api/a1/certificado', { nome, publico });
}

export async function trocarPublico(publico: boolean): Promise<{ ok: true } | Falha> {
  if (DEMO) {
    const d = await demoPronta();
    if (d.certificado) d.certificado = { ...d.certificado, publico };
    return { ok: true };
  }
  return chamar<{ ok: true }>('POST', '/api/a1/certificado/publico', { publico });
}

export async function verificarCertificado(id: string): Promise<CertificadoA1 | Falha> {
  if (DEMO) {
    const c = demo?.certificado;
    return c && c.id === id && c.publico ? c : { erro: 'not-found' };
  }
  return chamar<CertificadoA1>('GET', `/api/certificado?id=${encodeURIComponent(id)}`);
}

/** O endereço público de verificação de um certificado. */
export const urlDeVerificacao = (id: string, origem = typeof location !== 'undefined' ? location.origin : 'https://hebraicofluente.com.br') =>
  `${origem}${asset('/verificar-certificado/')}?id=${encodeURIComponent(id)}`;
