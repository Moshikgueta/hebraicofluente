'use client';

/* A trilha inteira numa página.
 * ─────────────────────────────────────────────────────────────────────────
 * Duas leituras da mesma lista: a prateleira de cards (rápida, para escolher)
 * e a trilha numerada logo abaixo (lenta, para entender a ordem). A segunda
 * existe porque a pergunta de quem chega aqui raramente é "qual eu compro" -
 * é "por onde eu começo e até onde isso vai".
 */

import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Section, SectionHead } from '@/components/platform/Section';
import { CourseShelf } from '@/components/platform/CourseShelf';
import { allCourses, brl, isPlayable } from '@/lib/catalog';
import { useAccount } from '@/lib/account/store';

export function CursosClient() {
  const account = useAccount();
  const courses = allCourses();

  return (
    <>
      <Section labelledBy="cursos">
        <SectionHead
          id="cursos"
          eyebrowPt="Cursos de hebraico"
          titlePt="Do primeiro alfabeto à conversa."
          leadPt="Quatro cursos, uma conta. Cada um começa exatamente onde o anterior parou - nada de recomeçar do zero em outra plataforma."
        />
        <CourseShelf />
      </Section>

      <Section tone="surface" labelledBy="trilha-detalhe">
        <SectionHead
          id="trilha-detalhe"
          eyebrowPt="A ordem"
          titlePt="O que cada nível entrega."
        />

        <ol className="grid gap-4 list-none p-0 m-0">
          {courses.map(c => {
            const owned = account.can(c.slug);
            const open = isPlayable(c);
            return (
              <li key={c.slug}>
                <Card className="p-5 sm:p-6 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
                  <span aria-hidden
                        className="font-display text-[30px] font-bold leading-none tabular-nums
                                   text-[color-mix(in_srgb,var(--accent)_35%,transparent)]">
                    {c.code}
                  </span>

                  <div className="grid gap-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-[19px] font-bold text-ink">{c.titlePt}</h3>
                      {owned ? <Badge tone="mint">Seu curso</Badge>
                        : open ? <Badge tone="accent">Disponível</Badge>
                        : <Badge>Em breve</Badge>}
                    </div>
                    <p className="font-ui text-[12.5px] text-ink-muted">
                      {c.levelPt}{c.cefr ? ` · ${c.cefr}` : ''} · {c.stats.modules} módulos
                      {c.stats.lessons ? ` · ${c.stats.lessons} lições` : ''}
                    </p>
                    <p className="font-ui text-[14.5px] leading-relaxed text-ink-body max-w-[62ch]">
                      {c.summaryPt}
                    </p>
                    <ul className="grid gap-1 list-none p-0 m-0 pt-1">
                      {c.outcomesPt.slice(0, 3).map(o => (
                        <li key={o} className="flex gap-2.5">
                          <span aria-hidden className="text-[var(--accent)] text-[13px] mt-[3px]">✓</span>
                          <span className="font-ui text-[13.5px] leading-relaxed text-ink-body">{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-2 sm:justify-items-end content-start">
                    {open && !owned && (
                      <p className="font-ui text-[15px] font-semibold text-ink">{brl(c.price.brl)}</p>
                    )}
                    <LinkButton
                      href={owned ? '/meu-hebraico' : `/cursos/${c.slug}`}
                      variant={open && !owned ? 'primary' : 'secondary'}
                      size="sm"
                    >
                      {owned ? 'Continuar' : open ? 'Ver o curso' : 'O que vem nele'}
                    </LinkButton>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section labelledBy="ordem">
        <Card tone="wash" className="p-8 grid gap-4 justify-items-center text-center">
          <He size="lg" dim>א</He>
          <h2 id="ordem" className="font-display text-[23px] sm:text-[27px] font-bold text-ink max-w-[26ch]">
            Não dá para pular a alfabetização.
          </h2>
          <p className="font-ui text-[15px] leading-relaxed text-ink-body max-w-[52ch]">
            E não é regra de venda: do A1 em diante nada é escrito em
            transliteração. Quem chega sem ler o alfabeto passa o curso inteiro
            decorando sons em vez de aprender a língua. Se você já lê hebraico
            com nikud, comece direto no A1 quando ele sair.
          </p>
        </Card>
      </Section>
    </>
  );
}
