'use client';

/* O progresso do aluno só onde ele é usado (23/10/2026, velocidade no celular).
 * ─────────────────────────────────────────────────────────────────────────
 * O ProgressProvider morava no layout raiz e, com ele, o estado inteiro do
 * curso (regras, conquistas, loja, rodadas, sincronização) ia no JavaScript
 * de toda página. Na capa e na página de venda nada disso aparece, e era esse
 * código rodando antes da primeira pintura que deixava o celular esperando.
 *
 * Nas rotas leves (lib/rotas.ts) ele não monta e o pedaço não é baixado. Uma
 * vez montado, não desmonta mais: ir do curso para a capa não pode jogar fora
 * uma gravação que ainda está na fila, nem perder o aviso de quem sai da conta.
 * Sair da conta antes de ele ter montado (não há botão de sair nas rotas leves,
 * mas o aviso é do window) ainda faz o aparelho esquecer o estudo. */

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import type { ProgressProvider as Provider } from '@/lib/state/store';
import { SESSAO_MUDOU } from '@/lib/account/store';
import { rotaLeve } from '@/lib/rotas';

const ProgressProvider = dynamic(() => import('@/lib/state/store').then(m => m.ProgressProvider));

export function ProgressoQuandoPrecisa({ children, ...props }: ComponentProps<typeof Provider> & { children: ReactNode }) {
  const pathname = usePathname();
  const montou = useRef(false);
  if (!rotaLeve(pathname)) montou.current = true;
  const precisa = montou.current;

  useEffect(() => {
    if (precisa) return;
    const aoMudar = (e: Event) => {
      if (!(e as CustomEvent<{ saiu?: boolean }>).detail?.saiu || montou.current) return;
      void import('@/lib/state/store').then(m => m.esquecerProgressoDoAparelho());
    };
    window.addEventListener(SESSAO_MUDOU, aoMudar);
    return () => window.removeEventListener(SESSAO_MUDOU, aoMudar);
  }, [precisa]);

  if (!precisa) return <>{children}</>;
  return <ProgressProvider {...props}>{children}</ProgressProvider>;
}
