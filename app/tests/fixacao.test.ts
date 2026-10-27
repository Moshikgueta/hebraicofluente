/* A Fixação guiada (etapa 4) e os Exercícios (etapa 5) são coisas
 * diferentes (11/10/2026). Ver components/learn/FixacaoGuiada.tsx. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { alvoDaLetra, alvoDoSom } from '@/lib/fixacao';

const L = [...conteudoPago.letters].sort((a, b) => a.order - b.order);
const sons = conteudoPago.extras.sons;
const fonte = (p: string) => readFileSync(join(__dirname, '..', 'src', p), 'utf8');

describe('a fixação guiada tem material em toda lição', () => {
  it('as 22 letras', () => {
    for (const letter of L) {
      const a = alvoDaLetra(letter, L.filter(l => l.order <= letter.order));
      expect(a.palavras.length, letter.id).toBeGreaterThan(0);
      expect(a.outrosGlifos.length, letter.id).toBeGreaterThanOrEqual(3);
      expect(a.outrosGlifos, letter.id).not.toContain(a.glifo);
      expect(a.outrosSons.length, letter.id).toBeGreaterThanOrEqual(2);
      expect(a.outrosSons, letter.id).not.toContain(a.som);
      expect(a.lembrePt.trim(), letter.id).not.toBe('');
      /* A revisão rápida só compara com letras que o aluno já viu. */
      for (const c of a.comparar) {
        /* No Bet, Kaf e Pe a comparação mostra a letra com o daguesh (27/10/2026). */
        expect(L.find(l => l.letter === c.glifo.replace('\u05BC', ''))!.order, letter.id).toBeLessThan(letter.order);
      }
      if (letter.order > 1) expect(a.comparar.length, letter.id).toBeGreaterThan(0);
    }
  });

  it('as lições de som', () => {
    expect(sons.length).toBeGreaterThan(0);
    for (const S of sons) {
      const a = alvoDoSom(S);
      expect(a.palavras.length, S.id).toBeGreaterThan(0);
      expect(a.comparar.length, S.id).toBe(1);
      expect(a.outrosSons, S.id).not.toContain(a.som);
    }
  });
});

describe('fixação e exercícios não são o mesmo bloco duas vezes', () => {
  it('a etapa 4 é a fixação guiada, sem o tocador de perguntas', () => {
    const fix = fonte('components/learn/FixacaoGuiada.tsx');
    expect(fix).not.toContain('ExercisePlayer');
    expect(fix).not.toContain('finishQuiz');
    for (const tela of ['app/licao/[letterId]/LessonClient.tsx', 'app/som/[id]/SomLessonClient.tsx', 'app/som/[id]/ContrasteClient.tsx']) {
      const t = fonte(tela);
      expect(t, tela).toContain('<FixacaoGuiada');
      expect(t, tela).toContain("{ n: 4, label: 'Fixação' }");
      expect(t, tela).toContain("{ n: 5, label: 'Exercícios' }");
      expect(t, tela).not.toContain('buildLetterPractice');
      expect(t, tela).not.toContain('-pratica');
    }
  });
});
