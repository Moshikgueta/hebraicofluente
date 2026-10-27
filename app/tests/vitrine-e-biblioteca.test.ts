/* A vitrine de compra e a Minha Biblioteca (23/10/2026, decisão do dono).
 *
 * O que este arquivo trava:
 *  - dois produtos e um combo só, com o combo em destaque e a economia calculada;
 *  - nada de escassez: sem data, sem contador, sem preço riscado na vitrine;
 *  - produto fora de venda sem preço nem botão de compra;
 *  - a Minha Biblioteca: pública (pede o login ela mesma), fora do portão e da
 *    busca, lista só direitos de verdade, e o combo leva a ela depois de pago.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { getCourse } from '@/lib/catalog';
import { anunciavel } from '@/lib/seo';
import { isPublicRoute } from '@/lib/rotas';
import { COMBO, CURSO, LIVRO, economiaDoCombo, nomeNaVitrine } from '@/components/portal/OpcoesDeCompra';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { isGatedPath } from '../../worker/src/gate.js';

const fonte = (rel: string) => readFileSync(new URL(rel, import.meta.url), 'utf8');
const codigo = (rel: string) => fonte(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '');
const VITRINE = '../src/components/portal/OpcoesDeCompra.tsx';
const BIBLIOTECA = '../src/app/minha-biblioteca/BibliotecaClient.tsx';

describe('a vitrine: dois produtos e um combo', () => {
  it('as três opções padrão são o curso, o livro e o combo, e o combo é o único pacote', () => {
    expect([CURSO, LIVRO, COMBO]).toEqual(['alfabetizacao', 'israel-alem-do-roteiro', 'alfabetizacao-e-israel']);
    expect(codigo(VITRINE)).toMatch(/slugs = \[CURSO, LIVRO, COMBO\]/);
  });

  it('o nome do livro na vitrine leva o subtítulo novo', () => {
    expect(nomeNaVitrine(getCourse(LIVRO)!)).toBe('Israel Além do Óbvio: O Olhar de um Israelense');
    expect(nomeNaVitrine(getCourse(COMBO)!)).toBe('Descubra Israel + Aprenda Hebraico');
  });

  it('a economia do combo é calculada, e só existe com o combo à venda', () => {
    const combo = getCourse(COMBO)!;
    const antes = combo.aVenda;
    try {
      combo.aVenda = true;
      expect(economiaDoCombo()).toEqual({ separados: 344, combo: 297, economia: 47 });
      combo.aVenda = false;
      expect(economiaDoCombo()).toBeNull();
    } finally { combo.aVenda = antes; }
  });

  it('sem escassez: nenhuma data, contador ou preço riscado; fora de venda sem preço nem compra', () => {
    const c = codigo(VITRINE);
    expect(c).not.toMatch(/line-through|<del|<s>|\bs\b>|até \d|\d{2}\/\d{2}|restam|últimas|vagas|tempo limitado/i);
    expect(c).toMatch(/!aVenda \? \(/);
    /* O preço oficial é dito com palavras, nunca como um "de". */
    expect(c).toContain('Preço de pré-lançamento. Depois, {brl(oficial)}.');
    expect(c).not.toMatch(/\bDe R\$|\bde \{brl/);
  });

  it('quem já tem uma parte do combo não recebe a oferta dele', () => {
    expect(codigo(VITRINE)).toMatch(/temParte \? \(/);
  });

  /* 27/10/2026: o site é só o curso de alfabetização; a vitrine com o livro e
     o combo saiu de /cursos e volta quando o livro abrir. */
  it('/cursos não mostra a vitrine do livro e do combo', () => {
    expect(codigo('../src/app/cursos/CursosClient.tsx')).not.toContain('<OpcoesDeCompra />');
  });
});

describe('a Minha Biblioteca', () => {
  it('é pública, fora do portão e da busca: pede o login ela mesma', () => {
    expect(isPublicRoute('/minha-biblioteca/')).toBe(true);
    expect(isGatedPath('/minha-biblioteca/')).toBe(false);
    expect(anunciavel('/minha-biblioteca/')).toBe(false);
    expect(codigo(BIBLIOTECA)).toContain("/entrar?next=${encodeURIComponent('/minha-biblioteca')}");
  });

  it('lista só direitos válidos, e cada produto abre pelo portão', () => {
    const c = codigo(BIBLIOTECA);
    expect(c).toContain('entitlementFor(account.session, i.slug)');
    expect(c).toContain("abre: '/israel/'");
    expect(c).toContain("abre: '/raizes/'");
    /* O combo não é direito: libera as partes, que aparecem cada uma. */
    expect(c).not.toContain(COMBO);
  });

  it('o combo pago leva à biblioteca, e o perfil e o cabeçalho também', () => {
    expect(getCourse(COMBO)!.abre).toBe('/minha-biblioteca/');
    expect(codigo('../src/app/perfil/PerfilClient.tsx')).toContain('href="/minha-biblioteca"');
    expect(codigo('../src/components/shell/PublicShell.tsx')).toContain('href="/minha-biblioteca"');
  });
});

/* 27/10/2026: uma aluna entrou, viu a biblioteca vazia e escreveu "não
 * consegui...". A tela vazia passou a dizer a conta e o caminho. */
describe('a Minha Biblioteca vazia diz o que fazer', () => {
  const c = () => codigo(BIBLIOTECA);
  it('diz em qual conta a pessoa está', () => {
    expect(c()).toContain('Você está conectado como');
  });
  it('lê as compras: pagamento pendente, acesso vencido e pago sem acesso', () => {
    expect(c()).toContain('.compras()');
    expect(c()).toContain("o.status === 'pending'");
    expect(c()).toContain('compras?.vencidos');
    expect(c()).toContain("o.status === 'paid'");
    expect(c()).toContain('/obrigado?order=');
  });
  it('sem compra nenhuma, o botão do curso; e sempre o outro e-mail e o atendimento', () => {
    expect(c()).toContain('paginaDeVenda(FLAGSHIP)');
    expect(c()).toContain('Entrar com outro e-mail');
    expect(c()).toContain('Não pague de novo.');
    expect(c()).toContain('whatsappUrl()');
  });
});

describe('o topo para quem entrou sem o curso', () => {
  it('mostra a conta e o botão de começar o curso', () => {
    const shell = codigo('../src/components/shell/PublicShell.tsx');
    expect(shell).toContain('Minha conta');
    expect(shell).toContain('href={`/checkout/${FLAGSHIP}`}');
    expect(shell).not.toContain('MenuExperiencias');
  });
});
