/* Vinhetas: pequenas ilustrações no estilo "papel recortado" (DESIGN-SYSTEM.md,
   seção 8), uma no alto de cada seção do livro, no PDF e na web.
   ─────────────────────────────────────────────────────────────────────────
   São objetos genéricos (uma ânfora, uma oliveira, um ônibus), desenhados à
   mão em SVG: nunca retratam um lugar real como registro, nunca têm texto,
   nunca são símbolo religioso. Cada uma é um disco de cor com o objeto em
   cima e a sombra de papel deslocada.

   Uso no manuscrito: logo depois do título da seção,
     ::: vinheta oliveira
     :::
   Para ver todas: node tools/vinhetas-catalogo.mjs <livro> */

const P = {
  navy: '#0E3B43', teal: '#1F8A7D', tealT: '#12665C', tealS: '#E4F1EE', ouro: '#B8862F', ouroT: '#8A6520', ouroS: '#F7EFDF',
  papel: '#FBF9F5', pedra: '#EFE7D6', pedraE: '#D9CCB0', mar: '#1E5A73', marC: '#D3E6E8', neg: '#B9773E', negT: '#8C5426',
  oli: '#6B7444', noite: '#0B2A31', areia: '#E9DCC0',
};

/* Desenho: 200 x 200; o disco ocupa o centro. `f` é a forma em cima. */
const D = {
  muralha: `<path d="M40 150V96h12V84h14v12h12V84h14v12h12V84h14v12h12V84h14v12h12v54z" fill="${P.pedra}"/><path d="M90 150v-26a10 10 0 0 1 20 0v26" fill="${P.noite}"/><path d="M40 112h120M40 130h120" stroke="${P.pedraE}" stroke-width="3"/>`,
  cupula: `<rect x="62" y="104" width="76" height="46" fill="${P.pedra}"/><rect x="74" y="88" width="52" height="18" fill="${P.teal}"/><path d="M70 90a30 30 0 0 1 60 0z" fill="${P.ouro}"/><path d="M100 60v-10" stroke="${P.ouroT}" stroke-width="4"/><path d="M78 122h8M96 122h8M114 122h8" stroke="${P.tealT}" stroke-width="6" stroke-linecap="round"/>`,
  torre: `<rect x="84" y="62" width="32" height="88" fill="${P.pedra}"/><rect x="78" y="58" width="44" height="10" fill="${P.pedraE}"/><path d="M88 58V44h24v14" fill="${P.pedra}"/><path d="M88 44l12-14 12 14z" fill="${P.pedraE}"/><path d="M100 82v14M100 110v14" stroke="${P.negT}" stroke-width="6" stroke-linecap="round"/>`,
  porta: `<path d="M56 150V78h88v72z" fill="${P.pedra}"/><path d="M80 150v-36a20 20 0 0 1 40 0v36z" fill="${P.noite}"/><path d="M56 78h88M56 96h24M120 96h24" stroke="${P.pedraE}" stroke-width="3"/><path d="M56 78h10v-8h12v8h12v-8h12v8h12v-8h12v8h10" fill="none" stroke="${P.pedra}" stroke-width="6"/>`,
  coluna: `<rect x="70" y="140" width="60" height="10" fill="${P.pedraE}"/><rect x="82" y="66" width="36" height="74" fill="${P.pedra}"/><path d="M91 70v66M100 70v66M109 70v66" stroke="${P.pedraE}" stroke-width="3"/><rect x="72" y="56" width="56" height="12" rx="4" fill="${P.pedraE}"/>`,
  anfora: `<path d="M88 52h24v10c18 8 24 30 18 52-4 16-14 30-30 38-16-8-26-22-30-38-6-22 0-44 18-52z" fill="${P.neg}"/><path d="M84 66c-10 0-14 12-6 18M116 66c10 0 14 12 6 18" fill="none" stroke="${P.negT}" stroke-width="5"/><path d="M76 104h48" stroke="${P.ouroS}" stroke-width="4"/>`,
  pergaminho: `<rect x="58" y="70" width="84" height="64" fill="${P.ouroS}"/><circle cx="58" cy="102" r="12" fill="${P.areia}"/><circle cx="142" cy="102" r="12" fill="${P.areia}"/><rect x="52" y="64" width="12" height="76" rx="6" fill="${P.negT}"/><rect x="136" y="64" width="12" height="76" rx="6" fill="${P.negT}"/><path d="M76 88h48M76 102h48M76 116h36" stroke="${P.pedraE}" stroke-width="4"/>`,
  livro: `<path d="M52 72c18-6 34-4 48 6v70c-14-10-30-12-48-6z" fill="${P.papel}"/><path d="M148 72c-18-6-34-4-48 6v70c14-10 30-12 48-6z" fill="${P.tealS}"/><path d="M100 78v70" stroke="${P.navy}" stroke-width="3"/><path d="M62 92c10-3 20-2 28 2M62 106c10-3 20-2 28 2M110 94c8-4 18-5 28-2M110 108c8-4 18-5 28-2" stroke="${P.pedraE}" stroke-width="3" fill="none"/>`,
  estela: `<path d="M70 150V74a30 30 0 0 1 60 0v76z" fill="${P.navy}"/><path d="M80 82h40M80 94h40M80 106h40M80 118h32M80 130h40" stroke="${P.tealS}" stroke-width="3" stroke-dasharray="6 3"/>`,
  moeda: `<circle cx="92" cy="104" r="36" fill="${P.ouro}"/><circle cx="92" cy="104" r="26" fill="none" stroke="${P.ouroT}" stroke-width="3"/><circle cx="118" cy="118" r="26" fill="${P.areia}"/><circle cx="118" cy="118" r="18" fill="none" stroke="${P.ouroT}" stroke-width="3"/><path d="M84 104h16M92 96v16" stroke="${P.ouroT}" stroke-width="4"/>`,
  oliveira: `<path d="M100 150v-46c0-12-8-18-8-30" stroke="${P.negT}" stroke-width="10" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="74" rx="44" ry="28" fill="${P.oli}"/><ellipse cx="74" cy="92" rx="22" ry="14" fill="${P.oli}"/><ellipse cx="128" cy="90" rx="22" ry="14" fill="${P.oli}"/><circle cx="86" cy="70" r="5" fill="${P.noite}"/><circle cx="114" cy="78" r="5" fill="${P.noite}"/>`,
  tamareira: `<path d="M100 150c-2-30 2-56 0-78" stroke="${P.negT}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M100 72q-30-14-48 6M100 72q30-14 48 6M100 72q-20-26-40-22M100 72q20-26 40-22M100 72v-26" stroke="${P.oli}" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="92" cy="84" r="6" fill="${P.neg}"/><circle cx="106" cy="86" r="6" fill="${P.neg}"/>`,
  roma: `<circle cx="100" cy="108" r="40" fill="#A3423A"/><path d="M90 70l10-12 10 12z" fill="#7E2F29"/><path d="M80 100c8 10 32 10 40 0" stroke="#7E2F29" stroke-width="4" fill="none"/>`,
  trigo: `<path d="M100 150V60" stroke="${P.ouroT}" stroke-width="5"/>${[0, 1, 2, 3].map(i => `<ellipse cx="88" cy="${72 + i * 16}" rx="12" ry="6" transform="rotate(-30 88 ${72 + i * 16})" fill="${P.ouro}"/><ellipse cx="112" cy="${72 + i * 16}" rx="12" ry="6" transform="rotate(30 112 ${72 + i * 16})" fill="${P.ouro}"/>`).join('')}<ellipse cx="100" cy="58" rx="6" ry="12" fill="${P.ouro}"/>`,
  pao: `<ellipse cx="100" cy="112" rx="56" ry="30" fill="${P.areia}"/><path d="M58 106c14 12 70 12 84 0" stroke="${P.neg}" stroke-width="4" fill="none"/><ellipse cx="100" cy="100" rx="40" ry="14" fill="${P.ouroS}"/>`,
  prato: `<ellipse cx="100" cy="112" rx="62" ry="34" fill="${P.papel}"/><ellipse cx="100" cy="108" rx="44" ry="22" fill="${P.areia}"/><path d="M76 106c10-8 38-8 48 0" stroke="${P.neg}" stroke-width="4" fill="none"/><circle cx="100" cy="104" r="6" fill="${P.oli}"/><circle cx="88" cy="110" r="3" fill="#A3423A"/><circle cx="112" cy="110" r="3" fill="#A3423A"/>`,
  cafe: `<path d="M64 92h60v26a30 30 0 0 1-60 0z" fill="${P.papel}"/><path d="M124 98h8a12 12 0 0 1 0 24h-10" fill="none" stroke="${P.papel}" stroke-width="6"/><ellipse cx="94" cy="92" rx="30" ry="6" fill="${P.negT}"/><path d="M84 78c-6-8 6-12 0-20M102 78c-6-8 6-12 0-20" stroke="${P.pedraE}" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="96" cy="150" rx="46" ry="6" fill="${P.pedraE}"/>`,
  mercado: `<path d="M50 84h100l-8 18H58z" fill="${P.papel}"/><path d="M50 84h20l-2 18H58zM90 84h20l-2 18H92zM130 84h20l-8 18h-10z" fill="#A3423A"/><rect x="58" y="102" width="84" height="44" fill="${P.pedra}"/><circle cx="76" cy="120" r="8" fill="${P.ouro}"/><circle cx="96" cy="122" r="8" fill="${P.oli}"/><circle cx="116" cy="120" r="8" fill="#A3423A"/>`,
  onda: `<path d="M44 96q14-14 28 0t28 0 28 0 28 0M44 118q14-14 28 0t28 0 28 0 28 0M44 140q14-14 28 0t28 0 28 0 28 0" stroke="${P.mar}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  barco: `<path d="M56 116h88l-14 22H70z" fill="${P.negT}"/><path d="M100 116V56l34 50z" fill="${P.papel}"/><path d="M100 64L74 106h26z" fill="${P.areia}"/><path d="M44 146q14-10 28 0t28 0 28 0 28 0" stroke="${P.mar}" stroke-width="6" fill="none"/>`,
  peixe: `<path d="M56 104c18-24 62-24 80 0-18 24-62 24-80 0z" fill="${P.teal}"/><path d="M136 104l18-16v32z" fill="${P.teal}"/><circle cx="76" cy="100" r="5" fill="${P.noite}"/><path d="M96 92v24M110 92v24" stroke="${P.tealT}" stroke-width="3"/>`,
  montanha: `<path d="M36 150l44-72 22 32 18-24 44 64z" fill="${P.oli}"/><path d="M80 78l12 20-12-6-10 8z" fill="${P.papel}"/><circle cx="138" cy="66" r="12" fill="${P.ouro}"/>`,
  cratera: `<path d="M36 112c20-10 30-10 40 0 10 18 38 18 48 0 10-10 20-10 40 0v38H36z" fill="${P.neg}"/><path d="M76 112c10 18 38 18 48 0" fill="none" stroke="${P.negT}" stroke-width="4"/><path d="M36 112c20-10 30-10 40 0M124 112c10-10 20-10 40 0" fill="none" stroke="${P.areia}" stroke-width="4"/>`,
  deserto: `<path d="M36 128c30-24 60-24 84 0 14-12 30-14 44-6v28H36z" fill="${P.neg}"/><path d="M36 140c34-14 74-14 128 0v10H36z" fill="${P.areia}"/><circle cx="72" cy="78" r="16" fill="${P.ouro}"/>`,
  sol: `<circle cx="100" cy="102" r="26" fill="${P.ouro}"/>${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<path d="M${100 + 36 * Math.cos(a)} ${102 + 36 * Math.sin(a)}L${100 + 50 * Math.cos(a)} ${102 + 50 * Math.sin(a)}" stroke="${P.ouro}" stroke-width="7" stroke-linecap="round"/>`; }).join('')}`,
  gota: `<path d="M100 54c18 26 32 44 32 62a32 32 0 0 1-64 0c0-18 14-36 32-62z" fill="${P.mar}"/><path d="M86 118a14 14 0 0 0 14 14" stroke="${P.marC}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  passaro: `<path d="M60 116c10-24 46-30 70-16l14-6-6 14c-4 22-36 34-62 24z" fill="${P.neg}"/><path d="M94 96l-8-20 14 14-2-18 10 18 2-12 4 18" fill="${P.negT}"/><path d="M86 110c14 6 30 4 42-4" stroke="${P.noite}" stroke-width="4" fill="none"/><circle cx="124" cy="104" r="4" fill="${P.noite}"/><path d="M140 104l18 4-18 2" fill="${P.noite}"/>`,
  flor: `<path d="M100 150v-46" stroke="${P.oli}" stroke-width="6"/>${[0, 1, 2, 3, 4].map(i => `<ellipse cx="100" cy="76" rx="12" ry="24" transform="rotate(${i * 72} 100 98)" fill="#A3423A"/>`).join('')}<circle cx="100" cy="98" r="10" fill="${P.noite}"/>`,
  mapa: `<path d="M48 74l34-12 36 12 34-12v70l-34 12-36-12-34 12z" fill="${P.papel}"/><path d="M82 62v70M118 74v70" stroke="${P.pedraE}" stroke-width="3"/><path d="M60 110q20-30 44-10t36-20" stroke="${P.neg}" stroke-width="4" stroke-dasharray="4 6" fill="none"/><circle cx="140" cy="80" r="6" fill="${P.navy}"/>`,
  bussola: `<circle cx="100" cy="102" r="44" fill="${P.papel}"/><circle cx="100" cy="102" r="36" fill="none" stroke="${P.pedraE}" stroke-width="3"/><path d="M100 70l10 32-10 32-10-32z" fill="${P.navy}"/><path d="M100 70l10 32H90z" fill="#A3423A"/>`,
  aviao: `<path d="M44 108l112-26c8-2 10 8 2 10L72 120z" fill="${P.papel}"/><path d="M96 100l-12-28h12l24 22zM96 108l10 28h10l4-32z" fill="${P.pedraE}"/><path d="M52 106l-6-18h8l12 14" fill="${P.pedraE}"/>`,
  mala: `<rect x="56" y="76" width="88" height="70" rx="10" fill="${P.neg}"/><path d="M84 76V64h32v12" fill="none" stroke="${P.negT}" stroke-width="6"/><path d="M76 76v70M124 76v70" stroke="${P.negT}" stroke-width="5"/>`,
  onibus: `<rect x="48" y="70" width="104" height="66" rx="12" fill="${P.teal}"/><rect x="58" y="80" width="84" height="26" rx="4" fill="${P.tealS}"/><path d="M100 80v26" stroke="${P.teal}" stroke-width="4"/><circle cx="74" cy="140" r="10" fill="${P.noite}"/><circle cx="126" cy="140" r="10" fill="${P.noite}"/>`,
  trem: `<rect x="62" y="58" width="76" height="80" rx="16" fill="${P.navy}"/><rect x="72" y="70" width="56" height="28" rx="4" fill="${P.tealS}"/><circle cx="82" cy="116" r="6" fill="${P.ouro}"/><circle cx="118" cy="116" r="6" fill="${P.ouro}"/><path d="M76 138l-12 14M124 138l12 14M60 152h80" stroke="${P.pedraE}" stroke-width="5"/>`,
  vela: `<rect x="74" y="88" width="16" height="56" fill="${P.papel}"/><rect x="110" y="88" width="16" height="56" fill="${P.papel}"/><path d="M82 86c-8-10 2-18 0-26 8 8 8 18 0 26zM118 86c-8-10 2-18 0-26 8 8 8 18 0 26z" fill="${P.ouro}"/><rect x="64" y="144" width="72" height="8" rx="4" fill="${P.ouroT}"/>`,
  calendario: `<rect x="56" y="66" width="88" height="80" rx="8" fill="${P.papel}"/><rect x="56" y="66" width="88" height="20" rx="8" fill="#A3423A"/><path d="M76 58v16M124 58v16" stroke="${P.navy}" stroke-width="6" stroke-linecap="round"/>${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<rect x="${66 + c * 18}" y="${96 + r * 16}" width="12" height="10" fill="${r === 1 && c === 2 ? P.ouro : P.pedraE}"/>`).join('')).join('')}`,
  relogio: `<circle cx="100" cy="102" r="44" fill="${P.papel}"/><circle cx="100" cy="102" r="44" fill="none" stroke="${P.navy}" stroke-width="5"/><path d="M100 102V74M100 102l20 12" stroke="${P.navy}" stroke-width="6" stroke-linecap="round"/>`,
  placa: `<rect x="50" y="64" width="100" height="62" rx="8" fill="${P.teal}"/><path d="M64 80h48M64 96h60M64 112h40" stroke="${P.papel}" stroke-width="6" stroke-linecap="round"/><path d="M100 126v26" stroke="${P.pedraE}" stroke-width="8"/>`,
  letras: `<rect x="50" y="74" width="30" height="40" rx="5" fill="${P.papel}"/><rect x="86" y="84" width="30" height="40" rx="5" fill="${P.ouroS}"/><rect x="122" y="74" width="30" height="40" rx="5" fill="${P.tealS}"/><path d="M58 86h14M58 96h10M94 96h14M94 106h10M130 86h14M130 96h10" stroke="${P.navy}" stroke-width="4" stroke-linecap="round"/><path d="M50 138h102" stroke="${P.navy}" stroke-width="4" stroke-linecap="round"/>`,
  fala: `<path d="M52 66h96a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10H96l-24 20v-20H52a10 10 0 0 1-10-10V76a10 10 0 0 1 10-10z" fill="${P.papel}"/><circle cx="76" cy="98" r="6" fill="${P.teal}"/><circle cx="100" cy="98" r="6" fill="${P.teal}"/><circle cx="124" cy="98" r="6" fill="${P.teal}"/>`,
  lupa: `<circle cx="90" cy="92" r="30" fill="${P.marC}"/><circle cx="90" cy="92" r="30" fill="none" stroke="${P.navy}" stroke-width="8"/><path d="M112 114l30 30" stroke="${P.negT}" stroke-width="12" stroke-linecap="round"/>`,
  escavacao: `<path d="M40 150v-30h120v30z" fill="${P.neg}"/><path d="M40 120h120" stroke="${P.negT}" stroke-width="4"/><rect x="70" y="128" width="26" height="14" fill="${P.pedra}"/><path d="M118 60l20 64" stroke="${P.negT}" stroke-width="6" stroke-linecap="round"/><path d="M128 120l20 4-6 14z" fill="${P.pedraE}"/>`,
  chave: `<circle cx="74" cy="100" r="22" fill="none" stroke="${P.ouro}" stroke-width="10"/><path d="M96 100h56M134 100v18M148 100v12" stroke="${P.ouro}" stroke-width="10" stroke-linecap="round"/>`,
  camera: `<rect x="50" y="78" width="100" height="64" rx="10" fill="${P.navy}"/><rect x="76" y="66" width="30" height="14" rx="4" fill="${P.navy}"/><circle cx="100" cy="110" r="22" fill="${P.tealS}"/><circle cx="100" cy="110" r="12" fill="${P.noite}"/>`,
  coroa: `<path d="M56 136l-6-58 30 26 20-36 20 36 30-26-6 58z" fill="${P.ouro}"/><rect x="56" y="134" width="88" height="12" fill="${P.ouroT}"/>`,
  documento: `<path d="M64 52h52l22 22v78H64z" fill="${P.papel}"/><path d="M116 52v22h22" fill="${P.pedraE}"/><path d="M78 84h44M78 98h44M78 112h30" stroke="${P.pedraE}" stroke-width="5"/><circle cx="118" cy="132" r="14" fill="#A3423A"/>`,
  predio: `<rect x="62" y="58" width="76" height="92" fill="${P.papel}"/><path d="M62 82h76M62 106h76M62 130h76" stroke="${P.pedraE}" stroke-width="4"/><path d="M62 70h76v12H62zM62 94h76v12H62zM62 118h76v12H62z" fill="${P.tealS}"/><path d="M138 76h10a8 8 0 0 1 0 16h-10" fill="${P.papel}"/>`,
  pessoas: `<circle cx="78" cy="78" r="14" fill="${P.neg}"/><path d="M56 140c0-28 44-28 44 0z" fill="${P.neg}"/><circle cx="122" cy="78" r="14" fill="${P.teal}"/><path d="M100 140c0-28 44-28 44 0z" fill="${P.teal}"/>`,
  ampulheta: `<path d="M70 56h60M70 148h60M76 56c0 30 48 30 48 46s-48 16-48 46M124 56c0 30-48 30-48 46s48 16 48 46" stroke="${P.navy}" stroke-width="6" fill="none"/><path d="M84 140c4-12 28-12 32 0z" fill="${P.ouro}"/>`,
};

export const VINHETAS = Object.keys(D);

/* Fundo de cada vinheta: alterna entre os tons da coleção pelo nome. */
const FUNDOS = [P.tealS, P.ouroS, P.pedra, P.marC];
export function vinheta(id) {
  const f = D[id];
  if (!f) return null;
  const fundo = FUNDOS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % FUNDOS.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><circle cx="106" cy="108" r="88" fill="${P.pedraE}"/><circle cx="100" cy="100" r="88" fill="${fundo}"/><g transform="translate(6 6)" opacity=".28">${f.replace(/fill="[^"]*"/g, `fill="${P.pedraE}"`).replace(/stroke="[^"]*"/g, `stroke="${P.pedraE}"`)}</g><g stroke="${P.navy}" stroke-width="2.4" stroke-linejoin="round">${f}</g></svg>`;
}
