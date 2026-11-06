'use client';

/* Arrastar as peças de "Monte a palavra" (28/10/2026, pedido do dono). A
 * conta de onde a peça cai mora em `lib/arrastar.ts`; aqui fica o gesto.
 * ─────────────────────────────────────────────────────────────────────────
 * Um gesto A MAIS, nunca o único: o toque continua pondo e tirando a peça, e
 * é ele que o teclado e o leitor de tela usam. O arrastar só começa depois
 * de o dedo andar 8 px - antes disso é um toque, e o clique segue normal.
 * Depois de um arrastar, o clique que o navegador dispara no fim é engolido.
 *
 *   · da mesa para a palavra: a peça entra onde foi solta;
 *   · dentro da palavra: a peça muda de lugar;
 *   · da palavra para fora: a peça volta à mesa.
 *
 * A peça que segue o dedo anda por `transform` direto no elemento, sem
 * renderizar a tela a cada movimento.
 */

import { useRef, useState, type PointerEvent, type ReactNode, type MouseEvent } from 'react';
import { posicaoDeSoltar, soltarNaPalavra, tirarDaPalavra } from '@/lib/arrastar';

type Origem = 'mesa' | 'palavra';
type Inicio = { peca: number; origem: Origem; x0: number; y0: number; ativo: boolean };

const LIMIAR = 8;
/* A peça flutuante fica acima do dedo, para o dedo não a esconder. */
const ACIMA = 44;

export function useArrastarPecas({ montada, setMontada, podePor, desligado, peca }: {
  montada: readonly number[];
  setMontada: (m: number[]) => void;
  /** Se uma peça da mesa ainda cabe na palavra (a palavra pode estar cheia). */
  podePor: () => boolean;
  desligado: boolean;
  /** Como a peça aparece enquanto segue o dedo. */
  peca: (i: number) => ReactNode;
}) {
  const bandeja = useRef<HTMLDivElement | null>(null);
  const fantasma = useRef<HTMLDivElement | null>(null);
  const inicio = useRef<Inicio | null>(null);
  const ponto = useRef({ x: 0, y: 0 });
  const engolirClique = useRef(false);
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [sobre, setSobre] = useState(false);

  const dentro = (x: number, y: number) => {
    const r = bandeja.current?.getBoundingClientRect();
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };
  const mover = (x: number, y: number) => {
    ponto.current = { x, y };
    const el = fantasma.current;
    if (el) el.style.transform = `translate(${x}px, ${y - ACIMA}px) translate(-50%, -50%)`;
  };
  const fim = () => { inicio.current = null; setArrastando(null); setSobre(false); };

  const handlers = (i: number, origem: Origem) => ({
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (desligado || e.button !== 0) return;
      inicio.current = { peca: i, origem, x0: e.clientX, y0: e.clientY, ativo: false };
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const s = inicio.current;
      if (!s) return;
      if (!s.ativo) {
        if (Math.hypot(e.clientX - s.x0, e.clientY - s.y0) < LIMIAR) return;
        if (s.origem === 'mesa' && !podePor()) { inicio.current = null; return; }
        s.ativo = true;
        ponto.current = { x: e.clientX, y: e.clientY };
        setArrastando(s.peca);
      }
      mover(e.clientX, e.clientY);
      const d = dentro(e.clientX, e.clientY);
      setSobre(v => (v === d ? v : d));
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      const s = inicio.current;
      if (!s?.ativo) { inicio.current = null; return; }
      engolirClique.current = true;
      if (dentro(e.clientX, e.clientY)) {
        const caixas = [...(bandeja.current?.querySelectorAll<HTMLElement>('[data-posta]') ?? [])]
          .map(el => el.getBoundingClientRect());
        setMontada(soltarNaPalavra(montada, s.peca, posicaoDeSoltar(caixas, e.clientX, e.clientY)));
      } else if (s.origem === 'palavra') {
        setMontada(tirarDaPalavra(montada, s.peca));
      }
      fim();
    },
    onPointerCancel: fim,
    onClickCapture: (e: MouseEvent<HTMLElement>) => {
      if (!engolirClique.current) return;
      engolirClique.current = false;
      e.preventDefault();
      e.stopPropagation();
    }
  });

  const flutuante = arrastando == null ? null : (
    <div ref={fantasma} aria-hidden
         className="fixed left-0 top-0 z-50 pointer-events-none scale-110 rounded-[var(--r-md)] border-2
                    border-[var(--teal)] bg-surface shadow-[var(--sh)] min-h-[64px] min-w-[60px] px-3 grid place-items-center"
         style={{ transform: `translate(${ponto.current.x}px, ${ponto.current.y - ACIMA}px) translate(-50%, -50%)` }}>
      {peca(arrastando)}
    </div>
  );

  return { bandeja, handlers, flutuante, arrastando, sobre };
}
