/* O método da vitrine e as abas da lição contam a mesma lista (CONV-010).
 * A capa e /metodo leem lib/etapas-da-licao.ts; a lição tem a sua própria
 * constante (`STAGES`). Este teste é a costura: se uma aba mudar de nome ou
 * de ordem, a vitrine tem de mudar junto. */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ETAPAS_DA_LICAO, quantasEtapasPt } from '@/lib/etapas-da-licao';
import { DICIONARIO } from '@/i18n/telas/licao-lesson-client';

describe('as etapas da lição', () => {
  it('são as abas da lição, na mesma ordem', () => {
    const fonte = readFileSync(
      new URL('../src/app/licao/[letterId]/LessonClient.tsx', import.meta.url), 'utf8');
    const bloco = fonte.match(/const STAGES = \[([\s\S]*?)\] as const;/);
    expect(bloco).not.toBeNull();
    /* Os rótulos moram no dicionário da tela (i18n): `label: tx.chave`. */
    const pt = DICIONARIO.pt as unknown as Record<string, string>;
    const abas = [...bloco![1]!.matchAll(/label: tx\.(\w+)/g)].map(m => pt[m[1]!]);
    expect(abas).toHaveLength(5);
    expect(ETAPAS_DA_LICAO.map(e => e.aba)).toEqual(abas);
  });

  it('incluem a escrita, e a contagem por extenso bate', () => {
    expect(ETAPAS_DA_LICAO.map(e => e.aba)).toContain('Escrever');
    expect(quantasEtapasPt()).toBe('Cinco');
  });

  it('a capa e /metodo leem daqui, e não de uma lista própria', () => {
    const metodo = readFileSync(new URL('../src/app/metodo/page.tsx', import.meta.url), 'utf8');
    const copy = readFileSync(new URL('../src/components/landing/copy.ts', import.meta.url), 'utf8');
    expect(metodo).toContain('ETAPAS_DA_LICAO');
    expect(copy).toContain('ETAPAS_DA_LICAO');
  });
});
