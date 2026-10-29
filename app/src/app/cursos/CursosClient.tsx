'use client';

/* A trilha inteira numa página.
 * ─────────────────────────────────────────────────────────────────────────
 * Duas leituras da mesma lista: a prateleira de cards (rápida, para escolher)
 * e a trilha numerada logo abaixo (lenta, para entender a ordem). A segunda
 * existe porque a pergunta de quem chega aqui raramente é "qual eu compro" -
 * é "por onde eu começo e até onde isso vai".
 */

import { Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Section, SectionHead } from '@/components/platform/Section';
import { CourseShelf } from '@/components/platform/CourseShelf';
import { allCourses, brl, isPlayable, paginaDeVenda } from '@/lib/catalog';
import { useAccount } from '@/lib/account/store';
import { TrilhaNoTopo } from '@/components/portal/Migalhas';
import { tx } from '@/i18n/telas/venda-cursos';

export function CursosClient() {
  const account = useAccount();
  const courses = allCourses();

  return (
    <>
      <TrilhaNoTopo trilha={[{ nome: tx.trilha }]} />
      <Section labelledBy="cursos">
        <SectionHead
          id="cursos"
          nivel="h1"
          eyebrowPt={tx.eyebrow}
          titlePt={tx.titulo}
          leadPt={tx.lead}
        />
        <CourseShelf />
      </Section>

      {/* As opções de compra (o curso, o Israel Além do Óbvio e o combo,
          OpcoesDeCompra) saíram em 27/10/2026: o site fica só com o curso de
          alfabetização (decisão do dono). Voltam quando o livro abrir. */}

      <Section tone="surface" labelledBy="trilha-detalhe">
        <SectionHead
          id="trilha-detalhe"
          eyebrowPt={tx.ordemEyebrow}
          titlePt={tx.ordemTitulo}
        />

        {/* Um índice sob fios, e não quatro cartões: os níveis são capítulos
            da mesma trilha, e a linha deixa a ordem visível. */}
        <ol className="list-none p-0 m-0 border-t border-line">
          {courses.map(c => {
            const owned = account.can(c.slug);
            const open = isPlayable(c);
            return (
              <li key={c.slug} data-curso={c.slug} className="border-b border-line">
                <article className="py-8 sm:py-10 grid gap-4 sm:gap-8 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-start">
                  <span aria-hidden
                        className={`font-display text-[15px] font-semibold tracking-[-0.01em] tabular-nums sm:pt-1.5
                                    ${open ? 'text-[var(--teal-ink)]' : 'text-ink-muted'}`}>
                    {c.code}
                  </span>

                  <div className="grid gap-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-[23px] sm:text-[26px] font-semibold tracking-[-0.022em] text-ink m-0">{c.titlePt}</h3>
                      {owned ? <Badge tone="mint">{tx.seuCurso}</Badge>
                        : open ? <Badge tone="accent">{tx.disponivel}</Badge>
                        : <Badge>{tx.emBreve}</Badge>}
                    </div>
                    <p className="font-ui text-[13.5px] text-ink-muted tabular-nums">
                      {c.levelPt}{c.cefr ? ` · ${c.cefr}` : ''} · {tx.nModulos(c.stats.modules)}
                      {c.stats.lessons ? ` · ${tx.nLicoes(c.stats.lessons)}` : ''}
                    </p>
                    <p className="font-ui text-[16px] leading-[1.6] text-ink-body max-w-[62ch]">
                      {c.summaryPt}
                    </p>
                    <ul className="grid gap-1 list-none p-0 m-0 pt-1">
                      {c.outcomesPt.slice(0, 3).map(o => (
                        <li key={o} className="flex gap-2.5">
                          <span aria-hidden className="text-[var(--teal)] text-[13px] mt-[3px]">✓</span>
                          <span className="font-ui text-[14.5px] leading-relaxed text-ink-body">{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-2 sm:justify-items-end content-start">
                    {open && !owned && (
                      <p className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink tabular-nums">{brl(c.price.brl)}</p>
                    )}
                    <LinkButton
                      href={owned ? '/meu-hebraico' : paginaDeVenda(c.slug)}
                      variant={open && !owned ? 'primary' : 'secondary'}
                      size="sm"
                    >
                      {owned ? tx.continuar : open ? tx.verCurso : tx.oQueVem}
                    </LinkButton>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
        {/* Marca o fim dos cartões: numeros.mjs só confere os números do cartão da alfabetização. */}
        <span hidden data-curso="fim" />
      </Section>


      {/* Só onde há cursos depois deste: o site em inglês só tem a alfabetização. */}
      {allCourses().length > 1 && <Section labelledBy="ordem">
        {/* Uma afirmação, não um cartão: o fio teal à esquerda é o mesmo das
            citações da capa. */}
        <div className="grid gap-4 max-w-[760px] pl-6 border-l-2 border-[var(--teal)]">
          <h2 id="ordem" className="font-display font-semibold text-[clamp(26px,3vw,36px)] leading-[1.1]
                                    tracking-[-0.03em] text-ink max-w-[26ch] m-0">
            {tx.pularTitulo}
          </h2>
          <p className="font-ui text-[17px] leading-[1.65] text-ink-body max-w-[60ch] m-0">
            {tx.pularTexto}
          </p>
        </div>
      </Section>}
    </>
  );
}
