/* O Worker, nas partes que decidem dinheiro e acesso.
 *
 * O que dá para testar sem Cloudflare é justamente o que não pode estar
 * errado: de onde sai o preço, o que conta como "pago", quais rotas ficam
 * atrás do portão e como a assinatura do webhook é conferida. O resto —
 * consultas ao D1, chamadas à Mercado Pago — é integração e fica para o
 * ambiente de verdade.
 *
 * Os módulos são .js e vivem fora de app/. Isso é de propósito: o Worker roda
 * no runtime da Cloudflare, sem etapa de TypeScript, e testar o arquivo que
 * realmente é publicado vale mais do que testar uma cópia compilada. */

import { describe, expect, it } from 'vitest';
// @ts-expect-error — módulo JS do Worker, sem tipos
import { clampInstallments, getCourse, isSellable, priceCents } from '../../worker/src/lib/catalog.js';
// @ts-expect-error — idem
import { mapStatus, verifyWebhookSignature, isSandbox } from '../../worker/src/lib/mercadopago.js';
// @ts-expect-error — idem
import { isGatedPath } from '../../worker/src/gate.js';
// @ts-expect-error — idem
import { hmacHex, timingSafeEqual, hashPassword, verifyPassword, PBKDF2_ITER, itersFor }
  from '../../worker/src/lib/crypto.js';

describe('o preço vem do servidor', () => {
  it('lê o mesmo catálogo que o app', () => {
    const c = getCourse('alfabetizacao');
    expect(c).toBeTruthy();
    expect(c.price.brl).toBeGreaterThan(0);
    expect(getCourse('curso-que-nao-existe')).toBeNull();
  });

  it('cobra o preço do catálogo, com o desconto do PIX no PIX', () => {
    const c = getCourse('alfabetizacao');
    expect(priceCents(c, 'card')).toBe(Math.round(c.price.brl * 100));
    expect(priceCents(c, 'pix'))
      .toBe(Math.round(c.price.brl * (1 - c.price.pixDiscountPct / 100) * 100));
  });

  it('devolve centavos inteiros, nunca um valor quebrado', () => {
    for (const slug of ['alfabetizacao', 'hebraico-a1', 'hebraico-a2', 'hebraico-b1']) {
      for (const m of ['pix', 'card'] as const) {
        const v = priceCents(getCourse(slug), m);
        expect(Number.isInteger(v), `${slug} ${m}`).toBe(true);
        expect(v, `${slug} ${m}`).toBeGreaterThan(0);
      }
    }
  });

  it('não deixa vender o que não existe', () => {
    expect(isSellable(getCourse('alfabetizacao'))).toBe(true);
    expect(isSellable(getCourse('hebraico-a1'))).toBe(false);
    expect(isSellable(null)).toBe(false);
  });

  it('limita as parcelas ao que o catálogo permite', () => {
    const c = getCourse('alfabetizacao');
    /* O comprador manda 24; o limite é nosso. Sem este corte, alguém compra em
       24x sem juros um curso vendido em 12x, e a diferença sai do nosso bolso. */
    expect(clampInstallments(c, 24)).toBe(c.price.installments);
    expect(clampInstallments(c, 0)).toBe(1);
    expect(clampInstallments(c, -5)).toBe(1);
    expect(clampInstallments(c, 3.7)).toBe(3);
    expect(clampInstallments(c, 'muitas')).toBe(1);
  });
});

describe('o que conta como pago', () => {
  it('traduz o vocabulário da Mercado Pago', () => {
    expect(mapStatus('approved')).toBe('paid');
    expect(mapStatus('authorized')).toBe('paid');
    expect(mapStatus('pending')).toBe('pending');
    expect(mapStatus('in_process')).toBe('pending');
    expect(mapStatus('rejected')).toBe('failed');
    expect(mapStatus('cancelled')).toBe('failed');
    expect(mapStatus('refunded')).toBe('refunded');
    expect(mapStatus('charged_back')).toBe('refunded');
  });

  it('trata um status desconhecido como pendente, nunca como pago', () => {
    /* Um status novo que a Mercado Pago invente não pode virar acesso por
       acidente. Pendente é o único padrão seguro: ele espera. */
    for (const s of ['', 'whatever', 'approved_maybe', undefined as unknown as string]) {
      expect(mapStatus(s)).toBe('pending');
    }
  });
});

describe('teste ou produção', () => {
  it('decide pelo prefixo do token, não por uma variável', () => {
    expect(isSandbox({ MP_ACCESS_TOKEN: 'TEST-123' })).toBe(true);
    expect(isSandbox({ MP_ACCESS_TOKEN: 'APP_USR-123' })).toBe(false);
  });

  it('ignora MP_SANDBOX quando o token já respondeu', () => {
    /* É o caso que custa caro: token de produção com o modo de teste esquecido
       manda todo comprador para um checkout que NÃO COBRA — sem reclamação,
       porque ninguém pagou, e por isso pode passar semanas despercebido. */
    expect(isSandbox({ MP_ACCESS_TOKEN: 'APP_USR-123', MP_SANDBOX: '1' })).toBe(false);
    expect(isSandbox({ MP_ACCESS_TOKEN: 'TEST-123', MP_SANDBOX: '0' })).toBe(true);
  });

  it('na dúvida, não cobra', () => {
    /* Prefixo desconhecido: cai na variável, e o padrão dela é o modo que não
       tira dinheiro de ninguém. */
    expect(isSandbox({ MP_ACCESS_TOKEN: 'algo-estranho' })).toBe(true);
    expect(isSandbox({})).toBe(true);
    expect(isSandbox(undefined)).toBe(true);
    expect(isSandbox({ MP_ACCESS_TOKEN: 'algo-estranho', MP_SANDBOX: '0' })).toBe(false);
  });
});

describe('o webhook', () => {
  const secret = 'segredo-de-teste';
  const dataId = '123456789';

  const req = (headers: Record<string, string>) =>
    new Request('https://exemplo.com/api/pay/webhook', { headers });

  const signed = async (ts: string, requestId = 'req-1', id = dataId) => {
    const v1 = await hmacHex(secret, `id:${id};request-id:${requestId};ts:${ts};`);
    return req({ 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': requestId });
  };

  it('aceita uma entrega legítima e recente', async () => {
    const ts = String(Math.floor(Date.now() / 1000));
    expect(await verifyWebhookSignature({ MP_WEBHOOK_SECRET: secret }, await signed(ts), dataId))
      .toBe(true);
  });

  it('recusa tudo quando não há segredo configurado', async () => {
    /* A trava mais importante do arquivo: sem segredo, esta rota seria uma
       porta pública que libera curso. Falhar fechado, sempre. */
    const ts = String(Math.floor(Date.now() / 1000));
    expect(await verifyWebhookSignature({}, await signed(ts), dataId)).toBe(false);
    expect(await verifyWebhookSignature({ MP_WEBHOOK_SECRET: '' }, await signed(ts), dataId))
      .toBe(false);
  });

  it('recusa assinatura errada, faltando ou malformada', async () => {
    const env = { MP_WEBHOOK_SECRET: secret };
    const ts = String(Math.floor(Date.now() / 1000));
    expect(await verifyWebhookSignature(env, req({}), dataId)).toBe(false);
    expect(await verifyWebhookSignature(env, req({ 'x-signature': 'lixo' }), dataId)).toBe(false);
    expect(await verifyWebhookSignature(
      env, req({ 'x-signature': `ts=${ts},v1=deadbeef`, 'x-request-id': 'req-1' }), dataId
    )).toBe(false);
  });

  it('recusa uma entrega antiga, mesmo assinada corretamente', async () => {
    /* É o que impede alguém de gravar uma entrega legítima e reenviá-la depois
       para liberar acesso de novo. */
    const old = String(Math.floor(Date.now() / 1000) - 10 * 60);
    expect(await verifyWebhookSignature({ MP_WEBHOOK_SECRET: secret }, await signed(old), dataId))
      .toBe(false);
  });

  it('recusa quando o id assinado não é o id entregue', async () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const r = await signed(ts, 'req-1', '999');
    expect(await verifyWebhookSignature({ MP_WEBHOOK_SECRET: secret }, r, dataId)).toBe(false);
  });
});

describe('o portão', () => {
  it('fecha todas as rotas do curso pago', () => {
    for (const p of [
      '/licao/alef', '/licao/alef/', '/modulo/1', '/checkpoint/2', '/extra/sem-o-ponto',
      '/revisao', '/academia', '/mapa', '/desafio-final', '/certificado',
      '/concluido', '/conquistas', '/historia', '/workbook', '/inicio',
      '/onboarding', '/meu-hebraico'
    ]) {
      expect(isGatedPath(p), p).toBe(true);
    }
  });

  it('deixa passar o site público e a compra', () => {
    for (const p of [
      '/', '/metodo', '/cursos', '/cursos/alfabetizacao', '/sobre', '/faq',
      '/entrar', '/criar-conta', '/checkout/alfabetizacao',
      '/checkout/alfabetizacao/obrigado', '/perfil'
    ]) {
      expect(isGatedPath(p), p).toBe(false);
    }
  });

  it('não se deixa enganar por um prefixo parecido', () => {
    /* "/mapas-do-site" começa com "/mapa" e NÃO é a rota do mapa. Um portão
       que casa por `startsWith` cru bloqueia (ou libera) a página errada. */
    expect(isGatedPath('/mapa-do-site')).toBe(false);
    expect(isGatedPath('/licaozinha')).toBe(false);
    expect(isGatedPath('/licao')).toBe(true);
  });
});

describe('senhas', () => {
  it('cabe no limite de CPU do plano gratuito', () => {
    /* 10 ms de CPU por requisição no plano gratuito, e 310.000 iterações
       custam 53 ms — foi assim que a primeira publicação devolveu 500 em toda
       rota que calculava hash. O padrão tem de caber com folga. */
    expect(PBKDF2_ITER).toBeLessThanOrEqual(50_000);
    /* E mesmo assim não pode ser simbólico. */
    expect(PBKDF2_ITER).toBeGreaterThanOrEqual(25_000);
  });

  it('deixa subir o custo por configuração, e ignora lixo', () => {
    expect(itersFor({ PBKDF2_ITERATIONS: '310000' })).toBe(310_000);
    expect(itersFor({})).toBe(PBKDF2_ITER);
    expect(itersFor(undefined)).toBe(PBKDF2_ITER);
    /* Um valor absurdamente baixo não pode enfraquecer tudo por engano de
       digitação — cai no padrão. */
    expect(itersFor({ PBKDF2_ITERATIONS: '1' })).toBe(PBKDF2_ITER);
    expect(itersFor({ PBKDF2_ITERATIONS: 'muitas' })).toBe(PBKDF2_ITER);
  });

  it('confere a senha certa e recusa a errada', async () => {
    const { hash, salt, iterations } = await hashPassword('cavalo correto bateria grampo');
    expect(await verifyPassword('cavalo correto bateria grampo', salt, hash, iterations)).toBe(true);
    expect(await verifyPassword('outra coisa', salt, hash, iterations)).toBe(false);
  });

  it('dá hashes diferentes para a mesma senha', async () => {
    /* Sal aleatório por conta. Sem ele, duas pessoas com a mesma senha têm o
       mesmo hash, e uma tabela pronta quebra as duas de uma vez. */
    const a = await hashPassword('mesma senha');
    const b = await hashPassword('mesma senha');
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
  });

  it('continua verificando uma conta gravada com menos iterações', async () => {
    /* É o que permite subir o custo depois sem deslogar e sem invalidar a
       senha de ninguém: a linha antiga carrega o número dela. */
    const old = await hashPassword('senha antiga', null, 100_000);
    expect(await verifyPassword('senha antiga', old.salt, old.hash, 100_000)).toBe(true);
  });

  it('compara assinatura em tempo constante, e compara certo', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
    expect(timingSafeEqual('', '')).toBe(true);
    expect(timingSafeEqual(null as unknown as string, 'abc')).toBe(false);
  });
});
