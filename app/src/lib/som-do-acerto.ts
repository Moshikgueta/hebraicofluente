/* O som do acerto (28/10/2026, escolha do dono: o "plim" e a comemoração).
 * ─────────────────────────────────────────────────────────────────────────
 * Sintetizado aqui, com Web Audio: nenhum arquivo, nenhuma licença de
 * terceiros, nada a baixar. As notas são as das amostras que o dono ouviu:
 *   · acerto    · duas notas de sino subindo, Mi5 e Lá5;
 *   · comemora  · quatro notas subindo, Dó5, Mi5, Sol5 e Dó6 (a sequência
 *                 de acertos em que a Yael comemora).
 *
 * Três regras:
 *   · no erro não toca nada: errar no curso não custa, e um som de erro
 *     seria a única punição da tela;
 *   · nunca por cima da pronúncia: se uma gravação do curso está tocando,
 *     o plim não toca (quem está ouvindo o hebraico não pode perder a sílaba);
 *   · "Sons do curso" desligado no menu de acessibilidade (`data-a11y-sons`)
 *     cala tudo.
 */

type Nota = { f: number; ini: number; dur: number; harm: readonly number[]; queda: number };

const SINO = [1, .35, .12] as const;
const SONS: Record<'acerto' | 'comemora', readonly Nota[]> = {
  acerto: [
    { f: 659.25, ini: 0, dur: .35, harm: SINO, queda: 6 },
    { f: 880, ini: .09, dur: .5, harm: SINO, queda: 6 }
  ],
  comemora: [
    { f: 523.25, ini: 0, dur: .2, harm: [1, .3], queda: 10 },
    { f: 659.25, ini: .08, dur: .2, harm: [1, .3], queda: 10 },
    { f: 783.99, ini: .16, dur: .2, harm: [1, .3], queda: 10 },
    { f: 1046.5, ini: .24, dur: .55, harm: SINO, queda: 5 }
  ]
};

/** O volume geral: baixo, um sinal e não uma música. */
const VOLUME = .16;

/* As gravações do curso que estão tocando agora (AudioButton, tocarClipe,
   CompararSons, LinhasDeLeitura). */
const tocando = new Set<HTMLAudioElement>();
const vigiados = new WeakSet<HTMLAudioElement>();

/** Avisa este módulo de quando uma gravação toca e para. */
export function vigiarGravacao(el: HTMLAudioElement): void {
  if (vigiados.has(el)) return;
  vigiados.add(el);
  el.addEventListener('play', () => tocando.add(el));
  for (const ev of ['pause', 'ended', 'error'] as const) el.addEventListener(ev, () => tocando.delete(el));
}

export const gravacaoTocando = (): boolean => tocando.size > 0;

export const sonsDesligados = (): boolean =>
  typeof document !== 'undefined' && document.documentElement.hasAttribute('data-a11y-sons');

let ctx: AudioContext | null = null;

export function tocarSom(qual: 'acerto' | 'comemora'): void {
  if (typeof window === 'undefined' || sonsDesligados() || gravacaoTocando()) return;
  const Ctx = window.AudioContext
    ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  try {
    ctx ??= new Ctx();
    if (ctx.state === 'suspended') void ctx.resume();
    const agora = ctx.currentTime + .01;
    const saida = ctx.createGain();
    saida.gain.value = VOLUME;
    saida.connect(ctx.destination);
    for (const n of SONS[qual]) {
      const soma = n.harm.reduce((a, b) => a + b, 0);
      n.harm.forEach((h, k) => {
        const osc = ctx!.createOscillator();
        const env = ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.value = n.f * (k + 1);
        const t0 = agora + n.ini;
        /* Ataque de 6 ms e queda exponencial: o desenho de um sino. */
        env.gain.setValueAtTime(0, t0);
        env.gain.linearRampToValueAtTime(h / soma, t0 + .006);
        env.gain.setTargetAtTime(0, t0 + .006, 1 / n.queda);
        osc.connect(env).connect(saida);
        osc.start(t0);
        osc.stop(t0 + n.dur + .4);
      });
    }
  } catch { /* sem áudio no aparelho: o acerto continua dito na tela */ }
}
