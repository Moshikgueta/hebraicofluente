/* "Ouvir instruções em português" (lib/voz-instrucao.ts, lib/acessibilidade.ts
 * e components/learn/OuvirInstrucao.tsx). */
import { describe, expect, it } from 'vitest';
import { textoParaVoz } from '@/lib/voz-instrucao';
import { ATRIBUTOS, PADRAO, SCRIPT_DE_ARRANQUE, aplicar, normalizar } from '@/lib/acessibilidade';
import { allLetters } from '@/lib/content';
import { buildLetterPractice } from '@/lib/engine/exercises';

describe('a voz das instruções', () => {
  it('é uma preferência guardada, desligada por padrão', () => {
    expect(PADRAO.voz).toBe(false);
    expect(normalizar({ voz: true }).voz).toBe(true);
    expect(normalizar({ voz: 'sim' }).voz).toBe(false);
    expect(ATRIBUTOS.voz).toBe('data-a11y-voz');
    expect(SCRIPT_DE_ARRANQUE).toContain('data-a11y-voz');
  });

  it('marca o <html> para os exercícios saberem que está ligada', () => {
    const attrs = new Map<string, string>();
    const el = {
      setAttribute: (k: string, v: string) => attrs.set(k, v),
      removeAttribute: (k: string) => attrs.delete(k)
    } as unknown as HTMLElement;
    aplicar({ ...PADRAO, voz: true }, el);
    expect(attrs.get('data-a11y-voz')).toBe('instrucoes');
    aplicar({ ...PADRAO }, el);
    expect(attrs.has('data-a11y-voz')).toBe(false);
  });

  it('lê o enunciado sem o hebraico, que a voz em português leria errado', () => {
    expect(textoParaVoz('Como se lê {{פֶּה}} (boca)?')).toBe('Como se lê o hebraico mostrado (boca)?');
    expect(textoParaVoz('Qual é o som de פּ?')).toBe('Qual é o som de o hebraico mostrado?');
    expect(textoParaVoz('Leia. O que está escrito?')).toBe('Leia. O que está escrito?');
  });

  it('nos exercícios de verdade, o texto lido nunca contém a resposta de escolha', () => {
    for (const L of allLetters().slice(0, 8)) {
      const exs = buildLetterPractice(L, allLetters().slice(0, L.order), { audioAvailable: false, seed: `voz-${L.id}` });
      for (const ex of exs) {
        const lido = textoParaVoz(ex.promptPt);
        expect(lido).not.toMatch(/[֐-׿]/);
        if ('options' in ex && Array.isArray(ex.options) && typeof ex.answer === 'number') {
          const certa = String(ex.options[ex.answer] ?? '');
          /* Uma resposta em português com mais de 3 letras nunca pode estar
             inteira no que é lido. */
          if (certa.length > 3 && !/[֐-׿]/.test(certa)) expect(lido.includes(certa), `${ex.id}: ${certa}`).toBe(false);
        }
      }
    }
  });
});
