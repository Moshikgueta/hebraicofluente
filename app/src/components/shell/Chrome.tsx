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
  '/metodo', '/cursos', '/sobre', '/faq',
  '/entrar', '/criar-conta', '/recuperar',
  /* O checkout é público de propósito: quem chega por um link de venda
     precisa ver o preço antes de ter conta. Quem paga tem de estar logado, e
     essa exigência é da própria tela, não do portão. */
  '/checkout',
  /* As páginas de confiança são públicas por definição: uma Política de
     Privacidade que exige login não informa o visitante, informa o cliente -
     e é justamente o visitante que precisa dela para decidir comprar. O
     mesmo vale para o atendimento: quem não consegue entrar é exatamente
     quem mais precisa escrever. */
  '/termos', '/privacidade', '/reembolso', '/suporte'
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
