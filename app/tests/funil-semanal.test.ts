/* O funil numa linha por semana (24/10/2026, marketing/04-painel.md).
 * Trava: a semana é de segunda a domingo no relógio de Brasília (um pedido
 * de domingo às 23h30 não passa para a semana seguinte por causa do UTC),
 * cada coluna sai da fonte certa, pedidos do administrador ficam de fora e
 * quem saiu da lista não conta como lead. */
import { describe, expect, it } from 'vitest';
import { envDeTeste } from './ajuda/d1';
// @ts-expect-error - módulo JS do worker, sem tipos
import { funilSemanal } from '../../worker/src/api/estatisticas.js';

const ms = (iso: string) => Date.parse(iso);

describe('o funil por semana', () => {
  it('soma cada coluna na semana certa, no horário de Brasília', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: 'dono@exemplo.com' }) as { DB: { bruto: import('node:sqlite').DatabaseSync } };
    const db = env.DB.bruto;
    const est = db.prepare('INSERT INTO estatisticas (dia, chave, n) VALUES (?, ?, ?)');
    est.run('2026-10-26', 'p|visto', 5);
    est.run('2026-11-01', 'f|venda-visto|bio', 3);
    est.run('2026-10-25', 'd|pronto', 2);
    est.run('2026-10-27', 'f|checkout-pagar|direto', 1);
    est.run('2026-10-10', 'p|visto', 99);
    est.run('2026-10-26', 'r|escolha|alef|1', 7);
    const conta = db.prepare("INSERT INTO accounts (email, pass_hash, pass_salt, created_at) VALUES (?, 'h', 's', 0)");
    const aluno = Number(conta.run('aluno@exemplo.com').lastInsertRowid);
    const dono = Number(conta.run('dono@exemplo.com').lastInsertRowid);
    const ped = db.prepare(
      "INSERT INTO orders (account_id, course_slug, amount_cents, method, status, created_at, paid_at) VALUES (?, 'alfabetizacao', ?, 'pix', ?, ?, ?)"
    );
    ped.run(aluno, 14700, 'paid', ms('2026-10-25T23:30:00-03:00'), ms('2026-10-26T01:00:00-03:00'));
    ped.run(aluno, 14700, 'refunded', ms('2026-10-20T10:00:00-03:00'), ms('2026-10-21T10:00:00-03:00'));
    ped.run(dono, 14700, 'paid', ms('2026-10-27T10:00:00-03:00'), ms('2026-10-27T10:05:00-03:00'));
    const lead = db.prepare('INSERT INTO interessados (email, criado_em, confirmado_em, saiu_em) VALUES (?, 0, ?, ?)');
    lead.run('a@exemplo.com', ms('2026-10-27T12:00:00-03:00'), null);
    lead.run('b@exemplo.com', ms('2026-10-27T12:00:00-03:00'), ms('2026-10-28T09:00:00-03:00'));
    lead.run('c@exemplo.com', null, null);

    const semanas = await funilSemanal(env, ms('2026-10-28T15:00:00-03:00'), 2);
    expect(semanas.map((s: { semana: string }) => s.semana)).toEqual(['2026-10-19', '2026-10-26']);
    expect(semanas[0]).toMatchObject({ capa: 0, testeFeito: 2, pedidos: 2, compras: 0, estornos: 1, leads: 0 });
    expect(semanas[1]).toMatchObject({
      capa: 5, venda: 3, pagar: 1, checkout: 0, pedidos: 0, compras: 1, receitaCentavos: 14700, estornos: 0, leads: 1
    });
  });

  it('sem nada no banco, devolve as semanas zeradas', async () => {
    const env = envDeTeste();
    const semanas = await funilSemanal(env, ms('2026-10-28T15:00:00-03:00'));
    expect(semanas).toHaveLength(8);
    expect(semanas.every((s: Record<string, unknown>) => s.compras === 0 && s.capa === 0)).toBe(true);
  });
});
