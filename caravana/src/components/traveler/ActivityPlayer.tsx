'use client';

// Uma atividade, pergunta por pergunta. Quem corrige e o servidor (answerAction):
// o navegador recebe as perguntas sem gabarito e so fica sabendo da resposta
// depois de responder ou de pedir para ver.

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { answerAction, revealAction } from '@/app/c/[slug]/actions';
import type { PublicQuestion } from '@/lib/domain/snapshot';
import type { AnswerResult } from '@/lib/domain/traveler';
import { Stamp } from '../art/Stamp';
import { IconCheck, IconX } from '../icons';
import { Button, cx, He, LinkButton, Progress } from '../ui';

type BadgeInfo = { slug: string; title: string; art: string; ink: string };

type Props = {
  slug: string;
  base: string;
  activity: { slug: string; title: string };
  questions: PublicQuestion[];
  badges: BadgeInfo[];
};

type Feedback = { correct: boolean; explanation: string | null; correctOptionId: string | null; pairResults: boolean[] | null; revealed?: boolean };

export function ActivityPlayer({ slug, base, activity, questions, badges }: Props) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [pairs, setPairs] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [firstTry, setFirstTry] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [done, setDone] = useState(false);
  const [earned, setEarned] = useState<BadgeInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const q = questions[index]!;

  function settle(res: AnswerResult) {
    if (!res.ok) {
      setError(res.error === 'not_found' ? 'Esta atividade foi atualizada pela agência. Recarregue a página.' : 'Resposta inválida.');
      return;
    }
    setError(null);
    if (res.correct && !attempted) setFirstTry((n) => n + 1);
    setAttempted(true);
    setFeedback({ correct: res.correct, explanation: res.explanation, correctOptionId: res.correctOptionId, pairResults: res.pairResults });
    if (res.newBadges.length) setEarned((prev) => [...prev, ...badges.filter((b) => res.newBadges.some((n) => n.slug === b.slug))]);
  }

  function choose(optionId: string) {
    if (pending || feedback?.correct || wrong.includes(optionId)) return;
    setPicked(optionId);
    start(async () => {
      const res = await answerAction(slug, activity.slug, q.key, { optionId });
      settle(res);
      if (res.ok && !res.correct) setWrong((w) => [...w, optionId]);
    });
  }

  function checkPairs() {
    if (pending || !q.left || pairs.length !== q.left.length || pairs.some((p) => !p)) return;
    start(async () => settle(await answerAction(slug, activity.slug, q.key, { pairs })));
  }

  function reveal() {
    start(async () => {
      const r = await revealAction(slug, activity.slug, q.key);
      if (!r) return;
      setAttempted(true);
      if (q.kind === 'match_pairs' && r.pairs) setPairs(r.pairs);
      setFeedback({ correct: false, explanation: r.explanation, correctOptionId: r.correctOptionId, pairResults: null, revealed: true });
    });
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setPicked(null);
    setWrong([]);
    setPairs([]);
    setFeedback(null);
    setAttempted(false);
  }

  if (done) {
    return (
      <div className="anim-rise text-center">
        <p className="text-micro font-semibold uppercase tracking-[0.14em] text-stone-600">Atividade concluída</p>
        <h2 className="mt-2 font-display text-display-m font-medium">{firstTry === questions.length ? 'Tudo certo de primeira!' : 'Pronto, você chegou ao fim.'}</h2>
        <p className="mt-2 text-ink-soft">
          Você acertou {firstTry} de {questions.length} na primeira tentativa.
        </p>
        {earned.length > 0 && (
          <div className="mt-8">
            <p className="text-small font-semibold text-ink">{earned.length === 1 ? 'Selo novo no seu passaporte' : 'Selos novos no seu passaporte'}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {earned.map((b) => (
                <Stamp key={b.slug} slug={`ganho-${b.slug}`} title={b.title} art={b.art} ink={b.ink} earned animate size={150} />
              ))}
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <LinkButton href={`${base}/passaporte`}>Ver meu passaporte</LinkButton>
          <LinkButton href={`${base}/atividades`} variant="secondary">
            Outras atividades
          </LinkButton>
        </div>
      </div>
    );
  }

  const answered = feedback?.correct || feedback?.revealed;
  const mustPickCorrect = feedback?.revealed && q.kind !== 'match_pairs';

  return (
    <div>
      <div className="flex items-center justify-between text-micro font-semibold uppercase tracking-[0.12em] text-stone-600">
        <span>
          Pergunta {index + 1} de {questions.length}
        </span>
      </div>
      <Progress value={index + (feedback?.correct ? 1 : 0)} max={questions.length} label="Progresso da atividade" className="mt-2" />

      <div key={q.key} className="anim-rise mt-7">
        <h2 className="font-display text-[1.45rem] font-medium leading-snug text-ink">{q.prompt}</h2>
        {q.promptHe && (
          <div className="mt-5 rounded-md bg-sand/70 py-6 text-center ring-1 ring-sand-deep">
            <He className="text-[2.6rem] leading-none text-ink">{q.promptHe}</He>
          </div>
        )}

        {q.kind !== 'match_pairs' ? (
          <ul className="mt-6 space-y-2.5">
            {q.options.map((o) => {
              const isWrong = wrong.includes(o.id);
              const isRight = (feedback?.correct && picked === o.id) || (feedback?.revealed && feedback.correctOptionId === o.id);
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => choose(o.id)}
                    disabled={pending || isWrong || Boolean(feedback?.correct)}
                    aria-pressed={picked === o.id}
                    className={cx(
                      'flex min-h-[3.4rem] w-full items-center justify-between gap-3 rounded-md px-4 py-3 text-left text-[1.02rem] font-medium ring-1 transition',
                      isRight && 'bg-success-soft text-success ring-2 ring-success',
                      isWrong && 'bg-danger-soft/60 text-danger line-through decoration-1 ring-danger/40',
                      !isRight && !isWrong && 'bg-paper-raised text-ink ring-stone-300 hover:ring-stone-500 active:scale-[0.99]',
                    )}
                  >
                    {o.he ? <He className="text-[1.5rem]">{o.he}</He> : <span>{o.text}</span>}
                    {isRight && <IconCheck />}
                    {isWrong && <IconX size={20} />}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-6 space-y-3">
            {q.left!.map((l, i) => {
              const ok = feedback?.pairResults?.[i];
              return (
                <div key={i} className={cx('flex items-center gap-3 rounded-md bg-paper-raised p-3 ring-1', ok === true ? 'ring-2 ring-success' : ok === false ? 'ring-danger/50' : 'ring-stone-300')}>
                  <He className="w-20 shrink-0 text-center text-[1.6rem] text-ink">{l.he ?? l.text}</He>
                  <label className="sr-only" htmlFor={`par-${i}`}>
                    Significado de {l.text}
                  </label>
                  <select
                    id={`par-${i}`}
                    value={pairs[i] ?? ''}
                    disabled={Boolean(feedback?.correct) || Boolean(feedback?.revealed)}
                    onChange={(ev) => {
                      const nextPairs = [...pairs];
                      nextPairs[i] = ev.target.value;
                      setPairs(nextPairs);
                      setFeedback(null);
                    }}
                    className="h-11 min-w-0 flex-1 rounded-sm bg-paper px-3 text-[1rem] ring-1 ring-inset ring-stone-300 focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">Escolha…</option>
                    {q.right!.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {ok === true && <IconCheck className="text-success" />}
                  {ok === false && <IconX size={20} className="text-danger" />}
                </div>
              );
            })}
            {!feedback?.correct && !feedback?.revealed && (
              <Button onClick={checkPairs} disabled={pending || pairs.filter(Boolean).length !== q.left!.length} block>
                Conferir
              </Button>
            )}
            {feedback?.revealed && (
              <Button onClick={() => start(async () => settle(await answerAction(slug, activity.slug, q.key, { pairs })))} block disabled={pending}>
                Confirmar os pares
              </Button>
            )}
          </div>
        )}

        <div aria-live="polite" className="mt-5 min-h-[1rem]">
          {error && <p className="text-small font-medium text-danger">{error}</p>}
          {feedback && !feedback.correct && !feedback.revealed && (
            <div className="rounded-md bg-danger-soft/50 p-4">
              <p className="font-semibold text-danger">{q.kind === 'match_pairs' ? 'Alguns pares não estão certos.' : 'Não é essa.'}</p>
              <p className="mt-0.5 text-small text-ink-soft">Tente de novo ou veja a resposta.</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setFeedback(null)}>
                  Tentar de novo
                </Button>
                <Button size="sm" variant="ghost" onClick={reveal} disabled={pending}>
                  Ver a resposta
                </Button>
              </div>
            </div>
          )}
          {feedback?.revealed && (
            <div className="rounded-md bg-sand/80 p-4">
              <p className="font-semibold text-ink">A resposta</p>
              <p className="mt-1 text-small text-ink-soft">{feedback.explanation}</p>
              {mustPickCorrect && <p className="mt-2 text-small font-semibold text-ink">Toque na opção destacada para continuar.</p>}
            </div>
          )}
          {feedback?.correct && (
            <div className="rounded-md bg-success-soft p-4">
              <p className="font-semibold text-success">Isso mesmo.</p>
              {feedback.explanation && <p className="mt-1 text-small text-ink-soft">{feedback.explanation}</p>}
            </div>
          )}
        </div>

        {feedback?.correct && (
          <Button onClick={next} block size="lg" className="mt-5">
            {index + 1 >= questions.length ? 'Concluir' : 'Próxima pergunta'}
          </Button>
        )}
        {!answered && index === 0 && !feedback && (
          <p className="mt-6 text-center text-micro text-stone-600">
            <Link href={`${base}/atividades`} className="underline-offset-2 hover:underline">
              Voltar às atividades
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
