import type { Metadata } from 'next';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Section, SectionHead } from '@/components/platform/Section';
import { course } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Sobre o Moshik — Hebraico Fluente',
  description: 'Quem faz o Hebraico Fluente e por que o curso é do jeito que é.'
};

/* ⚠ ESTA PÁGINA PRECISA DA MÃO DO MOSHIK ANTES DE IR AO AR.
 * ─────────────────────────────────────────────────────────────────────────
 * O que está escrito abaixo foi montado a partir do que o REPOSITÓRIO prova:
 * as decisões de método, o manuscrito de origem, a caderneta de exercícios, o
 * público a que o curso se dirige. Nada aqui afirma um fato biográfico —
 * nenhuma data, cidade, formação, tempo de sala de aula ou número de alunos —
 * porque nenhum desses fatos existe no projeto, e inventá-los numa página
 * "Sobre" é o tipo de mentira pequena que derruba a confiança inteira quando
 * um aluno pergunta.
 *
 * Os dois blocos marcados com BIO abaixo são esqueleto: substitua pelo texto
 * de verdade, em primeira pessoa. Onde houver credencial, cite a credencial.
 * Onde houver número de alunos, cite o número. Se não houver, deixe como está
 * — a página funciona sem, e funciona mal com um número inventado.
 */

export default function SobrePage() {
  return (
    <>
      <div className="border-b border-[color:var(--line-soft)]">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-14 sm:py-18
                        grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div className="grid gap-5">
            <p className="font-ui text-[12px] uppercase tracking-[.14em] text-[var(--teal-band)]">
              Sobre
            </p>
            <h1 className="font-display text-[32px] sm:text-[44px] font-bold leading-[1.12] text-ink max-w-[18ch]">
              Oi, eu sou o Moshik.
            </h1>
            {/* BIO — substituir */}
            <p className="text-[17px] leading-relaxed text-ink-body max-w-[56ch]">
              Eu ensino hebraico para brasileiros. O Hebraico Fluente nasceu de uma
              coisa que eu via acontecer sempre: gente motivada, que queria muito
              aprender, desistindo na primeira semana — não por falta de esforço,
              mas porque o material que existia começava pelo lugar errado.
            </p>
            <p className="font-ui text-[15px] leading-relaxed text-ink-body max-w-[58ch]">
              Este curso é a tentativa de resolver isso de uma vez: começar pela
              leitura, uma letra por vez, sem pular nada e sem pedir que ninguém
              decore o que ainda não consegue ler.
            </p>
          </div>

          <Card tone="wash" className="p-8 grid gap-4 justify-items-center text-center">
            <He size="xl" dim>א</He>
            <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">
              O alfabeto é a porta. Depois dela, o hebraico deixa de ser um bloco
              e vira uma língua como qualquer outra.
            </p>
          </Card>
        </div>
      </div>

      <Section labelledBy="porque">
        <SectionHead
          id="porque"
          eyebrowPt="Por que este curso existe"
          titlePt="Três coisas que eu me recusei a fazer."
          leadPt="Quase tudo neste curso é consequência de uma dessas três."
        />
        <ul className="grid gap-4 sm:grid-cols-3 list-none p-0 m-0">
          {[
            {
              t: 'Não mostrar a tabela inteira no primeiro dia',
              b: 'As 22 letras de uma vez é a forma mais rápida de convencer um adulto de que ele não tem talento para línguas. Uma por vez, com tempo, resolve o mesmo problema sem esse custo.'
            },
            {
              t: 'Não deixar a transliteração virar muleta',
              b: 'Ela ajuda no começo e atrapalha depois. Então ela sai — em etapas, avisando, e com exercícios feitos para o momento em que ela sair.'
            },
            {
              t: 'Não fingir que você tem professor do lado',
              b: 'Você não tem. Por isso cada exercício se corrige sozinho, cada erro explica o motivo, e o exame final tem gabarito, transcrição e critério — tudo o que um professor faria, escrito.'
            }
          ].map(x => (
            <li key={x.t}>
              <Card className="p-5 grid gap-2 h-full content-start">
                <h3 className="font-display text-[16.5px] font-bold text-ink">{x.t}</h3>
                <p className="font-ui text-[14px] leading-relaxed text-ink-body">{x.b}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="surface" labelledBy="feito">
        <SectionHead
          id="feito"
          eyebrowPt="Como foi feito"
          titlePt="O curso veio de um material impresso."
          leadPt="Não é um aplicativo que inventou um conteúdo: é um material que já existia, virado plataforma sem perder o rigor de livro."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5 grid gap-2 content-start">
            <h3 className="font-display text-[16.5px] font-bold text-ink">Um manuscrito e uma caderneta</h3>
            <p className="font-ui text-[14px] leading-relaxed text-ink-body">
              As {course.totalLetters} lições, as palavras de cada letra e os exercícios
              saíram do material impresso e passaram para o aplicativo pela mesma
              fonte — se uma palavra muda, muda nos dois. O livro e a plataforma
              não podem divergir, e não divergem por construção.
            </p>
          </Card>
          <Card className="p-5 grid gap-2 content-start">
            <h3 className="font-display text-[16.5px] font-bold text-ink">Hebraico escrito com cuidado</h3>
            <p className="font-ui text-[14px] leading-relaxed text-ink-body">
              Os sinais de vogal são frágeis: um espaço no lugar errado, uma
              pontuação encostada, e a palavra aparece invertida ou com o ponto
              fora do lugar. Cada trecho em hebraico da plataforma passa por um
              único componente que garante a direção e a integridade do texto.
            </p>
          </Card>
        </div>
      </Section>

      <Section tone="wash">
        <Card className="p-8 grid gap-4 justify-items-center text-center">
          <h2 className="font-display text-[25px] sm:text-[30px] font-bold text-ink max-w-[24ch]">
            Tem uma dúvida antes de começar?
          </h2>
          <p className="font-ui text-[15.5px] leading-relaxed text-ink-body max-w-[48ch]">
            As mais comuns já estão respondidas. O que não estiver, escreva para
            contato@hebraicofluente.com.br.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <LinkButton href="/faq" variant="secondary">Dúvidas frequentes</LinkButton>
            <LinkButton href="/cursos/alfabetizacao">Ver o curso</LinkButton>
          </div>
        </Card>
      </Section>
    </>
  );
}
