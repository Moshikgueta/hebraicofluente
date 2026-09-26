'use client';

/* A lição de um som: Vet, Chaf, Fe, Tch, Dj ou J.
 * ─────────────────────────────────────────────────────────────────────────
 * Cinco etapas, como a de uma letra, e com a mesma fixação - é o que deixa a
 * trava de progressão tratar as duas do mesmo jeito (Kaf abre depois de Vet).
 * O que muda é a terceira etapa: uma letra tem traçado para escrever; um som
 * tem um PAR, e o que se treina é a decisão entre os dois.
 *
 *   1 conhecer   - o som, a boca, a regra, as sílabas
 *   2 palavras   - as palavras que têm o som
 *   3 contraste  - lado a lado com o par (com ponto / sem ponto, com gerech /
 *                  sem gerech), para ler em voz alta
 *   4 praticar   - exercícios de contraste, sem nota
 *   5 fixação    - o mesmo tipo de pergunta, com nota; 75% domina
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Milestone } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { OndeNasceOSom } from '@/components/learn/OndeNasceOSom';
import { CompararPronuncia } from '@/components/learn/CompararPronuncia';
import { GravarLeitura } from '@/components/learn/GravarLeitura';
import { AudioButton, hasAudio, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { BrazilianTip, Prose, WordReveal } from '@/components/learn/Blocks';
import { Compreensao } from '@/components/learn/Compreensao';
import { useProgress } from '@/lib/state/store';
import { LIBERA_MARK, MASTERY_MARK, porQueTrancada } from '@/lib/state/rules';
import { allLetters, course } from '@/lib/content';
import type { SomLicao } from '@/lib/engine/extras';
import { idDoSom, nomeDaLicao, ordemDeEnsino, rodadaDoSom, rotaDaLicao } from '@/lib/sons';
import { track } from '@/lib/analytics';

const STAGES = [
  { n: 1, label: 'Conhecer' },
  { n: 2, label: 'Palavras' },
  { n: 3, label: 'Contraste' },
  { n: 4, label: 'Praticar' },
  { n: 5, label: 'Fixação' }
] as const;

export function SomLessonClient({ som: S }: { som: SomLicao }) {
  const p = useProgress();
  const router = useRouter();
  /* Os exercícios de ouvir só entram quando a gravação existe, e o registro
     de gravações chega depois do primeiro render: a versão dele refaz a lista. */
  const versaoAudio = useRegistroDeAudio();
  const id = idDoSom(S.id);
  const [stage, setStage] = useState(1);
  const [trancada, setTrancada] = useState<ReturnType<typeof porQueTrancada>>(null);
  const [resultado, setResultado] = useState<PlayerResult | null>(null);
  const [tentativa, setTentativa] = useState(0);

  const ordem = useMemo(() => ordemDeEnsino(allLetters(), course.modules), []);

  /* A mesma porta da lição de letra, e pelo mesmo motivo - ver LessonClient. */
  useEffect(() => {
    if (!p.ready) return;
    setTrancada(porQueTrancada(p.state, ordem, id));
  }, [p.ready, p.state, ordem, id]);

  const pratica = useMemo(
    () => rodadaDoSom(S, { seed: `pratica-${S.id}`, count: 8, temAudio: hasAudio }),
    [S, versaoAudio]
  );
  const teste = useMemo(
    () => rodadaDoSom(S, { seed: `fixacao-${S.id}-${tentativa}`, count: 8, temAudio: hasAudio }),
    [S, tentativa, versaoAudio]
  );

  const feito = useCallback((n: number) => {
    p.finishStage(id, n);
    if (n < 5) setStage(n + 1);
  }, [p, id]);

  /* Para onde se vai depois: a próxima lição do caminho, a não ser que o
     módulo tenha acabado aqui - o 5 fecha no checkpoint, o 7 no fecho dos
     três sons juntos. */
  const destino = useMemo(() => {
    const mod = course.modules.find(m => m.n === S.modulo);
    const doModulo = new Set(mod?.lessons.flatMap(l => l.som ? [idDoSom(l.som)] : l.letters ?? []) ?? []);
    const seguinte = ordem[ordem.indexOf(id) + 1];
    if (seguinte && doModulo.has(seguinte)) {
      const nome = nomeDaLicao(seguinte, allLetters(), course.modules);
      return { href: rotaDaLicao(seguinte), dica: seguinte.startsWith('som-') ? `Em seguida: o som ${nome}` : `Em seguida: letra ${nome}` };
    }
    if (mod?.checkpoint) return { href: `/checkpoint/${mod.n}`, dica: `Em seguida: Checkpoint ${mod.n}` };
    if (mod && !mod.letterIds.length) return { href: '/extra/sons-modernos', dica: 'Em seguida: os três sons juntos, e o fecho do alfabeto' };
    return { href: '/mapa', dica: 'De volta ao mapa do curso' };
  }, [S.modulo, ordem, id]);

  if (trancada) {
    const anterior = nomeDaLicao(trancada.anterior, allLetters(), course.modules);
    return (
      <div className="grid gap-5 focus-col">
        <Card className="p-6 sm:p-8 grid gap-4 justify-items-center text-center">
          <h1 className="font-display text-[23px] sm:text-[27px] font-bold leading-tight text-ink">
            O som {S.namePt} ainda não abriu
          </h1>
          <p className="text-[16px] leading-relaxed text-ink-body max-w-[46ch] mx-auto">
            {trancada.falta === 'licao'
              ? <>Ele vem depois de <strong className="font-semibold text-ink">{anterior}</strong>, e essa lição ainda não foi concluída.</>
              : <>Falta a fixação de <strong className="font-semibold text-ink">{anterior}</strong>: sua melhor nota lá
                foi {Math.round((trancada.nota ?? 0) * 100)}%, e esta lição abre a partir de {Math.round(LIBERA_MARK * 100)}%.</>}
          </p>
          <div className="grid gap-2 w-full max-w-[320px] pt-1">
            <LinkButton href={rotaDaLicao(trancada.anterior)} size="lg" full>Ir para {anterior}</LinkButton>
            <LinkButton href="/mapa" variant="ghost" full>Ver o mapa</LinkButton>
          </div>
        </Card>
      </div>
    );
  }

  const stagesDone = p.state.lessons[id]?.stagesDone ?? [];

  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/mapa"
                className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
            ← Mapa
          </Link>
          <Badge tone="accent">Módulo {S.modulo} · lição {S.licao} · som {S.namePt}</Badge>
        </div>
        <ol className="flex items-center gap-1.5" aria-label="Etapas da lição">
          {STAGES.map(s => {
            const isDone = stagesDone.includes(s.n);
            const isNow = stage === s.n;
            return (
              <li key={s.n} className="flex-1">
                <button type="button" onClick={() => setStage(s.n)}
                        aria-current={isNow ? 'step' : undefined}
                        aria-label={`Etapa ${s.n} de 5 - ${s.label}`}
                        className="w-full min-h-[44px] grid content-center gap-1.5">
                  <span className={`block h-1.5 rounded-full transition-colors
                    ${isNow ? 'bg-[var(--accent)]' : isDone ? 'bg-[var(--green)]' : 'bg-surface-2'}`} />
                  <span className={`font-ui text-[11px] sm:text-[12px] ${isNow ? 'text-ink font-semibold' : 'text-ink-muted'}`}>
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </header>

      {stage === 1 && <Conhecer S={S} onDone={() => feito(1)} />}
      {stage === 2 && <Palavras S={S} onDone={() => feito(2)} />}
      {stage === 3 && <Contraste S={S} onDone={() => feito(3)} />}
      {stage === 4 && <Praticar exercicios={pratica} onDone={() => feito(4)} />}
      {stage === 5 && (
        resultado ? (
          <Resultado
            S={S} r={resultado}
            onRetry={() => { setResultado(null); setTentativa(n => n + 1); }}
            onNext={() => router.push(destino.href)}
            dica={destino.dica}
          />
        ) : (
          <ExercisePlayer
            key={`fix-${S.id}-${tentativa}`}
            exercises={teste}
            title={`Fixação - som ${S.namePt}`}
            onDone={r => {
              track('quiz_completed', { letterId: id, score: r.score });
              setResultado(r);
              p.finishQuiz(id, r.score);
              p.finishStage(id, 5);
            }}
          />
        )
      )}
    </div>
  );
}

/* ── 1 · conhecer ──────────────────────────────────────────────────────── */
function Conhecer({ S, onDone }: { S: SomLicao; onDone: () => void }) {
  return (
    <div className="grid gap-5">
      <Card className="p-6 sm:p-8 grid gap-5">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <span className="grid justify-items-center gap-1">
            <He size="xl" dim>{S.parHe}</He>
            <span className="font-ui text-[13px] text-ink-muted">{S.parNomePt} · {S.parSom}</span>
          </span>
          <span aria-hidden className="text-ink-muted text-[22px]">→</span>
          <span className="grid justify-items-center gap-1">
            <He size="display">{S.he}</He>
            <span className="font-ui text-[15px] font-semibold text-[var(--accent)]">{S.namePt} · {S.som}</span>
          </span>
          {S.finalHe && (
            <span className="grid justify-items-center gap-1">
              <He size="xl">{S.finalHe}</He>
              <span className="font-ui text-[13px] text-ink-muted">no fim da palavra</span>
            </span>
          )}
        </div>
        {S.tipo === 'gerech' && hasAudio(S.audioId) && (
          <div className="flex justify-center"><AudioButton audioId={S.audioId} label={`Ouvir ${S.namePt}`} /></div>
        )}
        <p className="text-[16px] leading-relaxed text-ink-body"><Prose text={S.introPt} /></p>
      </Card>

      <Card className="p-6 grid gap-3">
        <h2 className="text-[19px] font-semibold">Como pronunciar</h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">Soa como {S.comoPt.includes('{{') ? <Prose text={S.comoPt} /> : S.comoPt}.</p>
        <OndeNasceOSom articulacao={S.articulacao} letra={S.namePt} />
      </Card>

      <Card tone="wash" className="p-6 grid gap-2">
        <h2 className="text-[18px] font-semibold">Quando a letra tem este som</h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body"><Prose text={S.regraPt} /></p>
        <p className="text-[15px] leading-relaxed text-ink-body border-t border-[color:var(--line-soft)] pt-3">
          <Prose text={S.irmaoPt} />
        </p>
      </Card>

      <BrazilianTip mistake={S.erro} />

      {S.silabas.length > 0 && (
        <Card className="p-6 grid gap-4">
          <div className="grid gap-1">
            <h2 className="text-[19px] font-semibold">O som com cada vogal</h2>
            <p className="font-ui text-[13.5px] text-ink-muted">Sem o ponto, em todas. Leia da direita para a esquerda.</p>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-5 gap-3 list-none p-0 m-0">
            {S.silabas.map(s => (
              <li key={s.he} className="rounded-[var(--r-md)] bg-surface-2 p-3 grid justify-items-center gap-1">
                <He size="xl">{s.he}</He>
                <span className="font-ui text-[14px] font-semibold text-ink">{s.translit}</span>
                {hasAudio(s.audioId) && <AudioButton audioId={s.audioId} label="" ariaLabel={`Ouvir ${s.translit}`} size="sm" />}
              </li>
            ))}
          </ul>
          <GravarLeitura
            titulo="Leia as sílabas em voz alta"
            instrucao={`Leia as ${S.silabas.length} sílabas acima, da direita para a esquerda, grave e se ouça.`}
            audioId={S.audioId}
            maxSegundos={30}
          />
          <CompararPronuncia itens={S.silabas} />
        </Card>
      )}

      <Compreensao
        id={`checagem-som-${S.id}`}
        titulo="Entendeu? Perguntas rápidas"
        intro="Não vale nota e não tranca nada. Se errar, a explicação aparece na hora."
        perguntas={S.checagem}
        fecho={{
          bom: 'Boa. Agora as palavras que têm este som.',
          parcial: 'Vale reler o quadro "Quando a letra tem este som" - é a decisão que você vai tomar em toda palavra.'
        }}
      />

      <Button size="lg" onClick={onDone} full>Continuar para as palavras</Button>
    </div>
  );
}

/* ── 2 · palavras ──────────────────────────────────────────────────────── */
function Palavras({ S, onDone }: { S: SomLicao; onDone: () => void }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h2 className="text-[21px] font-bold">Palavras com o som {S.namePt}</h2>
        <p className="font-ui text-[14px] text-ink-muted">
          {S.tipo === 'daguesh'
            ? 'Tente ler antes de revelar. A letra destacada está sem o ponto.'
            : 'Palavras que vieram de fora: você já sabe como soam. Leia antes de revelar.'}
        </p>
      </div>
      <div className="grid gap-3">
        {S.palavras.map(w => (
          <WordReveal key={w.he} word={{ ...w, use: null }} mark={S.finalHe && w.he.includes(S.finalHe) ? S.finalHe : S.he} />
        ))}
      </div>
      <CompararPronuncia itens={S.palavras} titulo="Compare a sua leitura das palavras com a do curso" />
      <Button size="lg" onClick={onDone} full>Continuar para o contraste</Button>
    </div>
  );
}

/* ── 3 · contraste ─────────────────────────────────────────────────────── */
function Contraste({ S, onDone }: { S: SomLicao; onDone: () => void }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h2 className="text-[21px] font-bold">{S.parNomePt} ou {S.namePt}?</h2>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
          {S.tipo === 'daguesh'
            ? <>Lado a lado, com e sem o ponto. Leia cada linha em voz alta, primeiro a coluna da direita e depois a
              da esquerda, e sinta a boca mudar: <strong>{S.parSom}</strong> e <strong>{S.som}</strong>.</>
            : <>Lado a lado, com e sem o traço. Sem ele, <He size="inline">{S.parHe}</He> é <strong>{S.parSom}</strong>;
              com ele, <He size="inline">{S.he}</He> é <strong>{S.som}</strong>.</>}
        </p>
      </div>

      {S.parSilabas.length > 0 && (
        <Card className="p-5 grid gap-2">
          <div className="grid grid-cols-2 gap-3 font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted text-center">
            <span>{S.namePt} · sem ponto</span>
            <span>{S.parNomePt} · com ponto</span>
          </div>
          {S.silabas.map((s, i) => {
            const par = S.parSilabas[i];
            return (
              <div key={s.he} className="grid grid-cols-2 gap-3" dir="ltr">
                <Par he={s.he} translit={s.translit} audioId={s.audioId} destaque />
                {par && <Par he={par.he} translit={par.translit} audioId={par.audioId} />}
              </div>
            );
          })}
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <Card className="p-5 grid gap-2 content-start">
          <p className="font-ui text-[12px] uppercase tracking-[.07em] text-[var(--accent)]">
            Com o som {S.som} · <He size="inline">{S.he}</He>
          </p>
          {S.palavras.map(w => <Linha key={w.he} w={w} mark={S.finalHe && w.he.includes(S.finalHe) ? S.finalHe : S.he} />)}
        </Card>
        <Card className="p-5 grid gap-2 content-start">
          <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
            Com o som {S.parSom} · <He size="inline">{S.parHe}</He>
          </p>
          {S.parPalavras.map(w => <Linha key={w.he} w={w} mark={S.parHe} />)}
        </Card>
      </div>

      <GravarLeitura
        titulo="Leia as duas colunas em voz alta"
        instrucao={`Leia as palavras com ${S.som} e depois as com ${S.parSom}, grave e confira se a diferença aparece.`}
        maxSegundos={60}
      />

      <Button size="lg" onClick={onDone} full>Continuar para a prática</Button>
    </div>
  );
}

function Par({ he, translit, audioId, destaque = false }: {
  he: string; translit: string; audioId: string; destaque?: boolean;
}) {
  return (
    <span className={`flex items-center justify-center gap-3 rounded-[var(--r-md)] px-3 py-2
      ${destaque ? 'bg-[var(--accent-wash)]' : 'bg-surface-2'}`}>
      <He size="lg">{he}</He>
      <span className="font-ui text-[14px] font-semibold text-ink">{translit}</span>
      {hasAudio(audioId) && <AudioButton audioId={audioId} label="" ariaLabel={`Ouvir ${translit}`} size="sm" />}
    </span>
  );
}

function Linha({ w, mark }: { w: { he: string; translit: string; pt: string; audioId: string }; mark: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--r-md)] bg-surface-2 px-3 py-2">
      <He size="word" mark={mark}>{w.he}</He>
      <span className="grid min-w-0">
        <span className="font-ui text-[14px] font-semibold text-ink">{w.translit}</span>
        <span className="font-ui text-[12.5px] text-ink-muted">{w.pt}</span>
      </span>
      {hasAudio(w.audioId) && (
        <span className="ml-auto"><AudioButton audioId={w.audioId} label="" ariaLabel={`Ouvir ${w.translit}`} size="sm" /></span>
      )}
    </div>
  );
}

/* ── 4 · praticar ──────────────────────────────────────────────────────── */
function Praticar({ exercicios, onDone }: { exercicios: ReturnType<typeof rodadaDoSom>; onDone: () => void }) {
  const [fim, setFim] = useState(false);
  if (fim) {
    return (
      <div className="grid gap-5">
        <Milestone kicker="Prática concluída" title="Agora a fixação"
                   body="A próxima etapa vale nota, e você pode repetir quantas vezes quiser." />
        <Button size="lg" onClick={onDone} full>Ir para a fixação</Button>
      </div>
    );
  }
  return <ExercisePlayer exercises={exercicios} title="Prática - sem nota" onDone={() => setFim(true)} />;
}

/* ── 5 · o resultado ───────────────────────────────────────────────────── */
function Resultado({ S, r, onRetry, onNext, dica }: {
  S: SomLicao; r: PlayerResult; onRetry: () => void; onNext: () => void; dica: string;
}) {
  const pct = Math.round(r.score * 100);
  const bom = r.score >= MASTERY_MARK;
  return (
    <Milestone
      tone={bom ? 'bom' : 'parcial'}
      kicker={`${r.correct} de ${r.total} · ${pct}%`}
      title={bom ? `O som ${S.namePt} está firme.` : `Vamos firmar o ${S.namePt}.`}
      body={bom
        ? `Você decide entre ${S.parSom} e ${S.som} olhando a letra. Pode seguir.`
        : `Refaça quando quiser: as perguntas mudam, e o que conta é decidir entre ${S.parSom} e ${S.som} sem hesitar. A próxima lição abre a partir de ${Math.round(LIBERA_MARK * 100)}%.`}
    >
      <Button variant={bom ? 'secondary' : 'primary'} onClick={onRetry}>Refazer a fixação</Button>
      <Button variant={bom ? 'primary' : 'secondary'} onClick={onNext}>Concluir e continuar</Button>
      <p className="basis-full font-ui text-[13px] text-ink-muted m-0">{dica}</p>
    </Milestone>
  );
}
