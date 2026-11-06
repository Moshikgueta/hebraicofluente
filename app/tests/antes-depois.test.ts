/* O cartão "antes e depois", e o que ele não pode dizer.
 * ─────────────────────────────────────────────────────────────────────────
 * É o único lugar do curso que fala do PASSADO do aluno, e por isso é o
 * único que pode mentir sobre ele: "há 0 dias isto era um desenho", uma
 * frase que ele ainda não consegue ler, ou uma frase nova a cada recarga
 * da página, que transforma o cartão numa máquina de conteúdo e tira dele
 * exatamente o que o faz funcionar.
 *
 * Cada caso aqui é um desses.
 */

import { describe, expect, it } from 'vitest';
import { antesEDepois, diasEntre, ordemCorrida } from '@/lib/antes-depois';
import { allLetters, sentencesUpTo } from '@/lib/content';

const letras = allLetters().map(l => ({ id: l.id, order: l.order }));
const ate = (ordem: number) => sentencesUpTo(ordem);

describe('a ordem corrida do alfabeto', () => {
  it('é zero antes da primeira lição', () => {
    expect(ordemCorrida(letras, () => false)).toBe(0);
  });

  it('é o alfabeto inteiro quando tudo está concluído', () => {
    expect(ordemCorrida(letras, () => true)).toBe(22);
  });

  it('PARA no primeiro buraco, em vez de contar a letra mais alta', () => {
    /* Concluir a 12ª pulando a 5ª não destrava uma frase que usa a 5ª. Contar
       pela mais alta prometeria uma leitura que a pessoa não consegue fazer. */
    const pulou = letras.find(l => l.order === 5)!.id;
    expect(ordemCorrida(letras, id => id !== pulou)).toBe(4);
  });
});

describe('a contagem de dias', () => {
  it('conta dias corridos', () => {
    expect(diasEntre('2026-03-01', '2026-03-15')).toBe(14);
  });

  it('atravessa o fim do mês e o ano', () => {
    expect(diasEntre('2025-12-28', '2026-01-04')).toBe(7);
  });

  it('nunca é negativa, mesmo com o relógio do aparelho errado', () => {
    expect(diasEntre('2026-03-15', '2026-03-01')).toBe(0);
  });
});

describe('a escolha da frase de hoje', () => {
  it('não existe antes de haver frase legível', () => {
    expect(antesEDepois(ate(5), 5, '2026-03-01', '2026-03-20')).toBeNull();
  });

  it('não existe no primeiro dia - não há "antes"', () => {
    expect(antesEDepois(ate(20), 20, '2026-03-01', '2026-03-01')).toBeNull();
  });

  it('não existe para quem nunca fez o onboarding', () => {
    expect(antesEDepois(ate(20), 20, null, '2026-03-20')).toBeNull();
  });

  it('só oferece frase que a pessoa consegue ler', () => {
    for (const ordem of [12, 16, 20, 22]) {
      const r = antesEDepois(ate(ordem), ordem, '2026-03-01', '2026-04-01');
      expect(r, `ordem ${ordem}`).not.toBeNull();
      expect(r!.frase.after).toBeLessThanOrEqual(ordem);
    }
  });

  it('é a mesma o dia inteiro, e outra no dia seguinte', () => {
    /* Recarregar a página não pode virar uma máquina de frases novas: a graça
       do cartão é voltar amanhã. */
    const hoje = antesEDepois(ate(22), 22, '2026-03-01', '2026-04-01');
    const denovo = antesEDepois(ate(22), 22, '2026-03-01', '2026-04-01');
    const amanha = antesEDepois(ate(22), 22, '2026-03-01', '2026-04-02');
    expect(hoje!.frase.id).toBe(denovo!.frase.id);
    expect(amanha!.frase.id).not.toBe(hoje!.frase.id);
  });

  it('começa pela frase mais recém-destravada', () => {
    const r = antesEDepois(ate(22), 22, '2026-03-01', '2026-03-02');
    const maisNova = Math.max(...ate(22).map(s => s.after));
    expect(r!.frase.after).toBe(maisNova);
  });

  it('gira por todas elas ao longo das semanas, sem repetir cedo', () => {
    const vistas = new Set<string>();
    for (let d = 1; d <= ate(22).length; d++) {
      const dia = new Date(Date.UTC(2026, 2, 1 + d)).toISOString().slice(0, 10);
      vistas.add(antesEDepois(ate(22), 22, '2026-03-01', dia)!.frase.id);
    }
    expect(vistas.size).toBe(ate(22).length);
  });

  it('conta quantas frases a pessoa já lê, e o número cresce com o curso', () => {
    const a = antesEDepois(ate(12), 12, '2026-03-01', '2026-03-20')!;
    const b = antesEDepois(ate(22), 22, '2026-03-01', '2026-03-20')!;
    expect(b.total).toBeGreaterThan(a.total);
    expect(b.total).toBe(ate(22).length);
  });

  it('e os dias que informa são os dias que passaram', () => {
    const r = antesEDepois(ate(22), 22, '2026-03-01', '2026-03-29')!;
    expect(r.dias).toBe(28);
    expect(r.desde).toBe('2026-03-01');
  });
});
