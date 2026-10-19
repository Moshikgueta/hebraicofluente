/* Ouça a diferença: ר ou ח (19/10/2026). */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';

const fonte = readFileSync(join(__dirname, '..', 'src', 'components', 'learn', 'CompararSons.tsx'), 'utf8');

describe('a comparação de sons', () => {
  it('o ר traz o ר e o ח, cada um com a sílaba gravada da própria lição', () => {
    const L = conteudoPago.letters;
    const r = L.find(l => l.id === 'resh')!;
    expect(r.compararSons?.itens.map(i => i.glifo)).toEqual(['ר', 'ח']);
    const silabaA = (id: string) => L.find(l => l.id === id)!.syllables.find(s => s.vowel === 'a')!;
    expect(r.compararSons!.itens.map(i => i.audioId)).toEqual([silabaA('resh').audioId, silabaA('het').audioId]);
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
