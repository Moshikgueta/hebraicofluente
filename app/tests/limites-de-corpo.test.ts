/* Tetos de tamanho lidos aos pedaços (auditoria de 28/09, SEC-005 e SEC-006):
 * o corpo grande demais é recusado sem ser lido inteiro, também quando chega
 * sem Content-Length. */

import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { readBytes } from '../../worker/src/lib/http.js';

/** Um corpo em pedaços, sem Content-Length, que conta quanto foi lido. */
function corpoEmPedacos(pedacos: number, tamanho: number) {
  let lidos = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(c) {
      if (lidos >= pedacos) { c.close(); return; }
      lidos++; c.enqueue(new Uint8Array(tamanho).fill(97));
    }
  });
  return { stream, lidos: () => lidos };
}

describe('tetos de tamanho', () => {
  it('readBytes para no teto, sem ler o resto', async () => {
    const c = corpoEmPedacos(100, 1024);
    const r = new Request('https://x.test/', { method: 'POST', body: c.stream, duplex: 'half' } as RequestInit);
    expect(await readBytes(r, 4096)).toBeNull();
    expect(c.lidos()).toBeLessThan(10);
  });

  it('readBytes devolve o corpo quando cabe', async () => {
    const r = new Request('https://x.test/', { method: 'POST', body: new Uint8Array([1, 2, 3]) });
    expect(Array.from(await readBytes(r, 10))).toEqual([1, 2, 3]);
  });

});
