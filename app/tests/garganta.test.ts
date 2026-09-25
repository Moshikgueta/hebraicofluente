/* O desenho "de onde sai o som" e as correções de pronúncia de 25/09/2026.
 *   · as letras de garganta são ר, ח, o כ suave e ה - e só elas;
 *   · ר e ח saem do MESMO lugar, e a diferença é a voz;
 *   · o texto de uma letra não mostra letra que o aluno ainda não viu (o ר
 *     vem antes do ח, então o texto do ר fala dele sem desenhá-lo);
 *   · א, ה e ע não levam o cartão do sheva. */

import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { stripNikud } from '@/lib/hebrew';

const L = conteudoPago.letters;
const letra = (id: string) => L.find(l => l.id === id)!;
const base = (g: string) => ({ 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' } as Record<string, string>)[g] ?? g;
const glifos = (t: string) => [...stripNikud(t)].filter(c => /[א-ת]/.test(c)).map(base);

describe('de onde sai o som', () => {
  it('só as letras de garganta têm o desenho', () => {
    expect(L.filter(l => l.garganta).map(l => l.id).sort()).toEqual(['he', 'het', 'kaf', 'resh']);
  });

  it('ר e ח saem da úvula; a voz é o que os separa', () => {
    expect(letra('resh').garganta).toMatchObject({ ponto: 'uvula', voz: true });
    expect(letra('het').garganta).toMatchObject({ ponto: 'uvula', voz: false });
    expect(letra('he').garganta).toMatchObject({ ponto: 'glote', voz: false });
  });

  it('os textos novos não mostram letra que ainda não foi ensinada', () => {
    /* Só os escritos em 25/09: o desenho das quatro letras e o ר reescrito.
       A prosa antiga do curso cita letras futuras em exemplos, de propósito. */
    const culpados: string[] = [];
    const r = letra('resh');
    const textos: [string, string][] = [
      ...L.filter(l => l.garganta).map(l => [l.id, l.garganta!.comoPt] as [string, string]),
      ...[r.soundNotePt, r.didYouKnow, r.brazilianMistake.wrong, r.brazilianMistake.right,
        r.brazilianMistake.why, r.ensino.funcaoPt, r.ensino.paraBrasileiroPt ?? '',
        r.ensino.lembrePt ?? ''].map(t => ['resh', t] as [string, string])
    ];
    for (const [id, t] of textos) {
      const ordem = letra(id).order;
      const vistas = new Set(L.filter(x => x.order <= ordem).map(x => x.letter));
      for (const g of glifos(t)) if (!vistas.has(g)) culpados.push(`${id}: ${g}`);
    }
    expect([...new Set(culpados)]).toEqual([]);
  });

  it('o ר é o R francês, e não o R carioca', () => {
    expect(letra('resh').soundNotePt).toMatch(/francês/);
    expect(letra('resh').soundNotePt).not.toMatch(/exatamente o R carioca/);
  });

  it('א, ה e ע não têm o cartão do sheva; as outras têm', () => {
    for (const l of L) {
      const temSheva = l.syllables.some(s => s.vowel === 'sheva');
      expect(temSheva, l.id).toBe(!['alef', 'he', 'ayin'].includes(l.id));
    }
  });
});
