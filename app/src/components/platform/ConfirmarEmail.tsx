'use client';

/* Confirmar o e-mail, pelo link que chegou no cadastro.
 * ─────────────────────────────────────────────────────────────────────────
 * O link só confirma com a conta ABERTA neste navegador - e isso é o
 * desenho, não uma limitação. O e-mail de confirmação chega à dona do
 * endereço mesmo quando foi outra pessoa que criou a conta com ele; se o
 * clique bastasse, ela confirmaria, por reflexo, a conta de quem usou o
 * endereço dela. Sem a senha dessa pessoa ela não tem a sessão, e aqui só vê
 * "entre para confirmar".
 *
 * Com a sessão, a confirmação sai sozinha ao abrir a página: quem clicou no
 * link já disse o que queria. Leitor de e-mail que abre links para
 * pré-visualizar não roda JavaScript nem tem o cookie, então não confirma
 * nada no lugar da pessoa.
 *
 * Nada aqui bloqueia nada: a conta e a compra funcionam sem confirmar.
 */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Aviso, Erro } from '@/components/platform/Campo';
import { useAccount } from '@/lib/account/store';
import { AuthError, MESSAGES } from '@/lib/account/types';

type Estado = 'esperando' | 'confirmando' | 'confirmado' | 'recusado' | 'falhou';

export function ConfirmarEmail() {
  const account = useAccount();
  const token = useSearchParams().get('token') ?? '';
  const [estado, setEstado] = useState<Estado>('esperando');
  const [erro, setErro] = useState<string | null>(null);
  const tentou = useRef(false);

  useEffect(() => {
    if (!token || !account.ready || !account.signedIn || tentou.current) return;
    tentou.current = true;
    setEstado('confirmando');
    account.confirmEmail(token)
      .then(() => setEstado('confirmado'))
      .catch(e => {
        if (e instanceof AuthError && e.code === 'bad-token') { setEstado('recusado'); return; }
        setErro(e instanceof AuthError ? e.message : MESSAGES.server);
        setEstado('falhou');
      });
  }, [token, account]);

  const aqui = `/confirmar-email/?token=${encodeURIComponent(token)}`;

  return (
    <div className="mx-auto w-full max-w-[460px] px-4 sm:px-6 py-12 sm:py-16 grid gap-6">
      <header className="grid gap-3 justify-items-center text-center">
        <He size="lg" dim>א</He>
        <h1 className="font-display text-[27px] sm:text-[31px] font-bold leading-tight text-ink">
          Confirmar seu e-mail
        </h1>
      </header>

      <Card className="p-6 grid gap-4">
        {!token ? (
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
            Este endereço só funciona com o link que mandamos por e-mail. Se ele
            se perdeu, peça outro na página{' '}
            <Link href="/perfil" className="text-[var(--accent)] font-medium hover:underline">Sua conta</Link>.
          </p>
        ) : !account.ready || estado === 'confirmando' ? (
          <p className="font-ui text-[14.5px] text-ink-muted" role="status">Confirmando…</p>
        ) : !account.signedIn ? (
          <div className="grid gap-3">
            <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
              Para confirmar, entre na conta que foi criada com este e-mail. Depois
              de entrar, você volta para cá e a confirmação é feita na hora.
            </p>
            <LinkButton href={`/entrar?next=${encodeURIComponent(aqui)}`} size="lg" full>
              Entrar e confirmar
            </LinkButton>
            <p className="font-ui text-[13px] leading-relaxed text-ink-muted
                          border-t border-[color:var(--line-soft)] pt-3">
              Não foi você que criou esta conta? Então alguém usou o seu endereço.
              Você pode tomá-la de volta pedindo uma{' '}
              <Link href="/esqueci-senha" className="text-[var(--accent)] hover:underline">senha nova</Link>
              {' '}- o link chega só a você, e trocar a senha desconecta quem criou a conta.
            </p>
          </div>
        ) : estado === 'confirmado' ? (
          <div className="grid gap-3">
            <Aviso>Pronto: o e-mail {account.session?.account.email} está confirmado.</Aviso>
            <LinkButton href="/meu-hebraico" size="lg" full>Ir para o curso</LinkButton>
          </div>
        ) : estado === 'recusado' ? (
          <div className="grid gap-3">
            <Erro>
              Este link não vale para a conta aberta agora, ou já venceu - ele dura
              sete dias.
            </Erro>
            <p className="font-ui text-[14px] leading-relaxed text-ink-body">
              Se você entrou com outra conta, saia e entre com a conta deste e-mail.
              Se o link venceu, peça outro na página Sua conta.
            </p>
            <LinkButton href="/perfil" size="lg" full>Ir para Sua conta</LinkButton>
          </div>
        ) : estado === 'falhou' ? (
          <Erro>{erro}</Erro>
        ) : null}
      </Card>
    </div>
  );
}
