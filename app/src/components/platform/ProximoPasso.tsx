'use client';

/* Os CTAs que sabem quem está lendo.
 * ─────────────────────────────────────────────────────────────────────────
 * Duas formas, uma regra só (lib/cta.ts). `FaixaCta` fecha as páginas de
 * conteúdo público; `OfertaProximoCurso` aparece onde um curso termina.
 *
 * As duas somem sozinhas quando não há o que oferecer. Isso é de propósito:
 * o pior CTA da internet é o que continua na tela depois de já ter sido
 * atendido - "Comprar agora" para quem comprou ontem, "Próximo nível" para
 * quem já está nele. Um botão que some diz que a plataforma reparou.
 *
 * Enquanto a sessão não respondeu, a faixa mostra o passo de visitante em vez
 * de piscar: o layout não pode saltar no meio da leitura, e para quem não
 * está logado - a maioria de quem abre /metodo - ele já é o passo certo.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { useAccount } from '@/lib/account/store';
import { proximoCurso, proximoPasso } from '@/lib/cta';
import { FLAGSHIP } from '@/lib/catalog';
import { track } from '@/lib/analytics';

/** O botão sozinho, com a microcópia embaixo. Serve em qualquer lugar. */
export function BotaoPasso({
  slug = FLAGSHIP, onde, className = ''
}: { slug?: string; onde: string; className?: string }) {
  const account = useAccount();
  const passo = proximoPasso(account, slug);

  return (
    <span className={`grid justify-items-center gap-2 ${className}`}>
      <Link
        href={passo.href}
        onClick={() => track('cta_clicked', { itemId: `${onde}:${passo.vende ? 'compra' : 'curso'}` })}
        className="group inline-flex items-center gap-2 rounded-[13px] bg-[var(--navy)] text-white
                   font-ui font-semibold text-[16px] sm:text-[17px] px-7 py-[15px] shadow-[var(--sh)]
                   transition-[background-color,transform] duration-[180ms]
                   hover:bg-[var(--navy-2)] hover:-translate-y-[2px] active:translate-y-0"
      >
        {passo.label}
        {/* A seta anda 3px no hover. É toda a micro-interação de que um botão
            precisa: diz "isto leva a algum lugar" sem virar animação. */}
        <span aria-hidden
              className="transition-transform duration-[180ms] group-hover:translate-x-[3px]">→</span>
      </Link>
      <span className="font-ui text-[13px] text-ink-muted text-center">{passo.micro}</span>
    </span>
  );
}

/**
 * A faixa de fecho das páginas de conteúdo.
 *
 * `titulo` e `linha` são da página - o argumento muda conforme o que a pessoa
 * acabou de ler. O botão, não: é sempre o passo certo para esta conta.
 */
export function FaixaCta({
  titulo, linha, onde, slug = FLAGSHIP, children
}: {
  titulo: string;
  linha: ReactNode;
  onde: string;
  slug?: string;
  /** Um segundo destino, quando a página tem um. Fica antes do botão. */
  children?: ReactNode;
}) {
  return (
    <Card className="p-8 grid gap-4 justify-items-center text-center">
      <h2 className="font-display text-[25px] sm:text-[30px] font-bold text-ink max-w-[26ch]">
        {titulo}
      </h2>
      <p className="font-ui text-[15.5px] leading-relaxed text-ink-body max-w-[48ch]">
        {linha}
      </p>
      {children}
      <BotaoPasso slug={slug} onde={onde} className="pt-1" />
    </Card>
  );
}

/**
 * "E depois?" - o curso seguinte, e só quando ele ainda não é desta pessoa.
 *
 * Fica no fim do curso e na área de progresso. Um curso que ainda não abriu
 * ganha a página de plano e nenhuma promessa de data.
 */
export function OfertaProximoCurso({ atual = FLAGSHIP }: { atual?: string }) {
  const account = useAccount();
  const curso = proximoCurso(account, atual);
  if (!curso) return null;

  const abre = curso.status === 'available';

  return (
    <Card tone="wash" className="p-6 sm:p-7 grid gap-3">
      <p className="font-ui text-[12px] uppercase tracking-[.12em] text-[var(--accent)]">
        Depois desta etapa
      </p>
      <h2 className="font-display text-[20px] sm:text-[23px] font-bold leading-snug text-ink">
        {curso.titlePt}
      </h2>
      <p className="font-ui text-[15px] leading-relaxed text-ink-body max-w-[52ch]">
        {curso.summaryPt}
      </p>
      {/* O que o curso entrega sai do catálogo, nunca escrito aqui à mão: uma
          lista fixa nesta tela estaria errada no dia em que o A2 entrar. */}
      {curso.outcomesPt.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-2 list-none p-0 m-0
                       font-ui text-[14.5px] leading-relaxed text-ink-body">
          {curso.outcomesPt.map(o => (
            <li key={o} className="flex gap-2.5">
              <span aria-hidden className="text-[var(--accent)]">→</span>{o}
            </li>
          ))}
        </ul>
      )}
      <div className="pt-1">
        <Link
          href={`/cursos/${curso.slug}`}
          onClick={() => track('next_course_clicked', { itemId: curso.slug })}
          className="group inline-flex items-center gap-2 min-h-[48px] px-5 rounded-[var(--r-md)]
                     bg-[var(--accent)] text-white font-ui font-semibold text-[15px]
                     transition-transform duration-[180ms] hover:-translate-y-[2px]"
        >
          {abre ? `Conhecer o ${curso.levelPt}` : 'Ver o plano deste curso'}
          <span aria-hidden
                className="transition-transform duration-[180ms] group-hover:translate-x-[3px]">→</span>
        </Link>
      </div>
      <p className="font-ui text-[12.5px] text-ink-muted">
        {abre
          ? 'Compra separada. O curso que você já tem continua aberto.'
          : 'Ainda não abriu. A página mostra o que ele vai cobrir.'}
      </p>
    </Card>
  );
}
