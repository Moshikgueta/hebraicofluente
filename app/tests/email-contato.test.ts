/* O que chega em contato@ (worker/src/email.js, LEGAL-109): encaminha ao
   dono sempre, e confirma na hora só os pedidos de desistência de gente. */
import { describe, expect, it } from 'vitest';
import { envDeTeste } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { receberEmail, pedeDesistencia, enderecoDe, confirmacaoTexto } from '../../worker/src/email.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';

type Enviado = { to: string[]; subject: string; text: string; reply_to?: string };

function ambiente() {
  const enviados: Enviado[] = [];
  const antigo = globalThis.fetch;
  globalThis.fetch = (async (_u: string, init: RequestInit) => {
    enviados.push(JSON.parse(String(init.body)));
    return new Response('{"id":"x"}', { status: 200 });
  }) as typeof fetch;
  const env = envDeTeste({
    CONTATO_DESTINO: 'dono@example.com', RESEND_API_KEY: 're_teste',
    EMAIL_FROM: 'Hebraico Fluente <contato@hebraicofluente.com.br>', SUPPORT_EMAIL: 'contato@hebraicofluente.com.br'
  });
  return { env, enviados, restaurar: () => { globalThis.fetch = antigo; } };
}

function mensagem(h: Record<string, string>) {
  const encaminhadas: string[] = [];
  return {
    encaminhadas,
    from: 'envelope@yahoo.com',
    headers: new Headers(h),
    forward: async (para: string) => { encaminhadas.push(para); }
  };
}

describe('contato@', () => {
  it('reconhece o assunto sem depender de acento', () => {
    expect(pedeDesistencia('Quero reembolso')).toBe(true);
    expect(pedeDesistencia('DESISTÊNCIA da compra')).toBe(true);
    expect(pedeDesistencia('Cancelamento')).toBe(true);
    expect(pedeDesistencia('Dúvida sobre a lição 3')).toBe(false);
    expect(enderecoDe('Moshik <Moshik@Yahoo.com>')).toBe('moshik@yahoo.com');
  });

  it('encaminha e confirma, com data e hora, para o From de verdade', async () => {
    const { env, enviados, restaurar } = ambiente();
    try {
      const m = mensagem({ from: 'Aluno <aluno@yahoo.com>', subject: 'Quero reembolso' });
      await receberEmail(m, env, Date.parse('2026-10-01T18:30:00Z'));
      expect(m.encaminhadas).toEqual(['dono@example.com']);
      expect(enviados).toHaveLength(1);
      expect(enviados[0]!.to).toEqual(['aluno@yahoo.com']);
      expect(enviados[0]!.text).toContain('01/10/2026 às 15:30');
      expect(enviados[0]!.reply_to).toBe('contato@hebraicofluente.com.br');
    } finally { restaurar(); }
  });

  it('assunto comum: só encaminha', async () => {
    const { env, enviados, restaurar } = ambiente();
    try {
      const m = mensagem({ from: 'aluno@yahoo.com', subject: 'Dúvida' });
      await receberEmail(m, env);
      expect(m.encaminhadas).toHaveLength(1);
      expect(enviados).toHaveLength(0);
    } finally { restaurar(); }
  });

  it('não responde a robô, ao próprio domínio, nem duas vezes na hora', async () => {
    const { env, enviados, restaurar } = ambiente();
    try {
      await receberEmail(mensagem({ from: 'noreply@loja.com', subject: 'Reembolso aprovado' }), env);
      await receberEmail(mensagem({ from: 'x@b.com', subject: 'Re: reembolso', 'auto-submitted': 'auto-replied' }), env);
      await receberEmail(mensagem({ from: 'contato@hebraicofluente.com.br', subject: 'reembolso' }), env);
      expect(enviados).toHaveLength(0);
      await receberEmail(mensagem({ from: 'a@b.com', subject: 'reembolso' }), env);
      await receberEmail(mensagem({ from: 'a@b.com', subject: 'reembolso de novo' }), env);
      expect(enviados).toHaveLength(1);
    } finally { restaurar(); }
  });

  it('sem destino configurado, falha alto em vez de perder a mensagem', async () => {
    const m = mensagem({ from: 'a@b.com', subject: 'oi' });
    await expect(receberEmail(m, envDeTeste())).rejects.toThrow();
  });

  it('o Worker expõe o tratador de e-mail', () => {
    expect(typeof worker.email).toBe('function');
    expect(confirmacaoTexto(Date.now())).not.toMatch(/\u2014|\u2013/);
  });
});
