// Convite, aparelho, retrato publicado e progresso do viajante.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { DEMO_CARAVAN } from '@content/demo';
import { AuthError, claimInvite, createDemoTraveler, resolveTraveler, type TravelerContext } from '@/lib/auth/sessions';
import { activityCompletions, caravanPublications, culturalContents, questionAnswers } from '@/lib/db/schema';
import { dbErrorCode } from '@/lib/db/tenant';
import { addDay, addInfoItem, createCaravan, createInvites, listInvites, resetInviteDevices, revokeInvite, setContentSelection } from '@/lib/domain/agency';
import { buildSnapshot, libraryUpdatesSince, publishCaravan, currentSnapshot } from '@/lib/domain/publication';
import { diffSnapshots } from '@/lib/domain/diff';
import { publicQuestion } from '@/lib/domain/snapshot';
import { answerQuestion, loadTrip, recordView } from '@/lib/domain/traveler';
import { agencyScope, caravanBySlug, closeDb, makeAgency, seedAll, withScope, withSystem } from './helpers';

let A: Awaited<ReturnType<typeof makeAgency>>;
let carId: string;
let slug: string;
let codes: { id: string; code: string }[];

beforeAll(async () => {
  await seedAll();
  A = await makeAgency('delta', { seats: 5 });
  carId = await withScope(agencyScope(A), async (tx) => {
    const id = await createCaravan(tx, A, { name: 'Caravana Delta', description: null, startDate: '2027-04-01', endDate: '2027-04-03', organizerName: null });
    await addDay(tx, A, id, { title: 'Jerusalém', summary: null, practicalNotes: null });
    return id;
  });
  slug = (await withSystem(async (tx) => (await tx.query.caravans.findFirst({ where: (c, { eq }) => eq(c.id, carId) }))!.slug));
  codes = await withScope(agencyScope(A), (tx) => createInvites(tx, A, carId, ['Ana', 'Bia', null], 2));
});
afterAll(closeDb);

describe('entrar pelo convite', () => {
  it('caravana nao publicada: o convite valido ainda nao abre', async () => {
    await expect(claimInvite(slug, codes[0]!.code, 'k1')).rejects.toMatchObject({ code: 'not_published' });
  });

  it('abre depois de publicar, e o codigo aceita minusculas e hifens', async () => {
    await withScope(agencyScope(A), (tx) => publishCaravan(tx, carId, A.userId));
    const c = codes[0]!.code.toLowerCase();
    const { token } = await claimInvite(slug, `${c.slice(0, 4)}-${c.slice(4, 8)} ${c.slice(8)}`, 'k1');
    const ctx = await resolveTraveler(slug, token);
    expect(ctx?.label).toBe('Ana');
  });

  it('codigo de outra caravana, inventado ou de outro slug: a mesma resposta', async () => {
    const demo = await caravanBySlug(DEMO_CARAVAN.slug);
    await expect(claimInvite(demo.slug, codes[1]!.code, 'k2')).rejects.toMatchObject({ code: 'invalid' });
    await expect(claimInvite(slug, 'ZZZZ-ZZZZ-ZZZZ', 'k2')).rejects.toMatchObject({ code: 'invalid' });
    await expect(claimInvite(slug, 'curto', 'k2')).rejects.toMatchObject({ code: 'invalid' });
  });

  it('limite de aparelhos por convite, e a agencia libera', async () => {
    await claimInvite(slug, codes[1]!.code, 'k3');
    await claimInvite(slug, codes[1]!.code, 'k3');
    await expect(claimInvite(slug, codes[1]!.code, 'k3')).rejects.toMatchObject({ code: 'device_limit' });
    await withScope(agencyScope(A), (tx) => resetInviteDevices(tx, A, carId, codes[1]!.id));
    await expect(claimInvite(slug, codes[1]!.code, 'k3')).resolves.toBeTruthy();
  });

  it('revogar derruba os aparelhos ja conectados', async () => {
    const { token } = await claimInvite(slug, codes[2]!.code, 'k4');
    expect(await resolveTraveler(slug, token)).not.toBeNull();
    await withScope(agencyScope(A), (tx) => revokeInvite(tx, A, carId, codes[2]!.id));
    expect(await resolveTraveler(slug, token)).toBeNull();
    await expect(claimInvite(slug, codes[2]!.code, 'k4')).rejects.toMatchObject({ code: 'invalid' });
  });

  it('o cookie de uma caravana nao vale em outra', async () => {
    const { token } = await claimInvite(slug, codes[0]!.code, 'k5');
    expect(await resolveTraveler(DEMO_CARAVAN.slug, token)).toBeNull();
  });

  it('o freio barra a enxurrada de tentativas', async () => {
    let barrado = false;
    for (let i = 0; i < 15; i++) {
      try {
        await claimInvite(slug, 'AAAA-AAAA-AAAA', 'atacante');
      } catch (e) {
        if ((e as AuthError).code === 'rate_limited') barrado = true;
      }
    }
    expect(barrado).toBe(true);
  });

  it('a agencia ve o link de novo (cifrado no banco, nunca em claro)', async () => {
    const lista = await withScope(agencyScope(A), (tx) => listInvites(tx, carId));
    const ana = lista.find((i) => i.label === 'Ana')!;
    expect(ana.code?.replace(/-/g, '')).toBe(codes[0]!.code);
    const cru = await withSystem((tx) => tx.query.participantAccess.findFirst({ where: (p, { eq }) => eq(p.id, codes[0]!.id) }));
    expect(JSON.stringify(cru)).not.toContain(codes[0]!.code);
  });
});

describe('progresso do viajante', () => {
  let ctx: TravelerContext;
  beforeAll(async () => {
    const { token } = await createDemoTraveler('demo-k');
    ctx = (await resolveTraveler(DEMO_CARAVAN.slug, token))!;
  });

  it('le o retrato da propria caravana', async () => {
    const trip = await loadTrip(ctx);
    expect(trip?.snapshot.caravan.name).toBe(DEMO_CARAVAN.name);
    expect(trip?.snapshot.days).toHaveLength(10);
  });

  it('nao le a publicacao de outra caravana, nem grava progresso de outra pessoa', async () => {
    const outra = await withScope({ kind: 'participant', agencyId: ctx.agencyId, caravanId: ctx.caravanId, accessId: ctx.accessId }, (tx) =>
      tx.select().from(caravanPublications).where(eq(caravanPublications.caravanId, carId)),
    );
    expect(outra).toHaveLength(0);
    const err = await withScope({ kind: 'participant', agencyId: ctx.agencyId, caravanId: ctx.caravanId, accessId: ctx.accessId }, (tx) =>
      tx.insert(questionAnswers).values({ accessId: codes[0]!.id, agencyId: ctx.agencyId, caravanId: ctx.caravanId, activitySlug: 'x', questionKey: 'y', correct: true }),
    ).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
  });

  it('o gabarito nao vai para o navegador', async () => {
    const trip = await loadTrip(ctx);
    const q = trip!.snapshot.activities[0]!.questions[0]!;
    const pub = publicQuestion(q);
    expect(JSON.stringify(pub)).not.toContain('correctOptionId');
    expect(JSON.stringify(pub)).not.toContain(q.explanation);
  });

  it('corrige no servidor, conclui a atividade e da o selo', async () => {
    const trip = await loadTrip(ctx);
    const act = trip!.snapshot.activities.find((a) => a.slug === 'quiz-cafarnaum')!;
    const [q1, q2, q3] = act.questions;
    const errada = await answerQuestion(ctx, act.slug, q1!.key, { optionId: q1!.options.find((o) => o.id !== q1!.correctOptionId)!.id });
    expect(errada).toMatchObject({ ok: true, correct: false, explanation: null });
    await answerQuestion(ctx, act.slug, q1!.key, { optionId: q1!.correctOptionId! });
    await answerQuestion(ctx, act.slug, q2!.key, { optionId: q2!.correctOptionId! });
    const ultima = await answerQuestion(ctx, act.slug, q3!.key, { optionId: q3!.correctOptionId! });
    expect(ultima).toMatchObject({ ok: true, correct: true, activityCompleted: true });
    expect(ultima.ok && ultima.newBadges.map((b) => b.slug)).toEqual(['descobridor-galileia']);
    const depois = await loadTrip(ctx);
    expect(depois!.progress.completed['quiz-cafarnaum']).toMatchObject({ score: 2, total: 3 });
    expect(depois!.progress.badges['descobridor-galileia']).toBeTruthy();
  });

  it('pares: a ordem certa conclui', async () => {
    const trip = await loadTrip(ctx);
    const act = trip!.snapshot.activities.find((a) => a.slug === 'hebraico-placas')!;
    const pares = act.questions.find((q) => q.kind === 'match_pairs')!;
    const errado = await answerQuestion(ctx, act.slug, pares.key, { pairs: [...pares.pairs!.map((p) => p.right)].reverse() });
    expect(errado.ok && errado.correct).toBe(false);
    const certo = await answerQuestion(ctx, act.slug, pares.key, { pairs: pares.pairs!.map((p) => p.right) });
    expect(certo.ok && certo.correct).toBe(true);
  });

  it('resposta fora das opcoes e recusada', async () => {
    const r = await answerQuestion(ctx, 'quiz-massada', 'herodes', { optionId: 'zzz' });
    expect(r).toEqual({ ok: false, error: 'invalid' });
  });

  it('registra a leitura de um destino so uma vez', async () => {
    await recordView(ctx, 'massada');
    await recordView(ctx, 'massada');
    await recordView(ctx, 'nao-existe');
    expect((await loadTrip(ctx))!.progress.viewed).toEqual(['massada']);
  });
});

describe('publicacao como retrato', () => {
  it('editar a biblioteca nao muda a caravana publicada; a agencia e avisada', async () => {
    const demo = await caravanBySlug(DEMO_CARAVAN.slug);
    const antes = await withSystem((tx) => currentSnapshot(tx, demo.id));
    const resumoAntes = antes!.destinations.find((d) => d.slug === 'massada')!.content!.summary;
    await withSystem(async (tx) => {
      const dest = await tx.query.destinations.findFirst({ where: (d, { eq }) => eq(d.slug, 'massada') });
      await tx.update(culturalContents).set({ summary: 'Texto novo', revision: 2 }).where(eq(culturalContents.destinationId, dest!.id));
    });
    const depois = await withSystem((tx) => currentSnapshot(tx, demo.id));
    expect(depois!.destinations.find((d) => d.slug === 'massada')!.content!.summary).toBe(resumoAntes);
    const avisos = await withSystem((tx) => libraryUpdatesSince(tx, depois));
    expect(avisos.join(' ')).toContain('Massada');
  });

  it('agencia real: texto em revisao e hebraico sem revisao nativa ficam fora', async () => {
    const snap = await withScope(agencyScope(A), async (tx) => {
      const destinos = await tx.query.destinations.findMany();
      await setContentSelection(tx, A, carId, destinos.map((d) => d.id));
      await addInfoItem(tx, A, carId, { section: 'contatos', title: 'Atendimento', body: 'x', contactValue: null, contactKind: null, isTimeSensitive: false });
      await publishCaravan(tx, carId, A.userId);
      return currentSnapshot(tx, carId);
    });
    expect(snap!.destinations.length).toBeGreaterThan(10);
    expect(snap!.destinations.every((d) => d.content === null)).toBe(true);
    expect(snap!.hebrew?.expressions ?? []).toHaveLength(0);
    expect(snap!.activities).toHaveLength(0);
    expect(snap!.version).toBe(2);
  });

  it('plano Essencial: sem hebraico, quizzes nem passaporte no retrato', async () => {
    const E = await makeAgency('essencial', { plan: 'essencial' });
    const snap = await withScope(agencyScope(E), async (tx) => {
      const id = await createCaravan(tx, E, { name: 'Basica', description: null, startDate: '2027-01-01', endDate: '2027-01-02', organizerName: null });
      await addDay(tx, E, id, { title: 'Dia', summary: null, practicalNotes: null });
      await publishCaravan(tx, id, E.userId);
      return currentSnapshot(tx, id);
    });
    expect(snap!.caravan.features).toEqual({ hebrew: false, quizzes: false, challenges: false, passport: false });
    expect(snap!.hebrew).toBeNull();
    expect(snap!.badges).toHaveLength(0);
  });

  it('a agencia de demonstracao tem progresso ficticio so de convites', async () => {
    const n = await withSystem((tx) => tx.select().from(activityCompletions));
    expect(n.length).toBeGreaterThan(0);
  });

  it('rascunho igual ao publicado: nenhuma mudanca acusada (o jsonb reordena chaves)', async () => {
    const demo = await caravanBySlug(DEMO_CARAVAN.slug);
    const changes = await withSystem(async (tx) => {
      const cur = await currentSnapshot(tx, demo.id);
      const draft = await buildSnapshot(tx, demo.id, cur!.version + 1);
      return diffSnapshots(cur, draft);
    });
    // so a revisao nova de Massada (teste anterior) pode aparecer
    expect(changes.filter((c) => !c.text.startsWith('Conteúdos culturais'))).toEqual([]);
  });

  it('dbErrorCode traduz erro de permissao', () => {
    expect(dbErrorCode(new Error('permission denied for table users'))).toBe('forbidden');
  });
});
