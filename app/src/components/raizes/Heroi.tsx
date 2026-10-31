'use client';

/* A abertura escura das páginas de Raízes, como a da coleção editorial:
 * de borda a borda, título grande em serifa leve, subtítulo em itálico. A arte
 * é a própria península do mapa do módulo, em "papel recortado" (a mesma
 * forma deslocada faz a sombra), com os lugares do módulo em ouro. É desenho
 * feito dos dados, não ilustração: o crédito diz de onde vem o contorno. */

import type { ReactNode } from 'react';
import { He } from '@/components/hebrew/He';
import { desenhoDoMapa, projetar } from '@/lib/raizes';

export function Heroi({
  kicker, titulo, subtitulo, pontos = [], desenho, children, compacto = false
}: {
  kicker: string; titulo: string; subtitulo?: string;
  pontos?: { lon: number; lat: number }[]; desenho?: string; children?: ReactNode; compacto?: boolean;
}) {
  /* O desenho do módulo: a península, ou o Mediterrâneo na diáspora. */
  const m = desenhoDoMapa(desenho);
  return (
    <header className="rz-heroi -mx-4 flex flex-col">
      {/* A arte em cima, inteira (a península tem de ser reconhecível), e o
          texto embaixo, subindo um pouco sobre ela: a composição da abertura
          da coleção, com o véu só onde o texto encosta. */}
      <div className={`relative ${compacto ? 'h-[200px]' : 'h-[min(46vh,380px)]'}`} aria-hidden>
        {/* O recorte do mapa corta a França e o Marrocos em linha reta; a
            máscara apaga as bordas para o corte não aparecer como um traço. */}
        <svg viewBox={`0 0 ${m.largura} ${m.altura}`} preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_55%,transparent_100%)]">
          <path d={m.terra} fill="#061A20" transform="translate(16 18)" />
          <path d={m.terra} fill="#17505A" />
          {pontos.map((p, i) => {
            const [x, y] = projetar(p.lon, p.lat, m);
            return <circle key={i} cx={x} cy={y} r={11} fill="#B8862F" stroke="#0B2A31" strokeWidth={5} />;
          })}
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0B2A31] to-transparent" />
      </div>
      <div className="relative grid gap-3 px-5 pb-8 -mt-10 sm:px-8">
        <p className="rz-kicker m-0">
          <He size="inline" tone="paper" className="!text-[#B8862F] !text-[22px]">סְפָרַד</He>
          <span>{kicker}</span>
        </p>
        <h1 className="rz-h1">{titulo}</h1>
        {subtitulo && <p className="rz-sub">{subtitulo}</p>}
        {children}
      </div>
    </header>
  );
}
