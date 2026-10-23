import type { Metadata } from 'next';
import Link from 'next/link';
import { meta } from '@/lib/seo';
import { Container, Rubrica } from '@/components/landing/base';
import { Abertura, Ponte, ProdutosDaJornada } from '@/components/portal/Jornada';
import { course, totalLicoes } from '@/lib/content-publico';

export const metadata: Metadata = meta({
  rota: '/aprender-hebraico',
  title: 'Aprender hebraico - Hebraico Fluente',
  description:
    'Comece pelo alfabeto: aprenda a ler hebraico do zero, letra por letra, num curso interativo ' +
    'para brasileiros. Depois, os níveis A1, A2 e B1.'
});

/* A jornada "Aprender hebraico" (23/10/2026, portal). O que se vende aqui é o
   curso de alfabetização; os níveis seguintes aparecem com o status do
   catálogo ("Em desenvolvimento"). Os números (lições, letras) vêm do curso
   construído, nunca escritos à mão. */
export default function AprenderHebraicoPage() {
  return (
    <>
      <Abertura
        jornada="hebraico"
        rubrica="Aprender hebraico"
        titulo="Comece pelas letras. Leia palavras de verdade desde as primeiras lições."
        trilha={[{ nome: 'Aprender hebraico' }]}
        lead={
          <p className="m-0">
            O hebraico parece um muro de letras parecidas até alguém mostrar por onde entrar. O curso de
            alfabetização ensina as 22 letras e os sinais de vogal em {totalLicoes()} lições, uma letra
            por vez, sem palavra com letra que você ainda não viu.
          </p>
        }
      >
        <div className="flex flex-wrap gap-3 pt-1">
          <Link href="/curso-de-hebraico"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-[var(--r-md)]
                           bg-[var(--navy)] text-white font-ui text-[15.5px] font-medium hover:bg-[var(--navy-2)]
                           transition-colors duration-[var(--dur)]">
            Conhecer o curso
            <span aria-hidden>→</span>
          </Link>
          <Link href="/metodo"
                className="inline-flex items-center justify-center min-h-[52px] px-6 rounded-[var(--r-md)]
                           bg-[var(--card)] text-ink border border-line font-ui text-[15.5px] font-medium
                           hover:border-[#C9C3B4] transition-colors duration-[var(--dur)]">
            Como o método funciona
          </Link>
        </div>
      </Abertura>

      <ProdutosDaJornada id="hebraico" titulo="Os cursos de hebraico" />

      <section aria-labelledby="ordem-titulo">
        <Container className="py-14 sm:py-20 grid gap-6 max-w-[860px]">
          <Rubrica>Por onde começar</Rubrica>
          <h2 id="ordem-titulo" className="m-0 font-display font-semibold text-[clamp(26px,3vw,36px)] leading-[1.1] tracking-[-0.025em]">
            Se você nunca leu hebraico, a resposta é uma só: o alfabeto.
          </h2>
          <p className="m-0 font-ui text-[17px] leading-[1.65] text-ink-muted">
            Os níveis seguintes começam onde a alfabetização termina. Antes de conversar, de viajar lendo
            as placas ou de abrir um texto, é preciso reconhecer as letras sem esforço. São {course.modules.length}{' '}
            módulos, no seu ritmo, no celular ou no computador.
          </p>
        </Container>
      </section>

      <Ponte
        titulo="Teste antes de decidir."
        texto="A página do curso tem a primeira lição aberta: você aprende o Álef de verdade, sem cadastro, e vê como é cada etapa."
        href="/curso-de-hebraico#experimente"
        rotulo="Fazer a aula aberta"
      />
    </>
  );
}
