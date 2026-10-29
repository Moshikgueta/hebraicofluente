/* A Yael animada (28/10/2026): cada humor desenha, nenhum leva texto nem
   hebraico dentro do SVG, e o nome antigo `pulando` continua comemorando. */
import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Yael, YaelDiz, type HumorDaYael } from '@/components/aventura/Yael';
import { DICIONARIO } from '@/i18n/telas/aventura-yael';

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
  it('o balão é texto de verdade, fora do desenho decorativo', () => {
    const s = renderToStaticMarkup(createElement(YaelDiz, { humor: 'feliz', children: 'Oi!' }));
    expect(s).toMatch(/<p[^>]*yael-balao[^>]*>Oi!<\/p>/);
    expect(s).toContain('yael-feliz');
  });
  it('as falas são curtas e sem hebraico, nas duas línguas', () => {
    for (const d of [DICIONARIO.pt, DICIONARIO.en]) {
      for (const v of Object.values(d)) {
        const t = typeof v === 'function' ? (v as (x: never) => string)('Ein Gedi' as never) : v;
        expect(t.length, t).toBeLessThanOrEqual(60);
        expect(t).not.toMatch(/[\u0590-\u05FF]/);
      }
    }
  });
});
