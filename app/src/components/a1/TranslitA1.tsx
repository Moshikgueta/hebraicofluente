'use client';

/* A transliteração do A1: rodinhas de bicicleta (decisão 7 do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * A régua do alfabeto, por unidade, quando o aluno deixa no automático:
 *   · Unidades 0 a 4: aparece sempre;
 *   · Unidades 5 a 12: aparece com um toque na palavra;
 *   · da 13 em diante: escondida atrás de "Precisa de ajuda?".
 * O aluno pode forçar "sempre" ou "nunca" (state.a1.translit). Quem força
 * "sempre" depois da Unidade 4 vê, uma vez por tela, o convite para tentar
 * sem: as letras ele já conhece. */

import { useState } from 'react';
import { useProgress } from '@/lib/state/store';
import type { TranslitA1 } from '@/lib/state/a1-estado';

export type ModoTranslit = 'sempre' | 'toque' | 'pedido';

export function modoTranslit(valor: TranslitA1 | undefined, n: number): ModoTranslit {
  if (valor === 'mostrar') return 'sempre';
  if (valor === 'esconder') return 'pedido';
  return n <= 4 ? 'sempre' : n <= 12 ? 'toque' : 'pedido';
}

/** A transliteração de uma palavra, no modo da unidade. */
export function Translit({ texto, modo }: { texto: string; modo: ModoTranslit }) {
  const [aberta, setAberta] = useState(false);
  if (modo === 'sempre' || aberta) {
    return <span className="font-ui text-[14px] font-semibold text-ink">{texto}</span>;
  }
  return (
    <button type="button" onClick={() => setAberta(true)}
      className="font-ui text-[12.5px] text-ink-muted underline decoration-dotted underline-offset-2 min-h-[32px] text-left">
      {modo === 'toque' ? 'Ver a leitura' : 'Precisa de ajuda?'}
    </button>
  );
}

const OPCOES: { valor: TranslitA1; rotulo: string }[] = [
  { valor: 'auto', rotulo: 'Automático' },
  { valor: 'mostrar', rotulo: 'Sempre' },
  { valor: 'esconder', rotulo: 'Nunca' }
];

/** A chave "Mostrar transliteração", e o convite para desligar. */
export function ChaveTranslit({ n }: { n?: number }) {
  const p = useProgress();
  const valor = p.state.a1.translit?.valor ?? 'auto';
  return (
    <div className="grid gap-2">
      <fieldset className="flex flex-wrap items-center gap-2 border-0 p-0 m-0">
        <legend className="font-ui text-[13px] font-semibold text-ink pb-1">Mostrar transliteração</legend>
        {OPCOES.map(o => (
          <label key={o.valor}
            className={`inline-flex items-center min-h-[40px] px-3 rounded-full border font-ui text-[13.5px] cursor-pointer
              ${valor === o.valor ? 'border-[var(--accent)] bg-[var(--accent-wash)] text-ink font-semibold' : 'border-line text-ink-body'}`}>
            <input type="radio" name="translit-a1" value={o.valor} checked={valor === o.valor}
              onChange={() => p.setTranslitA1(o.valor)} className="sr-only" />
            {o.rotulo}
          </label>
        ))}
      </fieldset>
      {valor === 'mostrar' && n != null && n >= 5 && (
        <p className="font-ui text-[13.5px] text-ink-body m-0" role="note">
          Você já conhece essas letras. Tente ler sem transliteração.
        </p>
      )}
    </div>
  );
}
