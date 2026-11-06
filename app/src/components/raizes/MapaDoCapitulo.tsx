'use client';

/* O mapa do capítulo: os lugares que o texto do módulo nomeia, num mapa que
 * se toca. Tocar abre a ficha do lugar (o resumo do Atlas, com a fonte) e
 * conta como lugar descoberto, para o passaporte. Só aparece com 2 lugares
 * ou mais. */

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ModuloRaizes } from '@/lib/raizes';
import { LUGARES_COM_PAGINA, fotosDe } from '@/lib/raizes';
import { Foto } from './Foto';
import { lugaresDoModulo } from '@/lib/raizes-jornada';
import { useProgress } from '@/lib/state/store';
import { MiniMapa } from './MiniMapa';
import { PainelDeFonte } from './Texto';
import { Guardar } from './Guardar';

export function MapaDoCapitulo({ m }: { m: ModuloRaizes }) {
  const p = useProgress();
  const lugares = useMemo(() => lugaresDoModulo(m), [m]);
  const [sel, setSel] = useState<string | null>(null);
  const [fonte, setFonte] = useState(false);
  if (lugares.length < 2) return null;
  const desc = p.state.raizes?.descobertas ?? {};
  const marcados = new Set(lugares.filter(l => desc[`lugar:${l.id}`]).map(l => l.id));
  const l = lugares.find(x => x.id === sel);
  const abrir = (id: string) => { setFonte(false); setSel(id === sel ? null : id); if (id !== sel) p.descobrirRaizes(`lugar:${id}`); };
  const pagina = l?.pagina && LUGARES_COM_PAGINA.includes(l.pagina) ? l.pagina : null;

  return (
    <section className="grid gap-3" aria-labelledby={`mapa-cap-${m.n}`}>
      <div className="rz-rubrica">
        <h2 id={`mapa-cap-${m.n}`} className="rz-rot m-0">O mapa do capítulo</h2>
        <span className="rz-rot ml-auto tabular-nums">{marcados.size} de {lugares.length}</span>
      </div>
      <p className="m-0 font-ui text-[14px] leading-relaxed text-[var(--corpo)]">
        Os {lugares.length} lugares que este módulo cita. Toque num ponto para abrir a ficha; o carimbo marca os que você já abriu.
      </p>
      <div className="rz-minimapa-moldura">
        <MiniMapa lugares={lugares} marcados={marcados} selecionado={sel} onLugar={abrir} proporcao={1.45}
          rotulo={`Mapa com ${lugares.length} lugares citados no módulo ${m.n}`} />
      </div>
      <div aria-live="polite">
        {l && (
          <article key={l.id} className="rz-ficha rz-revelado" aria-label={`Ficha: ${l.nome}`}>
            <header className="grid gap-0.5">
              <span className="rz-rot !text-[#8FD6C8]">Lugar citado no módulo {m.n}</span>
              <h3 className="rz-serif m-0 text-[21px] font-[440]">{l.nome}</h3>
            </header>
            <div className="rz-escalonar grid gap-3 p-4">
              {fotosDe(`lugar:${l.id}`)[0] && <Foto f={fotosDe(`lugar:${l.id}`)[0]!} compacta />}
              <p className="rz-corpo m-0">{l.resumo}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Guardar chave={`lugar:${l.id}`} />
                {l.afirmacoes.length > 0 && (
                  <button type="button" className="rz-link min-h-[40px]" aria-expanded={fonte} onClick={() => setFonte(!fonte)}>{fonte ? 'Fechar a fonte' : 'De onde vem'}</button>
                )}
                <Link href={pagina ? `/raizes/lugar/${pagina}` : `/raizes/atlas?lugar=${l.id}`} prefetch={false} className="rz-link min-h-[40px] inline-flex items-center">
                  {pagina ? 'Abrir a página da cidade' : 'Ver no Atlas'}
                </Link>
              </div>
            </div>
            {fonte && <div className="px-4 pb-4"><PainelDeFonte ids={l.afirmacoes} /></div>}
          </article>
        )}
      </div>
    </section>
  );
}
