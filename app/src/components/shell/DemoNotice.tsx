'use client';

/* A tarja de demonstração.
 * ─────────────────────────────────────────────────────────────────────────
 * Aparece sempre que esta build não tem servidor - ou seja, quando contas e
 * pagamentos vivem só no localStorage deste navegador (lib/account/api.ts).
 *
 * É feia de propósito e não tem botão de fechar. A alternativa é um checkout
 * que parece ter funcionado, uma conta que parece existir e um acesso que
 * some quando o aluno troca de aparelho - e a pessoa descobre isso depois de
 * achar que pagou. Entre um aviso importuno e esse telefonema, o aviso.
 */

import { useAccount } from '@/lib/account/store';

export function DemoNotice() {
  const { demo } = useAccount();
  if (!demo) return null;
  return (
    <div role="note"
         className="border-b border-[color:var(--amber-line,var(--line-soft))] bg-[var(--amber-wash)]">
      <p className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-2.5
                    font-ui text-[12.5px] leading-relaxed text-ink-body">
        <strong className="font-semibold">Ambiente de demonstração.</strong>{' '}
        Esta versão não tem servidor: contas e pagamentos ficam só neste navegador,
        nada é cobrado e o acesso não vale em outro aparelho.
      </p>
    </div>
  );
}
