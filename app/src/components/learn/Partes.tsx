'use client';

/* Uma página longa em partes que abrem com um clique (29/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * A Aula 0 tem mais de dez quadros, e no celular era um rolo de dúzias de
 * telas - pedido do dono: um botão por parte, e quem quer ler mais clica.
 *
 * O título de cada parte fica sempre à vista (é um botão com
 * `aria-expanded`); o texto fica no HTML, com `hidden`, então a página
 * continua inteira para o buscador e o link do índice continua achando o
 * título. Clicar num item do índice abre a parte dele; um endereço com
 * `#id` também abre, ao carregar ou ao mudar.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

type Ctx = {
  ids: string[]; abertas: Set<string>;
  alternar: (id: string) => void; abrir: (id: string) => void; todas: (abrir: boolean) => void;
};
const PartesCtx = createContext<Ctx | null>(null);

export function Partes({ ids, abertaDeInicio, children }: {
  ids: string[];
  abertaDeInicio?: string;
  children: ReactNode;
}) {
  const [abertas, setAbertas] = useState<Set<string>>(() => new Set(abertaDeInicio ? [abertaDeInicio] : []));
  const abrir = useCallback((id: string) => {
    setAbertas(a => (a.has(id) ? a : new Set(a).add(id)));
  }, []);
  const alternar = useCallback((id: string) => {
    setAbertas(a => {
      const n = new Set(a);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);

  useEffect(() => {
    const doEndereco = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (ids.includes(id)) abrir(id);
    };
    doEndereco();
    window.addEventListener('hashchange', doEndereco);
    return () => window.removeEventListener('hashchange', doEndereco);
  }, [ids, abrir]);

  const todas = useCallback((abrirTodas: boolean) => setAbertas(abrirTodas ? new Set(ids) : new Set()), [ids]);
  const valor = useMemo(() => ({ ids, abertas, alternar, abrir, todas }), [ids, abertas, alternar, abrir, todas]);

  return <PartesCtx.Provider value={valor}>{children}</PartesCtx.Provider>;
}

/** "Abrir todas" / "Fechar todas", para quem quer ler a página inteira. */
export function AbrirTodas() {
  const ctx = useContext(PartesCtx);
  if (!ctx) return null;
  const todasAbertas = ctx.abertas.size === ctx.ids.length;
  return (
    <div className="flex justify-end">
      <button type="button"
              onClick={() => ctx.todas(!todasAbertas)}
              className="min-h-[44px] px-3 font-ui text-[14px] font-semibold text-[var(--accent)]
                         underline underline-offset-4">
        {todasAbertas ? 'Fechar todas as partes' : 'Abrir todas as partes'}
      </button>
    </div>
  );
}

/** O que o índice usa para abrir a parte antes de o navegador rolar até ela. */
export function useAbrirParte() {
  return useContext(PartesCtx)?.abrir ?? (() => {});
}

export function Parte({ id, titulo, tone, children }: {
  id: string;
  titulo: ReactNode;
  tone?: 'surface' | 'wash';
  children: ReactNode;
}) {
  const ctx = useContext(PartesCtx);
  const aberta = ctx ? ctx.abertas.has(id) : true;
  const corpo = `${id}-corpo`;
  return (
    <Card tone={tone} className="p-0 overflow-hidden">
      <h2 id={id} className="scroll-mt-4 m-0">
        <button type="button"
                aria-expanded={aberta}
                aria-controls={corpo}
                onClick={() => ctx?.alternar(id)}
                className="w-full min-h-[56px] flex items-center justify-between gap-4 p-5 sm:px-6
                           text-left font-display text-[18px] sm:text-[19px] font-semibold text-ink
                           hover:bg-[color:var(--line-soft)]">
          <span>{titulo}</span>
          <span aria-hidden
                className="shrink-0 grid place-items-center w-8 h-8 rounded-full border border-line
                           font-ui text-[18px] leading-none text-ink-muted">
            {aberta ? '−' : '+'}
          </span>
        </button>
      </h2>
      <div id={corpo} hidden={!aberta} className="px-5 sm:px-6 pb-6 grid gap-4">
        {children}
      </div>
    </Card>
  );
}
