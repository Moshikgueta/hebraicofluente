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

import { usePathname, useSelectedLayoutSegments } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { PublicShell } from '@/components/shell/PublicShell';
import { CourseGate } from '@/components/shell/CourseGate';
import { RaizesShell } from '@/components/raizes/RaizesShell';
import { rotaDasRaizes } from '@/lib/raizes';
import { isPublicRoute } from '@/lib/rotas';
import { useAccount } from '@/lib/account/store';
import { FLAGSHIP } from '@/lib/catalog';

export { isAppRoute, isPublicRoute } from '@/lib/rotas';

export function Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const account = useAccount();
  const segmentos = useSelectedLayoutSegments();
  const semCurso = account.ready && account.signedIn && !account.can(FLAGSHIP);

  /* O painel do dono do curso (/admin): sem a casca do curso e sem o
     portão de compra. Quem decide o acesso é a API, pela conta de
     administrador - ver worker/src/api/audio.js. */
  if (/^\/admin(\/|$)/.test(pathname ?? '')) return <>{children}</>;

  /* A página 404 (auditoria de 01/10/2026, UXQA-017). O 404.html é gerado
     UMA vez, com a casca pública; o Worker o serve para qualquer endereço
     que não existe, inclusive /licao/nao-existe. Decidindo pela URL, o
     navegador do aluno montava a casca do aluno sobre um HTML de casca
     pública e o React acusava a hidratação divergente (#418). O segmento
     é o mesmo no servidor e no navegador: a 404 fica sempre na pública. */
  if (segmentos[0] === '_not-found' || isPublicRoute(pathname)) {
    return <PublicShell>{children}</PublicShell>;
  }

  /* Conta sem curso em /perfil: a casca pública (auditoria de 01/10/2026,
     UXQA-007). Inclui quem pagou por PIX e espera a confirmação. A casca do
     aluno mostrava "0 XP" e sete destinos, e cada um deles voltava à página
     de vendas - um laço sem saída, com o preço na frente. Enquanto a sessão
     não responde, fica a do aluno (o caso comum é quem tem o curso). */
  if ((pathname ?? '').replace(/\/+$/, '') === '/perfil' && semCurso) {
    return <PublicShell>{children}</PublicShell>;
  }

  /* Raízes Sefarditas (22/10/2026): produto individual, comprado à parte.
     Casca própria, sem a navegação nem o XP do curso de hebraico; o portão é
     o mesmo, com o direito raizes-sefarditas. */
  if (rotaDasRaizes(pathname)) {
    return (
      <RaizesShell>
        <CourseGate>{children}</CourseGate>
      </RaizesShell>
    );
  }

  return (
    <AppShell>
      <CourseGate>{children}</CourseGate>
    </AppShell>
  );
}
