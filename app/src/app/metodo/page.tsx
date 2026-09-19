import type { Metadata } from 'next';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Section, SectionHead } from '@/components/platform/Section';
import { course } from '@/lib/content';

export const metadata: Metadata = {
  title: 'O método — Hebraico Fluente',
  description:
    'Uma letra por vez, na ordem que rende mais; nada de palavra com letra que você ' +
    'ainda não viu; revisão no dia certo; e a transliteração sai de propósito.'
};

/* O método, explicado de verdade.
 * ─────────────────────────────────────────────────────────────────────────
 * Esta é a página que mais convence, e por um motivo chato: ela é a única do
 * site que explica uma decisão técnica que o concorrente não tomou. Por isso
 * o texto aqui descreve regras REAIS do produto (a regra de ordem, o corte da
 * transliteração, a revisão por habilidade), e não adjetivos.
 *
 * É uma página de servidor: nada aqui depende da conta.
 */

export default function MetodoPage() {
  const letterModules = course.modules.filter(m => m.letterIds.length).length;

  return (
    <>
      <div className="border-b border-[color:var(--line-soft)]">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-14 sm:py-18 grid gap-5">
          <p className="font-ui text-[12px] uppercase tracking-[.14em] text-[var(--accent)]">
            O método
          </p>
          <h1 className="font-display text-[32px] sm:text-[44px] font-bold leading-[1.12] text-ink max-w-[20ch]">
            Cinco regras, e uma delas é a que faz o curso funcionar.
          </h1>
          <p className="text-[17px] leading-relaxed text-ink-body max-w-[58ch]">
            Não é método novo nem segredo de ninguém. É um conjunto pequeno de
            decisões, tomadas de propósito, e mantidas mesmo quando dão trabalho.
          </p>
        </div>
      </div>

      {/* A regra que sustenta tudo, sozinha, antes das outras. */}
      <Section labelledBy="regra">
        <Card tone="wash" className="p-6 sm:p-10 grid gap-5">
          <Badge tone="accent">A regra número um</Badge>
          <h2 id="regra" className="font-display text-[25px] sm:text-[31px] font-bold leading-tight text-ink max-w-[26ch]">
            Você nunca vê uma palavra com uma letra que ainda não aprendeu.
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <p className="font-ui text-[15px] leading-relaxed text-ink-body">
              Parece óbvio. Quase nenhum curso faz. É comum a lição 2 trazer
              שָׁלוֹם como exemplo — quatro letras e um sinal que você ainda não
              tem. O efeito é sempre o mesmo: em vez de ler, você decora a forma
              inteira como se fosse um desenho, e a leitura nunca começa.
            </p>
            <p className="font-ui text-[15px] leading-relaxed text-ink-body">
              Aqui isso não é um cuidado editorial, é uma trava no programa. Cada
              letra carrega a lista exata de sinais que já foram ensinados, e o
              gerador de exercícios só pode usar aquela lista — inclusive nas
              alternativas erradas. Um exercício fora da regra não chega ao ar
              porque a verificação automática não deixa a versão subir.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-6 pt-2">
            <div className="grid gap-1">
              <p className="font-ui text-[12px] uppercase tracking-[.08em] text-ink-muted">Lição 3</p>
              <He size="lg">מַיִם</He>
            </div>
            <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted max-w-[34ch]">
              Três letras, dois sinais — e todos já ensinados. Por isso ela pode
              aparecer tão cedo: ela é legível, não decorável.
            </p>
          </div>
        </Card>
      </Section>

      <Section tone="surface" labelledBy="outras">
        <SectionHead id="outras" eyebrowPt="As outras quatro" titlePt="O resto do método." />
        <ol className="grid gap-4 sm:grid-cols-2 list-none p-0 m-0">
          {[
            {
              n: 2,
              t: 'A ordem é por utilidade, não pelo alfabeto',
              b: `As letras não vêm de א a ת. Vêm na ordem que abre mais palavras mais cedo — por isso a terceira lição já lê uma palavra inteira em vez de ainda estar na segunda letra. São ${letterModules} módulos de letras e ${course.totalLetters} lições.`
            },
            {
              n: 3,
              t: 'As letras parecidas são tratadas de frente',
              b: 'ב e כ, ד e ר, ה e ח. Em vez de esperar a confusão aparecer, o curso apresenta o par lado a lado, mostra o que diferencia e depois te obriga a escolher entre os dois. Quando você erra um par, ele volta mais vezes.'
            },
            {
              n: 4,
              t: 'A revisão é por habilidade, não por lição',
              b: 'Reconhecer a forma, saber o som, ler a sílaba, ouvir e escrever são cinco coisas diferentes. O curso guarda as cinco separadas por letra, e a revisão traz de volta exatamente a que está fraca — não a lição inteira de novo.'
            },
            {
              n: 5,
              t: 'A transliteração sai',
              b: 'Enquanto houver "shalom" embaixo da palavra, você lê o português. O curso usa transliteração no começo e a retira de propósito, em etapas anunciadas, até você estar lendo sem apoio nenhum — que é a única definição de ler.'
            }
          ].map(x => (
            <li key={x.n}>
              <Card className="p-5 grid gap-2 h-full content-start">
                <span aria-hidden
                      className="w-[30px] h-[30px] rounded-full bg-[var(--accent-wash)]
                                 text-[var(--accent)] font-ui text-[13px] font-bold
                                 grid place-items-center tabular-nums">
                  {x.n}
                </span>
                <h3 className="font-display text-[17px] font-bold text-ink">{x.t}</h3>
                <p className="font-ui text-[14px] leading-relaxed text-ink-body">{x.b}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section labelledBy="aula">
        <SectionHead
          id="aula"
          eyebrowPt="Uma lição por dentro"
          titlePt="Dez minutos, cinco etapas."
          leadPt="Toda lição de letra tem a mesma forma. A previsibilidade é de propósito: você nunca precisa descobrir como a tela funciona antes de aprender a letra."
        />
        <ol className="grid gap-3 sm:grid-cols-5 list-none p-0 m-0">
          {[
            ['Conheça', 'A forma, o nome e o som — com o que ela parece e o que ela não é.'],
            ['Escute', 'O som isolado, depois na sílaba, depois na palavra.'],
            ['Leia', 'Sílabas e palavras montadas só com o que você já tem.'],
            ['Escreva', 'Com o dedo na tela, na ordem certa dos traços.'],
            ['Prove', 'Um teste curto. Erro não pune: mostra o porquê e volta depois.']
          ].map(([t, b], i) => (
            <li key={t}>
              <Card className="p-4 grid gap-1.5 h-full content-start">
                <span aria-hidden className="font-ui text-[11px] font-bold tracking-[.1em] text-ink-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-[15.5px] font-bold text-ink">{t}</h3>
                <p className="font-ui text-[13px] leading-relaxed text-ink-body">{b}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="wash">
        <Card className="p-8 grid gap-4 justify-items-center text-center">
          <h2 className="font-display text-[25px] sm:text-[30px] font-bold text-ink max-w-[24ch]">
            O método só existe na prática.
          </h2>
          <p className="font-ui text-[15.5px] leading-relaxed text-ink-body max-w-[48ch]">
            A primeira letra leva dez minutos e responde melhor do que esta página.
          </p>
          <LinkButton href="/cursos/alfabetizacao" size="lg">Ver o curso</LinkButton>
        </Card>
      </Section>
    </>
  );
}
