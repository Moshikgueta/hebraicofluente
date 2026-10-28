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

import { INSTAGRAM, PERFIL_LINKEDIN } from '@/lib/professor';
import Link from 'next/link';
import { useState } from 'react';
import { He } from '@/components/hebrew/He';
import { audioAvailable } from '@/components/learn/AudioButton';
import { ancora, brl, fimDoPreLancamento, flagship, parcelasMax, pixPrice } from '@/lib/catalog';
import { METODO_ORIGINAL } from '@/lib/credito';
import { DEPOIMENTOS } from '@/lib/testimonials';
import { confirmaSozinho, empresa, parcelasTexto, soPix, temPix } from '@/lib/empresa';
import { Container, H2, Reveal, Rubrica, Check, CheckList, Chevron } from './base';
import { precoDeVitrine } from '@/lib/vitrine';
import { oQueOCursoInclui } from '@/lib/inclui';
import { perguntasDaCapa } from './faq-capa';

const TEM_AUDIO = audioAvailable();

/* ── 8 · quem está por trás (o resumo) ───────────────────────────────────
   A história inteira mora em /sobre (Trajetoria.tsx), a pedido do dono do
   curso: na capa ela era longa demais. Aqui fica o que decide a leitura em
   dez segundos - quem é, o que junta, e o link para o resto. Só fatos que o
   dono deu, e nenhum além (ver Trajetoria.tsx). */
const RESUMO = [
  'Israelense, fala cinco idiomas',
  'Professor de hebraico no Brasil',
  'Gerente Pedagógico em Tel Aviv',
  /* Letras está em curso (UNINTER): "Formação CELTA e Letras" se lê como
     graduação concluída (auditoria de 01/10, CONV-005). Mesma forma em
     /sobre (Trajetoria.tsx, REUNE). O dono confirmou em 01/10/2026: não
     concluiu; a forma é "estudos em Letras" em todo lugar. */
  'Formação CELTA e estudos em Letras'
];

export function Professor({ retrato }: { retrato: string | null }) {
  return (
    <section id="sobre" aria-labelledby="sobre-titulo">
      <Container className="pt-20 sm:pt-28">
        <div className="grid gap-8 lg:gap-[56px] grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] sm:items-center">
          <Reveal>
            {/* `object-top`: num retrato o rosto fica no terço de cima. */}
            {retrato ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={retrato}
                alt="Moshik Gueta, professor e criador do Hebraico Fluente"
                width={680} height={850} loading="lazy" decoding="async"
                className="aspect-[4/5] w-full max-w-[240px] sm:max-w-none rounded-[16px]
                           shadow-[0_0_0_1px_rgba(27,33,31,.06)] object-cover object-top bg-[var(--sand)]"
              />
            ) : (
              <div className="aspect-[4/5] max-w-[240px] sm:max-w-none rounded-[16px] bg-[var(--sand)]
                              grid place-items-center">
                <span className="grid place-items-center w-24 h-24 rounded-[26px] bg-[var(--navy)]">
                  <span style={{ fontSize: 46, marginTop: -3, lineHeight: 1 }}>
                    <He size="inline" tone="lite" className="leading-none">ע</He>
                  </span>
                </span>
              </div>
            )}
          </Reveal>
          <Reveal delay={100}>
            <Rubrica letra="ז" className="mb-5">Quem está por trás do Hebraico Fluente</Rubrica>
            <h2 id="sobre-titulo"
                className="font-display font-semibold text-[clamp(26px,3vw,38px)] leading-[1.1]
                           tracking-[-0.03em] text-balance m-0 mb-4 max-w-[24ch]">
              De Israel ao Brasil: um professor que ensina, aprende e pensa idiomas.
            </h2>
            <p className="font-ui text-[17px] sm:text-[18px] leading-[1.65] text-ink-muted max-w-[56ch] mb-5">
              Sou Moshik Gueta. Foi ensinando hebraico a brasileiros, em Curitiba, que entendi onde
              quem começa do zero trava. O Hebraico Fluente transforma o que funcionava nas minhas
              aulas em uma metodologia que você segue no seu ritmo.
            </p>
            {/* Os quatro fatos eram quatro selos com borda. Viraram uma ficha
                de duas colunas sob fios: credencial se lê como currículo, não
                como etiqueta. */}
            <ul className="grid sm:grid-cols-2 gap-x-8 list-none p-0 m-0 mb-7 border-t border-line max-w-[620px]">
              {RESUMO.map(t => (
                <li key={t} className="flex items-center gap-3 py-3 border-b border-line
                                       font-ui text-[15px] font-medium text-ink-body">
                  <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-[var(--gold)] shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/sobre"
                    className="group inline-flex items-center gap-2 font-ui text-[16px] font-semibold text-[var(--teal-ink)]
                               hover:text-[var(--teal-ink)]">
                Conheça a minha história
                <span aria-hidden className="transition-transform duration-[180ms] group-hover:translate-x-[3px]">→</span>
              </Link>
              <a href={PERFIL_LINKEDIN} target="_blank" rel="noopener noreferrer me"
                 className="inline-flex items-center gap-1.5 font-ui text-[16px] font-semibold text-[var(--teal-ink)]
                            underline underline-offset-[3px] decoration-[1.5px]">
                Ver meu perfil no LinkedIn
                <span aria-hidden>↗</span>
                <span className="sr-only"> (abre em outra aba)</span>
              </a>
              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-1.5 font-ui text-[16px] font-semibold text-[var(--teal-ink)]
                            underline underline-offset-[3px] decoration-[1.5px]">
                Instagram
                <span aria-hidden>↗</span>
                <span className="sr-only"> do Hebraico Fluente (abre em outra aba)</span>
              </a>
            </div>
            {/* O crédito ao método de origem fica na capa também: é aqui que
                ela fala de quem fez o curso. Ver lib/credito.ts. */}
            <p className="mt-6 pt-5 border-t border-[color:var(--line-soft)]
                          font-ui text-[14.5px] leading-[1.6] text-ink-muted max-w-[60ch]">
              O método parte do trabalho de <strong className="font-semibold text-ink">
              {METODO_ORIGINAL.autor}</strong>, autor de{' '}
              <He size="inline">{METODO_ORIGINAL.obraHe}</He>{' '}
              ({METODO_ORIGINAL.obraTranslit}). O conteúdo do livro dele é a base do
              que esta plataforma ensina. {METODO_ORIGINAL.adaptacoesPt}
            </p>
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
  { t: 'Sequência de estudos', d: 'Os dias seguidos contam. Faltar um dia não apaga seu XP nem seu recorde, e uma folga guardada protege a sequência.', paths: ['M10 2.5c1.9 3 .8 4.5-.6 6-1.3 1.4-2.4 2.7-2.4 4.6a3 3 0 0 0 6 0c0-.9-.3-1.6-.7-2.3 2 1 3.2 2.6 3.2 4.6'] },
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
/* Só letras das lições 1 e 2 (א מ ת · נ ה י), que é o que a Lição 3, de
   prática, revisa. A versão anterior perguntava pelo Shin (lição 4), com
   Lámed (5) e Bet (14) de opção: uma "questão real da Lição 3" que a Lição
   3 nunca faria, contra a própria regra do curso (auditoria de 28/09,
   COM-004). */
const AMOSTRA: readonly [string, string][] = [['נ', 'Nun'], ['מ', 'Mem'], ['ת', 'Tav'], ['ה', 'He']];

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
              Qual letra faz o som N?
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
                               transition-[border-color,background-color,transform] duration-[220ms] hover:-translate-y-[2px]"
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
                    <span className="ml-auto font-ui font-bold text-[14px] text-[var(--teal-ink)]">+10 XP</span>
                  </p>
                  <p className="font-ui text-[14.5px] leading-[1.55] text-[var(--teal-body)]">
                    Nun faz o som N. Mem faz M, Tav faz T e He faz o H aspirado: as quatro
                    vêm das duas primeiras lições.
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
                    {AMOSTRA[escolha]![1]} tem outro som. Procure a letra estreita, de base
                    curta - pode tentar de novo.
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

  /* O título diz quantos são. "Quem já está lendo." sobre um depoimento só
     sugeria uma turma inteira (auditoria de persuasão de 20/10/2026). */
  const titulo = DEPOIMENTOS.length === 1 ? 'O que diz uma aluna.' : 'O que dizem os alunos.';
  const paragrafos = (c: string) => c.split(/\n\s*\n/);

  return (
    <section aria-labelledby="depoimentos-titulo">
      <Container className="pt-20 sm:pt-28">
        {/* Um depoimento só vira uma citação de página inteira, como num
            livro: rótulo e assinatura numa coluna estreita, o texto na
            outra. O cartão de meia largura deixava a outra metade da tela
            vazia, e vazio ao lado de um depoimento lê como "faltou gente". */}
        {DEPOIMENTOS.length === 1 ? (() => {
          const t = DEPOIMENTOS[0]!;
          const ps = paragrafos(t.citacao);
          return (
            <figure className="m-0 grid gap-8 lg:gap-16 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]
                               border-t border-line pt-10">
              <div className="grid content-start gap-6">
                <Rubrica>Depoimento</Rubrica>
                <H2 id="depoimentos-titulo" className="!text-[clamp(28px,3vw,38px)]">{titulo}</H2>
                <figcaption className="grid gap-1">
                  <span className="font-ui text-[16px] font-semibold text-ink">{t.nome}</span>
                  <span className="font-ui text-[14px] leading-[1.5] text-ink-muted">{t.contexto}</span>
                  {t.resultado && (
                    <span className="mt-3 inline-flex items-center gap-2 font-ui text-[14px] font-semibold
                                     text-[var(--teal-ink)]">
                      <Check size={15} />
                      {t.resultado}
                    </span>
                  )}
                </figcaption>
              </div>
              <blockquote className="relative m-0 grid gap-5 lg:pl-10 lg:border-l lg:border-line">
                <span aria-hidden className="font-display font-semibold text-[72px] leading-[.6] text-[var(--teal)] h-[28px]">“</span>
                {ps.map((par, j) => (
                  <p key={j}
                     className={j === 0
                       ? 'm-0 font-display text-[clamp(20px,2vw,24px)] leading-[1.45] font-medium tracking-[-0.015em] text-ink'
                       : 'm-0 font-ui text-[16.5px] sm:text-[17px] leading-[1.65] text-ink-body max-w-[62ch]'}>
                    {par}{j === ps.length - 1 ? '”' : ''}
                  </p>
                ))}
              </blockquote>
            </figure>
          );
        })() : (
          <>
            <Rubrica className="mb-5">Depoimentos</Rubrica>
            <H2 id="depoimentos-titulo" className="mb-8">{titulo}</H2>
            {/* `min(275px,100%)`: com o texto em 150% num telefone, sobram
                ~260px, e um mínimo fixo empurrava a página (npm run a11y). */}
            <ul className="grid gap-4 list-none p-0 m-0 [grid-template-columns:repeat(auto-fit,minmax(min(275px,100%),1fr))]">
              {DEPOIMENTOS.map((t, i) => (
                <li key={t.nome + i}
                    className="rounded-[20px] bg-[var(--card)] shadow-[0_0_0_1px_var(--line)] p-6 grid content-start gap-4">
                  <span className="grid">
                    <span className="font-ui text-[16px] font-semibold text-ink">{t.nome}</span>
                    <span className="font-ui text-[13.5px] text-ink-muted">{t.contexto}</span>
                  </span>
                  {t.resultado && (
                    <span className="inline-flex items-center gap-2 font-ui text-[13.5px] font-semibold text-[var(--teal-ink)]">
                      <Check size={14} />{t.resultado}
                    </span>
                  )}
                  <blockquote className="m-0 grid gap-3">
                    {paragrafos(t.citacao).map((par, j, todos) => (
                      <p key={j} className="m-0 font-ui text-[15.5px] leading-[1.6] text-ink-body">
                        {j === 0 ? '“' : ''}{par}{j === todos.length - 1 ? '”' : ''}
                      </p>
                    ))}
                  </blockquote>
                </li>
              ))}
            </ul>
          </>
        )}
      </Container>
    </section>
  );
}

/* ── 12 · o preço ───────────────────────────────────────────────────────── */
/* `owned` troca a coluna da direita inteira.
 * ─────────────────────────────────────────────────────────────────────────
 * Mostrar o preço e um "Começar agora" a quem já pagou é a plataforma
 * esquecendo o cliente na própria capa - e no lugar mais constrangedor
 * possível, a caixa de preço. Quem já tem o curso vê a porta dele. */
export function Preco({ href, label, owned }: { href: string; label: string; owned: boolean }) {
  const c = flagship();
  const parcelas = parcelasMax(c.price);
  const pix = pixPrice(c.price);
  const cheio = ancora(c.price);

  /* O que se recebe, em itens concretos e conferidos no produto: a lista
     mora em lib/inclui.ts, a mesma que o cartão da capa lê. */
  const inclui = oQueOCursoInclui();

  return (
    <section id="preco">
      <Container className="pt-20 sm:pt-28">
        <div className="rounded-[22px] bg-[var(--card)]
                        shadow-[0_0_0_1px_var(--line),0_2px_4px_rgba(27,33,31,.04),0_34px_70px_-40px_rgba(14,59,67,.32)]
                        p-6 sm:p-[44px] sm:py-12
                        grid grid-cols-[minmax(0,1fr)] gap-10 lg:gap-[52px]
                        lg:grid-cols-[minmax(0,1fr)_minmax(0,330px)] lg:items-center">
          <div className="min-w-0">
            <Rubrica className="mb-5">Pagamento único, sem mensalidade</Rubrica>
            {/* O nome do catálogo, o mesmo de /cursos e do checkout. Aqui
                estava "Curso de Alfabetização Hebraica", um terceiro nome
                para o mesmo produto. */}
            <h2 className="font-display font-semibold text-[clamp(28px,3.4vw,40px)] leading-[1.08]
                           tracking-[-0.03em] m-0 mb-3.5">
              {c.titlePt}
            </h2>
            <p className="font-ui text-[17px] sm:text-[17.5px] leading-[1.6] text-ink-muted max-w-[46ch] mb-6">
              Acesso completo à plataforma, com progresso salvo e revisões liberadas
              conforme você avança.
            </p>
            <CheckList items={inclui} columns={2} />
          </div>

          <div className="min-w-0 rounded-[16px] bg-[var(--sand)] px-6 sm:px-7 py-8 text-center">
            {owned ? (
              <>
                <p className="font-ui text-[14.5px] text-ink-muted mb-1.5">Na sua conta</p>
                <p className="font-display text-[26px] sm:text-[29px] font-semibold tracking-[-0.025em]
                              leading-[1.15] text-ink mb-6">
                  Este curso já é seu.
                </p>
              </>
            ) : (
              <>
                {/* O rótulo diz POR QUE o preço é este. "Acesso completo" em
                    cima de um número riscado não explica nada; "preço de
                    pré-lançamento" explica, e é o que está sendo praticado. */}
                <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em]
                              text-[var(--teal-ink)] mb-1.5">
                  {cheio ? 'Preço de pré-lançamento' : 'Acesso completo'}
                </p>
                <p className="font-display text-[48px] sm:text-[54px] font-semibold tracking-[-0.04em]
                              leading-none text-ink tabular-nums mb-2">
                  {brl(precoDeVitrine())}
                </p>
                <p className="font-ui text-[14.5px] text-ink-muted mb-6">
                  {/* Em quantas vezes, e não quanto por vez: a taxa do cartão
                      é repassada ao comprador, então quem fecha o valor da
                      parcela é a operadora. Ver `parcelasMax` em catalog.ts. */}
                  {soPix()
                    ? <>no PIX, à vista</>
                    : <>ou {parcelasTexto(parcelas)} no cartão</>}
                </p>
              </>
            )}
            <Link href={href}
                  className="group flex items-center justify-center gap-2 rounded-[12px] bg-[var(--navy)]
                             min-h-[54px] text-white font-ui font-semibold text-[17px] mb-4
                             shadow-[0_1px_2px_rgba(14,59,67,.2),0_8px_20px_-10px_rgba(14,59,67,.55)]
                             transition-[background-color,transform] duration-150 ease-out
                             hover:bg-[var(--navy-2)] active:scale-[.98]">
              {label}
              <span aria-hidden
                    className="transition-transform duration-150 ease-out group-hover:translate-x-[3px]">→</span>
            </Link>
            {/* "No PIX sai por X" é a promessa de preço mais visível do site
                inteiro, e ela só pode existir enquanto o PIX puder ser
                cobrado. Sem PIX habilitado na conta do provedor (ver
                `pagamento.formas`), a frase some e fica o prazo de acesso,
                que continua verdadeiro. Anunciar um desconto que o checkout
                não dá é o erro que só aparece depois do clique. */}
            <p className="font-ui text-[13.5px] leading-[1.5] text-ink-muted tabular-nums">
              {owned
                ? 'Seu progresso continua exatamente onde você parou.'
                : !temPix()
                  ? <>Acesso liberado na hora da confirmação, por {c.accessMonths} meses.</>
                  : confirmaSozinho()
                    ? <>No PIX sai por {brl(pix)} ({c.price.pixDiscountPct}% de desconto). Acesso liberado na hora da confirmação,
                       por {c.accessMonths} meses.</>
                    : <>No PIX sai por {brl(pix)} ({c.price.pixDiscountPct}% de desconto). Acesso liberado à mão depois de
                       conferido o pagamento, por {c.accessMonths} meses.</>}
            </p>
            {/* A desistência (CDC art. 49) é o maior redutor de risco que o
                site tem para quem não conhece o criador, e até 01/10/2026 ela
                só aparecia no checkout, em /suporte e num acordeão de /faq
                (auditoria, CONV-001). Aqui, ao lado do botão, é onde o
                tráfego frio decide. O prazo vem de data/empresa.json, o mesmo
                que a Política de Reembolso lê; `check-legal.mjs` confere que
                a frase saiu no HTML. Não é "garantia": é o direito do CDC,
                dito como ele é. */}
            {!owned && (
              <p className="mt-2 font-ui text-[13.5px] leading-[1.5] text-ink-muted">
                {empresa.politicas.arrependimentoDias} dias para desistir e receber 100% de volta, sem justificar.
              </p>
            )}
            {/* O número riscado diz "é mais barato"; esta linha diz o que ele
                É. Sem ela, o riscado vira preço de referência inventado - e no
                Brasil isso é publicidade enganosa, não licença poética. Some
                sozinha no dia em que o listBrl virar null. */}
            {!owned && cheio && (
              <p className="mt-2 font-ui text-[13.5px] leading-[1.5] font-medium text-[var(--teal-ink)]">
                {fimDoPreLancamento(c.price)
                  ? <>Preço de pré-lançamento até {fimDoPreLancamento(c.price)}. Depois, o curso passa a custar {brl(cheio)}.</>
                  : <>Depois do pré-lançamento, o curso passa a custar {brl(cheio)}.</>}
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── 13 · as dúvidas ────────────────────────────────────────────────────── */
export function Faq() {
  const PERGUNTAS = perguntasDaCapa();
  const [aberta, setAberta] = useState(-1);

  return (
    <section id="duvidas" aria-labelledby="duvidas-titulo">
      <Container className="pt-20 sm:pt-28 grid gap-8 lg:gap-16 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div>
          <Rubrica className="mb-5">Antes de começar</Rubrica>
          <H2 id="duvidas-titulo" className="mb-3">Dúvidas frequentes</H2>
          {/* Uma linha de apoio, e ela diz o ESCOPO - não pede desculpa por
              nada e não anuncia o que falta. Onde há limitação, ela está na
              resposta que a pergunta pede. */}
          <p className="font-ui text-[17px] leading-[1.6] text-ink-muted max-w-[40ch]">
            O que o curso cobre, como funciona o acesso e o que esperar por dentro da plataforma.
          </p>
        </div>
        {/* Perguntas sob fios, e não oito caixas: a lista se lê de cima a
            baixo como um índice, e a pergunta aberta não muda de cor de
            borda (só o chevron gira). A resposta fechada fica no HTML, com
            `hidden`: o JSON-LD FAQPage (lib/jsonld.ts) e a página dizem o
            mesmo, e o leitor de tela sabe que há conteúdo. */}
        <div className="border-t border-line">
          {PERGUNTAS.map(([q, a], i) => {
            const open = aberta === i;
            const id = `duvida-${i}`;
            return (
              <div key={q} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setAberta(open ? -1 : i)}
                  aria-expanded={open}
                  aria-controls={id}
                  className="w-full flex items-center gap-4 py-5 text-left"
                >
                  <span className="flex-1 font-ui text-[16.5px] sm:text-[17px] font-semibold text-ink">{q}</span>
                  <Chevron open={open} />
                </button>
                <div id={id} hidden={!open}>
                  <p className="pb-6 pr-8 font-ui text-[16px] leading-[1.65] text-ink-body max-w-[64ch]">
                    {a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ── 14 · o fecho ───────────────────────────────────────────────────────── */
const PALAVRAS: readonly { he: string; tr: string; pt: string }[] = [
  { he: 'שָׁלוֹם', tr: 'shalóm', pt: 'olá, paz' },
  { he: 'תוֹדָה', tr: 'todá', pt: 'obrigado' },
  { he: 'מַיִם', tr: 'máyim', pt: 'água' }
];

/* O `id` não é para link nenhum: é o alvo que a barra fixa do celular
   observa para sumir de cima do último pedido da página. Ver BarraFixa.tsx. */
export function CtaFinal({ href, label }: { href: string; label: string }) {
  return (
    <section id="fecho">
      <Container className="mt-20 sm:mt-28">
        {/* Navy liso. O brilho radial teal que havia no topo era o gradiente
            de todo banner de fechamento; aqui quem dá a luz é o hebraico. */}
        <div className="relative overflow-hidden rounded-[22px] bg-[var(--navy)] px-6 py-14 sm:px-12 sm:py-[76px] text-center">
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
                  className="group inline-flex items-center gap-2 rounded-[12px] bg-white text-[var(--navy)]
                             min-h-[56px] font-ui font-semibold text-[18px] px-8
                             transition-[background-color,transform] duration-150 ease-out
                             hover:bg-[var(--cream)] active:scale-[.98]">
              {label}
              <span aria-hidden
                    className="transition-transform duration-[180ms] group-hover:translate-x-[3px]">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
