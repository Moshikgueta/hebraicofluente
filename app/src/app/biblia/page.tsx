import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { He } from '@/components/hebrew/He';
import { Itens, PageHead, Section, SectionHead } from '@/components/platform/Section';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { Versiculo } from '@/components/landing/Versiculo';
import { bibleVerses, course, licaoDaLetra, totalLicoes } from '@/lib/content-publico';
import { tx } from '@/i18n/telas/venda-biblia';

export const metadata: Metadata = meta({
  rota: '/biblia',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

/* «Vou conseguir ler a Bíblia?»
 * ─────────────────────────────────────────────────────────────────────────
 * É a pergunta que mais chega antes da compra, e por isso a página é PÚBLICA:
 * quem pergunta ainda não pagou, e uma expectativa só pode ser ajustada antes
 * do pagamento. Deixá-la do lado de dentro seria contar o limite do produto
 * para quem já não pode mais mudar de ideia.
 *
 * A resposta tem duas metades e elas só valem juntas. Dar só o "sim" vende
 * mais hoje e devolve o dinheiro depois; dar só o "não" é honesto e inútil.
 * Então as duas aparecem lado a lado, do mesmo tamanho, e o versículo no meio
 * é o que deixa a pessoa decidir se aquilo basta para ela.
 *
 * O número da lição em que o versículo fica legível é CALCULADO (o `after` que
 * o exportador escreve a partir da ordem real das letras), e não escrito aqui:
 * mudar a ordem do alfabeto não pode deixar esta página prometendo uma lição
 * que não existe mais.
 *
 * Página de servidor, exceto o versículo, que precisa de toque.
 */

export default function BibliaPage() {
  /* A V22 do validate.js exige pelo menos um versículo, e a build falha se o
     arquivo vier vazio - melhor aqui, em voz alta, do que uma página de
     vendas publicada sem o argumento que ela existe para fazer. */
  const v = bibleVerses()[0];
  if (!v) throw new Error('data/biblia.json não tem nenhum versículo'); // i18n-ok
  /* `after` é a ORDEM da letra mais tardia, não a lição: a 20ª letra (Bet)
     entra na lição 14 das 27. Os dois números, calculados (CONV-006). */
  const licao = licaoDaLetra(v.after);

  return (
    <>
      <PageHead
        trilha={[{ nome: tx.trilha }]}
        eyebrowPt={tx.eyebrow}
        titlePt={tx.titulo}
        leadPt={tx.lead}
      />

      <Section labelledBy="resposta">
        <SectionHead
          id="resposta"
          eyebrowPt={tx.respostaEyebrow}
          titlePt={tx.respostaTitulo}
          leadPt={tx.respostaLead}
        />
        {/* As duas metades lado a lado, do mesmo tamanho, sob o mesmo fio. O
            "Sim" e o "Não" eram dois selos pequenos; agora são a palavra que
            abre cada coluna, em teal e em dourado, e não só pela cor: a
            palavra está escrita. */}
        <div className="grid gap-10 sm:gap-12 sm:grid-cols-2">
          <div className="border-t-2 border-[var(--teal)] pt-6 grid gap-3 content-start">
            <p className="font-display text-[44px] leading-none font-semibold tracking-[-0.04em] text-[var(--teal-ink)] m-0">{tx.sim}</p>
            <h3 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink m-0">
              {tx.simTitulo}
            </h3>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              {tx.simTexto}
            </p>
          </div>
          <div className="border-t-2 border-[var(--gold)] pt-6 grid gap-3 content-start">
            <p className="font-display text-[44px] leading-none font-semibold tracking-[-0.04em] text-[var(--gold-ink)] m-0">{tx.nao}</p>
            <h3 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink m-0">
              {tx.naoTitulo}
            </h3>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              {tx.naoTexto}
            </p>
          </div>
        </div>
      </Section>

      <Section tone="surface" labelledBy="versiculo">
        <SectionHead
          id="versiculo"
          eyebrowPt={tx.versiculoEyebrow}
          titlePt={tx.versiculoTitulo}
          leadPt={tx.versiculoLead}
        />
        <Versiculo v={v} />
        <p className="font-ui text-[14px] leading-relaxed text-ink-muted max-w-[58ch] mt-5">
          {tx.legivel(v.after, course.totalLetters, licao, totalLicoes())}
        </p>
      </Section>

      <Section labelledBy="muda">
        <SectionHead
          id="muda"
          eyebrowPt={tx.mudaEyebrow}
          titlePt={tx.mudaTitulo}
          leadPt={tx.mudaLead}
        />
        <Itens itens={[
          { t: tx.originalT,
            b: tx.originalB },
          { t: tx.lexicoT,
            b: tx.lexicoB },
          { t: tx.traducaoT,
            b: tx.traducaoB },
          { t: tx.reconheceT,
            b: tx.reconheceB,
            extra: <p className="pt-1 m-0"><He size="word">{v.words[2]!.he}</He></p> }
        ]} />
      </Section>

      {/* A parte que quase nenhum material conta antes da compra, e que muda
          o que a pessoa deve esperar de uma sinagoga. */}
      <Section tone="wash" labelledBy="rolo">
        <SectionHead
          id="rolo"
          eyebrowPt={tx.roloEyebrow}
          titlePt={tx.roloTitulo}
          leadPt={tx.roloLead}
        />
        <div className="rounded-[20px] bg-[var(--card)] p-6 sm:p-8 grid gap-4
                        shadow-[0_0_0_1px_var(--line),0_1px_2px_rgba(27,33,31,.04)]">
          <div className="grid gap-1.5">
            <p className="font-ui text-[12px] uppercase tracking-[.08em] text-ink-muted">
              {tx.comPontos}
            </p>
            <p dir="rtl" lang="he"><He size="word">{v.he}</He></p>
          </div>
          <div className="grid gap-1.5 border-t border-[color:var(--line-soft)] pt-4">
            <p className="font-ui text-[12px] uppercase tracking-[.08em] text-ink-muted">
              {tx.semPontos}
            </p>
            <p dir="rtl" lang="he"><He size="word">{v.bare}</He></p>
          </div>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body max-w-[58ch]">
            {tx.mesmaLinha}
          </p>
        </div>
      </Section>

      <Section>
        <FaixaCta
          onde="biblia"
          titulo={tx.ctaTitulo}
          linha={tx.ctaLinha}
        />
      </Section>
    </>
  );
}
