// Campos de formulario do painel, sempre com rotulo visivel ligado ao campo.

import type { ComponentProps, ReactNode } from 'react';
import { cx, Field, inputClass } from '../ui';

export function TextField({ label, name, hint, className, ...rest }: { label: string; name: string; hint?: ReactNode } & ComponentProps<'input'>) {
  const id = rest.id ?? `f-${name}`;
  return (
    <div className={className}>
      <Field label={label} htmlFor={id} hint={hint}>
        <input id={id} name={name} className={inputClass} {...rest} />
      </Field>
    </div>
  );
}

export function TextArea({ label, name, hint, className, rows = 3, ...rest }: { label: string; name: string; hint?: ReactNode } & ComponentProps<'textarea'>) {
  const id = rest.id ?? `f-${name}`;
  return (
    <div className={className}>
      <Field label={label} htmlFor={id} hint={hint}>
        <textarea id={id} name={name} rows={rows} className={cx(inputClass, 'resize-y leading-relaxed')} {...rest} />
      </Field>
    </div>
  );
}

export function SelectField({ label, name, hint, className, children, ...rest }: { label: string; name: string; hint?: ReactNode } & ComponentProps<'select'>) {
  const id = rest.id ?? `f-${name}`;
  return (
    <div className={className}>
      <Field label={label} htmlFor={id} hint={hint}>
        <select id={id} name={name} className={cx(inputClass, 'pr-8')} {...rest}>
          {children}
        </select>
      </Field>
    </div>
  );
}

export function ReadOnlyNote({ show }: { show: boolean }) {
  if (!show) return null;
  return <p className="text-micro text-stone-600">Somente leitura para o seu papel.</p>;
}
