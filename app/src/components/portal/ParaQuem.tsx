'use client';

/* O que muda na capa para quem já é aluno (26/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * A capa é montada no servidor; só estas ilhas leem a sessão. O servidor
 * desenha o lado do visitante (a sessão ainda não chegou), e quem tem o curso
 * vê o seu lado assim que `/api/me` responde: a volta ao curso no lugar da
 * oferta do que já comprou (lib/cta.ts). */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAccount } from '@/lib/account/store';
import { FLAGSHIP } from '@/lib/catalog';
import { proximoPasso } from '@/lib/cta';

export function ParaQuem({ aluno, visitante }: { aluno: ReactNode; visitante: ReactNode }) {
  const account = useAccount();
  return <>{account.ready && account.can(FLAGSHIP) ? aluno : visitante}</>;
}

/** "Continuar de onde parei": o destino e o texto vêm do progresso da conta. */
export function BotaoContinuar({ className }: { className: string }) {
  const passo = proximoPasso(useAccount());
  return <Link href={passo.href} className={className}>{passo.label}</Link>;
}
