// Uma agencia nao enxerga nem altera nada de outra, e o banco segura isso
// mesmo quando a consulta "esquece" o filtro.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import { caravanDays, caravans, participantAccess, sessions, users } from '@/lib/db/schema';
import { dbErrorCode } from '@/lib/db/tenant';
import { addDay, createCaravan, createInvites, listCaravans, revokeInvite } from '@/lib/domain/agency';
import { agencyScope, closeDb, makeAgency, seedAll, withScope } from './helpers';

let A: Awaited<ReturnType<typeof makeAgency>>;
let B: Awaited<ReturnType<typeof makeAgency>>;
let carA: string;
let carB: string;

const geral = (name: string) => ({ name, description: null, startDate: '2027-03-01', endDate: '2027-03-08', organizerName: null });

beforeAll(async () => {
  await seedAll();
  A = await makeAgency('alfa', { seats: 2 });
  B = await makeAgency('beta');
  carA = await withScope(agencyScope(A), (tx) => createCaravan(tx, { ...A }, geral('Caravana Alfa')));
  carB = await withScope(agencyScope(B), (tx) => createCaravan(tx, { ...B }, geral('Caravana Beta')));
});
afterAll(closeDb);

describe('isolamento entre agencias', () => {
  it('uma consulta sem filtro so devolve as caravanas da propria agencia', async () => {
    const vistos = await withScope(agencyScope(A), (tx) => tx.select({ id: caravans.id }).from(caravans));
    expect(vistos.map((v) => v.id)).toEqual([carA]);
    const lista = await withScope(agencyScope(B), (tx) => listCaravans(tx));
    expect(lista.map((c) => c.id)).toEqual([carB]);
  });

  it('nao altera a caravana de outra agencia', async () => {
    const res = await withScope(agencyScope(A), (tx) =>
      tx.update(caravans).set({ name: 'invadida' }).where(eq(caravans.id, carB)).returning({ id: caravans.id }),
    );
    expect(res).toHaveLength(0);
  });

  it('nao pendura um dia na caravana de outra agencia, nem mentindo o agency_id', async () => {
    await expect(
      withScope(agencyScope(A), (tx) => tx.insert(caravanDays).values({ caravanId: carB, agencyId: A.agencyId, dayNumber: 1, title: 'x' })),
    ).rejects.toThrow();
    await expect(
      withScope(agencyScope(A), (tx) => tx.insert(caravanDays).values({ caravanId: carB, agencyId: B.agencyId, dayNumber: 1, title: 'x' })),
    ).rejects.toThrow();
  });

  it('a agencia nao le contas, senhas nem sessoes', async () => {
    const err1 = await withScope(agencyScope(A), (tx) => tx.select().from(users)).catch((e) => e);
    expect(dbErrorCode(err1)).toBe('forbidden');
    const err2 = await withScope(agencyScope(A), (tx) => tx.select().from(sessions)).catch((e) => e);
    expect(dbErrorCode(err2)).toBe('forbidden');
  });

  it('o escopo exige uuid: nada de texto injetado no set_config', async () => {
    await expect(withScope({ kind: 'agency', agencyId: "x' or 1=1", userId: A.userId }, async () => 1)).rejects.toThrow('escopo invalido');
  });
});

describe('contrato: plano e vagas sao da plataforma', () => {
  it('a caravana nasce com o plano e as vagas do contrato, seja o que for pedido', async () => {
    const [c] = await withScope(agencyScope(A), (tx) => tx.select().from(caravans).where(eq(caravans.id, carA)));
    expect(c!.planId).toBe('completa');
    expect(c!.seatLimit).toBe(2);
  });

  it('a agencia nao muda o proprio limite de vagas', async () => {
    const err = await withScope(agencyScope(A), (tx) => tx.update(caravans).set({ seatLimit: 999 }).where(eq(caravans.id, carA))).catch((e) => e);
    expect(['contract_fields', 'forbidden']).toContain(dbErrorCode(err));
  });

  it('o banco recusa o convite alem do limite, e a vaga volta quando um convite e revogado', async () => {
    const criados = await withScope(agencyScope(A), (tx) => createInvites(tx, A, carA, ['Ana', 'Bia']));
    expect(criados).toHaveLength(2);
    const err = await withScope(agencyScope(A), (tx) => createInvites(tx, A, carA, ['Caio'])).catch((e) => e);
    expect(dbErrorCode(err)).toBe('seat_limit');
    await withScope(agencyScope(A), (tx) => revokeInvite(tx, A, carA, criados[0]!.id));
    const outro = await withScope(agencyScope(A), (tx) => createInvites(tx, A, carA, ['Caio']));
    expect(outro).toHaveLength(1);
  });

  it('a lista de caravanas conta os convites da propria caravana', async () => {
    const [c] = await withScope(agencyScope(A), (tx) => listCaravans(tx));
    expect(c).toMatchObject({ id: carA, invites: 2, seatLimit: 2 });
  });

  it('convite revogado nao volta a valer', async () => {
    const err = await withScope(agencyScope(A), (tx) =>
      tx.update(participantAccess).set({ status: 'active' }).where(eq(participantAccess.status, 'revoked')),
    ).catch((e) => e);
    expect(dbErrorCode(err)).toBe('invite_revoked_final');
  });

  it('teto de caravanas ativas', async () => {
    const C = await makeAgency('gama', { maxCaravans: 1 });
    await withScope(agencyScope(C), (tx) => createCaravan(tx, C, geral('Uma')));
    const err = await withScope(agencyScope(C), (tx) => createCaravan(tx, C, geral('Duas'))).catch((e) => e);
    expect(dbErrorCode(err)).toBe('caravan_limit');
  });

  it('o roteiro nao passa da duracao da viagem', async () => {
    for (let i = 0; i < 8; i++) await withScope(agencyScope(B), (tx) => addDay(tx, B, carB, { title: `Dia ${i + 1}`, summary: null, practicalNotes: null }));
    await expect(withScope(agencyScope(B), (tx) => addDay(tx, B, carB, { title: 'Nono', summary: null, practicalNotes: null }))).rejects.toThrow();
    const n = await withScope(agencyScope(B), (tx) => tx.select({ n: sql<number>`count(*)::int` }).from(caravanDays));
    expect(n[0]!.n).toBe(8);
  });
});
