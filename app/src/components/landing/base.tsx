'use client';

/* As peças que todas as seções da landing usam.
 * ─────────────────────────────────────────────────────────────────────────
 * O design é uma página só, de catorze seções, e quase todas repetem a mesma
 * estrutura: um container de 1200px, um H2 grande com letter-spacing
 * negativo, um parágrafo de apoio, e uma grade que revela os cartões conforme
 * entram na tela. Em vez de repetir isso catorze vezes, mora aqui.
 */

import { type ReactNode } from 'react';
import { He } from '@/components/hebrew/He';

/** O container da landing. Mesma medida do cabeçalho (PublicShell: 1180px,
 *  16/24px de respiro): com 1200 e 20/28 a marca e o título começavam 5px
 *  fora de linha um do outro, que é o tipo de desalinhamento que ninguém
 *  aponta e todo mundo sente. */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-4 sm:px-6 ${className}`}>{children}</div>
  );
}

/**
 * Um bloco da landing.
 *
 * Até 20/10/2026 ele aparecia com um fade-up quando entrava na tela. Saiu:
 * numa página de venda a animação de rolagem não acompanha nenhum gesto da
 * pessoa, só atrasa a leitura de quem rola rápido, e repetida em toda seção
 * vira a assinatura de template. O conteúdo agora está lá quando o olho
 * chega. O componente fica, com a mesma assinatura, porque são dezenas de
 * usos e a semântica (`as="li"`) continua servindo; `delay` é ignorado.
 */
export function Reveal({
  children, className = '', as: As = 'div'
}: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' | 'section' }) {
  return <As className={className}>{children}</As>;
}

/**
 * O marcador de seção: a letra hebraica que numera o capítulo, um fio e o
 * rótulo em versalete.
 *
 * As sete primeiras seções da capa são numeradas com as sete primeiras
 * letras (א = 1, ב = 2...), como se numeram capítulos em hebraico. Quem chega
 * não precisa saber disso para ler a página; quem rola vê o alfabeto andando
 * uma letra por vez, que é a promessa do curso. Sem `letra`, só o rótulo
 * (preço, dúvidas: o fecho não é capítulo).
 */
export function Rubrica({
  children, letra, tom = 'teal', className = '', as: As = 'p', id
}: {
  children: ReactNode; letra?: string; tom?: 'teal' | 'lite'; className?: string;
  /** `h2` quando o rótulo É o título da seção (a faixa do "O que você aprende"). */
  as?: 'p' | 'h2'; id?: string;
}) {
  const cor = tom === 'lite' ? 'text-[var(--teal-lite)]' : 'text-[var(--teal-ink)]';
  const fio = tom === 'lite' ? 'bg-white/25' : 'bg-[var(--line)]';
  return (
    <As id={id}
        className={`flex items-center gap-3 m-0 font-ui text-[12.5px] font-semibold uppercase
                    tracking-[.12em] ${cor} ${className}`}>
      {/* <He> e não um span com a classe: é a única porta do hebraico no
          projeto (isolamento bidi, fonte, nikud). 20px x 1.15em dá 23px,
          o piso para uma letra hebraica legível. */}
      {letra && (
        <span className="text-[20px] leading-none normal-case tracking-normal font-medium">
          <He tone={tom === 'lite' ? 'lite' : 'teal'}>{letra}</He>
        </span>
      )}
      {letra && <span aria-hidden className={`h-px w-7 ${fio}`} />}
      <span className="min-w-0">{children}</span>
    </As>
  );
}

/** O H2 de seção: 30-44px, entrelinha curta, letter-spacing negativo. */
export function H2({
  children, className = '', id
}: { children: ReactNode; className?: string; id?: string }) {
  return (
    <h2 id={id}
        className={`font-display font-semibold text-[clamp(30px,3.7vw,44px)] leading-[1.08]
                    tracking-[-0.03em] text-balance ${className}`}>
      {children}
    </h2>
  );
}

/** O parágrafo de apoio embaixo de um H2. */
export function Lead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-ui text-[17px] sm:text-[18px] leading-[1.6] text-ink-muted max-w-[52ch] ${className}`}>
      {children}
    </p>
  );
}

/** O check teal de 15px. É o único ícone que aparece em quase toda seção. */
export function Check({ size = 15, color = 'var(--teal)', className = '' }: {
  size?: number; color?: string; className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden className={`shrink-0 ${className}`}>
      <path d="M3.2 8.3 6.2 11.3 12.8 4.7" stroke={color} strokeWidth="1.9"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Uma lista de itens com check, em uma ou duas colunas. */
export function CheckList({
  items, columns = 1, color, textClass = 'text-ink-body'
}: {
  items: readonly ReactNode[];
  columns?: 1 | 2;
  color?: string;
  textClass?: string;
}) {
  return (
    <ul className={`grid gap-3 list-none p-0 m-0 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
      {items.map((t, i) => (
        <li key={i} className={`flex gap-2.5 items-start font-ui text-[15px] leading-[1.5] ${textClass}`}>
          <span className="mt-[4px]"><Check color={color} /></span>
          <span className="min-w-0">{t}</span>
        </li>
      ))}
    </ul>
  );
}

/** O chevron dos acordeões: gira 180 graus quando abre. Desenhado, e não o
 *  caractere ⌄: o glifo vinha da fonte de reserva, com a linha de base de
 *  outra família, e ficava dois pixels abaixo do centro do botão. */
export function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none"
      className="shrink-0 text-ink-muted transition-transform duration-200 ease-[var(--ease)]"
      style={{ transform: open ? 'rotate(180deg)' : 'none' }}
    >
      <path d="M3 5.25 7 9.25l4-4" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
