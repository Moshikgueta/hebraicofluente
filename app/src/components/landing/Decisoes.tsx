'use client';

/* Três decisões que tornam o aprendizado mais leve.
 * ─────────────────────────────────────────────────────────────────────────
 * As três ideias pedagógicas que sustentam o curso - progressão gradual,
 * transliteração que se retira, retorno imediato - mostradas em vez de
 * afirmadas.
 *
 * ── por que o tom mudou ─────────────────────────────────────────────────
 * Estas mesmas três ideias já estavam na página /sobre, sob o título «Três
 * coisas que eu me recusei a fazer», e cada cartão começava por um «não»:
 * não mostrar a tabela inteira, não deixar virar muleta, não fingir que há
 * professor. É um bom argumento e um mau começo: quem ainda não confia no
 * produto lê três negações e entende que o assunto são os outros métodos, e
 * não a experiência dele. A decisão é a mesma; o que muda é de quem a frase
 * fala - agora fala do aluno.
 *
 * ── e por que cada uma tem um desenho ───────────────────────────────────
 * Porque as três são verificáveis em dois segundos e nenhuma cabe num
 * parágrafo. "Uma letra de cada vez" vira óbvio ao ver uma fileira de 22
 * acendendo uma a uma; "o apoio some" vira óbvio ao ver a transliteração
 * encolher; "retorno imediato" vira óbvio ao ver o que o curso responde a um
 * erro. Os três desenhos são CSS e estado - nenhuma biblioteca entrou na
 * página por causa desta seção.
 *
 * Os dois primeiros andam sozinhos quando entram na tela, e param onde o
 * leitor mandar; o terceiro é só toque. Com `prefers-reduced-motion` nada se
 * move: cada um nasce no estado final, que é o que carrega a informação.
 */

import { useEffect, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { course } from '@/lib/content-publico';
import { Container, H2, Lead, Reveal, Check } from './base';

/** Roda uma vez, quando o bloco entra na tela. Devolve `true` para animar. */
function useNaTela<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [dentro, setDentro] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setDentro(true); return; }
    const io = new IntersectionObserver(es => {
      for (const e of es) if (e.isIntersecting) { setDentro(true); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, dentro };
}

const semMovimento = () =>
  typeof window !== 'undefined'
  && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ── 1 · uma letra de cada vez ───────────────────────────────────────────
   A fileira das 22, acendendo. O número não é escrito: são as letras do
   curso, na ordem em que o curso as ensina. */
function UmaDeCadaVez() {
  const letras = course.letters.slice().sort((a, b) => a.order - b.order);
  const { ref, dentro } = useNaTela<HTMLDivElement>();
  const [acesas, setAcesas] = useState(0);

  useEffect(() => {
    if (!dentro) return;
    if (semMovimento()) { setAcesas(3); return; }
    /* Para em TRÊS, e não nas 22. A seção diz "uma de cada vez"; uma
       animação que acende o alfabeto inteiro em dois segundos diz o
       contrário do texto que ela ilustra. */
    const t = [0, 1, 2].map((n, i) => setTimeout(() => setAcesas(n + 1), 260 + i * 620));
    return () => t.forEach(clearTimeout);
  }, [dentro]);

  const nomes = letras.slice(0, acesas).map(l => l.namePt).join(', ');

  return (
    <div ref={ref} className="grid gap-4">
      {/* `flex-wrap` e nada de largura fixa nesta linha.
          ──────────────────────────────────────────────────────────────────
          A primeira versão era uma linha rígida: três células de 54px, as
          reticências e a fileira do resto do alfabeto num bloco de 150px.
          Soma ~350px que não encolhem - e num telefone de 390 com o texto em
          150% (que é `zoom`, então a largura útil cai para ~212px) o cartão
          estourava e a PÁGINA INTEIRA passava a rolar de lado. Pego pelo
          `npm run a11y`, que mede exatamente essa combinação.

          Agora as células seguem fixas, porque uma letra hebraica pequena
          demais deixa de ser legível - que é o assunto do cartão -, e quem
          cede é a fileira de pontos: ela encolhe e, sem espaço, desce para a
          própria linha. */}
      <div className="flex flex-wrap items-end gap-2 min-h-[64px]">
        {letras.slice(0, 3).map((l, i) => (
          <span
            key={l.id}
            className={`grid place-items-center shrink-0 w-[54px] h-[60px] rounded-[14px] border
                        transition-[opacity,transform,background-color,border-color] duration-[420ms]
                        motion-reduce:transition-none
              ${i < acesas
                ? 'border-[var(--teal)] bg-[var(--teal-soft)] opacity-100 translate-y-0'
                : 'border-line bg-[var(--card)] opacity-35 translate-y-[6px]'}`}
          >
            <He size="word" tone={i < acesas ? 'teal' : 'muted'}>{l.letter}</He>
          </span>
        ))}
        <span aria-hidden className="shrink-0 font-ui text-[22px] text-ink-muted pb-4 px-1">…</span>
        {/* O resto do alfabeto, em repouso: diz o tamanho do caminho sem
            despejar 22 formas estranhas na cara de quem chegou agora. */}
        <ul aria-hidden className="flex flex-wrap gap-1 list-none p-0 m-0 pb-4
                                   min-w-0 flex-1 basis-[120px] max-w-[160px]">
          {letras.slice(3).map(l => (
            <li key={l.id} className="w-[11px] h-[11px] rounded-[3px] bg-[var(--sand)]" />
          ))}
        </ul>
      </div>
      <p className="font-ui text-[14px] text-ink-muted m-0 min-h-[20px]" aria-live="polite">
        {acesas === 0 ? ' ' : `${acesas} de ${letras.length} · ${nomes}`}
      </p>
    </div>
  );
}

/* ── 2 · o apoio que sai sozinho ─────────────────────────────────────────
   Três estágios da mesma palavra. O visitante pode tocar em cada um - e é
   importante que possa: a frase "a transliteração desaparece" assusta quem
   depende dela, e ver os três estágios lado a lado mostra que a retirada é
   gradual, não um corte. */
const APOIO = [
  { rotulo: 'Início', he: 'שָׁלוֹם', tr: 'shalóm', pt: 'olá, paz', nota: 'Tudo à mostra: a palavra, como se diz e o que quer dizer.' },
  { rotulo: 'Meio', he: 'שָׁלוֹם', tr: 'sh… …', pt: 'olá, paz', nota: 'O apoio encolhe. Você lê e confere só o que ficou em dúvida.' },
  { rotulo: 'Depois', he: 'שָׁלוֹם', tr: '', pt: 'olá, paz', nota: 'Você lê direto do hebraico. O apoio saiu porque já não fazia falta.' }
] as const;

function ApoioQueSai() {
  const { ref, dentro } = useNaTela<HTMLDivElement>();
  const [i, setI] = useState(0);
  const tocou = useRef(false);

  useEffect(() => {
    if (!dentro || tocou.current) return;
    if (semMovimento()) { setI(2); return; }
    const t = [1, 2].map((n, k) => setTimeout(() => { if (!tocou.current) setI(n); }, 1100 + k * 1300));
    return () => t.forEach(clearTimeout);
  }, [dentro]);

  const e = APOIO[i]!;

  return (
    <div ref={ref} className="grid gap-4">
      <div className="rounded-[16px] bg-[var(--sand)] px-4 py-5 grid justify-items-center gap-1.5 min-h-[126px]">
        <He size="lg">{e.he}</He>
        {/* Altura fixa: o bloco não pode encolher quando a transliteração
            sai, ou o cartão salta debaixo do dedo no último estágio. */}
        <p className="font-ui text-[15px] font-semibold text-ink-muted m-0 min-h-[22px]
                      transition-opacity duration-[420ms] motion-reduce:transition-none"
           style={{ opacity: e.tr ? 1 : 0 }}>
          {e.tr || ' '}
        </p>
        <p className="font-ui text-[14px] text-ink-muted m-0">«{e.pt}»</p>
      </div>

      {/* `flex-wrap`, e não `inline-flex` rígido: três rótulos lado a lado
          somam ~230px que não encolhem, e num telefone com o texto em 150% a
          largura útil do cartão é menor que isso - a linha empurrava o cartão
          e a página passava a rolar de lado. Com a quebra, os rótulos descem
          em vez de arrastar a página. */}
      <div role="tablist" aria-label="Estágios do apoio"
           className="flex flex-wrap gap-1 rounded-[12px] bg-[var(--sand)] border border-line p-1
                      w-fit max-w-full">
        {APOIO.map((x, k) => (
          <button
            key={x.rotulo}
            type="button"
            role="tab"
            aria-selected={i === k}
            onClick={() => { tocou.current = true; setI(k); }}
            className={`rounded-[9px] px-3.5 min-h-[40px] font-ui text-[14px] font-semibold
                        transition-colors duration-200 motion-reduce:transition-none
                        focus-visible:outline focus-visible:outline-2
                        focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
              ${i === k ? 'bg-[var(--card)] text-[var(--navy)] shadow-[var(--sh-tab)]' : 'text-ink-muted hover:text-ink'}`}
          >
            {x.rotulo}
          </button>
        ))}
      </div>
      <p className="font-ui text-[14px] leading-[1.55] text-ink-muted m-0 min-h-[40px]" aria-live="polite">
        {e.nota}
      </p>
    </div>
  );
}

/* ── 3 · o retorno imediato ──────────────────────────────────────────────
   Dois botões e o que o curso responde a cada um. É a única das três em que
   o visitante precisa agir para ver - e de propósito: a afirmação é sobre o
   que acontece DEPOIS de responder. */
function RetornoImediato() {
  const [resp, setResp] = useState<'certo' | 'quase' | null>(null);

  return (
    <div className="grid gap-4">
      <div className="rounded-[16px] border border-line bg-[var(--card)] p-4 grid gap-3">
        <p className="font-ui text-[12.5px] font-semibold uppercase tracking-[.08em] text-ink-muted m-0">
          Exercício · escolha
        </p>
        <p className="font-ui text-[16px] font-semibold text-ink m-0">
          Qual destas é o Bet?
        </p>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setResp('certo')}
            aria-pressed={resp === 'certo'}
            className={`flex-1 min-h-[62px] rounded-[13px] border-2 grid place-items-center
                        transition-colors duration-200 motion-reduce:transition-none
                        focus-visible:outline focus-visible:outline-2
                        focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
              ${resp === 'certo'
                ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                : 'border-line hover:bg-[var(--sand)]'}`}
          >
            <He size="word" tone={resp === 'certo' ? 'teal' : 'navy'}>ב</He>
          </button>
          <button
            type="button"
            onClick={() => setResp('quase')}
            aria-pressed={resp === 'quase'}
            className={`flex-1 min-h-[62px] rounded-[13px] border-2 grid place-items-center
                        transition-colors duration-200 motion-reduce:transition-none
                        focus-visible:outline focus-visible:outline-2
                        focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]
              ${resp === 'quase'
                ? 'border-[#D9B872] bg-[var(--gold-soft)]'
                : 'border-line hover:bg-[var(--sand)]'}`}
          >
            <He size="word" tone="navy">כ</He>
          </button>
        </div>
      </div>

      {/* Altura reservada, e cor nunca sozinha: ✓ e ✕ carregam a mesma
          informação para quem não separa teal de âmbar. */}
      <div className="min-h-[84px]" aria-live="polite">
        {resp === null && (
          <p className="font-ui text-[14px] leading-[1.55] text-ink-muted m-0">
            Toque numa das duas para ver o que o curso responde.
          </p>
        )}
        {resp === 'certo' && (
          <div className="rounded-[13px] bg-[var(--teal-soft)] px-4 py-3 grid gap-1
                          animate-pop motion-reduce:animate-none">
            <p className="flex items-center gap-2 m-0 font-ui font-bold text-[15px] text-[var(--teal-ink)]">
              <Check size={16} color="var(--teal-ink)" /> Correto
            </p>
            <p className="font-ui text-[14px] leading-[1.55] text-[var(--teal-body)] m-0">
              O Bet apoia a base inteira na linha e fecha o canto de cima à direita.
            </p>
          </div>
        )}
        {resp === 'quase' && (
          <div className="rounded-[13px] bg-[var(--gold-soft)] px-4 py-3 grid gap-1
                          animate-pop motion-reduce:animate-none">
            <p className="flex items-center gap-2 m-0 font-ui font-bold text-[15px] text-[var(--gold-ink)]">
              <span aria-hidden>✕</span> Quase. Veja por quê.
            </p>
            <p className="font-ui text-[14px] leading-[1.55] text-[var(--gold-body)] m-0">
              Este é o Kaf: o canto de baixo é arredondado. O Bet tem a base reta e
              um degrau à direita. Pode tentar de novo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── a seção ─────────────────────────────────────────────────────────── */
const CARTOES = [
  {
    n: '01',
    t: 'Uma letra de cada vez',
    b: 'Você conhece a letra, pratica com ela e só então avança. O alfabeto inteiro na tela no primeiro dia não ensina - assusta.',
    destaque: `${course.totalLetters} letras parecem difíceis. Uma letra por vez, não.`,
    visual: <UmaDeCadaVez />
  },
  {
    n: '02',
    t: 'O apoio aparece e depois sai',
    b: 'A transliteração ajuda no começo, e o objetivo nunca foi você depender dela. Ela vai diminuindo junto com o seu progresso, até você ler direto do hebraico.',
    destaque: 'O apoio chega quando você precisa e sai quando você já anda sozinho.',
    visual: <ApoioQueSai />
  },
  {
    n: '03',
    t: 'Retorno na hora, em cada passo',
    b: 'Você não precisa esperar por um professor para saber se acertou. Quando erra, o curso diz onde olhar e devolve a tentativa. O exame final tem correção, gabarito, transcrição e critérios à vista.',
    destaque: 'Você nunca termina uma etapa sem saber se entendeu de verdade.',
    visual: <RetornoImediato />
  }
] as const;

export function Decisoes() {
  return (
    <section id="decisoes" aria-labelledby="decisoes-titulo">
      <Container className="pt-16 sm:pt-24">
        <Reveal>
          <p className="font-ui text-[13px] font-bold uppercase tracking-[.11em] text-[var(--teal-ink)] mb-3.5">
            Como o curso foi pensado
          </p>
          <H2 id="decisoes-titulo" className="mb-3 max-w-[22ch]">
            Três decisões que tornam o aprendizado mais leve.
          </H2>
        </Reveal>
        <Reveal delay={80}>
          <Lead className="mb-9">
            Cada parte do curso foi organizada para evitar sobrecarga e deixar você
            avançar com confiança.
          </Lead>
        </Reveal>

        <ul className="grid gap-4 lg:grid-cols-3 list-none p-0 m-0">
          {CARTOES.map((c, i) => (
            <Reveal as="li" key={c.n} delay={i * 90}>
              {/* `flex-col` e não `grid`: os três cartões têm quantidades
                  diferentes de texto, e com grade o destaque de cada um
                  parava numa altura diferente. Em coluna, o `mt-auto` do
                  destaque empurra os três para a mesma linha de base - que é
                  o que faz três cartões lado a lado lerem como um objeto só. */}
              <article className="h-full rounded-[22px] border border-line bg-[var(--card)]
                                  p-6 sm:p-7 flex flex-col gap-5">
                <div className="grid gap-2.5">
                  <p className="font-ui text-[12.5px] font-bold tracking-[.14em] text-[var(--teal-ink)] m-0">
                    {c.n}
                  </p>
                  <h3 className="font-display text-[21px] sm:text-[22px] font-semibold
                                 tracking-[-0.02em] text-ink m-0">
                    {c.t}
                  </h3>
                  <p className="font-ui text-[15.5px] leading-[1.6] text-ink-muted m-0">{c.b}</p>
                </div>

                {c.visual}

                <p className="font-display text-[16.5px] leading-[1.45] font-medium
                              tracking-[-0.01em] text-ink m-0 mt-auto pt-4
                              border-t border-[color:var(--line-soft)]">
                  {c.destaque}
                </p>
              </article>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
