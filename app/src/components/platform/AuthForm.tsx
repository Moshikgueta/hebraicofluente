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
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
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

/** O aviso de quem foi mandado ao login pelo portão (worker/src/gate.js),
 *  pelo `?motivo=`. Só os motivos conhecidos têm texto; o resto não mostra
 *  nada. */
export const MOTIVOS: Record<string, string> = {
  /* UXQA-006: a quarta entrada da conta derrubou este aparelho
     (worker/src/lib/aparelhos.js). Sem isto ele caía no login sem saber por quê. */
  aparelhos: 'Você entrou em outro aparelho e esta sessão foi encerrada. ' +
    'O limite é de 3 aparelhos ao mesmo tempo.'
};

export function AuthForm({ mode, nivelDoTitulo = 'h1', voltarAqui = false }: {
  mode: 'signin' | 'signup';
  /** No checkout o título da página é o do passo, e este vira h2 (VIS-012). */
  nivelDoTitulo?: 'h1' | 'h2';
  /** Depois de criar a conta ou entrar, volta para a página em que o
   *  formulário está, em vez do `?next=`. É o checkout: sem isto, quem criava
   *  a conta no meio da compra ia para o painel, o portão o devolvia à página
   *  de venda, e a compra recomeçava do zero (growth, 23/10/2026). */
  voltarAqui?: boolean;
}) {
  const account = useAccount();
  const router = useRouter();
  /* `?next=` e `?motivo=` lidos depois da montagem, e não com
     `useSearchParams` (auditoria de 01/10/2026, PERF-003). O hook obrigava um
     <Suspense fallback={null}>, e o export estático saía com o <main> VAZIO:
     o formulário só nascia depois de baixar e hidratar o JavaScript, e o
     rodapé pulava quando ele entrava (CLS 0,59 em 3G). Agora o HTML já traz
     o formulário inteiro; a URL só decide para onde voltar e se há aviso. */
  const [busca, setBusca] = useState<URLSearchParams | null>(null);
  const [aqui, setAqui] = useState<string | null>(null);
  useEffect(() => {
    setBusca(new URLSearchParams(window.location.search));
    setAqui(window.location.pathname + window.location.search);
  }, []);
  const next = safeNext(voltarAqui ? aqui : busca?.get('next') ?? null);
  const motivo = MOTIVOS[busca?.get('motivo') ?? ''];
  const Titulo = nivelDoTitulo;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [aceite, setAceite] = useState(false);

  const signup = mode === 'signup';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (!emailLooksValid(email)) { setError(MESSAGES['invalid-email']); return; }
    if (signup && !passwordOk(password)) { setError(MESSAGES['weak-password']); return; }
    if (signup && !aceite) { setError(MESSAGES.termos); return; }

    setBusy(true);
    try {
      if (signup) await account.signUp({ name, email, password, aceitouTermos: aceite, declarouIdade: aceite });
      else await account.signIn({ email, password });
      router.replace(safeNext(voltarAqui
        ? window.location.pathname + window.location.search
        : new URLSearchParams(window.location.search).get('next')));
    } catch (err) {
      setError(err instanceof AuthError ? err.message : MESSAGES.server);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[460px] px-4 sm:px-6 py-12 sm:py-16 grid gap-6">
      <header className="grid gap-3 justify-items-center text-center">
        <He size="lg" dim>ע</He>
        <Titulo className="font-display text-[27px] sm:text-[31px] font-bold leading-tight text-ink">
          {signup ? 'Criar sua conta' : 'Entrar'}
        </Titulo>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-muted max-w-[38ch]">
          {signup
            ? 'Seus cursos, seu progresso e seu certificado ficam todos aqui.'
            : 'Bem-vindo de volta. Vamos continuar seu hebraico?'}
        </p>
      </header>

      {motivo && (
        <Card tone="ember" className="p-4">
          <p role="status" className="font-ui text-[14px] leading-relaxed text-[var(--gold-body)] m-0">
            {motivo}
          </p>
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={submit} className="grid gap-4" noValidate>
          {signup && (
            <Campo
              id="nome" label="Como você quer ser chamado" value={name} onChange={setName}
              type="text" autoComplete="name" placeholder="ex.: Daniel"
            />
          )}

          <Campo
            id="email" label="E-mail" value={email} onChange={setEmail} erroId={error ? 'auth-erro' : undefined}
            type="email" autoComplete="email" placeholder="ex.: voce@exemplo.com.br" required
            /* No cadastro, um e-mail errado custa o recibo e o link de senha, e
               o site não deixa trocar sozinho (auditoria, OPS-001). */
            hint={signup ? 'Confira com cuidado: é para ele que vão o recibo da compra e o link de senha.' : undefined}
          />

          <Campo
            id="senha" label="Senha" value={password} onChange={setPassword} erroId={error ? 'auth-erro' : undefined}
            type="password"
            autoComplete={signup ? 'new-password' : 'current-password'}
            hint={signup ? `Pelo menos ${MIN_PASSWORD} caracteres.` : undefined}
            required
          />

          {/* O aceite dos Termos (30/09/2026, pedido do dono): uma caixa que a
              pessoa marca, e não mais uma frase que ela nem lê. Começa
              desmarcada e o servidor confere de novo (api/auth.js). Os links
              abrem em outra aba, para não perder o que já foi digitado. A
              Privacidade é só informada: a base legal dela não é aceite. */}
          {signup && (
            <div className="grid gap-2">
              <label className="flex items-start gap-3 font-ui text-[14.5px] leading-relaxed text-ink cursor-pointer">
                <input id="aceite-termos" type="checkbox" checked={aceite} onChange={e => setAceite(e.target.checked)}
                       aria-describedby={error === MESSAGES.termos ? 'auth-erro' : undefined}
                       aria-invalid={error === MESSAGES.termos || undefined}
                       className="w-5 h-5 mt-0.5 shrink-0 accent-[var(--accent)]" />
                <span>
                  {/* A declaração de idade mora SÓ nos Termos, art. 3 (pedido do
                      dono, 30/09/2026): aceitar os Termos é fazê-la. A caixa não a
                      repete; o servidor continua gravando os registros termos e idade. */}
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank" rel="noopener" className="text-[var(--accent)] underline underline-offset-2">
                    Termos de Uso
                  </Link>.
                </span>
              </label>
              <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted m-0">
                Como tratamos os seus dados:{' '}
                <Link href="/privacidade" target="_blank" rel="noopener" className="text-[var(--accent)] hover:underline">
                  Política de Privacidade
                </Link>.
              </p>
            </div>
          )}

          {error && <Erro id="auth-erro">{error}</Erro>}

          <Button type="submit" size="lg" full disabled={busy}>
            {busy ? (signup ? 'Criando…' : 'Entrando…') : (signup ? 'Criar conta' : 'Entrar')}
          </Button>


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
            <Link href="/curso-de-hebraico"
                  className="text-[var(--accent)] font-medium hover:underline">
              Ver o curso
            </Link>
          </>
        )}
      </p>

    </div>
  );
}
