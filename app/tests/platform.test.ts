/* O catálogo e as regras de acesso.
 *
 * Isto é a camada que decide quem entra e quanto se cobra. Os testes aqui não
 * são sobre React: são sobre as duas maneiras conhecidas de perder dinheiro
 * ou perder aluno - um preço que diverge de si mesmo, e um acesso que não
 * expira (ou que expira cedo demais). */

import { describe, expect, it } from 'vitest';
import {
  allCourses, brl, cents, courseHref, flagship, getCourse,
  installment, isPlayable, pixPrice
} from '@/lib/catalog';
import {
  daysLeft, emailLooksValid, entitlementFor, hasAccess, MESSAGES,
  normalizeEmail, passwordOk, type Session
} from '@/lib/account/types';

describe('o catálogo', () => {
  const courses = allCourses();

  it('tem os quatro cursos, na ordem, com slugs únicos', () => {
    expect(courses.map(c => c.slug)).toEqual([
      'alfabetizacao', 'hebraico-a1', 'hebraico-a2', 'hebraico-b1'
    ]);
    expect(courses.map(c => c.n)).toEqual([1, 2, 3, 4]);
    expect(new Set(courses.map(c => c.slug)).size).toBe(courses.length);
  });

  it('vende exatamente um curso hoje, e é o único que abre', () => {
    const playable = courses.filter(isPlayable);
    expect(playable.map(c => c.slug)).toEqual(['alfabetizacao']);
    expect(flagship().slug).toBe('alfabetizacao');
  });

  it('nunca deixa abrir um curso sem conteúdo, mesmo marcado como disponível', () => {
    /* O par (status, engine) é o que decide. Um curso anunciado como pronto
       mas sem motor é um erro de dados, e o efeito tem de ser uma porta
       fechada - não uma tela em branco. */
    for (const c of courses) {
      if (c.engine === null) expect(isPlayable(c)).toBe(false);
    }
    expect(isPlayable({ ...flagship(), engine: null })).toBe(false);
    expect(isPlayable({ ...flagship(), status: 'soon' })).toBe(false);
  });

  it('manda o curso que ainda não abriu para a própria página de venda', () => {
    expect(courseHref(getCourse('hebraico-a1')!)).toBe('/cursos/hebraico-a1');
    expect(courseHref(flagship())).toBe('/meu-hebraico');
  });

  it('descreve cada curso o suficiente para alguém decidir comprar', () => {
    for (const c of courses) {
      expect(c.titlePt.length, c.slug).toBeGreaterThan(3);
      expect(c.summaryPt.length, c.slug).toBeGreaterThan(40);
      expect(c.outcomesPt.length, c.slug).toBeGreaterThanOrEqual(4);
      expect(c.modules.length, c.slug).toBeGreaterThanOrEqual(5);
      expect(c.price.brl, c.slug).toBeGreaterThan(0);
      expect(c.accessMonths, c.slug).toBeGreaterThanOrEqual(12);
    }
  });

  it('descreve a alfabetização com os módulos do curso de verdade', () => {
    /* A página de vendas não pode prometer módulos diferentes dos que o curso
       tem. Os dois saem do mesmo course.json, e é isto que garante. */
    const c = flagship();
    expect(c.stats.modules).toBe(c.modules.length);
    expect(c.stats.lessons).toBe(22);
    expect(c.modules.reduce((n, m) => n + (m.letters ?? 0), 0)).toBe(22);
  });
});

describe('dinheiro', () => {
  it('converte para centavos sem erro de ponto flutuante', () => {
    expect(cents(147)).toBe(14_700);
    expect(cents(132.3)).toBe(13_230);
    /* 0.1 + 0.2 em binário. É este o caso que faz um centavo sumir. */
    expect(cents(19.99)).toBe(1999);
  });

  it('formata em reais como um brasileiro lê', () => {
    expect(brl(147).replace(/ /g, ' ')).toBe('R$ 147');
    expect(brl(12.25).replace(/ /g, ' ')).toBe('R$ 12,25');
  });

  it('nunca anuncia uma parcela menor do que a cobrada', () => {
    for (const c of allCourses()) {
      const { n, brl: parcela } = installment(c.price);
      expect(parcela * n, c.slug).toBeGreaterThanOrEqual(c.price.brl);
      /* E nem tão maior a ponto de virar juros disfarçado: no máximo um
         centavo por parcela de arredondamento. */
      expect(parcela * n, c.slug).toBeLessThan(c.price.brl + n * 0.01 + 0.001);
    }
  });

  it('aplica o desconto do PIX, e não inventa um quando não há', () => {
    expect(pixPrice({ brl: 147, listBrl: null, installments: 12, pixDiscountPct: 10 }))
      .toBe(132.3);
    expect(pixPrice({ brl: 147, listBrl: null, installments: 12, pixDiscountPct: 0 }))
      .toBe(147);
  });
});

describe('quem entra', () => {
  const session = (expiresAt: string | null): Session => ({
    account: { id: 'a1', name: 'Ana', email: 'ana@exemplo.br', createdAt: '2026-01-01T00:00:00.000Z' },
    entitlements: [{
      courseSlug: 'alfabetizacao', grantedAt: '2026-01-01T00:00:00.000Z',
      expiresAt, orderId: 'o1'
    }]
  });

  it('não deixa entrar quem não entrou', () => {
    expect(hasAccess(null, 'alfabetizacao')).toBe(false);
    expect(entitlementFor(null, 'alfabetizacao')).toBeNull();
  });

  it('não deixa entrar num curso que a conta não comprou', () => {
    expect(hasAccess(session(null), 'hebraico-a1')).toBe(false);
  });

  it('deixa entrar dentro do prazo e fecha a porta depois dele', () => {
    const s = session('2027-01-01T00:00:00.000Z');
    expect(hasAccess(s, 'alfabetizacao', new Date('2026-12-31T23:59:00Z'))).toBe(true);
    expect(hasAccess(s, 'alfabetizacao', new Date('2027-01-01T00:00:01Z'))).toBe(false);
  });

  it('trata o vencimento exato como vencido', () => {
    /* Um acesso "até 1º de janeiro" que ainda abre em 1º de janeiro às 00:00
       é um acesso de 12 meses e um instante. A borda tem de ser uma só. */
    const s = session('2027-01-01T00:00:00.000Z');
    expect(hasAccess(s, 'alfabetizacao', new Date('2027-01-01T00:00:00Z'))).toBe(false);
  });

  it('conta os dias que faltam, para avisar antes de fechar', () => {
    const s = session('2027-01-01T00:00:00.000Z');
    expect(daysLeft(s, 'alfabetizacao', new Date('2026-12-25T00:00:00Z'))).toBe(7);
    expect(daysLeft(s, 'alfabetizacao', new Date('2027-06-01T00:00:00Z'))).toBeNull();
    expect(daysLeft(session(null), 'alfabetizacao')).toBeNull();
  });
});

describe('entrada do aluno', () => {
  it('normaliza o e-mail antes de qualquer comparação', () => {
    /* "Ana@Exemplo.BR " e "ana@exemplo.br" são a mesma pessoa, e uma conta
       duplicada por causa de maiúscula é um suporte que ninguém resolve. */
    expect(normalizeEmail('  Ana@Exemplo.BR ')).toBe('ana@exemplo.br');
  });

  it('aceita e-mail de verdade e recusa o que claramente não é', () => {
    for (const ok of ['a@b.co', 'ana.maria+curso@gmail.com', 'moshik@hebraicofluente.com.br']) {
      expect(emailLooksValid(ok), ok).toBe(true);
    }
    for (const bad of ['', 'ana', 'ana@', '@exemplo.br', 'ana exemplo@br.com']) {
      expect(emailLooksValid(bad), JSON.stringify(bad)).toBe(false);
    }
  });

  it('exige oito caracteres e nada além disso', () => {
    expect(passwordOk('1234567')).toBe(false);
    expect(passwordOk('cavalo correto')).toBe(true);
  });

  it('nunca diz ao visitante se o e-mail existe', () => {
    /* A mensagem de credencial errada é a mesma nos dois casos. Uma mensagem
       diferente para "esse e-mail não tem conta" entrega a lista de clientes
       para qualquer um com um formulário e paciência. */
    expect(MESSAGES['bad-credentials']).not.toMatch(/não existe|não encontrad|sem conta/i);
  });

  it('tem uma frase em português para todo código de erro', () => {
    for (const [code, msg] of Object.entries(MESSAGES)) {
      expect(msg.length, code).toBeGreaterThan(10);
      expect(msg, code).not.toMatch(/error|failed|invalid/i);
    }
  });
});
