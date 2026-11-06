/* Os emblemas das três jornadas, desenhados em código (23/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Sem fotografia de banco e sem imagem gerada: o projeto não tem foto de
 * Israel licenciada, e uma paisagem genérica "de Oriente Médio" seria a
 * imagem de catálogo que o master prompt pede para evitar. Cada jornada tem
 * um objeto do próprio mundo, no traço fino da coleção editorial:
 *
 *   hebraico  o caderno pautado com o traço da cursiva;
 *   israel    a carta náutica: quadrícula, rosa dos ventos e um trajeto
 *             tracejado. É uma ILUSTRAÇÃO, sem contorno de país nem nome de
 *             lugar: contorno desenhado à mão seria geografia inventada;
 *   raizes    o maço do arquivo, com fita e lacre.
 *
 * Nenhum tem hebraico dentro do SVG: a regra do projeto é que todo hebraico
 * passa por <He> (fonte, nikud, isolamento bidi). Decorativos: aria-hidden,
 * sem ponteiro, sem seleção (Emil, marketing.md, "Illustrations").
 */

import type { JornadaId } from '@/lib/ecossistema';

const SVG = 'block w-full h-auto pointer-events-none select-none';

export function EmblemaHebraico({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" aria-hidden className={`${SVG} ${className}`}>
      {/* a folha, um pouco girada, com a pauta */}
      <g transform="rotate(-3 120 80)">
        <rect x="34" y="18" width="172" height="124" rx="6" fill="var(--card)" stroke="currentColor" strokeOpacity=".28" />
        {[44, 62, 80, 98, 116].map(y => (
          <line key={y} x1="48" x2="192" y1={y} y2={y} stroke="currentColor" strokeOpacity=".16" />
        ))}
        <line x1="182" x2="182" y1="26" y2="134" stroke="var(--gold)" strokeOpacity=".45" />
        {/* o traço da cursiva, da direita para a esquerda, como se escreve */}
        <path d="M170 96c-10-24-28-34-46-26-14 6-18 22-8 30 9 7 24 2 30-10M112 104c-8-6-20-8-30-2"
              stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="170" cy="96" r="3.4" fill="var(--gold)" />
      </g>
    </svg>
  );
}

export function EmblemaIsrael({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" aria-hidden className={`${SVG} ${className}`}>
      <rect x="18" y="14" width="204" height="132" rx="6" fill="var(--card)" stroke="currentColor" strokeOpacity=".28" />
      {/* a quadrícula da carta */}
      {[50, 86, 122, 158, 194].map(x => (
        <line key={x} x1={x} x2={x} y1="22" y2="138" stroke="currentColor" strokeOpacity=".1" />
      ))}
      {[44, 76, 108].map(y => (
        <line key={y} x1="26" x2="214" y1={y} y2={y} stroke="currentColor" strokeOpacity=".1" />
      ))}
      {/* o trajeto: tracejado, com três paradas */}
      <path d="M58 118c20-6 30-30 52-36s36 8 52-6 22-34 30-40" stroke="var(--gold)" strokeWidth="2"
            strokeDasharray="5 6" strokeLinecap="round" />
      {[[58, 118], [110, 82], [192, 36]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="6.5" fill="var(--card)" stroke="currentColor" strokeWidth="1.6" />
          <circle cx={x} cy={y} r="2.2" fill="currentColor" />
        </g>
      ))}
      {/* a rosa dos ventos */}
      <g transform="translate(184 112)">
        <circle r="15" stroke="currentColor" strokeOpacity=".35" />
        <path d="M0-19 4 0 0 19-4 0Z" fill="currentColor" fillOpacity=".75" />
        <path d="M-19 0 0-4 19 0 0 4Z" fill="currentColor" fillOpacity=".25" />
      </g>
    </svg>
  );
}

export function EmblemaRaizes({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" aria-hidden className={`${SVG} ${className}`}>
      {/* as folhas do maço, uma sob a outra */}
      <rect x="44" y="30" width="150" height="104" rx="4" fill="var(--card)" stroke="currentColor" strokeOpacity=".22"
            transform="rotate(4 120 82)" />
      <rect x="40" y="26" width="150" height="104" rx="4" fill="var(--card)" stroke="currentColor" strokeOpacity=".3"
            transform="rotate(-2 120 78)" />
      {/* as linhas de escrita, sem letra nenhuma */}
      {[48, 60, 72, 84, 96].map((y, i) => (
        <line key={y} x1="58" x2={i === 4 ? 128 : 170} y1={y} y2={y} stroke="currentColor" strokeOpacity=".22" strokeWidth="2"
              strokeLinecap="round" transform="rotate(-2 120 78)" />
      ))}
      {/* a fita e o lacre */}
      <path d="M30 108h180" stroke="var(--gold)" strokeWidth="5" strokeOpacity=".8" />
      <circle cx="150" cy="108" r="13" fill="#7A2E22" />
      <circle cx="150" cy="108" r="8" stroke="#F3D9CF" strokeOpacity=".55" />
    </svg>
  );
}

export function Emblema({ jornada, className = '' }: { jornada: JornadaId; className?: string }) {
  if (jornada === 'israel') return <EmblemaIsrael className={className} />;
  if (jornada === 'raizes') return <EmblemaRaizes className={className} />;
  return <EmblemaHebraico className={className} />;
}
