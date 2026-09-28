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
import { isPublicRoute } from '@/lib/rotas';

export { isAppRoute, isPublicRoute } from '@/lib/rotas';

export function Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  /* O painel do dono do curso (/admin): sem a casca do curso e sem o
     portão de compra. Quem decide o acesso é a API, pela conta de
     administrador - ver worker/src/api/audio.js. */
  if (/^\/admin(\/|$)/.test(pathname ?? '')) return <>{children}</>;

  if (isPublicRoute(pathname)) {
    return <PublicShell>{children}</PublicShell>;
  }

  return (
    <AppShell>
      <CourseGate>{children}</CourseGate>
    </AppShell>
  );
}
