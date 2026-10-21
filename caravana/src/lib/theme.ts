// Cor da agencia com contraste garantido.
//
// A agencia escolhe qualquer cor. Daqui saem as variantes que a interface usa:
//   --brand       fundo de botao, barra ativa
//   --brand-ink   texto sobre --brand (branco ou tinta, o que tiver mais contraste)
//   --brand-text  a cor usada como TEXTO sobre o papel, escurecida ate 4,5:1
//   --brand-tint  fundo suave
//   --accent / --accent-text  o mesmo para a cor secundaria
// Assim uma agencia com amarelo claro como cor principal nao gera botao ilegivel.

export const PAPER = '#faf6ee';
export const INK = '#17283a';

export function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function isHexColor(v: string): boolean {
  return parseHex(v) !== null;
}

function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
}

function luminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const la = luminance(parseHex(a) ?? [0, 0, 0]);
  const lb = luminance(parseHex(b) ?? [0, 0, 0]);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function mix(a: string, b: string, t: number): string {
  const x = parseHex(a) ?? [0, 0, 0];
  const y = parseHex(b) ?? [0, 0, 0];
  return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

// Escurece em direcao a tinta ate atingir o contraste pedido sobre o fundo.
export function ensureContrast(color: string, background: string, min = 4.5): string {
  if (contrast(color, background) >= min) return color.toLowerCase();
  for (let t = 0.05; t <= 1; t += 0.05) {
    const c = mix(color, INK, t);
    if (contrast(c, background) >= min) return c;
  }
  return INK;
}

export type BrandTheme = Record<'--brand' | '--brand-ink' | '--brand-text' | '--brand-tint' | '--accent' | '--accent-text', string>;

export function brandTheme(primary: string, secondary: string): BrandTheme {
  const p = parseHex(primary) ? primary.toLowerCase() : '#1f4a6b';
  const s = parseHex(secondary) ? secondary.toLowerCase() : '#a8702b';
  const onBrand = contrast('#ffffff', p) >= contrast(INK, p) ? '#ffffff' : INK;
  // Se nem branco nem tinta chegam a 4,5:1 sobre a cor (tons medios), o botao
  // usa a versao escurecida da cor, que garante o texto branco.
  const brand = contrast(onBrand, p) >= 4.5 ? p : ensureContrast(p, '#ffffff');
  return {
    '--brand': brand,
    '--brand-ink': contrast(onBrand, brand) >= 4.5 ? onBrand : '#ffffff',
    '--brand-text': ensureContrast(p, PAPER),
    '--brand-tint': mix(p, '#ffffff', 0.9),
    '--accent': s,
    '--accent-text': ensureContrast(s, PAPER),
  };
}
