import type { Metadata } from 'next';
import { TrilhaNoTopo } from '@/components/portal/Migalhas';
import { meta } from '@/lib/seo';
import { He } from '@/components/hebrew/He';
import Link from 'next/link';
import { Itens, Section, SectionHead } from '@/components/platform/Section';
import { empresa } from '@/lib/empresa';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { totalLicoes } from '@/lib/content-publico';
import { METODO_ORIGINAL } from '@/lib/credito';
import { primeiroQueExiste } from '@/lib/midia-publica';
import { Trajetoria } from '@/components/landing/Trajetoria';
import { tx } from '@/i18n/telas/venda-sobre';

/* O retrato é o MESMO arquivo da capa, achado do mesmo jeito: olhando o disco
   na hora da build. Uma página de servidor pode fazer isso - por isso esta
   continua sem 'use client'. Sem o arquivo, o lugar mostra a marca, e nunca
   um aviso interno para quem está decidindo comprar. */
const RETRATO = ['media/moshik.avif', 'media/moshik.webp', 'media/moshik.jpg'];

export const metadata: Metadata = meta({
  rota: '/sobre',
  title: tx.metaTitulo,
  description: tx.metaDescricao
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
      <TrilhaNoTopo trilha={[{ nome: tx.trilha }]} />
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
          eyebrowPt={tx.porqueEyebrow}
          titlePt={tx.porqueTitulo}
          leadPt={tx.porqueLead}
        />
        <Itens colunas={3} itens={[
            {
              t: tx.umaT,
              b: tx.umaB
            },
            {
              t: tx.apoioT,
              b: tx.apoioB
            },
            {
              t: tx.retornoT,
              b: tx.retornoB
            }
                  ]} />
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
          eyebrowPt={tx.origemEyebrow}
          titlePt={tx.origemTitulo}
          leadPt={tx.origemLead}
        />
        {/* Duas colunas abertas, sob o mesmo fio: o que é adaptação e de onde
            vem o método têm o mesmo peso, e nenhum dos dois é um produto. */}
        <div className="grid gap-10 sm:gap-12 sm:grid-cols-2">
          <div className="grid gap-3 content-start border-t border-line pt-6">
            <h3 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink m-0">{tx.adaptacaoTitulo}</h3>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              {tx.adaptacaoTexto}
            </p>
          </div>
          <div className="grid gap-3 content-start border-t-2 border-[var(--teal)] pt-6">
            <h3 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink m-0">{tx.deOndeTitulo}</h3>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              {tx.deOndeTexto(
                METODO_ORIGINAL.autor,
                <He size="inline">{METODO_ORIGINAL.obraHe}</He>,
                METODO_ORIGINAL.obraTranslit,
                METODO_ORIGINAL.adaptacoesPt
              )}
            </p>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              {tx.licoesImpressas(totalLicoes())}
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <FaixaCta
          onde="sobre"
          titulo={tx.ctaTitulo}
          linha={tx.ctaLinha(empresa.contato.emailSuporte)}
        >
          {/* Link e não um segundo botão branco: sobre o navy, dois botões
              iguais empatavam, e o passo principal é o de baixo. */}
          <Link href="/faq"
                className="inline-flex items-center min-h-[44px] font-ui text-[16px] font-semibold text-white
                           underline underline-offset-[4px] decoration-white/45 hover:decoration-white">
            {tx.verDuvidas}
          </Link>
        </FaixaCta>
      </Section>
    </>
  );
}
