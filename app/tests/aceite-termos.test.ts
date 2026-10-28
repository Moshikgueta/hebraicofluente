/* O aceite dos Termos de Uso no cadastro (30/09/2026): a caixa no
 * formulário, a conferência no servidor e o registro de quando e qual versão. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { deleteAccount } from '../../worker/src/lib/db.js';
import versoes from '../../data/politicas-versoes/atual.json';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };

const cadastrar = (env: Env, corpo: Record<string, unknown>) =>
  auth.signup({ request: pedido(`${SITE}/api/auth/signup`, corpo), env, ctx });
const BASE = { name: 'Ana', email: 'ana@exemplo.com', password: 'senha-boa-123', declarouIdade: true };
const aceites = (env: Env) => env.DB.bruto.prepare('SELECT * FROM aceites').all() as
  { account_id: number; documento: string; versao: string; aceito_em: number }[];

describe('o aceite dos Termos de Uso', () => {
  it('sem aceitar, não cria conta', async () => {
    const env = envDeTeste() as Env;
    for (const aceitouTermos of [undefined, false, 'sim', 1]) {
      const r = await cadastrar(env, { ...BASE, aceitouTermos });
      expect(r.status).toBe(400);
      expect(await r.json()).toEqual({ error: 'termos' });
    }
    expect(env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM accounts').get()).toEqual({ n: 0 });
  });

  /* Desde 01/10/2026 (LEGAL-104) a versão é o código do texto publicado,
     com a cópia fixa em /termos/v/<versao>/, e não mais a data. */
  it('aceitando, grava quando e o código da versão publicada dos Termos', async () => {
    const env = envDeTeste() as Env;
    const antes = Date.now();
    expect((await cadastrar(env, { ...BASE, aceitouTermos: true })).status).toBe(200);
    const [a, b] = aceites(env);
    expect(versoes.termos).toMatch(/^[0-9a-f]{10}$/);
    expect(a).toMatchObject({ documento: 'termos', versao: versoes.termos });
    /* E a declaração de idade, junto. */
    expect(b).toMatchObject({ documento: 'idade', versao: versoes.termos });
    expect(a!.aceito_em).toBeGreaterThanOrEqual(antes);
  });

  it('sai com a conta apagada', async () => {
    const env = envDeTeste() as Env;
    await cadastrar(env, { ...BASE, aceitouTermos: true });
    const { id } = env.DB.bruto.prepare('SELECT id FROM accounts').get() as { id: number };
    await deleteAccount(env, id);
    expect(aceites(env)).toEqual([]);
  });

  it('sem declarar a idade, também não cria conta', async () => {
    const env = envDeTeste() as Env;
    for (const declarouIdade of [undefined, false, 'sim']) {
      const r = await cadastrar(env, { ...BASE, declarouIdade, aceitouTermos: true });
      expect(r.status).toBe(400);
      expect(await r.json()).toEqual({ error: 'idade' });
    }
    expect(env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM accounts').get()).toEqual({ n: 0 });
  });

  it('sem a tabela, o cadastro não cai', async () => {
    const env = envDeTeste() as Env;
    env.DB.bruto.exec('DROP TABLE aceites');
    expect((await cadastrar(env, { ...BASE, aceitouTermos: true })).status).toBe(200);
  });

  it('o formulário tem a caixa, desmarcada, com o link dos Termos', () => {
    /* O texto da tela mora no dicionário desde o site em inglês (28/10/2026). */
    const f = readFileSync(new URL('../src/components/platform/AuthForm.tsx', import.meta.url), 'utf8')
      + readFileSync(new URL('../src/i18n/telas/conta-auth-form.ts', import.meta.url), 'utf8');
    expect(f).toContain('useState(false)');
    expect(f).toMatch(/type="checkbox" checked=\{aceite\}/);
    expect(f).toContain('Li e aceito os');
    expect(f).toContain('aceitouTermos: aceite');
    /* A idade vem dentro do aceite (30/09/2026): uma caixa só. */
    expect(f).toContain('declarouIdade: aceite');
    /* E só nos Termos (pedido do dono): a caixa não repete a idade. */
    expect(f).not.toContain('18 anos');
    expect(f).not.toContain('declaracao-idade');
    const t = readFileSync(new URL('../src/app/termos/page.tsx', import.meta.url), 'utf8');
    expect(t).toContain('Ao aceitar\n          estes Termos no cadastro');
    expect(f).not.toContain('Ao criar a conta você concorda');
  });
});
