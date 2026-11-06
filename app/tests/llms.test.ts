/* O llms.txt (26/10/2026, plano de marketing): gerado por seo.mjs do título e
 * da descrição que cada página anunciável publica. Trava: nada escrito à mão,
 * só rotas do sitemap (nenhuma paga nem oculta) e as entidades do HTML
 * desfeitas. */
import { describe, expect, it } from 'vitest';
// @ts-expect-error - script JS sem tipos
import { cabecalho, classificar, llmsTxt } from '../seo.mjs';

const SITE = 'https://hebraicofluente.com.br';

describe('o llms.txt', () => {
  it('lê o título e a descrição publicados, com as entidades desfeitas', () => {
    const html = '<head><title>Dá para ler a Bíblia? - Hebraico Fluente</title>' +
      '<meta name="description" content="Ler em voz alta, sim; &quot;entender&quot; &amp; traduzir, não."/></head>';
    expect(cabecalho(html)).toEqual({
      titulo: 'Dá para ler a Bíblia? - Hebraico Fluente',
      descricao: 'Ler em voz alta, sim; "entender" & traduzir, não.'
    });
    expect(cabecalho('<p>sem cabeçalho</p>')).toEqual({ titulo: null, descricao: null });
  });

  it('abre com o nome e a descrição da capa e lista uma linha por página', () => {
    const txt = llmsTxt(SITE, [
      { rota: '/', titulo: 'Hebraico Fluente | Aprenda hebraico', descricao: 'A capa.' },
      { rota: '/metodo/', titulo: 'O método', descricao: 'Como é cada lição.' },
      { rota: '/sem-titulo/', titulo: null, descricao: null }
    ]);
    expect(txt.split('\n').slice(0, 3)).toEqual(['# Hebraico Fluente', '', '> A capa.']);
    expect(txt).toContain(`- [O método](${SITE}/metodo/): Como é cada lição.`);
    expect(txt).not.toContain('sem-titulo');
  });

  it('só as rotas do sitemap entram: nada pago nem oculto', () => {
    const { listadas } = classificar(['/', '/alfabeto-hebraico/', '/licao/alef/', '/checkout/alfabetizacao/', '/previa/']);
    expect(listadas).toEqual(['/', '/alfabeto-hebraico/']);
  });
});
