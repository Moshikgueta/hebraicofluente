'use client';

/* Professor · Recursos · Aula de amostra · Depoimentos · Preço · FAQ · CTA.
 * ─────────────────────────────────────────────────────────────────────────
 * A metade de baixo da landing, onde a página deixa de mostrar e passa a
 * pedir. Três lugares em que o texto do protótipo foi corrigido contra o
 * produto, e o motivo importa mais que a mudança:
 *
 * · PREÇO. O protótipo mostra "R$ XXX" porque foi desenhado antes de haver
 *   preço. Aqui ele sai de data/courses.json, que é o mesmo arquivo que o
 *   checkout cobra - a página de vendas não pode anunciar um número e a
 *   cobrança fazer outro.
 * · ÁUDIO. O texto do protótipo promete "gravado por falante nativo" em
 *   quatro lugares. As gravações ainda não existem (AUDIO_MANIFEST vazio, e
 *   o curso mostra "áudio em breve" em vez de usar voz sintética). Prometer
 *   na venda o que a lição não entrega é o começo de um pedido de reembolso,
 *   então a frase tem duas versões e quem escolhe é o manifesto: no dia em
 *   que as gravações entrarem, a landing passa a prometê-las sozinha.
 * · ACESSO. O protótipo diz "vitalício". O catálogo concede 12 meses. Vale o
 *   catálogo.
 */

import Link from 'next/link';
import { useState } from 'react';
import { He } from '@/components/hebrew/He';
import { audioAvailable } from '@/components/learn/AudioButton';
import { brl, flagship, installment, pixPrice } from '@/lib/catalog';
import { course } from '@/lib/content';
import { DEPOIMENTOS } from '@/lib/testimonials';
import { Container, H2, Reveal, Check, CheckList, Chevron } from './base';

const TEM_AUDIO = audioAvailable();

/* ── 8 · o professor ────────────────────────────────────────────────────── */
const CREDENCIAIS = [
  'Experiência ensinando hebraico no Brasil',
  'Atuação como shaliach da Agência Judaica',
  'Formação acadêmica e pedagógica em ensino de idiomas',
  'Alunos de diferentes países e níveis'
];

export function Professor() {
  return (
    <section id="sobre">
      <Container className="pt-16 sm:pt-24">
        <div className="grid gap-10 lg:gap-[56px] lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-center">
          <Reveal>
            {/* Sem foto ainda. Em vez do aviso "retrato entra aqui", que é um
                bilhete para nós exibido a quem está comprando, o espaço mostra
                a marca. Trocar é pôr o arquivo e apontar um <Image> aqui. */}
            <div className="aspect-[4/5] rounded-[22px] border border-line bg-[var(--sand)]
                            grid place-items-center">
              <span className="grid place-items-center w-24 h-24 rounded-[26px] bg-[var(--navy)]">
                <span style={{ fontSize: 46, marginTop: -3, lineHeight: 1 }}>
                  <He size="inline" tone="lite" className="leading-none">ע</He>
                </span>
              </span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="font-ui text-[13px] font-bold uppercase tracking-[.11em] text-[var(--teal)] mb-3.5">
              Quem criou o Hebraico Fluente
            </p>
            <h2 className="font-display font-semibold text-[clamp(28px,3.4vw,40px)] leading-[1.08]
                           tracking-[-0.03em] m-0 mb-4">
              Moshik Gueta
            </h2>
            <p className="font-ui text-[17px] sm:text-[18px] leading-[1.65] text-ink-muted max-w-[52ch] mb-4">
              Professor de hebraico e idiomas, com experiência no ensino de hebraico para
              brasileiros. Ensinar nas duas direções - hebraico para quem fala português e
              português para quem fala hebraico - mostrou exatamente onde o aluno brasileiro trava.
            </p>
            <p className="font-display text-[20px] sm:text-[21px] leading-[1.45] font-medium
                          tracking-[-0.015em] text-ink max-w-[46ch] mb-6">
              O método nasceu da experiência de ensinar hebraico especificamente para quem
              fala português.
            </p>
            <CheckList items={CREDENCIAIS} columns={2} textClass="text-ink-muted" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ── 9 · os recursos ────────────────────────────────────────────────────── */
type Recurso = { t: string; d: string; paths: string[] };

const RECURSOS: Recurso[] = [
  {
    t: TEM_AUDIO ? 'Áudio e pronúncia' : 'Pronúncia explicada',
    d: TEM_AUDIO
      ? 'Cada letra, sílaba e palavra gravada por falante nativo.'
      : 'Cada som comparado com um som que você já faz em português.',
    paths: ['M4 8v4M7 5.5v9M10 3v14M13 5.5v9M16 8v4']
  },
  { t: 'Correção imediata', d: 'Você sabe na hora se acertou - e por que errou.', paths: ['M4 10.5 8 14.5 16 5.5'] },
  { t: 'Sequência de estudos', d: 'Os dias seguidos contam, e faltar um não zera nada.', paths: ['M10 2.5c1.9 3 .8 4.5-.6 6-1.3 1.4-2.4 2.7-2.4 4.6a3 3 0 0 0 6 0c0-.9-.3-1.6-.7-2.3 2 1 3.2 2.6 3.2 4.6'] },
  { t: 'Progresso visual', d: 'Percentual por módulo e mapa de domínio das letras.', paths: ['M4 16V9M9 16V4M14 16v-5'] },
  { t: 'Revisão inteligente', d: 'O que escapa volta sozinho, no intervalo certo.', paths: ['M16 6.5A6.5 6.5 0 1 0 17 10', 'M16 3v3.5h-3.5'] },
  { t: 'Estude no celular', d: 'Uma atividade por tela, botão de continuar sempre à mão.', paths: ['M6.5 2.5h7a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 16V4a1.5 1.5 0 0 1 1.5-1.5Z', 'M9 15h2'] },
  { t: 'Explicações em português', d: 'Comparações com o som que você já conhece, sempre.', paths: ['M3 10a7 7 0 1 1 7 7H3.5l1.8-2.1A6.97 6.97 0 0 1 3 10Z'] },
  { t: 'Hebraico desde o zero', d: 'Nenhum conhecimento prévio. Começa na primeira letra.', paths: ['M10 3.5 3 7l7 3.5L17 7l-7-3.5Z', 'M3 13l7 3.5L17 13'] }
];

export function Recursos() {
  return (
    <section>
      <Container className="pt-16 sm:pt-24">
        <Reveal><H2 className="mb-8">O que vem junto com o curso.</H2></Reveal>
        <ul className="grid gap-3.5 list-none p-0 m-0 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
          {RECURSOS.map((f, i) => (
            <Reveal as="li" key={f.t} delay={i * 55}
                    className="rounded-[18px] bg-[var(--card)] border border-line p-6
                               transition-[box-shadow,border-color] duration-[250ms]
                               hover:shadow-[var(--sh)] hover:border-[#D3CEC0]">
              <span aria-hidden className="mb-4 w-10 h-10 rounded-[12px] bg-[var(--teal-soft)] grid place-items-center">
                <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
                  {f.paths.map((d, k) => (
                    <path key={k} d={d} stroke="var(--teal)" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" />
                  ))}
                </svg>
              </span>
              <p className="font-display text-[18px] font-semibold tracking-[-0.015em] text-ink mb-1.5">{f.t}</p>
              <p className="font-ui text-[15px] leading-[1.55] text-ink-muted">{f.d}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ── 10 · a aula de amostra ─────────────────────────────────────────────── */
const AMOSTRA: readonly [string, string][] = [['ש', 'Shin'], ['מ', 'Mem'], ['ל', 'Lámed'], ['ב', 'Bet']];

export function AulaAmostra({ href }: { href: string }) {
  const [escolha, setEscolha] = useState<number | null>(null);
  const certo = escolha === 0;

  return (
    <section id="aula">
      <Container className="pt-16 sm:pt-24">
        <div className="rounded-[30px] bg-[var(--navy)] p-7 sm:p-[44px] sm:py-[52px]
                        grid gap-10 lg:gap-[52px] lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center">
          <div>
            <h2 className="font-display font-semibold text-[clamp(30px,3.6vw,42px)] leading-[1.08]
                           tracking-[-0.03em] text-white m-0 mb-4">
              Experimente antes de começar.
            </h2>
            <p className="font-ui text-[17px] sm:text-[18px] leading-[1.6] text-white/70 max-w-[40ch] mb-6">
              Uma questão real da Lição 3, do jeito que ela aparece dentro da plataforma.
              Escolha uma opção.
            </p>
            <Link href={href}
                  className="inline-flex items-center rounded-[13px] bg-white text-[var(--navy)]
                             font-ui font-semibold text-[17px] px-7 py-[15px]
                             transition-transform duration-[180ms] hover:-translate-y-[2px]">
              Ver o curso por dentro
            </Link>
          </div>

          <div className="rounded-[22px] bg-[var(--card)] p-6 sm:px-[26px] sm:py-7">
            <p className="font-ui text-[13px] font-semibold uppercase tracking-[.08em] text-ink-muted mb-2">
              Lição 3 · Reconhecimento
            </p>
            <p className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink mb-5">
              Qual letra representa o som SH?
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4.5">
              {AMOSTRA.map(([he, nome], i) => {
                const marcada = escolha === i;
                const bom = marcada && i === 0;
                const ruim = marcada && i !== 0;
                return (
                  <button
                    key={nome}
                    type="button"
                    onClick={() => setEscolha(i)}
                    className="rounded-[16px] border-2 px-3 py-5 flex flex-col items-center gap-1.5
                               transition-all duration-[220ms] hover:-translate-y-[2px]"
                    style={{
                      background: bom ? 'var(--teal-soft)' : ruim ? 'var(--gold-soft)' : 'var(--card)',
                      borderColor: bom ? 'var(--teal)' : ruim ? '#D9B872' : 'var(--line)'
                    }}
                  >
                    <He size="lg" tone={bom ? 'teal' : 'navy'}>{he}</He>
                    <span className="font-ui text-[13px] font-semibold"
                          style={{ color: bom ? 'var(--teal-ink)' : ruim ? 'var(--gold-ink)' : 'var(--ink-muted)' }}>
                      {nome}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Altura reservada: sem ela o cartão salta 74px no primeiro toque. */}
            <div className="min-h-[74px]" aria-live="polite">
              {escolha === null && (
                <p className="font-ui text-[14.5px] leading-[1.5] text-ink-muted pt-1.5">
                  Escolha uma das quatro letras acima.
                </p>
              )}
              {escolha !== null && certo && (
                <div className="rounded-[14px] bg-[var(--teal-soft)] px-4 py-3.5 animate-pop">
                  <p className="flex items-center gap-2.5 mb-1">
                    <Check size={17} color="var(--teal-ink)" />
                    <span className="font-ui font-bold text-[16px] text-[var(--teal-ink)]">Muito bem!</span>
                    <span className="ml-auto font-ui font-bold text-[14px] text-[var(--teal)]">+10 XP</span>
                  </p>
                  <p className="font-ui text-[14.5px] leading-[1.55] text-[var(--teal-body)]">
                    Shin é a única com o ponto em cima à direita. É esse ponto que faz o som SH.
                  </p>
                </div>
              )}
              {escolha !== null && !certo && (
                <div className="rounded-[14px] bg-[var(--gold-soft)] px-4 py-3.5 animate-pop">
                  <p className="flex items-center gap-2.5 mb-1">
                    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden>
                      <path d="M9 4.6v5.2M9 12.9v.1" stroke="var(--gold-ink)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="font-ui font-bold text-[16px] text-[var(--gold-ink)]">Quase.</span>
                  </p>
                  <p className="font-ui text-[14.5px] leading-[1.55] text-[var(--gold-body)]">
                    {AMOSTRA[escolha]![1]} tem outro som. Procure a letra de três hastes, com um
                    ponto em cima à direita - pode tentar de novo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── 11 · os depoimentos ────────────────────────────────────────────────── */
export function Depoimentos() {
  /* Enquanto não houver depoimento de verdade, a seção não existe. Ver a
     nota em lib/testimonials.ts. */
  if (DEPOIMENTOS.length === 0) return null;

  const fundos = ['var(--teal-soft)', 'var(--gold-soft)', '#EAEEF0'];
  const tintas = ['var(--teal-ink)', 'var(--gold-ink)', 'var(--navy)'];

  return (
    <section>
      <Container className="pt-16 sm:pt-24">
        <Reveal><H2 className="mb-8">Quem já está lendo.</H2></Reveal>
        <ul className="grid gap-4 list-none p-0 m-0 [grid-template-columns:repeat(auto-fit,minmax(275px,1fr))]">
          {DEPOIMENTOS.map((t, i) => (
            <Reveal as="li" key={t.nome + i} delay={i * 80}
                    className="rounded-[18px] bg-[var(--card)] border border-line p-6">
              <span className="flex items-center gap-3 mb-4.5">
                <span aria-hidden
                      className="w-[42px] h-[42px] rounded-full grid place-items-center
                                 font-ui font-bold text-[15px]"
                      style={{ background: fundos[i % 3], color: tintas[i % 3] }}>
                  {t.iniciais}
                </span>
                <span className="grid">
                  <span className="font-ui text-[16px] font-semibold text-ink">{t.nome}</span>
                  <span className="font-ui text-[13.5px] text-ink-muted">{t.contexto}</span>
                </span>
              </span>
              <span className="inline-block rounded-full bg-[var(--teal-soft)] px-[11px] py-[5px]
                               font-ui text-[13px] font-semibold text-[var(--teal-ink)] mb-3.5">
                {t.resultado}
              </span>
              <p className="font-ui text-[15.5px] leading-[1.6] text-ink-muted">{t.citacao}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ── 12 · o preço ───────────────────────────────────────────────────────── */
export function Preco({ href }: { href: string }) {
  const c = flagship();
  const parcela = installment(c.price);
  const pix = pixPrice(c.price);

  const inclui = [
    `Curso completo, ${course.modules.reduce((n, m) => n + m.lessons.length, 0)} lições`,
    'Exercícios interativos',
    TEM_AUDIO ? 'Áudios de todas as letras e palavras' : 'Explicação de som para cada letra',
    'Revisões liberadas automaticamente',
    'Acesso à plataforma, no celular e no computador',
    'Progresso salvo, retoma de onde parou'
  ];

  return (
    <section id="preco">
      <Container className="pt-16 sm:pt-24">
        <div className="rounded-[30px] bg-[var(--card)] border border-line shadow-[var(--sh-price)]
                        p-7 sm:p-[44px] sm:py-12
                        grid gap-10 lg:gap-[52px] lg:grid-cols-[minmax(0,1fr)_minmax(0,330px)] lg:items-center">
          <div>
            <p className="inline-block rounded-full bg-[var(--teal-soft)] px-3 py-1.5
                          font-ui text-[13px] font-bold uppercase tracking-[.06em] text-[var(--teal-ink)] mb-4.5">
              Curso 1 de uma trilha
            </p>
            <h2 className="font-display font-semibold text-[clamp(28px,3.4vw,40px)] leading-[1.08]
                           tracking-[-0.03em] m-0 mb-3.5">
              Curso de Alfabetização Hebraica
            </h2>
            <p className="font-ui text-[17px] sm:text-[17.5px] leading-[1.6] text-ink-muted max-w-[46ch] mb-6">
              Acesso completo à plataforma, com progresso salvo e revisões liberadas
              conforme você avança.
            </p>
            <CheckList items={inclui} columns={2} />
          </div>

          <div className="rounded-[22px] bg-[var(--sand)] px-7 py-8 text-center">
            <p className="font-ui text-[14.5px] text-ink-muted mb-1.5">Acesso completo</p>
            <p className="font-display text-[44px] sm:text-[48px] font-semibold tracking-[-0.035em]
                          leading-none text-ink mb-1">
              {brl(c.price.brl)}
            </p>
            <p className="font-ui text-[14.5px] text-ink-muted mb-6">
              ou {parcela.n}× de {brl(parcela.brl)}
            </p>
            <Link href={href}
                  className="block rounded-[13px] bg-[var(--navy)] text-white font-ui font-semibold
                             text-[17px] py-[15px] mb-3.5 transition-[background-color,transform]
                             duration-[180ms] hover:bg-[var(--navy-2)] hover:-translate-y-[2px]">
              Começar agora
            </Link>
            <p className="font-ui text-[13.5px] leading-[1.5] text-ink-muted">
              No PIX sai por {brl(pix)}. Acesso liberado na hora da confirmação,
              por {c.accessMonths} meses.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── 13 · as dúvidas ────────────────────────────────────────────────────── */
export function Faq() {
  const c = flagship();
  const licoes = course.modules.reduce((n, m) => n + m.lessons.length, 0);

  const PERGUNTAS: readonly [string, string][] = [
    ['Preciso saber hebraico?',
     'Não. O curso começa do zero absoluto, na primeira letra, e assume que você nunca viu o alfabeto.'],
    ['É hebraico moderno ou bíblico?',
     'A leitura é a mesma. O curso usa a pronúncia do hebraico moderno e vocabulário do dia a dia, o que abre os dois caminhos.'],
    ['Quanto tempo leva?',
     `São ${course.totalLetters} letras em ${licoes} lições, mais os checkpoints. Em vinte minutos por dia, a maioria termina em seis a oito semanas.`],
    ['O curso funciona no celular?',
     'Sim. A plataforma foi desenhada primeiro para o celular: uma atividade por tela e o botão de continuar sempre à mão.'],
    ['Tem áudio?',
     TEM_AUDIO
       ? 'Cada letra, sílaba e palavra tem áudio gravado por falante nativo, com repetição livre.'
       : 'As gravações estão em produção. Enquanto não entram, o curso não usa voz sintética: cada som é explicado por comparação com um som do português, e os exercícios de escuta ficam desativados em vez de virar adivinhação.'],
    ['Por quanto tempo tenho acesso?',
     `${c.accessMonths} meses a partir da confirmação do pagamento, incluindo as atualizações feitas no curso nesse período.`],
    ['Posso estudar no meu ritmo?',
     'Sim. Não há turmas nem prazos. O progresso fica salvo e você retoma exatamente de onde parou.'],
    ['O que acontece depois que termino?',
     'Você entra na trilha: Hebraico A1 é o próximo nível. Alunos da Alfabetização são avisados primeiro quando ele abre.']
  ];

  const [aberta, setAberta] = useState(-1);

  return (
    <section id="duvidas">
      <div className="mx-auto w-full max-w-[820px] px-5 sm:px-7 pt-16 sm:pt-24">
        <H2 className="mb-8">Dúvidas frequentes</H2>
        <div className="grid gap-2">
          {PERGUNTAS.map(([q, a], i) => {
            const open = aberta === i;
            return (
              <div key={q}
                   className={`rounded-[16px] bg-[var(--card)] border overflow-hidden
                               transition-colors duration-[250ms]
                               ${open ? 'border-[var(--teal)]' : 'border-line'}`}>
                <button
                  type="button"
                  onClick={() => setAberta(open ? -1 : i)}
                  aria-expanded={open}
                  className="w-full flex items-center gap-4 px-5 sm:px-[22px] py-[19px] text-left"
                >
                  <span className="flex-1 font-ui text-[16px] sm:text-[17px] font-semibold text-ink">{q}</span>
                  <Chevron open={open} />
                </button>
                <div className="overflow-hidden transition-[max-height] duration-[320ms] ease-[var(--ease)]"
                     style={{ maxHeight: open ? 260 : 0 }}>
                  <p className="px-5 sm:px-[22px] pb-5 font-ui text-[15.5px] sm:text-[16px]
                                leading-[1.65] text-ink-muted">
                    {a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── 14 · o fecho ───────────────────────────────────────────────────────── */
const PALAVRAS: readonly { he: string; tr: string; pt: string }[] = [
  { he: 'שָׁלוֹם', tr: 'shalom', pt: 'olá, paz' },
  { he: 'תּוֹדָה', tr: 'todá', pt: 'obrigado' },
  { he: 'מַיִם', tr: 'máyim', pt: 'água' }
];

export function CtaFinal({ href }: { href: string }) {
  return (
    <section>
      <Container className="mt-16 sm:mt-24">
        <div className="relative overflow-hidden rounded-[30px] bg-[var(--navy)] px-7 py-14 sm:px-12 sm:py-[72px] text-center">
          <span aria-hidden className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(90% 120% at 50% 0%, rgba(143,214,200,.15), transparent 62%)' }} />
          <div className="relative">
            <ul className="flex flex-wrap justify-center gap-x-[26px] gap-y-6 list-none p-0 m-0 mb-9">
              {PALAVRAS.map(w => (
                <li key={w.tr} className="text-center">
                  <He size="lg" tone="paper">{w.he}</He>
                  <p className="font-ui text-[13.5px] text-[var(--teal-lite)] mt-0.5">{w.tr}</p>
                  <p className="font-ui text-[14.5px] text-white/60">{w.pt}</p>
                </li>
              ))}
            </ul>
            <h2 className="font-display font-semibold text-[clamp(28px,3.9vw,46px)] leading-[1.1]
                           tracking-[-0.032em] text-white text-balance max-w-[19ch] mx-auto mb-7">
              A próxima palavra em hebraico pode ser a primeira que você realmente consegue ler.
            </h2>
            <Link href={href}
                  className="inline-flex items-center rounded-[14px] bg-white text-[var(--navy)]
                             font-ui font-semibold text-[18px] px-[34px] py-4
                             transition-transform duration-[180ms] hover:-translate-y-[2px]">
              Começar meu hebraico
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
