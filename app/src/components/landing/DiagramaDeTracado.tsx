'use client';

/* O diagrama de traçado, do lado PÚBLICO da fronteira.
 * ─────────────────────────────────────────────────────────────────────────
 * A landing precisa mostrar como uma letra se escreve. O componente que faz
 * isso dentro do curso (`StrokeOrderPlayer`) não serve aqui, e a razão não é
 * de estilo: ele lê a geometria dos traços do depósito de conteúdo pago, que
 * só o `CourseGate` enche. Numa página pública esse depósito está vazio, a
 * leitura lança, e o React derruba a árvore inteira - a landing vira uma tela
 * de erro no primeiro clique.
 *
 * Este lê o que JÁ É PÚBLICO: o SVG que o exportador copia para
 * `public/tracado-amostra/`, gerado do mesmo contorno da mesma fonte cursiva, na
 * mesma execução que gera o do livro impresso. Não é uma imitação do
 * exercício nem uma segunda fonte de verdade - é o mesmo desenho, servido
 * como arquivo em vez de como dado.
 *
 * ── por que <img> e não o SVG embutido ──────────────────────────────────
 * Porque embutir exigiria ler o disco em tempo de build e descer a marcação
 * por propriedade até aqui, e o que se ganharia com isso - animar traço a
 * traço - a landing não precisa: o diagrama já numera os movimentos e desenha
 * a seta de partida. Um arquivo, em cache, sem JavaScript nenhum.
 *
 * ── por que só duas letras ──────────────────────────────────────────────
 * `/stroke-order/` inteiro é material do curso e fica atrás do portão desde
 * 24/09/2026. Só as letras que a landing mostra são publicadas, em
 * `/tracado-amostra/` - a lista está em tools/export-content.mjs
 * (`AMOSTRA_TRACADO`), e o tipo de `letterId` abaixo é o espelho dela.
 */

import { tx } from '@/i18n/telas/venda-diagrama-de-tracado';

/** As letras publicadas em /tracado-amostra/. Ver AMOSTRA_TRACADO. */
export type LetraDaAmostra = 'alef' | 'shin';

/** Quantos movimentos a letra tem. Vem do `data-strokes` do próprio SVG. */
export function DiagramaDeTracado({
  letterId, label, movimentos, className = ''
}: {
  letterId: LetraDaAmostra;
  label: string;
  movimentos: number;
  className?: string;
}) {
  const quantos = tx.movimentos(movimentos);
  return (
    <figure className={`m-0 grid gap-2.5 justify-items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/tracado-amostra/${letterId}.svg`}
        alt={tx.alt(label, quantos)}
        width={200}
        height={200}
        loading="lazy"
        decoding="async"
        className="w-full max-w-[200px] aspect-square"
      />
      <figcaption className="font-ui text-[12.5px] uppercase tracking-[.08em] text-ink-muted">
        {label} · {quantos}
      </figcaption>
    </figure>
  );
}
