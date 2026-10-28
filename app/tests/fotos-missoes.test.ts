/* As fotos de verdade das missões (28/10/2026): só do Wikimedia Commons, com
   crédito completo, e só as aprovadas pelo dono chegam ao aluno. */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const raiz = join(__dirname, '..', '..');
const dado = JSON.parse(readFileSync(join(raiz, 'data/fotos-missoes.json'), 'utf8')) as { fotos: Record<string, unknown>[] };
const missoes = JSON.parse(readFileSync(join(raiz, 'data/missoes.json'), 'utf8')).missoes as { modulo: number }[];
const exportadas = JSON.parse(readFileSync(join(__dirname, '..', 'content/missoes.json'), 'utf8')).missoes as { modulo: number; foto?: { id: string } }[];
const LICENCAS = ['Public domain', 'CC0', 'CC BY 2.0', 'CC BY 2.5', 'CC BY 3.0', 'CC BY 4.0', 'CC BY-SA 2.0', 'CC BY-SA 2.5', 'CC BY-SA 3.0', 'CC BY-SA 4.0'];

describe('as fotos das missões', () => {
  it('toda foto tem crédito completo, licença aceita e página do Commons', () => {
    const ids = new Set<string>();
    for (const f of dado.fotos) {
      for (const campo of ['id', 'missao', 'arquivo', 'pagina', 'autor', 'licenca', 'mostraPt', 'largura', 'altura']) {
        expect(f[campo], `${f.id}: ${campo}`).toBeTruthy();
      }
      expect(typeof f.aprovada, `${f.id}: aprovada`).toBe('boolean');
      expect(LICENCAS, `${f.id}`).toContain(f.licenca);
      expect(String(f.pagina)).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(missoes.some(m => m.modulo === f.missao), `${f.id}: missão ${f.missao}`).toBe(true);
      expect(ids.has(String(f.id)), `${f.id} repetido`).toBe(false);
      ids.add(String(f.id));
    }
  });

  it('a foto aprovada tem o arquivo no site', () => {
    for (const f of dado.fotos.filter(f => f.aprovada === true)) {
      expect(existsSync(join(__dirname, '..', 'public/media/missoes', String(f.arquivo))), String(f.arquivo)).toBe(true);
    }
  });

  it('só a aprovada chega ao aluno, e sem o campo da aprovação', () => {
    const aprovadas = new Set(dado.fotos.filter(f => f.aprovada === true).map(f => String(f.id)));
    for (const m of exportadas) {
      if (m.foto) {
        expect(aprovadas.has(m.foto.id), `missão ${m.modulo}`).toBe(true);
        expect('aprovada' in m.foto).toBe(false);
      }
    }
    for (const id of aprovadas) {
      const f = dado.fotos.find(x => x.id === id)!;
      expect(exportadas.find(m => m.modulo === f.missao)?.foto, `missão ${f.missao}`).toBeDefined();
    }
  });
});
