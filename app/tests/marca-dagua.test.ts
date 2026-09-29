/* A marca d'água das aulas (components/shell/MarcaDagua.tsx). */
import { afterAll, describe, expect, it } from 'vitest';
import { hidratarConteudo, numeroDaCopia } from '@/lib/content';
import { conteudoPago } from '@/lib/content-servidor';
import { mascararEmail } from '@/lib/marca-dagua';

describe("a marca d'água", () => {
  afterAll(() => hidratarConteudo(conteudoPago));

  it('esconde a maior parte do e-mail', () => {
    expect(mascararEmail('ana.silva@gmail.com')).toBe('an•••@gmail.com');
    expect(mascararEmail('a@x.com')).toBe('a•••@x.com');
  });

  it('lê o número da cópia que veio com o conteúdo', () => {
    hidratarConteudo({ ...conteudoPago, _licenca: 'Conteúdo… (Termos de Uso, artigo 5). Cópia 636195AE.' });
    expect(numeroDaCopia()).toBe('636195AE');
    hidratarConteudo({ ...conteudoPago, _licenca: 'Conteúdo… Cópia -.' });
    expect(numeroDaCopia()).toBeNull();
  });
});
