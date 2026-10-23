/* As peças das páginas de jornada e de produto "em breve" (23/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * /aprender-hebraico, /descobrir-israel, /israel-alem-do-obvio e
 * /raizes-sefarditas usam estas peças, e todas leem lib/ecossistema.ts: o
 * status que aparece é o do catálogo, nunca escrito na página.
 *
 * Regra de produto fora de venda (decisão do dono, 23/10/2026): "Em breve",
 * sem preço, sem botão de compra e sem checkout. O botão principal dessas
 * páginas leva ao que já existe (o curso), e diz que leva para lá.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Container, H2, Rubrica } from '@/components/landing/base';
import { BotaoDoCurso } from '@/components/portal/BotaoDoCurso';
import { Emblema } from '@/components/portal/Emblemas';
import {
  jornada as jornadaPorId, produtosDaJornada, ROTULO_DO_STATUS,
  type JornadaId, type Produto, type Status
} from '@/lib/ecossistema';

const FUNDO: Record<JornadaId, string> = {
  hebraico: 'bg-[var(--teal-soft)] text-[var(--teal-ink)]',
  israel: 'bg-[var(--gold-soft)] text-[var(--gold-ink)]',
  raizes: 'bg-[var(--sand)] text-[var(--navy)]'
};

export { Migalhas } from '@/components/portal/Migalhas';
import { Migalhas } from '@/components/portal/Migalhas';

export function SeloDoStatus({ status }: { status: Status }) {
  const cor = status === 'disponivel'
    ? 'bg-[var(--teal-ink)] text-white'
    : status === 'em-breve'
      ? 'bg-[var(--gold-soft)] text-[var(--gold-ink)] border border-[#EADCC0]'
      : 'bg-surface-2 text-ink-body border border-line';
  return (
    <span className={`inline-flex items-center min-h-[26px] px-2.5 rounded-full font-ui text-[12.5px] font-semibold ${cor}`}>
      {ROTULO_DO_STATUS[status]}
    </span>
  );
}

/** A abertura de uma página de jornada ou de produto. */
export function Abertura({
  jornada, rubrica, titulo, lead, trilha, children
}: {
  jornada: JornadaId; rubrica: string; titulo: string; lead: ReactNode;
  trilha: { nome: string; href?: string }[]; children?: ReactNode;
}) {
  return (
    <section aria-labelledby="pagina-titulo">
      <Container className="pt-8 pb-14 sm:pt-10 sm:pb-20 grid gap-10">
        <Migalhas trilha={trilha} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
          <div className="grid gap-5 min-w-0">
            <Rubrica>{rubrica}</Rubrica>
            <h1 id="pagina-titulo"
                className="m-0 font-display font-semibold text-[clamp(34px,5vw,56px)] leading-[1.04]
                           tracking-[-0.035em] text-balance text-ink max-w-[20ch]">
              {titulo}
            </h1>
            <div className="font-ui text-[18px] leading-[1.6] text-ink-muted max-w-[52ch] grid gap-3 text-pretty">{lead}</div>
            {children}
          </div>
          <div aria-hidden className={`rounded-[20px] p-6 sm:p-8 ${FUNDO[jornada]}`}>
            <Emblema jornada={jornada} />
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Os produtos de uma jornada, do catálogo, com o status de verdade. */
export function ProdutosDaJornada({ id, titulo }: { id: JornadaId; titulo: string }) {
  const lista = produtosDaJornada(id);
  return (
    <section aria-labelledby="produtos-titulo" className="bg-surface-2">
      <Container className="py-14 sm:py-20 grid gap-8">
        <H2 id="produtos-titulo" className="m-0">{titulo}</H2>
        <ul className="grid gap-5 md:grid-cols-2 list-none p-0 m-0">
          {lista.map(p => <li key={p.id}><CartaoDeProduto p={p} /></li>)}
        </ul>
      </Container>
    </section>
  );
}

export function CartaoDeProduto({ p }: { p: Produto }) {
  return (
    <article className="group relative h-full grid content-start gap-3 rounded-[18px] border border-line bg-[var(--card)] p-6 sm:p-7
                        focus-within:ring-2 focus-within:ring-[var(--teal)] focus-within:ring-offset-2">
      <div className="flex flex-wrap items-center gap-3">
        <SeloDoStatus status={p.status} />
        <span className="font-ui text-[13.5px] text-ink-muted">{p.formato}</span>
      </div>
      <h3 className="m-0 font-display text-[24px] font-semibold tracking-[-0.02em] text-ink">
        <Link href={p.rota} className="after:absolute after:inset-0 after:rounded-[18px] focus:outline-none">{p.nome}</Link>
      </h3>
      <p className="m-0 font-ui text-[16px] leading-[1.6] text-ink-body text-pretty">{p.subtitulo}</p>
      <p className="m-0 font-ui text-[14px] text-ink-muted">Para: {p.publico.toLowerCase()}.</p>
      <span className="inline-flex items-center gap-2 font-ui text-[15px] font-semibold text-[var(--teal-ink)]">
        {p.cta}
        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
      </span>
    </article>
  );
}

/** A ponte: o que dá para fazer HOJE, numa jornada cujo produto ainda não abriu.
 *  O emblema da jornada ocupa o lado que ficava vazio no desktop; no
 *  telefone ele some e o texto fica com a caixa inteira. */
export function Ponte({ titulo, texto, href, rotulo, jornada = 'hebraico' }: {
  titulo: string; texto: string; href: string; rotulo: string; jornada?: JornadaId;
}) {
  return (
    <section aria-labelledby="ponte-titulo">
      <Container className="py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] items-center rounded-[20px] bg-[var(--navy)] text-white p-8 sm:p-12">
          <div className="grid gap-5 justify-items-start">
            <Rubrica tom="lite">Enquanto isso</Rubrica>
            <h2 id="ponte-titulo"
                className="m-0 font-display font-semibold text-[clamp(28px,3.4vw,40px)] leading-[1.08] tracking-[-0.03em] text-balance max-w-[24ch] text-white">
              {titulo}
            </h2>
            <p className="m-0 font-ui text-[17px] leading-[1.6] text-white/85 max-w-[52ch]">{texto}</p>
            <BotaoDoCurso href={href}
                  className="inline-flex items-center gap-2 min-h-[52px] px-6 rounded-[var(--r-md)] bg-white text-[var(--navy)]
                             font-ui text-[15.5px] font-medium hover:bg-[var(--teal-soft)] transition-[background-color,scale] duration-[var(--dur)] active:scale-[.97]">
              {rotulo}
              <span aria-hidden>→</span>
            </BotaoDoCurso>
          </div>
          <div aria-hidden className={`hidden lg:block rounded-[16px] p-5 rotate-[2deg] shadow-[0_18px_40px_-24px_rgba(0,0,0,.6)] ${FUNDO[jornada]}`}>
            <Emblema jornada={jornada} />
          </div>
        </div>
      </Container>
    </section>
  );
}

/** O aviso de produto fora de venda, dito com clareza e sem data inventada. */
export function AvisoEmBreve({ texto }: { texto: string }) {
  return (
    <p className="m-0 flex flex-wrap items-center gap-3 font-ui text-[15.5px] text-ink-body">
      <SeloDoStatus status="em-breve" />
      {texto}
    </p>
  );
}

export const nomeDaJornada = (id: JornadaId): string => jornadaPorId(id).nome;
