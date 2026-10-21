/* Ilustrações do capítulo 4 (Além de Jerusalém). Carregado por
   tools/ilustracoes.mjs. Devolve { svgs, pontos }.

   O mapa vem da prancha aprovada (tools/pranchas.mjs, mapaIlustrado), agora
   numerado e tocável: cada número abre a ficha do lugar. */

import fs from 'node:fs';
import path from 'node:path';
import { C, esc, projetor, caminho, km, ISRAEL_1949, HACHURA, featDisp } from '../lib/desenho.mjs';

export default function capitulo04({ paises, disputa, lagos, rios, svg, t, sombra, RAIZ }) {
  const destinos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ativos/dados/destinos.json'), 'utf8'));
  const jer = destinos.find(d => d.id === 'jerusalem');

  /* Abertura: um platô no deserto, um lago lá embaixo e o sol. Desenho
     genérico da paisagem do capítulo, não retrato de um ponto de vista real. */
  function abertura() {
    const W = 1480, H = 1300;
    let s = `<rect width="${W}" height="${H}" fill="${C.noite}"/>`;
    s += `<circle cx="1080" cy="330" r="120" fill="${C.ouro}"/>`;
    /* serras ao longe */
    s += `<path d="M0 640 L180 560 L320 610 L520 520 L700 600 L880 540 L1060 610 L1260 530 L1480 590 L1480 1300 L0 1300Z" fill="${C.navy}"/>`;
    s += `<path d="M0 720 L240 650 L420 700 L640 640 L860 700 L1100 650 L1300 700 L1480 670 L1480 1300 L0 1300Z" fill="#155059" opacity=".9"/>`;
    /* o platô de topo reto, com sombra de papel */
    const plato = 'M300 1010 L380 760 Q400 700 470 690 L930 676 Q1000 676 1012 720 L1040 820 L1100 1010 Z';
    s += sombra(plato, 10, 14) + `<path d="${plato}" fill="${C.neguev}"/>`;
    s += `<path d="M470 690 L930 676 Q1000 676 1012 720 L1000 724 L470 710Z" fill="${C.neguevTinta}"/>`;
    for (let k = 0; k < 6; k++) s += `<path d="M${520 + k * 80} 760 l-26 240" stroke="${C.neguevTinta}" stroke-width="5" opacity=".45"/>`;
    /* rampa a oeste, tracejada */
    s += `<path d="M120 1010 C220 990 300 900 400 770" fill="none" stroke="${C.ouroSuave}" stroke-width="8" stroke-dasharray="4 16" stroke-linecap="round"/>`;
    /* o deserto em primeiro plano e o lago à direita */
    s += `<path d="M0 1000 C300 980 600 1020 900 1000 C1100 990 1300 1010 1480 1000 L1480 1300 L0 1300Z" fill="${C.areiaClara}"/>`;
    s += `<path d="M1000 1040 C1150 1020 1320 1030 1480 1020 L1480 1300 L900 1300Z" fill="${C.mar}"/>`;
    for (let k = 0; k < 5; k++) s += `<path d="M${1060 + k * 80} ${1100 + (k % 2) * 60} q14 -10 28 0 t28 0" fill="none" stroke="#7FB4C4" stroke-width="4" stroke-linecap="round"/>`;
    /* duas tamareiras */
    const palmeira = (x, y, h) => `<path d="M${x} ${y} q8 -${h / 2} -4 -${h}" fill="none" stroke="${C.oliveira}" stroke-width="10" stroke-linecap="round"/>` +
      [[-70, -20], [70, -16], [-50, 30], [56, 34], [0, -50]].map(([dx, dy]) => `<path d="M${x - 4} ${y - h} q${dx / 2} ${dy - 30} ${dx} ${dy}" fill="none" stroke="${C.oliveira}" stroke-width="12" stroke-linecap="round"/>`).join('');
    s += palmeira(180, 1180, 200) + palmeira(300, 1220, 150);
    return svg(W, H, 'Ilustração: um platô de topo reto no deserto, um lago azul lá embaixo, o sol e duas tamareiras.', s);
  }

  /* Mapa ilustrado e tocável. Posição de cada número = coordenada registrada
     em destinos.json (C04-007, C04-011, C04-020, C04-031, C04-047, C04-059,
     C04-062, C04-070, C04-079; Jerusalém C04-083). O Mar Morto não tem
     coordenada registrada (C04-053): o número fica no meio da bacia norte do
     contorno do lago da Natural Earth. Distâncias: C04-097 (conta nossa).
     Tempo de carro da costa ao Mar Morto: C01-009. */
  const ORDEM = ['mar-da-galileia', 'nazare', 'cafarnaum', 'cesareia', 'massada', 'mar-morto', 'tel-aviv', 'jafa', 'haifa', 'acre'];
  const NOMES = { 'mar-da-galileia': 'Mar da Galileia', nazare: 'Nazaré', cafarnaum: 'Cafarnaum', cesareia: 'Cesareia', massada: 'Massada', 'mar-morto': 'Mar Morto', 'tel-aviv': 'Tel Aviv', jafa: 'Jafa', haifa: 'Haifa', acre: 'Acre' };
  const W = 1080, H = 1350;
  const P = projetor([34.25, 31.15, 35.95, 33.1], 800, 40, 150);
  const mortoNorte = (() => {
    const pts = [];
    for (const f of lagos.features) {
      const g = f.geometry; const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
      for (const pol of polys) for (const [x, y] of pol[0]) if (x > 35.3 && x < 35.7 && y > 31.45 && y < 31.8) pts.push([x, y]);
    }
    const lon = pts.reduce((a, p) => a + p[0], 0) / pts.length, lat = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    return [lon, lat];
  })();
  const LUGARES = ORDEM.map((id, i) => {
    const d = destinos.find(x => x.id === id);
    const [lon, lat] = d.lat != null ? [d.lon, d.lat] : mortoNorte;
    const [x, y] = P.p([lon, lat]);
    const dist = d.lat != null ? Math.round(km([jer.lat, jer.lon], [d.lat, d.lon])) : null;
    return { n: i + 1, id, nome: NOMES[id], x, y, dist };
  });

  function mapa() {
    const p = P.p, alt = P.altura;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += `<clipPath id="moldura"><rect x="40" y="150" width="800" height="${alt.toFixed(0)}" rx="18"/></clipPath><g clip-path="url(#moldura)">`;
    s += `<rect x="40" y="150" width="800" height="${alt.toFixed(0)}" fill="url(#ondas)"/>`;
    for (const f of paises.features) if (!['ISR', 'PSX'].includes(f.properties.a3)) s += `<path d="${caminho(f.geometry, p)}" fill="${C.pedra}" stroke="${C.pedraEsc}" stroke-width="1"/>`;
    const israel = featDisp(disputa, [...ISRAEL_1949, ...HACHURA, 'B54', 'B53']);
    s += `<g transform="translate(5 7)">${israel.map(f => `<path d="${caminho(f.geometry, p)}" fill="${C.pedraEsc}"/>`).join('')}</g>`;
    for (const f of featDisp(disputa, ISRAEL_1949)) s += `<path d="${caminho(f.geometry, p)}" fill="#FFFFFF" stroke="${C.navy}" stroke-width="2.2" stroke-linejoin="round"/>`;
    for (const f of featDisp(disputa, ['B54', 'B98', 'B53'])) s += `<path d="${caminho(f.geometry, p)}" fill="url(#hachura)" stroke="${C.ouro}" stroke-width="1.4"/>`;
    for (const f of featDisp(disputa, ['B16', 'B58'])) s += `<path d="${caminho(f.geometry, p)}" fill="url(#hachura-golan)" stroke="${C.ouroTinta}" stroke-width="1.4"/>`;
    for (const f of rios.features) if (/Jordan/.test(f.properties.nome || f.properties.name || '')) s += `<path d="${caminho(f.geometry, p)}" fill="none" stroke="#7FB8AE" stroke-width="2.4" stroke-linecap="round"/>`;
    for (const f of lagos.features) s += `<path d="${caminho(f.geometry, p)}" fill="${C.mar}" fill-opacity=".85" stroke="${C.mar}" stroke-width="1"/>`;
    s += '</g>';
    s += `<rect x="40" y="150" width="800" height="${alt.toFixed(0)}" rx="18" fill="none" stroke="${C.navy}" stroke-width="2"/>`;
    const [mx, my] = p([34.42, 32.45]);
    s += `<text class="d" x="${mx.toFixed(0)}" y="${my.toFixed(0)}" font-size="24" font-style="italic" fill="${C.mar}" transform="rotate(-70 ${mx.toFixed(0)} ${my.toFixed(0)})">Mar Mediterrâneo</text>`;
    /* seta ilustrativa da costa ao Mar Morto (C01-009) */
    const [ax, ay] = p([34.82, 31.95]); const [bx, by] = p([35.42, 31.62]);
    s += `<path d="M${ax.toFixed(0)} ${ay.toFixed(0)} Q ${((ax + bx) / 2).toFixed(0)} ${(Math.min(ay, by) - 110).toFixed(0)} ${bx.toFixed(0)} ${by.toFixed(0)}" fill="none" stroke="${C.neguev}" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round" marker-end="url(#ponta)"/>`;
    /* Jerusalém, referência */
    const [jx, jy] = p([jer.lon, jer.lat]);
    s += `<path d="M${jx.toFixed(1)} ${(jy - 16).toFixed(1)} l5 11 h12 l-10 7 l4 12 l-11 -7 l-11 7 l4 -12 l-10 -7 h12z" fill="${C.neguev}" stroke="${C.papel}" stroke-width="2"/>`;
    s += `<rect x="${(jx - 112).toFixed(0)}" y="${(jy - 13).toFixed(0)}" width="92" height="26" rx="7" fill="${C.papel}" stroke="${C.linha}"/>` + t((jx - 66).toFixed(0), (jy + 6).toFixed(0), 'Jerusalém', { s: 15, w: 700, a: 'middle', f: C.navy });
    /* os dez números; Jafa sai com uma linha, porque fica colada em Tel Aviv */
    const desvio = { jafa: [-46, 40] };
    for (const l of LUGARES) {
      let { x, y } = l; const dv = desvio[l.id];
      if (dv) { s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${C.navy}"/><line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + dv[0]).toFixed(1)}" y2="${(y + dv[1]).toFixed(1)}" stroke="${C.navy}" stroke-width="1.6"/>`; x += dv[0]; y += dv[1]; l.px = x; l.py = y; }
      else { l.px = x; l.py = y; }
      s += `<circle cx="${x.toFixed(1)}" cy="${(y + 3).toFixed(1)}" r="19" fill="${C.pedraEsc}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="19" fill="${C.ouro}" stroke="${C.papel}" stroke-width="3"/>` + t(x.toFixed(1), (y + 7).toFixed(1), String(l.n), { cls: 't n', s: 20, a: 'middle', f: C.noite });
    }
    /* escala e norte */
    const px50 = 50 * (P.escala / 110.57);
    s += `<g transform="translate(70 ${(150 + alt - 40).toFixed(0)})"><rect x="-12" y="-26" width="${(px50 + 24).toFixed(0)}" height="44" rx="8" fill="${C.papel}" fill-opacity=".92"/><rect width="${(px50 / 2).toFixed(1)}" height="7" fill="${C.navy}"/><rect x="${(px50 / 2).toFixed(1)}" width="${(px50 / 2).toFixed(1)}" height="7" fill="${C.papel}" stroke="${C.navy}"/>${t(0, -8, '0', { s: 12, f: C.suave })}${t(px50.toFixed(1), -8, '50 km', { s: 12, a: 'end', f: C.suave })}</g>`;
    s += `<g transform="translate(795 195)"><circle r="22" fill="${C.papel}" stroke="${C.navy}" stroke-width="1.5"/><path d="M0 -16 L6 6 L0 2 L-6 6Z" fill="${C.navy}"/>${t(0, -28, 'N', { s: 13, w: 700, a: 'middle', f: C.navy })}</g>`;
    /* cabeçalho */
    s += t(40, 58, 'MAPA ILUSTRADO · CAPÍTULO 4', { s: 15, w: 700, ls: 3, f: C.tealTinta });
    s += t(40, 112, 'Israel, de lugar em lugar', { cls: 'd', s: 46, f: C.navy });
    /* coluna da direita: a lista dos números */
    let cy = 186; const cx = 862;
    s += t(cx, cy, 'OS DEZ LUGARES', { s: 13, w: 700, ls: 2, f: C.navy }); cy += 18;
    s += t(cx, cy, 'km de Jerusalém,', { s: 13, f: C.suave }); cy += 16; s += t(cx, cy, 'em linha reta', { s: 13, f: C.suave }); cy += 34;
    for (const l of LUGARES) {
      s += `<circle cx="${cx + 13}" cy="${cy - 6}" r="13" fill="${C.ouro}"/>` + t(cx + 13, cy - 1, String(l.n), { cls: 't n', s: 14, a: 'middle', f: C.noite });
      s += t(cx + 34, cy - 4, l.nome, { s: 15, w: 700, f: C.navy });
      s += t(cx + 34, cy + 14, l.dist ? `${l.dist} km` : 'sem ponto próprio', { s: 13, f: C.suave });
      cy += 52;
    }
    cy += 6;
    s += `<path d="M${cx} ${cy} h34" stroke="${C.neguev}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>`; cy += 24;
    s += t(cx, cy, 'Da costa ao Mar Morto:', { s: 13.5 }); cy += 18; s += t(cx, cy, 'cerca de 1h30 de carro', { s: 13.5 }); cy += 32;
    s += `<rect x="${cx}" y="${cy - 14}" width="30" height="20" fill="url(#hachura)" stroke="${C.ouro}"/>` + t(cx + 38, cy, 'Judeia e Samaria', { s: 13.5 }); cy += 18;
    s += t(cx + 38, cy, '(Cisjordânia) e Gaza', { s: 13.5 }); cy += 30;
    s += `<rect x="${cx}" y="${cy - 14}" width="30" height="20" fill="url(#hachura-golan)" stroke="${C.ouroTinta}"/>` + t(cx + 38, cy, 'Colinas de Golã', { s: 13.5 });
    /* rodapé */
    s += `<line x1="40" x2="${W - 40}" y1="${H - 74}" y2="${H - 74}" stroke="${C.linha}"/>`;
    s += t(40, H - 48, 'Contornos: Natural Earth (domínio público). Coordenadas: UNESCO e registros do capítulo 4. Tempo de carro: Ministério das Relações Exteriores de Israel.', { s: 12.5, f: C.suave });
    s += t(40, H - 28, 'Distâncias calculadas por nós a partir das coordenadas. O Mar Morto não tem coordenada registrada: o número marca o lago. Cores e números são desenho.', { s: 12.5, f: C.suave });
    return svg(W, H, 'Mapa ilustrado de Israel com os dez lugares do capítulo 4 numerados, Jerusalém como referência e a distância de cada lugar até Jerusalém em linha reta.', s);
  }

  /* Brasil: Massada (450 m acima do Mar Morto, C04-034) e o Pão de Açúcar
     (396 m acima do mar, C04-098); diferença de 54 m (C04-099). A altura é
     na mesma escala; a forma dos dois é desenho. */
  function massadaPao() {
    const W = 1080, H = 990, base = 760, k = 500 / 450;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += `<rect width="${W}" height="150" fill="${C.navy}"/>` + t(56, 62, 'MASSADA X RIO DE JANEIRO', { s: 15, w: 700, ls: 3, f: C.tealLite }) + t(56, 118, 'Mais alto que o Pão de Açúcar', { cls: 'd', s: 44, f: '#FFFFFF' });
    const hM = 450 * k, hP = 396 * k;
    /* Massada: platô com penhasco a leste (à direita), rampa a oeste */
    const mas = `M60 ${base} C150 ${base - 40} 220 ${base - hM + 120} 270 ${base - hM + 10} L290 ${base - hM} L440 ${base - hM} L452 ${base - hM + 30} L470 ${base}Z`;
    s += sombra(mas) + `<path d="${mas}" fill="${C.neguev}" stroke="${C.neguevTinta}" stroke-width="2.5" stroke-linejoin="round"/>`;
    /* Pão de Açúcar: domo */
    const pao = `M600 ${base} C640 ${base - 160} 690 ${base - hP} 790 ${base - hP} C880 ${base - hP} 930 ${base - 180} 980 ${base}Z`;
    s += sombra(pao) + `<path d="${pao}" fill="${C.oliveira}" stroke="#4E5531" stroke-width="2.5"/>`;
    /* água a seus pés */
    s += `<rect x="0" y="${base}" width="${W}" height="80" fill="url(#ondas)"/>`;
    s += t(265, base + 50, 'Mar Morto', { s: 15, i: true, a: 'middle', f: C.mar }) + t(790, base + 50, 'o mar', { s: 15, i: true, a: 'middle', f: C.mar });
    /* cotas */
    const cota = (x, h, num, cor) => `<path d="M${x} ${base} V${base - h} M${x - 10} ${base - h} h20 M${x - 10} ${base} h20" stroke="${C.navy}" stroke-width="2"/>` + t(x + 16, base - h / 2, num, { cls: 't n', s: 40, f: cor });
    s += cota(500, hM, '450 m', C.neguevTinta);
    s += `<path d="M1010 ${base} V${base - hP} M1000 ${base - hP} h20 M1000 ${base} h20" stroke="${C.navy}" stroke-width="2"/>` + t(790, base - hP / 2, '396 m', { cls: 't n', s: 40, a: 'middle', f: '#FFFFFF' });
    s += `<line x1="290" x2="1040" y1="${base - hM}" y2="${base - hM}" stroke="${C.neguevTinta}" stroke-width="1.5" stroke-dasharray="5 6"/>`;
    s += `<rect x="830" y="${base - hM - 2}" width="170" height="${(hM - hP).toFixed(0)}" fill="${C.ouroSuave}" opacity=".9"/>` + t(915, base - hM + 26, '54 m a mais', { s: 15, w: 700, a: 'middle', f: C.neguevTinta });
    s += t(265, base + 110, 'Massada', { s: 20, w: 700, a: 'middle', f: C.navy }) + t(265, base + 134, 'acima do Mar Morto · Autoridade de Natureza e Parques', { s: 13.5, a: 'middle', f: C.suave });
    s += t(790, base + 110, 'Pão de Açúcar', { s: 20, w: 700, a: 'middle', f: C.navy }) + t(790, base + 134, 'acima do mar · Marinha do Brasil', { s: 13.5, a: 'middle', f: C.suave });
    s += t(56, H - 40, 'Alturas na mesma escala, cada uma medida da água a seus pés; as formas são desenho. O Mar Morto fica abaixo do nível', { s: 13, f: C.suave });
    s += t(56, H - 20, 'do mar (capítulo 1): a comparação é de desnível, não de altitude.', { s: 13, f: C.suave });
    return svg(W, H, 'Comparação: o alto de Massada fica 450 metros acima do Mar Morto; o Pão de Açúcar, 396 metros acima do mar. Massada tem 54 metros a mais.', s);
  }

  return {
    svgs: { 'abertura-alem-de-jerusalem': abertura(), 'mapa-destinos-ilustrado': mapa(), 'massada-pao-de-acucar': massadaPao() },
    pontos: { 'mapa-destinos-ilustrado': LUGARES.map(l => ({ id: l.id, nome: l.nome, ficha: l.id, x: +(l.px / W * 100).toFixed(1), y: +(l.py / H * 100).toFixed(1) })) },
  };
}
