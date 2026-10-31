/* O nome do cadastro nos e-mails (auditoria de 01/10/2026, SEC-A-003).
 *
 * O ataque: criar conta com o e-mail de OUTRA pessoa e, no campo nome, um
 * golpe com link. A confirmação e a senha chegavam à dona do endereço,
 * assinadas pelo nosso domínio, abrindo com "Oi, Sua conta foi bloqueada.
 * Regularize em https://...". Aqui o mesmo pedido, esperando o nome fora.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { nomeSeguro } from '../../worker/src/lib/nome.js';
// @ts-expect-error - idem
import { mensagemDeCompra, mensagemDeConvitePendente, mensagemDeEstorno, mensagemDeVencimento } from '../../worker/src/lib/mail.js';

const SITE = 'https://hebraicofluente.com.br';
const GOLPE = 'Sua conta foi bloqueada. Regularize em https://pagamento-hebraico.example/pix agora';

const pendentes: Promise<unknown>[] = [];
const ctx = { waitUntil: (p: Promise<unknown>) => { pendentes.push(p); } };
const assentar = async () => { await Promise.all(pendentes.splice(0)); };
let enviados: { to: string; subject: string; text: string; html: string }[] = [];

beforeEach(() => {
  enviados = [];
  pendentes.length = 0;
  vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
    const c = JSON.parse(String(init.body)) as { to: string[]; subject: string; text: string; html: string };
    enviados.push({ to: c.to[0]!, subject: c.subject, text: c.text, html: c.html });
    return new Response('{"id":"x"}', { status: 200 });
  });
});
afterEach(() => { vi.unstubAllGlobals(); });

type Env = Record<string, unknown> & { DB: { bruto: { exec(sql: string): void; prepare(sql: string): { get(...a: unknown[]): unknown } } } };
const envComEmail = () => envDeTeste({
  RESEND_API_KEY: 're_de_teste',
  EMAIL_FROM: 'Hebraico Fluente <contato@hebraicofluente.com.br>',
  RESEND_BASE: 'https://api.resend.test',
  SUPPORT_EMAIL: 'suporte@exemplo.com.br'
}) as Env;

async function cadastrar(env: Env, name: string, email = 'vitima@exemplo.org') {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`, { aceitouTermos: true, declarouIdade: true, name, email, password: 'senha-boa-123' }),
    env, ctx
  });
  expect(r.status).toBe(200);
  await assentar();
  return (await r.json()) as { account: { id: string; name: string } };
}

describe('o que conta como nome', () => {
  it.each([
    'Ana', 'Débora', 'Ana Maria', 'Ana M. Souza', "D'Ávila", 'Jean-Luc', 'Zoë', 'שרה', 'Moshik Gueta'
  ])('aceita %s', n => { expect(nomeSeguro(n)).toBe(n); });

  it('junta os espaços e corta as pontas', () => {
    expect(nomeSeguro('  Ana   Maria ')).toBe('Ana Maria');
  });

  it.each([
    ['link', GOLPE],
    ['endereço com barra', 'Ana pagamento/pix'],
    ['dois pontos', 'Aviso: pague'],
    ['arroba', 'ana@exemplo.com'],
    ['domínio sem protocolo', 'Ana pagamento-hebraico.com'],
    ['www', 'www.golpe.net'],
    ['dígitos', 'Ana 11999998888'],
    ['valor', 'Pague R$ 50'],
    ['marcação', '<img src=x onerror=alert(1)>'],
    ['comprido demais', 'A'.repeat(61)],
    ['palavras demais', 'Sua conta será bloqueada hoje se não pagar'],
    ['dois sinais seguidos', 'Ana..Maria'],
    ['começa por sinal', '-Ana'],
    ['vazio', '   '],
    ['não texto', null]
  ])('recusa %s', (_caso, n) => { expect(nomeSeguro(n)).toBe(''); });
});

describe('o cadastro', () => {
  it('um nome que é golpe não é guardado, e a conta nasce assim mesmo', async () => {
    const env = envComEmail();
    const { account } = await cadastrar(env, GOLPE);
    expect(account.name).toBe('');
    expect(env.DB.bruto.prepare('SELECT name FROM accounts').get()).toEqual({ name: '' });
  });

  it('um nome de verdade é guardado limpo', async () => {
    const env = envComEmail();
    const { account } = await cadastrar(env, '  Ana   Maria ');
    expect(account.name).toBe('Ana Maria');
  });
});

describe('os e-mails', () => {
  it('a confirmação nunca leva o nome, nem um nome de verdade', async () => {
    const env = envComEmail();
    await cadastrar(env, 'Débora');
    const m = enviados.find(e => e.subject.startsWith('Confirme'))!;
    expect(m.text.startsWith('Oi.\n')).toBe(true);
    expect(m.text + m.html).not.toContain('Débora');
  });

  it('a senha nova só leva o nome depois de o e-mail ser confirmado', async () => {
    const env = envComEmail();
    const { account } = await cadastrar(env, 'Débora');
    const pedir = async () => {
      enviados = [];
      await auth.forgot({ request: pedido(`${SITE}/api/auth/forgot`, { email: 'vitima@exemplo.org' }), env, ctx });
      await assentar();
      return enviados.find(e => e.subject.startsWith('Redefinir'))!;
    };
    expect((await pedir()).text.startsWith('Oi.\n')).toBe(true);

    env.DB.bruto.exec(`UPDATE email_verifications SET confirmed_at = 1 WHERE account_id = ${Number(account.id)}`);
    expect((await pedir()).text.startsWith('Oi, Débora.\n')).toBe(true);
  });

  it('um nome antigo, gravado antes do filtro, também não entra', async () => {
    const env = envComEmail();
    const { account } = await cadastrar(env, 'Débora');
    env.DB.bruto.exec(`UPDATE accounts SET name = '${GOLPE}' WHERE id = ${Number(account.id)}`);
    env.DB.bruto.exec(`UPDATE email_verifications SET confirmed_at = 1 WHERE account_id = ${Number(account.id)}`);
    enviados = [];
    await auth.forgot({ request: pedido(`${SITE}/api/auth/forgot`, { email: 'vitima@exemplo.org' }), env, ctx });
    await assentar();
    const m = enviados.find(e => e.subject.startsWith('Redefinir'))!;
    expect(m.text.startsWith('Oi.\n')).toBe(true);
    expect(m.text).not.toContain('pagamento-hebraico');
  });

  it('o recibo de compra e o aviso ao dono passam pelo mesmo filtro', () => {
    const compra = mensagemDeCompra({
      nome: GOLPE, curso: 'Alfabetização', valor: 'R$ 1,00', pedido: 'p1', expiraEm: Date.now(),
      link: `${SITE}/inicio/`, marca: 'Hebraico Fluente', suporte: '', arrependimentoDias: 7
    });
    expect(compra.text.startsWith('Oi.\n')).toBe(true);
    expect(compra.text).not.toContain('pagamento-hebraico');
    expect(mensagemDeCompra({
      nome: 'Ana', curso: 'Alfabetização', valor: 'R$ 1,00', pedido: 'p1', expiraEm: Date.now(),
      link: `${SITE}/inicio/`, marca: 'Hebraico Fluente', suporte: '', arrependimentoDias: 7
    }).text.startsWith('Oi, Ana.\n')).toBe(true);

    const aviso = mensagemDeConvitePendente({ email: 'x@exemplo.org', nome: GOLPE, cursos: ['alfabetizacao'], marca: 'Hebraico Fluente' });
    expect(aviso.text).not.toContain('pagamento-hebraico');
    expect(aviso.text).not.toContain('Nome no cadastro');
  });

  it('o estorno e o aviso de vencimento também (28/10/2026: montavam a saudação com o nome cru)', () => {
    const estorno = (nome: string) => mensagemDeEstorno({
      nome, curso: 'Alfabetização', valor: 'R$ 1,00', pedido: 'p1', cartao: false, marca: 'Hebraico Fluente', suporte: ''
    });
    const vencimento = (nome: string) => mensagemDeVencimento({
      nome, curso: 'Alfabetização', quando: '01/01/2027', dias: 7, marco: 'd7', meses: 12,
      renovar: `${SITE}/checkout/alfabetizacao/`, marca: 'Hebraico Fluente', suporte: ''
    });
    for (const m of [estorno(GOLPE), vencimento(GOLPE)]) {
      expect(m.text.startsWith('Oi.\n')).toBe(true);
      expect(m.text + m.html).not.toContain('pagamento-hebraico');
    }
    expect(estorno('Ana').text.startsWith('Oi, Ana.\n')).toBe(true);
    expect(vencimento('Ana').text.startsWith('Oi, Ana.\n')).toBe(true);
  });
});
