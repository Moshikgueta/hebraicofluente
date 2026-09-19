/* Um endereço só.
 * ─────────────────────────────────────────────────────────────────────────
 * O redirecionamento do www é a primeira coisa que o Worker faz, e tem de
 * continuar sendo. Se um dia alguém puser a API ou o portão na frente dele,
 * uma compra iniciada no www mandaria o comprador de volta para o www depois
 * de pagar - com o cookie de sessão emitido para o host SEM www, que não
 * viaja junto. O sintoma seria "paguei e caí deslogado".
 *
 * `wrangler dev --local` não serve para provar isto: ele responde em
 * 127.0.0.1 e o cabeçalho Host não chega a `request.url`. Chamar o handler
 * direto é o que mede a regra de verdade.
 */

import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';

/** O ambiente mínimo: o redirect acontece antes de tocar em qualquer um. */
const env = {} as Record<string, unknown>;
const ctx = {} as Record<string, unknown>;

const pedir = (url: string) =>
  worker.fetch(new Request(url), env, ctx) as Promise<Response>;

describe('o www redireciona para o endereço sem www', () => {
  it('manda a capa para o apex, com 301', async () => {
    const r = await pedir('https://www.hebraicofluente.com.br/');
    expect(r.status).toBe(301);
    expect(r.headers.get('location')).toBe('https://hebraicofluente.com.br/');
  });

  it('preserva o caminho', async () => {
    const r = await pedir('https://www.hebraicofluente.com.br/cursos/alfabetizacao/');
    expect(r.headers.get('location'))
      .toBe('https://hebraicofluente.com.br/cursos/alfabetizacao/');
  });

  it('preserva a query - é por ela que o checkout volta', async () => {
    /* A volta da Mercado Pago traz `?order=HF...`; perder a query aqui
       levaria o comprador para uma tela de confirmação sem pedido. */
    const r = await pedir(
      'https://www.hebraicofluente.com.br/checkout/alfabetizacao/obrigado/?order=HF123'
    );
    expect(r.headers.get('location'))
      .toBe('https://hebraicofluente.com.br/checkout/alfabetizacao/obrigado/?order=HF123');
  });

  it('redireciona ANTES da API - inclusive o webhook', async () => {
    /* Um webhook entregue no www não pode ser processado ali: a assinatura
       confere, mas o `origin` que sairia dele estaria errado. */
    const r = await pedir('https://www.hebraicofluente.com.br/api/health');
    expect(r.status).toBe(301);
  });

  it('não mexe em quem já está no endereço certo', async () => {
    const r = await pedir('https://hebraicofluente.com.br/api/health');
    expect(r.status).not.toBe(301);
  });

  it('não mexe no endereço de conferência da Cloudflare', async () => {
    /* O workers.dev continua respondendo, e é a rede de segurança quando há
       dúvida sobre DNS. Redirecioná-lo tiraria justamente isso. */
    const r = await pedir('https://hebraico-fluente.moshikg10.workers.dev/api/health');
    expect(r.status).not.toBe(301);
  });
});
