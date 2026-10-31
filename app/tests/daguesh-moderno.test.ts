/* O daguesh só onde ele muda o som, e as vogais da direita para a esquerda
 * (12/10/2026, decisões do dono do curso). Ver tools/daguesh.mjs. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
// @ts-expect-error - ferramenta em JS, sem tipos
import { semDagueshInutil, dagueshFora } from '../../tools/daguesh.mjs';

const hash = (he: string) => 'he-' + createHash('sha256').update(he.normalize('NFC')).digest('hex').slice(0, 8);
const fonte = (p: string) => readFileSync(join(__dirname, '..', 'src', p), 'utf8');

describe('a regra', () => {
  it('tira o daguesh que não muda o som', () => {
    expect(semDagueshInutil('אִמָּא')).toBe('אִמָא'.normalize('NFC'));
    expect(semDagueshInutil('תּוֹדָה')).toBe('תוֹדָה'.normalize('NFC'));
    expect(semDagueshInutil('הַיּוֹם')).toBe('הַיוֹם'.normalize('NFC'));
  });

  it('guarda o de בּ, כּ e פּ, o shuruk e a letra de demonstração', () => {
    for (const w of ['שַׁבָּת', 'כֶּלֶב', 'סַפָּר', 'מוּ', 'תּ', 'גּ']) {
      expect(semDagueshInutil(w), w).toBe(w.normalize('NFC'));
    }
    /* O mapik também sai (decisão do dono do curso, 12/10/2026). */
    expect(semDagueshInutil('שֶׁלָּהּ')).toBe('שֶׁלָה'.normalize('NFC'));
    expect(semDagueshInutil('לָהּ')).toBe('לָה'.normalize('NFC'));
  });
});

describe('o conteúdo', () => {
  it('as letras, as sílabas e as palavras do curso já estão sem ele', () => {
    const texto = JSON.stringify(conteudoPago.letters);
    /* Só a letra sozinha de uma explicação pode ter o ponto. */
    expect(dagueshFora(texto)).toEqual([]);
    const mem = conteudoPago.letters.find(l => l.id === 'mem')!;
    expect(mem.wordsToRead.some(w => w.he === 'אִמָא'.normalize('NFC'))).toBe(true);
  });

  it('a gravação de antes continua tocando: o id é o do texto com daguesh', () => {
    const mem = conteudoPago.letters.find(l => l.id === 'mem')!;
    const ima = mem.wordsToRead.find(w => w.he === 'אִמָא'.normalize('NFC'))!;
    expect(ima.audioId).toBe(hash('אִמָּא'));
  });
});

describe('as cinco vogais correm da direita para a esquerda', () => {
  it('nos componentes que mostram a sequência', () => {
    expect(fonte('components/learn/Blocks.tsx')).toMatch(/grid grid-cols-3 sm:grid-cols-5 gap-3" dir="rtl"/);
    expect(fonte('components/learn/CompararPronuncia.tsx')).toMatch(/aria-label=\{tx\.silabas\} dir="rtl"/);
    expect(fonte('i18n/telas/licao-comparar-pronuncia.tsx')).toContain("silabas: 'Sílabas'");
    expect(fonte('components/learn/SoundLab.tsx')).toMatch(/<table[^>]*dir="rtl"/);
    expect(fonte('components/learn/ExercisePlayer.tsx')).toMatch(/dir=\{vogais \? 'rtl' : undefined\}/);
  });

  it('e os dados seguem a, e, i, o, u, com o U em shuruk', () => {
    for (const L of conteudoPago.letters) {
      const v = L.syllables.filter(s => s.vowel !== 'sheva');
      expect(v.map(s => s.vowel).join(''), L.id).toBe('aeiou');
      expect(v.at(-1)!.he.normalize('NFC').endsWith('וּ'.normalize('NFC')), L.id).toBe(true);
      expect(v[3]!.he.normalize('NFC').endsWith('וֹ'.normalize('NFC')), L.id).toBe(true);
    }
  });
});
