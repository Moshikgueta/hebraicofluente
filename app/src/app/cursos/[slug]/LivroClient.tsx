'use client';

/* A página de venda do livro Israel Além do Óbvio (23/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * PRONTA E DESLIGADA. O livro tem `aVenda: false` em data/courses.json, e com
 * isso esta página nem é gerada (generateStaticParams lê `allProducts`, que
 * só devolve o que está à venda). Decisão do dono: a venda abre depois de o
 * contador confirmar o enquadramento e de o advogado ler os parágrafos do livro
 * nos Termos e no Reembolso. Abrir = tirar a linha `aVenda`, subir
 * `politicas.atualizadoEm` e publicar (CLAUDE.md, E-book).
 *
 * Tudo que é número ou fato sai do catálogo: preço, parcelas, meses, os
 * capítulos, o que você leva, para quem é. Quem escreveu: lib/autor.ts, só o
 * que /sobre afirma. A prévia grátis (/previa/) é o app do próprio livro, e a
 * lista do que ela tem é a de editorial/<livro>/previa.json.
 *
 * O visual é o das páginas do portal (/israel-alem-do-obvio, /descobrir-israel):
 * migalhas, rubrica, o emblema da jornada Israel e os tons dourados dela.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Container, H2, Lead, Rubrica } from '@/components/landing/base';
import { Emblema } from '@/components/portal/Emblemas';
import { Migalhas } from '@/components/portal/Migalhas';
import { FATOS_DO_AUTOR } from '@/lib/autor';
import { getCourse, parcelasMax, type CatalogCourse } from '@/lib/catalog';
import { confirmaSozinho, empresa, parcelasTexto, prazoResposta, soPix, temCartao, temPix } from '@/lib/empresa';
import { CaixaDeCompra, OfertaDoPacote } from './ProdutoClient';

const PREVIA = '/previa/';

/* O que a prévia tem: editorial/<livro>/previa.json (decisão do dono, 23/10/2026). */
const NA_PREVIA = [
  { titulo: 'Arrume a mochila', texto: 'O que levar para Israel, do capítulo "Israel na prática".' },
  { titulo: 'Monte a sua comida', texto: 'Pita ou prato, à vontade, com os sabores do capítulo 6.' },
  { titulo: 'Gire a roleta', texto: 'Cinco das curiosidades do capítulo 9, cada uma com a fonte.' },
  { titulo: 'Comece o diário', texto: 'Duas páginas do diário de viagem, o capítulo 11.' }
] as const;

/* A versão interativa: o que a página do produto já dizia (ProdutoClient,
   21/10/2026) e o resumo do catálogo (mapas, ilustrações, fotos, exercícios). */
const COMO_E = [
  { titulo: 'Mapas que se tocam', texto: 'Os mapas do livro são interativos, no celular e no computador.' },
  { titulo: 'Exercícios no fim de cada capítulo', texto: 'Perguntas de compreensão, corrigidas na hora.' },
  { titulo: 'Um diário que guarda o que você escreve', texto: 'Páginas para antes, durante e depois da viagem.' },
  { titulo: 'Ilustrações e fotos', texto: 'Mapas, ilustrações e fotos ao longo dos capítulos.' }
] as const;

const BOTAO = `inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-[var(--r-md)]
               font-ui text-[15.5px] font-medium transition-[background-color,transform] duration-[var(--dur)]
               active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`;

export function LivroClient({ slug }: { slug: string }) {
  const c = getCourse(slug);
  if (!c) return null;
  return (
    <>
      <Abertura c={c} />
      <Previa />
      <ComoE />
      <OQueLeva c={c} />
      <Capitulos c={c} />
      <QuemEscreveu c={c} />
      <Perguntas c={c} />
      <Fecho c={c} />
    </>
  );
}

/* ── 1 · a abertura, com a caixa de compra ─────────────────────────────── */
function Abertura({ c }: { c: CatalogCourse }) {
  return (
    <section aria-labelledby="livro-titulo">
      <Container className="pt-6 pb-14 sm:pt-10 sm:pb-20 grid gap-6 sm:gap-8">
        <Migalhas trilha={[{ nome: 'Descobrir Israel', href: '/descobrir-israel' }, { nome: c.titlePt }]} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="grid gap-4 sm:gap-5 min-w-0">
            <Rubrica>Livro interativo</Rubrica>
            <h1 id="livro-titulo"
                className="m-0 font-display font-semibold text-[clamp(34px,5vw,56px)] leading-[1.04]
                           tracking-[-0.035em] text-balance text-ink max-w-[18ch]">
              {c.titlePt}
            </h1>
            <p className="m-0 font-display italic text-[clamp(20px,2.4vw,25px)] leading-[1.35] text-ink">{c.taglinePt}</p>
            {c.descricaoPt && (
              <p className="m-0 font-ui text-[17px] sm:text-[18px] leading-[1.6] text-ink-muted max-w-[52ch]">{c.descricaoPt}</p>
            )}
            {c.autorPt && (
              <p className="m-0 font-ui text-[13.5px] font-semibold uppercase tracking-[.14em] text-ink-body">
                de {c.autorPt}
              </p>
            )}
            <dl className="flex flex-wrap gap-x-6 sm:gap-x-10 gap-y-3 pt-4 sm:pt-5 mt-1 border-t border-line max-w-[560px] m-0">
              {([
                ['Capítulos', String(c.modules.length)],
                ['Formato', 'Interativo'],
                ['Acesso', `${c.accessMonths} meses`]
              ] as const).map(([k, v]) => (
                <div key={k} className="grid gap-0.5">
                  <dt className="font-ui text-[11.5px] font-semibold uppercase tracking-[.12em] text-ink-muted">{k}</dt>
                  <dd className="font-display text-[19px] sm:text-[24px] font-semibold tracking-[-0.02em] text-ink tabular-nums m-0">{v}</dd>
                </div>
              ))}
            </dl>
            <a href={PREVIA}
               className={`${BOTAO} justify-self-start border border-line bg-[var(--card)] text-ink hover:border-[#C9C3B4]
                           focus-visible:outline-[var(--teal)]`}>
              Experimentar a prévia grátis
              <span aria-hidden>→</span>
            </a>
          </div>
          <div className="grid gap-4 content-start">
            <CaixaDeCompra c={c} />
            <OfertaDoPacote />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── 2 · experimente antes ─────────────────────────────────────────────── */
function Previa() {
  return (
    <section aria-labelledby="previa-titulo" className="bg-[var(--gold-soft)]">
      <Container className="py-14 sm:py-20 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
        <div className="grid gap-4 content-start">
          <Rubrica>Antes de comprar</Rubrica>
          <H2 id="previa-titulo" className="m-0">Experimente o livro de graça.</H2>
          <Lead className="m-0">
            A prévia é o próprio livro, com quatro atividades de quatro capítulos. Abre no celular, sem cadastro.
          </Lead>
          <a href={PREVIA}
             className={`${BOTAO} justify-self-start bg-[var(--navy)] text-white shadow-[var(--sh)] hover:bg-[var(--navy-2)]
                         focus-visible:outline-[var(--teal)]`}>
            Abrir a prévia
            <span aria-hidden>→</span>
          </a>
        </div>
        <Grade itens={NA_PREVIA} tom="card" />
      </Container>
    </section>
  );
}

/* ── 3 · como é ler ────────────────────────────────────────────────────── */
function ComoE() {
  return (
    <section aria-labelledby="como-titulo">
      <Container className="py-14 sm:py-20 grid gap-8">
        <div className="grid gap-4 max-w-[60ch]">
          <Rubrica>A versão interativa</Rubrica>
          <H2 id="como-titulo" className="m-0">Um livro para ler no celular, antes e durante a viagem.</H2>
        </div>
        <Grade itens={COMO_E} tom="contorno" />
      </Container>
    </section>
  );
}

/* ── 4 · o que você leva ───────────────────────────────────────────────── */
function OQueLeva({ c }: { c: CatalogCourse }) {
  if (!c.outcomesPt.length) return null;
  return (
    <section aria-labelledby="leva-titulo" className="bg-surface-2">
      <Container className="py-14 sm:py-20 grid gap-8">
        <div className="grid gap-4">
          <Rubrica>Depois da leitura</Rubrica>
          <H2 id="leva-titulo" className="m-0">O que você leva deste livro.</H2>
        </div>
        <ul className="grid sm:grid-cols-2 gap-x-10 list-none p-0 m-0 border-t border-line">
          {c.outcomesPt.map(o => (
            <li key={o} className="flex gap-3 py-5 border-b border-line font-ui text-[16px] leading-[1.6] text-ink-body">
              <span aria-hidden className="mt-[11px] w-[6px] h-[6px] rounded-full bg-[var(--gold)] shrink-0" />
              <span className="min-w-0">{o}</span>
            </li>
          ))}
        </ul>
        {c.forWhomPt.length > 0 && (
          <div className="grid gap-3 max-w-[62ch]">
            <h3 className="m-0 font-display text-[21px] font-semibold tracking-[-0.02em] text-ink">Para quem é</h3>
            <ul className="grid gap-2 list-none p-0 m-0">
              {c.forWhomPt.map(f => (
                <li key={f} className="font-ui text-[16px] leading-[1.6] text-ink-body">{f}</li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </section>
  );
}

/* ── 5 · os capítulos ──────────────────────────────────────────────────── */
function Capitulos({ c }: { c: CatalogCourse }) {
  return (
    <section aria-labelledby="capitulos-titulo">
      <Container className="py-14 sm:py-20 grid gap-8">
        <div className="grid gap-4">
          <Rubrica>Por dentro</Rubrica>
          <H2 id="capitulos-titulo" className="m-0">Os {c.modules.length} capítulos.</H2>
        </div>
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

/* ── 6 · quem escreveu ─────────────────────────────────────────────────── */
function QuemEscreveu({ c }: { c: CatalogCourse }) {
  return (
    <section aria-labelledby="autor-titulo" className="bg-surface-2">
      <Container className="py-14 sm:py-20 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div className="grid gap-4 content-start">
          <Rubrica>Quem escreveu</Rubrica>
          <H2 id="autor-titulo" className="m-0">{c.autorPt ?? 'Moshik Gueta'}.</H2>
          <Lead className="m-0">{c.taglinePt}</Lead>
          <Link href="/sobre/"
                className="justify-self-start inline-flex items-center gap-1.5 min-h-[44px] font-ui text-[15.5px] font-semibold
                           text-[var(--teal-ink)] underline underline-offset-[3px] decoration-[1.5px]">
            Conhecer a trajetória
          </Link>
        </div>
        <ul className="grid gap-3 list-none p-0 m-0">
          {FATOS_DO_AUTOR.map(f => (
            <li key={f} className="rounded-[14px] border border-line bg-[var(--card)] px-5 py-4 font-ui text-[16px] text-ink-body">
              {f}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ── 7 · perguntas ─────────────────────────────────────────────────────── */
function Perguntas({ c }: { c: CatalogCourse }) {
  const parcelas = parcelasMax(c.price);
  const pagamento = soPix()
    ? 'Por PIX, pelo aplicativo do seu banco.'
    : temPix() && temCartao()
      ? `Por PIX ou cartão, à vista ou ${parcelasTexto(parcelas)}.`
      : temCartao() ? `No cartão, à vista ou ${parcelasTexto(parcelas)}.` : 'Por PIX.';
  const lista: { p: string; r: ReactNode }[] = [
    {
      p: 'Preciso saber hebraico?',
      r: 'Não. O livro é em português. O capítulo 7 ensina palavras para reconhecer nas placas e nos cardápios.'
    },
    {
      p: 'Onde eu leio?',
      r: 'No navegador, no celular ou no computador, entrando na sua conta. Não precisa instalar nada.'
    },
    {
      p: 'Por quanto tempo tenho acesso?',
      r: `${c.accessMonths} meses, a contar da liberação. O livro recebe atualizações, e você lê sempre a edição mais recente.`
    },
    {
      p: 'Como pago e quando recebo?',
      r: `${pagamento} ${confirmaSozinho() ? 'O acesso é liberado automaticamente.' : `O acesso é liberado à mão, ${prazoResposta()} depois do pagamento.`}`
    },
    {
      p: 'E se eu não gostar?',
      r: (
        <>
          Você tem {empresa.politicas.arrependimentoDias} dias para desistir e receber 100% de volta, sem justificar, pelo
          botão em Sua conta. Veja a <Link href="/reembolso/" className="underline underline-offset-[3px]">Política de Reembolso</Link>.
        </>
      )
    }
  ];
  return (
    <section aria-labelledby="perguntas-titulo">
      <Container className="py-14 sm:py-20 grid gap-8 max-w-[860px]">
        <H2 id="perguntas-titulo" className="m-0">Perguntas sobre o livro.</H2>
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

/* ── 8 · o fecho ───────────────────────────────────────────────────────── */
function Fecho({ c }: { c: CatalogCourse }) {
  return (
    <section aria-labelledby="fecho-titulo">
      <Container className="pb-16 sm:pb-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] items-center rounded-[20px] bg-[var(--navy)] text-white p-8 sm:p-12">
          <div className="grid gap-5 justify-items-start">
            <Rubrica tom="lite">{c.titlePt}</Rubrica>
            <h2 id="fecho-titulo"
                className="m-0 font-display font-semibold text-[clamp(28px,3.4vw,40px)] leading-[1.08] tracking-[-0.03em] text-balance max-w-[22ch] text-white">
              Chegue a Israel sabendo o que está vendo.
            </h2>
            <div className="flex flex-wrap gap-3">
              <a href="#livro-titulo"
                 className={`${BOTAO} bg-white text-[var(--navy)] hover:bg-[var(--teal-soft)] focus-visible:outline-white`}>
                Ver o preço
              </a>
              <a href={PREVIA}
                 className={`${BOTAO} border border-white/40 text-white hover:bg-white/10 focus-visible:outline-white`}>
                Experimentar a prévia
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

function Grade({ itens, tom }: { itens: readonly { titulo: string; texto: string }[]; tom: 'card' | 'contorno' }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 list-none p-0 m-0">
      {itens.map(i => (
        <li key={i.titulo}
            className={`grid gap-1.5 rounded-[16px] p-5 ${tom === 'card' ? 'bg-[var(--card)] shadow-[0_14px_34px_-26px_rgba(6,42,48,.5)]' : 'border border-line'}`}>
          <span className="font-display text-[18px] font-semibold tracking-[-0.01em] text-ink">{i.titulo}</span>
          <span className="font-ui text-[15px] leading-[1.55] text-ink-body">{i.texto}</span>
        </li>
      ))}
    </ul>
  );
}
