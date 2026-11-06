'use client';

/* A abertura de um módulo no sistema "O Arquivo Aberto": a noite do arquivo,
 * a folha que se escreve sozinha e o título por baixo. Substitui o topo com o
 * mapa só nos módulos que têm `experiencia.abertura` (hoje, o 3). */

import type { ReactNode } from 'react';
import { Edito } from './Edito';

export function AberturaDoMaco({
  kicker, titulo, subtitulo, legenda, children
}: { kicker: string; titulo: string; subtitulo: string; legenda: string; children?: ReactNode }) {
  return (
    <header className="rz-abertura -mx-4 grid gap-6 px-5 pt-8 pb-9 sm:px-8">
      <figure className="m-0 grid gap-2 justify-items-center">
        <div className="w-[min(64vw,300px)]">
          <Edito desenhar tom="noite" />
        </div>
        <figcaption className="rz-credito max-w-[36ch] text-center">{legenda}</figcaption>
      </figure>
      <div className="grid gap-3">
        <p className="rz-kicker">{kicker}</p>
        <h1 className="rz-h1">{titulo}</h1>
        <p className="rz-sub">{subtitulo}</p>
        {children}
      </div>
    </header>
  );
}
