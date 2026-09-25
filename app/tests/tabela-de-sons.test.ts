/* A tabela de sons (SoundLab) mostra consoante + vogal. Letra sem som
   próprio não tem consoante para somar, e a linha dela só repetia as vogais -
   por isso sai. O He fica: "ha" não é "a". */

import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { temSomProprio } from '@/lib/som-proprio';

const letra = (id: string) => conteudoPago.letters.find(l => l.id === id)!;

describe('a tabela de sons', () => {
  it('tira o Álef e o Áyin, que não têm som próprio', () => {
    expect(temSomProprio(letra('alef'))).toBe(false);
    expect(temSomProprio(letra('ayin'))).toBe(false);
  });

  it('mantém o He e todas as outras letras', () => {
    const ficam = conteudoPago.letters.filter(temSomProprio).map(l => l.id);
    expect(ficam).toContain('he');
    expect(ficam).toHaveLength(conteudoPago.letters.length - 2);
  });
});
