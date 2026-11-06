/* O cartão que aparece quando o link vai no WhatsApp ou no Instagram
 * (23/10/2026, pedido do dono): um por porta de entrada, gerado por
 * tools/og.mjs, e o arquivo de cada um existe em public/media. */

import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { meta, ogDaRota } from '@/lib/seo';

const existe = (src: string) => existsSync(new URL(`../public${src}`, import.meta.url));
/* Largura e altura de um JPEG, lidas do marcador SOF. */
function tamanho(src: string) {
  const b = readFileSync(new URL(`../public${src}`, import.meta.url));
  for (let i = 2; i < b.length;) {
    const m = b[i + 1]!, n = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xc3) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
    i += 2 + n;
  }
  return null;
}

describe('o cartão do link', () => {
  /* 27/10/2026: o site é só o curso de alfabetização, e a capa é a página
     dele. O cartão do portal (og-portal.jpg) fica guardado. */
  it('a capa e o resto do site levam o cartão do curso', () => {
    for (const r of ['/', '/sobre', '/faq', '/raizes-sefarditas']) expect(ogDaRota(r).src, r).toBe('/media/og-curso.jpg');
  });

  it('as páginas do curso levam o cartão do curso', () => {
    for (const r of ['/curso-de-hebraico', '/curso-de-hebraico/', '/aprender-hebraico', '/metodo', '/checkout/alfabetizacao'])
      expect(ogDaRota(r).src, r).toBe('/media/og-curso.jpg');
  });

  it('as páginas do livro levam o cartão do livro', () => {
    for (const r of ['/israel-alem-do-obvio', '/descobrir-israel/']) expect(ogDaRota(r).src, r).toBe('/media/og-livro.jpg');
  });

  it('o metadata da página usa o cartão dela', () => {
    const m = meta({ rota: '/curso-de-hebraico', title: 't', description: 'd' });
    expect(JSON.stringify(m.openGraph)).toContain('/media/og-curso.jpg');
    expect(JSON.stringify(m.twitter)).toContain('/media/og-curso.jpg');
  });

  it('os quatro arquivos existem, em 1200x630 e leves (o WhatsApp não espera imagem pesada)', () => {
    for (const src of ['/media/og-portal.jpg', '/media/og-curso.jpg', '/media/og-livro.jpg', '/media/og-previa.jpg']) {
      expect(existe(src), src).toBe(true);
      expect(tamanho(src), src).toEqual({ w: 1200, h: 630 });
      expect(readFileSync(new URL(`../public${src}`, import.meta.url)).length, src).toBeLessThan(300 * 1024);
    }
  });
});
