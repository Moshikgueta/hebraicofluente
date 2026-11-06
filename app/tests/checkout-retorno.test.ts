/* Quem cria a conta (ou entra) no meio do checkout volta para o checkout
 * (growth, 23/10/2026).
 *
 * O defeito: o formulário do checkout lia o `?next=` da URL, e nenhum link
 * para /checkout/ o traz. Sem ele, `safeNext` dava o painel, o portão (o
 * CourseGate) devolvia quem ainda não tem o curso à página de venda, e a
 * compra recomeçava do zero, sem aviso. O roteiro `pagamento.mjs` voltava ao
 * checkout sozinho e escondia isso.
 *
 * Aqui se confere o código (o redirecionamento depois do cadastro só
 * acontece no navegador). O caminho inteiro, num Chromium, é o `npm run
 * pagamento`, que agora falha se o cadastro sair do checkout.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { safeNext } from '@/lib/safe-next';

const fonte = (rel: string) => readFileSync(new URL(rel, import.meta.url), 'utf8');
const semComentarios = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('o cadastro no checkout volta para o checkout', () => {
  const checkout = semComentarios(fonte('../src/app/checkout/[slug]/CheckoutClient.tsx'));
  const form = semComentarios(fonte('../src/components/platform/AuthForm.tsx'));

  it('o checkout pede ao formulário para voltar à própria página', () => {
    expect(checkout).toMatch(/<AuthForm\b[^>]*\bvoltarAqui\b/);
  });

  it('com voltarAqui, o envio volta ao endereço atual, com a consulta', () => {
    expect(form).toMatch(/voltarAqui\s*\n?\s*\?\s*window\.location\.pathname\s*\+\s*window\.location\.search/);
  });

  it('com voltarAqui, o link "Entrar" leva o mesmo destino', () => {
    expect(form).toMatch(/safeNext\(voltarAqui \? aqui : /);
    expect(form).toMatch(/\/entrar\?next=\$\{encodeURIComponent\(next\)\}/);
  });

  it('o endereço do checkout passa pelo safeNext sem virar o painel', () => {
    expect(safeNext('/checkout/alfabetizacao/')).toBe('/checkout/alfabetizacao/');
    expect(safeNext('/checkout/alfabetizacao/?parceria=bio')).toBe('/checkout/alfabetizacao/?parceria=bio');
  });

  it('o roteiro do navegador não volta mais ao checkout sozinho', () => {
    const roteiro = fonte('../pagamento.mjs');
    expect(roteiro).not.toMatch(/if \(!p\.url\(\)\.includes\('\/checkout\/'\)\) \{\s*await p\.goto/);
    expect(roteiro).toMatch(/continua no checkout/);
  });
});
