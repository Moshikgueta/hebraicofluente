/* O roteiro das gravações do professor em inglês (tools/gravacoes-professor-en.mjs)
 * acompanha o do português: toda gravação tem o seu, com o mesmo id, e o
 * GRAVACOES-EM-INGLES.md commitado é o que o gerador escreve hoje. */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
// @ts-expect-error - módulo JS, sem tipos
import { gravacoesEmIngles } from '../../tools/gravacoes-professor-en.mjs';
// @ts-expect-error - idem
import { gravacoesDoProfessor } from '../../tools/gravacoes-professor.mjs';

const RAIZ = new URL('../..', import.meta.url).pathname;

describe('as gravações do professor em inglês', () => {
  it('uma para cada gravação em português, com o mesmo id, sem marca crua nem acento', () => {
    const pt = gravacoesDoProfessor(RAIZ) as { id: string }[];
    const en = gravacoesEmIngles() as { id: string; roteiro: string; titulo: string }[];
    expect(en.map(g => g.id)).toEqual(pt.map(g => g.id));
    for (const g of en) {
      expect(g.roteiro, g.id).not.toMatch(/\{\{|undefined/);
      expect(g.titulo + g.roteiro, g.id).not.toMatch(/[áéíóúâêôãõç]/);
    }
  });

  it('o arquivo commitado está em dia com o gerador', () => {
    const gerado = execFileSync('node', ['tools/gravacoes-professor-en.mjs'], { cwd: RAIZ, encoding: 'utf8' });
    expect(readFileSync(`${RAIZ}GRAVACOES-EM-INGLES.md`, 'utf8')).toBe(gerado);
  });
});
