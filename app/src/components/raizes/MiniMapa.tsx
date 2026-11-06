'use client';

/* Um mapa pequeno e tocável, para o capítulo, o passaporte e os personagens.
 * ─────────────────────────────────────────────────────────────────────────
 * Usa o mesmo desenho do Atlas (o atlântico, Natural Earth) e se enquadra
 * sozinho nos lugares que recebe. Cada lugar é um botão (teclado e leitor de
 * tela); o toque no desenho abre o mais próximo do dedo, como no Atlas. Os
 * lugares já descobertos aparecem como carimbo. Ao entrar na tela, os pontos
 * caem um depois do outro; com movimento reduzido, já estão lá.
 *
 * Só pontos: nenhuma linha liga lugares aqui. Ligar dois pontos diria um
 * caminho, e caminho só o Atlas desenha, com o nível de evidência. */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { LugarDoAtlas } from '@/lib/raizes';
import { desenhoDoMapa, projetar } from '@/lib/raizes';
import { encaixar } from '@/lib/raizes-atlas';

const curto = (nome: string) => nome.replace(/ \(.*\)$/, '');

export function MiniMapa({
  lugares, marcados, selecionado, onLugar, proporcao = 1.5, rotulos = true, rotulo
}: {
  lugares: LugarDoAtlas[]; marcados?: ReadonlySet<string>; selecionado?: string | null;
  onLugar?: (id: string) => void; proporcao?: number; rotulos?: boolean; rotulo: string;
}) {
  const d = desenhoDoMapa('atlantico');
  const caixa = useRef<HTMLDivElement>(null);
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setVisto(true); ob.disconnect(); } }, { threshold: 0.3 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const pts = useMemo(() => lugares.map(l => ({ l, p: projetar(l.lon, l.lat, d) })), [lugares, d]);
  const janela = useMemo(() => {
    if (!pts.length) return { x: 0, y: 0, w: d.largura, h: d.altura };
    const xs = pts.map(q => q.p[0]), ys = pts.map(q => q.p[1]);
    const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    const lado = Math.max(w, h, d.largura * 0.05);
    const folga = lado * 0.28 + d.largura * 0.012;
    return encaixar({ x: Math.min(...xs) - folga, y: Math.min(...ys) - folga, w: w + 2 * folga, h: h + 2 * folga }, proporcao, d);
  }, [pts, d, proporcao]);
  const r = janela.w / 60;

  /* Rótulos sem atropelo: o nome só aparece se a caixa dele não cobrir outro
     ponto nem outro nome. O selecionado escolhe primeiro. */
  const comNome = useMemo(() => {
    if (!rotulos) return new Map<string, boolean>();
    const fs = janela.w / 26;
    const caixas: [number, number, number, number][] = [];
    const ok = new Map<string, boolean>();
    const ordem = [...pts].sort((a, b) => Number(b.l.id === selecionado) - Number(a.l.id === selecionado));
    for (const { l, p } of ordem) {
      const larg = curto(l.nome).length * fs * 0.58;
      const preferida = p[0] < janela.x + janela.w * 0.7;
      for (const direita of [preferida, !preferida]) {
        const x0 = direita ? p[0] + r * 1.4 : p[0] - r * 1.4 - larg, x1 = x0 + larg;
        const y0 = p[1] - fs * 0.75, y1 = p[1] + fs * 0.55;
        const cobrePonto = pts.some(q => q.l.id !== l.id && q.p[0] + r > x0 && q.p[0] - r < x1 && q.p[1] + r > y0 && q.p[1] - r < y1);
        const cobreNome = caixas.some(([a, b, c, d2]) => x0 < c && x1 > a && y0 < d2 && y1 > b);
        const fora = x0 < janela.x || x1 > janela.x + janela.w;
        if (!cobrePonto && !cobreNome && !fora) { caixas.push([x0, y0, x1, y1]); ok.set(l.id, direita); break; }
      }
    }
    return ok;
  }, [pts, rotulos, janela, selecionado, r]);

  /* O toque no desenho abre o lugar mais perto do dedo (até 28 px). */
  const tocar = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!onLugar) return;
    const box = e.currentTarget.getBoundingClientRect();
    const s = box.width / janela.w;
    let melhor: string | null = null, dist = 28;
    for (const { l, p } of pts) {
      const dx = (p[0] - janela.x) * s - (e.clientX - box.left), dy = (p[1] - janela.y) * s - (e.clientY - box.top);
      const dd = Math.hypot(dx, dy);
      if (dd < dist) { dist = dd; melhor = l.id; }
    }
    if (melhor) onLugar(melhor);
  };

  return (
    <div ref={caixa} className={`rz-minimapa ${visto ? 'visto' : ''}`}>
      <svg viewBox={`${janela.x} ${janela.y} ${janela.w} ${janela.h}`} role="img" aria-label={rotulo} onPointerUp={tocar}
        className="block w-full touch-manipulation" style={{ aspectRatio: String(proporcao) }}>
        <rect x={janela.x} y={janela.y} width={janela.w} height={janela.h} fill="var(--rz-mar-claro)" />
        <path d={d.terra} fill="var(--rz-terra-mapa)" stroke="var(--pedra-escura)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {pts.map(({ l, p }, i) => {
          const tem = marcados?.has(l.id), sel = selecionado === l.id;
          const ladoDireito = comNome.get(l.id) ?? true;
          return (
            <g key={l.id} className="rz-minimapa-ponto" style={{ ['--i' as string]: i }}>
              {sel && <circle cx={p[0]} cy={p[1]} r={r * 1.9} className="rz-mapa-anel" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />}
              {tem
                ? <g>
                    <circle cx={p[0]} cy={p[1]} r={r * 1.15} fill="var(--lacre)" stroke="#fff" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                    <path d={`M${p[0] - r * 0.5} ${p[1]} l${r * 0.35} ${r * 0.38} l${r * 0.65} ${-r * 0.75}`} fill="none" stroke="#fff" strokeWidth={1.6} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                : <circle cx={p[0]} cy={p[1]} r={sel ? r : r * 0.75} className={`rz-mapa-ponto ${sel ? 'aceso' : ''}`} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />}
              {comNome.has(l.id) && (
                <text x={p[0] + (ladoDireito ? r * 1.4 : -r * 1.4)} y={p[1] + janela.w / 26 * 0.35} textAnchor={ladoDireito ? 'start' : 'end'}
                  fontSize={janela.w / 26} className="rz-minimapa-nome">{curto(l.nome)}</text>
              )}
            </g>
          );
        })}
      </svg>
      {onLugar && (
        <ul className="sr-only">
          {lugares.map(l => <li key={l.id}><button type="button" onClick={() => onLugar(l.id)}>{curto(l.nome)}</button></li>)}
        </ul>
      )}
    </div>
  );
}
