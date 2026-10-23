import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { Container, H2 } from '@/components/landing/base';
import { Abertura, AvisoEmBreve, Ponte } from '@/components/portal/Jornada';
import { getCourse } from '@/lib/catalog';
import { produtos } from '@/lib/ecossistema';

export const metadata: Metadata = meta({
  rota: '/israel-alem-do-roteiro',
  title: 'Israel Além do Roteiro (em breve) - Hebraico Fluente',
  description:
    'O guia ilustrado para entender Israel antes, durante e depois da viagem: onze capítulos com ' +
    'mapas, história, cultura e a viagem na prática. Em breve.'
});

/* O livro Israel Além do Roteiro, "Em breve" (23/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Pronto e fora de venda até o contador e o advogado (CLAUDE.md, E-book).
 * Decisão do dono: a página existe e diz o que tem dentro, SEM preço, sem
 * botão de compra e sem checkout. Os textos vêm do catálogo (o mesmo que a
 * página de venda vai usar), não escritos aqui. */
export default function IsraelAlemDoRoteiroPage() {
  const livro = getCourse('israel-alem-do-roteiro');
  const p = produtos().find(x => x.id === 'israel-alem-do-roteiro')!;
  return (
    <>
      <Abertura
        jornada="israel"
        rubrica="Descobrir Israel · Livro"
        titulo={p.nome}
        trilha={[{ nome: 'Descobrir Israel', href: '/descobrir-israel' }, { nome: p.nome }]}
        lead={<p className="m-0">{p.subtitulo}</p>}
      >
        <AvisoEmBreve texto="O livro está pronto e ainda não está à venda. Sem data marcada." />
      </Abertura>

      <section aria-labelledby="dentro-titulo" className="bg-surface-2">
        <Container className="py-14 sm:py-20 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="grid content-start gap-4">
            <H2 id="dentro-titulo" className="m-0">O que tem dentro.</H2>
            <p className="m-0 font-ui text-[17px] leading-[1.65] text-ink-body">{p.descricao}</p>
            <p className="m-0 font-ui text-[15px] text-ink-muted">{p.formato}.</p>
          </div>
          <div className="grid content-start gap-8">
            {livro?.outcomesPt?.length ? (
              <div className="grid gap-3">
                <h3 className="m-0 font-display text-[21px] font-semibold">Depois de ler, você consegue</h3>
                <ul className="grid gap-2.5 list-none p-0 m-0">
                  {livro.outcomesPt.map(o => (
                    <li key={o} className="flex gap-3 font-ui text-[16px] leading-[1.55] text-ink-body">
                      <span aria-hidden className="mt-[9px] w-[5px] h-[5px] rounded-full bg-[var(--gold)] shrink-0" />{o}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {livro?.forWhomPt?.length ? (
              <div className="grid gap-3">
                <h3 className="m-0 font-display text-[21px] font-semibold">Para quem é</h3>
                <ul className="grid gap-2.5 list-none p-0 m-0">
                  {livro.forWhomPt.map(o => (
                    <li key={o} className="flex gap-3 font-ui text-[16px] leading-[1.55] text-ink-body">
                      <span aria-hidden className="mt-[9px] w-[5px] h-[5px] rounded-full bg-[var(--gold)] shrink-0" />{o}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      <Ponte
        titulo="Chegue a Israel sabendo ler as letras."
        texto="O livro tem um capítulo sobre o hebraico das placas. Se quiser ir além do reconhecimento, o curso de alfabetização ensina a ler as 22 letras e os sinais de vogal."
        href="/curso-de-hebraico"
        rotulo="Conhecer o curso de hebraico"
      />
    </>
  );
}
