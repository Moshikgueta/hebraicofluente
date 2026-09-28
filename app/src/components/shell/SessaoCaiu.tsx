'use client';

/* A sessão terminou no meio do estudo.
 * ─────────────────────────────────────────────────────────────────────────
 * O cookie de sessão vale sete dias e cai também quando a senha é trocada
 * em outro aparelho. Até 28/09/2026 isso era silencioso: o envio do
 * progresso recebia 401, parava de sincronizar, e a navegação seguia
 * funcionando do cache - a pessoa estudava achando que estava salvando na
 * conta (auditoria, QA-004). O progresso não se perde (fica no aparelho e é
 * fundido com a conta no próximo login), mas ela precisa saber.
 *
 * Quem avisa é lib/state/worker.ts, com o evento SESSAO_CAIU; este aviso fica
 * até a pessoa entrar de novo.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SESSAO_CAIU } from '@/lib/state/worker';

export function SessaoCaiu() {
  const [caiu, setCaiu] = useState(false);
  const pathname = usePathname() || '/';
  useEffect(() => {
    const aoCair = () => setCaiu(true);
    window.addEventListener(SESSAO_CAIU, aoCair);
    return () => window.removeEventListener(SESSAO_CAIU, aoCair);
  }, []);
  if (!caiu) return null;
  return (
    <div role="alert"
         className="border-b border-[color:var(--amber-line,var(--line-soft))] bg-[var(--amber-wash)]">
      <p className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-2.5
                    font-ui text-[13.5px] leading-relaxed text-ink-body m-0">
        <strong className="font-semibold">Sua sessão terminou.</strong>{' '}
        O que você fizer agora fica salvo só neste aparelho, até você entrar de novo.{' '}
        <Link href={`/entrar?next=${encodeURIComponent(pathname)}`}
              className="font-semibold text-[var(--accent)] hover:underline">
          Entrar de novo
        </Link>
      </p>
    </div>
  );
}
