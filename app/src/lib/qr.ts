/* O QR Code do PIX, desenhado no navegador.
 * ─────────────────────────────────────────────────────────────────────────
 * O servidor não guarda a imagem do QR (worker/src/api/pay.js: "é grande e
 * derivável do código"), e o PIX direto nem tem provedor que a mande. Até
 * 20/10/2026 o checkout mostrava só o "copia e cola": quem comprava no
 * computador tinha de levar um texto de 150 caracteres até o celular
 * (auditoria de UX, item 3).
 *
 * Isto é um codificador QR mínimo, sem dependência: modo byte, correção de
 * erro nível M, versão escolhida pelo tamanho do texto, máscara escolhida
 * pelas regras de penalidade 1, 2 e 4 da norma. Segue o algoritmo de
 * referência de Project Nayuki (domínio público em espírito; reescrito aqui).
 * `tests/qr.test.ts` lê o resultado com um decodificador de verdade.
 */

/* Nível M: codewords de correção por bloco e número de blocos, por versão. */
const ECC_POR_BLOCO = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26,
  26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28];
const BLOCOS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16,
  17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49];
/** Os 2 bits do nível M no campo de formato. */
const FORMATO_M = 0;

function modulosDeDados(ver: number): number {
  let r = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const n = Math.floor(ver / 7) + 2;
    r -= (25 * n - 10) * n - 55;
    if (ver >= 7) r -= 36;
  }
  return r;
}

const codewordsDeDados = (ver: number) =>
  Math.floor(modulosDeDados(ver) / 8) - ECC_POR_BLOCO[ver]! * BLOCOS[ver]!;

/* ── Reed-Solomon sobre GF(256), polinômio 0x11D ───────────────────────── */
function mul(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function divisor(grau: number): number[] {
  const r = new Array<number>(grau).fill(0);
  r[grau - 1] = 1;
  let raiz = 1;
  for (let i = 0; i < grau; i++) {
    for (let j = 0; j < r.length; j++) {
      r[j] = mul(r[j]!, raiz);
      if (j + 1 < r.length) r[j] = r[j]! ^ r[j + 1]!;
    }
    raiz = mul(raiz, 0x02);
  }
  return r;
}

function resto(dados: readonly number[], div: readonly number[]): number[] {
  const r = new Array<number>(div.length).fill(0);
  for (const b of dados) {
    const fator = b ^ r.shift()!;
    r.push(0);
    div.forEach((c, i) => { r[i] = r[i]! ^ mul(c, fator); });
  }
  return r;
}

/* ── os dados: segmento byte, terminador, enchimento, blocos ───────────── */
function codewords(bytes: Uint8Array, ver: number): number[] {
  const bits: number[] = [];
  const poe = (v: number, n: number) => { for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1); };
  poe(0x4, 4);
  poe(bytes.length, ver <= 9 ? 8 : 16);
  for (const b of bytes) poe(b, 8);
  const capacidade = codewordsDeDados(ver) * 8;
  poe(0, Math.min(4, capacidade - bits.length));
  poe(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacidade; pad ^= 0xec ^ 0x11) poe(pad, 8);
  const dados: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]!;
    dados.push(b);
  }

  const nBlocos = BLOCOS[ver]!;
  const eccLen = ECC_POR_BLOCO[ver]!;
  const brutos = Math.floor(modulosDeDados(ver) / 8);
  const curtos = nBlocos - (brutos % nBlocos);
  const lenCurto = Math.floor(brutos / nBlocos);
  const div = divisor(eccLen);
  const blocos: number[][] = [];
  for (let i = 0, k = 0; i < nBlocos; i++) {
    const dat = dados.slice(k, k + lenCurto - eccLen + (i < curtos ? 0 : 1));
    k += dat.length;
    const ecc = resto(dat, div);
    if (i < curtos) dat.push(0);
    blocos.push(dat.concat(ecc));
  }
  const saida: number[] = [];
  for (let i = 0; i < blocos[0]!.length; i++) {
    blocos.forEach((b, j) => {
      if (i !== lenCurto - eccLen || j >= curtos) saida.push(b[i]!);
    });
  }
  return saida;
}

/* ── a matriz ──────────────────────────────────────────────────────────── */
function posicoesDeAlinhamento(ver: number): number[] {
  if (ver === 1) return [];
  const n = Math.floor(ver / 7) + 2;
  const passo = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
  const r = [6];
  for (let p = ver * 4 + 17 - 7; r.length < n; p -= passo) r.splice(1, 0, p);
  return r;
}

const bit = (x: number, i: number) => ((x >>> i) & 1) !== 0;

function montar(dados: readonly number[], ver: number, mascara: number): boolean[][] {
  const n = ver * 4 + 17;
  const m: boolean[][] = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const fixo: boolean[][] = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const poe = (x: number, y: number, escuro: boolean) => { m[y]![x] = escuro; fixo[y]![x] = true; };

  for (let i = 0; i < n; i++) { poe(6, i, i % 2 === 0); poe(i, 6, i % 2 === 0); }
  for (const [cx, cy] of [[3, 3], [n - 4, 3], [3, n - 4]] as const) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const d = Math.max(Math.abs(dx), Math.abs(dy));
      const x = cx + dx, y = cy + dy;
      if (x >= 0 && x < n && y >= 0 && y < n) poe(x, y, d !== 2 && d !== 4);
    }
  }
  const al = posicoesDeAlinhamento(ver);
  for (let i = 0; i < al.length; i++) for (let j = 0; j < al.length; j++) {
    if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      poe(al[i]! + dx, al[j]! + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }

  /* formato (nível + máscara), com BCH(15,5) */
  const dadoFmt = (FORMATO_M << 3) | mascara;
  let rem = dadoFmt;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const fmt = ((dadoFmt << 10) | rem) ^ 0x5412;
  for (let i = 0; i <= 5; i++) poe(8, i, bit(fmt, i));
  poe(8, 7, bit(fmt, 6)); poe(8, 8, bit(fmt, 7)); poe(7, 8, bit(fmt, 8));
  for (let i = 9; i < 15; i++) poe(14 - i, 8, bit(fmt, i));
  for (let i = 0; i < 8; i++) poe(n - 1 - i, 8, bit(fmt, i));
  for (let i = 8; i < 15; i++) poe(8, n - 15 + i, bit(fmt, i));
  poe(8, n - 8, true);

  if (ver >= 7) {
    let r = ver;
    for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
    const v = (ver << 12) | r;
    for (let i = 0; i < 18; i++) {
      const a = n - 11 + (i % 3), b = Math.floor(i / 3);
      poe(a, b, bit(v, i)); poe(b, a, bit(v, i));
    }
  }

  /* os dados, em zigue-zague de duas colunas, de baixo para cima e volta */
  let k = 0;
  for (let dir = n - 1; dir >= 1; dir -= 2) {
    if (dir === 6) dir = 5;
    for (let v = 0; v < n; v++) for (let j = 0; j < 2; j++) {
      const x = dir - j;
      const subindo = ((dir + 1) & 2) === 0;
      const y = subindo ? n - 1 - v : v;
      if (!fixo[y]![x] && k < dados.length * 8) {
        m[y]![x] = bit(dados[k >>> 3]!, 7 - (k & 7));
        k++;
      }
    }
  }

  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (fixo[y]![x]) continue;
    const inverte = [
      (x + y) % 2 === 0, y % 2 === 0, x % 3 === 0, (x + y) % 3 === 0,
      (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, ((x * y) % 2) + ((x * y) % 3) === 0,
      (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
    ][mascara]!;
    if (inverte) m[y]![x] = !m[y]![x];
  }
  return m;
}

/** Penalidade das regras 1 (sequências), 2 (blocos 2x2) e 4 (equilíbrio). */
function penalidade(m: boolean[][]): number {
  const n = m.length;
  let p = 0, escuros = 0;
  for (let a = 0; a < n; a++) {
    let corL = m[a]![0], runL = 1, corC = m[0]![a], runC = 1;
    for (let b = 1; b < n; b++) {
      if (m[a]![b] === corL) { runL++; if (runL === 5) p += 3; else if (runL > 5) p++; }
      else { corL = m[a]![b]; runL = 1; }
      if (m[b]![a] === corC) { runC++; if (runC === 5) p += 3; else if (runC > 5) p++; }
      else { corC = m[b]![a]; runC = 1; }
    }
  }
  for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) {
    const c = m[y]![x];
    if (c === m[y]![x + 1] && c === m[y + 1]![x] && c === m[y + 1]![x + 1]) p += 3;
  }
  for (const linha of m) for (const c of linha) if (c) escuros++;
  const total = n * n;
  p += Math.ceil(Math.abs(escuros * 20 - total * 10) / total - 1) * 10;
  return p;
}

/**
 * A matriz do QR (true = módulo escuro), sem a margem. Lança se o texto não
 * couber na versão 40 (2.331 bytes no nível M), o que nenhum código PIX chega
 * perto de ser.
 */
export function qrMatriz(texto: string): boolean[][] {
  const bytes = new TextEncoder().encode(texto);
  let ver = 1;
  for (; ver <= 40; ver++) {
    const cabe = codewordsDeDados(ver) * 8;
    if (4 + (ver <= 9 ? 8 : 16) + bytes.length * 8 <= cabe) break;
  }
  if (ver > 40) throw new Error('texto grande demais para um QR Code');
  const dados = codewords(bytes, ver);
  let melhor: boolean[][] | null = null, menor = Infinity;
  for (let mascara = 0; mascara < 8; mascara++) {
    const m = montar(dados, ver, mascara);
    const p = penalidade(m);
    if (p < menor) { menor = p; melhor = m; }
  }
  return melhor!;
}

/** O desenho em SVG: um `path` só, com 4 módulos de margem (a "zona quieta"). */
export function qrSvgPath(m: boolean[][]): { d: string; lado: number } {
  const margem = 4;
  let d = '';
  m.forEach((linha, y) => linha.forEach((escuro, x) => {
    if (escuro) d += `M${x + margem} ${y + margem}h1v1h-1z`;
  }));
  return { d, lado: m.length + margem * 2 };
}
