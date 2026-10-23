import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { Container, H2 } from '@/components/landing/base';
import { Abertura, AvisoEmBreve, Ponte } from '@/components/portal/Jornada';
import { FichaDoProduto } from '@/components/portal/FichaDoProduto';
import { produtos } from '@/lib/ecossistema';
import { getCourse } from '@/lib/catalog';

/* A amostra grátis: o capítulo 1 inteiro, fora do portão (scripts/ebook-no-site.sh). */
const AMOSTRA = '/israel-amostra/';

export const metadata: Metadata = meta({
  rota: '/israel-alem-do-obvio',
  title: 'Israel Além do Óbvio, de Moshik Gueta (em breve) - Hebraico Fluente',
  description:
    'O país pelos olhos de quem nasceu lá: um guia ilustrado e interativo pela história, a ' +
    'cultura e os lugares de Israel, de Moshik Gueta. Em breve.'
});

/* O livro Israel Além do Óbvio, "Em breve" (23/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Pronto e fora de venda até o contador e o advogado (CLAUDE.md, E-book).
 * Decisão do dono: a página existe e diz o que tem dentro, SEM preço, sem
 * botão de compra e sem checkout. Os textos vêm do catálogo (o mesmo que a
 * página de venda vai usar), não escritos aqui. */
export default function IsraelAlemDoObvioPage() {
  const p = produtos().find(x => x.id === 'israel-alem-do-roteiro')!;
  const livro = getCourse('israel-alem-do-roteiro');
  return (
    <>
      <Abertura
        jornada="israel"
        rubrica="Descobrir Israel · Livro"
        titulo={p.nome}
        trilha={[{ nome: 'Descobrir Israel', href: '/descobrir-israel' }, { nome: p.nome }]}
        lead={
          /* A identidade do livro (rebranding de 23/10/2026): o subtítulo, a
             descrição e o autor, lidos do catálogo. */
          <>
            <p className="m-0 font-display italic text-[clamp(20px,2.4vw,24px)] leading-[1.35] text-ink">{p.subtitulo}</p>
            {livro?.descricaoPt && <p className="m-0">{livro.descricaoPt}</p>}
            {livro?.autorPt && (
              <p className="m-0 font-ui text-[13.5px] font-semibold uppercase tracking-[.14em] text-ink-body">
                {livro.autorPt}
              </p>
            )}
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-4">
          <a href={AMOSTRA}
             className="inline-flex items-center min-h-[52px] px-6 rounded-[var(--r-md)] bg-[var(--navy)] text-white
                        font-ui text-[15.5px] font-medium no-underline active:scale-[.97] transition-transform">
            Ler o capítulo 1 grátis
          </a>
          <span className="font-ui text-[14px] text-ink-muted">Com os mapas, os exercícios e os jogos. Sem cadastro.</span>
        </div>
        <AvisoEmBreve texto="O livro está pronto e ainda não está à venda. Sem data marcada." />
      </Abertura>

      <section aria-labelledby="dentro-titulo" className="bg-surface-2">
        <Container className="py-14 sm:py-20 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start">
          <div className="grid content-start gap-4">
            <H2 id="dentro-titulo" className="m-0">O que tem dentro.</H2>
            <p className="m-0 font-ui text-[17px] leading-[1.65] text-ink-body">{p.descricao}</p>
          </div>
          {/* A ficha comum (FichaDoProduto): os mesmos cinco campos do curso e do
              Raízes, lidos do catálogo; sem preço enquanto o livro não está à venda. */}
          <FichaDoProduto p={p} titulo="O livro em cinco linhas" />
        </Container>
      </section>

      <Ponte
        jornada="israel"
        titulo="Chegue a Israel sabendo ler as letras."
        texto="O livro tem um capítulo sobre o hebraico das placas. Se quiser ir além do reconhecimento, o curso de alfabetização ensina a ler as 22 letras e os sinais de vogal."
        href="/curso-de-hebraico"
        rotulo="Conhecer o curso de hebraico"
      />
    </>
  );
}
