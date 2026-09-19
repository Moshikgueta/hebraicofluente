'use client';

/* Escolher a senha nova, pelo link do e-mail.
 * ─────────────────────────────────────────────────────────────────────────
 * Duas decisões que valem o comentário:
 *
 * · Dá certo e a pessoa JÁ ENTRA, direto para o painel. Quem chegou aqui
 *   provou ter a caixa de entrada da conta e acabou de digitar uma senha;
 *   mandá-la para a tela de login para digitar tudo outra vez é o passo em
 *   que se desiste, e não protege de nada.
 *
 * · Tem confirmação de senha, ao contrário do cadastro. A diferença é real:
 *   no cadastro, quem erra a senha descobre no login seguinte e recupera em
 *   dois minutos. Aqui, quem erra acabou de queimar o único link que tinha -
 *   o token vale uma vez - e precisa começar tudo de novo. O campo a mais
 *   paga por si.
 *
 * Sem token na URL a tela não mostra formulário nenhum: ela manda de volta
 * para /esqueci-senha, porque um formulário que não tem como funcionar é pior
 * do que a explicação de por quê.
 */

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Campo, Erro } from '@/components/platform/Campo';
import { useAccount } from '@/lib/account/store';
import { AuthError, MESSAGES, MIN_PASSWORD, passwordOk } from '@/lib/account/types';

export function NovaSenha() {
  const account = useAccount();
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';

  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (!passwordOk(password)) { setError(MESSAGES['weak-password']); return; }
    if (password !== repeat) { setError('As duas senhas não são iguais.'); return; }

    setBusy(true);
    try {
      await account.resetPassword({ token, password });
      router.replace('/meu-hebraico');
    } catch (err) {
      setError(err instanceof AuthError ? err.message : MESSAGES.server);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[460px] px-4 sm:px-6 py-12 sm:py-16 grid gap-6">
      <header className="grid gap-3 justify-items-center text-center">
        <He size="lg" dim>ע</He>
        <h1 className="font-display text-[27px] sm:text-[31px] font-bold leading-tight text-ink">
          Escolher uma senha nova
        </h1>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-muted max-w-[38ch]">
          {token
            ? 'Depois disso você já entra direto - não precisa fazer login de novo.'
            : 'Este endereço só funciona com o link que mandamos por e-mail.'}
        </p>
      </header>

      <Card className="p-6 grid gap-4">
        {token ? (
          <form onSubmit={submit} className="grid gap-4" noValidate>
            <Campo
              id="senha" label="Senha nova" value={password} onChange={setPassword}
              type="password" autoComplete="new-password" required autoFocus
              hint={`Pelo menos ${MIN_PASSWORD} caracteres.`}
            />
            <Campo
              id="senha2" label="Repita a senha" value={repeat} onChange={setRepeat}
              type="password" autoComplete="new-password" required
            />

            {error && <Erro>{error}</Erro>}

            <Button type="submit" size="lg" full disabled={busy}>
              {busy ? 'Salvando…' : 'Salvar e entrar'}
            </Button>
          </form>
        ) : (
          <div className="grid gap-3">
            <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
              Faltou o link. Peça um novo - eles duram uma hora e funcionam uma
              vez só, então é normal precisar de outro.
            </p>
            <LinkButton href="/esqueci-senha" size="lg" full>
              Pedir um link novo
            </LinkButton>
          </div>
        )}
      </Card>

      <p className="font-ui text-[14px] text-center text-ink-muted">
        Lembrou a senha?{' '}
        <Link href="/entrar" className="text-[var(--accent)] font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
