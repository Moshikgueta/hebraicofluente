'use client';

/* A porta da frente.
 *
 * 30/09/2026, decisão do dono: a capa tinha 19 seções e 22.650 px no celular,
 * com o preço a 17.000 px de rolagem. Saíram as sete que repetiam outra
 * (Transformação, Problema, Demonstração, Recursos, AulaAmostra, Jornada e
 * AlemDoAlfabeto): ficou com 12 seções e cerca de 14.500 px. Os componentes
 * continuam em components/landing/ para voltar, se um dia fizer falta.
 * ─────────────────────────────────────────────────────────────────────────
 * Uma página de venda para adulto brasileiro que já tentou aprender hebraico
 * e parou. Três coisas ela faz e uma ela não faz.
 *
 * Faz: responde logo na segunda seção o que se aprende e os dois "nada
 * de", mostra hebraico de verdade na tela - e deixa a pessoa RESPONDER
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
import { Metodo, Curriculo } from '@/components/landing/Secoes';
import { Promessa } from '@/components/landing/Promessa';
import { DemoAlef } from '@/components/landing/DemoAlef';
import { OuvirEFalar } from '@/components/landing/OuvirEFalar';
import { Decisoes } from '@/components/landing/Decisoes';
import { BarraFixa } from '@/components/landing/BarraFixa';
import {
  Professor, Depoimentos, Preco, Faq, CtaFinal
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

  return (
    <>
      <Hero
        primaryHref={passo.href}
        /* O rótulo do hero é o único da página que fala em PRIMEIRA PESSOA.
           A regra de quem recebe qual oferta continua em lib/cta.ts - um
           aluno pagante segue lendo "Continuar de onde parei" -, e o que
           muda aqui é só a voz do botão para quem ainda não comprou: na
           primeira dobra ele é a resposta do visitante à promessa logo
           acima, e não uma instrução do site para ele. */
        primaryLabel={passo.vende ? 'Comece do zero e leia suas primeiras palavras em hebraico' : passo.label}
        /* O teste A/B do hero (lib/ab.ts): só para quem ainda pode comprar. */
        testeAB={passo.vende}
        primaryMicro={passo.micro}
        secondaryHref="#experimente"
        midia={midia}
      />
      {/* A explicação que o hero deixou de carregar (28/09/2026): o que se
          aprende e os dois "nada de". Ver Promessa.tsx. */}
      <Promessa />
      {/* A ordem da narrativa, e por que ela é esta.
          ──────────────────────────────────────────────────────────────────
          A promessa do hero cria uma dúvida ("será que EU consigo?"), e a
          página responde antes de qualquer outra coisa com a aula aberta, onde a pessoa aprende
          o Álef de verdade. Tudo o que vem depois - o método, o currículo, o
          professor, o preço - é lido por alguém que já provou a si mesmo que
          consegue, o que é uma pessoa diferente da que chegou.

          As três decisões pedagógicas ficam logo abaixo da demo, e nessa
          ordem de propósito: elas AFIRMAM o que a demo acabou de FAZER. Na
          ordem inversa seriam três promessas à espera de prova. */}
      <DemoAlef href={comprar} micro={passo.micro} label={passo.label} vende={passo.vende} />
      {/* Logo depois da aula aberta: o Álef não tem som, e esta seção mostra
          o resto - ouvir o professor e ser corrigido falando. */}
      <OuvirEFalar />
      <Decisoes />
      <Metodo />
      <Curriculo />
      <Professor retrato={retrato} />
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
