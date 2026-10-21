/* Ilustrações do capítulo 8 (Israel na prática). Carregado por
   tools/ilustracoes.mjs. Tudo o que é regra vem das afirmações do capítulo,
   com o id ao lado; o desenho das tomadas é esquemático. */

import { C } from '../lib/desenho.mjs';

export default function capitulo08({ svg, t, sombra }) {
  /* Abertura: uma mala, um passaporte e uma passagem. Desenho. */
  function abertura() {
    const W = 1480, H = 1300;
    let s = '';
    const mala = 'M420 560 h560 a40 40 0 0 1 40 40 v560 a40 40 0 0 1 -40 40 h-560 a40 40 0 0 1 -40 -40 v-560 a40 40 0 0 1 40 -40Z';
    s += `<path d="${mala}" transform="translate(10 14)" fill="${C.noite}" opacity=".45"/><path d="${mala}" fill="${C.neguev}"/>`;
    s += `<path d="M600 560 v-70 a30 30 0 0 1 30 -30 h140 a30 30 0 0 1 30 30 v70" fill="none" stroke="${C.neguevTinta}" stroke-width="26"/>`;
    for (const x of [520, 880]) s += `<rect x="${x - 14}" y="560" width="28" height="640" fill="${C.neguevTinta}" opacity=".55"/>`;
    s += `<rect x="560" y="760" width="280" height="150" rx="14" fill="${C.ouroSuave}"/><circle cx="640" cy="835" r="30" fill="none" stroke="${C.ouro}" stroke-width="6"/><path d="M690 820 h110 M690 850 h80" stroke="${C.ouro}" stroke-width="8"/>`;
    /* passaporte */
    s += `<g transform="rotate(-10 1150 760)"><rect x="1050" y="640" width="210" height="290" rx="14" fill="${C.noite}" opacity=".45" transform="translate(8 10)"/><rect x="1050" y="640" width="210" height="290" rx="14" fill="${C.tealTinta}"/><circle cx="1155" cy="760" r="50" fill="none" stroke="${C.ouro}" stroke-width="6"/><path d="M1105 760 h100 M1155 710 v100" stroke="${C.ouro}" stroke-width="4"/><rect x="1095" y="850" width="120" height="12" rx="6" fill="${C.ouro}"/></g>`;
    /* passagem */
    s += `<g transform="rotate(8 260 820)"><rect x="140" y="740" width="300" height="140" rx="12" fill="${C.noite}" opacity=".45" transform="translate(8 10)"/><rect x="140" y="740" width="300" height="140" rx="12" fill="${C.papel}"/><path d="M360 740 v140" stroke="${C.pedraEsc}" stroke-width="4" stroke-dasharray="8 8"/><path d="M170 790 h150 M170 830 h110" stroke="${C.navy}" stroke-width="8"/></g>`;
    return svg(W, H, 'Ilustração: uma mala, um passaporte e uma passagem.', s);
  }

  /* Tomadas: Brasil (C08-053, Inmetro) e Israel (C08-037). Desenho
     esquemático das faces, sem medida em escala. */
  function tomadas() {
    const W = 1080, H = 1140;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/><rect width="${W}" height="190" fill="${C.navy}"/>`;
    s += t(64, 80, 'BRASIL X ISRAEL', { s: 17, w: 700, ls: 3.5, f: C.tealLite }) + t(64, 150, 'Leve adaptador', { cls: 'd', s: 56, f: '#FFFFFF' });
    const face = (cx, cy, furos, cor) => {
      const d = `M${cx - 150} ${cy - 150} h300 a40 40 0 0 1 40 40 v220 a40 40 0 0 1 -40 40 h-300 a40 40 0 0 1 -40 -40 v-220 a40 40 0 0 1 40 -40Z`;
      return sombra(d) + `<path d="${d}" fill="#FFFFFF" stroke="${cor}" stroke-width="6"/>` + furos.map(([x, y, r]) => `<circle cx="${cx + x}" cy="${cy + y}" r="${r}" fill="${C.noite}"/>`).join('');
    };
    /* Brasil: três furos redondos (dois em linha e um deslocado) */
    s += face(290, 460, [[-60, 10, 20], [60, 10, 20], [0, -50, 20]], C.teal);
    /* Israel: tipo C (dois furos redondos) e tipo H (três furos em Y) */
    s += face(790, 410, [[-50, 0, 18], [50, 0, 18]], C.ouro);
    s += face(790, 780, [[-55, -30, 16], [55, -30, 16], [0, 60, 16]], C.ouro);
    s += t(290, 690, 'Brasil', { cls: 'd', s: 40, a: 'middle', f: C.navy }) + t(290, 730, 'norma ABNT NBR 14136', { s: 20, a: 'middle' }) + t(290, 762, 'pinos redondos de 4,0 mm (até 10 A)', { s: 18, a: 'middle', f: C.suave }) + t(290, 790, 'ou 4,8 mm (até 20 A)', { s: 18, a: 'middle', f: C.suave });
    s += t(790, 300, 'Tipo C', { s: 22, w: 700, a: 'middle', f: C.ouroTinta }) + t(790, 670, 'Tipo H', { s: 22, w: 700, a: 'middle', f: C.ouroTinta });
    s += t(790, 1005, 'Israel: 230 V, 50 Hz', { cls: 'd', s: 38, a: 'middle', f: C.navy });
    s += t(64, H - 40, 'Faces desenhadas de forma esquemática, fora de escala. Fontes: Inmetro; capítulo 8.', { s: 15, f: C.suave });
    return svg(W, H, 'Comparação esquemática: a tomada brasileira de três furos, da norma NBR 14136, e as tomadas de Israel, tipos C e H, em 230 V e 50 Hz.', s);
  }

  /* A viagem em quatro paradas: C08-011, C08-012, C08-014 (ETA-IL);
     C08-025 (aeroporto); C08-032, C08-047 (ônibus); C08-031 (Shabat). */
  function viagem() {
    const W = 1080, H = 1350;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>` + t(64, 90, 'A VIAGEM EM QUATRO PARADAS', { s: 17, w: 700, ls: 3.5, f: C.tealTinta });
    const paradas = [
      ['Antes de comprar', C.teal, ['ETA-IL aprovada, obrigatória', 'desde 1º/1/2025; NIS 25;', 'peça 72 h antes da passagem']],
      ['No aeroporto', C.mar, ['Chegue 3 horas antes', 'do voo de volta, no', 'Ben Gurion']],
      ['No ônibus', C.neguev, ['Dinheiro não vale a bordo:', 'Rav-Kav anônimo (5 shekels)', 'ou aplicativo']],
      ['No Shabat', C.ouro, ['Os trens param na sexta', 'à tarde e voltam no sábado', 'depois do pôr do sol']],
    ];
    s += `<path d="M150 230 V1180" stroke="${C.pedraEsc}" stroke-width="10" stroke-dasharray="2 18" stroke-linecap="round"/>`;
    paradas.forEach(([tit, cor, linhas], i) => {
      const y = 200 + i * 255;
      const caixa = `M230 ${y} h780 v200 h-780Z`;
      s += `<circle cx="150" cy="${y + 70}" r="44" fill="${cor}" stroke="${C.papel}" stroke-width="8"/>` + t(150, y + 86, String(i + 1), { cls: 't n', s: 44, a: 'middle', f: '#FFFFFF' });
      s += sombra(caixa) + `<path d="${caixa}" fill="#FFFFFF" stroke="${C.linha}"/>` + t(262, y + 58, tit, { cls: 'd', s: 38, f: C.navy });
      linhas.forEach((l, k) => { s += t(262, y + 104 + k * 32, l, { s: 24 }); });
    });
    s += t(64, H - 40, 'Regras consultadas em 21/10/2026: confira de novo antes de viajar (capítulo 8).', { s: 15, f: C.suave });
    return svg(W, H, 'A viagem em quatro paradas: a ETA-IL antes de comprar a passagem, três horas de antecedência no aeroporto, o ônibus pago com Rav-Kav e os trens parados no Shabat.', s);
  }

  /* Água no deserto: C08-041 (pelo menos 5 litros por pessoa por dia, em En Gedi). */
  function agua() {
    const W = 1080, H = 800;
    let s = `<rect width="${W}" height="${H}" fill="${C.ouroSuave}"/>` + t(64, 90, 'EN GEDI, PELA AUTORIDADE DE NATUREZA E PARQUES', { s: 17, w: 700, ls: 3, f: C.neguevTinta });
    for (let i = 0; i < 5; i++) {
      const x = 150 + i * 180;
      const g = `M${x} 260 h70 v40 q40 20 40 70 v260 a20 20 0 0 1 -20 20 h-110 a20 20 0 0 1 -20 -20 v-260 q0 -50 40 -70Z`;
      s += sombra(g) + `<path d="${g}" fill="${C.marClaro}" stroke="${C.mar}" stroke-width="5"/><rect x="${x + 4}" y="236" width="62" height="28" rx="6" fill="${C.mar}"/>`;
      s += t(x + 35, 520, '1 L', { cls: 't n', s: 36, a: 'middle', f: C.mar });
    }
    s += t(64, 730, 'Pelo menos 5 litros de água por pessoa por dia, chapéu e calçado de caminhada.', { s: 26, f: C.navy, w: 600 });
    return svg(W, H, 'Cinco garrafas de um litro: em En Gedi, a orientação oficial é levar pelo menos 5 litros de água por pessoa por dia.', s);
  }

  return { svgs: { 'abertura-pratica': abertura(), 'tomadas-brasil-israel': tomadas(), 'viagem-quatro-paradas': viagem(), 'agua-no-deserto': agua() } };
}
