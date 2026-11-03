'use client';

import { useState } from 'react';
import { IconCheck, IconCopy } from '../icons';

export function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          setDone(false);
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-small font-semibold text-sea ring-1 ring-stone-300 hover:bg-stone-100"
    >
      {done ? <IconCheck size={16} /> : <IconCopy size={16} />}
      <span aria-live="polite">{done ? 'Copiado' : label}</span>
    </button>
  );
}
