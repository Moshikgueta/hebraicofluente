'use client';

/* A primeira letra, aprendida na própria página de vendas.
 * ─────────────────────────────────────────────────────────────────────────
 * Esta seção existe para resolver a única objeção que nenhum texto resolve.
 * O visitante brasileiro olha para o alfabeto hebraico e pensa "isso parece
 * impossível". Nenhuma frase desfaz isso - nem "é mais fácil do que parece",
 * nem "milhares de alunos já conseguiram". O que desfaz é ele conseguir.
 *
 * Então a página para de descrever o curso e passa a ser o curso, por dois
 * minutos: ver a letra, achá-la entre outras parecidas, ESCREVÊ-LA com o
 * dedo e encontrá-la dentro de uma palavra de verdade. Sai do outro lado
 * tendo aprendido algo.
 *
 * A etapa de escrita foi acrescentada depois, e ela é a que mais muda a
 * conversa: reconhecer uma letra numa grade é agradável e não convence
 * ninguém de que aprendeu, porque o dedo não fez nada. Escrever é onde a
 * pessoa opera o produto - e onde descobre sozinha que a letra de mão não é
 * a mesma que ela viu, que é metade do que o curso existe para ensinar.
 *
 * ── o que aqui é promessa cumprida, e não enfeite ───────────────────────
 * A landing afirma três coisas sobre o método logo acima desta seção. As três
 * são executadas aqui, e é de propósito:
 *
 *   «uma letra de cada vez»  → a demo ensina UMA. Nenhuma tabela, nenhuma
 *                              segunda letra para decorar junto;
 *   «experiência interativa» → o quadro de escrita é o MESMO da lição, e não
 *                              uma captura dele;
 *   «apoio que sai sozinho»  → a leitura mostra a transliteração e diz, na
 *                              tela, que ela vai embora;
 *   «retorno imediato»       → o erro não é uma cruz vermelha: é uma frase
 *                              que diz onde olhar, e outra tentativa.
 *
 * Uma página que se diz interativa mostrando capturas de tela está mentindo
 * sobre a coisa mais fácil de conferir.
 *
 * ── o que NÃO se faz aqui ───────────────────────────────────────────────
 * Não se conta o erro, não se pontua, não se guarda nada. Isto não é o curso
 * com um pedaço de fora: é uma amostra, e uma amostra que castiga não é
 * amostra. O único número da tela é 1 de 22 - e ele existe para dizer o
 * tamanho do caminho, não para cobrar.
 *
 * ── acessibilidade ──────────────────────────────────────────────────────
 * Cor nunca sozinha: acerto leva ✓ e a palavra «Isso», erro leva ✕ e a frase
 * que ensina. Todo controle é <button> de verdade, alcançável pelo teclado e
 * com foco visível. O retorno vive num `aria-live` de altura reservada, para
 * o leitor de tela anunciar sem a página saltar debaixo do dedo. Com
 * `prefers-reduced-motion`, as animações não acontecem - e nada de
 * informativo depende delas.
 */

import Link from 'next/link';
import { useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { course } from '@/lib/content-publico';
import { brl, flagship } from '@/lib/catalog';
import { MESMA_LETRA } from '@/lib/cursiva';
import { TraceBoard, type QuadroHandle, type Veredito } from '@/components/learn/TraceBoard';
import { DiagramaDeTracado } from './DiagramaDeTracado';
import { track } from '@/lib/analytics';
import { Container, H2, Lead, Reveal, Check } from './base';

/* A letra vem do CATÁLOGO, e não escrita aqui: o glifo e o nome da primeira
   letra são os mesmos que a lição 1 usa, e um dia em que eles divergirem é um
   dia em que a amostra ensina outra coisa. `course.letters` é o esqueleto
   público - glifo e nome, sem nenhuma aula dentro. */
const ALEF = course.letters.find(l => l.id === 'alef');

/* As alternativas do reconhecimento.
   ─────────────────────────────────────────────────────────────────────────
   Não são quatro letras ao acaso. {{מ}} e {{ש}} têm, como o {{א}}, hastes que
   descem até a linha - é a confusão de quem está vendo hebraico pela primeira
   vez, e por isso elas são o teste. O {{ב}} entra por ser a segunda letra do
   alfabeto e aparecer na palavra da etapa seguinte. */
const OPCOES: readonly { he: string; certa: boolean; porque: string }[] = [
  { he: 'מ', certa: false, porque: 'Este é o Mem. Ele tem uma "perna" fechada à esquerda.' },
  { he: 'א', certa: true, porque: '' },
  { he: 'ש', certa: false, porque: 'Este é o Shin, e ele tem três hastes subindo, como um garfo.' },
  { he: 'ב', certa: false, porque: 'Este é o Bet, com a base reta apoiada na linha.' }
];

/* A palavra da leitura.
   ─────────────────────────────────────────────────────────────────────────
   {{אַבָּא}} tem uma propriedade que nenhuma outra palavra curta tem: o Álef
   aparece NAS DUAS PONTAS. Quem acabou de aprender uma letra consegue apontar
   dois terços de uma palavra hebraica real no primeiro minuto - e é essa
   sensação, e não a tradução, que faz a pessoa querer a segunda letra.

   E ela é uma palavra que um brasileiro reconhece de ouvido. */
const PALAVRA = { he: 'אַבָּא', translit: 'abá', pt: 'pai' } as const;

/* Cinco etapas, e a terceira é a que mais decide a compra.
   ─────────────────────────────────────────────────────────────────────────
   Reconhecer uma letra numa grade é agradável e não convence ninguém de que
   aprendeu: o dedo não fez nada. ESCREVER é o momento em que a pessoa deixa
   de assistir ao produto e opera o produto - e é também onde ela descobre,
   sem que ninguém precise afirmar, que a letra que se escreve à mão não é a
   mesma que ela acabou de ver. Essa descoberta vale mais do que o parágrafo
   que a explica, e é justamente o que o curso existe para ensinar.

   O quadro é o MESMO da lição (components/learn/TraceBoard.tsx), não uma
   imitação dele - inclusive a conta de coordenadas que sobrevive ao zoom do
   menu de acessibilidade. */
type Etapa = 0 | 1 | 2 | 3 | 4;
const TOTAL_ETAPAS = 5;
const ROTULOS = ['Conhecer', 'Reconhecer', 'Escrever', 'Ler', 'Pronto'] as const;

export function DemoAlef({
  href, micro, label, vende
}: {
  href: string;
  micro: string;
  /** O rótulo do passo, para quem NÃO está comprando. Ver lib/cta.ts. */
  label: string;
  /** Este visitante ainda pode comprar? Um aluno pagante não recebe preço. */
  vende: boolean;
}) {
  const [etapa, setEtapa] = useState<Etapa>(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [tentativas, setTentativas] = useState(0);
  const comecou = useRef(false);
  const foco = useRef<HTMLDivElement>(null);
  const quadro = useRef<QuadroHandle>(null);
  const [temTinta, setTemTinta] = useState(false);
  const [veredito, setVeredito] = useState<Veredito | null>(null);

  /* Uma letra sem glifo é uma seção que não pode existir. Nunca acontece - o
     catálogo sempre traz as 22 -, e mesmo assim a seção some inteira em vez
     de desenhar um buraco na página de vendas. */
  if (!ALEF) return null;

  const escolhida = escolha === null ? null : OPCOES[escolha]!;
  const acertou = !!escolhida?.certa;

  const avancar = (n: Etapa) => {
    setEtapa(n);
    /* O foco vai para o topo do cartão a cada etapa: sem isso, quem navega
       por teclado continua no botão que acabou de sumir e é devolvido ao
       começo do documento. */
    requestAnimationFrame(() => foco.current?.focus());
  };

  const iniciar = () => {
    if (!comecou.current) { comecou.current = true; track('demo_started', { letterId: 'alef' }); }
    avancar(1);
  };

  const responder = (i: number) => {
    const certa = !!OPCOES[i]?.certa;
    setEscolha(i);
    setTentativas(n => n + 1);
    track('demo_answered', { letterId: 'alef', correct: certa, chosen: OPCOES[i]?.he });
  };

  const limpar = () => { quadro.current?.limpar(); setVeredito(null); };

  const conferirEscrita = () => {
    const v = quadro.current?.conferir();
    if (!v) return;
    setVeredito(v);
    track('trace_completed', { letterId: 'alef', score: v.score, stage: 2 });
  };

  const concluir = () => {
    track('demo_completed', { letterId: 'alef' });
    avancar(4);
  };

  return (
    <section id="experimente" aria-labelledby="experimente-titulo">
      <Container className="pt-16 sm:pt-24">
        <Reveal>
          <p className="font-ui text-[13px] font-bold uppercase tracking-[.11em] text-[var(--teal)] mb-3.5">
            Teste grátis · 2 minutos
          </p>
          <H2 id="experimente-titulo" className="mb-3">
            Experimente aprender sua primeira letra.
          </H2>
        </Reveal>
        <Reveal delay={80}>
          <Lead className="mb-8">
            Sem cadastro e sem cartão. Você conhece a letra, encontra ela entre outras,
            escreve com o dedo e lê dentro de uma palavra - do mesmo jeito que acontece
            dentro do curso.
          </Lead>
        </Reveal>

        <Reveal delay={140}>
          <div className="rounded-[26px] border border-line bg-[var(--card)] overflow-hidden
                          shadow-[var(--sh-card)]">
            {/* ── a régua das etapas ───────────────────────────────────────
                Quatro traços e um rótulo. Diz onde a pessoa está e, mais
                importante, que o caminho é curto - a desistência numa demo
                acontece por não se saber quanto falta. */}
            <div className="flex items-center gap-3 px-5 sm:px-7 py-4 border-b border-[color:var(--line-soft)]">
              <ol className="flex items-center gap-1.5 list-none p-0 m-0 flex-1" aria-hidden>
                {ROTULOS.map((r, i) => (
                  <li key={r}
                      className={`h-[5px] flex-1 rounded-full transition-colors duration-500
                        ${i <= etapa ? 'bg-[var(--teal)]' : 'bg-[var(--sand)]'}`} />
                ))}
              </ol>
              <p className="font-ui text-[12.5px] font-semibold uppercase tracking-[.08em]
                            text-ink-muted tabular-nums shrink-0">
                {etapa + 1} de {TOTAL_ETAPAS} · {ROTULOS[etapa]}
              </p>
            </div>

            {/* `tabIndex={-1}`: alvo de foco por programa, nunca por Tab. */}
            <div ref={foco} tabIndex={-1} className="outline-none p-6 sm:p-9">

              {/* ── 1 · conhecer ─────────────────────────────────────── */}
              {etapa === 0 && (
                <div className="grid gap-7 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] sm:items-center">
                  <div className="rounded-[20px] bg-[var(--sand)] py-8 grid justify-items-center gap-1">
                    <He size="display" tone="navy">{ALEF.letter}</He>
                    <p className="font-display text-[19px] font-bold text-ink">{ALEF.namePt}</p>
                  </div>
                  <div className="grid gap-4">
                    <p className="font-display text-[21px] sm:text-[23px] leading-[1.4] font-medium
                                  tracking-[-0.015em] text-ink">
                      O Álef é a primeira letra do alfabeto - e ela não tem som próprio.
                    </p>
                    <p className="font-ui text-[16px] leading-[1.65] text-ink-muted max-w-[46ch]">
                      Ele é a letra que carrega a vogal: sozinho não se pronuncia, e o som que
                      você ouve vem do sinal que aparece embaixo ou ao lado dele. É por isso
                      que o Álef abre o alfabeto e abre tantas palavras.
                    </p>
                    <div>
                      <button
                        type="button"
                        onClick={iniciar}
                        className="inline-flex items-center justify-center min-h-[52px] px-7
                                   rounded-[14px] bg-[var(--navy)] text-white
                                   font-ui text-[16.5px] font-semibold
                                   transition-transform duration-[180ms] hover:-translate-y-[2px]
                                   focus-visible:outline focus-visible:outline-2
                                   focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
                                   motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                      >
                        Entendi · testar agora
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 2 · reconhecer ───────────────────────────────────── */}
              {etapa === 1 && (
                <div className="grid gap-5">
                  <p className="font-display text-[22px] sm:text-[25px] font-semibold
                                tracking-[-0.02em] text-ink">
                    Qual destas é o Álef?
                  </p>

                  <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 list-none p-0 m-0">
                    {OPCOES.map((o, i) => {
                      const marcada = escolha === i;
                      const bom = marcada && o.certa;
                      const ruim = marcada && !o.certa;
                      return (
                        <li key={o.he}>
                          <button
                            type="button"
                            onClick={() => responder(i)}
                            aria-pressed={marcada}
                            className={`w-full min-h-[104px] rounded-[18px] border-2 grid place-items-center
                                        relative transition-[background-color,border-color,transform]
                                        duration-[200ms]
                                        hover:-translate-y-[2px] active:translate-y-0
                                        focus-visible:outline focus-visible:outline-2
                                        focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
                                        motion-reduce:transition-none motion-reduce:hover:translate-y-0
                              ${bom
                                ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                                : ruim
                                  ? 'border-[#D9B872] bg-[var(--gold-soft)]'
                                  : 'border-line bg-[var(--card)] hover:bg-[var(--sand)]'}`}
                          >
                            <He size="lg" tone={bom ? 'teal' : 'navy'}>{o.he}</He>
                            {/* Nunca só a cor: quem não distingue teal de
                                âmbar recebe o mesmo aviso em forma. */}
                            {marcada && (
                              <span aria-hidden
                                    className={`absolute top-2 right-2.5 font-ui text-[15px] font-bold
                                      ${bom ? 'text-[var(--teal-ink)]' : 'text-[var(--gold-ink)]'}`}>
                                {bom ? '✓' : '✕'}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Altura reservada: sem ela o cartão salta quando o retorno
                      entra, e o dedo que ia tocar de novo erra o alvo. */}
                  <div className="min-h-[124px]" aria-live="polite">
                    {escolha === null && (
                      <p className="font-ui text-[15px] leading-[1.6] text-ink-muted pt-1">
                        Toque na letra que você acabou de ver.
                      </p>
                    )}

                    {escolhida && acertou && (
                      <div className="rounded-[16px] bg-[var(--teal-soft)] px-5 py-4 grid gap-3 animate-pop
                                      motion-reduce:animate-none">
                        <p className="flex items-center gap-2.5 m-0">
                          <Check size={18} color="var(--teal-ink)" />
                          <span className="font-ui font-bold text-[17px] text-[var(--teal-ink)]">
                            Isso! <He size="inline" tone="teal">א</He> é o Álef.
                          </span>
                        </p>
                        <p className="font-ui text-[15px] leading-[1.6] text-[var(--teal-body)] m-0">
                          {tentativas > 1
                            ? 'Achou na segunda - que é exatamente como se aprende uma forma nova.'
                            : 'Primeira tentativa. Você já sabe separar o Álef de três letras parecidas.'}
                        </p>
                        <div>
                          <button
                            type="button"
                            onClick={() => avancar(2)}
                            className="inline-flex items-center justify-center min-h-[48px] px-6
                                       rounded-[13px] bg-[var(--navy)] text-white
                                       font-ui text-[16px] font-semibold
                                       transition-transform duration-[180ms] hover:-translate-y-[2px]
                                       focus-visible:outline focus-visible:outline-2
                                       focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
                                       motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                          >
                            Agora escreva você →
                          </button>
                        </div>
                      </div>
                    )}

                    {escolhida && !acertou && (
                      <div className="rounded-[16px] bg-[var(--gold-soft)] px-5 py-4 grid gap-2 animate-pop
                                      motion-reduce:animate-none">
                        <p className="flex items-center gap-2.5 m-0">
                          <span aria-hidden className="font-ui text-[17px] font-bold text-[var(--gold-ink)]">✕</span>
                          <span className="font-ui font-bold text-[17px] text-[var(--gold-ink)]">
                            Quase.
                          </span>
                        </p>
                        {/* A frase que ENSINA. Um erro que só diz "errado"
                            devolve a pessoa ao mesmo chute. */}
                        <p className="font-ui text-[15px] leading-[1.6] text-[var(--gold-body)] m-0">
                          {escolhida.porque} O Álef tem esta forma:{' '}
                          <He size="inline" tone="ink">א</He> - duas hastes inclinadas
                          apoiadas numa terceira. Toque de novo.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── 3 · escrever ─────────────────────────────────────
                  A etapa em que a pessoa deixa de assistir e opera.

                  Duas decisões que valem registrar:

                  · O MODELO APARECE, em 22% - é a etapa «traçar» da lição, e
                    não a de memória. Pedir a alguém que desenhe de cabeça uma
                    forma vista há quarenta segundos é montar um fracasso numa
                    página cujo trabalho é dizer «você consegue».

                  · CONFERIR É OPCIONAL, e seguir adiante nunca depende de ter
                    desenhado. Um canvas não é alcançável por teclado, e uma
                    demo que exigisse o traço prenderia ali quem navega por
                    teclado, quem usa leitor de tela e quem simplesmente não
                    quer rabiscar. O botão de seguir está sempre vivo. */}
              {etapa === 2 && (
                <div className="grid gap-5">
                  {/* O título e a frase que muda a percepção ficam em cima, em
                      largura cheia. Tudo o mais é secundário e desce.

                      Medido numa captura de 390px: com os três parágrafos e o
                      diagrama antes do quadro, o celular pedia três rolagens
                      para chegar ao lugar onde se escreve - numa etapa cujo
                      trabalho inteiro é fazer a pessoa escrever AGORA. Agora o
                      quadro vem logo abaixo do título (`order-1`), e o resto
                      do texto o segue; no desktop, onde as duas colunas cabem
                      lado a lado, a ordem visual volta a ser texto à esquerda
                      e quadro à direita. */}
                  <div className="grid gap-3">
                    <p className="font-display text-[22px] sm:text-[25px] font-semibold
                                  tracking-[-0.02em] text-ink m-0">
                      Agora escreva o Álef com o dedo.
                    </p>
                    <p className="font-ui text-[16px] leading-[1.65] text-ink-muted max-w-[56ch] m-0">
                      Repare que a letra à mão não tem o mesmo desenho da que você viu: em
                      hebraico se lê na forma impressa e se escreve na cursiva, que é a que
                      aparece num bilhete em Israel.
                    </p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
                  <div className="order-2 lg:order-1 grid gap-4 content-start">
                    <p className="font-ui text-[15px] leading-[1.6] text-ink-muted max-w-[44ch] m-0">
                      {MESMA_LETRA}
                    </p>

                    {/* O diagrama público: onde a caneta encosta e quantos
                        movimentos são. É o mesmo desenho que vai no livro. */}
                    <div className="rounded-[16px] border border-line bg-[var(--sand)] p-4
                                    grid gap-1 justify-items-center max-w-[240px]">
                      <DiagramaDeTracado letterId="alef" label="Álef" movimentos={2} />
                    </div>
                  </div>

                  <div className="order-1 lg:order-2 grid gap-3">
                    <div className="rounded-[18px] border border-line overflow-hidden bg-[var(--card)]">
                      <TraceBoard
                        ref={quadro}
                        glyph={ALEF.letter}
                        guia={0.22}
                        label="Álef"
                        onTinta={setTemTinta}
                        alturaClass="h-[240px] sm:h-[280px]"
                      />
                    </div>
                    <p className="font-ui text-[13.5px] text-ink-muted m-0">
                      Passe o dedo por cima do modelo.{' '}
                      <span className="whitespace-nowrap">← escreva nesta direção ←</span>
                    </p>

                    {/* Altura reservada, como no resto da demo: o cartão não
                        pode saltar quando o retorno entra. */}
                    <div className="min-h-[62px]" aria-live="polite">
                      {veredito && (
                        <div className={`rounded-[13px] px-4 py-3 animate-pop motion-reduce:animate-none
                          ${veredito.tone === 'good'
                            ? 'bg-[var(--teal-soft)]' : 'bg-[var(--gold-soft)]'}`}>
                          <p className={`font-ui text-[14.5px] leading-[1.55] m-0
                            ${veredito.tone === 'good'
                              ? 'text-[var(--teal-body)]' : 'text-[var(--gold-body)]'}`}>
                            <span aria-hidden className="font-bold mr-1.5">
                              {veredito.tone === 'good' ? '✓' : '✕'}
                            </span>
                            {veredito.message}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={conferirEscrita}
                        disabled={!temTinta}
                        className="inline-flex items-center justify-center min-h-[48px] px-5
                                   rounded-[13px] border border-line bg-[var(--card)] text-ink
                                   font-ui text-[15.5px] font-semibold
                                   disabled:opacity-45 disabled:cursor-not-allowed
                                   enabled:hover:bg-[var(--sand)]
                                   focus-visible:outline focus-visible:outline-2
                                   focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]"
                      >
                        Conferir
                      </button>
                      <button
                        type="button"
                        onClick={limpar}
                        disabled={!temTinta}
                        className="inline-flex items-center justify-center min-h-[48px] px-4
                                   rounded-[13px] font-ui text-[15px] font-semibold text-ink-muted
                                   disabled:opacity-45 disabled:cursor-not-allowed
                                   enabled:hover:text-ink
                                   focus-visible:outline focus-visible:outline-2
                                   focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]"
                      >
                        Limpar
                      </button>
                      <button
                        type="button"
                        onClick={() => avancar(3)}
                        className="ml-auto inline-flex items-center justify-center min-h-[48px] px-6
                                   rounded-[13px] bg-[var(--navy)] text-white
                                   font-ui text-[16px] font-semibold
                                   transition-transform duration-[180ms] hover:-translate-y-[2px]
                                   focus-visible:outline focus-visible:outline-2
                                   focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
                                   motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                      >
                        Agora leia uma palavra →
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              )}

              {/* ── 4 · ler ──────────────────────────────────────────── */}
              {etapa === 3 && (
                <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,300px)] sm:items-center">
                  <div className="grid gap-4">
                    <p className="font-display text-[22px] sm:text-[25px] font-semibold
                                  tracking-[-0.02em] text-ink m-0">
                      Você já consegue achar o Álef aqui dentro.
                    </p>
                    <p className="font-ui text-[16px] leading-[1.65] text-ink-muted max-w-[44ch] m-0">
                      Esta é uma palavra hebraica de verdade, e o Álef aparece nas duas pontas -
                      lembrando que em hebraico se lê da direita para a esquerda. A letra do meio
                      é a próxima que o curso ensina.
                    </p>
                    <p className="font-ui text-[15px] leading-[1.6] text-ink-muted max-w-[44ch] m-0">
                      A transliteração ao lado é o apoio do começo. Ela vai diminuindo ao longo
                      do curso, até você ler direto do hebraico.
                    </p>
                    <div>
                      <button
                        type="button"
                        onClick={concluir}
                        className="inline-flex items-center justify-center min-h-[52px] px-7
                                   rounded-[14px] bg-[var(--navy)] text-white
                                   font-ui text-[16.5px] font-semibold
                                   transition-transform duration-[180ms] hover:-translate-y-[2px]
                                   focus-visible:outline focus-visible:outline-2
                                   focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
                                   motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                      >
                        Terminei a primeira letra
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-[var(--sand)] px-5 py-8 grid justify-items-center gap-2.5">
                    {/* `marks` destaca TODAS as ocorrências do Álef, cada uma
                        com o nikud que vem junto - é o componente do curso
                        fazendo o que ele faz na lição. */}
                    <He size="xl" marks={['א']}>{PALAVRA.he}</He>
                    <p className="font-ui text-[16px] font-semibold text-ink-muted m-0">
                      {PALAVRA.translit}
                    </p>
                    <p className="font-ui text-[15px] text-ink-muted m-0">«{PALAVRA.pt}»</p>
                  </div>
                </div>
              )}

              {/* ── 5 · a conquista, e o próximo passo ───────────────── */}
              {etapa === 4 && (
                <div className="grid gap-6 justify-items-center text-center">
                  <div className="grid justify-items-center gap-3">
                    <span className="grid place-items-center w-[84px] h-[84px] rounded-[26px]
                                     bg-[var(--teal-soft)] animate-pop motion-reduce:animate-none">
                      <He size="lg" tone="teal">א</He>
                    </span>
                    <p className="font-ui text-[13px] font-bold uppercase tracking-[.12em]
                                  text-[var(--teal)] tabular-nums m-0">
                      1 de {course.totalLetters} letras
                    </p>
                  </div>

                  <div className="grid gap-3 justify-items-center">
                    <p className="font-display font-semibold text-[clamp(24px,3vw,32px)]
                                  leading-[1.15] tracking-[-0.025em] text-ink text-balance m-0
                                  max-w-[22ch]">
                      Você acabou de aprender sua primeira letra em hebraico.
                    </p>
                    <p className="font-ui text-[16.5px] leading-[1.6] text-ink-muted max-w-[42ch] m-0">
                      Faltam {course.totalLetters - 1}. Imagine onde você chega aprendendo
                      uma de cada vez, do mesmo jeito.
                    </p>
                  </div>

                  {/* A barra das 22. Uma acesa, o resto esperando - a mesma
                      imagem que o mapa do curso mostra por dentro. */}
                  <ul aria-hidden className="flex flex-wrap justify-center gap-1.5 list-none p-0 m-0
                                             max-w-[420px]">
                    {Array.from({ length: course.totalLetters }, (_, i) => (
                      <li key={i}
                          className={`w-[14px] h-[14px] rounded-[4px]
                            ${i === 0 ? 'bg-[var(--teal)]' : 'bg-[var(--sand)]'}`} />
                    ))}
                  </ul>

                  {/* O momento de maior intenção da visita inteira, e por
                      isso o único lugar da demo onde há preço: quem acabou de
                      conseguir quer saber quanto custa continuar, e obrigá-lo
                      a rolar até a caixa de preço é perder o impulso que a
                      demo acabou de criar. O número sai do catálogo, que é o
                      mesmo arquivo que o checkout cobra.

                      Para quem JÁ tem o curso, a regra de lib/cta.ts manda: o
                      botão leva à plataforma dele e não há preço nenhum. */}
                  <div className="grid gap-2.5 justify-items-center">
                    <Link
                      href={href}
                      onClick={() => track('cta_clicked', { itemId: 'demo-alef' })}
                      className="inline-flex items-center justify-center min-h-[58px] px-9
                                 rounded-[15px] bg-[var(--navy)] text-white
                                 font-ui text-[17.5px] font-semibold text-center
                                 transition-transform duration-[180ms] hover:-translate-y-[2px]
                                 focus-visible:outline focus-visible:outline-2
                                 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
                                 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    >
                      {vende ? `Quero aprender as outras ${course.totalLetters - 1}` : label}
                    </Link>
                    {vende && (
                      <p className="font-ui text-[14.5px] text-ink m-0">
                        Curso completo de alfabetização por{' '}
                        <strong className="font-semibold">{brl(flagship().price.brl)}</strong>.
                      </p>
                    )}
                    <p className="font-ui text-[14px] text-ink-muted m-0">{micro}</p>
                    <p className="font-ui text-[14px] text-ink-muted m-0">
                      Comece do zero, avance no seu ritmo, e o progresso fica salvo.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEscolha(null); setTentativas(0); setVeredito(null);
                      quadro.current?.limpar();
                      avancar(0);
                    }}
                    className="min-h-[44px] px-4 font-ui text-[14.5px] font-semibold text-ink-muted
                               hover:text-ink rounded-[10px]
                               focus-visible:outline focus-visible:outline-2
                               focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]"
                  >
                    Fazer o teste de novo
                  </button>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* Um aviso ao próximo que mexer aqui: não há `useEffect` nesta seção, e isso
   é decisão. Nada precisa acontecer sozinho - a pessoa toca, a tela responde.
   Um efeito que avançasse a demo por conta própria tiraria dela a única coisa
   que a faz funcionar, que é ter sido o visitante a fazer. */
