'use client';

/* As gravuras de Raízes: ilustrações em linha, feitas em SVG no código.
 * ─────────────────────────────────────────────────────────────────────────
 * Um traço só (1,4 no desenho), hachura para a sombra, sem cor própria: a
 * gravura herda a tinta do texto (`currentColor`), e por isso vale no tema
 * claro e no escuro. Quando entra na tela, o traço se escreve (como a folha
 * do édito); com movimento reduzido, já nasce pronta.
 *
 * O que elas são: OBJETOS e LUGARES genéricos da época (uma folha selada, um
 * livro impresso, um navio, uma porta em arco, uma chave). Nunca rostos de
 * pessoas reais, nunca um documento legível que finja ser o original, nunca
 * símbolo religioso como enfeite. Quando uma gravura representa algo real,
 * a peça que a usa diz que ela é interpretativa. */

import { useEffect, useRef, useState, type ReactNode } from 'react';

const T = (d: string, k = 0) => <path key={k} d={d} pathLength={1} className="rz-traco" />;

/** Cada gravura: um viewBox de 120 por 90 e os traços. */
export const GRAVURAS: Record<string, { nome: string; tracos: ReactNode }> = {
  documento: {
    nome: 'Folha selada',
    tracos: <>
      {T('M30 10 L86 8 L94 18 L92 80 L32 82 Q28 46 30 10 Z')}
      {T('M86 8 L86 18 L94 18', 1)}
      {T('M38 24 Q50 21 62 24 T84 23', 2)}{T('M38 32 Q52 29 66 32 T84 31', 3)}{T('M38 40 Q50 37 60 40 T82 39', 4)}
      {T('M38 48 Q54 45 68 48 T84 47', 5)}{T('M38 56 Q48 53 58 56', 6)}
      {T('M60 70 C64 64 70 74 74 68 C78 62 82 72 86 66', 7)}
      <circle cx="54" cy="84" r="7" className="rz-traco-cheio" />
    </>
  },
  livro: {
    nome: 'Livro impresso aberto',
    tracos: <>
      {T('M14 24 Q36 16 60 26 Q84 16 106 24 L106 74 Q84 66 60 76 Q36 66 14 74 Z')}
      {T('M60 26 L60 76', 1)}
      {T('M22 34 L52 36 M22 41 L52 43 M22 48 L50 50 M22 55 L52 57 M22 62 L46 63', 2)}
      {T('M68 36 L98 34 M68 43 L98 41 M70 50 L98 48 M68 57 L98 55 M68 63 L90 62', 3)}
      {T('M14 74 Q36 70 60 80 Q84 70 106 74', 4)}
    </>
  },
  navio: {
    nome: 'Navio de velas',
    tracos: <>
      {T('M16 58 L104 58 L92 72 L28 72 Z')}
      {T('M44 58 L44 16 M76 58 L76 22', 1)}
      {T('M44 18 Q60 30 44 50 M76 24 Q92 36 76 52', 2)}
      {T('M44 18 L30 46 L44 50 M76 24 L64 48 L76 52', 3)}
      {T('M6 80 Q16 76 26 80 T46 80 T66 80 T86 80 T106 80 T116 80', 4)}
      {T('M30 64 L86 64', 5)}
    </>
  },
  porta: {
    nome: 'Porta em arco de uma rua antiga',
    tracos: <>
      {T('M20 84 L20 40 Q20 10 60 10 Q100 10 100 40 L100 84')}
      {T('M34 84 L34 44 Q34 24 60 24 Q86 24 86 44 L86 84', 1)}
      {T('M60 24 L60 84', 2)}
      {T('M24 30 L32 34 M28 20 L36 26 M40 13 L44 22 M60 10 L60 20 M80 13 L76 22 M92 20 L84 26 M96 30 L88 34', 3)}
      {T('M52 56 L52 60 M68 56 L68 60', 4)}
      {T('M10 84 L110 84', 5)}
    </>
  },
  chave: {
    nome: 'Chave antiga',
    tracos: <>
      <circle cx="30" cy="45" r="14" pathLength={1} className="rz-traco" />
      <circle cx="30" cy="45" r="6" pathLength={1} className="rz-traco" />
      {T('M44 45 L104 45 L104 58 M92 45 L92 54 M82 45 L82 51')}
    </>
  },
  mapa: {
    nome: 'Mapa dobrado',
    tracos: <>
      {T('M12 18 L42 10 L78 18 L108 10 L108 74 L78 82 L42 74 L12 82 Z')}
      {T('M42 10 L42 74 M78 18 L78 82', 1)}
      {T('M22 40 Q34 30 48 38 T70 36 T96 44', 2)}
      {T('M26 60 L34 54 L46 62 L58 50', 3)}
      <circle cx="58" cy="50" r="3.5" className="rz-traco-cheio" />
    </>
  },
  pena: {
    nome: 'Pena de escrever',
    tracos: <>
      {T('M90 8 C66 14 42 36 30 70 L34 72 C48 40 70 22 90 8 Z')}
      {T('M90 8 C80 24 64 40 40 60', 1)}
      {T('M30 70 L26 82', 2)}
      {T('M14 84 Q30 78 46 84 T78 84', 3)}
    </>
  },
  carimbo: {
    nome: 'Carimbo de tinta',
    tracos: <>
      {T('M50 10 Q60 6 70 10 L70 34 L50 34 Z')}
      {T('M40 34 L80 34 L84 46 L36 46 Z', 1)}
      {T('M24 60 L96 60 L96 82 L24 82 Z', 2)}
      {T('M34 68 L86 68 M34 74 L74 74', 3)}
    </>
  },
  lupa: {
    nome: 'Lupa',
    tracos: <>
      <circle cx="48" cy="40" r="24" pathLength={1} className="rz-traco" />
      {T('M66 58 L96 84')}
      {T('M36 30 Q42 24 50 24', 1)}
    </>
  },
  ampulheta: {
    nome: 'Ampulheta',
    tracos: <>
      {T('M38 8 L82 8 M38 82 L82 82')}
      {T('M42 8 Q42 34 60 45 Q42 56 42 82 M78 8 Q78 34 60 45 Q78 56 78 82', 1)}
      {T('M50 74 Q60 64 70 74 Z', 2)}
      {T('M60 46 L60 70', 3)}
    </>
  },
  estrada: {
    nome: 'Caminho com marcos',
    tracos: <>
      {T('M40 86 Q52 60 58 40 Q62 24 60 8')}
      {T('M80 86 Q68 60 64 40 Q62 24 62 8', 1)}
      {T('M22 70 L22 58 L28 58 L28 70 M92 52 L92 42 L97 42 L97 52', 2)}
      {T('M8 86 L112 86', 3)}
    </>
  },
  arvore: {
    nome: 'Árvore de família desenhada',
    tracos: <>
      {T('M60 84 L60 50 M60 50 L34 30 M60 50 L86 30 M34 30 L22 14 M34 30 L46 14 M86 30 L74 14 M86 30 L98 14')}
      {[[60, 84], [34, 30], [86, 30], [22, 14], [46, 14], [74, 14], [98, 14]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" pathLength={1} className="rz-traco" />
      ))}
    </>
  },
  musica: {
    nome: 'Pandeiro e notas',
    tracos: <>
      <circle cx="44" cy="52" r="26" pathLength={1} className="rz-traco" />
      <circle cx="44" cy="52" r="20" pathLength={1} className="rz-traco" />
      {T('M80 20 L80 56 M80 20 L104 14 L104 50')}
      <circle cx="76" cy="58" r="4" className="rz-traco-cheio" />
      <circle cx="100" cy="52" r="4" className="rz-traco-cheio" />
    </>
  },
  lapide: {
    nome: 'Lápide de pedra',
    tracos: <>
      {T('M38 84 L38 30 Q38 10 60 10 Q82 10 82 30 L82 84')}
      {T('M46 32 L74 32 M46 40 L74 40 M46 48 L70 48 M46 58 L74 58 M46 66 L68 66', 1)}
      {T('M84 30 L90 34 L90 84 M28 84 L96 84', 2)}
    </>
  },
  edificio: {
    nome: 'Fachada de um edifício antigo',
    tracos: <>
      {T('M14 84 L14 30 L60 12 L106 30 L106 84 Z')}
      {T('M30 84 L30 58 Q30 48 40 48 Q50 48 50 58 L50 84 M70 84 L70 58 Q70 48 80 48 Q90 48 90 58 L90 84', 1)}
      {T('M26 38 L42 38 L42 30 L26 30 Z M78 38 L94 38 L94 30 L78 30 Z', 2)}
      {T('M54 30 Q60 24 66 30', 3)}
      {T('M6 84 L114 84', 4)}
    </>
  },
  astrolabio: {
    nome: 'Astrolábio',
    tracos: <>
      {T('M60 18 a30 30 0 1 0 0.01 0 Z')}
      {T('M60 24 a24 24 0 1 0 0.01 0 Z', 1)}
      {T('M60 8 a5 5 0 1 0 0.01 0 M60 13 L60 18', 2)}
      {T('M36 48 H84 M60 24 V72', 3)}
      {T('M40 66 L80 30 M78 28 l4 -2 l-2 4 M42 68 l-4 2 l2 -4', 4)}
      {T('M60 18 v4 M90 48 h-4 M60 78 v-4 M30 48 h4 M81 27 l-3 3 M39 69 l3 -3 M81 69 l-3 -3 M39 27 l3 3', 5)}
      <circle cx="60" cy="48" r="2.5" className="rz-traco-cheio" />
    </>
  },
  prensa: {
    nome: 'Prensa de tipografia',
    tracos: <>
      {T('M30 82 V12 M90 82 V12 M24 12 H96 M24 20 H96')}
      {T('M60 20 V44 M58 26 H62 M58 32 H62 M58 38 H62', 1)}
      {T('M44 30 L76 34', 2)}
      {T('M42 44 H78 V50 H42 Z', 3)}
      {T('M30 62 H90 M34 62 V70 H86 V62', 4)}
      {T('M44 56 H76 V62 H44 Z M48 58 H70', 5)}
      {T('M20 82 H100', 6)}
    </>
  },
  teatro: {
    nome: 'Palco de bonecos, com as cortinas abertas',
    tracos: <>
      {T('M16 80 V14 H104 V80 M10 80 H110')}
      {T('M16 14 Q30 30 22 60 L16 60 M104 14 Q90 30 98 60 L104 60', 1)}
      {T('M16 14 Q60 24 104 14', 2)}
      {T('M24 66 H96 V80 H24 Z', 3)}
      {T('M48 30 H72 M60 26 V34 M50 30 V48 M70 30 V46 M60 34 V44', 4)}
      {T('M34 72 h8 M54 72 h12 M78 72 h8', 5)}
    </>
  },
  balanca: {
    nome: 'Dois pratos de uma balança, para comparar',
    tracos: <>
      {T('M60 12 L60 80 M40 80 L80 80')}
      {T('M24 26 L96 26', 1)}
      {T('M24 26 L14 50 L34 50 Z M96 26 L86 50 L106 50 Z', 2)}
    </>
  }
};

export type NomeDaGravura = keyof typeof GRAVURAS;

/** A gravura escolhida para cada seção do módulo, quando o dado não pede outra. */
export const VINHETA_DA_SECAO: Record<string, NomeDaGravura> = {
  descobrir: 'lupa',
  contextualizar: 'ampulheta',
  explorar: 'mapa',
  investigar: 'documento',
  aplicar: 'balanca',
  refletir: 'pena',
  consolidar: 'carimbo',
  avancar: 'estrada'
};

export function Gravura({ nome, className = '' }: { nome: string; className?: string }) {
  const g = GRAVURAS[nome];
  const ref = useRef<SVGSVGElement>(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setVisto(true); o.disconnect(); } }, { rootMargin: '0px 0px -10% 0px' });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  if (!g) return null;
  return (
    <svg ref={ref} viewBox="0 0 120 90" className={`rz-gravura ${visto ? 'vista' : ''} ${className}`} aria-hidden focusable="false">
      {g.tracos}
    </svg>
  );
}
