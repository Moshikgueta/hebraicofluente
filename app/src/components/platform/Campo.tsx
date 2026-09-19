'use client';

/* O campo de formulário das telas de conta.
 * ─────────────────────────────────────────────────────────────────────────
 * Entrar, criar conta, esqueci a senha, escolher a senha nova e trocar a
 * senha no perfil: cinco telas, o mesmo campo. Ele mora aqui porque a
 * alternativa é cinco cópias que divergem uma de cada vez - e a primeira a
 * divergir é sempre a altura do toque ou o `autoComplete`, que são
 * justamente as duas que quebram calado.
 *
 * Três detalhes que não são estilo:
 *
 *   · `text-[16px]` no input. Abaixo de 16 o Safari do iPhone dá zoom ao
 *     focar, e a página fica torta até a pessoa fechar o teclado.
 *   · 52px de altura. Alvo de toque confortável, acima dos 44 do mínimo.
 *   · `autoComplete` é obrigatório na assinatura, não opcional. Um formulário
 *     de senha sem ele é um formulário que o gerenciador de senhas não
 *     preenche - e quem usa gerenciador é exatamente quem tem senha boa.
 */

import type { ReactNode } from 'react';

export type CampoProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: 'text' | 'email' | 'password';
  autoComplete: string;
  placeholder?: string;
  hint?: ReactNode;
  required?: boolean;
  /** Foca ao montar. Para a tela que tem um campo só e um propósito só. */
  autoFocus?: boolean;
};

export function Campo({
  id, label, value, onChange, type, autoComplete,
  placeholder, hint, required, autoFocus
}: CampoProps) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id}
             className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={e => onChange(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="min-h-[52px] px-4 rounded-[var(--r-md)] border-2 border-line bg-surface
                   font-ui text-[16px] text-ink placeholder:text-ink-muted
                   focus:border-[var(--accent-soft)] focus:outline-none"
      />
      {hint && (
        <p id={`${id}-hint`} className="font-ui text-[12.5px] leading-relaxed text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * O recado de erro dos formulários de conta.
 *
 * `role="alert"` para que o leitor de tela anuncie sem que a pessoa precise
 * procurar, e sempre perto do botão - um erro no topo de um formulário rolado
 * é um erro que ninguém vê.
 */
export const Erro = ({ children }: { children: ReactNode }) => (
  <p role="alert"
     className="font-ui text-[13.5px] leading-relaxed text-[var(--ember)]
                bg-[var(--ember-wash)] rounded-[var(--r-md)] px-4 py-3">
    {children}
  </p>
);

/** O recado de "deu certo", com o mesmo peso visual do erro e outra cor - as
 *  mesmas do selo `tone="mint"` de components/ui/Card. */
export const Aviso = ({ children }: { children: ReactNode }) => (
  <p className="font-ui text-[13.5px] leading-relaxed text-[var(--teal-ink)]
                bg-[var(--teal-soft)] rounded-[var(--r-md)] px-4 py-3">
    {children}
  </p>
);
