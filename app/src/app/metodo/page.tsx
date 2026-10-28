import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { He } from '@/components/hebrew/He';
import { Itens, PageHead, Section, SectionHead } from '@/components/platform/Section';
import { Rubrica } from '@/components/landing/base';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { course, totalLicoes } from '@/lib/content-publico';
import { ETAPAS_DA_LICAO, quantasEtapasPt } from '@/lib/etapas-da-licao';
import { tx } from '@/i18n/telas/venda-metodo';

export const metadata: Metadata = meta({
  rota: '/metodo',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

/* O método, explicado de verdade.
 * ─────────────────────────────────────────────────────────────────────────
 * Esta é a página que mais convence, e por um motivo chato: ela é a única do
 * site que explica uma decisão técnica que o concorrente não tomou. Por isso
 * o texto aqui descreve regras REAIS do produto (a regra de ordem, o corte da
 * transliteração, a revisão por habilidade), e não adjetivos.
 *
 * É uma página de servidor: nada aqui depende da conta.
 */

export default function MetodoPage() {
  const letterModules = course.modules.filter(m => m.letterIds.length).length;

  return (
    <>
      <PageHead
        trilha={[{ nome: tx.trilha }]}
        eyebrowPt={tx.eyebrow}
        titlePt={tx.titulo(quantasEtapasPt())}
        leadPt={tx.lead}
      />

      {/* A regra que sustenta tudo, sozinha, antes das outras. O exemplo
          (מַיִם, lição 3) vai numa lâmina como a do hero da capa: é a palavra
          que prova a regra, e merece ser vista como objeto, não como nota. */}
      <Section labelledBy="regra">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div className="grid gap-5 content-start">
            <Rubrica>{tx.regraRubrica}</Rubrica>
            <h2 id="regra" className="font-display font-semibold text-[clamp(28px,3.4vw,40px)] leading-[1.08]
                                      tracking-[-0.03em] text-ink max-w-[22ch] m-0">
              {tx.regraTitulo}
            </h2>
            <p className="font-ui text-[16.5px] leading-[1.65] text-ink-body max-w-[60ch] m-0">
              {tx.regraP1}
            </p>
            <p className="font-ui text-[16.5px] leading-[1.65] text-ink-body max-w-[60ch] m-0">
              {tx.regraP2}
            </p>
          </div>
          <figure className="m-0 rounded-[20px] bg-[var(--card)] overflow-hidden
                             shadow-[0_0_0_1px_var(--line),0_2px_4px_rgba(27,33,31,.04),0_30px_60px_-30px_rgba(14,59,67,.3)]">
            <div className="flex items-baseline justify-between gap-4 px-5 sm:px-6 py-4 border-b border-line">
              <span className="font-ui text-[12px] font-semibold uppercase tracking-[.12em] text-ink-muted">{tx.licao3}</span>
              <span className="font-ui text-[12px] font-semibold uppercase tracking-[.12em] text-[var(--teal-ink)]">{tx.mayim}</span>
            </div>
            <div className="grid place-items-center bg-[var(--sand)] py-10 sm:py-14 select-none">
              <He size="display" tone="navy">מַיִם</He>
            </div>
            <figcaption className="px-5 sm:px-6 py-4 border-t border-line font-ui text-[14.5px] leading-[1.5] text-ink-body">
              {tx.legenda}
            </figcaption>
          </figure>
        </div>
      </Section>

      <Section tone="surface" labelledBy="outras">
        <SectionHead id="outras" eyebrowPt={tx.outrasEyebrow} titlePt={tx.outrasTitulo} />
        <Itens inicio={2} itens={[
            {
              t: tx.ordemT,
              b: tx.ordemB(letterModules, totalLicoes())
            },
            {
              t: tx.parecidasT,
              b: tx.parecidasB
            },
            {
              t: tx.revisaoT,
              b: tx.revisaoB
            },
            {
              t: tx.translitT,
              b: tx.translitB
            }
          ]} />
      </Section>

      <Section labelledBy="aula">
        <SectionHead
          id="aula"
          eyebrowPt={tx.aulaEyebrow}
          titlePt={tx.aulaTitulo(quantasEtapasPt().toLowerCase())}
          leadPt={tx.aulaLead}
        />
        {/* As etapas são as abas da lição (lib/etapas-da-licao.ts): a capa
            conta a mesma lista, com os mesmos nomes (auditoria, CONV-010). */}
        <Itens colunas={5} itens={ETAPAS_DA_LICAO.map(({ aba, descricaoPt }) => ({ t: aba, b: descricaoPt }))} />
      </Section>

      <Section>
        <FaixaCta
          onde="metodo"
          titulo={tx.ctaTitulo}
          linha={tx.ctaLinha}
        />
      </Section>
    </>
  );
}
