'use client';

/* "Comece aqui": a página do link da bio do Instagram (24/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Quem toca no link da bio chegou por um post qualquer: as letras, o Mar
 * Morto, o e-book. Antes, todos caíam no teste grátis da página de venda, e
 * quem veio por Israel não achava o que foi buscar. Aqui a pessoa escolhe,
 * em um toque, entre os dois caminhos que existem hoje:
 *
 *  - ler hebraico: o teste grátis do Álef (/curso-de-hebraico/#experimente);
 *  - conhecer Israel: a prévia grátis do e-book (/previa/), que segue
 *    "Em breve", sem preço nem compra (o status sai do catálogo).
 *
 * A palavra שָׁלוֹם vem logo abaixo, para quem quer experimentar sem sair.
 * Nenhum hebraico novo: a palavra e a gravação são as da capa.
 *
 * O worker manda a bio para cá com `?parceria=bio`. A página guarda esse
 * nome no aparelho (lib/parceria.ts), e é ele que o pedido grava, para
 * /admin/vendas saber que a compra veio da bio. Contagem: eventos `comece-*`
 * do contador do portal (lib/funil-portal.ts), uma vez por visita.
 */

import Link from 'next/link';
import { useEffect } from 'react';
import { He } from '@/components/hebrew/He';
import { Container, H2, Rubrica } from '@/components/landing/base';
import { BotaoDoCurso } from '@/components/portal/BotaoDoCurso';
import { PalavraDescoberta } from '@/components/portal/PalavraDescoberta';
import { PAGINA_DO_CURSO } from '@/lib/catalog';
import { jornada, jornadaAberta, produtos } from '@/lib/ecossistema';
import { contarNoPortal } from '@/lib/funil-portal';
import { guardarParceriaDaUrl } from '@/lib/parceria';

const TESTE = `${PAGINA_DO_CURSO}/#experimente`;
const PREVIA = '/previa/';

const BOTAO = `inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-[var(--r-md)]
               bg-[var(--navy)] text-white font-ui text-base font-medium shadow-[var(--sh)]
               transition-[background-color,transform] duration-[var(--dur)] ease-[var(--ease)]
               hover:bg-[var(--navy-2)] active:scale-[.98]
               focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]`;
const LINK = `inline-flex items-center gap-1.5 min-h-[44px] font-ui text-[15px] font-semibold
              underline underline-offset-[3px] decoration-[1.5px]`;

export function ComeceAquiClient() {
  useEffect(() => {
    guardarParceriaDaUrl();
    contarNoPortal('comece-visto');
  }, []);

  const livro = produtos().find(p => p.id === 'israel-alem-do-roteiro');
  const hebraico = jornada('hebraico');
  const israel = jornada('israel');

  return (
    <>
      <section aria-labelledby="comece-titulo">
        {/* No telefone (390 x 844) os dois caminhos cabem na primeira tela,
            com o botão de cada um: por isso a abertura é curta e a rubrica
            só aparece a partir de sm. */}
        <Container className="pt-6 pb-10 sm:pt-16 sm:pb-16 grid gap-5 sm:gap-7 max-w-[760px]">
          <div className="grid gap-3 sm:gap-4">
            <div className="hidden sm:block"><Rubrica letra="א">Comece aqui</Rubrica></div>
            <h1 id="comece-titulo"
                className="m-0 font-display font-semibold text-[clamp(28px,6vw,52px)] leading-[1.05]
                           tracking-[-0.03em] text-balance text-ink">
              Shalom! Por onde você quer começar?
            </h1>
            <p className="m-0 font-ui text-[16px] sm:text-[19px] leading-[1.5] text-ink-muted max-w-[46ch]">
              Sou o Moshik, israelense, e ensino hebraico a brasileiros. Escolha o que trouxe você até aqui.
            </p>
          </div>

          <ul className="grid gap-3 sm:gap-4 list-none p-0 m-0">
            <li className="grid gap-3 sm:gap-4 rounded-[18px] border border-[#B9DCD4] bg-[var(--teal-soft)] p-4 sm:p-7">
              <div className="flex items-center gap-3 min-w-0">
                <span aria-hidden className="grid place-items-center w-10 h-10 shrink-0 rounded-[12px] bg-[var(--card)]">
                  <He size="inline" tone="teal">{hebraico.letra}</He>
                </span>
                <h2 className="m-0 min-w-0 font-display text-[21px] sm:text-[24px] font-semibold tracking-[-0.02em] text-ink">
                  Quero ler hebraico
                </h2>
              </div>
              <p className="m-0 font-ui text-[15.5px] sm:text-[16px] leading-[1.5] text-ink-body text-pretty">
                Teste grátis da primeira letra, sem cadastro: você ouve, reconhece e escreve o Álef.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <BotaoDoCurso href={TESTE} className={BOTAO} onClick={() => contarNoPortal('comece-ler')}>
                  Fazer o teste grátis
                  <span aria-hidden>→</span>
                </BotaoDoCurso>
                <Link href={`${PAGINA_DO_CURSO}/`} onClick={() => contarNoPortal('comece-curso')}
                      className={`${LINK} text-[var(--teal-ink)]`}>
                  Ver o curso completo
                </Link>
              </div>
            </li>

            <li className="grid gap-3 sm:gap-4 rounded-[18px] border border-[#EADCC0] bg-[var(--gold-soft)] p-4 sm:p-7">
              <div className="flex items-center gap-3 min-w-0">
                <span aria-hidden className="grid place-items-center w-10 h-10 shrink-0 rounded-[12px] bg-[var(--card)]">
                  <He size="inline" tone="navy">{israel.letra}</He>
                </span>
                <h2 className="m-0 min-w-0 font-display text-[21px] sm:text-[24px] font-semibold tracking-[-0.02em] text-ink">
                  Quero conhecer Israel
                </h2>
              </div>
              <p className="m-0 font-ui text-[15.5px] sm:text-[16px] leading-[1.5] text-ink-body text-pretty">
                Prévia grátis do <strong className="font-semibold">Israel Além do Óbvio</strong>, com atividades
                do livro e sem cadastro.
                {livro?.status === 'em-breve' ? ' O livro sai em breve.' : ''}
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                {/* <a>, e não Link: a prévia é o app do livro, servido à parte,
                    fora das rotas do Next. */}
                <a href={PREVIA} onClick={() => contarNoPortal('comece-israel')} className={BOTAO}>
                  Abrir a prévia
                  <span aria-hidden>→</span>
                </a>
                <Link href={`${israel.rota}/`} className={`${LINK} text-[var(--gold-ink)]`}>
                  {israel.nome}
                </Link>
              </div>
            </li>
          </ul>
        </Container>
      </section>

      <section aria-labelledby="comece-palavra" className="bg-surface-2">
        <Container className="py-12 sm:py-16 grid gap-6 max-w-[760px]">
          <H2 id="comece-palavra" className="m-0">Ou leia uma palavra agora.</H2>
          <PalavraDescoberta
            hrefCurso={`${PAGINA_DO_CURSO}/`}
            contar={g => contarNoPortal(g === 'curso' ? 'comece-curso' : 'comece-palavra')} />
        </Container>
      </section>

      <nav aria-label="Mais do Hebraico Fluente">
        <Container className="py-10 grid gap-3 max-w-[760px]">
          <p className="m-0 font-ui text-[13px] font-semibold uppercase tracking-[.12em] text-ink-muted">
            Também por aqui
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 list-none p-0 m-0">
            <li><Link href={`${jornada('raizes').rota}/`} className={`${LINK} text-ink`}>{jornada('raizes').nome}{jornadaAberta('raizes') ? '' : ' (em breve)'}</Link></li>
            <li><Link href="/sobre/" className={`${LINK} text-ink`}>Quem faz o Hebraico Fluente</Link></li>
            <li><Link href="/" className={`${LINK} text-ink`}>Página inicial</Link></li>
          </ul>
        </Container>
      </nav>
    </>
  );
}
