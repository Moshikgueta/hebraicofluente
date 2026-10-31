/* Quais clipes existem - os do estúdio (git) e os do painel (banco).
 * ─────────────────────────────────────────────────────────────────────────
 * Até o painel de gravação, a lista era só a da build (`AUDIO_MANIFEST`,
 * gerada de public/audio/). Agora um clipe pode nascer DEPOIS da build: o
 * dono do curso grava pelo celular em /admin/gravar, e o som entra no ar na
 * hora. Este módulo junta as duas fontes num lugar só, e é por ele que tudo
 * pergunta - o botão "Ouvir", os exercícios de escuta, a composição do exame.
 *
 * O endereço de um clipe não muda: `/audio/<id>.mp3`. O Worker serve do
 * banco quando há gravação do painel e do arquivo do git quando não há
 * (worker/src/api/audio.js). O que este módulo acrescenta ao endereço:
 *
 *   · `?v=<quando>` - uma gravação SUBSTITUÍDA muda de endereço, e o
 *     navegador não toca a versão velha que guardou;
 *   · o trecho da voz (`inicio`, `fim`), medido pelo painel: o arquivo do
 *     celular começa com o silêncio de quem apertou o botão e respirou.
 *
 * A lista do painel vem de /api/audio/manifest, uma vez por visita, e fica
 * guardada no aparelho para a próxima abrir já sabendo. Sem rede, sem
 * Worker (a demonstração estática) ou com o banco fora, vale o que a build
 * trouxe - que é o curso de antes do painel, e não um curso quebrado.
 */

import { AUDIO_MANIFEST } from '@/lib/audio-manifest';
import { asset } from '@/lib/asset';

export type ClipeDoPainel = { v: number; inicio: number | null; fim: number | null };

const DO_ESTUDIO = new Set<string>(AUDIO_MANIFEST);
let doPainel: Record<string, ClipeDoPainel> = {};
let versao = 0;
const ouvintes = new Set<() => void>();

const CHAVE = 'hf-audio-painel-v1';

export const temClipe = (audioId: string | null | undefined): boolean =>
  !!audioId && (DO_ESTUDIO.has(audioId) || Object.prototype.hasOwnProperty.call(doPainel, audioId));

export const algumClipe = (): boolean => DO_ESTUDIO.size > 0 || Object.keys(doPainel).length > 0;

export const clipeDoPainel = (audioId: string): ClipeDoPainel | null => doPainel[audioId] ?? null;

/** O endereço para tocar. Com corte, o trecho vai também como fragmento de mídia. */
export function urlDoClipe(audioId: string): string {
  const base = asset(`/audio/${audioId}.mp3`);
  const p = doPainel[audioId];
  if (!p) return base;
  const trecho = p.inicio !== null && p.fim !== null
    ? `#t=${(p.inicio / 1000).toFixed(2)},${(p.fim / 1000).toFixed(2)}`
    : '';
  return `${base}?v=${p.v}${trecho}`;
}

/** Aceita a resposta do servidor (`{clips: {id: [v, inicio, fim]}}`) e avisa quem desenha. */
export function aplicarManifesto(bruto: unknown): void {
  const clips = (bruto as { clips?: Record<string, unknown> } | null)?.clips;
  if (!clips || typeof clips !== 'object') return;
  const novo: Record<string, ClipeDoPainel> = {};
  for (const [id, linha] of Object.entries(clips)) {
    if (!/^he-[0-9a-f]{8}$/.test(id) || !Array.isArray(linha)) continue;
    const [v, inicio, fim] = linha as [unknown, unknown, unknown];
    const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
    novo[id] = { v: num(v) ?? 0, inicio: num(inicio), fim: num(fim) };
  }
  doPainel = novo;
  versao++;
  ouvintes.forEach(f => f());
}

let carregando: Promise<void> | null = null;

/** Uma vez por visita. Primeiro o que o aparelho guardou, depois o servidor. */
export function carregarManifesto(): Promise<void> {
  if (carregando) return carregando;
  try {
    const salvo = window.localStorage.getItem(CHAVE);
    if (salvo) aplicarManifesto(JSON.parse(salvo));
  } catch { /* sem armazenamento, segue para a rede */ }
  carregando = fetch(asset('/api/audio/manifest'), { credentials: 'same-origin', cache: 'no-store' })
    .then(r => (r.ok ? r.json() : null))
    .then(j => {
      if (!j) return;
      aplicarManifesto(j);
      try { window.localStorage.setItem(CHAVE, JSON.stringify(j)); } catch { /* cheio ou bloqueado */ }
    })
    .catch(() => { /* sem Worker: vale a lista da build */ });
  return carregando;
}

export const assinar = (f: () => void) => { ouvintes.add(f); return () => { ouvintes.delete(f); }; };
export const versaoDoRegistro = () => versao;
