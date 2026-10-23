'use client';

/* A capa: o portal das três jornadas (23/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Decisão do dono (master prompt "Hebraico Fluente 2.0"): a capa deixa de ser
 * a página de venda de um curso e passa a ser a porta de entrada de três
 * caminhos - aprender hebraico, descobrir Israel, explorar raízes
 * sefarditas. A página de venda do curso continua inteira, em
 * /curso-de-hebraico, e é para lá que vão os links de campanha.
 *
 * O que esta página faz, em ordem: diz o que é o Hebraico Fluente; deixa a
 * pessoa escolher a jornada; mostra o que existe em cada uma, com o status
 * de verdade (lib/ecossistema.ts lê do catálogo); deixa ler uma palavra de
 * verdade; apresenta quem faz; e fecha com um convite só.
 *
 * O que ela não faz: preço riscado, contagem regressiva, número de alunos,
 * depoimento inventado, artigo de blog que não existe, produto "em breve"
 * com botão de compra. O e-book e o Raízes aparecem "Em breve", sem preço e
 * sem checkout, até o contador e o advogado liberarem (decisão de 23/10/2026).
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Container, H2, Lead, Rubrica } from '@/components/landing/base';
import { Emblema } from '@/components/portal/Emblemas';
import { PalavraDescoberta } from '@/components/portal/PalavraDescoberta';
import { SeloDoStatus } from '@/components/portal/Jornada';
import { useAccount } from '@/lib/account/store';
import { brl, fimDoPreLancamento, FLAGSHIP, flagship } from '@/lib/catalog';
import { proximoPasso } from '@/lib/cta';
import { empresa } from '@/lib/empresa';
import {
  JORNADAS, produtos, vendavel, type Jornada, type Produto
} from '@/lib/ecossistema';
import { contarNoPortal, type EventoDoPortal } from '@/lib/funil-portal';
import { precoDeVitrine } from '@/lib/vitrine';
import { oEssencialDoCurso } from '@/lib/inclui';
import { DEPOIMENTOS } from '@/lib/testimonials';
import { FATOS_DO_AUTOR } from '@/lib/autor';

/* O tom de cada jornada: três mundos da mesma marca. Tinta e fundo vêm dos
   tokens (globals.css), nunca de cor solta. */
const TOM: Record<Jornada['id'], { fundo: string; tinta: string; fio: string; selo: string }> = {
  hebraico: { fundo: 'bg-[var(--teal-soft)]', tinta: 'text-[var(--teal-ink)]', fio: 'border-[#B9DCD4]', selo: 'Letras' },
  israel:   { fundo: 'bg-[var(--gold-soft)]', tinta: 'text-[var(--gold-ink)]', fio: 'border-[#EADCC0]', selo: 'Lugares' },
  raizes:   { fundo: 'bg-[var(--sand)]',      tinta: 'text-[var(--navy)]',     fio: 'border-[#D8D8D4]', selo: 'Memória' }
};

const VISTO = 'hf-portal-visto';

export function PortalClient({ retrato }: { retrato: string | null }) {
  const account = useAccount();
  const passo = proximoPasso(account);
  const jaEhAluno = account.ready && account.can(FLAGSHIP);

  useEffect(() => { contarNoPortal('visto'); }, []);

  return (
    <>
      <Abertura jaEhAluno={jaEhAluno} continuar={passo} />
      <Jornadas />
      <EmDestaque jaEhAluno={jaEhAluno} />
      <Experimente />
      <QuemFaz retrato={retrato} />
      <Caminhos />
      <Transparencia />
      <Fecho />
    </>
  );
}

/* ── 1 · a abertura ─────────────────────────────────────────────────────── */
function Abertura({ jaEhAluno, continuar }: {
  jaEhAluno: boolean; continuar: ReturnType<typeof proximoPasso>;
}) {
  /* A entrada (menos de meio segundo, só opacidade e translação) acontece uma
     vez por sessão, como no hero da página do curso. Movimento reduzido: nada
     se move. */
  const [entrou, setEntrou] = useState(true);
  useEffect(() => {
    try {
      if (sessionStorage.getItem(VISTO)) return;
      sessionStorage.setItem(VISTO, '1');
    } catch { return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setEntrou(false);
    const t = window.setTimeout(() => setEntrou(true), 30);
    return () => window.clearTimeout(t);
  }, []);
  /* O atraso de cada peça vai no `style`: uma classe montada com o número
     dentro não existe para o Tailwind, que só gera o que lê no código. */
  const entrada = (atraso: number) => ({
    className: `transition-[opacity,transform] duration-[420ms] ease-[var(--ease)] ${entrou ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[10px]'}`,
    style: { transitionDelay: `${atraso}ms` }
  });

  return (
    <section aria-labelledby="portal-titulo" className="relative overflow-hidden">
      <Container className="pt-8 pb-12 sm:pt-20 sm:pb-24 grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] items-center">
        <div className="grid gap-6 min-w-0">
          <div {...entrada(0)}>
            <Rubrica letra="א">Hebraico Fluente</Rubrica>
          </div>
          {/* A abertura B, escolhida pelo dono em 23/10/2026: diz em cinco
              segundos o que o site oferece (ler hebraico) e por onde começar,
              e nomeia as outras duas jornadas sem prometer data. */}
          {/* O título e o parágrafo não entram animados: esconder o texto
              até o JavaScript chegar adiava a maior pintura da página (LCP)
              para depois da hidratação, 3,9 s no Lighthouse de celular. */}
          <h1 id="portal-titulo"
              className="m-0 font-display font-semibold text-[clamp(36px,6vw,64px)] leading-[1.02]
                          tracking-[-0.035em] text-balance text-ink">
            Aprenda a ler hebraico.
            {/* Semibold como a primeira linha (23/10/2026): o peso 500 só existia
                aqui e era mais um arquivo de fonte antes da primeira pintura. A
                hierarquia fica no tamanho e na cor. */}
            <span className="block mt-2 text-[.56em] leading-[1.15] tracking-[-0.02em] font-semibold text-ink-body">
              Depois, descubra Israel e as raízes sefarditas.
            </span>
          </h1>
          <p className="m-0 font-ui text-[17px] sm:text-[20px] leading-[1.55] text-ink-muted max-w-[46ch]">
            Um curso para brasileiros começarem do zero, letra por letra, e conteúdos sobre Israel e a
            história sefardita que chegam em breve.
          </p>
          <div style={entrada(180).style} className={`flex flex-wrap items-center gap-3 pt-1 ${entrada(180).className}`}>
            {/* No telefone a escolha da jornada está logo abaixo (Atalhos), e
                este botão só repetiria a lista: ele aparece a partir de lg. */}
            <a href="#jornadas" onClick={() => contarNoPortal('cta-explorar')}
               className="hidden lg:inline-flex items-center justify-center gap-2 min-h-[56px] px-7 rounded-[var(--r-md)]
                          bg-[var(--navy)] text-white font-ui text-base font-medium shadow-[var(--sh)]
                          transition-[background-color,transform] duration-[var(--dur)] ease-[var(--ease)]
                          hover:bg-[var(--navy-2)] hover:-translate-y-[2px] active:translate-y-0">
              Explore as experiências
              <span aria-hidden>↓</span>
            </a>
            {/* Para quem já é aluno, o segundo botão é a volta ao curso
                (lib/cta.ts), e não uma oferta do que já comprou. */}
            <Link href={jaEhAluno ? continuar.href : '/curso-de-hebraico'}
                  onClick={() => { if (!jaEhAluno) contarNoPortal('cta-curso'); }}
                  className="inline-flex items-center justify-center gap-2 min-h-[56px] px-6 rounded-[var(--r-md)]
                             bg-[var(--navy)] text-white lg:bg-[var(--card)] lg:text-ink border border-transparent lg:border-line
                             font-ui text-base font-medium
                             transition-[border-color,background-color,transform] duration-[var(--dur)] ease-[var(--ease)]
                             hover:bg-[var(--navy-2)] lg:hover:bg-[var(--card)] lg:hover:border-[#C9C3B4] hover:-translate-y-[2px] active:translate-y-0">
              {jaEhAluno ? continuar.label : 'Comece pelo hebraico'}
            </Link>
          </div>
          <div style={entrada(240).style} className={`lg:hidden ${entrada(240).className}`}>
            <Atalhos />
          </div>
        </div>

        {/* A mesa: as três jornadas como três folhas sobre a mesa, uma por
            cima da outra. Ilustração; o conteúdo de cada uma está logo abaixo. */}
        {/* Só a partir de lg: no telefone a mesa empurrava as jornadas para
            baixo da primeira tela, e no lugar dela ficam os Atalhos. */}
        <div aria-hidden style={entrada(240).style}
             className={`hidden lg:block relative mx-auto w-full max-w-[520px] aspect-[5/4] ${entrada(240).className}`}>
          <Folha jornada="israel"   className="absolute left-[2%] top-[4%] w-[62%] -rotate-[5deg]" />
          <Folha jornada="raizes"   className="absolute right-[0%] top-[18%] w-[58%] rotate-[4deg]" />
          <Folha jornada="hebraico" className="absolute left-[16%] bottom-[0%] w-[64%] -rotate-[1.5deg]" />
          {/* O Álef, grande, por cima de tudo: a primeira letra do curso. */}
          <span className="absolute right-[6%] bottom-[6%] grid place-items-center w-[96px] h-[96px] sm:w-[112px] sm:h-[112px]
                           rounded-[24px] bg-[var(--navy)] shadow-[0_18px_40px_-18px_rgba(6,42,48,.6)]">
            <He size="xl" tone="paper" className="leading-none">א</He>
          </span>
        </div>
      </Container>
    </section>
  );
}

/** O que está aberto e o que não está, contado: "2 experiências" numa
 *  jornada com uma só à venda prometia o dobro. */
function situacaoDa(id: Jornada['id']): string {
  const daqui = produtos().filter(p => p.jornada === id);
  const abertos = daqui.filter(vendavel).length;
  return abertos === 0
    ? 'Em breve, sem data marcada'
    : abertos === daqui.length
      ? 'Disponível agora'
      : `${abertos} disponível agora · ${daqui.length - abertos} em desenvolvimento`;
}

/* No telefone, as três jornadas já na primeira tela (390 x 844): uma linha
   cada, com a letra, o nome e o que existe. Os cartões completos vêm logo
   depois, em #jornadas. */
function Atalhos() {
  return (
    <nav aria-label="As três jornadas" data-a11y-desvia className="grid gap-2.5 pt-2">
      <p className="m-0 font-ui text-[12.5px] font-semibold uppercase tracking-[.12em] text-ink-muted">
        Escolha por onde começar
      </p>
      <ul className="grid gap-2 list-none p-0 m-0">
        {JORNADAS.map(j => {
          const t = TOM[j.id];
          return (
            <li key={j.id}>
              <Link href={j.rota} onClick={() => contarNoPortal(`jornada-${j.id}` as EventoDoPortal)}
                    className={`grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 min-h-[60px] px-3 py-2
                                rounded-[14px] border ${t.fio} ${t.fundo} transition-[scale] duration-150 active:scale-[.98]`}>
                <span aria-hidden className="grid place-items-center w-10 h-10 rounded-[10px] bg-[var(--card)]">
                  <He size="inline" tone={j.id === 'hebraico' ? 'teal' : 'navy'}>{j.letra}</He>
                </span>
                <span className="grid min-w-0">
                  <span className="font-display text-[17px] font-semibold leading-tight text-ink">{j.nome}</span>
                  <span className="font-ui text-[13px] text-ink-muted">{situacaoDa(j.id)}</span>
                </span>
                <span aria-hidden className={`font-ui text-[18px] ${t.tinta}`}>→</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Folha({ jornada, className = '' }: { jornada: Jornada['id']; className?: string }) {
  const t = TOM[jornada];
  return (
    <div className={`rounded-[14px] border ${t.fio} ${t.fundo} ${t.tinta} p-3 sm:p-4
                     shadow-[0_14px_34px_-22px_rgba(6,42,48,.45)] ${className}`}>
      <Emblema jornada={jornada} />
      <p className="m-0 mt-2 font-ui text-[11.5px] font-semibold uppercase tracking-[.12em]">{t.selo}</p>
    </div>
  );
}

/* ── 2 · escolha sua jornada ────────────────────────────────────────────── */
function Jornadas() {
  return (
    <section id="jornadas" aria-labelledby="jornadas-titulo" className="scroll-mt-20 bg-surface-2">
      {/* `minmax(0,1fr)`: com o texto em 150% no telefone, "sefarditas" não
          cabe e a coluna crescia 8px para fora da tela (a11y.mjs). */}
      <Container className="py-16 sm:py-24 grid grid-cols-[minmax(0,1fr)] gap-10">
        <div className="grid gap-4">
          <Rubrica letra="ב">Escolha sua jornada</Rubrica>
          <H2 id="jornadas-titulo" className="m-0 max-w-[22ch]">Três caminhos. A mesma vontade de entender.</H2>
          <Lead className="m-0">
            Comece pelo que trouxe você até aqui. Os caminhos se cruzam: quem lê hebraico entende
            melhor as placas de Israel, e quem estuda a própria história encontra a língua no caminho.
          </Lead>
        </div>

        <ul className="grid gap-5 lg:grid-cols-3 list-none p-0 m-0">
          {JORNADAS.map((j, i) => {
            const t = TOM[j.id];
            const situacao = situacaoDa(j.id);
            return (
              <li key={j.id}
                  className={`group relative grid grid-cols-[minmax(0,1fr)] lg:grid-rows-[auto_1fr_auto] gap-4 lg:gap-5 rounded-[18px] border ${t.fio} ${t.fundo}
                              p-5 sm:p-7 transition-[transform,box-shadow] duration-200 ease-[var(--ease)]
                              [@media(hover:hover)]:hover:-translate-y-[3px]
                              [@media(hover:hover)]:hover:shadow-[0_22px_44px_-28px_rgba(6,42,48,.55)]
                              focus-within:ring-2 focus-within:ring-[var(--teal)] focus-within:ring-offset-2`}>
                <div className={`hidden lg:flex items-start justify-between gap-4 ${t.tinta}`}>
                  <span className="font-display text-[15px] font-semibold tabular-nums">0{i + 1}</span>
                  <span className="text-[34px] leading-none"><He size="inline" tone={j.id === 'hebraico' ? 'teal' : 'navy'}>{j.letra}</He></span>
                </div>
                <div className="grid content-start gap-3">
                  {/* No telefone o emblema fica pequeno, ao lado do título; o
                      cartão perde metade da altura sem perder nada. */}
                  <div className="flex items-center gap-4 min-w-0 lg:grid lg:gap-3">
                  <div className={`w-[84px] shrink-0 lg:w-auto lg:max-w-[240px] ${t.tinta}`}><Emblema jornada={j.id} /></div>
                  <h3 className="m-0 min-w-0 [overflow-wrap:anywhere] font-display text-[23px] lg:text-[26px] font-semibold tracking-[-0.02em] text-ink">
                    {/* O link cobre o cartão inteiro (o ::after), e o foco vai
                        para ele: um destino, uma parada de Tab. */}
                    <Link href={j.rota} onClick={() => contarNoPortal(`jornada-${j.id}` as EventoDoPortal)}
                          className="after:absolute after:inset-0 after:rounded-[18px] focus:outline-none">
                      {j.nome}
                    </Link>
                  </h3>
                  </div>
                  <p className="m-0 font-ui text-[16px] leading-[1.55] text-ink-body text-pretty">{j.chamada}</p>
                </div>
                <div className="grid gap-4">
                  <p className="m-0 font-ui text-[13.5px] text-ink-muted">{situacao}</p>
                  <span className={`inline-flex items-center gap-2 font-ui text-[15.5px] font-semibold ${t.tinta}`}>
                    {j.cta}
                    <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

/* ── 3 · as experiências ───────────────────────────────────────────────── */
function EmDestaque({ jaEhAluno }: { jaEhAluno: boolean }) {
  const todos = produtos();
  const principal = todos.find(p => p.id === 'alfabetizacao')!;
  const outros = todos.filter(p => p.id === 'israel-alem-do-roteiro' || p.id === 'raizes-sefarditas');
  const emProducao = todos.filter(p => p.status === 'em-desenvolvimento');

  return (
    <section aria-labelledby="destaque-titulo">
      <Container className="py-16 sm:py-24 grid gap-10">
        <div className="grid gap-4">
          <Rubrica letra="ג">As experiências</Rubrica>
          <H2 id="destaque-titulo" className="m-0 max-w-[24ch]">O que já existe, e o que vem a seguir.</H2>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <CartaoPrincipal p={principal} jaEhAluno={jaEhAluno} />
          <div className="grid gap-5">
            {outros.map(p => <CartaoEmBreve key={p.id} p={p} />)}
          </div>
        </div>

        <UmaAluna />

        {emProducao.length > 0 && (
          <p className="m-0 font-ui text-[15.5px] leading-[1.6] text-ink-muted border-t border-line pt-5">
            Em desenvolvimento: os níveis seguintes do hebraico, a partir do A1, vendidos à parte e na
            mesma conta.{' '}
            <Link href="/cursos" onClick={() => contarNoPortal('produto-hebraico-a1')}
                  className="inline-block py-3 -my-3 font-semibold text-[var(--teal-ink)] underline underline-offset-[3px]">
              Ver a trilha dos cursos
            </Link>
          </p>
        )}
      </Container>
    </section>
  );
}

function CartaoPrincipal({ p, jaEhAluno }: { p: Produto; jaEhAluno: boolean }) {
  return (
    <article className="grid gap-6 rounded-[20px] border border-line bg-[var(--card)] p-6 sm:p-9
                        shadow-[0_24px_60px_-40px_rgba(6,42,48,.5)]">
      <div className="flex flex-wrap items-center gap-3">
        <SeloDoStatus status={p.status} />
        <span className="font-ui text-[13.5px] text-ink-muted">{p.formato}</span>
      </div>
      <div className="grid gap-3">
        <h3 className="m-0 font-display text-[clamp(28px,3vw,36px)] font-semibold tracking-[-0.025em] leading-[1.1] text-ink">
          {p.nome}
        </h3>
        <p className="m-0 font-ui text-[17px] leading-[1.6] text-ink-body max-w-[52ch] text-pretty">{p.descricao}</p>
        <p className="m-0 font-ui text-[14.5px] text-ink-muted">Para: {p.publico.toLowerCase()}.</p>
      </div>
      {/* O que o preço compra, em três itens da mesma lista da caixa de preço
          (lib/inclui.ts): a página de venda tem o resto. */}
      <ul className="grid gap-2 list-none p-0 m-0">
        {oEssencialDoCurso().map(i => (
          <li key={i} className="flex items-start gap-3 font-ui text-[15.5px] leading-[1.5] text-ink-body">
            <span aria-hidden className="mt-[3px] grid place-items-center w-[18px] h-[18px] rounded-full bg-[var(--teal-soft)] text-[var(--teal-ink)] text-[11px] font-bold shrink-0">✓</span>
            {i}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-end justify-between gap-5 border-t border-line pt-5">
        {jaEhAluno ? (
          <p className="m-0 font-ui text-[15.5px] text-ink-body">Este curso já é seu.</p>
        ) : (
          /* O preço que o checkout cobra (lib/vitrine.ts), dito sem clique:
             a página do curso explica o resto, inclusive o pré-lançamento. */
          <p className="m-0 grid gap-0.5">
            <span className="font-display text-[30px] font-semibold tabular-nums text-ink">{brl(precoDeVitrine())}</span>
            {/* O que o número compra, ao lado dele (price-framing, 23/10/2026):
                o prazo de acesso sai do catálogo, como o preço. */}
            <span className="font-ui text-[13.5px] text-ink-muted">
              pagamento único · {flagship().accessMonths} meses de acesso · {empresa.politicas.arrependimentoDias} dias para desistir
            </span>
            {/* A data real em que o preço muda (a Action virar-preco roda no dia
                seguinte), a mesma que a página de venda diz: prazo verdadeiro,
                sem contagem regressiva (persuasion-audit, 23/10/2026). */}
            {fimDoPreLancamento(flagship().price) && (
              <span className="font-ui text-[13.5px] text-ink-muted">
                Preço de pré-lançamento até {fimDoPreLancamento(flagship().price)}.
              </span>
            )}
          </p>
        )}
        <Link href={jaEhAluno ? '/meu-hebraico' : p.rota}
              onClick={() => contarNoPortal('produto-alfabetizacao')}
              className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-[var(--r-md)]
                         bg-[var(--navy)] text-white font-ui text-[15.5px] font-medium
                         transition-[background-color,transform] duration-[var(--dur)] ease-[var(--ease)]
                         hover:bg-[var(--navy-2)] hover:-translate-y-[2px] active:translate-y-0">
          {jaEhAluno ? 'Continuar o curso' : p.cta}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

/* O depoimento já publicado na página de venda (lib/testimonials.ts), aqui
   em um trecho. O corte vem marcado com "[...]", como /depoimento promete a
   quem escreve, e o vínculo da aluna com o professor vai à vista (CONAR).
   Sem depoimento na lista, a seção não existe: nenhum cartão de exemplo. */
function UmaAluna() {
  const t = DEPOIMENTOS[0];
  if (!t) return null;
  const ps = t.citacao.split(/\n\s*\n/);
  const trecho = ps.find(x => /plataforma/i.test(x)) ?? ps[0]!;
  const cortado = ps.length > 1;
  return (
    <figure className="m-0 grid gap-3 border-l-2 border-[var(--gold)] pl-5 sm:pl-6 py-1 max-w-[760px]">
      {/* Na fonte do texto corrido (23/10/2026): a de títulos no peso 400 só
          aparecia nesta citação e era mais um arquivo baixado pela capa. */}
      <blockquote className="m-0 font-ui text-[19px] sm:text-[21px] leading-[1.5] text-ink text-pretty">
        “{cortado && ps.indexOf(trecho) > 0 ? '[...] ' : ''}{trecho}{cortado && ps.indexOf(trecho) < ps.length - 1 ? ' [...]' : ''}”
      </blockquote>
      <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-ui text-[14px] text-ink-muted">
        <span className="font-semibold text-ink">{t.nome}</span>
        <span>{t.contexto}</span>
        <span aria-hidden>·</span>
        <Link href="/curso-de-hebraico" className="inline-flex items-center min-h-[44px] font-semibold text-[var(--teal-ink)] underline underline-offset-[3px]">
          Ler o depoimento inteiro
        </Link>
      </figcaption>
    </figure>
  );
}

function CartaoEmBreve({ p }: { p: Produto }) {
  const t = TOM[p.jornada];
  return (
    <article className={`group relative grid gap-3 rounded-[18px] border ${t.fio} ${t.fundo} p-6
                         focus-within:ring-2 focus-within:ring-[var(--teal)] focus-within:ring-offset-2`}>
      <div className="flex flex-wrap items-center gap-3">
        <SeloDoStatus status={p.status} />
        <span className="font-ui text-[13.5px] text-ink-muted">{p.formato}</span>
      </div>
      <h3 className="m-0 font-display text-[24px] font-semibold tracking-[-0.02em] text-ink">
        <Link href={p.rota} onClick={() => contarNoPortal(`produto-${p.id}` as EventoDoPortal)}
              className="after:absolute after:inset-0 after:rounded-[18px] focus:outline-none">
          {p.nome}
        </Link>
      </h3>
      <p className="m-0 font-ui text-[15.5px] leading-[1.55] text-ink-body">{p.subtitulo}</p>
      <span className={`inline-flex items-center gap-2 font-ui text-[15px] font-semibold ${t.tinta}`}>
        {p.cta}
        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
      </span>
    </article>
  );
}

/* ── 4 · aprender de forma diferente ───────────────────────────────────── */
function Experimente() {
  return (
    <section id="experimente" aria-labelledby="experimente-titulo" className="scroll-mt-20 bg-surface-2">
      <Container className="py-16 sm:py-24 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center">
        <div className="grid gap-4 min-w-0">
          <Rubrica letra="ד">Aprender de outro jeito</Rubrica>
          <H2 id="experimente-titulo" className="m-0 max-w-[18ch]">Leia uma palavra agora.</H2>
          <Lead className="m-0">
            Sem cadastro. Aqui você não assiste: tenta ler, ouve a gravação e confere o sentido. É o
            mesmo caminho das lições do curso, uma letra de cada vez.
          </Lead>
        </div>
        <PalavraDescoberta hrefCurso="/curso-de-hebraico" />
      </Container>
    </section>
  );
}

/* ── 5 · quem faz ──────────────────────────────────────────────────────── */
/* Só o que /sobre afirma: lib/autor.ts, a mesma lista da página do livro. */
const FATOS = FATOS_DO_AUTOR;

function QuemFaz({ retrato }: { retrato: string | null }) {
  return (
    <section aria-labelledby="quem-titulo">
      <Container className="py-16 sm:py-24 grid gap-10 sm:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] sm:items-center">
        {retrato ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={retrato} alt="Moshik Gueta, professor e criador do Hebraico Fluente"
               width={680} height={850} loading="lazy" decoding="async"
               className="aspect-[4/5] w-full max-w-[240px] sm:max-w-none rounded-[16px] object-cover object-top bg-[var(--sand)]
                          shadow-[0_0_0_1px_rgba(27,33,31,.06)]" />
        ) : <div aria-hidden className="aspect-[4/5] max-w-[240px] rounded-[16px] bg-[var(--sand)]" />}
        <div className="grid gap-5 min-w-0">
          <Rubrica letra="ה">Quem está por trás</Rubrica>
          <H2 id="quem-titulo" className="m-0 max-w-[22ch]">Um educador israelense, e as histórias que um idioma carrega.</H2>
          <p className="m-0 font-ui text-[17px] sm:text-[18px] leading-[1.65] text-ink-muted max-w-[56ch]">
            Sou Moshik Gueta. Criei o Hebraico Fluente para aproximar os brasileiros do hebraico, de
            Israel e de um universo cultural que merece ser explorado com curiosidade e com cuidado com
            os fatos.
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-8 list-none p-0 m-0 border-t border-line max-w-[640px]">
            {FATOS.map(f => (
              <li key={f} className="flex items-center gap-3 py-3 border-b border-line font-ui text-[15px] font-medium text-ink-body">
                <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-[var(--gold)] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link href="/sobre" className="group justify-self-start inline-flex items-center gap-2 min-h-[44px]
                                         font-ui text-[16px] font-semibold text-[var(--teal-ink)]">
            Conheça a minha história
            <span aria-hidden className="transition-transform duration-[180ms] group-hover:translate-x-[3px]">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}

/* ── 6 · os caminhos se cruzam ─────────────────────────────────────────── */
const CRUZAMENTOS = [
  { de: 'Quem aprende a ler', para: 'reconhece nomes, placas e cardápios quando chega a Israel.' },
  { de: 'Quem vai viajar', para: 'chega sabendo ler as letras que vai ver em cada rua.' },
  { de: 'Quem estuda as raízes', para: 'encontra palavras e nomes que atravessaram séculos.' }
];

function Caminhos() {
  return (
    <section aria-labelledby="caminhos-titulo" className="bg-[var(--navy)] text-white">
      <Container className="py-16 sm:py-24 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="grid content-start gap-4">
          <Rubrica letra="ו" tom="lite">Um caminho puxa o outro</Rubrica>
          <h2 id="caminhos-titulo"
              className="m-0 font-display font-semibold text-[clamp(30px,3.7vw,44px)] leading-[1.08] tracking-[-0.03em] text-balance text-white">
            Cada experiência deixa a próxima mais fácil.
          </h2>
        </div>
        <ol className="grid list-none p-0 m-0 border-t border-white/20">
          {CRUZAMENTOS.map((c, i) => (
            <li key={c.de} className="grid grid-cols-[40px_minmax(0,1fr)] gap-4 py-5 border-b border-white/20">
              <span className="font-display text-[15px] font-semibold tabular-nums text-[var(--teal-lite)]">0{i + 1}</span>
              <p className="m-0 font-ui text-[17px] leading-[1.6] text-white/85">
                <strong className="font-semibold text-white">{c.de}</strong> {c.para}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ── 7 · o que se pode conferir ─────────────────────────────────────────── */
/* Credibilidade só com o que é verificável: a empresa por trás, as regras da
   compra que estão nas políticas, e o crédito ao método de origem (que o
   rodapé também mostra). Sem selo, nota ou logo de parceiro. */
function Transparencia() {
  const itens = [
    { t: 'Uma empresa identificada', d: `${empresa.nomeFantasia}, com razão social, CNPJ e endereço no rodapé de toda página.` },
    { t: 'Pagamento único', d: 'Sem assinatura nem renovação automática. O acesso tem prazo, e o prazo está escrito.' },
    { t: `${empresa.politicas.arrependimentoDias} dias para desistir`, d: 'Desistência pelo próprio site, com o valor devolvido, como diz a Política de Reembolso.' },
    { t: 'Fatos com fonte', d: 'Nos conteúdos de história e cultura, o que é documentado e o que é tradição aparecem separados.' }
  ];
  return (
    <section aria-labelledby="confianca-titulo">
      <Container className="py-16 sm:py-24 grid gap-10">
        <div className="grid gap-4">
          <Rubrica letra="ז">O que você pode conferir</Rubrica>
          <H2 id="confianca-titulo" className="m-0 max-w-[24ch]">Sem promessa que não dê para checar.</H2>
        </div>
        <ul className="grid gap-x-10 sm:grid-cols-2 list-none p-0 m-0 border-t border-line">
          {itens.map(i => (
            <li key={i.t} className="grid gap-1.5 py-5 border-b border-line">
              <p className="m-0 font-display text-[19px] font-semibold text-ink">{i.t}</p>
              <p className="m-0 font-ui text-[15.5px] leading-[1.6] text-ink-muted max-w-[52ch]">{i.d}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ── 8 · o convite ─────────────────────────────────────────────────────── */
function Fecho() {
  return (
    <section aria-labelledby="fecho-titulo">
      <Container className="pb-8 sm:pb-12">
        <div className="relative overflow-hidden grid gap-6 justify-items-start rounded-[22px] bg-[var(--teal-soft)] border border-[#B9DCD4] p-8 sm:p-12
                        lg:pr-[38%]">
          {/* As três folhas da abertura voltam, pequenas, no canto: o mesmo
              objeto do começo fecha a página. Só a partir de lg, onde há
              lugar; no telefone o texto ocupa a caixa. */}
          <div aria-hidden className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 w-[30%] max-w-[340px] aspect-[5/4]">
            <Folha jornada="israel" className="absolute left-0 top-0 w-[62%] -rotate-[5deg]" />
            <Folha jornada="raizes" className="absolute right-0 top-[14%] w-[58%] rotate-[4deg]" />
            <Folha jornada="hebraico" className="absolute left-[16%] bottom-0 w-[64%] -rotate-[1.5deg]" />
          </div>
          <h2 id="fecho-titulo"
              className="m-0 font-display font-semibold text-[clamp(30px,4vw,46px)] leading-[1.05] tracking-[-0.03em] text-balance max-w-[20ch] text-ink">
            Sua próxima descoberta começa aqui.
          </h2>
          <p className="m-0 font-ui text-[17px] leading-[1.6] text-ink-body max-w-[48ch]">
            Escolha por onde começar. Se ainda não sabe, comece pelas letras: elas abrem todas as outras portas.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#jornadas" onClick={() => contarNoPortal('cta-explorar')}
               className="inline-flex items-center justify-center min-h-[52px] px-6 rounded-[var(--r-md)]
                          bg-[var(--navy)] text-white font-ui text-[15.5px] font-medium hover:bg-[var(--navy-2)]
                          transition-colors duration-[var(--dur)]">
              Explorar todas as experiências
            </a>
            <Link href="/curso-de-hebraico" onClick={() => contarNoPortal('cta-curso')}
                  className="inline-flex items-center justify-center min-h-[52px] px-6 rounded-[var(--r-md)]
                             bg-[var(--card)] text-ink border border-line font-ui text-[15.5px] font-medium
                             hover:border-[#C9C3B4] transition-colors duration-[var(--dur)]">
              Conhecer o curso de hebraico
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
