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
 *
 * ── o olho da senha ─────────────────────────────────────────────────────
 * Todo campo `type="password"` ganha o botão de ver o que se digitou, e
 * ganha aqui - as cinco telas herdam de uma vez. Digitar uma senha às cegas
 * num telefone é a causa número um de "minha senha não funciona" que não é
 * senha errada: é o L maiúsculo que virou minúsculo, o acento que o teclado
 * comeu, o espaço no fim. Quem não consegue conferir tenta de novo, erra de
 * novo, e depois de algumas vezes a trava de tentativas entra - e aí a
 * pessoa está realmente trancada fora de um curso que ela pagou.
 *
 * Começa escondido, sempre: quem está num café decide se quer mostrar. E o
 * botão diz o que VAI acontecer ("Mostrar senha"), com `aria-pressed` para
 * o leitor de tela saber em que estado está.
 */

import { useState, type ReactNode } from 'react';
import { tx } from '@/i18n/telas/conta-plataforma-pecas';

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
  /** O id da mensagem de erro do formulário, quando há uma. Marca o campo
   *  como inválido e liga a mensagem a ele (WCAG 3.3.1; auditoria de 28/09,
   *  UX-016): o leitor de tela diz o erro ao chegar no campo. */
  erroId?: string;
};

export function Campo({
  id, label, value, onChange, type, autoComplete,
  placeholder, hint, required, autoFocus, erroId
}: CampoProps) {
  const senha = type === 'password';
  const [vendo, setVendo] = useState(false);

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id}
             className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          /* O `autoComplete` NÃO muda junto: continua sendo
             current-password/new-password mesmo enquanto o campo mostra
             texto, para o gerenciador de senhas seguir reconhecendo o campo
             e não oferecer o histórico de digitação do navegador. */
          type={senha && vendo ? 'text' : type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={e => onChange(e.target.value)}
          aria-invalid={erroId ? true : undefined}
          aria-describedby={[hint ? `${id}-hint` : '', erroId ?? ''].filter(Boolean).join(' ') || undefined}
          className={`w-full min-h-[52px] pl-4 rounded-[var(--r-md)] border-2 border-line bg-surface
                      font-ui text-[16px] text-ink placeholder:text-[var(--ink-placeholder)] placeholder:italic
                      focus:border-[var(--accent-soft)] focus:outline-none
                      ${senha ? 'pr-[54px]' : 'pr-4'}`}
        />
        {senha && (
          <button
            type="button"
            onClick={() => setVendo(v => !v)}
            aria-pressed={vendo}
            aria-controls={id}
            aria-label={vendo ? tx.ocultarSenha : tx.mostrarSenha}
            title={vendo ? tx.ocultarSenha : tx.mostrarSenha}
            /* `tabIndex={-1}` seria mais cômodo para quem usa teclado e passa
               direto ao botão de entrar, e foi recusado: um controle que só o
               mouse alcança não serve a quem mais precisa dele. Ele fica na
               ordem natural, logo depois do campo que ele revela. */
            className="absolute right-[6px] top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center
                       rounded-[var(--r-sm)] text-ink-muted hover:text-ink hover:bg-surface-2
                       transition-colors"
          >
            <Olho aberto={vendo} />
          </button>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="font-ui text-[12.5px] leading-relaxed text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

/* O olho, desenhado. Fechado é o mesmo olho com a barra atravessada - a
   convenção que todo mundo já leu em outro site -, e a barra é desenhada com
   duas linhas (uma na cor do fundo por baixo) para que ela continue visível
   quando o traço do olho passa por trás dela. */
function Olho({ aberto }: { aberto: boolean }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"
        stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.9" stroke="currentColor" strokeWidth="1.7" />
      {!aberto && (
        <>
          <path d="M4.4 19.6 19.6 4.4" stroke="var(--surface)" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M4.4 19.6 19.6 4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/**
 * O recado de erro dos formulários de conta.
 *
 * `role="alert"` para que o leitor de tela anuncie sem que a pessoa precise
 * procurar, e sempre perto do botão - um erro no topo de um formulário rolado
 * é um erro que ninguém vê.
 */
export const Erro = ({ children, id }: { children: ReactNode; id?: string }) => (
  <p role="alert" id={id}
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
