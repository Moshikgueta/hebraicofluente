'use client';

/* A folha selada: a primeira ilustração do sistema "O Arquivo Aberto".
 * ─────────────────────────────────────────────────────────────────────────
 * Gravura em linha, traço de 1,25 no desenho, tinta e uma cor de apoio (o
 * lacre). NÃO é o édito de 1496: as linhas são traço, nunca texto, e a
 * legenda diz que a ilustração é interpretativa. Quando `desenhar` está
 * ligado, cada traço se escreve como tinta (stroke-dashoffset), e o selo
 * assenta por último; com movimento reduzido, a folha já nasce pronta.
 *
 * As partes tocáveis são botões HTML por cima do desenho: alvo de dedo,
 * foco de teclado e nome para leitor de tela. */

import { useMemo } from 'react';

/** Onde cada parte da folha fica, em % da caixa (cabeçalho, corpo, fim, selo). */
export const PARTES_DA_FOLHA = [
  { x: 30, y: 16 }, { x: 70, y: 38 }, { x: 30, y: 58 }, { x: 80, y: 74 }
] as const;

/** Um gerador determinístico: a mesma folha a cada visita. */
function acaso(semente: number) {
  let s = semente;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

/** Uma linha de "escrita": ondas curtas e palavras de largura variada, ilegíveis de propósito. */
function linhaDeEscrita(x0: number, x1: number, y: number, r: () => number): string[] {
  const palavras: string[] = [];
  let x = x0;
  while (x < x1 - 14) {
    const larg = Math.min(x1 - x, 14 + r() * 34);
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const passos = Math.max(3, Math.round(larg / 5));
    for (let i = 1; i <= passos; i++) {
      const px = x + (larg * i) / passos;
      const py = y + (i % 2 ? -2.6 - r() * 1.6 : 0.4 + r() * 0.8);
      d += ` L${px.toFixed(1)} ${py.toFixed(1)}`;
    }
    palavras.push(d);
    x += larg + 6 + r() * 4;
  }
  return palavras;
}

export function Edito({
  desenhar = false, partes = [], ativa = null, lidas, onParte, tom = 'papel'
}: {
  desenhar?: boolean;
  /** Rótulos das partes tocáveis (até quatro); sem elas, a folha é só ilustração. */
  partes?: { id: string; rotulo: string }[];
  ativa?: string | null;
  lidas?: ReadonlySet<string>;
  onParte?: (id: string) => void;
  /** `noite`: a folha sobre o fundo escuro da abertura. */
  tom?: 'papel' | 'noite';
}) {
  const tracos = useMemo(() => {
    const r = acaso(1496);
    const linhas: { d: string; atraso: number }[] = [];
    let k = 0;
    /* Cabeçalho: uma linha mais alta, como a intitulação. */
    for (const d of linhaDeEscrita(118, 330, 92, r)) linhas.push({ d, atraso: 0.3 + 0.03 * k++ });
    for (let i = 0; i < 12; i++) {
      const y = 136 + i * 19.5;
      const fim = i === 11 ? 220 : 338 - r() * 14;
      for (const d of linhaDeEscrita(i === 0 ? 62 : 56, fim, y, r)) linhas.push({ d, atraso: 0.45 + 0.011 * k++ });
    }
    return linhas;
  }, []);
  const fim = tracos.length ? tracos[tracos.length - 1]!.atraso : 1;

  return (
    <div className={`rz-edito relative ${desenhar ? 'rz-edito-desenha' : ''} ${tom === 'noite' ? 'rz-edito-noite' : ''}`}>
      <svg viewBox="0 0 400 500" className="block h-auto w-full" aria-hidden focusable="false">
        <defs>
          <pattern id="rz-hachura" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
            <line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
          </pattern>
        </defs>
        {/* A sombra da folha, em hachura (a luz vem do alto, à esquerda). */}
        <path d="M44 34 L362 30 L368 446 L50 452 Z" fill="url(#rz-hachura)" transform="translate(9 9)" className="rz-edito-sombra" />
        {/* A folha: borda levemente irregular, canto dobrado, as dobras de carta. */}
        <path d="M40 30 L330 26 L360 56 L364 444 L46 450 Q38 240 40 30 Z" className="rz-edito-folha" />
        <path d="M330 26 L330 56 L360 56" pathLength={1} className="rz-tinta" style={{ ['--d' as string]: '0.1s' }} />
        <path d="M40 30 L330 26 L360 56 L364 444 L46 450 Q38 240 40 30 Z" pathLength={1} className="rz-tinta" style={{ ['--d' as string]: '0s' }} />
        <path d="M44 178 Q200 172 362 176" pathLength={1} className="rz-tinta rz-dobra" style={{ ['--d' as string]: '0.25s' }} />
        <path d="M45 318 Q200 322 363 314" pathLength={1} className="rz-tinta rz-dobra" style={{ ['--d' as string]: '0.3s' }} />
        {/* A capitular: uma caixa com arabesco, sem letra. */}
        <rect x="58" y="66" width="44" height="44" pathLength={1} className="rz-tinta" style={{ ['--d' as string]: '0.2s' }} />
        <path d="M64 104 C70 76 92 70 96 84 C99 96 78 100 74 88 C71 80 84 74 90 78" pathLength={1} className="rz-tinta" style={{ ['--d' as string]: '0.3s' }} />
        {tracos.map((t, i) => (
          <path key={i} d={t.d} pathLength={1} className="rz-tinta rz-escrita" style={{ ['--d' as string]: `${t.atraso.toFixed(2)}s` }} />
        ))}
        {/* A assinatura, um rabisco largo; e o cordão que desce para o selo. */}
        <path d="M222 396 C236 372 252 410 268 386 C280 368 292 402 312 380 C320 372 330 384 322 392" pathLength={1} className="rz-tinta" style={{ ['--d' as string]: `${(fim + 0.1).toFixed(2)}s` }} />
        <path d="M244 450 C238 466 250 474 256 470 M268 450 C276 466 266 474 260 470" pathLength={1} className="rz-tinta" style={{ ['--d' as string]: `${(fim + 0.25).toFixed(2)}s` }} />
        <g className="rz-selo" style={{ ['--d' as string]: `${(fim + 0.45).toFixed(2)}s` }}>
          <circle cx="258" cy="472" r="22" className="rz-selo-cera" />
          <circle cx="258" cy="472" r="15" fill="none" className="rz-selo-relevo" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return <line key={i} x1={258 + Math.cos(a) * 6} y1={472 + Math.sin(a) * 6} x2={258 + Math.cos(a) * 11} y2={472 + Math.sin(a) * 11} className="rz-selo-relevo" />;
          })}
        </g>
      </svg>
      {partes.slice(0, PARTES_DA_FOLHA.length).map((p, i) => {
        const pos = PARTES_DA_FOLHA[i]!;
        const lida = lidas?.has(p.id);
        return (
          <button key={p.id} type="button" onClick={() => onParte?.(p.id)} aria-pressed={ativa === p.id}
            aria-label={`${i + 1}. ${p.rotulo}${lida ? ' (lida)' : ''}`}
            className={`rz-marco ${lida ? 'lida' : ''}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
            <span aria-hidden>{i + 1}</span>
          </button>
        );
      })}
    </div>
  );
}
