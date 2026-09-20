/* Os testes da PROPOSTA de correção do pagamento (audit/pagamento.test.ts).
 *
 * Ficam fora de app/tests de propósito: eles FALHAM no código de hoje - é o
 * que prova que os defeitos existem - e passam com audit/pagamento-proposto.patch
 * aplicado. Um teste que falha por desenho não pode morar na suíte que decide
 * se uma publicação sai.
 *
 *   cd app && npm run proposta
 */
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: { environment: 'node', include: ['../audit/*.test.ts'] },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url))
    }
  }
});
