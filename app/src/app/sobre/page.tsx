import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Section, SectionHead } from '@/components/platform/Section';
import { empresa } from '@/lib/empresa';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { totalLicoes } from '@/lib/content-publico';
import { METODO_ORIGINAL } from '@/lib/credito';
import { primeiroQueExiste } from '@/lib/midia-publica';

/* O retrato é o MESMO arquivo da capa, achado do mesmo jeito: olhando o disco
   na hora da build. Uma página de servidor pode fazer isso - por isso esta
   continua sem 'use client'. Sem o arquivo, o lugar mostra a marca, e nunca
   um aviso interno para quem está decidindo comprar. */
const RETRATO = ['media/moshik.avif', 'media/moshik.webp', 'media/moshik.jpg'];

export const metadata: Metadata = meta({
  rota: '/sobre',
  title: 'Sobre o Moshik - Hebraico Fluente',
  description:
    'Quem faz o Hebraico Fluente e por que o curso é do jeito que é.'
});

/* ⚠ ESTA PÁGINA PRECISA DA MÃO DO MOSHIK ANTES DE IR AO AR.
 * ─────────────────────────────────────────────────────────────────────────
 * O que está escrito abaixo foi montado a partir do que o REPOSITÓRIO prova:
 * as decisões de método, o manuscrito de origem, a caderneta de exercícios, o
 * público a que o curso se dirige. Nada aqui afirma um fato biográfico -
 * nenhuma data, cidade, formação, tempo de sala de aula ou número de alunos -
 * porque nenhum desses fatos existe no projeto, e inventá-los numa página
 * "Sobre" é o tipo de mentira pequena que derruba a confiança inteira quando
 * um aluno pergunta.
 *
 * Os dois blocos marcados com BIO abaixo são esqueleto: substitua pelo texto
 * de verdade, em primeira pessoa. Onde houver credencial, cite a credencial.
 * Onde houver número de alunos, cite o número. Se não houver, deixe como está
 * - a página funciona sem, e funciona mal com um número inventado.
 */

export default function SobrePage() {
  const retrato = primeiroQueExiste(RETRATO);
  return (
    <>
      <div className="border-b border-[color:var(--line-soft)]">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-14 sm:py-18
                        grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div className="grid gap-5">
            <p className="font-ui text-[12px] uppercase tracking-[.14em] text-[var(--accent)]">
              Sobre
            </p>
            <h1 className="font-display text-[32px] sm:text-[44px] font-bold leading-[1.12] text-ink max-w-[18ch]">
              Oi, eu sou o Moshik.
            </h1>
            {/* BIO - substituir */}
            <p className="text-[17px] leading-relaxed text-ink-body max-w-[56ch]">
              Eu ensino hebraico para brasileiros. O Hebraico Fluente nasceu de uma
              coisa que eu via acontecer sempre: gente motivada, que queria muito
              aprender, desistindo na primeira semana - não por falta de esforço,
              mas porque o material que existia começava pelo lugar errado.
            </p>
            <p className="font-ui text-[15px] leading-relaxed text-ink-body max-w-[58ch]">
              Este curso é a tentativa de resolver isso de uma vez: começar pela
              leitura, uma letra por vez, sem pular nada e sem pedir que ninguém
              decore o que ainda não consegue ler.
            </p>
          </div>

          {/* O retrato, e a frase como legenda dele.
              `object-top`: num retrato de rua o rosto fica no terço de cima,
              e o corte centralizado do object-cover o decapitaria no 4/5. */}
          {retrato ? (
            <figure className="m-0 grid gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={retrato}
                alt="Moshik Gueta, professor e criador do Hebraico Fluente"
                width={680} height={850} loading="lazy" decoding="async"
                className="aspect-[4/5] w-full rounded-[var(--r-lg)] border border-line
                           object-cover object-top bg-surface-2"
              />
              <figcaption className="font-ui text-[13.5px] leading-relaxed text-ink-body">
                O alfabeto é a porta. Depois dela, o hebraico deixa de ser um bloco
                e vira uma língua como qualquer outra.
              </figcaption>
            </figure>
          ) : (
            <Card tone="wash" className="p-8 grid gap-4 justify-items-center text-center">
              <He size="xl" dim>ע</He>
              <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">
                O alfabeto é a porta. Depois dela, o hebraico deixa de ser um bloco
                e vira uma língua como qualquer outra.
              </p>
            </Card>
          )}
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
              b: 'Ela ajuda no começo e atrapalha depois. Então ela sai - em etapas, avisando, e com exercícios feitos para o momento em que ela sair.'
            },
            {
              t: 'Não fingir que você tem professor do lado',
              b: 'Você não tem. Por isso cada exercício se corrige sozinho, cada erro explica o motivo, e o exame final tem gabarito, transcrição e critério - tudo o que um professor faria, escrito.'
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
              As {totalLicoes()} lições, as palavras de cada letra e os exercícios
              saíram do material impresso e passaram para o aplicativo pela mesma
              fonte - se uma palavra muda, muda nos dois. O livro e a plataforma
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

      {/* ── o crédito ────────────────────────────────────────────────────
          Seção própria, e não uma nota de rodapé dentro de outra: o método
          que esta plataforma ensina não foi inventado aqui, e quem o criou
          tem nome. Ver lib/credito.ts - o texto do crédito sai de um arquivo
          só, para não divergir entre o rodapé, a capa e esta página. */}
      <Section labelledBy="metodo-origem">
        <SectionHead
          id="metodo-origem"
          eyebrowPt="Crédito"
          titlePt="De onde vem o método."
          leadPt="O caminho que este curso segue tem autor, e o crédito é dele."
        />
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card tone="wash" className="p-6 grid gap-3 content-start">
            <p className="font-ui text-[12px] uppercase tracking-[.12em] text-[var(--accent)]">
              Obra de origem
            </p>
            <p className="font-display text-[26px] font-bold text-ink leading-tight">
              <He size="inline">{METODO_ORIGINAL.obraHe}</He>
            </p>
            <p className="font-ui text-[14px] text-ink-body">
              {METODO_ORIGINAL.obraTranslit}
            </p>
            <p className="font-display text-[17px] font-bold text-ink">
              {METODO_ORIGINAL.autor}
            </p>
          </Card>
          <div className="grid gap-3 content-start">
            <p className="text-[16px] leading-relaxed text-ink-body">
              O caminho que este curso segue - a ordem em que as letras entram, a
              decisão de ler antes de falar, o cuidado com quem estuda sozinho - vem do
              método do {METODO_ORIGINAL.autor}, autor de{' '}
              <He size="inline">{METODO_ORIGINAL.obraHe}</He>. O conteúdo do livro dele é
              a base do que a plataforma ensina.
            </p>
            <p className="font-ui text-[15px] leading-relaxed text-ink-body">
              A adaptação para o aluno brasileiro é minha: as comparações com os sons
              do português, os erros que só quem fala português comete, os exercícios
              que se corrigem sozinhos e tudo o que acontece na tela.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="wash">
        <FaixaCta
          onde="sobre"
          titulo="Tem uma dúvida antes de começar?"
          linha={`As mais comuns já estão respondidas. O que não estiver, escreva para ${empresa.contato.emailSuporte}.`}
        >
          <LinkButton href="/faq" variant="secondary">Dúvidas frequentes</LinkButton>
        </FaixaCta>
      </Section>
    </>
  );
}
