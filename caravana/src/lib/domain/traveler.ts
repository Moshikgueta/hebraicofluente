// O lado do viajante: le o retrato publicado e grava o proprio progresso.
// Tudo roda no papel mcd_participant, preso a agencia, a caravana e ao convite.

import { and, eq, sql } from 'drizzle-orm';
import { activityCompletions, contentViews, participantBadges, questionAnswers } from '../db/schema';
import { withScope, type Tx } from '../db/tenant';
import type { TravelerContext } from '../auth/sessions';
import { currentSnapshot } from './publication';
import type { Snapshot, SnapshotActivity, SnapshotQuestion } from './snapshot';

export type Progress = {
  completed: Record<string, { score: number; total: number; completedAt: string }>;
  badges: Record<string, string>; // slug -> data
  answers: Record<string, Record<string, { correct: boolean; attempts: number }>>;
  viewed: string[];
};

function scope(ctx: TravelerContext) {
  return { kind: 'participant' as const, agencyId: ctx.agencyId, caravanId: ctx.caravanId, accessId: ctx.accessId };
}

async function readProgress(tx: Tx, ctx: TravelerContext): Promise<Progress> {
  // Em sequencia: uma transacao e uma conexao so.
  const done = await tx.select().from(activityCompletions).where(eq(activityCompletions.accessId, ctx.accessId));
  const badges = await tx.select().from(participantBadges).where(eq(participantBadges.accessId, ctx.accessId));
  const answers = await tx.select().from(questionAnswers).where(eq(questionAnswers.accessId, ctx.accessId));
  const views = await tx.select().from(contentViews).where(eq(contentViews.accessId, ctx.accessId));
  const progress: Progress = { completed: {}, badges: {}, answers: {}, viewed: views.map((v) => v.destinationSlug) };
  for (const d of done) progress.completed[d.activitySlug] = { score: d.score, total: d.total, completedAt: d.completedAt.toISOString() };
  for (const b of badges) progress.badges[b.badgeSlug] = b.awardedAt.toISOString();
  for (const a of answers) (progress.answers[a.activitySlug] ??= {})[a.questionKey] = { correct: a.correct, attempts: a.attempts };
  return progress;
}

export async function loadTrip(ctx: TravelerContext): Promise<{ snapshot: Snapshot; progress: Progress } | null> {
  return withScope(scope(ctx), async (tx) => {
    const snapshot = await currentSnapshot(tx, ctx.caravanId);
    if (!snapshot) return null;
    return { snapshot, progress: await readProgress(tx, ctx) };
  });
}

export type Answer = { optionId: string } | { pairs: string[] };

export type AnswerResult =
  | { ok: false; error: 'not_found' | 'invalid' }
  | {
      ok: true;
      correct: boolean;
      explanation: string | null;
      correctOptionId: string | null;
      pairResults: boolean[] | null;
      activityCompleted: boolean;
      newBadges: { slug: string; title: string }[];
    };

export function grade(q: SnapshotQuestion, answer: Answer): { correct: boolean; pairResults: boolean[] | null } | null {
  if (q.kind === 'match_pairs') {
    if (!('pairs' in answer) || !q.pairs || answer.pairs.length !== q.pairs.length) return null;
    const pairResults = q.pairs.map((p, i) => answer.pairs[i] === p.right);
    return { correct: pairResults.every(Boolean), pairResults };
  }
  if (!('optionId' in answer) || !q.options.some((o) => o.id === answer.optionId)) return null;
  return { correct: answer.optionId === q.correctOptionId, pairResults: null };
}

export async function answerQuestion(ctx: TravelerContext, activitySlug: string, questionKey: string, answer: Answer): Promise<AnswerResult> {
  return withScope(scope(ctx), async (tx) => {
    const snapshot = await currentSnapshot(tx, ctx.caravanId);
    const activity = snapshot?.activities.find((a) => a.slug === activitySlug);
    const question = activity?.questions.find((q) => q.key === questionKey);
    if (!snapshot || !activity || !question) return { ok: false, error: 'not_found' };
    const g = grade(question, answer);
    if (!g) return { ok: false, error: 'invalid' };

    const base = { accessId: ctx.accessId, agencyId: ctx.agencyId, caravanId: ctx.caravanId, activitySlug, questionKey };
    // Uma vez certa, a pergunta nao volta a errada; tentativas so contam ate acertar.
    await tx
      .insert(questionAnswers)
      .values({ ...base, correct: g.correct, attempts: 1 })
      .onConflictDoUpdate({
        target: [questionAnswers.accessId, questionAnswers.activitySlug, questionAnswers.questionKey],
        set: {
          correct: sql`${questionAnswers.correct} OR ${g.correct}`,
          attempts: sql`CASE WHEN ${questionAnswers.correct} THEN ${questionAnswers.attempts} ELSE ${questionAnswers.attempts} + 1 END`,
          answeredAt: new Date(),
        },
      });

    const { activityCompleted, newBadges } = await settleCompletion(tx, ctx, snapshot, activity);
    return {
      ok: true,
      correct: g.correct,
      explanation: g.correct ? question.explanation : null,
      correctOptionId: g.correct ? question.correctOptionId : null,
      pairResults: g.pairResults,
      activityCompleted,
      newBadges,
    };
  });
}

// "Ver a resposta": mostra o gabarito sem marcar a pergunta como certa.
export async function revealAnswer(ctx: TravelerContext, activitySlug: string, questionKey: string) {
  return withScope(scope(ctx), async (tx) => {
    const snapshot = await currentSnapshot(tx, ctx.caravanId);
    const q = snapshot?.activities.find((a) => a.slug === activitySlug)?.questions.find((x) => x.key === questionKey);
    if (!q) return null;
    return { correctOptionId: q.correctOptionId, pairs: q.pairs ? q.pairs.map((p) => p.right) : null, explanation: q.explanation };
  });
}

async function settleCompletion(tx: Tx, ctx: TravelerContext, snapshot: Snapshot, activity: SnapshotActivity) {
  const rows = await tx
    .select()
    .from(questionAnswers)
    .where(and(eq(questionAnswers.accessId, ctx.accessId), eq(questionAnswers.activitySlug, activity.slug)));
  const allCorrect = activity.questions.every((q) => rows.some((r) => r.questionKey === q.key && r.correct));
  if (!allCorrect) return { activityCompleted: false, newBadges: [] };
  const score = activity.questions.filter((q) => rows.some((r) => r.questionKey === q.key && r.correct && r.attempts === 1)).length;
  await tx
    .insert(activityCompletions)
    .values({ accessId: ctx.accessId, agencyId: ctx.agencyId, caravanId: ctx.caravanId, activitySlug: activity.slug, score, total: activity.questions.length })
    .onConflictDoNothing();

  const done = new Set((await tx.select({ s: activityCompletions.activitySlug }).from(activityCompletions).where(eq(activityCompletions.accessId, ctx.accessId))).map((r) => r.s));
  const newBadges: { slug: string; title: string }[] = [];
  for (const b of snapshot.badges) {
    if (!b.activities.every((s) => done.has(s))) continue;
    const inserted = await tx
      .insert(participantBadges)
      .values({ accessId: ctx.accessId, agencyId: ctx.agencyId, caravanId: ctx.caravanId, badgeSlug: b.slug })
      .onConflictDoNothing()
      .returning({ s: participantBadges.badgeSlug });
    if (inserted.length) newBadges.push({ slug: b.slug, title: b.title });
  }
  return { activityCompleted: true, newBadges };
}

export async function recordView(ctx: TravelerContext, destinationSlug: string): Promise<void> {
  await withScope(scope(ctx), async (tx) => {
    const snapshot = await currentSnapshot(tx, ctx.caravanId);
    if (!snapshot?.destinations.some((d) => d.slug === destinationSlug && d.content)) return;
    await tx
      .insert(contentViews)
      .values({ accessId: ctx.accessId, agencyId: ctx.agencyId, caravanId: ctx.caravanId, destinationSlug })
      .onConflictDoNothing();
  });
}
