/* O gravador do painel (/admin/gravar), na parte que não precisa de navegador.
 * ─────────────────────────────────────────────────────────────────────────
 * Três perguntas, cada uma com uma resposta testável:
 *
 *   1. Em que formato gravar? `audio/mp4` (AAC) quando o navegador sabe -
 *      o Safari do iPhone sempre soube, o Chrome aprendeu -, porque toca em
 *      todo lugar. Quem só grava WebM/Ogg (Firefox, Chrome antigo) grava
 *      assim mesmo, e o painel CONVERTE para WAV antes de enviar: WebM não
 *      toca em todo iPhone, e o WAV toca em qualquer navegador.
 *   2. Onde a voz começa e termina? O arquivo começa com o silêncio de quem
 *      apertou o botão e respirou. `acharVoz` mede isso; o curso toca só o
 *      trecho (e o WAV já sai cortado).
 *   3. O volume está bom? Baixo demais some no alto-falante do celular;
 *      estourado distorce e não tem conserto depois.
 *
 * A mistura para mono é MÉDIA dos canais, e sempre antes de qualquer outra
 * coisa: o celular grava estéreo com dois canais iguais, e tratar um canal
 * diferente do outro foi o que deixou os primeiros clipes com voz de robô
 * (tools/cortar-audio.mjs, 25/09/2026).
 */

import { tx } from '@/i18n/telas/motor-gravador';

/** Em ordem de preferência. O primeiro que o navegador aceitar é o usado. */
export const FORMATOS = [
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
  'audio/aac',
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus'
] as const;

/** `''` = deixar o navegador escolher (ele ainda grava, só não sabemos em quê). */
export function escolherFormato(aceita: (tipo: string) => boolean): string {
  for (const f of FORMATOS) {
    try { if (aceita(f)) return f; } catch { /* navegador que lança em vez de dizer não */ }
  }
  return '';
}

export const tipoBase = (t: string) => String(t || '').split(';')[0]!.trim().toLowerCase();

/** O que o navegador gravou toca em todo lugar? Se não, vira WAV. */
export function precisaConverter(tipoGravado: string): boolean {
  const t = tipoBase(tipoGravado);
  return !(t === 'audio/mp4' || t === 'audio/aac' || t === 'audio/x-m4a' || t === 'video/mp4');
}

/** Os canais, somados em média. */
export function paraMono(canais: readonly Float32Array[]): Float32Array {
  if (canais.length === 1) return canais[0]!;
  const n = Math.min(...canais.map(c => c.length));
  const out = new Float32Array(n);
  for (const c of canais) for (let i = 0; i < n; i++) out[i]! += c[i]! / canais.length;
  return out;
}

export const dB = (x: number) => (x > 0 ? 20 * Math.log10(x) : -Infinity);

export function pico(amostras: Float32Array): number {
  let p = 0;
  for (let i = 0; i < amostras.length; i++) { const a = Math.abs(amostras[i]!); if (a > p) p = a; }
  return p;
}

/* A margem que fica fora da voz: antes, para o ataque da consoante não ser
   cortado; depois, maior, porque o fim de "sh" e "ch" é fraco e longo. */
export const MARGEM_ANTES_MS = 80;
export const MARGEM_DEPOIS_MS = 160;
const JANELA_MS = 10;

export type Corte = { inicio: number; fim: number };

/**
 * Onde a voz está, em ms. `null` quando não há voz nenhuma.
 *
 * Por janelas de 10 ms: o piso é o ruído da sala (o percentil 10 das
 * janelas), e é voz o que passa 12 dB acima dele E fica a menos de 30 dB do
 * trecho mais forte. As duas condições porque uma só falha: só o piso pega
 * o estalo do botão numa sala silenciosa; só o pico perde a consoante fraca
 * numa gravação alta.
 */
export function acharVoz(amostras: Float32Array, taxa: number): Corte | null {
  const tam = Math.max(1, Math.round((taxa * JANELA_MS) / 1000));
  const rms: number[] = [];
  for (let i = 0; i + tam <= amostras.length; i += tam) {
    let s = 0;
    for (let j = i; j < i + tam; j++) s += amostras[j]! * amostras[j]!;
    rms.push(Math.sqrt(s / tam));
  }
  if (!rms.length) return null;
  const ordenado = [...rms].sort((a, b) => a - b);
  const piso = ordenado[Math.floor(ordenado.length * 0.1)]!;
  const maior = ordenado[ordenado.length - 1]!;
  if (maior < 0.003) return null; // nada acima de -50 dBFS: não houve voz
  const limiar = Math.max(piso * 4, maior * 0.0316, 0.002);

  /* Uma janela solta acima do limiar é estalo, não voz: pede três seguidas
     (30 ms) para começar, e acha o fim pelo mesmo critério, de trás para a frente. */
  const seguidas = (de: number, passo: number) => {
    for (let i = de, n = 0; i >= 0 && i < rms.length; i += passo) {
      n = rms[i]! >= limiar ? n + 1 : 0;
      if (n === 3) return i - passo * 2;
    }
    return -1;
  };
  const primeira = seguidas(0, 1);
  const ultima = seguidas(rms.length - 1, -1);
  if (primeira < 0 || ultima < primeira) return null;

  const total = (amostras.length / taxa) * 1000;
  return {
    inicio: Math.max(0, Math.round(primeira * JANELA_MS - MARGEM_ANTES_MS)),
    fim: Math.min(Math.round(total), Math.round((ultima + 1) * JANELA_MS + MARGEM_DEPOIS_MS))
  };
}

export type Diagnostico = { nivel: 'ok' | 'baixo' | 'estourado' | 'sem-voz'; texto: string };

export function diagnosticar(amostras: Float32Array, taxa: number): Diagnostico {
  const p = pico(amostras);
  if (!acharVoz(amostras, taxa)) {
    return { nivel: 'sem-voz', texto: tx.semVoz };
  }
  if (p >= 0.995) {
    return { nivel: 'estourado', texto: tx.estourado };
  }
  if (dB(p) < -30) {
    return { nivel: 'baixo', texto: tx.baixo };
  }
  return { nivel: 'ok', texto: tx.ok };
}

/**
 * O WAV de reserva: só o trecho da voz, com 10 ms de entrada e saída suaves
 * (sem estalo) e o pico levado a -1,5 dBFS, o mesmo teto do cortador do
 * estúdio. PCM de 16 bits, mono.
 */
export function wavDoTrecho(amostras: Float32Array, taxa: number, corte: Corte | null): ArrayBuffer {
  const de = corte ? Math.floor((corte.inicio / 1000) * taxa) : 0;
  const ate = corte ? Math.min(amostras.length, Math.ceil((corte.fim / 1000) * taxa)) : amostras.length;
  const trecho = amostras.subarray(de, ate);
  const p = pico(trecho);
  const ganho = p > 0 ? Math.min(8, 0.8414 / p) : 1; // -1,5 dBFS; no máximo +18 dB
  const fade = Math.min(Math.floor(taxa * 0.01), Math.floor(trecho.length / 2));

  const n = trecho.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const escreve = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  escreve(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); escreve(8, 'WAVE');
  escreve(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, taxa, true); v.setUint32(28, taxa * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  escreve(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    let x = trecho[i]! * ganho;
    if (i < fade) x *= i / fade;
    if (i >= n - fade) x *= (n - 1 - i) / fade;
    x = Math.max(-1, Math.min(1, x));
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
  }
  return buf;
}

/** Barras para desenhar a forma de onda: o pico de cada fatia, de 0 a 1. */
export function barras(amostras: Float32Array, n = 80): number[] {
  const out: number[] = [];
  const passo = Math.max(1, Math.floor(amostras.length / n));
  for (let i = 0; i < n; i++) out.push(pico(amostras.subarray(i * passo, (i + 1) * passo)));
  const m = Math.max(...out, 1e-6);
  return out.map(x => x / m);
}

/** Uma gravação curta demais é quase sempre um toque sem querer. */
export const MAX_SEGUNDOS = 15;
export const MIN_MS = 250;

/**
 * As barras do TRECHO da voz, tantas quanto a duração pede (`porSegundo`).
 * É o que põe duas gravações na mesma escala de tempo: a sílaba dita em
 * 0,8 s sai com o dobro de barras da dita em 0,4 s, e desenhadas lado a lado
 * a diferença de duração aparece (components/learn/CompararPronuncia.tsx).
 */
export function barrasDoTrecho(amostras: Float32Array, taxa: number, corte: Corte, porSegundo = 40): number[] {
  const de = Math.floor((corte.inicio / 1000) * taxa);
  const ate = Math.min(amostras.length, Math.ceil((corte.fim / 1000) * taxa));
  const trecho = amostras.subarray(de, ate);
  const n = Math.max(4, Math.round(((corte.fim - corte.inicio) / 1000) * porSegundo));
  const passo = Math.max(1, Math.floor(trecho.length / n));
  const brutas = Array.from({ length: n }, (_, i) => pico(trecho.subarray(i * passo, (i + 1) * passo)));
  const m = Math.max(...brutas, 1e-6);
  return brutas.map(x => x / m);
}
