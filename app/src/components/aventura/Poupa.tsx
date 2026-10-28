/* A poupa, o companheiro da aventura (28/10/2026): PROTÓTIPO, só na Aula 0.
 * ─────────────────────────────────────────────────────────────────────────
 * A poupa (Upupa epops) é a ave nacional de Israel, escolhida pelo voto
 * popular em 2008: a crista em leque, laranja com as pontas pretas, as asas
 * listradas de preto e branco e o bico longo e curvo. É uma ave, e não um
 * mascote conhecido; desenho próprio, em vetor, sem texto dentro.
 *
 * Decisão do dono (28/10/2026): primeiro um protótipo, para ver se agrada,
 * antes de ela aparecer em outro lugar. Por isso ela mora só na capa e no fim
 * da Aula 0, sem falar: aparece, mexe a crista e pisca. Não tem nome ainda -
 * um nome em hebraico precisa da aprovação do dono.
 *
 * Decorativa (`aria-hidden`). O movimento é só transform, curto, e para com
 * "reduzir movimento".
 */

export function Poupa({ pulando = false, className = '' }: { pulando?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 120 110" aria-hidden focusable="false"
         className={`poupa ${pulando ? 'poupa-pula' : ''} ${className}`}>
      {/* A cauda, larga, preta com uma faixa branca. */}
      <path d="M22 74 L4 92 L14 96 L30 80 Z" fill="#1F2A2C" />
      <path d="M12 86 L20 78 L23 81 L15 89 Z" fill="#F6F1E6" />
      {/* O corpo, rosa-alaranjado. */}
      <ellipse cx="50" cy="70" rx="30" ry="20" fill="#E3A574" />
      {/* A asa, com as listras pretas e brancas. */}
      <g>
        <path d="M30 62 Q50 56 70 66 Q58 84 32 80 Z" fill="#1F2A2C" />
        {[0, 1, 2, 3].map(k => (
          <path key={k} d={`M${36 + k * 8} ${64 + k * 0.5} Q${40 + k * 8} ${72} ${36 + k * 8} ${79}`}
                stroke="#F6F1E6" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        ))}
      </g>
      {/* As pernas. */}
      <path d="M48 88 L46 100 M58 88 L60 100 M42 100 L50 100 M56 100 L64 100"
            stroke="#5B4632" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* A cabeça. */}
      <circle cx="80" cy="46" r="15" fill="#E8B07E" />
      {/* A crista em leque: cada pena laranja com a ponta preta. */}
      <g className="poupa-crista">
        {[-58, -38, -18, 2, 22].map((ang, k) => (
          <g key={k} transform={`rotate(${ang} 78 38)`}>
            <path d="M78 38 Q74 22 78 8 Q82 22 78 38 Z" fill="#D9823F" />
            <path d="M75.6 17 Q76 8 78 8 Q80 8 80.4 17 Q78 14 75.6 17 Z" fill="#1F2A2C" />
          </g>
        ))}
      </g>
      {/* O bico, longo e curvo. */}
      <path d="M93 48 Q108 52 116 62 Q106 55 93 52 Z" fill="#3B4A4C" />
      {/* O olho, que pisca. */}
      <g className="poupa-olho">
        <circle cx="85" cy="44" r="3.2" fill="#1F2A2C" />
        <circle cx="86" cy="43" r="1" fill="#FFFFFF" />
      </g>
    </svg>
  );
}
