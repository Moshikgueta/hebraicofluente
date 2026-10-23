'use client';

/* O botão que leva ao curso de hebraico, nas páginas do portal (23/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * As páginas de jornada são de servidor e não sabem quem está olhando. Este
 * pedaço sabe: para quem já tem o curso, "Conhecer o curso" vira o próximo
 * passo dele (lib/cta.ts), e nunca uma oferta do que já comprou. Antes de a
 * sessão responder, mostra o rótulo de visitante, que é o do HTML estático.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAccount } from '@/lib/account/store';
import { FLAGSHIP, PAGINA_DO_CURSO } from '@/lib/catalog';
import { proximoPasso } from '@/lib/cta';

export function BotaoDoCurso({ href, children, className }: {
  href: string; children: ReactNode; className: string;
}) {
  const account = useAccount();
  const vaiAoCurso = (href.split(/[?#]/)[0] ?? '').replace(/\/+$/, '') === PAGINA_DO_CURSO;
  if (vaiAoCurso && account.ready && account.can(FLAGSHIP)) {
    const passo = proximoPasso(account);
    return (
      <Link href={passo.href} className={className}>
        {passo.label}
        <span aria-hidden>→</span>
      </Link>
    );
  }
  return <Link href={href} className={className}>{children}</Link>;
}
