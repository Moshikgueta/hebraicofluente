/* O llms.txt, as descriptions que cabem no resultado e a verificação.
 *
 * O llms.txt é gerado por seo.mjs a partir do HTML publicado; aqui se confere
 * a regra (só o que é anunciável, título e description da própria página) e
 * o `resumo`, que trocou o `.slice(0, 180)` que cortava palavra ao meio na
 * description das páginas de curso.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PALAVRAS_CHAVE, VERIFICACAO, resumo } from '@/lib/seo';
// @ts-expect-error - módulo .mjs de linha de comando, sem tipos
import { cabecalhoDe, classificar, llmsTxt } from '../seo.mjs';

describe('resumo', () => {
  it('junta frases inteiras até 155 caracteres', () => {
    const r = resumo(['Uma frase curta.', 'Outra frase que cabe?', 'x'.repeat(200) + '.']);
    expect(r).toBe('Uma frase curta. Outra frase que cabe?');
  });

  it('se a primeira frase não cabe, corta na palavra, nunca no meio dela', () => {
    const longa = 'palavra '.repeat(40).trim() + '.';
    const r = resumo([longa]);
    expect(r.length).toBeLessThanOrEqual(155);
    expect(r.endsWith('palavra')).toBe(true);
  });

  it('nenhum curso do catálogo sai com description acima do limite ou cortada', () => {
    const cat = JSON.parse(readFileSync(new URL('../../data/courses.json', import.meta.url), 'utf8'));
    for (const c of cat.courses) {
      const d = resumo([c.taglinePt, c.summaryPt]);
      expect(d.length, c.slug).toBeLessThanOrEqual(155);
      expect(d, c.slug).toMatch(/[.?!]$/);
    }
  });
});

describe('llms.txt', () => {
  const paginas = [
    { rota: '/', titulo: 'Capa', descricao: 'O resumo da capa.' },
    { rota: '/cursos/alfabetizacao/', titulo: 'Alfabetização', descricao: 'O curso.' },
    { rota: '/metodo/', titulo: 'O método', descricao: 'Como funciona.' },
    { rota: '/termos/', titulo: 'Termos de Uso', descricao: null }
  ];
  const txt = llmsTxt('https://exemplo.com.br', paginas);

  it('abre com o nome e a description da capa como resumo', () => {
    expect(txt.startsWith('# Hebraico Fluente\n\n> O resumo da capa.\n')).toBe(true);
  });

  it('lista cada página com URL absoluta e a description dela', () => {
    expect(txt).toContain('- [Alfabetização](https://exemplo.com.br/cursos/alfabetizacao/): O curso.');
    expect(txt).toContain('- [O método](https://exemplo.com.br/metodo/): Como funciona.');
    expect(txt).toContain('- [Termos de Uso](https://exemplo.com.br/termos/)\n');
  });

  it('as páginas pagas e as não listadas ficam fora, como no sitemap', () => {
    const { listadas } = classificar(['/', '/licao/alef/', '/entrar/', '/checkout/alfabetizacao/', '/faq/']);
    expect(listadas).toEqual(['/', '/faq/']);
  });

  it('lê título e description do HTML, sem o sufixo da marca e sem entidades', () => {
    const h = '<title>Dúvidas &amp; respostas - Hebraico Fluente</title>' +
      '<meta name="description" content="Pagamento &#x27;e&#x27; acesso"/>';
    expect(cabecalhoDe(h)).toEqual({ titulo: 'Dúvidas & respostas', descricao: "Pagamento 'e' acesso" });
  });
});

describe('palavras-chave e verificação', () => {
  it('as palavras-chave são únicas e em minúscula, menos o nome próprio', () => {
    expect(new Set(PALAVRAS_CHAVE).size).toBe(PALAVRAS_CHAVE.length);
    for (const p of PALAVRAS_CHAVE) expect(p.replace('Bíblia', 'bíblia'), p).toBe(p.toLowerCase());
  });

  it('a verificação, quando preenchida, é só o código, nunca a tag inteira', () => {
    for (const v of [VERIFICACAO.google, VERIFICACAO.bing]) {
      if (v) expect(v).toMatch(/^[\w-]+$/);
    }
  });
});
