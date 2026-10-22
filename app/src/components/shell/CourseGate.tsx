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
import { FLAGSHIP, getCourse } from '@/lib/catalog';
import { carregarConteudo, conteudoPronto } from '@/lib/content';
import { CURSO_A1, a1Pronto, carregarA1, rotaDoA1 } from '@/lib/a1';
import { CURSO_RAIZES, carregarRaizes, raizesPronto, rotaDasRaizes } from '@/lib/raizes';
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
  /* Qual curso esta rota pede (06/10/2026, com o A1): /a1 é do A1, o resto
     do alfabeto - a mesma divisão do portão do servidor (worker/src/gate.js).
     Cada curso tem o seu depósito de conteúdo e a sua rota de busca. */
  const doA1 = rotaDoA1(here);
  /* Raízes Sefarditas (21/10/2026): um terceiro produto, com o seu direito,
     o seu depósito e a sua rota de busca, como o A1. */
  const dasRaizes = rotaDasRaizes(here);
  const produto = dasRaizes ? 'raizes' : doA1 ? 'a1' : 'alfabeto';
  const curso = dasRaizes ? CURSO_RAIZES : doA1 ? CURSO_A1 : FLAGSHIP;
  const pronto = dasRaizes ? raizesPronto : doA1 ? a1Pronto : conteudoPronto;
  const carregar = dasRaizes ? carregarRaizes : doA1 ? carregarA1 : carregarConteudo;
  /* Sem página de venda (não está no catálogo): quem não tem o direito vai
     para a lista de cursos, como no portão do servidor. */
  const paginaDoCurso = dasRaizes ? '/cursos' : `/cursos/${curso}?${PARAM_SEM_ACESSO}=1`;
  const allowed = account.signedIn && (!needsPurchase || account.can(curso));

  /* O conteúdo do curso, buscado uma vez por sessão do navegador. `pronto`
     começa consultando o depósito porque uma segunda tela montando depois da
     primeira não deve esperar de novo - o dado já está na memória. */
  const [conteudo, setConteudo] = useState<'pronto' | 'buscando' | 'falhou'>(
    () => (pronto() ? 'pronto' : 'buscando')
  );
  /* Navegar de uma rota do alfabeto para uma do A1 (ou o contrário) troca o
     depósito: o estado de "pronto" é o do curso desta rota. */
  useEffect(() => { setConteudo(pronto() ? 'pronto' : 'buscando'); }, [produto]);

  useEffect(() => {
    if (!account.ready || allowed) return;
    if (!account.signedIn) {
      router.replace(`/entrar?next=${encodeURIComponent(here)}`);
    } else {
      router.replace(paginaDoCurso);
    }
  }, [account.ready, account.signedIn, allowed, here, router, paginaDoCurso]);

  /* A busca do conteúdo começa JÁ, em paralelo com /api/me (auditoria de
     01/10/2026, PERF-004). Numa rota paga o HTML só saiu do Worker depois de
     o portão conferir sessão e direito (worker/src/gate.js), então esperar
     o /api/me para pedir o curso era uma ida e volta a mais em toda primeira
     tela do dia - em 3G, mais de um segundo de esqueleto. Se a sessão
     disser que não, a recusa do servidor é engolida aqui: nada se mostra
     sem `allowed`, e o efeito abaixo pede de novo quando puder. */
  useEffect(() => {
    if (needsPurchase && !pronto()) carregar().catch(() => {});
  }, []);

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
    carregar()
      .then(() => { if (vivo) setConteudo('pronto'); })
      .catch(() => { if (vivo) setConteudo('falhou'); });
    return () => { vivo = false; };
  }, [allowed, needsPurchase, conteudo, carregar]);

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
            ? (dasRaizes
              ? 'Raízes Sefarditas ainda não está à venda. Ele aparece aqui quando o acesso for liberado na sua conta.'
              : `O ${getCourse(curso)?.titlePt ?? ''} é liberado assim que o pagamento é confirmado.`)
            : 'Suas aulas, seu progresso e seu certificado ficam na sua conta.'}
        </p>
        <LinkButton
          href={account.signedIn ? paginaDoCurso : `/entrar?next=${encodeURIComponent(here)}`}
          className="justify-self-start"
        >
          {account.signedIn ? 'Ver o curso' : 'Entrar'}
        </LinkButton>
      </Card>
    </div>
  );
}

/* O ponto de extensão da página do curso (auditoria de 01/10/2026,
   UXQA-007). Quem chega lá vindo de uma rota de aluno SEM o curso traz
   `?sem-acesso=1`, e a página pode pôr o aviso "esta conta ainda não tem o
   curso, não pague de novo" ACIMA do preço também para conta nova. A página
   do curso é de outra frente: ela só precisa chamar `veioSemAcesso()`.
   O 302 do Worker (gate.js) ainda não leva o parâmetro. */
export const PARAM_SEM_ACESSO = 'sem-acesso';
export function veioSemAcesso(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get(PARAM_SEM_ACESSO) === '1';
}

/* Altura reservada (PERF-004): o esqueleto ocupa a tela inteira abaixo do
   cabeçalho, para o rodapé de ajuda não aparecer no meio dela e depois
   descer quando a aula entra (era o CLS de 0,1 da lição). */
function GateSkeleton() {
  return (
    <div className="grid gap-6 py-6 content-start min-h-[calc(100dvh-60px)]" aria-busy="true">
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-[132px] w-full rounded-[var(--r-lg)]" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Skeleton className="h-[148px] rounded-[var(--r-lg)]" />
        <Skeleton className="h-[148px] rounded-[var(--r-lg)]" />
      </div>
    </div>
  );
}
