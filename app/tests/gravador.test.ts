/* O apagamento silencioso do progresso, e a peça que o impede.
 * ─────────────────────────────────────────────────────────────────────────
 * Em 21/09/2026 o site perdia o progresso de todo aluno a cada troca de
 * página. Reproduzido num navegador de verdade: com xp=999 e a lição 1
 * inteira guardadas, abrir a lição produzia UMA escrita no localStorage,
 *
 *   {"xp":0,"licoes":[],"rota":"/licao/alef/"}
 *
 * e o aluno voltava do zero. Com o adaptador do Worker a mesma escrita subia
 * e apagava o progresso da conta no servidor junto.
 *
 * A causa não estava em nenhuma regra de aprendizagem: estava em três linhas
 * que agendavam uma gravação levando uma CÓPIA do estado, antes de a leitura
 * do estado guardado ter terminado. Ver lib/state/gravador.ts.
 *
 * Estes casos são o defeito, não a correção: cada um falha se a guarda que o
 * atende for removida.
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { criarGravador } from '@/lib/state/gravador';
import { EMPTY_STATE, type LearnerState, type ProgressStore } from '@/lib/state/types';

/* Um armazenamento de mentira que lembra tudo o que foi gravado nele. */
function armazem(inicial: LearnerState = EMPTY_STATE) {
  const gravou: LearnerState[] = [];
  let guardado = inicial;
  const store: ProgressStore = {
    async load() { return guardado; },
    async save(s) { guardado = s; gravou.push(s); },
    async clear() { guardado = EMPTY_STATE; }
  };
  return { store, gravou, ultimo: () => guardado };
}

const comXp = (xp: number, extra: Partial<LearnerState> = {}): LearnerState =>
  ({ ...EMPTY_STATE, xp, ...extra });

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('o gravador do progresso', () => {
  it('NÃO grava antes de a leitura terminar', async () => {
    /* O caso exato do defeito: o AppShell avisa a rota num efeito, e efeito
       roda antes de promessa resolver. Naquele instante o estado em memória
       ainda é o vazio, e gravá-lo apaga o que estava guardado. */
    const a = armazem(comXp(999));
    let estado = EMPTY_STATE;
    const g = criarGravador(a.store, () => estado);

    g.agendar(400);
    await vi.advanceTimersByTimeAsync(1000);

    expect(a.gravou).toHaveLength(0);
    expect(a.ultimo().xp).toBe(999);
  });

  it('grava o estado DE AGORA, nunca o de quando foi agendado', async () => {
    /* A segunda metade do defeito. Mesmo depois de liberado, uma gravação
       que carregasse consigo uma cópia do estado gravaria essa cópia - e
       entre o agendamento e o disparo cabe a chegada do estado guardado. */
    const a = armazem();
    let estado = comXp(1);
    const g = criarGravador(a.store, () => estado);
    g.liberar();

    g.agendar(250);
    estado = comXp(42);                 /* o estado mudou no meio do caminho */
    await vi.advanceTimersByTimeAsync(300);

    expect(a.gravou).toHaveLength(1);
    expect(a.gravou[0]!.xp).toBe(42);
  });

  it('a sequência inteira da abertura de página não perde nada', async () => {
    /* O cenário do navegador, encenado: monta vazio, a rota é avisada, a
       leitura devolve o progresso de verdade, e só então a gravação abre. */
    const guardadoNoAparelho = comXp(999, { lastRoute: '/meu-hebraico' });
    const a = armazem(guardadoNoAparelho);
    let estado = EMPTY_STATE;
    const g = criarGravador(a.store, () => estado);

    g.agendar(400);                     /* o efeito da rota, com o estado vazio */
    await vi.advanceTimersByTimeAsync(100);

    estado = await a.store.load();      /* a leitura chega */
    g.liberar();
    await vi.advanceTimersByTimeAsync(1000);

    /* Se alguma coisa foi gravada, foi o progresso - nunca o vazio. */
    for (const s of a.gravou) expect(s.xp).toBe(999);
    expect(a.ultimo().xp).toBe(999);
  });

  it('um agendamento novo substitui o pendente, em vez de somar', async () => {
    const a = armazem();
    let estado = comXp(1);
    const g = criarGravador(a.store, () => estado);
    g.liberar();

    g.agendar(250);
    g.agendar(250);
    g.agendar(250);
    estado = comXp(7);
    await vi.advanceTimersByTimeAsync(300);

    expect(a.gravou).toHaveLength(1);
    expect(a.gravou[0]!.xp).toBe(7);
  });

  it('cancelar impede a gravação pendente', async () => {
    const a = armazem(comXp(5));
    const g = criarGravador(a.store, () => comXp(9));
    g.liberar();

    g.agendar(250);
    g.cancelar();
    await vi.advanceTimersByTimeAsync(1000);

    expect(a.gravou).toHaveLength(0);
    expect(a.ultimo().xp).toBe(5);
  });

  it('agora() grava sem esperar - é o que entrar e sair precisa', async () => {
    /* Entrar muda de quem é o progresso, e a fusão acontece na leitura
       seguinte. O que estava em memória tem de estar gravado ANTES dela,
       senão a resposta dada um instante antes do login não entra na conta. */
    const a = armazem();
    const g = criarGravador(a.store, () => comXp(3));
    g.liberar();

    await g.agora();

    expect(a.gravou).toHaveLength(1);
    expect(a.gravou[0]!.xp).toBe(3);
  });

  it('agora() também respeita a leitura que não terminou', async () => {
    const a = armazem(comXp(999));
    const g = criarGravador(a.store, () => EMPTY_STATE);

    await g.agora();

    expect(a.gravou).toHaveLength(0);
    expect(a.ultimo().xp).toBe(999);
  });

  it('e agora() cancela o que estava pendente, em vez de gravar duas vezes', async () => {
    const a = armazem();
    let estado = comXp(2);
    const g = criarGravador(a.store, () => estado);
    g.liberar();

    g.agendar(250);
    await g.agora();
    estado = comXp(8);
    await vi.advanceTimersByTimeAsync(1000);

    expect(a.gravou).toHaveLength(1);
    expect(a.gravou[0]!.xp).toBe(2);
  });
});
