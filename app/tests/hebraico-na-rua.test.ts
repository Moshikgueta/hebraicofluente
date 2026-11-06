/* O Hebraico na rua (28/10/2026): fotos com crédito, palavras do curso com a
   grafia do curso, a placa só para quem já lê a palavra, e nenhuma opção
   errada que também esteja na placa. */
import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { conteudoPago } from '@/lib/content-servidor';
import { clean } from '@/lib/hebrew';
import { vocabularioDoCurso } from '@/lib/engine/palavras';
import { opcoesDaPlaca, placasParaLer, type PlacaDaRua } from '@/lib/engine/rua';

const dados = JSON.parse(readFileSync('../data/hebraico-na-rua.json', 'utf8')) as { placas: (PlacaDaRua & { aprovada: boolean })[] };
const letras = conteudoPago.letters;
const vocab = vocabularioDoCurso(letras);
const doCurso = (he: string) => vocab.find(w => clean(w.he) === clean(he));
const LICENCAS = ['Public domain', 'CC0', 'CC BY 2.0', 'CC BY 2.5', 'CC BY 3.0', 'CC BY 4.0', 'CC BY-SA 2.0', 'CC BY-SA 2.5', 'CC BY-SA 3.0', 'CC BY-SA 4.0'];

describe('o Hebraico na rua', () => {
  it('toda placa cita palavras do curso, com a grafia do curso, e lista a própria palavra', () => {
    expect(dados.placas.length).toBeGreaterThan(0);
    for (const p of dados.placas) {
      expect(doCurso(p.palavra)?.he, p.id).toBe(p.palavra);
      expect(p.naPlaca.map(clean), p.id).toContain(clean(p.palavra));
      for (const w of p.naPlaca) expect(doCurso(w)?.he, `${p.id}: ${w}`).toBe(w);
      expect(/[֐-׿]/.test(p.mostraPt), `${p.id}: legenda sem hebraico`).toBe(false);
    }
  });

  it('toda foto tem crédito, licença livre e página do Commons; a aprovada tem o arquivo', () => {
    for (const p of dados.placas) {
      for (const c of ['autor', 'licenca', 'pagina', 'mostraPt', 'largura', 'altura'] as const) expect(p[c], `${p.id}: ${c}`).toBeTruthy();
      expect(LICENCAS, p.id).toContain(p.licenca);
      expect(p.pagina, p.id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      if (p.aprovada) expect(existsSync(`public/media/rua/${p.arquivo}`), p.id).toBe(true);
    }
  });

  it('só as aprovadas chegam ao conteúdo pago', () => {
    const aprovadas = dados.placas.filter(p => p.aprovada).map(p => p.id).sort();
    expect(conteudoPago.rua.map(p => p.id).sort()).toEqual(aprovadas);
  });

  it('a placa espera a palavra se ler, e as opções erradas não estão na placa', () => {
    const placas = dados.placas as PlacaDaRua[];
    expect(placasParaLer(placas, []).prontas).toHaveLength(0);
    const { prontas, faltam } = placasParaLer(placas, letras);
    expect(prontas).toHaveLength(placas.length);
    expect(faltam).toBe(0);
    for (const p of placas) {
      const o = opcoesDaPlaca(p, letras, letras);
      expect(o, p.id).toHaveLength(3);
      expect(o.filter(w => clean(w.he) === clean(p.palavra)), p.id).toHaveLength(1);
      const fora = new Set(p.naPlaca.map(clean));
      expect(o.filter(w => fora.has(clean(w.he))), p.id).toHaveLength(1);
      expect(new Set(o.map(w => w.pt)).size, p.id).toBe(3);
    }
  });
});
