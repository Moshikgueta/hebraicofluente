'use client';

/* O quadro onde o dedo escreve, sozinho e sem nada em volta.
 * ─────────────────────────────────────────────────────────────────────────
 * Isto era a metade de dentro de `WritingCanvas.tsx` e saiu de lá quando a
 * capa passou a oferecer uma etapa de escrita na aula aberta da Álef. Havia
 * duas saídas, e uma delas era errada:
 *
 *   · escrever um segundo quadro para a capa - e deixar as duas cópias da
 *     conta de coordenadas divergirem no primeiro conserto que só uma delas
 *     recebesse. Essa conta já custou um defeito em que a tinta caía um
 *     terço adiante do dedo; duplicá-la é combinar de repeti-lo;
 *   · extrair o quadro, que é o que está aqui.
 *
 * ── a fronteira, que é o motivo de este arquivo existir separado ────────
 * Este módulo NÃO pode importar conteúdo pago, nem direta nem indiretamente.
 * É o que permite à capa usá-lo: a capa é pública e nunca passa pelo portão
 * do aluno, e um componente que leia `lib/content` lança durante o render e
 * derruba a árvore inteira do React - exatamente o que aconteceu com a aba
 * «Escrita» da demonstração. `npm run clique` prova isso a cada publicação.
 *
 * Por isso o modelo da letra é o GLIFO, renderizado pelo <He> na fonte
 * cursiva, e não a geometria dos traços. A ordem dos movimentos, quando
 * quem chama quiser mostrá-la, é problema de quem chama: dentro do curso
 * vem do `StrokeOrderPlayer`; na capa, do diagrama SVG público.
 *
 * ── a regra do celular, que é absoluta ──────────────────────────────────
 * Enquanto um dedo está no quadro a PÁGINA NÃO PODE SE MEXER. Nem rolar,
 * nem balançar, nem puxar para atualizar, nem dar zoom. Tudo abaixo faz um
 * trabalho só:
 *
 *   · `touch-action: none` no canvas - o navegador deixa de tratar o gesto
 *     como possível rolagem ou pinça antes mesmo de ele começar;
 *   · `overscroll-behavior: contain` na moldura - um gesto que chega à borda
 *     não encadeia para a página e não dispara o puxar-para-atualizar;
 *   · `setPointerCapture` - o traço sobrevive ao dedo sair do quadro no meio
 *     da letra, o que de outro modo corta um ג ao meio;
 *   · ouvintes nativos e NÃO passivos, com preventDefault. O React não
 *     promete passividade aqui, e um `preventDefault()` de ouvinte passivo é
 *     ignorado em silêncio;
 *   · nada é desligado globalmente. A rolagem funciona normalmente no resto
 *     da página, e volta a funcionar aqui no instante em que o dedo sai.
 *
 * Dois detalhes que não são óbvios e já foram errados uma vez cada:
 *   · redimensionar um canvas o APAGA, e um ResizeObserver dispara quando a
 *     barra de endereço de um telefone recolhe - ou seja, no meio de uma
 *     letra. O bitmap é guardado e devolvido em volta de cada mudança, e uma
 *     mudança para o mesmo tamanho em CSS é ignorada inteira;
 *   · `getCoalescedEvents()` devolve os pontos que o navegador juntou entre
 *     dois quadros. Sem ele, um dedo rápido desenha um polígono.
 */

import { tx } from '@/i18n/telas/licao-trace-board';
import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useRef
} from 'react';
import { He } from '@/components/hebrew/He';
import { scoreTrace } from '@/lib/trace-score';

/** O veredito de uma tentativa. */
export type Veredito = { score: number; tone: 'good' | 'try'; message: string };

/** O que quem chama pode mandar o quadro fazer. */
export type QuadroHandle = {
  /** Apaga a tinta e devolve o quadro em branco. */
  limpar(): void;
  /** Pontua o que está desenhado contra o modelo. `null` sem tinta. */
  conferir(): Veredito | null;
};

export const TraceBoard = forwardRef<QuadroHandle, {
  /** A letra que serve de modelo. Renderizada na cursiva pelo <He>. */
  glyph: string;
  /** Quanto do modelo aparece: 0.22 traçar, 0.08 guia fraco, 0 de memória. */
  guia: number;
  /** Rótulo para quem usa leitor de tela. */
  label: string;
  /** Avisa quando o quadro passa de vazio para escrito, e de volta. */
  onTinta?: (tem: boolean) => void;
  /** Altura da moldura. O padrão é o do curso. */
  alturaClass?: string;
  className?: string;
  /** O corpo do modelo. O padrão, `hero`, é para UMA letra; uma palavra
   *  inteira - o nome do aluno - precisa de um corpo menor para caber na
   *  largura de um telefone. A nota mede contra o corpo que estiver na tela,
   *  então trocar o tamanho não muda a régua. */
  tamanhoGuia?: 'hero' | 'display' | 'xl';
}>(function TraceBoard(
  { glyph, guia, label, onTinta, alturaClass = 'h-[280px] sm:h-[340px]', className = '',
    tamanhoGuia = 'hero' },
  ref
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guideRef = useRef<HTMLSpanElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const tinta = useRef(false);

  const marcarTinta = useCallback((tem: boolean) => {
    if (tinta.current === tem) return;
    tinta.current = tem;
    onTinta?.(tem);
  }, [onTinta]);

  /* ── o canvas, na resolução do aparelho, sem perder a tinta ────────────
     Dois sistemas de medida se encontram aqui, e confundi-los foi um defeito
     de verdade:

       · `clientWidth` é o quadro medido nos pixels DELE - a mesma unidade em
         que está o corpo da fonte do modelo, e a unidade em que este arquivo
         desenha, pontua e guarda os pontos;
       · `getBoundingClientRect()` é a mesma caixa medida em pixels de TELA,
         que é a unidade em que `pointerEvent.clientX` chega.

     Elas são iguais até alguma coisa dar zoom. O menu de acessibilidade faz
     exatamente isso com o tamanho do texto: `zoom` num contêiner acima. A
     130% a moldura media 789 pixels de tela sendo 607 dos dela, o código
     antigo pegava os 789 e os escrevia de volta como `style.width`, e a linha
     saía um terço adiante do dedo - sumindo de vez depois de três quartos do
     quadro.

     Então: o elemento nunca recebe tamanho em pixels (`w-full h-full` o
     mantém sobre a moldura, seja qual for a unidade), o espaço de desenho é
     o dos pixels DELE, e o único lugar onde pixel de tela aparece é o `at()`,
     que converte. `npm run escrita` mede isso nos quatro tamanhos de texto. */
  const resize = useCallback(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 3) * (rect.width / w || 1);
    const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
    if (sizeRef.current.w === bw && sizeRef.current.h === bh) return;

    const keep = sizeRef.current.w
      ? canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height)
      : null;

    sizeRef.current = { w: bw, h: bh };
    canvas.width = bw;
    canvas.height = bh;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (keep) {
      /* Melhor esforço: devolve o bitmap antigo no canto superior esquerdo.
         Ele NÃO é reescalado - um traço esticado seria uma mentira sobre o
         que foi desenhado - e numa mudança de poucos pixels nada se mexe. */
      try { ctx.putImageData(keep, 0, 0); } catch { /* cresceu: nada a devolver */ }
    }
    ctx.setTransform(bw / w, 0, 0, bh / h, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8;
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#15788F';
  }, []);

  useEffect(() => {
    sizeRef.current = { w: 0, h: 0 };
    resize();
    const ro = new ResizeObserver(resize);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [resize]);

  /* ── desenhar ───────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* Pixel de tela entra, pixel do próprio quadro sai. A razão é 1 até algo
       dar zoom, e lê-la da própria caixa faz isto continuar certo com o zoom
       do navegador e dentro de qualquer contêiner futuro, sem saber de nenhum
       dos dois.

       O retângulo é passado de fora: um `pointermove` traz até uma dúzia de
       pontos juntos, e medir a caixa uma vez por evento em vez de uma vez por
       ponto tira um traço rápido do caminho do layout. */
    const at = (e: PointerEvent | { clientX: number; clientY: number }, r: DOMRect) => ({
      x: (e.clientX - r.left) * (canvas.clientWidth / r.width || 1),
      y: (e.clientY - r.top) * (canvas.clientHeight / r.height || 1)
    });

    const down = (e: PointerEvent) => {
      /* Um segundo dedo durante o traço é tentativa de pinça, não uma segunda
         caneta. Ignorá-lo preserva o traço e deixa o touch-action recusar o
         zoom. */
      if (drawing.current) return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      drawing.current = true;
      marcarTinta(true);
      const p = at(e, canvas.getBoundingClientRect());
      last.current = p;
      pointsRef.current.push(p);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      /* Um ponto, para um toque deixar marca - quem escreve um yod faz um. */
      ctx.beginPath();
      ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle as string;
      ctx.fill();
    };

    const move = (e: PointerEvent) => {
      if (!drawing.current) return;
      e.preventDefault();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const events = typeof e.getCoalescedEvents === 'function'
        ? e.getCoalescedEvents() : [e];
      const r = canvas.getBoundingClientRect();
      for (const ev of events.length ? events : [e]) {
        const p = at(ev, r);
        const prev = last.current;
        if (!prev) { last.current = p; continue; }
        /* Pelo ponto médio, com uma quadrática: junta dois segmentos numa
           curva em vez de um canto, que é o que uma caneta deixa. */
        const mid = { x: (prev.x + p.x) / 2, y: (prev.y + p.y) / 2 };
        ctx.lineWidth = 5 + (ev.pressure && ev.pressure !== 0.5 ? ev.pressure * 7 : 3);
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        last.current = p;
        pointsRef.current.push(p);
      }
    };

    const up = (e: PointerEvent) => {
      if (!drawing.current) return;
      drawing.current = false;
      last.current = null;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };

    const opts = { passive: false } as AddEventListenerOptions;
    canvas.addEventListener('pointerdown', down, opts);
    canvas.addEventListener('pointermove', move, opts);
    canvas.addEventListener('pointerup', up, opts);
    canvas.addEventListener('pointercancel', up, opts);
    /* Cinto e suspensórios para o navegador que ainda precisa: um iOS Safari
       sem eventos de ponteiro cai no toque, e isto impede a página de rolar
       debaixo do dedo. */
    const swallow = (ev: TouchEvent) => { if (drawing.current) ev.preventDefault(); };
    canvas.addEventListener('touchmove', swallow, opts);
    return () => {
      canvas.removeEventListener('pointerdown', down, opts);
      canvas.removeEventListener('pointermove', move, opts);
      canvas.removeEventListener('pointerup', up, opts);
      canvas.removeEventListener('pointercancel', up, opts);
      canvas.removeEventListener('touchmove', swallow, opts);
    };
  }, [marcarTinta]);

  useImperativeHandle(ref, () => ({
    limpar() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      pointsRef.current = [];
      marcarTinta(false);
    },
    conferir() {
      const canvas = canvasRef.current;
      if (!canvas || !pointsRef.current.length) return null;
      return pontuar(canvas, guideRef.current, glyph, pointsRef.current);
    }
  }), [glyph, marcarTinta]);

  return (
    <div
      ref={wrapRef}
      /* overscroll-behavior impede que um gesto que chega à borda encadeie
         para a página - que é o que dispara o puxar-para-atualizar. */
      className={`relative ${alturaClass} overscroll-contain select-none
                  [-webkit-touch-callout:none]
                  bg-[repeating-linear-gradient(to_bottom,transparent,transparent_calc(50%-1px),var(--line-soft)_calc(50%-1px),var(--line-soft)_calc(50%),transparent_calc(50%),transparent)]
                  ${className}`}
    >
      {/* O modelo, por baixo da tinta. Ele está SEMPRE na árvore - o cálculo
          da nota mede contra ele - e fica apenas invisível quando o guia é
          zero, para que aquilo contra o que a pessoa é julgada nunca mude. */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none select-none">
        <span ref={guideRef} style={{ opacity: guia }}>
          <He size={tamanhoGuia} cursive>{glyph}</He>
        </span>
      </div>

      <canvas
        ref={canvasRef}
        /* `w-full h-full` e não um tamanho medido: um canvas é elemento
           substituído, então com `inset-0` e sem largura ele cai no tamanho
           do próprio bitmap em vez de preencher a moldura - e um tamanho
           medido está errado assim que a página tem zoom. Porcentagem é
           sempre resolvida na unidade da moldura. */
        className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
        aria-label={tx.areaDeEscrita(label)}
        role="img"
      />
    </div>
  );
});

/* ── a nota ──────────────────────────────────────────────────────────────
   A matemática mora em lib/trace-score.ts, onde pode ser testada contra uma
   letra sintética em vez de desenhando num telefone e apertando os olhos.
   Esta metade só desenha o modelo e lê os pixels dele.

   Se qualquer coisa der errado - sem contexto, fonte que não carregou,
   navegador sem filtro de canvas -, devolve o veredito animador em vez de um
   falso negativo. Nada disso é culpa de quem está aprendendo. */
const ANIMAR: Veredito = {
  score: 1, tone: 'good',
  message: tx.feito
};

function pontuar(
  canvas: HTMLCanvasElement,
  guide: HTMLSpanElement | null,
  glyph: string,
  points: { x: number; y: number }[]
): Veredito {
  try {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || !guide) return ANIMAR;

    /* O modelo, desenhado onde o guia visível está e no mesmo corpo, e então
       BORRADO - o borrão é a tolerância, e ele tem mais ou menos a largura de
       um dedo. */
    const mask = document.createElement('canvas');
    mask.width = w; mask.height = h;
    const mctx = mask.getContext('2d', { willReadFrequently: true });
    if (!mctx) return ANIMAR;

    const target = guide.firstElementChild ?? guide;
    const cs = getComputedStyle(target);
    const size = parseFloat(cs.fontSize) || h * 0.6;
    const family = cs.fontFamily || 'serif';
    mctx.filter = 'blur(13px)';
    mctx.fillStyle = '#000';
    mctx.textAlign = 'center';
    mctx.textBaseline = 'middle';
    mctx.font = `${size}px ${family}`;
    mctx.fillText(glyph, w / 2, h / 2);

    const img = mctx.getImageData(0, 0, w, h).data;
    /* Um byte por célula em vez de quatro: o cálculo só precisa do alfa. */
    const alpha = new Uint8ClampedArray(w * h);
    for (let i = 0; i < alpha.length; i++) alpha[i] = img[i * 4 + 3]!;

    const v = scoreTrace({ alpha, w, h, points });
    return { score: v.score, tone: v.tone, message: v.message };
  } catch {
    return ANIMAR;
  }
}
