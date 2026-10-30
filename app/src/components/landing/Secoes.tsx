'use client';

/* Problema · Demonstração · Método · Currículo · Jornada.
 * ─────────────────────────────────────────────────────────────────────────
 * O miolo da landing. Duas notas que valem para o arquivo inteiro:
 *
 * · O CONTEÚDO REAL MANDA. O protótipo foi desenhado antes de o curso
 *   existir e fala em "6 módulos, 14 lições" com letras inventadas para o
 *   exemplo. Aqui o currículo é montado a partir de content/course.json - os
 *   sete módulos que existem, com as letras e os objetivos que eles de fato
 *   ensinam. Uma landing que promete um número e entrega outro é um pedido
 *   de reembolso com passos extras.
 * · Todo hebraico passa por <He>, inclusive as letras soltas nos cabeçalhos
 *   dos módulos. É o contrato do projeto e não abre exceção para enfeite.
 * · O ÁUDIO É CONDICIONAL, pelo mesmo motivo que em Fecho.tsx - e aqui a
 *   lição foi aprendida mais tarde, o que é o registro honesto. O Fecho já
 *   tinha duas versões de cada frase sobre gravação; este arquivo não, e por
 *   isso o site se contradizia: o FAQ dizia "as gravações estão em produção"
 *   enquanto esta seção listava "Áudio gravado por falante nativo" como coisa
 *   entregue, punha "escuta" entre os tipos de exercício e desenhava uma
 *   maquete de exercício de escuta com botão de tocar. A parte que vendia era
 *   justamente a que estava errada, e no Brasil a oferta vincula.
 *   Quem decide é o manifesto: no dia em que as gravações entrarem, estas
 *   frases voltam sozinhas.
 */

import { useState } from 'react';
import { stripNikud } from '@/lib/hebrew';
import { He } from '@/components/hebrew/He';
import { Prose } from '@/components/hebrew/Prose';
import { DiagramaDeTracado } from './DiagramaDeTracado';
import { course, totalLicoes } from '@/lib/content-publico';
import { allCourses, isPlayable } from '@/lib/catalog';
import { Container, H2, Lead, Reveal, Rubrica, Check, CheckList, Chevron } from './base';
import { ABAS, MAQUETE, PASSOS, TEM_AUDIO } from './copy';
import { quantasEtapasPt } from '@/lib/etapas-da-licao';
import { tx } from '@/i18n/telas/venda-secoes';


/* ── 3 · o problema ─────────────────────────────────────────────────────── */
const PROBLEMAS = [
  tx.problema1,
  tx.problema2,
  tx.problema3,
  tx.problema4
];

export function Problema() {
  return (
    <section id="como" className="bg-[var(--sand)] border-y border-line">
      <Container className="py-16 sm:py-[88px]">
        <Reveal>
          <H2 className="max-w-[20ch] mb-10">{tx.problemaTitulo}</H2>
        </Reveal>
        <ul className="grid gap-4 list-none p-0 m-0 [grid-template-columns:repeat(auto-fit,minmax(235px,1fr))]">
          {PROBLEMAS.map((t, i) => (
            <Reveal as="li" key={t} delay={i * 80}
                    className="rounded-[18px] bg-[var(--card)] border border-line p-6
                               transition-shadow duration-[250ms] hover:shadow-[var(--sh)]">
              <span aria-hidden className="mb-4 w-9 h-9 rounded-[11px] bg-[var(--sand)]
                                           grid place-items-center font-ui font-bold text-[14px] text-ink-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="font-ui text-[17px] leading-[1.5] font-medium text-ink">{t}</p>
            </Reveal>
          ))}
        </ul>
        <Reveal delay={200} className="mt-10 flex gap-3.5 items-stretch max-w-[62ch]">
          <span aria-hidden className="w-[3px] rounded-full bg-[var(--teal)] shrink-0" />
          <p className="font-display text-[20px] sm:text-[22px] leading-[1.4] font-medium tracking-[-0.015em] text-ink">
            {tx.problemaFecho}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

/* ── 4 · a demonstração ─────────────────────────────────────────────────── */

export function Demonstracao() {
  const [aba, setAba] = useState(0);
  const d = ABAS[aba]!;

  return (
    <section id="curso">
      <Container className="pt-16 sm:pt-24">
        <Reveal><H2 className="mb-3">{tx.demoTitulo}</H2></Reveal>
        <Reveal delay={80}><Lead className="mb-8">
          {tx.demoLead}
        </Lead></Reveal>

        <div role="tablist" aria-label={tx.demoAbas}
             className="inline-flex flex-wrap gap-1 rounded-[14px] bg-[var(--sand)] border border-line p-1 mb-6">
          {ABAS.map((t, i) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={aba === i}
              onClick={() => setAba(i)}
              className={`rounded-[10px] px-[18px] py-[9px] font-ui text-[15px] font-semibold
                          transition-[background-color,color,box-shadow] duration-[220ms]
                          ${aba === i
                            ? 'bg-[var(--card)] text-[var(--navy)] shadow-[var(--sh-tab)]'
                            : 'text-ink-muted hover:text-ink'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="rounded-[26px] bg-[var(--navy)] p-6 sm:p-[34px]
                        grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center">
          <div>
            <p className="inline-block rounded-full bg-white/10 px-3 py-1.5
                          font-ui text-[13px] font-semibold text-[var(--teal-lite)] mb-4">
              {d.kicker}
            </p>
            <h3 className="font-display text-[26px] sm:text-[30px] leading-[1.12] tracking-[-0.025em]
                           font-semibold text-white m-0 mb-3.5">
              {d.title}
            </h3>
            <p className="font-ui text-[16px] sm:text-[17px] leading-[1.6] text-white/70 max-w-[42ch] mb-[22px]">
              {d.body}
            </p>
            <CheckList items={d.points} color="var(--teal-lite)" textClass="text-white/90" />
          </div>
          <div className="rounded-[20px] bg-[var(--card)] p-6 min-h-[330px] flex flex-col">
            {aba === 0 && <PainelAula />}
            {aba === 1 && <PainelEscrita />}
            {aba === 2 && <PainelPratica />}
            {aba === 3 && <PainelRevisao />}
            {aba === 4 && <PainelProgresso />}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-ui text-[13px] font-semibold uppercase tracking-[.08em] text-ink-muted mb-3.5">
      {children}
    </p>
  );
}

function PainelAula() {
  return (
    <>
      <Rotulo>{tx.rotuloLicao(tx.aprender)}</Rotulo>
      <div className="rounded-[16px] bg-[var(--sand)] px-4 py-[22px] text-center mb-4">
        <He size="plate" tone="navy">שׁ</He>
        <p className="font-ui text-[17px] font-semibold text-ink mt-1.5">{tx.shin}</p>
        <p className="font-ui text-[14.5px] text-[var(--teal-ink)]">{tx.aulaSom}</p>
      </div>
      <p className="font-ui text-[15.5px] leading-[1.6] text-ink-muted">
        {tx.aulaPonto}
      </p>
    </>
  );
}

/* A escrita, com o diagrama DE VERDADE - e não com o leitor do curso.
 *
 * ── o que esta aba já derrubou ──────────────────────────────────────────
 * Aqui ficava `StrokeOrderPlayer`, o componente que roda dentro da lição. A
 * intenção era boa - mostrar o exercício em vez de uma imitação dele -, mas
 * ele lê `strokesFor()`, que lê o depósito de conteúdo PAGO. Esse depósito só
 * é enchido pelo `CourseGate`, e a landing é pública: nunca passa por um.
 *
 * Então `dados()` fazia o que foi escrito para fazer - lançava -, e como isso
 * acontecia durante o render, o React derrubava a ÁRVORE INTEIRA. Quem
 * clicasse em «Escrita» não via um painel vazio: via a landing inteira virar
 * «Application error: a client-side exception has occurred». Medido no
 * navegador, em 1280px e em 390px, na build local e na de plataforma - não
 * era um defeito só de produção.
 *
 * O diagrama estático resolve sem abrir exceção nenhuma na fronteira: ele sai
 * do MESMO contorno de fonte, na mesma execução do exportador, e já é um
 * arquivo público servido em `/stroke-order/`. A regra da casa continua
 * inteira - página pública lê de `content-publico`, nunca de `content` -, e
 * `tests/conteudo.test.ts` agora percorre o grafo de imports para que a volta
 * disto não dependa de alguém lembrar.
 */
function PainelEscrita() {
  return (
    <>
      <Rotulo>{tx.rotuloLicao(tx.escrever)}</Rotulo>
      <DiagramaDeTracado letterId="shin" label={tx.shin} movimentos={1} className="mb-3" />
      <p className="font-ui text-[15px] leading-[1.55] text-ink-muted">
        {tx.escritaTexto}
      </p>
    </>
  );
}

/* A maquete do exercício, e ela mostra um exercício que EXISTE hoje.
 *
 * Com gravação, é o de escuta: toca o clipe e pergunta qual som foi. Sem
 * gravação, esse exercício está desligado no curso - então a maquete vira o
 * de reconhecimento, que faz a pergunta ao contrário e é o que o aluno vai
 * encontrar de verdade. As quatro opções são as mesmas nos dois casos, porque
 * a confusão entre ש · ס · צ · ז é a mesma. */
function PainelPratica() {
  const opcoes: readonly [string, string, boolean][] = [
    ['ש', 'SH', true], ['ס', 'S', false], ['צ', 'TS', false], ['ז', 'Z', false]
  ];
  return (
    <>
      <Rotulo>{tx.rotuloLicao(MAQUETE.praticaRotulo)}</Rotulo>
      <p className="font-ui text-[18px] font-semibold text-ink mb-4">
        {MAQUETE.praticaPergunta}
      </p>
      {TEM_AUDIO && (
        <span className="self-start inline-flex items-center gap-2 rounded-full bg-[var(--teal-soft)]
                         px-[18px] py-2.5 font-ui text-[14.5px] font-semibold text-[var(--teal-ink)] mb-4">
          <span aria-hidden className="w-[9px] h-[9px] rounded-full bg-[var(--teal)] animate-pulse-dot" />
          {tx.reproduzir}
        </span>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        {opcoes.map(([he, rot, ok]) => (
          <div key={rot}
               className={`rounded-[14px] px-2 py-3 text-center
                           ${ok ? 'border-2 border-[var(--teal)] bg-[var(--teal-soft)]'
                                : 'border-[1.5px] border-line bg-[var(--card)]'}`}>
            <He size="word" tone="navy">{he}</He>
            <p className={`font-ui text-[13px] font-semibold ${ok ? 'text-[var(--teal-ink)]' : 'text-ink-muted'}`}>
              {rot}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

function PainelRevisao() {
  const fila: readonly [string, string, string][] = [
    ['ס', tx.samech, tx.confundidaMem],
    ['ע', tx.ayin, tx.confundidaAlef],
    ['ט', tx.tet, tx.tresErros],
    ['ח', tx.het, tx.somGutural]
  ];
  return (
    <>
      <p className="font-ui text-[13px] font-semibold uppercase tracking-[.08em] text-ink-muted mb-1.5">
        {tx.revisaoHoje}
      </p>
      <p className="font-ui text-[18px] font-semibold text-ink mb-4">{tx.revisaoQuantas}</p>
      <ul className="grid gap-2.5 list-none p-0 m-0">
        {fila.map(([he, nome, motivo]) => (
          <li key={nome} className="flex items-center gap-3.5 rounded-[14px] border border-line px-3.5 py-[11px]">
            <span className="min-w-[30px] text-center"><He size="word" tone="navy">{he}</He></span>
            <span className="flex-1 min-w-0">
              <span className="block font-ui text-[15px] font-semibold text-ink">{nome}</span>
              <span className="block font-ui text-[13.5px] text-ink-muted">{motivo}</span>
            </span>
            <span className="rounded-full bg-[var(--gold-soft)] px-[9px] py-1
                             font-ui text-[12px] font-bold text-[var(--gold)]">{tx.revisar}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function PainelProgresso() {
  /* As 22 letras na ordem em que o curso as ensina, e não na do alfabeto -
     é a mesma ordem do mapa lá dentro. */
  const letras = course.modules.flatMap(m => m.letterIds).map(id => course.letters.find(l => l.id === id)?.letter ?? '');
  return (
    <>
      <Rotulo>{tx.seuProgresso}</Rotulo>
      <div className="flex gap-2.5 mb-4">
        {([['42%', tx.doCurso], ['9', tx.letrasFirmes], ['7', tx.diasSeguidos]] as const).map(([n, l]) => (
          <div key={l} className="flex-1 rounded-[14px] bg-[var(--sand)] px-3 py-3.5">
            <p className="font-display text-[25px] font-semibold tracking-[-0.025em] leading-[1.1] text-ink">{n}</p>
            <p className="font-ui text-[13px] text-ink-muted mt-0.5">{l}</p>
          </div>
        ))}
      </div>
      <p className="font-ui text-[14px] text-ink-muted mb-2.5">{tx.dominio22}</p>
      <div className="flex flex-wrap gap-1.5">
        {letras.map((c, i) => (
          <span key={i}
                className="w-[30px] h-[30px] rounded-[9px] grid place-items-center"
                style={{
                  background: i < 9 ? 'var(--teal-soft)' : i < 12 ? 'var(--gold-soft)' : 'var(--sand)',
                  color: i < 9 ? 'var(--teal-ink)' : i < 12 ? 'var(--gold-ink)' : 'var(--locked)'
                }}>
            <He size="inline" className="!text-[19px] !leading-none" tone={i < 9 ? 'teal' : 'muted'}>{c}</He>
          </span>
        ))}
      </div>
    </>
  );
}

/* ── 5 · o método ───────────────────────────────────────────────────────── */

export function Metodo() {
  return (
    <section id="metodo">
      <Container className="pt-20 sm:pt-28">
        <Rubrica letra="ה" className="mb-5">{tx.metodoRubrica}</Rubrica>
        <H2 className="max-w-[20ch] mb-3">{tx.metodoTitulo}</H2>
        {/* O número vem do ARRAY, nunca escrito à mão. Ele estava: a página
            dizia "Seis passos" e renderizava cinco, porque `PASSOS` perde o
            "Ouça" enquanto não há gravação e ninguém voltou na frase. Um
            número errado na página que explica o método é pequeno e caro -
            é a seção que existe para dizer "aqui a gente é exato". */}
        <Lead className="mb-10 sm:mb-12">
          {tx.metodoLead(quantasEtapasPt())}
        </Lead>

        {/* As etapas como colunas sob um fio, e não círculos numerados ligados
            por uma linha que crescia na rolagem: a sequência já está na ordem
            de leitura, e o traço teal no topo de cada coluna marca o começo
            de cada etapa sem desenhar uma linha do tempo de modelo pronto. */}
        <ol className="grid gap-x-7 gap-y-9 list-none p-0 m-0 border-t border-line
                       sm:grid-cols-2 lg:grid-cols-5">
          {PASSOS.map(([t, d], i) => (
            <li key={t} className="relative pt-6">
              <span aria-hidden className="absolute -top-px left-0 h-[2px] w-10 bg-[var(--teal)]" />
              <span aria-hidden className="block font-display text-[15px] font-semibold tracking-[-0.01em]
                                           text-[var(--teal-ink)] tabular-nums mb-3">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="font-display text-[20px] font-semibold tracking-[-0.018em] text-ink mb-2">{t}</p>
              <p className="font-ui text-[15px] leading-[1.55] text-ink-muted">{d}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ── 6 · o currículo ────────────────────────────────────────────────────── */

/* O percurso, antes do acordeão.
 * ─────────────────────────────────────────────────────────────────────────
 * Sete módulos fechados num acordeão contam a matéria, mas escondem a FORMA
 * do curso. E a forma aqui tem uma notícia dentro: as letras acabam no
 * módulo 5. Os dois últimos não ensinam letra nenhuma - ensinam a ler o que
 * já se sabe sem as muletas (o ponto que some na rua, o apóstrofo dos sons
 * importados). Quem só vê a lista pensa que o curso perdeu o fôlego no fim;
 * quem vê a barra entende que o fim é outra coisa.
 *
 * Por isso a divisão não está escrita aqui: ela é LIDA de course.json, pelo
 * único critério que a define (`letterIds.length > 0`). No dia em que um
 * módulo novo trouxer letras, a barra se redesenha sozinha - e continua
 * verdadeira, que é o ponto do arquivo inteiro.
 *
 * A largura de cada trecho é proporcional às lições, não igual: um módulo
 * de seis lições ocupando o mesmo espaço de um de duas seria um gráfico
 * mentindo sobre a própria escala.
 */
function Percurso() {
  const mods = course.modules;
  const licoes = totalLicoes();
  const comLetras = mods.filter(m => m.letterIds.length > 0);
  const depois = mods.filter(m => m.letterIds.length === 0);

  /* "Módulos 1-5" / "Módulo 6" - o rótulo acompanha o que o dado disser. */
  const faixa = (lista: typeof mods) => {
    const ns = lista.map(m => m.n);
    const a = Math.min(...ns), b = Math.max(...ns);
    return a === b ? tx.modulo(a) : tx.modulos(a, b);
  };

  if (comLetras.length === 0 || depois.length === 0) return null;

  return (
    <Reveal>
      <div className="mb-10 sm:mb-12 rounded-[16px] bg-[var(--sand)] p-6 sm:p-7">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1.5 mb-5">
          {([
            [mods.length, tx.contaModulos],
            [licoes, tx.contaLicoes],
            [course.letters.length, tx.contaLetras]
          ] as const).map(([n, r]) => (
            <p key={r} className="font-ui text-[15px] text-ink-muted m-0">
              <b className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink
                            tabular-nums align-baseline mr-1.5">{n}</b>
              {r}
            </p>
          ))}
        </div>

        <div className="flex gap-[3px] h-2 mb-5" aria-hidden>
          {mods.map(m => (
            <span
              key={m.id}
              style={{ flexGrow: m.lessons.length || 1 }}
              className={`rounded-[2px] ${m.letterIds.length > 0
                ? 'bg-[var(--teal)]' : 'bg-[var(--gold)]'}`}
            />
          ))}
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 list-none p-0 m-0">
          <li className="flex gap-2.5 items-start">
            <span aria-hidden className="mt-[5px] w-2.5 h-2.5 rounded-full bg-[var(--teal)] shrink-0" />
            <span className="min-w-0">
              <span className="block font-ui text-[15px] font-semibold text-ink">
                {tx.faixaLetras(faixa(comLetras), course.letters.length)}
              </span>
              <span className="block font-ui text-[14.5px] leading-[1.5] text-ink-muted">
                {tx.faixaLetrasTexto}
              </span>
            </span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span aria-hidden className="mt-[5px] w-2.5 h-2.5 rounded-full bg-[var(--gold)] shrink-0" />
            <span className="min-w-0">
              <span className="block font-ui text-[15px] font-semibold text-ink">
                {tx.faixaSemApoio(faixa(depois))}
              </span>
              <span className="block font-ui text-[14.5px] leading-[1.5] text-ink-muted">
                {tx.faixaSemApoioTexto}
              </span>
            </span>
          </li>
        </ul>
      </div>
    </Reveal>
  );
}

export function Curriculo() {
  const [aberto, setAberto] = useState(0);
  const modulos = course.modules;

  return (
    <section>
      <Container className="pt-20 sm:pt-28">
        <Rubrica letra="ו" className="mb-5">{tx.curriculoRubrica}</Rubrica>
        <H2 className="mb-3">{tx.curriculoTitulo}</H2>
        <Lead className="mb-9">
          {tx.curriculoLead(modulos.length)}
        </Lead>

        <Percurso />

        {/* Um índice, não sete cartões: linhas separadas por fio, como o
            sumário de um livro. O conteúdo fechado fica no HTML (`hidden`),
            para quem busca e para o leitor de tela; abrir não anima a altura,
            só troca o estado. */}
        <div className="border-t border-line">
          {modulos.map((m, i) => {
            const open = aberto === i;
            const letras = m.letterIds
              .map(id => course.letters.find(l => l.id === id)?.letter)
              .filter((x): x is string => !!x);
            const painel = `modulo-${m.id}`;
            return (
              <div key={m.id} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setAberto(open ? -1 : i)}
                  aria-expanded={open}
                  aria-controls={painel}
                  className="group w-full flex items-center gap-4 sm:gap-6 py-5 sm:py-6 text-left"
                >
                  <span aria-hidden
                        className={`w-8 shrink-0 font-display text-[15px] font-semibold tabular-nums
                                    transition-colors duration-150
                                    ${open ? 'text-[var(--teal-ink)]' : 'text-ink-muted'}`}>
                    {String(m.n).padStart(2, '0')}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-display text-[18px] sm:text-[21px] font-semibold
                                     tracking-[-0.02em] text-ink">
                      {m.titlePt}
                    </span>
                    <span className="block font-ui text-[14px] sm:text-[14.5px] text-ink-muted mt-0.5 tabular-nums">
                      {tx.nLicoes(m.lessons.length)}
                      {letras.length > 0 && ` · ${tx.nLetras(letras.length)}`}
                    </span>
                  </span>
                  {letras.length > 0 && (
                    <span className="hidden sm:flex gap-[9px] shrink-0">
                      {letras.map(l => (
                        <He key={l} size="inline" className="!text-[22px] !leading-[1.1]" dim>{l}</He>
                      ))}
                    </span>
                  )}
                  <Chevron open={open} />
                </button>
                <div id={painel} hidden={!open}>
                  {/* Aonde o módulo leva (30/10/2026): a frase de chegada do curso, a
                      mesma do mapa, com a palavra dela em destaque. Antes ficava numa
                      seção à parte, que repetia os sete módulos. */}
                  {m.milestonePt && <ChegadaDoModulo m={m} anterior={modulos} />}
                  {/* `min(200px,100%)`: com o texto em 150% num telefone, um
                      mínimo fixo de 200px empurrava a página para o lado. */}
                  <div className="sm:pl-14 pb-7 grid gap-x-8 gap-y-3
                                  [grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr))]">
                    {m.goalsPt.map((g, k) => (
                      <p key={k} className="flex gap-2.5 items-start font-ui text-[15px] leading-[1.5] text-ink-body">
                        <span className="mt-1"><Check size={14} /></span>
                        <span className="min-w-0"><Prose text={g} /></span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* A chegada de um módulo: a palavra que a frase cita, grande, e a frase. No
   módulo 6 (sem os pontos) a palavra é o שָׁלוֹם do módulo 3 sem o nikud, que é
   exatamente o que aquele módulo ensina. */
const marcaDe = (t: string): string | null => t.match(/\{\{([^}]+)\}\}/)?.[1] ?? null;

function ChegadaDoModulo({ m, anterior }: {
  m: (typeof course.modules)[number]; anterior: readonly (typeof course.modules)[number][];
}) {
  const palavra = marcaDe(m.milestonePt!);
  const doTres = marcaDe(anterior.find(x => Number(x.n) === 3)?.milestonePt ?? '');
  const semPontos = !palavra && Number(m.n) === 6 && doTres ? stripNikud(doTres) : null;
  return (
    <div className="sm:ml-14 mb-5 flex items-center gap-4 rounded-[14px] bg-[var(--sand)] px-4 py-3.5">
      {(palavra || semPontos) && (
        <He size="word" tone="navy" className="shrink-0 !leading-[1.2]">{(palavra ?? semPontos)!}</He>
      )}
      <p className="m-0 font-ui text-[15px] leading-[1.5] text-ink-body min-w-0">
        <Prose text={m.milestonePt!} />
      </p>
    </div>
  );
}

/* ── 7 · a jornada ──────────────────────────────────────────────────────── */
export function Jornada() {
  const cursos = allCourses();
  return (
    <section className="mt-16 sm:mt-24 bg-[var(--sand)] border-y border-line">
      <Container className="py-16 sm:py-[88px]">
        <Reveal><H2 className="mb-3">{tx.jornadaTitulo}</H2></Reveal>
        <Reveal delay={80}><Lead className="mb-10">
          {tx.jornadaLead}
        </Lead></Reveal>
        <ul className="grid gap-3.5 list-none p-0 m-0 [grid-template-columns:repeat(auto-fit,minmax(176px,1fr))]">
          {cursos.map((c, i) => {
            const aberto = isPlayable(c);
            return (
              <Reveal as="li" key={c.slug} delay={i * 70}
                      className={`rounded-[18px] border-[1.5px] p-6
                                  ${aberto ? 'bg-[var(--navy)] border-[var(--navy)]'
                                           : 'bg-[var(--card)] border-line'}`}>
                <span className="flex items-center justify-between mb-3.5">
                  <span className={`font-ui text-[12.5px] font-bold uppercase tracking-[.09em]
                                    ${aberto ? 'text-[var(--teal-lite)]' : 'text-ink-muted'}`}>
                    {aberto ? tx.disponivel : tx.emBreve}
                  </span>
                  {aberto
                    ? <Check size={17} color="var(--teal-lite)" />
                    : <Cadeado />}
                </span>
                <p className={`font-display text-[20px] font-semibold tracking-[-0.02em] mb-1.5
                               ${aberto ? 'text-white' : 'text-ink'}`}>
                  {c.titlePt}
                </p>
                <p className={`font-ui text-[14.5px] leading-[1.5] ${aberto ? 'text-white/70' : 'text-ink-muted'}`}>
                  {c.taglinePt}
                </p>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

function Cadeado() {
  return (
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="3.6" y="7.8" width="10.8" height="7.4" rx="2" stroke="#9AA29E" strokeWidth="1.4" />
      <path d="M6.2 7.8V5.9a2.8 2.8 0 0 1 5.6 0v1.9" stroke="#9AA29E" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
