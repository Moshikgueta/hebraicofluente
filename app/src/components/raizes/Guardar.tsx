'use client';

/* "Guardar na coleção": o mesmo botão em artefatos, curiosidades, lugares e
 * personagens. A coleção é progresso (vai com a conta, se houver), nunca
 * dado de família. aria-pressed diz o estado ao leitor de tela. */

import { useProgress } from '@/lib/state/store';
import { naColecao } from '@/lib/state/raizes-estado';

export function Guardar({ chave, className = '' }: { chave: string; className?: string }) {
  const p = useProgress();
  const tem = naColecao(p.state.raizes, chave);
  return (
    <button type="button" aria-pressed={tem} onClick={() => p.colecaoRaizes(chave, !tem)}
      className={`rz-guardar ${className}`}>
      <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4"><path d="M4 2h8v12l-4-3-4 3z" fill={tem ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
      {tem ? 'Na sua coleção' : 'Guardar na coleção'}
    </button>
  );
}
