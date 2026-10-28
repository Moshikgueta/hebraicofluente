/* A Yael animada (28/10/2026): cada humor desenha, nenhum leva texto nem
   hebraico dentro do SVG, e o nome antigo `pulando` continua comemorando. */
import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Yael, type HumorDaYael } from '@/components/aventura/Yael';

const HUMORES: HumorDaYael[] = ['parada', 'feliz', 'quase', 'comemora', 'pensando'];
const html = (p: Parameters<typeof Yael>[0]) => renderToStaticMarkup(createElement(Yael, p));

describe('a Yael', () => {
  for (const h of HUMORES) {
    it(`${h}: decorativa, sem texto dentro`, () => {
      const s = html({ humor: h });
      expect(s).toContain(`yael-${h}`);
      expect(s).toContain('aria-hidden');
      expect(s).not.toMatch(/<text|[֐-׿]/);
    });
  }
  it('pulando é comemorar; sem nada, parada', () => {
    expect(html({ pulando: true })).toContain('yael-comemora');
    expect(html({})).toContain('yael-parada');
  });
  it('as estrelinhas só na comemoração', () => {
    expect(html({ humor: 'comemora' })).toContain('yael-estrelas');
    expect(html({ humor: 'feliz' })).not.toContain('yael-estrelas');
  });
});
