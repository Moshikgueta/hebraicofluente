'use client';

/* A porta da frente.
 * ─────────────────────────────────────────────────────────────────────────
 * Uma página de venda para adulto brasileiro que já tentou aprender hebraico
 * e parou. Três coisas ela faz e uma ela não faz.
 *
 * Faz: nomeia a objeção real na primeira frase ("as letras são todas iguais"),
 * mostra hebraico de verdade na tela antes de pedir qualquer coisa, e diz o
 * preço sem obrigar a clicar para descobrir.
 *
 * Não faz: contagem regressiva falsa, "restam 3 vagas", depoimento inventado.
 * Não porque seja feio — porque é mentira, e porque o produto aqui é um curso
 * que a pessoa vai usar por meses. Quem compra por pressão pede reembolso.
 *
 * Os números vêm do catálogo e do curso construído, nunca escritos à mão: uma
 * landing que promete "30 lições" quando o curso tem 22 é um processo do
 * Procon esperando acontecer.
 */

import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Section, SectionHead } from '@/components/platform/Section';
import { CourseShelf } from '@/components/platform/CourseShelf';
import { brl, flagship, installment, pixPrice } from '@/lib/catalog';
import { useAccount } from '@/lib/account/store';
import { course } from '@/lib/content';

export function HomeClient() {
  const account = useAccount();
  const c = flagship();
  const parcela = installment(c.price);

  /* Um aluno que já entrou não deve ver "Começar agora" na capa do site dele. */
  const primary = account.signedIn
    ? { href: '/meu-hebraico', label: 'Continuar meu curso' }
    : { href: `/cursos/${c.slug}`, label: 'Começar agora' };

  return (
    <>
      {/* ── a capa ──────────────────────────────────────────────────── */}
      <div className="border-b border-[color:var(--line-soft)]">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-14 sm:py-20
                        grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:items-center">
          <div className="grid gap-5">
            <p className="font-ui text-[12px] uppercase tracking-[.14em] text-[var(--teal-band)]">
              Hebraico para brasileiros
            </p>
            <h1 className="font-display text-[34px] sm:text-[46px] font-bold leading-[1.1] text-ink">
              Você olha para o hebraico e vê um monte de letra igual.
            </h1>
            <p className="text-[17px] sm:text-[18px] leading-relaxed text-ink-body max-w-[52ch]">
              São {course.totalLetters} letras — e elas não são iguais, só ainda não foram
              separadas. Aqui você aprende uma de cada vez, na ordem em que cada
              uma rende mais, e lê uma palavra de verdade já na terceira lição.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <LinkButton href={primary.href} size="lg">{primary.label}</LinkButton>
              <LinkButton href="/metodo" variant="secondary" size="lg">Como funciona</LinkButton>
            </div>

            <p className="font-ui text-[13px] text-ink-muted pt-1">
              {brl(c.price.brl)} à vista no PIX por {brl(pixPrice(c.price))}
              {' '}· ou {parcela.n}x de {brl(parcela.brl)} no cartão · acesso por {c.accessMonths} meses
            </p>
          </div>

          {/* A demonstração. Nada de imagem de banco: as letras de verdade,
              na fonte de verdade, com os sinais de vogal posicionados como
              vão aparecer na aula. É a prova mais barata que existe. */}
          <Card tone="wash" className="p-6 sm:p-8 grid gap-6 justify-items-center">
            <p className="font-ui text-[12px] uppercase tracking-[.1em] text-[var(--teal-band)]">
              A terceira lição
            </p>
            <He size="display">מַיִם</He>
            <div className="grid gap-1 text-center">
              <p className="font-ui text-[15px] font-semibold text-ink">máyim</p>
              <p className="font-ui text-[14px] text-ink-muted">água</p>
            </div>
            <div className="w-full border-t border-[color:var(--line-soft)] pt-5 grid gap-2">
              <p className="font-ui text-[13px] leading-relaxed text-ink-body text-center">
                Três letras e dois sinais. Você já consegue ler isto sozinho
                depois de dois dias — e é assim que o resto do curso vai.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* ── o problema ──────────────────────────────────────────────── */}
      <Section labelledBy="problema">
        <SectionHead
          id="problema"
          eyebrowPt="Por que trava"
          titlePt="O problema nunca foi você."
          leadPt="É quase sempre o mesmo lugar, e são sempre estas três coisas."
        />
        <ul className="grid gap-4 sm:grid-cols-3 list-none p-0 m-0">
          {[
            {
              t: 'Tudo de uma vez',
              b: 'A tabela com as 22 letras na primeira página. Ninguém decora 22 formas novas num dia — e ninguém precisa.'
            },
            {
              t: 'Letras que se parecem',
              b: 'ב e כ, ד e ר, ה e ח. Cursos que não tratam isso de frente deixam a confusão virar hábito.'
            },
            {
              t: 'Transliteração para sempre',
              b: 'Quando o "shalom" embaixo nunca sai, você está lendo português. O curso tira essa muleta, de propósito, na hora certa.'
            }
          ].map(x => (
            <li key={x.t}>
              <Card className="p-5 grid gap-2 h-full content-start">
                <h3 className="font-display text-[17px] font-bold text-ink">{x.t}</h3>
                <p className="font-ui text-[14px] leading-relaxed text-ink-body">{x.b}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── o que a plataforma faz ──────────────────────────────────── */}
      <Section tone="surface" labelledBy="plataforma">
        <SectionHead
          id="plataforma"
          eyebrowPt="Dentro da plataforma"
          titlePt="Não é um PDF com vídeo em cima."
          leadPt="Cada lição termina com você fazendo alguma coisa — e o curso sabe o que você errou."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
          {[
            { i: '◉', t: 'Exercício a cada passo',
              b: 'Escolher, ouvir, montar a sílaba, completar a palavra, escrever com o dedo. Dez formatos, porque repetir o mesmo formato vira automatismo, não leitura.' },
            { i: '↻', t: 'Revisão no dia certo',
              b: 'O que você errou volta. O que você acertou de primeira volta menos. É repetição espaçada, feita por letra e por habilidade.' },
            { i: '✍', t: 'Escrita no celular',
              b: 'Você traça a letra com o dedo, na ordem certa dos traços, e a tela não sai do lugar enquanto você escreve.' },
            { i: '◎', t: 'O mapa inteiro visível',
              b: 'Sete módulos, sempre à vista. Você sabe onde está, o que falta e o que vem depois.' },
            { i: '◆', t: 'Sequência e conquistas',
              b: 'Marca os dias seguidos sem te punir por faltar. Perder um dia não zera nada — isso afasta adulto.' },
            { i: '★', t: 'Exame e certificado',
              b: 'No fim, um exame em cinco partes com nota por parte. Passou, sai um certificado com o seu nome, para compartilhar.' }
          ].map(x => (
            <li key={x.t}>
              <Card className="p-5 grid gap-2 h-full content-start">
                <span aria-hidden className="text-[18px] text-[var(--teal-band)]">{x.i}</span>
                <h3 className="font-display text-[16.5px] font-bold text-ink">{x.t}</h3>
                <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">{x.b}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── a trilha ────────────────────────────────────────────────── */}
      <Section labelledBy="trilha">
        <SectionHead
          id="trilha"
          eyebrowPt="A trilha"
          titlePt="Uma conta, o hebraico inteiro."
          leadPt="Começa na alfabetização e continua na mesma conta, no mesmo lugar, com o mesmo progresso."
        />
        <CourseShelf />
      </Section>

      {/* ── preço ───────────────────────────────────────────────────── */}
      <Section tone="wash" labelledBy="preco">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
          <div className="grid gap-4">
            <SectionHead
              id="preco"
              eyebrowPt="Comece por aqui"
              titlePt={c.titlePt}
              leadPt={c.taglinePt}
            />
            <ul className="grid gap-2.5 list-none p-0 m-0">
              {c.outcomesPt.map(o => (
                <li key={o} className="flex gap-3">
                  <span aria-hidden className="text-[var(--teal-band)] text-[14px] mt-[3px]">✓</span>
                  <span className="font-ui text-[14.5px] leading-relaxed text-ink-body">{o}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card className="p-6 grid gap-4 content-start">
            <Badge tone="teal">Curso {c.code}</Badge>
            <div className="grid gap-1">
              {c.price.listBrl && (
                <p className="font-ui text-[14px] text-ink-muted line-through">
                  {brl(c.price.listBrl)}
                </p>
              )}
              <p className="font-display text-[38px] font-bold text-ink leading-none">
                {brl(c.price.brl)}
              </p>
              <p className="font-ui text-[13.5px] text-ink-body">
                ou {parcela.n}x de {brl(parcela.brl)} sem juros
              </p>
              {c.price.pixDiscountPct > 0 && (
                <p className="font-ui text-[13.5px] text-[var(--teal-band)] font-medium">
                  {brl(pixPrice(c.price))} no PIX ({c.price.pixDiscountPct}% de desconto)
                </p>
              )}
            </div>
            <LinkButton href={`/cursos/${c.slug}`} size="lg" full>Ver o curso</LinkButton>
            <ul className="grid gap-1.5 list-none p-0 m-0 font-ui text-[13px] text-ink-muted">
              <li>Acesso por {c.accessMonths} meses, a partir da compra.</li>
              <li>Liberado automaticamente assim que o pagamento cai.</li>
              <li>Funciona no celular, no tablet e no computador.</li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* ── última chamada ──────────────────────────────────────────── */}
      <Section labelledBy="final">
        <Card tone="wash" className="p-8 sm:p-12 grid gap-5 justify-items-center text-center">
          <div className="flex gap-3">
            {['א', 'ב', 'ג', 'ד', 'ה'].map(l => <He key={l} size="lg" dim>{l}</He>)}
          </div>
          <h2 id="final" className="font-display text-[26px] sm:text-[32px] font-bold leading-tight text-ink max-w-[20ch]">
            A primeira letra leva dez minutos.
          </h2>
          <p className="font-ui text-[15.5px] leading-relaxed text-ink-body max-w-[46ch]">
            Depois dela você já não olha para o alfabeto do mesmo jeito. É esse o
            objetivo do primeiro dia — e o resto do curso é feito para o segundo.
          </p>
          <LinkButton href={primary.href} size="lg">{primary.label}</LinkButton>
          <p className="font-ui text-[13px] text-ink-muted">
            Já é aluno?{' '}
            <Link href="/entrar" className="text-[var(--teal-band)] hover:underline">Entrar na sua conta</Link>
          </p>
        </Card>
      </Section>
    </>
  );
}
