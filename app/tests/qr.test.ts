/* O QR Code do PIX desenhado no navegador (lib/qr.ts, auditoria de UX de
   20/10/2026, item 3). Na criação, a saída foi lida por um decodificador de
   verdade (jsQR) em cinco tamanhos, de 2 a 1.200 caracteres; aqui fica a
   prova de estrutura, que roda sem dependência nova: tamanho por versão,
   os três padrões de localização, o módulo escuro fixo e o campo de formato
   com o nível M e um BCH válido. */
import { describe, expect, it } from 'vitest';
import { qrMatriz, qrSvgPath } from '@/lib/qr';

const PIX = '00020126580014BR.GOV.BCB.PIX013651041290000152520400005303986540514.705802BR' +
  '5925Mhg Treinamentos e Idiomas6008Curitiba62070503***6304ABCD';

/** Lê os 15 bits de formato da cópia em volta do localizador de cima à esquerda. */
function formato(m: boolean[][]): number {
  const bits: boolean[] = [];
  for (let i = 0; i <= 5; i++) bits.push(m[i]![8]!);
  bits.push(m[7]![8]!, m[8]![8]!, m[8]![7]!);
  for (let i = 9; i < 15; i++) bits.push(m[8]![14 - i]!);
  return bits.reduce((v, b, i) => v | (Number(b) << i), 0);
}

describe('o QR Code do PIX', () => {
  it('escolhe a versão pelo tamanho do texto', () => {
    expect(qrMatriz('oi').length).toBe(21);           // versão 1
    expect(qrMatriz(PIX).length).toBe(8 * 4 + 17);    // versão 8 no nível M
  });

  it('tem os três localizadores e o módulo escuro fixo', () => {
    const m = qrMatriz(PIX);
    const n = m.length;
    for (const [x0, y0] of [[0, 0], [n - 7, 0], [0, n - 7]] as const) {
      for (let k = 0; k < 7; k++) {
        expect(m[y0]![x0 + k], 'borda de cima').toBe(true);
        expect(m[y0 + 6]![x0 + k], 'borda de baixo').toBe(true);
      }
      expect(m[y0 + 3]![x0 + 3], 'centro').toBe(true);
      expect(m[y0 + 1]![x0 + 1], 'anel claro').toBe(false);
    }
    expect(m[n - 8]![8]).toBe(true);
  });

  it('o campo de formato diz nível M e passa no BCH(15,5)', () => {
    const f = formato(qrMatriz(PIX)) ^ 0x5412;
    expect(f >>> 13).toBe(0);                          // nível M = 00
    let rem = f >>> 10;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    expect(((f >>> 10) << 10) | (rem & 0x3ff)).toBe(f);
  });

  it('é determinístico, e o SVG tem a zona quieta de 4 módulos', () => {
    expect(qrMatriz(PIX)).toEqual(qrMatriz(PIX));
    const { lado, d } = qrSvgPath(qrMatriz(PIX));
    expect(lado).toBe(49 + 8);
    expect(d.startsWith('M4 4h1v1h-1z')).toBe(true);
  });
});
