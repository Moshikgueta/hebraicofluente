/* As políticas do site em inglês (PLANO-INGLES.md, etapa 6).
 * ─────────────────────────────────────────────────────────────────────────
 * Termos, Privacidade e Reembolso em inglês descrevem o site de fora: o
 * Paddle como "Merchant of Record", 14 dias para desistir, os direitos do
 * GDPR. Nada do trilho brasileiro (PIX, Mercado Pago, CPF, CDC) pode vazar
 * para eles, e as versões deles moram à parte, lidas só pelo Worker em
 * inglês. */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { versaoAtual } from '../../worker/src/lib/versoes.js';

const ler = (f: string) => readFileSync(new URL(`../src/components/legal/en/${f}`, import.meta.url), 'utf8')
  /* Só o que vai à tela: os comentários em português explicam a origem. */
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const DOCS = ['TermsEn.tsx', 'PrivacyEn.tsx', 'RefundEn.tsx'];

describe('as políticas em inglês', () => {
  it('não falam do trilho brasileiro', () => {
    for (const f of DOCS) {
      expect(ler(f), f).not.toMatch(/\bPIX\b|Mercado Pago|\bCPF\b|Consumer Protection Code|\bLGPD\b|R\$|[Ii]nstallment/);
    }
  });

  it('o Paddle aparece como revendedor e Merchant of Record, com as Buyer Terms', () => {
    const t = ler('TermsEn.tsx');
    expect(t).toContain('Merchant of Record');
    expect(t).toContain('paddle.com/legal/checkout-buyer-terms');
    expect(ler('PrivacyEn.tsx')).toMatch(/independent controller/);
    expect(ler('RefundEn.tsx')).toMatch(/Paddle/);
  });

  it('o prazo e o preço saem dos dados, nunca escritos à mão', () => {
    /* Termos e Reembolso: a Privacidade cita outros prazos (7 dias da lista,
       do depoimento), que não são o de desistir. */
    for (const f of ['TermsEn.tsx', 'RefundEn.tsx']) expect(ler(f), f).not.toMatch(/\b(7|14) days\b|\$\s?47/);
    expect(ler('TermsEn.tsx')).toContain('politicas.arrependimentoDias');
    expect(ler('RefundEn.tsx')).toContain('politicas.arrependimentoDias');
  });

  it('a Privacidade traz os direitos do GDPR e a linha da Califórnia', () => {
    const p = ler('PrivacyEn.tsx');
    expect(p).toMatch(/GDPR/);
    expect(p).toMatch(/complain to the data protection authority/);
    expect(p).toMatch(/California residents/);
  });

  it('o Worker em inglês lê as versões em inglês; o brasileiro, as dele', () => {
    const en = JSON.parse(readFileSync(new URL('../../data/politicas-versoes-en/atual.json', import.meta.url), 'utf8'));
    const pt = JSON.parse(readFileSync(new URL('../../data/politicas-versoes/atual.json', import.meta.url), 'utf8'));
    expect(versaoAtual('termos', { LOCALE: 'en' })).toBe(en.termos);
    expect(versaoAtual('termos', {})).toBe(pt.termos);
    expect(en.termos).not.toBe(pt.termos);
    for (const doc of ['termos', 'reembolso', 'privacidade']) {
      expect(() => readFileSync(new URL(`../../data/politicas-versoes-en/${doc}-${en[doc]}.html`, import.meta.url)), doc).not.toThrow();
    }
  });
});
