'use client';

/* O mapa do Atlas: navegável (arrastar, aproximar), com os lugares do
 * período e, no modo Caminhos do Exílio, as rotas desenhando-se no tempo.
 * ─────────────────────────────────────────────────────────────────────────
 * O desenho é o contorno da Natural Earth, sem fronteira nenhuma: um reino
 * de 1492 não cabe numa fronteira de hoje, e por isso os reinos são rótulos
 * (`area`), não linhas. As rotas seguem três estilos, um por nível de
 * evidência, e a legenda diz em palavras o que cada traço quer dizer: cor
 * nunca é a única pista.
 *
 * Os pontos são botões HTML por cima do SVG (alvo de dedo, foco de teclado),
 * como no mapa dos módulos. A lista embaixo é a alternativa acessível. */

import { useEffect, useMemo, useRef, useState, type PointerEvent as PE } from 'react';
import { projetar, type Atlas, type DesenhoDoMapa, type LugarDoAtlas, type RotaDoExilio } from '@/lib/raizes';
import { caminhoDaRota, fracaoDaRota, janelaDaVista, limitar, zoom, type Janela, type Vista, VISTAS } from '@/lib/raizes-atlas';

export const ESTILO_DA_EVIDENCIA: Record<string, { cor: string; traco: string; largura: number }> = {
  documentado: { cor: 'var(--mar)', traco: '', largura: 3 },
  corredor: { cor: 'var(--ouro-tinta, #8A6420)', traco: '9 6', largura: 2.6 },
  hipotese: { cor: 'var(--ocre)', traco: '1.5 7', largura: 3 }
};

const PROPORCAO = 1.25;

export function AtlasMapa({
  atlas, desenho, lugares, rotas, ano, vistaInicial, selecionado, onLugar, onRota
}: {
  atlas: Atlas; desenho: DesenhoDoMapa; lugares: LugarDoAtlas[];
  /** As rotas a desenhar (vazio no modo Lugares) e o ano da linha do tempo. */
  rotas: RotaDoExilio[]; ano: number;
  vistaInicial: Vista; selecionado: string | null;
  onLugar: (id: string) => void; onRota: (id: string) => void;
}) {
  const [j, setJ] = useState<Janela>(() => janelaDaVista(vistaInicial, desenho, PROPORCAO));
  const caixa = useRef<HTMLDivElement>(null);
  const arrasto = useRef<{ x: number; y: number; j: Janela; moveu: boolean } | null>(null);

  /* Trocar de modo troca a vista inicial (os Caminhos começam no Mediterrâneo). */
  useEffect(() => { setJ(janelaDaVista(vistaInicial, desenho, PROPORCAO)); }, [vistaInicial, desenho]);

  const caminhos = useMemo(() => new Map(atlas.rotas.map(r => [r.id, caminhoDaRota(r, atlas, desenho)])), [atlas, desenho]);
  const escalaTela = () => (caixa.current?.getBoundingClientRect().width ?? 1) / j.w;

  const aproximar = (fator: number) => setJ(zoom(j, fator, j.x + j.w / 2, j.y + j.h / 2, desenho));
  const irPara = (v: Vista) => setJ(janelaDaVista(v, desenho, PROPORCAO));

  const inicio = (e: PE<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    arrasto.current = { x: e.clientX, y: e.clientY, j, moveu: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const mover = (e: PE<HTMLDivElement>) => {
    const a = arrasto.current;
    if (!a) return;
    const dx = e.clientX - a.x, dy = e.clientY - a.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) a.moveu = true;
    const s = escalaTela();
    setJ(limitar({ ...a.j, x: a.j.x - dx / s, y: a.j.y - dy / s }, desenho));
  };
  const fim = () => { arrasto.current = null; };

  /* A roda do mouse aproxima em torno do cursor. O listener é passivo: false
     para impedir a página de rolar enquanto se aproxima o mapa. */
  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const roda = (ev: WheelEvent) => {
      ev.preventDefault();
      const r = el.getBoundingClientRect();
      setJ(atual => {
        const cx = atual.x + ((ev.clientX - r.left) / r.width) * atual.w;
        const cy = atual.y + ((ev.clientY - r.top) / r.height) * atual.h;
        return zoom(atual, ev.deltaY < 0 ? 1.25 : 0.8, cx, cy, desenho);
      });
    };
    el.addEventListener('wheel', roda, { passive: false });
    return () => el.removeEventListener('wheel', roda);
  }, [desenho]);

  const pct = (lon: number, lat: number) => {
    const [x, y] = projetar(lon, lat, desenho);
    return { left: ((x - j.x) / j.w) * 100, top: ((y - j.y) / j.h) * 100 };
  };
  const dentro = (p: { left: number; top: number }) => p.left > -2 && p.left < 102 && p.top > -2 && p.top < 102;
  /* Rótulos de cidade só quando há espaço: perto, ou o ponto escolhido, e
     nunca um por cima do outro (o escolhido primeiro, depois na ordem). */
  const perto = j.w < desenho.largura / 6;
  const [larg, setLarg] = useState(360);
  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setLarg(e!.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const comRotulo = useMemo(() => {
    const alt = larg / PROPORCAO;
    const caixas: { x0: number; x1: number; y0: number; y1: number }[] = [];
    const ok = new Set<string>();
    const ordem = [...lugares.filter(l => l.id === selecionado), ...lugares.filter(l => l.id !== selecionado)];
    for (const l of ordem) {
      if (l.area || (!perto && l.id !== selecionado)) continue;
      const [x, y] = projetar(l.lon, l.lat, desenho);
      const px = ((x - j.x) / j.w) * larg, py = ((y - j.y) / j.h) * alt;
      const nome = l.nome.replace(/ \(.*\)$/, '');
      const c = { x0: px - 9, x1: px + 26 + nome.length * 6.6 + 12, y0: py - 11, y1: py + 11 };
      if (caixas.some(o => c.x0 < o.x1 && o.x0 < c.x1 && c.y0 < o.y1 && o.y0 < c.y1)) continue;
      caixas.push(c);
      ok.add(l.id);
    }
    return ok;
  }, [lugares, selecionado, perto, j, larg, desenho]);

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Vistas do mapa">
        {(Object.keys(VISTAS) as Vista[]).map(v => (
          <button key={v} type="button" className="rz-botao claro pequeno" onClick={() => irPara(v)}>{VISTAS[v].nome}</button>
        ))}
        <span className="ml-auto flex gap-2">
          <button type="button" className="rz-botao claro pequeno !px-0 w-[44px]" aria-label="Aproximar" onClick={() => aproximar(1.5)}>+</button>
          <button type="button" className="rz-botao claro pequeno !px-0 w-[44px]" aria-label="Afastar" onClick={() => aproximar(1 / 1.5)}>−</button>
        </span>
      </div>
      <div ref={caixa}
        className="rz-atlas relative w-full overflow-hidden rounded-[10px] border border-[var(--linha)] bg-[var(--rz-mar-claro)] touch-none select-none cursor-grab active:cursor-grabbing"
        style={{ aspectRatio: `${PROPORCAO}` }}
        onPointerDown={inicio} onPointerMove={mover} onPointerUp={fim} onPointerCancel={fim}>
        <svg viewBox={`${j.x} ${j.y} ${j.w} ${j.h}`} className="absolute inset-0 h-full w-full" aria-hidden focusable="false">
          <path d={desenho.terra} fill="var(--pedra-escura)" transform={`translate(${j.w / 160} ${j.w / 130})`} />
          <path d={desenho.terra} fill="var(--rz-terra-mapa)" stroke="var(--pedra-escura)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          {rotas.map(r => {
            const est = ESTILO_DA_EVIDENCIA[r.evidencia]!;
            const f = fracaoDaRota(r, ano);
            const ativo = selecionado === r.id;
            return (
              <g key={r.id}>
                <mask id={`m-${r.id}`} maskUnits="userSpaceOnUse" x={0} y={0} width={desenho.largura} height={desenho.altura}>
                  <path d={caminhos.get(r.id)} pathLength={1} fill="none" stroke="#fff" strokeWidth={14}
                    vectorEffect="non-scaling-stroke" strokeDasharray="1 1" strokeDashoffset={1 - f} />
                </mask>
                <path d={caminhos.get(r.id)} fill="none" stroke={est.cor} strokeWidth={ativo ? est.largura + 2 : est.largura}
                  strokeDasharray={est.traco || undefined} strokeLinecap="round" vectorEffect="non-scaling-stroke"
                  mask={f < 1 ? `url(#m-${r.id})` : undefined} />
              </g>
            );
          })}
        </svg>
        {/* As rotas também são alvos de toque: um botão no meio de cada uma. */}
        {rotas.filter(r => fracaoDaRota(r, ano) >= 1).map(r => {
          const fim = atlas.lugares.find(l => l.id === r.pontos[r.pontos.length - 1]);
          const ini = atlas.lugares.find(l => l.id === r.pontos[0]);
          if (!fim || !ini) return null;
          const a = pct(ini.lon, ini.lat), b = pct(fim.lon, fim.lat);
          const p = { left: (a.left + b.left) / 2, top: (a.top + b.top) / 2 - 2 };
          if (!dentro(p)) return null;
          return (
            <button key={r.id} type="button" className="rz-rota-alvo" aria-pressed={selecionado === r.id}
              aria-label={`Rota: ${r.titulo}`} onClick={() => onRota(r.id)}
              style={{ left: `${p.left}%`, top: `${p.top}%`, borderColor: ESTILO_DA_EVIDENCIA[r.evidencia]!.cor }}>
              <span aria-hidden>→</span>
            </button>
          );
        })}
        {lugares.map(l => {
          const p = pct(l.lon, l.lat);
          if (!dentro(p)) return null;
          if (l.area) {
            return (
              <span key={l.id} aria-hidden className="rz-area pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.left}%`, top: `${p.top}%` }}>{l.nome}</span>
            );
          }
          const ativo = selecionado === l.id;
          return (
            <button key={l.id} type="button" onClick={() => onLugar(l.id)} aria-pressed={ativo}
              aria-label={l.nome} className="rz-ponto !pointer-events-auto"
              style={{ left: `${p.left}%`, top: `${p.top}%` }}>
              <span aria-hidden />
              {comRotulo.has(l.id) && (
                <span aria-hidden className="pointer-events-none absolute left-[26px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-[3px] px-1.5 py-[1px]
                  font-ui text-[11.5px] font-semibold text-[var(--tinta)] bg-[var(--branco)] shadow-[0_1px_0_var(--pedra-escura)]">
                  {l.nome.replace(/ \(.*\)$/, '')}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A legenda das rotas: o traço e, em palavras, o que ele quer dizer. */
export function LegendaDasRotas({ atlas }: { atlas: Atlas }) {
  return (
    <ul className="m-0 p-0 list-none grid gap-2" aria-label="Legenda das rotas">
      {atlas.evidencias.map(ev => {
        const est = ESTILO_DA_EVIDENCIA[ev.id]!;
        return (
          <li key={ev.id} className="grid grid-cols-[52px_1fr] items-start gap-3 font-ui text-[13.5px] leading-snug text-[var(--corpo)]">
            <svg viewBox="0 0 52 12" className="mt-1 h-3 w-[52px]" aria-hidden>
              <line x1="2" y1="6" x2="50" y2="6" stroke={est.cor} strokeWidth={est.largura} strokeDasharray={est.traco || undefined} strokeLinecap="round" />
            </svg>
            <span><span className="font-semibold text-[var(--tinta)]">{ev.nome}.</span> {ev.descricao}</span>
          </li>
        );
      })}
    </ul>
  );
}
