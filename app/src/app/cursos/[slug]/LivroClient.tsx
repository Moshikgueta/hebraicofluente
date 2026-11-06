'use client';

/* A página de venda do Israel Além do Óbvio: O Olhar de um Israelense.
 * ─────────────────────────────────────────────────────────────────────────
 * PRONTA E DESLIGADA. O livro tem `aVenda: false` em data/courses.json, e com
 * isso esta página nem é gerada (generateStaticParams lê `allProducts`).
 * Abrir a venda: CLAUDE.md, "E-book".
 *
 * A página É a demonstração do produto (master prompt do dono, 23/10/2026):
 * o visitante vê partes reais do livro antes de ver o preço. Todas as imagens
 * são do próprio livro e nascem na publicação (scripts/vitrine-do-livro.mjs),
 * em /vitrine-livro/, fora do git: o livro mora no repositório privado. As
 * ilustrações são as aberturas de capítulo; as telas são capturas da versão
 * interativa (a mochila, o mapa ilustrado, a roleta, o monte a sua comida, o
 * diário). Nada inventado: cada frase descreve o que a captura mostra.
 *
 * Nenhum número de capítulos, páginas ou curiosidades vende o livro aqui
 * (pedido do dono: o valor é a experiência). O preço vem depois da
 * demonstração, em duas opções (só o livro, ou o combo), lidas do catálogo
 * por OpcoesDeCompra. Sem escassez, contador nem preço riscado.
 *
 * Movimento: livro.css, só CSS, por cima de conteúdo já visível, e parado
 * com "reduzir movimento".
 */

import './livro.css';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Container } from '@/components/landing/base';
import { Emblema } from '@/components/portal/Emblemas';
import { GaleriaDoLivro, V } from '@/components/portal/GaleriaDoLivro';
import { Migalhas } from '@/components/portal/Migalhas';
import { COMBO, LIVRO, OpcoesDeCompra } from '@/components/portal/OpcoesDeCompra';
import { useAccount } from '@/lib/account/store';
import { FATOS_DO_AUTOR } from '@/lib/autor';
import { brl, getCourse, parcelasMax, type CatalogCourse } from '@/lib/catalog';
import { confirmaSozinho, empresa, parcelasTexto, prazoResposta, soPix, temCartao, temPix } from '@/lib/empresa';
import { precoDeVitrine } from '@/lib/vitrine';

const PREVIA = '/previa/';

/* A viagem em cinco passos: cada um com a tela real que ele descreve. */
const PASSOS = [
  { titulo: 'Prepare a sua mala', imagem: 'mochila', alt: 'A tela "Arrume a sua mochila", com a mochila desenhada cheia de objetos e o medidor em 41%.',
    texto: 'Toque em cada coisa e ela vai para a mochila. A lista da sua viagem fica guardada no seu aparelho.' },
  { titulo: 'Descubra os lugares de Israel', imagem: 'mapa-destinos', alt: 'O mapa ilustrado "Israel, de lugar em lugar", com dez lugares numerados e a distância de cada um até Jerusalém.', largo: true,
    texto: 'Dez lugares no mapa ilustrado, cada um com a sua história e a distância até Jerusalém.' },
  { titulo: 'Explore histórias e curiosidades', imagem: 'roleta', alt: 'A roleta das curiosidades, com as fatias numeradas e o botão "Girar a roleta".',
    texto: 'Gire a roleta e descubra uma curiosidade sobre Israel, cada uma com a fonte.' },
  { titulo: 'Viva a cultura, não só leia sobre ela', imagem: 'monte', alt: 'A tela "Monte a sua comida", com uma pita recheada de falafel, salada, picles, batata frita, tahine e amba.',
    texto: 'Monte a sua comida na pita ou no prato, com os sabores de rua que o capítulo conta.' },
  { titulo: 'Registre as suas descobertas', imagem: 'diario', alt: 'A tela "Meu diário de viagem", com as datas da viagem e as abas Antes, Durante e Depois.',
    texto: 'Antes, durante e depois: o diário guarda o que você escreve, carimba e fotografa, no seu aparelho.' }
] as const;

/* O que a experiência é. Seis afirmações, cada uma sobre o que o livro TEM. */
const PILARES = [
  { titulo: 'História e cultura, com fonte', texto: 'Cada informação vem de uma fonte, numerada no fim do capítulo. O que é história e o que é tradição ficam separados.' },
  { titulo: 'O olhar de um israelense', texto: 'O país explicado para brasileiros por quem nasceu lá e vive no Brasil.' },
  { titulo: 'Ilustrações e mapas próprios', texto: 'Desenhados para estas páginas: as aberturas de capítulo, os mapas ilustrados, os infográficos.' },
  { titulo: 'Exploração interativa', texto: 'Mapas para tocar, uma mochila para arrumar, uma roleta para girar, uma pita para montar.' },
  { titulo: 'Uma narrativa de viagem', texto: 'Do mapa à mesa, de Jerusalém aos outros destinos, até as dicas de onde comer e sair.' },
  { titulo: 'Atividades e descobertas', texto: 'Exercícios no fim de cada capítulo, corrigidos na hora, e um diário para a sua viagem.' }
] as const;

const BOTAO = `inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-[var(--r-md)]
               font-ui text-[15.5px] font-semibold transition-[background-color,transform] duration-[var(--dur)]
               active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`;

export function LivroClient({ slug }: { slug: string }) {
  const c = getCourse(slug);
  const fimDaAbertura = useRef<HTMLDivElement>(null);
  if (!c) return null;
  return (
    <div className="lv">
      <Abertura c={c} />
      <div ref={fimDaAbertura} aria-hidden />
      <NaoEUmEbook />
      <GaleriaDoLivro c={c} />
      <Viagem />
      <PorDentro />
      <QuemEscreveu c={c} />
      <Comprar />
      <Capitulos c={c} />
      <Perguntas c={c} />
      <Fecho c={c} />
      <BarraDeCompra c={c} depoisDe={fimDaAbertura} />
    </div>
  );
}

/* ── 1 · a abertura ────────────────────────────────────────────────────── */
function Abertura({ c }: { c: CatalogCourse }) {
  const account = useAccount();
  const tem = account.ready && account.can(c.slug);
  return (
    <section aria-labelledby="livro-titulo" className="lv-papel text-white overflow-hidden">
      <Container className="pt-6 pb-14 sm:pt-10 sm:pb-20 grid gap-8">
        <div className="[&_a]:text-white/80 [&_span]:text-white/70 [&_ol]:text-white/70">
          <Migalhas trilha={[{ nome: 'Descobrir Israel', href: '/descobrir-israel' }, { nome: c.titlePt }]} />
        </div>
        {/* No celular o produto vem logo depois do título (o visitante vê
            partes reais do livro na primeira tela); no computador, o texto
            fica à esquerda e a composição à direita. */}
        <div className="grid gap-7 lg:gap-x-12 lg:gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]
                        [grid-template-areas:'topo'_'visual'_'base'] lg:[grid-template-areas:'topo_visual'_'base_visual']">
          <div className="grid gap-4 sm:gap-5 min-w-0 [grid-area:topo] lg:self-end">
            <p className="m-0 font-ui text-[12.5px] font-semibold uppercase tracking-[.16em] text-[var(--teal-lite)]">
              Uma experiência digital interativa
            </p>
            <h1 id="livro-titulo" className="m-0 grid gap-1 text-white">
              <span className="font-display font-bold text-[clamp(46px,8vw,92px)] leading-[.92] tracking-[-0.02em] uppercase">Israel</span>
              <span className="font-display font-semibold text-[clamp(22px,3.4vw,38px)] leading-[1.05] tracking-[.02em] uppercase text-[#E2B864]">
                Além do Óbvio
              </span>
            </h1>
            <p className="m-0 font-display italic text-[clamp(21px,2.6vw,28px)] leading-[1.25] text-[#E9DCC0]">{c.taglinePt}</p>
          </div>
          <div className="grid gap-5 min-w-0 [grid-area:base] lg:self-start">
            <p className="m-0 font-ui text-[17px] sm:text-[18px] leading-[1.6] text-white/80 max-w-[46ch]">
              A história, a cultura e os lugares de Israel contados por quem nasceu lá: com mapas para tocar,
              ilustrações, jogos e um diário para a sua viagem.
            </p>
            {c.autorPt && (
              <p className="m-0 font-ui text-[13px] font-semibold uppercase tracking-[.16em] text-white/70">de {c.autorPt}</p>
            )}
            <div className="flex flex-wrap gap-3 pt-1">
              <a href={PREVIA} className={`${BOTAO} bg-[#E2B864] text-[var(--navy)] hover:bg-[#ecc77c] focus-visible:outline-white`}>
                Explorar a experiência
                <span aria-hidden>→</span>
              </a>
              {tem
                ? <a href="/israel/" className={`${BOTAO} border border-white/40 text-white hover:bg-white/10 focus-visible:outline-white`}>Abrir o livro</a>
                : <a href="#comprar" className={`${BOTAO} border border-white/40 text-white hover:bg-white/10 focus-visible:outline-white`}>Garantir meu acesso</a>}
            </div>
            <p className="m-0 font-ui text-[13.5px] text-white/65">A prévia é grátis, abre no celular e não pede cadastro.</p>
          </div>

          {/* A composição: o livro aberto no computador e, na frente, a
              mochila no celular. Telas de verdade, do livro montado. */}
          <div className="relative mx-auto w-full max-w-[360px] sm:max-w-[620px] pb-8 sm:pb-6 [grid-area:visual] lg:self-center">
            <div className="lv-notebook">
              <img src={`${V}/capa-computador.jpg`} width={1280} height={800} fetchPriority="high"
                   alt="A capa da versão interativa no computador: ISRAEL, Além do Óbvio, sobre uma paisagem de mar e deserto." />
            </div>
            <div className="lv-notebook-base" aria-hidden />
            <div className="absolute -bottom-2 right-2 sm:-right-4 w-[34%] max-w-[190px] lv-flutua">
              <div className="lv-celular">
                <div className="lv-celular-tela aspect-[390/780]">
                  <img src={`${V}/mochila.jpg`} width={358} height={1000} alt="No celular, a mochila sendo arrumada." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── 2 · não é um e-book ───────────────────────────────────────────────── */
function NaoEUmEbook() {
  return (
    <section aria-labelledby="nao-e-titulo">
      <Container className="py-16 sm:py-24 grid gap-10 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="grid gap-4 lg:sticky lg:top-24">
          <p className="m-0 font-ui text-[12.5px] font-semibold uppercase tracking-[.16em] text-[var(--gold-ink)]">O que é</p>
          <h2 id="nao-e-titulo" className="m-0 font-display font-semibold text-[clamp(30px,4.4vw,48px)] leading-[1.05] tracking-[-0.03em] text-ink text-balance">
            Não é um e-book. É uma viagem pelo país, com quem nasceu lá.
          </h2>
        </div>
        <ol className="grid sm:grid-cols-2 gap-x-10 list-none p-0 m-0 border-t border-line">
          {PILARES.map((p, i) => (
            <li key={p.titulo} className="lv-entra grid gap-2 py-6 border-b border-line">
              <span className="font-display text-[15px] font-semibold tabular-nums text-[var(--gold-ink)]">0{i + 1}</span>
              <h3 className="m-0 font-display text-[20px] font-semibold tracking-[-0.015em] text-ink">{p.titulo}</h3>
              <p className="m-0 font-ui text-[15.5px] leading-[1.6] text-ink-body">{p.texto}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ── 3 · a galeria: components/portal/GaleriaDoLivro.tsx (também na página "Em breve") */

/* ── 4 · a viagem, em cinco passos ─────────────────────────────────────── */
function Viagem() {
  return (
    <section aria-labelledby="viagem-titulo">
      <Container className="py-16 sm:py-24 grid gap-12 sm:gap-16">
        <div className="grid gap-3 max-w-[34ch]">
          <p className="m-0 font-ui text-[12.5px] font-semibold uppercase tracking-[.16em] text-[var(--teal-ink)]">Como é por dentro</p>
          <h2 id="viagem-titulo" className="m-0 font-display font-semibold text-[clamp(28px,4vw,44px)] leading-[1.06] tracking-[-0.03em] text-ink text-balance">
            Uma viagem em cinco passos.
          </h2>
        </div>
        <ol className="grid gap-14 sm:gap-20 list-none p-0 m-0">
          {PASSOS.map((p, i) => (
            <li key={p.imagem}
                className={`grid gap-6 lg:gap-14 items-center ${'largo' in p ? 'lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)]' : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'}`}>
              <div className={`grid gap-3 max-w-[44ch] ${i % 2 ? 'lg:order-2' : ''}`}>
                <span className="font-display text-[44px] sm:text-[56px] font-bold leading-none tabular-nums text-[var(--gold)]">{i + 1}</span>
                <h3 className="m-0 font-display text-[24px] sm:text-[30px] font-semibold leading-[1.12] tracking-[-0.02em] text-ink">{p.titulo}</h3>
                <p className="m-0 font-ui text-[16.5px] leading-[1.6] text-ink-body">{p.texto}</p>
              </div>
              <div className={`lv-entra ${i % 2 ? 'lg:order-1' : ''}`}>
                {'largo' in p ? (
                  <img src={`${V}/${p.imagem}.jpg`} width={1296} height={1500} loading="lazy" decoding="async" alt={p.alt}
                       className="block w-full h-auto rounded-[18px] border border-line shadow-[0_30px_60px_-40px_rgba(6,42,48,.5)]" />
                ) : (
                  /* Sem proporção fixa: cada tela tem a sua largura, e um corte
                     fixo comia as laterais da roleta. O alto é limitado. */
                  <div className="mx-auto w-[72%] max-w-[300px] lv-celular">
                    <div className="lv-celular-tela max-h-[560px] sm:max-h-[600px]">
                      <img src={`${V}/${p.imagem}.jpg`} width={390} height={1000} loading="lazy" decoding="async" alt={p.alt}
                           className="!h-auto" />
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center gap-4">
          <a href={PREVIA} className={`${BOTAO} bg-[var(--navy)] text-white hover:bg-[var(--navy-2)] focus-visible:outline-[var(--teal)]`}>
            Explorar a experiência
            <span aria-hidden>→</span>
          </a>
          <span className="font-ui text-[14.5px] text-ink-muted">A mochila, o monte a sua comida, a roleta e o diário, de graça.</span>
        </div>
      </Container>
    </section>
  );
}

/* ── 5 · nos três aparelhos ────────────────────────────────────────────── */
function PorDentro() {
  return (
    <section aria-labelledby="aparelhos-titulo" className="bg-surface-2 overflow-hidden">
      <Container className="py-16 sm:py-24 grid gap-10">
        <div className="grid gap-3 max-w-[40ch]">
          <p className="m-0 font-ui text-[12.5px] font-semibold uppercase tracking-[.16em] text-[var(--teal-ink)]">Onde você lê</p>
          <h2 id="aparelhos-titulo" className="m-0 font-display font-semibold text-[clamp(28px,4vw,44px)] leading-[1.06] tracking-[-0.03em] text-ink text-balance">
            No computador, no tablet e no celular.
          </h2>
          <p className="m-0 font-ui text-[16.5px] leading-[1.6] text-ink-body">
            Pelo navegador, entrando na sua conta. Não precisa instalar nada.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,.55fr)] sm:items-end">
          <figure className="lv-entra m-0 grid gap-3">
            <div>
              <div className="lv-notebook">
                <img src={`${V}/capa-computador.jpg`} width={1280} height={800} loading="lazy" decoding="async" alt="A versão interativa aberta no computador." />
              </div>
              <div className="lv-notebook-base" aria-hidden />
            </div>
            <figcaption className="font-ui text-[13.5px] text-ink-muted">No computador</figcaption>
          </figure>
          <figure className="lv-entra m-0 grid gap-3">
            <div className="lv-tablet">
              <img src={`${V}/jerusalem-tablet.jpg`} width={834} height={1112} loading="lazy" decoding="async"
                   alt="No tablet, a abertura do capítulo sobre Jerusalém, com a ilustração da muralha da Cidade Antiga." />
            </div>
            <figcaption className="font-ui text-[13.5px] text-ink-muted">No tablet</figcaption>
          </figure>
          <figure className="lv-entra m-0 grid gap-3 w-[58%] sm:w-auto">
            <div className="lv-celular">
              <div className="lv-celular-tela aspect-[390/844]">
                <img src={`${V}/capa-celular.jpg`} width={390} height={844} loading="lazy" decoding="async" alt="A capa da versão interativa no celular." />
              </div>
            </div>
            <figcaption className="font-ui text-[13.5px] text-ink-muted">No celular</figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}

/* ── 6 · quem escreveu ─────────────────────────────────────────────────── */
function QuemEscreveu({ c }: { c: CatalogCourse }) {
  return (
    <section aria-labelledby="autor-titulo">
      <Container className="py-16 sm:py-24 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div className="grid gap-4 content-start">
          <p className="m-0 font-ui text-[12.5px] font-semibold uppercase tracking-[.16em] text-[var(--gold-ink)]">Quem escreveu</p>
          <h2 id="autor-titulo" className="m-0 font-display font-semibold text-[clamp(28px,4vw,44px)] leading-[1.06] tracking-[-0.03em] text-ink">
            {c.autorPt ?? 'Moshik Gueta'}.
          </h2>
          <p className="m-0 font-display italic text-[22px] text-ink-body">{c.taglinePt}.</p>
          <Link href="/sobre/"
                className="justify-self-start inline-flex items-center gap-1.5 min-h-[44px] font-ui text-[15.5px] font-semibold
                           text-[var(--teal-ink)] underline underline-offset-[3px] decoration-[1.5px]">
            Conhecer a trajetória
          </Link>
        </div>
        <ul className="grid gap-3 list-none p-0 m-0">
          {FATOS_DO_AUTOR.map(f => (
            <li key={f} className="rounded-[14px] border border-line bg-[var(--card)] px-5 py-4 font-ui text-[16px] text-ink-body">{f}</li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ── 7 · as duas opções ────────────────────────────────────────────────── */
function Comprar() {
  return (
    <section id="comprar" aria-label="Opções de compra" className="bg-surface-2 scroll-mt-16">
      <Container className="py-16 sm:py-24 grid gap-4">
        <p className="m-0 font-ui text-[16.5px] leading-[1.6] text-ink-body max-w-[60ch]">
          Descubra Israel pelos olhos de um israelense e, se quiser, aprenda a ler o idioma que faz parte dessa história.
        </p>
        <OpcoesDeCompra slugs={[LIVRO, COMBO]} titulo="Escolha como embarcar." id="opcoes-livro" aqui={LIVRO} />
      </Container>
    </section>
  );
}

/* ── 8 · os capítulos ──────────────────────────────────────────────────── */
function Capitulos({ c }: { c: CatalogCourse }) {
  return (
    <section aria-labelledby="capitulos-titulo">
      <Container className="py-16 sm:py-24 grid gap-8">
        <h2 id="capitulos-titulo" className="m-0 font-display font-semibold text-[clamp(26px,3.4vw,38px)] leading-[1.08] tracking-[-0.03em] text-ink">
          O roteiro do livro.
        </h2>
        <ol className="grid sm:grid-cols-2 gap-x-10 list-none p-0 m-0 border-t border-line">
          {c.modules.map(m => (
            <li key={m.n} className="flex gap-4 py-4 border-b border-line min-w-0">
              <span className="font-display text-[20px] font-semibold text-[var(--gold-ink)] tabular-nums w-7 shrink-0">{m.n}</span>
              <span className="grid gap-0.5 min-w-0">
                <span className="font-display text-[17px] font-semibold text-ink">{m.titlePt}</span>
                <span className="font-ui text-[14px] text-ink-muted">{m.subPt}</span>
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ── 9 · perguntas ─────────────────────────────────────────────────────── */
function Perguntas({ c }: { c: CatalogCourse }) {
  const parcelas = parcelasMax(c.price);
  const pagamento = soPix()
    ? 'Por PIX, pelo aplicativo do seu banco.'
    : temPix() && temCartao()
      ? `Por PIX ou cartão, à vista ou ${parcelasTexto(parcelas)}.`
      : temCartao() ? `No cartão, à vista ou ${parcelasTexto(parcelas)}.` : 'Por PIX.';
  const lista: { p: string; r: ReactNode }[] = [
    { p: 'É um e-book?', r: 'É uma experiência digital interativa: o livro abre no navegador, com mapas para tocar, ilustrações, jogos, exercícios e um diário. Não é um arquivo para baixar.' },
    { p: 'Preciso saber hebraico?', r: 'Não. Tudo é em português. Um capítulo ensina palavras para reconhecer nas placas e nos cardápios.' },
    { p: 'Onde eu leio?', r: 'No navegador, no celular, no tablet ou no computador, entrando na sua conta. Não precisa instalar nada.' },
    { p: 'Por quanto tempo tenho acesso?', r: `${c.accessMonths} meses, a contar da liberação. O livro recebe atualizações, e você lê sempre a edição mais recente.` },
    { p: 'Como pago e quando recebo?', r: `${pagamento} ${confirmaSozinho() ? 'O acesso é liberado automaticamente, assim que a Mercado Pago confirma o pagamento.' : `O acesso é liberado à mão, ${prazoResposta()} depois do pagamento.`}` },
    { p: 'E se eu não gostar?', r: (
      <>
        Você tem {empresa.politicas.arrependimentoDias} dias para desistir e receber 100% de volta, sem justificar, pelo
        botão em Sua conta. Veja a <Link href="/reembolso/" className="underline underline-offset-[3px]">Política de Reembolso</Link>.
      </>
    ) }
  ];
  return (
    <section aria-labelledby="perguntas-titulo" className="bg-surface-2">
      <Container className="py-16 sm:py-24 grid gap-8 max-w-[860px]">
        <h2 id="perguntas-titulo" className="m-0 font-display font-semibold text-[clamp(26px,3.4vw,38px)] leading-[1.08] tracking-[-0.03em] text-ink">
          Perguntas frequentes.
        </h2>
        <div className="grid border-t border-line">
          {lista.map(({ p, r }) => (
            <details key={p} className="group border-b border-line">
              <summary className="flex items-center justify-between gap-4 min-h-[56px] py-3 cursor-pointer list-none
                                  font-display text-[18px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {p}
                <span aria-hidden className="font-ui text-[20px] text-ink-muted transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="m-0 pb-5 font-ui text-[16px] leading-[1.6] text-ink-body max-w-[62ch]">{r}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ── 10 · o fecho ──────────────────────────────────────────────────────── */
function Fecho({ c }: { c: CatalogCourse }) {
  return (
    <section aria-labelledby="fecho-titulo">
      <Container className="py-16 sm:py-24">
        <div className="lv-papel grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] items-center rounded-[20px] text-white p-8 sm:p-12">
          <div className="grid gap-5 justify-items-start">
            <p className="m-0 font-ui text-[12.5px] font-semibold uppercase tracking-[.16em] text-[var(--teal-lite)]">{c.titlePt}</p>
            <h2 id="fecho-titulo"
                className="m-0 font-display font-semibold text-[clamp(28px,3.4vw,40px)] leading-[1.08] tracking-[-0.03em] text-balance max-w-[22ch] text-white">
              Chegue a Israel sabendo o que está vendo.
            </h2>
            <div className="flex flex-wrap gap-3">
              <a href="#comprar" className={`${BOTAO} bg-[#E2B864] text-[var(--navy)] hover:bg-[#ecc77c] focus-visible:outline-white`}>
                Garantir meu acesso
              </a>
              <a href={PREVIA} className={`${BOTAO} border border-white/40 text-white hover:bg-white/10 focus-visible:outline-white`}>
                Explorar a experiência
              </a>
            </div>
          </div>
          <div aria-hidden className="hidden lg:block rounded-[16px] p-5 rotate-[2deg] bg-[var(--gold-soft)] text-[var(--gold-ink)]
                                      shadow-[0_18px_40px_-24px_rgba(0,0,0,.6)]">
            <Emblema jornada="israel" />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── a barra de compra do celular ─────────────────────────────────────────
   Aparece depois da abertura e some quando as opções de compra estão na
   tela (ou para quem já tem o livro). Só no celular: no computador, o
   botão da abertura e o do fecho bastam. */
function BarraDeCompra({ c, depoisDe }: { c: CatalogCourse; depoisDe: RefObject<HTMLDivElement | null> }) {
  const account = useAccount();
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const marco = depoisDe.current;
    const compra = document.getElementById('comprar');
    if (!marco || !compra) return;
    /* Uma conta na rolagem, e não um IntersectionObserver: voltar ao topo
       não cruza a borda de nada, e a barra ficava aparecendo na abertura. */
    let pedido = 0;
    const medir = () => {
      pedido = 0;
      const passou = marco.getBoundingClientRect().top < 0;
      const r = compra.getBoundingClientRect();
      const naCompra = r.top < window.innerHeight && r.bottom > 0;
      setVisivel(passou && !naCompra);
    };
    const agendar = () => { if (!pedido) pedido = requestAnimationFrame(medir); };
    medir();
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    return () => { window.removeEventListener('scroll', agendar); window.removeEventListener('resize', agendar); if (pedido) cancelAnimationFrame(pedido); };
  }, [depoisDe]);
  if (account.ready && account.can(c.slug)) return null;
  return (
    <div aria-hidden={!visivel}
         className={`sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[var(--card)]/95 backdrop-blur px-4 py-3
                     flex items-center justify-between gap-3 transition-transform duration-300 motion-reduce:transition-none
                     ${visivel ? 'translate-y-0' : 'translate-y-full'}`}>
      <span className="grid min-w-0">
        <span className="font-ui text-[13px] text-ink-muted truncate">{c.titlePt}</span>
        <span className="font-display text-[19px] font-bold text-ink tabular-nums">{brl(precoDeVitrine(c))}</span>
      </span>
      <a href="#comprar" tabIndex={visivel ? 0 : -1}
         className="inline-flex items-center justify-center min-h-[48px] px-5 rounded-[var(--r-md)] bg-[var(--navy)] text-white font-ui text-[15px] font-semibold">
        Garantir meu acesso
      </a>
    </div>
  );
}
