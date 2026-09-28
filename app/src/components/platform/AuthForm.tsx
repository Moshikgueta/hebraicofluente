'use client';

/* Entrar e criar conta - um componente para os dois.
 * ─────────────────────────────────────────────────────────────────────────
 * São o mesmo formulário com um campo a mais, e separá-los em dois arquivos
 * significaria manter duas versões da mesma validação, do mesmo tratamento de
 * erro e do mesmo `?next=`. Foi assim que metade dos sites do mundo acabou com
 * um "entrar" que respeita o redirect e um "criar conta" que não.
 *
 * O que importa aqui:
 *
 *   · `?next=` volta para onde a pessoa queria ir. Quem clicou em "continuar
 *     a lição" e caiu no login tem de voltar para a lição, não para a home.
 *     O destino é validado: só caminho interno, nunca uma URL de fora - um
 *     `?next=https://outro-site` é um redirecionamento aberto de manual.
 *   · O erro aparece perto do botão, é lido por leitor de tela (role=alert) e
 *     não some quando a pessoa começa a corrigir - ele some quando ela
 *     reenvia.
 *   · Nada de "senha forte": oito caracteres, e pronto. Medidor de força
 *     produz senha pior e post-it.
 */

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Campo, Erro } from '@/components/platform/Campo';
import { useAccount } from '@/lib/account/store';
import { safeNext } from '@/lib/safe-next';
import {
  AuthError, emailLooksValid, MESSAGES, MIN_PASSWORD, passwordOk
} from '@/lib/account/types';

/* `safeNext` mora em lib/safe-next.ts, sem React, para ser testado contra a
   lista inteira de truques de redirecionamento. Reexportado daqui para quem
   já importava deste arquivo. */
export { safeNext };

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const account = useAccount();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signup = mode === 'signup';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (!emailLooksValid(email)) { setError(MESSAGES['invalid-email']); return; }
    if (signup && !passwordOk(password)) { setError(MESSAGES['weak-password']); return; }

    setBusy(true);
    try {
      if (signup) await account.signUp({ name, email, password });
      else await account.signIn({ email, password });
      router.replace(next);
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
          {signup ? 'Criar sua conta' : 'Entrar'}
        </h1>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-muted max-w-[38ch]">
          {signup
            ? 'Seus cursos, seu progresso e seu certificado ficam todos aqui.'
            : 'Bem-vindo de volta. Vamos continuar seu hebraico?'}
        </p>
      </header>

      <Card className="p-6">
        <form onSubmit={submit} className="grid gap-4" noValidate>
          {signup && (
            <Campo
              id="nome" label="Como você quer ser chamado" value={name} onChange={setName}
              type="text" autoComplete="name" placeholder="Daniel"
            />
          )}

          <Campo
            id="email" label="E-mail" value={email} onChange={setEmail}
            type="email" autoComplete="email" placeholder="voce@exemplo.com.br" required
            /* No cadastro, um e-mail errado custa o recibo e o link de senha, e
               o site não deixa trocar sozinho (auditoria, OPS-001). */
            hint={signup ? 'Confira com cuidado: é para ele que vão o recibo da compra e o link de senha.' : undefined}
          />

          <Campo
            id="senha" label="Senha" value={password} onChange={setPassword}
            type="password"
            autoComplete={signup ? 'new-password' : 'current-password'}
            hint={signup ? `Pelo menos ${MIN_PASSWORD} caracteres.` : undefined}
            required
          />

          {error && <Erro>{error}</Erro>}

          <Button type="submit" size="lg" full disabled={busy}>
            {busy ? (signup ? 'Criando…' : 'Entrando…') : (signup ? 'Criar conta' : 'Entrar')}
          </Button>

          {/* Quem cria conta e não compra também tem dados tratados, e só via
              os Termos e a Política no checkout (auditoria, LEGAL-009). Uma
              frase, sem caixa de marcar: a base é o contrato, não o
              consentimento. */}
          {signup && (
            <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted text-center m-0">
              Ao criar a conta você concorda com os{' '}
              <Link href="/termos" className="text-[var(--accent)] hover:underline">Termos de Uso</Link>
              {' '}e com a{' '}
              <Link href="/privacidade" className="text-[var(--accent)] hover:underline">Política de Privacidade</Link>.
            </p>
          )}

          {/* Dentro do formulário, logo abaixo do botão: é onde a pessoa
              está olhando no momento exato em que a senha não funciona.
              Leva o e-mail já digitado junto, para não pedir duas vezes. */}
          {!signup && (
            <p className="font-ui text-[13.5px] text-center">
              <Link
                href={email ? `/esqueci-senha?email=${encodeURIComponent(email)}` : '/esqueci-senha'}
                className="text-[var(--accent)] hover:underline"
              >
                Esqueci minha senha
              </Link>
            </p>
          )}
        </form>
      </Card>

      <p className="font-ui text-[14px] text-center text-ink-muted">
        {signup ? (
          <>
            Já tem conta?{' '}
            <Link href={`/entrar?next=${encodeURIComponent(next)}`}
                  className="text-[var(--accent)] font-medium hover:underline">
              Entrar
            </Link>
          </>
        ) : (
          <>
            Ainda não comprou?{' '}
            <Link href="/cursos/alfabetizacao"
                  className="text-[var(--accent)] font-medium hover:underline">
              Ver o curso
            </Link>
          </>
        )}
      </p>

    </div>
  );
}
