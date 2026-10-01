/* Falar e ser corrigido: o reconhecimento de fala do navegador (27/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Pedido do dono do curso: o aluno fala a palavra e o curso diz se saiu
 * certo, como no Duolingo. Quem transcreve é o próprio navegador (Chrome e
 * Android pelo Google, Safari pela Apple) - de graça, e sem servidor nosso
 * no meio. Em troca a voz vai para esses serviços, e a tela e a página de
 * privacidade dizem isso.
 *
 * Aqui mora só a decisão, sem navegador: a transcrição bate com a palavra?
 *
 *   · sem os pontos: o reconhecimento escreve hebraico sem nikud;
 *   · sem pontuação e sem o traço do gerech trocado por apóstrofo;
 *   · a forma final e a de meio valem o mesmo (a transcrição às vezes corta);
 *   · a grafia cheia e a defectiva valem o mesmo: o curso escreve אֹמֵר com
 *     o ponto em cima, e a transcrição escreve אומר, com vav. Por isso, se a
 *     comparação exata falha, aceita-se a palavra com ו ou י A MAIS, nunca
 *     com uma letra a menos (`grafiaCheiaDe`).
 *
 * Sílaba solta NÃO passa por aqui: "מַ" não é palavra, e nenhum
 * reconhecimento transcreve isso de forma confiável.
 */

const NIKUD = /[֑-ׇ]/g;
const FINAL: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

/** Só as letras, palavra por palavra, sem ponto, sem pontuação e sem forma final. */
export function palavrasDe(texto: string): string[] {
  return texto
    .normalize('NFC')
    .replace(NIKUD, '')
    .replace(/[׳'`´"״]/g, '')               // gerech e aspas: o reconhecimento escreve ' ou nada
    .replace(/[^א-ת\s-]/g, ' ')    // o resto que não é letra hebraica vira espaço
    .replace(/-/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(p => [...p].map(c => FINAL[c] ?? c).join(''));
}

/**
 * A grafia cheia do alvo: a palavra ouvida tem TODAS as letras do alvo, na
 * ordem, e o que ela tem a mais é só ו ou י - as letras que a grafia cheia
 * acrescenta (אֹמֵר → אומר). Até 01/10/2026 comparava-se o esqueleto sem ו e
 * י dos dois lados, e uma letra que FALTAVA também passava: o alvo עִיר
 * aceitava a transcrição "ער", que é outra palavra (auditoria, CONT-016).
 */
export function grafiaCheiaDe(ouvida: string, alvo: string): boolean {
  if (!alvo.length) return false;
  let k = 0;
  for (const c of ouvida) {
    if (k < alvo.length && c === alvo[k]) k++;
    else if (c !== 'ו' && c !== 'י') return false;
  }
  return k === alvo.length;
}

export type Veredito = { certo: boolean; ouvi: string };

/**
 * A fala bate com o alvo?
 *
 * `alternativas` são as transcrições que o navegador oferece, da mais
 * provável para a menos. Basta uma conter as palavras do alvo, em ordem e
 * juntas - o aluno pode dizer "é..." antes, e o reconhecimento às vezes
 * acrescenta um artigo.
 */
export function conferirFala(alvo: string, alternativas: readonly string[]): Veredito {
  const quero = palavrasDe(alvo);
  const primeira = alternativas[0]?.trim() ?? '';
  if (!quero.length) return { certo: false, ouvi: primeira };
  const contem = (ouvidas: string[], igual: (a: string, b: string) => boolean) => {
    for (let i = 0; i + quero.length <= ouvidas.length; i++) {
      if (quero.every((q, k) => igual(ouvidas[i + k]!, q))) return true;
    }
    return false;
  };
  for (const alt of alternativas) {
    const ouvidas = palavrasDe(alt);
    if (contem(ouvidas, (a, b) => a === b)) return { certo: true, ouvi: alt.trim() };
  }
  for (const alt of alternativas) {
    const ouvidas = palavrasDe(alt);
    if (contem(ouvidas, (a, b) => grafiaCheiaDe(a, b))) {
      return { certo: true, ouvi: alt.trim() };
    }
  }
  return { certo: false, ouvi: primeira };
}

/* ── o reconhecimento do navegador ─────────────────────────────────────── */

type Reconhecedor = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
};

type Construtor = new () => Reconhecedor;

function construtor(): Construtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: Construtor; webkitSpeechRecognition?: Construtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Este navegador transcreve fala? (O Firefox, por exemplo, não.) */
export const falaDisponivel = (): boolean => construtor() !== null;

export type ResultadoDeFala =
  | { tipo: 'ouvido'; alternativas: string[] }
  | { tipo: 'nada' }                    // ninguém falou, ou nada foi entendido
  | { tipo: 'negado' }                  // o microfone foi negado
  | { tipo: 'sem-hebraico' }            // o serviço não reconhece hebraico aqui
  | { tipo: 'erro'; codigo: string };

/**
 * Ouve UMA fala em hebraico e devolve as transcrições. `parar()` encerra
 * antes. O navegador decide quando a fala acabou (uma pausa curta).
 */
export function ouvirHebraico(): { resultado: Promise<ResultadoDeFala>; parar: () => void } {
  const C = construtor();
  if (!C) return { resultado: Promise.resolve({ tipo: 'erro', codigo: 'sem-suporte' }), parar: () => {} };
  const r = new C();
  r.lang = 'he-IL';
  r.interimResults = false;
  r.continuous = false;
  r.maxAlternatives = 5;
  let feito = false;
  const resultado = new Promise<ResultadoDeFala>(resolve => {
    const fim = (x: ResultadoDeFala) => { if (!feito) { feito = true; resolve(x); } };
    r.onresult = e => {
      const alts: string[] = [];
      for (let i = 0; i < e.results.length; i++) {
        const linha = e.results[i]!;
        for (let k = 0; k < linha.length; k++) alts.push(linha[k]!.transcript);
      }
      fim(alts.length ? { tipo: 'ouvido', alternativas: alts } : { tipo: 'nada' });
    };
    r.onerror = e => {
      const c = e.error;
      if (c === 'not-allowed' || c === 'service-not-allowed') fim({ tipo: 'negado' });
      else if (c === 'language-not-supported') fim({ tipo: 'sem-hebraico' });
      else if (c === 'no-speech' || c === 'aborted') fim({ tipo: 'nada' });
      else fim({ tipo: 'erro', codigo: c });
    };
    r.onend = () => fim({ tipo: 'nada' });
    try { r.start(); } catch (e) { fim({ tipo: 'erro', codigo: String((e as Error)?.message ?? e) }); }
  });
  /* `stop`, e não `abort`: parar cedo ainda entrega o que já foi dito. */
  return { resultado, parar: () => { try { r.stop(); } catch { /* já parou */ } } };
}
