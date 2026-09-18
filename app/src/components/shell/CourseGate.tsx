'use client';

/* O portão.
 * ─────────────────────────────────────────────────────────────────────────
 * Toda rota de aluno passa por aqui. Três estados, nesta ordem, e a ordem é
 * a coisa mais importante do arquivo:
 *
 *   1. Ainda não sei  → espera. Enquanto /api/me não responde, a resposta
 *      certa não é "não está logado". Confundir as duas manda para a tela de
 *      vendas quem já pagou, toda vez que recarrega a página. É o bug mais
 *      caro que uma plataforma de curso pode ter e ele é sempre este.
 *   2. Não entrou     → /entrar, guardando para onde ele queria ir.
 *   3. Entrou mas não comprou → a página do curso, que é onde ele decide.
 *
 * ────────────────────────────────────────────────────────────────────────
 * O QUE ESTE PORTÃO NÃO É
 *
 * Ele é do lado do cliente. Na build estática de hoje, o conteúdo do curso
 * está DENTRO do pacote JavaScript que o navegador baixa: quem souber abrir
 * as ferramentas de desenvolvedor lê tudo sem pagar. Isto é um portão de
 * produto — evita que alguém entre por engano e dá o caminho certo a quem
 * não comprou —, não um controle de acesso.
 *
 * O controle de verdade tem duas metades e as duas estão planejadas:
 *   · o Worker recusa as ROTAS pagas sem cookie de sessão (worker/, §2);
 *   · e o conteúdo sai do pacote para trás de /api/content/* (ARCHITECTURE
 *     §11.4), que é o que realmente resolve.
 * Enquanto a segunda não existir, esta limitação está escrita aqui e no
 * README em vez de ficar implícita.
 */

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Card, Skeleton } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { useAccount } from '@/lib/account/store';
import { FLAGSHIP, flagship } from '@/lib/catalog';

/** Rotas de aluno que não exigem compra: a conta, e nada mais. */
const FREE_FOR_ACCOUNT = ['/perfil'];

const norm = (s: string | null) => (s ?? '/').replace(/\/+$/, '') || '/';

export function CourseGate({ children }: { children: ReactNode }) {
  const account = useAccount();
  const router = useRouter();
  const pathname = usePathname();

  const here = norm(pathname);
  const needsPurchase = !FREE_FOR_ACCOUNT.includes(here);
  const allowed = account.signedIn && (!needsPurchase || account.can(FLAGSHIP));

  useEffect(() => {
    if (!account.ready || allowed) return;
    if (!account.signedIn) {
      router.replace(`/entrar?next=${encodeURIComponent(here)}`);
    } else {
      router.replace(`/cursos/${FLAGSHIP}`);
    }
  }, [account.ready, account.signedIn, allowed, here, router]);

  if (!account.ready) return <GateSkeleton />;
  if (allowed) return <>{children}</>;

  /* O redirect já foi disparado; isto é o que se vê no intervalo de um quadro
     — e o que fica na tela se o roteador falhar. Por isso tem link, e não um
     "carregando" eterno. */
  return (
    <div className="focus-col grid gap-5 py-6">
      <Card className="p-6 grid gap-3">
        <h1 className="font-display text-[20px] font-bold text-ink">
          {account.signedIn ? 'Este curso ainda não está na sua conta.' : 'Entre para continuar.'}
        </h1>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
          {account.signedIn
            ? `O ${flagship().titlePt} é liberado assim que o pagamento é confirmado.`
            : 'Suas aulas, seu progresso e seu certificado ficam na sua conta.'}
        </p>
        <LinkButton
          href={account.signedIn ? `/cursos/${FLAGSHIP}` : `/entrar?next=${encodeURIComponent(here)}`}
          className="justify-self-start"
        >
          {account.signedIn ? 'Ver o curso' : 'Entrar'}
        </LinkButton>
      </Card>
    </div>
  );
}

function GateSkeleton() {
  return (
    <div className="grid gap-6 py-6" aria-busy="true">
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-[132px] w-full rounded-[var(--r-lg)]" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Skeleton className="h-[148px] rounded-[var(--r-lg)]" />
        <Skeleton className="h-[148px] rounded-[var(--r-lg)]" />
      </div>
    </div>
  );
}
