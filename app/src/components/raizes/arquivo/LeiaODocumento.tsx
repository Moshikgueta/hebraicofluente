'use client';

/* "Leia o documento": a fonte como descoberta, não como rodapé.
 * ─────────────────────────────────────────────────────────────────────────
 * A folha tem partes numeradas; tocar numa abre o que se sabe dela, com a
 * marca da afirmação (e o painel de fontes) como em todo texto de Raízes.
 * Lida cada parte, o fecho diz o que a atividade ensinou: uma ordem diz o
 * que se mandou, não o que aconteceu. Não conta para a conclusão do módulo
 * nem grava nada: é leitura guiada. */

import { useState } from 'react';
import type { Bloco } from '@/lib/raizes';
import { TextoComFontes } from '../Texto';
import { Edito } from './Edito';

type Documento = Extract<Bloco, { tipo: 'documento' }>;

export function LeiaODocumento({ b }: { b: Documento }) {
  const [ativa, setAtiva] = useState<string | null>(null);
  const [lidas, setLidas] = useState<Set<string>>(new Set());
  const abrir = (id: string) => { setAtiva(id); setLidas(l => new Set(l).add(id)); };
  const parte = b.partes.find(p => p.id === ativa);
  const k = b.partes.findIndex(p => p.id === ativa);
  const todas = lidas.size === b.partes.length;

  return (
    <section className="grid gap-4" aria-labelledby={`doc-${b.id}`}>
      <div className="grid gap-1">
        <p className="rz-rot ocre m-0">Documento para explorar</p>
        <h2 id={`doc-${b.id}`} className="rz-h2">{b.titulo}</h2>
        <p className="m-0 font-ui text-[15px] leading-relaxed text-[var(--corpo)]">{b.apresentacao}</p>
      </div>
      <figure className="m-0 grid gap-2">
        <div className="mx-auto w-full max-w-[420px]">
          <Edito partes={b.partes} ativa={ativa} lidas={lidas} onParte={abrir} />
        </div>
        <figcaption className="font-ui text-[12.5px] leading-relaxed text-[var(--suave)]">{b.legenda}</figcaption>
      </figure>

      <div className="flex items-center gap-3" aria-live="polite">
        <ol className="m-0 flex gap-1.5 p-0 list-none" aria-hidden>
          {b.partes.map(p => (
            <li key={p.id} className={`h-2 w-6 rounded-full ${lidas.has(p.id) ? 'bg-[var(--ocre)]' : 'bg-[var(--linha)]'}`} />
          ))}
        </ol>
        <span className="font-ui text-[13px] text-[var(--suave)] tabular-nums">{lidas.size} de {b.partes.length} partes lidas</span>
      </div>

      {parte ? (
        <div key={parte.id} className="rz-revelado grid gap-2" id={`parte-${parte.id}`}>
          <p className="m-0 font-ui text-[13px] font-semibold text-[var(--suave)]">Parte {k + 1}</p>
          <h3 className="rz-h3"><span className="rz-sublinhado">{parte.rotulo}</span></h3>
          <TextoComFontes texto={parte.texto} />
          {k < b.partes.length - 1 && (
            <button type="button" className="rz-link justify-self-start min-h-[44px] inline-flex items-center"
              onClick={() => abrir(b.partes[k + 1]!.id)}>
              Parte {k + 2}: {b.partes[k + 1]!.rotulo}
            </button>
          )}
        </div>
      ) : (
        <button type="button" className="rz-botao claro justify-self-start" onClick={() => abrir(b.partes[0]!.id)}>
          Começar pela parte 1
        </button>
      )}

      {todas && (
        <aside className="rz-nota rz-revelado grid gap-1" role="note">
          <p className="rz-rot m-0">O que a folha ensina</p>
          <p className="rz-corpo m-0">{b.fecho}</p>
        </aside>
      )}
    </section>
  );
}
