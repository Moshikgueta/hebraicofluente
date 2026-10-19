'use client';

/* De onde sai o som, em toda letra.
 * ─────────────────────────────────────────────────────────────────────────
 * Começou nas quatro letras de garganta (ר, ח, o כ suave, ה), porque é lá que
 * o brasileiro erra: descrever "no fundo da boca" em palavras deixa cada um
 * imaginar um lugar, e o R carioca de "carro" soa como ח, não como ר. O dono
 * do curso pediu o desenho em TODAS as letras (25/09/2026): mesmo onde o som
 * é o do português, ver o lugar acende o que separa pares como ד e ת (o mesmo
 * lugar, com e sem voz) e ב e בּ (dois lugares, uma letra).
 *
 * O desenho é um corte da cabeça de perfil, de frente para a esquerda, com o
 * ponto de articulação aceso e o caminho do ar tracejado. Sete lugares, da
 * frente para o fundo:
 *   labios        os dois lábios (מ, בּ, פּ)
 *   labio-dentes  os dentes de cima no lábio de baixo (ו, ב, פ)
 *   dentes        a ponta da língua atrás dos dentes (ת, ד, נ, ל, ז, ס, צ, ט, שׂ)
 *   palato        o céu da boca (י, שׁ)
 *   veu           o fundo do céu da boca (ג, ק, כּ)
 *   uvula         a "campainha" (ר, ח, כ)
 *   glote         as cordas vocais (ה)
 * Letra de duas leituras acende os dois, cada um com a sua forma no rótulo.
 * Letra muda (א, ע) não acende nada: é o desenho dizendo que ela não soa.
 * Nas nasais (מ, נ) o ar sai pelo nariz, e o tracejado mostra isso.
 *
 * A VOZ vai ao lado, porque é o que separa ר de ח e ד de ת: o mesmo lugar,
 * com a garganta vibrando ou não.
 *
 * Público por construção: não lê conteúdo pago, recebe tudo por propriedade.
 * As cores são as variáveis do tema, então vale no claro e no escuro.
 */

import { Prose } from './Blocks';
import type { Articulacao, PontoDoSom } from '@/lib/content-publico';

export const LUGAR: Record<PontoDoSom, { x: number; y: number; nome: string; frase: string }> = {
  labios: { x: 45, y: 120, nome: 'lábios', frase: 'dos dois lábios' },
  'labio-dentes': { x: 53, y: 112, nome: 'lábio e dentes', frase: 'dos dentes de cima no lábio de baixo' },
  dentes: { x: 62, y: 109, nome: 'atrás dos dentes', frase: 'da ponta da língua atrás dos dentes' },
  palato: { x: 88, y: 102, nome: 'céu da boca', frase: 'do meio da língua perto do céu da boca' },
  veu: { x: 124, y: 106, nome: 'fundo do céu da boca', frase: 'do fundo da língua no fundo do céu da boca' },
  uvula: { x: 150, y: 126, nome: 'úvula', frase: 'da úvula, no fundo da boca' },
  glote: { x: 149, y: 186, nome: 'cordas vocais', frase: 'das cordas vocais, na garganta' }
};

/* Os rótulos ficam numa coluna à direita, FORA da cabeça - dentro, cruzavam
   a nuca e o pescoço. Dois rótulos nunca ficam a menos de 22 px um do outro. */
const COLUNA = 222;
function posicoes(ys: number[]): number[] {
  const ordem = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  const out = new Array<number>(ys.length);
  let ultimo = -Infinity;
  for (const { y, i } of ordem) { ultimo = Math.max(y, ultimo + 22); out[i] = ultimo; }
  return out;
}

export function OndeNasceOSom({ articulacao, letra }: {
  articulacao: Articulacao;
  /** O nome da letra, para o texto alternativo. */
  letra: string;
}) {
  const { pontos, voz, nariz, comoPt } = articulacao;
  const lugares = pontos.map(p => ({ ...LUGAR[p.ponto], rotulo: p.rotulo }));
  const ys = posicoes(lugares.map(l => l.y));
  const muda = voz === null;

  const onde = lugares.length
    ? lugares.map(l => `${l.rotulo ? `${l.rotulo}: ` : ''}${l.frase}`).join('; ')
    : 'de lugar nenhum: a letra não tem som próprio';
  const descricao = `Corte da cabeça de perfil. O som de ${letra} sai ${onde}${
    muda ? '' : voz ? ', com a voz ligada' : ', sem voz, só com o ar'
  }${nariz ? ', e o ar sai pelo nariz' : ''}.`;

  return (
    <figure className="m-0 grid gap-3 sm:grid-cols-[310px_minmax(0,1fr)] sm:items-center
                       rounded-[var(--r-lg)] bg-surface-2 p-4">
      <svg viewBox="0 0 372 222" role="img" aria-label={descricao}
           className="w-full max-w-[330px] justify-self-center">
        {/* A cabeça: rosto à esquerda, nuca à direita. */}
        <g fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M150 15 C105 10 68 22 60 55 L57 72 L40 94 Q38 100 50 103 L45 112 L49 119 L45 128
                   Q48 148 62 152 Q80 160 92 163 L96 214" />
          <path d="M150 15 C195 22 205 90 190 120 Q178 140 168 150 L166 214" />
        </g>
        {/* Por dentro: os dentes de cima, o céu da boca até a úvula, a
            língua, a parede do fundo da garganta e as cordas vocais. */}
        <g fill="none" stroke="var(--ink-muted)" strokeWidth="1.6" strokeLinecap="round" opacity="0.75">
          <path d="M52 105 L52 113 L56 113 L56 106" />
          <path d="M52 112 Q85 98 118 104 Q135 108 146 118" />
          <path d="M52 124 Q70 118 95 116 Q125 116 137 134 Q142 150 140 176" />
          <path d="M157 110 Q161 150 157 196" />
          <path d="M140 188 L149 184 L157 188" />
          {/* A cavidade do nariz, por onde sai o ar das nasais. */}
          <path d="M54 86 Q95 80 138 100" opacity="0.6" />
        </g>
        <ellipse cx="148" cy="123" rx="3.5" ry="6.5" fill="var(--ink-muted)" opacity="0.75" />

        {/* O caminho do ar: sobe dos pulmões e sai pela boca - ou, nas
            nasais, pelo nariz. */}
        <path d={nariz
          ? 'M149 212 L149 160 Q149 124 140 106 Q120 88 80 88 L36 92'
          : 'M149 212 L149 160 Q149 132 132 126 L60 122 L34 121'}
              fill="none" stroke="var(--teal-ink)" strokeWidth="1.8" strokeDasharray="4 5"
              strokeLinecap="round" opacity="0.7" />
        <path d={nariz ? 'M42 87 L34 92 L42 97' : 'M40 116 L32 121 L40 126'} fill="none" stroke="var(--teal-ink)"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />

        {/* Os pontos acesos. O anel pulsa só para quem não pediu menos movimento. */}
        {lugares.map((l, i) => (
          <g key={`${l.x}-${l.y}`}>
            <circle cx={l.x} cy={l.y} r={lugares.length > 1 ? 11 : 15} fill="var(--teal-ink)" opacity="0.14"
                    className="motion-safe:animate-pulse" />
            <circle cx={l.x} cy={l.y} r={lugares.length > 1 ? 5.5 : 8} fill="var(--teal-ink)" opacity="0.9" />
            <path d={`M${l.x + 8} ${l.y} L${COLUNA - 8} ${ys[i]}`} stroke="var(--teal-ink)"
                  strokeWidth="1.1" opacity="0.7" fill="none" />
            <text x={COLUNA} y={ys[i]! + 4} fontSize="12" fill="var(--teal-ink)" fontWeight="600"
                  style={{ fontFamily: 'var(--font-ui, sans-serif)' }}>
              {l.rotulo && (
                <tspan fontSize="17" style={{ fontFamily: 'var(--font-he, serif)' }}>{l.rotulo} </tspan>
              )}
              {l.nome}
            </text>
          </g>
        ))}
        {muda && (
          <text x={COLUNA} y="126" fontSize="12" fill="var(--ink-muted)" fontWeight="600"
                style={{ fontFamily: 'var(--font-ui, sans-serif)' }}>
            sem som próprio
          </text>
        )}
      </svg>

      <figcaption className="grid gap-2">
        <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">
          De onde sai o som?
        </p>
        <p className="text-[15px] leading-relaxed text-ink-body m-0"><Prose text={comoPt} /></p>
        <p className="font-ui text-[13px] m-0 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
            ${voz ? 'bg-[var(--accent-wash)] text-[var(--teal-ink)]' : 'bg-surface text-ink-body border border-line'}`}>
            <span aria-hidden>{voz ? '〰' : '·'}</span>
            {muda ? 'Muda: quem soa é a vogal' : voz ? 'Com voz: a garganta vibra' : 'Sem voz: só o ar passando'}
          </span>
          {nariz && (
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-surface text-ink-body border border-line">
              O ar sai pelo nariz
            </span>
          )}
        </p>
      </figcaption>
    </figure>
  );
}
