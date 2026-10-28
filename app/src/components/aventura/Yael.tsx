/* A Yael, o íbex-núbio, companheira da aventura (28/10/2026): PROTÓTIPO,
 * só na Aula 0.
 * ─────────────────────────────────────────────────────────────────────────
 * Escolha do dono, no mesmo dia (a poupa foi recusada). O íbex-núbio
 * (Capra nubiana), יָעֵל em hebraico, é o bode-montês das falésias do deserto
 * da Judeia, e Ein Gedi é a casa dele. Desenho próprio, em vetor, sem texto
 * dentro: o corpo cor de areia, a barriga e as patas com o branco das
 * marcas, os chifres longos e curvados para trás com os anéis, e a pedra
 * onde ela está.
 *
 * Protótipo: mora só na capa e no fim da Aula 0, sem falar. O nome em
 * hebraico (יָעֵל) só pode aparecer como LEITURA a partir do módulo 4, quando
 * o Áyin já foi ensinado; aqui ela é "Yael", em português.
 *
 * Decorativa (`aria-hidden`). O movimento é só transform e para com "reduzir
 * movimento".
 */

export function Yael({ pulando = false, className = '' }: { pulando?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden focusable="false"
         className={`yael ${pulando ? 'yael-pula' : ''} ${className}`}>
      {/* A pedra. */}
      <path d="M14 112 Q20 94 44 92 L84 90 Q104 92 110 112 Z" fill="#C4A873" />
      <path d="M30 100 Q40 96 52 98 M70 97 Q82 95 94 99" stroke="#A88C5A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <g className="yael-corpo">
        {/* As patas de trás e de frente, com o branco na frente da perna. */}
        <path d="M38 76 L36 94 M46 77 L46 94" stroke="#9C7448" strokeWidth="5" strokeLinecap="round" />
        <path d="M72 76 L72 93 M80 75 L82 93" stroke="#9C7448" strokeWidth="5" strokeLinecap="round" />
        <path d="M72 84 L72 92 M80 84 L81.4 92" stroke="#F3EBDD" strokeWidth="2" strokeLinecap="round" />
        {/* O rabo curto. */}
        <path d="M30 60 Q24 56 26 52" stroke="#7A5634" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* O corpo, cor de areia, com a barriga clara. */}
        <path d="M30 62 Q34 48 58 50 Q80 50 86 62 Q86 78 70 80 L42 80 Q30 78 30 62 Z" fill="#C99A63" />
        <path d="M40 74 Q58 82 76 74 Q70 80 58 80 Q46 80 40 74 Z" fill="#F3EBDD" />
        {/* A faixa escura do dorso. */}
        <path d="M36 54 Q58 46 82 56" stroke="#9C7448" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* O pescoço e a cabeça. */}
        <path d="M76 58 Q84 44 92 38 L100 44 Q94 54 86 64 Z" fill="#C99A63" />
        <path d="M90 36 Q100 32 106 40 Q108 48 100 50 Q94 50 90 44 Z" fill="#C99A63" />
        {/* O focinho e a barbicha. */}
        <path d="M104 44 Q108 46 106 49" stroke="#7A5634" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M100 50 Q101 56 98 58 Q96 54 97 50 Z" fill="#7A5634" />
        {/* A orelha. */}
        <path d="M92 38 Q86 34 84 38 Q88 40 92 40 Z" fill="#9C7448" />
        {/* Os chifres, longos e curvados para trás, com os anéis. */}
        <g className="yael-chifres">
          <path d="M94 34 Q86 10 62 12 Q76 16 84 30 Q88 36 92 38 Z" fill="#7A5634" />
          <path d="M86.6 30.9 L91.6 27.9 M83.7 26.3 L87.8 23.0 M80.5 22.4 L83.7 18.9 M76.9 19.2 L79.1 15.8 M73.1 16.9 L74.4 13.6 M69.5 15.4 L70.3 12.4" stroke="#C4A873" strokeWidth="1.3" strokeLinecap="round" />
        </g>
        {/* O olho, que pisca. */}
        <g className="yael-olho">
          <circle cx="98" cy="41" r="2.2" fill="#1F2A2C" />
          <circle cx="98.7" cy="40.3" r=".7" fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  );
}
