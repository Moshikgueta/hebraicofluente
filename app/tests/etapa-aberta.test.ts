/* As etapas da lição de letra abrem em ordem (03/11/2026, decisão do dono).
 * Ver `etapaAberta` em lib/state/rules.ts e a etapa 1/3 em LessonClient.tsx:
 * as perguntas da explicação e uma escrita destrancam o botão de continuar,
 * e as abas do topo não deixam pular para uma etapa ainda fechada. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { etapaAberta } from '@/lib/state/rules';
import { embaralharChecagem, entendeuCom } from '@/components/learn/Compreensao';

describe('as etapas abrem em ordem', () => {
  it('lição nova: só a primeira', () => {
    expect([1, 2, 3, 4, 5].map(n => etapaAberta(n, []))).toEqual([true, false, false, false, false]);
  });

  it('cada etapa concluída abre a seguinte', () => {
    expect([1, 2, 3, 4, 5].map(n => etapaAberta(n, [1, 2]))).toEqual([true, true, true, false, false]);
  });

  it('nada do que já foi feito se fecha, mesmo fora de ordem', () => {
    /* um aluno de antes da trava, que pulou da etapa 1 para a 5 */
    expect([1, 2, 3, 4, 5].map(n => etapaAberta(n, [1, 5]))).toEqual([true, true, false, false, true]);
  });
});

describe('as perguntas da explicação', () => {
  it('com duas ou três perguntas, precisa acertar todas', () => {
    expect(entendeuCom(2)).toBe(2);
    expect(entendeuCom(3)).toBe(3);
  });

  it('toda letra tem perguntas, senão a porta da etapa 1 não existe', () => {
    const L = JSON.parse(readFileSync(new URL('../../data/letters.json', import.meta.url), 'utf8'));
    const letras = (Array.isArray(L) ? L : L.letters) as { id: string; ensino?: { checagem?: unknown[] } }[];
    expect(letras).toHaveLength(22);
    for (const l of letras) expect(l.ensino?.checagem?.length ?? 0, l.id).toBeGreaterThanOrEqual(2);
  });
});

describe('a lição usa a trava', () => {
  const fonte = readFileSync(new URL('../src/app/licao/[letterId]/LessonClient.tsx', import.meta.url), 'utf8');
  it('o botão das etapas 1 e 3 espera `liberado`', () => {
    expect(fonte.match(/disabled=\{!liberado\}/g)).toHaveLength(2);
  });
  it('as abas fechadas ficam desabilitadas', () => {
    expect(fonte).toContain('disabled={!aberta}');
  });
});

describe('a segunda rodada vem embaralhada', () => {
  const L = JSON.parse(readFileSync(new URL('../../data/letters.json', import.meta.url), 'utf8'));
  const letras = (Array.isArray(L) ? L : L.letters) as { id: string; ensino: { checagem: Parameters<typeof embaralharChecagem>[0] } }[];
  const certa = (p: Parameters<typeof embaralharChecagem>[0][number]) =>
    p.t === 'escolha' || p.t === 'visual' ? p.opcoes[p.certa] : p.t === 'vf' ? p.certa : p.linhas.map(l => `${l.item}=${p.rotulos[l.certa]}`).sort().join();

  it('as respostas certas continuam certas', () => {
    for (const l of letras) for (const s of [1, 2, 3]) {
      const orig = new Map(l.ensino.checagem.map(p => [p.q, certa(p)]));
      for (const p of embaralharChecagem(l.ensino.checagem, s)) expect(certa(p), `${l.id} ${p.q}`).toEqual(orig.get(p.q));
    }
  });

  it('a ordem muda em pelo menos uma rodada, em toda letra', () => {
    for (const l of letras) {
      const assinatura = (ps: typeof l.ensino.checagem) => JSON.stringify(ps.map(p => [p.q, 'opcoes' in p ? p.opcoes : null]));
      const mudou = [1, 2, 3].some(s => assinatura(embaralharChecagem(l.ensino.checagem, s)) !== assinatura(l.ensino.checagem));
      expect(mudou, l.id).toBe(true);
    }
  });
});
