/* The certificate, drawn.
 * ─────────────────────────────────────────────────────────────────────────
 * A PNG made in the browser, because the whole course is static — there is no
 * server to render one and nothing to upload to. Which turns out to be the
 * right architecture for this anyway: the image never leaves the learner's
 * device unless they post it themselves.
 *
 * Three things this file is careful about.
 *
 * **The Hebrew.** Every letter is positioned individually, right to left, at
 * a measured advance — not drawn as one string. Canvas does apply bidi, but
 * "it usually works" is not a standard this codebase accepts for Hebrew, and
 * per-glyph placement also gives even spacing, which a string does not.
 *
 * **The fonts.** `document.fonts.load()` is awaited for each face before a
 * single pixel is drawn. Canvas does not wait for webfonts: draw too early and
 * the certificate silently comes out in Times New Roman, and the learner only
 * finds out after posting it.
 *
 * **The claim.** It says, in words, that it is a record of completing this
 * course and not an official certification. A course that implies an
 * accreditation it does not have is lying to the person who trusted it, and a
 * learner who posts it deserves to know exactly what they are posting.
 */

export type CertificateFormat = 'square' | 'wide';

export type CertificateInput = {
  name: string;
  /** Date of the pass, not of the download. */
  date: Date;
  /** The 22 letters, in teaching order. */
  letters: string[];
  /** 0–1, shown only when present. */
  score?: number | null;
  format: CertificateFormat;
};

export const FORMATS: Record<CertificateFormat, { w: number; h: number; labelPt: string; hintPt: string }> = {
  /* 1080×1080 posts unchanged to every feed; 1200×630 is the link-preview and
     LinkedIn shape. Between them they cover where anyone would actually put
     this. */
  square: { w: 1080, h: 1080, labelPt: 'Quadrado', hintPt: 'Instagram, WhatsApp' },
  wide: { w: 1200, h: 630, labelPt: 'Paisagem', hintPt: 'LinkedIn, Facebook, X' }
};

/* The course palette, hard-coded rather than read from CSS: this image is
   posted somewhere else, where the site's variables do not exist, and it must
   look identical in light mode, dark mode and print. */
/* Os valores estão escritos à mão, e não lidos dos tokens, porque o
   certificado é desenhado em canvas: não há CSS ali. O preço disso é que uma
   mudança de identidade precisa passar por aqui também — e é por isso que
   este comentário existe, para quem for mexer na paleta amanhã.

   Sempre o tema CLARO, mesmo para quem navega no escuro: a imagem sai daqui
   para um post, e um certificado preto não é um certificado. */
const C = {
  paper: '#F7F3EC',
  surface: '#FFFDFA',
  ink: '#17130F',
  body: '#4A423B',
  muted: '#7C736A',
  accent: '#9E2B33',
  accentSoft: '#FAEDEC',
  mint: '#DDEFDF',
  line: 'rgba(23,19,15,0.12)'
};

const fam = (v: string, fallback: string): string => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  return raw || fallback;
};

/**
 * Wait for the faces this drawing needs.
 *
 * Canvas silently falls back when a webfont has not loaded, so the
 * certificate would come out in a system font with no error anywhere — the
 * kind of bug that is only ever found by the person who already posted it.
 */
async function ensureFonts(display: string, ui: string, he: string): Promise<void> {
  const wanted = [
    `700 64px ${display}`, `400 24px ${ui}`, `700 24px ${ui}`, `400 64px ${he}`
  ];
  try {
    await Promise.all(wanted.map(f => document.fonts.load(f)));
    await document.fonts.ready;
  } catch {
    /* A browser that refuses the API still draws — just possibly in a
       fallback face. Better a certificate than an exception. */
  }
}

export async function drawCertificate(
  canvas: HTMLCanvasElement, input: CertificateInput
): Promise<void> {
  const { w, h } = FORMATS[input.format];
  const display = fam('--font-display', 'system-ui, sans-serif');
  const ui = fam('--font-ui', 'system-ui, sans-serif');
  const he = fam('--font-he', 'serif');
  await ensureFonts(display, ui, he);

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const wide = input.format === 'wide';
  const pad = wide ? 56 : 72;

  /* ── the card ─────────────────────────────────────────────────────── */
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = C.surface;
  roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 28);
  ctx.fill();

  /* A double rule rather than a border: one hairline inside another reads as
     a document, one thick border reads as a web page. */
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 28);
  ctx.stroke();
  ctx.strokeStyle = C.accentSoft;
  ctx.lineWidth = 3;
  roundRect(ctx, pad + 14, pad + 14, w - (pad + 14) * 2, h - (pad + 14) * 2, 18);
  ctx.stroke();

  /* O filete de romã no topo, o único pedaço de cor da marca. */
  ctx.fillStyle = C.accent;
  roundRect(ctx, w / 2 - 44, pad + 44, 88, 5, 3);
  ctx.fill();

  const cx = w / 2;
  let y = pad + (wide ? 92 : 124);

  /* ── kicker ───────────────────────────────────────────────────────── */
  ctx.textAlign = 'center';
  ctx.fillStyle = C.muted;
  ctx.font = `700 ${wide ? 15 : 17}px ${ui}`;
  ctx.letterSpacing = '3px';
  ctx.fillText('HEBRAICO FLUENTE', cx, y);
  ctx.letterSpacing = '0px';
  y += wide ? 44 : 58;

  /* ── title ────────────────────────────────────────────────────────── */
  ctx.fillStyle = C.ink;
  ctx.font = `700 ${wide ? 40 : 52}px ${display}`;
  ctx.fillText('Certificado de conclusão', cx, y);
  y += wide ? 40 : 52;

  ctx.fillStyle = C.body;
  ctx.font = `400 ${wide ? 19 : 22}px ${ui}`;
  ctx.fillText('Curso de alfabetização em hebraico moderno', cx, y);
  y += wide ? 52 : 70;

  /* ── the name ─────────────────────────────────────────────────────── */
  const name = (input.name || '').trim() || 'Aluno';
  ctx.fillStyle = C.ink;
  const nameSize = fitText(ctx, name, w - pad * 2 - 120, wide ? 54 : 68, display, 700);
  ctx.font = `700 ${nameSize}px ${display}`;
  ctx.fillText(name, cx, y);
  y += wide ? 18 : 24;

  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  const ruleW = Math.min(w - pad * 2 - 140, Math.max(320, ctx.measureText(name).width + 120));
  ctx.beginPath();
  ctx.moveTo(cx - ruleW / 2, y);
  ctx.lineTo(cx + ruleW / 2, y);
  ctx.stroke();
  y += wide ? 40 : 56;

  /* ── the claim ────────────────────────────────────────────────────── */
  ctx.fillStyle = C.body;
  ctx.font = `400 ${wide ? 19 : 22}px ${ui}`;
  const claim = [
    'leu as 22 letras do alfabeto hebraico,',
    'os sinais de vogal e palavras inteiras —',
    'sem transliteração para se apoiar.'
  ];
  for (const line of claim) {
    ctx.fillText(line, cx, y);
    y += wide ? 28 : 33;
  }
  y += wide ? 18 : 30;

  /* ── the alphabet ─────────────────────────────────────────────────── */
  drawAlphabet(ctx, input.letters, cx, y, w - pad * 2 - 80, wide ? 34 : 44, he);
  y += wide ? 56 : 72;

  /* ── the footer ───────────────────────────────────────────────────── */
  const footY = h - pad - (wide ? 56 : 72);
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad + 60, footY - (wide ? 34 : 42));
  ctx.lineTo(w - pad - 60, footY - (wide ? 34 : 42));
  ctx.stroke();

  ctx.font = `400 ${wide ? 16 : 18}px ${ui}`;
  ctx.fillStyle = C.muted;
  const parts = [formatDate(input.date)];
  if (input.score != null) parts.push(`Exame final: ${Math.round(input.score * 100)}%`);
  ctx.fillText(parts.join('   ·   '), cx, footY);

  /* The honest line. Small, and present. */
  ctx.font = `400 ${wide ? 13 : 14.5}px ${ui}`;
  ctx.fillStyle = C.muted;
  ctx.fillText(
    'Registro de conclusão do curso. Não é um certificado oficial de proficiência.',
    cx, footY + (wide ? 24 : 28)
  );
}

/* Right to left, one letter at a time, evenly spaced.
   Drawing the 22 as a single string would let the platform's bidi decide the
   spacing and, on a canvas with no direction context, occasionally the order.
   This decides both. */
function drawAlphabet(
  ctx: CanvasRenderingContext2D, letters: string[], cx: number, y: number,
  maxWidth: number, size: number, he: string
): void {
  if (!letters.length) return;
  ctx.font = `400 ${size}px ${he}`;
  ctx.textAlign = 'center';

  const widest = Math.max(...letters.map(l => ctx.measureText(l).width));
  const step = Math.min(widest + size * 0.5, maxWidth / letters.length);
  const total = step * (letters.length - 1);

  ctx.fillStyle = C.accent;
  /* index 0 is the first letter taught, and in Hebrew the first thing goes on
     the RIGHT — so the row is laid out from the right edge leftwards. */
  const right = cx + total / 2;
  letters.forEach((l, i) => {
    ctx.fillText(l, right - i * step, y);
  });
}

/** Shrink a line until it fits, never grow it. */
function fitText(
  ctx: CanvasRenderingContext2D, text: string, maxWidth: number,
  start: number, family: string, weight: number
): number {
  let size = start;
  for (; size > 20; size -= 2) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
  }
  return size;
}

function roundRect(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

/** "18 de setembro de 2026" — written out, the way a document does it. */
export function formatDate(d: Date): string {
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/** A file name with the learner's name in it, safe on every filesystem. */
export function certificateFileName(name: string): string {
  const slug = (name || 'aluno')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `certificado-hebraico-fluente-${slug || 'aluno'}.png`;
}

export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> =>
  new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

/** What the learner posts with it. Theirs to edit; this is only a start. */
export const SHARE_TEXT =
  'Eu não sabia ler uma letra do alfabeto hebraico. Hoje leio as 22 — ' +
  'e palavras inteiras, sem transliteração. 🎉';
