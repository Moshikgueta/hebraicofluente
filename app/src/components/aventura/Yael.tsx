/* A Yael, o íbex-núbio, companheira da aventura (28/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Escolha do dono (a poupa foi recusada). O íbex-núbio (Capra nubiana),
 * יָעֵל em hebraico, é o bode-montês das falésias do deserto da Judeia, e
 * Ein Gedi é a casa dele. Desenho próprio, em vetor, sem texto dentro.
 *
 * Desde 28/10/2026 (pedido do dono: "a Yael animada, estilo Duolingo") ela
 * é de frente, com a cabeça grande, os olhos e a boca que mudam de humor:
 *   · `parada`   · respira, pisca e mexe a orelha;
 *   · `feliz`    · o acerto: olhos fechados de alegria e um pulo com mola;
 *   · `quase`    · o erro, que no curso nunca é castigo: sobrancelhas para
 *                  cima, cabeça inclinada, a cara de "vamos ver de novo";
 *   · `comemora` · três pulos e as estrelinhas (checkpoint, lugar novo);
 *   · `pensando` · olha para cima, com a boca de lado.
 * O nome em hebraico (יָעֵל) só pode aparecer como LEITURA a partir do
 * módulo 4, quando o Áyin já foi ensinado; aqui ela é "Yael".
 *
 * Decorativa (`aria-hidden`): quem fala é o texto ao lado. O movimento é só
 * transform e opacidade, e para com "reduzir movimento". A `key` do humor
 * reinicia a animação a cada resposta.
 */

export type HumorDaYael = 'parada' | 'feliz' | 'quase' | 'comemora' | 'pensando';

const AREIA = '#D4A66C', AREIA_ESCURA = '#9C7448', CHIFRE = '#7A5634', CLARO = '#F6EEE1', TINTA = '#1F2A2C';

function Olhos({ humor }: { humor: HumorDaYael }) {
  if (humor === 'feliz' || humor === 'comemora') {
    return (
      <g stroke={TINTA} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M42 49 Q48 41 55 49" /><path d="M65 49 Q72 41 78 49" />
      </g>
    );
  }
  /* Para onde as pupilas olham: no "quase", para baixo, para a resposta. */
  const [dx, dy] = humor === 'pensando' ? [1.5, -3] : humor === 'quase' ? [1, 2.4] : [.6, .6];
  return (
    <g className="yael-olho">
      <ellipse cx="48.5" cy="47" rx="7.5" ry="8.5" fill="#FFFFFF" />
      <ellipse cx="71.5" cy="47" rx="7.5" ry="8.5" fill="#FFFFFF" />
      <circle cx={48.5 + dx} cy={47 + dy} r="4.4" fill={TINTA} />
      <circle cx={71.5 + dx} cy={47 + dy} r="4.4" fill={TINTA} />
      <circle cx={49.8 + dx} cy={45.4 + dy} r="1.5" fill="#FFFFFF" />
      <circle cx={72.8 + dx} cy={45.4 + dy} r="1.5" fill="#FFFFFF" />
    </g>
  );
}

function Sobrancelhas({ humor }: { humor: HumorDaYael }) {
  const d = humor === 'quase' ? ['M41 36 Q47 31 54 35', 'M66 35 Q73 31 79 36']
    : humor === 'pensando' ? ['M41 37 Q47 34 54 37', 'M66 34 Q73 31 79 35']
      : ['M42 37 Q48 34 54 36', 'M66 36 Q72 34 78 37'];
  return (
    <g stroke={CHIFRE} strokeWidth="2.4" strokeLinecap="round" fill="none" className="yael-sobrancelhas">
      <path d={d[0]} /><path d={d[1]} />
    </g>
  );
}

function Boca({ humor }: { humor: HumorDaYael }) {
  if (humor === 'feliz' || humor === 'comemora') {
    return (
      <g>
        <path d="M52 64 Q60 76 68 64 Z" fill={TINTA} />
        <path d="M55.5 69.5 Q60 74 64.5 69.5 Q60 67.6 55.5 69.5 Z" fill="#E7808A" />
      </g>
    );
  }
  if (humor === 'quase') return <ellipse cx="60" cy="67" rx="3" ry="3.4" fill={TINTA} />;
  if (humor === 'pensando') return <path d="M55 67.5 Q61 69 66 64.5" stroke={TINTA} strokeWidth="2.2" strokeLinecap="round" fill="none" />;
  return <path d="M54 65 Q60 70 66 65" stroke={TINTA} strokeWidth="2.4" strokeLinecap="round" fill="none" />;
}

export function Yael({ humor, pulando = false, className = '' }: {
  humor?: HumorDaYael;
  /** O nome de antes: `pulando` é o mesmo que `humor="comemora"`. */
  pulando?: boolean;
  className?: string;
}) {
  const h: HumorDaYael = humor ?? (pulando ? 'comemora' : 'parada');
  return (
    <svg viewBox="0 0 120 120" aria-hidden focusable="false" overflow="visible"
         className={`yael yael-${h} ${className}`}>
      {/* A pedra. */}
      <path d="M16 116 Q22 102 44 101 L80 100 Q102 102 106 116 Z" fill="#C4A873" />
      <path d="M30 109 Q40 105 52 107 M70 106 Q82 104 94 108" stroke="#A88C5A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse className="yael-sombra" cx="60" cy="103" rx="24" ry="3.4" fill="#A88C5A" opacity=".55" />

      {h === 'comemora' && (
        <g className="yael-estrelas" fill="#F2B632">
          <path d="M14 34 l2.4 5 5 2.4 -5 2.4 -2.4 5 -2.4 -5 -5 -2.4 5 -2.4 Z" />
          <path d="M104 26 l2 4.2 4.2 2 -4.2 2 -2 4.2 -2 -4.2 -4.2 -2 4.2 -2 Z" />
          <path d="M100 66 l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6 Z" />
          <path d="M20 72 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4 Z" />
        </g>
      )}

      <g className="yael-corpo">
        {/* As patas, curtas, com o branco na frente. */}
        <g stroke={AREIA_ESCURA} strokeWidth="6" strokeLinecap="round">
          <path d="M45 88 L45 101" /><path d="M54 90 L54 103" /><path d="M66 90 L66 103" /><path d="M75 88 L75 101" />
        </g>
        <g stroke={CLARO} strokeWidth="2.2" strokeLinecap="round">
          <path d="M54 98 L54 102" /><path d="M66 98 L66 102" />
        </g>
        {/* O corpo, redondo, com a barriga clara. */}
        <ellipse cx="60" cy="82" rx="25" ry="13.5" fill={AREIA} />
        <ellipse cx="60" cy="87" rx="14" ry="7" fill={CLARO} />

        <g className="yael-cabeca">
          {/* Os chifres, longos e curvados para trás, com os anéis. */}
          <g className="yael-chifres">
            <path d="M50 28 Q40 4 18 10 Q32 12 42 31 Z" fill={CHIFRE} />
            <path d="M70 28 Q80 4 102 10 Q88 12 78 31 Z" fill={CHIFRE} />
            <path d="M43 23 L48 21 M38 17 L42 14 M32 13 L35 10 M77 23 L72 21 M82 17 L78 14 M88 13 L85 10"
                  stroke="#C4A873" strokeWidth="1.4" strokeLinecap="round" />
          </g>
          {/* As orelhas, para os lados. */}
          <g className="yael-orelha-e">
            <path d="M37 44 Q22 38 18 46 Q26 52 37 50 Z" fill={AREIA_ESCURA} />
            <path d="M33 45.5 Q25 43 23 47 Q28 49.6 33 48.6 Z" fill="#E9B79B" />
          </g>
          <g className="yael-orelha-d">
            <path d="M83 44 Q98 38 102 46 Q94 52 83 50 Z" fill={AREIA_ESCURA} />
            <path d="M87 45.5 Q95 43 97 47 Q92 49.6 87 48.6 Z" fill="#E9B79B" />
          </g>
          {/* A cabeça, grande, e o focinho claro. */}
          <path d="M60 24 Q86 24 86 50 Q86 76 60 76 Q34 76 34 50 Q34 24 60 24 Z" fill={AREIA} />
          <path d="M44 31 Q60 26 76 31" stroke={AREIA_ESCURA} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".6" />
          <ellipse cx="60" cy="64" rx="15" ry="11" fill={CLARO} />
          <ellipse cx="60" cy="58.4" rx="4.6" ry="3" fill={CHIFRE} />
          {/* As bochechas. */}
          <ellipse cx="39.5" cy="60" rx="4.6" ry="3" fill="#E7808A" opacity=".45" />
          <ellipse cx="80.5" cy="60" rx="4.6" ry="3" fill="#E7808A" opacity=".45" />
          <Sobrancelhas humor={h} />
          <Olhos humor={h} />
          <Boca humor={h} />
        </g>
      </g>
    </svg>
  );
}
