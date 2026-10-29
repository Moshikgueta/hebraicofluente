/* O lembrete para estudar tem chave própria no site em inglês (29/10/2026): a
 * Política de Privacidade em inglês ainda não o descreve, então lá ele fica
 * desligado mesmo com o brasileiro ligado. */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { lembreteLigado } from '../../worker/src/api/lembrete.js';

const raiz = join(__dirname, '..', '..');
const empresa = JSON.parse(readFileSync(join(raiz, 'data/empresa.json'), 'utf8'));
const privEn = readFileSync(join(raiz, 'app/src/components/legal/en/PrivacyEn.tsx'), 'utf8');

describe('o lembrete no site em inglês', () => {
  it('o Worker em inglês lê a chave do inglês, e o brasileiro a dele', () => {
    expect(lembreteLigado({ LOCALE: 'en' })).toBe(empresa.privacidade.lembreteDeEstudoEn === true);
    expect(lembreteLigado({})).toBe(empresa.privacidade.lembreteDeEstudo === true);
  });

  it('ligado no inglês só com o parágrafo na Privacidade em inglês', () => {
    if (empresa.privacidade.lembreteDeEstudoEn === true) {
      expect(privEn).toMatch(/study reminder/i);
    } else {
      expect(lembreteLigado({ LOCALE: 'en' })).toBe(false);
    }
  });
});
