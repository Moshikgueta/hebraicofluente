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
import { useEffect, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { course } from '@/lib/content-publico';
import { brl, flagship } from '@/lib/catalog';
import { MESMA_LETRA } from '@/lib/cursiva';
import { TraceBoard, type QuadroHandle, type Veredito } from '@/components/learn/TraceBoard';
import { DiagramaDeTracado } from './DiagramaDeTracado';
import { track } from '@/lib/analytics';
import { contarEtapaDaDemo, type EtapaDaDemo } from '@/lib/funil-demo';
import { type NomeAmostra } from '@/lib/amostra-audio';
import { useTocador } from './useTocador';
import { asset } from '@/lib/asset';
import { Container, H2, Lead, Reveal, Rubrica, Check } from './base';

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
  { he: 'מ', certa: false, porque: 'Este é o Mem. Ele tem uma base reta e uma pequena abertura embaixo, à esquerda.' },
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
const PALAVRA = { he: 'אַבָּא', translit: 'ába', pt: 'pai' } as const;

/* As etapas que entraram em 03/10/2026, a pedido do dono: o teste era curto
   demais para o que a capa prometia. Cada uma ensina uma coisa que a lição 1
   ensina (data/letters.json, `alef`), e nenhuma é enfeite:

   · COMPARAR: a letra que mais se confunde com o Álef é o Áyin
     (`confusableWith`), e a frase do erro é o `contrastes` do catálogo;
   · VOGAIS: o Álef não tem som, e o erro clássico do brasileiro é lê-lo como
     um A fixo (`brazilianMistake`). Três rodadas com as sílabas da lição;
   · ACHAR: a palavra começa À DIREITA. Duas rodadas, com palavras da lição
     (`wordsToRecognize`) contra palavras que começam com outra letra.

   O formato é um só (`Rodadas`): uma pergunta, alternativas, um erro que
   ensina e deixa tentar de novo. Nada se conta nem se guarda, como no resto
   da demo. */
type Alternativa = { he: string; rotulo?: string; certa: boolean; porque: string };
type Rodada = {
  pergunta: string; mostra?: string; opcoes: readonly Alternativa[]; acerto: string;
  /** Rodada de ouvir: o botão toca esta gravação, e não há texto para ler. */
  ouvir?: NomeAmostra;
  /** No acerto, um botão para ouvir a palavra na voz do professor. */
  ouvirAcerto?: { clipe: NomeAmostra; rotulo: string };
};

/* A voz do professor (03/10/2026, a pedido do dono): as gravações que a
   lição 1 já usa, publicadas como amostra (lib/amostra-audio.ts). */
type Tocador = ReturnType<typeof useTocador>;

const COMPARAR: readonly Rodada[] = [{
  pergunta: 'E agora: qual das duas é o Álef?',
  opcoes: [
    { he: 'ע', certa: false, porque: 'Este é o Áyin. O א tem um traço diagonal no meio, ligando os dois cantos. O ע é aberto em cima, com dois braços que descem para um pé só.' },
    { he: 'א', certa: true, porque: '' }
  ],
  acerto: 'O traço diagonal no meio é a marca do Álef. O Áyin, aberto em cima, é a letra que mais se confunde com ele.'
}];

const SILABAS = [
  { he: 'אַ', som: 'a', clipe: 'alef-a' }, { he: 'אֶ', som: 'e', clipe: 'alef-e' }, { he: 'אִ', som: 'i', clipe: 'alef-i' },
  { he: 'אוֹ', som: 'o', clipe: 'alef-o' }, { he: 'אוּ', som: 'u', clipe: 'alef-u' }
] as const;

const VOGAIS: readonly Rodada[] = [
  {
    pergunta: 'Como se lê isto?', mostra: 'אִ',
    opcoes: [
      { he: 'a', rotulo: '«a»', certa: false, porque: 'O tracinho embaixo é que seria o «a». Aqui embaixo do Álef há um ponto, e o ponto é a vogal «i».' },
      { he: 'i', rotulo: '«i»', certa: true, porque: '' },
      { he: 'o', rotulo: '«o»', certa: false, porque: 'O «o» é um ponto em cima: em cima de um ו (אוֹ) ou da própria letra (אֹ). Aqui embaixo do Álef há um ponto, e o ponto é a vogal «i».' }
    ],
    acerto: 'O ponto embaixo é a vogal «i». O Álef só segura.'
  },
  {
    pergunta: 'E isto?', mostra: 'אוֹ',
    opcoes: [
      { he: 'u', rotulo: '«u»', certa: false, porque: 'No «u» o ponto fica no meio do ו. Aqui o ponto está em cima do ו, e isso é a vogal «o».' },
      { he: 'a', rotulo: '«a»', certa: false, porque: 'O nome da letra começa com A, e isso engana: o Álef não é a vogal A. O ו com um ponto em cima é a vogal «o».' },
      { he: 'o', rotulo: '«o»', certa: true, porque: '' }
    ],
    acerto: 'O ו com um ponto em cima é a vogal «o».'
  },
  {
    pergunta: 'Última: e esta?', mostra: 'אַ',
    opcoes: [
      { he: 'a', rotulo: '«a»', certa: true, porque: '' },
      { he: 'e', rotulo: '«e»', certa: false, porque: 'O «e» são pontinhos embaixo, três (אֶ) ou dois (אֵ). Aqui há um tracinho só, e o tracinho é a vogal «a».' },
      { he: 'i', rotulo: '«i»', certa: false, porque: 'O «i» é um ponto. Aqui há um tracinho, e o tracinho é a vogal «a».' }
    ],
    acerto: 'O tracinho embaixo é a vogal «a». Você acabou de ler três sílabas.'
  },
  /* A rodada de ouvir: o exercício «Ouvir a sílaba» das lições. */
  {
    pergunta: 'Agora ouça e toque na sílaba que você ouviu.', ouvir: 'alef-u',
    opcoes: [
      { he: 'אַ', certa: false, porque: 'Esta é «a», com o tracinho embaixo. O que você ouviu foi «u»: o ו com um ponto no meio.' },
      { he: 'אוּ', certa: true, porque: '' },
      { he: 'אִ', certa: false, porque: 'Esta é «i», com o ponto embaixo. O que você ouviu foi «u»: o ו com um ponto no meio.' }
    ],
    acerto: 'אוּ é «u». Você ouviu o som e achou a forma escrita.'
  }
];

const ACHAR: readonly Rodada[] = [
  {
    pergunta: 'Qual destas palavras começa com Álef?',
    opcoes: [
      { he: 'שָׁלוֹם', certa: false, porque: 'Esta começa com Shin, a letra da direita. Em hebraico a palavra começa à direita.' },
      { he: 'אֶתְמוֹל', certa: true, porque: '' },
      { he: 'תוֹדָה', certa: false, porque: 'Esta começa com Tav, a letra da direita. Em hebraico a palavra começa à direita.' },
      { he: 'בַּיִת', certa: false, porque: 'Esta começa com Bet, a letra da direita. Em hebraico a palavra começa à direita.' }
    ],
    acerto: 'אֶתְמוֹל se lê «etmól» e quer dizer «ontem». O Álef está à direita, segurando o «e».',
    ouvirAcerto: { clipe: 'etmol', rotulo: 'Ouvir «etmól»' }
  },
  {
    pergunta: 'Mais uma: qual começa com Álef?',
    opcoes: [
      { he: 'מַיִם', certa: false, porque: 'Esta começa com Mem, a letra da direita. Procure o Álef na ponta direita.' },
      { he: 'לֶחֶם', certa: false, porque: 'Esta começa com Lámed, a letra da direita. Procure o Álef na ponta direita.' },
      { he: 'יֶלֶד', certa: false, porque: 'Esta começa com Yud, a letra da direita. Procure o Álef na ponta direita.' },
      { he: 'אֹכֶל', certa: true, porque: '' }
    ],
    acerto: 'אֹכֶל se lê «óchel» e quer dizer «comida» (o ch aqui não é o ch de «chave»: é um R raspado na garganta, como o R carioca de «carro»). Duas palavras de verdade, e você achou o Álef nas duas.',
    ouvirAcerto: { clipe: 'ochel', rotulo: 'Ouvir «óchel»' }
  }
];

/* Oito etapas desde 03/10/2026 (eram cinco). A de escrever continua sendo a
   que mais decide a compra.
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
type Etapa = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
const TOTAL_ETAPAS = 8;
const ROTULOS = ['Conhecer', 'Reconhecer', 'Comparar', 'Vogais', 'Escrever', 'Achar', 'Ler', 'Pronto'] as const;
/* Onde cada etapa mora, para o resto do arquivo não depender da ordem. */
const E = { conhecer: 0, reconhecer: 1, comparar: 2, vogais: 3, escrever: 4, achar: 5, ler: 6, pronto: 7 } as const;
/* O nome que vai para o funil do painel (lib/funil-demo.ts) ao chegar em cada
   etapa. A primeira não vai: quem a vê conta como `visto`, pela rolagem. */
const NO_FUNIL: readonly (EtapaDaDemo | null)[] =
  [null, 'reconhecer', 'comparar', 'vogais', 'escrever', 'achar', 'ler', 'pronto'];
/* Os exercícios que a capa anuncia: tudo menos a apresentação e o fim. */
export const EXERCICIOS_DA_DEMO = TOTAL_ETAPAS - 2;

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
  /* Para o resultado do fim: escrever é a única etapa que dá para pular. */
  const [escreveu, setEscreveu] = useState(false);
  const [veredito, setVeredito] = useState<Veredito | null>(null);
  const secao = useRef<HTMLElement>(null);
  const tocador = useTocador();

  /* Quantos visitantes chegam a VER o teste: o topo do funil do painel. É o
     único efeito da seção, e ele só conta - não mexe em nada da demo. */
  useEffect(() => {
    const el = secao.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { contarEtapaDaDemo('visto'); obs.disconnect(); }
    }, { threshold: 0.35 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Uma letra sem glifo é uma seção que não pode existir. Nunca acontece - o
     catálogo sempre traz as 22 -, e mesmo assim a seção some inteira em vez
     de desenhar um buraco na página de vendas. */
  if (!ALEF) return null;

  const escolhida = escolha === null ? null : OPCOES[escolha]!;
  const acertou = !!escolhida?.certa;

  const avancar = (n: Etapa) => {
    setEtapa(n);
    const nome = NO_FUNIL[n];
    if (nome) contarEtapaDaDemo(nome);
    /* O foco vai para o topo do cartão a cada etapa: sem isso, quem navega
       por teclado continua no botão que acabou de sumir e é devolvido ao
       começo do documento. */
    requestAnimationFrame(() => foco.current?.focus());
  };

  const iniciar = () => {
    if (!comecou.current) { comecou.current = true; track('demo_started', { letterId: 'alef' }); }
    avancar(E.reconhecer);
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
    track('trace_completed', { letterId: 'alef', score: v.score, stage: E.escrever });
  };

  const concluir = () => {
    track('demo_completed', { letterId: 'alef' });
    avancar(E.pronto);
  };

  return (
    <section ref={secao} id="experimente" aria-labelledby="experimente-titulo">
      <Container className="pt-20 sm:pt-28">
        <Reveal>
          <Rubrica letra="ב" className="mb-5">Teste grátis · {EXERCICIOS_DA_DEMO} exercícios</Rubrica>
          <H2 id="experimente-titulo" className="mb-3">
            Experimente aprender sua primeira letra.
          </H2>
        </Reveal>
        <Reveal delay={80}>
          <Lead className="mb-8">
            Sem cadastro e sem cartão. Você conhece a letra, encontra ela entre outras,
            descobre como ela segura as vogais, escreve com o dedo e acha ela dentro de
            palavras de verdade - do mesmo jeito que acontece dentro do curso.
          </Lead>
        </Reveal>

        <Reveal delay={140}>
          <div className="rounded-[20px] bg-[var(--card)] overflow-hidden
                          shadow-[0_0_0_1px_var(--line),0_2px_4px_rgba(27,33,31,.04),0_24px_48px_-32px_rgba(14,59,67,.3)]">
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
              {etapa === E.conhecer && (
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
                    <div className="flex flex-wrap items-center gap-2.5">
                      <BotaoOuvir clipe="alef" rotulo="Ouvir o nome da letra" tocador={tocador} />
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
              {etapa === E.reconhecer && (
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
                            onClick={() => avancar(E.comparar)}
                            className="inline-flex items-center justify-center min-h-[48px] px-6
                                       rounded-[13px] bg-[var(--navy)] text-white
                                       font-ui text-[16px] font-semibold
                                       transition-transform duration-[180ms] hover:-translate-y-[2px]
                                       focus-visible:outline focus-visible:outline-2
                                       focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
                                       motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                          >
                            Continuar →
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
              {/* ── 3 · comparar ─────────────────────────────────────── */}
              {etapa === E.comparar && (
                <Rodadas key="comparar" rodadas={COMPARAR} etapa="comparar" tocador={tocador}
                         seguir="Agora as vogais →" onFim={() => avancar(E.vogais)} />
              )}

              {/* ── 4 · vogais ───────────────────────────────────────
                  A tabela fica à vista durante as rodadas: é uma amostra,
                  e consultar é o jeito certo de aprender uma forma nova. */}
              {etapa === E.vogais && (
                <div className="grid gap-5">
                  <div className="grid gap-2">
                    <p className="font-display text-[22px] sm:text-[25px] font-semibold
                                  tracking-[-0.02em] text-ink m-0">
                      Uma letra, cinco sons.
                    </p>
                    <p className="font-ui text-[16px] leading-[1.65] text-ink-muted max-w-[56ch] m-0">
                      O Álef não tem som: quem dá o som é o sinal de vogal que vem com ele. Toque em
                      cada sílaba para ouvir o professor, e depois responda.
                    </p>
                  </div>
                  <ul className="grid grid-cols-5 gap-1.5 sm:gap-2 list-none p-0 m-0 max-w-[420px]" aria-label="As vogais com o Álef" dir="rtl">
                    {SILABAS.map(x => (
                      <li key={x.som} className="min-w-0">
                        <button
                          type="button"
                          onClick={() => tocador.tocar(x.clipe)}
                          aria-label={`Ouvir «${x.som}»`}
                          className={`w-full rounded-[14px] py-2.5 grid justify-items-center min-h-[44px]
                                      transition-colors duration-[200ms]
                                      focus-visible:outline focus-visible:outline-2
                                      focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
                            ${tocador.tocando === x.clipe ? 'bg-[var(--teal-soft)]' : 'bg-[var(--sand)] hover:bg-[var(--teal-soft)]'}`}
                        >
                          <He size="lg" tone="navy">{x.he}</He>
                          <span dir="ltr" className="font-ui text-[15px] font-semibold text-ink-muted">
                            <span aria-hidden>🔊 </span>«{x.som}»
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <Rodadas key="vogais" rodadas={VOGAIS} etapa="vogais" tocador={tocador}
                           seguir="Agora escreva você →" onFim={() => avancar(E.escrever)} />
                </div>
              )}

              {etapa === E.escrever && (
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
                        onTinta={t => { setTemTinta(t); if (t) setEscreveu(true); }}
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
                        onClick={() => avancar(E.achar)}
                        className="ml-auto inline-flex items-center justify-center min-h-[48px] px-6
                                   rounded-[13px] bg-[var(--navy)] text-white
                                   font-ui text-[16px] font-semibold
                                   transition-transform duration-[180ms] hover:-translate-y-[2px]
                                   focus-visible:outline focus-visible:outline-2
                                   focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
                                   motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                      >
                        Agora ache o Álef →
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              )}

              {/* ── 6 · achar ────────────────────────────────────────── */}
              {etapa === E.achar && (
                <Rodadas key="achar" rodadas={ACHAR} etapa="achar" tocador={tocador}
                         seguir="Agora leia uma palavra →" onFim={() => avancar(E.ler)} />
              )}

              {/* ── 7 · ler ──────────────────────────────────────────── */}
              {etapa === E.ler && (
                <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,300px)] sm:items-center">
                  <div className="grid gap-4">
                    <p className="font-display text-[22px] sm:text-[25px] font-semibold
                                  tracking-[-0.02em] text-ink m-0">
                      Você já consegue achar o Álef aqui dentro.
                    </p>
                    <p className="font-ui text-[16px] leading-[1.65] text-ink-muted max-w-[44ch] m-0">
                      Esta é uma palavra hebraica de verdade, e o Álef aparece nas duas pontas -
                      lembrando que em hebraico se lê da direita para a esquerda. A letra do meio
                      é o Bet, que o curso também ensina.
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
                    <BotaoOuvir clipe="aba" rotulo="Ouvir o professor" tocador={tocador} />
                  </div>
                </div>
              )}

              {/* ── 8 · a conquista, e o próximo passo ───────────────── */}
              {etapa === E.pronto && (
                <div className="grid gap-6 justify-items-center text-center">
                  <div className="grid justify-items-center gap-3">
                    <span className="grid place-items-center w-[84px] h-[84px] rounded-[26px]
                                     bg-[var(--teal-soft)] animate-pop motion-reduce:animate-none">
                      <He size="lg" tone="teal">א</He>
                    </span>
                    <p className="font-ui text-[13px] font-bold uppercase tracking-[.12em]
                                  text-[var(--teal-ink)] tabular-nums m-0">
                      1 de {course.totalLetters} letras
                    </p>
                  </div>

                  <div className="grid gap-3 justify-items-center">
                    <p className="font-display font-semibold text-[clamp(24px,3vw,32px)]
                                  leading-[1.15] tracking-[-0.025em] text-ink text-balance m-0
                                  max-w-[22ch]">
                      Você acabou de aprender sua primeira letra em hebraico.
                    </p>

                    {/* O resultado (03/10/2026, a pedido do dono): o que a
                        pessoa FEZ, e não uma nota. Avançar já exige o acerto,
                        então cada item é verdade; o de escrever só aparece
                        para quem escreveu, porque essa etapa se pode pular. */}
                    <div className="rounded-[18px] bg-[var(--teal-soft)] px-5 py-4 text-left w-full max-w-[440px]">
                      <p className="font-ui text-[14px] font-bold uppercase tracking-[.08em] text-[var(--teal-ink)] m-0 mb-2.5">
                        O que você fez agora
                      </p>
                      <ul className="list-none p-0 m-0 grid gap-2">
                        {feitos(escreveu).map(t => (
                          <li key={t} className="flex items-start gap-2.5 font-ui text-[15.5px] leading-[1.5] text-[var(--teal-body)]">
                            <span className="mt-[3px] shrink-0"><Check size={16} color="var(--teal-ink)" /></span>
                            <span><TextoComHebraico texto={t} /></span>
                          </li>
                        ))}
                      </ul>
                    </div>
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
                      onClick={() => { track('cta_clicked', { itemId: 'demo-alef' }); contarEtapaDaDemo('cta'); }}
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

                  {vende && <SegundaLetra />}

                  <button
                    type="button"
                    onClick={() => {
                      setEscolha(null); setTentativas(0); setVeredito(null); setEscreveu(false);
                      quadro.current?.limpar();
                      avancar(E.conhecer);
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

/* Uma sequência de perguntas de escolha, no formato da etapa «Reconhecer»:
   o erro diz onde olhar e deixa tentar de novo; o acerto mostra o que a
   pessoa acabou de aprender e um botão para a próxima rodada. */
function Rodadas({ rodadas, etapa, seguir, onFim, tocador }: {
  rodadas: readonly Rodada[];
  etapa: string;
  tocador: Tocador;
  seguir: string;
  onFim: () => void;
}) {
  const [n, setN] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const rodada = rodadas[n]!;
  const escolhida = escolha === null ? null : rodada.opcoes[escolha]!;
  const ultima = n === rodadas.length - 1;
  const palavras = rodada.opcoes.every(o => !o.rotulo);

  const responder = (i: number) => {
    setEscolha(i);
    track('demo_answered', { letterId: 'alef', correct: !!rodada.opcoes[i]?.certa, chosen: `${etapa}:${rodada.opcoes[i]?.he}` });
  };
  const proxima = () => {
    if (ultima) return onFim();
    setN(n + 1); setEscolha(null);
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <p className="font-display text-[22px] sm:text-[25px] font-semibold tracking-[-0.02em] text-ink m-0">
          {rodada.pergunta}
        </p>
        {rodada.ouvir && <BotaoOuvir clipe={rodada.ouvir} rotulo="Ouvir" tocador={tocador} />}
        {rodada.mostra && (
          <span className="rounded-[16px] bg-[var(--sand)] px-5 py-1.5"><He size="xl" tone="navy">{rodada.mostra}</He></span>
        )}
        {rodadas.length > 1 && (
          <span className="font-ui text-[13px] font-semibold text-ink-muted tabular-nums ml-auto">
            {n + 1} de {rodadas.length}
          </span>
        )}
      </div>

      <ul data-opcoes className={`grid gap-3 list-none p-0 m-0
                      ${rodada.opcoes.length === 2 ? 'grid-cols-2 max-w-[360px]'
                        : rodada.opcoes.length === 3 ? 'grid-cols-3 max-w-[480px]' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {rodada.opcoes.map((o, i) => {
          const marcada = escolha === i;
          const bom = marcada && o.certa;
          const ruim = marcada && !o.certa;
          return (
            <li key={o.he}>
              <button
                type="button"
                onClick={() => responder(i)}
                aria-pressed={marcada}
                className={`w-full ${palavras ? 'min-h-[92px]' : 'min-h-[72px]'} rounded-[18px] border-2 grid place-items-center
                            relative px-2 transition-[background-color,border-color,transform] duration-[200ms]
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
                {o.rotulo
                  ? <span className="font-display text-[24px] font-semibold text-ink">{o.rotulo}</span>
                  : <He size="lg" tone={bom ? 'teal' : 'navy'}>{o.he}</He>}
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

      <div className="min-h-[124px]" aria-live="polite">
        {escolha === null && (
          <p className="font-ui text-[15px] leading-[1.6] text-ink-muted pt-1">Toque na resposta.</p>
        )}
        {escolhida && escolhida.certa && (
          <div className="rounded-[16px] bg-[var(--teal-soft)] px-5 py-4 grid gap-3 animate-pop motion-reduce:animate-none">
            <p className="flex items-center gap-2.5 m-0">
              <Check size={18} color="var(--teal-ink)" />
              <span className="font-ui font-bold text-[17px] text-[var(--teal-ink)]">Isso!</span>
            </p>
            <p className="font-ui text-[15px] leading-[1.6] text-[var(--teal-body)] m-0">
              <TextoComHebraico texto={rodada.acerto} />
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {rodada.ouvirAcerto && (
                <BotaoOuvir clipe={rodada.ouvirAcerto.clipe} rotulo={rodada.ouvirAcerto.rotulo} tocador={tocador} />
              )}
              <button
                type="button"
                onClick={proxima}
                className="inline-flex items-center justify-center min-h-[48px] px-6
                           rounded-[13px] bg-[var(--navy)] text-white
                           font-ui text-[16px] font-semibold
                           transition-transform duration-[180ms] hover:-translate-y-[2px]
                           focus-visible:outline focus-visible:outline-2
                           focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
                           motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {ultima ? seguir : 'Próxima →'}
              </button>
            </div>
          </div>
        )}
        {escolhida && !escolhida.certa && (
          <div className="rounded-[16px] bg-[var(--gold-soft)] px-5 py-4 grid gap-2 animate-pop motion-reduce:animate-none">
            <p className="flex items-center gap-2.5 m-0">
              <span aria-hidden className="font-ui text-[17px] font-bold text-[var(--gold-ink)]">✕</span>
              <span className="font-ui font-bold text-[17px] text-[var(--gold-ink)]">Quase.</span>
            </p>
            <p className="font-ui text-[15px] leading-[1.6] text-[var(--gold-body)] m-0">
              <TextoComHebraico texto={escolhida.porque} /> {rodada.ouvir ? 'Ouça de novo e toque outra vez.' : 'Toque de novo.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* A segunda letra por e-mail (03/10/2026, a pedido do dono): para quem
   terminou e ainda não quer comprar. Um e-mail só, com o Mem; o endereço não
   entra em lista nenhuma. Ver worker/src/api/segunda-letra.js. */
function SegundaLetra() {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<'pronto' | 'enviando' | 'ok' | 'invalido' | 'erro'>('pronto');

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (estado === 'enviando') return;
    setEstado('enviando');
    try {
      const r = await fetch(asset('/api/segunda-letra'), {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      });
      if (r.ok) return setEstado('ok');
      const { error } = await r.json().catch(() => ({ error: '' })) as { error?: string };
      setEstado(error === 'email-invalido' ? 'invalido' : 'erro');
    } catch { setEstado('erro'); }
  };

  return (
    <div className="w-full max-w-[440px] rounded-[18px] border border-line bg-[var(--card)] px-5 py-4 text-left grid gap-3">
      <div className="grid gap-1">
        <p className="font-display text-[18px] font-semibold text-ink m-0">
          Ainda não quer decidir? Receba a segunda letra por <span className="whitespace-nowrap">e-mail</span>.
        </p>
        <p className="font-ui text-[14px] leading-[1.55] text-ink-muted m-0">
          Mandamos um e-mail só, com o Mem, a segunda letra do curso. Seu endereço não entra em lista nenhuma.
        </p>
      </div>
      {estado === 'ok' ? (
        <p role="status" className="font-ui text-[15px] leading-[1.55] text-[var(--teal-ink)] m-0">
          <span aria-hidden className="font-bold mr-1.5">✓</span>
          Pronto! A segunda letra está a caminho de <strong className="break-all">{email}</strong>. Se não chegar em
          alguns minutos, olhe a caixa de spam.
        </p>
      ) : (
        <form onSubmit={enviar} className="grid gap-2">
          <label htmlFor="segunda-letra-email" className="font-ui text-[14px] font-semibold text-ink">Seu e-mail</label>
          <div className="flex flex-wrap gap-2">
            <input
              id="segunda-letra-email"
              type="email" required autoComplete="email" inputMode="email"
              value={email} onChange={e => { setEmail(e.target.value); if (estado !== 'enviando') setEstado('pronto'); }}
              className="flex-1 min-w-[200px] min-h-[48px] rounded-[12px] border border-line bg-[var(--card)] px-3.5
                         font-ui text-[16px] text-ink
                         focus-visible:outline focus-visible:outline-2
                         focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]"
            />
            <button
              type="submit"
              disabled={estado === 'enviando'}
              className="min-h-[48px] px-5 rounded-[12px] bg-[var(--teal)] text-white font-ui text-[15.5px] font-semibold
                         disabled:opacity-60
                         focus-visible:outline focus-visible:outline-2
                         focus-visible:outline-offset-2 focus-visible:outline-[var(--navy)]"
            >
              {estado === 'enviando' ? 'Enviando…' : 'Mandar a segunda letra'}
            </button>
          </div>
          <div aria-live="polite" className="min-h-[20px]">
            {estado === 'invalido' && (
              <p className="font-ui text-[14px] text-[var(--gold-ink)] m-0">Confira o e-mail: parece que falta alguma coisa.</p>
            )}
            {estado === 'erro' && (
              <p className="font-ui text-[14px] text-[var(--gold-ink)] m-0">Não consegui mandar agora. Tente de novo daqui a pouco.</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

/** O resultado do fim, na ordem em que a pessoa fez. */
function feitos(escreveu: boolean): string[] {
  return [
    'Reconheceu o Álef entre quatro letras parecidas',
    'Separou o Álef do Áyin, a letra que mais se confunde com ele',
    'Leu três sílabas com vogais',
    'Reconheceu uma sílaba só de ouvir',
    ...(escreveu ? ['Escreveu o Álef com o dedo'] : []),
    'Achou o Álef em duas palavras de verdade',
    'Leu a palavra אַבָּא, «pai»'
  ];
}

/** O botão que toca a voz do professor. */
function BotaoOuvir({ clipe, rotulo, tocador }: { clipe: NomeAmostra; rotulo: string; tocador: Tocador }) {
  const ativo = tocador.tocando === clipe;
  return (
    <button
      type="button"
      onClick={() => tocador.tocar(clipe)}
      className={`inline-flex items-center gap-2 min-h-[48px] px-5 rounded-[13px] border
                  font-ui text-[15.5px] font-semibold
                  focus-visible:outline focus-visible:outline-2
                  focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
        ${ativo ? 'border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal-ink)]'
                : 'border-line bg-[var(--card)] text-ink hover:bg-[var(--sand)]'}`}
    >
      <span aria-hidden>{ativo ? '🔉' : '🔊'}</span>{rotulo}
    </button>
  );
}

/* As frases de retorno misturam português e hebraico. Cada trecho em letras
   hebraicas vai num <He>, que cuida da direção e da fonte. */
function TextoComHebraico({ texto }: { texto: string }) {
  const partes = texto.split(/([\u0590-\u05FF]+)/);
  return <>{partes.map((t, i) => /[\u0590-\u05FF]/.test(t)
    ? <He key={i} size="inline" tone="ink">{t}</He>
    : <span key={i}>{t}</span>)}</>;
}

/* Um aviso ao próximo que mexer aqui: o único `useEffect` desta seção é o que
   conta quem a viu, e isso é decisão. Nada na demo acontece sozinho - a pessoa
   toca, a tela responde.
   Um efeito que avançasse a demo por conta própria tiraria dela a única coisa
   que a faz funcionar, que é ter sido o visitante a fazer. */
