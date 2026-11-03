import Link from 'next/link';
import { plans, FEATURE_LABEL } from '@content/plans';
import { Scene } from '@/components/art/Scene';
import { Stamp } from '@/components/art/Stamp';
import { Eyebrow, He, LinkButton, Wordmark } from '@/components/ui';

const brl = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const VIAJANTE = [
  ['Antes do embarque', 'Boas-vindas com a marca da agência, contagem regressiva, o roteiro dia a dia e os lugares explicados antes da chegada.'],
  ['Durante a viagem', 'O dia de hoje em destaque, as paradas com orientações e o contexto de cada lugar, em texto feito para ler no celular.'],
  ['Hebraico de verdade', 'Expressões por situação, com escrita hebraica correta, transliteração pensada para brasileiros e prática com correção.'],
  ['Depois da volta', 'O passaporte com os selos conquistados, o resumo do que foi explorado e a mensagem final da agência.'],
];

const AGENCIA = [
  ['Roteiro por etapas', 'Dias, paradas, horários quando houver, orientações. Reordene sem refazer nada.'],
  ['Biblioteca cultural', 'Conteúdo revisado, reutilizado entre caravanas. A sugestão vem dos destinos do seu roteiro.'],
  ['Publicação segura', 'O viajante só vê o que foi publicado. Mudou algo importante? A tela avisa antes.'],
  ['Convites pessoais', 'Um link e um QR por viajante, com limite de aparelhos e revogação a qualquer momento.'],
];

export default function Home() {
  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Wordmark />
        <nav className="flex items-center gap-2">
          <Link href="/entrar" className="rounded-full px-4 py-2 text-small font-semibold text-ink-soft hover:bg-stone-100">
            Entrar
          </Link>
          <LinkButton href="/demo" size="sm">
            Ver demonstração
          </LinkButton>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-14">
        <div className="anim-rise">
          <Eyebrow>Para agências e organizadores de caravanas a Israel</Eyebrow>
          <h1 className="mt-4 font-display text-[2.6rem] font-medium leading-[1.05] tracking-[-0.025em] text-ink sm:text-[3.6rem]">
            A viagem começa <span className="italic text-sea">antes</span> do embarque.
          </h1>
          <p className="mt-6 max-w-xl text-[1.1rem] leading-relaxed text-ink-soft">
            Uma experiência digital com a marca da sua agência: roteiro, história dos lugares, hebraico prático e um passaporte de selos. Acompanha cada viajante antes,
            durante e depois da caravana, sem substituir o guia nem os seus canais oficiais.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/demo" size="lg">
              Abrir a demonstração
            </LinkButton>
            <LinkButton href="#planos" size="lg" variant="secondary">
              Ver planos
            </LinkButton>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[22rem]" aria-hidden>
          <div className="rounded-[2.4rem] bg-ink p-2.5 shadow-float">
            <div className="overflow-hidden rounded-[1.9rem] bg-paper">
              <Scene name="jerusalem" className="h-48 w-full" />
              <div className="relative -mt-14 px-4 pb-6">
                <div className="rounded-lg bg-paper-raised p-4 ring-1 ring-stone-200 shadow-card">
                  <p className="text-micro font-semibold uppercase tracking-[0.14em] text-stone-600">
                    <He className="normal-case tracking-normal text-sea">שָׁלוֹם</He> · Shalom, Ana!
                  </p>
                  <p className="mt-1.5 font-display text-[1.45rem] font-medium leading-tight">Caravana Descubra Israel</p>
                  <div className="mt-3 flex items-end justify-between border-t border-dashed border-stone-300 pt-3">
                    <p className="text-micro text-stone-600">Embarque em maio</p>
                    <p className="font-display text-[2rem] leading-none text-sea">
                      42 <span className="text-micro font-sans uppercase tracking-[0.14em] text-stone-600">dias</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-center gap-1">
                  <Stamp slug="hero-1" title="Explorador de Jerusalém" art="arch" ink="#2E4A6B" earned size={82} />
                  <Stamp slug="hero-2" title="Primeiras palavras" art="aleph" ink="#1F3B57" earned size={82} />
                  <Stamp slug="hero-3" title="Explorador de Massada" art="mesa" ink="#9A5B2E" earned={false} size={82} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-sand/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <Eyebrow>O que o viajante recebe</Eyebrow>
            <ol className="mt-6 space-y-7">
              {VIAJANTE.map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[2.5rem_1fr] gap-3">
                  <span className="tabular font-display text-display-m italic text-ochre">{i + 1}</span>
                  <div>
                    <p className="font-display text-title font-medium">{t}</p>
                    <p className="mt-1 text-small text-ink-soft">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <Eyebrow>O que a agência controla</Eyebrow>
            <ul className="mt-6 divide-y divide-stone-300/70 border-y border-stone-300/70">
              {AGENCIA.map(([t, d]) => (
                <li key={t} className="py-5">
                  <p className="font-semibold text-ink">{t}</p>
                  <p className="mt-1 text-small text-ink-soft">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="planos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Eyebrow>Planos</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-display text-display-l font-medium tracking-[-0.02em]">Cobrança por participante ou por grupo.</h2>
        <p className="mt-3 max-w-2xl text-small text-stone-600">Valores de referência para o lançamento, sujeitos a mudança. Nenhuma cobrança é feita pela plataforma nesta etapa: a contratação é combinada diretamente.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <article key={p.id} className={`flex flex-col rounded-lg p-6 ring-1 ${p.id === 'completa' ? 'bg-ink text-paper ring-ink' : 'bg-paper-raised ring-stone-200'}`}>
              <p className="font-display text-title font-medium">{p.name}</p>
              <p className="mt-4 font-display text-display-m font-medium">
                {brl(p.priceCents)}
                <span className={`ml-1 font-sans text-small font-normal ${p.id === 'completa' ? 'text-stone-300' : 'text-stone-600'}`}>
                  {p.priceUnit === 'participant' ? 'por participante' : `por grupo de até ${p.groupSize}`}
                </span>
              </p>
              <ul className={`mt-5 flex-1 space-y-1.5 text-small ${p.id === 'completa' ? 'text-stone-200' : 'text-ink-soft'}`}>
                {p.features.map((f) => (
                  <li key={f}>· {FEATURE_LABEL[f]}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-stone-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-small text-stone-600 sm:px-6">
          <Wordmark />
          <p>Conteúdo cultural com fontes citadas. Hebraico revisado por falante nativo antes de ir ao ar.</p>
        </div>
      </footer>
    </main>
  );
}
