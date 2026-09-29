'use client';

/* Academia de Leitura - the practice room.
 * ─────────────────────────────────────────────────────────────────────────
 * Everything here is generated from what the learner has already unlocked, by
 * the same engine that builds the lessons. Nothing is authored twice, nothing
 * can show a letter they have not met, and the room stays useful after the
 * twenty-second lesson - which is the point. A course you cannot practise is a
 * course you finish once and close.
 *
 * The timed mode races the learner against their OWN last time and nothing
 * else. There is no leaderboard and no target: "da última vez, 41 s" is
 * motivating; "o tempo médio é 28 s" is a reason to stop.
 */

import { useCallback, useEffect, useMemo, useState, type FocusEvent } from 'react';

/* O foco não pode escapar do jogo (auditoria de 28/09, UX-002). Responder
   desabilita o botão tocado, o foco sai e o próximo Tab caía no rodapé
   ("Reembolso", "Precisa de ajuda?"). Quando o foco sai do jogo sem ir para
   lugar nenhum, ele volta ao primeiro botão ativo do jogo. Um só lugar, para
   os cinco jogos. */
function segurarFoco(e: FocusEvent<HTMLDivElement>) {
  if (e.relatedTarget) return;                        // foi para um lugar de verdade
  const raiz = e.currentTarget;
  requestAnimationFrame(() => {
    const a = document.activeElement;
    if (a && a !== document.body && document.body.contains(a)) return;
    raiz.querySelector<HTMLElement>('button:not([disabled])')?.focus({ preventScroll: true });
  });
}
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { Milestone } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { SoundLab, VowelSigns } from '@/components/learn/SoundLab';
import { WritingCanvas } from '@/components/learn/WritingCanvas';
import { EscreverPalavras } from '@/components/learn/EscreverPalavras';
import { palavrasDosTextosLidos } from '@/lib/leitura';
import { audioAvailable } from '@/components/learn/AudioButton';
import { ParaRevisar } from '@/components/game/Debt';
import { useProgress } from '@/lib/state/store';
import { allLetters, type Letter } from '@/lib/content';
import { onCarrier } from '@/lib/hebrew';
import { availableModes, buildGym, confusionPair, type GymMode } from '@/lib/engine/gym';
import { escolherRodada, registrarRodada } from '@/lib/rodadas';
import { GuiaTeclado } from '@/components/learn/GuiaTeclado';
import {
  montarBatalha, montarCacada, montarCursiva, paresParaTreinar,
  nivelDe, NIVEL_LABEL, type Nivel
} from '@/lib/engine/jogos';
import type { LearnerState } from '@/lib/state/types';
import { rng } from '@/lib/engine/rng';
import { Match, type ResultadoJogo } from '@/components/game/Match';
import { Blast } from '@/components/game/Blast';
import { CacaLetra } from '@/components/game/CacaLetra';
import { Batalha } from '@/components/game/Batalha';
import { ImpressaCursiva } from '@/components/game/ImpressaCursiva';
import { TestRun, RelatorioTeste, type ResultadoTeste } from '@/components/game/TestRun';
import {
  deLetras, habilidadeDoJogo, montarBaralho, perguntasDe, TIPOS_POR_JOGO, type Par, type Pergunta
} from '@/lib/engine/deck';
import { letterMastery } from '@/lib/state/rules';
import { track } from '@/lib/analytics';

/* Os que saem do BARALHO (lib/engine/deck.ts) e os que saem do motor de
   reconhecimento (lib/engine/jogos.ts). São duas famílias de verdade, e o
   tipo separado é o que impede alguém de passar 'caca' para `fazerJogo` e
   descobrir isso num `undefined` em produção. */
type DadosDeJogo = ReturnType<typeof montarNovo>;
type JogoDeBaralho = 'match' | 'blast' | 'teste';
type JogoNovo = 'caca' | 'batalha' | 'cursiva';
type Jogo = JogoDeBaralho | JogoNovo;
const DE_BARALHO = (j: Jogo): j is JogoDeBaralho =>
  j === 'match' || j === 'blast' || j === 'teste';

type Screen =
  | { kind: 'menu' }
  /* Palavras inteiras em cursiva, à mão. */
  | { kind: 'palavras-a-mao' }
  | { kind: 'run'; mode: GymMode; startedAt: number }
  /* O guia do teclado, entre o toque no modo de digitação e o modo. */
  | { kind: 'teclado'; mode: GymMode }
  | { kind: 'done'; mode: GymMode; result: PlayerResult; seconds: number }
  /* `dados` guarda a rodada dos jogos de reconhecimento, construída UMA vez.
     ──────────────────────────────────────────────────────────────────────
     Ela morava no corpo do render, e isso era um defeito de verdade: a
     rodada é montada a partir do PROGRESSO, e o progresso muda a cada
     resposta - então cada toque remontava a grade, com outro alvo e outras
     letras, debaixo do dedo de quem estava jogando. Medido: uma caça de três
     alvos travava em "2 de 3" e trocava o {{נ}} por um {{ה}} no meio da
     partida.
     Guardada aqui, a rodada é imutável enquanto durar - que é o que uma
     rodada é. */
  | { kind: 'jogo'; jogo: Jogo; rodada: number; dados?: DadosDeJogo }
  | { kind: 'jogoFim'; jogo: Jogo; rodada: number; r: ResultadoJogo }
  | { kind: 'testeFim'; rodada: number; r: ResultadoTeste }
  | { kind: 'lab' }
  | { kind: 'escrita' };

/* Os três jogos, descritos no mesmo formato dos modos da academia - é a
   mesma prateleira, e eles não são um anexo. */
export const JOGOS: Record<Jogo, { titlePt: string; descPt: string; minimo: number }> = {
  match: {
    titlePt: 'Match',
    descPt: 'Junte cada letra ao seu nome, ao seu som ou a uma palavra.',
    minimo: 3
  },
  blast: {
    titlePt: 'Blast',
    descPt: 'Rápido: aparece uma letra, você escolhe. Sequência de acertos na tela.',
    minimo: 4
  },
  teste: {
    titlePt: 'Teste',
    descPt: 'Sem correção durante. No fim, a nota e a lista do que escapou.',
    minimo: 4
  },
  /* Os três que entraram em 22/09/2026. Entram NESTA prateleira, e não numa
     tela nova: já existia um lugar para praticar, e um segundo seria dois
     lugares onde o aluno procura a mesma coisa. */
  caca: {
    titlePt: 'Caça à letra',
    descPt: 'Encontre a letra certa no meio da confusão.',
    minimo: 3
  },
  batalha: {
    titlePt: 'Batalha das parecidas',
    descPt: 'Duas letras que se parecem, cara a cara, até a diferença ficar óbvia.',
    minimo: 2
  },
  cursiva: {
    titlePt: 'Impressa × cursiva',
    descPt: 'A mesma letra nos dois alfabetos: o do livro e o da mão.',
    minimo: 3
  }
};

export function AcademiaClient() {
  const p = useProgress();
  const [screen, setScreen] = useState<Screen>({ kind: 'menu' });

  /* Only what has been unlocked. A letter whose lesson was started counts:
     the learner has met it, and practising it is exactly what they should be
     doing. */
  const unlocked = useMemo<Letter[]>(
    () => allLetters().filter(l => (p.state.lessons[l.id]?.stagesDone.length ?? 0) > 0),
    [p.state.lessons]
  );

  const audio = audioAvailable();
  const modes = useMemo(
    () => availableModes(p.state, unlocked, audio, p.day),
    [p.state, unlocked, audio, p.day]
  );

  /* A rodada é montada UMA vez, quando começa. Montada a cada render ela
     seguiria o estado, e cada resposta muda o domínio das letras, que decide
     quais palavras e letras vêm primeiro: o item seguinte trocaria no meio da
     sessão. A semente vem do começo da sessão, então refazer o modo no mesmo
     dia dá outra rodada. Por isso a dependência é só `screen`. */
  const rodada = useMemo(
    () => (screen.kind === 'run'
      ? (() => {
          /* A semente sai da rodada da categoria: o modo refeito evita as
             perguntas das últimas vezes (lib/rodadas.ts). */
          const gerar = (seed: string) => buildGym(screen.mode, p.state, unlocked, { audioAvailable: audio, day: p.day, seed });
          const { seed, itens } = escolherRodada(`academia-${screen.mode.id}`, s => gerar(s).exercises);
          return { ...gerar(seed), exercises: itens };
        })()
      : null),
    [screen]
  );

  const tecladoOk = !!p.state.firsts['teclado-hebraico'];
  const start = useCallback((mode: GymMode) => {
    /* A digitação pede o teclado hebraico, e o aluno confirma UMA vez que o
       instalou. Sem isso o primeiro exercício seria uma caixa que recebe
       letras latinas e não há o que corrigir. */
    if (mode.needsKeyboard && !tecladoOk) {
      setScreen({ kind: 'teclado', mode });
      return;
    }
    track('gym_started', { mode: mode.id });
    setScreen({ kind: 'run', mode, startedAt: Date.now() });
  }, [tecladoOk]);

  /* Deep-link: o painel manda para cá com o jogo já escolhido, para que
     "Match" no painel seja um toque e não três. */
  const busca = useSearchParams();
  const pedido = busca?.get('jogo');
  useEffect(() => {
    if (pedido && pedido in JOGOS) {
      setScreen({ kind: 'jogo', jogo: pedido as Jogo, rodada: 0 });
    }
  }, [pedido]);
  /* O vocabulário manda para cá com `?treino=palavras-a-mao`. */
  const treino = busca?.get('treino');
  useEffect(() => {
    if (treino === 'palavras-a-mao') setScreen({ kind: 'palavras-a-mao' });
  }, [treino]);

  /* As letras que mais custam entram primeiro no baralho. É o mesmo sinal que
     alimenta a revisão - aqui ele só decide a ORDEM, nunca o conteúdo. */
  const peso = useCallback((letterId: string) => {
    const m = letterMastery(p.state, letterId);
    return m === 'novo' ? 1.6 : m === 'aprendendo' ? 1.4 : m === 'forte' ? 0.6 : 1;
  }, [p.state]);

  const fazerJogo = useCallback((jogo: JogoDeBaralho, rodada: number): {
    baralho: Par[]; perguntas: Pergunta[];
  } => {
    const semente = `${jogo}-${unlocked.length}-${rodada}`;
    const fontes = deLetras(unlocked, TIPOS_POR_JOGO[jogo]);
    const quantos = jogo === 'match' ? 6 : jogo === 'blast' ? 12 : 10;
    const baralho = montarBaralho(fontes, { quantos, semente, peso });
    const perguntas = jogo === 'match' ? [] : perguntasDe(baralho, fontes, {
      semente: `${semente}-q`,
      sentido: jogo === 'teste' ? 'misto' : 'he'
    });
    return { baralho, perguntas };
  }, [unlocked, peso]);

  /* O nível sai do progresso, e não de um seletor na tela. Ver `nivelDe`. */
  const nivel = useMemo(() => nivelDe(p.state, unlocked), [p.state, unlocked]);

  const fazerNovo = useCallback(
    (jogo: Jogo, rodada: number) => montarNovo(jogo, rodada, p.state, unlocked, nivel),
    [p.state, unlocked, nivel]);

  /* Cada tentativa alimenta o mesmo modelo que as lições alimentam: o jogo
     não tem placar próprio, ele escreve na mesma memória.

     `escolhida` é o que os jogos novos acrescentaram, e não é detalhe: com
     ela o erro deixa de ser "errou o dálet" e passa a ser "trocou ד por ר",
     que é o par treinável. É exatamente isso que a Batalha lê depois para
     saber quais são as inimigas de hoje - o jogo alimenta o critério que
     escolhe o próprio jogo. */
  const registrar = useCallback((a: {
    id: string; letterId: string; certo: boolean; escolhida?: string;
  }) => {
    if (!a.letterId) return;
    const L = unlocked.find(l => l.id === a.letterId);
    /* Só um GLIFO vira troca registrada. No Blast e no Teste a alternativa
       escolhida pode ser um nome ("Mem") ou um som ("m"), e gravar
       `מ>Mem` como confusão sujava a lista que a Batalha lê para escolher os
       pares - uma troca que nenhuma letra do alfabeto consegue resolver. */
    const glifo = a.escolhida && /^[\u05D0-\u05EA]$/.test(a.escolhida) ? a.escolhida : null;
    p.answer({
      itemId: `jogo:${a.id}`, letterId: a.letterId, correct: a.certo,
      skill: habilidadeDoJogo(a.id),
      ...(L && glifo ? { expected: L.letter, chosen: glifo } : {})
    });
  }, [p, unlocked]);

  /* ── os jogos de reconhecimento ─────────────────────────────────────── */
  if (screen.kind === 'jogo' && !DE_BARALHO(screen.jogo)) {
    const jogo = screen.jogo;
    /* Se a tela já carrega a rodada, é ela que vale. A construção aqui só
       serve ao primeiro render e ao deep-link, e o `setScreen` logo abaixo
       congela o resultado - a partir daí nada a remonta. */
    const dados = screen.dados ?? fazerNovo(jogo, screen.rodada);
    if (!screen.dados) setScreen({ ...screen, dados });
    const info = JOGOS[jogo];

    const vazio = jogo === 'caca' ? !dados.cacada?.length
      : jogo === 'cursiva' ? !dados.cursiva?.length
      : !dados.batalha;

    if (vazio || unlocked.length < info.minimo) {
      return (
        <Empty onBack={() => setScreen({ kind: 'menu' })}>
          {jogo === 'batalha'
            ? 'Ainda não há duas letras parecidas entre as que você aprendeu. Siga mais uma lição e volte.'
            : 'Ainda não há letras suficientes para montar a rodada. Siga mais uma lição e volte.'}
        </Empty>
      );
    }

    const fim = (r: ResultadoJogo) => {
      const score = r.total ? r.acertos / r.total : 0;
      p.finishGym(jogo, score, r.segundos);
      track('game_completed', { jogo, score, seconds: r.segundos });
      setScreen({ kind: 'jogoFim', jogo, rodada: screen.rodada, r });
    };

    return (
      <div className="focus-col grid gap-5" onBlur={segurarFoco}>
        <GymHeader
          mode={{ titlePt: info.titlePt } as GymMode}
          label={NIVEL_LABEL[nivel]}
          onBack={() => setScreen({ kind: 'menu' })}
        />
        {jogo === 'caca' && dados.cacada && (
          <CacaLetra key={`ca-${screen.rodada}`} cacas={dados.cacada} unlocked={unlocked}
                     onResposta={registrar} onFim={fim} />
        )}
        {jogo === 'batalha' && dados.batalha && (
          <Batalha key={`ba-${screen.rodada}`} dados={dados.batalha}
                   onResposta={registrar} onFim={fim} />
        )}
        {jogo === 'cursiva' && dados.cursiva && (
          <ImpressaCursiva key={`cu-${screen.rodada}`} rodadas={dados.cursiva}
                           onResposta={registrar} onFim={fim} />
        )}
      </div>
    );
  }

  /* ── os três jogos de baralho ───────────────────────────────────────── */
  if (screen.kind === 'jogo' && DE_BARALHO(screen.jogo)) {
    const { baralho, perguntas } = fazerJogo(screen.jogo, screen.rodada);
    const info = JOGOS[screen.jogo];
    const poucos = screen.jogo === 'match'
      ? baralho.length < info.minimo
      : perguntas.length < info.minimo;

    if (poucos) {
      return (
        <Empty onBack={() => setScreen({ kind: 'menu' })}>
          {screen.jogo === 'match'
            ? 'O Match precisa de pelo menos três pares diferentes. Siga mais uma lição e volte.'
            : 'Ainda não há letras suficientes para montar as alternativas. Siga mais uma lição e volte.'}
        </Empty>
      );
    }

    return (
      <div className="focus-col grid gap-5">
        <GymHeader
          mode={{ titlePt: info.titlePt } as GymMode}
          label={info.titlePt}
          onBack={() => setScreen({ kind: 'menu' })}
        />
        {screen.jogo === 'match' && (
          <Match
            key={`m-${screen.rodada}`}
            baralho={baralho}
            semente={`match-${unlocked.length}-${screen.rodada}`}
            onResposta={a => registrar({ id: a.parId, letterId: a.letterId, certo: a.certo })}
            onFim={r => {
              const score = r.total ? r.acertos / (r.acertos + r.erros || 1) : 0;
              p.finishGym('match', score, r.segundos);
              track('game_completed', { jogo: 'match', score: r.total ? r.acertos / (r.acertos + r.erros || 1) : 0, seconds: r.segundos });
              setScreen({ kind: 'jogoFim', jogo: 'match', rodada: screen.rodada, r });
            }}
          />
        )}
        {screen.jogo === 'blast' && (
          <Blast
            key={`b-${screen.rodada}`}
            perguntas={perguntas}
            onResposta={registrar}
            onFim={r => {
              p.finishGym('blast', r.total ? r.acertos / r.total : 0, r.segundos);
              track('game_completed', { jogo: 'blast', score: r.total ? r.acertos / r.total : 0, seconds: r.segundos });
              setScreen({ kind: 'jogoFim', jogo: 'blast', rodada: screen.rodada, r });
            }}
          />
        )}
        {screen.jogo === 'teste' && (
          <TestRun
            key={`t-${screen.rodada}`}
            perguntas={perguntas}
            onResposta={registrar}
            onFim={r => {
              p.finishGym('teste', r.score, r.segundos);
              track('game_completed', { jogo: 'teste', score: r.score, seconds: r.segundos });
              setScreen({ kind: 'testeFim', rodada: screen.rodada, r });
            }}
          />
        )}
      </div>
    );
  }

  if (screen.kind === 'testeFim') {
    return (
      <div className="focus-col grid gap-5">
        <GymHeader mode={{ titlePt: 'Teste' } as GymMode} label="Resultado"
                   onBack={() => setScreen({ kind: 'menu' })} />
        <RelatorioTeste
          r={screen.r}
          onRefazer={() => setScreen({ kind: 'jogo', jogo: 'teste', rodada: screen.rodada + 1 })}
        >
          <Button variant="secondary" onClick={() => setScreen({ kind: 'menu' })}>
            Voltar para a academia
          </Button>
          <LinkButton href="/meu-hebraico" variant="ghost">Continuar o curso</LinkButton>
        </RelatorioTeste>
      </div>
    );
  }

  if (screen.kind === 'jogoFim') {
    const { r, jogo } = screen;
    const pct = r.total ? Math.round((r.acertos / r.total) * 100) : 0;

    /* O arco da Batalha: o que mudou desde que ele trocava estas duas.
       ────────────────────────────────────────────────────────────────────
       É a única frase do jogo que compara passado e presente, e por isso ela
       só aparece quando existe passado - um par que veio dos erros DELE, e
       uma rodada que foi bem. Dita para todo mundo, em toda rodada, ela
       viraria enfeite e pararia de significar alguma coisa. */
    const par = jogo === 'batalha' ? confusionPair(p.state, unlocked) : null;
    const arco = par && pct >= 70 && Object.keys(p.state.confusions).length > 0
      ? `Você confundia ${par[0].namePt} e ${par[1].namePt}. Agora acertou ${r.acertos} de ${r.total}.`
      : null;

    return (
      <div className="focus-col grid gap-5">
        <Milestone
          kicker={jogo === 'match'
            ? `${r.total} pares · ${r.erros} ${r.erros === 1 ? 'erro' : 'erros'} · ${r.segundos}s`
            : `${r.acertos} de ${r.total} · ${pct}%`}
          title={arco ?? (r.erros === 0 ? 'Sem um erro.' : pct >= 70 ? 'Boa sessão.' : 'Sessão feita.')}
          body={r.erros === 0
            ? 'Esse conjunto está firme. Vale aumentar o material: siga mais uma letra.'
            : 'O que escapou já entrou na fila de revisão, no dia certo de voltar.'}
        >
          <Button onClick={() => setScreen({ kind: 'jogo', jogo, rodada: screen.rodada + 1 })}>
            Mais uma
          </Button>
          <Button variant="secondary" onClick={() => setScreen({ kind: 'menu' })}>
            Escolher outro
          </Button>
          <LinkButton href="/meu-hebraico" variant="ghost">Continuar o curso</LinkButton>
        </Milestone>
      </div>
    );
  }

  if (screen.kind === 'teclado') {
    const mode = screen.mode;
    return (
      <div className="focus-col grid gap-5">
        <GymHeader mode={mode} label="Antes: o teclado hebraico" onBack={() => setScreen({ kind: 'menu' })} />
        <p className="font-ui text-[16px] leading-relaxed text-ink-body m-0">
          Este é o único exercício do curso que pede o teclado hebraico do seu aparelho.
          Adicione uma vez - leva um minuto - e ele fica disponível ao lado do português.
        </p>
        <GuiaTeclado onConfirmar={() => {
          p.markFirst('teclado-hebraico');
          track('keyboard_confirmed', {});
          track('gym_started', { mode: mode.id });
          setScreen({ kind: 'run', mode, startedAt: Date.now() });
        }} />
        {/* 29/09/2026: o exercício agora tem um teclado hebraico na tela
            (components/learn/TecladoHebraico.tsx). Instalar continua sendo o
            melhor, mas deixou de ser condição. */}
        <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">
          Prefere não instalar agora? O exercício tem um teclado hebraico na tela.
        </p>
        <Button variant="secondary" onClick={() => {
          p.markFirst('teclado-hebraico');
          track('gym_started', { mode: mode.id });
          setScreen({ kind: 'run', mode, startedAt: Date.now() });
        }}>
          Usar o teclado da tela
        </Button>
      </div>
    );
  }

  if (screen.kind === 'run') {
    const run = rodada ?? { exercises: [], label: '' };
    if (!run.exercises.length) {
      return (
        <Empty onBack={() => setScreen({ kind: 'menu' })}>
          Este modo ainda não tem material suficiente. Siga mais uma lição e volte.
        </Empty>
      );
    }
    return (
      <div className="focus-col grid gap-5">
        <GymHeader mode={screen.mode} label={run.label} onBack={() => setScreen({ kind: 'menu' })} />
        {screen.mode.timed && <Cronometro desde={screen.startedAt} />}
        <ExercisePlayer
          key={screen.mode.id + screen.startedAt}
          exercises={run.exercises}
          title={screen.mode.titlePt}
          onDone={result => {
            const seconds = Math.round((Date.now() - screen.startedAt) / 1000);
            track('gym_completed', { mode: screen.mode.id, score: result.score, seconds });
            if (rodada) registrarRodada(`academia-${screen.mode.id}`, rodada.exercises);
            p.finishGym(screen.mode.id, result.score, seconds);
            setScreen({ kind: 'done', mode: screen.mode, result, seconds });
          }}
        />
      </div>
    );
  }

  if (screen.kind === 'done') {
    const { mode, result, seconds } = screen;
    const pct = Math.round(result.score * 100);
    const prev = p.state.gym?.[mode.id];
    /* The previous best was written by finishGym before this screen rendered,
       so "da última vez" has to come from the run before that one. */
    const earlier = prev?.previousSeconds ?? null;
    const recorde = prev?.bestSeconds ?? null;
    /* Bateu o recorde? `finishGym` já gravou esta partida, então o recorde
       guardado JÁ inclui ela - a comparação honesta é com o tempo anterior. */
    const bateu = mode.timed && earlier != null && seconds < earlier;

    return (
      <div className="focus-col grid gap-5">
        <Milestone
          kicker={`${result.correct} de ${result.total} · ${pct}%`}
          title={bateu ? 'Recorde seu.' : pct >= 80 ? 'Boa sessão.' : 'Sessão feita.'}
          body={
            mode.timed && earlier != null
              ? bateu
                ? `${seconds} s, contra ${earlier} s da última vez.`
                : `Você levou ${seconds} s. Da última vez: ${earlier} s.`
              : mode.timed
                ? `Você levou ${seconds} s. Da próxima vez dá para comparar.`
                : pct >= 80
                  ? 'Esse material está firme. Vale trocar de modo.'
                  : 'O que escapou já entrou na fila de revisão.'
          }
        >
          {/* O placar do modo cronometrado, em números separados.
              ──────────────────────────────────────────────────────────────
              O pedido era ver acertos, erros, precisão, tempo e recorde. Uma
              frase corrida não serve para comparar com a próxima partida -
              e comparar com a própria marca anterior é a única competição que
              este curso tem, de propósito: não há ranking entre alunos. */}
          {mode.timed && (
            <dl className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 list-none p-0 m-0 mb-1">
              {([
                ['Acertos', String(result.correct)],
                ['Erros', String(result.total - result.correct)],
                ['Precisão', `${pct}%`],
                ['Tempo', `${seconds}s`]
              ] as const).map(([rotulo, valor]) => (
                <div key={rotulo}
                     className="rounded-[var(--r-md)] border border-line bg-surface px-3 py-2.5
                                grid gap-0.5 justify-items-center">
                  <dt className="font-ui text-[11.5px] uppercase tracking-[.08em] text-ink-muted">
                    {rotulo}
                  </dt>
                  <dd className="font-ui text-[19px] font-bold tabular-nums text-ink m-0">{valor}</dd>
                </div>
              ))}
            </dl>
          )}
          {mode.timed && recorde != null && (
            <p className="font-ui text-[13.5px] text-ink-muted m-0 mb-1">
              Seu melhor tempo neste modo: <strong className="font-semibold text-ink">{recorde}s</strong>.
            </p>
          )}
          <Button onClick={() => start(mode)}>Mais uma</Button>
          <Button variant="secondary" onClick={() => setScreen({ kind: 'menu' })}>
            Escolher outro modo
          </Button>
        </Milestone>
      </div>
    );
  }

  if (screen.kind === 'lab') {
    return (
      <div className="grid gap-5">
        <GymHeader
          mode={{ titlePt: 'Sons e sinais' } as GymMode}
          label="Tudo o que você já pode ler"
          onBack={() => setScreen({ kind: 'menu' })}
        />
        <SoundLab letters={unlocked} />
        <div className="grid gap-2 reading">
          <h2 className="font-display text-[19px] font-bold text-ink mt-2">Os sinais de vogal</h2>
          <p className="font-ui text-[14px] text-ink-muted">
            O mesmo sinal vale em qualquer consoante. É por isso que aprender cinco
            sinais vale mais do que decorar sílaba por sílaba.
          </p>
        </div>
        <VowelSigns demoLetter={unlocked[unlocked.length - 1]?.letter} />
      </div>
    );
  }

  if (screen.kind === 'palavras-a-mao') {
    return (
      <div className="grid gap-5">
        <GymHeader
          mode={{ titlePt: 'Palavras à mão' } as GymMode}
          label="Escreva em cursiva as palavras que você já aprendeu"
          onBack={() => setScreen({ kind: 'menu' })}
        />
        <EscreverPalavras letras={unlocked} semente={`a-mao-${p.day}`}
                          extras={palavrasDosTextosLidos(p.state)} />
      </div>
    );
  }

  if (screen.kind === 'escrita') {
    /* The letter the learner is weakest at writing, or the newest one. Writing
       practice with nothing to aim at is doodling. */
    const target = unlocked
      .slice()
      .sort((a, b) => {
        const s = (l: Letter) => p.state.skills[l.id]?.escrever?.streak ?? -1;
        return s(a) - s(b) || b.order - a.order;
      })[0] ?? unlocked[unlocked.length - 1];
    if (!target) return <Empty onBack={() => setScreen({ kind: 'menu' })}>Faça a primeira lição.</Empty>;
    return (
      <div className="grid gap-5">
        <GymHeader
          mode={{ titlePt: 'Escrita' } as GymMode}
          label={`A letra que mais precisa: ${target.namePt}`}
          onBack={() => setScreen({ kind: 'menu' })}
        />
        <WritingCanvas
          glyph={target.letter}
          letterId={target.id}
          label={target.namePt}
          onScored={score => p.recordWriting(target.id, score)}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="grid gap-3 reading">
        <Badge tone="accent">Academia de Leitura</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold">Praticar</h1>
        <p className="font-ui text-[15px] text-ink-muted">
          Tudo aqui é montado com as letras que você já aprendeu - {unlocked.length} até
          agora. Escolha o que quer treinar, ou deixe a revisão escolher por você.
        </p>
      </header>

      {!unlocked.length ? (
        <Card tone="amber" className="p-6 grid gap-3">
          <p className="text-[15px] leading-relaxed text-ink-body">
            A academia abre depois da primeira lição - ela só usa letras que você já viu,
            e por enquanto não há nenhuma.
          </p>
          <LinkButton href="/meu-hebraico" className="justify-self-start">Começar a primeira letra</LinkButton>
        </Card>
      ) : (
        <>
          {/* Os jogos primeiro, e em cartões maiores: são eles que alguém
              abre quando tem cinco minutos e nenhuma paciência para escolher
              um modo. Os treinos por assunto continuam logo abaixo, para quem
              sabe o que quer.

              Os seis numa prateleira só, e não dois grupos: para o aluno não
              existe "jogo de baralho" e "jogo de reconhecimento" - existe o
              que ele quer jogar agora. A divisão é do código, e o código não
              é assunto dele. */}
          <section aria-labelledby="jogos" className="grid gap-3">
            <h2 id="jogos" className="font-display text-[18px] font-semibold tracking-[-0.018em] text-ink">
              Jogos de prática
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
              {(['caca', 'batalha', 'cursiva', 'match', 'blast', 'teste'] as const).map(jogo => (
                <li key={jogo}>
                  <button
                    type="button"
                    onClick={() => setScreen({ kind: 'jogo', jogo, rodada: 0 })}
                    className="w-full h-full text-left rounded-[18px] border border-line bg-[var(--card)]
                               p-5 grid gap-1.5 content-start transition-[box-shadow,border-color]
                               duration-[250ms] hover:shadow-[var(--sh)] hover:border-[var(--teal)]"
                  >
                    <span aria-hidden className="w-10 h-10 rounded-[12px] bg-[var(--teal-soft)]
                                                 grid place-items-center mb-1">
                      <IconeJogo jogo={jogo} />
                    </span>
                    <span className="font-display text-[18px] font-semibold tracking-[-0.018em] text-ink">
                      {JOGOS[jogo].titlePt}
                    </span>
                    <span className="font-ui text-[13.5px] leading-[1.5] text-ink-muted">
                      {JOGOS[jogo].descPt}
                    </span>
                    <GymBest modeId={jogo} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em] text-ink mt-2">
            Treinar por assunto
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {modes.map(({ mode, ready, whyNot }) => (
              <li key={mode.id}>
                <button
                  type="button"
                  disabled={!ready}
                  onClick={() => start(mode)}
                  className={`w-full h-full text-left rounded-[var(--r-lg)] border p-4 grid gap-1.5
                    transition-colors
                    ${ready
                      ? 'border-line bg-surface hover:border-[var(--accent-soft)] hover:bg-[var(--accent-wash)]'
                      : 'border-line-soft bg-surface-2 opacity-70 cursor-default'}`}
                >
                  <span className="flex items-center gap-2.5">
                    <span aria-hidden className="w-9 h-9 rounded-[var(--r-md)] bg-surface-2
                                                 grid place-items-center text-[16px] text-ink">
                      {/[֐-׿]/.test(mode.icon)
                        /* A bare vowel mark has nothing to sit on and renders
                           as a stray dot in the corner of the tile; onCarrier
                           puts it on U+25CC, which is Unicode's own way of
                           showing a combining mark on its own. */
                        ? <He size="inline">{onCarrier(mode.icon)}</He>
                        : mode.icon}
                    </span>
                    <span className="font-display text-[16px] font-bold text-ink">{mode.titlePt}</span>
                    {mode.timed && (
                      <span className="ml-auto font-ui text-[11px] uppercase tracking-[.07em]
                                       text-[var(--accent)]">tempo</span>
                    )}
                  </span>
                  <span className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
                    {ready ? mode.descPt : whyNot}
                  </span>
                  <GymBest modeId={mode.id} />
                </button>
              </li>
            ))}
          </ul>

          {/* What the course thinks you are bad at, said out loud. Without it,
              "a revisão escolhe por você" is a claim taken on faith. */}
          <ParaRevisar />

          {/* Not a quiz: the two reference surfaces. Kept at the bottom because
              a learner who came here to practise should not land on a table. */}
          <div className="grid gap-3 sm:grid-cols-2">
            <ReferenceCard
              title="Sons e sinais"
              desc="A tabela inteira: cada letra com cada vogal, para ouvir e comparar."
              onClick={() => setScreen({ kind: 'lab' })}
            />
            <ReferenceCard
              title="Escrita"
              desc="Traçar e escrever à mão a letra que mais precisa."
              onClick={() => setScreen({ kind: 'escrita' })}
            />
            <ReferenceCard
              title="Palavras à mão"
              desc="Escrever em cursiva palavras inteiras que você já aprendeu, e não só letras soltas."
              onClick={() => setScreen({ kind: 'palavras-a-mao' })}
            />
          </div>
        </>
      )}
    </div>
  );
}

/**
 * A rodada de um jogo de reconhecimento, montada de uma vez.
 *
 * Fora do componente e sem estado próprio: recebe o progresso, devolve a
 * rodada. Quem a chama guarda o resultado (ver `dados` no tipo `Screen`), e
 * essa é a parte que importa - chamá-la a cada render remonta o tabuleiro a
 * cada resposta, porque o progresso muda a cada resposta.
 *
 * Semeada como todo o resto do motor: sair e voltar devolve a MESMA rodada, e
 * "tentar de novo" não vira silenciosamente "tentar outra coisa".
 */
function montarNovo(
  jogo: Jogo, rodada: number, state: LearnerState, unlocked: Letter[], nivel: Nivel
) {
  const rand = rng(`${jogo}-${unlocked.length}-${rodada}`);
  /* Uma CAÇADA, e não uma caça: cinco rodadas, cada uma com outra letra. A
     tela montava uma rodada só e terminava nela, e era por isso que o jogo
     praticava sempre a mesma letra - o sorteio já era por peso. */
  if (jogo === 'caca') return { cacada: montarCacada(state, unlocked, rand, nivel) };
  if (jogo === 'cursiva') return { cursiva: montarCursiva(state, unlocked, rand, nivel) };
  /* Vários pares por partida, e não um. `paresParaTreinar` põe primeiro o que
     ELE trocou de verdade e depois o que o conteúdo prevê. */
  /* O giro sai da mesma semente da rodada: cada partida nova traz outros
     pares antigos, e voltar à mesma rodada devolve os mesmos. */
  const pares = paresParaTreinar(state, unlocked, 4, Math.floor(rand() * 97));
  if (!pares.length) return {};
  /* `doAluno` distingue o par que ELE trocou do par que o conteúdo prevê - e
     é o que autoriza, no fim, a frase "você confundia estas duas". */
  return { batalha: montarBatalha(pares, Object.keys(state.confusions).length > 0, rand) };
}

/* Seis desenhos de traço, no peso do resto do sistema. Traço e não emoji: o
   emoji muda de desenho em cada sistema operacional, e dois deles aqui
   ficariam coloridos no meio de uma paleta que tem três cores. */
function IconeJogo({ jogo }: { jogo: Jogo }) {
  const comum = {
    width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none',
    stroke: 'var(--teal)', strokeWidth: 1.5,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true
  };
  if (jogo === 'match') return (
    <svg {...comum}>
      <rect x="2.4" y="4" width="6.6" height="12" rx="2" />
      <rect x="11" y="4" width="6.6" height="12" rx="2" />
      <path d="M9 10h2" />
    </svg>
  );
  if (jogo === 'blast') return (
    <svg {...comum}><path d="M11.2 2.4 4.6 11h4.6l-.8 6.6L15.4 9h-4.6l.4-6.6Z" /></svg>
  );
  /* Caça: a lupa sobre a grade. */
  if (jogo === 'caca') return (
    <svg {...comum}>
      <circle cx="8.6" cy="8.6" r="5.2" />
      <path d="m12.6 12.6 4.2 4.2" />
    </svg>
  );
  /* Batalha: duas formas quase iguais, encostadas, e o traço que as separa. */
  if (jogo === 'batalha') return (
    <svg {...comum}>
      <path d="M7.6 3.6v9a2.6 2.6 0 0 1-2.6 2.6H3.4" />
      <path d="M16.6 3.6v9a2.6 2.6 0 0 1-2.6 2.6h-1.6" />
      <path d="M10.1 2.6v14.8" strokeDasharray="2 2.4" />
    </svg>
  );
  /* Impressa × cursiva: o quadrado do tipo e a curva da mão. */
  if (jogo === 'cursiva') return (
    <svg {...comum}>
      <rect x="2.6" y="5" width="6.4" height="10" rx="1.2" />
      <path d="M12 14.6c2.6-.6 4.4-2.6 4.4-5.2 0-2-1.2-3.4-2.6-3.4-1.2 0-2 1-2 2.4 0 3 3.4 4.2 5.2 4.2" />
    </svg>
  );
  return (
    <svg {...comum}>
      <rect x="4" y="2.8" width="12" height="14.4" rx="2.4" />
      <path d="M7.4 8.2h5.2M7.4 11.8h3.4" />
    </svg>
  );
}

function GymBest({ modeId }: { modeId: string }) {
  const p = useProgress();
  const rec = p.state.gym?.[modeId];
  if (!rec?.runs) return null;
  return (
    <span className="font-ui text-[12px] text-ink-muted tabular-nums">
      {rec.runs} {rec.runs === 1 ? 'sessão' : 'sessões'}
      {rec.bestSeconds != null && ` · melhor tempo ${rec.bestSeconds} s`}
      {rec.bestSeconds == null && rec.best != null && ` · melhor ${Math.round(rec.best * 100)}%`}
    </span>
  );
}

function ReferenceCard({
  title, desc, onClick
}: { title: string; desc: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-[var(--r-lg)] border border-dashed border-line bg-surface
                 p-4 grid gap-1 hover:bg-surface-2 transition-colors min-h-[88px]"
    >
      <span className="font-display text-[15.5px] font-bold text-ink">{title}</span>
      <span className="font-ui text-[13px] leading-relaxed text-ink-muted">{desc}</span>
    </button>
  );
}

/* O cronômetro do modo «contra o relógio».
 * ─────────────────────────────────────────────────────────────────────────
 * O modo existia com `timed: true` no catálogo desde o começo, e a bandeira
 * não fazia nada: o tempo era medido no fim, por subtração, e o aluno jogava
 * um exercício chamado «contra o relógio» sem relógio nenhum na tela. Um
 * cronômetro que só aparece depois não apressa ninguém.
 *
 * Três decisões, e as três são sobre confiabilidade:
 *
 * · UM temporizador só. Ele nasce com a tela da rodada e morre no `return`
 *   do efeito - é isso que garante que ele não continua correndo depois de o
 *   aluno sair, e a lista de dependências com `desde` é o que garante que
 *   uma partida nova não herda o relógio da anterior. A tela da rodada é
 *   recriada a cada partida (`key` com `startedAt`), então não há acúmulo.
 *
 * · A CONTA NÃO VEM DO TIQUE. Vem de `Date.now() - desde`, que é o relógio
 *   do sistema. Um contador incrementado a cada 250 ms atrasa - o navegador
 *   suspende temporizadores em aba de fundo -, e um cronômetro que atrasa
 *   mede a atenção do navegador em vez da do aluno. O tique só serve para
 *   redesenhar.
 *
 * · Ele SOBE, e não desce. Não há tempo limite: a pressa aqui é contra o
 *   próprio tempo da última vez, e um relógio em contagem regressiva
 *   transformaria um exercício de reconhecimento num exercício de chute.
 */
function Cronometro({ desde }: { desde: number }) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    setAgora(Date.now());
    const t = setInterval(() => setAgora(Date.now()), 250);
    return () => clearInterval(t);
  }, [desde]);

  const s = Math.max(0, Math.round((agora - desde) / 1000));
  return (
    <div className="flex items-center justify-center gap-2.5 rounded-[var(--r-md)]
                    border border-line bg-surface px-4 py-2.5">
      <span aria-hidden className="font-ui text-[15px] text-ink-muted">◷</span>
      <span className="font-ui text-[13px] uppercase tracking-[.08em] text-ink-muted">Tempo</span>
      {/* `aria-live="off"`: o número muda quatro vezes por segundo, e um
          leitor de tela que o anuncie toda vez cobre a pergunta. Quem precisa
          do tempo o encontra pelo rótulo; quem não precisa não é
          interrompido. O total aparece de novo, uma vez, no fim da rodada. */}
      <span aria-live="off"
            className="font-ui text-[18px] font-bold tabular-nums text-ink">
        {Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}
      </span>
    </div>
  );
}

function GymHeader({
  mode, label, onBack
}: { mode: GymMode; label: string; onBack: () => void }) {
  return (
    <header className="flex flex-wrap items-center gap-3">
      {/* Durante o jogo a tela não tinha título nenhum: quem navega por
          títulos com o leitor de tela não achava onde estava (auditoria de
          28/09, UX-013). Visualmente o nome já está no rótulo à direita. */}
      <h1 className="sr-only">{mode.titlePt}</h1>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px]
                   text-ink-muted hover:text-ink-body"
      >
        ← Academia
      </button>
      <span className="font-ui text-[13px] text-ink-muted ml-auto">{label}</span>
    </header>
  );
}

function Empty({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="focus-col grid gap-4">
      <Card tone="amber" className="p-6">
        <p className="text-[15px] leading-relaxed text-ink-body">{children}</p>
      </Card>
      <Button variant="secondary" onClick={onBack} className="justify-self-start">
        Voltar
      </Button>
    </div>
  );
}

export function AcademiaLink() {
  return (
    <Link
      href="/academia"
      className="flex items-center justify-between gap-4 rounded-[var(--r-md)] border
                 border-line bg-surface px-4 py-3 hover:bg-surface-2 transition-colors"
    >
      <span className="font-ui text-[14px] text-ink">
        Quer praticar mais? Academia de Leitura
      </span>
      <span aria-hidden className="text-ink-muted">→</span>
    </Link>
  );
}
