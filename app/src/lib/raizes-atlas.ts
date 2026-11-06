/* O Atlas de Raízes: a parte que não é tela.
 * ─────────────────────────────────────────────────────────────────────────
 * Janelas do mapa (península, Mediterrâneo, Atlântico), o que aparece em cada
 * período e o desenho das rotas. A regra que segura tudo: uma rota é a lista
 * de lugares que as fontes dão; a curva entre dois lugares é uma ligação
 * desenhada, nunca uma estrada nem uma rota marítima (`curvaEntre`). */

import type { Atlas, DesenhoDoMapa, LugarDoAtlas, RotaDoExilio } from '@/lib/raizes';
import { projetar } from '@/lib/raizes';

export type Janela = { x: number; y: number; w: number; h: number };

/** As três vistas prontas, em graus (oeste, leste, sul, norte). */
export const VISTAS = {
  peninsula: { nome: 'Península', oeste: -10.2, leste: 4.4, sul: 35.6, norte: 44.0 },
  mediterraneo: { nome: 'Mediterrâneo', oeste: -11, leste: 31, sul: 31.5, norte: 55 },
  atlantico: { nome: 'Atlântico', oeste: -76, leste: 32, sul: -25, norte: 56 }
} as const;
export type Vista = keyof typeof VISTAS;

/** A janela que mostra o retângulo inteiro na proporção pedida (largura/altura). */
export function janelaDaVista(v: Vista, d: DesenhoDoMapa, proporcao: number): Janela {
  const r = VISTAS[v];
  const [x0, y0] = projetar(r.oeste, r.norte, d);
  const [x1, y1] = projetar(r.leste, r.sul, d);
  return encaixar({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, proporcao, d);
}

/** Cresce a janela no eixo que falta para ficar na proporção, sem sair do desenho. */
export function encaixar(j: Janela, proporcao: number, d: DesenhoDoMapa): Janela {
  let { x, y, w, h } = j;
  if (w / h < proporcao) { const nw = h * proporcao; x -= (nw - w) / 2; w = nw; }
  else { const nh = w / proporcao; y -= (nh - h) / 2; h = nh; }
  return limitar({ x, y, w, h }, d);
}

/** Zoom e arrasto nunca levam a janela para fora do desenho, nem a deixam maior que ele. */
export function limitar(j: Janela, d: DesenhoDoMapa): Janela {
  const prop = j.w / j.h;
  let w = Math.min(j.w, d.largura), h = w / prop;
  if (h > d.altura) { h = d.altura; w = h * prop; }
  w = Math.max(w, d.largura / 40); h = w / prop;
  const x = Math.min(Math.max(j.x, 0), d.largura - w);
  const y = Math.min(Math.max(j.y, 0), d.altura - h);
  return { x, y, w, h };
}

/** Zoom em torno de um ponto do desenho (fator > 1 aproxima). */
export function zoom(j: Janela, fator: number, cx: number, cy: number, d: DesenhoDoMapa): Janela {
  const w = j.w / fator, h = j.h / fator;
  return limitar({ x: cx - ((cx - j.x) / j.w) * w, y: cy - ((cy - j.y) / j.h) * h, w, h }, d);
}

/** Os lugares de um período (sem período: todos), filtrados pelos tipos ligados. */
export function lugaresVisiveis(a: Atlas, periodo: string | null, tipos: ReadonlySet<string>): LugarDoAtlas[] {
  return a.lugares.filter(l =>
    (!periodo || l.periodos.includes(periodo)) &&
    (l.area || tipos.size === 0 || l.tipos.some(t => tipos.has(t))));
}

/** As rotas que já começaram no ano dado, na ordem em que começam. */
export function rotasAte(a: Atlas, ano: number): RotaDoExilio[] {
  return a.rotas.filter(r => r.de <= ano).sort((x, y) => x.de - y.de || x.id.localeCompare(y.id));
}

/** Quanto da rota está desenhado no ano dado: 0 antes de começar, 1 depois de `DURACAO` anos. */
export const DURACAO = 10;
export const fracaoDaRota = (r: RotaDoExilio, ano: number) => Math.min(1, Math.max(0, (ano - r.de) / DURACAO));

/** Uma curva suave de a para b, sempre do mesmo lado: ligação desenhada, não caminho. */
export function curvaEntre(a: [number, number], b: [number, number]): string {
  const [x0, y0] = a, [x1, y1] = b;
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const dx = x1 - x0, dy = y1 - y0;
  const n = Math.hypot(dx, dy) || 1;
  const curva = 0.18 * n;
  /* A normal que aponta para cima no desenho (para o norte), para todas as
     curvas se arquearem do mesmo jeito. */
  let nx = -dy / n, ny = dx / n;
  if (ny > 0) { nx = -nx; ny = -ny; }
  const c = (v: number) => Math.round(v * 10) / 10;
  return `M${c(x0)} ${c(y0)}Q${c(mx + nx * curva)} ${c(my + ny * curva)} ${c(x1)} ${c(y1)}`;
}

/** O caminho SVG de uma rota inteira: uma curva entre cada par de lugares seguidos. */
export function caminhoDaRota(r: RotaDoExilio, a: Atlas, d: DesenhoDoMapa): string {
  const pts = r.pontos.map(id => a.lugares.find(l => l.id === id)).filter((l): l is LugarDoAtlas => !!l)
    .map(l => projetar(l.lon, l.lat, d));
  const partes: string[] = [];
  for (let i = 1; i < pts.length; i++) {
    const seg = curvaEntre(pts[i - 1]!, pts[i]!);
    partes.push(i === 1 ? seg : seg.replace(/^M[^Q]+/, ''));
  }
  return partes.join('');
}

/** Os anos que a linha do tempo dos Caminhos percorre. */
export function anosDosCaminhos(a: Atlas): { de: number; ate: number } {
  const de = Math.min(...a.rotas.map(r => r.de));
  const ate = Math.max(...a.rotas.map(r => r.de)) + DURACAO;
  return { de: de - 2, ate };
}
