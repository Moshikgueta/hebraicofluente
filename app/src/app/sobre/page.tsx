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
import { Trajetoria } from '@/components/landing/Trajetoria';

/* O retrato é o MESMO arquivo da capa, achado do mesmo jeito: olhando o disco
   na hora da build. Uma página de servidor pode fazer isso - por isso esta
   continua sem 'use client'. Sem o arquivo, o lugar mostra a marca, e nunca
   um aviso interno para quem está decidindo comprar. */
const RETRATO = ['media/moshik.avif', 'media/moshik.webp', 'media/moshik.jpg'];

export const metadata: Metadata = meta({
  rota: '/sobre',
  title: 'Sobre o Moshik - Hebraico Fluente',
  description:
    'Moshik Gueta, israelense, professor de hebraico e de idiomas: a trajetória no Brasil, em ' +
    'Israel e em Buenos Aires que virou a metodologia do Hebraico Fluente.'
});

/* A trajetória, e o que dela pode ser afirmado.
 * ─────────────────────────────────────────────────────────────────────────
 * A história mora em components/landing/Trajetoria.tsx, e as regras dela
 * estão lá: só entra fato que o Moshik deu (os anos, as instituições, o
 * CELTA, Letras, os cinco idiomas), sem número de alunos e sem promessa que
 * não se demonstra. A capa mostra um resumo (Professor, em Fecho.tsx) com o
 * link para cá - uma biografia, em duas medidas, nunca duas.
 */

export default function SobrePage() {
  const retrato = primeiroQueExiste(RETRATO);
  return (
    <>
      {/* A história inteira (28/09/2026): o mesmo componente que antes
          ocupava a capa, que agora mostra só um resumo com o link para cá.
          Aqui o título é o <h1> da página. */}
      <div className="border-b border-[color:var(--line-soft)]">
        <Trajetoria retrato={retrato} nivel="h1" />
      </div>

      {/* As mesmas três decisões de sempre, contadas do lado do aluno.
          ──────────────────────────────────────────────────────────────────
          Elas nasceram como «três coisas que eu me recusei a fazer», e cada
          cartão abria com um «não». O argumento era bom; o começo, não. Três
          negações seguidas fazem a seção falar dos outros métodos em vez de
          falar do que a pessoa vai viver - e quem está decidindo comprar não
          tem opinião formada sobre os outros métodos.

          A ideia pedagógica de cada uma ficou intacta: progressão gradual,
          retirada gradual da transliteração, correção e autocorreção. A versão
          com demonstração de cada uma mora na capa (components/landing/
          Decisoes.tsx); aqui fica a versão curta. */}
      <Section labelledBy="porque">
        <SectionHead
          id="porque"
          eyebrowPt="Como o curso foi pensado"
          titlePt="Três decisões que tornam o aprendizado mais leve."
          leadPt="Cada parte do curso foi organizada para evitar sobrecarga e deixar você avançar com confiança."
        />
        <ul className="grid gap-4 sm:grid-cols-3 list-none p-0 m-0">
          {[
            {
              t: 'Uma letra de cada vez',
              b: 'Você conhece a letra, pratica com ela e só então avança. O que começa como um alfabeto completamente estranho vai ficando familiar aos poucos - e o que parecia impossível vira uma sequência de passos curtos.'
            },
            {
              t: 'O apoio aparece e depois sai',
              b: 'A transliteração ajuda no começo, e o objetivo nunca foi você depender dela. Ela diminui junto com o seu progresso, com exercícios feitos para cada etapa dessa retirada, até você ler direto do hebraico.'
            },
            {
              t: 'Retorno na hora, em cada passo',
              b: 'Você não precisa esperar por um professor para saber se acertou. Cada exercício corrige na hora, cada erro explica onde olhar, e o exame final vem com gabarito, transcrição e critérios à vista.'
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

      {/* A origem do método, ENCOLHIDA - e o porquê.
          ──────────────────────────────────────────────────────────────────
          Isto ocupava duas seções inteiras: uma sobre o material impresso de
          origem e outra, em duas colunas com cartão destacado, sobre o método
          do autor. Somadas, davam mais espaço à procedência do que à pessoa
          que ensina - e a pergunta que traz alguém a esta página é «por que
          eu aprenderia com ele?», não «de onde veio a bibliografia».

          Encolher não é apagar. O crédito continua aqui por inteiro, com o
          nome do autor e o título da obra em hebraico, porque o caminho que
          este curso segue não foi inventado aqui e quem o criou tem nome -
          e `check-legal.mjs` confere que esta página continua nomeando os
          dois. O que sai é o peso visual, não a informação.

          E o enquadramento mudou junto: o que esta plataforma oferece é uma
          ADAPTAÇÃO - princípios de aprendizagem de idiomas que já existiam,
          mais o que o Moshik viu ensinando brasileiros. Apresentá-la como
          uma ciência nova inventada do zero seria uma afirmação que ninguém
          pediu e que não se sustenta. */}
      <Section tone="surface" labelledBy="metodo-origem">
        <SectionHead
          id="metodo-origem"
          eyebrowPt="O método"
          titlePt="Um método adaptado para brasileiros."
          leadPt="Princípios consolidados de aprendizagem de idiomas, mais o que eu aprendi ensinando hebraico a quem fala português."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5 grid gap-2.5 content-start">
            <h3 className="font-display text-[16.5px] font-bold text-ink">O que é adaptação minha</h3>
            <p className="font-ui text-[14px] leading-relaxed text-ink-body">
              A sequência em que as letras entram, o ritmo com que a transliteração se
              retira, os tipos de exercício e as explicações foram organizados pensando
              nas dificuldades de quem parte do português - as comparações com os nossos
              sons, os erros que só um brasileiro comete, e tudo o que acontece na tela.
            </p>
          </Card>
          <Card tone="wash" className="p-5 grid gap-2.5 content-start">
            <h3 className="font-display text-[16.5px] font-bold text-ink">De onde vem o método</h3>
            <p className="font-ui text-[14px] leading-relaxed text-ink-body">
              O caminho que este curso segue parte do método do{' '}
              {METODO_ORIGINAL.autor}, autor de{' '}
              <He size="inline">{METODO_ORIGINAL.obraHe}</He>{' '}
              ({METODO_ORIGINAL.obraTranslit}). O conteúdo do livro dele é a base do que a
              plataforma ensina.
            </p>
            <p className="font-ui text-[14px] leading-relaxed text-ink-body">
              As {totalLicoes()} lições, as palavras de cada letra e os exercícios vieram
              de material impresso e passaram para a plataforma pela mesma fonte: se uma
              palavra muda, muda nos dois.
            </p>
          </Card>
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
