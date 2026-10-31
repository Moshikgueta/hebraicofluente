import type { Metadata } from 'next';
import Link from 'next/link';
import { meta } from '@/lib/seo';
import { He } from '@/components/hebrew/He';
import { PageHead, Section, SectionHead } from '@/components/platform/Section';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { course } from '@/lib/content-publico';
import { somPt } from '@/lib/som-pt';
import { FORMAS_FINAIS, letraPublica } from '@/lib/alfabeto-publico';
import { METODO_ORIGINAL } from '@/lib/credito';
import { jsonLdTexto, migalhas } from '@/lib/jsonld';
import { secoesDe } from '@/lib/blog';
import { BlocosDoArtigo } from '@/app/blog/BlocosDoArtigo';
import { tx } from '@/i18n/telas/venda-alfabeto-hebraico';

export const metadata: Metadata = meta({
  rota: '/alfabeto-hebraico',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

/* A página principal do alfabeto (23/10/2026, plano de marketing, opção B de
 * marketing/seo/paginas-do-alfabeto.md). Só o que já é público: a forma, o
 * nome e o som de cada letra (lib/content-publico.ts) e as formas finais,
 * que são conhecimento geral do alfabeto. A explicação de cada letra continua
 * no curso. As letras com página própria (lib/alfabeto-publico.ts) ganham link. */
export default function AlfabetoHebraicoPage() {
  const letras = [...course.letters].sort((a, b) => a.order - b.order);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdTexto(migalhas([
        { nome: tx.alfabeto, rota: '/alfabeto-hebraico' }
      ])) }} />
      <PageHead
        trilha={[{ nome: tx.alfabeto }]}
        eyebrowPt={tx.alfabeto}
        titlePt={tx.titulo}
        leadPt={
          <>
            {tx.lead}
          </>
        }
      />

      <Section labelledBy="tabela">
        <SectionHead
          id="tabela"
          eyebrowPt={tx.tabelaEyebrow}
          titlePt={tx.tabelaTitulo}
          leadPt={tx.tabelaLead(METODO_ORIGINAL.autor)}
        />
        <div className="overflow-x-auto">
          <table className="w-full font-ui text-[15px] border-collapse">
            <thead>
              <tr className="text-left text-ink-muted">
                <th className="py-2 pr-4">{tx.colLetra}</th>
                <th className="py-2 pr-4">{tx.colNome}</th>
                <th className="py-2 pr-4">{tx.colSom}</th>
                <th className="py-2">{tx.colFinal}</th>
              </tr>
            </thead>
            <tbody>
              {letras.map(l => {
                const pagina = letraPublica(l.id);
                const final = FORMAS_FINAIS[l.letter];
                return (
                  <tr key={l.id} className="border-t border-line">
                    <td className="py-2.5 pr-4"><He size="lg">{l.letter}</He></td>
                    <td className="py-2.5 pr-4">
                      {pagina
                        ? <Link href={`/alfabeto-hebraico/${l.id}`} className="underline underline-offset-2 hover:text-[var(--accent)]">{l.namePt}</Link>
                        : l.namePt}
                    </td>
                    <td className="py-2.5 pr-4">{somPt(l.sound)}</td>
                    <td className="py-2.5">{final ? <He size="lg">{final}</He> : <span className="text-ink-muted">-</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="surface" labelledBy="como">
        <SectionHead id="como" eyebrowPt={tx.comoEyebrow} titlePt={tx.comoTitulo} />
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="grid gap-2 content-start">
            <h3 className="font-display text-[20px] font-semibold text-ink m-0">{tx.direitaTitulo}</h3>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              {tx.direitaTexto}
            </p>
          </div>
          <div className="grid gap-2 content-start">
            <h3 className="font-display text-[20px] font-semibold text-ink m-0">{tx.consoantesTitulo}</h3>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              {tx.consoantesTexto(<He>א</He>)}
            </p>
          </div>
          <div className="grid gap-2 content-start">
            <h3 className="font-display text-[20px] font-semibold text-ink m-0">{tx.vogaisTitulo}</h3>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              {tx.vogaisTexto}
            </p>
          </div>
        </div>
      </Section>

      {/* Os sons, as formas finais, as letras parecidas e por onde começar
          (31/10/2026, plano de SEO): o texto que seria o artigo "alfabeto
          hebraico" do blog, só depois de aprovado (data/blog.json, destino). */}
      {secoesDe('/alfabeto-hebraico').length > 0 && (
        <Section id="sobre-as-letras">
          <BlocosDoArtigo blocos={secoesDe('/alfabeto-hebraico')} />
        </Section>
      )}

      <Section labelledBy="cta">
        <FaixaCta
          titulo={tx.ctaTitulo}
          linha={<>{tx.ctaLinha}</>}
          onde="alfabeto-hebraico"
        />
      </Section>
    </>
  );
}
