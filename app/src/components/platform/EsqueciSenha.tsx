'use client';

/* Esqueci minha senha.
 * ─────────────────────────────────────────────────────────────────────────
 * A tela mais fácil de escrever errado do produto inteiro, porque o que ela
 * PRECISA fazer contraria o que parece prestativo.
 *
 * Depois de enviar, ela diz "se existir uma conta com esse e-mail, o link
 * está a caminho" - e não "pronto, enviamos!" nem "não achamos esse e-mail".
 * Os dois últimos respondem, para qualquer pessoa e sem senha nenhuma, se um
 * endereço é cliente daqui. Num produto pago isso é uma lista de compradores
 * consultável de fora, e o servidor foi escrito para não entregá-la (ver a
 * nota em worker/src/api/auth.js). Uma tela mais simpática desfaria isso
 * sozinha.
 *
 * A confirmação também não some sozinha e traz o caminho humano ao lado: se o
 * e-mail não chegar, há um endereço de suporte ali, sem precisar voltar.
 */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Campo, Aviso, Erro } from '@/components/platform/Campo';
import { useAccount } from '@/lib/account/store';
import { empresa } from '@/lib/empresa';
import { AuthError, emailLooksValid, MESSAGES } from '@/lib/account/types';

export function EsqueciSenha() {
  const account = useAccount();
  const params = useSearchParams();

  /* Vem preenchido quando a pessoa chega do formulário de entrar. Digitar o
     e-mail de novo, logo depois de digitá-lo e errar a senha, é o tipo de
     atrito que faz desistir na tela de recuperação. */
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [demoLink, setDemoLink] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (!emailLooksValid(email)) { setError(MESSAGES['invalid-email']); return; }

    setBusy(true);
    try {
      const r = await account.requestPasswordReset(email);
      setDemoLink(r.demoLink ?? null);
      setEnviado(true);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : MESSAGES.server);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[460px] px-4 sm:px-6 py-12 sm:py-16 grid gap-6">
      <header className="grid gap-3 justify-items-center text-center">
        <He size="lg" dim>ע</He>
        <h1 className="font-display text-[27px] sm:text-[31px] font-bold leading-tight text-ink">
          Recuperar a senha
        </h1>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-muted max-w-[38ch]">
          {enviado
            ? 'Olhe sua caixa de entrada - e a pasta de spam, que é onde esse tipo de mensagem costuma cair.'
            : 'Diga seu e-mail e mandamos um link para você escolher uma senha nova.'}
        </p>
      </header>

      <Card className="p-6 grid gap-4">
        {enviado ? (
          <>
            <Aviso>
              Se existir uma conta com <strong>{email}</strong>, o link já está
              a caminho. Ele vale por uma hora e funciona uma vez só.
            </Aviso>

            {/* Só no modo demonstração, onde não há e-mail para mandar. A
                tarja de demonstração já está no topo da página; isto aqui é
                o link que ela não teria como entregar. */}
            {demoLink && (
              <div className="grid gap-2 rounded-[var(--r-md)] border-2 border-dashed
                              border-[color:var(--line-soft)] p-4">
                <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted">
                  Esta versão não manda e-mail de verdade. O link seria este:
                </p>
                <Link href={demoLink}
                      className="font-ui text-[14px] text-[var(--accent)] hover:underline break-all">
                  {demoLink}
                </Link>
              </div>
            )}

            <div className="grid gap-2">
              <Button variant="secondary" onClick={() => { setEnviado(false); setDemoLink(null); }}>
                Mandar de novo
              </Button>
              <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted">
                Não chegou em alguns minutos? Escreva para{' '}
                <a href={`mailto:${empresa.contato.emailSuporte}`}
                   className="text-[var(--accent)] hover:underline break-all">
                  {empresa.contato.emailSuporte}
                </a>{' '}
                que a gente resolve na mão.
              </p>
            </div>
          </>
        ) : (
          <form onSubmit={submit} className="grid gap-4" noValidate>
            <Campo
              id="email" label="E-mail" value={email} onChange={setEmail}
              type="email" autoComplete="email" placeholder="voce@exemplo.com.br"
              required autoFocus={!email}
            />

            {error && <Erro>{error}</Erro>}

            <Button type="submit" size="lg" full disabled={busy}>
              {busy ? 'Enviando…' : 'Mandar o link'}
            </Button>
          </form>
        )}
      </Card>

      <p className="font-ui text-[14px] text-center text-ink-muted">
        Lembrou?{' '}
        <Link href="/entrar" className="text-[var(--accent)] font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
