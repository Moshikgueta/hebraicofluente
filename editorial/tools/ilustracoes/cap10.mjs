/* Ilustrações do capítulo 10 (diário). Carregado por tools/ilustracoes.mjs.
   Páginas para usar com caneta: mapa para marcar, molduras, selos para
   pintar. O único dado é a posição dos destinos (destinos.json, com a fonte
   de cada coordenada); o resto é desenho. */

import fs from 'node:fs';
import path from 'node:path';
import { C, projetor, caminho, featDisp, ICONE } from '../lib/desenho.mjs';

export default function capitulo10({ disputa, svg, t, sombra, RAIZ }) {
  const destinos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ativos/dados/destinos.json'), 'utf8')).filter(d => d.lat != null);

  /* Abertura: um caderno aberto e um lápis. */
  function abertura() {
    const W = 1480, H = 1300;
    let s = '';
    const pag = (x, rot) => `<g transform="rotate(${rot} ${x + 300} 760)"><rect x="${x + 10}" y="420" width="600" height="760" rx="10" fill="${C.noite}" opacity=".45"/><rect x="${x}" y="408" width="600" height="760" rx="10" fill="${C.papel}"/>${Array.from({ length: 14 }, (_, i) => `<line x1="${x + 50}" x2="${x + 550}" y1="${500 + i * 46}" y2="${500 + i * 46}" stroke="${C.pedraEsc}" stroke-width="3"/>`).join('')}</g>`;
    s += pag(150, -4) + pag(730, 4);
    s += `<path d="M730 420 L742 1166" stroke="${C.pedraEsc}" stroke-width="8"/>`;
    /* rabiscos: uma cúpula e uma onda, desenhados na página da direita */
    s += `<g transform="rotate(4 1030 760)"><path d="M850 640 C850 560 990 560 990 640Z" fill="none" stroke="${C.ouro}" stroke-width="7"/><path d="M830 640 h180" stroke="${C.ouro}" stroke-width="7"/><path d="M830 760 q30 -26 60 0 t60 0 t60 0" fill="none" stroke="${C.teal}" stroke-width="7"/></g>`;
    /* lápis */
    s += `<g transform="rotate(-32 1180 520)"><rect x="980" y="490" width="380" height="54" rx="8" fill="${C.ouro}"/><rect x="1300" y="490" width="60" height="54" fill="${C.neguev}"/><path d="M980 490 L920 517 L980 544Z" fill="${C.pedra}"/><path d="M938 509 L920 517 L938 525Z" fill="${C.noite}"/></g>`;
    return svg(W, H, 'Ilustração: um caderno aberto com linhas e pequenos desenhos de uma cúpula e de ondas, e um lápis.', s);
  }

  /* Mapa para marcar: Israel com os destinos numerados (coordenadas de
     destinos.json) e caixas para marcar ao lado. */
  function mapaParaMarcar() {
    const W = 1080, H = 1350;
    const P = projetor([34.15, 29.45, 35.95, 33.4], 470, 70, 120);
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += t(70, 80, 'MARQUE ONDE VOCÊ ESTEVE', { s: 17, w: 700, ls: 3.5, f: C.tealTinta });
    const terra = featDisp(disputa, ['B91', 'B78', 'B79', 'B99', 'B98', 'B16', 'B54', 'B53']);
    s += `<g transform="translate(6 8)">${terra.map(f => `<path d="${caminho(f.geometry, P.p)}" fill="${C.pedraEsc}"/>`).join('')}</g>`;
    for (const f of terra) s += `<path d="${caminho(f.geometry, P.p)}" fill="#FFFFFF" stroke="${C.navy}" stroke-width="2" stroke-linejoin="round"/>`;
    const [jx, jy] = P.p([35.27, 31.95]);
    s += t(jx.toFixed(0), jy.toFixed(0), 'Judeia e Samaria', { s: 15, f: C.suave, a: 'middle', i: true });
    destinos.forEach((d, i) => {
      const [x0, y0] = P.p([d.lon, d.lat]);
      /* Tel Aviv e Jafa ficam a 3 km: Jafa sai para o lado, com um fio até o ponto */
      const [dx, dy] = d.id === 'jafa' ? [-30, 26] : [0, 0]; const x = x0 + dx, y = y0 + dy;
      if (dx) s += `<circle cx="${x0.toFixed(1)}" cy="${y0.toFixed(1)}" r="4" fill="${C.navy}"/><line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${C.navy}" stroke-width="2"/>`;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="${C.ouro}" stroke="${C.papel}" stroke-width="3"/>` + t(x.toFixed(1), (y + 6).toFixed(1), String(i + 1), { cls: 't n', s: 16, a: 'middle', f: C.noite });
    });
    /* lista com caixas */
    destinos.forEach((d, i) => {
      const y = 170 + i * 82;
      s += `<rect x="640" y="${y - 28}" width="34" height="34" rx="6" fill="#FFFFFF" stroke="${C.teal}" stroke-width="3"/>`;
      s += t(694, y, `${i + 1}. ${d.id === 'beer-sheva' ? "Tel Be'er Sheva" : d.nome}`, { s: 24, w: 600, f: C.navy });
      s += `<line x1="694" x2="${W - 70}" y1="${y + 30}" y2="${y + 30}" stroke="${C.pedraEsc}" stroke-width="2"/>`;
    });
    s += t(694, 170 + destinos.length * 82, 'Na linha, a data da visita.', { s: 18, f: C.suave, i: true });
    s += t(70, H - 40, 'Posições: coordenadas registradas no capítulo 4. Contornos: Natural Earth.', { s: 14, f: C.suave });
    return svg(W, H, 'Página para marcar: mapa de Israel com os destinos do livro numerados e uma lista com caixas para marcar e anotar a data da visita.', s);
  }

  /* Molduras: uma para colar uma foto, outra para desenhar. */
  function molduras() {
    const W = 1080, H = 1350;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    const moldura = (y, h, rot, titulo, cor) => {
      const d = `M120 ${y} h840 v${h} h-840Z`;
      return `<g transform="rotate(${rot} 540 ${y + h / 2})">${sombra(d)}<path d="${d}" fill="#FFFFFF" stroke="${cor}" stroke-width="6"/><rect x="150" y="${y + 30}" width="780" height="${h - 110}" fill="none" stroke="${C.pedraEsc}" stroke-width="3" stroke-dasharray="10 10"/>${t(150, y + h - 34, titulo, { cls: 'd', s: 30, f: C.navy })}</g>`;
    };
    s += moldura(90, 560, -2, 'Cole aqui uma foto da viagem', C.ouro);
    s += moldura(720, 540, 2, 'Desenhe aqui um lugar que você viu', C.teal);
    return svg(W, H, 'Página com duas molduras: uma para colar uma foto da viagem e outra para desenhar um lugar.', s);
  }

  /* Selos para pintar: um por destino, com o ícone do mapa ilustrado. */
  function selos() {
    const W = 1080, H = 1350;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>` + t(70, 90, 'PINTE O SELO DE CADA LUGAR QUE VOCÊ VISITOU', { s: 17, w: 700, ls: 3, f: C.neguevTinta });
    destinos.forEach((d, i) => {
      const cx = 200 + (i % 3) * 340, cy = 270 + Math.floor(i / 3) * 280;
      s += `<circle cx="${cx}" cy="${cy}" r="104" fill="#FFFFFF" stroke="${C.navy}" stroke-width="4" stroke-dasharray="3 9" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="86" fill="none" stroke="${C.navy}" stroke-width="3"/>`;
      s += `<path transform="translate(${cx - 42} ${cy - 58}) scale(3.5)" d="${ICONE[d.id] || 'M12 12h.01'}" fill="none" stroke="${C.navy}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += t(cx, cy + 140, d.id === 'beer-sheva' ? "Be'er Sheva" : d.nome, { s: 22, w: 600, a: 'middle', f: C.navy });
    });
    return svg(W, H, 'Página de selos para pintar, um para cada destino do livro, com o ícone do lugar.', s);
  }

  return { svgs: { 'abertura-diario': abertura(), 'mapa-para-marcar': mapaParaMarcar(), 'molduras-diario': molduras(), 'selos-diario': selos() } };
}
