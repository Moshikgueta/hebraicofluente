'use client';

/* De onde sai o som, nas letras de garganta.
 * ─────────────────────────────────────────────────────────────────────────
 * Quatro letras do curso são feitas atrás da língua, num lugar que o
 * brasileiro não costuma usar de propósito: ר, ח, o כ suave e ה. Descrever
 * em palavras ("no fundo da boca") deixa cada um imaginar um lugar diferente,
 * e o erro mais caro do curso mora aí - o R carioca de "carro" soa como ח, e
 * não como ר.
 *
 * O desenho é um corte da cabeça de perfil, de frente para a esquerda, com o
 * ponto de articulação aceso e o caminho do ar tracejado. Dois pontos só:
 *   uvula - a "campainha" no fundo da boca (ר, ח, o כ suave)
 *   glote - as cordas vocais, lá embaixo (ה)
 * e a VOZ ao lado, porque ר e ח saem do mesmo lugar e a diferença entre eles
 * é só a garganta vibrar ou não.
 *
 * Público por construção: não lê conteúdo pago, recebe tudo por propriedade.
 * As cores são as variáveis do tema, então vale no claro e no escuro.
 */

import { Prose } from './Blocks';

type Ponto = 'uvula' | 'glote';

const PONTO: Record<Ponto, { x: number; y: number; nome: string }> = {
  uvula: { x: 150, y: 126, nome: 'úvula' },
  glote: { x: 149, y: 186, nome: 'cordas vocais' }
};

export function OndeNasceOSom({
  ponto, voz, comoPt, letra
}: {
  ponto: Ponto;
  voz: boolean;
  comoPt: string;
  /** A letra, para o texto alternativo. */
  letra: string;
}) {
  const p = PONTO[ponto];
  const descricao = `Corte da cabeça de perfil. O som de ${letra} sai ${
    ponto === 'uvula' ? 'da úvula, no fundo da boca' : 'das cordas vocais, na garganta'
  }, ${voz ? 'com a voz ligada' : 'sem voz, só com o ar'}.`;

  return (
    <figure className="m-0 grid gap-3 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-center
                       rounded-[var(--r-lg)] bg-surface-2 p-4">
      <svg viewBox="0 0 300 222" role="img" aria-label={descricao}
           className="w-full max-w-[280px] justify-self-center">
        {/* A cabeça: rosto à esquerda, nuca à direita. */}
        <g fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M150 15 C105 10 68 22 60 55 L57 72 L40 94 Q38 100 50 103 L45 112 L49 119 L45 128
                   Q48 148 62 152 Q80 160 92 163 L96 214" />
          <path d="M150 15 C195 22 205 90 190 120 Q178 140 168 150 L166 214" />
        </g>
        {/* Por dentro: o céu da boca até a úvula, a língua, a parede do
            fundo da garganta e as cordas vocais. */}
        <g fill="none" stroke="var(--ink-muted)" strokeWidth="1.6" strokeLinecap="round" opacity="0.75">
          <path d="M52 112 Q85 98 118 104 Q135 108 146 118" />
          <path d="M52 124 Q70 118 95 116 Q125 116 137 134 Q142 150 140 176" />
          <path d="M157 110 Q161 150 157 196" />
          <path d="M140 188 L149 184 L157 188" />
        </g>
        <ellipse cx="148" cy="123" rx="3.5" ry="6.5" fill="var(--ink-muted)" opacity="0.75" />

        {/* O caminho do ar: sobe dos pulmões e sai pela boca. */}
        <path d="M149 212 L149 160 Q149 132 132 126 L60 122 L34 121"
              fill="none" stroke="var(--teal-ink)" strokeWidth="1.8" strokeDasharray="4 5"
              strokeLinecap="round" opacity="0.7" />
        <path d="M40 116 L32 121 L40 126" fill="none" stroke="var(--teal-ink)" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />

        {/* O ponto aceso. O anel pulsa só para quem não pediu menos movimento. */}
        <circle cx={p.x} cy={p.y} r="15" fill="var(--teal-ink)" opacity="0.14"
                className="motion-safe:animate-pulse" />
        <circle cx={p.x} cy={p.y} r="8" fill="var(--teal-ink)" opacity="0.9" />
        {/* O rótulo fica FORA da cabeça, com uma linha-guia: dentro, ele
            cruzava a nuca e o pescoço. */}
        <path d={`M${p.x + 10} ${p.y} L210 ${p.y}`} stroke="var(--teal-ink)" strokeWidth="1.2" opacity="0.8" />
        <text x="215" y={p.y + 4} fontSize="12" fill="var(--teal-ink)" fontWeight="600"
              style={{ fontFamily: 'var(--font-ui, sans-serif)' }}>
          {p.nome}
        </text>
      </svg>

      <figcaption className="grid gap-2">
        <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">
          De onde sai o som
        </p>
        <p className="text-[15px] leading-relaxed text-ink-body m-0"><Prose text={comoPt} /></p>
        <p className="font-ui text-[13px] m-0">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
            ${voz ? 'bg-[var(--accent-wash)] text-[var(--teal-ink)]' : 'bg-surface text-ink-body border border-line'}`}>
            <span aria-hidden>{voz ? '〰' : '·'}</span>
            {voz ? 'Com voz: a garganta vibra' : 'Sem voz: só o ar passando'}
          </span>
        </p>
      </figcaption>
    </figure>
  );
}
