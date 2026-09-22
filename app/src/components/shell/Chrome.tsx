'use client';

/* Qual casca envolve esta rota.
 * ─────────────────────────────────────────────────────────────────────────
 * Duas: o site público (PublicShell - cabeçalho de marketing, rodapé) e a
 * plataforma do aluno (AppShell - navegação do curso, progresso, barra do
 * polegar). O que decide é a rota, e a decisão é escrita uma vez aqui em vez
 * de ser repetida em cada layout de pasta.
 *
 * A lista é de rotas PÚBLICAS, e tudo que não está nela é do aluno. A ordem
 * importa: a lista errada num sistema de portão deixa uma porta aberta, e é
 * melhor que a falha seja "pedi login onde não precisava" do que "entreguei o
 * curso para quem não comprou".
 */

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { PublicShell } from '@/components/shell/PublicShell';
import { CourseGate } from '@/components/shell/CourseGate';

/** Prefixos públicos. `/` é tratado à parte, senão casaria com tudo. */
const PUBLIC_PREFIXES = [
  '/metodo', '/cursos', '/sobre', '/faq', '/biblia',
  /* As telas de conta, incluindo as duas de recuperação de senha. Elas são
     públicas pela definição do problema: quem não consegue entrar não pode
     ter de entrar para voltar a entrar. (`/recuperar` estava nesta lista e
     nunca existiu como página - virou estas duas.) */
  '/entrar', '/criar-conta', '/esqueci-senha', '/nova-senha',
  /* O checkout é público de propósito: quem chega por um link de venda
     precisa ver o preço antes de ter conta. Quem paga tem de estar logado, e
     essa exigência é da própria tela, não do portão. */
  '/checkout',
  /* As páginas de confiança são públicas por definição: uma Política de
     Privacidade que exige login não informa o visitante, informa o cliente -
     e é justamente o visitante que precisa dela para decidir comprar. O
     mesmo vale para o atendimento: quem não consegue entrar é exatamente
     quem mais precisa escrever. */
  '/termos', '/privacidade', '/reembolso', '/suporte',
  /* A confirmação de que a conta foi apagada.
     ──────────────────────────────────────────────────────────────────────
     Pública por necessidade, e não por conveniência: quem chega nela acabou
     de deixar de ter conta. A primeira versão mostrava a confirmação dentro
     do próprio /perfil, e ela nunca aparecia - o CourseGate via a sessão
     sumir e mandava a pessoa para /entrar no mesmo instante. O sintoma era o
     pior possível justamente nesta operação: a tela pulava para a página de
     vendas sem dizer nada, e a pessoa ficava sem saber se a conta dela tinha
     sido apagada ou não. Encontrado no navegador, e não nos testes, porque
     no teste a exclusão é uma chamada - na tela ela é uma chamada seguida de
     um portão. */
  '/conta-apagada'
] as const;

export function isPublicRoute(pathname: string | null): boolean {
  const p = (pathname ?? '/').replace(/\/+$/, '') || '/';
  if (p === '/') return true;
  return PUBLIC_PREFIXES.some(prefix => p === prefix || p.startsWith(`${prefix}/`));
}

export function Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isPublicRoute(pathname)) {
    return <PublicShell>{children}</PublicShell>;
  }

  return (
    <AppShell>
      <CourseGate>{children}</CourseGate>
    </AppShell>
  );
}
