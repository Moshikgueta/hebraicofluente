import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { He } from '@/components/hebrew/He';
import { Itens, PageHead, Section, SectionHead } from '@/components/platform/Section';
import { Rubrica } from '@/components/landing/base';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { course, totalLicoes } from '@/lib/content-publico';
import { ETAPAS_DA_LICAO, quantasEtapasPt } from '@/lib/etapas-da-licao';

export const metadata: Metadata = meta({
  rota: '/metodo',
  title: 'Como aprender a ler hebraico: o método - Hebraico Fluente',
  description:
    'Uma letra por vez, na ordem que rende mais; nada de palavra com letra que você ' +
    'ainda não viu; revisão no dia certo; e a transliteração sai de propósito.'
});

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
      <PageHead
        eyebrowPt="O método"
        titlePt={`${quantasEtapasPt()} etapas em toda lição, e uma regra que sustenta todas.`}
        leadPt="Não é método novo nem segredo de ninguém. É um conjunto pequeno de decisões, tomadas de propósito, e mantidas mesmo quando dão trabalho."
      />

      {/* A regra que sustenta tudo, sozinha, antes das outras. O exemplo
          (מַיִם, lição 3) vai numa lâmina como a do hero da capa: é a palavra
          que prova a regra, e merece ser vista como objeto, não como nota. */}
      <Section labelledBy="regra">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div className="grid gap-5 content-start">
            <Rubrica>A regra número um</Rubrica>
            <h2 id="regra" className="font-display font-semibold text-[clamp(28px,3.4vw,40px)] leading-[1.08]
                                      tracking-[-0.03em] text-ink max-w-[22ch] m-0">
              Você nunca vê uma palavra com uma letra que ainda não aprendeu.
            </h2>
            <p className="font-ui text-[16.5px] leading-[1.65] text-ink-body max-w-[60ch] m-0">
              Parece óbvio. Quase nenhum curso faz. É comum a lição 2 trazer
              שָׁלוֹם como exemplo - quatro letras e um sinal que você ainda não
              tem. O efeito é sempre o mesmo: em vez de ler, você decora a forma
              inteira como se fosse um desenho, e a leitura nunca começa.
            </p>
            <p className="font-ui text-[16.5px] leading-[1.65] text-ink-body max-w-[60ch] m-0">
              Aqui isso não é um cuidado editorial, é uma trava no programa. Cada
              letra carrega a lista exata de sinais que já foram ensinados, e o
              gerador de exercícios só pode usar aquela lista - inclusive nas
              alternativas erradas. Um exercício fora da regra não chega ao ar
              porque a verificação automática não deixa a versão subir.
            </p>
          </div>
          <figure className="m-0 rounded-[20px] bg-[var(--card)] overflow-hidden
                             shadow-[0_0_0_1px_var(--line),0_2px_4px_rgba(27,33,31,.04),0_30px_60px_-30px_rgba(14,59,67,.3)]">
            <div className="flex items-baseline justify-between gap-4 px-5 sm:px-6 py-4 border-b border-line">
              <span className="font-ui text-[12px] font-semibold uppercase tracking-[.12em] text-ink-muted">Lição 3</span>
              <span className="font-ui text-[12px] font-semibold uppercase tracking-[.12em] text-[var(--teal-ink)]">máyim · água</span>
            </div>
            <div className="grid place-items-center bg-[var(--sand)] py-10 sm:py-14 select-none">
              <He size="display" tone="navy">מַיִם</He>
            </div>
            <figcaption className="px-5 sm:px-6 py-4 border-t border-line font-ui text-[14.5px] leading-[1.5] text-ink-body">
              Três letras, dois sinais - e todos já ensinados. Por isso ela pode
              aparecer tão cedo: ela é legível, não decorável.
            </figcaption>
          </figure>
        </div>
      </Section>

      <Section tone="surface" labelledBy="outras">
        <SectionHead id="outras" eyebrowPt="As outras decisões" titlePt="Por que a lição é assim." />
        <Itens inicio={2} itens={[
            {
              t: 'A ordem é por utilidade, não pelo alfabeto',
              b: `As letras não vêm de א a ת. Vêm na ordem que abre mais palavras mais cedo - por isso a terceira lição já lê uma palavra inteira em vez de ainda estar na segunda letra. São ${letterModules} módulos de letras, em ${totalLicoes()} lições.`
            },
            {
              t: 'As letras parecidas são tratadas de frente',
              b: 'ב e כ, ד e ר, ה e ח. Em vez de esperar a confusão aparecer, o curso apresenta o par lado a lado, mostra o que diferencia e depois te obriga a escolher entre os dois. Quando você erra um par, ele volta mais vezes.'
            },
            {
              t: 'A revisão é por habilidade, não por lição',
              b: 'Reconhecer a forma, saber o som, ler a sílaba, ouvir e escrever são cinco coisas diferentes. O curso guarda as cinco separadas por letra, e a revisão traz de volta exatamente a que está fraca - não a lição inteira de novo.'
            },
            {
              t: 'A transliteração sai',
              b: 'Enquanto houver "shalóm" embaixo da palavra, você lê o português. O curso usa transliteração no começo e a retira de propósito, em etapas anunciadas, até você estar lendo sem apoio nenhum - que é a única definição de ler.'
            }
          ]} />
      </Section>

      <Section labelledBy="aula">
        <SectionHead
          id="aula"
          eyebrowPt="Uma lição por dentro"
          titlePt={`Dez minutos, ${quantasEtapasPt().toLowerCase()} etapas.`}
          leadPt="Toda lição de letra tem a mesma forma, com estas abas, nesta ordem. A previsibilidade é de propósito: você nunca precisa descobrir como a tela funciona antes de aprender a letra."
        />
        {/* As etapas são as abas da lição (lib/etapas-da-licao.ts): a capa
            conta a mesma lista, com os mesmos nomes (auditoria, CONV-010). */}
        <Itens colunas={5} itens={ETAPAS_DA_LICAO.map(({ aba, descricaoPt }) => ({ t: aba, b: descricaoPt }))} />
      </Section>

      <Section>
        <FaixaCta
          onde="metodo"
          titulo="O método só existe na prática."
          linha="A primeira letra leva dez minutos e responde melhor do que esta página."
        />
      </Section>
    </>
  );
}
