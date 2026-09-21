'use client';

/* A porta da frente, nas catorze seções do design.
 * ─────────────────────────────────────────────────────────────────────────
 * Uma página de venda para adulto brasileiro que já tentou aprender hebraico
 * e parou. Três coisas ela faz e uma ela não faz.
 *
 * Faz: nomeia a objeção real logo na segunda seção ("as letras parecem todas
 * iguais"), mostra hebraico de verdade na tela - e deixa a pessoa RESPONDER
 * uma questão - antes de pedir qualquer coisa, e diz o preço sem obrigar a
 * clicar para descobrir.
 *
 * Não faz: contagem regressiva, "restam 3 vagas", preço riscado, depoimento
 * inventado. Não porque seja feio - porque é mentira, e porque o produto aqui
 * é um curso que a pessoa vai usar por meses. Quem compra por pressão pede
 * reembolso.
 *
 * Os números vêm do catálogo e do curso construído, nunca escritos à mão: uma
 * landing que promete "14 lições" quando o curso tem outra quantidade é um
 * processo do Procon esperando acontecer. É também por isso que as seções
 * ficam em components/landing/ e não num arquivo só: cada uma lê os seus
 * próprios dados.
 */

import { Hero } from '@/components/landing/Hero';
import { Problema, Demonstracao, Metodo, Curriculo, Jornada } from '@/components/landing/Secoes';
import { Transformacao } from '@/components/landing/Transformacao';
import { AlemDoAlfabeto } from '@/components/landing/AlemDoAlfabeto';
import { BarraFixa } from '@/components/landing/BarraFixa';
import {
  Professor, Recursos, AulaAmostra, Depoimentos, Preco, Faq, CtaFinal
} from '@/components/landing/Fecho';
import { FLAGSHIP } from '@/lib/catalog';
import { useAccount } from '@/lib/account/store';
import { proximoPasso } from '@/lib/cta';
import type { HeroMedia } from '@/components/landing/media';

export function HomeClient({ midia, retrato }: { midia: HeroMedia; retrato: string | null }) {
  const account = useAccount();

  /* Um aluno que já entrou não deve ser mandado para o checkout pela própria
     capa do site dele. A regra de quem recebe qual oferta mora em lib/cta.ts,
     porque ela vale também no fim de /metodo, de /faq e do curso - e escrita
     em cada tela ela se contradiz na terceira. */
  const passo = proximoPasso(account);
  const comprar = passo.href;
  const curso = `/cursos/${FLAGSHIP}`;

  return (
    <>
      <Hero
        primaryHref={passo.href}
        primaryLabel={passo.label}
        primaryMicro={passo.micro}
        secondaryHref="#curso"
        midia={midia}
      />
      <Transformacao />
      <Problema />
      <Demonstracao />
      <Metodo />
      <Curriculo />
      <Jornada />
      <Professor retrato={retrato} />
      <Recursos />
      <AulaAmostra href={curso} />
      <AlemDoAlfabeto />
      <Depoimentos />
      <Preco href={comprar} label={passo.label} owned={account.ready && account.can(FLAGSHIP)} />
      <Faq />
      <CtaFinal href={comprar} label={passo.label} />
      {/* Só para quem ainda pode comprar. `vende` é a mesma regra que decide
          os outros botões - um aluno pagante não recebe uma faixa de preço
          colada no rodapé do site dele. */}
      {passo.vende && <BarraFixa href={comprar} label={passo.label} />}
    </>
  );
}
