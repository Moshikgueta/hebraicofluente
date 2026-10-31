import type { Metadata } from 'next';
import Link from 'next/link';
import { meta } from '@/lib/seo';
import { Container, H2, Rubrica } from '@/components/landing/base';
import { BotaoDoCurso } from '@/components/portal/BotaoDoCurso';
import { FichaDoProduto } from '@/components/portal/FichaDoProduto';
import { produtos } from '@/lib/ecossistema';
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
const MAIS = [
  { href: '/alfabeto-hebraico', t: 'O alfabeto hebraico', d: 'As 22 letras com o nome e o som em português, e as formas finais.' },
  { href: '/metodo', t: 'O método', d: 'Como é cada lição, da letra nova à fixação.' },
  { href: '/cursos', t: 'A trilha dos cursos', d: 'A alfabetização, e os níveis A1, A2 e B1 que vêm depois.' },
  { href: '/biblia', t: 'Dá para ler a Bíblia?', d: 'Ler em voz alta, sim; entender sem vocabulário, não. Gênesis 1:1, palavra por palavra.' },
  { href: '/faq', t: 'Dúvidas', d: 'Acesso, pagamento, celular, prazo para desistir.' }
];

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
          <BotaoDoCurso href="/curso-de-hebraico"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-[var(--r-md)]
                           bg-[var(--navy)] text-white font-ui text-[15.5px] font-medium hover:bg-[var(--navy-2)]
                           transition-colors duration-[var(--dur)]">
            Conhecer o curso
            <span aria-hidden>→</span>
          </BotaoDoCurso>
          <Link href="/metodo"
                className="inline-flex items-center justify-center min-h-[52px] px-6 rounded-[var(--r-md)]
                           bg-[var(--card)] text-ink border border-line font-ui text-[15.5px] font-medium
                           hover:border-[#C9C3B4] transition-colors duration-[var(--dur)]">
            Como o método funciona
          </Link>
        </div>
      </Abertura>

      <section aria-label="A ficha do curso">
        <Container className="pb-14 sm:pb-20">
          <FichaDoProduto p={produtos().find(x => x.id === 'alfabetizacao')!} titulo="O curso em cinco linhas" />
        </Container>
      </section>

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

      {/* As páginas que explicam o curso, todas a um clique da jornada: quem
          chega pela capa encontra o método, a trilha dos níveis, a pergunta
          da Bíblia e as dúvidas sem voltar ao menu. */}
      <section aria-labelledby="fundo-titulo" className="bg-surface-2">
        <Container className="py-14 sm:py-20 grid gap-8">
          <H2 id="fundo-titulo" className="m-0 max-w-[22ch]">Para conhecer melhor antes de começar.</H2>
          <ul className="grid gap-x-10 md:grid-cols-2 list-none p-0 m-0 border-t border-line">
            {MAIS.map(m => (
              <li key={m.href} className="border-b border-line">
                <Link href={m.href} className="group grid gap-1 py-5 min-h-[44px]">
                  <span className="inline-flex items-center gap-2 font-display text-[19px] font-semibold text-ink">
                    {m.t}
                    <span aria-hidden className="text-[var(--teal-ink)] transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
                  </span>
                  <span className="font-ui text-[15.5px] leading-[1.6] text-ink-muted">{m.d}</span>
                </Link>
              </li>
            ))}
          </ul>
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
