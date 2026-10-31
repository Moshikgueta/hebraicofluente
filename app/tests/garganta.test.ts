/* O desenho "de onde sai o som" e as correções de pronúncia de 25/09/2026.
 *   · TODA letra tem o desenho (pedido do dono do curso, 25/09/2026);
 *   · ר e ח saem do MESMO lugar, e a diferença é a voz - como ד e ת;
 *   · as de duas leituras acendem dois lugares, as mudas nenhum;
 *   · o texto de uma letra não mostra letra que o aluno ainda não viu (o ר
 *     vem antes do ח, então o texto do ר fala dele sem desenhá-lo);
 *   · א, ה, י e ע não levam o cartão do sheva. */

import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { stripNikud } from '@/lib/hebrew';

const L = conteudoPago.letters;
const letra = (id: string) => L.find(l => l.id === id)!;
const base = (g: string) => ({ 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' } as Record<string, string>)[g] ?? g;
const glifos = (t: string) => [...stripNikud(t)].filter(c => /[א-ת]/.test(c)).map(base);

describe('de onde sai o som', () => {
  it('toda letra tem o desenho', () => {
    for (const l of L) {
      expect(l.articulacao, l.id).toBeTruthy();
      expect(l.articulacao.comoPt.length, l.id).toBeGreaterThan(40);
    }
  });

  const ponto = (id: string) => letra(id).articulacao.pontos.map(p => p.ponto);

  it('ר e ח saem da úvula, ד e ת de trás dos dentes; a voz é o que os separa', () => {
    expect(letra('resh').articulacao).toMatchObject({ pontos: [{ ponto: 'uvula' }], voz: true });
    expect(letra('het').articulacao).toMatchObject({ pontos: [{ ponto: 'uvula' }], voz: false });
    expect(letra('he').articulacao).toMatchObject({ pontos: [{ ponto: 'glote' }], voz: false });
    expect(ponto('dalet')).toEqual(ponto('tav'));
    expect(letra('dalet').articulacao.voz).toBe(true);
    expect(letra('tav').articulacao.voz).toBe(false);
    expect(ponto('tet')).toEqual(ponto('tav'));
    expect(ponto('qof')).toEqual(['veu']);
    expect(ponto('gimel')).toEqual(['veu']);
  });

  it('Bet, Kaf e Pe mostram o lugar do som com ponto; o outro fica na lição de som', () => {
    /* Desde 26/09/2026 a lição da letra ensina o B, o K e o P; o V, o raspado
       e o F têm lição própria (Vet, Chaf, Fe), com o desenho deles. */
    expect(ponto('bet')).toEqual(['labios']);
    expect(ponto('kaf')).toEqual(['veu']);
    expect(ponto('pe')).toEqual(['labios']);
    const som = (id: string) => conteudoPago.extras.sons.find(s => s.id === id)!.articulacao.pontos.map(p => p.ponto);
    expect(som('vet')).toEqual(['labio-dentes']);
    expect(som('chaf')).toEqual(['uvula']);
    expect(som('fe')).toEqual(['labio-dentes']);
    /* O Shin continua com as duas leituras na lição dele. */
    expect(ponto('shin')).toEqual(['palato', 'dentes']);
  });

  it('א e ע são mudas, e מ e נ soltam o ar pelo nariz', () => {
    for (const id of ['alef', 'ayin']) expect(letra(id).articulacao).toMatchObject({ pontos: [], voz: null });
    const nasais = L.filter(l => l.articulacao.nariz).map(l => l.id).sort();
    expect(nasais).toEqual(['mem', 'nun']);
  });

  it('os textos novos não mostram letra que ainda não foi ensinada', () => {
    /* Só os escritos em 25/09: o desenho de cada letra e o ר reescrito.
       A prosa antiga do curso cita letras futuras em exemplos, de propósito. */
    const culpados: string[] = [];
    const r = letra('resh');
    const textos: [string, string][] = [
      ...L.map(l => [l.id, l.articulacao.comoPt] as [string, string]),
      ...L.flatMap(l => l.articulacao.pontos.map(p => [l.id, p.rotulo ?? ''] as [string, string])),
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

  it('א, ה, י e ע não têm o cartão do sheva; as outras têm', () => {
    for (const l of L) {
      const temSheva = l.syllables.some(s => s.vowel === 'sheva');
      expect(temSheva, l.id).toBe(!['alef', 'he', 'yod', 'ayin'].includes(l.id));
    }
  });
});
