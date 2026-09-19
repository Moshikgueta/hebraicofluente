/* A troca atômica do progresso, no servidor.
 * ─────────────────────────────────────────────────────────────────────────
 * O que se testa aqui é uma coisa só, e é a que justifica a coluna `rev`
 * existir: DOIS APARELHOS NÃO PODEM SE APAGAR. Sem a comparação-e-troca, a
 * sequência normal - celular lê, notebook lê, notebook grava, celular grava -
 * termina com o trabalho do notebook sumido e ninguém sabendo.
 *
 * O D1 falso abaixo implementa só o que `db.js` usa desta tabela: um `?` por
 * parâmetro, um INSERT que respeita a chave primária, e um UPDATE que devolve
 * quantas linhas mudou. É essa contagem que carrega toda a lógica - o
 * `WHERE rev = ?` que não casa é o conflito.
 */

import { beforeEach, describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { getProgress, putProgress, clearProgress } from '../../worker/src/lib/db.js';

type Linha = { account_id: number; state: string; version: number; rev: number; updated_at: number };

/** Um D1 de mentira, só para a tabela `progress`. */
function bancoFalso() {
  const linhas = new Map<number, Linha>();

  const prepare = (sql: string) => {
    let args: unknown[] = [];
    const api = {
      bind(...a: unknown[]) { args = a; return api; },
      async first() {
        if (/SELECT state/.test(sql)) return linhas.get(Number(args[0])) ?? null;
        return null;
      },
      async run() {
        if (/^\s*INSERT INTO progress/.test(sql)) {
          const [id, state, version, updated] = args as [number, string, number, number];
          /* A chave primária: um segundo INSERT para a mesma conta lança, que
             é exatamente o que `putProgress` trata como conflito. */
          if (linhas.has(Number(id))) throw new Error('UNIQUE constraint failed');
          linhas.set(Number(id), {
            account_id: Number(id), state, version, rev: 1, updated_at: updated
          });
          return { meta: { changes: 1 } };
        }
        if (/^\s*UPDATE progress/.test(sql)) {
          const [state, version, updated, id, esperado] = args as
            [string, number, number, number, number];
          const l = linhas.get(Number(id));
          if (!l || l.rev !== Number(esperado)) return { meta: { changes: 0 } };
          linhas.set(Number(id), {
            ...l, state, version, rev: l.rev + 1, updated_at: updated
          });
          return { meta: { changes: 1 } };
        }
        if (/^\s*DELETE FROM progress/.test(sql)) {
          linhas.delete(Number(args[0]));
          return { meta: { changes: 1 } };
        }
        return { meta: { changes: 0 } };
      }
    };
    return api;
  };

  return { env: { DB: { prepare } }, linhas };
}

let banco: ReturnType<typeof bancoFalso>;
beforeEach(() => { banco = bancoFalso(); });

const estado = (xp: number) => ({ version: 2, xp });

describe('o progresso guardado no servidor', () => {
  it('não existe antes da primeira gravação', async () => {
    expect(await getProgress(banco.env, 7)).toBeNull();
  });

  it('a primeira gravação cria a linha na revisão 1', async () => {
    const r = await putProgress(banco.env, 7, { state: estado(10), version: 2, expected: 0 });
    expect(r.ok).toBe(true);
    expect(r.rev).toBe(1);
    const lido = await getProgress(banco.env, 7);
    expect(lido.state.xp).toBe(10);
    expect(lido.rev).toBe(1);
  });

  it('cada gravação aceita sobe a revisão', async () => {
    await putProgress(banco.env, 7, { state: estado(10), version: 2, expected: 0 });
    const r = await putProgress(banco.env, 7, { state: estado(20), version: 2, expected: 1 });
    expect(r.ok).toBe(true);
    expect(r.rev).toBe(2);
  });

  it('recusa quem escreve por cima de uma revisão vencida', async () => {
    /* A sequência que destrói trabalho sem esta trava. */
    await putProgress(banco.env, 7, { state: estado(10), version: 2, expected: 0 });
    const revLida = 1;                       /* os dois aparelhos leram a 1 */

    const notebook = await putProgress(banco.env, 7,
      { state: estado(50), version: 2, expected: revLida });
    expect(notebook.ok).toBe(true);

    const celular = await putProgress(banco.env, 7,
      { state: estado(30), version: 2, expected: revLida });
    expect(celular.ok).toBe(false);
    /* E devolve o que está lá agora, que é o material da fusão. */
    expect(celular.atual.state.xp).toBe(50);
    expect(celular.atual.rev).toBe(2);
  });

  it('o celular recusado grava depois de reler a revisão', async () => {
    await putProgress(banco.env, 7, { state: estado(10), version: 2, expected: 0 });
    await putProgress(banco.env, 7, { state: estado(50), version: 2, expected: 1 });
    const recusado = await putProgress(banco.env, 7, { state: estado(30), version: 2, expected: 1 });
    expect(recusado.ok).toBe(false);

    /* É o que o adaptador faz: funde (máximo, aqui) e repete com a rev nova. */
    const fundido = estado(Math.max(30, recusado.atual.state.xp));
    const segunda = await putProgress(banco.env, 7,
      { state: fundido, version: 2, expected: recusado.atual.rev });
    expect(segunda.ok).toBe(true);
    expect((await getProgress(banco.env, 7)).state.xp).toBe(50);
  });

  it('um primeiro envio contra uma linha que já existe é conflito, não erro', async () => {
    await putProgress(banco.env, 7, { state: estado(10), version: 2, expected: 0 });
    const outro = await putProgress(banco.env, 7, { state: estado(99), version: 2, expected: 0 });
    expect(outro.ok).toBe(false);
    expect(outro.atual.state.xp).toBe(10);
  });

  it('uma linha com JSON quebrado vale como "nunca sincronizou"', async () => {
    await putProgress(banco.env, 7, { state: estado(10), version: 2, expected: 0 });
    banco.linhas.get(7)!.state = '{isto não é json';
    expect(await getProgress(banco.env, 7)).toBeNull();
  });

  it('apagar deixa a conta sem linha nenhuma', async () => {
    await putProgress(banco.env, 7, { state: estado(10), version: 2, expected: 0 });
    await clearProgress(banco.env, 7);
    expect(await getProgress(banco.env, 7)).toBeNull();
  });

  it('cada conta tem a sua linha', async () => {
    await putProgress(banco.env, 7, { state: estado(10), version: 2, expected: 0 });
    await putProgress(banco.env, 8, { state: estado(99), version: 2, expected: 0 });
    expect((await getProgress(banco.env, 7)).state.xp).toBe(10);
    expect((await getProgress(banco.env, 8)).state.xp).toBe(99);
  });
});
