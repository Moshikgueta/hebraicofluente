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
import { useAccount } from '@/lib/account/store';
import {
  AuthError, emailLooksValid, MESSAGES, MIN_PASSWORD, passwordOk
} from '@/lib/account/types';

/** Só caminho interno. Qualquer outra coisa vira o painel. */
export function safeNext(raw: string | null): string {
  if (!raw) return '/meu-hebraico';
  /* Uma barra, e a segunda posição não pode ser barra nem contrabarra:
     "//evil.com" e "/\evil.com" são absolutas para o navegador. */
  if (!/^\/[^/\\]/.test(raw)) return '/meu-hebraico';
  return raw;
}

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
            <Field
              id="nome" label="Como você quer ser chamado" value={name} onChange={setName}
              type="text" autoComplete="name" placeholder="Daniel"
            />
          )}

          <Field
            id="email" label="E-mail" value={email} onChange={setEmail}
            type="email" autoComplete="email" placeholder="voce@exemplo.com.br" required
          />

          <Field
            id="senha" label="Senha" value={password} onChange={setPassword}
            type="password"
            autoComplete={signup ? 'new-password' : 'current-password'}
            hint={signup ? `Pelo menos ${MIN_PASSWORD} caracteres.` : undefined}
            required
          />

          {error && (
            <p role="alert"
               className="font-ui text-[13.5px] leading-relaxed text-[var(--ember)]
                          bg-[var(--ember-wash)] rounded-[var(--r-md)] px-4 py-3">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" full disabled={busy}>
            {busy ? (signup ? 'Criando…' : 'Entrando…') : (signup ? 'Criar conta' : 'Entrar')}
          </Button>
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

      {!signup && (
        <p className="font-ui text-[12.5px] text-center leading-relaxed text-ink-muted">
          Esqueceu a senha? Escreva para{' '}
          <a href="mailto:contato@hebraicofluente.com.br"
             className="text-[var(--accent)] hover:underline">
            contato@hebraicofluente.com.br
          </a>{' '}
          - a recuperação automática ainda não está no ar, e a gente resolve na mão.
        </p>
      )}
    </div>
  );
}

function Field({
  id, label, value, onChange, type, autoComplete, placeholder, hint, required
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  type: 'text' | 'email' | 'password'; autoComplete: string;
  placeholder?: string; hint?: string; required?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id}
             className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="min-h-[52px] px-4 rounded-[var(--r-md)] border-2 border-line bg-surface
                   font-ui text-[16px] text-ink placeholder:text-ink-muted
                   focus:border-[var(--accent-soft)] focus:outline-none"
      />
      {hint && (
        <p id={`${id}-hint`} className="font-ui text-[12.5px] text-ink-muted">{hint}</p>
      )}
    </div>
  );
}
