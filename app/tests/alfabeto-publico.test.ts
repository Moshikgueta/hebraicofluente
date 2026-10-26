/* As páginas do alfabeto para a busca (23/10/2026, marketing/seo/paginas-do-alfabeto.md, opção B).
 * O que estes testes travam:
 *  - cada campo de lib/alfabeto-publico.ts é cópia fiel de data/letters.json
 *    (a palavra de exemplo é do curso, o erro é o do curso, as parecidas também);
 *  - o "porquê" do erro (brazilianMistake.why), que pacote.mjs amostra como
 *    conteúdo pago, NÃO vai para a página;
 *  - toda gravação usada é pública (AMOSTRA_AUDIO), igual dos dois lados.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { LETRAS_PUBLICAS, partes } from '@/lib/alfabeto-publico';
import { AMOSTRA_AUDIO } from '@/lib/amostra-audio';
import { migalhas } from '@/lib/jsonld';

const letras = JSON.parse(readFileSync(new URL('../../data/letters.json', import.meta.url), 'utf8')) as Record<string, any>[];
const porId = new Map<string, Record<string, any>>(letras.map(l => [l.id, l]));
const todasAsPalavras = letras.flatMap(l => [...(l.wordsToRead ?? []), ...(l.wordsToRecognize ?? [])]) as { he: string; translit: string; pt: string }[];

describe('as letras das páginas públicas', () => {
  it('são cópias fiéis do curso', () => {
    for (const p of LETRAS_PUBLICAS) {
      const l = porId.get(p.id)!;
      expect(l, p.id).toBeTruthy();
      expect(p.erro.errado, p.id).toBe(l.brazilianMistake.wrong);
      expect(p.erro.certo, p.id).toBe(l.brazilianMistake.right);
      expect(p.parecidas, p.id).toEqual(l.confusableWith ?? []);
      const w = p.exemplo;
      expect(todasAsPalavras.some(x => x.he === w.he && x.translit === w.translit && x.pt === w.pt), `${p.id}: ${w.he}`).toBe(true);
      expect(w.he.includes(l.letter) || (l.finalForm && w.he.includes(l.finalForm)), `${p.id}: a palavra tem a letra`).toBeTruthy();
    }
  });

  it('não levam o porquê do erro, que é conteúdo pago', () => {
    const tudo = JSON.stringify(LETRAS_PUBLICAS);
    for (const p of LETRAS_PUBLICAS) {
      const why = String(porId.get(p.id)!.brazilianMistake.why).replace(/\{\{[^}]*\}\}/g, ' ');
      const pedaco = why.split(/\s{2,}/).sort((a, b) => b.length - a.length)[0]!.slice(0, 40);
      expect(tudo.includes(pedaco), p.id).toBe(false);
    }
  });

  it('usam só gravações públicas, com o hebraico certo', () => {
    const amostras = AMOSTRA_AUDIO as Record<string, string>;
    for (const p of LETRAS_PUBLICAS) {
      expect(amostras[p.audioNome], `${p.id}: nome`).toBe(porId.get(p.id)!.nameHe);
      expect(amostras[p.exemplo.audio], `${p.id}: exemplo`).toBe(p.exemplo.he);
    }
    const exportador = readFileSync(new URL('../../tools/export-content.mjs', import.meta.url), 'utf8');
    for (const [nome, he] of Object.entries(amostras)) {
      expect(exportador.includes(`${nome}: '${he}'`) || exportador.includes(`'${nome}': '${he}'`), nome).toBe(true);
    }
  });

  it('as marcas {{ }} viram partes em hebraico', () => {
    expect(partes('Ler {{שֶׁל}} como "shel".')).toEqual([
      { he: false, t: 'Ler ' }, { he: true, t: 'שֶׁל' }, { he: false, t: ' como "shel".' }
    ]);
  });

  it('as migalhas em JSON-LD começam na capa e terminam na página', () => {
    const m = migalhas([{ nome: 'Alfabeto hebraico', rota: '/alfabeto-hebraico' }, { nome: 'Tav', rota: '/alfabeto-hebraico/tav' }]) as
      { itemListElement: { position: number; name: string; item: string }[] };
    expect(m.itemListElement.map(i => [i.position, i.name, i.item])).toEqual([
      [1, 'Início', 'https://hebraicofluente.com.br/'],
      [2, 'Alfabeto hebraico', 'https://hebraicofluente.com.br/alfabeto-hebraico/'],
      [3, 'Tav', 'https://hebraicofluente.com.br/alfabeto-hebraico/tav/']
    ]);
  });
});
