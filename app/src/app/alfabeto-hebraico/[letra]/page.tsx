import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { meta } from '@/lib/seo';
import { He } from '@/components/hebrew/He';
import { PageHead, Section, SectionHead } from '@/components/platform/Section';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { OuvirAmostra } from '@/components/alfabeto/OuvirAmostra';
import { course } from '@/lib/content-publico';
import { somPt } from '@/lib/som-pt';
import { FORMAS_FINAIS, LETRAS_PUBLICAS, letraPublica, partes } from '@/lib/alfabeto-publico';
import { jsonLdTexto, migalhas } from '@/lib/jsonld';

/* Uma página por letra (23/10/2026, opção B de marketing/seo/paginas-do-alfabeto.md):
 * a forma, o nome e o som (públicos), uma palavra com a gravação do professor,
 * o erro comum do brasileiro e as letras parecidas. Só as letras de
 * LETRAS_PUBLICAS; o resto da lição fica no curso. */

export function generateStaticParams() {
  return LETRAS_PUBLICAS.map(l => ({ letra: l.id }));
}

const daLetra = (id: string) => course.letters.find(l => l.id === id);

export async function generateMetadata({ params }: { params: Promise<{ letra: string }> }): Promise<Metadata> {
  const { letra } = await params;
  const l = daLetra(letra);
  if (!l || !letraPublica(letra)) return {};
  return meta({
    rota: `/alfabeto-hebraico/${l.id}`,
    title: `${l.namePt} (${l.letter}): a letra do alfabeto hebraico e como se lê - Hebraico Fluente`,
    description:
      `${l.namePt}, a letra ${l.order} na ordem do curso: o som (${somPt(l.sound)}), uma palavra com a gravação ` +
      'do professor e o erro mais comum de quem fala português.'
  });
}

function Texto({ t }: { t: string }) {
  return <>{partes(t).map((p, i) => (p.he ? <He key={i}>{p.t}</He> : <span key={i}>{p.t}</span>))}</>;
}

export default async function LetraPage({ params }: { params: Promise<{ letra: string }> }) {
  const { letra } = await params;
  const l = daLetra(letra);
  const p = letraPublica(letra);
  if (!l || !p) notFound();
  const final = FORMAS_FINAIS[l.letter];
  const outras = LETRAS_PUBLICAS.filter(x => x.id !== p.id);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdTexto(migalhas([
        { nome: 'Alfabeto hebraico', rota: '/alfabeto-hebraico' },
        { nome: l.namePt, rota: `/alfabeto-hebraico/${l.id}` }
      ])) }} />
      <PageHead
        trilha={[{ nome: 'Alfabeto hebraico', href: '/alfabeto-hebraico' }, { nome: l.namePt }]}
        eyebrowPt={`Alfabeto hebraico · letra ${l.order} na ordem do curso`}
        titlePt={<>{l.namePt} <He size="xl">{l.letter}</He></>}
        leadPt={<>O som: {somPt(l.sound)}.{final && <> No fim da palavra, a letra muda de forma: <He>{final}</He>.</>}</>}
      >
        <div><OuvirAmostra nome={p.audioNome} rotulo={`Ouvir o nome: ${l.namePt}`} /></div>
      </PageHead>

      <Section labelledBy="palavra">
        <SectionHead id="palavra" eyebrowPt="Uma palavra" titlePt={`Uma palavra com ${l.namePt}.`} />
        <div className="grid gap-4 justify-items-start">
          <He size="display">{p.exemplo.he}</He>
          <p className="font-ui text-[17px] text-ink-body m-0">
            <strong>{p.exemplo.translit}</strong>: {p.exemplo.pt}
          </p>
          <OuvirAmostra nome={p.exemplo.audio} rotulo="Ouvir o professor" />
        </div>
      </Section>

      <Section tone="surface" labelledBy="erro">
        <SectionHead id="erro" eyebrowPt="Cuidado, brasileiro" titlePt="O erro mais comum com esta letra." />
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="border-t-2 border-[var(--gold)] pt-5 grid gap-2 content-start">
            <p className="font-display text-[20px] font-semibold text-[var(--gold-ink)] m-0">O que costuma sair</p>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0"><Texto t={p.erro.errado} /></p>
          </div>
          <div className="border-t-2 border-[var(--teal)] pt-5 grid gap-2 content-start">
            <p className="font-display text-[20px] font-semibold text-[var(--teal-ink)] m-0">O jeito certo</p>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0"><Texto t={p.erro.certo} /></p>
          </div>
        </div>
        <p className="font-ui text-[15px] leading-relaxed text-ink-muted mt-6 mb-0 max-w-[58ch]">
          No curso, a lição desta letra explica por que isso acontece e treina o som com a gravação do
          professor.
        </p>
      </Section>

      {p.parecidas.length > 0 && (
        <Section labelledBy="parecidas">
          <SectionHead
            id="parecidas" eyebrowPt="Atenção ao desenho"
            titlePt="Letras que se parecem com esta."
            leadPt="No começo, é fácil confundir. O curso treina a diferença lado a lado."
          />
          <div className="flex flex-wrap gap-6 items-end">
            <He size="xl">{l.letter}</He>
            {p.parecidas.map(g => <He key={g} size="xl" dim>{g}</He>)}
          </div>
        </Section>
      )}

      <Section tone="surface" labelledBy="outras">
        <SectionHead id="outras" eyebrowPt="Outras letras" titlePt="Continue pelo alfabeto." />
        <ul className="flex flex-wrap gap-3 list-none p-0 m-0">
          {outras.map(o => {
            const x = daLetra(o.id)!;
            return (
              <li key={o.id}>
                <Link href={`/alfabeto-hebraico/${o.id}`}
                      className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-[12px] border border-line bg-[var(--card)] font-ui text-[15px] text-ink hover:border-[var(--accent)]">
                  <He>{x.letter}</He> {x.namePt}
                </Link>
              </li>
            );
          })}
          <li>
            <Link href="/alfabeto-hebraico"
                  className="inline-flex items-center min-h-[44px] px-4 rounded-[12px] border border-line bg-[var(--card)] font-ui text-[15px] text-ink hover:border-[var(--accent)]">
              As 22 letras
            </Link>
          </li>
        </ul>
      </Section>

      <Section labelledBy="cta">
        <FaixaCta
          titulo="Aprenda as 22 letras, uma por vez."
          linha={<>Comece pelo teste grátis do Álef, na página do curso: 6 exercícios curtos, sem cadastro.</>}
          onde={`alfabeto-${l.id}`}
        />
      </Section>
    </>
  );
}
