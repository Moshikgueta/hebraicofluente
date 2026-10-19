/* Ouça a diferença: ר ou ח (19/10/2026). */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { gravacaoDoProfessor } from '@/lib/gravacoes-professor';

const fonte = readFileSync(join(__dirname, '..', 'src', 'components', 'learn', 'CompararSons.tsx'), 'utf8');

describe('a comparação de sons', () => {
  it('o ר traz o ר e o ח, cada um com a sua gravação do professor', () => {
    const r = conteudoPago.letters.find(l => l.id === 'resh')!;
    expect(r.compararSons?.itens.map(i => i.glifo)).toEqual(['ר', 'ח']);
    for (const it of r.compararSons!.itens) {
      expect(gravacaoDoProfessor(it.gravacao), it.gravacao).not.toBeNull();
    }
  });

  it('só o ר tem a comparação: as outras lições não mudam', () => {
    expect(conteudoPago.letters.filter(l => l.compararSons).map(l => l.id)).toEqual(['resh']);
  });

  it('nunca usa voz sintética', () => {
    expect(fonte).not.toMatch(/speechSynthesis|SpeechSynthesisUtterance/);
  });

  it('o exercício só aparece com todas as gravações', () => {
    expect(fonte).toContain('{todas && <Identificar');
  });
});
