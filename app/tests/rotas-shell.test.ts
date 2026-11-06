/* Qual casca cada endereço recebe (auditoria de 28/09/2026, QA-001).
 * Um endereço que não existe tem de cair na 404 com a casca pública, e não
 * no portão do curso, que mandava o visitante para a tela de login. */
import { describe, expect, it } from 'vitest';
import { isAppRoute, isPublicRoute } from '@/lib/rotas';
import { PAGAS } from '@/lib/seo';

describe('a casca de cada rota', () => {
  it('toda rota paga é do aluno', () => {
    for (const r of PAGAS) expect(isAppRoute(r), r).toBe(true);
    expect(isAppRoute('/licao/alef/')).toBe(true);
    expect(isAppRoute('/perfil')).toBe(true);
  });

  it('as públicas são públicas', () => {
    for (const r of ['/', '/faq/', '/cursos/alfabetizacao', '/checkout/alfabetizacao', '/entrar', '/termos'])
      expect(isPublicRoute(r), r).toBe(true);
  });

  it('um endereço que não existe recebe a casca pública (e a 404), não o login', () => {
    for (const r of ['/nao-existe-xyz', '/licenca', '/perfilx', '/cursos-antigos/abc'])
      expect(isPublicRoute(r), r).toBe(true);
  });
});
