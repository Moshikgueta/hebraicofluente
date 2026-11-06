/* A régua do site público.
 *
 * Todas as faixas da página usam esta largura e este respiro. Um site cujas
 * seções escolhem cada uma o seu padding parece três sites empilhados - e é
 * assim que a maioria das páginas de venda parece. O `tone` existe para
 * alternar o fundo e separar as faixas sem desenhar uma linha entre elas.
 */

import { Migalhas, type Trilha } from '@/components/portal/Migalhas';
import type { ReactNode } from 'react';
import { Rubrica } from '@/components/landing/base';

export function Section({
  children, tone = 'paper', className = '', id, labelledBy
}: {
  children: ReactNode;
  tone?: 'paper' | 'surface' | 'wash';
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  /* `wash` era a faixa teal-clara atrás da chamada final. A chamada virou o
     bloco navy da capa (FaixaCta), e navy sobre teal brigava: as duas faixas
     tingidas agora são a mesma areia, com fio em cima e embaixo. */
  const TONE = {
    paper: '',
    surface: 'bg-surface-2 border-y border-line',
    wash: 'bg-surface-2 border-y border-line'
  } as const;
  return (
    <section id={id} aria-labelledby={labelledBy}
             className={`${TONE[tone]} ${className}`}>
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-16 sm:py-24">
        {children}
      </div>
    </section>
  );
}

/** Um título de faixa com subtítulo opcional. `id` para o aria-labelledby. */
export function SectionHead({
  id, eyebrowPt, titlePt, leadPt, center = false, nivel = 'h2'
}: {
  id: string; eyebrowPt?: string; titlePt: string; leadPt?: string; center?: boolean;
  /** 'h1' quando a faixa abre a página e ela não tem outro título (/cursos). */
  nivel?: 'h1' | 'h2';
}) {
  const Titulo = nivel;
  return (
    /* O mesmo cabeçalho de seção da capa: o rótulo com fio (Rubrica), o
       título em semibold com a entrelinha curta e o apoio em cinza. Antes era
       um rótulo de 12px solto, um título bold de 32px e um corpo escuro, um
       terceiro desenho de cabeçalho no mesmo site. */
    <header className={`grid gap-3 mb-9 sm:mb-11 ${center ? 'text-center justify-items-center' : ''}`}>
      {eyebrowPt && <Rubrica className="mb-2">{eyebrowPt}</Rubrica>}
      <Titulo id={id}
              className="font-display font-semibold text-[clamp(28px,3.4vw,40px)] leading-[1.08]
                         tracking-[-0.03em] text-ink max-w-[22ch]">
        {titlePt}
      </Titulo>
      {leadPt && (
        <p className="font-ui text-[17px] leading-[1.6] text-ink-muted max-w-[56ch]">
          {leadPt}
        </p>
      )}
    </header>
  );
}

/**
 * O topo de uma página pública de conteúdo (/metodo, /faq, /biblia...).
 *
 * Cada página escrevia o seu: um rótulo de 12px, um h1 bold de 44px e um
 * corpo escuro, com pequenas diferenças de respiro entre uma e outra. Agora
 * é o mesmo desenho do hero da capa, sem a lâmina: rótulo com fio, título
 * semibold de entrelinha curta, apoio em cinza.
 */
export function PageHead({
  eyebrowPt, titlePt, leadPt, children, trilha
}: {
  eyebrowPt?: string; titlePt: ReactNode; leadPt?: ReactNode; children?: ReactNode;
  /** Onde a página mora no portal (23/10/2026): "Início › Aprender hebraico › ...". */
  trilha?: Trilha;
}) {
  return (
    <div className="border-b border-line">
      <div className={`mx-auto w-full max-w-[1180px] px-4 sm:px-6 ${trilha ? 'pt-8 sm:pt-10' : 'pt-14 sm:pt-20'} pb-14 sm:pb-20 grid gap-5`}>
        {trilha && <div className="mb-3"><Migalhas trilha={trilha} /></div>}
        {eyebrowPt && <Rubrica>{eyebrowPt}</Rubrica>}
        <h1 className="font-display font-semibold text-[clamp(36px,4.4vw,56px)] leading-[1.03]
                       tracking-[-0.036em] text-ink max-w-[20ch] m-0">
          {titlePt}
        </h1>
        {leadPt && (
          <p className="font-ui text-[17px] sm:text-[18px] leading-[1.6] text-ink-muted max-w-[56ch] m-0">
            {leadPt}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

/**
 * Uma lista de pontos numerados, em colunas sob um fio: o traço teal no topo
 * de cada coluna marca o começo do item, e o número fica em algarismo
 * tabular. Substitui as grades de cartões com o número num círculo, que
 * eram o desenho de qualquer página "como funciona".
 */
export function Itens({
  itens, colunas = 2, inicio = 1
}: {
  itens: readonly { t: ReactNode; b: ReactNode; extra?: ReactNode }[];
  colunas?: 2 | 3 | 4 | 5;
  /** O número do primeiro item (a "regra número um" de /metodo vem antes). */
  inicio?: number;
}) {
  const COLS = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-5'
  } as const;
  return (
    <ol className={`grid gap-x-8 gap-y-10 list-none p-0 m-0 border-t border-line ${COLS[colunas]}`}>
      {itens.map((x, i) => (
        <li key={i} className="relative pt-6 min-w-0 grid gap-2 content-start">
          <span aria-hidden className="absolute -top-px left-0 h-[2px] w-10 bg-[var(--teal)]" />
          <span aria-hidden className="font-display text-[15px] font-semibold tracking-[-0.01em]
                                       text-[var(--teal-ink)] tabular-nums mb-1">
            {String(inicio + i).padStart(2, '0')}
          </span>
          <h3 className="font-display text-[20px] font-semibold leading-[1.2] tracking-[-0.018em] text-ink m-0">
            {x.t}
          </h3>
          <p className="font-ui text-[15.5px] leading-[1.6] text-ink-muted m-0">{x.b}</p>
          {x.extra}
        </li>
      ))}
    </ol>
  );
}
