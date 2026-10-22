/* O Laboratório de Memórias Familiares (Raízes, módulo 9).
 * O que o aluno anota sobre a família fica no aparelho, sem conta, sem
 * servidor e sem nenhuma conclusão automática. Cada caso abaixo guarda uma
 * dessas promessas. */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  CHAVE_LABORATORIO, EVIDENCIAS, LABORATORIO_VAZIO, LIMITES,
  adicionarPessoa, anotar, exportar, normalizar, removerAnotacao, removerPessoa, resumo
} from '@/lib/raizes-laboratorio';

const ficha = { nome: 'Maria', relacao: 'bisavó', quando: '1890', onde: 'Recife', evidencia: 'oral' as const, fonte: 'Tia Ana', notas: '' };

describe('o laboratório guarda, conta e devolve, sem concluir nada', () => {
  it('normalizar descarta o que não é ficha e corrige a evidência desconhecida', () => {
    const l = normalizar({
      pessoas: [
        { id: 'a', nome: '  Maria  ', evidencia: 'certeza-absoluta' },
        { id: 'b', nome: '' },
        { nome: 'sem id' },
        'lixo',
        { id: 'c', nome: 'José', evidencia: 'documentado' }
      ],
      diario: [{ id: 'd', em: '2026-10-22', texto: 'Fui ao arquivo.' }, { id: 'e', em: 'x', texto: '   ' }]
    });
    expect(l.pessoas.map(p => [p.nome, p.evidencia])).toEqual([['Maria', 'nao-verificado'], ['José', 'documentado']]);
    expect(l.diario).toHaveLength(1);
    expect(normalizar(null)).toEqual(LABORATORIO_VAZIO);
    expect(normalizar('{"pessoas":1}')).toEqual(LABORATORIO_VAZIO);
  });

  it('os campos e as listas têm teto', () => {
    const grande = 'x'.repeat(10_000);
    const l = adicionarPessoa(LABORATORIO_VAZIO, { ...ficha, nome: grande, notas: grande }, 'id');
    expect(l.pessoas[0]!.nome.length).toBe(LIMITES.campo);
    expect(l.pessoas[0]!.notas.length).toBe(LIMITES.texto);
    let cheio = LABORATORIO_VAZIO;
    for (let i = 0; i < LIMITES.pessoas + 5; i++) cheio = adicionarPessoa(cheio, ficha, `p${i}`);
    expect(cheio.pessoas).toHaveLength(LIMITES.pessoas);
  });

  it('adicionar, anotar e remover', () => {
    let l = adicionarPessoa(LABORATORIO_VAZIO, ficha, 'p1');
    l = anotar(l, 'Pedi a certidão.', '2026-10-22T10:00:00Z', 'n1');
    l = anotar(l, 'Chegou.', '2026-10-23T10:00:00Z', 'n2');
    expect(l.diario.map(a => a.id)).toEqual(['n2', 'n1']);
    expect(anotar(l, '   ', '2026-10-24', 'n3')).toBe(l);
    expect(removerAnotacao(removerPessoa(l, 'p1'), 'n1')).toEqual({ pessoas: [], diario: [l.diario[0]] });
  });

  it('o resumo só conta fichas por tipo de evidência: nenhum percentual, nenhuma conclusão', () => {
    let l = adicionarPessoa(LABORATORIO_VAZIO, ficha, 'p1');
    l = adicionarPessoa(l, { ...ficha, evidencia: 'documentado' }, 'p2');
    expect(resumo(l).map(r => [r.id, r.n])).toEqual([['documentado', 1], ['oral', 1], ['hipotese', 0], ['nao-verificado', 0]]);
    expect(EVIDENCIAS.map(e => e.id)).toEqual(['documentado', 'oral', 'hipotese', 'nao-verificado']);
    const fonte = readFileSync('src/lib/raizes-laboratorio.ts', 'utf8') + readFileSync('src/components/raizes/Laboratorio.tsx', 'utf8');
    expect(fonte).not.toMatch(/%\s*de\s|provável|probabilidade|chance de/i);
  });

  it('a cópia baixada leva os dados e o lembrete do que eles não provam', () => {
    const l = adicionarPessoa(LABORATORIO_VAZIO, ficha, 'p1');
    const j = JSON.parse(exportar(l, '2026-10-22T10:00:00Z'));
    expect(j.pessoas[0].nome).toBe('Maria');
    expect(j.aviso).toMatch(/não é comprovar uma ascendência/);
  });

  it('fica só no aparelho: o componente não chama a rede, e o progresso não conhece a chave', () => {
    const comp = readFileSync('src/components/raizes/Laboratorio.tsx', 'utf8');
    expect(comp).not.toMatch(/fetch\(|\/api\/|XMLHttpRequest|sendBeacon/);
    for (const p of ['src/lib/state/raizes-estado.ts', 'src/lib/state/store.tsx', 'src/lib/state/worker.ts']) {
      expect(readFileSync(p, 'utf8'), p).not.toContain(CHAVE_LABORATORIO);
    }
  });
});
