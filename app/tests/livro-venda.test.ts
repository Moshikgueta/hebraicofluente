/* A página de venda do livro (23/10/2026, pedido do dono): pronta e desligada.
 *
 * O que este arquivo trava:
 *  - enquanto `aVenda` é false, a página nem é gerada;
 *  - preço, parcelas, meses e capítulos saem do catálogo, nunca do texto;
 *  - quem escreveu: só a lista de lib/autor.ts (o que /sobre afirma), a mesma da capa;
 *  - a ficha comum mostra o preço do PRÓPRIO produto (até hoje, mostrava o do curso);
 *  - a oferta do pacote só aparece com o pacote à venda.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { allProducts, brl, getCourse } from '@/lib/catalog';
import { produtos } from '@/lib/ecossistema';
import { FichaDoProduto } from '@/components/portal/FichaDoProduto';
import { precoDeVitrine } from '@/lib/vitrine';

const fonte = (rel: string) => readFileSync(new URL(rel, import.meta.url), 'utf8');
const codigo = (rel: string) => fonte(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '');
const PAGINA = '../src/app/cursos/[slug]/LivroClient.tsx';
const LIVRO = 'israel-alem-do-roteiro';

describe('a página de venda do livro', () => {
  it('enquanto `aVenda` é false, a página não é gerada', () => {
    const livro = getCourse(LIVRO)!;
    expect(allProducts().some(c => c.slug === LIVRO)).toBe(livro.aVenda !== false);
  });

  it('a rota manda o livro para a página nova e o pacote para a antiga', () => {
    const p = codigo('../src/app/cursos/[slug]/page.tsx');
    expect(p).toMatch(/tipo === 'livro' \? <LivroClient/);
    expect(p).toMatch(/<ProdutoClient/);
  });

  it('nenhum preço, parcela ou prazo escrito à mão: vem do catálogo e da caixa de compra', () => {
    const c = codigo(PAGINA);
    expect(c).not.toMatch(/R\$\s?\d|\b67\b|\b12 meses\b|\b11 capítulos\b/);
    expect(c).toContain('<CaixaDeCompra c={c} />');
    expect(c).toContain('c.accessMonths');
    expect(c).toContain('c.modules.length');
    expect(c).toContain('empresa.politicas.arrependimentoDias');
  });

  it('quem escreveu: só a lista de lib/autor.ts, a mesma da capa', () => {
    expect(codigo(PAGINA)).toContain('FATOS_DO_AUTOR');
    expect(codigo('../src/app/PortalClient.tsx')).toContain('FATOS_DO_AUTOR');
    /* Nada de número de alunos ou anos de experiência contados. */
    expect(codigo(PAGINA)).not.toMatch(/\d+\s*(alunos|anos de experiência)/i);
  });

  it('a prévia é o link de sempre, e a página não fala em PDF', () => {
    const c = codigo(PAGINA);
    expect(c).toContain("'/previa/'");
    expect(c).not.toMatch(/PDF/);
  });

  it('a oferta do pacote só aparece com o pacote à venda', () => {
    expect(codigo('../src/app/cursos/[slug]/ProdutoClient.tsx')).toMatch(/if \(!estaAVenda\(p\)/);
  });
});

describe('a ficha comum mostra o preço do próprio produto', () => {
  it('o livro, no dia em que estiver à venda, aparece com o preço dele, não com o do curso', () => {
    const livro = produtos().find(p => p.id === LIVRO)!;
    const html = renderToStaticMarkup(createElement(FichaDoProduto, { p: { ...livro, status: 'disponivel' } }));
    const c = getCourse(LIVRO)!;
    expect(html).toContain(brl(precoDeVitrine(c)));
    expect(html).toContain(`${c.accessMonths} meses de acesso`);
    if (precoDeVitrine(c) !== precoDeVitrine()) expect(html).not.toContain(brl(precoDeVitrine()));
  });
});
