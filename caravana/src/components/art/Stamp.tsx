// Carimbo do passaporte: borda dupla, titulo em volta e um desenho no centro.
// Conquistado, sai na cor da tinta e levemente torto, como carimbo de verdade.
// Ainda nao conquistado, aparece so o contorno tracejado.

type Props = { slug: string; title: string; art: string; ink: string; earned: boolean; date?: string | null; size?: number; animate?: boolean };

const GLYPH: Record<string, string> = {
  // arco de pedra
  arch: 'M-16 14 V-2 A16 16 0 0 1 16 -2 V14 M-9 14 V-1 A9 9 0 0 1 9 -1 V14 M-22 14 H22',
  // ondas do lago
  wave: 'M-20 -4 q5 -6 10 0 t10 0 t10 0 t10 0 M-20 5 q5 -6 10 0 t10 0 t10 0 t10 0 M-14 14 h28',
  // planalto de Massada
  mesa: 'M-22 14 L-14 -4 L-10 -8 H10 L14 -4 L22 14 Z M-8 -14 a4 4 0 1 0 0.1 0',
  // torre do relogio
  tower: 'M-6 16 V-6 H6 V16 M-8 -6 L0 -16 L8 -6 M0 3 a3 3 0 1 0 0.1 0 M-14 16 H14',
  // placa
  sign: 'M-16 -10 H12 L18 -4 L12 2 H-16 Z M-2 2 V16 M-10 16 H6',
  // ramo de oliveira
  star: 'M-14 14 C-6 4 2 -4 14 -14 M-6 6 c-6 -1 -9 -5 -9 -9 c5 0 8 3 9 9 M0 0 c-1 -6 1 -10 5 -12 c1 5 -1 9 -5 12 M3 -5 c5 2 9 1 11 -3 c-5 -2 -9 0 -11 3 M-3 3 c4 4 8 4 11 2 c-3 -4 -8 -4 -11 -2',
};

export function Stamp({ slug, title, art, ink, earned, date, size = 132, animate = false }: Props) {
  const id = `arc-${slug}`;
  const color = earned ? ink : '#b3a996';
  return (
    <svg
      viewBox="-60 -60 120 120"
      width={size}
      height={size}
      className={earned && animate ? 'anim-stamp' : undefined}
      style={earned && !animate ? { transform: 'rotate(-6deg)' } : undefined}
      role="img"
      aria-label={earned ? `Selo conquistado: ${title}` : `Selo ainda não conquistado: ${title}`}
    >
      <defs>
        <path id={id} d="M0 40 A40 40 0 1 1 0 -40 A40 40 0 1 1 0 40" />
      </defs>
      <g fill="none" stroke={color} strokeWidth={earned ? 2.4 : 1.4} strokeDasharray={earned ? undefined : '3 3'} opacity={earned ? 0.92 : 1}>
        <circle r="54" />
        <circle r="47" strokeWidth={earned ? 1 : 1} />
        <circle r="30" strokeWidth={earned ? 1 : 1} />
      </g>
      <text fill={color} fontSize="7.6" fontWeight="650" letterSpacing="1.2" style={{ fontFamily: 'var(--font-sans)', textTransform: 'uppercase' }}>
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
          {title.length > 30 ? `${title.slice(0, 29)}…` : title}
        </textPath>
      </text>
      {art === 'aleph' ? (
        <text y="11" textAnchor="middle" fontSize="34" fill={color} className="he-display" lang="he" direction="rtl">
          א
        </text>
      ) : (
        <path d={GLYPH[art] ?? GLYPH.arch} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {earned && date && (
        <text y="44" textAnchor="middle" fill={color} fontSize="7" fontWeight="600" letterSpacing="1" style={{ fontFamily: 'var(--font-sans)' }}>
          {date}
        </text>
      )}
    </svg>
  );
}
