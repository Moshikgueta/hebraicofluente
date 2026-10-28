/* A conferência das chaves do Paddle (scripts/paddle-confere.mjs).
 * Contra um Paddle de mentira: chave aceita ou recusada, token de outro
 * ambiente, destino de notificação ausente, desativado ou sem evento. */
import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS, sem tipos
import { conferir, EVENTOS } from '../../scripts/paddle-confere.mjs';

const ORIGEM = 'https://fluent.example';
type Destino = { destination: string; active?: boolean; subscribed_events: { name: string }[] };

function paddle({ aceita = true, destinos = [] as Destino[] } = {}) {
  const pedidos: string[] = [];
  const buscar = async (url: string, init: { headers: Record<string, string> }) => {
    pedidos.push(url);
    if (!String(init.headers.Authorization ?? '').startsWith('Bearer ')) throw new Error('sem chave');
    if (!aceita) return new Response(JSON.stringify({ error: { code: 'authentication_malformed' } }), { status: 403 });
    if (url.endsWith('/event-types')) return new Response('{"data":[]}', { status: 200 });
    if (url.endsWith('/notification-settings')) return new Response(JSON.stringify({ data: destinos }), { status: 200 });
    return new Response('{}', { status: 404 });
  };
  return { buscar, pedidos };
}
const destino = (extra: Partial<Destino> = {}): Destino => ({
  destination: `${ORIGEM}/api/pay/paddle`, active: true, subscribed_events: EVENTOS.map((name: string) => ({ name })), ...extra
});
const base = { chave: 'pdl_sdbx_apikey_0123456789', token: 'test_abc', origem: ORIGEM };

describe('a conferência do Paddle', () => {
  it('tudo certo: sandbox, token de teste, destino com os quatro eventos', async () => {
    const p = paddle({ destinos: [destino()] });
    const r = await conferir({ ...base, buscar: p.buscar });
    expect(r.ok, r.linhas.join('\n')).toBe(true);
    expect(p.pedidos[0]).toBe('https://sandbox-api.paddle.com/event-types');
    expect(r.linhas.join('\n')).not.toContain('0123456789');
  });

  it('chave de produção vai à API de produção, e com token de teste reprova', async () => {
    const p = paddle({ destinos: [destino()] });
    const r = await conferir({ ...base, chave: 'pdl_live_apikey_x', buscar: p.buscar });
    expect(p.pedidos[0]).toBe('https://api.paddle.com/event-types');
    expect(r.ok).toBe(false);
    expect(r.linhas.join('\n')).toMatch(/outro ambiente/);
  });

  it('chave recusada, destino ausente, desativado ou sem evento: reprova e diz o quê', async () => {
    expect((await conferir({ ...base, buscar: paddle({ aceita: false }).buscar })).linhas.join('\n')).toMatch(/recusou a chave \(403 authentication_malformed\)/);
    expect((await conferir({ ...base, buscar: paddle({ destinos: [destino({ destination: 'https://outro/x' })] }).buscar })).linhas.join('\n'))
      .toMatch(/nenhum destino.*há: https:\/\/outro\/x/);
    expect((await conferir({ ...base, buscar: paddle({ destinos: [destino({ active: false })] }).buscar })).ok).toBe(false);
    const sem = await conferir({ ...base, buscar: paddle({ destinos: [destino({ subscribed_events: [{ name: 'transaction.completed' }] })] }).buscar });
    expect(sem.ok).toBe(false);
    expect(sem.linhas.join('\n')).toMatch(/faltam eventos.*adjustment\.updated/);
  });

  it('o endereço provisório e a chave ausente reprovam antes de perguntar', async () => {
    const r = await conferir({ ...base, origem: 'https://dominio-em-ingles.invalid', buscar: paddle({ destinos: [destino()] }).buscar });
    expect(r.ok).toBe(false);
    expect(r.linhas.join('\n')).toMatch(/provisório/);
    expect((await conferir({ ...base, chave: '' })).ok).toBe(false);
  });
});
