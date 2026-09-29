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
 * O QUE ESTE PORTÃO É, E O QUE NÃO É
 *
 * Ele é do lado do cliente, e portanto não é controle de acesso: é um portão
 * de PRODUTO, que evita entrar por engano e dá o caminho certo a quem não
 * comprou. O controle de verdade tem duas metades, e desde 20/09/2026 as
 * duas existem:
 *
 *   · o Worker recusa as ROTAS pagas sem cookie de sessão (worker/gate.js);
 *   · e o conteúdo saiu do pacote para trás de `/api/content`
 *     (worker/src/api/content.js), que é o que realmente resolve - antes
 *     disso o material de ensino viajava no JavaScript que a home carregava,
 *     e um `curl` o levava inteiro.
 *
 * ── a quarta espera ──────────────────────────────────────────────────────
 * Como o conteúdo agora chega pela rede, este portão ganhou mais um estado,
 * e ele entra ANTES de renderizar a aula: buscar o conteúdo e esperar. É
 * aqui porque aqui é o único lugar por onde toda rota paga passa - a
 * alternativa era um `if (carregou)` em vinte telas, e a vigésima primeira
 * esqueceria.
 */

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Card, Skeleton } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { useAccount } from '@/lib/account/store';
import { FLAGSHIP, flagship } from '@/lib/catalog';
import { carregarConteudo, conteudoPronto } from '@/lib/content';
import { AvisoDeDireitos, MarcaDagua } from '@/components/shell/MarcaDagua';

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

  /* O conteúdo do curso, buscado uma vez por sessão do navegador. `pronto`
     começa consultando o depósito porque uma segunda tela montando depois da
     primeira não deve esperar de novo - o dado já está na memória. */
  const [conteudo, setConteudo] = useState<'pronto' | 'buscando' | 'falhou'>(
    () => (conteudoPronto() ? 'pronto' : 'buscando')
  );

  useEffect(() => {
    if (!account.ready || allowed) return;
    if (!account.signedIn) {
      router.replace(`/entrar?next=${encodeURIComponent(here)}`);
    } else {
      router.replace(`/cursos/${FLAGSHIP}`);
    }
  }, [account.ready, account.signedIn, allowed, here, router]);

  /* Só busca depois de saber que pode, e só onde o conteúdo é preciso.
     ──────────────────────────────────────────────────────────────────────
     Pedir antes de a sessão responder gastaria uma recusa do servidor em toda
     visita deslogada. E /perfil é rota de CONTA, não de curso: quem entrou e
     ainda não comprou tem acesso legítimo a ela, e buscar o conteúdo ali
     receberia o 403 correto do servidor - transformando a página da conta
     dele num "não consegui carregar a aula". */
  useEffect(() => {
    if (!allowed || !needsPurchase || conteudo === 'pronto') return;
    let vivo = true;
    carregarConteudo()
      .then(() => { if (vivo) setConteudo('pronto'); })
      .catch(() => { if (vivo) setConteudo('falhou'); });
    return () => { vivo = false; };
  }, [allowed, needsPurchase, conteudo]);

  if (!account.ready) return <GateSkeleton />;

  if (allowed) {
    if (!needsPurchase) return <>{children}</>;
    /* A marca d'água só onde há aula: nas rotas pagas, com o conteúdo na
       mão (components/shell/MarcaDagua.tsx). */
    if (conteudo === 'pronto') return <>{children}<AvisoDeDireitos /><MarcaDagua /></>;
    if (conteudo === 'buscando') return <GateSkeleton />;
    /* Falhou. Não é "sem acesso" - é rede, ou o servidor fora do ar por um
       instante. Dizer a coisa certa aqui importa: "entre para continuar"
       para quem já entrou e já pagou é a mensagem que gera o chamado de
       suporte mais caro que existe. */
    return (
      <div className="focus-col grid gap-5 py-6">
        <Card className="p-6 grid gap-3">
          <h1 className="font-display text-[20px] font-bold text-ink">
            Não consegui carregar a aula.
          </h1>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
            Seu acesso está em dia - o que falhou foi buscar o conteúdo. Quase
            sempre é a conexão.
          </p>
          <button
            type="button"
            onClick={() => setConteudo('buscando')}
            className="justify-self-start rounded-[var(--r-md)] bg-[var(--navy)] text-white
                       font-ui font-semibold text-[15px] px-5 py-2.5 hover:bg-[var(--navy-2)]"
          >
            Tentar de novo
          </button>
        </Card>
      </div>
    );
  }

  /* O redirect já foi disparado; isto é o que se vê no intervalo de um quadro
     - e o que fica na tela se o roteador falhar. Por isso tem link, e não um
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
