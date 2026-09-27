/* O nome em hebraico decorado - a recompensa de 300 XP (27/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Uma imagem feita no navegador, como o certificado (lib/certificate.ts): o
 * nome que o ALUNO confirmou em "Meu nome", em letra de fôrma e à mão, sobre
 * o azul do curso com filete dourado. Dois formatos: papel de parede do
 * celular e quadrado, para imprimir ou postar.
 *
 * Os mesmos dois cuidados do certificado:
 *   · espera as fontes carregarem antes de desenhar - o canvas não espera, e
 *     sairia em Times sem erro nenhum;
 *   · a direção do texto hebraico é dita ao canvas, senão o bidi da
 *     plataforma pode inverter as palavras de um nome composto.
 */

export type FormatoNome = 'celular' | 'quadrado';

export const FORMATOS_NOME: Record<FormatoNome, { w: number; h: number; rotulo: string }> = {
  celular: { w: 1080, h: 1920, rotulo: 'Papel de parede' },
  quadrado: { w: 1080, h: 1080, rotulo: 'Quadrado' }
};

const C = {
  fundo1: '#0E3B43',   // navy
  fundo2: '#12665C',   // teal-ink
  ouro: '#E0B85A',
  ouroSuave: 'rgba(224,184,90,.35)',
  branco: '#FFFFFF',
  claro: 'rgba(255,255,255,.72)'
};

const fam = (v: string, reserva: string): string => {
  const bruto = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  return bruto || reserva;
};

async function esperarFontes(fontes: string[]): Promise<void> {
  try {
    await Promise.all(fontes.map(f => document.fonts.load(f)));
    await document.fonts.ready;
  } catch { /* desenha mesmo assim, talvez na fonte reserva */ }
}

/** Diminui até caber, nunca aumenta. */
function caber(ctx: CanvasRenderingContext2D, texto: string, largura: number, inicio: number, familia: string, peso: number): number {
  let t = inicio;
  for (; t > 24; t -= 4) {
    ctx.font = `${peso} ${t}px ${familia}`;
    if (ctx.measureText(texto).width <= largura) break;
  }
  return t;
}

export async function desenharNome(
  canvas: HTMLCanvasElement,
  { nomeHe, nomePt, formato }: { nomeHe: string; nomePt: string; formato: FormatoNome }
): Promise<void> {
  const { w, h } = FORMATOS_NOME[formato];
  const he = fam('--font-he', 'serif');
  const cursiva = fam('--font-he-cursive', he);
  const ui = fam('--font-ui', 'system-ui, sans-serif');
  await esperarFontes([`400 120px ${he}`, `400 120px ${cursiva}`, `600 32px ${ui}`]);

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  /* O fundo: o azul do curso, descendo para o verde. */
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, C.fundo1);
  g.addColorStop(1, C.fundo2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  /* Dois filetes dourados, um dentro do outro: moldura de documento. */
  const m = 56;
  ctx.strokeStyle = C.ouro;
  ctx.lineWidth = 3;
  ctx.strokeRect(m, m, w - m * 2, h - m * 2);
  ctx.strokeStyle = C.ouroSuave;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(m + 16, m + 16, w - (m + 16) * 2, h - (m + 16) * 2);

  const cx = w / 2;
  const meio = h / 2;
  const largura = w - (m + 80) * 2;
  const nome = nomeHe.trim();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  /* O nome em fôrma, grande. */
  ctx.direction = 'rtl';
  ctx.fillStyle = C.branco;
  const t1 = caber(ctx, nome, largura, formato === 'celular' ? 220 : 190, he, 400);
  ctx.font = `400 ${t1}px ${he}`;
  ctx.fillText(nome, cx, meio - (formato === 'celular' ? 40 : 20));

  /* O mesmo nome à mão, em dourado. */
  ctx.fillStyle = C.ouro;
  const t2 = caber(ctx, nome, largura, Math.round(t1 * 0.72), cursiva, 400);
  ctx.font = `400 ${t2}px ${cursiva}`;
  ctx.fillText(nome, cx, meio + t2 + (formato === 'celular' ? 30 : 10));
  ctx.direction = 'ltr';

  /* Um filete curto entre o hebraico e o português. */
  const yLinha = meio + t2 + (formato === 'celular' ? 110 : 70);
  ctx.strokeStyle = C.ouroSuave;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 90, yLinha);
  ctx.lineTo(cx + 90, yLinha);
  ctx.stroke();

  /* O nome em português e a assinatura do curso. */
  ctx.fillStyle = C.claro;
  const pt = nomePt.trim();
  if (pt) {
    const t3 = caber(ctx, pt, largura, 44, ui, 600);
    ctx.font = `600 ${t3}px ${ui}`;
    ctx.fillText(pt, cx, yLinha + 70);
  }
  ctx.font = `600 26px ${ui}`;
  ctx.fillStyle = C.ouroSuave;
  ctx.fillText('HEBRAICO FLUENTE', cx, h - m - 50);
}

export function arquivoDoNome(nomePt: string): string {
  const slug = (nomePt || 'meu-nome')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `meu-nome-em-hebraico-${slug || 'aluno'}.png`;
}
