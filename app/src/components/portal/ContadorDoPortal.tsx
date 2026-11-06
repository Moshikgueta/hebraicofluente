'use client';

/* O contador da capa num ouvinte só (26/10/2026, velocidade no celular).
 * ─────────────────────────────────────────────────────────────────────────
 * A capa era inteira um componente de navegador só para cada link chamar
 * `contarNoPortal` no clique. Agora o link leva `data-portal-evento="..."` e
 * este componente, o único pedaço de navegador para isso, ouve os cliques da
 * página e conta. O `visto` sai uma vez, quando a capa monta. A lista do que
 * pode ser contado continua sendo `EVENTOS_DO_PORTAL` no servidor. */

import { useEffect } from 'react';
import { contarNoPortal, type EventoDoPortal } from '@/lib/funil-portal';

export function ContadorDoPortal() {
  useEffect(() => {
    contarNoPortal('visto');
    const aoClicar = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-portal-evento]');
      const evento = el?.getAttribute('data-portal-evento');
      if (evento) contarNoPortal(evento as EventoDoPortal);
    };
    document.addEventListener('click', aoClicar);
    return () => document.removeEventListener('click', aoClicar);
  }, []);
  return null;
}
