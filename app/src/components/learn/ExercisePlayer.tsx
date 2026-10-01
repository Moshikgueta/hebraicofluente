'use client';

/* The one exercise runner. Every tested moment in the course - lesson quiz,
 * checkpoint, quick review, reading gym, final challenge - is this component
 * with a different list of exercises.
 *
 * Feedback rules, from the brief and worth stating because they shape the code:
 *   · a wrong answer is never punitive. No red, no "incorreto", no life lost.
 *     The colour is amber, the copy is "quase", and the right answer is shown
 *     and explained on the spot;
 *   · the explanation is about the OPTION THE LEARNER CHOSE where the exercise
 *     can say something specific - "você escolheu מִ, mas o som era מַ" teaches,
 *     "errado" does not;
 *   · correctness is never signalled by colour alone - there is an icon and a
 *     word in every state;
 *   · retry is unlimited and costs nothing, and so does a hint, and so does
 *     replaying the audio.
 *
 * What it reports upward is richer than right/wrong: the skill the question
 * exercised, and on a miss the wrong option that was chosen, so the review
 * system can learn that THIS learner trades ד for ר.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { He, HeCloze } from '@/components/hebrew/He';
import { AudioButton, hasAudio } from './AudioButton';
import { OuvirInstrucao } from './OuvirInstrucao';
import {
  BuildLetters, BuildSyllable, BuildWord, Hints, MatchPairs, TypeAnswer, TypeHebrew
} from './Answers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Exercise } from '@/lib/engine/exercises';
import { isChoice } from '@/lib/engine/exercises';
import { reenfileirar } from '@/lib/engine/fila-de-revisao';
import { useProgress } from '@/lib/state/store';
import { clusters } from '@/lib/hebrew';
import { supportLevel } from '@/lib/state/rules';

export type PlayerResult = { correct: number; total: number; score: number; missed: string[] };

/** What one settled question knows about itself. */
type Settled = { correct: boolean; chosen: number | null; why: string | null };

/** Onde a pessoa estava: para a lição voltar à mesma questão depois de
 *  recarregar (auditoria de 01/10/2026, UXQA-003). */
export type PosicaoNoPlayer = { i: number; certas: number; erradas: string[] };

export function ExercisePlayer({
  exercises, onDone, title, compact = false, repetirErros = false, retomar, aoAvancar
}: {
  exercises: Exercise[];
  onDone: (r: PlayerResult) => void;
  title?: string;
  compact?: boolean;
  /** A prática de revisão (o reforço depois do teste): uma questão errada
   *  volta para a fila, depois de outras, até ser acertada; a prática só
   *  termina com todas certas. Desligado em todo o resto do curso. */
  repetirErros?: boolean;
  /** Começa desta questão, com estes acertos e erros já contados. Só sem
   *  `repetirErros` (a fila da revisão muda a cada erro). */
  retomar?: PosicaoNoPlayer | null;
  /** Chamado a cada questão que avança, com a posição nova. */
  aoAvancar?: (p: PosicaoNoPlayer) => void;
}) {
  const inicio = !repetirErros && retomar && retomar.i > 0 && retomar.i < exercises.length ? retomar : null;
  const { answer, markFirst, mastered, state } = useProgress();
  /* A fila que o aluno percorre. Sem `repetirErros` ela é a lista recebida,
     do começo ao fim; com ele, cresce a cada erro. */
  const [filaDaRevisao, setFila] = useState<Exercise[]>(exercises);
  const fila = repetirErros ? filaDaRevisao : exercises;
  const [i, setI] = useState(inicio?.i ?? 0);
  const [firstUnaided, setFirstUnaided] = useState(false);
  const [settled, setSettled] = useState<Settled | null>(null);
  const [correctCount, setCorrectCount] = useState(inicio?.certas ?? 0);
  const [missed, setMissed] = useState<string[]>(inicio?.erradas ?? []);
  const sheetRef = useRef<HTMLDivElement>(null);
  const raizRef = useRef<HTMLDivElement>(null);
  const perguntaRef = useRef<HTMLHeadingElement>(null);
  const [sheetH, setSheetH] = useState(0);

  /* ── DUAS TRAVAS, e o defeito que elas consertam ─────────────────────
     Relato do aluno, no modo «contra o relógio»: «pressiono uma alternativa
     e o sistema registra ou avança como se eu tivesse respondido outra
     carta».

     A causa não é o índice nem o botão: é que `settled` e `i` são lidos do
     FECHO do render. Dois toques dentro do mesmo quadro - toque duplo de
     polegar, clique repetido, Enter segurado - veem os dois o mesmo fecho,
     onde `settled` ainda é nulo e `i` ainda é o anterior. Os dois passam
     pela guarda, e o estragado é o seguinte:

       · `settle` chama `answer()` DUAS vezes para o mesmo item, contando
         dois acertos no registro de habilidades e, quando o segundo toque
         cai numa alternativa errada, gravando uma confusão que não houve;
       · `next` chama `setI(n => n + 1)` duas vezes, e como a atualização é
         funcional as duas contam: o jogo PULA uma pergunta, e o que o aluno
         responde em seguida fica contado na carta errada.

     O `disabled` dos botões não salva, porque ele também é do render
     anterior. Estado de React é assíncrono por contrato; um `ref` é
     síncrono - a segunda chamada, no mesmo quadro, já lê o que a primeira
     escreveu.

     As duas travas guardam o ÍNDICE, e não um booleano, para se soltarem
     sozinhas na pergunta seguinte sem depender de ninguém para limpá-las. */
  const julgado = useRef(-1);
  const avancado = useRef(-1);

  const ex = fila[i];
  const isRight = settled?.correct ?? false;
  /* Esta errada volta? Só no modo de revisão. */
  const vaiVoltar = repetirErros && !!settled && !settled.correct;

  /**
   * Settle the current question.
   *
   * `expected` and `chosen` are GLYPHS, and only passed where the pair means
   * something: telling ד from ר is a confusion worth drilling, picking the
   * wrong meaning of a word is not.
   */
  const settle = useCallback((
    correct: boolean,
    opts: { chosen?: number | null; why?: string | null; expected?: string; chosenGlyph?: string } = {}
  ) => {
    if (settled || !ex) return;
    if (julgado.current === i) return;
    julgado.current = i;
    setSettled({ correct, chosen: opts.chosen ?? null, why: opts.why ?? null });
    if (correct) setCorrectCount(c => c + 1);
    else setMissed(m => [...m, ex.id]);

    /* The moment the course is actually selling.
       Reading a whole word right, correctly, at a point where the course has
       stopped printing the transliteration - that is the first time the learner
       decoded Hebrew rather than recognised it. It can only happen once, it is
       dated, and it is said out loud when it does. */
    if (correct && UNAIDED_READ.has(ex.kind) && supportLevel(mastered) !== 'always'
        && !state.firsts['leitura-sem-translit']) {
      setFirstUnaided(true);
      markFirst('leitura-sem-translit');
    }
    answer({
      itemId: ex.id, letterId: ex.letterId, correct, skill: ex.skill,
      expected: opts.expected, chosen: opts.chosenGlyph, kind: ex.kind
    });
  }, [settled, ex, i, answer]);

  /* Choice kinds go through here so option feedback and confusion reporting
     happen in one place. */
  const choose = useCallback((idx: number) => {
    if (settled || !ex || !isChoice(ex)) return;
    const correct = idx === ex.answer;
    const glyphLevel = GLYPH_CONFUSION.has(ex.kind)
      /* Na palavra cursiva, só o modo `letra` responde com uma LETRA. */
      || (ex.kind === 'cursive-word' && ex.modo === 'letra');
    settle(correct, {
      chosen: idx,
      why: correct ? null : (ex.whyPt?.[idx] ?? null),
      expected: glyphLevel ? ex.options[ex.answer] : undefined,
      chosenGlyph: glyphLevel ? ex.options[idx] : undefined
    });
  }, [settled, ex, settle]);

  const next = useCallback(() => {
    if (avancado.current === i) return;
    avancado.current = i;
    const seguinte = vaiVoltar ? reenfileirar(fila, i) : fila;
    if (repetirErros && seguinte !== fila) setFila(seguinte);
    if (i + 1 >= seguinte.length) {
      /* No modo de revisão só se chega aqui com tudo certo: o resultado conta
         as questões da lista, não as tentativas, e `missed` diz quais
         precisaram de mais de uma. */
      const total = exercises.length;
      const certas = repetirErros ? total : correctCount;
      onDone({ correct: certas, total, score: total ? certas / total : 0, missed: [...new Set(missed)] });
      return;
    }
    setI(n => n + 1);
    setSettled(null);
    setFirstUnaided(false);
    aoAvancar?.({ i: i + 1, certas: correctCount, erradas: missed });
  }, [i, fila, vaiVoltar, repetirErros, exercises.length, correctCount, missed, onDone, aoAvancar]);

  /* Keyboard: 1-9 to answer a choice, Enter to continue. Every exercise that
     can be answered without a pointer, is. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!ex) return;
      /* Um Enter que nasceu num campo de texto é do campo, nunca do player -
         segunda trava da mesma porta, ver `TypeAnswer`. */
      const doCampo = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (e.key === 'Enter' && settled && !doCampo && !e.repeat) { e.preventDefault(); next(); return; }
      if (settled || !isChoice(ex)) return;
      /* Not while the learner is typing an answer. */
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= ex.options.length) { e.preventDefault(); choose(n - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ex, settled, choose, next]);

  /* Depois de responder, a alternativa CERTA é trazida para o meio da tela.
     A folha de retorno cobre o rodapé do telefone, e o que ela cobria era
     justamente o ✓ - a pessoa lia "quase" sem ver qual era a resposta.
     O anúncio para leitor de tela é o `aria-live` da folha; nada aqui rouba
     o foco, que é o que desenhava um anel vermelho em volta da frase.

     Depende de `sheetH`, e não só de `settled`: a folha é `fixed` e não ocupa
     altura, então até o `padding` medido entrar a página é mais curta que a
     tela e não há rolagem nenhuma para fazer - era por isso que a primeira
     versão disto movia dez pixels e parava. */
  useEffect(() => {
    if (!settled || !sheetH || typeof window === 'undefined') return;
    if (window.matchMedia('(min-width: 1024px)').matches) return;
    const alvo = document.querySelector('[data-resposta="right"]');
    alvo?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [settled, sheetH]);

  /* Quanto espaço a folha de retorno ocupa no rodapé do telefone. Medido, e
     não chutado: a mensagem tem uma, três ou seis linhas dependendo do erro,
     e um valor fixo ou esconde o fim da questão ou deixa um buraco. */
  useLayoutEffect(() => {
    const el = sheetRef.current;
    if (!settled || !el) { setSheetH(0); return; }
    const medir = () => setSheetH(el.getBoundingClientRect().height);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [settled, i]);

  /* O foco do teclado, só quando ele se PERDE (auditoria de 28/09, UX-002).
     Responder desabilita o botão escolhido, e o foco caía no <body>: quem usa
     teclado ou leitor de tela recomeçava do topo da página. Então, se depois
     de responder o foco não está num elemento vivo do player, ele vai para o
     primeiro botão da folha de retorno (o Continuar); ao passar de questão,
     para o enunciado da nova. Sem rolar a tela, e sem mexer em quem está com
     o foco num lugar válido - a regra acima, de não roubar o foco, continua. */
  const focoPerdido = () => {
    const a = document.activeElement as HTMLElement | null;
    return !a || a === document.body || (a as HTMLButtonElement).disabled === true
      || !raizRef.current?.contains(a);
  };
  useEffect(() => {
    if (!settled) return;
    const id = requestAnimationFrame(() => {
      if (focoPerdido()) sheetRef.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [settled]);
  useEffect(() => {
    if (i === 0) return;
    const id = requestAnimationFrame(() => {
      if (focoPerdido()) perguntaRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [i]);

  if (!ex) return null;

  return (
    <div
      ref={raizRef}
      className="grid gap-5 pb-[var(--sheet-h)] lg:pb-0"
      style={{ '--sheet-h': `${sheetH ? sheetH + 16 : 0}px` } as React.CSSProperties}
    >
      <header className="grid gap-3">
        {/* No telefone a etapa já está escrita na barra de etapas logo acima, e
            repetir "prática - sem nota" custa uma linha inteira do pouco que
            cabe antes da pergunta. */}
        {title && !compact && (
          <p className="hidden sm:block font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">{title}</p>
        )}
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300 ease-[var(--ease)]"
              style={{ width: `${((i + (settled ? 1 : 0)) / fila.length) * 100}%` }}
            />
          </div>
          {/* `data-progresso` é para a varredura de exercícios, do mesmo jeito
              que `data-resposta` já é lá embaixo: o contador aparece como
              "3 / 10" no texto, e o cabeçalho da lição mostra "LETRA 7/22"
              logo acima - um robô que lê o primeiro "n/m" da tela pega o
              errado, e foi o que aconteceu na primeira execução. */}
          <span data-progresso={`${i + 1}/${fila.length}`}
                className="font-ui text-[13px] tabular-nums text-ink-muted shrink-0">
            {i + 1} / {fila.length}
          </span>
        </div>
      </header>

      <Card className="p-5 sm:p-7 grid gap-6">
        <h2 ref={perguntaRef} tabIndex={-1}
            className="text-[19px] sm:text-[21px] font-semibold leading-snug focus:outline-none">{ex.promptPt}</h2>
        {/* Só com "Ouvir instruções em português" ligado no menu de
            acessibilidade. Lê o enunciado, nunca as alternativas. */}
        <OuvirInstrucao texto={ex.promptPt} />

        {/* A CHAVE é o item, e não é enfeite. Sem ela o React reaproveita o
            componente de resposta quando dois itens seguidos são do mesmo
            tipo, e o estado de um vaza para o outro: as peças postas na
            palavra anterior apareciam como usadas na seguinte, e o texto
            digitado continuava na caixa. Nas lições isso não aparecia porque
            `spread` nunca põe dois tipos iguais lado a lado; nos modos da
            academia que são de um tipo só - construir, digitar - aparecia no
            segundo item. Pego por `rodada2.mjs`. */}
        <Body key={`${i}:${ex.id}`} ex={ex} settled={!!settled} settledState={settled}
              onChoose={choose} onSettle={settle} />

        {!settled && <Hints hints={ex.hintsPt} audioId={ex.audioId ?? null} />}
      </Card>

      {/* O retorno da resposta, no lugar onde a pessoa está olhando.
          ─────────────────────────────────────────────────────────────────
          No telefone isto ficava no fim do documento, abaixo de quatro
          alternativas de 64px - fora da tela, atrás da barra de navegação.
          Medido: depois de responder, a rolagem continuava em 1px e nem o
          "certo/quase" nem o botão Continuar apareciam. Eram duas rolagens
          por questão, oito questões por letra, vinte e duas letras.

          Então no telefone ele é uma FOLHA presa acima da barra inferior, e
          o `padding` medido acima garante que o fim da questão continue
          alcançável por baixo dela. Num desktop nada disso é necessário: a
          folha volta a ser o último bloco da coluna. */}
      <div aria-live="polite" className="lg:min-h-[92px]">
        {settled && (
          <div
            ref={sheetRef}
            className="fixed inset-x-0 bottom-[calc(60px_+_env(safe-area-inset-bottom))] z-20
                       px-3 pb-2 mx-auto w-full max-w-[720px]
                       lg:static lg:w-auto lg:max-w-none lg:px-0 lg:pb-0 lg:z-auto"
          >
          <Card tone={isRight ? 'mint' : 'amber'}
                className="p-5 animate-rise shadow-[var(--shadow-2)] lg:shadow-[var(--shadow-1)]">
            <p
              className={`flex items-center gap-2 font-ui text-[15px] font-semibold outline-none
                ${isRight ? 'text-[var(--mint-ink)]' : 'text-[var(--amber)]'}`}
            >
              <span aria-hidden>{isRight ? '✓' : '↻'}</span>
              {isRight ? 'Boa! É essa mesma.' : 'Quase. Olhe com calma:'}
            </p>
            {/* The specific reason first, the general explanation after it. A
                learner who chose מִ needs to hear about מִ, not about vowels. */}
            {settled.why && (
              <p className="mt-2 text-[15px] leading-relaxed text-ink font-medium">{settled.why}</p>
            )}
            <p className="mt-2 text-[15px] leading-relaxed text-ink-body">{ex.explainPt}</p>
            {vaiVoltar && (
              <p className="mt-2 font-ui text-[14px] leading-relaxed text-[var(--gold-body)]">
                Esta questão volta daqui a pouco, para você acertar.
              </p>
            )}
            {firstUnaided && (
              <p className="mt-3 pt-3 border-t border-[color:var(--line-soft)]
                            font-ui text-[14px] leading-relaxed text-[var(--mint-ink)]">
                <strong>Você acabou de ler hebraico sem transliteração.</strong>{' '}
                Sem o apoio embaixo, sem decorar - você decodificou. É isto que o
                curso inteiro estava construindo.
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={next} size="md">
                {i + 1 >= fila.length && !vaiVoltar ? 'Ver resultado' : 'Continuar'}
              </Button>
              {hasAudio(ex.audioId) && <AudioButton audioId={ex.audioId!} label="Ouvir" size="sm" slow />}
            </div>
          </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/* The kinds where the wrong OPTION is itself a letter, and so worth recording
   as a confusion. Choosing the wrong meaning of a word is a different kind of
   mistake and does not belong in the ד/ר pile. */
/* Reading a WHOLE WORD, as opposed to a letter or a syllable. These are the
   kinds where getting it right means the learner decoded something. */
const UNAIDED_READ = new Set<Exercise['kind']>([
  'word-meaning', 'type-answer', 'build-word', 'complete-word', 'scene-reading',
  /* Ler uma frase inteira sem apoio é o teto desta escala, não um caso à
     parte: se há um momento em que o curso cumpriu o que prometeu, é este. */
  'sentence-reading'
]);

const GLYPH_CONFUSION = new Set<Exercise['kind']>([
  'letter-recognition', 'print-vs-cursive', 'final-form', 'complete-word', 'odd-one-out'
]);
/* `letter-in-word` e `letter-position` não entram: ali a opção errada é uma
   palavra ou um lugar, e registrar "escolheu שָׁלוֹם" no monte de confusões
   entre letras estragaria o sinal que separa ד de ר. */

/* ── what the learner looks at, and how they answer ──────────────────────── */

function Body({
  ex, settled, settledState, onChoose, onSettle
}: {
  ex: Exercise;
  settled: boolean;
  settledState: Settled | null;
  onChoose: (i: number) => void;
  onSettle: (correct: boolean, opts?: {
    chosen?: number | null; why?: string | null; expected?: string; chosenGlyph?: string;
  }) => void;
}) {
  switch (ex.kind) {
    case 'build-syllable':
      return (
        <BuildSyllable
          consonant={ex.consonant} vowels={ex.vowels} answer={ex.answer} sound={ex.sound}
          settled={settled}
          onAnswer={(correct, chosen) => onSettle(correct, {
            why: correct ? null : `Esse sinal não faz “${ex.sound}”.`,
            expected: ex.vowels[ex.answer], chosenGlyph: chosen
          })}
        />
      );

    case 'build-word':
      return (
        <BuildWord
          tiles={ex.tiles} target={ex.target} hintPt={ex.hintPt}
          settled={settled}
          onAnswer={correct => onSettle(correct, {
            why: correct ? null : 'A ordem não fecha. Em hebraico a primeira letra fica à direita.'
          })}
        />
      );

    case 'match':
      return (
        <MatchPairs
          pairs={ex.pairs} leftKind={ex.leftKind} rightKind={ex.rightKind}
          labelLeft={ex.labelLeft} labelRight={ex.labelRight}
          settled={settled} seed={ex.id}
          onAnswer={(correct, misses) => onSettle(correct, {
            why: correct ? null
              : `Você juntou ${misses.length === 1 ? 'um par' : `${misses.length} pares`} que não combinam.`,
            expected: ex.leftKind === 'glyph' ? misses[0]?.[0] : undefined,
            chosenGlyph: ex.leftKind === 'glyph' ? misses[0]?.[1] : undefined
          })}
        />
      );

    case 'build-letters':
      return (
        <BuildLetters
          tiles={ex.tiles} letras={ex.letras} pt={ex.pt}
          cursiva={ex.cursiva} settled={settled}
          onAnswer={(correct, erro) => onSettle(correct, {
            why: correct ? null : erro
              ? `Na primeira tentativa, a ${erro.posicao + 1}ª letra era ${erro.esperada}, e não ${erro.posta}.`
              : null,
            /* A troca que conta é a da PRIMEIRA tentativa: é ela que diz o que
               o aluno confunde. Vai para o mesmo monte das outras trocas de
               letra, e a Batalha a lê depois. */
            expected: erro?.esperada, chosenGlyph: erro?.posta
          })}
        />
      );

    case 'type-hebrew':
      return (
        <TypeHebrew
          accept={ex.accept} settled={settled} correct={settledState?.correct ?? null}
          onAnswer={correct => onSettle(correct)}
        />
      );

    case 'type-answer':
      return (
        <TypeAnswer
          he={ex.he} accept={ex.accept} placeholder={ex.placeholder}
          settled={settled} correct={settledState?.correct ?? null}
          onAnswer={correct => onSettle(correct)}
        />
      );

    default:
      return (
        <>
          <Stimulus ex={ex} />
          <Options ex={ex} settled={settled} chosen={settledState?.chosen ?? null} onChoose={onChoose} />
        </>
      );
  }
}

/** What the learner looks at while deciding, for the choice kinds. */
function Stimulus({ ex }: { ex: Exercise }) {
  switch (ex.kind) {
    case 'letter-recognition':
    case 'final-form':
    case 'meaning-to-word':
    case 'odd-one-out':
      return null;
    /* A palavra à mão, sem vogais - ou, no modo que vai da impressa para a
       cursiva, a palavra impressa, com elas. No modo `letra`, uma letra da
       palavra cursiva vem destacada. */
    case 'cursive-word':
      return (
        <div className="flex justify-center py-3">
          {ex.modo === 'para-cursiva'
            ? <He size="display">{ex.he}</He>
            : <He size="display" cursive mark={ex.modo === 'letra' ? ex.marca ?? null : null}>
                {ex.escrita}
              </He>}
        </div>
      );
    case 'print-vs-cursive':
      /* O estímulo está numa forma e as alternativas na outra - qual é qual
         vem do próprio exercício, porque as duas direções existem. */
      return (
        <div className="flex justify-center py-2">
          <He size="display" cursive={ex.mostra === 'cursiva'}>{ex.letter}</He>
        </div>
      );
    /* O som está no enunciado e as ALTERNATIVAS são os desenhos: não há
       estímulo para mostrar em cima. */
    case 'letter-variant':
      return null;
    case 'syllable-reading':
    case 'word-meaning':
    case 'vowel-sound':
      return (
        <div className="flex justify-center py-2">
          <He size="display">{ex.he}</He>
        </div>
      );

    /* As duas grafias, em caixas separadas.
       ──────────────────────────────────────────────────────────────────
       Não numa linha só: a pergunta é se as DUAS escrevem o mesmo som, e
       espaço em branco entre sinais de vogal colapsa - o aluno veria um
       borrão e não dois desenhos para comparar. Cada uma na sua caixa é o
       que torna a comparação possível. */
    case 'vowel-pair':
      return (
        <div className="flex justify-center items-center gap-4 py-2">
          {ex.he.split(/\s+/).filter(Boolean).map((sil, i) => (
            <span key={i} className="rounded-[var(--r-md)] bg-surface-2 px-6 py-3">
              <He size="display">{sil}</He>
            </span>
          ))}
        </div>
      );

    /* A frase inteira, palavra por palavra e SEM transliteração.
       ──────────────────────────────────────────────────────────────────
       Cada palavra numa caixa própria, com espaço entre elas: é o que
       permite ao olho parar numa e voltar, que é como se lê uma língua nova.
       Uma linha corrida de hebraico apontado, para quem tem três semanas de
       curso, é uma parede.
       A transliteração fica de fora de propósito - ela aparece na explicação,
       depois de responder. Antes disso ela não ajuda a ler: ela substitui a
       leitura, e o aluno sai achando que leu hebraico quando leu português. */
    case 'sentence-reading':
      return (
        /* `dir="rtl"` já coloca a primeira palavra à direita; o wrap é o
           normal, e não o reverso, porque a linha que sobra vai ABAIXO - em
           hebraico inverte-se a horizontal, nunca a vertical. */
        <div className="flex flex-wrap justify-center items-baseline gap-x-3 gap-y-2 py-3"
             dir="rtl" lang="he">
          {ex.words.map((w, k) => (
            <span key={k} className="inline-block rounded-[var(--r-sm)] px-1.5 py-0.5">
              {/* Uma palavra sozinha é uma placa e recebe o corpo de sempre;
                  duas e três descem um degrau cada, para caberem numa linha de
                  telefone. A 84px, `בְּבַקָּשָׁה` sozinha já ocupa a tela toda. */}
              <He size={ex.words.length > 2 ? 'lg' : ex.words.length > 1 ? 'xl' : 'display'}>
                {w.he}
              </He>
            </span>
          ))}
        </div>
      );

    /* A letra é o enunciado, e as alternativas são PALAVRAS. Mostrá-la grande
       é o exercício: a pessoa tem de segurar a forma na cabeça enquanto varre
       quatro palavras atrás dela. */
    case 'letter-in-word':
      return (
        <div className="flex justify-center py-2">
          <He size="display">{ex.letter}</He>
        </div>
      );

    /* Aqui o contrário: a palavra é o enunciado e a letra é a pista. A seta
       existe porque a pergunta é sobre POSIÇÃO, e quem está aprendendo ainda
       não tem automático que o começo fica à direita. */
    case 'letter-position':
      return (
        <div className="grid gap-2 justify-items-center py-2">
          <He size="display">{ex.he}</He>
          <p className="font-ui text-[13px] text-ink-muted flex items-center gap-2">
            <span>procure</span>
            <He size="inline" className="!text-[20px]">{ex.letter}</He>
            <span aria-hidden className="text-ink-muted">·</span>
            <span>leitura ←</span>
          </p>
        </div>
      );
    case 'sound-to-syllable':
      return (
        <div className="grid gap-1 justify-items-center py-2">
          <span className="font-display text-[44px] sm:text-[56px] font-bold text-[var(--accent)]">
            {ex.sound}
          </span>
          <p className="font-ui text-[13px] text-ink-muted">é assim que soa</p>
        </div>
      );
    case 'complete-word':
      return (
        <div className="grid gap-2 justify-items-center py-2">
          <HeCloze parts={ex.parts} size="xl" />
          <p className="font-ui text-[14px] text-ink-muted">{ex.hintPt}</p>
        </div>
      );
    case 'audio-recognition':
    case 'listen-meaning':
    case 'listen-syllable':
      return (
        <div className="flex justify-center py-2">
          <AudioButton audioId={ex.audioId} label="Ouvir de novo" size="lg" slow />
        </div>
      );
    case 'scene-reading':
      /* The word alone on a plain surface, with the place named above it -
         as close as a screen gets to seeing it on a bottle. */
      return (
        <div className="grid gap-3">
          <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted text-center">
            {ex.wherePt}
          </p>
          <div className="rounded-[var(--r-lg)] bg-surface-2 py-10 px-4 flex items-center justify-center">
            <He size="display">{ex.he}</He>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function Options({
  ex, settled, chosen, onChoose
}: {
  ex: Exercise; settled: boolean; chosen: number | null; onChoose: (i: number) => void;
}) {
  if (!isChoice(ex)) return null;

  /* A row of nearly identical glyphs is the exercise itself, so it is laid out
     as a row and never as a list - the learner has to scan it the way they will
     scan a word. */
  if (ex.kind === 'odd-one-out' || ex.kind === 'letter-variant') {
    return (
      <ul className="flex flex-wrap justify-center gap-2.5" role="list">
        {ex.options.map((opt, idx) => (
          <li key={idx}>
            <button
              type="button"
              disabled={settled}
              onClick={() => onChoose(idx)}
              data-resposta={settled && idx === ex.answer ? 'right' : undefined}
              aria-label={`Posição ${idx + 1}`}
              className={`min-h-[76px] min-w-[72px] px-3 rounded-[var(--r-md)] border-2
                grid place-items-center transition-colors disabled:cursor-default
                ${settled && idx === ex.answer ? 'border-[var(--green)] bg-mint'
                  : settled && idx === chosen ? 'border-[var(--amber)] bg-[var(--amber-wash)]'
                  : settled ? 'border-line bg-surface opacity-55'
                  : 'border-line bg-surface hover:border-[var(--accent-soft)] hover:bg-[var(--accent-wash)]'}`}
            >
              <He size="lg">{opt}</He>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  const tiles = tileColumns(ex);
  return (
    <ul className={`grid gap-2.5 ${tiles}`} role="list">
      {ex.options.map((opt, idx) => {
        const state = !settled ? 'idle'
          : idx === ex.answer ? 'right'
          : idx === chosen ? 'wrong' : 'muted';
        return (
          <li key={`${ex.id}-${idx}`}>
            <OptionButton
              ex={ex} option={opt} index={idx} state={state}
              tile={tiles !== ''}
              onClick={() => onChoose(idx)} disabled={settled}
            />
          </li>
        );
      })}
    </ul>
  );
}

/* Which exercises answer in Hebrew. */
const hebrewOptionsOf = (ex: Exercise): boolean =>
  ex.kind === 'letter-recognition' || ex.kind === 'final-form' ||
  ex.kind === 'print-vs-cursive' || ex.kind === 'meaning-to-word' ||
  ex.kind === 'complete-word' || ex.kind === 'audio-recognition' ||
  ex.kind === 'sound-to-syllable' || ex.kind === 'listen-syllable' ||
  ex.kind === 'odd-one-out' || ex.kind === 'letter-in-word' ||
  (ex.kind === 'cursive-word' && ex.modo !== 'significado');
  /* `letter-position` responde em PORTUGUÊS - começo, meio, fim -, então
     fica de fora: a pergunta é sobre a palavra, a resposta é sobre lugar. */
  /* scene-reading answers in PORTUGUESE - the Hebrew is the question. */

/* Tiles are for Hebrew short enough to read at a glance: a letter, a syllable,
   a two- or three-consonant word. Measured in CLUSTERS, not code units - a
   pointed letter is two to four codepoints and `.length` would call מָ a long
   option. One column under the thumb, always: a phone has no width to give
   away, and the phone is where most of the studying happens. */
function tileColumns(ex: Exercise): string {
  if (!isChoice(ex) || !hebrewOptionsOf(ex)) return '';
  const longest = Math.max(...ex.options.map(o => clusters(o).length));
  if (longest <= 1) return 'sm:grid-cols-4';
  if (longest <= 4) return 'sm:grid-cols-2 lg:grid-cols-4';
  return '';
}

function OptionButton({
  ex, option, index, state, tile, onClick, disabled
}: {
  ex: Exercise; option: string; index: number;
  state: 'idle' | 'right' | 'wrong' | 'muted';
  tile: boolean;
  onClick: () => void; disabled: boolean;
}) {
  const hebrewOption = hebrewOptionsOf(ex);
  /* Nas duas formas da mesma letra, a alternativa está sempre no desenho
     CONTRÁRIO ao do estímulo. */
  const cursive = (ex.kind === 'print-vs-cursive' && ex.mostra === 'impressa')
    || (ex.kind === 'cursive-word' && ex.modo === 'para-cursiva');

  const TONE = {
    idle:  'border-line bg-surface hover:border-[var(--accent-soft)] hover:bg-[var(--accent-wash)]',
    right: 'border-[var(--green)] bg-mint',
    wrong: 'border-[var(--amber)] bg-[var(--amber-wash)]',
    muted: 'border-line bg-surface opacity-55'
  } as const;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-resposta={state}
      className={`relative w-full min-h-[64px] rounded-[var(--r-md)] border-2 px-4 py-3
        flex items-center gap-4 text-left transition-all duration-[var(--dur)] ease-[var(--ease)]
        disabled:cursor-default ${TONE[state]}
        ${tile ? 'sm:h-full sm:min-h-[104px] sm:justify-center sm:gap-0 sm:px-3' : ''}`}
    >
      <span aria-hidden
        className={`shrink-0 w-7 h-7 rounded-md bg-surface-2 text-ink-muted
                   font-ui text-[12px] font-semibold grid place-items-center
                   ${tile ? 'sm:absolute sm:top-2 sm:left-2' : ''}`}>
        {state === 'right' ? '✓' : state === 'wrong' ? '↻' : index + 1}
      </span>
      {hebrewOption
        ? <He size={cursive ? 'lg' : 'word'} cursive={cursive}>{option}</He>
        : <span className="text-[16px] text-ink">{option}</span>}
    </button>
  );
}
